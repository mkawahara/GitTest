// *************************************************************
// **         HighlightDivideElement(一文字要素)クラス        **
// *************************************************************

/* このクラスで使用するDOM属性一覧
	'id'    : [str]  idです。doopメソッド内で、idマネージャから取得した「文書内で一意のid」を割りあてられます。
	'ital'  : [bool] イタリック属性です。一文字ずつ<i>タグを付与します。
	'bold'  : [bool] ボールド属性です。一文字ずつ<b>タグを付与します。
	'uline' : [bool] 下線属性です。Paragraphクラスにて、まとまりごとに underbarクラス(css) を付与します。
	'strk'  : [bool] 打消線属性です。Paragraphクラスにて、まとまりごとに <strike>タグを付与します。
	'sup'   : [bool] 上付属性です。一文字ずつ<sup>タグを付与します。
	'sub'   : [bool] 下付属性です。一文字ずつ<sub>タグを付与します。
*/

// ------------- コンストラクタ
function HighlightDivideElement() {
	// 何もしません。
};



// ------------- HTMLUnknownElementクラス継承
// LayoutBaseClass.prototypeを本オブジェクトのプロトタイプに設定します。
HighlightDivideElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
HighlightDivideElement.createNew = function() {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('hldiv'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID();

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
HighlightDivideElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, HighlightDivideElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
HighlightDivideElement.copyFrom = function(src) {
	// 引数  src [I, obj]: コピー元オブジェクト
	// 返値  [obj]   : コピーによって生成された新しいオブジェクト
	return $(src).clone();
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
HighlightDivideElement.prototype.toHtml = function(caretId) {
	// caretId [str]      : キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	var htmlStr = '<span id="' + this.id + '" class="highlight_divide">|</span>';
	return htmlStr;
};


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ------------- nodeType を取得します。
Object.defineProperty(HighlightDivideElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * 文字要素では、文字の値のみを比較し、文字属性は比較しません。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
HighlightDivideElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'HLDIV') return null;

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


/////////////////////////////////////////////////////////////////////
// キー操作によるカーソル移動を扱うメソッド
/////////////////////////////////////////////////////////////////////

// HighlightDivideElement は子要素を持たないため、FromChild 系メソッドは実装されません。


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

HighlightDivideElement.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

HighlightDivideElement.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

/////////////////////////////////////////////////////////////////////
// モード変換メソッド ★このクラスで必要か不明
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
HighlightDivideElement.prototype.convertibleToText = false; // 子孫を含めてのテキストモードへの変換は可能か？
HighlightDivideElement.prototype.convertibleToMath = false;  // 子孫を含めての数式・化学式モードへの変換は可能か？
HighlightDivideElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
HighlightDivideElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可

// ---- 数式・化学式への変換
HighlightDivideElement.prototype.AltNodeForMath = function(result, inputMode) {

	// ステータスも反映すべし

	var strBase = this.textContent;
	result.convertedNodeList = [ HighlightDivideElement.createNew() ];
	result.convertedNtList   = [ inputMode ];
	return result;
};

