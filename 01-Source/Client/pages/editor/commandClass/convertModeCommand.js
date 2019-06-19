/**
 * テーブルのい行削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var ConvertModeCommand = function(inputMode, caret) {
	this.inputMode = inputMode;
	this.caret     = caret;

	this.prepData = StatusEditor.prepareConvertMode(this.inputMode, this.caret);

};

/**
 * Command基底クラスを継承します。
 */
ConvertModeCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
ConvertModeCommand.prototype.execute = function() {
	if (this.prepData === null) return false;
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
ConvertModeCommand.prototype.undo = function() {
	StatusEditor.convertMode(this.prepData, true);
};

/**
 * redo()をオーバーライドします。
 */
ConvertModeCommand.prototype.redo = function() {
	StatusEditor.convertMode(this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
ConvertModeCommand.prototype.getMemCost = function() {
	return 1;
};
