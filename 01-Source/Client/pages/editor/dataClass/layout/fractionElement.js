/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      知能情報システム株式会社                       == */
/* ========================================================================= */
/* -    ファイル名     ：DC_FractionElement.js                               */
/* -                                                                         */
/* -    概      要     ： 分数用データクラス                                 */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js, その他親クラスファイル     */
/* -                                                                         */
/* -    備      考     ： 分数用データクラスです                             */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 吉元 英一 / 2015年03月30日                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月06日                         */

// ------------- コンストラクタ
function FractionElement() {
	// 何もしません
};



// ------------- 親クラス継承
// 派生クラスの場合、自分のprototypeへ親クラスのインスタンスを持たせる必要があります。
// ※親クラスのソースを先に読み込んでおかなければいけません。
// FractionElement.prototype = new GroupElement(); // 親クラスが GroupElementの例
// もしくは、LayoutBaseClass.prototypeを本オブジェクトのプロトタイプに設定します。
FractionElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
FractionElement.createNew = function(xmlType) {
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                 .math     数式モード
	//                                 .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	 // テキストモード指定の場合は、強制的に数式モードへ変更します。
	xmlType = xmlType == CIO_XML_TYPE.text ? CIO_XML_TYPE.math : xmlType;

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('frac'); // xmlタグ名は全て小文字です。

	// ※クラス名とxmlタグ名は必ずしも一致させるわけではないため、設計仕様等を確認してください。
	domObj.id = DataClass.getNewNodeID(); // 文書内で一意なidを与えます。

	// クラスによっては、必ず子要素を持っていなくてはならない場合もあります。
	for (var i = 0; i < 2; i++) {
//		$(domObj).append( GroupElement.createNew(xmlType) ); // 湯本 4/28
		domObj.appendChild( GroupElement.createNew(xmlType) );
	}

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
FractionElement.doop = function(domObj) {
	// 返値 dom [obj]    : DOM
	// 返値なし
	DataClass.insertPrototype(domObj, FractionElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


// ------------- デフォルトのカーソル位置をノードIDとして取得します。
FractionElement.prototype.getDefaultCursorPos = function() {
	var childNode =  ConfigManager.instance.IsFirstCursorPosNumInFrac ? this.children[1] : this.children[0];
	DataClass.bindDataClassMethods(childNode);
	return childNode.getFirstPos();
}



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
//FractionElement.prototype.toHtml = function(type, caretId) { 5/1 湯本 type 削除
FractionElement.prototype.toHtml = function(caretId) {
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

	// mstyleタグを追加します。
	startTag += '<mstyle displaystyle="true">';
	endTag    = '</mstyle>' + endTag;

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// mfracタグを追加します。
//	startTag += '<mfrac id="' + this.id + '">';
	startTag += '<mfrac id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">';
	endTag    = '</mfrac>' + endTag;

	// 2つの子要素のタグを追加します。
	var children    = this.children;   // 子要素配列への参照
	var childrenStr = '';
	for (var i = 0; i < 2; i++) {
		// 子DOMのhtmlを取得します。
		DataClass.bindDataClassMethods(children[i]);
		var tempStr = children[i].toHtml(caretId);
		if (DataClass.getCharCount(tempStr, '<') === 4) {
			tempStr = tempStr.replace('"></mo></mrow>', '">&nbsp;&nbsp;</mo></mrow>');
		}
		childrenStr += tempStr;
	}
	var htmlStr = startTag + childrenStr + endTag;

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
FractionElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'FRAC') return null;

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
FractionElement.prototype.shiftRight = function() {
	var node = ConfigManager.instance.IsFirstCursorPosNumInFrac ? this.children[1] : this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 添え字要素間での左移動時の次のカーソル位置を返します。
 */
FractionElement.prototype.shiftLeftFromChild = function(childId) {
	var first = 1;
	var next = 0;

	if (ConfigManager.instance.IsFirstCursorPosNumInFrac) {
		first = 0;
		next = 1;
	}

	//	分子にカーソルがある場合、分母のカーソル位置を取得します。
	if (this.children[first].id === childId) {
		var nextNode = this.children[next];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	//	分母にカーソルがある場合、自身のIDを次の移動先として返します。
	return this.id;
};

/**
 * 添え字要素間での右移動時の次のカーソル位置を返します。
 */
FractionElement.prototype.shiftRightFromChild = function(childId) {
	var first = 0;
	var next = 1;

	if (ConfigManager.instance.IsFirstCursorPosNumInFrac) {
		first = 1;
		next = 0;
	}

	//	分母にカーソルがある場合、分子のカーソル位置を取得します。
	if (this.children[first].id === childId) {
		var nextNode = this.children[next];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	};
	//	分子にカーソルがある場合、弟要素を返します。
	return this.nextSibling.id;
};

/**
 * 添え字要素間での上移動時の次のカーソル位置を返します。
 */
FractionElement.prototype.shiftUpFromChild = function(childId) {
	//	分母にカーソルがある場合、分子のカーソル位置を取得します。
	if (this.children[1].id === childId) {
		var nextNode = this.children[0];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	//	分子にカーソルがある場合、自身の shiftUpFromChild を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

/**
 * 添え字要素間での下移動時の次のカーソル位置を返します。
 */
FractionElement.prototype.shiftDownFromChild = function(childId) {
	//	分子にカーソルがある場合、分母のカーソル位置を取得します。
	if (this.children[0].id === childId) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	//	分母にカーソルがある場合、自身の shiftDownFromChild を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

/**
 * 添え字要素間でのEnterによる移動時の次のカーソル位置を返します。
 */
FractionElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.shiftRightFromChild(childId);
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
FractionElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
FractionElement.prototype.shiftEndFromChild = function() {
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
FractionElement.prototype.shiftUpFromNext = function() {
	var rightTop = this.children[0];
	DataClass.bindDataClassMethods(rightTop);
	return rightTop.getLastPos();
};

/**
 * 右下添え字の要素を取得します。
 */
FractionElement.prototype.shiftDownFromNext = function() {
	var rightBottom = this.children[1];
	DataClass.bindDataClassMethods(rightBottom);
	return rightBottom.getLastPos();
};

/**
 * 右から移動してきた時の移動先要素を取得します。
 */
FractionElement.prototype.shiftLastFromNext = function() {
	var baseString = ConfigManager.instance.IsFirstCursorPosNumInFrac ? this.children[0] : this.children[1];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};
