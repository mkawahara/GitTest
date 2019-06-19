/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_editorToolBar.js                                */
/* -                                                                         */
/* -    概      要     ： エディタツールバークラス                           */
/* -                                                                         */
/* -    依      存     ： ToolBar.html, TB_mainToolBar.css,                  */
/*                        TB_common.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月29日                         */

/* =================== ツールバークラス 命名規則 (暫定) ==================== */
/* TBC_ : Tool Bar Common    : 全クラス共通                                  */
/* MB_  : MenuBar            : メニューバー                                  */
/* MT_  : Main   Toolbar     : メインツールバー（大アイコン表示）            */
/* IT_  : Index  Toolbar     : インデックス操作用ツールバー（小アイコン表示）*/
/* ET_  : Editor Toolbar     : エディタ用ツールバー（小アイコン表示）        */
/* ST_  : Section Title bar  : セクションタイトルバー（小アイコン表示）      */
/* ※HTMLタグIDは、上記接頭文字から始めます。                                */
/* ※CSS classは、cl_ の後、上記接頭文字を続ける形とします。                 */
/*========================================================================== */

/* ===================== ツールバークラス 基本方針 ========================= */
/* ・アイコンの disable/enable 状態及び、チェックマークの状態は、            */
/*   当モジュール内では管理しません。                                        */
/* ========================================================================= */

// ============================= 定数 =============================
const ID_ET_MASTER_LAYER   = 'ET_MasterLayer';                // エディタ用ツールバーのマスターレイヤ用divタグID
const ID_CM_ET_FRAMEBORDER = 'ET_Format_FrameBorder_ConMenu'; // 囲み枠系コンテキストメニューのulタグ名
const ID_CM_ET_FONTSIZE    = 'ET_Format_FontSize_ConMenu'   ; // フォントサイズ系コンテキストメニューのulタグ名
const ID_CM_ET_INSERTIMAGE = 'ET_Edit_InsertImage_ConMenu'  ; // 画像処理コンテキストメニューのulタグ名
const ID_PM_ET_IMAGE       = 'ET_Edit_ImagePopup_ConMenu'   ; // 画像上での右クリック時のポップアップメニュー
const ID_PM_ET_EDITOR      = 'ET_Edit_EditorPopup_ConMenu'  ; // エディタ部上での右クリック時のポップアップメニュー
const ID_PM_ET_TABLE       = 'ET_Edit_TablePopup_ConMenu'   ; // テーブル・行列上での右クリック時のポップアップメニュー

// *************************************************************
// **                 エディタツールバークラス                **
// **                エディタツールバーの機能群               **
// **                                                         **
// *************************************************************
function EditorToolClass() {}

// ============================= プロパティ設定 =============================

// コンテキストメニューのulタグIDと、位置の基準になるdivタグIDの組み合わせを格納した連想配列です。
// この連想配列へ記録されたコンテキストメニューは、ToolbarUtilityClass.RegistContextMenu() にて、
// 自動的に jQuery ui へ登録されます。
EditorToolClass.MenuSectionTable = {};  // 最初は空の連想配列です。



// ======================== 初期化処理 ========================

EditorToolClass.Init = function() {
	// コンテキストメニュー生成
	PopupMenu.instance.CreateMenu(PopupMenu.borderFrame  ); // 囲み枠　　　　メニュー
	PopupMenu.instance.CreateMenu(PopupMenu.fontSize     ); // フォントサイズメニュー
	PopupMenu.instance.CreateMenu(PopupMenu.pictureMenu  ); // 画像処理　　　メニュー
	PopupMenu.instance.CreateMenu(PopupMenu.pictureRClick); // 画像上での右クリック時のポップアップメニュー
	PopupMenu.refreshMathLevel();                  // 数式レベルで右クリックのポップアップメニューを作成


	// ------------- コンテキストメニュー用連想配列をセット
	// 大元ハッシュキー       : コンテキストメニューの ulタグID です。
	// 参照先連想配列のiconID : コンテキストメニュー表示位置の基準となるDOMの divタグID です。
	// 　※参照先がnull       : ポップアップメニューは、他のDOMを位置の基準としないため、null参照です。
	var tgtHash = this.MenuSectionTable;     // 連想配列オブジェクトを参照します。
	// --- ドロップダウン / メニューバー項目形式 ---
	tgtHash[ID_CM_ET_FRAMEBORDER] = {'iconID' : 'ET_Format_FrameBorder_Standard'}; // 囲み枠系
	tgtHash[ID_CM_ET_FONTSIZE   ] = {'iconID' : 'ET_Format_FontSize'            }; // フォントサイズ系
	tgtHash[ID_CM_ET_INSERTIMAGE] = {'iconID' : 'ET_Edit_InsertImage'           }; // 画像処理
	// --- ポップアップ形式 ---
	tgtHash[ID_PM_ET_IMAGE ] = null;        // 画像上での      右クリック時のポップアップメニュー
	tgtHash[ID_PM_ET_EDITOR] = null;        // エディタ部上での右クリック時のポップアップメニュー
	tgtHash[ID_PM_ET_TABLE]  = null;        // テーブル上での右クリック時のポップアップメニュー

	ToolbarUtilityClass.RegistContextMenu(tgtHash);  // コンテキストメニューを登録します。

	// イベント
	EditorToolClass.SetEvents();

}

EditorToolClass.SetEvents = function() {
// ID_EditorArea
	// ---- フォーカス時にセクション選択解除
	$('#ID_EditorArea').on('focus', function () {
		console.log('エディタエリアがフォーカスされた');

	});
};




// ======================== アイコンクリック時の動作 ========================

// ------------- 「囲み枠」ドロップマーククリック時
EditorToolClass.ET_Format_FrameBorder_Context = function() {
	this.ShowContextMenu(ID_CM_ET_FRAMEBORDER);
}

// ------------- 「フォントサイズ」アイコン/ドロップマーククリック時
EditorToolClass.ET_Format_FontSize_Context = function() {
	this.ShowContextMenu(ID_CM_ET_FONTSIZE);
}

// ------------- 「画像の挿入」アイコンクリック時
EditorToolClass.ET_Edit_InsertImage = function() {
}

// ------------- 「画像の挿入」ドロップマーククリック時
EditorToolClass.ET_Edit_InsertImage_Context = function() {
	this.ShowContextMenu(ID_CM_ET_INSERTIMAGE);
}



// ------------- Undoアイコンの有効/無効更新
EditorToolClass.setUndoAttr = function(value) {
	ToolbarUtilityClass.setIconAttr('ET_Edit_Undo', value);
}

// ------------- Redoアイコンの有効/無効更新
EditorToolClass.setRedoAttr = function(value) {
	ToolbarUtilityClass.setIconAttr('ET_Edit_Redo', value);
}


// ======================= コンテキストメニュー用関数 =======================

// ------------- コンテキストメニューの表示
EditorToolClass.ShowContextMenu = function(menuID, x, y) {
	// menuID [I, str] : 表示したいコンテキストメニューのulタグID
	var posArr;
	if (x == undefined || y == undefined) {
		// 位置の基準となるメニュー項目の divタグID を取得します。
		var iconID = this.MenuSectionTable[menuID]['iconID'];
		// コンテキストメニューを表示すべき座標を算出します。
		posArr = ToolbarUtilityClass.GetDropMenuPosition(ID_ET_MASTER_LAYER, iconID);
	} else {
		posArr = {'top' : y, 'left' : x}; // 仮
	}
	// コンテキストメニューを表示します。
	ToolbarUtilityClass.ShowContextMenu(menuID, posArr);
}

/*
// ------------- コンテキストメニューの表示
EditorToolClass.ShowContextMenu = function(menuID) {
	// menuID [I, str] : 表示したいコンテキストメニューのulタグID

	// 位置の基準となるメニュー項目の divタグID を取得します。
	var iconID = this.MenuSectionTable[menuID]['iconID'];
	// コンテキストメニューを表示すべき座標を算出します。
	var posArr = ToolbarUtilityClass.GetDropMenuPosition(ID_ET_MASTER_LAYER, iconID);
	// コンテキストメニューを表示します。
	ToolbarUtilityClass.ShowContextMenu(menuID, posArr);
}
*/

