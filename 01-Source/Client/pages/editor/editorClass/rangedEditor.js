/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月08日                         */

// ---- コンストラクタ
function RangedEditor(){};

// ************************************************************************
// **                 ペースト (クリップボードからの置換)                **
// ************************************************************************

RangedEditor.preparePaste = function(event, inputbox, caret, inputText) {

	console.log('RangedEditor.preparePaste');

	// ---- ClipBoard から json オブジェクトを受け取ります。
	var json = ClipboardManager.instance.getData(event, inputbox, inputText);
	var prevsize = json.prevsize; // 先頭のノード数
	var nodeList = json.nodeList; // ノードリスト

	// ---- 返値
	var prepData = {};
	prepData.prevsize = prevsize; // 先頭のノード数
	prepData.nodeList = nodeList; // ノードリスト
	return prepData;
};



// ************************************************************************
// **                  置換 (指定ノードリストによる置換)                 **
// ************************************************************************

RangedEditor.prepareReplace = function(nodeList, caret) {

	console.log('RangedEditor.prepareReplace');

	// ---- 返値
	var prepData = {};
	prepData.prevsize = nodeList.length; // 先頭のノード数 (paste との互換性のため)
	prepData.nodeList = nodeList;        // ノードリスト
	return prepData;
};



// ************************************************************************
// **                              複数削除                              **
// ************************************************************************

const MULTI_EDIT_TYPE = {
	'GROUP'     : 'GROUP',
	'PARAGRAPH' : 'PARAGRAPH',
	'CELL'      : 'CELL',
};

// ---- static 複数削除処理を行います。
RangedEditor.prepareRemoveMultiNode = function(caret) {
	// nodeList  [DOM配列]            : 対象親要素のリスト

	var operationType = '';
	var caretId = caret.pos;
	// ---- nodeList を取得します。
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	var nodeList = selectedRangeManager.getSelectedRange();
	if (nodeList === null) return null;
	if (!nodeList.length)  return null;
//	if ((nodeList[0].nodeName === 'CTD') || (nodeList[0].nodeName === 'CMATCELL')) return null;
	if ((nodeList[0].nodeName === 'CTD') || (nodeList[0].nodeName === 'CMATCELL')) {
		operationType = MULTI_EDIT_TYPE.CELL;
	}

	// ---- 操作の種類に応じて、prepData を用意します。
	var prepData;
	if (operationType === MULTI_EDIT_TYPE.CELL) {
		// ---- セル操作なら
		prepData = RangedEditor.readyToCells(nodeList);
	} else {
		// ---- グループ内操作か、段落操作か判別します。
		operationType = MULTI_EDIT_TYPE.PARAGRAPH;
		var firstNode = nodeList[0];
		var nodeCount = nodeList.length;
		var endNode   = nodeList[nodeCount - 1];
		if ((firstNode.parentNode == endNode.parentNode) &&
				(firstNode.parentNode.nodeName != 'PARAGRAPH') &&
				(firstNode.parentNode.nodeName != 'SECTION')) {
			operationType = MULTI_EDIT_TYPE.GROUP;
		}
		// ---- 返値を用意します。
		// グループ内処理もしくは、段落操作処理用の前処理を行います。
		prepData = (operationType == MULTI_EDIT_TYPE.GROUP) ?
			RangedEditor.readyToGroupChildren(nodeList) : RangedEditor.readyToMultiPara(nodeList);
	}
	// その他のパラメータ
	prepData.caretId       = caretId;                               // 元々のキャレット ID
	prepData.nodeList      = nodeList;                              // ノードリストを追加します。
	prepData.operationType = operationType;                         // 操作種類を追加します。
	prepData.stackCost     = DataClass.estimateStackCost(nodeList); // 要素数からスタックコストを算出します。

	return prepData;
};

RangedEditor.readyToCells = function(nodeList) {
	// 置き換え用空ノードを作成
	var nodeCount = nodeList.length;
	var newNodes = [];
	for (var i = 0; i < nodeCount; i++) {
		var localNode = nodeList[i].nodeName === 'CTD' ?
			TableCellElement.createNew() : MatrixCellElement.createNew();
		newNodes.push(localNode);
	}

	// 最初のセルの子供の先頭ノードが、新しいキャレット位置になります。
	var postCaretId = newNodes[0].firstChild.id;

	var resultObj = {};
	resultObj.newNodes = newNodes;
	resultObj.postCaretId = postCaretId;
	return resultObj;
}

RangedEditor.readyToMultiPara = function(nodeList) {

	// ---- 操作対象となる段落ノードの一覧を作成
	var paragraphList = DataClass.targetParagraphs(nodeList);

	var headNodes  = []; // 先頭段落の残されるノード
	var tailNodes  = []; // 最終段落の残されるノード
	var extraNodes = []; // まきぞえ段落内の全ノード

	// ---- 範囲の最初の要素が段落でないなら、退避すべきノードがあります。
	var firstNode    = nodeList[0];
	if (firstNode.nodeName != 'PARAGRAPH') {
		newParagraph = Paragraph.createNew(true);
		var paraNode   = firstNode.parentNode;
		var children   = paraNode.children;
		var childCount = children.length;
		for (var i = 0; i < childCount; i++) {
			var localNode = children[i];
			if (localNode == firstNode) break;
			headNodes.push(localNode);
		}
	}

	// ---- 範囲の最後の要素が段落でないなら、退避すべきノードがあります。
	var postCaretId = null;                        // 削除操作後のキャレット ID
	var nodeCount   = nodeList.length;
	var lastNode    = nodeList[nodeCount - 1];
	var extraParagraph = null;
	if (lastNode.nodeName != 'PARAGRAPH') {
		var paraNode   = lastNode.parentNode;
		var children   = paraNode.children;
		var childCount = children.length;
		var leftFlag   = false;
		for (var i = 0; i < childCount; i++) {
			var localNode = children[i];
			if (leftFlag) tailNodes.push(localNode);
			if (localNode == lastNode) leftFlag = true;
		}
		// ---- 退避されたノードの先頭ノードが、新しいキャレット位置になります。
		postCaretId = tailNodes[0].id;
	} else {
	// ---- 範囲の最後の要素が段落であるなら、退避ノードはない代わりに、次段の段落が新規段落へ結合されます。
		extraParagraph = lastNode.nextSibling; // ここでの lastNode は 段落です。
		if (extraParagraph) {
			var extraChild = extraParagraph.children;
			var extraCount = extraChild.length;
			for (var i = 0; i < extraCount; i++) { extraNodes.push(extraChild[i]); }
		}
		// ---- 次段の段落の先頭ノードが、新しいキャレット位置になります。
		postCaretId = extraNodes[0].id;
	}

	// ---- 全削除でない場合は、新規段落を生成します。
	var newParagraph = (headNodes.length || tailNodes.length || extraNodes.length) ?
		Paragraph.createNew(true) : null;
	if (newParagraph) {
		// ---- 段落のステータスをコピーします。
		var originalPara = paragraphList[0];
		Paragraph.doop(originalPara);
		Paragraph.doop(newParagraph);
		newParagraph.fontSize = originalPara.fontSize;
		newParagraph.align    = originalPara.align;
	}

	// ---- まきぞえ段落がある場合、その段落を保存対象とします。
	if (extraParagraph) paragraphList.push(extraParagraph);

	// ---- 段落挿入操作の基準となるノードを記録しておきます。
	var newParaTarget = paragraphList[paragraphList.length - 1].nextSibling;

	// ---- Undo時の基準段落ノードを記録しておきます。
	var paraCount     = paragraphList.length;
	var baseParagraph = paragraphList[paraCount - 1].nextSibling;
	var baseSection   = paragraphList[0].parentNode;

	// 値を返します。
	var resultObj = {};
	resultObj.paragraphList = paragraphList; // 対象段落リスト: この段落が、削除 / Undo されます。
	resultObj.newParagraph  = newParagraph;  // 新規段落:       null の場合、単純削除です。
	resultObj.headNodes     = headNodes;     // 頭ノード:       先頭に残されるノードです。
	resultObj.tailNodes     = tailNodes;     // 尾ノード:       末尾に残されるノードです。
	resultObj.extraNodes    = extraNodes;    // 追加段落:       結合される段落のすべての子ノードです。
	resultObj.newParaTarget = newParaTarget; // 段落挿入操作の基準ノード。
	resultObj.postCaretId   = postCaretId;   // 削除操作後のキャレット ID
	resultObj.baseParagraph = baseParagraph; // Undo時に元ノードを復活させるための基準段落ノード
	resultObj.baseSection   = baseSection;   // Undo時に元ノードを復活させるためのセクションノード
	return resultObj;
}

RangedEditor.readyToGroupChildren = function(nodeList) {

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録用
	var paragraphList = [ DataClass.getRootParagraph(nodeList[0]) ];

	var parentNode = nodeList[0].parentNode;
	var nodeCount  = nodeList.length;
	var baseNode   = nodeList[nodeCount - 1].nextSibling;

	// 値を返します。
	var resultObj = {};
	resultObj.paragraphList = paragraphList; // 対象段落リスト: rederer.update 対象です。
	resultObj.parentNode    = parentNode;    //
	resultObj.baseNode      = baseNode;      //
	resultObj.postCaretId   = baseNode.id;   // 削除操作後のキャレット ID
	return resultObj;
};



// ---- static void 範囲削除を行います。
RangedEditor.removeMultiNode = function(prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト

	var operationType = prepData.operationType;
	switch (operationType) {
	case MULTI_EDIT_TYPE.PARAGRAPH:
		// 段落処理なら
		RangedEditor.removeMultiParagraph(prepData);
		break;

	case MULTI_EDIT_TYPE.GROUP:
		// グループ内処理なら
		RangedEditor.removeGroupChildren(prepData);
		break;

	case MULTI_EDIT_TYPE.CELL:
		// セル処理なら
		RangedEditor.removeCells(prepData, false);
		break;
	}
};

// ---- static void セル要素を消去
RangedEditor.removeCells = function(prepData, undoFlag) {
	var renderer     = ViewManager.getRenderer();
	var srcNodeList  = prepData.nodeList;
	var destNodeList = prepData.newNodes;
	if (undoFlag) {
		srcNodeList  = prepData.newNodes;
		destNodeList = prepData.nodeList;
	}
	var nodeCount    = srcNodeList.length;
	// ---- 対象要素を削除します。
	var parentNode = srcNodeList[0].parentNode;
	for (var counter = 0; counter < nodeCount; counter++) {
		parentNode.replaceChild(destNodeList[counter], srcNodeList[counter]);
	}
	// ---- レンダラへ段落更新を通知
	var targetParagraph = DataClass.getRootParagraph(parentNode);
	renderer.setUpdatedParagraph(targetParagraph);
};

RangedEditor.undoCells = function(prepData) {
	var renderer  = ViewManager.getRenderer();
	var nodeList  = prepData.nodeList;
	var newNodes  = prepData.newNodes;
	var nodeCount = nodeList.length;
	// ---- 対象要素を削除します。
	var parentNode = nodeList[0].parentNode;
	for (var counter = 0; counter < nodeCount; counter++) {
		parentNode.replaceChild(nodeList[counter], newNodes[counter]);
	}
	// ---- レンダラへ段落更新を通知
	var targetParagraph = DataClass.getRootParagraph(parentNode);
	renderer.setUpdatedParagraph(targetParagraph);
}

// ---- static void グループ内の要素を消去
RangedEditor.removeGroupChildren = function(prepData) {
	var renderer = ViewManager.getRenderer();
	var nodeList = prepData.nodeList;
	// ---- 対象子要素を削除します。
	var parentNode = prepData.parentNode;
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) { parentNode.removeChild( nodeList[i] ); };

	// ---- レンダラへ段落更新を通知
	var paragraphList = prepData.paragraphList;
	renderer.setUpdatedParagraph( paragraphList[0] );
};



// ---- static void グループ内要素消去を Undo
RangedEditor.undoGroupChildren = function(prepData) {
	var renderer = ViewManager.getRenderer();
	var parentNode = prepData.parentNode;
	var baseNode   = prepData.baseNode;
	var nodeList   = prepData.nodeList;
	var nodeCount  = nodeList.length;
	for (var i = 0; i < nodeCount; i++) { parentNode.insertBefore( nodeList[i], baseNode); };

	// ---- レンダラ
	var paragraphList = prepData.paragraphList;
	renderer.setUpdatedParagraph( paragraphList[0] );
};


// ---- 複数段落を削除します。
RangedEditor.removeMultiParagraph = function(prepData) {
	var renderer      = ViewManager.getRenderer();
	var nodeList = prepData.nodeList;
	// ---- 対象段落を削除します。
	var paragraphList = prepData.paragraphList;
	var firstPara     = paragraphList[0];       // リスト内の最初の段落
	var paraParent    = firstPara.parentNode;
	var paraCount     = paragraphList.length;
	for (var i = paraCount - 1; i >= 0; i--) {
		var localPara = paragraphList[i];
		paraParent.removeChild(localPara);
		renderer.setRemovedParagraph(localPara.id);
	}

	// ---- 必要なら新規段落を挿入します。
	var newParagraph = prepData.newParagraph; // 新規段落
	if (newParagraph) {
		// ---- ノードの引越しを行います。
		// 先頭に残されるノードを、新規段落へ引っ越します。
		var headNodes    = prepData.headNodes;    // 先頭に残されるノードの配列
		var headCount    = headNodes.length;
		for (var i = 0; i < headCount; i++)  { newParagraph.appendChild(headNodes[i]);  };
		// 末尾に残されるノードを、新規段落へ引っ越します。
		var tailNodes    = prepData.tailNodes;    // 末尾に残されるノードの配列
		var tailCount    = tailNodes.length;
		for (var i = 0; i < tailCount; i++)  { newParagraph.appendChild(tailNodes[i]);  };
		// まきぞえ段落のノードを、新規段落へ引っ越します。
		var extraNodes    = prepData.extraNodes;  // まきぞえ段落のノードの配列
		var extraCount    = extraNodes.length;
		for (var i = 0; i < extraCount; i++) { newParagraph.appendChild(extraNodes[i]); };

		// ---- 段落挿入を行います。
		var newParaTarget = prepData.newParaTarget;
		Section.doop(paraParent);
		paraParent.insertParagraph(newParagraph, newParaTarget);    // 段落挿入
		renderer.setInsertedParagraph(newParagraph, newParaTarget); // レンダラへ段落追加を通知
	}
};



// ----
RangedEditor.undoMultiParagraph = function(prepData) {
	var renderer    = ViewManager.getRenderer();

	var baseSection = prepData.baseSection;     // Undo時に元ノードを復活させるためのセクションノード
	Section.doop(baseSection);                  // doop
	var paragraphList = prepData.paragraphList;      // 削除された段落リスト
	var paraCount     = paragraphList.length;

	// ---- 新規段落を削除
	var newParagraph  = prepData.newParagraph;  // 新規段落
	if (newParagraph) {
		// ---- 段落ノード取得
		var extraNodes     = prepData.extraNodes;          // まきぞえ段落のノードの配列
		var extraCount     = extraNodes.length;
		var extraParagraph = null;
		var tailParagraph  = null;
		var headParagraph  = paragraphList[0];             //
		if (extraCount) {                                  // ---- まきぞえ段落があるなら
			extraParagraph = paragraphList[paraCount - 1];
			tailParagraph  = paragraphList[paraCount - 2];
		} else {          // ---- まきぞえ段落がないなら
			tailParagraph  = paragraphList[paraCount - 1];
		}

		// ---- 新規段落から、まきぞえ段落の子ノードを、呼び戻します。
		for (var i = 0; i < extraCount; i++) {
			extraParagraph.appendChild(extraNodes[i]);
		};
		// ---- 新規段落から、末尾段落の子ノードを、呼び戻します。
		var tailNodes    = prepData.tailNodes;    // 末尾に残されるノードの配列
		var tailCount    = tailNodes.length;
		for (var i = 0; i < tailCount; i++)  {
			tailParagraph.appendChild(tailNodes[i]);
		};
		// ---- 新規段落から、先頭に残されたノードを、呼び戻します。
		var headNodes    = prepData.headNodes;    // 先頭に残されるノードの配列
		var headCount    = headNodes.length;
		var baseNode     = headParagraph.children[0];
		for (var i = 0; i < headCount; i++)  {
			headParagraph.insertBefore(headNodes[i], baseNode);
		};
		baseSection.removeParagraph(newParagraph);
		renderer.setRemovedParagraph(newParagraph.id);   // レンダラへ段落削除を登録
	}

	// ---- 削除された段落を復活
	var baseParagraph = prepData.baseParagraph;      // Undo時に元ノードを復活させるための基準段落ノード
	for (var i = 0; i < paraCount; i++) {
		var localParagraph = paragraphList[i];
		baseSection.insertParagraph(localParagraph, baseParagraph);   // 段落復活
		renderer.setInsertedParagraph(localParagraph, baseParagraph); // レンダラへ登録
	}
};



RangedEditor.undoRemoveMultiNode = function(prepData) {
	var operationType = prepData.operationType;
	switch (operationType) {
	case MULTI_EDIT_TYPE.PARAGRAPH:
		// 段落処理なら
		RangedEditor.undoMultiParagraph(prepData);
		break;

	case MULTI_EDIT_TYPE.GROUP:
		// グループ内処理なら
		RangedEditor.undoGroupChildren(prepData);
		break;

	case MULTI_EDIT_TYPE.CELL:
		// セル処理なら
		RangedEditor.removeCells(prepData, true);
		break;

	}
};



// ************************************************************************
// **                              複数挿入                              **
// ************************************************************************


//const MULTI_EDIT_TYPE = {
//	'GROUP'     : 'GROUP',
//	'PARAGRAPH' : 'PARAGRAPH',
//	'CELL'      : 'CELL',
//};

RangedEditor.prepareInsertMulti = function(prevsize, srcNodeList, caret) {

	var caretId = caret.pos;

	// ---- フォーマッタによるノードリストの整形
	var baseNode = DocumentManager.getNodeById(caretId);	// ペースト先の基準ノードを決定します。
	var parentNode = baseNode.parentNode;
	DataClass.bindDataClassMethods(parentNode);
	// baseNode の直上の親が 段落なら 段落展開無し、それ以外なら段落展開
	var isDevelop = (baseNode.parentNode.nodeName != 'PARAGRAPH');
	// 親が数式・化学式なら、テーブル、画像、ルビを削除する。また、テキスト→数式変換を行う。
	// なお、数式・化学式の場合は、フォーマッタ内部で isDevelop が自動的に true にされる (段落展開を行う)。
	var xmlType = parentNode.nt;
	var formedNodeList = Formatter.formatForInsert(srcNodeList, isDevelop, xmlType);

	// ---- グループ内操作か、段落操作か判別します。
	var operationType = MULTI_EDIT_TYPE.PARAGRAPH;
	if (isDevelop || xmlType != CIO_XML_TYPE.text) { // ---- 段落展開が行われた場合は、
		operationType = MULTI_EDIT_TYPE.GROUP;               // グループ内処理である。
	} else {                                         // ---- 段落展開が行われなかった場合は、
		// ---- 段落をまたがない構成なら、グループ内処理である。
		// prevsize がノードリストのサイズより小さければ、段落変更が存在する。
		var srcNodeSize = srcNodeList.length;
		if (prevsize == srcNodeSize) operationType = MULTI_EDIT_TYPE.GROUP;
	}

	// ---- グループ内処理もしくは、段落操作処理用の前処理を行います。
	var prepData = (operationType == MULTI_EDIT_TYPE.GROUP) ?
		RangedEditor.readyToGroupInsert(formedNodeList) :                   // グループ処理用準備
		RangedEditor.readyToParaInsert(prevsize, formedNodeList, baseNode); // 段落　　処理用準備

	// ---- 返値を用意します。
	prepData.caretId        = caretId;         // 最初のキャレット ID
	prepData.prevsize       = prevsize;        // 段落変更が起きるまでのノードの個数
	prepData.srcNodeList    = srcNodeList;     // もともとのノードリスト
	prepData.formedNodeList = formedNodeList;  // 整形後のノードリスト
	prepData.operationType  = operationType;   // 操作種類: 段落処理か、グループ内処理か。
	prepData.baseNode       = baseNode;        // 挿入基準位置
	prepData.stackCost      = DataClass.estimateStackCost(formedNodeList); // 要素数からスタックコストを算出します。
	return prepData;
};

// ---- グループ処理用の準備を行います。
RangedEditor.readyToGroupInsert = function(formedNodeList){
	var prepData = {};
	return prepData;
};



// ---- 段落処理用の準備を行います。
RangedEditor.readyToParaInsert = function(prevsize, formedNodeList, baseNode) {
	// ---- 貼り付けデータの先頭ノードを記録します。
	var headNodes = [];
	for (var headCount = 0; headCount < prevsize; headCount++) {
		headNodes.push(formedNodeList[headCount]);
	}
	headNodes = DataClass.pickUpParaChildren(headNodes); // 段落の場合、展開します。
	// ---- 貼り付けデータの中間段落ノードを記録します。
	var nodeCount = formedNodeList.length;
	var midNodes = [];
	for (var nodeIdx = headCount; nodeIdx < nodeCount; nodeIdx++) {
		var localNode = formedNodeList[nodeIdx];
		if (localNode.nodeName == 'PARAGRAPH') {
			midNodes.push(formedNodeList[nodeIdx]);
		} else {
			break;
		}
	}
	// ---- 貼り付けデータの末尾ノードを記録します。
	var tailNodes = [];
	for (var tailIdx = nodeIdx; tailIdx < nodeCount; tailIdx++) {
		tailNodes.push( formedNodeList[tailIdx] );
	}

	// ---- 追加先段落を取得します。
	var targetParagraph = DataClass.getRootParagraph(baseNode)
	Paragraph.doop(targetParagraph);                 // doop

	// 既存ノードの要引越しノードを記録します。
	var movedNodes = [];
	var targetNode = baseNode;
	while (targetNode !== null) {
		movedNodes.push(targetNode);
		targetNode = targetNode.nextSibling;
	}

	// ---- 新規段落を作成します。
	var newParagraph = Paragraph.createNew(true);     // 改行要素すら含まない完全に空の段落ノードを作成します。
	Paragraph.doop(newParagraph);                     // doop
	newParagraph.align    = targetParagraph.align;    // アライン属性引き継ぎ
	newParagraph.fontSize = targetParagraph.fontSize; // フォントサイズ引き継ぎ

	var prepData = {};
	prepData.headNodes       = headNodes;
	prepData.midNodes        = midNodes;
	prepData.tailNodes       = tailNodes;
	prepData.targetParagraph = targetParagraph;
	prepData.movedNodes      = movedNodes;
	prepData.newParagraph    = newParagraph;
	return prepData;
};



// ---- static void 範囲削除を行います。
RangedEditor.insertMultiNode = function(prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト

	var operationType = prepData.operationType;
	switch (operationType) {
	case MULTI_EDIT_TYPE.PARAGRAPH:
		// 段落処理なら
		RangedEditor.insertMultiParagraph(prepData);
		break;

	case MULTI_EDIT_TYPE.GROUP:
		// グループ内処理なら
		RangedEditor.insertGroupChildren(prepData);
		break;
	}
};

// ---- static void 範囲削除を Undo します。
RangedEditor.UndoInsertMultiNode = function(prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト

	var operationType = prepData.operationType;
	switch (operationType) {
	case MULTI_EDIT_TYPE.PARAGRAPH:
		// 段落処理なら
		RangedEditor.UndoInsertMultiParagraph(prepData);
		break;

	case MULTI_EDIT_TYPE.GROUP:
		// グループ内処理なら
		RangedEditor.undoInsertGroupChildren(prepData);
		break;
	}
};

RangedEditor.insertGroupChildren = function(prepData) {
	var renderer = ViewManager.getRenderer();

	// ---- 要素を追加します。
	var formedNodeList = prepData.formedNodeList;
	var baseNode       = prepData.baseNode;
	var parentNode     = baseNode.parentNode;
	var nodeCount      = formedNodeList.length;
	for (var i = 0; i < nodeCount; i++) {
//		parentNode.insertBefore( formedNodeList[i], baseNode);
	    RangedEditor.insertDataNode(parentNode, formedNodeList[i], baseNode);
	}

	// ---- レンダラへ段落更新を通知
	var paragraphNode = DataClass.getRootParagraph(prepData.baseNode)
	renderer.setUpdatedParagraph(paragraphNode);

	console.log('複数挿入：グループ内処理が実行されました。');
};

RangedEditor.insertDataNode = function(parentNode, insertNode, baseNode) {
    parentNode.insertBefore(insertNode, baseNode);

    // アニメーションをコピー＆ペーストした場合を考慮して、cimgのanimationIdを確認します
    RangedEditor.insertAnimation(insertNode);
    if (insertNode.nodeName === 'PARAGRAPH') {
        for (var i=0; i<insertNode.children.length; i++) {
            RangedEditor.insertAnimation(insertNode.children[i]);
        }
    }
}


RangedEditor.insertAnimation = function(imgNode) {
    // 画像ノードでなければ何もしません
    if (imgNode.nodeName !== 'CIMG') return;

    // アニメーションIDを取得します
    DataClass.bindDataClassMethods(imgNode);
    var animationId = imgNode.animationId;

    // アニメーションでなかれば何もしません
    if (animationId === '' || animationId === null) return;

    // 既にアニメーションが存在する場合は、別データとして作成します
    var docId = DocumentManager.getDocId();
    var newAnimationId = DocumentManager.getIdManager().getNewAnimationId();
    Communicator.request('animeGet', {doc_id: docId, animation_id: animationId}, function(res) {
        Communicator.request('animeSave', {doc_id: docId, animation_id: newAnimationId, content: res.content},
                function(){}, g_onFailure);
    }, g_onFailure);

    // 新しいアニメーションIDを設定します
    imgNode.animationId = newAnimationId;
}

RangedEditor.undoInsertGroupChildren = function(prepData) {
	var renderer = ViewManager.getRenderer();

	// ---- 要素を削除します。
	var formedNodeList = prepData.formedNodeList;
	var baseNode       = prepData.baseNode;
	var parentNode     = baseNode.parentNode;
	var nodeCount      = formedNodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		parentNode.removeChild( formedNodeList[i] );
	}

	// ---- レンダラへ段落更新を通知
	var paragraphNode = DataClass.getRootParagraph(prepData.baseNode)
	renderer.setUpdatedParagraph(paragraphNode);

	console.log('複数挿入：グループ内処理が Undo されました。');
};

// ---- 段落またぎの複数挿入を行います。
RangedEditor.insertMultiParagraph = function(prepData) {
	var renderer = ViewManager.getRenderer();

	// ---- 挿入先段落へ、貼り付けデータの先頭ノードを追加します。
	var targetParagraph = prepData.targetParagraph;
	var baseNode  = prepData.baseNode; // 挿入基準位置ノード
	var headNodes = prepData.headNodes;
	var headCount = headNodes.length;
	for (var headIdx = 0; headIdx < headCount; headIdx++) {
	//		targetParagraph.insertBefore(headNodes[headIdx], baseNode);
	    RangedEditor.insertDataNode(targetParagraph, headNodes[headIdx], baseNode);
	}
	renderer.setUpdatedParagraph(targetParagraph);

	// ---- 挿入先段落の後へ、貼り付けデータの中間段落を挿入します。
	var midNodes = prepData.midNodes;                    // 中間段落ノードリスト
	var midCount = midNodes.length;                      // 中間段落数
	var section  = targetParagraph.parentNode;           // 親セクション
	var baseParagraph = targetParagraph.nextSibling;     // 挿入基準位置段落
	for (var midIdx = 0; midIdx < midCount; midIdx++) {
		var localParagraph = midNodes[midIdx];
		//section.insertBefore(localParagraph, baseParagraph);
		RangedEditor.insertDataNode(section, localParagraph, baseParagraph);
		renderer.setInsertedParagraph(localParagraph, baseParagraph);
	}

	// ---- 新規段落を挿入します。
	var newParagraph = prepData.newParagraph;
	section.insertBefore(newParagraph, baseParagraph);
	renderer.setInsertedParagraph(newParagraph, baseParagraph);

	// ---- 新規段落へ、貼り付けデータの末尾ノードを挿入します。
	var tailNodes = prepData.tailNodes;
	var tailCount = tailNodes.length;
	for (var tailIdx = 0; tailIdx < tailCount; tailIdx++) {
		//newParagraph.insertBefore(tailNodes[tailIdx], null);
	    RangedEditor.insertDataNode(newParagraph, tailNodes[tailIdx], null);
	}

	// ---- 新規段落へ、既存ノードの要引越しノードを挿入します。
	var movedNodes = prepData.movedNodes;
	var movedCount = movedNodes.length;
	for (var moveIdx = 0; moveIdx < movedCount; moveIdx++) {
		newParagraph.insertBefore(movedNodes[moveIdx], null);
	}

	prepData.targetSection = null;

	if (targetParagraph.children.length === 0) {
		prepData.targetSection = targetParagraph.parentNode;
		prepData.emptyParagraph = targetParagraph;
		prepData.postRemovedParagraph = targetParagraph.nextSibling;

		prepData.targetSection.removeChild(targetParagraph);
	}

	console.log('複数挿入：段落処理が実行されました。');
};

// ---- 段落またぎの複数挿入を Undo します。
RangedEditor.UndoInsertMultiParagraph = function(prepData) {
	if (prepData.targetSection != null) {
		prepData.targetSection.insertBefore(prepData.emptyParagraph, prepData.postRemovedParagraph);
	}

	var renderer = ViewManager.getRenderer();

	// ---- 挿入先段落から、貼り付けデータの先頭ノードを削除します。
	var targetParagraph = prepData.targetParagraph;
	var headNodes = prepData.headNodes;
	var headCount = headNodes.length;
	for (var headIdx = 0; headIdx < headCount; headIdx++) {
		targetParagraph.removeChild(headNodes[headIdx]);
	}

	// ---- 新規段落から既存ノードへ、引越されたノードを呼び戻します。
	var movedNodes = prepData.movedNodes
	var movedCount = movedNodes.length;
	for (var moveIdx = 0; moveIdx < movedCount; moveIdx++) {
		targetParagraph.insertBefore(movedNodes[moveIdx], null);
	}
	renderer.setUpdatedParagraph(targetParagraph); // 既存ノードの Undo 完了

	// ---- 貼り付けデータの中間段落を削除します。
	var midNodes = prepData.midNodes;
	var midCount = midNodes.length;
	var section  = targetParagraph.parentNode;
	for (var midIdx = 0; midIdx < midCount; midIdx++) {
		var localParagraph = midNodes[midIdx];
		section.removeChild(localParagraph);
		renderer.setRemovedParagraph(localParagraph.id);
	}

	// ---- 新規段落を削除します。
	var newParagraph = prepData.newParagraph;
	section.removeChild(newParagraph);
	renderer.setRemovedParagraph(newParagraph.id);

	console.log('複数挿入 Undo：段落処理が Undo されました。');
};



