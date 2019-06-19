/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_characterElement.js                             */
/* -                                                                         */
/* -    概      要     ： LineBreak(改行)クラス                              */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js              */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年04月24日                         */

// *************************************************************
// **            CharacterElement(一文字要素)クラス           **
// **     段落途中・段落末尾での改行を表すオブジェクト。
// *************************************************************

/* このクラスで使用するDOM属性一覧
	'id'    : [str]  idです。doopメソッド内で、idマネージャから取得した「文書内で一意のid」を割りあてられます。
*/

// ------------- コンストラクタ
function LineBreak() {
	// 何もしません。
};


// ------------- HTMLUnknownElementクラス継承
// HTMLElement.prototypeを本オブジェクトのプロトタイプに設定します。
LineBreak.prototype = Object.create(LayoutBaseClass.prototype);


// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
LineBreak.createNew = function() {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('br'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID();
	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
LineBreak.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, LineBreak); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
LineBreak.copyFrom = function(src) {
	// 引数  src [I, obj]: コピー元オブジェクト
	// 返値  [obj]   : コピーによって生成された新しいオブジェクト
	return LineBreak.createNew();
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
//
//LineBreak.prototype.toHtml = function(type) {
//LineBreak.prototype.toHtml = function(type, caretId) { 5/1 湯本 type 削除
LineBreak.prototype.toHtml = function(caretId) {
	// caretId [I, str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// 親が数式か否か、段落か否か、弟がいるか否か
	var htmlTag;// = 'mo';
	var lbStr = ''; // 出力用html文字列

	DataClass.bindDataClassMethods(this.parentNode);
	if (this.parentNode.isTextGroup) {
		htmlTag = 'span';

		if ((this.parentNode.nodeName === 'PARAGRAPH') || (this.parentNode.nodeName === 'CTD')) {
			lbStr = this.nextSibling == null ? '&ldsh;' : '&darr;';
		}
	} else {
		htmlTag = 'mo';
		lbStr = '';
	}

	// 大元の 開始htmlタグと終了htmlタグを決定します。
	var htmlStartTag = '<'  + htmlTag + ' id="' + this.id + '">'; // 開始タグ
	var htmlEndTag   = '</' + htmlTag + '>';                      // 終了タグ

	// 開始タグ文字列を生成し、返します。
	var htmlStr = htmlStartTag + lbStr + htmlEndTag;
	if (lbStr === '&darr;') htmlStr += '<br>';  // 表示上改行が必要な場合

	return htmlStr;
};


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
LineBreak.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'BR') return null;

	if (checkNext) {
		// 弟要素の有無を比較します
		if (this.nextSibling === null) return node;
		if (node.nextSibling === null) return null;

		// 弟要素の比較を行います
		DataClass.bindDataClassMethods(this.nextSibling);
		return this.nextSibling.compareWith(node.nextSibling, checkNext);
	} else {
		// 兄要素の有無を比較します
		if (this.previousSibling === null) return node;
		if (node.previousSibling === null) return null;

		// 兄要素の比較を行います
		DataClass.bindDataClassMethods(this.previousSibling);
		return this.previousSibling.compareWith(node.previousSibling, checkNext);
	}
};


