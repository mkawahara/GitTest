/**
 * ポーズ (LP/SP) 挿入コマンドです。Undo, Redoメソッドを実装します。
 */
var InsertPauseCommand = function(caret, isLong) {
	this.caret = caret;
	this.prepData = TextEditor.preparePause(caret, isLong);
	
	this.comObj = new CommandExecutor(1000);              // ローカルスタックを作成します。
};

/**
 * Command基底クラスを継承します。
 */
InsertPauseCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
InsertPauseCommand.prototype.execute = function() {
	if (this.prepData === null) return false;
	
	this.removeObj = new RemoveMultiNodeCommand(this.caret);
	if (this.removeObj.isDeletable) this.comObj.execute(this.removeObj);

	TextEditor.insertPause(this.prepData, false);
	return true;
};

/**
 * undo()をオーバーライドします。
 */
InsertPauseCommand.prototype.undo = function() {
	TextEditor.insertPause(this.prepData, true);
	
	// ---- 範囲削除を Undo します。
	if (this.removeObj.isDeletable)  this.comObj.undo();
};

/**
 * redo()をオーバーライドします。
 */
InsertPauseCommand.prototype.redo = function() {
	// ---- 範囲削除を Redo します。
	if (this.removeObj.isDeletable ) this.comObj.redo();

	TextEditor.insertPause(this.prepData, false);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
InsertPauseCommand.prototype.getMemCost = function() {
	return 1;
};



