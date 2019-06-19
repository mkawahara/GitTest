<?php
	// http ヘッダ
	$headers = getallheaders();
	
	if ($headers['If-Modified-Since'] != null) {
		$time = $headers['If-Modified-Since'];
		http_response_code(304);
	}

	// ID = ファイル名とってくる
	$title = $_GET["id"];

	// EXT = 拡張子とってくる
	$ext = $_GET["ext"];

	// ファイル名作成する
	$file = "audio/" . $title . "." . $ext;

	if (file_exists($file)) {
		header('Content-Type: audio/mp3');
		header('Content-Transfer-Encoding: binary');
		//header('Expires: 1000');
		//header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
		header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
		header('Cache-Control: post-check=0, pre-check=0, max-age=1000');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		ob_clean();
		flush();
		readfile($file);
		exit;
	}
?>