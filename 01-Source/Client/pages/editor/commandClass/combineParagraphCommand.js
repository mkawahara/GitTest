/**
 * 段落結合コマンドクラスです。Undo, Redoメソッドを実装します。
	target:結合対象となる段落。
	appendPara:結合するべき段落。
 */
var CombineParagraphCommand = function(target, appendPara) {

	this.prepData = TextEditor.prepareCombineParagraph(target, appendPara);
};

/**
 * Command基底クラスを継承します。
 */
CombineParagraphCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
CombineParagraphCommand.prototype.execute = function() {
	// 段落を結合します。
	TextEditor.combineParagraph(this.prepData);
	if (this.prepData.removedNode === null) return false;
	return true;
};

/**
 * undo()をオーバーライドします。
 */
CombineParagraphCommand.prototype.undo = function() {
	// 段落を分割します。
	TextEditor.divideParagraph(this.prepData.target, this.prepData.pos, this.prepData.removedNode,
		this.prepData.appendPara);
	// 改ページ対応
	TextEditor.undoCombineParagraph(this.prepData);
};

/**
 * redo()をオーバーライドします。
 */
CombineParagraphCommand.prototype.redo = function() {
	// 段落を結合します。
	TextEditor.combineParagraph(this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
CombineParagraphCommand.prototype.getMemCost = function() {
	return 1;
};
