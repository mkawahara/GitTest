/**
 * 段落削除コマンドクラスです。Undo, Redoメソッドを実装します。
	target:削除対象の段落。
 */
var DeleteParagraphCommand = function(target) {

	// 削除段落インスタンスへの参照です。
	this.target = target;
	this.nextParagraph = target.nextSibling;
	this.parentSection = target.parentNode;
};

/**
 * Command基底クラスを継承します。
 */
DeleteParagraphCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
DeleteParagraphCommand.prototype.execute = function() {

	// 段落を削除します。
	var result = TextEditor.deleteParagraph(this.target);
	if (result === null) return false;
	return true;
};

/**
 * undo()をオーバーライドします。
 */
DeleteParagraphCommand.prototype.undo = function() {
	TextEditor.undoDeleteParagraph(this.target, this.nextParagraph, this.parentSection);
};

/**
 * redo()をオーバーライドします。
 */
DeleteParagraphCommand.prototype.redo = function() {
	// 段落を結合します。
	TextEditor.deleteParagraph(this.target);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
DeleteParagraphCommand.prototype.getMemCost = function() {
	return 1;
};
