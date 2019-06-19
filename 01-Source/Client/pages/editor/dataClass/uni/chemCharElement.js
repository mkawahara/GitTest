/**
 * ChemCharElement クラス
 * 化学式で使用される文字要素を表すクラスです。
 * MathJAX の中では使用できないため、テキストレベルでしか入力を許可されません。
 */

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
function ChemCharElement() {
	// 何もしません。
};


// プロトタイプ継承
// CharacterElement.prototypeを本オブジェクトのプロトタイプに設定します。
ChemCharElement.prototype = Object.create(CharacterElement.prototype);


/**
 * 新しい ChemCharElement のインスタンスを作成します。
 * 作成されたデータは通常のノードオブジェクトのため、使用前にプロトタイプの doop が必要です。
 */
ChemCharElement.createNew = function(entity) {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var nodeObj = document.createElement('chemc'); // xmlタグ名にはクラス名を全小文字で使用します。
	nodeObj.id  = DataClass.getNewNodeID();

	// 化学式の記号を表すエンティティを設定します
	$(nodeObj).text(entity);

	return nodeObj;
};

/**
 * ノードオブジェクトに ChemCharElement をプロトタイプとして設定します。
 * @param nodeObj	プロトタイプを追加したいノードオブジェクトへの参照
 */
ChemCharElement.doop = function(nodeObj) {
	DataClass.insertPrototype(nodeObj, ChemCharElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};

/**
 * 表示用 HTML を作成します。
 * @param caretId カーソルの位置を表すデータノードID。互換性のため用意されていますが使用されません。
 */
ChemCharElement.prototype.toHtml = function(caretId) {
	// speaker 属性の処理を行います。
	var speaker = DataClass.getSpeakerClassStr(this);

	// 開始タグと終了タグを作成します
	var startTag = '<span id="' + this.id + '" style="position: relative;" class="chemcolor ' + speaker + '">';
	var endTag = '<span style="opacity: 0.0;">&#x2500;</span></span>';

	if (this.uline) {
		startTag = '<uline>' + startTag;
		endTag += '</uline>';
	}

	// 下線を除く文字装飾は、属性値は有しますが全て無視します。

	// 記号を表すタグを作成します
	var outputString = null;

	if (this.textContent === '&chembond1;') {
		outputString =
			'<span style="position: absolute; top: -20%;">&#x2500;</span>';
	}
	else if (this.textContent === '&chembond2;') {
		outputString =
			'<span style="position: absolute; top: -50%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  10%;">&#x2500;</span>';
	}
	else if (this.textContent === '&chembond3;') {
		outputString =
			'<span style="position: absolute; top: -50%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -20%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  10%;">&#x2500;</span>';
	}
	else if (this.textContent === '&chembond4;') {
		outputString =
			'<span style="position: absolute; top: -50%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -30%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -10%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  10%;">&#x2500;</span>';
	}
	else if (this.textContent === '&chembond5;') {
		outputString =
			'<span style="position: absolute; top: -50%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -35%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -20%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  -5%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  10%;">&#x2500;</span>';
	}
	else if (this.textContent === '&chembond6;') {
		outputString =
			'<span style="position: absolute; top: -50%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -38%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -26%;">&#x2500;</span>' +
			'<span style="position: absolute; top: -14%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  -2%;">&#x2500;</span>' +
			'<span style="position: absolute; top:  10%;">&#x2500;</span>';
	}

	// 開始タグ文字列を生成します。
	var htmlStr = startTag + outputString + endTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ------------- nodeType を取得します。
Object.defineProperty(ChemCharElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.chemical; },
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
ChemCharElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CHARC') return null;
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

// 子要素を持たないため、FromChild 系メソッドは実装されません。


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

// CharacterElement から継承するため、ここでは実装されません。

/**
 * 指定文字列が化学式記号のエンティティか判別します。
 */
ChemCharElement.isChemCharEntity = function(str) {
	if (str === '&chembond1;') return true;
	if (str === '&chembond2;') return true;
	if (str === '&chembond3;') return true;
	if (str === '&chembond4;') return true;
	if (str === '&chembond5;') return true;
	if (str === '&chembond6;') return true;
	return false;
};
