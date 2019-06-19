/**
 * 段落分割コマンドクラスです。Undo, Redoメソッドを実装します。
 * indexArr:選択セクションのインデックス番号配列
 * currentIndex:カレントセクションのインデックス番号
 * dividePos:対象段落上での分割位置を表すノードID
*/
var DivideSection = function(indexArr, currentIndex, dividePos) {
	// 選択セクションのインデックス番号配列出です（小さい順でソート済み）
	this.indexArr     = indexArr;
	// カレントセクションのインデックス番号です。
	this.currentIndex = currentIndex;
	// 分割先頭位置にある段落子要素の id です。
	this.dividePos     = dividePos;
	// Undo / Redo 用 追加情報です。
	this.srcSection     = null; // 分割元セクションノード
	this.destSection    = null; // 分割先セクションノード
	this.baseParaNode   = null; // 移動基準位置の段落ノード
	this.simpleParaNode = null; // 改行のみの段落ノード (null 時は不要)
};


/**
 * Command基底クラスを継承します。
 */
DivideSection.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
DivideSection.prototype.execute = function() {
	// セクションを分割します。
	// indexArr, currentIndex, dividePos, section, paragraph, paraFlag;
	result = IndexEditor.divideSection(this.indexArr, this.currentIndex, this.dividePos);

	if (result === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.srcSection     = result.srcSection;     // 分割元セクションノード
		this.destSection    = result.destSection;    // 分割先セクションノード
		this.baseParaNode   = result.baseParaNode;   // 移動基準位置の段落ノード
		this.simpleParaNode = result.simpleParaNode; // 改行のみの段落ノード (null 時は不要)
		
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
DivideSection.prototype.undo = function() {
	// セクション分割を Undo します。
	var result = IndexEditor.divideSectionUndo(
		this.indexArr, this.currentIndex, this.dividePos, this.srcSection, this.destSection, this.simpleParaNode);
};

/**
 * redo()をオーバーライドします。
 */
DivideSection.prototype.redo = function() {
	// セクションを分割します。
	IndexEditor.divideSectionRaw(
		this.currentIndex, this.srcSection, this.destSection, this.baseParaNode, this.simpleParaNode);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
DivideSection.prototype.getMemCost = function() {
	return 1;
};
