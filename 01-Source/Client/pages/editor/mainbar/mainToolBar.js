/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_mainToolBar.js                                  */
/* -                                                                         */
/* -    概      要     ： メインツールバークラス                             */
/* -                                                                         */
/* -    依      存     ： ToolBar.html, TB_mainToolBar.css,                  */
/*                        TB_common.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月12日                         */

/* =================== ツールバークラス 命名規則 (暫定) ==================== */
/* TBC_ : Tool Bar Common    : 全クラス共通                                  */
/* MB_  : MenuBar            : メニューバー                                  */
/* MT_  : Main   Toolbar     : メインツールバー（大アイコン表示）            */
/* IT_  : Index  Toolbar     : インデックス操作用ツールバー（小アイコン表示）*/
/* ET_  : Editor Toolbar     : エディタ部用ツールバー（小アイコン表示）      */
/* ST_  : Section Title bar  : セクションタイトルバー（小アイコン表示）      */
/* ※HTMLタグIDは、上記接頭文字から始めます。                                */
/* ※CSS classは、cl_ の後、上記接頭文字を続ける形とします。                 */
/*========================================================================== */

/* ===================== ツールバークラス 基本方針 ========================= */
/* ・アイコンの disable/enable 状態及び、チェックマークの状態は、            */
/*   当モジュール内では管理しません。                                        */
/* ========================================================================= */

// *************************************************************
// **                 メインツールバークラス                  **
// **                メインツールバーの機能群                 **
// **                                                         **
// *************************************************************
function MainToolClass() {};

// ============================= プロパティ設定 =============================

// ======================== 初期化処理 ========================

MainToolClass.Init = function() {
	// 現在処理なし
}

// ======================== アイコンクリック時の動作 ========================

// ------------- 上書き保存
MainToolClass.MT_Save = function() {
	if (DocumentManager.isEditable() === -1) showMessageDialog('読み上げモードの時は保存はできません。', '操作エラー');
	if (DocumentManager.isEditable() !== true) return;

	// 接続が切れている時は、再ログインウィンドウを出すだけです
	if (ServerManager.Disconnected) {
		WindowManager.instance.openReLoginWindow();
		return;
	}

	// ---- ダイアログ表示
	$('#Dialog_SaveStatus').dialog({
		modal:     true,  // モーダルダイアログ。
		draggable: false, // ドラッグによる位置変更を許可しない。
		resizable: false, // サイズ変更を許可しない。
	});

	// 上書き保存を実行します。
	var doc = DocumentManager.instance.currentDocument;
	ServerManager.saveDocument(DocumentManager.getDocId(), doc.toXml(), doc.getParagraphXmlList(),
		MainToolClass.saveSuccess, MainToolClass.saveFailure);
};



// ------------- 上書き保存成功
MainToolClass.saveSuccess = function() {
	$('#Dialog_SaveStatus').dialog('close');                    // 保存中ダイアログを閉じます。
	ViewManager.getStatusManager().setSaveAttribute(false); // 上書き保存アイコンを無効化します。
};



// ------------- 上書き保存失敗
MainToolClass.saveFailure = function() {
	$('#Dialog_SaveStatus').dialog('close');                    // 保存中ダイアログを閉じます。
	alert('上書き保存に失敗しました。編集権が他のユーザーに移っている可能性があります。別名保存を試してください。'); // 保存失敗を警告します。
};



// ------------- 「配色の変更」アイコンクリック時
MainToolClass.MT_ChangeColor = function() {
}

// ------------- 「OCR画像を表示」アイコンクリック時
MainToolClass.MT_ShowOCR = function() {
}


