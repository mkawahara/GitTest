/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * boldFlag: true = 太字, false = 太字解除
 */
var SilentCommand = function(caret) {
	this.caret      = caret;
	this.prepData   = StatusEditor.prepareSilent(caret);
};

/**
 * Command基底クラスを継承します。
 */
SilentCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
SilentCommand.prototype.execute = function() {

	if (this.prepData === null) return false;
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
SilentCommand.prototype.undo = function() {
	StatusEditor.setSilent(this.prepData, true);

};

/**
 * redo()をオーバーライドします。
 */
SilentCommand.prototype.redo = function() {
	StatusEditor.setSilent(this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
SilentCommand.prototype.getMemCost = function() {
	return 1;
};
