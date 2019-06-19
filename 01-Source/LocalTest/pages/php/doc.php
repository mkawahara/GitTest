<?php
	$fileName = "xml/doc.txt";

	$data = file_get_contents($fileName);

	header('Cache-Control: no-store');
	header('Content-type: application/json; charset=UTF-8');

	print('{"error_code": 0,"message": "","content": "');
	print($data);
	print('","revision": 10}');
?>