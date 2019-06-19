function MatrixElement() {
	// 何もしません
};


// 基本クラスの継承
MatrixElement.prototype = Object.create(TableBaseClass.prototype);


/**
 * 新しいTableElementのインスタンスを作成します。
 * @param rows	行数
 * @param cols	列数
 */
MatrixElement.createNew = function(bracket, xmlType) {
	// 不適切な括弧が指定されていた場合、丸括弧に強制します
	if (bracket.length < 2) bracket = '()';
	if (xmlType == CIO_XML_TYPE.text) xmlType = CIO_XML_TYPE.math;

	// 新しいノードインスタンスを作成します
	var node = document.createElement('cmat'); // タグ名は全て小文字

	// 文書内で一意なidを与えます
	node.id = DataClass.getNewNodeID();

	// ノードを作成・登録します
	node.appendChild(GroupElement.createNew());		// 右下添え字
	node.appendChild(GroupElement.createNew());		// 右上添え字
	node.appendChild(MatrixCellElement.createNew());	// 初期で唯一のセル

	// 開始・終了括弧の文字列を取得します
	var open = bracket.substr(0, 1);
	var close = bracket.substr(1, 1);
	var entities = bracket.match(/(&.+?;)/g);
	if (entities != null && entities.length >= 2) {
	    open = entities[0];
	    close = entities[1];
	}

	// 属性を登録します
	node.setAttribute('rowcount', 1);
	node.setAttribute('nt', xmlType);
	node.setAttribute('openbracket', open);
	node.setAttribute('closebracket', close);
	node.setAttribute('subcount', 2);

	// 作成されたノードを返します
	return node;
};


/**
 * 指定ノードのプロトタイプに MatrixElement を設定します
 */
MatrixElement.doop = function(node) {
	DataClass.insertPrototype(node, MatrixElement);
};


/**
 * 既存オブジェクトをコピーして、新しいオブジェクトを作成します。
 */
MatrixElement.copyFrom = function(src) {
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
MatrixElement.prototype.toHtml = function(caretId) {
	// 親要素が Paragraph かどうか判断し、math タグの必要性を判断します。
	var startTag = '';
	var middleTag = '';
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
	var closebracket = this.getAttribute('closebracket');

	// 開始文字列の作成
	startTag += '<msubsup id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">'
		+ '<mrow><mrow><mo>' + openbracket + '</mo></mrow><mtable>';
	middleTag = '</mtable><mrow><mo>' + closebracket + '</mo></mrow></mrow>';
	endTag    = '</msubsup>' + endTag;

	// 文字列の合成
	var html = startTag;

	// セル文字列の作成
	for (var ridx = 0; ridx < this.rowCount; ridx++) {
		html += '<mtr>';

		for (var didx = 0; didx < this.colCount; didx++) {
			var idx = didx + ridx * this.colCount + 2;

			DataClass.bindDataClassMethods(this.children[idx]);
			html += this.children[idx].toHtml(caretId);
		};

		html += '</mtr>';
	};

	// 中間文字列の作成
	html += middleTag;

	// 右下添え字の追加
	if (this.children[0].children.length <= 0) {
		html += '<none/>'
	} else {
		DataClass.bindDataClassMethods(this.children[0]);
		html += this.children[0].toHtml(caretId);
	}

	// 右上添え字の追加
	DataClass.bindDataClassMethods(this.children[1]);
	html += this.children[1].toHtml(caretId);

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
MatrixElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CMAT') return null;

	// 属性を比較します
	if (this.getAttribute('nt') !== node.getAttribute('nt')) return null;
	if (this.getAttribute('openbracket') !== node.getAttribute('openbracket')) return null;
	if (this.getAttribute('closebracket') !== node.getAttribute('closebracket')) return null;
	if (this.getAttribute('rowcount') !== node.getAttribute('rowcount')) return null;

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
// カーソル移動
/////////////////////////////////////////////////////////////////////

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
/*MatrixElement.prototype.shiftByEnterFromChild = function() {
	return this.nextSibling.id;
};*/



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////

// 基底クラス TableBaseClass の通りです。



