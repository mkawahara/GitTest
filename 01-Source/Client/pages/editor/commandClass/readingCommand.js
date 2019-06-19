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
var ReadingCommand = function(nodeList, read, selectFlag, accent) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// 読み文字列を取得します。
	this.read       = read;
	// 選択範囲のありなしを記録します。
	this.selectFlag = selectFlag;
	// アクセント制御の有無を記録します
	this.accent = accent;

	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = TextEditor.prepareReading(this.nodeList, this.read, this.accent);
};

/**
 * Command基底クラスを継承します。
 */
ReadingCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
ReadingCommand.prototype.execute = function() {
	var opeType = this.prepData.opeType;
	// ---- 準備段階で、実行すべき処理がないことがわかっている場合、false を返して Undo スタックへ登録しません。
	if (opeType == BOX_OPERATION.NONE) return false;

	var obj = TextEditor.setReading(this.nodeList, this.read, this.prepData, this.selectFlag, void 0, this.accent);
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
ReadingCommand.prototype.undo = function() {
	TextEditor.setReading(this.nodeList, this.read, this.prepData, this.selectFlag, true, this.accent);
};

/**
 * redo()をオーバーライドします。
 */
ReadingCommand.prototype.redo = function() {
	TextEditor.setReading(this.nodeList, this.read, this.prepData, this.selectFlag, void 0, this.accent);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
ReadingCommand.prototype.getMemCost = function() {
	return 1;
};



