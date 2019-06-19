/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_enum.js                                         */
/* -                                                                         */
/* -    概      要     ： データクラスで使用する列挙体の定義                 */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年04月27日                         */

// *************************************************************
// **                         列挙体                          **
// *************************************************************

/* DocumentManager で既に定義されていた
// テキスト用xmlか、MathML用xmlかを表す列挙体の定義（テーブルでしか関係ない）
const XML_TYPE = {
	'html'   : 1,
	'mathml' : 2
}
*/

// ------------- 段落のフォントサイズ
const FONT_SIZE = {
	'x_small' : 'font-x-small',
	'small'   : 'font-small'  ,
	'medium'  : 'font-medium' ,
	'large'   : 'font-large'  ,
	'x_large' : 'font-x-large'
};

// ------------- 段落の文字配置
const PARAGRAPH_ALIGN = {
	'left'    : 'left'    ,
	'center'  : 'center'  ,
	'right'   : 'right'   ,
	'justify' : 'justify'   // ★html仕様には存在するが、IMLXにはない。ただのメモ。
};

// ------------- 囲み枠
const BORDER_TYPE = {
	'normal' : 'box-border-normal'     , // 標準の枠
	'double' : 'box-border-double'     , // 二重線の枠
	'round'  : 'box-border-round'     , // 角の丸い枠
	'bround' : 'box-border-bround', // 太い角の丸い枠
	'shadow' : 'box-border-shadow'     , // 影のある枠
	'circle' : 'box-border-circle'       // 丸囲み枠
};

// ------------- 積分記号
const INT_TYPE = {
	'int'  : 0, // 積分     &int;  ∫
	'wint' : 1, // 二重積分 &Int;  ∬
	'tint' : 2, // 三重積分 &tint; ∭
	'qint' : 3, // 四重積分 &qint; ∬∬
	'oint' : 4, // 周回標準 &oint; ∲
	'dint' : 5  // 多重積分 ∫…∫
};


// ------------- 中段矢印
const UOBASE_TYPE = { // ★この名前は要検討
	'sum'       : 0,
	'prod'      : 1,
	'coprod'    : 2,
	'bigcup'    : 3,
	'bigcap'    : 4,
	'bigvee'    : 5,
	'bigwedge'  : 6,
	'bigoplus'  : 7,
	'bigotimes' : 8,
	'bigsqcup'  : 9,
	'bigsqcap'  : 10,
	'xrarr'     : 11,
	'xlarr'     : 12,
	'xharr'     : 13
};

// ------------- 書式情報
const FONT_STYLE = {
	'italic'   : 1,      // イタリック
	'bold'     : 2,      // 太字
	'underbar' : 4,      // 下線
	'strike'   : 8,      // 打消線
	'sup'      : 16,     // 上付
	'sub'      : 32      // 下付
};


/**
 * テキストモード、数式モード、化学式モードを表す列挙体
 */
const CIO_XML_TYPE = {
	text: 1,
	math: 2,
	chemical: 3,
};

/**
 * レイアウトノードの種類を表す列挙体
 */
const LAYOUT_NODE_TYPE = {
	FRAC: 1,
	ROOT: 2,
	INTEGRAL: 3,
	UNDEROVER: 4,
	UNDER: 5,
	OVER: 6,
	UNDERLINE: 7,
	RUBY: 8,
	DECOBOX: 9,
	TABLE: 10,
	MATRIX: 11,
	OPEN_BRACKETS: 12,
	CLOSE_BRACKETS: 13,
};

const BOTTOM_BASE_TYPE = {
	limo    : 'limo',
	limurar : 'limurar',
	limu    : 'limu',
	limular : 'limular',
};

/**
 * 数式のフォント種類を表す列挙型
 */
const MATH_FONT = {
    frak:   'frak', // German文字 (fraktur)
    cal:    'cal',  // Calligraphic文字
    scr:    'scr',  // Script文字
    Bbb:    'Bbb',  // Blackboard Bold文字
}

