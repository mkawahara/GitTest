<?php

/**
 * 文書の音声設定を扱う API のコントローラです。
 */
class Voice extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('doc_model');
		$this->load->model('access_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ハイライト分割の取得

	public function highlight() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string		= $this->input->post_get('doc_id');
		$p					= $this->input->post_get('p');
		$start_id			= $this->input->post_get('start_id');
		$speaker_list_json	= $this->input->post_get('speaker_list');
		$request_id			= $this->input->post_get('request_id');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $p == '' || $start_id == '' || $speaker_list_json == '' || $request_id == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id		= intval($doc_id_string);

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

		// ハイライト分割情報を取得します。
		try {
			$highlight_info = $this->voice_model->get_highlight_split($doc_id, $p, $start_id, $speaker_list_json);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// レスポンスに返すハイライト情報を作成します。
		$info = array();
		$highlight_list = ch_array_get($highlight_info, 'highlights', array());
		foreach ($highlight_list as $h) {

			$first_id = ch_array_get($h, 'first_id', NULL);
			$audio_id = ch_array_get($h, 'audio_id', NULL);

			// 音声サーバーに不具合があっても正常動作させるために、
			// 想定しない値が入っている場合は、そのエントリは無視します。
			if ($first_id == NULL || $audio_id == NULL) continue;

			// ハイライト分割情報を追加します。
			$info[] = array(
				'first_id'	=> $first_id,
				'audio_id'	=> $audio_id,
			);
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['info'] = $info;
		$response['request_id'] = $request_id;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 読み上げ音声の取得

	public function data() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$audio_id	= $this->input->post_get('audio_id');

		// パラメータが不足していないか確認します。
		if ($audio_id == '') {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		// (特に検証不要です)

		// 読み上げ音声を取得し、そのままクライアントに返します。
		try {
			$this->voice_model->send_voice_data($audio_id);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			http_response_code(500);
			$ex->send_response();
			return;
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//// テスト再生の音声の取得

	public function testdata() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$text			= $this->input->post_get('text');
		$doc_id_string	= $this->input->post_get('doc_id');			// オプション
		$dictionary		= $this->input->post_get('dictionary');		// オプション
		$voice_setting	= $this->input->post_get('voice_setting');	// オプション
		$accent_control	= $this->input->post_get('accent_control');	// オプション

		// パラメータが不足していないか確認します。
		if ($text == '') {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id	= intval($doc_id_string);

		// パラメータが適切であるか確認します。

		// パラメータが適切であるか確認します。
		// ($doc_id はオプションなので 0 の場合があります)
		$param_valid = ($doc_id >= 0) &&
						($accent_control == '' || $accent_control == 'true' || $accent_control == 'false');
		if (! $param_valid) {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して読み取り可能であるか判定します。
		// ($doc_id はオプションなので検証はしません)

		// テスト再生の音声を取得し、そのままクライアントに返します。
		try {
			$this->voice_model->send_voice_test_data($text, $doc_id, $dictionary, $voice_setting, $accent_control);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			http_response_code(500);
			$ex->send_response();
			return;
		}
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 読み上げテキストの取得

	public function readtext() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$text = $this->input->post_get('text');

		// パラメータが不足していないか確認します。
		if ($text == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// 音声サーバーの API を呼び出します。
		try {
			$read_text = $this->voice_model->get_read_text($text);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// 音声サーバーが不正なレスポンスを返した場合は、エラーを返します。
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['readtext'] = $read_text;
		ch_send_response($response);
		return;
	}

}
