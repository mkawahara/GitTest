<?php

class User_info_model extends CI_Model {

	public function __construct() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ユーザー設定

	/**
	 * 指定されたユーザーのユーザー設定を取得します。
	 * 存在しない場合は空文字列を返します。
	 */
	public function get_user_setting($user_id) {

		$this->db->where('user_id', $user_id);
		$this->db->select('user_setting');
		$query = $this->db->get('t_user_info');

		if ($query->num_rows() > 0) {
			$user_info = $query->row_array();
			$user_setting = $user_info['user_setting'];
		}
		else {
			$user_setting = '';
		}

		$query->free_result();
		return $user_setting;
	}

	/**
	 * 指定されたユーザーのユーザー設定を保存します。
	 */
	public function set_user_setting($user_id, $user_setting) {

		// 【実装メモ】REPLACE 文を使うと、editor_setting が消えてしまうので注意。
		// これは REPLACE 文が INSERT+UPDATE ではなく INSERT+DELETE という仕様だからです。

		$sql = 'INSERT INTO t_user_info (user_id, user_setting) VALUES (?,?) ON DUPLICATE KEY UPDATE user_setting=?';
		$param = array($user_id, $user_setting, $user_setting);
		$this->db->query($sql, $param);
	}

	/**
	 * 指定されたユーザーのユーザー設定を新規に作成します。
	 * データベースには登録されません。
	 * データベースに登録したい場合は set_user_setting メソッドを別途呼び出してください。
	 */
	public function create_user_setting() {
		$user_setting =<<<EOD
<userSetting>
  <defaultDictionary></defaultDictionary>
  <defaultVoiceSetting></defaultVoiceSetting>
  <defaultConvertSetting></defaultConvertSetting>
</userSetting>
EOD;

		return $user_setting;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ユーザー設定 -  デフォルト辞書およびデフォルト音声設定の共通コード

	/**
	 * ユーザー設定 XML 内の指定された要素内の直下要素の XML を取得します。
	 * 存在しない場合は、空文字列を返します。
	 */
	private function get_user_setting_child_element_xml($user_id, $elementName) {

		// ユーザー設定を取得します。
		$user_setting = $this->get_user_setting($user_id);
		if ($user_setting == '') return '';

		// ユーザー設定の XML を解析します。
		$dom = new DOMDocument('1.0', 'UTF-8');
		$dom->loadXML($user_setting);

		// $elementName 要素を取得します。
		$elem = $dom->getElementsByTagName($elementName)->item(0);
		if ($elem == NULL) return '';

		// $elementName 要素の直下の子要素を１つ取得します。
		$child_elem = ch_dom_first_child_element($elem);
		if ($child_elem == NULL) return '';

		// <userdic> の XML 文字列を返します。
		return $dom->saveXML($child_elem);
	}

	/**
	 * ユーザー設定 XML 内の指定された要素内の直下要素の XML を更新します。
	 * ユーザー設定が存在しない場合は、新規に作成して登録します。
	 * ユーザー設定に指定された要素名が存在しない場合は、新規に追加します。
	 * $content_xml が不正な形式のときは、FALSE を返します。
	 */
	public function set_user_setting_child_element_xml($user_id, $elementName, $content_xml) {

		// ユーザー設定を取得します。
		$user_setting = $this->get_user_setting($user_id);
		if ($user_setting == '') {

			// ユーザー設定が存在しないときは、新規に作成します。
			$user_setting = $this->create_user_setting();
		}

		// ユーザー設定の XML を解析します。
		$dom = new DOMDocument('1.0', 'UTF-8');
		$dom->loadXML($user_setting);

		// $elementName の要素を取得します。
		$elem = $dom->getElementsByTagName($elementName)->item(0);
		if ($elem == NULL) {

			// 要素が存在しないときは、新規に追加します。
			$root_elem = $dom->documentElement;
			$elem = $dom->createElement($elementName);
			$root_elem->appendChild($elem);
		}
		else {
		
			// $elementName の要素の内容を消去します。
			ch_dom_remove_all_child_elements($elem);
		}

		// $content_xml が空でない場合
		if ($content_xml != '') {

			// $content_xml 引数に対応する DOMElement オブジェクトを作成します。
			$content_root_elem = NULL;
			{
				$content_dom = new DOMDocument('1.0', 'UTF-8');
				$success = @ $content_dom->loadXML($content_xml);
				
				// $content_xml が不正な形式のときは、FALSE を返します。
				if (! $success) {
					log_message('error', "user setting for $elementName can't be parsed as valid XML.\n[content]\n" . $content_xml);
					return FALSE;
				}
				
				$content_root_elem = $content_dom->documentElement;
				$content_root_elem = $dom->importNode($content_root_elem, TRUE);	// 新しい文書にインポート
			}

			// $elementNameの 要素の直下に、$content_xml のルート要素を追加します。
			$elem->appendChild($content_root_elem);
		}

		// ユーザー設定全体を XML に変換します。
		$user_setting = $dom->saveXML();

		// ユーザー設定の XML をデータベースに保存します。
		$this->set_user_setting($user_id, $user_setting);
		
		return TRUE;
	}


	//////////////////////////////////////////////////////////////////////////////
	//// ユーザー設定 -  デフォルト辞書

	/**
	 * 指定されたユーザーのユーザー設定を取得し、その一部であるデフォルト辞書を取得します。
	 * ユーザー設定 XML の中の <defaultDictionary> 要素の唯一の直下要素を
	 * ルート要素とする XML 文字列を取得します。
	 * 存在しない場合は、空文字列を返します。
	 */
	public function get_default_dictionary($user_id) {
		return $this->get_user_setting_child_element_xml($user_id, 'defaultDictionary');
	}

	/**
	 * 指定されたユーザーのユーザー設定を取得し、その一部であるデフォルト辞書を更新します。
	 * ユーザー設定 XML の中の <defaultDictionary> 要素の内容を、
	 * 指定された XML 文字列で更新します。
	 * ユーザー設定が存在しない場合は、新規に作成して登録します。
	 */
	public function set_default_dictionary($user_id, $dictionary) {

		return $this->set_user_setting_child_element_xml($user_id, 'defaultDictionary', $dictionary);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ユーザー設定 -  デフォルト音声設定

	/**
	 * 指定されたユーザーのユーザー設定を取得し、その一部であるデフォルト音声設定を取得します。
	 * ユーザー設定 XML の中の <defaultVoiceSetting> 要素の唯一の直下要素を
	 * ルート要素とする XML 文字列を取得します。
	 * 存在しない場合は、空文字列を返します。
	 */
	public function get_default_voice_setting($user_id) {
		return $this->get_user_setting_child_element_xml($user_id, 'defaultVoiceSetting');
	}

	/**
	 * 指定されたユーザーのユーザー設定を取得し、その一部であるデフォルト音声設定を更新します。
	 * ユーザー設定 XML の中の <defaultVoiceSetting> 要素の内容を、
	 * 指定された XML 文字列で更新します。
	 * ユーザー設定が存在しない場合は、新規に作成して登録します。
	 */
	public function set_default_voice_setting($user_id, $voice_setting) {

		return $this->set_user_setting_child_element_xml($user_id, 'defaultVoiceSetting', $voice_setting);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ユーザー設定 -  デフォルト変換設定

	/**
	 * 指定されたユーザーのユーザー設定を取得し、その一部であるデフォルト変換設定を取得します。
	 * ユーザー設定 XML の中の <defaultConvertSetting> 要素の唯一の直下要素を
	 * ルート要素とする XML 文字列を取得します。
	 * 存在しない場合は、空文字列を返します。
	 */
	public function get_default_convert_setting($user_id) {
		return $this->get_user_setting_child_element_xml($user_id, 'defaultConvertSetting');
	}

	/**
	 * 指定されたユーザーのユーザー設定を取得し、その一部であるデフォルト変換設定を更新します。
	 * ユーザー設定 XML の中の <defaultVoiceSetting> 要素の内容を、
	 * 指定された XML 文字列で更新します。
	 * ユーザー設定が存在しない場合は、新規に作成して登録します。
	 */
	public function set_default_convert_setting($user_id, $convert_setting) {

		return $this->set_user_setting_child_element_xml($user_id, 'defaultConvertSetting', $convert_setting);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エディタ設定

	/**
	 * 指定されたユーザーのエディタ設定を取得します。
	 * 存在しない場合は空文字列を返します。
	 */
	public function get_editor_setting($user_id) {

		$this->db->where('user_id', $user_id);
		$this->db->select('editor_setting');
		$query = $this->db->get('t_user_info');

		if ($query->num_rows() > 0) {
			$user_info = $query->row_array();
			$editor_setting = $user_info['editor_setting'];
		}
		else {
			$editor_setting = '';
		}

		$query->free_result();
		return $editor_setting;
	}

	/**
	 * 指定されたユーザーのエディタ設定を保存します。
	 */
	public function set_editor_setting($user_id, $editor_setting) {

		// 【実装メモ】REPLACE 文を使うと、editor_setting が消えてしまうので注意。
		// これは REPLACE 文が INSERT+UPDATE ではなく INSERT+DELETE という仕様だからです。

		$sql = 'INSERT INTO t_user_info (user_id, editor_setting) VALUES (?,?) ON DUPLICATE KEY UPDATE editor_setting=?';
		$param = array($user_id, $editor_setting, $editor_setting);
		$this->db->query($sql, $param);
	}

}
