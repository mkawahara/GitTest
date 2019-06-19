/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_RootElement.js                                  */
/* -                                                                         */
/* -    概      要     ： 平方根用データクラス                               */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js, その他親クラスファイル     */
/* -                                                                         */
/* -    備      考     ： 平方根用データクラスです                           */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 吉元 英一 / 2015年03月30日                         */
/* -                   ： 湯本 直杉 / 2015年06月06日                         */

// ****************************************************************************
// **   TEMP_で始まる部分は、作成するクラスに合わせて書き換えてください。    **
// ****************************************************************************



// ------------- コンストラクタ
function RootElement() {
	// 何もしません
};



// ------------- 親クラス継承
// 派生クラスの場合、自分のprototypeへ親クラスのインスタンスを持たせる必要があります。
// ※親クラスのソースを先に読み込んでおかなければいけません。
// RootElement.prototype = new GroupElement(); // 親クラスが GroupElementの例
// もしくは、LayoutBaseClass.prototypeを本オブジェクトのプロトタイプに設定します。
RootElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
RootElement.createNew = function(xmlType) {
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                 .math     数式モード
	//                                 .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	// テキストモード指定の場合は、強制的に数式モードへ変更します。
	xmlType = xmlType == CIO_XML_TYPE.text ? CIO_XML_TYPE.math : xmlType;

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('root'); // xmlタグ名は全て小文字です。

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
RootElement.doop = function(domObj) {
	// 返値 dom [obj]    : DOM
	// 返値なし
	DataClass.insertPrototype(domObj, RootElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
RootElement.copyFrom = function(src) {
	// 引数  src [I, obj]: コピー元オブジェクト
	// 返値  [obj]   : コピーによって生成された新しいオブジェクト
	// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
	var newObj = $(src).clone();
	newObj.id = DataClass.getNewNodeID();
//	newObj.id = DataClass.getNewParagraphID();  Paragraph クラスの場合、こちらを使用してください。
	return newObj;
};




// ------------- デフォルトのカーソル位置をノードIDとして取得します。
RootElement.prototype.getDefaultCursorPos = function() {
	var childNode =  this.children[0];
	DataClass.bindDataClassMethods(childNode);
	return childNode.getFirstPos();
}



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
//RootElement.prototype.toHtml = function(type, caretId) { 5/1 湯本 type 削除
RootElement.prototype.toHtml = function(caretId) {
	// type  [I, str]: テキスト = CIO_XML_TYPE.text
	//                 数式     = CIO_XML_TYPE.math
	//                 化学式   = CIO_XML_TYPE.chemical
	// ※ただし、CharacterElementでは type を全く使用しません。
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

	if ((this.children[2].children.length === 1) && (this.children[2].children[0].id !== caretId)) {
		// mrootタグを追加します。
		startTag += '<mroot id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">';
		endTag    = '</mroot>' + endTag;
		// 2つの子要素のタグを追加します。
		var children    = this.children;   // 子要素配列への参照
		var childrenStr = '';
		for (var i = 0; i < 2; i++) {
			// 子DOMのhtmlを取得します。
			DataClass.bindDataClassMethods(children[i]);
			childrenStr += children[i].toHtml(caretId);
			if ((i === 0) && (DataClass.getCharCount(childrenStr, '<') === 4)) {
				childrenStr = childrenStr.replace('"></mo></mrow>', '">&nbsp;&nbsp;</mo></mrow>');
			}
		}
		// html文字列を返します。
//		return startTag + childrenStr + endTag;
	} else {
		// msupタグを追加します。
		startTag += '<msup id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">';
		endTag    = '</msup>' + endTag;
		// children[2]のhtmlを取得します。
		var child = this.children[2];
		DataClass.bindDataClassMethods(child);
		endTag = child.toHtml(caretId) + endTag;
		// mrootタグを追加します。
		startTag += '<mroot>';
		endTag    = '</mroot>' + endTag;
		// 2つの子要素のタグを追加します。
		var children    = this.children;   // 子要素配列への参照
		var childrenStr = '';
		for (var i = 0; i < 2; i++) {
			// 子DOMのhtmlを取得します。
			DataClass.bindDataClassMethods(children[i]);
			childrenStr += children[i].toHtml(caretId);
			if ((i === 0) && (DataClass.getCharCount(childrenStr, '<') === 4)) {
				childrenStr = childrenStr.replace('"></mo></mrow>', '">&nbsp;</mo></mrow>');
			}
		}
		// html文字列を返します。
//		return startTag + childrenStr + endTag;
	}

	var htmlStr = startTag + childrenStr + endTag;

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
RootElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'ROOT') return null;

	// 属性を比較します
	if (this.getAttribute('nt') !== node.getAttribute('nt')) return null;

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
RootElement.prototype.shiftRight = function() {
	var node = this.children[1];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};

/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 添え字要素間での左移動時の次のカーソル位置を返します。
 */
RootElement.prototype.shiftLeftFromChild = function(childId) {
	// 根号内にカーソルがある場合、添え字のカーソル位置を取得します。
	if (this.children[0].id === childId) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	// 添え字にカーソルがある場合、自身のIDを次の移動先として返します。
	return this.id;
};

/**
 * 添え字要素間での右移動時の次のカーソル位置を返します。
 */
RootElement.prototype.shiftRightFromChild = function(childId) {
	//	添え字にカーソルがある場合、根号内のカーソル位置を取得します。
	if (this.children[1].id === childId) {
		var nextNode = this.children[0];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	};
	//	根号内にカーソルがある場合、弟要素を返します。
	return this.nextSibling.id;
};

/**
 * 添え字要素間での上移動時の次のカーソル位置を返します。
 */
RootElement.prototype.shiftUpFromChild = function(childId) {
	//	自身の shiftUpFromChild を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

/**
 * 添え字要素間での下移動時の次のカーソル位置を返します。
 */
RootElement.prototype.shiftDownFromChild = function(childId) {
	//	左添え字にカーソルがある場合、自身のIDを次の移動先として返します。
	if (this.children[1].id === childId) {
		return this.id;
	};

	//	右左添え字にカーソルがある場合、自身のIDを次の移動先として返します。
	if (this.children[2].id === childId) {
		//return this.children[0].lastElementChild.id;	// 根号内に戻るより、弟要素に移動した方が違和感がありません。
		return this.nextSibling.id;
	};

	//	根号内にカーソルがある場合、自身の shiftDownFromChild を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

/**
 * 添え字要素間でのEnterによる移動時の次のカーソル位置を返します。
 */
RootElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.shiftRightFromChild(childId);
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
RootElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
RootElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};

/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 右上添え字の要素を取得します。
 */
RootElement.prototype.shiftUpFromNext = function() {
	var rightTop = this.children[2];
	DataClass.bindDataClassMethods(rightTop);
	return rightTop.getLastPos();
};

/**
 * 自身の shiftDown を呼び出し、その戻り値を返します。
 */
RootElement.prototype.shiftDownFromNext = function() {
	return this.shiftDown();
};


/**
 * 右から移動してきた時の移動先要素を取得します。
 */
RootElement.prototype.shiftLastFromNext = function() {
	var baseString = this.children[0];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};
