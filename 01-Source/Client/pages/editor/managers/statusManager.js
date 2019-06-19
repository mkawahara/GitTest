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
const ICON_ID_VOICE         = 'icon337_'; // 音声 On/Off 　　　アイコン
const ICON_ID_HILIGHT       = 'icon339_'; // ハイライト On/Off アイコン


function StatusManager() {};

StatusManager.ItemAttribute = {};  // アイコン・メニューの Enable/Disable 管理用オブジェクトです。
StatusManager.ItemStatus    = {};  // アイコン・メニューの ステータス管理用オブジェクトです。
StatusManager.ItemStatusPrev = {}; // アイコン・メニューの 直前のステータスを保持するオブジェクトです。

// ============================= 初期化処理 =============================

// [static] ------------- ステータスマネージャクラスの初期化処理を行います。
StatusManager.Init = function() {
	// アイコン等の Enable / Disable の初期状態を設定します。
	// ※ Enable / Disable の変化が起こりえないアイコン・メニューは、管理対象外としています。
	var attrRef = StatusManager.ItemAttribute;
	attrRef.save = false; // 文書変更状態: Disable ・・・ 文書は変更されていない。
	attrRef.undo = false; // "Undo" 機能 : Disable
	attrRef.redo = false; // "Redo" 機能 : Disable
	// アイコン・メニューの Enable / Disable の初期状態を反映します。
	StatusManager.refrectAllAttribute();

	// 状態を持つアイコン・メニューの初期状態を設定します。
	var statRef = StatusManager.ItemStatus;
	statRef.inputmode = CIO_XML_TYPE.text;       // 入力モード     : テキスト
	statRef.italic    = false;                   // イタリック体   : 無し
	statRef.bold      = false;                   // 太字           : 無し
	statRef.underline = false;                   // 下線           : 無し
	statRef.strike    = false;                   // 打消し線       : 無し
	statRef.footnote  = SM_FOOTNOTE_FORMAT.none; // 脚注書式       : 無し
	statRef.align     = PARAGRAPH_ALIGN.left;    // アライン       : 左揃え
	statRef.fontsize  = FONT_SIZE.medium;        // フォントサイズ : 3 (小さい: 1 -> 大きい: 5)
	statRef.voice     = false;                   // 音声           : OFF
	statRef.hilight   = false;                   // ハイライト     : OFF
	statRef.speaker   = null;                    // 話者           : 無し

	// 状態を持つアイコン・メニューの直前状態を初期化します。(初期状態では全て undefined でよいため、何もしません)
	var prevStatRef = StatusManager.ItemStatusPrev;

	// 状態を持つアイコン・メニューの初期状態を反映します。
	StatusManager.refrectAllStatus();
};



// Enable / Disable 属性 =============================================================================================

// ************************************************************************
// **                            音声 On/Off                             **
// ************************************************************************

// [static] ------------- 音声 On/Off を設定します。
StatusManager.setVoice = function(voiceFlag) {
	// voiceFlag [bool]:  true  = 音声 On
	//                    false = 音声 Off
	StatusManager.ItemStatus.voice = voiceFlag; // 音声の指定状態を設定します。
	StatusManager.refrectVoice();               // GUIへ反映します。
}

// [static] ------------- 音声 On/Off を反転します。
StatusManager.toggleVoice = function() {
	StatusManager.ItemStatus.voice = !StatusManager.ItemStatus.voice; // 音声の指定状態を反転
	StatusManager.refrectVoice();                                     // GUIへ反映します。

}


// [static] ------------- 音声指定をアイコンに反映します。
StatusManager.refrectVoice = function() {
	var voiceFlag = StatusManager.ItemStatus.voice; // 音声 On/Off の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('MT_Voice_CheckMark', voiceFlag);
	// 音声 On / Off と、ハイライト Enable / Disable を連動させます。
	StatusManager.changeHilightLifeAndDethWithVoice();

	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_VOICE, voiceFlag);
	// ---- ReadManager へ音声 On/Off 設定
	ReadManager.instance.readingMode = voiceFlag;
}



// ************************************************************************
// *                          ハイライト On/Off                          **
// ************************************************************************

// [static] ------------- ハイライト On/Off を設定します。
StatusManager.setHighlight = function(hilightFlag) {
	// voiceFlag [bool]:  true  = 音声 On
	//                    false = 音声 Off
	StatusManager.ItemStatus.hilight = hilightFlag; // ハイライトの指定状態を設定します。
	StatusManager.refrectHilight();                 // GUIへ反映します。
}

// [static] ------------- ハイライト On/Off を反転します。
StatusManager.toggleHilight = function() {
	StatusManager.ItemStatus.hilight = !StatusManager.ItemStatus.hilight; // ハイライトの指定状態を反転
	StatusManager.refrectHilight();                                     // GUIへ反映します。
};

// [static] ------------- ハイライト On/Off を、音声 On/Off に追従させます。
StatusManager.changeHilightWithVoice = function() {
	var voiceFlag = StatusManager.ItemStatus.voice; // 音声の指定状態を取得します。
	StatusManager.ItemStatus.hilight = voiceFlag; // ハイライトの指定状態を音声の指定状態と同じにします。
	StatusManager.refrectHilight();                                     // GUIへ反映します。
};

StatusManager.changeHilightLifeAndDethWithVoice = function() {
	var voiceFlag = StatusManager.ItemStatus.voice; // 音声の指定状態を取得します。
	ToolbarUtilityClass.setIconAttr('MT_Hilight', voiceFlag);
}

// [static] ------------- ハイライト指定をアイコンに反映します。
StatusManager.refrectHilight = function() {
	var hilightFlag = StatusManager.ItemStatus.hilight; // ハイライト On/Off の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('MT_Hilight_CheckMark', hilightFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_HILIGHT, hilightFlag);
	// ---- ReadManager へハイライト On/Off 設定
	ReadManager.instance.showHighlight = hilightFlag;
};



// ************************************************************************
// **                上書き保存アイコン の 有効化 / 無効化               **
// ************************************************************************

// [static] ------------- Save アイコン・メニューの有効 / 無効を設定します。
StatusManager.setSaveAttribute = function(attrFlag) {
	// attrFlag [bool] :  true = アイコン・メニュー有効
	//                   false = アイコン・メニュー無効
	StatusManager.ItemAttribute.save = attrFlag; // 状態を設定します。
	StatusManager.refrectSaveAttribute();           // GUIへ反映します。
}

// [static] ------------- 文書が変更されたかどうかをチェックします。
StatusManager.getSaveAttribute = function() {
	// 返値 [bool] :  true = 変更されています。
	//               false = 変更されていません。
	return StatusManager.ItemAttribute.save;
}

// [static] ------------- Save アイコン・メニューの状態を GUIへ反映します。
StatusManager.refrectSaveAttribute = function() {
	var attrFlag = StatusManager.ItemAttribute['save'];   // 状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconAttr('MT_Save', attrFlag);
	// ----- メニュー状態の更新
	// ★工事中
}



// ************************************************************************
// **                      Undo の 有効化 / 無効化                       **
// ************************************************************************

// [static] ------------- Undo アイコン・メニューの有効 / 無効を設定します。
StatusManager.setUndoAttribute = function(attrFlag) {
	// attrFlag [bool] :  true = アイコン・メニュー有効
	//                   false = アイコン・メニュー無効
	StatusManager.ItemAttribute['undo'] = attrFlag; // 状態を設定します。
	StatusManager.refrectUndoAttribute();           // GUIへ反映します。
}

// [static] ------------- Undo アイコン・メニューの状態を GUIへ反映します。
StatusManager.refrectUndoAttribute = function() {
	var attrFlag = StatusManager.ItemAttribute['undo'];   // 状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconAttr('MT_Undo', attrFlag);
	// ----- メニュー状態の更新
	// ★工事中
}



// ************************************************************************
// **                      Redo の 有効化 / 無効化                       **
// ************************************************************************

// [static] ------------- Redo アイコン・メニューの有効 / 無効を設定します。
StatusManager.setRedoAttribute = function(attrFlag) {
	// attrFlag [bool] :  true = アイコン・メニュー有効
	//                   false = アイコン・メニュー無効
	StatusManager.ItemAttribute['redo'] = attrFlag; // 状態を設定します。
	StatusManager.refrectRedoAttribute();           // GUIへ反映します。
}

// [static] ------------- Redo アイコン・メニューの状態を GUIへ反映します。
StatusManager.refrectRedoAttribute = function() {
	var attrFlag = StatusManager.ItemAttribute['redo'];   // 状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconAttr('MT_Redo', attrFlag);
	// ----- メニュー状態の更新
	// ★工事中
}



// [static] ------------- 入力モード等を GUI へ一括反映
StatusManager.refrectAllAttribute = function() {
	StatusManager.refrectSaveAttribute();
	StatusManager.refrectUndoAttribute();
	StatusManager.refrectRedoAttribute();
};



// ステータス ======================================================================================================

// ************************************************************************
// **                 入力モード(テキスト、数式、化学式)                 **
// ************************************************************************

// [static] ------------- 入力モードを設定します。
StatusManager.setInputMode = function(inputMode) {
	// inputMode [enum: CIO_XML_TYPE]: CIO_XML_TYPE.text     テキストモード --- 既定値
	//                                 CIO_XML_TYPE.math     数式モード
	//                                 CIO_XML_TYPE.chemical 化学式モード

	// テキストモードへの移行を禁止する場合。
	if (inputMode == CIO_XML_TYPE.text) { // ---- テキストモードへの移行指定の場合
		// ---- キャレット位置のノードを取得します。
		var section   = DocumentManager.getCurrentSection(); // 現在のセクションを取得します。
		var caretPos  = ViewManager.getEditorPane().getCaret().pos;
		var caretNode = $(section).find('#' + caretPos)[0];
		if (caretNode == null) return;
		var parentNode = caretNode.parentNode;
		DataClass.bindDataClassMethods(parentNode); // doop
		if (parentNode.nt != CIO_XML_TYPE.text) { // ---- 親がテキストモードでなければ
			return;
		}
	}

    if (StatusManager.ItemStatus.inputmode != inputMode) {
        // テキスト or 化学式 → 数式のときは斜体指定
        if (inputMode == CIO_XML_TYPE.math) StatusManager.setItalic(true);
        // 数式 → テキスト or 化学式のときは斜体指定を解除
        else StatusManager.setItalic(false);
    }

	StatusManager.ItemStatus.inputmode = inputMode;
	StatusManager.refrectInputMode();             // GUIへ反映
}

// [static] ------------- 入力モードをアイコンとメニューへ反映します。
StatusManager.refrectInputMode = function() {
	var inputMode = StatusManager.ItemStatus.inputmode;
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
    StatusBarClass.SB_SetInputMode(inputMode);

}



// ************************************************************************
// **                           イタリック体                             **
// ************************************************************************

// [static] ------------- イタリック体指定を設定します。
StatusManager.setItalic = function(italicFlag) {
	// italicFlag [bool]:  true = イタリック指定あ
	//                    false = イタリック指定無し --- 既定値
	StatusManager.ItemStatus.italic = italicFlag; // イタリック体の指定状態を設定します。
	StatusManager.refrectItaric();                // GUIへ反映します。
}

// [static] ------------- イタリック体指定を反転します。
StatusManager.toggleItalic = function() {
	StatusManager.ItemStatus.italic = !StatusManager.ItemStatus.italic; // イタリック体の指定状態を反転
	StatusManager.refrectItaric();                                      // GUIへ反映します。
}

// [static] ------------- イタリック体指定をアイコンに反映します。
StatusManager.refrectItaric = function() {
	var italicFlag = StatusManager.ItemStatus.italic; // イタリック体の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Italic_CheckMark', italicFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_ITALIC, italicFlag);
}



// ************************************************************************
// **                               太字                                 **
// ************************************************************************

// [static] ------------- 太字指定を設定します。
StatusManager.setBold = function(boldFlag) {
	// boldFlag : true = 太字指定あり、false = 太字指定無し --- 既定値
	StatusManager.ItemStatus.bold = boldFlag; // 太字の指定状態を設定します。
	StatusManager.refrectBold();              // GUIへ反映
}

// [static] ------------- 太字指定を反転します。
StatusManager.toggleBold = function() {
	StatusManager.ItemStatus.bold = !StatusManager.ItemStatus.bold; // 太字の指定状態を反転
	StatusManager.refrectBold();             // GUIへ反映
}

// [static] ------------- 太字指定をアイコンに反映します。
StatusManager.refrectBold = function() {
	var boldFlag = StatusManager.ItemStatus.bold; // 太字の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Bold_CheckMark', boldFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_BOLD, boldFlag);
}



// ************************************************************************
// **                               下線                                 **
// ************************************************************************

// [static] ------------- 下線指定を設定します。
StatusManager.setUnderline = function(underlinelFlag) {
	// underlinelFlag : true = 下線指定あり、false = 下線指定無し --- 既定値
	StatusManager.ItemStatus.underline = underlinelFlag; // 下線の指定状態を設定します。
	StatusManager.refrectUnderline();                    // GUIへ反映します。
}

// [static] ------------- 下線指定を反転します。
StatusManager.toggleUnderline = function() {
	StatusManager.ItemStatus.underline = !StatusManager.ItemStatus.underline; // 下線の指定状態を反転します。
	StatusManager.refrectUnderline();                                         // GUIへ反映します。
}

// [static] ------------- 下線指定をアイコンに反映します。
StatusManager.refrectUnderline = function() {
	underlinelFlag = StatusManager.ItemStatus.underline; // 下線の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Underline_CheckMark', underlinelFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_UNDERLINE, underlinelFlag);
}



// ************************************************************************
// **                             打消し線                               **
// ************************************************************************

// [static] ------------- 打消し線指定を設定します。
StatusManager.setStrike = function(strikeFlag) {
	// underlinelFlag : true = 打消し線指定あり、false = 打消し線指定無し --- 既定値
	StatusManager.ItemStatus.strike = strikeFlag; // 打消し線の指定状態を設定します。
	StatusManager.refrectStrike();                // GUIへ反映
}

// [static] ------------- 打消し線指定を反転します。
StatusManager.toggleStrike = function() {
	StatusManager.ItemStatus.strike = !StatusManager.ItemStatus.strike; // 打消し線の指定状態を反転します。
	StatusManager.refrectStrike();                                      // GUIへ反映
}

// [static] ------------- 打消し線指定をアイコンに反映します。
StatusManager.refrectStrike = function() {
	strikeFlag = StatusManager.ItemStatus.strike; // 打消し線の指定状態を取得します。
	// ----- アイコン状態の更新
	ToolbarUtilityClass.setIconCheck('ET_Format_Strikethrough_CheckMark', strikeFlag);
	// ----- メニュー状態の更新
	ToolbarUtilityClass.setMenuCheck(ICON_ID_STRIKE, strikeFlag);
}



// ************************************************************************
// **                             脚注書式                               **
// ************************************************************************

// [static] ------------- 脚注書式指定を設定します。
StatusManager.setFootnote = function(footnoteMode) {
	// footnoteMode : SM_FOOTNOTE_FORMAT.none = 脚注書式 無し --- 既定値
	//                                  .sup  = 脚注書式 上付き
	//                                  .sub  = 脚注書式 下付き
	// ※上付きと下付きは、どちらかしか指定できません。
	StatusManager.ItemStatus.footnote = footnoteMode; // 脚注書式の指定状態を設定します。
	StatusManager.refrectFootnote();           // GUIへ反映
}

// [static] ------------- 脚注書式指定をトグルします。
StatusManager.toggleFootnote = function(targetType) {
	// targetType :  : SM_FOOTNOTE_FORMAT.sup  = 「脚注書式上付き」をトグルする
	//                                   .sub  = 「脚注書式下付き」をトグルする
	var footnoteMode = StatusManager.ItemStatus.footnote; // 脚注書式の指定状態を取得します。
	if (targetType == footnoteMode) {                     // ------- 指定された脚注書式モードに既になっているなら
		StatusManager.ItemStatus.footnote = SM_FOOTNOTE_FORMAT.none; // 上付き・下付き指定を解除します。
	} else {                                              // ------- 指定された脚注書式モードが現在のものと異なるなら
		StatusManager.ItemStatus.footnote = targetType;              // 上付き、もしくは下付きを指定します。
	}
	StatusManager.refrectFootnote();                      // GUIへ反映します。
}

// [static] ------------- 脚注書式指定をアイコンに反映します。
StatusManager.refrectFootnote = function() {
	var footnoteMode = StatusManager.ItemStatus.footnote;                // 脚注書式の指定状態を取得します。
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
StatusManager.setAlign = function(alignType) {
	// alignType : PARAGRAPH_ALIGN.left   = 左揃え --- 既定値
	//                            .center = 中央揃え
	//                            .right  = 右揃え
	// ★パラグラフ等に対してもしアクションが必要なら、ここで記述する。
	StatusManager.ItemStatus.align = alignType; // アラインの指定状態を設定します。
	StatusManager.refrectAlign();               // GUIへ反映します。
}

// [static] ------------- アラインをアイコン・メニューへ反映します。
StatusManager.refrectAlign = function() {
	var alignType = StatusManager.ItemStatus.align;                             // アラインの指定状態を取得します。
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
StatusManager.setFontSize = function(fontSize) {
	// fontSize : FONT_SIZE.x_small = フォントサイズ 1 最少
	//                     .small   = フォントサイズ 2
	//                     .medium  = フォントサイズ 3 既定値
	//                     .large   = フォントサイズ 4
	//                     .x_large = フォントサイズ 5 最大
	// ★パラグラフ等に対してもしアクションが必要なら、ここで記述する。
	StatusManager.ItemStatus.fontsize = fontSize; // フォントサイズの指定状態を設定します。
	StatusManager.refrectFontSize();              // GUIへ反映します。
}

// [static] ------------- フォントサイズをアイコン・メニューへ反映します。
StatusManager.refrectFontSize = function() {
	var fontSize = StatusManager.ItemStatus.fontsize;             // フォントサイズの指定状態を取得します。
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
// **                                 話者                               **
// ************************************************************************

// [static] ------------- 話者をメニューへ反映します。
StatusManager.refrectSpeaker = function() {
	// ---- 話者数確認
	var speakerList = ConfigManager.instance.SpeakerList;
	if (speakerList.length < 1) return;

	// ----- メニュー状態の更新
	var spNumber = StatusManager.ItemStatus.speaker;                   // 話者番号
	var mainMenu = $('#MB_Speaker_ConMenu .cl_TBC_Menu_Col1_TD');      // メインメニューの話者リスト
	var toolMenu = $('#ET_Edit_Speaker_ConMenu .cl_TBC_Menu_Col1_TD'); // ツールメニューの話者リスト
	var speakerCount = mainMenu.length - 1;                            // 話者数
	for (var i = 0; i < speakerCount; i++) {
		if (i == spNumber) {
			$(mainMenu[i]).addClass('speaker_selected');
			$(toolMenu[i]).addClass('speaker_selected');
		} else {
			$(mainMenu[i]).removeClass('speaker_selected');
			$(toolMenu[i]).removeClass('speaker_selected');
		}
	}
};



// ************************************************************************
// **                 キャレット位置からのステータス取得                 **
// ************************************************************************

// [static] ------------- キャレット位置のノードのステータス状態を GUI へ反映します。
StatusManager.showCaretStatus = function() {
	var nodeStatus = StatusManager.getCaretNodeStatus();    // カーソル位置から、ノードの書式情報を取得します。

	if (nodeStatus) {
		// ステータスマネージャへ書式情報を保存し、GUIへ反映します。
 		StatusManager.setAllStatus(nodeStatus);

 		// カーソルの表示属性を更新します
 		EditorPaneClass.getCaret().setCaretStyle(EDT_FrontTextBox, nodeStatus);
 	};
}

// [static] ------------- キャレット位置にあるノードからステータス状態を取得します。
StatusManager.getCaretNodeStatus = function() {
	// 返値: StatusManager.ItemStatus と同じ形式のオブジェクト。
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
	var caretPos = ViewManager.getEditorPane().getCaret().pos;
	var caretNode = $(section).find('#' + caretPos)[0];
	if (caretNode == null) return null;    // 通常はないが念のため

	var dataNode  = caretNode.previousSibling;       // キャレット位置のノードの兄ノードを取得します。

	// 兄ノード不在なら最も近い先祖のレイアウト要素を取得します
	if (dataNode == null) {
	    dataNode = caretNode.parentNode;   // まずは親ノード

	    // 親がいない、あるいはセクションの場合は何もしません
	    if (dataNode == null || dataNode.nodeName == 'SECTION') return null;

	    // 親が段落でなければ、祖父を取得します（レイアウトノードの最寄りの祖先レイアウトノードは、祖父の位置にあります）
	    if (dataNode.nodeName != 'PARAGRAPH') {
		    dataNode = dataNode.parentNode;
		    if (dataNode == null) return null;
	    }
	}

	// 段落ノード以外での入力属性を取得します
	var nodeStatus = {};

    if (dataNode.nodeName != 'PARAGRAPH') {
		DataClass.bindDataClassMethods(dataNode);        // データノードへオブジェクト使用直前の doop を行います。

		// ---- 脚注書式
		var footnote = SM_FOOTNOTE_FORMAT.none;              // 既定値は、脚注書式無し
		if (dataNode.sup) footnote = SM_FOOTNOTE_FORMAT.sup; // ノードに上付き指定があるなら、脚注書式上付き指定にします。
		if (dataNode.sub) footnote = SM_FOOTNOTE_FORMAT.sub; // ノードに下付き指定があるなら、脚注書式下付き指定にします。

		// ---- 返値作成
		var isItalic = (dataNode.nt == CIO_XML_TYPE.math) ? !dataNode.ut : dataNode.ital;
		// 単一ステータス
		nodeStatus.inputmode = dataNode.nt;                          // 入力モード
		nodeStatus.italic    = isItalic;                             // イタリック体
		nodeStatus.bold      = dataNode.bold;                        // 太字指定
		nodeStatus.underline = dataNode.uline;                       // 下線指定
		nodeStatus.strike    = dataNode.strk;                        // 打消し線指定
		nodeStatus.footnote  = footnote;                             // 脚注書式
		nodeStatus.speaker   = dataNode.speaker;                     // 話者
    }

	// パラグラフステータス
	var parentNode = DataClass.getRootParagraph(dataNode);          // 親の Paragraph を取得
	DataClass.bindDataClassMethods(parentNode);
	nodeStatus['align'    ] = parentNode.align;                     // 段落の align 指定
	nodeStatus['fontsize' ] = parentNode.fontSize;                  // 段落の フォントサイズ 指定

	// テーブルセル内部の場合、align はセルから取得します
	var cellNode = DataClass.getNearTableCell(caretNode);
	if (cellNode) {
		DataClass.bindDataClassMethods(cellNode);
		nodeStatus['align'    ] = cellNode.align;                   // align をセルの値で上書きします
	}

	return(nodeStatus);
}

// [static] ------------- ステータスをまとめて設定し、GUI へ反映します。
StatusManager.setAllStatus = function(statusSet) {
	// statusSet ; StatusManager.ItemStatus と同じ形式のオブジェクト。
	//                    ['inputmode'] : 入力モード       CIO_XML_TYPE.text, math, chemical
	//                    ['italic'   ] : イタリック体指定 true / false
	//                    ['bold'     ] : 太字指定         true / false
	//                    ['underline'] : 下線指定         true / false
	//                    ['strike'   ] : 打消し線指定     true / false
	//                    ['footnote' ] : 脚注書式         SM_FOOTNOTE_FORMAT.none, sup. sub
	//                    ['align'    ] : アライン         PARAGRAPH_ALIGN.left, center, right
	//                    ['fontsize' ] : フォントサイズ   FONT_SIZE.x_small, small, medium, large, x_large

	var statRef = StatusManager.ItemStatus;
	if (statusSet.inputmode !== (void 0))	statRef.inputmode = statusSet.inputmode; // 入力モード
	if (statusSet.italic !== (void 0))		statRef.italic    = statusSet.italic;    // イタリック体
	if (statusSet.bold !== (void 0))		statRef.bold      = statusSet.bold;      // 太字指定
	if (statusSet.underline !== (void 0))	statRef.underline = statusSet.underline; // 下線指定
	if (statusSet.strike !== (void 0))		statRef.strike    = statusSet.strike;    // 打消し線指定
	if (statusSet.footnote !== (void 0))	statRef.footnote  = statusSet.footnote;  // 脚注書式
	if (statusSet.align !== (void 0))		statRef.align     = statusSet.align;     // アライン
	if (statusSet.fontsize !== (void 0))	statRef.fontsize  = statusSet.fontsize;  // フォントサイズ
	if (statusSet.speaker !== (void 0))		statRef.speaker   = statusSet.speaker;   // 話者

	StatusManager.refrectAllStatus();                    // GUI へ反映します。
}

// [static] ------------- 入力モード等を GUI へ一括反映
StatusManager.refrectAllStatus = function() {
	// ステータスへの参照
	var current = StatusManager.ItemStatus;
	var prev = StatusManager.ItemStatusPrev;

	// 返値無し
	if (prev.inputmode != current.inputmode) StatusManager.refrectInputMode();
	if (prev.italic != current.italic) StatusManager.refrectItaric();
	if (prev.bold != current.bold) StatusManager.refrectBold();
	if (prev.underline != current.underline) StatusManager.refrectUnderline();
	if (prev.strike != current.strike) StatusManager.refrectStrike();
	if (prev.footnote != current.footnote) StatusManager.refrectFootnote();
	if (prev.align != current.align) StatusManager.refrectAlign();
	if (prev.fontsize != current.fontsize) StatusManager.refrectFontSize();
	if (prev.voice != current.voice) StatusManager.refrectVoice();
	if (prev.hilight != current.hilight) StatusManager.refrectHilight();
	if (prev.speaker != current.speaker) StatusManager.refrectSpeaker();

	// 現在の状態をバックアップします
	prev.inputmode = current.inputmode;
	prev.italic    = current.italic;
	prev.bold      = current.bold;
	prev.underline = current.underline;
	prev.strike    = current.strike;
	prev.footnote  = current.footnote;
	prev.align     = current.align;
	prev.fontsize  = current.fontsize;
	prev.voice     = current.voice;
	prev.hilight   = current.hilight;
	prev.speaker   = current.speaker;

}

// [static] ------------- ステータス値を取得します。
StatusManager.getStatus = function(statusName) {
	// statusName [str] : ステータス種類を表す文字列
	// 返値 : 指定されステータスの値
	return StatusManager.ItemStatus[statusName];
}

// [static] ------------- ステータス値を全て取得します。
StatusManager.getAllStatus = function() {
	// 返値 : ステータス値全てを格納したオブジェクト
	return StatusManager.ItemStatus;
}



