/**
 * フレーズ分割挿入コマンドです。Undo, Redoメソッドを実装します。
 */
var InsertHighlightCtrlCommand = function(caret) {
	this.caret = caret;
	this.prepData = TextEditor.prepareHighlightCtrl(caret);

	this.comObj = new CommandExecutor(1000);              // ローカルスタックを作成します。
};

/**
 * Command基底クラスを継承します。
 */
InsertHighlightCtrlCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
InsertHighlightCtrlCommand.prototype.execute = function() {
	if (this.prepData === null) return false;

	this.removeObj = new RemoveMultiNodeCommand(this.caret);
	if (this.removeObj.isDeletable) this.comObj.execute(this.removeObj);

	TextEditor.insertHighlightCtrl(this.prepData, false);
	return true;
};

/**
 * undo()をオーバーライドします。
 */
InsertHighlightCtrlCommand.prototype.undo = function() {
	TextEditor.insertHighlightCtrl(this.prepData, true);

	// ---- 範囲削除を Undo します。
	if (this.removeObj.isDeletable)  this.comObj.undo();
};

/**
 * redo()をオーバーライドします。
 */
InsertHighlightCtrlCommand.prototype.redo = function() {
	// ---- 範囲削除を Redo します。
	if (this.removeObj.isDeletable ) this.comObj.redo();

	TextEditor.insertHighlightCtrl(this.prepData, false);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
InsertHighlightCtrlCommand.prototype.getMemCost = function() {
	return 1;
};



