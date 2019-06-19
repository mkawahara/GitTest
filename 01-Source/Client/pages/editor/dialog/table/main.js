// ---- ブラウザがドキュメントを読み込んだ直後に実行されます。
window.onload = function() {
	document.addEventListener('keydown', onKeyDown);
};

function onKeyDown(event) {
	if (event.keyCode === 13) {        // ---- enter なら 表作成決定
		onOK();
	} else if (event.keyCode === 27) { // ---- esc ならキャンセル
		onCancel();
	}
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

/**
 * OK ボタン押下時の処理
 */

function onOK() {
	if (this.opener === null) {
		alert('このページは単体では動作しません。');
		return;
	}

	var rows = Number(_rowCount.value);
	var cols = Number(_colCount.value);

	this.opener.MessageManager.createTable(cols, rows);

	this.close();
};


////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

/**
 * Cancel ボタン押下時の処理
 */
function onCancel() {
	this.close();
};

/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	this.close();
};

