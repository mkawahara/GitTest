/**
 * 1文字削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * id:削除対象ノードのIDです。
 * isPrevious:削除方向。trueの場合、指定ノードの兄ノードが削除されます。
 */
var InsertMultiNodeCommand = function(prevsize, nodeList, caret) {
	this.prevsize  = prevsize;
	this.nodeList  = nodeList.concat();
	this.caret     = caret;
	this.prepData  = RangedEditor.prepareInsertMulti(this.prevsize, this.nodeList, this.caret);
	this.isInsertable = (this.prepData !== null);
};

/**
 * Command基底クラスを継承します。
 */
InsertMultiNodeCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
InsertMultiNodeCommand.prototype.execute = function() {
	if (this.prepData === null) return false;
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
InsertMultiNodeCommand.prototype.undo = function() {
//	RangedEditor.UndoInsertMultiParagraph(this.prepData);
	RangedEditor.UndoInsertMultiNode(this.prepData);
	// キャレット ID は変化しません。

};

/**
 * redo()をオーバーライドします。
 */
InsertMultiNodeCommand.prototype.redo = function() {
	RangedEditor.insertMultiNode(this.prepData);
	// キャレット ID は変化しません。
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
InsertMultiNodeCommand.prototype.getMemCost = function() {
	// 選択範囲のノード数により変動：イメージを含むならその分も加算
	return this.stackCost;
};
