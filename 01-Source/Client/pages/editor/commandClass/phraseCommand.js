/**
 * フレーズ指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:   範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag: 選択範囲の有無を表します
 */
var PhraseCommand = function(nodeList, selectFlag) {
	// 範囲選択リストを取得します。
	this.nodeList = nodeList.concat();
	// 選択有り無しフラグがあったかなかったか
	this.selectFlag = selectFlag;

	// 該当段落リストと、操作対象リストを取得します。
	this.prepData = TextEditor.prepareSetPhraseBox(this.nodeList);
};

/**
 * Command基底クラスを継承します。
 */
PhraseCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
PhraseCommand.prototype.execute = function() {
	var obj = TextEditor.setPhraseBox(this.nodeList, this.prepData, this.selectFlag);
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
PhraseCommand.prototype.undo = function() {
	TextEditor.setPhraseBox(this.nodeList, this.prepData, this.selectFlag, true);
};

/**
 * redo()をオーバーライドします。
 */
PhraseCommand.prototype.redo = function() {
	TextEditor.setPhraseBox(this.nodeList, this.prepData, this.selectFlag);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
PhraseCommand.prototype.getMemCost = function() {
	return 1;
};
