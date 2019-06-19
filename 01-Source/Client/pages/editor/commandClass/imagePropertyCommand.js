/**
 * 囲み枠指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * imageNode:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * propertyJson: 画像プロパティ
 *             .id     : 画像ノードの ID
 *             .width  : 画像の幅
 *             .height : 画像の高さ
 *             .title  : 画像のタイトル
 *             .alt    : 画像の代替えテキスト
 *             .read   : 読み文字列
 */
var ImagePropertyCommand = function(imageNode, propertyJson) {
	// 範囲選択リストを取得します。
	this.imageNode = imageNode;
	// 設定項目を取得します。
	this.newProperty = {};
	this.newProperty.width  = propertyJson.width;
	this.newProperty.height = propertyJson.height;
	this.newProperty.title  = propertyJson.title;
	this.newProperty.alt    = propertyJson.alt;
	this.newProperty.read   = propertyJson.read;
	
	// 該当段落リストと、操作対象リストを取得します。
	var prepData = TextEditor.prepareImageProperty(this.imageNode, this.newProperty);
	this.targetParagraph = prepData.targetParagraph;
	this.oldProperty     = prepData.oldProperty
};

/**
 * Command基底クラスを継承します。
 */
ImagePropertyCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
ImagePropertyCommand.prototype.execute = function() {
	var obj = TextEditor.setImageProperty(this.imageNode, this.newProperty, this.targetParagraph);
	if (obj === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
ImagePropertyCommand.prototype.undo = function() {
	TextEditor.setImageProperty(this.imageNode, this.oldProperty, this.targetParagraph);
};

/**
 * redo()をオーバーライドします。
 */
ImagePropertyCommand.prototype.redo = function() {
	TextEditor.setImageProperty(this.imageNode, this.newProperty, this.targetParagraph);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
ImagePropertyCommand.prototype.getMemCost = function() {
	return 1;
};



