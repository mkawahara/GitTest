<?php
	$fileName = "xml/para";
	$fileExt = ".txt";
	$no = $_POST["p_id"];

	$data = file_get_contents($fileName . $no . $fileExt);

	header('Cache-Control: no-store');
	header('Content-type: application/json; charset=UTF-8');

	print('{"error_code": 0,"message": "","content": "');
	print($data);
	print('"}');
?>