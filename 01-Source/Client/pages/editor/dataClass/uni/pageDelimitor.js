// ------------- コンストラクタ
function PageDelimitor() {
	// 何もしません。
};


// ------------- HTMLUnknownElementクラス継承
// HTMLElement.prototypeを本オブジェクトのプロトタイプに設定します。
PageDelimitor.prototype = Object.create(LayoutBaseClass.prototype);


// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
PageDelimitor.createNew = function() {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('pbreak'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID();
	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
PageDelimitor.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, PageDelimitor); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
//
PageDelimitor.prototype.toHtml = function(caretId) {
	var htmlStr = '<hr class="pagedelimitor" id="' + this.id + '" style="width: 90%; display: inline-block;">';
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
PageDelimitor.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'PBREAK') return null;

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
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

PageDelimitor.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

PageDelimitor.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};
