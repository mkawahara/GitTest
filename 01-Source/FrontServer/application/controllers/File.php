<?php

/**
 * ファイルを操作する API のコントローラです。
 */
class File extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('file_model');
		$this->load->model('access_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}


	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの情報

	public function tree() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのユーザー専用ドライブが存在しなければ作成します。
		// また、所属するすべてのグループについて、
		// そのグループ専用ドライブが存在しなければ作成します。
		$this->file_model->create_user_and_group_drive_if_not_exists();

		// ログイン ユーザーまたは所属グループがアクセス可能なドライブを
		// すべて取得します。
		$drive_list = $this->file_model->get_drives_of_user_accessible(FALSE);

		// ドライブにファイル ツリーを関連付けます。
		$this->file_model->attach_drives_file_trees($drive_list);

		// レスポンスを返します。
		$response = ch_create_response();
		$response['drives'] = $drive_list;
		ch_send_response($response);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの存在確認

	public function exists() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を取得します。
		$parent_id_string 	= $this->input->post_get('parent_id');
		$file_name	 		= $this->input->post_get('file_name');

		// パラメータが不足していないか確認します。
		if ($parent_id_string == '' || $file_name == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$parent_id = intval($parent_id_string);
		$file_name = $this->file_model->sanitize_filename($file_name);

		// パラメータが適切であるか確認します。
		$param_valid = ($parent_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($parent_id)) return;

		// 指定された名前のファイル/フォルダが存在するか確認します。
		$exists = $this->file_model->folder_has_same_file_name($parent_id, $file_name);

		// レスポンスを返します。
		$response = ch_create_response();
		$response['exists'] = $exists;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの作成

	public function create() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を取得します。
		$type_string 		= $this->input->post_get('type');
		$parent_id_string 	= $this->input->post_get('parent_id');
		$name 				= $this->input->post_get('name');		// オプション

		// パラメータが不足していないか確認します。
		if ($type_string == '' || $parent_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$type		= intval($type_string);
		$parent_id	= intval($parent_id_string);

		// 文書名をサニタイズします。
		$name = $this->file_model->sanitize_filename($name);

		// パラメータが適切であるか確認します。
		$param_valid = ($type == 1 || $type == 2) && ($parent_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		$user_id = $this->login->user_id();

		// フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($parent_id)) return;

		// ファイル、または、フォルダを作成します。
		$voice_server_success = TRUE;
		if ($type == 1) {
			list($file_id, $file_name, $doc_id) = $this->file_model->create_file($parent_id, $user_id, $name);
			$voice_server_success = $this->set_doc_settings($doc_id);
		}
		else if ($type == 2) {
			list($file_id, $file_name, $doc_id) = $this->file_model->create_folder($parent_id, $user_id, $name);
		}

		// 音声サーバーとの通信に失敗した場合は、エラー コード 800 を返しますが、
		// レスポンスの情報は成功レスポンスと同じものを返します。
		if ($voice_server_success) {
			$response = ch_create_response();
		}
		else {
			$response = ch_create_response(CH_ERROR_VOICE_SERVER);
			// この場合は error_detail の設定は不要です。
		}

		// レスポンスを返します。
		$response['id'] = $file_id;
		$response['name'] = $file_name;
		$response['doc_id'] = $doc_id;
		ch_send_response($response);
		return;
	}

	/**
	 * 文書の文書辞書、音声設定、変換設定をデフォルト値に設定します。
	 * デフォルト値はまずユーザー設定からデフォルト値を取得し、
	 * それが空であれば、音声サーバーに問い合わせます。
	 * 音声サーバーとの通信エラーがあれば、このメソッドは FALSE を返しますが、
	 * 処理は続行されます。
	 *
	 * @return $voice_server_success	音声サーバーとの通信に成功した、または、
	 *									通信が発生しなかった場合に TRUE になります。
	 */
	private function set_doc_settings($doc_id) {

		$this->load->model('user_info_model');
		$this->load->model('voice_model');

		// 音声サーバーとの通信成功フラグを初期化します。
		// (音声サーバーとの通信が発生しない場合も成功とみなします)
		$voice_server_success = TRUE;

		// ユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// 文書辞書を設定します。
		{
			// ユーザー設定のデフォルト辞書を取得します。
			// 【実装メモ】2015年10月24日の仕様変更により、
			// 文書辞書はユーザー設定を参照しないことになりました。
			//$dictionary = $this->user_info_model->get_default_dictionary($user_id);
			$dictionary = '';

			// ユーザー設定のデフォルト辞書が存在しない場合
			if ($dictionary == '') {

				// 音声サーバーのデフォルト辞書を取得します。
				try {
					$dictionary = $this->voice_model->get_default_dictionary();
				}
				catch (VoiceServerException $ex) {
					$voice_server_success = FALSE;
				}
			}

			// 文書辞書が取得できたなら、文書レコードを更新します。
			if ($dictionary != '') {
				$this->doc_model->set_dictionary($doc_id, $dictionary);
			}
		}

		// 音声設定を設定します。
		{
			// ユーザー設定のデフォルト音声設定を取得します。
			$voice_setting = $this->user_info_model->get_default_voice_setting($user_id);

			// ユーザー設定のデフォルト音声設定が存在しない場合
			if ($voice_setting == '') {

				// 音声サーバーのデフォルト音声設定を取得します。
				try {
					$voice_setting = $this->voice_model->get_default_voice_setting();
				}
				catch (VoiceServerException $ex) {
					$voice_server_success = FALSE;
				}
			}

			// 音声設定が取得できたなら、文書レコードを更新します。
			if ($voice_setting != '') {
				$this->doc_model->set_voice_setting($doc_id, $voice_setting);
			}
		}

		// 変換設定を設定します。
		{
			// ユーザー設定のデフォルト変換設定を取得します。
			$convert_setting = $this->user_info_model->get_default_convert_setting($user_id);

			// ユーザー設定のデフォルト変換設定が存在しない場合
			if ($convert_setting == '') {

				// 音声サーバーのデフォルト変換設定を取得します。
				try {
					$convert_setting = $this->voice_model->get_default_convert_setting();
				}
				catch (VoiceServerException $ex) {
					$voice_server_success = FALSE;
				}
			}

			// 変換設定が取得できたなら、文書レコードを更新します。
			if ($convert_setting != '') {
				$this->doc_model->set_convert_setting($doc_id, $convert_setting);
			}
		}

		return $voice_server_success;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの移動

	public function move() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$file_id_string			= $this->input->post_get('id');
		$old_parent_id_string 	= $this->input->post_get('old_parent_id');
		$new_parent_id_string 	= $this->input->post_get('new_parent_id');
		$force_string 			= $this->input->post_get('force');

		// パラメータが不足していないか確認します。
		if ($file_id_string == '' ||
			$old_parent_id_string == '' ||
			$new_parent_id_string == '' ||
			$force_string == '')
		{
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$file_id 		= intval($file_id_string);
		$old_parent_id 	= intval($old_parent_id_string);
		$new_parent_id 	= intval($new_parent_id_string);
		$force 			= ch_string_to_bool($force_string, NULL);

		// パラメータが適切であるか確認します。
		$param_valid = ($file_id > 0) && ($old_parent_id > 0) && ($new_parent_id > 0) && is_bool($force);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($file_id);
		$drive = $this->file_model->get_drive_of_file($file_id);

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// ドライブにロックをかけます。
			// (トランザクション終了時にアンロックされます)
			$this->file_model->lock_drive($drive['id']);

			// 移動処理を行います。
			$success = $this->move_within_transaction($file_id, $old_parent_id, $new_parent_id, $force);

			if (! $success) {
				// トランザクションをロールバッックします。
				$this->db->trans_rollback();
				return;
			}

			// トランザクションをコミットします。
			$this->db->trans_commit();
		}
		catch (Exception $ex) {
			// トランザクションをロールバッックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	private function move_within_transaction($file_id, $old_parent_id, $new_parent_id, $force) {

		// ファイルが存在するか、アクセス可能か、編集中ではないか、を確認します。
		if (! $this->access_model->is_accessible_file($file_id)) return FALSE;

		// フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($old_parent_id)) return FALSE;
		if (! $this->access_model->is_accessible_folder($new_parent_id)) return FALSE;

		// ファイルを取得します。
		$file = $this->file_model->get_file($file_id);

		// 対象ファイルがフォルダである場合、ルート フォルダでないか、確認します。★エラーコードは暫定★
		if ($file['type'] == 2 && $file['parent_id'] == NULL) {
			$response = ch_create_response(500, 'ルート フォルダは移動できません。');
			ch_send_response($response);
			return FALSE;
		}

		// force==FALSE の場合、移動先フォルダ内に重複するファイル名が存在しないか確認します。
		if (! $force) {
			if ($this->file_model->folder_has_same_file_name($new_parent_id, $file['name'])) {
				$response = ch_create_response(300, '移動先フォルダ内でファイル名が重複しています。');
				ch_send_response($response);
				return FALSE;
			}
		}

		// 移動元と移動先のフォルダが同じでないか、確認します。★エラーコードは暫定★
		if ($old_parent_id === $new_parent_id) {
			$response = ch_create_response(600, '移動元と移動先のフォルダが同じです。');
			ch_send_response($response);
			return FALSE;
		}

		// 対象ファイルがフォルダである場合、その下に移動先がないか、確認します。★エラーコードは暫定★
		if ($this->file_model->folder_contains_descendant_file($file_id, $new_parent_id)) {
			$response = ch_create_response(700, '移動するフォルダの中に移動先のフォルダがあります。');
			ch_send_response($response);
			return FALSE;
		}

		// 実際に移動を行います。
		$this->file_model->move_file($file_id, $new_parent_id);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);

		return TRUE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの削除

	public function delete() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$file_id_string			= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($file_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$file_id 		= intval($file_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($file_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($file_id);
		$drive = $this->file_model->get_drive_of_file($file_id);
		if (! $file) {
			$response = ch_create_response(100, 'ファイルがありません。');
			ch_send_response($response);
			return;
		}

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// ドライブにロックをかけます。
			// (トランザクション終了時にアンロックされます)
			$this->file_model->lock_drive($drive['id']);

			// 削除処理を行います。
			$success = $this->delete_within_transaction($file_id);

			if (! $success) {
				// トランザクションをロールバッックします。
				$this->db->trans_rollback();
				return;
			}

			// トランザクションをコミットします。
			$this->db->trans_commit();
		}
		catch (Exception $ex) {
			// トランザクションをロールバッックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	private function delete_within_transaction($file_id) {

		// ファイルが存在するか、アクセス可能か、編集中ではないか、を確認します。
		if (! $this->access_model->is_accessible_file($file_id)) return FALSE;

		// ルート フォルダでははないか、確認します。★エラーコードは暫定★
		$file = $this->file_model->get_file($file_id);
		if ($file['type'] == 2 && $file['parent_id'] == NULL) {
			$response = ch_create_response(500, 'ルート フォルダは削除できません。');
			ch_send_response($response);
			return FALSE;
		}

		// ファイルの削除を実行します。
		$this->file_model->delete_file($file_id);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);

		return TRUE;
	}


	//////////////////////////////////////////////////////////////////////////////
	//// ファイルの名前変更

	public function rename() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$file_id_string		= $this->input->post_get('id');
		$old_name			= $this->input->post_get('old_name');
		$new_name			= $this->input->post_get('new_name');

		// パラメータが不足していないか確認します。
		if ($file_id_string == '' || $old_name == '' || $new_name == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$file_id 	= intval($file_id_string);
		$old_name = $this->file_model->sanitize_filename($old_name);
		$new_name = $this->file_model->sanitize_filename($new_name);

		// パラメータが適切であるか確認します。
		$param_valid = ($file_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($file_id);
		$drive = $this->file_model->get_drive_of_file($file_id);
		if (! $file) {
			$response = ch_create_response(100, 'ファイルがありません。');
			ch_send_response($response);
			return;
		}

		// ルート フォルダの名前変更は、エラーにします。
		if ($file['parent_id'] === NULL) {
			$response = ch_create_response(401, 'マイドキュメント フォルダの名称は変更できません。');
			ch_send_response($response);
			return;
		}

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// ドライブにロックをかけます。
			// (トランザクション終了時にアンロックされます)
			$this->file_model->lock_drive($drive['id']);

			// 名前変更処理を行います。
			$success = $this->rename_within_transaction($file_id, $old_name, $new_name);

			if (! $success) {
				// トランザクションをロールバッックします。
				$this->db->trans_rollback();
				return;
			}

			// トランザクションをコミットします。
			$this->db->trans_commit();
		}
		catch (Exception $ex) {
			// トランザクションをロールバッックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	private function rename_within_transaction($file_id, $old_name, $new_name) {

		// ファイルが存在するか、アクセス可能か、編集中ではないか、を確認します。
		if (! $this->access_model->is_accessible_file($file_id)) return FALSE;

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($file_id);
		$drive = $this->file_model->get_drive_of_file($file_id);

		// 元のファイル名がすでに変更されていないか、確認します。
		if ($file['name'] !== $old_name) {
			$response = ch_create_response(200, '元のファイル名がすでに変更されています。');
			ch_send_response($response);
			return;
		}

		// フォルダ内でファイル名が重複していないか確認します。
		if ($this->file_model->folder_has_same_file_name($file['parent_id'], $new_name)) {
			$response = ch_create_response(300, 'フォルダ内でファイル名が重複しています。');
			ch_send_response($response);
			return;
		}

		// ファイルの名前変更を実行します。
		$this->file_model->rename_file($file_id, $new_name);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['name'] = $new_name;   // サニタイズ後のファイル名を返します。
		ch_send_response($response);

		return TRUE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルのコピー

	public function copy() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$file_id_string		= $this->input->post_get('id');
		$parent_id_string 	= $this->input->post_get('parent_id');
		$force		 		= $this->input->post_get('force');

		// パラメータが不足していないか確認します。
		if ($file_id_string == '' ||
			$parent_id_string == '' ||
			$force == '')
		{
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$file_id 	= intval($file_id_string);
		$parent_id 	= intval($parent_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($file_id > 0) && ($parent_id > 0) &&
						($force === 'yes' || $force === 'rename' || $force === 'cancel');
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($file_id);
		$drive = $this->file_model->get_drive_of_file($file_id);

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// ドライブにロックをかけます。
			// (トランザクション終了時にアンロックされます)
			$this->file_model->lock_drive($drive['id']);

			// コピー処理を行います。
			$success = $this->copy_within_transaction($file_id, $parent_id, $force);

			if (! $success) {
				// トランザクションをロールバッックします。
				$this->db->trans_rollback();
				return;
			}

			// トランザクションをコミットします。
			$this->db->trans_commit();
		}
		catch (Exception $ex) {
			// トランザクションをロールバッックします。
			$this->db->trans_rollback();
			throw $ex;
		}
	}

	private function copy_within_transaction($file_id, $parent_id, $force) {

		// ファイルが存在するか、アクセス可能か、編集中ではないか、を確認します。
		if (! $this->access_model->is_accessible_file($file_id)) return FALSE;

		// フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($parent_id)) return FALSE;

		// ファイルを取得します。
		$file = $this->file_model->get_file($file_id);

		// 対象ファイルがフォルダの場合は、コピーできません。★現在の仕様として★
		if ($file['type'] == 2) {
			$response = ch_create_response(500, 'フォルダはコピーできません。');
			ch_send_response($response);
			return FALSE;
		}

		// 対象ファイルがフォルダである場合、ルート フォルダでないか、確認します。★エラーコードは暫定★
		if ($file['type'] == 2 && $file['parent_id'] == NULL) {
			$response = ch_create_response(500, 'ルート フォルダはコピーできません。');
			ch_send_response($response);
			return FALSE;
		}

		// コピー先フォルダ内に重複するファイル名が存在しないか確認します。
		$file_with_same_name = $this->file_model->get_folder_file_of_name($parent_id, $file['name']);

		// force=='cancel' の場合、コピー先フォルダ内に重複するファイル名が存在すれば、エラーにします。
		if ($force === 'cancel' && $file_with_same_name) {
			$response = ch_create_response(300, 'コピー先フォルダ内でファイル名が重複しています。');
			ch_send_response($response);
			return FALSE;
		}

		// コピー元とコピー先のフォルダが同じでないか、確認します。★エラーコードは暫定★
		if ($file_id === $parent_id) {
			$response = ch_create_response(600, 'コピー元とコピー先のフォルダが同じです。');
			ch_send_response($response);
			return FALSE;
		}

		// 対象ファイルがフォルダである場合、その下にコピー先がないか、確認します。★エラーコードは暫定★
		if ($this->file_model->folder_contains_descendant_file($file_id, $parent_id)) {
			$response = ch_create_response(700, 'コピーするフォルダの中にコピー先のフォルダがあります。');
			ch_send_response($response);
			return FALSE;
		}

		// force=='yes' の場合、コピー先フォルダ内に重複するファイル名が存在すれば、先にそれを論理削除します。
		if ($force === 'yes' && $file_with_same_name) {
			$this->file_model->delete_file($file_with_same_name['id']);
		}

		// 実際にコピーを行います。
		$new_file_id = $this->file_model->copy_file($file_id, $parent_id, $force);

		// コピーしたファイルの情報を取得します。
		$new_file = $this->file_model->get_file($new_file_id);

		// 編集中セッション ID をユーザー オブジェクトに変換します。
		$this->file_model->convert_edit_session_id($new_file);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['file'] = $new_file;
		ch_send_response($response);

		return TRUE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルのインポート

	public function import() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$upload_file 		= ch_array_get($_FILES, 'file');
		$parent_id_string 	= $this->input->post_get('parent_id');

		// $upload_file を、実際の一時ファイルに変換します。
		// 一時ファイルが有効でなければ、空文字列に設定します。
		$temp_file = '';
		if ($upload_file) {
			$temp_file = $upload_file['tmp_name'];
			if (! is_uploaded_file($temp_file)) {
				$temp_file = '';
			}
		}

		// パラメータが不足していないか確認します。
		if ($temp_file == '' || $parent_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$parent_id = intval($parent_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = file_exists($temp_file) && ($parent_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($parent_id)) return;

		// タスク ID を作成します。
		$user_id = $this->login->user_id();
		$task_id = ch_task_id_create($user_id);

		// 一時ファイルをインポート用フォルダに移動します。
		$import_file = ch_task_file($task_id, '.imlx');
		move_uploaded_file($temp_file, $import_file);

		// インポート名を作成します。
		$import_name = ch_basename( $upload_file['name'] );
		$import_name = ch_replace_extension($import_name, '');		// 拡張子は削除します
		$import_name = $this->file_model->sanitize_filename( $import_name );
		if ($import_name == '') {
			$import_name = 'インポートされた文書';
		}

		// 作成者 ID を取得します。
		$creator_id = $this->login->user_id();

		// PHP の実行ファイルのパスを取得します。
		// (application/config/cnofig.php で設定した値です)
		$php_executable = $this->config->item('php_executable');

		// 変換のコマンドライン引数を作成します。
		$args = array(
			'task_id'		=> $task_id,
			'parent_id'		=> $parent_id,
			'creator_id'	=> $creator_id,
			'import_name'	=> $import_name,
		);

		// PHP CLI によるメソッド呼び出しの引数を作成します。
		$command = array(
			'"'.$php_executable.'"',
			'"'.FCPATH.'index.php"',
			'file',
			'import_cli',
			base64_url_encode(json_encode($args))
		);
		$command = implode(' ', $command);

		// 変換を行います。
		// インポートには長時間かかる可能性があるため、
		// PHP CLI 経由で非同期実行します。
		ch_background_process_invoke($command);

		// レスポンスを返します。
		$response = ch_create_response();
		$response['task_id'] = $task_id;
		ch_send_response($response);
		return;
	}

	/**
	 * ファイルのインポート処理を行います。
	 * 長時間かかる可能性があるタスクであるため、
	 * PHP CLI から呼び出す仕様としています。
	 *
	 * $args_json_base64 引数は、次の連想配列の JSON の BASE64 エンコードした文字列です。
	 *
	 * - task_id		タスク ID
	 * - parent_id		インポート先の親フォルダ ID
	 * - creator_id		作成者のユーザ ID
	 * - import_name	インポート先のファイル名
	 */
	public function import_cli($args_json_base64) {

		// HTTP 経由で呼び出された場合は、何もしません。
		if (! is_cli()) return;

		// パラメータを取得します。
		$args = json_decode(base64_url_decode($args_json_base64), TRUE);
		$task_id 		= $args['task_id'];
		$parent_id 		= $args['parent_id'];
		$creator_id 	= $args['creator_id'];
		$import_name 	= $args['import_name'];

		// タスク ID から入力ファイル名、出力ファイル名、終了ファイル名を作成します。
		$input_file  = ch_task_file($task_id, '.imlx');
		$output_file = ch_task_file($task_id, '.xml');
		$final_file  = ch_task_file($task_id, '.fin');

		// 変換します。
		$status = ch_convert_imlx_cio($input_file);

		// 変換に失敗した場合は、0 を終了ファイルに書き込み、終了します。
		if ($status != 0) {
			file_put_contents($final_file, 0);
			return;
		}

		// 変換後のファイルをデータベースにインポートします。
		$file_id = $this->file_model->import_file($output_file, $parent_id, $creator_id, $import_name);

		// データベースのインポートまで完了したので、
		// 終了ファイルにファイル ID を書き込みます。
		file_put_contents($final_file, $file_id);

		// 入力ファイル、出力ファイルは削除します。
		// (終了ファイルは状況確認のため削除しません。)
		@unlink($input_file);
		@unlink($output_file);
		@unlink(ch_replace_extension($output_file, '.dic.xml'));
		@unlink(ch_replace_extension($output_file, '.anime.xml'));
	}

	/**
	 * インポート状況を確認します。
	 */
	public function importinfo() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$task_id 	= $this->input->post_get('task_id');

		// パラメータが不足していないか確認します。
		if ($task_id == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		$param_valid = ch_task_id_is_valid($task_id);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID からユーザー ID を取得します。
		$task_user_id = ch_task_id_get_user_id($task_id);

		// タスク ID のユーザー ID が、ログイン ユーザー ID と異なる場合は、エラーとします。
		if ($task_user_id != $this->login->user_id()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// タスク ID から終了ファイル名を作成します。
		$final_file  = ch_task_file($task_id, '.fin');

		// 【仕様メモ】
		// 以下の仕様は未確定なので、実装していません。
		// ・終了ファイル (.fin) はいつ削除するのか。
		// ・ファイルシステムの性能向上のために task フォルダ以下をユーザーごとに階層化したほうがよいのでは。
		// ・タスク ID が不正であった場合の対処

		// 終了ファイルが存在する場合
		if (file_exists($final_file)) {

			// 終了ファイルから、ファイル ID を取得します。
			// (変換に失敗した場合は $file_id = 0 になるので、$file = NULL になります)
			$file_id = intval( file_get_contents($final_file) );
			$file = $this->file_model->get_file($file_id);
			if ($file) {
				unset($file['edit_session_id']);
			}

			// 完了レスポンスを作成します。
			$response = ch_create_response();
			$response['finished'] = true;
			$response['file'] = $file;

			// 変換に失敗している場合は、エラーコードとメッセージを設定します。
			if (! $file) {
				$response['error_code'] = 500;
				$response['message'] = '変換に失敗しました。';
			}

			ch_send_response($response);
			return;
		}
		// 終了ファイルが存在しない場合
		else {

			// 未完了レスポンスを返します。
			$response = ch_create_response();
			$response['finished'] = FALSE;
			ch_send_response($response);
			return;
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイルのエクスポート

	public function export() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$file_id_string 	= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($file_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$file_id = intval($file_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($file_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ファイルが存在するか、アクセス可能か、編集中ではないか、を確認します。
		if (! $this->access_model->is_accessible_file($file_id)) return FALSE;

		// タスク ID を作成します。
		$user_id = $this->login->user_id();
		$task_id = ch_task_id_create($user_id);

		// PHP の実行ファイルのパスを取得します。
		// (application/config/cnofig.php で設定した値です)
		$php_executable = $this->config->item('php_executable');

		// 変換のコマンドライン引数を作成します。
		$args = array(
			'task_id'		=> $task_id,
			'file_id'		=> $file_id,
		);

		// PHP CLI によるメソッド呼びだしの引数を作成します。
		$command = array(
			'"'.$php_executable.'"',
			'"'.FCPATH.'index.php"',
			'file',
			'export_cli',
			base64_url_encode(json_encode($args))
		);
		$command = implode(' ', $command);

		// 変換を行います。
		// インポートには長時間かかる可能性があるため、
		// PHP CLI 経由で非同期実行します。
		ch_background_process_invoke($command);

		// レスポンスを返します。
		$response = ch_create_response();
		$response['task_id'] = $task_id;
		ch_send_response($response);
		return;
	}

	/**
	 * ファイルのエクスポート処理を行います。
	 * 長時間かかる可能性があるタスクであるため、
	 * PHP CLI から呼び出す仕様としています。
	 *
	 * $args_json_base64 引数は、次の連想配列の JSON の BASE64 エンコードした文字列です。
	 *
	 * - task_id		タスク ID
	 * - file_id		エクスポートするファイルの ID
	 */
	public function export_cli($args_json_base64) {

		// HTTP 経由で呼び出された場合は、何もしません。
		if (! is_cli()) return;

		// パラメータを取得します。
		$args = json_decode(base64_url_decode($args_json_base64), TRUE);
		$task_id 	= $args['task_id'];
		$file_id 	= $args['file_id'];

		// タスク ID から入力ファイル名を作成します。
		$cio_file	= ch_task_file($task_id, '.xml');
		$imlx_file	= ch_task_file($task_id, '.imlx');
		$final_file	= ch_task_file($task_id, '.fin');

		// データベースに格納されている文書を、CIO 形式ファイルにエクスポートします。
		$success = $this->file_model->export_file($file_id, $cio_file);

		// エクスポートに失敗した場合は、0 を終了ファイルに書き込み、終了します。
		if (! $success) {
			file_put_contents($final_file, 0);
			return;
		}

		// CIO 形式を IMLX 形式に変換します。
		$status = ch_convert_imlx_cio($cio_file);

		// 変換に失敗した場合は、0 を終了ファイルに書き込み、終了します。
		if ($status != 0) {
			file_put_contents($final_file, 0);
			return;
		}

		// エクスポート処理がすべて完了したので、
		// 終了ファイルにファイル ID を書き込みます。
		file_put_contents($final_file, $file_id);

		// 一時的に作成した CIO 形式ファイルは削除します。
		// (終了ファイルは状況確認のため削除しません。)
		@unlink($cio_file);
	}

	/**
	 * エクスポート状況を確認します。
	 */
	public function exportinfo() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$task_id 	= $this->input->post_get('task_id');

		// パラメータが不足していないか確認します。
		if ($task_id == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		$param_valid = ch_task_id_is_valid($task_id);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID からユーザー ID を取得します。
		$task_user_id = ch_task_id_get_user_id($task_id);

		// タスク ID のユーザー ID が、ログイン ユーザー ID と異なる場合は、エラーとします。
		if ($task_user_id != $this->login->user_id()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// タスク ID から終了ファイル名を作成します。
		$final_file  = ch_task_file($task_id, '.fin');

		// 【仕様メモ】
		// 以下の仕様は未確定なので、実装していません。
		// ・終了ファイル (.fin) はいつ削除するのか。
		// ・ファイルシステムの性能向上のために task フォルダ以下をユーザーごとに階層化したほうがよいのでは。
		// ・タスク ID が不正であった場合の対処。

		// 終了ファイルが存在する場合、処理は完了しています。
		$file = NULL;
		if (file_exists($final_file)) {

			// 終了ファイルから、ファイル ID を取得します。
			// (変換に失敗した場合は $file_id = 0 になるので、$file = NULL になります)
			$file_id = intval( file_get_contents($final_file) );
			$file = $this->file_model->get_file($file_id);

			// 処理が完了して、成功している場合
			if ($file) {

				// ダウンロード用 URL を作成します。
				$url = base_url('file/exportdownload?task_id='.$task_id);

				// 完了レスポンスを返します。
				$response = ch_create_response();
				$response['finished'] = true;
				$response['url'] = $url;
				ch_send_response($response);
				return;
			}
			// 処理は完了したが、失敗している場合
			else {
				// 失敗レスポンスを返します。
				$response = ch_create_response(500, '変換に失敗しました。');
				$response['finished'] = true;
				ch_send_response($response);
				return;
			}
		}
		else {

			// 未完了レスポンスを返します。
			$response = ch_create_response();
			$response['finished'] = FALSE;
			$response['url'] = NULL;
			ch_send_response($response);
			return;
		}
	}

	/**
	 * エクスポート状況を確認します。
	 */
	public function exportdownload() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$task_id 	= $this->input->post_get('task_id');

		// パラメータが不足していないか確認します。
		if ($task_id == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		$param_valid = ch_task_id_is_valid($task_id);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID からユーザー ID を取得します。
		$task_user_id = ch_task_id_get_user_id($task_id);

		// タスク ID のユーザー ID が、ログイン ユーザー ID と異なる場合は、エラーとします。
		if ($task_user_id != $this->login->user_id()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// タスク ID から IMLX ファイル名を作成します。
		$imlx_file  = ch_task_file($task_id, '.imlx');
		$final_file  = ch_task_file($task_id, '.fin');

		// IMLX ファイルが存在しなければ、エラーにします。
		if (! file_exists($imlx_file) || ! file_exists($final_file)) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ファイル ID を取得します。
		$file_id = intval( file_get_contents($final_file) );
		$file = $this->file_model->get_file($file_id);

		// ファイル レコードが存在しなければ、エラーにします。
		if (! $file) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ダウンロード用のファイル名を作成します。
		$download_file = $file['name'].'.imlx';

		// ダウンロードさせます。
		@ob_clean();
		header("Content-type: application/binary");
		header("Content-Disposition: attachment; filename=".$download_file);
		readfile($imlx_file);
		@ob_flush();
	}

}
