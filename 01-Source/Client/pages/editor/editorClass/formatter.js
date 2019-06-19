/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月09日                         */

// ---- コンストラクタ
function Formatter(){};

// ---- 複数挿入のためのノードリスト整形処理
Formatter.formatForInsert = function(srcNodeList, isDevelop, xmlType) {
	// srcNodeList : クリップボードマネージャから受け取ったノードリスト
	// isDevelop   : 段落を展開するかどうか。
	// xmlType     : CIO_XML_TYPE.text / math / chemical
	
	var isMath = (xmlType != CIO_XML_TYPE.text); // 数式系かどうか true = 数式系
	if (xmlType != CIO_XML_TYPE.text) isDevelop = true; // 数式系の場合、段落展開が強制されます。
		
	// ---- 段落展開
	var formedNodeList = isDevelop ? DataClass.pickUpParaChildren(srcNodeList) : srcNodeList.concat();

	// ---- 数式系専用処理
	if (isMath) {
		var forbiddenNodeNames = ['CTABLE', 'CIMG', 'CRUBY']; // 数式・化学式では、テーブル、画像、ルビを削除する。
		formedNodeList = Formatter.omitNodesFromList(formedNodeList, forbiddenNodeNames); // 禁止タグ削除
		formedNodeList = Formatter.convertTextToMath(formedNodeList, xmlType);            // テキスト→数式変換
	}

	return formedNodeList;
};



// ---- ノードリストから、指定したノードを除外します。
Formatter.omitNodesFromList = function(srcNodeList, nodeNames) {
	// srcNodeList         : 対象ノードリスト
	// nodeNames           : 除外したいノード名の配列、ノード名は大文字
	// 返値 localNodeList  : srcNodeList から nodeNames に該当するノードを除外した、新しい配列
	
	var localNodeList = [];                             // 処理後のノードリスト
	var nameCount     = nodeNames.length;               // 除外したいノード名の数
	var nodeCount     = srcNodeList.length;             // ノードリストの要素数
	for (var i = 0; i < nodeCount; i++) {               // ---- ノードリスト内のノード数分ループ
		var localNode     = srcNodeList[i];                     // ノード
		var localNodeName = localNode.nodeName;                 // ノード名
		var targetFlag    = true;                               // targetFlag は立てておく
		for (var nameIdx = 0; nameIdx < nameCount; nameIdx++) { // ---- 検索するノード名数分ループ
			if (localNodeName == nodeNames[nameIdx]) {                  // ---- 除外したいノード名に該当するなら
				targetFlag = false;                                             // targetFlag を落として
				break;                                                          // 内側ループ中断
			}
		}
		if (targetFlag) localNodeList.push(localNode);          // targetFlag が立っているなら (残すノードなら) 記録
	}
	return localNodeList;                               // ノードリストを返す。
};



// ---- ノードをテキストから数式系へ変換します。
Formatter.convertTextToMath = function(srcNodeList, xmlType) {
	var convertedNodeList = [];                             // 変換後のノードリスト
	var nodeCount         = srcNodeList.length;             // ノード数
	for (var nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) { // ---- ノードリスト内のノード数分ループ
		var localNode = srcNodeList[nodeIdx];                       // ローカルノード
		DataClass.bindDataClassMethods(localNode);                  // doop
		if (localNode.nt == CIO_XML_TYPE.text) {                    // ---- テキストなら
			var nodeName = localNode.nodeName;                              // ノード名
			if (nodeName == 'C') {                                          // ---- キャラクタノードなら
				var strBase = localNode.textContent;
				localNode = CornerElement.createNew(strBase, xmlType);      // 新しい CornerElement を作成
			}
		} else {                                                    // ---- 数式系なら
			localNode.setAttribute('nt', xmlType);                          // 属性だけ変更
		}
		convertedNodeList.push(localNode);                          // 変換後のノードを格納
	}
	return convertedNodeList;
};



