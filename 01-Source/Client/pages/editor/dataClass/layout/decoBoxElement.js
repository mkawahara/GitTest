/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： decoBoxElement.js                                  */
/* -                                                                         */
/* -    概      要     ： DecoBoxElement (囲み枠) クラス                     */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js                             */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月13日                         */



// ------------- コンストラクタ
function DecoBoxElement() {
	// 何もしません
};



// ------------- LayoutBaseClassクラス継承
DecoBoxElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
DecoBoxElement.createNew = function(xmlType, borderType) {
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                 .math     数式モード
	//                                 .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj    = document.createElement('deco');   // xmlタグ名は全て小文字です。
	domObj.id = DataClass.getNewNodeID();    // 文書内で一意なidを与えます。

	// CornerElement は、必ず子要素として GroupElement を1個だけ持ちます。
	var childGroup = GroupElement.createNew(xmlType);
	$(domObj).append(childGroup);

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	// 囲み枠の種類を登録します
	if (borderType == null) borderType = BORDER_TYPE.normal;   // 既定値として標準の囲み枠をセットします
	domObj.setAttribute('borderType', borderType);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
DecoBoxElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, DecoBoxElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


/**
 * デフォルトのカーソル位置をノードIDとして取得します。
 * @returns
 */
DecoBoxElement.prototype.getDefaultCursorPos = function() {
    var childNode =  this.children[0];
    DataClass.bindDataClassMethods(childNode);
    return childNode.getFirstPos();
}


// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
DecoBoxElement.prototype.toHtml = function(caretId) {
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

		if (this.uline) {
			mathStartTag = '<uline>' + mathStartTag;
			mathEndTag += '</uline>';
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

	/*if (this.nt == CIO_XML_TYPE.text && this.uline) { // ---- テキストレベルかつ下線ありなら
		htmlStartTag = '<uline>';
		htmlEndTag   = '</uline>';
	}*/

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// ★カーソル位置で使用すべきスタイルが変更されます★
	var styleClass = DecoBoxElement.getNoCaretClass() + ' ';
	if (caretId === this.id) styleClass = DecoBoxElement.getCaretClass() + ' ';

	// 枠線の種類の判定を行います
	var styleClassStr = '';
	var styleStr = '';

	if (this.getAttribute('nt') == 1) {
		styleClassStr = this.borderType + ' ';
	} else {
		if (this.borderType == BORDER_TYPE.normal) {
			styleStr = ' style="border: 1px solid black;" ';
		}
		if (this.borderType == BORDER_TYPE.double) {
			styleStr = ' style="border: 3px double black;" ';
		}
		if (this.borderType == BORDER_TYPE.round) {
			styleStr = ' style="border: 1px solid black; border-radius: 5px;" ';
		}
		if (this.borderType == BORDER_TYPE.bround) {
			styleStr = ' style="border: 2px solid black; border-radius: 5px;" ';
		}
		if (this.borderType == BORDER_TYPE.shadow) {
			styleStr = ' style="border: 1px solid black; box-shadow: 1px 1px;" ';
		}
		if (this.borderType == BORDER_TYPE.circle) {
			styleStr = ' style="border: 1px solid black; border-radius: 100px;" ';
		}
	}


	// ---- テキストなら span, 数式なら mrow タグを使用します。
	var baseTag = 'span';
	if (this.nt != CIO_XML_TYPE.text) baseTag = 'mrow';
	htmlStartTag += '<' + baseTag + ' id="' + this.id + '" class="' + spkStr + styleClassStr + styleClass + '" ' + styleStr + '>';
	htmlEndTag    = '</' + baseTag + '>' + htmlEndTag;

	// ---- 子要素の toHtml 結果をまとめて取得します。
	var xml = DataClass.getChildrenHtml(this.children, caretId);
	if (DataClass.getCharCount(xml, '<') === 4) {
		xml = xml.replace('"></span></span>', '">&nbsp;</span></span>');
		xml = xml.replace('"></mo></mrow>', '">&nbsp;</mo></mrow>');		// これをやっても、高さがないまま。
	}

	// ---- html を出力します。
	var htmlStr = mathStartTag + htmlStartTag + xml + htmlEndTag + mathEndTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ---- 囲み枠の種類を表す列挙体（BORDER_TYPE）
Object.defineProperty(DecoBoxElement.prototype, 'borderType', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('borderType');
	},
	set: function(value) {
		this.setAttribute('borderType', value);

	}
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
DecoBoxElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'DECO') return null;

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
DecoBoxElement.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

DecoBoxElement.prototype.shiftLeftFromChild = function(childId) {
	return this.id;
};

DecoBoxElement.prototype.shiftRightFromChild = function(childId) {
	return this.nextSibling.id;
};

DecoBoxElement.prototype.shiftUpFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

DecoBoxElement.prototype.shiftDownFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

DecoBoxElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.nextSibling.id;
};

DecoBoxElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

DecoBoxElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

DecoBoxElement.prototype.shiftUpFromNext = function() {
	return this.shiftUp();
};

DecoBoxElement.prototype.shiftDownFromNext = function() {
	return this.shiftDown();
};

//このメソッドは必要な場合のみオーバーライドしてください。
DecoBoxElement.prototype.shiftLastFromNext = function() {
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
DecoBoxElement.getNoCaretClass = function() {
	return '';
};

/**
 * カーソルがある時の書式クラス名を取得します。
 */
DecoBoxElement.getCaretClass = function() {
	return 'hasCaretDecoStyle';
};


/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
DecoBoxElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
DecoBoxElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
DecoBoxElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
DecoBoxElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可

