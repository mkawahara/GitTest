<?php

/**
 * アニメーションを扱う API のコントローラです。
 */
class Animation extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('animation_model');
		$this->load->model('access_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//// アニメーションの取得
	
	public function get() {
	
		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}
		
		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');
		$animation_id_string = $this->input->post_get('animation_id');
		
		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $animation_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}
		
		// パラメータの文字列を値に変換します。
		$doc_id 		= intval($doc_id_string);
		$animation_id 	= intval($animation_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && ($animation_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して読み取り可能であるか判定します。
		if (! $this->access_model->can_read_doc($doc_id)) {
			return;
		}

		// アニメーション内容を取得します。
		$content = $this->animation_model->get_animation_content($doc_id, $animation_id);
		
		// アニメーション内容が空の場合は、エラー レスポンスを返します。
		if ($content == '') {
			$response = ch_create_response(110, 'アニメーション データがありません');
			ch_send_response($response);
			return;
		}
	
		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['content'] = $content;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// アニメーションの保存
	
	public function save() {
	
		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}
		
		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');
		$animation_id_string = $this->input->post_get('animation_id');
		$content = $this->input->post_get('content');
		
		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $animation_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}
		
		// パラメータの文字列を値に変換します。
		$doc_id 		= intval($doc_id_string);
		$animation_id 	= intval($animation_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && ($animation_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) {
			return;
		}
	
		// アニメーション内容を保存します。
		$content = $this->animation_model->set_animation_content($doc_id, $animation_id, $content);
		
		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// アニメーションの削除

	public function delete() {
	
		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}
		
		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');
		$animation_id_string = $this->input->post_get('animation_id');
		
		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $animation_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}
		
		// パラメータの文字列を値に変換します。
		$doc_id 		= intval($doc_id_string);
		$animation_id 	= intval($animation_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && ($animation_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) {
			return;
		}
		
		// アニメーションを削除します。
		$success = $this->animation_model->delete_animation($doc_id, $animation_id);
		
		// アニメーションが存在しなかった場合は、エラーを返します。
		if (! $success) {
			$response = ch_create_response(110, 'アニメーション データがありません。');
			ch_send_response($response);
			return;
		}
		
		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 未使用アニメーションの整理

	public function deleteunused() {
	
		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}
		
		// パラメータを取得します。
		$doc_id_string 					= $this->input->post_get('doc_id');
		$used_animation_id_list_json	= $this->input->post_get('used_animation_id_list');
		
		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $used_animation_id_list_json == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}
		
		// パラメータの文字列を値に変換します。
		$doc_id 				= intval($doc_id_string);
		$used_animation_id_list = json_decode($used_animation_id_list_json);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0) && (is_array($used_animation_id_list));
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 文書が存在して書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) {
			return;
		}
	
		// 未使用アニメーション削除します。
		$this->animation_model->delete_unused_animations($doc_id, $used_animation_id_list);
		
		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

}
