<?php

/**
 * 文書を操作する API のコントローラです。
 */
class Doc extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('file_model');
		$this->load->model('doc_model');
		$this->load->model('access_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 文書のファイル情報取得

	public function file() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id 	= intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイルを取得します。
		$doc  = $this->doc_model->get_doc($doc_id);
		$file = $this->file_model->get_file_of_doc($doc_id);

		// 編集中セッション ID をユーザー オブジェクトに変換します。
		$this->file_model->convert_edit_session_id($file);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['file'] = $file;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の編集開始

	public function beginedit() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id 	= intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイル、ドライブを取得します。
		$doc   = $this->doc_model->get_doc($doc_id);
		$file  = $this->file_model->get_file_of_doc($doc_id);
		$drive = $this->file_model->get_drive_of_file($file['id']);

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// ドライブにロックをかけます。
			// (トランザクション終了時にアンロックされます)
			$this->file_model->lock_drive($drive['id']);

			// 編集開始処理を行います。
			$success = $this->beginedit_within_transaction($doc_id);

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

	private function beginedit_within_transaction($doc_id) {

		// アクセス権等をチェックします。
		// (ドライブ ロック後に再度チェックする必要があります)
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイル、ドライブを取得します。
		$doc   = $this->doc_model->get_doc($doc_id);
		$file  = $this->file_model->get_file_of_doc($doc_id);
		$drive = $this->file_model->get_drive_of_file($file['id']);

		// 自分が編集中の場合は、何もせずに成功レスポンスを返します。
		$login_session_id = $this->login->session_id();
		if ($file['edit_session_id'] === $login_session_id) {
			$response = ch_create_response();
			ch_send_response($response);
			return TRUE;
		}

		// 他のユーザーが編集中なら、エラーにします。
		if ($file['edit_session_id'] != '') {
			$response = ch_create_response(700, '他のユーザーが編集中です。');
			ch_send_response($response);
			return FALSE;
		}

		// ファイルの編集中セッション ID を更新します。
		$this->file_model->file_update_edit_session_id($file['id'], $login_session_id);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return TRUE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の強制編集

	public function forceedit() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id 	= intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイルを取得します。
		$doc  = $this->doc_model->get_doc($doc_id);
		$file = $this->file_model->get_file_of_doc($doc_id);

		// ファイルの編集中セッション ID を更新します。
		$this->file_model->file_update_edit_session_id($file['id'], $this->login->session_id());

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の編集解除

	public function endedit() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id 	= intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイルを取得します。
		$doc  = $this->doc_model->get_doc($doc_id);
		$file = $this->file_model->get_file_of_doc($doc_id);

		// ファイルの編集中セッション ID が、
		// ログイン ユーザーのセッション ID と一致しているなら、
		// ファイルの編集中セッション ID を NULL に設定します。
		if ($file['edit_session_id'] === $this->login->session_id()) {
			$this->file_model->file_update_edit_session_id($file['id'], NULL);
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の情報取得

	public function info() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id 	= intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書を取得します。
		$doc  = $this->doc_model->get_doc($doc_id);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['content'] = $doc['content'];
		$response['revision'] = $doc['revision'];
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の段落取得

	public function p() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('doc_id');
		$p_id_string		= $this->input->post_get('p_id');
		$revision_string	= $this->input->post_get('revision');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $p_id_string == '' || $revision_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id		= intval($doc_id_string);
		$p_id 		= intval($p_id_string);
		$revision	= intval($revision_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && ($p_id > 0) && ($revision > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書を取得します。
		//$doc  = $this->doc_model->get_doc($doc_id);

		// 指定されたリビジョン番号が、現在の文書のリビジョン番号に一致するか確認します。
		$doc = $this->doc_model->get_doc($doc_id);
		if ($revision != $doc['revision']) {
			$response = ch_create_response(500, '文書の内容が変更されました。');
			ch_send_response($response);
			return;
		}

		// 段落を取得します。
		$p = $this->doc_model->get_p($doc_id, $p_id);
		if (! $p) {
			$response = ch_create_response(110, '段落がありません。');
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['content'] = $p['content'];
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書の保存

	public function save() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string	= $this->input->post_get('id');
		$doc_content	= $this->input->post_get('content');
		$p_list_json	= $this->input->post_get('p_list');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $doc_content == '' || $p_list_json == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id	= intval($doc_id_string);
		$p_list = json_decode($p_list_json, TRUE);	// 空配列の場合もあるので注意

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && is_array($p_list);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイル、ドライブを取得します。
		$doc   = $this->doc_model->get_doc($doc_id);
		$file  = $this->file_model->get_file_of_doc($doc_id);
		$drive = $this->file_model->get_drive_of_file($file['id']);

		// トランザクションを開始します。
		$this->db->trans_begin();
		try {

			// ドライブにロックをかけます。★文書ロックのほうがいい★
			// (トランザクション終了時にアンロックされます)
			$this->file_model->lock_drive($drive['id']);

			// 保存処理を行います。
			$success = $this->save_within_transaction($doc_id, $doc_content, $p_list);

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

	private function save_within_transaction($doc_id, $doc_content, $p_list) {

		// アクセス権等をチェックします。
		// (ドライブ ロック後に再度チェックする必要があります)
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// 文書、ファイル、ドライブを取得します。
		$doc   = $this->doc_model->get_doc($doc_id);
		$file  = $this->file_model->get_file_of_doc($doc_id);
		$drive = $this->file_model->get_drive_of_file($file['id']);

		// 他のユーザーが編集中なら、エラーにします。
		$login_session_id = $this->login->session_id();
		if ($file['edit_session_id'] !== $login_session_id) {
			$response = ch_create_response(700, '他のユーザーが編集中です。');
			ch_send_response($response);
			return FALSE;
		}

		// 文書と段落を更新します。
		$this->doc_model->update_doc_and_p($doc_id, $doc_content, $p_list);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return TRUE;
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 文書の名前を付けて保存

	public function saveas() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$parent_id_string 	= $this->input->post_get('parent_id');
		$org_doc_id_string	= $this->input->post_get('org_doc_id');
		$new_name			= $this->input->post_get('new_name');
		$doc_content		= $this->input->post_get('content');
		$p_list_json		= $this->input->post_get('p_list');
		$force_string		= $this->input->post_get('force');

		// パラメータが不足していないか確認します。
		if ($parent_id_string == '' ||
			$org_doc_id_string == '' ||
			$new_name == '' ||
			$doc_content == '' ||
			$p_list_json == '' ||
			$force_string == '')
		{
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$parent_id	= intval($parent_id_string);
		$org_doc_id	= intval($org_doc_id_string);
		$p_list		= json_decode($p_list_json, TRUE);	// 空配列の場合もあるので注意
		$force 		= ch_string_to_bool($force_string, NULL);

		// パラメータが適切であるか確認します。
		$param_valid = ($parent_id > 0) && is_array($p_list) && is_bool($force);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのセッション ID を取得します。
		$login_session_id = $this->login->session_id();

		// 親フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($parent_id)) return;

		// フォルダ内に同名のファイル/フォルダが存在すれば、その t_file レコードを取得します。
		$existing_file = $this->file_model->get_folder_file_of_name($parent_id, $new_name);

		// フォルダ内に同名のファイルが存在する場合
		if ($existing_file) {

			// 次の場合はエラーにします。
			// 1. 強制上書きモードでない場合
			// 2. 強制上書きモードであり、かつ、同名ファイルがフォルダであった場合
			if ((! $force) || ($existing_file['type'] == 2)) {
				$response = ch_create_response(300, 'フォルダ内でファイル名が重複しています。');
				ch_send_response($response);
				return;
			}

			// 他者が編集中であればエラーにします。
			if ($existing_file['edit_session_id'] && $existing_file['edit_session_id'] !== $login_session_id) {
				$response = ch_create_response(700, '他のユーザーが文書を編集中です。');
				ch_send_response($response);
				return;
			}
			else {
				$file_id = $existing_file['id'];
				$doc_id  = $existing_file['doc_id'];
			}
		}
		// フォルダ内に同名のファイルが存在しない場合
		else {

			// 新規ファイルを作成します。
			$user_id = $this->login->user_id();
			list($file_id, $file_name, $doc_id) = $this->file_model->create_file($parent_id, $user_id);

			// ファイル名を変更します。
			$this->file_model->rename_file($file_id, $new_name);
		}

		// ファイルの編集を開始します。
		{
			// ファイルの編集中セッション ID を更新します。
			$this->file_model->file_update_edit_session_id($file_id, $login_session_id);
		}

		// 文書を保存します。
		{
			// 文書と段落を更新します。
			$this->doc_model->update_doc_and_p($doc_id, $doc_content, $p_list);

			// 文書の各種設定を元文書からコピーし、アニメーションをコピーし、
			// 元文書の編集ロックを解除します。
			$this->doc_model->inherit_doc_settings_and_animation_and_unlock($doc_id, $org_doc_id);
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['id'] = $doc_id;
		ch_send_response($response);
		return TRUE;
	}

}
