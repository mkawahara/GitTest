/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * align: アライン種別
 * selectFlag: true = 選択範囲有り, false = 選択範囲無し
 */
var UnderLineCommand = function(nodeList, ulineFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// アライン種別を取得します。
	this.ulineFlag = ulineFlag
	
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = StatusEditor.prepareSetULine(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
UnderLineCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
UnderLineCommand.prototype.execute = function() {

	var obj = StatusEditor.setULine(this.nodeList, this.ulineFlag, this.prepData);
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
UnderLineCommand.prototype.undo = function() {
	StatusEditor.setULine(this.nodeList, null, this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
UnderLineCommand.prototype.redo = function() {
	StatusEditor.setULine(this.nodeList, this.ulineFlag, this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
UnderLineCommand.prototype.getMemCost = function() {
	return 1;
};
