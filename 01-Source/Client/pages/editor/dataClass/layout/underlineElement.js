/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社 知能情報システム                      == */
/* ========================================================================= */
/* -    ファイル名     ： DC_UnderlineElement.js                             */
/* -                                                                         */
/* -    概      要     ： 下に下線を有する文字列要素用データクラス           */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js, その他親クラスファイル     */
/* -                                                                         */
/* -    備      考     ：下に下線を有する文字列要素用データクラスです        */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 吉元 英一 / 2015年05月08日                         */
/* -                      湯本 直杉 / 2015年06月06日                         */

// ****************************************************************************
// **   TEMP_で始まる部分は、作成するクラスに合わせて書き換えてください。    **
// ****************************************************************************



// ------------- コンストラクタ
function UnderlineElement() {
	// 何もしません
};



// ------------- 親クラス継承
// 派生クラスの場合、自分のprototypeへ親クラスのインスタンスを持たせる必要があります。
// ※親クラスのソースを先に読み込んでおかなければいけません。
// UnderlineElement.prototype = new GroupElement(); // 親クラスが GroupElementの例
// もしくは、LayoutBaseClass.prototypeを本オブジェクトのプロトタイプに設定します。
UnderlineElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
UnderlineElement.createNew = function(base, xmlType) {
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                 .math     数式モード
	//                                 .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	// テキストモード指定の場合は、強制的に数式モードへ変更します。
	xmlType = xmlType == CIO_XML_TYPE.text ? CIO_XML_TYPE.math : xmlType;

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('uline'); // xmlタグ名は全て小文字です。

	domObj.setAttribute('line', base);
	// ※クラス名とxmlタグ名は必ずしも一致させるわけではないため、設計仕様等を確認してください。
	domObj.id = DataClass.getNewNodeID(); // 文書内で一意なidを与えます。
	// クラスによっては、必ず子要素を持っていなくてはならない場合もあります。
	for (var i = 0; i < 3; i++) {
		$(domObj).append( GroupElement.createNew(xmlType) );
	}

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
UnderlineElement.doop = function(domObj) {
	// 返値 dom [obj]    : DOM
	// 返値なし
	DataClass.insertPrototype(domObj, UnderlineElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
UnderlineElement.copyFrom = function(src) {
	// 引数  src [I, obj]: コピー元オブジェクト
	// 返値  [obj]   : コピーによって生成された新しいオブジェクト
	// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
	var newObj = $(src).clone();
	newObj.id = DataClass.getNewNodeID();
	return newObj;
};


/**
 * デフォルトのカーソル位置をノードIDとして取得します。
 * @returns
 */
UnderlineElement.prototype.getDefaultCursorPos = function() {
	var childNode =  this.children[0];
	DataClass.bindDataClassMethods(childNode);
	return childNode.getFirstPos();
}


// ------------- オブジェクトのデータをブラウザ表示用 html文字列に変換します。
//UnderlineElement.prototype.toHtml = function(type, caretId) { 5/1 湯本 type 削除
UnderlineElement.prototype.toHtml = function(caretId) {
	// caretId [I, str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// 親要素が Paragraph かどうか判断し、math タグの必要性を判断します。
	var startTag = '';
	var endTag   = '';
	var parentNode = this.parentNode;
	DataClass.bindDataClassMethods(parentNode);
	if (parentNode.isTextGroup) {
		var tags = this.createMathTag();
		startTag = tags.start;
		endTag = tags.end;
	}

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// msubタグを追加します。
	startTag += '<msubsup id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">';
	endTag    = '</msubsup>' + endTag;

	var children = this.children;   // 子要素配列への参照

	// munderタグを追加します。
	DataClass.bindDataClassMethods(children[0]);
    startTag += '<munder>' + children[0].toHtml(caretId) + '<mo stretchy="true">' + this.getAttribute('line') + '</mo></munder>';

	// html文字列を返します。
	DataClass.bindDataClassMethods(children[1]);
	DataClass.bindDataClassMethods(children[2]);
	var htmlStr = startTag + children[1].toHtml(caretId) + children[2].toHtml(caretId) + endTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	// html文字列を返します。
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
UnderlineElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'ULINE') return null;

	// 属性を比較します
	if (this.getAttribute('nt') !== node.getAttribute('nt')) return null;
	if (this.getAttribute('line') !== node.getAttribute('line')) return null;

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
//キー操作によるカーソル移動を扱うメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 添え字要素を次の移動先として返します。
 * このメソッドは基本クラスで定置されているメソッドのオーバーライドです。
 */
UnderlineElement.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};

/////////////////////////////////////////////////////////////////////
//子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 添え字要素間での左移動時の次のカーソル位置を返します。
 */
UnderlineElement.prototype.shiftLeftFromChild = function(childId) {
	if (this.children[0].id === childId) {
		// ベースにカーソルがある場合、自身のIDを次の移動先として返します。
		return this.id;
	};

	// 添え字内にカーソルがある場合、ベースのカーソル位置を取得します。
	var nextNode = this.children[0];
	DataClass.bindDataClassMethods(nextNode);
	return nextNode.getLastPos();
};

/**
 * 添え字要素間での右移動時の次のカーソル位置を返します。
 */
UnderlineElement.prototype.shiftRightFromChild = function(childId) {
	// 無条件に次要素にカーソルを移動します。
	return this.nextSibling.id;
};

/**
 * 添え字要素間での上移動時の次のカーソル位置を返します。
 */
UnderlineElement.prototype.shiftUpFromChild = function(childId) {
	// 下添字にカーソルがある場合、上添字のカーソル位置を取得します。
	if (this.children[1].id === childId) {
		var nextNode = this.children[2];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	};

	//	上添字にカーソルがある場合、自身の shiftUpFromChild を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

/**
 * 添え字要素間での下移動時の次のカーソル位置を返します。
 */
UnderlineElement.prototype.shiftDownFromChild = function(childId) {
	// 上添字にカーソルがある場合、下添字のカーソル位置を取得します。
	if (this.children[2].id === childId) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	};
	// 下添字にカーソルがある場合、自身の shiftDownFromChild を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

/**
 * 添え字要素間でのEnterによる移動時の次のカーソル位置を返します。
 */
UnderlineElement.prototype.shiftByEnterFromChild = function(childId) {
	// 下添字にカーソルがある場合、上添字のカーソル位置を取得します。
	if (this.children[1].id === childId) {
		var nextNode = this.children[2];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	};

	// 上添字、あるいはベースにカーソルがある場合、次要素にカーソルは移動します。
	return this.nextSibling.id;
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
UnderlineElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
UnderlineElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};

/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 上添字の要素を取得します。
 */
UnderlineElement.prototype.shiftUpFromNext = function() {
	var rightTop = this.children[2];
	DataClass.bindDataClassMethods(rightTop);
	return rightTop.getLastPos();
};

/**
 * 下添字の要素を取得します。
 */
UnderlineElement.prototype.shiftDownFromNext = function() {
	var rightBottom = this.children[1];
	DataClass.bindDataClassMethods(rightBottom);
	return rightBottom.getLastPos();
};


/**
 * 右から移動してきた時の移動先要素を取得します。
 */
UnderlineElement.prototype.shiftLastFromNext = function() {
	var baseString = this.children[0];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};
