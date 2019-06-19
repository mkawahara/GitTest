<?php

/**
 * 文書の変換設定を扱う API のコントローラです。
 */
class Convertsetting extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('doc_model');
		$this->load->model('access_model');
		$this->load->model('user_info_model');
		$this->load->model('voice_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 変換設定の取得

	public function get() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id = intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して読み取り可能であるか判定します。
		if (! $this->access_model->can_read_doc($doc_id)) {
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// 変換設定を取得します。
		$convert_setting = $this->doc_model->get_convert_setting($doc_id);

		// 文書の変換設定が存在しない場合
		if ($convert_setting == '') {

			// ユーザー設定のデフォルト変換設定を取得します。
			$convert_setting = $this->user_info_model->get_default_convert_setting($user_id);

			// ユーザー設定のデフォルト変換設定が存在しない場合
			if ($convert_setting == '') {

				// 音声サーバーのデフォルト変換設定を取得します。
				try {
					$convert_setting = $this->voice_model->get_default_convert_setting();
				}
				catch (VoiceServerException $ex) {

					// 音声サーバーとの通信に失敗した場合は、エラーを返します。
					$ex->send_response();
					return;
				}
			}
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['convert_setting'] = $convert_setting;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 変換設定の保存

	public function save() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string 		= $this->input->post_get('doc_id');
		$convert_setting 	= $this->input->post_get('convert_setting');
		$as_default_string	= $this->input->post_get('as_default');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $convert_setting == '' || $as_default_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id = intval($doc_id_string);
		$as_default = ch_string_to_bool($as_default_string, NULL);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && is_bool($as_default);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して読み取り可能であるか判定します。
		// (文書への書き込み権限がなくてもよいので注意。)
		if (! $this->access_model->can_read_doc($doc_id)) {
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// トランザクションを開始します。
		$this->db->trans_start();
		{
			// 文書の変換設定を保存します。
			// 文書の「読み上げ設定変更日時」も更新されます。
			$this->doc_model->set_convert_setting($doc_id, $convert_setting);

			// ユーザー設定のデフォルト変換設定を保存します。
			if ($as_default) {
				$this->user_info_model->set_default_convert_setting($user_id, $convert_setting);
			}
		}
		// トランザクションをコミットします。
		$this->db->trans_complete();

		// トランザクションが成功した場合
		if ($this->db->trans_status() !== FALSE) {

			// 成功レスポンスを返します。
			$response = ch_create_response();
			ch_send_response($response);
			return;
		}
		else {

			// 失敗レスポンスを返します。
			$response = ch_create_response(999, 'データベース エラーが発生しました。');
			ch_send_response($response);
			return;
		}
	}

}
