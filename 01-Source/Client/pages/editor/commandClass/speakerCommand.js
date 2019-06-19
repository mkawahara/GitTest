/**
 * 太字体指定コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * boldFlag: true = 太字, false = 太字解除
 */
var SpeakerCommand = function(speakerIdx, caret) {
	this.caret      = caret;
	this.speakerIdx = speakerIdx;
	this.prepData   = StatusEditor.prepareSpeaker(speakerIdx, caret);
};

/**
 * Command基底クラスを継承します。
 */
SpeakerCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
SpeakerCommand.prototype.execute = function() {

	if (this.prepData === null) return false;
	this.redo();
	return true;
};

/**
 * undo()をオーバーライドします。
 */
SpeakerCommand.prototype.undo = function() {
	StatusEditor.setSpeaker(this.prepData, true);

};

/**
 * redo()をオーバーライドします。
 */
SpeakerCommand.prototype.redo = function() {
	StatusEditor.setSpeaker(this.prepData);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
SpeakerCommand.prototype.getMemCost = function() {
	return 1;
};
