<?php

/**
 * ユーザー情報のエディタ設定を扱う API のコントローラです。
 */
class Editorsetting extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('user_info_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}
	
	public function get() {
	
		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}
		
		// パラメータはありません。
		
		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();
		
		// エディタ設定を取得します。
		$editor_setting = $this->user_info_model->get_editor_setting($user_id);
		
		// エディタ設定が空の場合は、エラー レスポンスを返します。
		if ($editor_setting == '') {
			$response = ch_create_response(100, 'エディタ設定が存在しません。');
			ch_send_response($response);
			return;
		}
	
		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['editor_setting'] = $editor_setting;
		ch_send_response($response);
		return;
	}
	
	public function save() {
	
		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}
		
		// パラメータを取得します。
		$editor_setting = $this->input->post_get('editor_setting');
		
		// パラメータが不足していないか確認します。
		if ($editor_setting == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}
		
		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();
		
		// エディタ設定を保存します。
		$this->user_info_model->set_editor_setting($user_id, $editor_setting);
	
		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

}
