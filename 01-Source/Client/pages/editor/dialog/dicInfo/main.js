////////////////////////////////////////////////////////////////
// ウィンドウの初期化と終了

/**
 * ウィンドウが表示された時の処理です。
 */
window.onload = function() {
	// イベントハンドラを設定します
	document.addEventListener('keydown', onKeyDown);

	if (window.opener === null) {
		alert('このページは単体では動作しません。');
		return;
	}

	// 文書IDを取得します
	try {
		var docId = window.opener.MessageManager.getDocumentId();
		docId = docId.docId;
	}
	catch(e) {
		console.log('文書IDの取得に失敗しました。' + e);
		var docId = 123;
	}

	// サーバに辞書情報を要求します
	ServerManager.requestDicInfo(docId, onSuccess);

	// ローカルテスト用のコード
//	onSuccess({info: {
//	    name: '高校数学.dic',
//	    last_modified: '2014/06/20-19:36:12',
//	    word_count: 220,
//	}});
};

/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	this.close();
};


////////////////////////////////////////////////////////////////
// イベントハンドラ

function onKeyDown(event) {
	// esc キーを押されるとウィンドウを閉じます
	if (event.keyCode === 27) {
		this.close();
	}
};

/**
 * OKボタン押下
 */
function onOK() {
    this.close();
}


////////////////////////////////////////////////////////////////
// 通信イベント

function onSuccess(data) {
	_dicName.textContent = data.info.name;
	_wordCount.textContent = data.info.word_count + ' 単語';
	_lastModified.textContent = data.info.last_modified;
};
