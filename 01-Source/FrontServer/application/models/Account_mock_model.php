<?php

/**
 * アカウント サーバーのモックとなるモデル クラスです。
 */
class Account_mock_model extends CI_Model {

	public function __construct() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// API

	/**
	 * チャレンジ文字列を生成します。
	 */
	public function generate_challenge() {
		$data = uniqid(rand(), true);
		$challenge = hash('sha256', $data, FALSE);
		return $challenge;
	}

	/**
	 * 指定されたアカウントの User オブジェクトを取得します。
	 * 存在しなければ NULL を返します。
	 */
	private function get_user_of_account($account) {

		// アカウント ID が "userN" にマッチするか確認します。
		$matches = NULL;
		$count = preg_match('/^user(\d+)$/', $account, $matches);
		if ($count != 1) return NULL;

		// "userN" の N を取得して、ユーザー ID とします。
		$id = intval($matches[1]);
		if ($id <= 0) return NULL;

		// ユーザー ID に対応する User オブジェクトを取得します。
		$user = $this->get_user_of_id($id);

		return $user;
	}

	/**
	 * ログインを試行します。
	 * 成功すると User オブジェクトを返します。
	 * 失敗すると FALSE を返します。
	 */
	public function do_login($account, $response, $challenge) {

		// アカウント ID に対応する User オブジェクトを取得します。
		$user = $this->get_user_of_account($account);
		if (! $user) {
			return FALSE;
		}

		// 期待されるレスポンス文字列を作成します。
		$data = $user['password'] . ':' . $challenge;
		$response_expected = hash('sha256', $data, FALSE);

		// 指定されたレスポンス文字列が、期待されるレスポンス文字列と一致するか判定します。
		if ($response !== $response_expected) {
			return FALSE;
		}

		// グループ リストを作成します。
		$user['group_list'] = $this->get_group_list($user['id']);

		return $user;
	}

	/**
	 * 指定された ID の User オブジェクトを取得します。
	 * 存在しなければ NULL を返します。
	 */
	public function get_user_of_id($id) {

		$id = intval($id);
		if ($id <= 0) return NULL;

		// アカウントと生パスワードを作成します。
		$account  = 'user' . $id;
		$password = 'pass' . $id;

		// ハッシュ化パスワードを生成します。
		$passwordHash = hash('sha256', $account.':'.$password, FALSE);

		// "userN" の氏名を作成します。
		$last_name = '山田';
		$first_name = '';
		switch ($id) {
		case 1:  $first_name = '太郎'; break;
		case 2:  $first_name = '二郎'; break;
		case 3:  $first_name = '三郎'; break;
		case 4:  $first_name = '四郎'; break;
		case 5:  $first_name = '五郎'; break;
		case 6:  $first_name = '六郎'; break;
		case 7:  $first_name = '七郎'; break;
		case 8:  $first_name = '八郎'; break;
		case 9:  $first_name = '九郎'; break;
		case 10: $first_name = '十郎'; break;
		default: $first_name = $id.'郎'; break;
		}
		$name = $last_name . ' ' . $first_name;

		// User オブジェクトを作成します。
		$user = array(
			'id' 		=> $id,
			'account' 	=> 'user'.strval($id),
			'password'	=> $passwordHash,
			'name'		=> $name,
			'kind'		=> ($id % 3), // 山田太郎は 1 (一般会員)、二郎は 2 (代表者)、三郎は 3 (運営管理者)
		);

		return $user;
	}

	/**
	 * 指定されたユーザーが所属するグループのリストを取得します。
	 *
	 * @param	user_id		ユーザー ID
	 * @return				Group レコードの配列
	 */
	private function get_group_list($user_id) {

		// ユーザー ID が N のユーザーは、
		// グループ ID 100+N, 100+N+1, 100+N+2 に所属しているものとします。
		// グループ ID M には、ユーザー ID M-100, M-100-1, M-100-2 のユーザーが
		// 所属しているものとします。

		$group_list = array();

		// グループ M=100+N を追加します。
		for ($i = 0; $i < 3; $i++) {
			$m = 100 + $user_id + $i;
			$group = array(
				'id'	=> $m,
				'name'	=> 'グループ #' . $m,
				//'users'	=> array($m-100, $m-100-1, $m-100-2),
			);
			$group_list[] = $group;
		}

		return $group_list;
	}

	/**
	 * ログアウト処理を行います。
	 */
	public function do_logout($account) {
		// 何もしません
	}

	/**
	 * お知らせ情報を取得します。
	 */
	public function news_get() {
		return array(
			array(
				'infid' 	=> 1,
				'title' 	=> 'お知らせ１',
				'pubdate'	=> '20160301120010',
			),
			array(
				'infid' 	=> 2,
				'title' 	=> 'お知らせ２',
				'pubdate'	=> '20160301120020',
			),
		);
	}

}
