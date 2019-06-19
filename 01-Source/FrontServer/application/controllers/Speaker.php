<?php

/**
 * 話者情報を扱う API のコントローラです。
 */
class Speaker extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('voice_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}

	public function list_() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータはありません。

		// 話者名一覧を取得します。
		try {
			$speaker_list = $this->voice_model->get_speaker_list();
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['speaker_list'] = $speaker_list;
		ch_send_response($response);
		return;
	}

	/**
	 * コントローラ メソッドの再マップを行います。
	 * list は PHP のキーワードであるため、
	 * list という名前のメソッドを定義することができません。
	 * そこで list_ メソッドを定義し、再マップの仕組みにより呼び出すこととします。
	 */
	public function _remap($method) {
		if ($method === 'list') {
			$this->list_();
		}
	}
}
