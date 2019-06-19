// ------------- コンストラクタ
function PauseElement() {
	// 何もしません。
};


// ------------- HTMLUnknownElementクラス継承
// HTMLElement.prototypeを本オブジェクトのプロトタイプに設定します。
//数式、化学式でも使用されますが、親のntプロパティを参照するため、これ自身はntを持ちません。
PauseElement.prototype = Object.create(LayoutBaseClass.prototype);


// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
PauseElement.createNew = function() {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('pause'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID();

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
PauseElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, PauseElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
//
PauseElement.prototype.toHtml = function(caretId) {
	var type = this.isLong ? 'L' : 'S';
	var className = this.isLong ? 'pauseLong' : 'pauseShort';

	DataClass.bindDataClassMethods(this.parentNode);
	if (this.parentNode.nt === CIO_XML_TYPE.text) {
		/*var htmlStr = '<span id="' + this.id + '" style="position: relative;" class="pause">' +
			'<span style="position: absolute; top: -50%; font-size: 120%;">&#x25A1;</span>' +
			'<span style="position: absolute; left: 25%; top: -25%;">' + type + '</span>' +
			'<span style="opacity: 0.0; top: -50%; font-size: 120%;">&#x25A1;</span>' +
			'</span>';*/
		var htmlStr = '<span id="' + this.id + '" class="' + className + '">[' + type + ']</span>';
	} else {
		var htmlStr = '<mo id="' + this.id + '" class="' + className + '">[' + type + ']</mo>';
	}
	return htmlStr;
};

/**
 * isLong プロパティ：読み書き可
 */
Object.defineProperty(LayoutBaseClass.prototype, 'isLong', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('long') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('long', true);
		} else {
			this.removeAttribute('long');
		}
	},
});


/////////////////////////////////////////////////////////////////////
//プロパティ定義
/////////////////////////////////////////////////////////////////////

//------------- nodeType を取得します。
Object.defineProperty(PauseElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (this.parentNode !== null) {
			DataClass.bindDataClassMethods(this.parentNode);
			return this.parentNode.nt;
		}
		else {
			return CIO_XML_TYPE.text;
		}
	},
});


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
PauseElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'PAUSE') return null;

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

PauseElement.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

PauseElement.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};
