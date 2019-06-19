<?php

/**
 * 文書をエクスポートする API のコントローラです。
 */
class Export extends CI_Controller {

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
	//// エクスポート可能性の確認

	public function available() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// 本サーバーのディスク容量を確認します。
		$export_disk_free_space = $this->config->item('export_disk_free_space');
		$task_disk_free_space = disk_free_space(ch_task_dir());
		if ($task_disk_free_space < $export_disk_free_space) {
			$response = ch_create_response(500, 'サーバーの容量が足りません。');
			ch_send_response($response);
			return;
		}

		// データ変換サーバーの API を呼び出します。
		try {
			$result = $this->voice_model->export_available($user_id);
		}
		catch (VoiceServerException $ex) {

			// データ変換サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// データ変換サーバーが不正な結果を返した場合は、エラーを返します。
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['result'] = $result;
		ch_send_response($response);
		return;
	}


	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換の開始

	public function start() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string	= $this->input->post_get('doc_id');
		$file_type		= $this->input->post_get('file_type');

		// パラメータが不足していないか確認します。
		if ($doc_id_string == '' || $file_type == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータの文字列を値に変換します。
		$doc_id		= intval($doc_id_string);

		// パラメータが適切であるか確認します。
		$param_valid = ($doc_id > 0);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		try {
			// ユーザー ID、文書 ID に関連付けられた変換レコードが存在すれば、それを取得します。
			$convert = $this->convert_model->get_convert_of_user_doc($user_id, $doc_id, CH_CONVERT_TYPE_EXPORT);

			// 既存の変換レコードのタスクをキャンセルします。
			if ($convert) {

				$task_id = $convert['task_id'];

				// 指定されたタスク ID の変換レコードを削除します。
				$this->convert_model->delete_convert_of_task($task_id);

				// データ変換サーバーに変換キャンセルをリクエストします。
				// (データ変換サーバーとの通信エラーが発生しても、そのエラーは無視して処理を続行します。
				//  また、通信エラーが発生しても、後続の処理が成功すれば、成功レスポンスを返します。)
				try {
					$result = $this->voice_model->export_cancel($task_id);
				}
				catch (VoiceServerException $ex) { }
				catch (VoiceServerResultException $ex) { }
			}

			// 変換テーブルに、変換レコードを作成します。
			$task_id = $this->convert_model->insert_convert($user_id, $doc_id, CH_CONVERT_TYPE_EXPORT, $file_type);

			// データ変換サーバーにエクスポート変換開始をリクエストします。
			$result = $this->voice_model->export_start($task_id, $user_id, $doc_id, $file_type);
		}
		catch (VoiceServerException $ex) {

			// データ変換サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// データ変換サーバーが不正な結果を返した場合は、エラーを返します。
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['result'] = $result;
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換状態の確認

	public function status() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$doc_id_string	= $this->input->post_get('doc_id');

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

		// アクセス権等をチェックします。
		if (! $this->access_model->can_read_doc($doc_id)) return;

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		try {

			// ユーザー ID、文書 ID に関連付けられた変換レコードが存在すれば、それを取得します。
			$convert = $this->convert_model->get_convert_of_user_doc($user_id, $doc_id, CH_CONVERT_TYPE_EXPORT);

			// (1) 変換レコードが存在しない場合
			if (! $convert) {
				$result = array(
					'file_type'		=> NULL,
					'task_id'		=> NULL,
					'document_id'	=> $doc_id,
					'status'		=> 'never',
				);
			}
			// (2) 変換レコードが存在して、status が NULL でない場合
			else if ($convert['status'] != NULL) {

				// 変換終了日時からの経過時間を計算します。
				$remain_time = $this->calc_remain_time($convert['completed_at']);

				// 変換終了日時から 48時間未満の場合
				if ($remain_time != NULL) {
					$result = array(
						'file_type'		=> $convert['file_type'],
						'task_id'		=> $convert['task_id'],
						'document_id'	=> $convert['doc_id'],
						'status'		=> $convert['status'],
						'remain_time'	=> $remain_time,
					);
				}
				// 変換終了日時から 48時間以上経過している場合
				else {

					// 変換テーブルのレコードを削除します。
					$task_id = $convert['task_id'];
					$this->convert_model->delete_convert_of_task($task_id);

					// 変換後ファイルが存在すれば、削除します。
					$task_file = ch_task_file($task_id);
					if (file_exists($task_file)) {
						@unlink($task_file);
					}

					// データ変換サーバーに変換タスクのキャンセルをリクエストします。
					// (通信エラーが発生しても無視します)
					try {
						$this->voice_model->export_cancel($task_id);
					}
					catch (VoiceServerException $ex) { }
					catch (VoiceServerResultException $ex) { }

					// 処理結果を作成します。
					$result = array(
						'file_type'		=> NULL,
						'task_id'		=> NULL,
						'document_id'	=> $doc_id,
						'status'		=> 'never',
					);
				}
			}
			// (3) 変換レコードが存在して、status が NULL の場合
			else {

				// データ変換サーバーにエクスポート変換開始をリクエストします。
				$result = $this->voice_model->export_status($user_id, $doc_id);
			}
		}
		catch (VoiceServerException $ex) {

			// データ変換サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// データ変換サーバーが不正な結果を返した場合は、エラーを返します。
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['result'] = $result;
		ch_send_response($response);
		return;
	}

	/**
	 * 指定された完了時刻から現在時刻までに 48 時間未満しか経過していなければ、
	 * 残り時間を "hh:mm:ss" の形式で返します。
	 * 48 時間以上経過していれば、NULL を返します。
	 *
	 * なお、指定された時刻文字列が解析できない場合は、
	 * 時間がまったく経過していないものと解釈して "48:00:00" を返します。
	 * これは万が一の場合の機能不全を回避するためです。
	 */
	private function calc_remain_time($completed_at) {

		$limit_hour = 48;

		// 完了時刻を UNIX タイムスタンプに変換します。
		$completed_at = strtotime($completed_at);
		if ($completed_at === FALSE) {
			return sprintf('%02d:00:00', $limit_hour);
		}

		// 残り時間を計算します。
		$remain_time = ($limit_hour * 3600) - (time() - $completed_at);

		// 48 時間以上経過している場合は、NULL を返します。
		if ($remain_time < 0) return NULL;

		// 残り時間の時分秒を計算します。
		$remain_hour = (int) floor( $remain_time / 3600 );
		$remain_time -= $remain_hour * 3600;
		$remain_min  = (int) floor( $remain_time / 60);
		$remain_time -= $remain_min * 60;
		$remain_sec  = (int) ($remain_time);

		// hh:mm:ss 形式の文字列を作成します。
		return sprintf('%02d:%02d:%02d', $remain_hour, $remain_min, $remain_sec);
	}


	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換済みデータの取得

	public function file() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$task_id = $this->input->post_get('task_id');

		// パラメータが不足していないか確認します。
		if ($task_id == '') {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		$param_valid = (ch_task_id_is_valid($task_id));
		if (! $param_valid) {
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID に対応する変換レコードを取得します。
		$convert = $this->convert_model->get_convert_of_task($task_id);

		// 変換レコードが存在しない場合
		if (! $convert) {

			// HTTP ステータス 500 ＋ JSON エラーを返します。
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID に付随するファイル レコードを取得します。
		$file = $this->file_model->get_file_of_doc($convert['doc_id']);

		//  ファイル レコードが存在しない場合
		if (! $file) {

			// HTTP ステータス 500 ＋ JSON エラーを返します。
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// タスク ID に対応するファイルのパスを取得します。
		$task_file = ch_task_file($task_id);

		// 変換後のファイルが存在しない場合、
		if (! file_exists($task_file)) {

			// データ変換サーバーからダウンロードして、ファイルに保存します。
			try {

				// データ変換サーバーにエクスポート変換開始をリクエストします。
				$this->voice_model->export_file_and_save($task_id, $task_file);

				// 変換後のファイルが保存できていない場合は、
				// データ変換サーバーとの通信エラーが発生したとみなします。
				if (! file_exists($task_file)) {
					throw new VoiceServerException();
				}
			}
			catch (VoiceServerException $ex) {

				// データ変換サーバーとの通信に失敗した場合は、エラーを返します。
				http_response_code(500);
				$ex->send_response();
				return;
			}
			catch (VoiceServerResultException $ex) {

				// データ変換サーバーが不正な結果を返した場合は、エラーを返します。
				http_response_code(500);
				$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
				ch_send_response($response);
				return;
			}
		}

		// ダウンロード用ファイルの拡張子を作成します。
		$ext = '';
		if ($convert['file_type'] === 'imlx') {
			$ext = '.imlx';
		}
		else {
			$ext = '.zip';
		}

		// ダウンロード用のファイル名を作成します。
		$download_file = $file['name'] . $ext;
		
		// UTF-8 から Shift-JIS に変換します (IE が HTTP ヘッダ中の文字を Shift-JIS としてのみパースするためs)
		$download_file_sjis = mb_convert_encoding($download_file, "SJIS", "UTF-8");

		// ダウンロードさせます。
		@ob_clean();
		header("Content-type: application/binary");
		header("Content-Disposition: attachment; filename=".$download_file_sjis);
		readfile($task_file);
		@ob_flush();

		// タスク ID に対応する変換レコードの exporatble_count をデクリメントし、
		// 0 になったら、変換レコードとファイルを削除します。
		//$count = $this->convert_model->decrement_exportable_count($task_id);
		//if ($count <= 0) {
		//	$this->convert_model->delete_convert_of_task($task_id);
		//	@unlink($task_file);
		//}
	}


	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換のキャンセル

	public function cancel() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// パラメータを取得します。
		$task_id = $this->input->post_get('task_id');

		// パラメータが不足していないか確認します。
		if ($task_id == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		$param_valid = (ch_task_id_is_valid($task_id));
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID に対応する変換レコードを取得します。
		$convert = $this->convert_model->get_convert_of_task($task_id);

		// 変換レコードが存在しない場合、エラーを返します。
		if (! $convert) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// 変換テーブルのレコードを削除します。
		$this->convert_model->delete_convert_of_task($task_id);

		// 変換後ファイルが存在すれば、削除します。
		$task_file = ch_task_file($task_id);
		if (file_exists($task_file)) {
			@unlink($task_file);
		}

		try {
			// データ変換サーバーに変換タスクのキャンセルをリクエストします。
			$this->voice_model->export_cancel($task_id);
		}
		catch (VoiceServerException $ex) {

			// データ変換サーバーとの通信に失敗した場合は、エラーを返します。
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// データ変換サーバーが不正な結果を返した場合は、エラーを返します。
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換数の取得

	public function count() {

		// ユーザー認証がなされているか確認します。
		if (! $this->login->has_logined()) {
			$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// ユーザーのエクスポート変換数を取得します。
		$export_count = $this->convert_model->get_export_count_of_user($user_id);

		// 成功レスポンスを返します。
		$response = ch_create_response();
		$response['count'] = $export_count;
		ch_send_response($response);
		return;
	}


	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換の完了登録

	/**
	 * この API はデータ変換サーバーのみから呼び出されます。
	 */
	public function register() {

		// データ変換サーバーからのアクセスであるか確認します。
		if (0) {		// @debug リリース環境では 1 にすること。
			if (! $this->access_model->is_voice_server()) {
				$response = ch_create_response(CH_ERROR_UNAUTHORIZED);
				ch_send_response($response);
				return;
			}
		}

		// パラメータを取得します。
		$task_id				= $this->input->post_get('task_id');
		$completed_at_string	= $this->input->post_get('completed_at');
		$status					= $this->input->post_get('status');

		// パラメータが不足していないか確認します。
		if ($task_id == '' || $completed_at_string == '' || $status == '') {
			$response = ch_create_response(CH_ERROR_PARAM_SHORTAGE);
			ch_send_response($response);
			return;
		}

		// パラメータが適切であるか確認します。
		// (データ変換サーバーが文字列ではなく配列で送ってくることがあるため、ここで検査します)
		$param_valid = is_string($completed_at_string);
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// $completed_at を ISO 8601 形式から UNIX タイムスタンプ形式に変換します。
		// 変換できない場合は、FALSE を返します。
		$completed_at_timestamp = strtotime($completed_at_string);
		if ($completed_at_timestamp) {
			$completed_at = date("Y-m-d H:i:s", $completed_at_timestamp);
		}
		else {
			$completed_at = '';
		}

		// パラメータが適切であるか確認します。
		$param_valid = (ch_task_id_is_valid($task_id)) && ($completed_at != '') && (is_string($status));
		if (! $param_valid) {
			$response = ch_create_response(CH_ERROR_PARAM_INVALID);
			ch_send_response($response);
			return;
		}

		// タスク ID に対応する変換レコードを取得します。
		$convert = $this->convert_model->get_convert_of_task($task_id);

		// 変換レコードが存在しない場合、エラーを返します。
		if (! $convert) {
			$response = ch_create_response(100, 'タスク ID がありません。');
			ch_send_response($response);
			return;
		}

		// ログイン ユーザーのユーザー ID を取得します。
		$user_id = $this->login->user_id();

		// タスク ID に対応するファイルのパスを取得します。
		$task_file = ch_task_file($task_id);

		// データ変換サーバーからダウンロードして、ファイルに保存します。
		try {

			// データ変換サーバーにエクスポート変換開始をリクエストします。
			$this->voice_model->export_file_and_save($task_id, $task_file);

			// 変換後のファイルが保存できていない場合は、
			// データ変換サーバーとの通信エラーが発生したとみなします。
			if (! file_exists($task_file)) {
				throw new VoiceServerException();
			}

			// 変換レコードを更新します。
			$convert_update = array(
				'completed_at'	=> $completed_at,
				'status'		=> $status,
			);
			$this->convert_model->update_convert_of_task($task_id, $convert_update);
		}
		catch (VoiceServerException $ex) {

			// データ変換サーバーとの通信に失敗した場合は、エラーを返します。
			http_response_code(500);
			$ex->send_response();
			return;
		}
		catch (VoiceServerResultException $ex) {

			// データ変換サーバーが不正な結果を返した場合は、エラーを返します。
			http_response_code(500);
			$response = ch_create_response(CH_ERROR_VOICE_SERVER_RESULT);
			ch_send_response($response);
			return;
		}

		// 成功レスポンスを返します。
		$response = ch_create_response();
		ch_send_response($response);
		return;
	}
}
