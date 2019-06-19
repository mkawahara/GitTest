/**
 * イタリック体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * italicFlag:削除方向。trueの場合、指定ノードの兄ノードが削除されます。
 */
var ItalicCommand = function(nodeList, italicFlag) {
	// ドキュメントの参照を取得します。
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// 太字指定フラグを取得します。
	this.italicFlag = italicFlag;
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = StatusEditor.prepareSetItalic(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
ItalicCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
ItalicCommand.prototype.execute = function() {

	var obj = StatusEditor.setItalic(this.nodeList, this.italicFlag, this.prepData);
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
ItalicCommand.prototype.undo = function() {
	StatusEditor.setItalic(this.nodeList, null, this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
ItalicCommand.prototype.redo = function() {
	StatusEditor.setItalic(this.nodeList, this.italicFlag, this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
ItalicCommand.prototype.getMemCost = function() {
	return 1;
};
