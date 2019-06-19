<?php

/**
 * ユーザーのログイン/ログアウトを行う API のコントローラです。
 */
class User extends CI_Controller {

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

	public function challenge() {

		// チャレンジ文字列を生成します。
		try {
			$value = $this->login->generate_challenge();
		}
		catch (AccountServerException $ex) {
			$response = ch_create_response(CH_ERROR_ACCOUNT_SERVER);
			ch_send_response($response);
			return;
		}
		catch (AccountServerResultException $ex) {
			$response = ch_create_response(CH_ERROR_ACCOUNT_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// レスポンスを返します。
		$response = ch_create_response();
		$response['value'] = $value;
		ch_send_response($response);
	}

	public function login() {

		// パラメータを取得します。
		$account = $this->input->post_get('account');
		$challenge_response = $this->input->post_get('response');

		// パラメータが指定されているか確認します。
		if ($account == '' || $challenge_response == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE, 'パラメータが足りません。');
			ch_send_response($response);
			return;
		}

		// ログインを試行します。
		try {
			$success = $this->login->do_login($account, $challenge_response);
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

		if (! $success) {
			$response = ch_create_response(100, 'ログイン認証に失敗しました。');
			ch_send_response($response);
			return;
		}

		// ユーザー ID を取得します。
		$user_id = $this->login->user();

		// ログイン成功のレスポンスを返します。
		$response = ch_create_response();
		$response['user'] = $user_id;
		ch_send_response($response);

		// HTTP コネクションをクローズします。
		ob_end_flush();

		// ログイン時の定期実行処理を行います。
		$this->clean_import_task_files($user_id);

		return;
	}

	private function clean_import_task_files($user_id) {

		// task ユーザー ディレクトリを取得します。
		$user_dir = ch_task_user_dir($user_id);

		// ディレクトリ内のファイルを列挙します。
		$file_list = @scandir($user_dir);
		if (! $file_list) return;

		foreach ($file_list as $file) {

			// 特殊ディレクトリはスキップします。
			if ($file === '.' || $file === '..') continue;

			// パスを作成します。
			$file = $user_dir . DIRECTORY_SEPARATOR . $file;

			// 通常ファイルでなければスキップします。
			if (! is_file($file)) continue;

			// .fin ファイル (インポート終了ファイル) の場合
			if (0 < preg_match('/\.fin$/ui', $file)) {

				// ファイルの作成日時を取得します。
				// (Linux 上では更新日時になりますが、実際上は問題になりません)
				$created_time = @filectime($file);
				if ($created_time === FALSE) continue;

				// ファイルが作成された日時から 1 日以上経過していれば、削除します。
				if (time() - $created_time >= 24 * 3600) {
					@unlink($file);
				}
			}

			// .zip ファイル (インポート ZIP ファイル) の場合
			if (0 < preg_match('/\.zip$/ui', $file)) {

				// ファイルの作成日時を取得します。
				// (Linux 上では更新日時になりますが、実際上は問題になりません)
				$created_time = @filectime($file);
				if ($created_time === FALSE) continue;

				// ファイルが作成された日時から 1 日以上経過していれば、削除します。
				if (time() - $created_time >= 24 * 3600) {
					@unlink($file);
					delete_dir_recursively($file . '.dir');
				}
			}
		}
	}

	public function haslogined() {
		$response = ch_create_response();
		$response['value'] = $this->login->has_logined();
		ch_send_response($response);
		return;
	}

	public function logout() {

		// ログアウトします。
		//
		// 【実装メモ】
		// 編集中のファイルがある場合、データベースの外部キー制約により、
		// 自動的に編集解除が行われます。
		//
		$this->login->do_logout();

		// ログアウト成功のレスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

}
