/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月03日                         */

PopupMenu.pictureMenu   = null; // 画像処理　　　メニュー
PopupMenu.pictureRClick = null; // 画像上での右クリック時のポップアップメニュー
PopupMenu.tableRClick   = null; // テーブル・行列上での右クリック時のポップアップメニュー

// ------------- 視覚効果のスタイル文字列を定義します。
const TBC_CMN_COL_TRANSPARENT = 'transparent';              // 透明色指定
const TBC_HL_BORDER_BASE_STR  = '1px solid ';               // ハイライト用枠線の種類
const TBC_HL_BORDER_COL       = 'rgba(0, 100, 255, 0.70)';  // ハイライトON時の枠線の色
const TBC_HL_BACK_COL_LIGHT   = 'rgba(0, 255, 255, 0.15)';  // マウスオーバー時のハイライトON背景色
const TBC_HL_BACK_COL_DARK    = 'rgba(0, 255, 255, 0.50)';  // アイコンクリック時の濃いハイライトON背景色

// ------------- キーボード関連の定数を定義します。
const TBC_KEY_ESC    = 27;	// キーコード: ESC

// ------------- ブラウザがドキュメントを読み込んだ直後に実行されます。
$(document).ready( function () {

	setShowParts();
	ButtonEvent.init();

	EditorToolClass.Init();						// ツールバークラスの初期化処理を行います。
	MathJax.Hub.Configured();					// MathJax の初期化処理を行います。

	// コンフィグマネージャ：親ウインドウから情報を取得
	var xml = window.opener.MessageManager.getEditorSetting();
	ConfigManager.instance.setXml(xml);

	ToolbarUtilityClass.Init(); // ツールバーユーティリティークラスの初期化処理を行います。

	DocumentManager.instance.init();

	document.oncontextmenu = function(event) {
		event.preventDefault();
	};

	ViewManager.getEditorPane().initCaretPos();
	EDT_FrontTextBox.focus();
	console.log("OK");
});


/************************************************************
 * 表示部品を設定します。
 * GET パラメータで replace=true が設定されている場合のみ、
 * 置換処理用部品を表示します
 */
function setShowParts() {
	var paramValue = getReplaceParam();

	if (paramValue === null) {
		$('#replaceRow').css('display', 'none');
		$('#_replaceButton').css('display', 'none');
		$('#_replaceNextButton').css('display', 'none');
		$('#_allReplaceButton').css('display', 'none');
	}
};

/**
 * 表示部品の切替パラメータを取得します
 * @returns true/ null
 */
function getReplaceParam() {
	var url = location.href;
	parameters = url.split('?');
	if (parameters.length < 2) return null;

	params = parameters[1].split('&');
	var paramsArray = [];

	for (var i = 0; i < params.length; i++ ) {
		var temp = params[i].split('=');
		paramsArray.push(temp[0]);
		paramsArray[temp[0]] = temp[1];
	}

	return paramsArray['replace'];
};
