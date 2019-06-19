<?php

/**
 * アカウント サーバーとの通信エラーを表す例外クラスです。
 */
class AccountServerException extends Exception {
	var $status;
	function __construct($status = 0) {
		$this->status = $status;
	}
}

/**
 * アカウント サーバーから結果エラーを表す例外クラスです。
 */
class AccountServerResultException extends Exception {
}


/**
 * アカウント サーバーとの通信を行うモデル クラスです。
 */
class Account_model extends CI_Model {

	public function __construct() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// アカウント サーバーとの通信

	/**
	 * アカウント サーバーの API を呼び出します。
	 */
	private function call_account_server($api, $method = 'GET', $params = NULL, $headers = NULL) {

		// API の URL を作成します。
		$url = $this->config->item('account_server_url') . $api;

		// $method を大文字に正規化します。
		$method = strtoupper($method);

		// HTTP オプションを作成します。
		$http = array('method'  => $method);

		// リクエスト パラメータを作成します。
		if ($params) {
			if ($method === 'GET') {
				$url .= '?' . http_build_query($params);
			}
			else if ($method === 'POST') {
				$http['content'] = http_build_query($params);
			}
			else {
				trigger_error("Invalid HTTP request method '$method'.", E_USER_ERROR);
				throw new AccountServerException();
				return;
			}
		}

		// HTTP ヘッダーを作成します。
		$http['header'] = "Connection: close\r\n";
		if ($headers) {
			$http['header'] .= implode("\r\n", $headers) . "\r\n";
		}

		// タイムアウト (秒) を設定します。
		//$http['timeout'] = 60;

		// HTTP コンテキスト オプションを作成します。
		$context_option = array(
			'http' => $http,
		);

		// コンテキストを作成します。
		$context = stream_context_create($context_option);

		// レスポンス ヘッダーを初期化します。
		// このローカル変数には、file_get_contents の呼び出し時に、
		// レスポンス ヘッダーの配列が記録されます。
		$http_response_header = NULL;

		// リクエストをログに記録します。
		log_message('debug', 'Connect to account server: '.$url."\n". print_r($http, TRUE));

		// サーバーに接続して、レスポンスを取得します。
		// 【実装メモ】file_get_contents 関数はサーバーが 200 以外の
		// ステータス コードを返した場合、戻り値が FALSE になります。
		// このとき、warning が発生しますので、エラー制御演算子 @ を付ける必要があります。
		$response = @file_get_contents($url, FALSE, $context);

		// レスポンスが得られない場合は、AccountServerException 例外をスローします。
		if ($response === FALSE) {

			// 200 以外のステータス コードは、$http_response_header 変数の [0] 要素に格納されます。
			list($version, $status, $message) = @explode(' ', $http_response_header[0], 3);

			// 通信エラーをログに記録します。
			$message = sprintf('Account server error of "%s" API : %s %s', $api, $status, $message);
			log_message('debug', $message);

			throw new AccountServerException($status);
		}

		// レスポンスを返します。
		return $response;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// API

	/**
	 * チャレンジ文字列を生成します。
	 */
	public function generate_challenge() {

		$params = array();
		$response = $this->call_account_server('challengestring', 'GET', $params);

		// アカウント サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new AccountServerResultException();
		}

		return ch_array_get($result, 'value', '');
	}

	/**
	 * ログインを試行します。
	 * 成功すると User オブジェクトを返します。
	 * 失敗すると FALSE を返します。
	 */
	public function do_login($account, $response, $challenge) {

		$params = array(
			'loginid'	=> $account,
			'cres'		=> $response,
			'cstr'		=> $challenge,
		);
		$response = $this->call_account_server('logincheck', 'GET', $params);

		// アカウント サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new AccountServerResultException();
		}

		// 処理に成功したか、認証に成功したか、エラーコード、ユーザ ID を取得します。
		$r         = ch_array_get($result, 'r', FALSE);
		$value     = ch_array_get($result, 'value', FALSE);
		$errorCode = (int) ch_array_get($result, 'errorCode', 999);
		$user_id   = (int) ch_array_get($result, 'usrid', 0);
		if (! $r || ! $value || $errorCode != 0 || $user_id <= 0) return FALSE;

		// メンバーの氏名を取得します。
		list($name, $kind) = $this->get_name_and_kind($account);
		if (! $name) return FALSE;
		if (! $kind) return FALSE;

		// メンバーのグループ リストを取得します。
		$group_list = $this->get_group_list($account);
		if ($group_list === FALSE) return FALSE;

		// User オブジェクトを返します。
		$user = array(
			'id' 			=> $user_id,
			'account' 		=> $account,
			'name'			=> $name,
			'kind'			=> $kind,
			'group_list'	=> $group_list,
		);
		return $user;
	}

	/**
	 * メンバーの氏名と種別を取得します。
	 */
	private function get_name_and_kind($account) {

		$params = array(
			'loginid'	=> $account,
		);
		$response = $this->call_account_server('member', 'GET', $params);

		// アカウント サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new AccountServerResultException();
		}

		// 処理に成功したかどうかのフラグを取得します。
		$r = ch_array_get($result, 'r', FALSE);
		if (! $r) return FALSE;

		// 氏名と種別を取得します。
		$name = ch_array_get($result, 'name', '');
		$kind = (int) ch_array_get($result, 'kind', 0);

		return array($name, $kind);
	}

	/**
	 * メンバーのグループ リストを取得します。
	 */
	private function get_group_list($account) {

		//// 情報を取得します。 ////
		$params = array(
			'loginid'	=> $account,
		);
		$response = $this->call_account_server('membergroup', 'GET', $params);

		// アカウント サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new AccountServerResultException();
		}
		if (! is_array($result)) return FALSE;

		// グループ情報を作成します。
		$group_list = array();
		foreach ($result as $record) {
			$group_id   = (int) ch_array_get($record, 'grpid', 0);
			$group_name =       ch_array_get($record, 'grpname', '');
			if ($group_id <= 0 || $group_name == '') continue;

			$group_list[] = array(
				'id' 		=> $group_id,
				'name' 	=> $group_name,
			);
		}

		return $group_list;
	}

	/**
	 * ログアウト処理を行います。
	 */
	public function do_logout($account) {
		$params = array(
			'loginid'	=> $account,
		);
		$response = $this->call_account_server('logout', 'GET', $params);
	}

	/**
	 * お知らせ情報を取得します。
	 */
	public function news_get() {
		$params = array();
		$response = $this->call_account_server('info', 'GET', $params);

		// アカウント サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new AccountServerResultException();
		}

		return $result;
	}

}
