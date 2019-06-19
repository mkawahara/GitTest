<?php


class User_model extends CI_Model {

	public function __construct() {
	}

	/**
	 * 指定されたアカウントの User オブジェクトを取得します。
	 * 存在しなければ NULL を返します。
	 */
	public function get_user_of_account($account) {

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
		);

		return $user;
	}

	/**
	 * 指定されたユーザーが所属するグループのリストを取得します。
	 *
	 * @param	user_id		ユーザー ID
	 * @return				GroupRecord オブジェクトの配列
	 */
	public function get_groups_of_user($user_id) {

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
				'users'	=> array($m-100, $m-100-1, $m-100-2),
			);
			$group_list[] = $group;
		}

		return $group_list;
	}

	/**
	 * 指定されたユーザー ID が、指定されたグループに所属しているか判定します。
	 */
	public function user_belongs_to_group($user_id, $group_id) {
		return
			($group_id - 100 == $user_id ) ||
			($group_id - 101 == $user_id ) ||
			($group_id - 102 == $user_id );
	}

	/**
	 * 指定されたセッション ID に対応するユーザー オブジェクトを取得します。
	 * 存在しない場合は、NULL を返します。
	 */
	public function get_user_of_session_id($session_id) {

		// ci_sessions テーブルを検索して、セッション レコードを取得します。
		// 存在しなければ NULL を返します。
		$this->db->where('id', $session_id);
		$query = $this->db->get('ci_sessions');
		if ($query->num_rows() == 0) return NULL;
		$session_record = $query->row_array();
		$query->free_result();

		// セッション レコードの data フィールドをデコードします。
		// このとき、自動的に現在のセッションに設定されてしまうので、
		// 現在のセッションを退避したうえで取得します。
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

		// セッション取得に失敗した場合は、NULL を返します。
		if ($session === NULL) return NULL;

		// セッションに関連付けられているユーザー レコードを取得します。
		$user = ch_array_get($session, Login::SESSION_VAR_USER, NULL);

		return $user;
	}

}
