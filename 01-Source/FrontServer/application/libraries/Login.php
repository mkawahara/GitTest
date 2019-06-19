<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


/**
 * ユーザーのログイン状態を管理するクラスです。
 */
class Login {

	const SESSION_VAR_CHALLENGE = 'login_challenge';
	const SESSION_VAR_FAIL = 'login_fail';
	const SESSION_VAR_USER = 'login_user';

	var $_session_id;
	var $_challenge;
	var $_fail;
	var $_user;

	//////////////////////////////////////////////////////////////////////////////
	//// 初期化

	/**
	 * コンストラクタ
	 */
	public function __construct() {

		$CI = & get_instance();

		// セッション ライブラリをロードします。
		//$CI->load->library('session');

		// セッション変数を読みだして、セッションをすぐに閉じます。
		$this->_session_id	= $CI->session->session_id;
		$this->_challenge	= $CI->session->userdata(self::SESSION_VAR_CHALLENGE);
		$this->_fail		= (int) $CI->session->userdata(self::SESSION_VAR_FAIL);
		$this->_user		= $CI->session->userdata(self::SESSION_VAR_USER);
		session_write_close();

		// アカウント ライブラリをロードします。
		if ($CI->config->item('account_server_url') == '') {
			$CI->load->model('account_mock_model', 'account_model');
		}
		else {
			$CI->load->model('account_model');
		}
	}

	private function _session_start() {
		session_start();
		$this->_session_id	= get_instance()->session->session_id;
	}

	private function _session_write_close() {
		session_write_close();
	}

	/**
	 * 現在のセッション ID を取得します。
	 * ログインしていなくても、セッション ID は常に存在します。
	 */
	public function session_id() {
		return $this->_session_id;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// チャレンジ文字列

	/**
	 * チャレンジ文字列を生成し、セッションに関連付け、返します。
	 */
	public function generate_challenge() {

		$this->_challenge = get_instance()->account_model->generate_challenge();

		$this->_session_start();
		get_instance()->session->set_userdata(self::SESSION_VAR_CHALLENGE, $this->_challenge);
		$this->_session_write_close();

		return $this->_challenge;
	}

	/**
	 * セッションに関連付けられたチャレンジ文字列を取得します。
	 */
	private function get_challenge() {
		return $this->_challenge;
	}

	/**
	 * セッションに関連付けられたチャレンジ文字列を消去します。
	 */
	private function clear_challenge() {
		$this->_session_start();
		get_instance()->session->unset_userdata(self::SESSION_VAR_CHALLENGE);
		$this->_session_write_close();
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ログイン失敗数の管理

	/**
	 * ログイン失敗数を 1 つ増加させます。
	 * 増加後の失敗数を返します。
	 */
	private function increment_fail() {
		$this->_fail += 1;

		$this->_session_start();
		get_instance()->session->set_userdata(self::SESSION_VAR_FAIL, $this->_fail);
		$this->_session_write_close();

		return $this->_fail;
	}

	/**
	 * ログイン失敗数を取得します。
	 */
	private function get_fail() {
		return $this->_fail;
	}

	/**
	 * セッションに関連付けられているログイン失敗数を消去します。
	 */
	private function clear_fail() {
		$this->_session_start();
		get_instance()->session->unset_userdata(self::SESSION_VAR_FAIL);
		$this->_session_write_close();
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ログイン / ログアウト

	/**
	 * ログインを行います。
	 * 前回 challenge() メソッドで生成したチャレンジ文字列と
	 * 指定されたアカウント ID およびレスポンス文字列を照合し、
	 * 一致していれば、ログイン成功とします。
	 * @param	account		アカウント ID
	 * @param	response	チャレンジ レスポンス文字列
	 * @return				成功すれば TRUE、失敗すれば FALSE
	 */
	public function do_login($account, $response) {

		$CI = & get_instance();

		// チャレンジ文字列を取得します。
		$challenge = $this->get_challenge();
		if (! $challenge) {

			// チャレンジ文字列が生成されていない場合、
			// API 呼び出し方の間違いであるため、ログイン失敗数は増加させません。
			return FALSE;
		}

		// ログインを試行します。
		$user = $CI->account_model->do_login($account, $response, $challenge);

		if (! $user) {

			// ログイン失敗数を増加させます。
			$fail = $this->increment_fail();

			// 5 回以上ログインに失敗した場合は、最低 3 秒間スリープします。
			if ($fail >= 5) {
				sleep( 3 + ($fail - 5) );  // 失敗数が多いほど多くスリープします。
			}

			return FALSE;
		}

		// セッションに User オブジェクトを関連付けます。[
		unset($user['password']);
		$this->_user = $user;

		$this->_session_start();
		get_instance()->session->set_userdata(self::SESSION_VAR_USER, $user);
		$this->_session_write_close();

		// チャレンジ文字列を消去します。
		$this->clear_challenge();

		// ログイン失敗数を消去します。
		$this->clear_fail();

		return TRUE;
	}

	/**
	 * ログインしているユーザーのユーザー オブジェクトを取得します。
	 * ログインしていない場合は NULL を返します。
	 */
	public function user() {
		return $this->_user;
	}

	/**
	 * ユーザーがログインしているか判定します。
	 */
	public function has_logined() {

		// 音声サーバーからのアクセスであれば、認証をバイパスします。
		$voice_server_ip = get_instance()->config->item('voice_server_ip');
		if ($voice_server_ip === $_SERVER['REMOTE_ADDR']) {
			return TRUE;
		}

		// 結果を取得します。
		$result = (bool) ($this->user());

		// 結果が FALSE であれば、デバッグ出力を行います。
		if (! $result) {
			$message = sprintf('Login::has_logined returned FALSE. Dump session variables:'."\n".print_r($_SESSION, TRUE));
			log_message('debug', $message);
		}

		return $result;
	}

	/**
	 * ログアウトし、セッションを破棄します。
	 */
	public function do_logout() {

		// User オブジェクトを取得します。
		$user = $this->user();
		if (! $user) return;

		// アカウント ID を取得します
		$account = ch_array_get($user, 'account', '');

		// セッションを破棄します。
		$this->_session_start();
		get_instance()->session->sess_destroy();

		$this->_session_id	= '';
		$this->_challenge	= '';
		$this->_fail		= 0;
		$this->_user		= NULL;

		// アカウント ID があれば、ログアウト処理を行います。
		try {
			if ($account != '') {
				get_instance()->account_model->do_logout($account);
			}
		}
		catch (Exception $ex) {
			// 何もしません。
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ユーザー情報

	/**
	 * ログインしているユーザーの ID を取得します。
	 * ログインしていない場合は 0 を返します。
	 */
	public function user_id() {
		$user = $this->user();
		return ($user) ? ($user['id']) : 0;
	}

	/**
	 * ログインしているユーザーの氏名を取得します。
	 * ログインしていない場合は空文字列を返します。
	 */
	public function user_name() {
		$user = $this->user();
		return ($user) ? ($user['name']) : '';
	}

	/**
	 * ユーザーが属するグループのリストを取得します。
	 * グループ レコードは次のフィールドを持ちます。
	 * 'id':   グループ ID
	 * 'name': グループ名
	 */
	public function group_list() {

		$empty_list = array();

		// ログイン ユーザーのグループ リストを取得します。
		$user = $this->user();
		if (! $user) return $empty_list;

		return ch_array_get($user, 'group_list', $empty_list);
	}

	/**
	 * 指定されたユーザー ID が、指定されたグループに所属しているか判定します。
	 */
	public function belongs_to_group($group_id) {

		$group_list = $this->group_list();

		// グループ リストに指定されたグループ ID が存在するか確認します。
		foreach ($group_list as $group) {
			if ($group['id'] == $group_id) return TRUE;
		}
		return FALSE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// セッション ID

	/**
	 * 指定されたセッション ID に対応するユーザー オブジェクトを取得します。
	 * 存在しない場合は、NULL を返します。
	 */
	public function get_user_of_session_id($session_id) {

		$CI = & get_instance();

		// ci_sessions テーブルを検索して、セッション レコードを取得します。
		// 存在しなければ NULL を返します。
		$CI->db->where('id', $session_id);
		$query = $CI->db->get('ci_sessions');
		if ($query->num_rows() == 0) return NULL;
		$session_record = $query->row_array();
		$query->free_result();

		// セッション レコードの data フィールドをデコードします。
		// このとき、自動的に現在のセッションに設定されてしまうので、
		// 現在のセッションを退避したうえで取得します。
		$this->_session_start();
		$saved_session = $_SESSION;
		{
			if (session_decode($session_record['data'])) {
				$session = $_SESSION;
			}
			else {
				$session = NULL;
			}
		}
		$_SESSION = $saved_session;
		$this->_session_write_close();

		// セッション取得に失敗した場合は、NULL を返します。
		if ($session === NULL) return NULL;

		// セッションに関連付けられているユーザー レコードを取得します。
		$user = ch_array_get($session, self::SESSION_VAR_USER, NULL);

		return $user;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// お知らせ情報

	/**
	 * お知らせ情報を取得します。
	 */
	public function get_news() {
		return get_instance()->account_model->news_get();
	}

}

/* End of file Login.php */
