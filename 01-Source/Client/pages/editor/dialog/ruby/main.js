/////////////////////////////////////////////////////////////////
// 初期化
/////////////////////////////////////////////////////////////////

$(document).ready(function() {
	if (window.opener === null) {
		alert('このページを直接開いても動作しません。');
		return;
	};

	MathJax.Hub.Configured();

	// ダイアログクラスを初期化します
	RubyDialog.instance.View = document.getElementById('textPane');
	RubyDialog.instance.RubyBox = document.getElementById('rubyTextbox');
	RubyDialog.instance.getTargetText();

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

	// テキストボックスにデフォルトフォーカスを設定します
	$('#rubyTextbox').focus();
});





/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	// ★完成後はウィンドウは自動的に消えるようにしてください。
	this.close();
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「適用」をクリックした時の処理
 */
function onClickSubmit() {
	// ルビを取得します
	var ruby = escapeString(rubyTextbox.value);

	// xmlList を取得します。
	var xmlList = RubyDialog.instance.XmlList

	// 親ウィンドウに処理実行を要求します
	this.opener.MessageManager.setRuby(xmlList, ruby);

	// ウィンドウを閉じます
	this.close();
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「適用して次に」をクリックした時の処理
 */
function onClickSubmitAndNext() {
	// ルビを取得します
	var ruby = escapeString(rubyTextbox.value);

	// xmlList を取得します。
	var xmlList = RubyDialog.instance.XmlList

	// 親ウィンドウに処理実行を要求します
	this.opener.MessageManager.setRuby(xmlList, ruby);

	var copyPara = RubyDialog.instance.ParaNode.cloneNode(true);
	if (copyPara.lastChild.nodeName.toLowerCase() === 'br') copyPara.removeChild(copyPara.lastChild);

	// 次を検索します
	return window.opener.MessageManager.searchNext(copyPara, true, true);
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「次を検索」をクリックした時の処理
 */
function onClickNextFind() {
	var copyPara = RubyDialog.instance.ParaNode.cloneNode(true);
	if (copyPara.lastChild.nodeName.toLowerCase() === 'br') copyPara.removeChild(copyPara.lastChild);

	// 編集ページの MessageManage の対応メソッドを実行します
	window.opener.MessageManager.searchNext(copyPara, true, true);
	// 編集ページの MessageManage の対応メソッドを実行します
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「全て適用」をクリックした時の処理
 */
function onClickSubmitAll() {
	// 文書編集ページの連続検索フラグをクリアします
	window.opener.MessageManager.clearSerialSearch();
	// ルビを取得します
	var ruby = escapeString(rubyTextbox.value);

	// キャレットを先頭に配置します。
	window.opener.MessageManager.setCaretToTop();
	// レンダラーに処理前の状態を登録させます (実際には MessageManager が記録しています)
	window.opener.MessageManager.setPreRenderSection();
	// メッセージマネージャの検索結果バッファをクリアします。
	window.opener.MessageManager.prepareRubyTypeAll(true);
	// 最初の検索を行います。
	var searchResult;
	searchResult = window.opener.MessageManager.searchNext(RubyDialog.instance.ParaNode, true, true, true);
	while (searchResult) { // 検索結果があるうちは、繰り返します。
		// メッセージマネージャの検索結果バッファへ検索結果をためます。
		window.opener.MessageManager.prepareRubyTypeAll(false, ruby);
		searchResult = window.opener.MessageManager.searchNext(RubyDialog.instance.ParaNode, true, true, true);
	}

	window.opener.MessageManager.setRubyAll(); // 一括読み設定実行
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
