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
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年08月17日                         */

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
const ID_CM_ET_SPEAKER     = 'ET_Edit_Speaker_ConMenu'      ; // 話者選択コンテキストメニューのulタグ名
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
//EditorToolClass.MenuSectionTable = {};  // 最初は空の連想配列です。



// ======================== 初期化処理 ========================

EditorToolClass.Init = function() {
	// コンテキストメニュー生成
	PopupMenu.CreateMenu(ID_CM_ET_FRAMEBORDER); // 囲み枠　　　　メニュー
	PopupMenu.CreateMenu(ID_CM_ET_FONTSIZE   ); // フォントサイズメニュー
	PopupMenu.CreateMenu(ID_CM_ET_INSERTIMAGE); // 画像処理　　　メニュー
//	PopupMenu.CreateMenu(ID_CM_ET_SPEAKER);     // 話者選択　　　メニュー
	PopupMenu.CreateMenu(ID_PM_ET_IMAGE);       // 画像上での右クリック時のポップアップメニュー
	PopupMenu.refreshRClick();                  // 数式レベルで右クリックのポップアップメニューを作成

	// イベント
	EditorToolClass.SetEvents();

}

EditorToolClass.SetEvents = function() {
// ID_EditorArea
	// ---- フォーカス時にセクション選択解除
	$('#ID_EditorArea').on('focus', function (event) {
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

// ------------- 「話者選択」アイコン/ドロップマーククリック時
EditorToolClass.ET_Edit_Speaker_Context = function() {
	this.ShowContextMenu(ID_CM_ET_SPEAKER);
}

// ------------- 「画像の挿入」アイコンクリック時
EditorToolClass.ET_Edit_InsertImage = function(src) {
	// 2017/7/12 画像ファイル選択機能実装に伴う書き換え
    //showMessageDialog('ファイルをドラッグ＆ドロップ、または貼り付け (Ctrl+V) により画像を挿入できます。');

	if (src.files.length < 1) {
		console.log('画像ファイルを挿入しようとしましたが、ファイル選択に失敗しています。');
		return;
	}

    // 画像ファイル以外は読み込みません
    if (!src.files[0].type.match('image.*')) {
    	showMessageDialog('画像ファイルを選択してください。');
        return;
    }

	var reader = new FileReader();
	reader.onload = function() {
		// 読み込んだ画像を挿入します
		//alert(reader.result);
		UiCommandWrapper.insertImage(reader.result);
	};

	reader.readAsDataURL(src.files[0]);
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
//		var iconID = this.MenuSectionTable[menuID]['iconID'];
//		var iconID = PopupMenu.MenuSectionTable[menuID]['iconID'];
		var menuInfo = PopupMenu.MenuSectionTable[menuID];
		if (menuInfo === null || menuInfo === void 0) {
			return;
		}
		var iconID = menuInfo.iconID;  // コンテキストメニューを表示すべき座標を算出します。
		posArr = ToolbarUtilityClass.GetDropMenuPosition(ID_ET_MASTER_LAYER, iconID);
	} else {
		posArr = {'top' : y, 'left' : x}; // 仮
	}

	// ポップアップメニューのサイズと位置、ウィンドウサイズから、位置の補正を行います
	var jmenu = $('#' + menuID);
	var width = jmenu.width();
	var docWidth = document.documentElement.clientWidth;
	if ((posArr.left + width) > docWidth) posArr.left = docWidth - width;

	var height = jmenu.height();
	var docHeight = document.documentElement.clientHeight;
	if ((posArr.top + height) > docHeight) posArr.top = docHeight - height;

	// コンテキストメニューを表示します。
	ToolbarUtilityClass.ShowContextMenu(menuID, posArr);
}
