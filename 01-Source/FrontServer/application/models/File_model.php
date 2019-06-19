<?php

class File_model extends CI_Model {

	public function __construct() {
	}

	////////////////////////////////////////////////////////////////////////////
	//// ドライブ操作
	////////////////////////////////////////////////////////////////////////////

	/**
	 * 指定されたファイルをルート フォルダとして持つドライブを取得します。
	 * 存在シなければ NULL を返します。
	 */
	public function get_drive_of_root($root_id, $include_deleted) {
		$this->db->where('root_id', $root_id);
		if (! $include_deleted) {
			$this->db->where('deleted_at IS NULL', NULL, FALSE);
		}
		$query = $this->db->get('t_drive');

		$result = ($query->num_rows() > 0) ? $query->row_array() : NULL;
		$query->free_result();
		return $result;;
	}

	/**
	 * ユーザーがアクセス可能な、すべてのドライブ レコードを取得します。
	 */
	public function get_drives_of_user_accessible($include_deleted = FALSE) {

		$user_id = $this->login->user_id();

		// ユーザーが所属するグループ レコードのリストを取得します。
		$group_list = $this->login->group_list();

		// グルーザ ID のリストを取得します。
		$grouser_id_list = array( $user_id );
		foreach ($group_list as $group) {
			$grouser_id_list[] = $group['id'];
		}

		// t_drives テーブルを検索します。
		$this->db->where_in('grouser_id', $grouser_id_list);
		if (! $include_deleted) {
			$this->db->where('deleted_at IS NULL', NULL, FALSE);
		}
		$query = $this->db->get('t_drive');

		return $query->result_array();
	}

	/**
	 * 指定されたユーザーのユーザー専用ドライブが存在しなければ作成します。
	 * また、指定されたユーザーが所属するすべてのグループについて、
	 * そのグループ専用ドライブが存在しなければ作成します。
	 */
	public function create_user_and_group_drive_if_not_exists() {

		$user_id = $this->login->user_id();

		// User オブジェクトを取得します。
		$user = $this->login->user();

		// ユーザー専用ドライブが存在しなければ作成します。
		$this->create_grouser_drive_if_not_exists($user['id'], $user['name'], $user_id);

		// ユーザーが所属するグループ レコードのリストを取得します。
		$group_list = $this->login->group_list();

		// それぞれのグループの専用ドライブが存在しなければ作成します。
		foreach ($group_list as $group) {
			$this->create_grouser_drive_if_not_exists($group['id'], $group['name'], $user_id);
		}
	}

	/**
	 * グルーザー専用のドライブが存在しなければ、作成します。
	 * 存在するが論理削除されている場合は、復活させます。
	 *
	 * @param drive_grouser_id	ドライブの所有者となるグルーザの ID
	 * @param folder_name		ドライブのルート フォルダの名前
	 * @param folder_creator_id	ドライブのルート フォルダの作成者 ID (ユーザー ID)
	 */
	private function create_grouser_drive_if_not_exists($drive_grouser_id, $folder_name, $folder_creator_id) {

		// 削除されたものも含めて、ユーザーが所有するドライブを取得します。
		$this->db->where('grouser_id', $drive_grouser_id);
		$this->db->order_by('created_at');
		$query = $this->db->get('t_drive');
		$drive_list = $query->result_array();

		// グルーザーが所有するドライブが 1 つも存在しない場合は、新規に作成します。
		if (count($drive_list) == 0) {
			$this->create_grouser_drive($drive_grouser_id, $folder_name, $folder_creator_id);
		}
		// グルーザーが所有するドライブが存在する場合は、もしすべて論理削除されているならば、
		// 最初の 1 つの論理削除を復活させます。
		else {

			// ドライブがすべて論理削除されているか確認します。
			$all_deleted = TRUE;
			foreach ($drive_list as $drive) {
				if (! $drive['deleted_at']) {
					$all_deleted = FALSE;
					break;
				}
			}

			// すべて論理削除されている場合、最初の 1 つのドライブを復活させます。
			if ($all_deleted) {
				$this->undelete_drive($drive_list[0]['id']);
			}
		}

	}

	private function create_grouser_drive($drive_grouser_id, $folder_name, $folder_creator_id) {

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// 現在時刻を取得します。
			$now = ch_current_time_string();

			// ルート フォルダを作成します。
			$folder = array(
				'name'				=> $folder_name,
				'type'				=> 2,
				'parent_id'			=> NULL,
				'creator_id'		=> $folder_creator_id,
				'doc_id'			=> NULL,
				'edit_session_id'	=> NULL,
				'created_at'		=> $now,
				'updated_at'		=> $now,
			);
			$this->db->insert('t_file', $folder);
			$folder_id = $this->db->insert_id();

			// ドライブを作成します。
			$drive = array(
				'grouser_id'		=> $drive_grouser_id,
				'root_id'			=> $folder_id,
				'created_at'		=> $now,
				'updated_at'		=> $now,
			);
			$this->db->insert('t_drive', $drive);

			// トランザクションをコミットします。
			$this->db->trans_commit();
		}
		catch (Exception $ex) {

			// トランザクションをロールバックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	/**
	 * 論理削除されたドライブを復活させます。
	 */
	public function undelete_drive($drive_id) {
		$this->db->where('id', $drive_id);
		$this->db->update('t_drive', array('deleted_at' => NULL));
	}

	/**
	 * ドライブに属するファイルツリーを関連付けます。
	 * $drive_list の要素である $drive オブジェクトに対して、
	 * $drive['root'] に関連付けます。
	 */
	public function attach_drives_file_trees(& $drive_list) {

		// ルート フォルダ ID を収集します。
		$root_id_list = array();
		foreach ($drive_list as $drive) {
			$root_id_list[] = $drive['root_id'];
		}

		// ルート フォルダ オブジェクトを取得します。
		// (ルート フォルダは削除されていないはずなので WHERE deleted_at IS NULL は指定しません)
		$this->db->where_in('id', $root_id_list);
		$query = $this->db->get('t_file');
		$root_list = $query->result_array();

		// ファイル ID から、ファイル レコードへのマップを初期化します。
		$file_map = array();

		// 親リストを初期化します。
		$parent_list = $root_list;

		while (1) {

			// $parent_list を $file_map に登録します。
			// $parent_list から $parent_id_list を作成します。
			$parent_id_list = array();
			foreach ($parent_list as & $parent_ref) {

				// 子ファイルの 'edit_session_id' フィールドを 'edit_user' フィールドに変換します。
				$this->convert_edit_session_id($parent_ref);

				// 子ファイルに 'files' フィールドを追加します。
				$parent_ref['files'] = ($parent_ref['type'] == 2) ? array() : NULL;

				$parent_id = $parent_ref['id'];
				$file_map[$parent_id] = & $parent_ref;
				$parent_id_list[] = $parent_id;
			}

			// $parent_id_list に存在するファイル ID を親に持つ、子ファイル レコードを収集します。
			$this->db->where_in('parent_id', $parent_id_list);
			$this->db->where('deleted_at IS NULL', NULL, FALSE);
			$query = $this->db->get('t_file');
			$child_list = $query->result_array();
			$query->free_result();

			// 子ファイルが１つもなければ、ここで終了します。
			if (count($child_list) === 0) break;

			// 子ファイルを、親ファイルの files フィールドに追加していきます。
			foreach ($child_list as & $child_ref) {

				// 親ファイルの 'files' フィールドに子ファイルを追加します。
				$parent_id = $child_ref['parent_id'];
				$file_map[$parent_id]['files'][] = & $child_ref;
			}

			// 次の親リストを設定します。
			$parent_list = $child_list;
		}

		// ルート フォルダをドライブの root フィールドに関連付けます。
		foreach ($drive_list as & $drive) {
			$drive['root'] = $file_map[$drive['root_id']];
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ドライブのロック

	/**
	 * ドライブをロックします。
	 * トランザクションを開始したうえでロックしてください。
	 *
	 * ファイルやドライブの検索キャッシュもクリアされます。
	 *
	 * @param	drive_id	ロックするドライブの ID
	 */
	public function lock_drive($drive_id) {
		$sql = 'SELECT * FROM t_drive WHERE id=? FOR UPDATE';
		$this->db->query($sql, array($drive_id));
		$this->clear_file_cache();
	}

	////////////////////////////////////////////////////////////////////////////
	//// ファイル取得
	////////////////////////////////////////////////////////////////////////////

	/**
	 * get_file 関数によって一度データベースから取得した
	 * ファイル レコードをキャッシュするための変数です。
	 */
	private $file_cache = array();

	/**
	 * 指定されたファイル ID のレコードを取得します。
	 *
	 * キャッシュを使用して検索を高速化しています。
	 */
	public function get_file($file_id, $include_deleted = FALSE) {

		// キャッシュに存在すれば、それを返します。
		if (array_key_exists($file_id, $this->file_cache)) {
			$file = $this->file_cache[$file_id];
			if ($file['deleted_at'] && ! $include_deleted) {
				return NULL;
			}
			else {
				return $file;
			}
		}

		// 新たに検索します。
		$this->db->where('id', $file_id);
		if (! $include_deleted) {
			$this->db->where('deleted_at IS NULL', NULL, FALSE);
		}
		$query = $this->db->get('t_file');

		if ($query->num_rows() > 0) {
			$file = $query->row_array();
			$this->file_cache[$file_id] = $file;
		}
		else {
			$file = NULL;
		}

		$query->free_result();
		return $file;
	}

	/**
	 * ファイルに対応するドライブをキャッシュします。
	 */
	private $file_to_drive_cache = array();

	/**
	 * 指定されたファイルが属するドライブを取得します。
	 *
	 * @return	$drive
	 */
	public function get_drive_of_file($file_id, $include_deleted = FALSE) {

		// ファイルを取得します。
		$file = $this->get_file($file_id, $include_deleted);
		if (! $file) return NULL;

		// ドライブがキャッシュにあれば、それを返します。
		if (array_key_exists($file_id, $this->file_to_drive_cache)) {
			$drive = $file_to_drive_cache[$file_id];
			return $drive;
		}

		// 親ファイルをたどって行って、親ファイル ID が NULL になるまでたどります。
		$root = $file;
		while (1) {
			if ($root['parent_id'] == NULL) break;
			$root = $this->get_file($root['parent_id'], $include_deleted);
			if (! $root) return NULL;
		}

		// ドライブを取得します。
		$drive = $this->get_drive_of_root($root['id'], $include_deleted);
		if (! $drive) return NULL;

		// キャッシュします。
		$file_to_drive_cache[$file_id] = $drive;

		return $drive;
	}

	/**
	 * ファイルに対応するドライブをキャッシュします。
	 */
	private $doc_to_file_cache = array();

	/**
	 * 指定された文書をもつファイルを取得します。
	 */
	public function get_file_of_doc($doc_id, $include_deleted = FALSE) {

		$this->db->where('doc_id', $doc_id);
		if (! $include_deleted) {
			$this->db->where('deleted_at IS NULL', NULL, FALSE);
		}
		$query = $this->db->get('t_file');

		if ($query->num_rows() > 0) {
			$result = $query->row_array();
			$this->file_cache[$result['id']] = $result;
			$this->doc_to_file_cache[$doc_id] = $result;
		}
		else {
			$result = NULL;
		}

		$query->free_result();
		return $result;
	}

	/**
	 * 指定されたファイル ID に関連付けられたキャッシュをクリアします。
	 * ファイルの情報が更新されたり、移動された場合に、呼び出してください
	 */
	private function clear_file_cache($file_id = 0) {
		if ($file_id > 0) {
			unset($this->file_cache[$file_id]);
			unset($this->file_to_drive_cache[$file_id]);
			unset($this->doc_to_file_cache[$file_id]);
		}
		else {
			$this->file_cache			= array();
			$this->file_to_drive_cache	= array();
			$this->doc_to_file_cache	= array();
		}
	}

	////////////////////////////////////////////////////////////////////////////
	//// フォルダ操作
	////////////////////////////////////////////////////////////////////////////

	/**
	 * フォルダの子ファイルのリストを取得します。
	 * 再帰的には取得しません。
	 */
	public function get_folder_files($parent_id, $include_deleted = FALSE) {

		$this->db->where('parent_id', $parent_id);
		if (! $include_deleted) {
			$this->db->where('deleted_at IS NULL', NULL, FALSE);
		}
		$query = $this->db->get('t_file');

		$result = $query->result_array();
		$query->free_result();
		return $result;
	}

	/**
	 * 指定された親フォルダ内で重複しないファイル名を作成します。
	 * $prefix が存在しなければ、それを返します。存在すれば、
	 * $prefix."-".$N ($N=1,2,...) を試行して存在しなければ、それを返します。
	 */
	public function create_unique_filename($parent_id, $prefix) {

		// フォルダ内の子ファイル リストを取得します。
		$child_list = $this->get_folder_files($parent_id);

		// 子ファイル リストをファイル名のマップに変換します。
		$filename_map = array();
		foreach ($child_list as $child) {
			$filename_map[$child['name']] = TRUE;
		}

		for ($n = 0; ; $n++) {

			if ($n === 0) {
				$filename = $prefix;
			}
			else {
				$filename = $prefix.'-'.$n;
			}

			// 子ファイル リスト内に、作成したファイル名が存在しないか確認します。
			if (! array_key_exists($filename, $filename_map)) {
				return $filename;
			}
		}
	}

	/**
	 * 指定された親フォルダ内にファイルを新規作成します。
	 *
	 * @param		$parent_id		親フォルダの ID
	 * @param		$creator_id		作成者のユーザー ID
	 * @param		$base_name		新しいファイル名のベース名 (空にすると '新しい文書' になります)
	 *
	 * @return 		$file_id		新規作成したファイルの ID
	 * @return		$new_filename	新規作成したファイルの名前
	 * @return		$doc_id			新規作成したファイルの文書 ID
	 */
	public function create_file($parent_id, $creator_id, $base_name = '') {

		if ($base_name == '') {
			$base_name = '新しい文書';
		}

		// Doc_model をロードします。
		$this->load->model('doc_model');

		// 新しいファイル名を作成します。
		$new_filename = $this->create_unique_filename($parent_id, $base_name);

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// 文書を作成します。
			$doc_id = $this->doc_model->create_doc();

			// 現在時刻を取得します。
			$now = ch_current_time_string();

			// ファイルを作成します。
			$file = array(
				'name'				=> $new_filename,
				'type'				=> 1,			// 通常ファイル
				'parent_id'			=> $parent_id,
				'creator_id'		=> $creator_id,
				'doc_id'			=> $doc_id,
				'edit_session_id'	=> NULL,
				'created_at'		=> $now,
				'updated_at'		=> $now,
			);
			$this->db->insert('t_file', $file);
			$file_id = $this->db->insert_id();

			// トランザクションをコミットします。
			$this->db->trans_commit();

			// 戻り値を返します。
			return array($file_id, $new_filename, $doc_id);
		}
		catch (Exception $ex) {

			// トランザクションをロールバックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	/**
	 * 指定された親フォルダ内にフォルダを新規作成します。
	 *
	 * @return 		新規作成したフォルダの ID
	 */
	public function create_folder($parent_id, $creator_id, $base_name = '') {

		if ($base_name == '') {
			$base_name = '新しいフォルダ';
		}

		// 新しいファイル名を作成します。
		$new_filename = $this->create_unique_filename($parent_id, $base_name);

		// 現在時刻を取得します。
		$now = ch_current_time_string();

		// ファイルを作成します。
		$file = array(
			'name'				=> $new_filename,
			'type'				=> 2,			// フォルダ
			'parent_id'			=> $parent_id,
			'creator_id'		=> $creator_id,
			'doc_id'			=> NULL,
			'edit_session_id'	=> NULL,
			'created_at'		=> $now,
			'updated_at'		=> $now,
		);
		$this->db->insert('t_file', $file);
		$file_id = $this->db->insert_id();

		// 戻り値を返します。
		return array($file_id, $new_filename, NULL);
	}

	/**
	 * 指定されたファイル名に対して、次の変換を行います。
	 *
	 * 1. ファイル名にパスが含まれていれば、ベース名のみを取得します。
	 * 2. ファイル名に含まれる無効な文字をアンダースコアに変換します。
	 * 3. ファイル名の長さが 260 を超える場合は、260 文字に切り詰めます。
	 */
	public function sanitize_filename($filename) {

		if (! $filename) return '';

		// パスが含まれていれば、ベース名のみを取り出します。
		$filename = ch_basename($filename);

		// 無効な文字をアンダースコアに変換します。
		$filename = preg_replace('/^\.\.$/u', '__', $filename);
		$filename = preg_replace('/^\.$/u', '_', $filename);
		$filename = preg_replace('/['.'\/'.'\\\\'.'\?'.'\*'.'\:'.'\|'.'\\\"'.'\<'.'\>'.']/u', '_', $filename);

		// 260 文字以内に切り詰めます。
		$FILENAME_MAX_LENGTH = 260;
		if (mb_strlen($filename) > $FILENAME_MAX_LENGTH) {
			$filename = mb_substr($filename, 0, $FILENAME_MAX_LENGTH);
		}

		return $filename;
	}

	/**
	 * 指定されたフォルダ内に、ファイルをインポートします。
	 *
	 * @param import_file	インポートする文書ファイルのパス (CIO 形式、拡張子 .xml を仮定します)
	 * @param parent_id		親フォルダの ID
	 * @param creator_id	作成者のユーザ ID
	 * @param import_name	インポートしたファイルにつける名前。
	 *						ただし、次の場合には、ファイル名は修正されることがあります。
	 *						1. ファイル名として無効な文字が含まれていた場合
	 *						2. ファイル名が既存ファイルと重複していた場合
	 * @return file_id		作成されたファイルの ID を返します。
	 *						何らかの理由で失敗した場合は 0 を返します。
	 */
	public function import_file($import_file, $parent_id, $creator_id, $import_name) {

		$this->load->model('doc_model');

		// インポート先のファイル名をサニタイズします。
		$import_name = $this->sanitize_filename($import_name);

		// インポート先のファイル名が空なら、デフォルトのファイル名を付けます。
		if ($import_name == '') {
			$import_name = 'アップロードされたファイル';
		}

		// ファイル名が重複しないようにします。
		$import_name = $this->create_unique_filename($parent_id, $import_name);

		// 現在時刻を取得します。
		$now = ch_current_time_string();

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// 文書を作成します。
			$doc_id = $this->doc_model->import_doc($import_file);
			if ($doc_id == 0) {
				throw new Exception('変換後の文書ファイルが読み取れません。');
			}

			// 現在時刻を取得します。
			$now = ch_current_time_string();

			// ファイルを作成します。
			$file = array(
				'name'				=> $import_name,
				'type'				=> 1,			// 通常ファイル
				'parent_id'			=> $parent_id,
				'creator_id'		=> $creator_id,
				'doc_id'			=> $doc_id,
				'edit_session_id'	=> NULL,
				'created_at'		=> $now,
				'updated_at'		=> $now,
			);
			$this->db->insert('t_file', $file);
			$file_id = $this->db->insert_id();

			// トランザクションをコミットします。
			$this->db->trans_commit();

			// 戻り値を返します。
			return $file_id;
		}
		catch (Exception $ex) {

			// トランザクションをロールバックします。
			$this->db->trans_rollback();
			return 0;
		}
	}

	/**
	 * 指定されたファイルを物理ファイルにエクスポートします。
	 */
	public function export_file($file_id, $filename) {

		// ファイル レコードを取得します。
		$file = $this->get_file($file_id);
		if (! $file) return FALSE;

		// 文書をエクスポートします。
		$this->load->model('doc_model');
		return $this->doc_model->export_doc($file['doc_id'], $filename);
	}

	/**
	 * 指定されたフォルダ内に、指定された名前のファイル/フォルダが存在すれば、
	 * その t_file レコードを取得します。存在しなければ NULL 返します。
	 */
	public function get_folder_file_of_name($folder_id, $file_name) {

		// フォルダ内の第１階層の子ファイル群を取得します。
		$child_list = $this->get_folder_files($folder_id);

		// 子ファイルを列挙します。
		foreach ($child_list as $child) {
			if ($child['name'] === $file_name) {
				return $child;
			}
		}
		return NULL;
	}

	/**
	 * 指定されたフォルダ内に、指定された名前のファイル/フォルダが存在するか確認します。
	 * 存在する場合はその t_file レコードを返します。
	 * 存在しない場合は FALSE を返します。
	 */
	public function folder_has_same_file_name($folder_id, $file_name) {
		$file = $this->get_folder_file_of_name($folder_id, $file_name);
		return ($file !== NULL);
	}

	/**
	 * フォルダの子孫として、指定されたファイルを含んでいるか確認します。
	 */
	public function folder_contains_descendant_file($folder_id, $file_id) {

		// ファイルを取得します。
		$file = $this->get_file($file_id);

		// ファイルの親フォルダをたどって行きます。
		while (1) {

			// ファイル 2 の親フォルダが NULL なら、FALSE を返します。
			$parent_id = $file['parent_id'];
			if ($parent_id == NULL) return FALSE;

			// ファイル 2 の親フォルダがファイル 1 に一致するなら、TRUE を返します。
			if ($parent_id == $folder_id) return TRUE;

			// ファイル 2 の親を繰り返したどります。
			$file = $this->get_file($parent_id);
		}
	}

	/**
	 * ファイルを指定されたフォルダに移動します。
	 */
	public function move_file($file_id, $new_parent_id) {

		// ファイルの親フォルダを変更します。
		$file_record = array(
			'parent_id'		=> $new_parent_id,
		);
		$this->db->where('id', $file_id);
		$this->db->update('t_file', $file_record);

		// ファイル ID に関連付けられたキャッシュを消去します。
		$this->clear_file_cache($file_id);
	}

	/**
	 * ファイルを指定されたフォルダにコピーします。
	 *
	 * フォルダのコピーはできません。
	 *
	 * トランザクションは呼び出し側でかけてください。
	 */
	public function copy_file($file_id, $parent_id) {

		$file = $this->get_file($file_id);
		$parent = $this->get_file($parent_id);

		if (! $file || ! $parent || $file['type'] != 1 || $parent['type'] != 2) {
			return 0;
		}

		// 文書をコピーします。
		$this->load->model('doc_model');
		$doc_id = $this->doc_model->copy_doc($file['doc_id']);
		if ($doc_id == 0) return 0;

		// レコードをコピーします。
		$new_file = $file;
		unset($new_file['id']);
		unset($new_file['edit_session_id']);

		// 親フォルダ内で重複しないファイル名を作成します。
		$new_file['name'] = $this->create_unique_filename($parent_id, $file['name']);

		// 親フォルダを設定します。
		$new_file['parent_id'] = $parent_id;

		// 文書 ID を設定します。
		$new_file['doc_id'] = $doc_id;

		// ファイル レコードを登録します。
		$this->db->insert('t_file', $new_file);
		$new_file_id = $this->db->insert_id();

		return $new_file_id;
	}

	/**
	 * ファイルを論理削除します。
	 */
	public function delete_file($file_id) {

		// 現在時刻を取得します。
		$now = ch_current_time_string();

		// ファイルの論理削除フラグを変更します。
		$file_record = array(
			'deleted_at'	=> $now,
		);
		$this->db->where('id', $file_id);
		$this->db->update('t_file', $file_record);

		// ファイル ID に関連付けられたキャッシュを消去します。
		$this->clear_file_cache($file_id);
	}

	/**
	 * ファイルを名前変更します。
	 */
	public function rename_file($file_id, $new_name) {

		// 現在時刻を取得します。
		$now = ch_current_time_string();

		// ファイルの名前を変更します。
		$file_record = array(
			'name'			=> $new_name,
		);
		$this->db->where('id', $file_id);
		$this->db->update('t_file', $file_record);

		// ファイル ID に関連付けられたキャッシュを消去します。
		$this->clear_file_cache($file_id);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 編集中セッション ID

	/**
	 * ファイルの編集中セッション ID を変更します。
	 */
	public function file_update_edit_session_id($file_id, $edit_session_id) {

		// ファイルの名前を変更します。
		$file_record = array(
			'edit_session_id' => $edit_session_id,
		);
		$this->db->where('id', $file_id);
		$this->db->update('t_file', $file_record);

		// ファイル ID に関連付けられたキャッシュを消去します。
		$this->clear_file_cache($file_id);
	}

	/**
	 * 指定されたセッション ID によって編集中になっているファイルを
	 * 編集解除します。
	 */
	public function file_clear_edit_session_id($session_id) {

		// ファイルの編集中セッション ID を NULL に設定します。
		$file_record = array(
			'edit_session_id' => NULL,
		);
		$this->db->where('edit_session_id', $session_id);
		$this->db->update('t_file', $file_record);

		// すべてのキャッシュを消去します。
		$this->clear_file_cache();
	}

	/**
	 * ファイル レコード中の編集中セッション ID をユーザー レコードに変換します。
	 *
	 * ファイル レコード中の edit_session_id フィールドに値が設定されている場合、
	 * そのセッションのユーザー レコードを取得して、
	 * edit_user フィールドに設定します。
	 *
	 * ファイル レコード中の edit_session_id フィールドに値が設定されていない場合、
	 * edit_user フィールドに NULL を設定します。
	 *
	 * いずれの場合も、edit_session_id フィールドは削除されます。
	 */
	public function convert_edit_session_id(& $file) {

		$edit_session_id = $file['edit_session_id'];
		if ($edit_session_id) {
			$user = $this->login->get_user_of_session_id($edit_session_id);
		}
		else {
			$user = NULL;
		}

		$file['edit_user'] = $user;
		unset($file['edit_session_id']);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 更新日時

	public function update_file_updated_at($file_id) {

		// updated_at フィールドを更新します。
		$this->db->set('updated_at', 'NOW()', FALSE);
		$this->db->where('id', $file_id);
		$this->db->update('t_file');

		// ファイル ID に関連付けられたキャッシュを消去します。
		$this->clear_file_cache($file_id);
	}

}
