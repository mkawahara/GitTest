<?php

require('FileContentSearcher.php');

/**
 * CIO 形式のファイルを読み取り、<paragraph> 要素と
 * <paragraph_list> 要素を除去した文書要素に分解するためのクラスです。
 */
class CioSplitter {

	private $event_list;

	private $file_handle;

	private $event_index;

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

		// ファイルを再度開きます。
		$this->file_handle = fopen($filename, 'rb');

		// イベント インデックスを初期化します。
		$this->event_index = 0;

		return ($this->file_handle != NULL);
	}

	const EVENT_PARAGRAPH_LIST_START	= 1;
	const EVENT_PARAGRAPH_LIST_END 		= 2;
	const EVENT_PARAGRAPH_START 		= 3;
	const EVENT_PARAGRAPH_END 			= 4;

	private function create_event_list($filename) {

		$result = FALSE;
		$this->event_list = [];

		// ファイルを開きます。
		$searcher = new FileContentSearcher(1024*1024);
		if (! $searcher->open($filename)) return FALSE;

		// ファイルを解析します。
		while (1) {

			// <paragraph_list> タグを検索します。
			$index = $searcher->find('<paragraph_list');
			if ($index === FALSE) {
				$result = TRUE;
				break;
			}

			$event = array(
				'type'	=> self::EVENT_PARAGRAPH_LIST_START,
				'index'	=> $index,
			);
			$this->event_list[] = $event;

			// <paragraph>, </paragraph> の繰り返し、および、</paragraph_list> を解析します。
			$ok = $this->parse_paragraph_list($searcher);
			if (! $ok) break;
		}

		// ファイルを閉じます。
		$searcher->close();

		return $result;
	}

	/**
	 * <paragraph>, </paragraph> の繰り返し、および、 </paragraph_list> の単一出現を解析します。
	 * 構文エラーがあれば FALSE を返します。
	 * </paragraph_list> が見つかった場合は TRUE を返します。
	 */
	private function parse_paragraph_list($searcher) {

		while (1) {

			// <paragraph> または </paragraph_list> タグを検索します。
			list($index, $found)  = $searcher->find_first('<paragraph', '</paragraph_list>');

			// 見つからなかった場合、構文エラーとします。
			if ($found == 0) {
				return FALSE;
			}
			// <paragraph> タグが見つかった場合
			elseif ($found == 1) {

				// id 属性を検索します。見つからなかった場合は、エラーとします。
				while (TRUE) {
					list($name, $value) = $searcher->read_xml_attribute();
					if ($name === FALSE) return FALSE;
					if ($name === 'id') break;
				}

				$event = array(
					'type'	=> self::EVENT_PARAGRAPH_START,
					'index'	=> $index,
					'id'	=> $value,
				);
				$this->event_list[] = $event;

				// </paragraph> タグを検索します。見つからなかった場合は、エラーとします。
				$index = $searcher->find('</paragraph>');
				if ($index === FALSE) return FALSE;

				$event = array(
					'type'	=> self::EVENT_PARAGRAPH_END,
					'index'	=> $index + strlen('</paragraph>'),
				);
				$this->event_list[] = $event;
			}
			// </paragraph_list> タグが見つかった場合
			elseif ($found == 2) {

				$event = array(
					'type'	=> self::EVENT_PARAGRAPH_LIST_END,
					'index'	=> $index + strlen('</paragraph_list>'),
				);
				$this->event_list[] = $event;

				// TRUE を返して解析ループを終了します。
				return TRUE;
			}
		}
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
			if ($index2 === FALSE) {
				fseek($this->file_handle, 0, SEEK_END);
				$index2 = ftell($this->file_handle);
			}

			// ファイル位置を移動して、読み取ります。
			fseek($this->file_handle, $index1, SEEK_SET);
			$doc_text .= fread($this->file_handle, $index2 - $index1);

			// 次に進みます。
			$index1 = $this->next_event_index(self::EVENT_PARAGRAPH_LIST_END);
			if ($index1 === FALSE) break;
		}

		return $doc_text;
	}

	/**
	 * 指定されたタイプのイベントを探して、
	 * そのインデックスを返します。
	 * 存在しないときは FALSE を返します。
	 */
	private function next_event_index($type) {
		while ( $this->event_index < count($this->event_list) ) {
			$event = $this->event_list[ $this->event_index++ ];
			if ($event['type'] === $type) {
				return $event['index'];
			}
		}
		return FALSE;
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
		if ($index1 === FALSE) return array(FALSE, 0);

		// 段落開始タグに付随する段落 ID を取得します。
		$p_id = $this->event_list[ $this->event_index - 1 ]['id'];

		// 次の EVENT_PARAGRAPH_END を探し、段落タグの終了位置を取得します。
		$index2 = $this->next_event_index(self::EVENT_PARAGRAPH_END);
		if ($index2 === FALSE) return array(FALSE, 0);

		// ファイル位置を移動して、読み取ります。
		fseek($this->file_handle, $index1, SEEK_SET);
		$p_text = fread($this->file_handle, $index2 - $index1);

		return array($p_text, $p_id);
	}
}


/**
 * CioSplitter クラスの単体テスト コードです。
 */
function test_CioSplitter() {
	require('TestUtil.php');

	// テスト用のファイルを作成します。
	$text = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<InftyOnlineDocument>
<document_property>XYZ</document_property>
<section>
  p<paragraph_list>q
    x<paragraph id="1">A</paragraph>y
    z<paragraph id="2">B</paragraph>w
  r</paragraph_list>s
  u<paragraph_list>v
    a<paragraph some="sm" id="34">C</paragraph>b
    c<paragraph hoge="hg" id="567">D</paragraph>d
  m</paragraph_list>n
</section>
</InftyOnlineDocument>
EOD;

	$doc_expected = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<InftyOnlineDocument>
<document_property>XYZ</document_property>
<section>
  ps
  un
</section>
</InftyOnlineDocument>
EOD;

	$p1_expected = '<paragraph id="1">A</paragraph>';
	$p2_expected = '<paragraph id="2">B</paragraph>';
	$p3_expected = '<paragraph some="sm" id="34">C</paragraph>';
	$p4_expected = '<paragraph hoge="hg" id="567">D</paragraph>';

	$filename = tempnam(sys_get_temp_dir(), 'test');
	file_put_contents($filename, $text);

	// CIO 形式のファイルを開きます。
	$splitter = new CioSplitter();
	$ok = $splitter->open($filename);
	TEST_OK($ok);

	// 文書を検証します。
	$doc_actual = $splitter->get_document();
	TEST_EQUALS($doc_expected, $doc_actual);

	// 段落を検証します。
	$splitter->begin_paragraph();
	list($p1_actual, $id1_actual) = $splitter->next_paragraph();
	list($p2_actual, $id2_actual) = $splitter->next_paragraph();
	list($p3_actual, $id3_actual) = $splitter->next_paragraph();
	list($p4_actual, $id4_actual) = $splitter->next_paragraph();
	list($p5_actual, $id5_actual) = $splitter->next_paragraph();

	TEST_EQUALS($p1_expected, $p1_actual);  TEST_EQUALS("1", $id1_actual);
	TEST_EQUALS($p2_expected, $p2_actual);  TEST_EQUALS("2", $id2_actual);
	TEST_EQUALS($p3_expected, $p3_actual);  TEST_EQUALS("34", $id3_actual);
	TEST_EQUALS($p4_expected, $p4_actual);  TEST_EQUALS("567", $id4_actual);
	TEST_EQUALS(FALSE ,       $p5_actual);  TEST_EQUALS(0, $id5_actual);
}

/**
 * CioSplitter クラスの目視テスト コードです。
 */
function test_CioSplitter_visual($filename) {

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

//test_CioSplitter();
//test_CioSplitter_visual($argv[1]);

