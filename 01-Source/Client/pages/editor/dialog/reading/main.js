/////////////////////////////////////////////////////////////////
// 初期化
/////////////////////////////////////////////////////////////////

$(document).ready(function() {
	if (window.opener === null) {
		alert('このページを直接開いても動作しません。');
		return;
	};

	MathJax.Hub.Configured();

	ReadingDialog.instance.View = document.getElementById('textPane');
	ReadingDialog.instance.ReadingBox = document.getElementById('readingTextbox');
	ReadingDialog.instance.AccentBox = document.getElementById('accent');
	ReadingDialog.instance.getTargetText();

	// ---- enter / esc
	$(document).on({
		'keydown': function (event) {
			if (event.keyCode === 13) {
				onClickSubmit();
			} else if (event.keyCode === 27) {
				onCancel();
			}
		}
	});

	$('#readingTextbox').focus();
});





/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	//this.close();
};



/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// 再生用AUDIO要素
var g_audioNode = null;

/**
 * 「テスト」」をクリックした時の処理
 */
function onClickTest() {
	// 既存のAUDIO要素があれば再生を停止します。
	if (g_audioNode !== null) {
		g_audioNode.pause();
	}
	// 既存のAUDIO要素がなければ、新しい要素を作成します。
	else {
		g_audioNode = new Audio();
		g_audioNode.onerror = function() { alert('テスト音声データの取得に失敗しました。'); };
	}

	// 音声URLを作成します。
	var docId = window.opener.MessageManager.getDocumentId().docId;
	var text = encodeURIComponent(readingTextbox.value);
	var accentCtrl = accent.checked;
	var audioUrl = Communicator.getUrl('audioTest') + '?text=' + text + '&doc_id=' + docId + '&accent_control=' + accentCtrl;
	console.log('Audio.src: ' + audioUrl);

	// AUDIO要素のsrcにurlを設定し、再生を開始します。停止は出来ません。
	g_audioNode.src = audioUrl;
	g_audioNode.play();
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「適用」をクリックした時の処理
 */
function onClickSubmit() {
	// 読みを取得します
	var reading = escapeString(readingTextbox.value);

	// xmlList を取得します。
	var xmlList = ReadingDialog.instance.XmlList

	// アクセントスイッチを取得します
	var accentFlag = accent.checked;

	// 親ウィンドウに処理実行を要求します
	this.opener.MessageManager.setReading(xmlList, reading, accentFlag);

	// ウィンドウを閉じます
	this.close();
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「適用して次に」をクリックした時の処理
 */
function onClickSubmitAndNext() {
	// 読みを取得します
	var reading = escapeString(readingTextbox.value);

	// xmlList を取得します。
	var xmlList = ReadingDialog.instance.XmlList

	// アクセントスイッチを取得します
	var accentFlag = accent.checked;

	// 親ウィンドウに処理実行を要求します
	this.opener.MessageManager.setReading(xmlList, reading, accentFlag);

	var copyPara = ReadingDialog.instance.ParaNode.cloneNode(true);
	if (copyPara.lastChild.nodeName.toLowerCase() === 'br') copyPara.removeChild(copyPara.lastChild);

	// 編集ページの MessageManage の対応メソッドを実行します
	window.opener.MessageManager.searchNext(copyPara, true, true);
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「次を検索」をクリックした時の処理
 */
function onClickNextFind() {
	var copyPara = ReadingDialog.instance.ParaNode.cloneNode(true);
	if (copyPara.lastChild.nodeName.toLowerCase() === 'br') copyPara.removeChild(copyPara.lastChild);

	// 編集ページの MessageManage の対応メソッドを実行します
	window.opener.MessageManager.searchNext(copyPara, true, true);
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「全て適用」をクリックした時の処理
 */
function onClickSubmitAll() {
	// 文書編集ページの連続検索フラグをクリアします
	window.opener.MessageManager.clearSerialSearch();
	// 読みを取得します
	var reading = escapeString(readingTextbox.value);
	// アクセントスイッチを取得します
	var accentFlag = accent.checked;

	// キャレットを先頭に配置します。
	window.opener.MessageManager.setCaretToTop();
	// レンダラーに処理前の状態を登録させます (実際には MessageManager が記録しています)
	window.opener.MessageManager.setPreRenderSection();
	// メッセージマネージャの検索結果バッファをクリアします。
	window.opener.MessageManager.prepareRubyTypeAll(true);
	// 最初の検索を行います。
	var searchResult;
	searchResult = window.opener.MessageManager.searchNext(ReadingDialog.instance.ParaNode, true, true, true);
	while (searchResult) { // 検索結果があるうちは、繰り返します。
		// メッセージマネージャの検索結果バッファへ検索結果をためます。
		window.opener.MessageManager.prepareRubyTypeAll(false, reading, accentFlag);
		searchResult = window.opener.MessageManager.searchNext(ReadingDialog.instance.ParaNode, true, true, true);
	}

	window.opener.MessageManager.setReadingAll(); // 一括読み設定実行
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「キャンセル」をクリックした時の処理
 */
function onCancel() {
	this.close();
};

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
* 特殊文字をエスケープします
*/
function escapeString(src) {
	return src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

/**
* 特殊文字のエスケープを復元します
*/
function decodeString(src) {
	return src.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
};
