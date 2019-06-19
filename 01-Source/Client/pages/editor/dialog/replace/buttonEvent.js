
function ButtonEvent() {};

/**
 * 各ボタンにクリック時のイベントハンドラを設定します。
 */
ButtonEvent.init = function() {
	_nextButton.addEventListener('click', ButtonEvent.nextSearch);
	_replaceButton.addEventListener('click', ButtonEvent.replace);
	_replaceNextButton.addEventListener('click', ButtonEvent.replaceAndNext);
	_allReplaceButton.addEventListener('click', ButtonEvent.replaceAll);
	_cancelButton.addEventListener('click', ButtonEvent.cancel);
	to_prev.addEventListener('change', ButtonEvent.change);
	to_next.addEventListener('change', ButtonEvent.change);
};

/**
 * 次を検索クリック時の処理です。
 */
ButtonEvent.nextSearch = function() {
	// パラメータを取得します
	var isNext = to_next.checked;
	var matchCase = _macthCase.checked;

	// 検索データを作成します
	var sectionList = DocumentManager.getDocument();
	var para = sectionList.children[0].firstChild;
	var copyPara = para.cloneNode(true);
	copyPara.removeChild(copyPara.lastChild);

	// 編集ページの MessageManage の対応メソッドを実行します
	window.opener.MessageManager.searchNext(copyPara, isNext, matchCase);
};

/**
 * 置換クリック時の処理です。
 */
ButtonEvent.replace = function() {
	// 文書編集ページの連続検索フラグをクリアします
	window.opener.MessageManager.clearSerialSearch();

	// パラメータを取得します
	var isNext = to_next.checked;
	var matchCase = _macthCase.checked;

	// 検索・置換データを作成します
	var sectionList = DocumentManager.getDocument();
	var beforePara  = sectionList.children[0].firstChild; // 検索用セクション
	var afterPara   = sectionList.children[1].firstChild; // 置換用セクション
	var copyBeforePara = beforePara.cloneNode(true);      // 検索用段落ノード取得
	var copyAfterPara  = afterPara.cloneNode(true);       // 置換用段落ノード取得
	copyBeforePara.removeChild(copyBeforePara.lastChild); // 検索用段落ノードの末尾の解消を削除
	copyAfterPara.removeChild(copyAfterPara.lastChild);   // 置換用段落ノードの末尾の解消を削除

	// 編集ページの MessageManage の対応メソッドを実行します
	if (browserIsEdge()) {
		var beforeXml = copyBeforePara.outerHTML;
		var afterXml = copyAfterPara.outerHTML;
		window.opener.MessageManager.replaceText(beforeXml, afterXml, matchCase, true);
	}
	else {
		window.opener.MessageManager.replaceText(copyBeforePara, copyAfterPara, matchCase);
	}
};

/**
 * 置換して次を検索をクリック時の処理です。
 */
ButtonEvent.replaceAndNext = function() {
	// 文書編集ページの連続検索フラグをクリアします
	window.opener.MessageManager.clearSerialSearch();

	// パラメータを取得します
	var isNext = to_next.checked;
	var matchCase = _macthCase.checked;

	// 検索・置換データを作成します
	var sectionList = DocumentManager.getDocument();
	var beforePara  = sectionList.children[0].firstChild; // 検索用セクションの段落ノード
	var afterPara   = sectionList.children[1].firstChild; // 置換用セクションの段落ノード
	var copyBeforePara = beforePara.cloneNode(true);      // 検索用段落ノード取得
	var copyAfterPara  = afterPara.cloneNode(true);       // 置換用段落ノード取得
	copyBeforePara.removeChild(copyBeforePara.lastChild); // 検索用段落ノードの末尾の解消を削除
	copyAfterPara.removeChild(copyAfterPara.lastChild);   // 置換用段落ノードの末尾の解消を削除

	// 編集ページの MessageManage の対応メソッドを実行します
	if (browserIsEdge()) {
		var beforeXml = copyBeforePara.outerHTML;
		var afterXml = copyAfterPara.outerHTML;
		window.opener.MessageManager.replaceText(beforeXml, afterXml, matchCase, true);
	}
	else {
		window.opener.MessageManager.replaceText(copyBeforePara, copyAfterPara, matchCase);
	}
	window.opener.MessageManager.searchNext(copyBeforePara, isNext, matchCase);
};

/**
 * 全て置換をクリック時の処理です。
 */
ButtonEvent.replaceAll = function() {
	// 文書編集ページの連続検索フラグをクリアします
	window.opener.MessageManager.clearSerialSearch();
	// カーソルを元文書の先頭行に置きます。
	window.opener.MessageManager.setCaretToTop();
	// メッセージマネージャの検索結果バッファをクリアします。
	window.opener.MessageManager.prepareReplaceAll(true);

	var isNext    = true;
	var matchCase = _macthCase.checked;

	// 検索・置換データを作成します
	var sectionList = DocumentManager.getDocument();
	var beforePara  = sectionList.children[0].firstChild; // 検索用セクションの段落ノード
	var afterPara   = sectionList.children[1].firstChild; // 置換用セクションの段落ノード
	var copyBeforePara = beforePara.cloneNode(true);      // 検索用段落ノード取得
	copyBeforePara.removeChild(copyBeforePara.lastChild); // 検索用段落ノードの末尾の改行を削除

	// 検索結果がある間は、置換を繰り返します。
	while ( window.opener.MessageManager.searchNext(copyBeforePara, isNext, matchCase, true) ) {
		var copyAfterPara  = afterPara.cloneNode(true);       // 置換用段落ノード取得
		copyAfterPara.removeChild(copyAfterPara.lastChild);   // 置換用段落ノードの末尾の改行を削除
		if (browserIsEdge()) {
			var beforeXml = copyBeforePara.outerHTML;
			var afterXml = copyAfterPara.outerHTML;
			window.opener.MessageManager.prepareReplaceAll(false, beforeXml, afterXml, true);
		}
		else {
			window.opener.MessageManager.prepareReplaceAll(false, copyBeforePara, copyAfterPara);
		}
	}
	window.opener.MessageManager.replaceAll();
};

/**
 * キャンセルクリック時の処理です。
 */
ButtonEvent.cancel = function() {
	window.close();	// スクリプトで開いた時のみ、この命令は有効です
};

/**
 * 検索方向変更時の処理です
 */
ButtonEvent.change = function() {
	// 文書編集ページの連続検索フラグをクリアします
	window.opener.MessageManager.clearSerialSearch();
};

// ---- ウインドウを閉じる際
window.onbeforeunload = function(){
	// 検索・置換段落の内容を outerHTML ではき出し、messageManager へ保存します。
	ReplaceDialog.instance.setPreviousXml();
};


/**
 * ブラウザが Edge なら true, その他なら false を返します
 * (同じ関数が common.js にもありますが、こっちでは import されてません)
 * @returns {Boolean}
 */
function browserIsEdge() {
	var name = navigator.userAgent.toLowerCase();
	var version = navigator.appVersion.toLowerCase();

	return ((name.indexOf('edge') > 0) && (version.indexOf('edge') > 0));
};
