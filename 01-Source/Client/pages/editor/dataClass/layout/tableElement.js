/**
 * テーブル要素を扱うクラスです。
 */

function TableElement() {
	// 何もしません
};


// 基本クラスの継承
TableElement.prototype = Object.create(TableBaseClass.prototype);


/**
 * 新しいTableElementのインスタンスを作成します。
 * @param rows	行数
 * @param cols	列数
 */
TableElement.createNew = function(rows, cols) {

	// 新しいノードインスタンスを作成します
	var node = document.createElement('ctable'); // タグ名は全て小文字

	// 文書内で一意なidを与えます
	node.id = DataClass.getNewNodeID();

	// 必要な数のセルノードを作成・登録します
	var childCount = rows * cols;
	for (var i = 0; i < childCount; i++) {
		node.appendChild(TableCellElement.createNew());
	}

	// 属性を登録します
	node.setAttribute('rowcount', rows);
	node.setAttribute('nt', CIO_XML_TYPE.text);
	node.setAttribute('subcount', 0);

	// 作成されたノードを返します
	return node;
};


/**
 * 指定ノードのプロトタイプに TableElement を設定します
 */
TableElement.doop = function(node) {
	DataClass.insertPrototype(node, TableElement);
};


/**
 * 既存オブジェクトをコピーして、新しいオブジェクトを作成します。
 */
TableElement.copyFrom = function(src) {
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
TableElement.prototype.toHtml = function(caretId) {
	var html = '';

	// speaker 属性の処理
	var spkStr = ' ' + DataClass.getSpeakerClassStr(this);
	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	// 読み上げ方向属性の処理
	var readRowStr = this.readRow ? 'readrow ' : '';

	// 開始文字列の作成
	if (this.uline) html = '<uline>';
	html += '<table id="' + this.id + '" class="doc_table ' + spkStr + readRowStr + '"><tbody>';

	// セル文字列の作成
	for (var ridx = 0; ridx < this.rowCount; ridx++) {
		html += '<tr>';

		for (var didx = 0; didx < this.colCount; didx++) {
			// 対象セルを決定します。
			var idx = didx + ridx * this.colCount;

			DataClass.bindDataClassMethods(this.children[idx]);
			html += this.children[idx].toHtml(caretId);
		};

		html += '</tr>';
	};

	// 閉じ文字列の作成
	html += '</tbody></table>';
	if (this.uline) html += '</uline>';

	// 無音領域表示の追加
	html = silenceStr.start + html + silenceStr.end;

	// html文字列を返します。
	return html;
};


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * readRow を取得します (列方向に読み上げるか否か)
 */
Object.defineProperty(TableBaseClass.prototype, 'readRow', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('readrow') !== null;
	},
	set: function(value){
		if (value == true) {
			this.setAttribute('readrow', true);
		} else {
			this.removeAttribute('readrow');
		}
	},
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
TableElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CTABLE') return null;

	// 属性を比較します
	if (this.getAttribute('nt') !== node.getAttribute('nt')) return null;
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
//弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

TableElement.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

TableElement.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
TableElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
TableElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
