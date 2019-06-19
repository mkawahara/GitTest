/**
 * 画像挿入コマンドクラスです。Undo, Redoメソッドを実装します。
 * id:挿入先ノードのIDです。
 * data:挿入される画像の base64 データです。
 */

// ---- コンストラクタを書き換えます。。
var InsertImageCommand = function(doc, id, data) {
	this.doc = doc;
	// 挿入先ノードidを取得します。
	this.id = id;
	// 作成するノードのステータス情報です。
	this.itemStatus = undefined;
	// カーソル初期位置のデータノードIDです。
	this.defaultCursorPos = null;

	// ノードを作成します。
	var imageNode = NodeCreator.createImageNode(data);
//	imageNode.setAttribute('width', 50);

//	imageNode.setAttribute('height', 50 * this.imgObject.height / this.imgObject.width);

	this.node = imageNode;

	InsertImageCommand._lastObject = this;
};

// ---- InsertCharCommand を継承します。
InsertImageCommand.prototype = Object.create(InsertCharCommand.prototype);

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
InsertImageCommand.prototype.getMemCost = function() {
	return 50;
};
