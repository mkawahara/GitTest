/**
 * レイアウト要素・単文字要素に共通の基本クラスの定義
 *
 * 主に、キー操作によるカーソル移動のためのメソッドが定義されています。
 */

function TableBaseClass() {};

TableBaseClass.prototype = Object.create(LayoutBaseClass.prototype);

/**
 * デフォルトのカーソル位置をノードIDとして取得します。
 * @returns
 */
TableBaseClass.prototype.getDefaultCursorPos = function() {
	var childNode =  this.children[this.subCount];
	DataClass.bindDataClassMethods(childNode);
	return childNode.getFirstPos();
}

/////////////////////////////////////////////////////////////////////
// 自身を起点とする移動処理メソッド
/////////////////////////////////////////////////////////////////////

/**
 * テーブル内を次の移動先として返します。
 * このメソッドは基本クラスで定置されているメソッドのオーバーライドです。
 */
TableBaseClass.prototype.shiftRight = function() {
	// 0,1要素は添え字・ダミーのため、スキップします
	var node = this.children[this.subCount];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

// ここに属するメソッドは原則オーバーライドが必要です。

/**
 * 添え字要素間での左移動時の次のカーソル位置を返します。
 */
TableBaseClass.prototype.shiftLeftFromChild = function(childId) {
	// 移動元のセルインデックスを取得します
	// 0,1:添え字、ダミーのため、除外
	// 2  : 先頭要素のため、除外
	for (var i = this.subCount + 1; i < this.children.length; i++) {
		if (this.children[i].id === childId) {
			var nextNode = this.children[i - 1];
			DataClass.bindDataClassMethods(nextNode);
			return nextNode.getLastPos();
		}
	};

	// 第一（左上）要素にカーソルがある場合、
	// 自身のIDを次の移動先として返します。
	return this.id;
};

/**
 * 添え字要素間での右移動時の次のカーソル位置を返します。
 */
TableBaseClass.prototype.shiftRightFromChild = function(childId) {
	// 移動元のセルインデックスを取得します
	for (var i = this.subCount; i < this.children.length - 1; i++) {
		if (this.children[i].id === childId) {
			var nextNode = this.children[i + 1];
			DataClass.bindDataClassMethods(nextNode);
			return nextNode.getFirstPos();
		}
	};

	// 右下添え字にカーソルがあった場合
	if ((this.subCount == 2) && (this.children[0].id === childId)) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	}

	// 最終要素・右上添え字にカーソルがあった場合、弟要素を返します
	return this.nextSibling.id;
};

/**
 * 添え字要素間での上移動時の次のカーソル位置を返します。
 */
TableBaseClass.prototype.shiftUpFromChild = function(childId) {
	// 右下添え字にカーソルがある場合
	if ((this.subCount == 2) && (this.children[0].id === childId)) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	}

	// 指定添え字以外の場合、null を返します
	return null;
};

/**
 * 添え字要素間での下移動時の次のカーソル位置を返します。
 */
TableBaseClass.prototype.shiftDownFromChild = function(childId) {
	// 右上添え字にカーソルがある場合
	if ((this.subCount == 2) && (this.children[1].id === childId)) {
		var nextNode = this.children[0];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getFirstPos();
	}

	// 指定添え字以外の場合、null を返します
	return null;
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
TableBaseClass.prototype.shiftByEnterFromChild = function() {
	return this.nextSibling.id;
};

/*TableBaseClass.prototype.shiftHomeFromChild = function() {
	throw this.nodeName + 'の shiftHomeFromChild メソッドは実行されてはいけません。in TableBase.js';
};

TableBaseClass.prototype.shiftEndFromChild = function() {
	throw this.nodeName + 'の shiftEndFromChild メソッドは実行されてはいけません。in TableBase.js';
};*/


/////////////////////////////////////////////////////////////////////
// 親要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

// 該当メソッドは存在しません。


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

TableBaseClass.prototype.shiftUpFromNext = function() {
	var nextNode = this.children[1];
	DataClass.bindDataClassMethods(nextNode);
	return nextNode.getFirstPos();
};

TableBaseClass.prototype.shiftDownFromNext = function() {
	var nextNode = this.children[0];
	DataClass.bindDataClassMethods(nextNode);
	return nextNode.getFirstPos();
};

/**
 * 右から移動してきた時の移動先要素を取得します。
 */
TableBaseClass.prototype.shiftLastFromNext = function() {
	var lastChild = this.children[this.children.length - 1];
	DataClass.bindDataClassMethods(lastChild);
	return lastChild.getLastPos();
};


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// ここから、カーソル移動以外のメソッド
/////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////
// 行の挿入・削除
/////////////////////////////////////////////////////////////////////

/**
 * 指定セルを基準に行を追加します
 * @param cellIdList	基準となるセルノードのIDリスト
 * @param newCellList	新しく挿入されるノードのリスト
 * @param isBefore		trueなら指定ノードの前に挿入、falseなら後に挿入
 */
TableBaseClass.prototype.insertRows = function(cellIdList, newCellList, isBefore) {
	// 対象行範囲を特定します
	var range = this.getRowRange(cellIdList);
	var insertRowCount = range.max - range.min + 1;

	// 挿入先を取得します
	var insertTarget;
	if (isBefore) {
		insertTarget = this.children[range.min * this.colCount + this.subCount];
	} else {
		insertTarget = this.children[(range.max + 1) * this.colCount + this.subCount];
	}

	// 挿入すべきセル数を決定します
	var insertCount = insertRowCount * this.colCount;

	// 挿入ノードが必要数存在するか、確認します
	if (newCellList.length !== insertCount) return false;

	// 行データを追加します
	this.insertNewCells(newCellList, 0, insertCount, insertTarget);

	// 行数属性値を更新します
	this.setAttribute('rowcount', (this.rowCount + insertRowCount))

	return true;
};

/**
 * 指定セルを含む行を全て削除します
 * @param cellIdList
 */
TableBaseClass.prototype.removeRows = function(cellIdList) {
	// 対象行範囲を特定します
	var range = this.getRowRange(cellIdList);

	// 削除対象セルを特定します
	var cellList = [];

	for (var i = range.min; i <= range.max; i++) {
		cellList = cellList.concat(this.getCellsFromRowIndex(i));
	}

	var localColCount = this.colCount;

	// 行データを削除します
	this.removeCells(cellList);

	// 行数属性値を更新します
	this.setAttribute('rowcount', (this.rowCount - (cellList.length / localColCount)))

	// 削除されたセルのリストを返します
	return cellList;
};

/**
 * 対象とする行番号の最小値と最大値を取得します
 * ※一度に１行しか操作できないため、最大値のみを取得します。
 * @param cellIdList
 */
TableBaseClass.prototype.getRowRange = function(cellIdList) {
	// 対象行番号を特定します
	var rowList = [];
	for (var i = 0; i < cellIdList.length; i++) {
		rowList.push(this.getRowIndexFromCell(cellIdList[i]));
	};

	// 行範囲を取得します
	var minRow = this.rowCount;
	var maxRow = 0;

	for (var i = 0; i < rowList.length; i++) {
		if (minRow > rowList[i]) minRow = rowList[i];
		if (maxRow < rowList[i]) maxRow = rowList[i];
	}

	return { min: maxRow, max: maxRow, };
};

/**
 * 指定セルが属する行の番号を取得します
 */
TableBaseClass.prototype.getRowIndexFromCell = function(cellId) {
	// セルのインデックスを取得します
	var cellIndex = 0;
	for (cellIndex = 0; cellIndex < this.children.length; cellIndex++) {
		if (this.children[cellIndex].id === cellId) break;
	}

	// 行番号を算出します
	return Math.floor((cellIndex - this.subCount) / this.colCount);
};

/**
 * 番号で指定した行に属する全てのセルのリストを取得します
 */
TableBaseClass.prototype.getCellsFromRowIndex = function(index) {
	var nodeList = [];

	var startIndex = index * this.colCount + this.subCount;
	var endIndex = (index + 1) * this.colCount + this.subCount;
	for (var i = startIndex; i < endIndex; i++) {
		nodeList.push(this.children[i]);
	}

	return nodeList;
};


/////////////////////////////////////////////////////////////////////
// 列の挿入・削除
/////////////////////////////////////////////////////////////////////

/**
 * 指定セルを基準に列を１つ追加します。
 * 挿入に使用するノードが足りない場合、何もしません。
 * @param cellIdList		基準となるセルノードのIDリスト
 * @param newCellList	新しく挿入されるノードのリスト
 * @param isBefore		trueなら指定ノードの前に挿入、falseなら後に挿入
 */
TableBaseClass.prototype.insertCols = function(cellIdList, newCellList, isBefore) {
	// 対象列番号を特定します
	var range = this.getColRange(cellIdList);
	var insertColCount = range.max - range.min + 1;

	// 挿入セル数が一致しない場合、何もしません。
	if (newCellList.length !== (insertColCount * this.rowCount)) return false;

	// 挿入先を取得します
	var insertTarget = [];
	for (var i = 0; i < this.rowCount; i++) {
		if (isBefore) {
			insertTarget.push(this.children[i * this.colCount + range.min + this.subCount]);
		} else {
			insertTarget.push(this.children[i * this.colCount + range.max + 1 + this.subCount]);
		}
	};

	// 列データを追加します
	for (var i = 0; i < insertTarget.length; i++) {
		this.insertNewCells(newCellList, i * insertColCount, insertColCount, insertTarget[i]);
	};

	return true;
};

/**
 * 指定セルを含む列を全て削除します
 * @param cellIdList
 */
TableBaseClass.prototype.removeCols = function(cellIdList) {
	// 対象列番号を特定します
	var range = this.getColRange(cellIdList);

	// 削除対象を取得します
	var cellList = [];

	for (var i = range.min; i <= range.max; i++) {
		cellList = cellList.concat(this.getCellsFromColIndex(i));
	}

	// 列データを削除します
	this.removeCells(cellList);

	// 削除されたセルのリストを返します
	return cellList;
};

/**
 * 対象とする列番号の最小値と最大値を取得します
 * ※一度に１列しか操作できないため、最大値のみを取得します。
 * @param cellIdList
 */
TableBaseClass.prototype.getColRange = function(cellIdList) {
	// 対象列番号を特定します
	var colList = [];
	for (var i = 0; i < cellIdList.length; i++) {
		colList.push(this.getColIndexFromCell(cellIdList[i]));
	};

	// 列範囲を取得します
	var min = this.rowCount;
	var max = 0;

	for (var i = 0; i < colList.length; i++) {
		if (min > colList[i]) min = colList[i];
		if (max < colList[i]) max = colList[i];
	}

	return { min: max, max: max, };
};

/**
 * 指定セルが属する列の番号を取得します
 */
TableBaseClass.prototype.getColIndexFromCell = function(cellId) {
	// セルのインデックスを取得します
	var cellIndex = 0;
	for (cellIndex = 0; cellIndex < this.children.length; cellIndex++) {
		if (this.children[cellIndex].id === cellId) break;
	}

	// 列番号を算出します
	return (cellIndex - this.subCount) % this.colCount;
};

/**
 * 番号で指定した列に属する全てのセルのリストを取得します
 */
TableBaseClass.prototype.getCellsFromColIndex = function(index) {
	var nodeList = [];

	for (var i = 0; i < this.children.length - this.subCount; i += this.colCount) {
		nodeList.push(this.children[i + index + this.subCount]);
	}

	return nodeList;
};


/////////////////////////////////////////////////////////////////////
// 行と列の挿入・削除に使用するメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 指定ノードの直前に指定数の新しいセルを挿入します
 * @param list	挿入するノードのリスト
 * @param start	上記リストから挿入される最初のノードのインデックス
 * @param count	上記リストから挿入されるノードの数
 * @param at	挿入基準位置を表すノードへの参照
 */
TableBaseClass.prototype.insertNewCells = function(list, start, count, at) {
	if (at === void 0) at = null;

	for (var i = 0; i < count; i++) {
		this.insertBefore(list[start + i], at);
	};
};

/**
 * 指定されたセルノードを全て削除します
 * @param cellList
 */
TableBaseClass.prototype.removeCells = function(cellList) {
	for (var i = 0; i < cellList.length; i++) {
		this.removeChild(cellList[i]);
	}
};


/////////////////////////////////////////////////////////////////////
// 範囲選択用メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 指定された２つのノードへの参照を元に、テーブルで選択されるべきノードのリストを返します。
 * これはセルのリストになります。
 */
TableBaseClass.prototype.getSelectedNodeList = function(start, end) {
	// ２つの要素の系列を遡り、本オブジェクトのセルに変換します
	while (start.parentNode !== this) start = start.parentNode;
	while (end.parentNode !== this) end = end.parentNode;

	// ２つのセルのchildren上での位置を取得します
	var startPos = DataClass.getNodeIndex(start, this.children);
	var endPos = DataClass.getNodeIndex(end, this.children);

	// ２つのセルの位置を行、列表記に変換します
	startPos = { col: startPos % this.colCount, row: Math.floor(startPos / this.colCount), };
	endPos = { col: endPos % this.colCount, row: Math.floor(endPos / this.colCount), };

	// セル位置の正規化を行います
	TableBaseClass.normalizeCorner(startPos, endPos);

	// 矩形選択時に選択されるべきセルを取得します
	var nodeList = [];
	for (var rowCounter = startPos.row; rowCounter <= endPos.row; rowCounter++) {
		for (var colCounter = startPos.col; colCounter <= endPos.col; colCounter++) {
			nodeList.push(this.children[colCounter + rowCounter * this.colCount]);
		};
	};

	return nodeList;
};

/**
 * ２つの座標が表す矩形は変わらないまま、それぞれが左上、右下になるよう正規化します
 * @param startPos
 * @param endPos
 */
TableBaseClass.normalizeCorner = function(startPos, endPos) {
	if (startPos.col > endPos.col) {
		var temp = startPos.col;
		startPos.col = endPos.col;
		endPos.col = temp;
	}
	if (startPos.row > endPos.row) {
		var temp = startPos.row;
		startPos.row = endPos.row;
		endPos.row = temp;
	}
}


/////////////////////////////////////////////////////////////////////
// データプロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * 列数を取得します
 */
Object.defineProperty(TableBaseClass.prototype, 'colCount', {
	enumerable: true,
	configurable: true,
	get: function(){
		return (this.children.length - this.subCount) / Number(this.getAttribute('rowcount'));
	},
});

/**
 * 行数を取得します
 */
Object.defineProperty(TableBaseClass.prototype, 'rowCount', {
	enumerable: true,
	configurable: true,
	get: function(){
		return Number(this.getAttribute('rowcount'));
	},
});

/**
 * 添え字要素数を取得します
 */
Object.defineProperty(TableBaseClass.prototype, 'subCount', {
	enumerable: true,
	configurable: true,
	get: function(){
		return Number(this.getAttribute('subcount'));
	},
});

/**
 * 複数列許容？
 */
Object.defineProperty(TableBaseClass.prototype, 'multiColEnabled', {
	enumerable: true,
	configurable: true,
	get: function(){
		return true;
	},
});


/////////////////////////////////////////////////////////////////////
// 書式プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * ital プロパティ：読み書き可
 */
Object.defineProperty(TableBaseClass.prototype, 'ital', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

/**
 * ut プロパティ：読み書き可
 * 立体設定。アルファベットを立体にしたい時に指定する。省略可。
 */
Object.defineProperty(TableBaseClass.prototype, 'ut', {
	enumerable  : true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

/**
 * bold プロパティ：読み書き可
 */
Object.defineProperty(TableBaseClass.prototype, 'bold', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

/**
 * font プロパティ：読み書き可
 */
Object.defineProperty(TableBaseClass.prototype, 'font', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

// ------------- 打消線属性を有効/無効化します。
Object.defineProperty(TableBaseClass.prototype, 'strk', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

// ------------- 上付き属性を有効/無効化します。
Object.defineProperty(TableBaseClass.prototype, 'sup', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

// ------------- 下付き属性を有効/無効化します。
Object.defineProperty(TableBaseClass.prototype, 'sub', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////

TableBaseClass.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
TableBaseClass.prototype.hasMathMode       = false; // 自身が数式・化学式モードを持つことは可能か？
// ※ hasTextMode, hasMathMode の両者を false にした場合、自身の nt 属性書き換え不可



/////////////////////////////////////////////////////////////////////
// 話者設定メソッド
/////////////////////////////////////////////////////////////////////
TableBaseClass.prototype.mutableSpeaker = false; // table は、false にすること



/////////////////////////////////////////////////////////////////////
// 無音範囲設定メソッド
/////////////////////////////////////////////////////////////////////
TableBaseClass.prototype.mutableSilence = false; // Table は false

