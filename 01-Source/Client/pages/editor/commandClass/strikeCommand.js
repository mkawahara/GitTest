/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * align: アライン種別
 * selectFlag: true = 選択範囲有り, false = 選択範囲無し
 */
var StrikeCommand = function(nodeList, strikeFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// アライン種別を取得します。
	this.strikeFlag = strikeFlag
	
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = StatusEditor.prepareSetStrike(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
StrikeCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
StrikeCommand.prototype.execute = function() {

	var obj = StatusEditor.setStrike(this.nodeList, this.strikeFlag, this.prepData);
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
StrikeCommand.prototype.undo = function() {
	StatusEditor.setStrike(this.nodeList, null, this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
StrikeCommand.prototype.redo = function() {
	StatusEditor.setStrike(this.nodeList, this.strikeFlag, this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
StrikeCommand.prototype.getMemCost = function() {
	return 1;
};
