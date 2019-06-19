<?php
/**
 * ChattyInftyOnline 全般のヘルパー関数を定義します。
 */

/**
 * 配列の要素を取得します。
 * キーが存在しない場合は、デフォルトの値を返します。
 * @param	ar				配列
 * @param	key				配列のキー
 * @param	default_value	デフォルトの値
 * @return					配列の要素、または、デフォルト値
 */
function ch_array_get($ar, $key, $default_value = FALSE) {
	if (array_key_exists($key, $ar)) {
		return $ar[$key];
	}
	else {
		return $default_value;
	}
}

/**
 * API レスポンスの共通のエラー コードを定義します。
 */
define('CH_SUCCESS', 0);					// 成功
define('CH_ERROR_UNAUTHORIZED', 10);		// ユーザー認証失敗
define('CH_ERROR_PARAM_SHORTAGE', 20);		// パラメータ不足
define('CH_ERROR_PARAM_INVALID', 30);		// 不適切なパラメータ
define('CH_ERROR_METHOD_INVALID', 40);		// 不適切なメソッド
define('CH_ERROR_VOICE_SERVER', 800);				// 音声サーバーとの通信に失敗しました。
define('CH_ERROR_VOICE_SERVER_RESULT', 810);		// 音声サーバーが不正な結果を返しました。
define('CH_ERROR_ACCOUNT_SERVER', 850);				// アカウント サーバーとの通信に失敗しました。
define('CH_ERROR_ACCOUNT_SERVER_RESULT', 860);		// アカウント サーバーが不正な結果を返しました。

/**
 * API レスポンスの共通部分を持つ連想配列を返します。
 * @param	error_code		エラーコード
 * @param	message			メッセージ
 * @return					レスポンスの連想配列
 */
function ch_create_response($error_code = 0, $message = '') {

	if ($message == '') {
		switch ($error_code) {
		case CH_ERROR_UNAUTHORIZED:			$message = 'ユーザー認証がされていません。'; break;
		case CH_ERROR_PARAM_SHORTAGE:		$message = 'パラメータが不足しています。'; break;
		case CH_ERROR_PARAM_INVALID:		$message = 'パラメータが不適切です。'; break;
		case CH_ERROR_METHOD_INVALID:		$message = 'メソッドが不適切です。'; break;
		case CH_ERROR_VOICE_SERVER:			$message = '音声サーバーとの通信に失敗しました。'; break;
		case CH_ERROR_VOICE_SERVER_RESULT:	$message = '音声サーバーが不正なレスポンスを返しました。'; break;
		case CH_ERROR_ACCOUNT_SERVER:		$message = 'アカウント サーバーとの通信に失敗しました。'; break;
		case CH_ERROR_ACCOUNT_SERVER_RESULT:$message = 'アカウント サーバーが不正なレスポンスを返しました。'; break;
		}
	}

	return array(
		'error_code'	=> $error_code,
		'message'		=> $message
	);
}

/**
 * レスポンスを JSON 形式でクライアントに返します。
 *
 * @param	response	レスポンスの連想配列
 */
function ch_send_response($response) {
	header('Content-Type: application/json; charset=utf-8' );
	echo json_encode($response);
}

/**
 * MySQL の DATETIME 型として指定可能な、現在時刻の文字列を作成します。
 */
function ch_current_time_string() {
	return date("Y-m-d H:i:s");
}

/**
 * 文字列を bool に変換します。
 *
 * TRUE として解釈される文字列は以下のとおりです。
 * 'true', '1', 'on'
 *
 * FALSE として解釈される文字列は以下のとおりです。
 * 'false', '0', 'off'
 *
 * ただし大小文字は区別されません。
 * 上記のどの文字列にも一致しない場合は、デフォルト値を返します。
 *
 * @param	str				文字列
 * @param	default_value	デフォルト値
 * @return					bool 値
 */
function ch_string_to_bool($str, $default_value = FALSE) {
	$str = strtolower( strval($str) );

	if ($str === 'true') 	return TRUE;
	if ($str === '1') 		return TRUE;
	if ($str === 'on') 		return TRUE;

	if ($str === 'false') 	return FALSE;
	if ($str === '0') 		return FALSE;
	if ($str === 'off') 	return FALSE;

	return $default_value;
}

///////////////////////////////////////////////////////////////////////////////
//// パス操作

/**
 * ファイルのパス名からベース名を取得します。
 * PHP の basename 関数は日本語を含むパスに対して正常動作しないため、
 * 独自にこの関数を実装しています。
 *
 * @param	path	パス名
 * @return			ベース名
 */
function ch_basename($path) {
	$path_normalized = preg_replace('/[\\\\]/u', '/', $path);
	$base = mb_strrchr($path_normalized, '/');
	if ($base === FALSE) return $path;
	else return mb_substr($base, 1);
}

/**
 * 指定されたパス名の拡張子を置換します。
 *
 * @param path		パス名
 * @param new_ext	拡張子 (ピリオド付き)
 * @return			置換後のパス名
 */
function ch_replace_extension($path, $new_ext) {

	$path_ext = pathinfo($path, PATHINFO_EXTENSION);

	$new_path = mb_substr($path, 0, mb_strlen($path) - mb_strlen($path_ext) - 1 ) . $new_ext;

	return $new_path;
}

/**
 * URL セーフな Base64 エンコードを行います。
 *
 * この関数でエンコードされた文字列は、URL として使用しても、
 * CodeIgniter によって不正な文字として認識されません。
 *
 * @param	data	バイナリ (文字列でもよい)
 * @return			エンコード文字列
 */
function base64_url_encode($data) {
	return strtr(base64_encode($data), '+/=', '-_.');
}

/**
 * URL セーフな Base64 デコードを行います。
 *
 * @param	str		エンコード文字列
 * @return			デコードされたバイナリ。文字列の場合もあります。
 *					デコードに失敗すると FALSE を返します。
 */
function base64_url_decode($str) {
	return base64_decode(strtr($str, '-_.', '+/='));
}

/**
 * パスの文字エンコーディングを、OS のエンコーディングから UTF-8 に変換します。
 */
function ch_convert_path_encoding($path) {

	// ファイル名が日本語の場合に、エンコーディングを Shift_JIS から UTF-8 に変換します。
	// ファイルシステムのエンコーディングが Shift_JIS であることを前提としています。
	// Windows 以外の OS で動作させる場合は、修正が必要になるので、注意してください。
	return mb_convert_encoding($path, 'UTF-8', 'SJIS-win');
}


///////////////////////////////////////////////////////////////////////////////
//// ファイルシステム操作

/**
 * 指定されたディレクトリ内のすべてのファイルとサブディレクトリを再帰的に列挙します。
 *
 * パスには $dir_name 引数が連結されますので、$dir_name が絶対パスであれば、
 * 戻り値のパスも絶対パスになります。
 */
function ch_scandir_absolute_path_recursively($dir_name) {

	$entry_list = @scandir($dir_name);
	if ($entry_list === FALSE) return;

	$result = array();
	foreach ($entry_list as $entry) {

		if ($entry === '.' || $entry === '..') continue;

		$entry_path = $dir_name . DIRECTORY_SEPARATOR . $entry;

		if (is_dir($entry_path)) {

			$result[] = $entry_path;
			$sub_result = ch_scandir_absolute_recursively($entry_path);
			foreach ($sub_result as $elem)  {
				$result[] = $elem;
			}
		}
		else if (is_file($entry_path)) {
			$result[] = $entry_path;
		}
	}

	return $result;
}

/**
 * 指定されたファイルまたはディレクトリを再帰的に削除します。
 */
function delete_file_recursively($file_or_dir_name) {

	// 危険なファイル名は削除しません。
	$dangerous_names = array(
		'.', '..', '...', '/', '//', '///', '\\', '\\\\',
		'C:', 'C:\\', 'C:\\\\', 'D:', 'D:\\', 'D:\\\\',
	);
	if (in_array($file_or_dir_name, $dangerous_names)) {
		return;
	}

	// 通常ファイルの場合
	if (is_dir($file_or_dir_name)) {
		delete_dir_recursively($file_or_dir_name);
	}
	else if (is_file($file_or_dir_name)) {
		@unlink($file_or_dir_name);
	}
}

/**
 * 指定されたディレクトリを再帰的に削除します。
 */
function delete_dir_recursively($dir_name) {

	$entry_list = @scandir($dir_name);
	if ($entry_list === FALSE) return;

	foreach ($entry_list as $entry) {

		if ($entry === '.' || $entry === '..') continue;

		$entry_path = $dir_name . DIRECTORY_SEPARATOR . $entry;

		if (is_dir($entry_path)) {
			delete_dir_recursively($entry_path);
		}
		else if (is_file($entry_path)) {
			@unlink($entry_path);
		}
	}

	@rmdir($dir_name);
}


///////////////////////////////////////////////////////////////////////////////
//// DOM

/**
 * DOM 要素の最初の子要素を取得します。
 * 存在しないときは NULL を返します。
 */
function ch_dom_first_child_element($elem) {
	foreach ($elem->childNodes as $node) {
		if ($node->nodeType == XML_ELEMENT_NODE) {
			return $node;
		}
	}
	return NULL;
}

/**
 * DOM 要素のすべての子要素を削除します。
 */
function ch_dom_remove_all_child_elements($elem) {
	$child_element_list = array();
	foreach ($elem->childNodes as $node) {
		if ($node->nodeType == XML_ELEMENT_NODE) {
			$child_element_list[] = $node;
		}
	}
	foreach ($child_element_list as $child_element) {
		$elem->removeChild($child_element);
	}
}

///////////////////////////////////////////////////////////////////////////////
//// タスク

/**
 * タスク ID を作成します。
 * 形式は、<user_id:6桁>-yymmdd-HHMMSS-uuuvvv になります。
 *
 * @param	user_id		ユーザー ID
 * @return				タスク ID
 */
function ch_task_id_create($user_id) {

	$user_part  = sprintf('%06d', $user_id);
	$date_part  = date("ymd-His");

	list($usec, $sec) = explode(' ', microtime());
	$micro_part = sprintf('%06d', floor(floatval($usec) * 1000000) );

	return $user_part.'-'.$date_part.'-'.$micro_part;
}

/**
 * タスク ID が有効な形式であるか確認します。
 *
 * @param	task_id		タスク ID
 * @return				bool 値
 */
function ch_task_id_is_valid($task_id) {
	$count = preg_match('/^(\d+)-(\d+)-(\d+)-(\d+)$/u', $task_id);
	return ($count == 1);
}

/**
 * タスク ID からユーザー ID を取得します。
 * 有効でない場合は 0 を返します。
 *
 * @param	task_id		タスク ID
 * @return				ユーザー ID
 */
function ch_task_id_get_user_id($task_id) {
	$matches = NULL;
	$count = preg_match('/^(\d+)-(\d+)-(\d+)-(\d+)$/u', $task_id, $matches);
	if ($count == 1) {
		return (int)($matches[1]);
	}
	return 0;
}

/**
 * task ディレクトリの絶対パスを取得します。
 * 末尾にディレクトリ区切り子は付きません。
 */
function ch_task_dir() {
	return APPPATH.'..'. DIRECTORY_SEPARATOR . 'task';
}

/**
 * ユーザーごとの task ディレクトリの絶対パスを取得します。
 */
function ch_task_user_dir($user_id) {
	$user_id = (int) $user_id;
	return ch_task_dir() . DIRECTORY_SEPARATOR . $user_id;
}

/**
 * 指定されたタスク ID から、タスク ファイルの絶対パスを作成します。
 *
 * @param task_id	タスク ID
 * @param ext		拡張子 (ピリオド付き)
 * @return			ファイルの絶対パス
 */
function ch_task_file($task_id, $ext = '') {

	// タスク ID からユーザー ID を取得します。
	$user_id = ch_task_id_get_user_id($task_id);

	// ユーザーごとの task ディレクトリの絶対パスを作成します。
	$path = ch_task_user_dir($user_id);

	// ディレクトリが存在しなければ作成します。
	if (! is_dir($path)) {
		@mkdir($path);
	}

	// ファイルのパスを作成します。
	$path = $path . DIRECTORY_SEPARATOR . ($task_id . $ext);

	return $path;
}

/**
 * バックグラウンドでプロセスを起動します。
 */
function ch_background_process_invoke($command) {
	$shell = new COM('WScript.Shell');
	$shell->Run($command, 3, FALSE);
}

/**
 * IMLX 形式と CIO 形式のファイルを相互変換します。
 * この関数は長時間実行される可能性がありますので、
 * PHP CLI から呼び出すようにしてください。
 *
 * ■IMLX 形式から CIO 形式への変換
 * 入力ファイルに拡張子 .imlx のファイル名を指定します。
 * それを some.imlx とすれば、出力ファイルは some.xml になります。
 * 終了ファイルは some.fin になります。
 *
 * ■CIO 形式から IMLX 形式への変換
 * 入力ファイルに拡張子 .xml のファイル名を指定します。
 * それを some.xml とすれば、出力ファイルは some.imlx になります。
 * 終了ファイルは some.fin になります。
 *
 * このスクリプトは、変換が終了するまでブロックされます。
 *
 * @param	input_file	入力ファイル
 * @return				終了ステータス
 */
function ch_convert_imlx_cio($input_file) {

	// exe ファイルの絶対パスを取得します。
	$exe_file = APPPATH.'/../bin/ImlxCioConverterClient.exe';

	// 変換を行います。
	$command = '"'.$exe_file.'" "'.$input_file.'"';
	$output = array();
	$status = -1;
	$last_line = exec($command, $output, $status);

	return $status;
}

