/**
 * 範囲削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * caret : キャレット
 */
var RemoveMultiNodeCommand = function(caret) {
	// ドキュメントの参照を取得します。
	this.caret       = caret;
	// 該当段落リストと、操作対象リストを取得します。
	this.prepData    = RangedEditor.prepareRemoveMultiNode(this.caret);
	this.isDeletable = (this.prepData !== null); // 範囲削除可能かどうか
	this.nextId      = (this.prepData !== null) ? this.prepData.postCaretId : caret.pos;
};

/**
 * Command基底クラスを継承します。
 */
RemoveMultiNodeCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
RemoveMultiNodeCommand.prototype.execute = function() {
	if (this.prepData === null) return false;
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
RemoveMultiNodeCommand.prototype.undo = function() {
	RangedEditor.undoRemoveMultiNode(this.prepData);

	// ---- 範囲選択再設定
	EditManager.getSelectedRangeManager().reconfigureSelectedNode(this.prepData.nodeList);

	// キャレットを移動します。
	ViewManager.getSelectionUpdater().setCaretPostion(this.prepData.caretId); // カーソル移動
	ViewManager.getRenderer().setCaretPos(null, this.prepData.caretId);       // レンダラへカーソル移動登録
};

/**
 * redo()をオーバーライドします。
 */
RemoveMultiNodeCommand.prototype.redo = function() {
	// ---- 範囲選択解除
//	EditManager.getSelectedRangeManager().clearSelectedRange();
	RangedEditor.removeMultiNode(this.prepData);
	
	// ---- 範囲選択解除
	EditManager.getSelectedRangeManager().clearSelectedRange(true);

	// キャレットを移動します。
	ViewManager.getSelectionUpdater().setCaretPostion(this.prepData.postCaretId); // カーソル移動
	ViewManager.getRenderer().setCaretPos(null, this.prepData.postCaretId);       // レンダラへカーソル移動登録
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
RemoveMultiNodeCommand.prototype.getMemCost = function() {
	// 選択範囲のノード数により変動：イメージを含むならその分も加算
	return this.prepData.stackCost;
};
