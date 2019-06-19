/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TableEditor.js                                      */
/* -                                                                         */
/* -    概      要     ： 複合処理層 TableEditorクラス                        */
/* -                                                                         */
/* -    依      存     ： utility.js                                         */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月09日                         */

// ------------- コンストラクタ
function TableEditor(){};



// ************************************************************************
// **                          テーブル新規作成                          **
// ************************************************************************

TableEditor.prepareInsertTable = function(colCount, rowCount, caretId, itemStatus) {

	if (colCount <= 0 || colCount > 500) return null;
	if (rowCount <= 0 || rowCount > 500) return null;

	// ノード作成
	var tableNode = TableElement.createNew(rowCount, colCount); // テーブル作成
	TableElement.doop(tableNode);                               // doop
	tableNode.uline = itemStatus.underline;                     // 下線設定

	var baseNode = DocumentManager.getNodeById(caretId);        // 挿入先基準位置作成
	
	// ---- カーソル移動先決定
	var postCaretId = tableNode.firstChild.firstChild.id;

	// ---- 再レンダリングの必要な段落を取得
	var targetParagraph = DataClass.getRootParagraph(baseNode); // レンダリング対象段落を記録

	// ---- Undo 用に範囲選択状態を取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得
	
	// 返値作成
	var prepData = {};
	prepData.tableNode       = tableNode;        // 新しいテーブルノード
	prepData.baseNode        = baseNode;         // 挿入先基準位置のノード
	prepData.postCaretId     = postCaretId;      // 操作後のキャレットノード ID
	prepData.targetParagraph = targetParagraph;  // 対象段落ノード
	prepData.nodeList        = nodeList;         // Undo 用選択範囲
		
	return prepData;
};

TableEditor.insertTable = function(tableNode, baseNode, undoFlag) {
	// tableNode : 挿入するテーブルノード。
	// baseNode  : 挿入基準位置のノード。
	undoFlag = undoFlag === undefined ? false : undoFlag;
	
	// --- テーブル挿入を実行
	var pareNode = baseNode.parentNode;
	if (!undoFlag) {
		pareNode.insertBefore(tableNode, baseNode);
	} else {
		pareNode.removeChild(tableNode);
	}
};



// ************************************************************************
// **                         テーブル: 1 行削除                         **
// ************************************************************************

TableEditor.prepareRemoveRow = function(caretId) {
	// ---- 親の CTD セルを取得します。なかったら、失敗 (null返し)。
	var ctdNode = null;
	var targetNode = DocumentManager.getNodeById(caretId);
	var ancestorNode = $(targetNode).closest('ctd, cmatcell');   // 祖先ノードの ctd 要素をチェック
	if (ancestorNode[0] !== undefined) {                         // ---- 自身を含む祖先ノードに ctd 要素があったなら
		ctdNode = ancestorNode[0];                                       // 既存 ctd 記録
	} else {                                                     // ---- なかったら
		return null;                                                     // null 返し
	}

	// ---- 1 行しかなかったら、消せません。
	var tableNode = ctdNode.parentNode;                          // 親のテーブルノード取得
	DataClass.bindDataClassMethods(tableNode);                   // doop
	var preRowCount = tableNode.rowCount;                        // 操作前の行数
	if (preRowCount <= 1) return null;                           // 1 行以下なら、削除動作不可。
	
	// ---- 操作後のキャレットの行き先を決定します。
	var curRowIndex       = tableNode.getRowIndexFromCell(ctdNode.id); // 現在の行インデックス (0始まり)
	var curColIndex       = tableNode.getColIndexFromCell(ctdNode.id); // 現在の列インデックス (0始まり)
	var moveDirection     = 1;                                         // 通常、キャレットは 1 行下へ移りますが、
	if (curRowIndex == preRowCount - 1) moveDirection = -1;            // 削除行が最後の行なら、1 行上へ移動します。
	var postCaretRowIndex = curRowIndex + moveDirection;               // キャレット移動先
	var rowNodeList       = tableNode.getCellsFromRowIndex(postCaretRowIndex); // 移動先の行のノードリストを取得
	var postCTDNode       = rowNodeList[curColIndex];                  // 対象列の CTD ノード取得
	var postCaretNode     = postCTDNode.children[0];                   // 対象 CTD ノードの最初の子ノード取得
	var postCaretId       = postCaretNode.id;                          // 操作後のキャレットノード設定

	// ---- 再レンダリングの必要な段落を取得
	var targetParagraph = DataClass.getRootParagraph(ctdNode);   // レンダラ用に対象段落を記録
	
	// ---- Undo 用に範囲選択状態を取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得

	// ---- 返値
	var prepData = {};
	prepData.caretId         = caretId;         // 操作前のキャレット ID
	prepData.ctdNode         = ctdNode;         // 対象 CTD ノード
	prepData.tableNode       = tableNode;       // 対象 テーブルノード
	prepData.moveDirection   = moveDirection;   // キャレット移動方向 (Undo 時は、反対方向へ行を追加)
	prepData.undoBaseNode    = postCTDNode;     // Undo 時の挿入基準となる CTD ノード
	prepData.postCaretId     = postCaretId;     // 操作後のキャレットノード ID
	prepData.targetParagraph = targetParagraph; // 対象段落ノード
	prepData.nodeList        = nodeList;        // Undo 用選択範囲
	return prepData;
};

// ---- テーブルから 1 行削除します。
TableEditor.removeRow = function(ctdNode) {
	var tableNode = ctdNode.parentNode;
	DataClass.bindDataClassMethods(tableNode);                   // doop
	var removedNodeList = tableNode.removeRows([ctdNode.id]);
	return removedNodeList;
};



// ************************************************************************
// **                         テーブル: 1 行挿入                         **
// ************************************************************************

TableEditor.prepareInsertRow = function(caretId) {
	// ---- 親の CTD セルを取得します。なかったら、失敗 (null返し)。
	var ctdNode = null;
	var targetNode = DocumentManager.getNodeById(caretId);
	var ancestorNode = $(targetNode).closest('ctd, cmatcell');   // 祖先ノードの ctd 要素をチェック
	if (ancestorNode[0] !== undefined) {                         // ---- 自身を含む祖先ノードに ctd 要素があったなら
		ctdNode = ancestorNode[0];                                       // 既存 ctd 記録
	} else {                                                     // ---- なかったら
		return null;                                                     // null 返し
	}
	var tableNode = ctdNode.parentNode;                          // 親のテーブルノード取得
	DataClass.bindDataClassMethods(tableNode);                   // doop

	// ---- 挿入するノードを作成します。
	var newCTDCount = tableNode.colCount;
	var newCellList = [];
	var tableName = tableNode.nodeName;
	var cellCreator = (tableName == 'CMAT' || tableName == 'COPEN' || tableName == 'CCLOSE') ?
			function() { return MatrixCellElement.createNew(tableNode.nt); } :
			function() { return TableCellElement.createNew();              };
	for (var i = 0; i < newCTDCount; i++) {                      // ---- 列数分ループ
		newCellList.push( cellCreator() );                               // 新しい CTD ノードを作成します。
	}

	// ---- 操作後のキャレットの行き先を決定します。
	var postCaretId = newCellList[0].firstChild.id;              // 操作後のキャレットノード ID

	// ---- 再レンダリングの必要な段落を取得
	var targetParagraph = DataClass.getRootParagraph(ctdNode);   // レンダラ用に対象段落を記録
	
	// ---- Undo 用に範囲選択状態を取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得

	// ---- 返値
	var prepData = {};
	prepData.caretId         = caretId;         // 操作前のキャレット ID
	prepData.ctdNode         = ctdNode;         // 対象 CTD ノード
	prepData.tableNode       = tableNode;       // 対象 テーブルノード
	prepData.newCellList     = newCellList;     // 挿入する CTD ノードリスト
	prepData.postCaretId     = postCaretId;     // 操作後のキャレットノード ID
	prepData.targetParagraph = targetParagraph; // 対象段落ノード
	prepData.nodeList        = nodeList;        // Undo 用選択範囲
	return prepData;
};

// ---- テーブルへ 1 行挿入します。
TableEditor.insertRow = function(baseNodeId, isBefore, newCellList, tableNode) {
	DataClass.bindDataClassMethods(tableNode);                   // doop
	tableNode.insertRows( [baseNodeId], newCellList, isBefore);
};



// ************************************************************************
// **                         テーブル: 1 列削除                         **
// ************************************************************************

TableEditor.prepareRemoveCol = function(caretId) {
	// ---- 親の CTD セルを取得します。なかったら、失敗 (null返し)。
	var ctdNode = null;
	var targetNode = DocumentManager.getNodeById(caretId);
	var ancestorNode = $(targetNode).closest('ctd, cmatcell');   // 祖先ノードの ctd 要素をチェック
	if (ancestorNode[0] !== undefined) {                         // ---- 自身を含む祖先ノードに ctd 要素があったなら
		ctdNode = ancestorNode[0];                                       // 既存 ctd 記録
	} else {                                                     // ---- なかったら
		return null;                                                     // null 返し
	}

	// ---- 1 列しかなかったら、消せません。
	var tableNode = ctdNode.parentNode;                          // 親のテーブルノード取得
	DataClass.bindDataClassMethods(tableNode);                   // doop
	if (!tableNode.multiColEnabled) return null;                 // 複数列を許可するオブジェクトか？
	var preColCount = tableNode.colCount;                        // 操作前の列数
	if (preColCount <= 1) return null;                           // 1 列以下なら、削除動作不可。
	
	// ---- 操作後のキャレットの行き先を決定します。
	var curRowIndex       = tableNode.getRowIndexFromCell(ctdNode.id); // 現在の行インデックス (0始まり)
	var curColIndex       = tableNode.getColIndexFromCell(ctdNode.id); // 現在の列インデックス (0始まり)
	var moveDirection     = 1;                                         // 通常、キャレットは 1 列右へ移りますが、
	if (curColIndex == preColCount - 1) moveDirection = -1;            // 削除列が最後の列なら、1 列左へ移動します。
	var postCaretColIndex = curColIndex + moveDirection;               // キャレット移動先
	var colNodeList       = tableNode.getCellsFromColIndex(postCaretColIndex); // 移動先の列のノードリストを取得
	var postCTDNode       = colNodeList[curRowIndex];                  // 対象行の CTD ノード取得
	var postCaretNode     = postCTDNode.children[0];                   // 対象 CTD ノードの最初の子ノード取得
	var postCaretId       = postCaretNode.id;                          // 操作後のキャレットノード設定

	// ---- 再レンダリングの必要な段落を取得
	var targetParagraph = DataClass.getRootParagraph(ctdNode);   // レンダラ用に対象段落を記録
	
	// ---- Undo 用に範囲選択状態を取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得

	// ---- 返値
	var prepData = {};
	prepData.caretId         = caretId;         // 操作前のキャレット ID
	prepData.ctdNode         = ctdNode;         // 対象 CTD ノード
	prepData.tableNode       = tableNode;       // 対象 テーブルノード
	prepData.moveDirection   = moveDirection;   // キャレット移動方向 (Undo 時は、反対方向へ行を追加)
	prepData.undoBaseNode    = postCTDNode;     // Undo 時の挿入基準となる CTD ノード
	prepData.postCaretId     = postCaretId;     // 操作後のキャレットノード ID
	prepData.targetParagraph = targetParagraph; // 対象段落ノード
	prepData.nodeList        = nodeList;        // Undo 用選択範囲
	return prepData;
};

// ---- テーブルから 1 列削除します。
TableEditor.removeCol = function(ctdNode) {
	var tableNode = ctdNode.parentNode;
	DataClass.bindDataClassMethods(tableNode);                   // doop
	var removedNodeList = tableNode.removeCols([ctdNode.id]);
	return removedNodeList;
};



// ************************************************************************
// **                         テーブル: 1 列挿入                         **
// ************************************************************************

TableEditor.prepareInsertCol = function(caretId) {
	// ---- 親の CTD セルを取得します。なかったら、失敗 (null返し)。
	var ctdNode = null;
	var targetNode = DocumentManager.getNodeById(caretId);
	var ancestorNode = $(targetNode).closest('ctd, cmatcell');   // 祖先ノードの ctd 要素をチェック
	if (ancestorNode[0] !== undefined) {                         // ---- 自身を含む祖先ノードに ctd 要素があったなら
		ctdNode = ancestorNode[0];                                       // 既存 ctd 記録
	} else {                                                     // ---- なかったら
		return null;                                                     // null 返し
	}
	var tableNode = ctdNode.parentNode;                          // 親のテーブルノード取得
	DataClass.bindDataClassMethods(tableNode);                   // doop
	if (!tableNode.multiColEnabled) return null;                 // 複数列を許可するオブジェクトか？

	// ---- 挿入するノードを作成します。
	var newCTDCount = tableNode.rowCount;
	var newCellList = [];
	var cellCreator = (tableNode.nodeName == 'CMAT') ?
			function() { return MatrixCellElement.createNew(tableNode.nt); } :
			function() { return TableCellElement.createNew();              };
	for (var i = 0; i < newCTDCount; i++) {                      // ---- 列数分ループ
		newCellList.push( cellCreator() );                               // 新しい CTD ノードを作成します。
	}

	// ---- 操作後のキャレットの行き先を決定します。
	var curRowIndex = tableNode.getRowIndexFromCell(ctdNode.id); // 現在の行インデックス (0始まり)
	var postCaretId = newCellList[curRowIndex].firstChild.id;    // 操作後のキャレットノード ID

	// ---- 再レンダリングの必要な段落を取得
	var targetParagraph = DataClass.getRootParagraph(ctdNode);   // レンダラ用に対象段落を記録
	
	// ---- Undo 用に範囲選択状態を取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得

	// ---- 返値
	var prepData = {};
	prepData.caretId         = caretId;         // 操作前のキャレット ID
	prepData.ctdNode         = ctdNode;         // 対象 CTD ノード
	prepData.tableNode       = tableNode;       // 対象 テーブルノード
	prepData.newCellList     = newCellList;     // 挿入する CTD ノードリスト
	prepData.postCaretId     = postCaretId;     // 操作後のキャレットノード ID
	prepData.targetParagraph = targetParagraph; // 対象段落ノード
	prepData.nodeList        = nodeList;        // Undo 用選択範囲
	return prepData;
};

// ---- テーブルへ 1 列挿入します。
TableEditor.insertCol = function(baseNodeId, isBefore, newCellList, tableNode) {
	DataClass.bindDataClassMethods(tableNode);                   // doop
	tableNode.insertCols( [baseNodeId], newCellList, isBefore);
};



