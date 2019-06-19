/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * boldFlag: true = 太字, false = 太字解除
 */
var BoldCommand = function(nodeList, boldFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// 太字指定フラグを取得します。
	this.boldFlag = boldFlag;
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = StatusEditor.prepareSetBold(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
BoldCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
BoldCommand.prototype.execute = function() {

	var obj = StatusEditor.setBold(this.nodeList, this.boldFlag, this.prepData);
	if (obj === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
BoldCommand.prototype.undo = function() {
	StatusEditor.setBold(this.nodeList, null, this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
BoldCommand.prototype.redo = function() {
	StatusEditor.setBold(this.nodeList, this.boldFlag, this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
BoldCommand.prototype.getMemCost = function() {
	return 1;
};
