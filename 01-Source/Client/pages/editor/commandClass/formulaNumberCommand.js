/**
 * 数式番号指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 */
var FormulaNumberCommand = function(nodeList, selectFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// 選択有り無しフラグがあったかなかったか
	this.selectFlag = selectFlag;

	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = TextEditor.prepareSetEqNumber(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
FormulaNumberCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
FormulaNumberCommand.prototype.execute = function() {
	var opeType = this.prepData.opeType;
	// ---- 準備段階で、実行すべき処理がないことがわかっている場合、false を返して Undo スタックへ登録しません。
	if (opeType == BOX_OPERATION.NONE) return false;

	var obj = TextEditor.setEqNumber(this.nodeList, this.prepData, this.selectFlag);
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
FormulaNumberCommand.prototype.undo = function() {
	TextEditor.setEqNumber(this.nodeList, this.prepData, this.selectFlag, true);
};

/**
 * redo()をオーバーライドします。
 */
FormulaNumberCommand.prototype.redo = function() {
	TextEditor.setEqNumber(this.nodeList, this.prepData, this.selectFlag);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
FormulaNumberCommand.prototype.getMemCost = function() {
	return 1;
};
