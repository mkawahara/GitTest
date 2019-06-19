/**
 * セクション追加コマンドクラスです。Undo, Redoメソッドを実装します。
 * indexArr:削除するセクションのインデックス配列です。
 */
var RemoveSection = function(indexArr, currentIndex) {
	// インデックス情報です。
	this.indexArr     = indexArr;
	this.currentIndex = currentIndex;
	// 削除されたセクションのノードインスタンスです。
	this.nodes    = null;
	this.diffList = null;

};

/**
 * Command基底クラスを継承します。
 */
RemoveSection.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
RemoveSection.prototype.execute = function() {
	// セクションを追加します。
	var result = IndexEditor.removeSection(this.indexArr);
	if (result === null) return false;
	this.nodes    = result.nodes;
	this.diffList = result.diffList;
	// 成否を返します。
	return true;
};

/**
 * undo()をオーバーライドします。
 */
RemoveSection.prototype.undo = function() {
	// セクションを追加します。
	IndexEditor.removeSectionUndo(this.indexArr, this.nodes, this.currentIndex, this.diffList);
};

/**
 * redo()をオーバーライドします。
 */
RemoveSection.prototype.redo = function() {
	// セクションを削除します。
	IndexEditor.removeSectionRaw(this.indexArr, this.diffList);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
RemoveSection.prototype.getMemCost = function() {
	return 1;
};