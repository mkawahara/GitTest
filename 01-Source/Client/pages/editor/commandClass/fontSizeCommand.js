/**
 * 段落のフォントサイズ変更コマンドです。Undo, Redoメソッドを実装します。
 * fontSize : フォントサイズ
 * caret    : キャレット
 */
var FontSizeCommand = function(fontSize, caret) {
	this.fontSize = fontSize;
	this.caret    = caret;

	// 範囲選択状態の復帰用オブジェクト
	this.srObj = new SelectedRangeUtility();
	// フォントサイズ設定の準備
	this.prepData = StatusEditor.prepareSetFontSize(this.fontSize, this.caret);
};

/**
 * Command基底クラスを継承します。
 */
FontSizeCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
FontSizeCommand.prototype.execute = function() {
	if (this.prepData === null) return false;
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
FontSizeCommand.prototype.undo = function() {
	StatusEditor.setFontSize(null, this.prepData);
	this.srObj.undo();                             // 範囲選択の Undo
};

/**
 * redo()をオーバーライドします。
 */
FontSizeCommand.prototype.redo = function() {
	StatusEditor.setFontSize(this.fontSize, this.prepData);
	this.srObj.redo();                             // 範囲選択の Redo
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
FontSizeCommand.prototype.getMemCost = function() {
	return 1;
};
