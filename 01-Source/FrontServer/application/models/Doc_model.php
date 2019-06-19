<?php

class Doc_model extends CI_Model {

	public function __construct() {
		$this->load->model('file_model');
		$this->load->model('voice_model');
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 文書の検索

	/**
	 * get_doc 関数によって一度データベースから取得した
	 * 文書レコードをキャッシュするための変数です。
	 */
	private $doc_cache = array();

	/**
	 * 指定された文書 ID の文書レコードを取得します。
	 */
	public function get_doc($doc_id) {

		// キャッシュに存在すれば、それを返します。
		if (array_key_exists($doc_id, $this->doc_cache)) {
			$doc = $this->doc_cache[$doc_id];
			return $doc;
		}

		// 新たに検索します。
		$this->db->where('id', $doc_id);
		$query = $this->db->get('t_doc');

		if ($query->num_rows() > 0) {
			$doc = $query->row_array();
			$this->doc_cache[$doc_id] = $doc;
		}
		else {
			$doc = NULL;
		}

		$query->free_result();
		return $doc;
	}

	/**
	 * 指定された文書 ID に関連付けられたキャッシュをクリアします。
	 * 文書の情報が更新されたり、移動された場合に、呼び出してください
	 */
	private function clear_doc_cache($doc_id) {
		unset($this->doc_cache[$doc_id]);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の作成

	const DOC_TEMPLATE_FILE = '/template/DocTemplate.xml';
	const PARAGRAPH_TEMPLATE_FILE = '/template/ParagraphTemplate.xml';

	/**
	 * 新しい文書を作成します。
	 *
	 * @return		文書 ID
	 */
	public function create_doc() {

		// t_doc テーブルに空文書を追加します。
		$doc_record = $this->create_empty_doc_record();
		$this->db->insert('t_doc', $doc_record);
		$doc_id = $this->db->insert_id();

		// t_doc_p テーブルに空段落を追加します。
		$p_record = $this->create_empty_p_record($doc_id);
		$this->db->insert('t_doc_p', $p_record);

		return $doc_id;
	}

	/**
	 * 空の文書レコードを作成します。
	 *
	 * @return 	$doc_record			文書レコード
	 */
	private function create_empty_doc_record() {

		// 文書のテンプレートを取得します。
		$content = file_get_contents(APPPATH . self::DOC_TEMPLATE_FILE);

		// 文書辞書、音声設定、変換設定は、デフォルトで空文字列とします。
		$dictionary			= '';
		$voice_setting		= '';
		$convert_setting	= '';

		$doc_record = array(
			'content'			=> $content,
			'dictionary'		=> $dictionary,
			'voice_setting'		=> $voice_setting,
			'convert_setting'	=> $convert_setting,
			'revision'			=> 1,
		);

		return $doc_record;
	}

	/**
	 * 空の段落レコードを作成します。
	 */
	private function create_empty_p_record($doc_id) {

		// 段落のテンプレートを取得します。
		$content = file_get_contents(APPPATH . self::PARAGRAPH_TEMPLATE_FILE);

		// t_doc_p テーブルに追加します。
		$p_record = array(
			'doc_id'		=> $doc_id,
			'p_id'			=> 1,
			'content'		=> $content,
		);

		return $p_record;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書のコピー

	/**
	 * 文書をコピーします。
	 * 文書に含まれる段落もコピーされます。
	 *
	 * @return	新規にコピーされた文書の ID。失敗したときは 0 です。
	 */
	public function copy_doc($doc_id) {

		$doc = $this->get_doc($doc_id);
		if (! $doc) return 0;

		// 文書内容、文書辞書、音声設定、変換設定をコピーします。
		$sql = 'INSERT INTO t_doc (`content`, `dictionary`, `voice_setting`, `convert_setting`)'.
			' SELECT `content`, `dictionary`, `voice_setting`, `convert_setting` FROM t_doc WHERE `id`=?';
		$this->db->query($sql, array($doc_id));
		$new_doc_id = $this->db->insert_id();

		// 段落をコピーします。
		$sql = 'INSERT INTO t_doc_p (`doc_id`, `p_id`, `content`)'.
			' SELECT ? as `doc_id`, `p_id`, `content` FROM t_doc_p WHERE `doc_id`=?';
		$this->db->query($sql, array($new_doc_id, $doc_id));

		// アニメーション テーブルをコピーします。
		$sql = 'INSERT INTO t_doc_animation (`doc_id`, `animation_id`, `content`)'.
			' SELECT ? as `doc_id`, `animation_id`, `content` FROM t_doc_animation WHERE `doc_id`=?';
		$this->db->query($sql, array($new_doc_id, $doc_id));

		return $new_doc_id;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書のインポート

	/**
	 * 外部ファイルとして指定された文書を、データベースにインポートします。
	 *
	 * 複数テーブル、複数レコードの更新を行いますが、
	 * トランザクションはかけていませんので、呼び出し側でかけてください。
	 *
	 * @param filename	文書ファイルのパス (CIO 形式、拡張子 .xml を仮定します)
	 * @return doc_id	文書 ID (失敗した場合は 0 を返します)
	 */
	public function import_doc($filename) {

		// CIO 形式 (拡張子 .xml) に対応する辞書ファイル (拡張子 .dic.xml) の内容を読み取ります。
		$dic_filename = ch_replace_extension($filename, '.dic.xml');
		$dictionary = @file_get_contents($dic_filename);
		if ($dictionary === FALSE) $dictionary = '';

		// CIO 形式ファイルを XML として解析します。
		$this->load->library('CioSplitter');
		$splitter = new CioSplitter();
		$ok = $splitter->open($filename);
		if (! $ok) return 0;

		// t_doc テーブルに追加するレコードを作成します。
		$doc_content = $splitter->get_document();
		$doc_record = array(
			'content' => $doc_content,
			'dictionary' => $dictionary,	// 辞書は .doc.xml ファイルの内容を設定します。
			'voice_setting' => '',			// 音声設定は空にします。
			'convert_setting' => '',		// 変換設定は空にします。
		);

		// t_doc テーブルにレコードを追加し、文書 ID を取得します。
		$this->db->insert('t_doc', $doc_record);
		$doc_id = $this->db->insert_id();

		// 段落を列挙して、段落レコードを作成します。
		$splitter->begin_paragraph();
		while (1) {
			list($p_content, $p_id) = $splitter->next_paragraph();
			if ($p_content === FALSE) break;

			// t_doc_p テーブルに追加するレコードを作成します。
			$p_record = array(
				'doc_id'	=> $doc_id,
				'p_id'		=> $p_id,
				'content'	=> $p_content,
			);
			$this->db->insert('t_doc_p', $p_record);
		}

		// CIO 形式ファイルを閉じます。
		$splitter->close();

		// アニメーション データをインポートします。
		$this->import_animation($doc_id, $filename);

		// すべてに成功したら、文書 ID を返します。
		return $doc_id;
	}

	/**
	 * アニメーション データをインポートします。
	 *
	 * @param doc_id	インポート先の文書 ID
	 * @param filename	文書ファイルのファイル名 (CIO 形式、拡張子 .xml を仮定します)
	 */
	private function import_animation($doc_id, $filename) {

		$this->load->model('animation_model');

		// アニメーション XML のファイル名を作成します。
		$anime_filename = ch_replace_extension($filename, '.anime.xml');

		// アニメーション XML を解析します。
		// 【実装メモ】LIBXML_PARSEHUGE オプションを付けないと、
		// 巨大 XML を解析できないので注意してください。
		$dom = new DOMDocument('1.0', 'UTF-8');
		$ok = $dom->load($anime_filename, LIBXML_PARSEHUGE);
		if (! $ok) return;

		// ianimations 要素 (ルート要素) を取得します。
		$root_elem = $dom->documentElement;

		// ianimations 要素 (ルート要素) の ianimation 子要素を列挙します。
		foreach ($root_elem->childNodes as $node) {
			if ($node->nodeType != XML_ELEMENT_NODE) continue;
			if ($node->tagName !== 'ianimation') continue;

			// ianimation 要素の x-id 属性値と XML テキストを取得します。
			$animation_id = (int) $node->getAttribute('x-id');
			$content = $dom->saveXML($node);

			// t_animation テーブルに登録します。
			$this->animation_model->set_animation_content($doc_id, $animation_id, $content);
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書のエクスポート

	/**
	 * 指定された文書を外部ファイルにエクスポートします。
	 *
	 * @param doc_id	文書 ID
	 * @param filename	外部ファイルのパス (CIO 形式になります)
	 * @return			成功したら TRUE、失敗したら FALSE を返します。
	 */
	public function export_doc($doc_id, $filename) {

		// 文書を取得します。
		$doc = $this->get_doc($doc_id);
		if (! $doc) return FALSE;

		// 文書 XML を取得します。
		$doc_content = $doc['content'];

		// 出力ファイルを開きます。
		$fp = fopen($filename, 'w+');

		// 文書 XML のうち、<paragraph_id_list></paragraph_id_list> の部分を検索していきます。
		$success = TRUE;
		while (1) {

			// <paragraph_id_list> 要素を検索します。
			$matches = NULL;
			$count = preg_match(
				'/\<paragraph_id_list\>([\d,\s]+)\<\/paragraph_id_list\>/u',
				$doc_content, $matches, PREG_OFFSET_CAPTURE);

			// <paragraph_id_list> 要素が見つからなければ、文書 XML の残余部分を出力して終了します。
			if ($count == 0) {
				fwrite($fp, $doc_content);
				break;
			}

			// <paragraph_id_list> 要素とその内容テキストを取得します。
			// 【注意】preg_match の PREG_OFFSET_CAPTURE オプションで取得できるインデックスは、
			// 文字インデックスではなく、バイト インデックスになります。
			// したがって、以下のコードでは mb_strlen, mb_substr ではなく strlen, substr を使います。
			list($elem_text, $elem_index) = $matches[0];
			list($p_id_list_text, $p_id_list_index) = $matches[1];
			$end_index = $elem_index + strlen($elem_text);

			// 文書 XML を前部と後部に分割します。
			// <paragraph_id_list> 要素の終了位置までが前部です。
			$doc_content_before = substr($doc_content, 0, $end_index);
			$doc_content_after  = substr($doc_content, $end_index);

			// 文書 XML の前部を出力します。
			fwrite($fp, $doc_content_before);

			// <paragraph_list> タグを出力します。
			fwrite($fp, "\n<paragraph_list>\n");

			// 段落 ID を取得します。
			$p_id_list = preg_split('/,/u', $p_id_list_text);

			// 段落 ID を列挙します。
			foreach ($p_id_list as $p_id) {

				// 段落レコードを取得します。
				$p_id = intval($p_id);
				$p = $this->get_p($doc_id, $p_id);

				// 段落 ID が不正なら、FALSE を返します。
				if (! ($p_id > 0)) {
					$success = FALSE;
					break;
				}

				// 段落 XML を出力します。
				fwrite($fp, $p['content']);
				fwrite($fp, "\n");
			}

			// </paragraph_list> タグを出力します。
			fwrite($fp, "\n</paragraph_list>\n");

			// 文書 XML の後部を、次の文書 XML とします。
			$doc_content = $doc_content_after;
		}

		// ファイルをクローズします。
		fclose($fp);

		return $success;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 段落

	/**
	 * 指定された段落 ID の段落レコードを取得します。
	 *
	 * @param $p_id		段落 ID
	 * @return			段落レコード (存在しないときは NULL)
	 */
	public function get_p($doc_id, $p_id) {

		$this->db->where('doc_id', $doc_id);
		$this->db->where('p_id', $p_id);
		$query = $this->db->get('t_doc_p');

		if ($query->num_rows() > 0) {
			$p = $query->row_array();
		}
		else {
			$p = NULL;
		}

		$query->free_result();
		return $p;
	}

	/**
	 * 文書と段落を更新します。
	 *
	 * @param doc_id		文書 ID
	 * @param content		文書の content
	 * @param p_list		段落を表す連想配列 (id, content フィールドを持つ) の配列
	 */
	public function update_doc_and_p($doc_id, $content, $p_list) {

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// 現在時刻を取得します。
			$now = ch_current_time_string();

			// 文書を更新します。
			$this->db->set('content', $content);
			$this->db->set('revision', 'revision + 1', FALSE);
			$this->db->where('id', $doc_id);
			$this->db->update('t_doc');

			// 文書に属する段落は、すべて削除します。
			$this->db->where('doc_id', $doc_id);
			$this->db->delete('t_doc_p');

			// 段落を更新します。
			foreach ($p_list as $p) {
				$p_record = array(
					'doc_id'	=> $doc_id,
					'p_id'		=> $p['id'],
					'content'	=> $p['content']
				);
				$this->db->insert('t_doc_p', $p_record);
			}

			// 文書ファイルの更新日時を更新します。
			$this->update_doc_file_updated_at($doc_id);

			// トランザクションをコミットします。
			$this->db->trans_commit();
		}
		catch (Exception $ex) {
			// トランザクションをロールバッックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの更新日時

	public function update_doc_file_updated_at($doc_id) {
		$file = $this->file_model->get_file_of_doc($doc_id, TRUE);
		$this->file_model->update_file_updated_at($file['id']);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 読み上げ設定変更日時

	/**
	 * 文書の「読み上げ設定変更日時」を設定します。
	 */
	/*
	public function set_read_setting_modified_at($doc_id) {
		$this->db->where('id', $doc_id);
		$this->db->set('read_setting_modified_at', 'NOW()', FALSE);
		$this->db->update('t_doc');
	}
	*/

	//////////////////////////////////////////////////////////////////////////////
	//// 文書辞書

	/**
	 * 文書の文書辞書を取得します。
	 * 存在しないときは空文字列を返します。
	 */
	public function get_dictionary($doc_id) {

		$this->db->where('id', $doc_id);
		$this->db->select('dictionary');
		$query = $this->db->get('t_doc');

		if ($query->num_rows() > 0) {
			$doc = $query->row_array();
			$dictionary = $doc['dictionary'];
		}
		else {
			$dictionary = '';
		}

		$query->free_result();
		return $dictionary;
	}

	/**
	 * 文書の文書辞書を保存します。
	 */
	public function set_dictionary($doc_id, $dictionary) {
		$this->db->where('id', $doc_id);
		$this->db->set('dictionary', $dictionary);
		$this->db->set('read_setting_modified_at', 'NOW()', FALSE);
		$this->db->update('t_doc');

		// 文書ファイルの更新日時を更新します。
		$this->update_doc_file_updated_at($doc_id);
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 音声設定

	/**
	 * 文書の音声設定を取得します。
	 * 存在しないときは空文字列を返します。
	 */
	public function get_voice_setting($doc_id) {

		$this->db->where('id', $doc_id);
		$this->db->select('voice_setting');
		$query = $this->db->get('t_doc');

		if ($query->num_rows() > 0) {
			$doc = $query->row_array();
			$voice_setting = $doc['voice_setting'];
		}
		else {
			$voice_setting = '';
		}

		$query->free_result();
		return $voice_setting;
	}

	/**
	 * 文書の音声設定を保存します。
	 */
	public function set_voice_setting($doc_id, $voice_setting) {
		$this->db->where('id', $doc_id);
		$this->db->set('voice_setting', $voice_setting);
		$this->db->set('read_setting_modified_at', 'NOW()', FALSE);
		$this->db->update('t_doc');

		// 文書ファイルの更新日時を更新します。
		$this->update_doc_file_updated_at($doc_id);
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 変換設定

	/**
	 * 文書の変換設定を取得します。
	 * 存在しないときは空文字列を返します。
	 */
	public function get_convert_setting($doc_id) {

		$this->db->where('id', $doc_id);
		$this->db->select('convert_setting');
		$query = $this->db->get('t_doc');

		if ($query->num_rows() > 0) {
			$doc = $query->row_array();
			$convert_setting = $doc['convert_setting'];
		}
		else {
			$convert_setting = '';
		}

		$query->free_result();
		return $convert_setting;
	}

	/**
	 * 文書の変換設定を保存します。
	 */
	public function set_convert_setting($doc_id, $convert_setting) {
		$this->db->where('id', $doc_id);
		$this->db->set('convert_setting', $convert_setting);
		$this->db->update('t_doc');

		// 文書ファイルの更新日時を更新します。
		$this->update_doc_file_updated_at($doc_id);
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 元文書からの設定の引継ぎ

	public function inherit_doc_settings_and_animation_and_unlock($doc_id, $org_doc_id) {

		// 元文書を取得します。
		$org_doc = $this->get_doc($org_doc_id);
		if ($org_doc == NULL) return;

		// 元文書の各種設定を引き継ぎます。
		$this->db->where('id', $doc_id);
		$this->db->set('dictionary', $org_doc['dictionary']);
		$this->db->set('voice_setting', $org_doc['voice_setting']);
		$this->db->set('convert_setting', $org_doc['convert_setting']);
		$this->db->set('read_setting_modified_at', $org_doc['read_setting_modified_at']);
		$this->db->update('t_doc');

		// アニメーションをコピーします。
		$this->load->model('animation_model');
		$this->animation_model->copy_all_animations($doc_id, $org_doc_id);

		// 元文書の編集ロックを解除します。
		$org_file = $this->file_model->get_file_of_doc($org_doc_id, TRUE);
		if ($org_file) {
			$this->file_model->file_update_edit_session_id($org_file['id'], NULL);
		}
	}

}
