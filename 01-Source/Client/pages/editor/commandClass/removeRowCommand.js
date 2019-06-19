/**
 * テーブルのい行削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var RemoveRowCommand = function(caretId) {
	// ドキュメントの参照を取得します。
	// 範囲選択リストを取得します。
	this.caretId = caretId;
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = TableEditor.prepareRemoveRow(this.caretId);
	// this.prepData.caretId          操作前のキャレット ID
	// this.prepData.curRowIndex      削除される行のインデックス
	// this.prepData.ctdNode          対象 CTD ノード
	// this.prepData.tableNode        対象 テーブルノード
	// this.prepData.moveDirection    キャレット移動方向 (Undo 時は、反対方向へ行を追加)
	// this.prepData.undoBaseNode     Undo 時の挿入基準となる CTD ノード
	// this.prepData.postCaretId      操作後のキャレットノード ID
	// this.prepData.targetParagraph  対象段落ノード
	// this.prepData.nodeList         Undo 用選択範囲

};

/**
 * Command基底クラスを継承します。
 */
RemoveRowCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
RemoveRowCommand.prototype.execute = function() {
	if (this.prepData === null) return false;

	this.removedNodeList = this.redo(); // 1 行削除を実行します。
	return true;
};

/**
 * undo()をオーバーライドします。
 */
RemoveRowCommand.prototype.undo = function() {
	var baseNodeId = this.prepData.undoBaseNode.id;    // 挿入基準の CTDノード ID
	var isBefore   = this.prepData.moveDirection == 1; // カーソルが下に動いたのなら、前へ行を挿入
	var tableNode  = this.prepData.tableNode;          // テーブルノード
	TableEditor.insertRow(baseNodeId, isBefore, this.removedNodeList, tableNode);

	// ---- Undo 時には、必要に応じて選択範囲の復元を行います。
	var nodeList = this.prepData.nodeList;
	if (nodeList !== null) {
		if (this.prepData.nodeList.length) {
			EditManager.getSelectedRangeManager().reconfigureSelectedNode(this.prepData.nodeList);
		}
	}

	// キャレットを移動します。
	ViewManager.getSelectionUpdater().setCaretPostion(this.prepData.caretId); // カーソル移動
	ViewManager.getRenderer().setCaretPos(null, this.prepData.caretId);       // レンダラへカーソル移動登録

	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(this.prepData.targetParagraph);
};

/**
 * redo()をオーバーライドします。
 */
RemoveRowCommand.prototype.redo = function() {
	var result = TableEditor.removeRow(this.prepData.ctdNode);

	// ---- 選択範囲を解除します。
	EditManager.getSelectedRangeManager().clearSelectedRange();

	// キャレットを移動します。
	ViewManager.getSelectionUpdater().setCaretPostion(this.prepData.postCaretId); // カーソル移動
	ViewManager.getRenderer().setCaretPos(null, this.prepData.postCaretId);       // レンダラへカーソル移動登録
	
	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(this.prepData.targetParagraph);

	return result;
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
RemoveRowCommand.prototype.getMemCost = function() {
	return 1;
};
