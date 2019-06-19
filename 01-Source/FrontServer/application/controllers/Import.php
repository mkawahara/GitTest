<?php

/**
 * 文書をインポートする API のコントローラです。
 */
class Import extends CI_Controller {

	/**
	 * コンストラクタ
	 */
	public function __construct() {
		parent::__construct();
		$this->load->model('file_model');
		$this->load->model('doc_model');
		$this->load->model('access_model');
		$this->load->model('voice_model');
		$this->load->model('convert_model');
	}

	/**
	 * コマンド指定なしの場合は、空レスポンスを返します。
	 */
	public function index() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// インポート変換の開始

	public function start() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$imlx_file = ch_array_get($_FILES, 'imlx_file');

		// パラメータが不足していないか確認します。
		if ($imlx_file == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		$param_valid = is_array($imlx_file) &&
					isset($imlx_file['name']) &&
					isset($imlx_file['tmp_name']) &&
					is_uploaded_file($imlx_file['tmp_name']);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// タスク ID を作成します。
		$task_id = ch_task_id_create($user_id);

		// 音声サーバーにインポート開始をリクエストします。
		try {
			$result = $this->voice_model->import_start($task_id, $imlx_file);
		}
		catch (VoiceServerException $ex) {

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// 音声サーバーが不正な結果を返した場合は、エラーを返します。
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// レスポンスを返します。
		$response = ch_create_response();
		$response['result'] = $result;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// インポート変換の完了処理

	public function complete() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$task_id 			= $this->input->post_get('task_id');
		$folder_id_string 	= $this->input->post_get('folder_id');

		// パラメータが不足していないか確認します。
		if ($task_id == '' || $folder_id_string == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$folder_id = intval($folder_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ch_task_id_is_valid($task_id) && ($folder_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// フォルダがアクセス可能であるか判定します。
		if (! $this->access_model->is_accessible_folder($folder_id)) return;

		// すでにインポートが完了しているならば、
		// 何も処理せずに、成功したものとして扱います。
		if ($this->check_already_finished($task_id)) {
			return;
		}

		// 音声サーバーからインポート変換後の ZIP ファイルを取得します。
		try {
			$zip_file = $this->voice_model->import_get($task_id);

			// 念のためファイルの存在確認を行います。
			if (! file_exists($zip_file)) {
				throw new VoiceServerException();
			}
		}
		catch (VoiceServerException $ex) {

			// インポートが未完了の場合は、音声サーバーは 404 ステータスを返すので、
			// その場合は、クライアントに通知します。
			if ($ex->status == 404) {
				$response = ch_create_response(CH_ERROR_VOICE_SERVER);
				// この場合は error_detail は返しません。
				$response['finished'] = FALSE;
				$response['file'] = NULL;
				ch_send_response($response);
				return;
			}

			// 音声サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}

		// ZIP ファイルの展開後のディレクトリ名を作成します。
		$zip_dir = $zip_file . '.dir';

		// ZIP ファイルを展開して、その中の CIO 形式ファイルを取得します。
		list($cio_file, $import_name) = $this->extract_imported_files($zip_file, $zip_dir);

		// ZIP 展開できなかった場合は 500 エラーを返します。
		if ($cio_file == NULL) {
			$this->delete_imported_files($zip_file, $zip_dir);
			$response = ch_create_response(500, '変換に失敗しました。');
			ch_send_response($response);
			return;
		}

		// 追加：2015年12月9日、ここまでの処理に長い時間がかっかっていると、
		// MySQL の接続がタイムアウトしてしまう場合がありますので、
		// ここで再接続をすることにより、後続のデータベース操作で
		// "MySQL server has gone away" エラーが発生しないようにします。
		$this->load->database();
		$this->db->reconnect();

		// CIO 形式ファイルをインポートします。
		$user_id = $this->login->user_id();
		$file_id = $this->file_model->import_file($cio_file, $folder_id, $user_id, $import_name);

		// すべての処理が完了したので、
		// 終了ファイルにファイル ID を書き込みます。
		$final_file  = ch_task_file($task_id, '.fin');
		file_put_contents($final_file, $file_id);

		// 既存の ZIP ファイル、および、展開ファイルをすべて削除します。
		$this->delete_imported_files($zip_file, $zip_dir);

		// ファイルの内容を取得します。
		$file = $this->file_model->get_file($file_id, TRUE);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['finished'] = TRUE;
		$response['file'] = $file;
		ch_send_response($response);
		return;
	}

	/**
	 * 指定されたタスク ID のインポート処理がすでに完了しているか確認します。
	 * 完了している場合は、クライアントに成功レスポンスを返し、TRUE を返します。
	 * 完了していない場合は、FALSE を返します。
	 */
	private function check_already_finished($task_id) {

		// 終了ファイルが存在するか確認します。
		$final_file  = ch_task_file($task_id, '.fin');
		if (! is_file($final_file)) return FALSE;

		// 終了ファイルの内容を取得します。
		$file_id = (int) @ file_get_contents($final_file);
		if ($file_id <= 0) return FALSE;

		// ファイル ID が存在するか確認します。
		$file = $this->file_model->get_file($file_id, TRUE);
		if (! $file) return FALSE;

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['finished'] = TRUE;
		$response['file'] = $file;
		ch_send_response($response);
		return TRUE;
	}

	/**
	 * ZIP ファイルを展開して、その中の次の 4 つのファイルが存在するか確認し、
	 * document.xml のフルパスと、filename.txt の内容を返します。
	 * 失敗した場合は array(NULL, NULL) を返します。
	 *
	 * document.xml			(CIO 形式)
	 * document.anime.xml	(アニメーション XML)
	 * document.doc.xml		(辞書データ XML)
	 *
	 * @param $zip_file		展開する ZIP ファイル
	 * @param $zip_dir		展開先のディレクトリ
	 * @return				document.xml のフルパス
	 * @return				ドキュメントのファイル名
	 */
	private function extract_imported_files($zip_file, $zip_dir) {

		$result_null = array(NULL, NULL);

		// ZIP ファイルを展開します。
		$zip_archive = new ZipArchive();
		if (! $zip_archive->open($zip_file)) return $result_null;
		$zip_archive->extractTo($zip_dir);
		$zip_archive->close();

		// ディレクトリ内のすべてのファイルのリストを取得します。
		$file_list = ch_scandir_absolute_path_recursively($zip_dir);

		// CIO 形式ファイル、アニメーション ファイル、辞書データ ファイルのパスを初期化します。
		$cio_file = NULL;
		$anime_file = NULL;
		$dic_file = NULL;
		$filename_file = NULL;

		// ディレクトリ内にあるファイルを検索します。
		foreach ($file_list as $file) {

			// 通常ファイルでなければスキップします。
			if (! is_file($file)) continue;

			// ファイル名を UTF-8 に変換します。
			$file_utf8 = ch_convert_path_encoding($file);

			// .anime.xml で終了している場合
			if (0 < preg_match('/\.anime\.xml$/ui', $file_utf8)) {
				$anime_file = $file;
				continue;
			}

			// .dic.xml で終了している場合
			if (0 < preg_match('/\.dic\.xml$/ui', $file_utf8)) {
				$dic_file = $file;
				continue;
			}

			// .xml で終了している場合
			if (0 < preg_match('/\.xml$/ui', $file_utf8)) {
				$cio_file = $file;
				continue;
			}

			// filename.txt の場合
			if (0 < preg_match('/filename.txt$/ui', $file_utf8)) {
				$filename_file = $file;
				continue;
			}
		}

		// CIO ファイルと filename.txt が取得できているか確認します。
		if ($cio_file == NULL || $filename_file == NULL) return $result_null;

		// filename.txt からファイル名を取得します。
		$filename = @file_get_contents($filename_file);
		if ($filename == NULL) return $result_null;
		$filename = trim($filename);

		return array($cio_file, $filename);
	}

	private function delete_imported_files($zip_file, $zip_dir) {
		@unlink($zip_file);
		delete_dir_recursively($zip_dir);
	}

}
