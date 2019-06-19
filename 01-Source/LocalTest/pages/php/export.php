<?php
	// ファイル名作成する
	$file = "export/test.imlx";

	if (file_exists($file)) {
		header('Cache-Control: no-store');
		header('Content-Disposition: attachment; filename=test.imlx');
		header('Content-Type: application/binary');
		header('Pragma: no-chache');
		header('Content-Length: ' . filesize($file));
		ob_clean();
		flush();
		readfile($file);
		exit;
	}
	else {
		$response = array(
		'error_code'	=> 0,
		'message'		=> '変換ファイル ' . $file . ' の取得に失敗しました'
		);
		http_response_code(500);
		header('Content-Type: application/json; charset=utf-8' );
		echo json_encode($response);
	}
?>