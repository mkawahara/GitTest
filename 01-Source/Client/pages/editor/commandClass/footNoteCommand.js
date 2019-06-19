/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * align: アライン種別
 * selectFlag: true = 選択範囲有り, false = 選択範囲無し
 */
var FootNoteCommand = function(nodeList, footNoteType) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// アライン種別を取得します。
	this.footNoteType = footNoteType
	
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = StatusEditor.prepareSetFootNote(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
FootNoteCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
FootNoteCommand.prototype.execute = function() {

	var obj = StatusEditor.setFootNote(this.nodeList, this.footNoteType, this.prepData);
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
FootNoteCommand.prototype.undo = function() {
	StatusEditor.setFootNote(this.nodeList, null, this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
FootNoteCommand.prototype.redo = function() {
	StatusEditor.setFootNote(this.nodeList, this.footNoteType, this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
FootNoteCommand.prototype.getMemCost = function() {
	return 1;
};
