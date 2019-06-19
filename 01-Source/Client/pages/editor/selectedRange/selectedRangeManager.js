/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： selectedRangeManager.js                            */
/* -                                                                         */
/* -    概      要     ： 範囲選択用マネージャ                               */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 38.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月24日                         */


// ---- コンストラクタ
function SelectedRangeManager() {
//	this._isSelecting = false;

	this.selectedRange = new SelectedRange();
};

// ---- void 選択操作の開始点を登録します。
// 引数は選択開始点。既に選択範囲を有する場合、node は無視されます。
SelectedRangeManager.prototype.startSelect = function(node) {
	this.selectedRange.startNode = node;
	//console.log('始点が設定されました：', node.textContent);
};

// ---- void 保持している選択範囲の終点を引数のノードで更新します。
// Rendererへの登録処理もここで行われる。
SelectedRangeManager.prototype.updateSelectedRange = function(node) {
	// 入力部品に隠し選択範囲を登録します
	ClipboardManager.instance.setHideSelectedNode(EDT_FrontTextBox);

	var renderer = ViewManager.getRenderer();  // レンダラ取得

	// ---- 旧範囲をレンダラへ登録
	var range = [];
	if (this.hasSelectedRange) range = this.selectedRange.getSelectedRange();
	renderer.setOldSelectedRange(range);

	// ---- 終点設定
	var newRange = null;
	if (this.selectedRange.startNode === node) { // ---- もし、終了位置と開始位置が同じものなら
		// ---- 範囲クリア
		var tempStartNode = this.selectedRange.startNode; // 開始ノードをバックアップ
		this.selectedRange.startNode = null;              // startNode, endNode 両者が null になることで
		this.selectedRange.endNode   = null;              // nodeList がクリアされます。
		this.selectedRange.startNode = tempStartNode;     // startNode 再設定
		newRange = [];
	} else {
		this.selectedRange.endNode = node;
	}

	// ---- 新範囲をレンダラへ登録
	if (newRange === null) newRange = this.selectedRange.getSelectedRange();
	renderer.setSelectedRange(newRange);

	// debug
	if (newRange.length == 0) {
		console.log('開始点と終了点がダブったため、いったんクリアし、開始点を再設定しました');
	} else {
		//console.log('終点が設定されました：', node.textContent);
	}

};

// ---- void 妥当性が保証されている ノードリストを再設定します。
// Undo 等で選択範囲を復旧する際に使用します。
SelectedRangeManager.prototype.reconfigureSelectedNode = function(nodeList) {
	var renderer = ViewManager.getRenderer();  // レンダラ取得

	// ---- 旧範囲をレンダラへ登録
	var range = [];
	if (this.hasSelectedRange) range = this.selectedRange.getSelectedRange();
	renderer.setOldSelectedRange(range);

	// ---- ノードリスト再設定
	this.selectedRange.reconfigureSelectedNode(nodeList);

	// ---- 新範囲をレンダラへ登録
	renderer.setSelectedRange(nodeList);
};

// ---- void 保持している選択範囲をクリアします。
SelectedRangeManager.prototype.clearSelectedRange = function(preventRendere) {
	// 入力部品の隠し選択範囲を削除します
	ClipboardManager.instance.clearHideSelectedNode();

	var renderer = ViewManager.getRenderer(); // レンダラ取得

	// ---- 旧範囲をレンダラへ登録
	if (!preventRendere) renderer.setOldSelectedRange(this.selectedRange.getSelectedRange());

	// ---- 範囲クリア
	this.selectedRange.startNode = null;
	this.selectedRange.endNode   = null;

	// ---- 新範囲をレンダラへ登録 (空リスト)
	renderer.setSelectedRange([]);

	console.log('選択範囲がクリアされました。');
	console.log('hasSelectedRange プロパティは', this.hasSelectedRange, 'です。');
};

// ---- node[] 選択されているノードのリストを取得します。
// 段落単位で選択されている箇所は段落ノードとして取得する (予定) です。
// SelectedRange クラスの同名メソッドのラッパです。
SelectedRangeManager.prototype.getSelectedRange = function() {

	// Debug
	var nodes = this.selectedRange.getSelectedRange();
	if (nodes.length == 0) {
		//console.log('選択範囲なし');
		return null;
	}
	var nodeCount = nodes.length;
	var debugStr = '';
	for (var i = 0; i < nodeCount; i++) {
		var localChild = nodes[i];
		debugStr += localChild.textContent;
	}
	console.log('選択範囲: ' + debugStr);

	return this.selectedRange.getSelectedRange();
};

/**
 * 選択範囲のテキストを取得します。
 * 直下に含まれる数式ノードとテーブルは無視されます。
 * （孫以下であればテキスト抽出対象となります。）
 */
SelectedRangeManager.prototype.getSelectedText = function() {
	var text = '';
	var nodes = this.selectedRange.getSelectedRange();

	for (var i = 0; i < nodes.length; i++) {
		DataClass.bindDataClassMethods(nodes[i]);
		if ((nodes[i].nt === CIO_XML_TYPE.text) && (nodes[i].nodeName.toLowerCase() !== 'ctable')) {
			text = text + nodes[i].textContent;
		}
	};

	return text;
};

// ---- [] 現在の選択範囲に対して box 操作を行ってよいか判定し、適格なら box 操作用ノードリストを返します。
// box 操作 (囲み枠・ルビ・読み) に適した ノードリストを作成します。対象が段落の場合、子要素が展開されます。
SelectedRangeManager.prototype.getBoxNodeList = function() {
	if (!this.hasSelectedRange) return [];                    // 選択範囲がないなら、不適格です。

	// ---- 不適格な段落が含まれていないかチェックします。
	var nodeList  = this.selectedRange.getSelectedRange();    // 選択範囲を取得します。
	var nodeCount = nodeList.length;                          // ノードリストの長さです。
	for (var i = 0; i < nodeCount; i++) {                     // ---- ノードリスト分ループします。
		if (nodeList[i].nodeName == 'PARAGRAPH' && i > 0) return [];  // 段落は、最初の要素でないなら不適格です。
	}

	// ---- 対象が段落なら、中身を展開します : nodeList の更新が発生します。
	if (nodeList[0].nodeName == 'PARAGRAPH') nodeList = nodeList[0].children;

	// ---- 不適格な改行がないかチェックします : nodeList の更新が発生します。
	var nodeCount = nodeList.length;                          // ノードリストの長さです。
	for (var i = 0; i < nodeCount; i++) {                     // ---- ノード数分ループ
		if (nodeList[i].nodeName == 'BR') {                           // ---- 改行があった場合
			if ( i < (nodeCount - 1) ) return [];                             // 最後の要素でないなら不適格です。
			nodeList.splice(i, 1);                                            // 最後の改行はリストから取り除きます。
		}
	}

	// ---- 複数のテーブルセル・マトリクスセルが含まれている場合は、不適格です。
	var nodeCount = nodeList.length;
	var nodeName  = nodeList[0].nodeName;
	if (nodeCount >= 2 && (nodeName == 'CTD' || nodeName == 'CMATCELL') ) return [];

	// ---- ノードリストを返します。
	return nodeList;
}



// ---- static {} 選択範囲の両端に存在するノード ID を取得します
SelectedRangeManager.getEdgeNodeIds = function(startNode, endNode) {

	var nodePair  = DataClass.sortNodePair(startNode, endNode);
	var startNode = nodePair.startNode; // 若いノード
	var endNode   = nodePair.endNode;   // 古いノード

	// ---- 段落なら、中の子要素を対象とする。
	var youndNode = startNode.nodeName == 'PARAGRAPH' ? startNode.firstChild : startNode;
	var oldNode   = (endNode.nextSibling !== null) ? endNode.nextSibling : endNode.parentNode.nextSibling;
	if (endNode.nodeName == 'PARAGRAPH') {
		var nextPara = endNode.nextSibling;
		oldNode = nextPara ? nextPara.firstChild : endNode.lastChild;
	}

	var youngId = youndNode.id;
	var oldId   = oldNode.id;
	return {'youngId' : youngId, 'oldId' : oldId};
}



/**
 * 現在の選択範囲を表すデータ文字列を取得します。
 * @param mode SelectedRange のメソッド参照
 */
SelectedRangeManager.prototype.getJsonText = function(mode) {
	return this.selectedRange.getJsonString(mode);
};

/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////


// ---- bool 選択操作中であるか否かを取得します。
Object.defineProperty(SelectedRangeManager.prototype, 'isSelecting', {
	enumerable: true,
	configurable: true,
	get: function() { return this._isSelecting; },
	set: function(value) { this._isSelecting = value; },
});


// ---- bool 選択範囲の有無を取得します。
Object.defineProperty(SelectedRangeManager.prototype, 'hasSelectedRange', {
	enumerable: true,
	configurable: true,
	get: function() {
		return (this.selectedRange.startNode !== null && this.selectedRange.endNode !== null);
	},
});

Object.defineProperty(SelectedRangeManager.prototype, 'count', {
	enumerable: true,
	configurable: true,
	get: function() { return this.selectedRange.count; },
});


