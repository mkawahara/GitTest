
// ------------- コンストラクタ
function ReadingElement() {
	// 何もしません
};



// ------------- LayoutBaseClassクラス継承
ReadingElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
// 数式、化学式でも使用されますが、親のntプロパティを参照するため、これ自身はntを持ちません。
ReadingElement.createNew = function(xmlType) {
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj    = document.createElement('cread');   // xmlタグ名は全て小文字です。
	domObj.id = DataClass.getNewNodeID();    // 文書内で一意なidを与えます。

	// CornerElement は、必ず子要素として GroupElement を1個だけ持ちます。
	var childGroup = GroupElement.createNew(xmlType);
	$(domObj).append(childGroup);

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	domObj.setAttribute('yomi', '');

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
ReadingElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, ReadingElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


ReadingElement.prototype.getDefaultCursorPos = function() {
	return null;
};

// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
ReadingElement.prototype.toHtml = function(caretId) {
	// caretId [I, str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// 開始、終了タグ
	var tag = 'mrow';
	var style = '';
	DataClass.bindDataClassMethods(this.parentNode);
	if (this.parentNode.isTextGroup) {
		tag = 'div';
		style = ' style="display: inline-block;"';
	}

	// ★カーソル位置で使用すべきスタイルが変更されます★
	var styleClass = ReadingElement.getNoCaretClass() + ' ';
	if (caretId === this.id) styleClass = ReadingElement.getCaretClass() + ' ';

	var htmlStartTag  = '<' + tag + style + ' id="' + this.id + '" class="' + styleClass + spkStr + '">';
	var htmlEndTag    = '</' + tag + '>';

	// uline 処理
	if (this.uline) { // ---- テキストレベルかつ下線ありなら
		htmlStartTag =  '<uline>' + htmlStartTag;
		htmlEndTag  += '</uline>';
	}

	// ---- 子要素の toHtml 結果をまとめて取得します。
	var xml = DataClass.getChildrenHtml(this.children, caretId);

	// ---- html を出力します。
	var htmlStr = htmlStartTag + xml + htmlEndTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// nodeType の取得は基本クラスのメソッドを使用します

// ---- よみデータ
Object.defineProperty(ReadingElement.prototype, 'yomi', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('yomi');
	},
	set: function(value) {
		this.setAttribute('yomi', value);
	}
});

//---- アクセント制御データ
Object.defineProperty(ReadingElement.prototype, 'accent', {
    enumerable: true,
    configurable: true,
    get: function(){
        return this.getAttribute('accent_control');
    },
    set: function(value) {
    	if (value) {
    		this.setAttribute('accent_control', value);
    	}
    	else {
    		this.removeAttribute('accent_control');
    	}
    }
});


/////////////////////////////////////////////////////////////////////
// カーソル位置によって変更されるべきクラス名の取得
/////////////////////////////////////////////////////////////////////

/**
 * カーソルがない時の書式クラス名を取得します
 */
ReadingElement.getNoCaretClass = function() {
	return 'noCaretReadingStyle';
};

/**
 * カーソルがある時の書式クラス名を取得します。
 */
ReadingElement.getCaretClass = function() {
	return 'hasCaretStyle';
};


/////////////////////////////////////////////////////////////////////
//検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
* 検索対象データを文書上の文字データと比較します。
* 文字要素では、文字の値のみを比較し、文字属性は比較しません。
* @param node
* @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
*/
ReadingElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CREAD') return null;

	// 添え字の比較を行います
	if (this.children.length !== node.children.length) return null;
	for (var i = 0; i < this.children.length; i++) {
		var mychild = this.children[i].children[0];
		var tgchild = node.children[i].children[0];
		DataClass.bindDataClassMethods(mychild);
		if (mychild.compareWith(tgchild, true) === null) return null;	// 子要素は後方検索で十分です
	};

	// 兄弟要素の比較を行います
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
// 自身を起点とする移動処理メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 弟要素を次のカーソル位置として返します。
 */
ReadingElement.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

ReadingElement.prototype.shiftLeftFromChild = function(childId) {
	return this.id;
};

ReadingElement.prototype.shiftRightFromChild = function(childId) {
	return this.nextSibling.id;
};

ReadingElement.prototype.shiftUpFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

ReadingElement.prototype.shiftDownFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

ReadingElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.nextSibling.id;
};

ReadingElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

ReadingElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

ReadingElement.prototype.shiftUpFromNext = function() {
	return this.shiftUp();
};

ReadingElement.prototype.shiftDownFromNext = function() {
	return this.shiftDown();
};

//このメソッドは必要な場合のみオーバーライドしてください。
ReadingElement.prototype.shiftLastFromNext = function() {
	var baseString = this.children[0];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};

/////////////////////////////////////////////////////////////////////
//モード変換メソッド
/////////////////////////////////////////////////////////////////////
//---- モード変更制限
ReadingElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
ReadingElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
ReadingElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
ReadingElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
//※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可
