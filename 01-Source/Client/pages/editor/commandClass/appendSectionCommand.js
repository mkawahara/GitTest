/**
 * セクション追加コマンドクラスです。Undo, Redoメソッドを実装します。
 * index:挿入先セクションのインデックスです。新規セクションは、index の後ろに追加されます。
 */
var AppendSection = function(indexArr, currentIndex) {
	// インデックス情報です。
	this.indexArr     = indexArr;
	this.currentIndex = currentIndex;
	// 追加されたセクションノードのインデックスです。
	this.newIndex    = null; // 結果的に使用していません
	// Undo, Redo で使用する削除されたセクションノードです。
	this.node;
};

/**
 * Command基底クラスを継承します。
 */
AppendSection.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
AppendSection.prototype.execute = function() {
	// セクションを追加します。
	var newIndex = IndexEditor.appendSection(this.currentIndex);
	if (newIndex === null) return false;
	this.newIndex    = newIndex;  // 結果的に使用していません
	// 成否を返します。
	return true;
};

/**
 * undo()をオーバーライドします。
 */
AppendSection.prototype.undo = function() {
	// セクションを削除します。
	this.node = IndexEditor.appendSectionUndo(this.currentIndex, this.indexArr);
};

/**
 * redo()をオーバーライドします。
 */
AppendSection.prototype.redo = function() {
	// セクションを追加します。
	IndexEditor.appendSectionRaw(this.currentIndex, this.node);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
AppendSection.prototype.getMemCost = function() {
	return 1;
};