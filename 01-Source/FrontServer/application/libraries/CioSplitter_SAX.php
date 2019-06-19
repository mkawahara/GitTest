<?php

/**
 * CIO 形式のファイルを読み取り、<paragraph> 要素と
 * <paragraph_list> 要素を除去した文書要素に分解するためのクラスです。
 *
 * 【実装メモ】2016年6月23日
 * この SAX による実装は、PHP のバージョン (libxml のバージョン) によって
 * 動作が異なるという不具合があったため、再実装しました (CioSplitter.php)。
 * このソース ファイルは使用していませんが、念のため残しておきます。
 */
class CioSplitter {

	private $event_list;

	private $file_handle;

	private $event_index;

	// 直前のノードの末尾インデックス
	private $prev_part_index;

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		$this->file_handle = NULL;
	}

	/**
	 * 開いたファイルを閉じます。
	 */
	public function close() {
		if ($this->file_handle != NULL) {
			@fclose($this->file_handle);
			$this->file_handle = NULL;
		}
	}

	/**
	 * CIO 形式のファイルを開きます。
	 * 失敗すると FALSE を返します。
	 */
	public function open($filename) {

		// すでに開いているファイルがあれば、閉じます。
		$this->close();

		// CIO 形式ファイルを解析し、イベント リストを作成します。
		$ok = $this->create_event_list($filename);
		if (! $ok) return FALSE;

		//var_dump($this->event_list);

		// ファイルを再度開きます。
		$this->file_handle = fopen($filename, 'rb');

		// イベント インデックスを初期化します。
		$this->event_index = 0;

		return ($this->file_handle != NULL);
	}

	private function create_event_list($filename) {

		// CIO 形式ファイルを開きます。
		$fp = fopen($filename, 'rb');
		if (! $fp) return FALSE;

		// パーサーを作成します。
		$parser = xml_parser_create('utf-8');
		xml_parser_set_option( $parser, XML_OPTION_CASE_FOLDING, 0);	// タグ名を大文字に変換しない。
		xml_set_object($parser, $this);
		xml_set_element_handler($parser, 'cio_element_start', 'cio_element_end');
		xml_set_default_handler ($parser, 'cio_default_part');
		//xml_set_external_entity_ref_handler($parser, 'cio_entity_ref');
		//xml_set_character_data_handler($parser, 'cio_character');

		// フィールドを初期化します。
		$this->event_list = array();
		$this->prev_part_index = 0;

		// ファイルを読み取り、解析を行います。
		$parse_success = TRUE;
		while ($data = fread($fp, 1024*1024)) {

			// エンティティ参照を無効化するために、'&' を '_' に変換します。
			// UTF-8 を前提としているため、バイナリ置換でも問題はありません (たぶん)。
			$data = str_replace('&', '_', $data);

			if (! xml_parse($parser, $data, feof($fp))) {
				$parse_success = FALSE;
				break;
			}
		}

		// パーサを破棄します。
		xml_parser_free($parser);

		// ファイルを閉じます。
		fclose($fp);

		return $parse_success;
	}

	const PARAGRAPH_LIST = 'paragraph_list';
	const PARAGRAPH = 'paragraph';

	const EVENT_PARAGRAPH_LIST_START	= 1;
	const EVENT_PARAGRAPH_LIST_END 		= 2;
	const EVENT_PARAGRAPH_START 		= 3;
	const EVENT_PARAGRAPH_END 			= 4;

	private function cio_element_start($parser, $name, $attrs) {
		//echo "start $name\n";

		if ($name === self::PARAGRAPH_LIST) {
			$event = array(
				'type'	=> self::EVENT_PARAGRAPH_LIST_START,
				'index'	=> $this->prev_part_index,
			);
			$this->event_list[] = $event;
		}
		else if ($name === self::PARAGRAPH) {
			$event = array(
				'type'	=> self::EVENT_PARAGRAPH_START,
				'index'	=> $this->prev_part_index,
				'id'	=> isset($attrs['id']) ? $attrs['id'] : 0,
			);

			// 【実装メモ】なぜか <paragraph_list> 直後の <paragraph> だけインデックスが
			// 1 つだけずれるので、ここで補正します。原因は不明です。
			if ($this->event_list[ count($this->event_list) - 1 ]['type'] == self::EVENT_PARAGRAPH_LIST_START) {
				$event['index'] += 1;
			}

			$this->event_list[] = $event;
		}

		// 直前の解析断片のインデックスを記録しておきます。
		$this->prev_part_index = xml_get_current_byte_index($parser);

		return TRUE;
	}

	private function cio_element_end($parser, $name) {
		//echo "end $name\n";

		$byte_index = xml_get_current_byte_index($parser);

		if ($name === self::PARAGRAPH_LIST) {
			$event = array(
				'type'	=> self::EVENT_PARAGRAPH_LIST_END,
				'index'	=> $byte_index,
			);
			$this->event_list[] = $event;
		}
		else if ($name === self::PARAGRAPH) {
			$event = array(
				'type'	=> self::EVENT_PARAGRAPH_END,
				'index'	=> $byte_index,
			);
			$this->event_list[] = $event;
		}

		// 直前の解析断片のインデックスを記録しておきます。
		$this->prev_part_index = $byte_index;

		return TRUE;
	}

	private function cio_default_part($parser, $data) {
		//echo "default --- $data\n";

		// 直前の解析断片のインデックスを記録しておきます。
		$this->prev_part_index = xml_get_current_byte_index($parser);

		return TRUE;
	}

	private function cio_entity_ref($parser, $open_entity_names, $base, $system_id, $public_id) {
		//echo "ENTITY --- cio_entity_ref $open_entity_names\n";
 		return TRUE;
	}

	private function cio_character($parser, $data) {
		//echo "CHAR --- $data\n";
 		return TRUE;
	}

	/**
	 * 文書全体のテキストを取得します。
	 * ただし <paragraph_list> 要素は削除されます。
	 */
	public function get_document() {

		// イベント インデックスを 0 にリセットします。
		$this->event_index = 0;

		// 文書テキストを初期化します。
		$doc_text = '';

		// ファイル位置を初期化します。
		$index1 = 0;		// <paragraph_list> の開始位置
		$index2 = 0;		// </paragraph_list> の終了位置 + 1

		// <paragraph_list> 要素を削除した文書テキストを作成します。
		while (1) {

			// <paragraph_list> 要素の開始タグを見つけます。
			$index2 = $this->next_event_index(self::EVENT_PARAGRAPH_LIST_START);
			if ($index2 < 0) {
				fseek($this->file_handle, 0, SEEK_END);
				$index2 = ftell($this->file_handle);
			}

			// ファイル位置を移動して、読み取ります。
			fseek($this->file_handle, $index1, SEEK_SET);
			$doc_text .= fread($this->file_handle, $index2 - $index1 + 1);

			// 次に進みます。
			$index1 = $this->next_event_index(self::EVENT_PARAGRAPH_LIST_END);
			if ($index1 < 0) break;
			$index1++;
		}

		return $doc_text;
	}

	/**
	 * 指定されたタイプのイベントを探して、
	 * そのインデックスを返します。
	 */
	private function next_event_index($type) {
		while ( $this->event_index < count($this->event_list) ) {
			$event = $this->event_list[ $this->event_index++ ];
			if ($event['type'] === $type) {
				return $event['index'];
			}
		}
		return -1;
	}

	/**
	 * 段落要素テキストの取得を開始します。
	 * このメソッドを呼び出した後で、next_paragraph メソッドを繰り返し
	 * 呼び出してください。
	 */
	public function begin_paragraph() {

		// イベント インデックスを 0 にリセットします。
		$this->event_index = 0;
	}

	/**
	 * 次の段落要素テキストを取得します。
	 * 存在しない場合は FALSE を返します。
	 * FALSE を返した場合は getDocument メソッドによって
	 * 段落要素を削除した文書要素テキストを取得できます。
	 *
	 * @return		段落要素のテキスト (これ以上ないときは FALSE)
	 * @return		段落 ID
	 */
	public function next_paragraph() {

		// ファイルが開かれていなければ、FALSE を返します。
		if ($this->file_handle == 0) return FALSE;

		// 次の EVENT_PARAGRAPH_START を探し、段落タグの開始位置を取得します。
		$index1 = $this->next_event_index(self::EVENT_PARAGRAPH_START);
		if ($index1 < 0) return array(FALSE, 0);

		// 段落開始タグに付随する段落 ID を取得します。
		$p_id = $this->event_list[ $this->event_index - 1 ]['id'];

		// 次の EVENT_PARAGRAPH_END を探し、段落タグの終了位置を取得します。
		$index2 = $this->next_event_index(self::EVENT_PARAGRAPH_END);
		if ($index2 < 0) return array(FALSE, 0);

		// ファイル位置を移動して、読み取ります。
		fseek($this->file_handle, $index1, SEEK_SET);
		$p_text = fread($this->file_handle, $index2 - $index1);

		return array($p_text, $p_id);
	}

}

/**
 * CioSplitter クラスの目視テスト コードです。
 */
function test_CioSplitter($filename) {

	// CIO 形式のファイルを開きます。
	$splitter = new CioSplitter();
	$ok = $splitter->open($filename);
	if (! $ok) {
		echo 'Failed to open file.';
		return -1;
	}

	// 文書テキストを出力します。
	$doc_text = $splitter->get_document();
	echo $doc_text;

	// 段落テキストを出力します。
	$splitter->begin_paragraph();
	while (1) {
		list($p_text, $p_id) = $splitter->next_paragraph();
		if ($p_text === FALSE) break;
		echo "\n[$p_id] --------------------------------------------------------------\n";
		echo $p_text;
	}

	// CIO 形式のファイルを閉じます。
	$splitter->close();
}

test_CioSplitter($argv[1]);

