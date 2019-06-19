/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_characterElement.js                             */
/* -                                                                         */
/* -    概      要     ： CharacterElement(一文字要素)クラス                 */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js                             */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月10日                         */

// *************************************************************
// **            CharacterElement(一文字要素)クラス           **
// *************************************************************

/* このクラスで使用するDOM属性一覧
	'id'    : [str]  idです。doopメソッド内で、idマネージャから取得した「文書内で一意のid」を割りあてられます。
	'ital'  : [bool] イタリック属性です。一文字ずつ<i>タグを付与します。
	'bold'  : [bool] ボールド属性です。一文字ずつ<b>タグを付与します。
	'uline' : [bool] 下線属性です。Paragraphクラスにて、まとまりごとに underbarクラス(css) を付与します。
	'strk'  : [bool] 打消線属性です。Paragraphクラスにて、まとまりごとに <strike>タグを付与します。
	'sup'   : [bool] 上付属性です。一文字ずつ<sup>タグを付与します。
	'sub'   : [bool] 下付属性です。一文字ずつ<sub>タグを付与します。
*/

// ------------- コンストラクタ
function CharacterElement() {
	// 何もしません。
};



// ------------- HTMLUnknownElementクラス継承
// HTMLUnknownElement.prototypeを本オブジェクトのプロトタイプに設定します。
CharacterElement.prototype = Object.create(LayoutBaseClass.prototype);
//CharacterElement.prototype = Object.create(HTMLUnknownElement.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
CharacterElement.createNew = function(char, entity) {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('c'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID();

	// 一部の文字はエンティティとして設定します
	// 対象：半角スペース、タブ、
	if ((entity === void 0) || (entity === null)) {
//		$(domObj).text(char);
		domObj.textContent = char;
	} else {
//		$(domObj).text(entity);
		domObj.textContent = entity;
	}

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
CharacterElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, CharacterElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// [static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
CharacterElement.copyFrom = function(src) {
	// 引数  src [I, obj]: コピー元オブジェクト
	// 返値  [obj]   : コピーによって生成された新しいオブジェクト
	return $(src).clone();
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
CharacterElement.prototype.toHtml = function(caretId) {
	// caretId [str]      : キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// speaker 属性の処理を行います。
	var spkStr = DataClass.getSpeakerClassStr(this);

	var htmlStartTag = '<span id="' + this.id + '" class="' + spkStr + '">'; // 開始タグ
	var htmlEndTag   = '</span>';                      // 終了タグ

	// 数式番号が設定されていれば、対応する中間タグを追加します
	if (this.eqnumber) {
		htmlStartTag = '<eqnumber>' + htmlStartTag;
		htmlEndTag += '</eqnumber>';
	}

	if (this.uline) {
		htmlStartTag = '<uline>' + htmlStartTag;
		htmlEndTag += '</uline>';
	}

	// 文字装飾を扱います。
	// 対象: ital <i>～</i>
	//       bold <b>～</b>
	//       sup  <sup>～</sup>
	//       sub  <sub>～</sub>
	// ※uline, strk に対する xml 表現は、Paragraphクラスで扱われます。ここでは処理しません。
	var startDecStr = '';                     // 装飾用の開始タグ文字列
	var endDecStr   = '';                     // 装飾用の終了タグ文字列

	if (this.strk) {  // 打ち消し線
		startDecStr = '<s>' ;
		endDecStr   = '</s>';
	}
	if (this.ital) {  // イタリック体
		startDecStr += '<i>' ;
		endDecStr   = '</i>' + endDecStr;
	}
	if (this.bold) {    // 太字
		startDecStr += '<b>' ;
		endDecStr   =  '</b>' + endDecStr;
	}
	if (this.sup) {     // 上付き
		startDecStr += '<sup>' ;
		endDecStr   =  '</sup>' + endDecStr;
	}
	if (this.sub) {     // 下付き
		startDecStr += '<sub>' ;
		endDecStr   =  '</sub>' + endDecStr;
	}

	// 特殊文字を表示します（半角スペース等）
	var outputString = this.textContent;
	// 半角スペース
	if (outputString === '&nbsp;')	outputString = '<span class="space">&#x2423;<span class="break_span"></span></span>';
	// 全角スペース
	if (outputString === '　')		outputString = '<span class="space">&#x25A1;</span>';
	// タブ
	if (outputString === '&tab;')	outputString = '<pre style="display: inline;"><span class="tab">→</span>	</pre><span class="break_span"></span>';
	var tempSpace = ' ';

	// 開始タグ文字列を生成します。
	var htmlStr = htmlStartTag + startDecStr + outputString + endDecStr + htmlEndTag;
	// 例: <span id="2"><i><b><sup>あ</sup></b></i></span>

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ------------- nodeType を取得します。
Object.defineProperty(CharacterElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * 文字要素では、文字の値のみを比較し、文字属性は比較しません。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
CharacterElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'C') return null;
	if (this.textContent !== node.textContent) return null;

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
// キー操作によるカーソル移動を扱うメソッド
/////////////////////////////////////////////////////////////////////

// CharacterElement は子要素を持たないため、FromChild 系メソッドは実装されません。


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

CharacterElement.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

CharacterElement.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
CharacterElement.prototype.convertibleToText = false; // 子孫を含めてのテキストモードへの変換は可能か？
CharacterElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
CharacterElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
CharacterElement.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可

// ---- 数式・化学式への変換
CharacterElement.prototype.AltNodeForMath = function(result, inputMode) {

	// ステータスも反映すべし
	
	var strBase = this.textContent;
	result.convertedNodeList = [ CornerElement.createNew(strBase, inputMode) ];
	result.convertedNtList   = [ inputMode ];
	return result;
};

