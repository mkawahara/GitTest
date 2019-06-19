/**
 * ルビ指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * borderType: 囲み枠タイプ null 囲み枠なし
 *           BORDER_TYPE.normal 標準の枠
 *                       double 二重線の枠
 *                       round  角の丸い枠
 *                       bround 太い角の丸い枠
 *                       shadow 影のある枠
 *                       circle 丸囲み枠
 */
var RubyCommand = function(nodeList, ruby, selectFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// ルビ文字列を取得します。
	this.ruby       = ruby;
	// 選択範囲のありなしを記録します。
	this.selectFlag = selectFlag;

	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = TextEditor.prepareRuby(this.nodeList, this.ruby);
};

/**
 * Command基底クラスを継承します。
 */
RubyCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
RubyCommand.prototype.execute = function() {
	if (this.prepData === null) return false;
	var opeType = this.prepData.opeType;
	// ---- 準備段階で、実行すべき処理がないことがわかっている場合、false を返して Undo スタックへ登録しません。
	if (opeType == BOX_OPERATION.NONE) return false;

	var obj = TextEditor.setRuby(this.nodeList, this.ruby, this.prepData, this.selectFlag);
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
RubyCommand.prototype.undo = function() {
	TextEditor.setRuby(this.nodeList, this.ruby, this.prepData, this.selectFlag, true);
};

/**
 * redo()をオーバーライドします。
 */
RubyCommand.prototype.redo = function() {
	TextEditor.setRuby(this.nodeList, this.ruby, this.prepData, this.selectFlag);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
RubyCommand.prototype.getMemCost = function() {
	return 1;
};



