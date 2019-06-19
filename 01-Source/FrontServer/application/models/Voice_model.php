<?php

/**
 * データ変換サーバーとの通信エラーを表す例外クラスです。
 */
class VoiceServerException extends Exception {
	var $status;
	var $error_detail;

	function __construct($status = 0, $error_detail = FALSE) {
		$this->status = $status;
		$this->error_detail = $error_detail;

		if (! $this->error_detail) {
			$this->error_detail = array(
				'label'		=> 'unknown error',
				'title'		=> '未知のエラーです。',
				'desc'		=> '',
			);
		}
	}

	/**
	 * クライアントにエラー レスポンスを返します。
	 */
	function send_response() {
		$response = ch_create_response(CH_ERROR_VOICE_SERVER);
		$response['error_detail'] = $this->error_detail;
		ch_send_response($response);
		return;
	}
}

/**
 * データ変換サーバーから結果エラーを表す例外クラスです。
 */
class VoiceServerResultException extends Exception {
}

/**
 * データ変換サーバーとの通信を行うモデル クラスです。
 */
class Voice_model extends CI_Model {

	public function __construct() {
	}

	//////////////////////////////////////////////////////////////////////////////
	//// データ変換サーバーとの通信

	/**
	 * データ変換サーバーの API を呼び出します。
	 */
	private function call_voice_server($api, $method = 'GET', $params = NULL, $headers = NULL, $is_multipart = FALSE) {

		// API の URL を作成します。
		$url = $this->config->item('voice_server_url') . $api;

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
				if ($is_multipart) {
					$http['content'] = $this->make_multipart_content($params, $headers);
				}
				else {
					$http['content'] = http_build_query($params);
				}
			}
			else {
				trigger_error("Invalid HTTP request method '$method'.", E_USER_ERROR);
				throw new VoiceServerException(0, FALSE);
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

		// サーバーに接続して、レスポンスを取得します。
		// 【実装メモ】file_get_contents 関数はサーバーが 200 以外の
		// ステータス コードを返した場合、戻り値が FALSE になります。
		// このとき、warning が発生しますので、エラー制御演算子 @ を付ける必要があります。
		$response = @file_get_contents($url, FALSE, $context);

		// タイムアウトの場合
		if (count($http_response_header) == 0) {

			// エラー詳細オブジェクトを作成します。
			$error_detail = array(
				'label'		=> 'voice server timeout',
				'title'		=> 'タイムアウト エラーです。',
				'desc'		=> 'データ変換サーバーへのリクエストがタイムアウトしました。',
				'detail'	=> "リクエスト URL: " . $url,
			);

			// 通信エラーをログに記録します。
			$message = sprintf('Voice server error of "%s" API : Connection timeout.', $api);
			log_message('debug', $message);

			// VoiceServerException 例外をスローします。
			throw new VoiceServerException(0, $error_detail);
		}

		// ステータス コードを取得します。
		list($version, $status, $message) = @explode(' ', $http_response_header[0], 3);

		// ステータス コードが 200-201 の場合、レスポンスをそのまま返します。
		if ($status == 200 || $status == 201) {
			return $response;
		}

		// ステータス コードが 250 の場合、エラー詳細オブジェクトを取得します。
		$error_detail = FALSE;
		if ($status == 250) {

			// レスポンス ボディをエラー詳細オブジェクトの JSON として解析します。
			$error_detail = $this->parse_error_detail_json($response);

			// 解析できなかった場合
			if ($error_detail === FALSE) {
				$error_detail = array(
					'label'		=> 'invalid format response',
					'title'		=> 'データ変換サーバーのエラー詳細情報を取得できませんでした。',
					'desc'		=> 'データ変換サーバーのレスポンス形式が不正です。',
					'detail'	=> ($response) ? $response : '',
				);
			}
		}
		// ステータス コードが 200-201,250 以外である場合
		else {
			$error_detail = array(
				'label'		=> 'invalid HTTP status code',
				'title'		=> 'データ変換サーバー内部エラーです。',
				'desc'		=> 'HTTP ステータス コードが不正です。データ変換サーバー内部で想定外のエラーが発生しています。',
				'detail'	=> 'HTTP スタータス コード: ' . $status,
			);
		}

		// 通信エラーをログに記録します。
		$message = sprintf('Voice server error of "%s" API : %s %s', $api, $status, $message);
		log_message('debug', $message);

		// VoiceServerException 例外をスローします。
		throw new VoiceServerException($status, $error_detail);
	}

	/**
	 * マルチパート コンテントを作成して返します。
	 * $header 配列引数には "Content-Type: multipart/form-data; boundary=..." というヘッダーが
	 * 追加されます。
	 */
	private function make_multipart_content($params, & $header) {

		// マルチパート コンテントの境界文字列を作成します。
		$boundary = 'MULTIPART_BOUNDARY_' . hash('sha256', microtime(TRUE));

		// ヘッダーに Content-Type を追加します。
		$header[] = 'Content-Type: multipart/form-data; boundary=' . $boundary . "\r\n";

		// パラメータごとにコンテント データを作成します。
		$content = '';
		foreach ($params as $name => $value) {
			$content .= '--' . $boundary . "\r\n";

			// PHP の FILE レコードと同じものが指定された場合
			if (is_array($value) && isset($value['name']) && isset($value['tmp_name']) ) {

				// FILE レコードの要素を取得します。
				$file_name = $value['name'];
				$file_path = $value['tmp_name'];
				$file_type = ch_array_get($value, 'type', '');
				$file_size = ch_array_get($value, 'size', 0);

				// 一時ファイルの中身を取得します。
				$file_content =  @file_get_contents($file_path);
				if ($file_content === FALSE) {
					$file_content = '';
				}

				// コンテント データを作成します。
				$content .= 'Content-Disposition: form-data; name="'.$name.'"; filename="'. $file_name.'"' . "\r\n";
				if ($file_type) {
					$content .= 'Content-Type: '.$file_type."\r\n";
				}
				if ($file_size) {
					$content .= 'Content-Length: '.$file_size."\r\n";
				}
				$content .= 'Content-Transfer-Encoding: binary' . "\r\n";
				$content .= "\r\n";
				$content .= $file_content;
			}
			// 通常の変数の場合
			else {
				$content .= 'Content-Disposition: form-data; name="'.$name.'"' . "\r\n";
				$content .= "\r\n";
				$content .= $value;
			}

			$content .= "\r\n";
		}

		// コンテントにフッターを追加します。
		$content .= '--'.$boundary.'--'. "\r\n";

		return $content;
	}

	/**
	 * 文字列を error_detail 形式の JSON 文字列として解析し、
	 * 解析後のオブジェクトを返します。
	 * 解析できない場合は FALSE を返します。
	 */
	private function parse_error_detail_json($json) {
		$obj = @json_decode($json, TRUE);
		if (json_last_error() === JSON_ERROR_NONE) {
			if (is_object($obj) &&
				array_key_exists('label', $obj) &&
				array_key_exists('title', $obj) &&
				array_key_exists('desc', $obj))
			{
				return $obj;
			}
		}
		return FALSE;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 文書辞書

	/**
	 * システム辞書名の一覧を取得します。
	 * 戻り値は文字列の配列です。
	 */
	public function get_system_dictionary_list() {
		$json = $this->call_voice_server('dictionary/index');
		$name_list = json_decode($json, TRUE);
		return $name_list;
	}

	/**
	 * システム辞書を取得します。
	 * 引数の $name には get_system_dictionary_list メソッドで取得できる
	 * システム辞書名の１つを指定します。
	 * 戻り値は XML 文字列です。
	 */
	public function get_system_dictionary($name) {
		//$params = array('dictionary_name' => $name);
		$params = array('name' => $name);
		$response = $this->call_voice_server('dictionary/lookup', 'GET', $params);
		return $response;
	}

	/**
	 * デフォルトの文書辞書を取得します。
	 * 戻り値は XML 文字列です。
	 */
	public function get_default_dictionary() {

		// システム辞書名のリストを取得します。
		$name_list = $this->get_system_dictionary_list();
		if (count($name_list) == 0) return '';

		// 最初のシステム辞書の内容を取得します。
		$dictionary = $this->get_system_dictionary($name_list[0]);

		return $dictionary;
	}

	/**
	 * 文書辞書をデータ変換サーバーに登録します。
	 */
	public function register_dictionary($doc_id) {
		$params = array('document_id' => $doc_id);
		$response = $this->call_voice_server('dictionary/register', 'POST', $params);
	}

	/**
	 * 文書辞書をデータ変換サーバーから登録解除します。
	 */
	public function unregister_dictionary($doc_id) {
		$params = array('document_id' => $doc_id);
		$response = $this->call_voice_server('dictionary/unregister', 'POST', $params);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 音声設定

	/**
	 * システム音声設定名の一覧を取得します。
	 * 戻り値は文字列の配列です。
	 */
	public function get_system_voice_setting_list() {
		$json = $this->call_voice_server('setting/index');
		$name_list = json_decode($json, TRUE);
		return $name_list;
	}

	/**
	 * システム音声設定を取得します。
	 * 引数の $name には get_system_voice_setting_list メソッドで取得できる
	 * システム音声設定名の１つを指定します。
	 * 戻り値は XML 文字列です。
	 */
	public function get_system_voice_setting($name) {
		$params = array('name' => $name);
		$response = $this->call_voice_server('setting/lookup', 'GET', $params);
		return $response;
	}

	/**
	 * デフォルトの音声設定を取得します。
	 * 戻り値は XML 文字列です。
	 */
	public function get_default_voice_setting() {

		// システム音声設定名のリストを取得します。
		$name_list = $this->get_system_voice_setting_list();
		if (count($name_list) == 0) return '';

		// 最初のシステム音声設定の内容を取得します。
		$voice_setting = $this->get_system_voice_setting($name_list[0]);

		return $voice_setting;
	}

	/**
	 * 音声設定が更新されたことを通知します。
	 */
	public function register_voice_setting($doc_id) {
		$params = array('document_id' => $doc_id);
		$response = $this->call_voice_server('setting/register', 'POST', $params);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 変換設定

	/**
	 * デフォルトの変換設定を取得します。
	 */
	public function get_default_convert_setting() {
		$xml = $this->call_voice_server('export/default-setting');
		return $xml;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 話者

	/**
	 * 話者名一覧を取得します。
	 * 戻り値は文字列の配列です。
	 */
	public function get_speaker_list() {
		$json = $this->call_voice_server('setting/speakers');
		$name_list = json_decode($json, TRUE);
		return $name_list;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// ハイライト分割

	/**
	 * ハイライト分割情報を取得します。
	 * 戻り値は、連想配列になります。
	 * その仕様については仕様書を参照してください。
	 */
	public function get_highlight_split($doc_id, $p_xml, $start_id, $speaker_list_json) {
		$params = array(
			'document_id'		=> $doc_id,
			'sentence'			=> $p_xml,
			'current_cursol'	=> $start_id,
			'speaker_list'		=> $speaker_list_json,
		);
		$json = $this->call_voice_server('split-highlight', 'POST', $params);
		return json_decode($json, TRUE);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 読み上げ音声

	/**
	 * データ変換サーバーから読み上げ音声データを取得し、
	 * そのレスポンスをそのままクライアントに流します。
	 */
	public function send_voice_data($audio_id) {

		// データ変換サーバーから音声データを取得します。
		$api = 'audio/'.$audio_id.'/mp3';
		$response = $this->call_voice_server($api);

		// クライアントに音声データを返します。
		$this->send_voice_data_to_client($response, TRUE);
	}

	private function send_voice_data_to_client($data, $do_cache) {
		header('Content-Type: audio/mpeg');
		header('Content-Length: ' . strlen($data));
		if ($do_cache) {
			$cache_period = 24 * 60 * 60;
			header('Last-Modified: Fri Jan 01 2010 00:00:00 GMT');
			header('Cache-Control: public, max-age=' . $cache_period);
			header('Pragma: public');
			header('Expires: ' . gmdate('D, d M Y H:i:s T', time() + $cache_period));
		}
		else {
			header('Cache-Control: no-cache');
			header('Pragma: no-cache');
		}
		echo $data;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// テスト再生の音声取得

	/**
	 * データ変換サーバーからテスト再生用の音声データを取得し、
	 * そのレスポンスをそのままクライアントに流します。
	 */
	public function send_voice_test_data(
		$text,
		$doc_id = NULL,
		$dictionary = NULL,
		$voice_setting = NULL,
		$accent_control = NULL)
	{

		// データ変換サーバーへのパラメータを作成します。
		$params = array('text' => $text);
		if ($doc_id) {
			$params['document_id'] = $doc_id;
		}
		if ($dictionary) {
			$params['temp_dictionary'] = $dictionary;
		}
		if ($voice_setting) {
			$params['audio_setting'] = $voice_setting;
		}
		if ($accent_control) {
			$params['accent_control'] = $accent_control;
		}

		// データ変換サーバーから音声データを取得します。
		$response = $this->call_voice_server('audio-adhoc/mp3', 'POST', $params);

		// クライアントに音声データを返します。
		$this->send_voice_data_to_client($response, FALSE);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// 読み上げテキストの取得

	/**
	 * データ変換サーバーから読み上げテキストを取得します。
	 */
	public function get_read_text($text) {

		// データ変換サーバーへのパラメータを作成します。
		$params = array('text' => $text);

		// データ変換サーバーから読み上げテキストを取得します。
		$response = $this->call_voice_server('audio/accent-string', 'POST', $params);

		return $response;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換可能性の取得

	/**
	 * データ変換サーバーにユーザーのエクスポート変換可能性を問い合わせます。
	 * 戻り値は連想配列になります。
	 * データ変換サーバーからのレスポンスが JSON 形式として解析できない場合は
	 * VoiceServerResultException 例外をスローします。
	 *
	 * @param	user_id		ユーザー ID
	 * @return				連想配列
	 */
	public function export_available($user_id) {

		$params = array('user_id' => $user_id);
		$response = $this->call_voice_server('export/quota', 'GET', $params);

		// データ変換サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new VoiceServerResultException();
		}

		return $result;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換のキャンセル

	public function export_cancel($task_id) {

		$params = array('task_id' => $task_id);
		$response = $this->call_voice_server('export/cancel', 'POST', $params);

		// データ変換サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new VoiceServerResultException();
		}

		return $result;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換の開始

	public function export_start($task_id, $user_id, $doc_id, $file_type) {

		$params = array(
			'task_id'     => $task_id,
			'user_id'     => $user_id,
			'document_id' => $doc_id,
			'file_type'   => $file_type,
		);
		$response = $this->call_voice_server('export/request', 'POST', $params);

		// データ変換サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new VoiceServerResultException();
		}

		return $result;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換の状態確認

	public function export_status($user_id, $doc_id) {

		$params = array(
			'user_id'     => $user_id,
			'document_id' => $doc_id,
		);
		$response = $this->call_voice_server('export/status', 'GET', $params);

		// データ変換サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new VoiceServerResultException();
		}

		return $result;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポート変換済みファイルの取得

	/**
	 * 指定されたタスク ID の変換済ファイルをデータ変換サーバーから取得し、
	 * 指定されたファイルに保存します。
	 *
	 * @param	$task_id				タスク ID
	 * @param	$task_file				保存先のファイル名
	 * @throws	VoiceServerException	データ変換サーバーとの通信に失敗した場合にスローされます。
	 */
	public function export_file_and_save($task_id, $task_file) {

		$params = array(
		);
		$response = $this->call_voice_server('export/file/'.$task_id, 'GET', $params);

		// レスポンスをファイルに保存します。
		@file_put_contents($task_file, $response);
	}

	//////////////////////////////////////////////////////////////////////////////
	//// インポート変換の開始

	/**
	 * インポート変換の開始をデータ変換サーバーにリクエストします。
	 *
	 * @param task_id		ch_task_id_create 関数により新規に生成したタスク ID を指定します。
	 * @param imlx_file		IMLX ファイルに対応する FILE レコードです。次の要素を持ちます。
	 *						'name'			ファイルのオリジナルの名前 (必須)
	 *						'tmp_name'		一時ファイルのパス (必須)
	 *						'type'			ファイルの MIME タイプ (オプション)
	 *						'size'			ファイル サイズ (オプション)
	 */
	public function import_start($task_id, $imlx_file) {

		$params = array(
			'task_id'		=> $task_id,
			'imlx_file'		=> $imlx_file,
		);
		$response = $this->call_voice_server('upload/request', 'POST', $params, NULL, TRUE);

		// データ変換サーバーからのレスポンスを JSON 形式として解析します。
		$result = @json_decode($response, TRUE);
		if (json_last_error() !== JSON_ERROR_NONE) {
			throw new VoiceServerResultException();
		}

		return $result;
	}

	//////////////////////////////////////////////////////////////////////////////
	//// インポート変換の変換済みファイルの取得

	/**
	 * import_start メソッドで開始したインポート変換の変換後のファイルを取得します。
	 *
	 * データ変換サーバーとの通信に失敗し、200 以外のステータスを返した場合は、
	 * VoiceServerException 例外が発生します。
	 *
	 * データ変換サーバーとの通信に成功した場合でも、変換が未完了の場合は
	 * VoiceServerException 例外が発生し、
	 * その status フィールドが 404 ステータスになります。
	 *
	 * 変換に成功すると、取得した ZIP ファイルのパスを返します。
	 */
	public function import_get($task_id) {

		$params = array(
		);
		$response = $this->call_voice_server('upload/file/'.$task_id, 'GET', $params);

		// ZIP ファイル名を作成します。
		$zip_file = ch_task_file($task_id, '.zip');

		// レスポンスを ZIP ファイルに保存します。
		@file_put_contents($zip_file, $response);

		return $zip_file;
	}

}
