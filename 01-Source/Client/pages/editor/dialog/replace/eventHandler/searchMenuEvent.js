
function SearchMenuEventHandler() {};

/**
 * 検索コマンドクリック時
 */
SearchMenuEventHandler.onClickSearch = function() {
	WindowManager.instance.openReplaceWindow(false);
};

/**
 * 置換コマンドクリック時
 */
SearchMenuEventHandler.onClickReplace = function() {
	WindowManager.instance.openReplaceWindow(true);
};
