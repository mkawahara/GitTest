<?php
	define('HIGHLIGHT_COUNT', '3');

	// http ヘッダの指定
	header('Cache-Control: no-store');
	header('Content-type: application/json; charset=UTF-8');

	// リクエストデータを取得
	$docId = $_POST['doc_id'];
	$paraXml = $_POST['p'];

	// xml を取得し、domに変換
	$doc = new DOMDocument();
	$doc->loadXML('<?xml version="1.0" encoding="UTF-8"?>' . $paraXml);

	// ハイライト分割実行（できとー）
	$chars = $doc->getElementsByTagName('c');

	$highlights = Array();
	$highlights[] = $chars[0]->getAttribute('id');

	$min = 1;

	for ($i = 1; $i < HIGHLIGHT_COUNT; $i++) {
		$value = mt_rand($min, $chars->length - 1);

		$highlights[] = $chars[$value]->getAttribute('id');
		$min = $value + 1;

		if ($min >= $chars->length) break;
	}

	// 音声URL作成（でたらめ）
	$list = array();

	for ($i = 0; $i < count($highlights); $i++) {
		$temp = array('first_id' => $highlights[$i], 'url' => $i . '.mp3');
		$list[] = $temp;
	}

	// レスポンス作成
	$response = json_encode(array('info' => $list));

	// レスポンス実行
	echo $response;
?>