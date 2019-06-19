/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * align: アライン種別
 * selectFlag: true = 選択範囲有り, false = 選択範囲無し
 */
var AlignCommand = function(nodeList, align, selectFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// アライン種別を取得します。
	this.align = align;
	// 範囲選択有り無しフラグを取得します。：false の場合、範囲選択状態の復旧を行いません。
	this.selectFlag = selectFlag;
	
	// 該当段落リストと、操作対象リストを取得します。
//	this.prepData = TextEditor.prepareSetAlign(this.nodeList);
	this.prepData = StatusEditor.prepareSetAlign(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
AlignCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
AlignCommand.prototype.execute = function() {

//	var obj = TextEditor.setAlign(this.nodeList, this.align, this.selectFlag, this.prepData);
	var obj = StatusEditor.setAlign(this.nodeList, this.align, this.selectFlag, this.prepData);
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
AlignCommand.prototype.undo = function() {
//	TextEditor.setAlign(this.nodeList, null, this.selectFlag, this.prepData);
	StatusEditor.setAlign(this.nodeList, null, this.selectFlag, this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
AlignCommand.prototype.redo = function() {
//	TextEditor.setAlign(this.nodeList, this.align, this.selectFlag, this.prepData);
	StatusEditor.setAlign(this.nodeList, this.align, this.selectFlag, this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
AlignCommand.prototype.getMemCost = function() {
	return 1;
};
