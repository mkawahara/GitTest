/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： selectedRange.js                                   */
/* -                                                                         */
/* -    概      要     ： 選択範囲の始点と終点を保持する。                   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 38.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月24日                         */


// ---- コンストラクタ
function SelectedRange() {
	this._startNode = null;       // private 範囲開始ノード
	this._endNode   = null;       // private 範囲終点ノード

	this.selectedNodeList = []; // 選択されているノードのリスト
	this.prevParaCount = 0;     // 選択範囲のうち、最初の段落の要素数（段落全体が入っている、あるいは範囲が段落をまたがない場合は 0）
};

// ---- node[] 選択されているノードのリストを取得します。
// 段落単位で選択されている箇所は、段落ノードとして取得します 。
SelectedRange.prototype.getSelectedRange = function() {
	var nodeList = this.selectedNodeList;
	if (nodeList) nodeList = nodeList.concat();
	return nodeList;
};

SelectedRange.prototype.getSelectedFirstNode = function() {
	if (this.selectedNodeList.length === 0) return null;
	return this.selectedNodeList[0];
};

// ---- void 選択されているノードのリストを更新します。
SelectedRange.prototype.updateSelectedNodeList = function() {
	if (!this._startNode || !this._endNode) return [];
	var localStartNode = this._startNode;   // 範囲開始ノードへの参照
	var localEndNode   = this._endNode;     // 範囲終了ノードへの参照

	// ---- 開始位置と終了位置の前後関係を把握し、内部処理的にどちらを真の開始点 (若い点) とするかを決めます。
	var nodePair   = DataClass.sortNodePair(localStartNode, localEndNode);
	var sharedParentNode = nodePair.sharedParentNode; // 共通の親ノード
	localStartNode       = nodePair.startNode;        // 若いノード
	localEndNode         = nodePair.endNode;          // 古いノード

	// ---- 各要素クラスの範囲選択メソッドを呼び出す。
	DataClass.bindDataClassMethods(sharedParentNode);
	this.selectedNodeList = sharedParentNode.getSelectedNodeList(localStartNode, localEndNode);
	if (this.selectedNodeList === void 0) {
		console.log('selectedRange line50');
	}

	// 最初の段落のノード数を取得します
	this.prevParaCount = this.selectedNodeList.length;
	if ((this.selectedNodeList.length > 0) && (this.selectedNodeList[0].nodeName === 'PREVPARACOUNT')) {
		this.prevParaCount = Number(this.selectedNodeList[0].getAttribute('value'))
		this.selectedNodeList.shift();
	}

	console.log(this.getJsonString());
};




// ---- 妥当性が保証されている ノードリストを再設定します。
// Undo 等で選択範囲を復旧する際に使用します。
SelectedRange.prototype.reconfigureSelectedNode = function(nodeList) {
	this._startNode = 0; // ダミー値
	this._endNode   = 0; // ダミー値
	this.selectedNodeList = nodeList.concat();
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ---- node 選択操作の開始ノードを取得・設定します。
Object.defineProperty(SelectedRange.prototype, 'startNode', {
	enumerable: true,
	configurable: true,
	get: function()      { return this._startNode;  },
	set: function(value) {
		this._startNode = value;
		if (this._startNode === null && this._endNode === null) { // ---- もし、開始・終了がクリアされていたら
			this.selectedNodeList = [];                                   // 選択範囲クリア
		}
	},
});

// ---- node 選択操作の終点ノードを取得・設定します。
// こちらのプロパティが更新される都度、このクラスが有する選択ノードリストも更新します。
Object.defineProperty(SelectedRange.prototype, 'endNode', {
	enumerable: true,
	configurable: true,
	get: function()      { return this._endNode; },
	set: function(value) {
		this._endNode = value;                                    // 範囲終点ノード取得
		if (this._startNode !== null && this._endNode !== null) { // ---- 範囲選択が存在するなら
			this.updateSelectedNodeList();                                // 選択ノードリスト更新処理
		}
		if (this._startNode === null && this._endNode === null) { // ---- もし、開始・終了がクリアされていたら
			this.selectedNodeList = [];                                   // 選択範囲クリア
		}
	},
});

Object.defineProperty(SelectedRange.prototype, 'count', {
	enumerable: true,
	configurable: true,
	get: function()      { return this.selectedNodeList.length; },
});



/////////////////////////////////////////////////////////////////////
// コピペ用データ文字列取得
/////////////////////////////////////////////////////////////////////

/**
 * コピペ・ダイアログ用のデータ文字列を作成します。
 * ノードIDは除去されます。
 */
SelectedRange.prototype.getJsonString = function(mode) {
	if (this.selectedNodeList.length <= 0) return null;

	var json = null;

//	if ((mode === 'ruby') && this.inRuby()) {
//		// ルビを元に json を取得します
//		json = this.getJsonRubyRange();
//	} else if ((mode === 'read') && this.inReading()) {
//		// 読みを元に判定します
//		json = this.getJsonReadingRange();
//	}
//
//	if (json === null) {
		// 選択範囲を表す json を取得します
		json = this.getJsonSelectedRange();
//	}

	return json;
};

/**
 * 選択範囲を表す json を取得します
 * @returns
 */
SelectedRange.prototype.getJsonSelectedRange = function() {
	var nodeStringList = [];
	var plainText = '';

	var re = / id="C\d+"/g;

	for (var i = 0; i < this.selectedNodeList.length; i++) {
		var xml = this.selectedNodeList[i].outerHTML;
		xml = xml.replace(re, '');
		nodeStringList.push(xml);
		plainText += this.selectedNodeList[i].textContent;
		plainText = plainText.replace('&nbsp;', ' ') ; // &nbsp; を、半角スペースへ置換

		//if ((i === this.prevParaCount - 1) || (this.selectedNodeList[i].nodeName === 'PARAGRAPH')) {
		if (this.selectedNodeList[i].nodeName === 'PARAGRAPH') {
			plainText += '\n';
		}
	};

	// 画像や SP/LP のみの場合、空文字列になってしまいペーストできなくなるため、1文字空白を設定します
	if (plainText === '') plainText = '98q9rfq4t9y4tuqegq0y-w5tqht9qtq35';

	var json = {
		text: plainText,
		prevsize: this.prevParaCount,
		nodeList: nodeStringList,
	};

	//console.log('コピー用プレインテキスト：' + plainText);

	return json;
};

/**
 * 選択範囲を含むルビ要素に対応する json を取得します
 */
SelectedRange.prototype.getJsonRubyRange = function() {
	var jnode = $(this.selectedNodeList[0]);
	var rubyNode = jnode.closest('cruby')[0];

	return SelectedRange.getNodeJson(rubyNode);
};

/**
 * 選択範囲を含む読み要素に対応する json を取得します
 */
SelectedRange.prototype.getJsonReadingRange = function() {
	var jnode = $(this.selectedNodeList[0]);
	var readNode = jnode.closest('read')[0];

	return SelectedRange.getNodeJson(readNode);
};

/**
 * 指定ノードのみを範囲として表す json を取得します
 * @param node
 */
SelectedRange.getNodeJson = function(node) {
	var nodeStringList = [];
	var plainText = '';

	var re = / id="C\d+"/g;

	var xml = node.outerHTML;
	xml = xml.replace(re, '');
	nodeStringList.push(xml);
	plainText = node.textContent;

	var json = {
		text: plainText,
		prevsize: 1,
		nodeList: nodeStringList,
	};

	return json;
};


/////////////////////////////////////////////////////////////////////
// 対象範囲の判別メソッド
/////////////////////////////////////////////////////////////////////

SelectedRange.prototype.inRuby = function() {
	var jnode = $(this.selectedNodeList[0]);
	return (jnode.closest('cruby').length > 0);
};

SelectedRange.prototype.inReading = function() {
	var jnode = $(this.selectedNodeList[0]);
	return (jnode.closest('read').length > 0);
};
