
var docId = null;

$(document).ready(function(){
	// タブを作成します
	$("#_settingTab").tabs();

	// キーイベントハンドラを作成します
	document.addEventListener('keydown', onKeyDown);

	// IDを親ページから取得します
	// ★セッションからユーザは特定できるため、ユーザIDは要らないと思われます
	var ids = window.opener.MessageManager.getDocumentId();
	//var userId = ids.userId;
	docId = ids.docId;

	// データをサーバに要求します
	// ★メソッドの中身はまだ空です。
	ServerManager.requestAudioSettingList(onLoadSettingList, void 0, void 0);
});

////////////////////////////////////////////////////////////////
// イベントハンドラ

/**
 * キー操作時の処理を定義します
 */
function onKeyDown(event) {
	// Enter キーを押されると、設定の保存をサーバに要求します
	if (event.keyCode === 13) {
		onClickSave();
	}

	// esc キーを押されるとウィンドウを閉じます
	if (event.keyCode === 27) {
		onClickCancel();
	}
};

/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	//this.close();
};


////////////////////////////////////////////////////////////////
// ページロード時のサーバリクエストの処理

/**
 * データ取得成功時の処理
 */
function onLoadSettingList(data) {
	// ★ここに画面部品の更新を記述します
};

/**
 * データ取得失敗時の処理：サーバからの応答はアリ
 * ★未使用
 * @param data
 */
function onErrorLoadSettingList(data) {
};

/**
 * データ取得失敗時の処理：サーバとの接続自体失敗
 * ★未使用
 * @param errorInfo
 */
function onUnexpectedErrorLoadSettingList(errorInfo) {
};


////////////////////////////////////////////////////////////////
// ボタン操作時の処理

/**
 * 選択状況をサーバに保存します
 */
function onClickSave() {
	// 選択状態を取得します
	// ★実装必要
	var settingId = null;

	// サーバにリクエストを送信します
	ServerManager.requestSetAudioSetting(docId, settingId, onSaveSetting, void 0, void 0);
};

/**
 * 選択を破棄してウィンドウを閉じます
 */
function onClickCancel() {
	this.close();
};


////////////////////////////////////////////////////////////////
// 保存リクエストに対するレスポンスの処理

/**
 * 保存成功時の処理
 */
function onSaveSetting(data) {
	this.close();
};

/**
 * 保存失敗時の処理：サーバからの応答はアリ
 * ★未使用
 * @param data
 */
function onErrorSaveSetting(data) {
};

/**
 * 保存失敗時の処理：サーバとの接続自体失敗
 * ★未使用
 * @param errorInfo
 */
function onUnexpectedErrorSaveSetting(errorInfo) {
};
