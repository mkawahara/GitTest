/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月09日                         */

function ClipEventHandler(){};

ClipEventHandler.init = function(){};

ClipEventHandler.onPasteFlag = false;

ClipEventHandler.onPaste = function(event) {
	console.log('onPaste が発行されました。');
	var clipboard = event.clipboardData;
	if (clipboard === void 0) clipboard = window.clipboardData;
	var clipText = clipboard.getData('text');

	ClipEventHandler.onPasteFlag = (clipText !== void 0 && clipText !== null) ? clipText : true;
};


// ---- ペースト
ClipEventHandler.execPaste = function(event, inputObj, inputText) {
	UiCommandWrapper.replaceAndPaste(event, inputObj, void 0, inputText);
	ViewManager.getRenderer().update();

	var editorPane = ViewManager.getEditorPane();
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();

	event.preventDefault();
	event.stopPropagation();

	ClipEventHandler.onPasteFlag = false;
}


// ---- コピー
ClipEventHandler.onCopy = function(event) {
	console.log('onCopy が発行されました。');

	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	var jsonData = selectedRangeManager.selectedRange.getJsonSelectedRange();
	// クリップボードへ選択範囲をコピーします。
	ClipboardManager.instance.setData(event, jsonData);

	event.preventDefault();
	event.stopPropagation();
};



ClipEventHandler.onCut = function(event) {
	console.log('onCut が発行されました。');

	// クリップボードへ選択範囲を切り取ります。
	// 工事中
	
	
	event.preventDefault();
	event.stopPropagation();
};

