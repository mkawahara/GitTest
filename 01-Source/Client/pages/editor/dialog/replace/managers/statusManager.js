/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： statusManager.js                                   */
/* -                                                                         */
/* -    概      要     ： GUIアイコン類のモード管理と操作用I/F               */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 37.0.2             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月06日                         */

// ============================= 定数 =============================

// 脚注書式設定用定数
// ！！！注意！！！　データクラスにも、FONT_STYLE 列挙体に sup, sub が存在しますが、
// GUI の管理用には不向きな構造のため、StatusManager 用に別途定義しました。
const SM_FOOTNOTE_FORMAT = {
	'none' : 0, // 脚注書式 無し
	'sup'  : 1, // 脚注書式 上付き
	'sub'  : 2  // 脚注書式 下付き
};



// メニューバーで使用しているアイコンの ID の先頭文字列
const ICON_ID_TEXT_MODE     = 'icon220_'; // テキストモード　　アイコン
const ICON_ID_MATH_MODE     = 'icon222_'; // 数式モード　　　　アイコン
const ICON_ID_CHAMICAL_MODE = 'icon224_'; // 化学式モード　　　アイコン
const ICON_ID_ITALIC        = 'icon228_'; // イタリック　　　　アイコン
const ICON_ID_BOLD          = 'icon230_'; // 太字　　　　　　　アイコン
const ICON_ID_UNDERLINE     = 'icon232_'; // 下線　　　　　　　アイコン
const ICON_ID_STRIKE        = 'icon234_'; // 打消し線　　　　　アイコン
const ICON_ID_FOOTNOTE_SUP  = 'icon238_'; // 脚注書式（上付き）アイコン
const ICON_ID_FOOTNOTE_SUB  = 'icon240_'; // 脚注書式（下付き）アイコン
const ICON_ID_ALIGN_LEFT    = 'icon242_'; // 左揃え　　　　　　アイコン
const ICON_ID_ALIGN_CENTER  = 'icon244_'; // 中央揃え　　　　　アイコン
const ICON_ID_ALIGN_RIGHT   = 'icon246_'; // 右揃え　　　　　　アイコン
const ICON_ID_FONT_1        = 'icon198_'; // フォントサイズ 1  アイコン
const ICON_ID_FONT_2        = 'icon200_'; // フォントサイズ 2  アイコン
const ICON_ID_FONT_3        = 'icon202_'; // フォントサイズ 3  アイコン
const ICON_ID_FONT_4        = 'icon204_'; // フォントサイズ 4  アイコン
const ICON_ID_FONT_5        = 'icon206_'; // フォントサイズ 5  アイコン

function StatusManager() {
	// アイコン等の Enable / Disable の初期状態を設定します。
	// ※ Enable / Disable の変化が起こりえないアイコン・メニューは、管理対象外としています。
	this.attrRef = {};  // アイコン・メニューの Enable/Disable 管理用オブジェクトです。
	this.attrRef.save = false; // 文書変更状態: Disable ・・・ 文書は変更されていない。
	this.attrRef.undo = false; // "Undo" 機能 : Disable
	this.attrRef.redo = false; // "Redo" 機能 : Disable
	// アイコン・メニューの Enable / Disable の初期状態を反映します。
//	StatusManager.refrectAllAttribute();
	this.refrectAllAttribute();

	// 状態を持つアイコン・メニューの初期状態を設定します。
	this.statRef = {}; // アイコン・メニューの ステータス 管理用オブジェクトです。
	this.statRef.inputmode = CIO_XML_TYPE.text;       // 入力モード     : テキスト
	this.statRef.italic    = false;                   // イタリック体   : 無し
	this.statRef.bold      = false;                   // 太字           : 無し
	this.statRef.underline = false;                   // 下線           : 無し
	this.statRef.strike    = false;                   // 打消し線       : 無し
	this.statRef.footnote  = SM_FOOTNOTE_FORMAT.none; // 脚注書式       : 無し
	this.statRef.align     = PARAGRAPH_ALIGN.left;    // アライン       : 左揃え
	this.statRef.fontsize  = FONT_SIZE.medium;        // フォントサイズ : 3 (小さい: 1 -> 大きい: 5)
	// 状態を持つアイコン・メニューの初期状態を反映します。
//	StatusManager.refrectAllStatus();
	this.refrectAllStatus();
};

StatusManager._instance = null;

Object.defineProperty(StatusManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (StatusManager._instance === null) StatusManager._instance = new StatusManager();
		return StatusManager._instance;
	},
});



// ************************************************************************
// **                上書き保存アイコン の 有効化 / 無効化               **
// ************************************************************************

// [static] ------------- Save アイコン・メニューの有効 / 無効を設定します。
StatusManager.prototype.setSaveAttribute = function(attrFlag) {
	// attrFlag [bool] :  true = アイコン・メニュー有効
	//                   false = アイコン・メニュー無効
	this.attrRef.save = attrFlag; // 状態を設定します。
	StatusManager.instance.refrectSaveAttribute();           // GUIへ反映します。
}

// [static] ------------- 文書が変更されたかどうかをチェックします。
StatusManager.prototype.getSaveAttribute = function() {
	// 返値 [bool] :  true = 変更されています。
	//               false = 変更されていません。
	return this.attrRef.save;
}

// [static] ------------- Save アイコン・メニューの状態を GUIへ反映します。
StatusManager.prototype.refrectSaveAttribute = function() {
	var attrFlag = this.attrRef.save;   // 状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconAttr('MT_Save', attrFlag);
	// ----- メニュー状態の更新
	// ★工事中
}



// ************************************************************************
// **                      Undo の 有効化 / 無効化                       **
// ************************************************************************

// [static] ------------- Undo アイコン・メニューの有効 / 無効を設定します。
StatusManager.prototype.setUndoAttribute = function(attrFlag) {
	// attrFlag [bool] :  true = アイコン・メニュー有効
	//                   false = アイコン・メニュー無効
	this.attrRef.undo = attrFlag; // 状態を設定します。
	StatusManager.instance.refrectUndoAttribute();           // GUIへ反映します。
}

// [static] ------------- Undo アイコン・メニューの状態を GUIへ反映します。
StatusManager.prototype.refrectUndoAttribute = function() {
	var attrFlag = this.attrRef.undo;   // 状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconAttr('MT_Undo', attrFlag);
	// ----- メニュー状態の更新
	// ★工事中
}



// ************************************************************************
// **                      Redo の 有効化 / 無効化                       **
// ************************************************************************

// [static] ------------- Redo アイコン・メニューの有効 / 無効を設定します。
StatusManager.prototype.setRedoAttribute = function(attrFlag) {
	// attrFlag [bool] :  true = アイコン・メニュー有効
	//                   false = アイコン・メニュー無効
	this.attrRef.redo = attrFlag; // 状態を設定します。
	this.refrectRedoAttribute();           // GUIへ反映します。
}

// [static] ------------- Redo アイコン・メニューの状態を GUIへ反映します。
StatusManager.prototype.refrectRedoAttribute = function() {
	var attrFlag = this.attrRef.redo;   // 状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconAttr('MT_Redo', attrFlag);
	// ----- メニュー状態の更新
	// ★工事中
}



// [static] ------------- 入力モード等を GUI へ一括反映
StatusManager.prototype.refrectAllAttribute = function() {
	this.refrectSaveAttribute();
	this.refrectUndoAttribute();
	this.refrectRedoAttribute();
};



// ステータス ======================================================================================================

// ************************************************************************
// **                 入力モード(テキスト、数式、化学式)                 **
// ************************************************************************

// [static] ------------- 入力モードを設定します。
StatusManager.prototype.setInputMode = function(inputMode) {
	// inputMode [enum: CIO_XML_TYPE]: CIO_XML_TYPE.text     テキストモード --- 既定値
	//                                 CIO_XML_TYPE.math     数式モード
	//                                 CIO_XML_TYPE.chemical 化学式モード

    if (this.statRef.inputmode != inputMode) {
        // テキスト or 化学式 → 数式のときは斜体指定
        if (inputMode == CIO_XML_TYPE.math) this.setItalic(true);
        // 数式 → テキスト or 化学式のときは斜体指定を解除
        else this.setItalic(false);
    }

	this.statRef.inputmode = inputMode;
	this.refrectInputMode();             // GUIへ反映
}

// [static] ------------- 入力モードをアイコンとメニューへ反映します。
StatusManager.prototype.refrectInputMode = function() {
	var inputMode = this.statRef.inputmode;
	// GUI 用に、フラグ設定
	var textFlag = inputMode == CIO_XML_TYPE.text     ? true : false;
	var mathFlag = inputMode == CIO_XML_TYPE.math     ? true : false;
	var chamFlag = inputMode == CIO_XML_TYPE.chemical ? true : false;
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Text_CheckMark'    , textFlag);
	ToolbarUtilityClass.setIconCheck('ET_Format_Formula_CheckMark' , mathFlag);
	ToolbarUtilityClass.setIconCheck('ET_Format_Chemical_CheckMark', chamFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_TEXT_MODE,     textFlag);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_MATH_MODE,     mathFlag);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_CHAMICAL_MODE, chamFlag);
	// ----- ステータスバーアイコン状態の更新
	// ★工事中

}



// ************************************************************************
// **                           イタリック体                             **
// ************************************************************************

// [static] ------------- イタリック体指定を設定します。
StatusManager.prototype.setItalic = function(italicFlag) {
	// italicFlag [bool]:  true = イタリック指定あ
	//                    false = イタリック指定無し --- 既定値
	this.statRef.italic = italicFlag; // イタリック体の指定状態を設定します。
	this.refrectItaric();                // GUIへ反映します。
}

// [static] ------------- イタリック体指定を反転します。
StatusManager.prototype.toggleItalic = function() {
	this.statRef.italic = !this.statRef.italic; // イタリック体の指定状態を反転
	this.refrectItaric();                                      // GUIへ反映します。
}

// [static] ------------- イタリック体指定をアイコンに反映します。
StatusManager.prototype.refrectItaric = function() {
	var italicFlag = this.statRef.italic; // イタリック体の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Italic_CheckMark', italicFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_ITALIC, italicFlag);
}



// ************************************************************************
// **                               太字                                 **
// ************************************************************************

// [static] ------------- 太字指定を設定します。
StatusManager.prototype.setBold = function(boldFlag) {
	// boldFlag : true = 太字指定あり、false = 太字指定無し --- 既定値
	this.statRef.bold = boldFlag; // 太字の指定状態を設定します。
	this.refrectBold();              // GUIへ反映
}

// [static] ------------- 太字指定を反転します。
StatusManager.prototype.toggleBold = function() {
	this.statRef.bold = !this.statRef.bold; // 太字の指定状態を反転
	this.refrectBold();             // GUIへ反映
}

// [static] ------------- 太字指定をアイコンに反映します。
StatusManager.prototype.refrectBold = function() {
	var boldFlag = this.statRef.bold; // 太字の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Bold_CheckMark', boldFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_BOLD, boldFlag);
}



// ************************************************************************
// **                               下線                                 **
// ************************************************************************

// [static] ------------- 下線指定を設定します。
StatusManager.prototype.setUnderline = function(underlinelFlag) {
	// underlinelFlag : true = 下線指定あり、false = 下線指定無し --- 既定値
	this.statRef.underline = underlinelFlag; // 下線の指定状態を設定します。
	this.refrectUnderline();                    // GUIへ反映します。
}

// [static] ------------- 下線指定を反転します。
StatusManager.prototype.toggleUnderline = function() {
	this.statRef.underline = !this.statRef.underline; // 下線の指定状態を反転します。
	this.refrectUnderline();                                         // GUIへ反映します。
}

// [static] ------------- 下線指定をアイコンに反映します。
StatusManager.prototype.refrectUnderline = function() {
	underlinelFlag = this.statRef.underline; // 下線の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Underline_CheckMark', underlinelFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_UNDERLINE, underlinelFlag);
}



// ************************************************************************
// **                             打消し線                               **
// ************************************************************************

// [static] ------------- 打消し線指定を設定します。
StatusManager.prototype.setStrike = function(strikeFlag) {
	// underlinelFlag : true = 打消し線指定あり、false = 打消し線指定無し --- 既定値
	this.statRef.strike = strikeFlag; // 打消し線の指定状態を設定します。
	this.refrectStrike();                // GUIへ反映
}

// [static] ------------- 打消し線指定を反転します。
StatusManager.prototype.toggleStrike = function() {
	this.statRef.strike = !this.statRef.strike; // 打消し線の指定状態を反転します。
	this.refrectStrike();                                      // GUIへ反映
}

// [static] ------------- 打消し線指定をアイコンに反映します。
StatusManager.prototype.refrectStrike = function() {
	strikeFlag = this.statRef.strike; // 打消し線の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Strikethrough_CheckMark', strikeFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_STRIKE, strikeFlag);
}



// ************************************************************************
// **                             脚注書式                               **
// ************************************************************************

// [static] ------------- 脚注書式指定を設定します。
StatusManager.prototype.setFootnote = function(footnoteMode) {
	// footnoteMode : SM_FOOTNOTE_FORMAT.none = 脚注書式 無し --- 既定値
	//                                  .sup  = 脚注書式 上付き
	//                                  .sub  = 脚注書式 下付き
	// ※上付きと下付きは、どちらかしか指定できません。
	this.statRef.footnote = footnoteMode; // 脚注書式の指定状態を設定します。
	this.refrectFootnote();           // GUIへ反映
}

// [static] ------------- 脚注書式指定をトグルします。
StatusManager.prototype.toggleFootnote = function(targetType) {
	// targetType :  : SM_FOOTNOTE_FORMAT.sup  = 「脚注書式上付き」をトグルする
	//                                   .sub  = 「脚注書式下付き」をトグルする
	var footnoteMode = this.statRef.footnote; // 脚注書式の指定状態を取得します。
	if (targetType == footnoteMode) {                     // ------- 指定された脚注書式モードに既になっているなら
		this.statRef.footnote = SM_FOOTNOTE_FORMAT.none; // 上付き・下付き指定を解除します。
	} else {                                              // ------- 指定された脚注書式モードが現在のものと異なるなら
		this.statRef.footnote = targetType;              // 上付き、もしくは下付きを指定します。
	}
	this.refrectFootnote();                      // GUIへ反映します。
}

// [static] ------------- 脚注書式指定をアイコンに反映します。
StatusManager.prototype.refrectFootnote = function() {
	var footnoteMode = this.statRef.footnote;                // 脚注書式の指定状態を取得します。
	var supFlag = footnoteMode == SM_FOOTNOTE_FORMAT.sup ? true : false; // 上付きフラグ
	var subFlag = footnoteMode == SM_FOOTNOTE_FORMAT.sub ? true : false; // 下付きフラグ
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_FootnoteTop_CheckMark',    supFlag);
	ToolbarUtilityClass.setIconCheck('ET_Format_FootnoteBottom_CheckMark', subFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FOOTNOTE_SUP, supFlag);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FOOTNOTE_SUB, subFlag);
}



// ************************************************************************
// **                             アライン                               **
// ************************************************************************

// [static] ------------- アラインを設定します。
StatusManager.prototype.setAlign = function(alignType) {
	// alignType : PARAGRAPH_ALIGN.left   = 左揃え --- 既定値
	//                            .center = 中央揃え
	//                            .right  = 右揃え
	// ★パラグラフ等に対してもしアクションが必要なら、ここで記述する。
	this.statRef.align = alignType; // アラインの指定状態を設定します。
	this.refrectAlign();               // GUIへ反映します。
}

// [static] ------------- アラインをアイコン・メニューへ反映します。
StatusManager.prototype.refrectAlign = function() {
	var alignType = this.statRef.align;                             // アラインの指定状態を取得します。
	var leftFlag   = alignType == PARAGRAPH_ALIGN.left   ? true : false;        // 左揃え　アイコンの状態
	var centerFlag = alignType == PARAGRAPH_ALIGN.center ? true : false;        // 中央揃えアイコンの状態
	var rightFlag  = alignType == PARAGRAPH_ALIGN.right  ? true : false;        // 右揃え　アイコンの状態
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Left_CheckMark',   leftFlag  ); // 左揃え　ツールアイコン更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Center_CheckMark', centerFlag); // 中央揃えツールアイコン更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Right_CheckMark',  rightFlag ); // 右揃え　ツールアイコン更新
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_ALIGN_LEFT,   leftFlag  );         // 左揃え　メニューアイコン更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_ALIGN_CENTER, centerFlag);         // 中央揃えメニューアイコン更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_ALIGN_RIGHT,  rightFlag );         // 右揃え　メニューアイコン更新
}



// ************************************************************************
// **                            フォントサイズ                          **
// ************************************************************************

// [static] ------------- フォントサイズを設定します。
StatusManager.prototype.setFontSize = function(fontSize) {
	// fontSize : FONT_SIZE.x_small = フォントサイズ 1 最少
	//                     .small   = フォントサイズ 2
	//                     .medium  = フォントサイズ 3 既定値
	//                     .large   = フォントサイズ 4
	//                     .x_large = フォントサイズ 5 最大
	// ★パラグラフ等に対してもしアクションが必要なら、ここで記述する。
	this.statRef.fontsize = fontSize; // フォントサイズの指定状態を設定します。
	this.refrectFontSize();              // GUIへ反映します。
}

// [static] ------------- フォントサイズをアイコン・メニューへ反映します。
StatusManager.prototype.refrectFontSize = function() {
	return;
	var fontSize = this.statRef.fontsize;             // フォントサイズの指定状態を取得します。
	var fontFlag1 = fontSize == FONT_SIZE.x_small ? true : false; // フォント 1 フラグ
	var fontFlag2 = fontSize == FONT_SIZE.small   ? true : false; // フォント 2 フラグ
	var fontFlag3 = fontSize == FONT_SIZE.medium  ? true : false; // フォント 3 フラグ
	var fontFlag4 = fontSize == FONT_SIZE.large   ? true : false; // フォント 4 フラグ
	var fontFlag5 = fontSize == FONT_SIZE.x_large ? true : false; // フォント 5 フラグ

	// ----- アイコン状態の更新
	// 代表フォントサイズアイコンは、画像の差し替えが必要となります。
	// 代表フォントサイズアイコンにすべき png ファイルの番号を取得します。
	var newImgNumber; // 各フォントサイズ用アイコンの png ファイルの番号部分を抽出します。
	if (fontFlag1) newImgNumber = ICON_ID_FONT_1.match(/^icon(\d+)_$/)[1];
	if (fontFlag2) newImgNumber = ICON_ID_FONT_2.match(/^icon(\d+)_$/)[1];
	if (fontFlag3) newImgNumber = ICON_ID_FONT_3.match(/^icon(\d+)_$/)[1];
	if (fontFlag4) newImgNumber = ICON_ID_FONT_4.match(/^icon(\d+)_$/)[1];
	if (fontFlag5) newImgNumber = ICON_ID_FONT_5.match(/^icon(\d+)_$/)[1];
	// 現在セットされている png ファイル名を取得します。
	var $imgObj = $('#ET_Format_FontSizeImage');
	var imgName = $imgObj.attr('src');
	// ファイル名文字列 (パス含む) のファイル名部分を変更します。
	imgName = imgName.replace(/\d+\.png$/, newImgNumber + '.png');
	// アイコン用画像ファイルを差し替えます。
	$imgObj.attr('src', imgName);

	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FONT_1, fontFlag1);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FONT_2, fontFlag2);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FONT_3, fontFlag3);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FONT_4, fontFlag4);
	ToolbarUtilityClass.setMenuCheck(ICON_ID_FONT_5, fontFlag5);
}



// ************************************************************************
// **                 キャレット位置からのステータス取得                 **
// ************************************************************************

// [static] ------------- キャレット位置のノードのステータス状態を GUI へ反映します。
StatusManager.prototype.showCaretStatus = function() {
	var nodeStatus = this.getCaretNodeStatus();    // カーソル位置から、ノードの書式情報を取得します。
 	// ステータスマネージャへ書式情報を保存し、GUIへ反映します。
 	if (nodeStatus) this.setAllStatus(nodeStatus);
}

// [static] ------------- キャレット位置にあるノードからステータス状態を取得します。
StatusManager.prototype.getCaretNodeStatus = function() {
	// 返値: this.statRef と同じ形式のオブジェクト。
	//                    ['inputmode'] : 入力モード       CIO_XML_TYPE.text, math, chemical
	//                    ['italic'   ] : イタリック体指定 true / false
	//                    ['bold'     ] : 太字指定         true / false
	//                    ['underline'] : 下線指定         true / false
	//                    ['strike'   ] : 打消し線指定     true / false
	//                    ['footnote' ] : 脚注書式         SM_FOOTNOTE_FORMAT.none, sup. sub
	//                    ['align'    ] : アライン         PARAGRAPH_ALIGN.left, center, right
	//                    ['fontsize' ] : フォントサイズ   FONT_SIZE.x_small, small, medium, large, x_large

	var section = DocumentManager.getCurrentSection(); // 現在のセクションを取得します。
	// キャレット位置のノードを取得します。
//	var caretNode = $(section).find('#' + ViewManager.getEditorPane().getCaret().pos)[0];
//	var caretPos = ViewManager.getEditorPane().getCaret().pos;
	var caretPos = ViewManager.getCaret().pos;
ViewManager.getCaret
	var caretNode = $(section).find('#' + caretPos)[0];
	var dataNode  = caretNode.previousSibling;       // キャレット位置のノードの兄ノードを取得します。
	if (!dataNode) dataNode = caretNode.parentNode;  // 兄ノード不在なら親ノードを取得します。
	if (!dataNode) return null;                      // 親ノード不在なら、null を返します。
	DataClass.bindDataClassMethods(dataNode);        // データノードへオブジェクト使用直前の doop を行います。

	// ---- 脚注書式
	var footnote = SM_FOOTNOTE_FORMAT.none;              // 既定値は、脚注書式無し
	if (dataNode.sup) footnote = SM_FOOTNOTE_FORMAT.sup; // ノードに上付き指定があるなら、脚注書式上付き指定にします。
	if (dataNode.sub) footnote = SM_FOOTNOTE_FORMAT.sub; // ノードに下付き指定があるなら、脚注書式下付き指定にします。

	// ---- 返値作成
	var nodeStatus = {};
	// 単一ステータス
	nodeStatus['inputmode'] = dataNode.nt;                          // 入力モード
	nodeStatus['italic'   ] = dataNode.ital;                        // イタリック体
	nodeStatus['bold'     ] = dataNode.bold;                        // 太字指定
	nodeStatus['underline'] = dataNode.uline;                       // 下線指定
	nodeStatus['strike'   ] = dataNode.strk;                        // 打消し線指定
	nodeStatus['footnote' ] = footnote;                             // 脚注書式
	// パラグラフステータス
	var parentNode = DataClass.getRootParagraph(dataNode);          // 親の Paragraph を取得
	nodeStatus['align'    ] = parentNode.align;                     // 段落の align 指定
	nodeStatus['fontsize' ] = parentNode.fontSize;                  // 段落の フォントサイズ 指定

	return(nodeStatus);
}

// [static] ------------- ステータスをまとめて設定し、GUI へ反映します。
StatusManager.prototype.setAllStatus = function(statusSet) {
	// statusSet ; this.statRef と同じ形式のオブジェクト。
	//                    ['inputmode'] : 入力モード       CIO_XML_TYPE.text, math, chemical
	//                    ['italic'   ] : イタリック体指定 true / false
	//                    ['bold'     ] : 太字指定         true / false
	//                    ['underline'] : 下線指定         true / false
	//                    ['strike'   ] : 打消し線指定     true / false
	//                    ['footnote' ] : 脚注書式         SM_FOOTNOTE_FORMAT.none, sup. sub
	//                    ['align'    ] : アライン         PARAGRAPH_ALIGN.left, center, right
	//                    ['fontsize' ] : フォントサイズ   FONT_SIZE.x_small, small, medium, large, x_large
	this.statRef['inputmode'] = statusSet['inputmode']; // 入力モード
	this.statRef['italic'   ] = statusSet['italic'   ]; // イタリック体
	this.statRef['bold'     ] = statusSet['bold'     ]; // 太字指定
	this.statRef['underline'] = statusSet['underline']; // 下線指定
	this.statRef['strike'   ] = statusSet['strike'   ]; // 打消し線指定
	this.statRef['footnote' ] = statusSet['footnote' ]; // 脚注書式
	this.statRef['align'    ] = statusSet['align'    ]; // アライン
	this.statRef['fontsize' ] = statusSet['fontsize' ]; // フォントサイズ

	this.refrectAllStatus();                    // GUI へ反映します。
}

// [static] ------------- 入力モード等を GUI へ一括反映
StatusManager.prototype.refrectAllStatus = function() {
	// 返値無し
	this.refrectInputMode();
	this.refrectItaric();
	this.refrectBold();
	this.refrectUnderline();
	this.refrectStrike();
	this.refrectFootnote();
	this.refrectAlign();
	this.refrectFontSize();
}

// [static] ------------- ステータス値を取得します。
StatusManager.prototype.getStatus = function(statusName) {
	// statusName [str] : ステータス種類を表す文字列
	// 返値 : 指定されステータスの値
	return this.statRef[statusName];
}

// [static] ------------- ステータス値を全て取得します。
StatusManager.prototype.getAllStatus = function() {
	// 返値 : ステータス値全てを格納したオブジェクト
	return this.statRef;
}



