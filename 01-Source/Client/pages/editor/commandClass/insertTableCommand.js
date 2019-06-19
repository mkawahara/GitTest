/**
 * 囲み枠指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * borderType: 囲み枠タイプ null 囲み枠なし
 *           BORDER_TYPE.normal 標準の枠
 *                       double 二重線の枠
 *                       round  角の丸い枠
 *                       bround 太い角の丸い枠
 *                       shadow 影のある枠
 *                       circle 丸囲み枠
 */
var InsertTableCommand = function(colCount, rowCount, caretId, itemStatus) {
	// 範囲選択リストを取得します。
	this.colCount   = colCount;   // 列数
	this.rowCount   = rowCount;   // 行数
	this.caretId    = caretId;    // キャレット位置のノード ID
	this.itemStatus = itemStatus; // 状態
	
	// 準備
//	var prepData = TableEditor.prepareInsertTable(this.colCount, this.rowCount, this.caretId, this.itemStatus);
	this.prepData = TableEditor.prepareInsertTable(this.colCount, this.rowCount, this.caretId, this.itemStatus);
//	this.tableNode = null;
//	this.baseNode  = null;
//	if (prepData !== null) {
//		this.tableNode = prepData.tableNode;
//		this.baseNode = prepData.baseNode;
//	}
};

/**
 * Command基底クラスを継承します。
 */
InsertTableCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
InsertTableCommand.prototype.execute = function() {
//	if (this.tableNode === null) return false;
	if (this.prepData === null) return false;
	
//	TableEditor.insertTable(this.tableNode, this.baseNode);
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
InsertTableCommand.prototype.undo = function() {
	var renderer = ViewManager.getRenderer();

	TableEditor.insertTable(this.prepData.tableNode, this.prepData.baseNode, true);

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
InsertTableCommand.prototype.redo = function() {
	var renderer = ViewManager.getRenderer();

	TableEditor.insertTable(this.prepData.tableNode, this.prepData.baseNode);

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
InsertTableCommand.prototype.getMemCost = function() {
	return 1;
};



