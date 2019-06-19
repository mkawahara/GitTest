/**
 * テーブルのい行削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var PageNumberCommand = function(caret) {
	this.caret    = caret;
	this.srObj    = new SelectedRangeUtility();                 // 範囲選択状態の復帰用オブジェクト
	this.prepData = StatusEditor.preparePageNumber(this.caret);
};

/**
 * Command基底クラスを継承します。
 */
PageNumberCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
PageNumberCommand.prototype.execute = function() {
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
PageNumberCommand.prototype.undo = function() {
	var targetParagraph    = this.prepData.targetParagraph;          // 対象段落
	var originalPageNumber = this.prepData.originalPageNumber;       // もともとのページ番号属性値
	StatusEditor.setPageNumber(targetParagraph, originalPageNumber); // ページ番号属性設定
	this.srObj.undo();                             // 範囲選択の Undo
};

/**
 * redo()をオーバーライドします。
 */
PageNumberCommand.prototype.redo = function() {
	var targetParagraph   = this.prepData.targetParagraph;          // 対象段落
	var newPageNumberFlag = !(this.prepData.originalPageNumber);    // 新しいページ番号属性値
	StatusEditor.setPageNumber(targetParagraph, newPageNumberFlag); // ページ番号属性設定
	this.srObj.redo();                             // 範囲選択の Redo
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
PageNumberCommand.prototype.getMemCost = function() {
	return 1;
};
