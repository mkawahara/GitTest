<?php

/**
 * 文書の音声設定を扱う API のコントローラです。
 */
class Voicesetting extends CI_Controller {

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
	//// システム音声設定名の一覧

	public function systemlist() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータはありません。

		// システム音声設定一覧を取得します。
		try {
			$system_voice_setting_list = $this->voice_model->get_system_voice_setting_list();
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['system_voicesetting_list'] = $system_voice_setting_list;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 音声設定の取得

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

		// 文書の音声設定を取得します。
		$voice_setting = $this->doc_model->get_voice_setting($doc_id);

		// 文書の音声設定が存在しない場合
		if ($voice_setting == '') {

			// ユーザー設定のデフォルト音声設定を取得します。
			$voice_setting = $this->user_info_model->get_default_voice_setting($user_id);

			// ユーザー設定のデフォルト音声設定が存在しない場合
			if ($voice_setting == '') {

				// 音声サーバーのデフォルト音声設定を取得します。
				try {
					$voice_setting = $this->voice_model->get_default_voice_setting();
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
		$response['voice_setting'] = $voice_setting;
		ch_send_response($response);
		return;
	}

	/**
	 * 音声設定のデフォルト値を取得します。
	 */
	public function get_() {

	}

	//////////////////////////////////////////////////////////////////////////////
	//// 音声設定の保存

	public function save() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string 		= $this->input->post_get('doc_id');
		$voice_setting 		= $this->input->post_get('voice_setting');
		$as_default_string	= $this->input->post_get('as_default');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $voice_setting == '' || $as_default_string == '') {
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

		// 文書が存在して書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) {
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// トランザクションを開始します。
		$this->db->trans_start();
		{
			// 文書の音声設定を保存します。
			// 文書の「読み上げ設定変更日時」も更新されます。
			$this->doc_model->set_voice_setting($doc_id, $voice_setting);

			// ユーザー設定のデフォルト音声設定を保存します。
			if ($as_default) {
				$this->user_info_model->set_default_voice_setting($user_id, $voice_setting);
			}
		}
		// トランザクションをコミットします。
		$this->db->trans_complete();

		// トランザクションに失敗した場合
		if ($this->db->trans_status() === FALSE) {

			// 失敗レスポンスを返します。
			$response = ch_create_response(500, 'データベース エラーが発生しました。');
			ch_send_response($response);
			return;
		}

		// 音声サーバーに登録します。
		try {
			$this->voice_model->register_voice_setting($doc_id);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 音声設定の置換

	public function replace() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');
		$voice_setting_name = $this->input->post_get('voice_setting_name');
		$ref_doc_id_string = $this->input->post_get('ref_doc_id');		// NULL のこともあります

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $voice_setting_name == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id = intval($doc_id_string);
		$ref_doc_id = intval($ref_doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) return;

		// 参照文書が存在して、読み取り可能であるか判定します。
		if ($ref_doc_id) {
			if (! $this->access_model->can_read_doc($ref_doc_id)) return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// 参照文書が指定されている場合
		if ($ref_doc_id > 0) {

			// 参照文書から音声設定を取得します。
			$voice_setting = $this->doc_model->get_voice_setting($ref_doc_id);
		}
		// 参照文書が指定されていない場合
		else {

			// 音声サーバーからシステム音声設定を取得します。
			try {
				$voice_setting = $this->voice_model->get_system_voice_setting($voice_setting_name);
			}
			catch (VoiceServerException $ex) {

				// 音声サーバーとの通信に失敗した場合は、エラーを返します。
				$ex->send_response();
				return;
			}
		}

		// トランザクションを開始します。
		$this->db->trans_start();
		{
			// 文書の音声設定を保存します。
			// 文書の「読み上げ設定変更日時」も更新されます。
			$this->doc_model->set_voice_setting($doc_id, $voice_setting);

			// ユーザー設定のデフォルト音声設定を保存します。
			// 【実装メモ】2015年10月24日の仕様変更により、
			// ユーザー設定のデフォルト音声設定への保存はしないことになりました。
			//$this->user_info_model->set_default_voice_setting($user_id, $voice_setting);
		}
		// トランザクションをコミットします。
		$this->db->trans_complete();

		// トランザクションに失敗した場合
		if ($this->db->trans_status() === FALSE) {

			// 失敗レスポンスを返します。
			$response = ch_create_response(500, 'データベース エラーが発生しました。');
			ch_send_response($response);
			return;
		}

		// 音声サーバーに登録します。
		try {
			$this->voice_model->register_voice_setting($doc_id);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

}
