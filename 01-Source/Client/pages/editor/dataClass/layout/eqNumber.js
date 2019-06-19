
// ------------- コンストラクタ
function EquationNumberElement () {
	// 何もしません
};



// ------------- LayoutBaseClassクラス継承
EquationNumberElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
EquationNumberElement.createNew = function(xmlType) {
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                .math     数式モード
	//                                .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	// テキストモードを強制します（段落レベルでのみ作成できるため、数式モードは不要です）
	xmlType = CIO_XML_TYPE.text;

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj    = document.createElement('enumber');   // xmlタグ名は全て小文字です。
	domObj.id = DataClass.getNewNodeID();    // 文書内で一意なidを与えます。

	// EquationNumberElement は、必ず子要素として GroupElement を1個だけ持ちます。
	var childGroup = GroupElement.createNew(xmlType);
	$(domObj).append(childGroup);

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
EquationNumberElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, EquationNumberElement ); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


/**
 * デフォルトのカーソル位置をノードIDとして取得します。
 * @returns
 */
EquationNumberElement.prototype.getDefaultCursorPos = function() {
    var childNode =  this.children[0];
    DataClass.bindDataClassMethods(childNode);
    return childNode.getFirstPos();
}


// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
EquationNumberElement.prototype.toHtml = function(caretId) {
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

		// 数式番号中間タグは常に出力します
		mathStartTag = '<eqnumber>' + mathStartTag;
		mathEndTag += '</eqnumber>';
	}

	var htmlStartTag = ''; // 開始タグ
	var htmlEndTag   = '';   // 閉じタグ

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// ---- テキストなら span, 数式なら mrow タグを使用します。
	var baseTag = 'span';
	if (this.nt != CIO_XML_TYPE.text) baseTag = 'mrow';
	htmlStartTag += '<' + baseTag + ' id="' + this.id + '" class="eqnumber ' + spkStr + '">';
	htmlEndTag    = '</' + baseTag + '>' + htmlEndTag;

	// ---- 子要素の toHtml 結果をまとめて取得します。
	// ここでは子要素が出力した中間htmlは処理しません。最悪でも段落要素が処理してくれます。
	var xml = DataClass.getChildrenHtml(this.children, caretId);

	// ---- html を出力します。
	var htmlStr = mathStartTag + htmlStartTag + xml + htmlEndTag + mathEndTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
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
EquationNumberElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'ENUMBER') return null;

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
EquationNumberElement.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

EquationNumberElement.prototype.shiftLeftFromChild = function(childId) {
	return this.id;
};

EquationNumberElement.prototype.shiftRightFromChild = function(childId) {
	return this.nextSibling.id;
};

EquationNumberElement.prototype.shiftUpFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

EquationNumberElement.prototype.shiftDownFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

EquationNumberElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.nextSibling.id;
};

EquationNumberElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

EquationNumberElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

EquationNumberElement.prototype.shiftUpFromNext = function() {
	return this.shiftUp();
};

EquationNumberElement.prototype.shiftDownFromNext = function() {
	return this.shiftDown();
};

//このメソッドは必要な場合のみオーバーライドしてください。
EquationNumberElement.prototype.shiftLastFromNext = function() {
	var baseString = this.children[0];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
EquationNumberElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
EquationNumberElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
EquationNumberElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
EquationNumberElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可
