/**
 * レイアウト要素・単文字要素に共通の基本クラスの定義
 *
 * 主に、キー操作によるカーソル移動のためのメソッドが定義されています。
 */

function BracketBaseClass() {};

BracketBaseClass.prototype = Object.create(LayoutBaseClass.prototype);

/**
 * デフォルトのカーソル位置をノードIDとして取得します。
 * @returns
 */
BracketBaseClass.prototype.getDefaultCursorPos = function() {
	var childNode =  this.children[0];
	DataClass.bindDataClassMethods(childNode);
	return childNode.getFirstPos();
}


/////////////////////////////////////////////////////////////////////
// 自身を起点とする移動処理メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 弟要素を次のカーソル位置として返します。
 */
BracketBaseClass.prototype.shiftRight = function() {
	var node = this.children[0];
	DataClass.bindDataClassMethods(node);
	return node.getFirstPos();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 添え字要素間での左移動時の次のカーソル位置を返します。
 */
BracketBaseClass.prototype.shiftLeftFromChild = function(childId) {
	for (var i = 1; i < this.children.length; i++) {
		if (this.children[i].id === childId) {
			var nextNode = this.children[i - 1];
			DataClass.bindDataClassMethods(nextNode);
			return nextNode.getLastPos();
		}
	};

	// 第一要素にカーソルがある場合、
	// 自身のIDを次の移動先として返します。
	return this.id;
};

/**
 * 添え字要素間での右移動時の次のカーソル位置を返します。
 */
BracketBaseClass.prototype.shiftRightFromChild = function(childId) {
	for (var i = 0; i < this.children.length - 1; i++) {
		if (this.children[i].id === childId) {
			var nextNode = this.children[i + 1];
			DataClass.bindDataClassMethods(nextNode);
			return nextNode.getFirstPos();
		}
	};

	// 最終要素にカーソルがあった場合、弟要素を返します
	return this.nextSibling.id;
};

/*BracketBaseClass.prototype.shiftUpFromChild = function(childId) {
	throw this.nodeName + 'の shiftUpFromChild メソッドは実行されてはいけません。in TableBase.js';
};

BracketBaseClass.prototype.shiftDownFromChild = function(childId) {
	throw this.nodeName + 'の shiftDownFromChild メソッドは実行されてはいけません。in TableBase.js';
};*/

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
BracketBaseClass.prototype.shiftByEnterFromChild = function() {
	return this.nextSibling.id;
};

/*BracketBaseClass.prototype.shiftByEnterFromChild = function(childId) {
	throw this.nodeName + 'に shiftByEnterFromChild メソッドが実装されていません。in LayoutBase.js';
};

BracketBaseClass.prototype.shiftHomeFromChild = function() {
	throw this.nodeName + 'の shiftDownFromChild メソッドは実行されてはいけません。in TableBase.js';
};

BracketBaseClass.prototype.shiftEndFromChild = function() {
	throw this.nodeName + 'の shiftDownFromChild メソッドは実行されてはいけません。in TableBase.js';
};*/


/////////////////////////////////////////////////////////////////////
// 親要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

// 該当メソッドは存在しません。


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

BracketBaseClass.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

BracketBaseClass.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

// このメソッドは必要な場合のみオーバーライドしてください。
BracketBaseClass.prototype.shiftLastFromNext = function() {
	var lastChild = this.children[this.children.length - 1];
	DataClass.bindDataClassMethods(lastChild);
	return lastChild.getLastPos();
};


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// ここから、カーソル移動以外のメソッド
/////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////
//行の挿入・削除
/////////////////////////////////////////////////////////////////////

/**
* 指定セルを基準に行を追加します
* @param cellId		基準となるセルノードのID のリスト　ただし index 0 しか使用しない
* @param addCell	追加されるセルノード     のリスト　ただし index 0 しか使用しない
* @param isBefore	trueなら指定ノードの前に挿入、falseなら後に挿入
*/
BracketBaseClass.prototype.insertRows = function(cellId, addCell, isBefore) {
	// 挿入基準位置セルを特定します
	var targetCell = $(this).find('#' + cellId[0])[0];

	if (!isBefore) {
		targetCell = targetCell.nextSibling;
	}

	// 行データを追加します
	this.insertBefore(addCell[0], targetCell);
};

/**
* 指定セルを削除します。
* 複数行削除は想定していません。
* @param cellIdList
*/
BracketBaseClass.prototype.removeRows = function(cellId) {
	// 削除対象セルを特定します
	var targetCell = $(this).find('#' + cellId)[0];

	// セルを削除します
	this.removeChild(targetCell);

	// 削除されたセルを返します
	return targetCell;
};

/**
 * 指定セルが属する行の番号を取得します
 */
BracketBaseClass.prototype.getRowIndexFromCell = function(cellId) {
    // セルのインデックスを取得します
    var cellIndex = 0;
    for (cellIndex = 0; cellIndex < this.children.length; cellIndex++) {
        if (this.children[cellIndex].id === cellId) break;
    }

    // 片括弧は1列のため、そのまま行番号となります
    return cellIndex;
};


/**
 * 指定セルが属する列の番号を取得します
 */
BracketBaseClass.prototype.getColIndexFromCell = function(cellId) {
    // 片括弧は1列です
    return 0;
};

/**
 * 番号で指定した行に属する全てのセルのリストを取得します
 */
BracketBaseClass.prototype.getCellsFromRowIndex = function(index) {
    var nodeList = [];
    if (index >= 0 && index < this.children.length) nodeList.push(this.children[index]);
    return nodeList;
}


/////////////////////////////////////////////////////////////////////
// 範囲選択用メソッド
/////////////////////////////////////////////////////////////////////

// ---- node[] 指定された２つのノードを基準として、選択されるべきノードのリストを取得します。
// テーブル、行列以外のレイアウト系要素の場合、レイアウト要素そのものが取得される。
BracketBaseClass.prototype.getSelectedNodeList = function(start, end) {
	// ２つの要素の系列を遡り、本オブジェクトのセルに変換します
	while (start.parentNode !== this) start = start.parentNode;
	while (end.parentNode !== this) end = end.parentNode;

	// ２つのセルのchildren上での位置を取得します
	var startPos = DataClass.getNodeIndex(start, this.children);
	var endPos = DataClass.getNodeIndex(end, this.children);

	// セル位置の正規化を行います
	if (startPos > endPos) {
		var tempPos = startPos;
		startPos = endPos;
		endPos = tempPos;
	}

	// 矩形選択時に選択されるべきセルを取得します
	var nodeList = [];
	for (var indexCounter = startPos; indexCounter <= endPos; indexCounter++) {
		nodeList.push(this.children[indexCounter]);
	};

	return nodeList;
};


/////////////////////////////////////////////////////////////////////
// データプロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * 行数を取得します
 */
Object.defineProperty(BracketBaseClass.prototype, 'rowCount', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.children.length;
	},
});

/**
 * 列数を取得します
 */
Object.defineProperty(BracketBaseClass.prototype, 'colCount', {
	enumerable: true,
	configurable: true,
	get: function(){
		return 1;
	},
});



/////////////////////////////////////////////////////////////////////
// 書式プロパティ
/////////////////////////////////////////////////////////////////////

/**
 * ital プロパティ：読み書き可
 */
Object.defineProperty(BracketBaseClass.prototype, 'ital', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

/**
 * ut プロパティ：読み書き可
 * 立体設定。アルファベットを立体にしたい時に指定する。省略可。
 */
Object.defineProperty(BracketBaseClass.prototype, 'ut', {
	enumerable  : true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

/**
 * bold プロパティ：読み書き可
 */
Object.defineProperty(BracketBaseClass.prototype, 'bold', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

/**
 * font プロパティ：読み書き可
 */
Object.defineProperty(BracketBaseClass.prototype, 'font', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

// ------------- 打消線属性を有効/無効化します。
Object.defineProperty(BracketBaseClass.prototype, 'strk', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

// ------------- 上付き属性を有効/無効化します。
Object.defineProperty(BracketBaseClass.prototype, 'sup', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});

// ------------- 下付き属性を有効/無効化します。
Object.defineProperty(BracketBaseClass.prototype, 'sub', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){},
});



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////

// 基底 LayoutBaseClass のままで良いので、何も書きません。



/////////////////////////////////////////////////////////////////////
// 話者設定メソッド
/////////////////////////////////////////////////////////////////////
BracketBaseClass.prototype.mutableSpeaker = false; // table は、false にすること



/////////////////////////////////////////////////////////////////////
// 無音範囲設定メソッド
/////////////////////////////////////////////////////////////////////
BracketBaseClass.prototype.mutableSilence = false; // Table は false
