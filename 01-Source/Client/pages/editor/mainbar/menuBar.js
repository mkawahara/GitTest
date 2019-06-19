/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_menuBar.js                                      */
/* -                                                                         */
/* -    概      要     ： メニューバークラス                                 */
/* -                                                                         */
/* -    依      存     ： ToolBar.html, TB_menuBar.css, TB_common.js,        */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年02月13日                         */

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
const ID_MB_MASTER_LAYER = 'MB_MasterLayer';  // メニューバーのマスターレイヤ用divタグのID

const ID_MB_DDM_FILE    = 'MB_File_ConMenu'   ; // 「ファイル(F)        」コンテキストメニューのulタグID
const ID_MB_DDM_INDEX   = 'MB_Index_ConMenu'  ; // 「インデックス操作(D)」コンテキストメニューのulタグID
const ID_MB_DDM_EDIT    = 'MB_Edit_ConMenu'   ; // 「編集(E)            」コンテキストメニューのulタグID
const ID_MB_DDM_SEARCH  = 'MB_Search_ConMenu' ; // 「検索(I)            」コンテキストメニューのulタグID
const ID_MB_DDM_FORMAT  = 'MB_Format_ConMenu' ; // 「書式(O)            」コンテキストメニューのulタグID
const ID_MB_DDM_VIEW    = 'MB_View_ConMenu'   ; // 「表示(V)            」コンテキストメニューのulタグID
const ID_MB_DDM_READING = 'MB_Reading_ConMenu'; // 「読み上げ機能(P)    」コンテキストメニューのulタグID
const ID_MB_DDM_SETTING = 'MB_Setting_ConMenu'; // 「設定(S)            」コンテキストメニューのulタグID
const ID_MB_DDM_HELP    = 'MB_Help_ConMenu'   ; // 「ヘルプ(H)          」コンテキストメニューのulタグID

// ------------- メニューバー用キーコード
// 既存のキーコードは、javascriptのバージョンによって変更と新しいものの使用が推奨されているようです。
// よくわからなかったので、ひとまず別途定義しました。
const MB_KEY_ALT       = 18;   // Altキー
const MB_KEY_F_FILE    = 70;   // ファイル(F)
const MB_KEY_D_INDEX   = 68;   // インデックス操作(D)
const MB_KEY_E_EDIT    = 69;   // 編集(E)
const MB_KEY_I_SEARCH  = 73;   // 検索(I)
const MB_KEY_O_FORMAT  = 79;   // 書式(O)
const MB_KEY_V_VIEW    = 86;   // 表示(V)
const MB_KEY_P_SPEECH  = 80;   // 読み上げ機能(P) 不使用
const MB_KEY_S_SETTING = 83;   // 設定(S)
const MB_KEY_S_HELP    = 72;   // ヘルプ(H)
const MB_KEY_LEFT      = 37;   // 左矢印
const MB_KEY_RIGHT     = 39;   // 右矢印
const MB_KEY_UP        = 38;   // 上矢印
const MB_KEY_DOWN      = 40;   // 下矢印

// *************************************************************
// **                   メニューバークラス                    **
// **                  メニューバーの機能群                   **
// **                                                         **
// *************************************************************
function MenuBarClass() {}

// コンテキストメニューのulタグIDと、位置の基準になるdivタグIDの組み合わせを格納した連想配列です。
// この連想配列へ記録されたコンテキストメニューは、ToolbarUtilityClass.RegistContextMenu() にて、
// 自動的に jQuery ui へ登録されます。
//MenuBarClass.MenuSectionTable  = {};  // 最初は空の連想配列です。
MenuBarClass.MenuNum           = 0;   // メインメニュー項目数
MenuBarClass.CheckedMenuIndex  = 0;   // チェックされているメニュー項目のインデックスです(0ならチェックなし)。


// ======================== 初期化処理 ========================

MenuBarClass.Init = function() {
	// コンテキストメニュー生成
	PopupMenu.CreateMenu(ID_MB_DDM_FILE   ); // ファイル系　　メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_INDEX  ); // インデックス系メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_EDIT   ); // 編集系　　　　メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_SEARCH ); // 検索系　　　　メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_FORMAT ); // 書式系　　　　メニュー
//	PopupMenu.CreateMenu(ID_MB_DDM_VIEW   ); // 表示系　　　　メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_READING); // 読み上げ機能　メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_SETTING); // 設定系　　　　メニュー
	PopupMenu.CreateMenu(ID_MB_DDM_HELP   ); // ヘルプ系　　　メニュー

/*
	PopupMenu.CreateMenu(PopupMenu.fileMenu   ); // ファイル系　　メニュー
	PopupMenu.CreateMenu(PopupMenu.indexMenu  ); // インデックス系メニュー
	PopupMenu.CreateMenu(PopupMenu.editMenu   ); // 編集系　　　　メニュー
	PopupMenu.CreateMenu(PopupMenu.searchMenu ); // 検索系　　　　メニュー
	PopupMenu.CreateMenu(PopupMenu.formatMenu ); // 書式系　　　　メニュー
	PopupMenu.CreateMenu(PopupMenu.viewMenu   ); // 表示系　　　　メニュー
	PopupMenu.CreateMenu(PopupMenu.readingMenu); // 読み上げ機能　メニュー
	PopupMenu.CreateMenu(PopupMenu.settingMenu); // 設定系　　　　メニュー
	PopupMenu.CreateMenu(PopupMenu.helpMenu   ); // ヘルプ系　　　メニュー
	
	// ------------- コンテキストメニュー用連想配列をセット
	// ハッシュキー : コンテキストメニューの ulタグID です。
	// index        : キー操作による移動の順番です。1から始まる連番でなければなりません。
	//                ※最初の実装のため、連番出ない場合を想定していません。
	// iconID       : コンテキストメニュー表示位置の基準となるアイコンの divタグID です。
	// checkMarkID  : チェックマークハイライト用の divタグID です。
	var tgtHash = MenuBarClass.MenuSectionTable;     // 連想配列オブジェクトを参照します。
	tgtHash[ID_MB_DDM_FILE   ] = {'index' : 1, 'iconID' : 'MB_File'   , 'checkMarkID' : 'MB_File_CheckMark'   };
	tgtHash[ID_MB_DDM_INDEX  ] = {'index' : 2, 'iconID' : 'MB_Index'  , 'checkMarkID' : 'MB_Index_CheckMark'  };
	tgtHash[ID_MB_DDM_EDIT   ] = {'index' : 3, 'iconID' : 'MB_Edit'   , 'checkMarkID' : 'MB_Edit_CheckMark'   };
	tgtHash[ID_MB_DDM_SEARCH ] = {'index' : 4, 'iconID' : 'MB_Search' , 'checkMarkID' : 'MB_Search_CheckMark' };
	tgtHash[ID_MB_DDM_FORMAT ] = {'index' : 5, 'iconID' : 'MB_Format' , 'checkMarkID' : 'MB_Format_CheckMark' };
	tgtHash[ID_MB_DDM_VIEW   ] = {'index' : 6, 'iconID' : 'MB_View'   , 'checkMarkID' : 'MB_View_CheckMark'   };
	tgtHash[ID_MB_DDM_READING] = {'index' : 7, 'iconID' : 'MB_Reading', 'checkMarkID' : 'MB_Reading_CheckMark'};
	tgtHash[ID_MB_DDM_SETTING] = {'index' : 8, 'iconID' : 'MB_Setting', 'checkMarkID' : 'MB_Setting_CheckMark'};
//	tgtHash[ID_MB_DDM_SETTING] = {'index' : 7, 'iconID' : 'MB_Setting', 'checkMarkID' : 'MB_Setting_CheckMark'};
	tgtHash[ID_MB_DDM_HELP   ] = {'index' : 9, 'iconID' : 'MB_Help'   , 'checkMarkID' : 'MB_Help_CheckMark'   };
//	tgtHash[ID_MB_DDM_HELP   ] = {'index' : 8, 'iconID' : 'MB_Help'   , 'checkMarkID' : 'MB_Help_CheckMark'   };
	MenuBarClass.MenuNum = 9;	// メインメニュー項目の総数
//	MenuBarClass.MenuNum = 8;	// メインメニュー項目の総数
	// ファイル(F), インデックス操作(D), 編集(E), 検索(I), 書式(O), 表示(V), <読み上げ機能(P) 不使用>,
	// 設定(S), ヘルプ(H)

	// ------------- 初期化用関数群を実行します。
	ToolbarUtilityClass.RegistContextMenu(tgtHash);  // コンテキストメニューを登録します。
*/

//	this.SetDocumentKeyEvent(); // キーボードイベントを登録します。
//	this.SetLocalKeyEvent();
}

// ------------- 「ファイル(F)」メニュークリック時
MenuBarClass.MB_Open = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_FILE);
}

// ------------- 「インデックス操作(D)」メニュークリック時
MenuBarClass.MB_Index = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_INDEX);
}

// ------------- 「編集(E)」メニュークリック時
MenuBarClass.MB_Edit = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_EDIT);
}

// ------------- 「検索(I)」メニュークリック時
MenuBarClass.MB_Search = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_SEARCH);
}

// ------------- 「書式(O)」メニュークリック時
MenuBarClass.MB_Format = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_FORMAT);
}

// ------------- 「表示(V)」メニュークリック時
MenuBarClass.MB_View = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_VIEW);
}

// ------------- 「読み上げ機能(P)」メニュークリック時
MenuBarClass.MB_Reading = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_READING);
}

// ------------- 「設定(S)」メニュークリック時
MenuBarClass.MB_Setting = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_SETTING);
}

// ------------- 「ヘルプ(H)」メニュークリック時
MenuBarClass.MB_Help = function() {

	MenuBarClass.ShowContextMenu(ID_MB_DDM_HELP);
}



// ======================= コンテキストメニュー用関数 =======================
// ------------- コンテキストメニューの表示
MenuBarClass.ShowContextMenu = function(menuID) {
// menuID [I, str]     : 表示したいコンテキストメニューのulタグID
	// メニュー選択のチェックを全てクリアします。
	MenuBarClass.ClearMenuCheck();
	// 位置の基準となるメニュー項目の divタグID を取得します。
//	var iconID = MenuBarClass.MenuSectionTable[menuID]['iconID'];
	var iconID = PopupMenu.MenuSectionTable[menuID]['iconID'];

	// コンテキストメニューを表示すべき座標を算出します。
	var posArr = ToolbarUtilityClass.GetDropMenuPosition(ID_MB_MASTER_LAYER, iconID);
	// コンテキストメニューを表示します。
	ToolbarUtilityClass.ShowContextMenu(menuID, posArr);
	// 該当メニューをチェック状態にします。
//	MenuBarClass.CheckedMenuIndex = MenuBarClass.MenuSectionTable[menuID]['index'];
	MenuBarClass.CheckedMenuIndex = PopupMenu.MenuSectionTable[menuID]['index'];
	MenuBarClass.SetMenuCheck(true);
};

// キーボード待ち受けステータス
const MB_KR_DEFAULT       = 0;  // Altキー押下待ち: document用イベントを待つ。
const MB_KR_ALT_ON        = 1;  // メニューバー項目キー押下待ち
const MB_KR_CONTEXT_MODE  = 2;  // コンテキストメニュー内のキー操作
const MB_KR_MAINMENU_MOVE = 3;	// メインメニューのハイライトのみ移動するモード : メインメニュー用イベントを待つ

MenuBarClass.AltDownEnableFlag = true;

// ------------- Altキーによるショートカット: documentレベルのイベント処理登録
MenuBarClass.SetDocumentKeyEvent = function() {
	$(document).on({
		'keydown': function (evt) {
			if (evt.altKey) {
//				evt.preventDefault();	// ブラウザ自身のメニューバーへフォーカスが移るのを防ぎます。
//			}
//		},
//		'keydown': function (evt) {
//		'keyup': function (evt) {
			// ------------- Altキー押し離し
//			if (evt.keyCode == MB_KEY_ALT) {
				// メニューバーがチェックされているなら
				if (MenuBarClass.CheckedMenuIndex != 0) return;

				evt.preventDefault();	// ブラウザ自身のメニューバーへフォーカスが移るのを防ぎます。

//				if (!MenuBarClass.AltDownEnableFlag) return;

				MenuBarClass.AltDownEnableFlag = false;

				$('#MB_Overall').focus();	// メニューバーへフォーカスを移します。
				// メニューバーの先頭項目をチェックマークハイライト対象にします。
				MenuBarClass.MoveRightMenuIndex();
				// メニューバーの先頭項目をチェックマークハイライトします。
				MenuBarClass.SetMenuCheck(true);
			}
		}
	});
}

// ------------- Altキーによるショートカット: メニューバーレベルのイベント処理登録
MenuBarClass.SetLocalKeyEvent = function() {
	$('#MB_Overall').on({
		'keydown': function (evt, ui) {
			// ------------- キー押下

			switch (evt.keyCode) {
				case MB_KEY_RIGHT:	// メニューの右移動
					evt.preventDefault();

					if (ToolbarUtilityClass.MenuMovableFlags['right']) {
						MenuBarClass.MoveRightMenuIndex();
						MenuBarClass.MoveContext();
					}
					break;

				case MB_KEY_LEFT:	// メニューの左移動
					evt.preventDefault();

					if (ToolbarUtilityClass.MenuMovableFlags['left']) {
						MenuBarClass.MoveLeftMenuIndex();
						MenuBarClass.MoveContext();
					}
					break;

				case MB_KEY_UP  :	// コンテキストメニューが表示されていない場合、
				case MB_KEY_DOWN:	// 上キーと下キーは同じ動作をします。
				// コンテキストメニューが表示されていないならコンテキストメニューを表示します。
					if (ToolbarUtilityClass.ShownDropMenuID == '') {
						evt.preventDefault();              // デフォルト動作を禁止して
						MenuBarClass.ShowCurrentContext(); // コンテキストメニューを表示します。
					}
					break;

				case MB_KEY_ALT:	// メニュー選択の解除
				case TBC_KEY_ESC:
					evt.preventDefault();              // デフォルト動作を禁止して
					ToolbarUtilityClass.HideContextWithRelatedFunctions();
					break;
			}
		}
/*
		,
		'keyup': function (evt) {
			if (evt.keyCode == MB_KEY_ALT) MenuBarClass.AltDownEnableFlag = true;
		}
*/

	});
}


// ------------- 選択されているメニュー項目を右隣へ移動します。
MenuBarClass.MoveRightMenuIndex = function() {
	// 現在選択されているメニュー項目のチェックを外します。
	if (MenuBarClass.CheckedMenuIndex != 0) MenuBarClass.SetMenuCheck(false);
	var nextIndex = MenuBarClass.CheckedMenuIndex + 1;    // インデックスを一つ増加(右へ移動)します。
	if (nextIndex > MenuBarClass.MenuNum) nextIndex = 1;  // これ以上右に項目がなければ、左端へ戻ります。
	// 移動先メニュー項目に対する ulタグID を取得します。
	var retStr = MenuBarClass.IndexToMenuID(nextIndex);
	// 有効なメニューなら、現在選択中のインデックス番号を新しい物へ置き換えます。
	if (retStr != '') MenuBarClass.CheckedMenuIndex = nextIndex;
	// 新しく選択されたメニュー項目のチェックを入れます。
	this.SetMenuCheck(true);
}

// ------------- 選択されているメニュー項目を左隣へ移動します。
MenuBarClass.MoveLeftMenuIndex = function() {
	// 現在選択されているメニュー項目のチェックを外します。
	if (MenuBarClass.CheckedMenuIndex != 0) MenuBarClass.SetMenuCheck(false);
	if (MenuBarClass.CheckedMenuIndex <= 0) {	// インデクスが初期値(0)なら、左端の項目へ移動します。
		nextIndex = 1;
	} else {
		var nextIndex = MenuBarClass.CheckedMenuIndex - 1;    // インデックスを一つ減少(左へ移動)します。
		if (nextIndex <= 0 ) nextIndex = MenuBarClass.MenuNum;  // これ以上左に項目がなければ、右端へ戻ります。
	}
	// 移動先メニュー項目に対する ulタグID を取得します。
	var retStr = MenuBarClass.IndexToMenuID(nextIndex);
	// 有効なメニューなら、現在選択中のインデックス番号を新しい物へ置き換えます。
	if (retStr != '') MenuBarClass.CheckedMenuIndex = nextIndex;
	// 新しく選択されたメニュー項目のチェックを入れます。
	this.SetMenuCheck(true);
}

// ------------- 指定したインデックスのメニュー項目に対する ulタグID を取得します。
MenuBarClass.IndexToMenuID = function(targetIndex) {
	// targetIndex[I, num]: 該当メニュー項目に対するインデックス番号
	// 返値       [str]   : 移動先メニュー項目に対するチェックマーク用 ulタグID (該当無しは空文字列)
	var retStr = '';	// 返値: 初期値は空行です。
//	for (var menuID in MenuBarClass.MenuSectionTable) {
	for (var menuID in PopupMenu.MenuSectionTable) {
//		if (this.MenuSectionTable[menuID]['index'] == targetIndex) {
//		if (PopupMenu.MenuSectionTable[menuID]['index'] == targetIndex) {
		var menuInfo = PopupMenu.MenuSectionTable[menuID];
		if (menuInfo === null) continue;
		if (menuInfo.index == targetIndex) {
			retStr = menuID;
			break;
		}
	}
	return(retStr);
}

// ------------- 現在のメニュー項目に対する チェック状態の切り替えを行います。
MenuBarClass.SetMenuCheck = function(checkStat) {
	// checkStat [I, bool]: アイコンの状態
	//                      true = チェックON, false = チェックOFF
	if (MenuBarClass.CheckedMenuIndex == 0) return;
	var targetMenuID = MenuBarClass.IndexToMenuID(MenuBarClass.CheckedMenuIndex);
//	var checkMarkID  = MenuBarClass.MenuSectionTable[targetMenuID]['checkMarkID'];
	var checkMarkID  = PopupMenu.MenuSectionTable[targetMenuID]['checkMarkID'];
	ToolbarUtilityClass.setIconCheck(checkMarkID, checkStat);
}

// ------------- メニュー選択のチェックを全てクリアします。
MenuBarClass.ClearMenuCheck = function() {
//	for (menuID in MenuBarClass.MenuSectionTable) {
	for (menuID in PopupMenu.MenuSectionTable) {
//		var checkMarkID  = MenuBarClass.MenuSectionTable[menuID]['checkMarkID'];
//		var checkMarkID  = PopupMenu.MenuSectionTable[menuID]['checkMarkID'];
		if (menuID === void 0) continue;
//		var checkMarkID  = PopupMenu.MenuSectionTable[menuID]['checkMarkID'];
		var menuInfo  = PopupMenu.MenuSectionTable[menuID];
		if (menuInfo === null) continue;
		var checkMarkID  = menuInfo.checkMarkID;
		
		ToolbarUtilityClass.setIconCheck(checkMarkID, false);
	}
	MenuBarClass.CheckedMenuIndex = 0;
}

// キーボードによるメニュー項目移動時のコンテキストメニュー表示を行います。
MenuBarClass.MoveContext = function() {
	if (ToolbarUtilityClass.ShownDropMenuID != '') {
		// コンテキストメニューが表示されていたら
		MenuBarClass.ShowCurrentContext();	// 新しく表示すべきコンテキストメニューを表示します。
	}
}

// 現在選択されているコンテキストメニューを表示します。
MenuBarClass.ShowCurrentContext = function() {
	// 表示すべきコンテキストメニューの ul タグIDを取得します。
	var menuID = MenuBarClass.IndexToMenuID(MenuBarClass.CheckedMenuIndex);
	// コンテキストメニューを表示します。
	MenuBarClass.ShowContextMenu(menuID);
}



