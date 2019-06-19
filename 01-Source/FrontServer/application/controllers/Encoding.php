<?php

/**
 * エンコーディングを扱う API のコントローラです。
 */
class Encoding extends CI_Controller {

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
	//// SJIS 変換の確認

	public function sjischeck() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$word = $this->input->post_get('word');

		// パラメータが不足していないか確認します。
		if ($word == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}
		
		// SJIS に変換できない文字を '?' に変換するように設定します。
		// (デフォルトでは変換できない文字は削除されてしまうようです)
		mb_substitute_character(0x3F);

		// word 文字列を UTF-8 から SJIS に変換します。
		$word_sjis = mb_convert_encoding($word, 'SJIS', 'UTF-8');

		// word_sjis 文字列を SJIS から UTF-8 に逆変換します。
		$word_utf8 = mb_convert_encoding($word_sjis, 'UTF-8', 'SJIS');

		// word と word_utf8 が同一ならば、TRUE を返します。
		$result = ($word === $word_utf8);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['result'] = $result;
		$response['text'] = $word_utf8;
		ch_send_response($response);
		return;
	}

}

