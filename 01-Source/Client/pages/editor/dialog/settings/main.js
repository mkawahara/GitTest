////////////////////////////////////////////////////////////////////////////////
// 初期化
////////////////////////////////////////////////////////////////////////////////

var g_colorPalette = null;

$(document).ready(function() {
	// タブを作成します
	$('#settingTab').tabs();

	// 動作条件をチェックします。
	if (window.opener === null) {
		alert('このページは単体では動作しません。');
		return;
	}

	// 編集ページから設定を取得します。
	getConfig();

	// 各タブの部品データを設定します。
	setGeneralTab();
	setColorTab();

	//
	setEventOnColor();

	// パレット作成
	g_colorPalette = new ColorPalette(colorPalette);

	document.addEventListener('click', function() { g_colorPalette.close(); });
});

/**
 * 親ページから設定一式を取得します。
 */
function getConfig() {
	var xml = this.opener.MessageManager.getEditorSetting();
	ConfigManager.instance.setXml(xml);
};

/**
 * 全般タブの表示リセット
 */
function setGeneralTab() {
	// 化学式チェックボックス
	var value = ConfigManager.instance.IsShortcutTargetChem;
	_involveChemMode.checked = value;

	// スペースの表示設定
	var value = ConfigManager.instance.IsShowTextSpace;
	_textSpace.checked = value;
	var value = ConfigManager.instance.IsShowMathSpace;
	_mathSpace.checked = value;

	// 分数におけるカーソルの移動順
	if (ConfigManager.instance.IsFirstCursorPosNumInFrac) {
		document.getElementById('frac2').checked = true;
	} else {
		document.getElementById('frac1').checked = true;
	}
};

/**
 * 配色タブの表示リセット
 */
function setColorTab() {
	var bgColorRule = getStyleClass('bgcolor');
	if (bgColorRule !== null) bgColorRule.style['background-color'] = ConfigManager.instance.BackgroundColor;

	//$('#bgcolor').css('background-color', ConfigManager.instance.BackgroundColor);
	$('#textcolor').css('color', ConfigManager.instance.TextColor);
	$('#mathcolor').css('color', ConfigManager.instance.MathColor);
	$('#chemcolor').css('color', ConfigManager.instance.ChemColor);
	$('#ctrlcolor').css('color', ConfigManager.instance.ControlColor);
	$('#mathctrlcolor').css('color', ConfigManager.instance.MathControlColor);
	$('#rubycolor').css('color', ConfigManager.instance.RubyColor);
	$('#selectioncolor').css('color', ConfigManager.instance.TextColor);
	$('#selectioncolor').css('background-color', ConfigManager.instance.Selection);
	$('#hlforecolor').css('background-color', ConfigManager.instance.HighlightForeColor);
	$('#hlbgcolor').css('background-color', ConfigManager.instance.HighlightBgColor);
};

function getStyleClass(className) {
	var css_list = document.styleSheets;

	// スタイルシートリストの順次確認
	for (var cssListIdx = 0; cssListIdx < css_list.length; cssListIdx++) {
		// リスト内のルールを順次確認し、目的のスタイルを取得します
		var ruleList = css_list[cssListIdx].cssRules;
		for (var cssIdx = 0; cssIdx < ruleList.length; cssIdx++) {
			var pattern = new RegExp(className.replace(".", "\\.") + ",?");
			if ((ruleList[cssIdx].selectorText !== void 0) && (ruleList[cssIdx].selectorText.search(pattern) > 0)) return ruleList[cssIdx];
		};
	};

	return null;
};


/**
 * カラータブへのイベント設定
 */
function setEventOnColor() {
	bgcolor.onclick			= function(event) { g_colorPalette.open(event, 100, 20, onBackground); };
	textcolor.onclick		= function(event) { g_colorPalette.open(event, 100, 40, onText); };
	mathcolor.onclick		= function(event) { g_colorPalette.open(event, 100, 60, onMath); };
	chemcolor.onclick		= function(event) { g_colorPalette.open(event, 100, 80, onChem); };
	ctrlcolor.onclick		= function(event) { g_colorPalette.open(event, 100, 100, onCtrl); };
	mathctrlcolor.onclick	= function(event) { g_colorPalette.open(event, 100, 120, onMathCtrl); };
	rubycolor.onclick		= function(event) { g_colorPalette.open(event, 100, 140, onRuby); };
	selectioncolor.onclick	= function(event) { g_colorPalette.open(event, 100, 160, onRange); };
	hlforecolor.onclick		= function(event) { g_colorPalette.open(event, 100, 180, onHighFore); };
	hlbgcolor.onclick		= function(event) { g_colorPalette.open(event, 100, 200, onHighBack); };
};


////////////////////////////////////////////////////////////////////////////////
// 保存
////////////////////////////////////////////////////////////////////////////////

function onSave() {
	// 全般タブの入力結果を取得します
	getGeneralTab();

	// 配色タブの入力結果を取得します
	getColorTab();

	// 親ウィンドウに結果を出力します
	var xml = ConfigManager.instance.getSettingXml();
	this.opener.MessageManager.setEditorSetting(xml);

	// ウィンドウを閉じます
	this.close();
};

/**
 * 全般タグの設定を取得します
 */
function getGeneralTab() {
	// 化学式チェックボックス
	ConfigManager.instance.IsShortcutTargetChem = _involveChemMode.checked;

	// スペースの表示設定
	ConfigManager.instance.IsShowTextSpace = _textSpace.checked;
	ConfigManager.instance.IsShowMathSpace = _mathSpace.checked;

	// 分数におけるカーソルの移動順
	ConfigManager.instance.IsFirstCursorPosNumInFrac = document.getElementById('frac2').checked;
};

/**
 * 配色タブの設定を取得します
 */
function getColorTab() {
	ConfigManager.instance.BackgroundColor = parseRgbToHex($('#bgcolor').css('background-color'));
	ConfigManager.instance.TextColor = parseRgbToHex($('#textcolor').css('color'));
	ConfigManager.instance.MathColor = parseRgbToHex($('#mathcolor').css('color'));
	ConfigManager.instance.ChemColor = parseRgbToHex($('#chemcolor').css('color'));
	ConfigManager.instance.ControlColor = parseRgbToHex($('#ctrlcolor').css('color'));
	ConfigManager.instance.MathControlColor = parseRgbToHex($('#mathctrlcolor').css('color'));
	ConfigManager.instance.RubyColor = parseRgbToHex($('#rubycolor').css('color'));
	ConfigManager.instance.HighlightForeColor = parseRgbToHex($('#hlforecolor').css('background-color'));
	ConfigManager.instance.HighlightBgColor = parseRgbToHex($('#hlbgcolor').css('background-color'));
};

/**
 * rgb(0, 0, 0)形式を十六進形式に変換します
 * @param src
 * @returns {String}
 */
function parseRgbToHex(src) {
	// 最初と最後を除去します
	src = src.replace("rgb(","");
	src = src.replace(")","");

	// 配列に分解します
	src = src.split(',');

	// 十六進文字列に変換します
	for (var i = 0; i < 3; i++) {
		src[i] = parseInt(src[i]).toString(16);
		if (src[i].length < 2) src[i] = '0' + src[i];
	}

	src = '#' + src[0] + src[1] + src[2];

	return src;
};

/**
 * キャンセルボタン押下時の処理です
 */
function onCancel() {
	this.close();
};

/**
 * 初期状態に戻すボタン押下時の処理です。
 */
function onRevert() {
    // デフォルトの設定に戻します
    ConfigManager.instance.setXml(DEFAULT_CONFIG_XML);
    // 各タブの部品データを設定します。
    setGeneralTab();
    setColorTab();

}


/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	//this.close();
};

