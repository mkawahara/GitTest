function DataClass() {};
DataClass.idManagerObj = null; // IDマネージャインスタンスへの参照

/**
 * IDマネージャインスタンスへの参照を取得します。
 * ※繰り返し実行しても問題ありません。
 */
DataClass.setIDManager = function() {
	// メモ: DocumentManager getIdManager()でインスタンスを取得できます。
	if (DataClass.idManagerObj == null) DataClass.idManagerObj = DocumentManager.getIdManager();
};

/**
 * 新しいノード ID を取得します。
 */
DataClass.getNewNodeID = function() {
	DataClass.setIDManager();
	return DataClass.idManagerObj.getNewNodeId();
};

/**
 * 新しいパラグラフ ID を取得します。
 */
DataClass.getNewParagraphID = function() {
	DataClass.setIDManager();
	return DataClass.idManagerObj.getNewParagraphId();
};


// 親 Paragraph ノードを取得します。
DataClass.getRootParagraph = function(node) {
	while (node.nodeName !== 'PARAGRAPH') {
		node = node.parentNode;
	};

	return node;
};

/**
 * 系統上の最寄りのセルノードを取得します。
 * セルが存在しなかった場合、null を返します。
 */
DataClass.getNearTableCell = function(node) {
	while ((node !== null) && (node.nodeName !== 'CTD')) {
		node = node.parentNode;
	};

	return node;
};

// ---- ノードレベルを指定ノード直下まで引き上げます。
DataClass.adjustNodeLevel = function(parent, node) {
	while (node.parentNode !== parent) node = node.parentNode;
	return node;
};



DataClass.getParentChildRelatioShip = function (selector) {
	// どちらかが、片方の親ノードであれば、その時点で親を決められる。
	var parent = null;
	var doc = DocumentManager.getDocument();
	var els = $(doc).find(selector);
	var nodeA = els[0];
	var nodeB = els[1];

	// 親子関係を見る
	var doc_pos = nodeA.compareDocumentPosition(nodeB);
	if(doc_pos & document.DOCUMENT_POSITION_CONTAINS){
		parent = nodeB;
	}
	if(doc_pos & document.DOCUMENT_POSITION_CONTAINED_BY){
		parent = nodeA;
	}

	return parent;
}


// ---- jquery セレクタに一致する複数ノード間で共通する親ノードを取得します。
DataClass.getSharedParent = function (selector) {

    var base, temp, parent;
	var doc = DocumentManager.getDocument();
	var els = $(doc).find(selector);

    if (!els.length) {
        return;
    } else if(1 === els.length) {
        return els.first().parent();
    }

    els.each(function(i) {
        var e = $(this);
        if (0 === i) {
            base = e;
            parent = e.parent().get(0);
        } else {
            temp = e.parents().has(els.eq(i - 1)).first().get(0);
            if (parent !== temp) {
                parent = e.parents().has(base).first().get(0);
            }
        }
    });

    return parent;
};



// ---- static {} 開始位置と終了位置の前後関係を把握し、内部処理的にどちらを真の開始点 (若い点) とするかを決めます。
DataClass.sortNodePair = function(startNode, endNode) {
    // 同じノードのときは処理に失敗するので回避
    if (startNode == endNode) return {'startNode' : startNode, 'endNode' : endNode};

	var localStartNode = startNode;         // 範囲開始ノードへの参照
	var localEndNode   = endNode;           // 範囲終了ノードへの参照
	var startId        = localStartNode.id; // 範囲開始ノードの ID
	var endId          = localEndNode.id;   // 範囲終了ノードの ID

	var selectorString = '#' + startId + ' , #' + endId;

	// 親子関係にあれば、親のみ選択します。
	var parent = DataClass.getParentChildRelatioShip(selectorString);
	if (parent !== null) {
		return {'sharedParentNode' : parent.parentNode, 'startNode' : parent, 'endNode' : parent.nextSibling};
	}

	// まず、共通の親ノードを特定します。
	var sharedParentNode = DataClass.getSharedParent(selectorString);
	// 若いノードを、開始点側へ設定し直します。
	var childCount = sharedParentNode.children.length;
	for (var i = 0; i < childCount; i++) {
		var localChild = sharedParentNode.children[i];
		// startId の方が先に出現したなら、開始・終了ノードはそのまま
		if (localChild.id == startId || $(localChild).find('#' + startId)[0] !== undefined) break;
		// endId の方が先に出現したなら、開始・終了ノードを一時的に入れ替える
		if (localChild.id == endId   || $(localChild).find('#' + endId)[0]   !== undefined) {
			localStartNode = endNode;     // 真の範囲開始ノードへの参照
			localEndNode   = startNode;   // 真の範囲終了ノードへの参照
			break;
		}
	}

	return {'sharedParentNode' : sharedParentNode, 'startNode' : localStartNode, 'endNode' : localEndNode};
}


// ---- static [] 操作対象となる段落ノードの一覧を作成: レンダラ登録等に便利。
DataClass.targetParagraphs = function(nodeList) {
	var paragraphList = [];
	var preParagraph = null;
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		var localParagraph = DataClass.getRootParagraph(nodeList[i]);
		if (localParagraph != preParagraph) paragraphList.push(localParagraph);
		preParagraph = localParagraph;
	}
	return paragraphList;
};

/**
 * テキストアラインの設定対象になり得るノードリストを抽出します。
 * @param nodeList
 */
DataClass.getAlignTargetNodes = function(nodeList) {
	// 自身以上で検出された最寄りの段落・テーブルセルのみが対象。
	//
	var preGotNode = null;
	var targetNodeList = [];

	for (var i = 0; i < nodeList.length; i++) {
		var currentTarget = DataClass.getNearestAlignTarget(nodeList[i]);
		if (currentTarget === null) continue;
		if (currentTarget === preGotNode) continue;

		targetNodeList.push(currentTarget);
		preGotNode = currentTarget;
	};

	return targetNodeList;
};

/**
 * 指定ノードに最も近い、アライン設定対象となり得るノードを１つ取得します。
 * @param node
 */
DataClass.getNearestAlignTarget = function(node) {
	while (node !== null) {
		if ((node.nodeName === 'CTD') || (node.nodeName === 'PARAGRAPH')) return node;
		node = node.parentNode;
	}

	return null;
};

// ---- static [] 操作対象となる全ての要素をリスト化します。
DataClass.pickUpAllNodes = function(nodeList) {
	var nodeDetailList = [];
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) { // ---- nodeList 分ループ
		var localNode = nodeList[i];
		nodeDetailList.push(localNode);
		$(localNode).find('*').each( function(j) { nodeDetailList.push(this); });
	}
	return nodeDetailList;
};

// ---- static [] 段落ノードは展開し、それ以外の要素はそのままリスト化します。
DataClass.pickUpParaChildren = function(nodeList) {
	var nodeDetailList = [];
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) { // ---- nodeList 分ループ
		var localNode = nodeList[i];
		if (localNode.nodeName == 'PARAGRAPH') { // ---- 段落ノードなら
			var localChildren   = localNode.children;    // 子ノードを抽出します。
			var localChildCount = localChildren.length;
			for (var j = 0; j < localChildCount; j++) { nodeDetailList.push(localChildren[j]); };
		} else {                                 // ---- 段落ノード以外なら
			nodeDetailList.push(localNode);              // そのまま記録します。
		}
	}
	return nodeDetailList;
};

// ---- ノードリスト内の要素について、その ID と現在のプロパティ状態をリスト化します。
// 子孫要素については。考慮しません。
DataClass.pickUpTargetNodes = function(propName, nodeList) {
	// propName [文字列]   : プロパティ名　例 uline
	// nodeList [DOM配列]  : 範囲内のすべてのノード
	var propList = [];
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		var localNode = nodeList[i];
		DataClass.bindDataClassMethods(localNode); // doop
		var propFlag = localNode[propName];            // 属性値取得
		if (propFlag !== undefined) {                  // ---- 属性値が定義されている
			propList.push({'node' : localNode, 'propValue' : propFlag}); // 記録
		}
	}
	return propList;
};

// ---- static void 操作対象ノードへ、プロパティ指定を行います。
DataClass.setLetterProperty = function(propName, propValue, propList) {
	var renderer = ViewManager.getRenderer();
	var propCount = propList.length;       // 上記情報の個数
	for (var i = 0; i < propCount; i++) {  // ---- 対象情報数分だけループ
		var localPropList = propList[i];           // ローカルなプロパティい設定対象要素情報
		var localNode     = localPropList.node;    // 対象ノードへの参照
		// プロパティ指定値を用いるか、元に戻すかがここで指定されます。
		var localPropValue = propValue !== null ? propValue : localPropList.propValue;
		DataClass.bindDataClassMethods(localNode); // doop
		localNode[propName] = localPropValue;      // プロパティ指定を反映
		if (localNode.nt != CIO_XML_TYPE.text) renderer.setUpdatedNode(localNode);
	}
};



// ---- ノードリストから、スタックコストを推定します。
DataClass.estimateStackCost = function(nodeList) {
	// ---- 要素数からスタックコストを算出します。
	var nodeDetailList  = DataClass.pickUpAllNodes(nodeList); // 操作対象となる全ての要素をリスト化します。
	var stackCost       = 0;
	var nodeDetailCount = nodeDetailList.length;
	for (var i = 0; i < nodeDetailCount; i++) {                // ---- 要素数分ループ
		var localCost = 1;                                             // 該当ノードのスタックコスト値
		var localNode = nodeDetailList[i];                             // ノードへの参照
		var localNodeName = localNode.nodeName;                        // ノードの名前
		if (localNodeName == 'CIMG') localCost = 50;                   // 画像は大きめに見積もります。
		stackCost += localCost;
	}
	return stackCost;
}

// ---- ノードへ ID を振りなおします。
DataClass.remapDataNodeId = function(nodeList) {
	var allNode = DataClass.pickUpAllNodes(nodeList); // 全てのノードをリスト化します
	var allNodeCount = allNode.length;
	for (var i = 0; i < allNodeCount; i++) {          // 全てのノードへ、適切な新しい ID を振りなおします。
		var localNode = allNode[i];
		var localName = localNode.nodeName;
		var id = (localName == 'PARAGRAPH') ? DataClass.getNewParagraphID() : DataClass.getNewNodeID();
		localNode.id = id;
	}
};

/**
 * speaker 属性用クラス文字列を取得します。
 * 取得された文字列には「class=""」は含まれず、class名のみが含まれます。
 */
DataClass.getSpeakerClassStr = function(obj) {
	var spkStr = '';
	// このメソッドは各クラスのtoHtmlからコールされるため、以下は不要と思われます
	//DataClass.bindDataClassMethods(obj);
	if ( obj.speaker !== null) {
		spkStr = 'speaker' + obj.speaker + ' ';
	}
	return spkStr;
};

DataClass.getSilenceClassStr = function(obj) {
// ---- silence 属性用 クラス文字列を取得します。
	var slcStartStr = '';
	var slcEndStr   = '';
	DataClass.bindDataClassMethods(obj);
	if (obj.silence) {
		var paraNode = obj.parentNode;
		DataClass.bindDataClassMethods(paraNode);
		if (obj.nt === CIO_XML_TYPE.text) {
			slcStartStr = '<slc>';
			slcEndStr   = '</slc>';
		}
		else {
			slcStartStr = '<mslc>';
			slcEndStr   = '</mslc>';
		}
	}
	return {'start' : slcStartStr, 'end' : slcEndStr};
};



/**
 * クラスのプロトタイプに他のクラスのプロトタイプを挿入します。
 * ※DOM のノードオブジェクトに対して使用した場合、追加したプロトタイプが喪失することがあります。
 *   そのため、実際にノードオブジェクトに対する拡張機能が必要になる都度、
 *   この関数でプロトタイプを挿入してください。
 */
DataClass.insertPrototype = function(target, insertObj) {
	// 挿入対象のプロトタイプに挿入するクラスを設定
	if (Object.setPrototypeOf) {
		// setPrototypeOf が定義されていれば、それを使用します
		Object.setPrototypeOf(target, insertObj.prototype);
	} else {
		// setPrototypeOf が定義されていない場合、__proto__を直接操作します（非推奨）
		target.__proto__ = insertObj.prototype;
	}
};


/**
 * 子要素の html 出力を１つにまとめた html を取得します。
 * @param children
 * @param xmlType		通常の HTML 出力か、MathML 出力かを指定します
 * @param caretId		現在のカーソル位置を表すIDを指定します
 * @returns {String}
 */
//DataClass.getChildrenHtml = function(children, xmlType, caretId) { 5/1 湯本 xmlType削除
DataClass.getChildrenHtml = function(children, caretId) {
	var result = '';

	for (var i = 0; i < children.length; i++) {
		DataClass.bindDataClassMethods(children[i]);
		result += children[i].toHtml(caretId);
	};

	return result;
};

/**
 * 指定文字列における特定文字の出現回数を取得します
 * @param text
 * @param delimitor
 * @returns {Number}
 */
DataClass.getCharCount = function(text, delimitor) {
	return text.split(delimitor).length - 1;
}

/**
 * このノードが段落直下か否かを判定します
 */
DataClass.isParagraphChild = function(node) {
	if (node.parentNode == (void 0)) return false;

	var nodeName = node.parentNode.nodeName;
	if (nodeName === (void 0)) nodeName = node.parentNode.tagName;
	nodeName = nodeName.toUpperCase();

	return (nodeName == 'PARAGRAPH');
}

/**
 * このノードがテーブルセル直下か否かを判定します
 */
DataClass.isTableCellChild = function(node) {
	if (node.parentNode == (void 0)) return false;

	var nodeName = node.parentNode.nodeName;
	if (nodeName === (void 0)) nodeName = node.parentNode.tagName;
	nodeName = nodeName.toUpperCase();

	return (nodeName == 'CTD');
}


/**
 * 指定したノードオブジェクトに、対応するデータクラスメソッドを追加します。
 * @param nodeObject
 */
DataClass.bindDataClassMethods = function(nodeObject) {
	// nodeObject は undefined であってはならない。
	if (nodeObject == null || nodeObject === void 0) {
		console.log('Error');	// エラー発生時にはここにブレークポイントを設定します。
	}
	var nodeName = nodeObject.nodeName;
	if (nodeName === (void 0)) nodeName = nodeObject.tagName;
	if (nodeName === (void 0)) throw 'ノード名を取得できません。in utility.js line 116';

	switch(nodeName) {
	case 'G':
		GroupElement.doop(nodeObject);
		break;
	case 'PARAGRAPH':
		Paragraph.doop(nodeObject);
		break;
	case 'DECO':
		DecoBoxElement.doop(nodeObject);
		break;
	case 'ENUMBER':
		EquationNumberElement.doop(nodeObject);
		break;
	case 'CRUBY':
		RubyElement.doop(nodeObject);
		break;
	case 'IVBISIBLEELEMENT':
		break;
	case 'CREAD':
		ReadingElement.doop(nodeObject);
		break;
	case 'PHRASE':
		PhraseElement.doop(nodeObject);
		break;

	case 'FRAC':
		FractionElement.doop(nodeObject);
		break;
	case 'ROOT':
		RootElement.doop(nodeObject);
		break;
	case 'CN':
		CornerElement.doop(nodeObject);
		break;
	case 'INT':
		IntegralElement.doop(nodeObject);
		break;
	case 'TPBTM':
		TopBottomElement.doop(nodeObject);
		break;
	case 'TOP':
		TopElement.doop(nodeObject);
		break;
	case 'BTM':
		BottomElement.doop(nodeObject);
		break;
	case 'ULINE':
		UnderlineElement.doop(nodeObject);
		break;
	case 'CTABLE':
		TableElement.doop(nodeObject);
		break;
	case 'CTD':
		TableCellElement.doop(nodeObject);
		break;
	case 'CMAT':
		MatrixElement.doop(nodeObject);
		break;
	case 'COPEN':
		OpenBracketElement.doop(nodeObject);
		break;
	case 'CCLOSE':
		CloseBracketElement.doop(nodeObject);
		break;
	case 'CMATCELL':
		MatrixCellElement.doop(nodeObject);
		break;

	case 'C':
		CharacterElement.doop(nodeObject);
		break;
	case 'CHEMC':
		ChemCharElement.doop(nodeObject);
		break;
	case 'PBREAK':
		PageDelimitor.doop(nodeObject);
		break;
	case 'BR':
		LineBreak.doop(nodeObject);
		break;
	case 'CIMG':
		ImageElement.doop(nodeObject);
		break;
	case 'PAUSE':
		PauseElement.doop(nodeObject);
		break;
	case 'HLCOM':
		HighlightCombineElement.doop(nodeObject);
		break;
	case 'HLDIV':
		HighlightDivideElement.doop(nodeObject);
		break;

	// ---- 特殊 ---- ドキュメント系
	case 'SECTION':
		Section.doop(nodeObject);
		break;
	case 'SECTION_LIST':
		SectionList.doop(nodeObject);
		break;
	};
};

/**
 * 指定リスト中での、指定ノードのインデックスを取得します。
 */
DataClass.getNodeIndex = function(node, nodeList) {
	for (var i = 0; i < nodeList.length; i++) {
		if (node === nodeList[i]) return i;
	}

	return -1;
};

/**
 * 指定名称を有する、指定ノードの直近の祖先ノードを取得します。
 * @param node
 * @param nodeName
 */
DataClass.getClosest = function(node, nodeName) {
	while(node.nodeName !== nodeName) {
		node = node.parentNode;
		if (node === null) return null;
	}

	return node;
};