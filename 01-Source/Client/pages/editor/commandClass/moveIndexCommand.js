/**
 * セクション上下移動コマンドクラスです。Undo, Redoメソッドを実装します。
	indexArr:操作するセクションのインデックス番号を格納した配列
	currentIndex:カレントセクションインデックス番号
	distance:上下移動方向。正の数で下へ、負の数で上へ移動します。
 */
var MoveIndexCommand = function(indexArr, currentIndex, distance) {
	// 対象セクションのインデックス配列です。
	this.indexArr = indexArr;
	// カレントセクションのインデックス番号
	this.currentIndex = currentIndex;
	// セクションを上下移動する量です。
	this.distance = distance;
	// 深度シフト情報
	this.diffList = null;
};

/**
 * Command基底クラスを継承します。
 */
MoveIndexCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
MoveIndexCommand.prototype.execute = function() {
	// セクションを上下移動します。
	var result = IndexEditor.moveSections(this.indexArr, this.currentIndex, null, this.distance);

	if (result === null) {
		// 戻り値が null の場合 false を返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.indexArr     = result.indexArr;     // 選択されているセクションのインデックス番号配列
		this.currentIndex = result.currentIndex; // カレントセクションのインデックス番号
		this.diffList     = result.diffList;
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
MoveIndexCommand.prototype.undo = function() {
	// 深度変更を undo します。
	var result = IndexEditor.moveSectionsUndo(this.indexArr, this.currentIndex, this.diffList, this.distance);
	this.indexArr     = result.indexArr;     // 選択されているセクションのインデックス番号配列
	this.currentIndex = result.currentIndex; // カレントセクションのインデックス番号
};

/**
 * redo()をオーバーライドします。
 */
MoveIndexCommand.prototype.redo = function() {
	// 深度変更を redo します。
	var result = IndexEditor.moveSectionsRaw(this.indexArr, this.currentIndex, this.diffList, this.distance);
	this.indexArr     = result.indexArr;     // 選択されているセクションのインデックス番号配列
	this.currentIndex = result.currentIndex; // カレントセクションのインデックス番号
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
MoveIndexCommand.prototype.getMemCost = function() {
	return 1;
};
