/**
 * テーブルのい行削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var ReplaceCommand = function(nodeList, caret) {
	console.log('Replace!');
	this.caret    = caret;
	this.nodeList = nodeList;

	this.prepData = RangedEditor.prepareReplace(this.nodeList, this.caret);

	// ---- ローカルスタックを作成します。
	this.comObj = new CommandExecutor(1000);
};

/**
 * Command基底クラスを継承します。
 */
ReplaceCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
ReplaceCommand.prototype.execute = function() {
	if (this.prepData === null) return false;

	// ---- 範囲削除を行います。実行後、キャレットは、基準位置へ移動しています。
	this.removeObj = new RemoveMultiNodeCommand(this.caret);
	if (this.removeObj.isDeletable) this.comObj.execute(this.removeObj);

	// ---- 複数挿入を行います。
	// 複数挿入の準備段階で、フォーマッタを使用します。
	this.insertObj = new InsertMultiNodeCommand(this.prepData.prevsize, this.prepData.nodeList, this.caret);
	if (this.insertObj.isInsertable) this.comObj.execute(this.insertObj);

	return true;
};

/**
 * undo()をオーバーライドします。
 */
ReplaceCommand.prototype.undo = function() {
	// ---- 複数挿入を Undo します。
	if (this.insertObj.isInsertable) this.comObj.undo();
	// ---- 範囲削除を Undo します。
	if (this.removeObj.isDeletable)  this.comObj.undo();
};

/**
 * redo()をオーバーライドします。
 */
ReplaceCommand.prototype.redo = function() {
	// ---- 範囲削除を Redo します。
	if (this.removeObj.isDeletable ) this.comObj.redo();

	// ---- 複数挿入を Redo します。
	if (this.insertObj.isInsertable) this.comObj.redo();
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
ReplaceCommand.prototype.getMemCost = function() {
//	return this.prepData.stackCost;
	return 1;
};
