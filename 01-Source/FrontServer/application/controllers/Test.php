<?php

/**
 * API をテストするためののコントローラです。
 * テスト画面を表示します。
 */
class Test extends CI_Controller {

	public function index() {

		// 開発モードでなければ、空ページを表示します。
		if (ENVIRONMENT !== 'development') {
			//show_404();
			return;
		}

		$view_data = array(
		);
		$this->load->view('test', $view_data);
	}

	public function db() {

		$query = $this->input->post_get('query');
		$password = $this->input->post_get('password');
		$result = '';

		// パスワードが入力されていなければ、実行しません。
		if ($password == '') {
			$result = 'パスワードを入力してください。';
		}
		// パスワードが一致していない場合は、実行しません。
		else if ($password !== 'deetagamitai') {
			$result = 'パスワードが違います。';
		}
		else {
			// SELECT 文以外が含まれている場合は、実行しません。
			$count = preg_match('/\b(INSERT|UPDATE|REPLACE|DELETE|CREATE|ALTER|DROP|RENAME|TRUNCATE)\b/ui', $query);
			if ($count > 0) {
				$query = 'SELECT 文以外は許可していません。';
			}
			// クエリを実行します。
			else if ($query != '') {
				$q = $this->db->query($query);
				$result = $q->result_array();
			}
		}

		if ($query == '') {
			$query = 'SELECT * FROM t_drive';
		}

		$view_data = array(
			'query' 	=> $query,
			'password' 	=> $password,
			'result'	=> $result,
		);
		$this->load->view('test-db', $view_data);
	}
	
	/**
	 * 渡された GET/POST パラメータをすべてダンプします。
	 */
	public function dump() {
	
		echo '[GET]'."\n";
		var_dump($_GET);
		echo "\n\n";
		
		echo '[POST]'."\n";
		var_dump($_POST);
		echo "\n\n";

		echo '[FILES]'."\n";
		var_dump($_FILES);
		echo "\n\n";
	}
}
