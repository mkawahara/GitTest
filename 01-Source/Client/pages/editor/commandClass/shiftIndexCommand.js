/**
 * セクションシフトコマンドクラスです。Undo, Redoメソッドを実装します。
	indexArr:操作するセクションのインデックス番号を格納した配列
	distance:シフト方向。正の数で右に、負の数で左にシフトします。
 */
var ShiftIndexCommand = function(indexArr, distance) {
	// 対象セクションのインデックス配列です。
	this.indexArr = indexArr;
	// セクションをシフトする量です。
	this.distance = distance;
	// インデックスと深度差分値の対応を格納した配列です。
	this.diffList = null;
};

/**
 * Command基底クラスを継承します。
 */
ShiftIndexCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
ShiftIndexCommand.prototype.execute = function() {
	// セクションをシフトします。
	var diffList = IndexEditor.shiftIndexDepth (this.indexArr, this.distance);

	if (diffList === null) {
		// 戻り値が null の場合 false を返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.diffList = diffList;
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
ShiftIndexCommand.prototype.undo = function() {
	// 深度変更を undo します。
	IndexEditor.multiShift(this.diffList, -1);

};

/**
 * redo()をオーバーライドします。
 */
ShiftIndexCommand.prototype.redo = function() {
	// 深度変更を redo します。
	IndexEditor.multiShift(this.diffList);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
ShiftIndexCommand.prototype.getMemCost = function() {
	return 1;
};
