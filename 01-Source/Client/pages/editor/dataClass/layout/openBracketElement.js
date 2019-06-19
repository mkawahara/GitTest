/**
 * 開き括弧を使用する連立方程式などを表現します。
 */

function OpenBracketElement() {
	// 何もしません
};


// 基本クラスの継承
OpenBracketElement.prototype = Object.create(BracketBaseClass.prototype);


/**
 * 新しいOpenBracketElementのインスタンスを作成します。
 * @param rows	行数
 * @param cols	列数
 */
OpenBracketElement.createNew = function(bracket, xmlType) {
	// 不適切な括弧が指定されていた場合、丸括弧に強制します
    if (bracket.length < 1) bracket = '(';
    if (xmlType == CIO_XML_TYPE.text) xmlType = CIO_XML_TYPE.math;

	// 新しいノードインスタンスを作成します
	var node = document.createElement('copen'); // タグ名は全て小文字

	// 文書内で一意なidを与えます
	node.id = DataClass.getNewNodeID();

	// 必要な数のセルノードを作成・登録します
	node.appendChild(MatrixCellElement.createNew());	// 初期で唯一のセル

	// 属性を登録します
	node.setAttribute('rowcount', 1);
	node.setAttribute('nt', xmlType);
	node.setAttribute('openbracket', bracket);

	// 作成されたノードを返します
	return node;
};


/**
 * 指定ノードのプロトタイプに OpenBracketElement を設定します
 */
OpenBracketElement.doop = function(node) {
	DataClass.insertPrototype(node, OpenBracketElement);
};


/**
 * 既存オブジェクトをコピーして、新しいオブジェクトを作成します。
 */
OpenBracketElement.copyFrom = function(src) {
	var newObj = $(src).clone();
	newObj.id = DataClass.getNewNodeID();
	return newObj;
};


/////////////////////////////////////////////////////////////////////
// 表示用 HTML 出力
/////////////////////////////////////////////////////////////////////

/**
 * 表示用 HTML 文字列を取得します。
 * @param caretId キャレットの現在位置を表すID
 */
OpenBracketElement.prototype.toHtml = function(caretId) {
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

	// speaker 属性の処理
	var spkStr = ' ' + DataClass.getSpeakerClassStr(this);
	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);

	// 括弧の取得
	var openbracket = this.getAttribute('openbracket');

	// 開始文字列の作成
	startTag += '<mrow id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">'
		+ '<mrow><mo>' + openbracket + '</mo></mrow><mtable>';
	endTag    = '</mtable></mrow>' + endTag;

	// 文字列の合成
	var html = startTag;

	// セル文字列の作成
	for (var i = 0; i < this.rowCount; i++) {
		html += '<mtr>';
		DataClass.bindDataClassMethods(this.children[i]);
		html += this.children[i].toHtml(caretId);
		html += '</mtr>';
	};

	// 閉じタグの追加
	html += endTag;

	// 無音領域表示の追加
	html = silenceStr.start + html + silenceStr.end;

	// html文字列を返します。
	return html;
};


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * 文字要素では、文字の値のみを比較し、文字属性は比較しません。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
OpenBracketElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'COPEN') return null;

	// 属性を比較します
	if (this.getAttribute('nt') !== node.getAttribute('nt')) return null;
	if (this.getAttribute('openbracket') !== node.getAttribute('openbracket')) return null;

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


