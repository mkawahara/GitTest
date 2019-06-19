/**
 * ダイアログでのみ使用される共通の関数群を提供します。
 */

/**
 * ブラウザが Edge なら true, その他なら false を返します
 * @returns {Boolean}
 */
function browserIsEdge() {
	var name = navigator.userAgent.toLowerCase();
	var version = navigator.appVersion.toLowerCase();

	return ((name.indexOf('edge') > 0) && (version.indexOf('edge') > 0));
};

/**
 * Edge の場合、30ms 後に指定サイズにウィンドウをリサイズします
 * この処理は、このファイルを読み込んだ時点で実行されます。
 */
if (browserIsEdge()) setTimeout('resizeWindow()', 30);

/**
 * 指定サイズにウィンドウをリサイズします
 * @param width
 * @param height
 */
function resizeWindow() {
	// window.width と window.height は、親ウィンドウで定義される変数です
	if ((window.width === void 0) || (window.height === void 0)) return;
	window.resizeTo(window.width, window.height);
};
