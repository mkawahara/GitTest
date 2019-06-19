/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： rubyElement.js                                     */
/* -                                                                         */
/* -    概      要     ： ruby (ルビ) クラス                                 */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js                             */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月02日                         */



// ------------- コンストラクタ
function RubyElement() {
	// 何もしません
};



// ------------- LayoutBaseClassクラス継承
RubyElement.prototype = Object.create(LayoutBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
// 数式・化学式レベルでは使用されないため、xmlType はつきません。
RubyElement.createNew = function() {
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj    = document.createElement('cruby');   // xmlタグ名は全て小文字です。
	domObj.id = DataClass.getNewNodeID();    // 文書内で一意なidを与えます。

	// CornerElement は、必ず子要素として GroupElement を1個だけ持ちます。
//	var childGroup = GroupElement.createNew(CIO_XML_TYPE.text);
//	$(domObj).append(childGroup);
	domObj.appendChild( GroupElement.createNew(CIO_XML_TYPE.text) );

	domObj.setAttribute('ruby', '');
	domObj.setAttribute('rubyLevel', 0);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
RubyElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, RubyElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


RubyElement.prototype.getDefaultCursorPos = function() {
	return null;
};

// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
RubyElement.prototype.toHtml = function(caretId) {
	// caretId [I, str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	// ★カーソル位置で使用すべきスタイルが変更されます★
	var styleClass = RubyElement.getNoCaretClass() + ' ';
	if (caretId === this.id) styleClass = RubyElement.getCaretClass() + ' ';

	// 開始、終了タグ
	var htmlStartTag  = '<ruby id="' + this.id + '" class="' + spkStr + styleClass + '">';
	var htmlEndTag    = '</ruby>';

	// uline 処理
	if (this.uline) { // ---- テキストレベルかつ下線ありなら
		htmlStartTag =  '<uline>' + htmlStartTag;
		htmlEndTag  += '</uline>';
	}

	// ---- 子要素の toHtml 結果をまとめて取得します。
	var xml = DataClass.getChildrenHtml(this.children, caretId);

	// ---- ルビ文字列を取得します。
	var rubyStr = '<rt class="rubycolor">' + this.ruby + '</rt>';

	// ---- html を出力します。
	var htmlStr = htmlStartTag + xml + rubyStr + htmlEndTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ------------- nodeType を取得します。
Object.defineProperty(RubyElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});


// ---- ルビデータ
Object.defineProperty(RubyElement.prototype, 'ruby', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('ruby');
	},
	set: function(value) {
		this.setAttribute('ruby', value);

	}
});

// ---- ルビレベル（0-7の8段階）。★何に使うのか不明
Object.defineProperty(RubyElement.prototype, 'rubyLevel', {
	enumerable: true,
	configurable: true,
	get: function(){
		return number( this.getAttribute('rubyLevel') );
	},
	set: function(value) {
		this.setAttribute('rubyLevel', value);
	}
});


/////////////////////////////////////////////////////////////////////
// カーソル位置によって変更されるべきクラス名の取得
/////////////////////////////////////////////////////////////////////

/**
 * カーソルがない時の書式クラス名を取得します
 */
RubyElement.getNoCaretClass = function() {
	return '';
};

/**
 * カーソルがある時の書式クラス名を取得します。
 */
RubyElement.getCaretClass = function() {
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
RubyElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CRUBY') return null;

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
RubyElement.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

RubyElement.prototype.shiftLeftFromChild = function(childId) {
	return this.id;
};

RubyElement.prototype.shiftRightFromChild = function(childId) {
	return this.nextSibling.id;
};

RubyElement.prototype.shiftUpFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

RubyElement.prototype.shiftDownFromChild = function(childId) {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

RubyElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.nextSibling.id;
};

RubyElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

RubyElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

RubyElement.prototype.shiftUpFromNext = function() {
	return this.shiftUp();
};

RubyElement.prototype.shiftDownFromNext = function() {
	return this.shiftDown();
};

//このメソッドは必要な場合のみオーバーライドしてください。
RubyElement.prototype.shiftLastFromNext = function() {
	var baseString = this.children[0];
	DataClass.bindDataClassMethods(baseString);
	return baseString.getLastPos();
};



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
RubyElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
RubyElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
RubyElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
RubyElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可
