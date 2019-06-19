/**
 * 1文字削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * id:削除対象ノードのIDです。
 * isPrevious:削除方向。trueの場合、指定ノードの兄ノードが削除されます。
 */
var RemoveNodeCommand = function(doc, id, isPrevious) {
	// ドキュメントの参照を取得します。
	this.doc         = doc;
	// 削除対象ノードidを取得します。
	this.id          = id;
	// 削除方向を取得します。
	this.isPrevious  = isPrevious;
	// 削除されたノードのインスタンスが格納される変数です。
	this.removedNode = null;
	// 削除されたノードの弟ノードです。
	this.nextId      = null;
};

/**
 * Command基底クラスを継承します。
 */
RemoveNodeCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
RemoveNodeCommand.prototype.execute = function() {
	// カレントセクションインデックスを取得
	this.currentSecIndex = IndexToolClass.getLatestSectionIndex();

	// 1文字削除します。
	var obj = TextEditor.removeNode(this.doc, this.id, this.isPrevious);
	if (obj === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.removedNode = obj.node;
		this.nextId = obj.id;
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
RemoveNodeCommand.prototype.undo = function() {
	// カレントセクションへ移動
	IndexToolClass.setLatestSectionIndex(this.currentSecIndex);
	IndexToolClass.setSelectedSectionIndex([this.currentSecIndex]);
	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
	// 1文字挿入します。
	TextEditor.insertChar(this.doc, this.nextId, this.removedNode);
};

/**
 * redo()をオーバーライドします。
 */
RemoveNodeCommand.prototype.redo = function() {
	// カレントセクションへ移動
	IndexToolClass.setLatestSectionIndex(this.currentSecIndex);
	IndexToolClass.setSelectedSectionIndex([this.currentSecIndex]);
	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
	// 1文字削除します。
	TextEditor.removeNode(this.doc, this.id, this.isPrevious);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
RemoveNodeCommand.prototype.getMemCost = function() {
	var nodeName = this.removedNode.nodeName;
	var costValue = 1;
	switch(nodeName) {
	case 'CIMG':
		costValue = 50;
		break;
	}
	
	return costValue;
};
