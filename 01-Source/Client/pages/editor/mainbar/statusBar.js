/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_statusBar.js                                    */
/* -                                                                         */
/* -    概      要     ： ステータスバークラス                               */
/* -                                                                         */
/* -    依      存     ： ToolBar.html, TB_common.js                         */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年04月28日                         */

/* =================== ツールバークラス 命名規則 (暫定) ==================== */
/* TBC_ : Tool Bar Common    : 全クラス共通                                  */
/* MB_  : MenuBar            : メニューバー                                  */
/* MT_  : Main   Toolbar     : メインツールバー（大アイコン表示）            */
/* IT_  : Index  Toolbar     : インデックス操作用ツールバー（小アイコン表示）*/
/* ET_  : Editor Toolbar     : エディタ用ツールバー（小アイコン表示）        */
/* ST_  : Section Title bar  : セクションタイトルバー（小アイコン表示）      */
/* SB_  : Status Bar         : ステータスバー                                */
/* ※HTMLタグIDは、上記接頭文字から始めます。                                */
/* ※CSS classは、cl_ の後、上記接頭文字を続ける形とします。                 */
/*========================================================================== */

/* ===================== ツールバークラス 基本方針 ========================= */
/* ・アイコンの disable/enable 状態及び、チェックマークの状態は、            */
/*   当モジュール内では管理しません。                                        */
/* ========================================================================= */

// ============================= 定数 =============================
const ID_SB_MASTER_LAYER   = 'SB_MasterLayer';  // ステータスバーマスターレイヤのdivタグID

// コンテキストメニュー
//const ID_CM_SB_INPUT_MODE = 'SB_InputMode_ConMenu';


const ID_SB_DESCRIPTION            = 'SB_Description';  // 機能説明文 spanタグID
const ID_SB_FUNCKTIONKEY           = 'SB_FunctionKeys'; // ファンクションキー説明文 spanタグID
const ID_SB_INMODE_TEXT            = 'SB_InputMode_Text';              // 入力モード文字列表示用 spanタグID
const ID_SB_INMODE_IMG_TEXTMODE    = 'SB_InputMode_Image_TextMode';    // 入力モード画像用divタグID: テキストモード
const ID_SB_INMODE_IMG_FORMULAMODE = 'SB_InputMode_Image_FormulaMode'; // 入力モード画像用divタグID: 数式モード
const ID_SB_ROW_NUMBER             = 'SB_RowNumber';  // 行番号の spanタグID
const ID_SB_COL_NUMBER             = 'SB_ColNumber';  // 列番号の spanタグID

// 機能説明文字列
const STR_SB_READY = 'レディ';  // デフォルト表示

// ファンクションキー説明文字列
const STR_SB_FUNC_TEXT    = '';                                                 // テキストモード: 空文字列
const STR_SB_FUNC_FORMULA = 'F5: 分数  F6: 根号  F7: 総和  F8: 積分  F9: 極限　'; // 数式モード、及び化学式モード

// 入力モード定数
const INMODE_SB_TEXT     = 1; // 入力モード: テキスト
const INMODE_SB_FORMULA  = 2; // 入力モード: 数式
const INMODE_SB_CHEMICAL = 3; // 入力モード: 化学式

// 入力モード文字列
const STR_SB_INMODE_TEXT    = 'テキストモード'; // テキストモード時の表示文字列
const STR_SB_INMODE_FORMULA = '数式モード';     // 数式モード時の文字列
const STR_SB_INMODE_CHEMICAL = '化学式モード'   // 化学式モード時の文字列

// *************************************************************
// **                 メインツールバークラス                  **
// **                メインツールバーの機能群                 **
// **                                                         **
// *************************************************************
function StatusBarClass() {}



// ============================= プロパティ設定 =============================

// コンテキストメニューのulタグIDと、位置の基準になるdivタグIDの組み合わせを格納した連想配列です。
// この連想配列へ記録されたコンテキストメニューは、ToolbarUtilityClass.RegistContextMenu() にて、
// 自動的に jQuery ui へ登録されます。
StatusBarClass.MenuSectionTable = {};  // 最初は空の連想配列です。

// ======================== 初期化処理 ========================


StatusBarClass.Init = function() {

	// コンテキストメニュー生成
//	PopupMenu.CreateMenu(PopupMenu.inputMode); // 入力モード

	// ------------- コンテキストメニュー用連想配列をセット
	// 大元ハッシュキー       : コンテキストメニューの ulタグID です。
	// 参照先連想配列のiconID : コンテキストメニュー表示位置の基準となるDOMの divタグID です。
	// 　※参照先がnull       : ポップアップメニューは、他のDOMを位置の基準としないため、null参照です。
//	var tgtHash = this.MenuSectionTable;     // 連想配列オブジェクトを参照します。
	// --- ドロップダウン / メニューバー項目形式 ---
//	tgtHash[ID_CM_SB_INPUT_MODE] = {'iconID' : 'SB_InputMode_Base'}; // 入力モード

//	ToolbarUtilityClass.RegistContextMenu(tgtHash);  // コンテキストメニューを登録します。

	this.SB_SetDescription(STR_SB_READY);         // 機能説明文の初期値をセットします。
	this.SB_SetFuncktionKeyStr(STR_SB_FUNC_TEXT); // ファンクションキー説明文の初期値をセットします。
	this.SB_SetInputMode(INMODE_SB_TEXT);         // 入力モードを初期値のテキストモードへセットします。
//	this.SB_SetRowColNumber(10000, 10000);                // 行/列 表示を初期値へセットします。
	this.SB_SetRowColNumber(1, 1);                // 行/列 表示を初期値へセットします。

}

// ======================== クリック動作 ========================
/*
// ------------- 入力モードクリック時
StatusBarClass.SB_InputMode_Base = function() {

	this.ShowContextMenu(ID_CM_SB_INPUT_MODE);
}
*/

// ======================== 表示変更 ========================

StatusBarClass.SB_SetDescription = function(str) {
	// str [I, str]: 機能説明文に表示する文字列
	$('#' + ID_SB_DESCRIPTION).text(str);   // 機能説明文字列を設定します。
}

StatusBarClass.SB_SetFuncktionKeyStr = function(str) {
	// str [I, str]: ファンクションキー説明文に表示する文字列
	$('#' + ID_SB_FUNCKTIONKEY).text(str);  // ファンクションキー説明文字列を設定します。
}

// ------------- 入力モードの表示
// ※ここで扱うのは、あくまで、ステータスバー上での表示についてのみです。
// メニューや他のアイコンを含めた入力モード切り替えの外部IF関数は、別途用意します。
StatusBarClass.SB_SetInputMode = function(inputMode) {
	// inputMode [I, const]: 入力モード定数
	//    INMODE_SB_TEXT     = テキストモード
	//    INMODE_SB_FORMULA  = 数式モード
	//    INMODE_SB_CHEMICAL = 化学式モード
	// ※無効なモードが設定された場合は、テキストモードとして処理します。

	// 初期値は、テキストモードにセット
	var inModeStr          = STR_SB_INMODE_TEXT;
	var textMode_Zindex    =  0;
	var formulaMode_Zindex = -1;
	if (inputMode == INMODE_SB_FORMULA || inputMode == INMODE_SB_CHEMICAL) {
		// 数式か化学式モードなら
		inModeStr          = (inputMode == INMODE_SB_FORMULA ) ? STR_SB_INMODE_FORMULA : STR_SB_INMODE_CHEMICAL;
		textMode_Zindex    = -1;
		formulaMode_Zindex =  0;
	}
	$('#' + ID_SB_INMODE_TEXT           ).text(inModeStr);
	$('#' + ID_SB_INMODE_IMG_TEXTMODE   ).css('z-index',    textMode_Zindex+11);
	$('#' + ID_SB_INMODE_IMG_FORMULAMODE).css('z-index', formulaMode_Zindex+11);

	// ファンクションショートカットの表示
	if (inputMode == INMODE_SB_FORMULA) StatusBarClass.SB_SetFuncktionKeyStr(STR_SB_FUNC_FORMULA);
	else StatusBarClass.SB_SetFuncktionKeyStr(STR_SB_FUNC_TEXT);
}


// ------------- 行 / 列番号の表示
StatusBarClass.SB_SetRowColNumber = function(rowNumber, colNumber) {
	// rowNumber [I, str/num]: 行番号
	// colNumber [I, str/num]: 列番号
	this.SB_SetRowNumber(rowNumber);  // 行番号をセット
	this.SB_SetColNumber(colNumber);  // 列番号をセット
}

// ------------- 行番号の表示
StatusBarClass.SB_SetRowNumber = function(rowNumber) {
	// rowNumber [I, str/num]: 行番号
	$('#' + ID_SB_ROW_NUMBER).text(rowNumber);// 行番号をセット
//	$('#' + ID_SB_ROW_NUMBER).text(1000);// 行番号をセット
}

// ------------- 列番号の表示
StatusBarClass.SB_SetColNumber = function(colNumber) {
	// colNumber [I, str/num]: 列番号
	$('#' + ID_SB_COL_NUMBER).text(colNumber);// 列番号をセット
//	$('#' + ID_SB_COL_NUMBER).text(1000);// 列番号をセット
}



// ======================= コンテキストメニュー用関数 =======================

// ------------- コンテキストメニューの表示
StatusBarClass.ShowContextMenu = function(menuID) {
	// menuID [I, str] : 表示したいコンテキストメニューのulタグID

	// 位置の基準となるメニュー項目の divタグID を取得します。
	var iconID = this.MenuSectionTable[menuID]['iconID'];
	// コンテキストメニューを表示すべき座標を算出します。
	var posArr = ToolbarUtilityClass.GetDropMenuPosition(ID_SB_MASTER_LAYER, iconID);
	// 工事中: 表示の見た目合わせ
	posArr['top'] -= 125;
	// コンテキストメニューを表示します。
	ToolbarUtilityClass.ShowContextMenu(menuID, posArr);
}

