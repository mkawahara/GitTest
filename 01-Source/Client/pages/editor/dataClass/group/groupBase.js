/**
 * グループ要素の基本クラス
 *
 * キー操作によるカーソル移動メソッドの定義のみのためのクラスです。
 * Paragraph 要素では幾つかのメソッドをオーバーライドする必要があります。
 */


function GroupBaseClass() {};

GroupBaseClass.prototype = Object.create(HTMLUnknownElement.prototype);


/////////////////////////////////////////////////////////////////////
// 自身を起点とする移動処理メソッド
/////////////////////////////////////////////////////////////////////

// グループ系要素は自身を起点とする処理が存在しないため、ここは空です。


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftLeftFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftLeftFromChild(this.id);
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftRightFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftRightFromChild(this.id);
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftUpFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild(this.id);
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftDownFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild(this.id);
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftByEnterFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftByEnterFromChild(this.id);
};

/**
 * 親レイアウトのIDを返します。
 */
GroupBaseClass.prototype.shiftByEscFromChild = function() {
	return this.parentElement.id;
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

/**
 * 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
 */
GroupBaseClass.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 親兄弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * グループの先頭要素を返します。
 */
GroupBaseClass.prototype.getFirstPos = function() {
	return this.firstChild.id;
};

/**
 * グループの終端要素を返します。
 */
GroupBaseClass.prototype.getLastPos = function() {
	return this.lastChild.id;
};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/**
 * 子孫も含む、終端要素を返します。
 */
GroupBaseClass.prototype.getLastOffspring = function() {
	// 子を持たなければ、自分自身を返します
	if (this.children.length === 0) return this;

	// 自身の最後の子を取得します
	var lastChild = this.lastChild;
	DataClass.bindDataClassMethods(lastChild);

	// 自身の子のメソッドを再帰呼び出しします
	return lastChild.getLastOffspring();
};


/////////////////////////////////////////////////////////////////////
// 編集用メソッド
/////////////////////////////////////////////////////////////////////


// ------------- 新しい要素を1ヶ挿入します。
// ※クラスによっては、扱えるノードの種類に制限がかかります。
//GroupBaseClass.prototype.insertCharAt = function(id, element) {
GroupBaseClass.prototype.insertNode = function(id, element) {
	// 引数      id [I, str]  : id
	//      element [I/O, obj]: 挿入されるオブジェクト
	// 返値: 失敗したらnull: パラグラフ末尾に改行が挿入される場合、失敗する。

	// ノードを取得します
	var section = DocumentManager.getCurrentSection();
	var dataNode = $(section).find('#' + id)[0];
	// 挿入します。
	dataNode.parentNode.insertBefore(element, dataNode);
};



// ------------- 指定した要素1ヶを削除します。
//GroupBaseClass.prototype.removeCharAt = function(id) {
GroupBaseClass.prototype.removeNode = function(id) {
	// 引数  id    [I, obj]: Delete式削除の起点要素 ---> つまり、id で指定された要素が削除されます。
	// 返値  { 'node', 'id'}
	//          node [node]: 削除された要素そのもの。Undo/Redo に必要な情報です。
	//          id    [str]: 消された要素の弟要素のID
	//          ※ 失敗したら null: ・段落末尾の改行: Paragraph 直属、かつ、Paragraph 末尾での改行(BR)の場合。
	//                              　※段落の結合が発生するケース。ここでは扱わない。
	//                              ・グループ末尾の改行:GroupElement直属、かつ、GroupElement 末尾での改行(BR)の場合。
	//                              　※添え字位置の改行がなくなるとカーソル移動が不可能になる。

	// ノードを取得します
//	var section = DocumentManager.getCurrentSection(); // 7/22 検索・置換の兼ね合いで改変
//	var dataNode = $(section).find('#' + id)[0];
	var sectionList = DocumentManager.getDocument();
	var dataNode = $(sectionList).find('#' + id)[0];

	var tempNode = dataNode.parentNode;
	var parNodeName = (tempNode === null ? null : tempNode.nodeName);

	tempNode = dataNode.nextSibling;
	var parNextName = (tempNode === null ? null : tempNode.nodeName);

	// ------ 失敗判断 ------ Paragraph 直属、かつ、Paragraph 末尾での改行(BR)の場合は、削除失敗。
	// 親ノードが PARAGRAPH か G で、行末かつ弟要素がない場合は、null を返します。
	if ( (parNodeName == 'PARAGRAPH' || parNodeName == 'G') && dataNode.nodeName == 'BR' && parNextName == null) {
		return(null);
	}

	// 弟要素のIDを取得します。
	var nextId = dataNode.nextSibling.id;
	// 消します。
	var parNode = dataNode.parentNode;
	var removedNode = parNode.removeChild(dataNode);

	return( {'node' : removedNode, 'id' : nextId} );
};



/////////////////////////////////////////////////////////////////////
// 範囲選択用メソッド
/////////////////////////////////////////////////////////////////////

// ---- node[] 指定された２つのノードを基準として、選択されるべきノードのリストを取得します。
// 呼び出し元の selectedRange クラスにおいて、 start は、end より若いノードであることが保証されています。
// これは、単一グループレベルでの処理です。
GroupBaseClass.prototype.getSelectedNodeList = function(start, end) {
	// ---- start ノードの決定
	// ・start が null 指定なら、グループの最初の子要素を start へ指定します。
	// ・start が null 指定でないなら、start のレベルを当グループ要素の直下まで引き上げます。
	start = start === null ? this.firstChild : DataClass.adjustNodeLevel(this, start);

	// ---- end ノードの決定
	// ・end が null 指定なら、グループの最後の子要素を end へ指定します。
	// ・end が null 指定ではなく、end の親要素が当グループ要素ならば、end の兄要素を 新しく end へ指定します。
	// ・end が null 指定ではなく、end の親要素が当グループ要素でないなら、end のレベルを当グループ要素の直下まで
	// 　引き上げます。
	end = end === null ? this.lastChild :
		( end.parentNode == this ? end.previousSibling : DataClass.adjustNodeLevel(this, end) );
//	if (end === null) end = this.firstChild; // グループ先頭時対策

	// ---- 選択範囲のノードをリストにします。
	var paragraphNode = start.parentNode;                      // 親 (グループ) ノード
	var childCount    = paragraphNode.children.length;         // 子ノードの数
	var startFlag     = false;                                 // 範囲選択の開始点に到達したかどうか示すフラグ
	var nodeList      = [];                                    // 範囲選択対象のノードのリスト (配列)
	for (var i = 0; i < childCount; i++) {                     // ---- 子ノード数分ループ
		var localChild = paragraphNode.children[i];                    // 子ノード 1個
		if (!startFlag && localChild.id == start.id) startFlag = true; // 範囲選択の開始点に到達したらフラグを立てる。
		if (startFlag) {                                               // ---- 選択範囲内なら、
			nodeList.push(localChild);                                         // 対象子ノードをノードリストへ追加。
			if (localChild.id == end.id) break;                                // 選択範囲が終了したら、ループ中断。
		}
	}

	return nodeList;                                           // ノードのリストを返します。
};


/////////////////////////////////////////////////////////////////////
// 派生クラスに共通の処理
/////////////////////////////////////////////////////////////////////


// static string ---- toHtml 処理共通部分
// ただし、段落要素からは実行されません
GroupBaseClass.toHtmlCommon = function(obj, caretId, delMathFlag) {
	// obj         [node] : オブジェクト
	// caretId   [文字列] : キャレットID
	// delMathFlag [bool] : math系タグを削除するか否か true = 削除, false / undefined 等 = 削除しない
	// 返値 xml  [文字列] : toHtml 用 xml 文字列

	// 子要素の toHtml 結果をまとめて取得します。
	var xml = DataClass.getChildrenHtml(obj.children, caretId);

	// math 系タグの削除が指定されていれば、cmath/mmath を削除します。
	// これは、MatrixCell への対応です
	if (delMathFlag) {
		var re = /<\/cmath>|<cmath>|<\/mmath>|<mmath>/g;
		xml = xml.replace(re, '');
	}

	// 数式番号タグは削除します
	re = /<\/eqnumber>/g;
	xml = xml.replace(re, '');
	re = /<eqnumber>/g;
	xml = xml.replace(re, '');

	return xml;
};



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変換情報を取得
// グループ系要素は、nt 書き換え不可。ただし、子孫要素への nt 伝搬は行います。
GroupBaseClass.prototype.getConvertedNodeInfo = function(inputMode) {
	var result = this.getDefaultNodeInfo(inputMode);
	// ---- テキスト指定で、子孫を含めてのテキスト変換が許可されていないなら、return
	if (inputMode == CIO_XML_TYPE.text && !this.convertibleToText) return result;
	// ---- 数式・化学式指定で、子孫を含めての数式・化学式変換が許可されていないなら、return
	if (inputMode != CIO_XML_TYPE.text && !this.convertibleToMath) return result;

	// ---- 上記チェックを抜けたなら、 nt 属性の伝搬は可能
	this.propageteNt = true;

	result = this.convertNodeNt(result, inputMode); // 子孫要素の、nt 記録
	return result;
};

GroupBaseClass.prototype.getDefaultNodeInfo = function(inputMode) {
	DataClass.bindDataClassMethods(this);
	var result = {};
	result.originalNodeList  = [this];
	result.originalNtList    = [this.nt];
	result.convertedNodeList = [this];
	result.convertedNtList   = [this.nt];
	return result;
};

// ---- 子要素の変換リストを作成
GroupBaseClass.prototype.convertNodeNt = function(result, inputMode) {
	var children = this.children;             // テキストノードは、 children には含まれません。
	var childCount = children.length;         // g系 ノードの子要素数は、クラスによって異なります。
	for (var i = 0; i < childCount; i++) {
		var localChild = children[i];
		DataClass.bindDataClassMethods(localChild); // doop
		// ---- 変換実行
		var localInfo = localChild.getConvertedNodeInfo(inputMode);
		// ---- 元のノードと nt 属性を記録
		result.originalNodeList = result.originalNodeList.concat(localInfo.originalNodeList);
		result.originalNtList   = result.originalNtList.concat(localInfo.originalNtList);
		// ---- 変換後のノードと nt 属性を記録
		result.convertedNodeList = result.convertedNodeList.concat(localInfo.convertedNodeList);
		result.convertedNtList   = result.convertedNtList.concat(localInfo.convertedNtList);
	}
	return result;
};

// ---- モード変更制限
GroupBaseClass.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
GroupBaseClass.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
GroupBaseClass.prototype.propageteNt       = true;  // nt 変更を子孫に伝搬させるか



/////////////////////////////////////////////////////////////////////
// 話者設定メソッド
/////////////////////////////////////////////////////////////////////
// ---- 自身を含む、子孫の話者情報を返します。
// グループ系は、話者属性を持ちえません。子孫のリストをそのまま上へ渡します。
GroupBaseClass.prototype.getSpeakerList = function(speakerIdx, headFlag) {
	var retArray = [];  // 返値用配列
	var childCount = this.children.length;
	for (var i = 0; i < childCount; i++) {
		var localChild = this.children[i];
		DataClass.bindDataClassMethods(localChild);
		var localRetArray = localChild.getSpeakerList(speakerIdx, headFlag);
		retArray = retArray.concat(localRetArray); // 子孫のリストを、返値用配列へ接続する
	}
	return retArray;
};



/////////////////////////////////////////////////////////////////////
// 無音設定メソッド
/////////////////////////////////////////////////////////////////////
// ---- 自身を含む、子孫の無音設定情報を返します。
// グループ系は、無音属性を持ちえません。子孫のリストをそのまま上へ渡します。
GroupBaseClass.prototype.getSilenceList = function(silenceFlag, headFlag) {
	if (silenceFlag === void 0) silenceFlag = null;
	if (headFlag    === void 0) headFlag    = false;

	var retArray = [];  // 返値用配列
	var childCount = this.children.length;
	for (var i = 0; i < childCount; i++) {
		var localChild = this.children[i];
		DataClass.bindDataClassMethods(localChild);
		var localRetArray = localChild.getSilenceList(silenceFlag, headFlag);
		retArray = retArray.concat(localRetArray); // 子孫のリストを、返値用配列へ接続する
	}
	return retArray;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * nodetype プロパティ
 */
Object.defineProperty(GroupBaseClass.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getNt();
	},
	set: function(value) {
		// ---- 自身の nt を変更することはできません。

		// ---- 子孫要素の nt 変更処理
		if (this.propageteNt) {
			this.setAttribute('nt', value);
			var children   = this.children;
			var childCount = children.length;
			for (var i = 0; i < childCount; i++) {
				var localNode = children[i];
				DataClass.bindDataClassMethods(localNode); // doop
				localNode.nt = value;
			}
		}
	},
});

GroupBaseClass.prototype.getNt = function() {
	var nodeType = this.getAttribute('nt');
	return nodeType ? Number(nodeType) : CIO_XML_TYPE.math;
};


/**
 * isTextGroup プロパティ：読取りのみ
 */
Object.defineProperty(GroupBaseClass.prototype, 'isTextGroup', {
	enumerable: true,
	configurable: true,
	get: function(){
		var nodeType = this.getAttribute('nt');
		return (nodeType == CIO_XML_TYPE.text);
	}
});