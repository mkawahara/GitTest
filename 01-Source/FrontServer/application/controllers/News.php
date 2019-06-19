<?php

/**
 * お知らせ情報を扱う API のコントローラです。
 */
class News extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// お知らせ情報の取得

	public function get() {

		// お知らせ情報を取得します。
		try {
			$result = $this->login->get_news();
		}
		catch (VoiceServerResultException $ex) {
			$response = ch_create_response(CH_ERROR_ACCOUNT_SERVER);
			ch_send_response($response);
			return;
		}
		catch (AccountServerResultException $ex) {
			$response = ch_create_response(CH_ERROR_ACCOUNT_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['result'] = $result;
		ch_send_response($response);
		return;
	}
}
