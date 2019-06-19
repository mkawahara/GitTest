/**
 * テーブルのい行削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var InsertColCommand = function(caretId, isBefore) {
	// ドキュメントの参照を取得します。
	// 範囲選択リストを取得します。
	this.caretId  = caretId;
	// 新しい行を前の行に挿入するなら true
	this.isBefore = isBefore;
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = TableEditor.prepareInsertCol(this.caretId);
};

/**
 * Command基底クラスを継承します。
 */
InsertColCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
InsertColCommand.prototype.execute = function() {
	if (this.prepData === null) return false;

	this.redo(); // 1 行挿入を実行します。
	return true;
};

/**
 * undo()をオーバーライドします。
 */
InsertColCommand.prototype.undo = function() {
	TableEditor.removeCol(this.prepData.newCellList[0]);

	// キャレットを移動します。
	ViewManager.getSelectionUpdater().setCaretPostion(this.prepData.caretId); // カーソル移動
	ViewManager.getRenderer().setCaretPos(null, this.prepData.caretId);       // レンダラへカーソル移動登録

	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(this.prepData.targetParagraph);
};

/**
 * redo()をオーバーライドします。
 */
InsertColCommand.prototype.redo = function() {
	var renderer = ViewManager.getRenderer();

	var baseNodeId  = this.prepData.ctdNode.id;  // 挿入基準の CTDノード ID
	var newCellList = this.prepData.newCellList; // 挿入する CTD ノードリスト
	var tableNode   = this.prepData.tableNode;   // テーブルノード
	TableEditor.insertCol(baseNodeId, this.isBefore, newCellList, tableNode);

	// ---- 選択範囲を解除します。
	EditManager.getSelectedRangeManager().clearSelectedRange();

	// キャレットを移動します。
	ViewManager.getSelectionUpdater().setCaretPostion(this.prepData.postCaretId); // カーソル移動
	renderer.setCaretPos(null, this.prepData.postCaretId);       // レンダラへカーソル移動登録
	
	// ---- レンダラへ段落変更を通知
	renderer.setUpdatedParagraph(this.prepData.targetParagraph);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
InsertColCommand.prototype.getMemCost = function() {
	return 1;
};
