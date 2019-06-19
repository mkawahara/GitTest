/**
 * テーブルのい行削除コマンドクラスです。Undo, Redoメソッドを実装します。
 * nodeList:範囲選択リスト : 対象ノードインスタンスへの配列です。
 * selectFlag:選択範囲があったかなかったかを示します。
 */
var PasteCommand = function(event, inputbox, caret, inputText) {
	// ドキュメントの参照を取得します。
	// 範囲選択リストを取得します。
	this.event    = event;
	this.inputbox = inputbox;
	this.caret    = caret;
	this.prepData = RangedEditor.preparePaste(this.event, this.inputbox, this.caret, inputText);

	// 処理の実行先ノードを取得します (判定に使用するのみです)
	var targetNode = DocumentManager.getNodeById(this.caret.pos);

	// 親が段落でもセルでもない場合、挿入データからハイライト制御ノードを削除します
	if (!DataClass.isParagraphChild(targetNode) && !DataClass.isTableCellChild(targetNode)) {
		removeHighlightCtrlNode(this.prepData.nodeList);
	}

	// 親に読み要素が居る場合、挿入データから読み要素を削除します (その子は残します)
	if (DataClass.getClosest(targetNode, 'CREAD') != null) {
		console.log('Under read.');
		removeReadRubyNode(this.prepData.nodeList, 'CREAD');
	}

	// 親にルビ要素が居る場合、挿入データからルビ要素を削除します (その子は残します)
	if (DataClass.getClosest(targetNode, 'CRUBY') != null) {
		console.log('Under ruby.');
		removeReadRubyNode(this.prepData.nodeList, 'CRUBY');
	}

	// 親にフレーズ要素がいる場合、挿入データからテーブルを削除します（中身も全て削除します）
	if (DataClass.getClosest(targetNode, 'PHRASE') != null) {
		console.log('Under phrase.');
		removeNodesAs(this.prepData.nodeList, 'CTABLE');
	}

	// 段落直下でない場合、フレーズノードを削除します
	if (!DataClass.isParagraphChild(targetNode)) {
		console.log('Cancel phrase.');
		removeReadRubyNode(this.prepData.nodeList, 'PHRASE');
	}

	// ---- ローカルスタックを作成します。
	this.comObj = new CommandExecutor(1000);

};

/**
 * 引数で受け取ったノードリストから、ハイライト制御を削除します
 * @param nodeList
 */
function removeHighlightCtrlNode(nodeList) {
	for (var i = nodeList.length - 1; i >= 0; i--) {
		var nodeName = nodeList[i].nodeName;
		if (nodeName === (void 0)) nodeName = nodeList[i].tagName;
		nodeName = nodeName.toUpperCase();

		if (nodeName == 'HLCOM' || nodeName == 'HLDIV') {
			nodeList.splice(i, 1) ;
		}
	}
}

/**
 * 指定された名称のノードをリストから削除します
 * @param nodeList
 * @param nodeName
 * @returns
 */
function removeNodesAs(nodeList, nodeName) {
	for (var i = nodeList.length - 1; i >= 0; i--) {
		var targetName = nodeList[i].nodeName;
		if (targetName === (void 0)) targetName = nodeList[i].tagName;
		targetName = targetName.toUpperCase();
		nodeName = nodeName.toUpperCase();

		if (targetName == nodeName) nodeList.splice(i, 1) ;
	}
}

/**
 * 指定された配列内の read/ruby/phrase ノードを削除します。
 * 削除ノード内のデータは親に移動されます
 * @param nodeList	処理対象配列
 * @param nodeName	削除したいノードの名称。CREAD/CRUBY/PHRASE
 * @returns
 */
function removeReadRubyNode(nodeList, nodeName) {
	for (var i = 0; i < nodeList.length; i++) {
		// 子ノードを持たないノードはスキップします (読みノードでないことは自動的に確定します)
		if (nodeList[i].children.length == 0) continue;

		// read/ruby ノードなら子ノードを抽出して自身は削除。で、イテレータは巻き戻す
		if (nodeList[i].nodeName == nodeName) {
			var children = nodeList[i].children[0].children;
			nodeList.splice(i, 1);								// read/ruby 要素を削除します
			var bottomArray = nodeList.slice(i, nodeList.length);	// read/ruby 要素以降を別配列にコピーします
			nodeList.splice(i);									// read/ruby 要素以降を一度削除します
			Array.prototype.push.apply(nodeList, children);		// read/ruby 要素内の要素を追加します
			Array.prototype.push.apply(nodeList, bottomArray);	// 一度削除した後半部分を追加し直します

			i--;
			continue;
		}

		// 子ノードを持っていれば、再帰呼び出し実行
		if (nodeList[i].children.length > 0) {
			for (var ni = 0; ni < nodeList[i].children.length; ni++) {
				removeReadRubyChildNode(nodeList[i].children[ni].children, nodeName);
			}
		}
	}
}

/**
 * 指定された配列内の read/ruby ノードを削除します
 * ただし、このメソッドが受け取る配列は、DOM のノードの children です。
 * @param nodeList
 * @param nodeName
 * @returns
 */
function removeReadRubyChildNode(nodeList, nodeName) {
	for (var i = 0; i < nodeList.length; i++) {
		// 子ノードを持たないノードはスキップします (読みノードでないことは自動的に確定します)
		if (nodeList[i].children.length == 0) continue;

		// read/ruby ノードなら子ノードを抽出して自身は削除。で、イテレータは巻き戻す
		if (nodeList[i].nodeName == nodeName) {
			var children = nodeList[i].children[0].children;
			//nodeList.splice(i, 1);								// read/ruby 要素を削除します
			nodeList[0].parentNode.removeChild(nodeList[i]);
			var targetPos = nodeList[i];
			while (children.length > 0) {
				if (children[0].nodeName == 'BR') {
					children[0].parentNode.removeChild(children[0]);
				}
				else {
					nodeList[0].parentNode.insertBefore(children[0], targetPos);
				}
			}

			i--;
			continue;
		}

		// 子ノードを持っていれば、再帰呼び出し実行
		if (nodeList[i].children.length > 0) {
			for (var ni = 0; ni < nodeList[i].children.length; ni++) {
				removeReadRubyChildNode(nodeList[i].children[ni].children, nodeName);
			}
		}
	}
}

/**
 * Command基底クラスを継承します。
 */
PasteCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
PasteCommand.prototype.execute = function() {
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
PasteCommand.prototype.undo = function() {
	// ---- 複数挿入を Undo します。
	if (this.insertObj.isInsertable) this.comObj.undo();
	// ---- 範囲削除を Undo します。
	if (this.removeObj.isDeletable)  this.comObj.undo();
};

/**
 * redo()をオーバーライドします。
 */
PasteCommand.prototype.redo = function() {
	// ---- 範囲削除を Redo します。
	if (this.removeObj.isDeletable ) this.comObj.redo();

	// ---- 複数挿入を Redo します。
	if (this.insertObj.isInsertable) this.comObj.redo();
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
PasteCommand.prototype.getMemCost = function() {
//	return this.prepData.stackCost;
	return 1;
};
