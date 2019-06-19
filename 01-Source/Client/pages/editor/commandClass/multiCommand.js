/**
 * 複数回実行するためのコマンドクラスです。Undo, Redoメソッドを実装します。
 * commandObj:コマンドのオブジェクト
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var MultiCommand = function(commandObj) {
	this.commandObj = commandObj; // コマンドクラスを保持

	this.commandObjArray = [];    // 複数のコマンドインスタンスの配列
	if (commandObj === ReadingCommand || commandObj === RubyCommand) { // ---- ルビ・読み用オブジェクト配列作成
		var nodeListArr = arguments[1];
		var optionalStr = arguments[2];
		var optionalAccent = arguments[3];
		var procCount = nodeListArr.length;
		for (var i = 0; i < procCount; i++) {
			var nodeList = nodeListArr[i];
			var newObj   = new commandObj(nodeList, optionalStr, true, optionalAccent);
			this.commandObjArray.push(newObj);
		}
	} else if (commandObj === ReplaceCommand) {                        // ---- 置換コマンドオブジェクト配列作成
		var multiTargetInfo = arguments[1];                                    // 置換用情報
		var caret           = arguments[2];                                    // キャレット
		this.selectedNodeListArray = [];                                       // 選択範囲ノードリストのリスト
		var procCount = multiTargetInfo.length;                                // 何回繰り返すか
		for (var i = 0; i < procCount; i++) {                                  // ---- 繰り返し回数分コマンド作成
			var localInfo = multiTargetInfo[i];                                        // 置換用情報一回分
			this.selectedNodeListArray.push(localInfo.selectedNodeList);               // 選択範囲を保持
			var nodeList = localInfo.replaceNodeList;                                  // 置換先ノードリスト
			var newObj   = new commandObj(nodeList, caret);                            // コマンドオブジェクト作成
			this.commandObjArray.push(newObj);                                         // コマンド記憶
		}
	}
	this.commandCount = this.commandObjArray.length;                   // 実行するコマンド数を記録

	// ---- ローカルスタックを作成します。
	this.comObj = new CommandExecutor(1000);
};

/**
 * Command基底クラスを継承します。
 */
MultiCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
MultiCommand.prototype.execute = function() {
	var needSelect = (this.commandObj === ReplaceCommand);
	var selectedRangeManager = needSelect ? EditManager.instance.SelectedRangeManager : null;

	for (var i = 0; i < this.commandCount; i++) {
		if (needSelect) { // ---- 選択範囲の再設定が必要なら
			selectedRangeManager.clearSelectedRange(true);                               // 選択範囲クリア
			selectedRangeManager.reconfigureSelectedNode(this.selectedNodeListArray[i]); // 選択再設定
		}
		this.comObj.execute(this.commandObjArray[i]); // 1コマンド実行
	}
	return true;
};

/**
 * undo()をオーバーライドします。
 */
MultiCommand.prototype.undo = function() {
	for (var i = 0; i < this.commandCount; i++) {
		this.comObj.undo();
	}
};

/**
 * redo()をオーバーライドします。
 */
MultiCommand.prototype.redo = function() {
	for (var i = 0; i < this.commandCount; i++) {
		this.comObj.redo();
	}
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
MultiCommand.prototype.getMemCost = function() {
	return this.commandCount;
};
