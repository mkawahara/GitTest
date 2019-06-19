/**
 * 段落連結コマンドクラスです。Undo, Redoメソッドを実装します。
 * indexArr:選択セクションのインデックス番号配列
 * currentIndex:カレントセクションのインデックス番号
 */
var CombineSection = function(indexArr, currentIndex) {
	// 選択セクションのインデックス番号配列出です（小さい順でソート済み）
	this.indexArr     = indexArr;
	// カレントセクションのインデックス番号です。
	this.currentIndex = currentIndex;
	// Undo / Redo 用情報です。
	this.sectionArr   = null; // 先頭段落参照リスト
	this.diffList     = null; // 深度調整リスト
};

/**
 * Command基底クラスを継承します。
 */
CombineSection.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
CombineSection.prototype.execute = function() {
	// 段落を分割します。
	var result = IndexEditor.combineSection(this.indexArr);
	if (result === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.sectionArr = result.sectionArr; // 先頭段落参照リスト
		this.diffList   = result.diffList;   // 深度調整リスト
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
CombineSection.prototype.undo = function() {
	// 段落結合を Undo します。
	IndexEditor.combineSectionUndo(this.indexArr, this.currentIndex, this.diffList, this.sectionArr);
};

/**
 * redo()をオーバーライドします。
 */
CombineSection.prototype.redo = function() {
	// 段落を結合します。
	IndexEditor.combineSectionRaw(this.indexArr, this.diffList);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
CombineSection.prototype.getMemCost = function() {
	return 1;
};
