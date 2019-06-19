
function SearchMenuEventHandler() {};

/**
 * 検索コマンドクリック時
 */
SearchMenuEventHandler.onClickSearch = function() {
	if (DocumentManager.isEditable() !== true) return;
	WindowManager.instance.openReplaceWindow(false);
};

/**
 * 置換コマンドクリック時
 */
SearchMenuEventHandler.onClickReplace = function() {
	if (DocumentManager.isEditable() !== true) return;
	WindowManager.instance.openReplaceWindow(true);
};
