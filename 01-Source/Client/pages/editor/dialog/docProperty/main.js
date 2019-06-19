////////////////////////////////////////////////////////////////////////////////
// 初期化
////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {
	// ページ部品の初期化を行います。
	initPage();

	// 動作条件をチェックします。
	if (window.opener === null) {
		alert('このページは単体では動作しません。');
		return;
	}

	// 編集ページから設定を取得します。
	getConfig();

	// 各タブの部品データを設定します。
	setFontTab();
});

/**
 * ページ部品を初期化します。
 */
function initPage() {
	// フォント一覧を設定します
	for (var i = 0; i < fontList.length; i++) {
		var item = '<option value="' + fontList[i] + '">' + fontList[i];
		_fontNameList.innerHTML += item;
	};

	// フォントサイズ一覧を設定します
	for (var i = 0; i < fontSizeList.length; i++) {
		var item = '<option value="' + fontSizeList[i] + '">' + fontSizeList[i] + 'pt';
		_fontSizeList.innerHTML += item;
	};

	// タブを作成します
	$('#settingTab').tabs();
};

/**
 * 親ページから設定一式を取得します。
 */
function getConfig() {
	var json = this.opener.MessageManager.getDocumentProperty();

	// データオブジェクトに値を設定します
	DocumentProperty.instance.Font = json.font;
	DocumentProperty.instance.FontSize = json.fontSize;
};

/**
 * フォントタブの表示リセット
 */
function setFontTab(){
	// フォント名の設定
	var configFont = DocumentProperty.instance.Font;

	for (var i = 0; i < _fontNameList.length; i++) {
		if (_fontNameList[i].value === configFont) {
			_fontNameList.selectedIndex = i;
			break;
		};
	};

	// フォントサイズの設定
	var fontSize = DocumentProperty.instance.FontSize;
	_fontSize.value = fontSize.substr(0, fontSize.length - 2);
};


////////////////////////////////////////////////////////////////////////////////
// データ変更
////////////////////////////////////////////////////////////////////////////////

/**
 * フォントサイズを選択した時のテキストボックス更新
 */
function onChangeSizeSelect(event) {
	_fontSize.value = _fontSizeList[_fontSizeList.selectedIndex].value;
};


////////////////////////////////////////////////////////////////////////////////
// 保存
////////////////////////////////////////////////////////////////////////////////

function onSave(asDefault) {
	// フォントタブの入力結果を取得します
	getFontTab();

	// 親ウィンドウに結果を出力します
	var json = {
		font: DocumentProperty.instance.Font,
		fontSize: DocumentProperty.instance.FontSize,
		asDefault: asDefault,
	};

	window.opener.MessageManager.setDocumentProperty(json);

	// ウィンドウを閉じます
	this.close();
};

/**
 * フォントタブの設定を取得します。
 */
function getFontTab() {
	DocumentProperty.instance.Font = _fontNameList.value;
	DocumentProperty.instance.FontSize = _fontSize.value + 'pt';
};

/**
 * キャンセルボタン押下時の処理です
 */
function onCancel() {
	this.close();
};


/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	//this.close();
};
