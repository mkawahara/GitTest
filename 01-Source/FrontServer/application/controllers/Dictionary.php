<?php

/**
 * 文書の文書辞書を扱う API のコントローラです。
 */
class Dictionary extends CI_Controller {

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
	//// システム辞書一覧の取得

	public function systemlist() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータはありません。

		// システム辞書一覧を取得します。
		try {
			$system_dictionary_list = $this->voice_model->get_system_dictionary_list();
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['system_dictionary_list'] = $system_dictionary_list;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書辞書の取得

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

		// 文書の文書辞書を取得します。
		$dictionary = $this->doc_model->get_dictionary($doc_id);

		// 文書の文書辞書が存在しない場合
		if ($dictionary == '') {

			// ユーザー設定のデフォルト辞書を取得します。
			// 【実装メモ】2015年10月24日の仕様変更により、
			// 文書辞書はユーザー設定を参照しないことになりました。
			//$dictionary = $this->user_info_model->get_default_dictionary($user_id);

			// ユーザー設定のデフォルト辞書が存在しない場合
			if ($dictionary == '') {

				// 音声サーバーのデフォルト辞書を取得します。
				try {
					$dictionary = $this->voice_model->get_default_dictionary();
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
		$response['dictionary'] = $dictionary;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書辞書の保存

	public function save() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');
		$dictionary = $this->input->post_get('dictionary');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $dictionary == '') {
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

		// 文書が存在して書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) {
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// トランザクションを開始します。
		$this->db->trans_start();
		{
			// 文書の文書辞書を保存します。
			// 文書の「読み上げ設定変更日時」も更新されます。
			$this->doc_model->set_dictionary($doc_id, $dictionary);

			// ユーザー設定のデフォルト辞書を保存します。
			// 【実装メモ】2015年10月24日の仕様変更により、
			// 文書辞書はユーザー設定のデフォルト辞書に保存しないことになりました。
			//$this->user_info_model->set_default_dictionary($user_id, $dictionary);
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

		// 文書辞書を音声サーバーに登録します。
		try {
			$this->voice_model->register_dictionary($doc_id);
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
	//// 文書辞書の置換

	public function replace() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string = $this->input->post_get('doc_id');
		$dictionary_name = $this->input->post_get('dictionary_name');
		$ref_doc_id_string = $this->input->post_get('ref_doc_id');		// NULL のこともあります

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $dictionary_name == '') {
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

		// 文書が存在して、書き込み可能であるか判定します。
		if (! $this->access_model->can_write_doc($doc_id)) {
			return;
		}

		// 参照文書が存在して、読み取り可能であるか判定します。
		if ($ref_doc_id) {
			if (! $this->access_model->can_read_doc($ref_doc_id)) return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// 参照文書が指定されている場合
		if ($ref_doc_id > 0) {

			// 参照文書から音声設定を取得します。
			$dictionary = $this->doc_model->get_dictionary($ref_doc_id);
		}
		// 参照文書が指定されていない場合
		else {

			// 音声サーバーからシステム辞書を取得します。
			try {
				$dictionary = $this->voice_model->get_system_dictionary($dictionary_name);
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
			// 文書の文書辞書を保存します。
			// 文書の「読み上げ設定変更日時」も更新されます。
			$this->doc_model->set_dictionary($doc_id, $dictionary);

			// ユーザー設定のデフォルト辞書に保存します。
			// 【実装メモ】2015年10月24日の仕様変更により、
			// ユーザー設定のデフォルト辞書に保存しないことになりました。
			//$this->user_info_model->set_default_dictionary($user_id, $dictionary);
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

		// 文書辞書を音声サーバーに登録します。
		try {
			$this->voice_model->register_dictionary($doc_id);
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
	//// 文書辞書の情報

	public function info() {

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

		// 文書の文書辞書を取得します。
		$dictionary = $this->doc_model->get_dictionary($doc_id);

		// 文書の文書辞書が存在しない場合
		if ($dictionary == '') {

			// ユーザー設定のデフォルト辞書を取得します。
			$dictionary = $this->user_info_model->get_default_dictionary($user_id);

			// ユーザー設定のデフォルト辞書が存在しない場合
			if ($dictionary == '') {

				// 音声サーバーのデフォルト辞書を取得します。
				try {
					$dictionary = $this->voice_model->get_default_dictionary();
				}
				catch (VoiceServerException $ex) {

					// 音声サーバーとの通信に失敗した場合は、エラーを返します。
					$ex->send_response();
					return;
				}
			}
		}

		// 文書辞書の XML から <userdic> 要素の src_name, src_date, src_count 属性を取得します。
		{
			$dom = new DOMDocument('1.0', 'UTF-8');
			$dom->loadXML($dictionary);

			// <userdic> 要素を取得します。
			$userdic_elem = $dom->getElementsByTagName('userdic')->item(0);
			if ($userdic_elem != NULL) {
				$src_name	= $userdic_elem->getAttribute('src_name');
				$src_date	= $userdic_elem->getAttribute('src_date');
				$src_count	= (int) $userdic_elem->getAttribute('src_count');
			}
			else {
				$src_name	= '';
				$src_date	= '';
				$src_count	= 0;
			}
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['info'] = array(
			'name'			=> $src_name,
			'last_modified'	=> $src_date,
			'word_count'	=> $src_count,
		);
		ch_send_response($response);
		return;
	}


	//////////////////////////////////////////////////////////////////////////////
	//// 文書辞書の登録通知

	public function register() {

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
		//$user_id = $this->login->user_id();

		// 文書辞書を音声サーバーに登録します。
		try {
			$this->voice_model->register_dictionary($doc_id);
		}
		catch (VoiceServerException $ex) {

			// 【実装メモ】2015年10月24日の仕様変更により、音声サーバーが 503 ステータスを
			// 返した場合に、API クライアントには 820 エラーを返すことになりました。
			if ($ex->status == 503) {
				$response = ch_create_response(820, '音声サーバーに登録できる辞書数の上限に達しています。');
				ch_send_response($response);
				return;
			}

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
	//// 文書辞書の登録解除通知

	public function unregister() {

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
		//$user_id = $this->login->user_id();

		// 文書辞書を音声サーバーから登録解除します。
		try {
			$this->voice_model->unregister_dictionary($doc_id);
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
