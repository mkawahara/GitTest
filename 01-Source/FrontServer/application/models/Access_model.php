<?php

/**
 * ファイルや文書に対するアクセス制限を判定するためのクラスです。
 * このクラスは Ajax コントローラから使用されることを想定しており、
 * アクセス違反がある場合は Ajax レスポンスを返します。
 */
class Access_model extends CI_Model {

	public function __construct() {
		parent::__construct();
		$this->load->model('file_model');
		$this->load->model('doc_model');
	}

	/**
	 * 音声サーバーからのアクセスであるか判定します。
	 */
	public function is_voice_server() {

		$voice_server_ip = get_instance()->config->item('voice_server_ip');
		if ($voice_server_ip === $_SERVER['REMOTE_ADDR']) {
			return TRUE;
		}

		return FALSE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ファイル/フォルダへのアクセス権等のチェック

	/**
	 * 指定されたファイル ID が、ユーザーがアクセス可能なファイル (またはフォルダ) であるか確認します。
	 * ファイルやドライブが論理削除されている場合は、アクセス可能ではありません。
	 * ドライブの所有グルーザが、ログイン ユーザーと異なる場合も、アクセス可能ではありません。
	 */
	public function is_accessible_file($file_id) {

		$user_id = $this->login->user_id();

		// 音声サーバーからのアクセスは常に許可します。
		if ($this->is_voice_server()) return TRUE;

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($file_id);
		$drive = $this->file_model->get_drive_of_file($file_id);

		// 親フォルダが存在するか確認します。
		if (! $file || ! $drive) {
			$response = ch_create_response(100, 'ファイルがありません。');
			ch_send_response($response);
			return FALSE;
		}

		// ドライブが、ユーザー所有、または、ユーザーが所属するグループ所有であるか、
		// 確認します。
		$grouser_id = $drive['grouser_id'];
		$can_access = ($grouser_id == $user_id) || ($this->login->belongs_to_group($grouser_id));
		if (! $can_access) {
			$response = ch_create_response(400, '操作権限がありません。');
			ch_send_response($response);
			return FALSE;
		}

		// ファイルが編集中であるか確認します。★エラーコードは暫定★
		if ($file['edit_session_id'] != NULL) {
			$response = ch_create_response(700, 'ファイルは編集中です。');
			ch_send_response($response);
			return FALSE;
		}

		return TRUE;
	}

	/**
	 * 指定されたフォルダ ID が、実際にフォルダであるか確認します。
	 * ログイン ユーザーがアクセス可能なフォルダであるか、確認します。
	 * フォルダやドライブが論理削除されている場合は、アクセス可能ではありません。
	 * ドライブの所有グルーザが、ログイン ユーザーと異なる場合も、アクセス可能ではありません。
	 */
	public function is_accessible_folder($folder_id) {

		$user_id = $this->login->user_id();

		// 音声サーバーからのアクセスは常に許可します。
		if ($this->is_voice_server()) return TRUE;

		// ファイルとドライブのレコードを取得します。
		$file  = $this->file_model->get_file($folder_id);
		$drive = $this->file_model->get_drive_of_file($folder_id);

		// 親フォルダが存在するか確認します。
		if (! $file || $file['type'] != 2 || ! $drive) {
			$response = ch_create_response(200, '指定された親フォルダは存在しません。');
			ch_send_response($response);
			return FALSE;
		}

		// ドライブが、ユーザー所有、または、ユーザーが所属するグループ所有であるか、
		// 確認します。
		$grouser_id = $drive['grouser_id'];
		$can_access = ($grouser_id == $user_id) || ($this->login->belongs_to_group($grouser_id));
		if (! $can_access) {
			$response = ch_create_response(400, '操作権限がありません。');
			ch_send_response($response);
			return FALSE;
		}

		return TRUE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書のアクセス権等のチェック

	/**
	 * 指定された文書 ID が、ユーザーがアクセス可能な文書であるか確認します。
	 * ファイルやドライブが論理削除されている場合は、アクセス可能ではありません。
	 * ドライブの所有グルーザが、ログイン ユーザーと異なる場合も、アクセス可能ではありません。
	 */
	public function can_read_doc($doc_id) {

		// 音声サーバーからのアクセスは常に許可します。
		if ($this->is_voice_server()) return TRUE;

		// ログイン ユーザーの ID を取得します。
		$user_id = $this->login->user_id();

		// 文書を取得します。
		$doc = $this->doc_model->get_doc($doc_id);
		if ($doc) {
			// ファイルを取得します。
			$file = $this->file_model->get_file_of_doc($doc_id);
			if ($file) {
				// ドライブを取得します。
				$drive = $this->file_model->get_drive_of_file($file['id']);
			}
		}

		if (! $doc || ! $file || ! $drive) {
			$response = ch_create_response(100, '文書がありません。');
			ch_send_response($response);
			return FALSE;
		}

		// ドライブが、ユーザー所有、または、ユーザーが所属するグループ所有であるか、
		// 確認します。
		$grouser_id = $drive['grouser_id'];
		$can_access = ($grouser_id == $user_id) || ($this->login->belongs_to_group($grouser_id));
		if (! $can_access) {
			$response = ch_create_response(400, '操作権限がありません。');
			ch_send_response($response);
			return FALSE;
		}

		return TRUE;
	}

	/**
	 * 指定された文書が、書き込み可能であるか判定します。
	 * 読み取り可能でなければ、書き込み可能ではありません。
	 * 他のユーザーが編集中であれば、書き込み可能ではありません。
	 */
	public function can_write_doc($doc_id) {

		// 音声サーバーからのアクセスは常に許可します。
		if ($this->is_voice_server()) return TRUE;

		// 読み取り可能でなければ、書き込み可能ではありません。
		if (! $this->can_read_doc($doc_id)) {
			return FALSE;
		}

		// ログイン ユーザーのセッション ID を取得します。
		$login_session_id = $this->login->session_id();

		// ファイルを取得します。
		$file = $this->file_model->get_file_of_doc($doc_id);

		// ファイルを他のユーザーが編集中であれば、書き込み可能ではありません。
		if ($file['edit_session_id'] != NULL) {
			if ($file['edit_session_id'] !== $login_session_id) {
				$response = ch_create_response(700, '他のユーザーが文書を編集中です。');
				ch_send_response($response);
				return FALSE;
			}
		}

		return TRUE;
	}

}
