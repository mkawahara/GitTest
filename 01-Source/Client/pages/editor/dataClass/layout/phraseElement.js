/*
 * PhraseElement を定義します
 * この要素は段落直下以外に配置されてはいけません
 * */


// ------------- コンストラクタ
function PhraseElement() {
	// 何もしません
};

// ------------- LayoutBaseClassクラス継承
PhraseElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
PhraseElement.createNew = function() {
	// 返値 dom [obj]    : DOM
	// 段落直下にしか配置できないため、このノードは必ずテキスト属性です

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj    = document.createElement('phrase');   // xmlタグ名は全て小文字です。
	domObj.id = DataClass.getNewNodeID();    // 文書内で一意なidを与えます。

	// PhraseElement は、必ず子要素として GroupElement を1個だけ持ちます。
	var childGroup = GroupElement.createNew(CIO_XML_TYPE.text);
	$(domObj).append(childGroup);

	return domObj;
};


// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
PhraseElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, PhraseElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


/**
 * デフォルトのカーソル位置をノードIDとして取得します。
 * @returns
 */
PhraseElement.prototype.getDefaultCursorPos = function() {
    var childNode =  this.children[0];
    DataClass.bindDataClassMethods(childNode);
    return childNode.getFirstPos();
}


// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
PhraseElement.prototype.toHtml = function(caretId) {
	// caretId [I, str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列
	var nodeType = Number(this.getAttribute('nt'));

	// math タグの有無の判定を行います
	var mathStartTag = '';
	var mathEndTag   = '';
	var parentNode = this.parentNode;
	DataClass.bindDataClassMethods(parentNode);
	if (parentNode.isTextGroup) {
		if (nodeType == 2) {
			mathStartTag = '<mmath>';
			mathEndTag = '</mmath>';
		}
		if (nodeType == 3) {
			mathStartTag = '<cmath>';
			mathEndTag = '</cmath>';
		}
		if (this.eqnumber) {
			mathStartTag = '<eqnumber>' + mathStartTag;
			mathEndTag += '</eqnumber>';
		}
	}

//	var htmlStartTag = mathStartTag; // 開始タグ
//	var htmlEndTag   = mathEndTag;   // 閉じタグ
	var htmlStartTag = ''; // 開始タグ
	var htmlEndTag   = '';   // 閉じタグ
	var idFlag       = false;        // すでに html タグに ID をつけたか

	if (this.nt == CIO_XML_TYPE.text && this.uline) { // ---- テキストレベルかつ下線ありなら
		htmlStartTag = '<uline>';
		htmlEndTag   = '</uline>';
	}

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// ★カーソル位置で使用すべきスタイルが変更されます★
	var styleClass = PhraseElement.getNoCaretClass() + ' ';
	if (caretId === this.id) styleClass = PhraseElement.getCaretClass() + ' ';

	// 枠線の種類の判定を行います
	var styleClassStr = '';
	var styleStr = '';

	if (this.getAttribute('nt') == 1) {
		styleClassStr = ' phrase ';
	} else {
		styleStr = ' style="border: 1px solid red;" ';
	}


	// ---- テキストなら span タグを使用します。
	var baseTag = 'span';
	//if (this.nt != CIO_XML_TYPE.text) baseTag = 'mrow';
	htmlStartTag += '<' + baseTag + ' id="' + this.id + '" class="' + spkStr + styleClassStr + styleClass + '" ' + styleStr + '>';
	htmlEndTag    = '</' + baseTag + '>' + htmlEndTag;

	// ---- 子要素の toHtml 結果をまとめて取得します。
	var xml = DataClass.getChildrenHtml(this.children, caretId);
	if (DataClass.getCharCount(xml, '<') === 4) {
		xml = xml.replace('"></span></span>', '">&nbsp;</span></span>');
		//xml = xml.replace('"></mo></mrow>', '">&nbsp;</mo></mrow>');		// これをやっても、高さがないまま。
	}

	// ---- html を出力します。
	var htmlStr = htmlStartTag + mathStartTag + xml + mathEndTag + htmlEndTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

//------------- nodeType を取得します。
Object.defineProperty(PhraseElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});


/////////////////////////////////////////////////////////////////////
//検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
* 検索対象データを文書上の文字データと比較します。
* 文字要素では、文字の値のみを比較し、文字属性は比較しません。
* @param node
* @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
*/
PhraseElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'PHRASE') return null;

	// children の比較を行います
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
PhraseElement.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

PhraseElement.prototype.shiftLeftFromChild = function(childId) {
	return this.id;
};

PhraseElement.prototype.shiftRightFromChild = function(childId) {
	return this.nextSibling.id;
};

PhraseElement.prototype.shiftUpFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

PhraseElement.prototype.shiftDownFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

PhraseElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.nextSibling.id;
};

PhraseElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

PhraseElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

PhraseElement.prototype.shiftUpFromNext = function() {
	return this.shiftUp();
};

PhraseElement.prototype.shiftDownFromNext = function() {
	return this.shiftDown();
};

//このメソッドは必要な場合のみオーバーライドしてください。
PhraseElement.prototype.shiftLastFromNext = function() {
	var baseString = this.children[0];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};


/////////////////////////////////////////////////////////////////////
// カーソル位置によって変更されるべきクラス名の取得
/////////////////////////////////////////////////////////////////////

/**
 * カーソルがない時の書式クラス名を取得します
 */
PhraseElement.getNoCaretClass = function() {
	return '';
};

/**
 * カーソルがある時の書式クラス名を取得します。
 */
PhraseElement.getCaretClass = function() {
	return 'hasPhraseCaretStyle';
};


/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
PhraseElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
PhraseElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
PhraseElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
PhraseElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可

