/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月13日                         */

// ---- コンストラクタ
function StatusEditor(){};

// 選択状態保存・復帰クラス：単なる案。一時的にここに記述。テスト的に使用中
// ---- 選択状態保存・Undo / Redo
//SelectedRangeUtility = function(cancelFlag) {
SelectedRangeUtility = function(cancelFlag) {
	// cancelFlag : 範囲選択解除を行うか？
//	this.cancelFlag = (cancelFlag === void 0) ? false : cancelFlag;

	// 選択範囲を取得
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	var nodeList = selectedRangeManager.getSelectedRange();
	if (nodeList === null) nodeList = [];
	this.nodeList = nodeList.concat();
};

// ---- 範囲選択解除の Redo
SelectedRangeUtility.prototype.redo = function() {
	if (this.nodeList.length) { // 選択範囲がないなら
		EditManager.getSelectedRangeManager().clearSelectedRange(true);
	}
};

// ---- 範囲選択解除の Undo
SelectedRangeUtility.prototype.undo = function() {
	// ---- 範囲選択再設定
	if (this.nodeList.length) { // 選択範囲があるなら
		EditManager.getSelectedRangeManager().reconfigureSelectedNode(this.nodeList);
	}
};



//////////////////////////////////////////////////////////////////////////////////////
//                                 文字ステータス                                   //
//////////////////////////////////////////////////////////////////////////////////////

// ---- static void 文字ステータス変更処理を終了します。
StatusEditor.finalizeStatusSetting = function(nodeList, paragraphList, selectFlag) {
	// nodeList      [ノードの単純配列] : 範囲選択ノードリスト
	// paragraphList [ノードの単純配列] : 対象段落リスト
	// selectFlag    [bool]             : true = 範囲選択を維持する, false = 範囲選択を消す
	// ---- 範囲選択処理
	var selectedRangeManager = EditManager.getSelectedRangeManager();
	if (selectFlag) { // ---- 範囲選択を維持するなら
		selectedRangeManager.reconfigureSelectedNode(nodeList);
	} else {
		selectedRangeManager.clearSelectedRange();
	}

	// ---- レンダラ処理
	var renderer = ViewManager.getRenderer();
	var paragraphCount = paragraphList.length; // 更新段落を登録
	for (var i = 0; i < paragraphCount; i++) {
	    // 表のアライン設定の場合は CTD ノードが入っていることがあるので、段落を取得します
	    renderer.setUpdatedParagraph(DataClass.getRootParagraph(paragraphList[i]));
	}
};

// ************************************************************************
// **                                太字                                **
// ************************************************************************

// ---- static paragraphList[] 太字指定の準備を行います。
StatusEditor.prepareSetBold = function(nodeList) {
	// nodeList  [DOM配列]            : 対象親要素のリスト
	// 返値 prepData {'paragraphList', 'boldList'}
	//        paragraphList [DOM配列]       : 再描画対象となる段落ノードのリスト
	//        boldList {'id', 'bold'}[配列]
	//                   id [文字列] : ノード ID
	//                   bold [bool] : 操作前の太字ステータス

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList = DataClass.targetParagraphs(nodeList);

	// ---- 操作対象となる全ての要素をリスト化します。
	var nodeDetailList = DataClass.pickUpAllNodes(nodeList);

	// ---- 太字操作対象となりうるノードのみ抽出し、その ID と現在の bold 状態をリスト化します。
	var boldList = DataClass.pickUpTargetNodes('bold', nodeDetailList);

	return {'paragraphList' : paragraphList, 'boldList' : boldList};
};

// ---- static void 太字指定を行います。
StatusEditor.setBold = function(nodeList, boldFlag, prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト
	// boldFlag  [bool]        : null = 元に戻す, true = 太字, false = 太字解除
	// prepData                : TextEditor.prepareSetBold の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	DataClass.setLetterProperty('bold', boldFlag, prepData.boldList);

//	var selectFlag = (boldFlag === null);
	var selectFlag = true;

	// ---- レンダラへ登録
	StatusEditor.finalizeStatusSetting(nodeList, prepData.paragraphList, selectFlag);
};



// ************************************************************************
// **                             イタリック                             **
// ************************************************************************

// ---- static paragraphList[] イタリック指定の準備を行います。
StatusEditor.prepareSetItalic = function(nodeList) {
	// nodeList  [DOM配列]            : 対象親要素のリスト
	// 返値 prepData {'paragraphList', 'boldList'}
	//        paragraphList [DOM配列]       : 再描画対象となる段落ノードのリスト
	//        italicList {'id', 'bold'}[配列]
	//                   id [文字列] : ノード ID
	//                   bold [bool] : 操作前の太字ステータス

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList = DataClass.targetParagraphs(nodeList);

	// ---- 操作対象となる全ての要素をリスト化します。
	var nodeDetailList = DataClass.pickUpAllNodes(nodeList);

	// ---- 太字操作対象となりうるノードのみ抽出し、その ID と現在の bold 状態をリスト化します。
	var italicList = DataClass.pickUpTargetNodes('ital', nodeDetailList);

	return {'paragraphList' : paragraphList, 'italicList' : italicList};
};

// ---- static void イタリック指定を行います。
StatusEditor.setItalic = function(nodeList, italicFlag, prepData) {
	// nodeList    [DOM配列]     : 対象親要素のリスト
	// italicFlag  [bool]        : null = 元に戻す, true = 太字, false = 太字解除
	// prepData                  : TextEditor.prepareSetBold の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	DataClass.setLetterProperty('ital', italicFlag, prepData.italicList);

//	var selectFlag = (italicFlag === null);
	var selectFlag = true;

	// ---- レンダラへ登録
	StatusEditor.finalizeStatusSetting(nodeList, prepData.paragraphList, selectFlag);
};



// ************************************************************************
// **                              アライン                              **
// ************************************************************************

const ALIGN_TARGET = {
	'paragraph' : 'paragraph',
	'cell'      : 'cell',
};

// ---- static paragraphList[] アライン指定の準備を行います。
StatusEditor.prepareSetAlign = function(nodeList) {
	// nodeList  [DOM配列]            : 対象親要素のリスト
	// 返値 prepData {'paragraphList', 'boldList'}
	//        paragraphList [DOM配列] : 再描画対象となる段落ノードのリスト
	//        alignList {'id', 'bold'}[配列]
	//                   id [文字列]  : ノード ID
	//                   align [bool] : 操作前の太字ステータス

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList = DataClass.getAlignTargetNodes(nodeList);
	//var paragraphList = DataClass.targetParagraphs(nodeList);

	// ---- 操作対象の種類を判別します。
	var targetType = ALIGN_TARGET.paragraph;
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		if (nodeList[i].nodeName == 'CTD') {
			targetType = ALIGN_TARGET.cell;
			break;
		}
	}

	// ---- 操作対象となるノードのみ抽出し、その ID と現在の アライン 状態をリスト化します。
	var nodeSrc   = paragraphList;
	if (targetType == ALIGN_TARGET.cell) nodeSrc = nodeList;
	var alignList = DataClass.pickUpTargetNodes('align', nodeSrc);

	return {'paragraphList' : paragraphList, 'alignList' : alignList};
};


StatusEditor.setAlign = function(nodeList, align, selectFlag, prepData) {
	// nodeList   [DOM配列] : 対象親要素のリスト
	// align      [enum]    : null = 元に戻す, それ以外 = アライン種別
	// selectFlag [bool]    : 選択範囲の有無
	// prepData             : TextEditor.prepareSetAlign の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	DataClass.setLetterProperty('align', align, prepData.alignList);

	// ---- レンダラへ登録
	StatusEditor.finalizeStatusSetting(nodeList, prepData.paragraphList, selectFlag);
};



// ************************************************************************
// **                                下線                                **
// ************************************************************************

// ---- static paragraphList[] 下線指定の準備を行います。
StatusEditor.prepareSetULine = function(nodeList) {
	// nodeList  [DOM配列]            : 対象親要素のリスト
	// 返値 prepData {'paragraphList', 'boldList'}
	//        paragraphList [DOM配列]       : 再描画対象となる段落ノードのリスト
	//        ulineList {'id', 'uline'}[配列]
	//                   id [文字列] : ノード ID
	//                   uline [bool] : 操作前の太字ステータス

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList = DataClass.targetParagraphs(nodeList);

	// ---- Paragraph は展開します。
	var nodeDetailList = DataClass.pickUpParaChildren(nodeList);

	// ---- 下線操作対象となりうるノードのみ抽出し、その ID と現在の uline 状態をリスト化します。
	var ulineList = DataClass.pickUpTargetNodes('uline', nodeDetailList);

	return {'paragraphList' : paragraphList, 'ulineList' : ulineList};
};

// ---- static void 下線指定を行います。
StatusEditor.setULine = function(nodeList, ulineFlag, prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト
	// boldFlag  [bool]        : null = 元に戻す, true = 太字, false = 太字解除
	// prepData                : TextEditor.prepareSetBold の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	DataClass.setLetterProperty('uline', ulineFlag, prepData.ulineList);

//	var selectFlag = (ulineFlag === null);
	var selectFlag = true;

	// ---- レンダラへ登録
	StatusEditor.finalizeStatusSetting(nodeList, prepData.paragraphList, selectFlag);
};




// ************************************************************************
// **                               打消線                               **
// ************************************************************************

// ---- static paragraphList[] 打消線指定の準備を行います。
StatusEditor.prepareSetStrike = function(nodeList) {
	// nodeList  [DOM配列]            : 対象親要素のリスト
	// 返値 prepData {'paragraphList', 'boldList'}
	//        paragraphList [DOM配列]       : 再描画対象となる段落ノードのリスト
	//        ulineList {'id', 'uline'}[配列]
	//                   id [文字列] : ノード ID
	//                   uline [bool] : 操作前の太字ステータス

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList = DataClass.targetParagraphs(nodeList);

	// ---- Paragraph は展開します。
	var nodeDetailList = DataClass.pickUpParaChildren(nodeList);

	// ---- 操作対象となりうるノードのみ抽出し、その ID と現在の strike 状態をリスト化します。
	var strikeList = DataClass.pickUpTargetNodes('strk', nodeDetailList);

	return {'paragraphList' : paragraphList, 'strikeList' : strikeList};
};


// ---- static void 打消し線指定を行います。
StatusEditor.setStrike = function(nodeList, strikeFlag, prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト
	// boldFlag  [bool]        : null = 元に戻す, true = 太字, false = 太字解除
	// prepData                : TextEditor.prepareSetBold の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	DataClass.setLetterProperty('strk', strikeFlag, prepData.strikeList);

//	var selectFlag = (strikeFlag === null);
	var selectFlag = true;

	// ---- レンダラへ登録
	StatusEditor.finalizeStatusSetting(nodeList, prepData.paragraphList, selectFlag);
};



// ************************************************************************
// **                              脚注書式                              **
// ************************************************************************

// ---- static paragraphList[] アライン指定の準備を行います。
StatusEditor.prepareSetFootNote = function(nodeList) {
	// nodeList  [DOM配列]            : 対象親要素のリスト
	// 返値 prepData {'paragraphList', 'boldList'}
	//        paragraphList [DOM配列]       : 再描画対象となる段落ノードのリスト
	//        ulineList {'id', 'uline'}[配列]
	//                   id [文字列] : ノード ID
	//                   uline [bool] : 操作前の太字ステータス

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList = DataClass.targetParagraphs(nodeList);

	// ---- Paragraph は展開します。
	var nodeDetailList = DataClass.pickUpParaChildren(nodeList);

	// ---- 操作対象となりうるノードのみ抽出し、その ID と現在の strike 状態をリスト化します。
	// 脚注書式は特殊なので、DataClass.pickUpTargetNodes 関数を用いません。
	var footNoteList = [];
	var nodeDetailCount = nodeDetailList.length;
	for (var i = 0; i < nodeDetailCount; i++) {
		var localNode = nodeDetailList[i];
		DataClass.bindDataClassMethods(localNode); // doop
		if (localNode.nt == CIO_XML_TYPE.text) {
			var supVal = localNode.sup;            // sup 属性値取得
			if (supVal !== undefined) {                  // ---- 属性値が定義されている
				var subVal = localNode.sub;              // sub 属性値取得
				var propVal = SM_FOOTNOTE_FORMAT.none;
				if (supVal) propVal = SM_FOOTNOTE_FORMAT.sup;
				if (subVal) propVal = SM_FOOTNOTE_FORMAT.sub;
				footNoteList.push({'node' : localNode, 'propValue' : propVal}); // 記録
			}
		}
	}

	return {'paragraphList' : paragraphList, 'footNoteList' : footNoteList};
};


// ---- static void  脚注書式指定を行います。
StatusEditor.setFootNote = function(nodeList, footNoteType, prepData) {
	// nodeList  [DOM配列]     : 対象親要素のリスト
	// boldFlag  [bool]        : null = 元に戻す, true = 太字, false = 太字解除
	// prepData                : TextEditor.prepareSetBold の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	// 脚注書式は特殊なので、DataClass.setLetterProperty 関数を用いません。
	var propList = prepData.footNoteList;
	var propCount = propList.length;       // 上記情報の個数
	for (var i = 0; i < propCount; i++) {  // ---- 対象情報数分だけループ
		var localPropList = propList[i];           // ローカルなプロパティ設定対象要素情報
		var localNode     = localPropList.node;    // 対象ノードへの参照
		// プロパティ指定値を用いるか、元に戻すかがここで指定されます。
		var localPropValue = footNoteType !== null ? footNoteType : localPropList.propValue;
		DataClass.bindDataClassMethods(localNode); // doop
		localNode.sup = localPropValue == SM_FOOTNOTE_FORMAT.sup ? true : false;
		localNode.sub = localPropValue == SM_FOOTNOTE_FORMAT.sub ? true : false;
	}

//	var selectFlag = (footNoteType === null);
	var selectFlag = true;

	// ---- レンダラへ登録
	StatusEditor.finalizeStatusSetting(nodeList, prepData.paragraphList, selectFlag);
};



// ************************************************************************
// **                      表を縦方向に読み上げる                        **
// ************************************************************************
StatusEditor.setReadLongitude = function(caret) {
	var renderer = ViewManager.getRenderer();

	// キャレット位置のテーブルを特定する
	var node = DocumentManager.getNodeById(caret.pos);
	while (node.nodeName != 'CTABLE') {
		node = node.parentNode;
	}
	DataClass.bindDataClassMethods(node);

	// 現在の読み上げ方向フラグを取ってくる
	readRow = node.readRow;
	if (readRow !== null) {
		node.readRow = !readRow;
		renderer.setUpdatedNode(node); // モード変更のみなのでレンダラへ登録

	}

	// ---- レンダラ 段落更新
	var paragraphList  = DataClass.targetParagraphs([node]);
	renderer.setUpdatedParagraph(paragraphList[0]);
};



// ************************************************************************
// **                           フォントサイズ                           **
// ************************************************************************

// ---- static paragraphList[] アライン指定の準備を行います。
StatusEditor.prepareSetFontSize = function(fontSize, caret) {
	// 操作対象を取得
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	var nodeList = selectedRangeManager.getSelectedRange();
	if (nodeList === null) nodeList = [];
	if (nodeList.length == 0) {
		nodeList = [ DocumentManager.getNodeById(caret.pos) ]; // キャレット位置のノード取得
	};
	var paragraphList = DataClass.targetParagraphs(nodeList);  // 操作対象となる段落ノードの一覧を作成

	var fontSizeList  = DataClass.pickUpTargetNodes('fontSize', paragraphList);

	return {'paragraphList' : paragraphList, 'fontSizeList' : fontSizeList};
};


StatusEditor.setFontSize = function(fontSize, prepData) {
	// fontSize      [enum]    : null = 元に戻す, それ以外 = フォントサイズ
	// prepData             : TextEditor.prepareSetAlign の返値

	// ---- 操作対象ノードへ、プロパティ指定を行います。
	DataClass.setLetterProperty('fontSize', fontSize, prepData.fontSizeList);

	// ---- レンダラへ登録を行います。
	// 各段落内に数式がある場合は、レンダラの setUpdatedNode(node) を実行します。
	var renderer       = ViewManager.getRenderer();
	var paragraphList  = prepData.paragraphList;
	var paragraphCount = paragraphList.length;
	for (var i = 0; i < paragraphCount; i++) {
		var localParagraph = paragraphList[i];
		var localNodeList  = localParagraph.children;
		var localNodeCount = localNodeList.length;
		for (var j = 0; j < localNodeCount; j++) {
			var localNode = localNodeList[j];
			DataClass.bindDataClassMethods(localNode); // doop
			if (localNode.nt != CIO_XML_TYPE.text) renderer.setUpdatedNode(localNode);
		}
	}
};



// ************************************************************************
// **                             ページ番号                             **
// ************************************************************************

StatusEditor.preparePageNumber = function(caret) {
	// ---- キャレット位置の段落を取得します。
	var node            = DocumentManager.getNodeById(caret.pos); // キャレット位置のノード取得
	var targetParagraph = DataClass.getRootParagraph(node);
	Paragraph.doop(targetParagraph);

	// ---- 操作前の状態を取得
	var originalPageNumber = targetParagraph.pageNumber;

	// ---- 返値設定
	var prepData = {};
	prepData.targetParagraph    = targetParagraph;    // 対象段落ノード
	prepData.originalPageNumber = originalPageNumber; // 操作前のページ番号属性

	return prepData;
};

// ---- ページ番号属性設定
StatusEditor.setPageNumber = function(targetParagraph, pageNumberFlag) {
	Paragraph.doop(targetParagraph);
	targetParagraph.pageNumber = pageNumberFlag;

	// ---- レンダラ 段落更新
	ViewManager.getRenderer().setUpdatedParagraph(targetParagraph);
};



// ************************************************************************
// **                 テキスト - 数式 - 化学式 モード変換                **
// ************************************************************************

// ---- 数式・化学式→テキスト:ただのテキストを打ちたかったのに、
	// 数式モードのまま、うっかりタイプし続けたケースである。
	// テキストレベルの文字を処理対象とする。孫は扱わなくて良い。
	// ・選択範囲に、孫をもつ (添字を持つ) 数式が入ってい場合：その要素は無変換。
// ---- テキスト → 数式・化学式
	// テキスト→数式・化学式：数式を入れたいけれどうっかりテキストで打っていた場合
	// 各テキストをコーナーエレメントにすれば良い
	// ・選択範囲に、数式が入ってい場合：その要素は無変換。

//nt属性について

// text 固定
// C
// CIMG
// PBREAK
// CTABLE
// CTD
// CRUBY
// PARAGRAPH
// ENUMBER

// 数式 / 化学式固定
// FRAC
// ROOT
// CN
// INT
// TPBTM
// TOP
// BTM
// ULINE
// CMAT
// COPEN
// CCLOSE
// CMATCELL

// 化学式固定
// CHEMC: cmath で囲むことはない

// 固定なし
// PAUSE
// BR
// CREAD
// G
// DECO

StatusEditor.prepareConvertMode = function(inputMode, caret) {
	var srObj = new SelectedRangeUtility(); // 選択範囲を取得
	var nodeList = srObj.nodeList;          // ノードリスト
	if (!nodeList.length) return null;         // 選択範囲がなければ、null 返し

	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList  = DataClass.targetParagraphs(nodeList);

	// ---- Paragraph は展開します。
	var nodeDetailList = DataClass.pickUpParaChildren(nodeList); // テキストレベルのノード一覧

	// ---- モード変換用インスタンス作成
	var isText = (inputMode == CIO_XML_TYPE.text);  // 変換先がテキストかどうか
	var detailCount = nodeDetailList.length;
	var convertList = new Array(detailCount);       // 変換情報リスト
	var caretIndex  = null;
	for (var i = 0; i < detailCount; i++) {         // ---- 段落直下要素数分ループ
		convertList[i] = null;                              // null 項目は、後の convertMode メソッドにてスキップ
		var localNode = nodeDetailList[i];
		DataClass.bindDataClassMethods(localNode);          // doop

		if (localNode.id == caret.pos) caretIndex = i; // キャレットが存在するノードのインデックス

		convertList[i] = localNode.getConvertedNodeInfo(inputMode); // モード変換後のノード情報
	}
//	var caretId = (caretIndex === null) ? null : convertedNodeList[caretIndex].id;
	var caretId = (caretIndex === null) ? null : nodeDetailList[caretIndex].id;

	var prepData = {};
	prepData.nodeList          = nodeList;          // 範囲選択復旧用
	prepData.nodeDetailList    = nodeDetailList;    // 元の全ノードリスト
	prepData.convertList       = convertList;       // 変換情報リスト
	prepData.oldCaretId        = caret.pos;         // もともとのキャレット位置
	prepData.newCaretId        = caretId;           // 新しいキャレット位置: null なら、redo 時はキャレット移動なし
	prepData.paragraphList     = paragraphList;     // 操作対象段落のリスト

	return prepData;
};

// ---- モード変換
StatusEditor.convertMode = function(prepData, undoFlag) {
	if (undoFlag === void 0) undoFlag = false;
	var paragraphList = prepData.paragraphList;   // 対象段落リスト
	var convertList   = prepData.convertList;     // 変換情報リスト

	var convertCount = convertList.length;
	for (var i = 0; i < convertCount; i++) {      // ---- 段落直下ノード数分ループ
		var localConvertInfo = convertList[i];            // 変換情報
		if (localConvertInfo === null) continue;
		StatusEditor.convertOneNode(localConvertInfo, undoFlag);
	}

	// ---- レンダラ 段落更新
	var renderer = ViewManager.getRenderer();
	var paragraphCount = paragraphList.length;
	for (var counter = 0; counter < paragraphCount; counter++) {
		renderer.setUpdatedParagraph(paragraphList[counter]);
	}

	// ---- その他、undo / redo 依存処理
	var selectedRangeManager = EditManager.getSelectedRangeManager();
	if (undoFlag) { // ---- undo なら
		// 範囲選択復活
		var nodeList = prepData.nodeList;
		selectedRangeManager.reconfigureSelectedNode(nodeList);

		// カーソル位置復帰
		var caretId = prepData.oldCaretId;
	} else {       // ---- redo なら
		// 範囲選択再設定
		selectedRangeManager.clearSelectedRange();
		var newSelectRangeNodeList = [];
		for (var i = 0; i < convertCount; i++) {      // ---- 段落直下ノード数分ループ
			var localConvertInfo = convertList[i];            // 変換情報
			if (localConvertInfo === null) {
				continue;
			} else {
				newSelectRangeNodeList.push(localConvertInfo.convertedNodeList[0]);
			}
		}
		selectedRangeManager.reconfigureSelectedNode(newSelectRangeNodeList);

		// カーソル位置割り当て
		var caretId = prepData.newCaretId;
		if (caretId === null) caretId = prepData.oldCaretId;
	}
	ViewManager.getSelectionUpdater().setCaretPostion(caretId); // カーソル移動
	renderer.setCaretPos(null, caretId);         // レンダラへカーソル移動登録

};

// ---- 一要素ごとにノード入れ替え処理
StatusEditor.convertOneNode = function(convertInfo, undoFlag) {
	// ---- 必要なパラメータを用意
	var originalNodeList  = convertInfo.originalNodeList;
	var originalNtList    = convertInfo.originalNtList;
	var convertedNodeList = convertInfo.convertedNodeList;
	var convertedNtList   = convertInfo.convertedNtList;

	// ---- Undo / Redo 用準備
	var preNodeList, preNtList, postNodeList, postNtList;
	if (!undoFlag) {
		preNodeList  = originalNodeList;
		preNtList    = originalNtList;
		postNodeList = convertedNodeList;
		postNtList   = convertedNtList;
	} else {
		preNodeList  = convertedNodeList;
		preNtList    = convertedNtList;
		postNodeList = originalNodeList;
		postNtList   = originalNtList;
	}

	// ---- モード変換
	var nodeCount = preNodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		var localOldNode = preNodeList[i];
		var localOldNt   = preNtList[i];
		var localNewNode = postNodeList[i];
		var localNewNt   = postNtList[i];

		if (localOldNode !== localNewNode) {   // ---- ノードインスタンスが違うなら
			var parentNode = localOldNode.parentNode;
			parentNode.insertBefore(localNewNode, localOldNode);
			parentNode.removeChild(localOldNode);
		} else if (localOldNt != localNewNt) { // ---- ノードインスタンスは同じだが、nt に違いがあるなら
			DataClass.bindDataClassMethods(localNewNode); // doop
			localNewNode.nt = localNewNt;
			ViewManager.getRenderer().setUpdatedNode(localNewNode); // モード変更のみなのでレンダラへ登録
		}
	}
};



// ************************************************************************
// **                              話者選択                              **
// ************************************************************************

// ノードに必要なメソッド
//		nodeList = node.getSameSpeakerSliblings();
// OK localSpeakerList = localNode.getSpeakerList(speakerIdx); speakerIdx へ変更することを想定した話者リストを返す

StatusEditor.prepareSpeaker = function(speakerIdx, caret) {
	var srObj = new SelectedRangeUtility(); // 選択範囲を取得
	var nodeList = srObj.nodeList.concat(); // ノードリスト

	// ---- 選択範囲がない場合の変更範囲を取得
	if (!nodeList.length) { // ---- 選択範囲がないならば
		// ---- キャレット位置の話者属性を取ってくる
		var node = DocumentManager.getNodeById(caret.pos);
		DataClass.bindDataClassMethods(node);
		var spkStatus = node.speaker;
		if (spkStatus !== null) { // ---- 話者属性があるなら
			if ( (speakerIdx !== null && speakerIdx != spkStatus) || speakerIdx === null) {
				// ------------------------------ 話者の設定や削除が可能なら、ノードリスト作成
				nodeList = node.getSameSpeakerSliblings(); // 同じ話者を持つ兄弟ノードをリスト化
			} else return null;           // ---- 話者の設定削除が不可能なら null 返し
		} else return null;       // ---- 話者属性がないなら null 返し
	} else {                // ---- 選択範囲があるならば
		// ---- Paragraph は展開します。
		nodeList = DataClass.pickUpParaChildren(nodeList); // テキストレベルのノード一覧
	}
	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList  = DataClass.targetParagraphs(nodeList);

	// ノードリストの各ノードの子孫の話者属性を記憶する
	var nodeCount = nodeList.length;
	var speakerList = new Array(nodeCount);
	var isChanged = false; // 話者変更が必要とされているか
	for (var idx = 0; idx < nodeCount; idx++) { // ノードリストの各要素についてループ
		var localNode = nodeList[idx];
		DataClass.bindDataClassMethods(localNode);
		var localSpeakerList = localNode.getSpeakerList(speakerIdx); // 自身を含めた子孫の話者リストを返す
		if (localSpeakerList.length) isChanged = true;
		speakerList[idx] = localSpeakerList;
	}
	if (!isChanged) return null;

	var prepData = {};
	prepData.speakerList   = speakerList;     // 話者リスト
	prepData.srObj         = srObj;           // 範囲選択復帰用リスト
	prepData.paragraphList = paragraphList;   // 対象段落リスト
	prepData.oldCaretId    = caret.pos;       // カーソル位置復帰用
	return prepData;
};

StatusEditor.setSpeaker = function(prepData, undoFlag) {
	if (undoFlag === void 0) undoFlag = false;
	var renderer = ViewManager.getRenderer();

	var speakerList = prepData.speakerList;

	var infoCount = speakerList.length;
	for (var infoIdx = 0; infoIdx < infoCount; infoIdx++) {
		var localInfo = speakerList[infoIdx];
		var localSpeakerCount = localInfo.length;
		for (var speakerIdx = 0; speakerIdx < localSpeakerCount; speakerIdx++) {
			var localSpeakerInfo = localInfo[speakerIdx];
			localNode  = localSpeakerInfo.node;
			DataClass.bindDataClassMethods(localNode);
			// ---- undo / redo に応じて、旧話者と新話者の設定を変えます。
			var newSpeaker = undoFlag ? localSpeakerInfo.beforeSpk : localSpeakerInfo.afterSpk;
			// ---- 話者を設定します。
			localNode.speaker = newSpeaker;
			renderer.setUpdatedNode(localNode); // モード変更のみなのでレンダラへ登録
		}
	}

	// ---- レンダラ 段落更新
	var paragraphList  = prepData.paragraphList; // 対象段落リスト
	var paragraphCount = paragraphList.length;
	for (var counter = 0; counter < paragraphCount; counter++) {
		renderer.setUpdatedParagraph(paragraphList[counter]);
	}

	// ---- その他、undo / redo 依存処理
	var srObj = prepData.srObj;
	var nodeList = srObj.nodeList;
	var selectedRangeManager = EditManager.getSelectedRangeManager();
	if (undoFlag) { // ---- undo なら
		if (nodeList.length) { // ---- 選択範囲があったなら
				selectedRangeManager.reconfigureSelectedNode(nodeList); // 範囲選択復活
		}
		// カーソル位置復帰
		var caretId = prepData.oldCaretId;
		ViewManager.getSelectionUpdater().setCaretPostion(caretId); // カーソル移動
		renderer.setCaretPos(null, caretId);         // レンダラへカーソル移動登録
	} else {       // ---- redo なら
		if (nodeList.length) { // ---- 選択範囲があったなら
			selectedRangeManager.clearSelectedRange();    // 範囲選択リセット
		}
	}
};



// ************************************************************************
// **                              無音設定                              **
// ************************************************************************

StatusEditor.prepareSilent = function(caret) {
	var srObj = new SelectedRangeUtility(); // 選択範囲を取得
	var nodeList = srObj.nodeList.concat(); // ノードリスト

	// ---- 選択範囲がない場合の変更範囲を取得
	var newNode = null;    // 新規ノードの挿入が必要な場合の、ノードインスタンス
	if (!nodeList.length) { // ---- 選択範囲がないならば
		// ---- キャレット位置の無音属性を取ってくる
		var node = DocumentManager.getNodeById(caret.pos);
		DataClass.bindDataClassMethods(node);
		var silentStatus = node.silence;
		if (silentStatus) { // ---- 無音 true なら
			nodeList = node.getSilentSliblings(); // 無音指定されている兄弟のノードリストを取得　この後解除動作となる
		} else {            // ---- 無音 false なら
			// ---- 指定ノードが改行なら、スペースを挿入した上で無音設定である。
//			if (node.nodeName == 'BR') {
				newNode = CharacterElement.createNew(false, '&nbsp;'); // 半角スペース
				CharacterElement.doop(newNode);                        // doop
				newNode.silence = true;
				nodeList = [node]; // レンダラ登録用
//			} else {
//				nodeList = [node];  // この後、無音設定となる
//			}
		}
	} else {                // ---- 選択範囲があるならば
		// ---- Paragraph は展開します。
		nodeList = DataClass.pickUpParaChildren(nodeList); // テキストレベルのノード一覧
	}
	// ---- 操作対象となる段落ノードの一覧を作成: レンダラ登録に使用します。
	var paragraphList  = DataClass.targetParagraphs(nodeList);

	// ---- すべてのテキストレベルノードに無音設定がなされているのなら無音解除ですが、
	// ---- 一つでも無音設定をなされていないテキストレベルノードがあるのなら、無音設定です。
	var silenceFlag = false; // true = 無音設定, false = 無音解除
	var nodeCount  = nodeList.length;
	var silenceList = new Array(nodeCount);
	var idx;
	var localSilenceList;
	var localNode;
	if (newNode === null) { // 空白挿入でなければ
		// ---- ノードリストの各ノードの子孫の無音属性を取得します。
		for (idx = 0; idx < nodeCount; idx++) { // ノードリストの各要素についてループ
			localNode = nodeList[idx];
			DataClass.bindDataClassMethods(localNode);
			localSilenceList = localNode.getSilenceList(); // 自身を含めた子孫の無音リストを返す
			// ---- 無音設定をされていないノードが一つでもあれば、true = 無音設定
			var silenceCheck = StatusEditor.silenceCheck(localSilenceList);
			if (silenceCheck) silenceFlag = true;
			silenceList[idx] = localSilenceList;
		}
		// ---- silenceFlag に基づき、無音設定を行う。
		for (idx = 0; idx < nodeCount; idx++) { // ノードリストの各要素についてループ
			localNode = nodeList[idx];
			DataClass.bindDataClassMethods(localNode);
			// ---- silenceFlag へ設定することを前提として、自身を含めた子孫の無音リストを返す
			localSilenceList = localNode.getSilenceList(silenceFlag);
			silenceList[idx] = localSilenceList;
		}
	}

	var prepData = {};
	prepData.newNode       = newNode;         // 挿入用ノード
	prepData.silenceList   = silenceList;     // 無音設定リスト
	prepData.srObj         = srObj;           // 範囲選択復帰用リスト
	prepData.paragraphList = paragraphList;   // 対象段落リスト
	prepData.oldCaretId    = caret.pos;       // カーソル位置復帰用
	return prepData;
};

// ---- 無音設定をされていないノードが一つでもあれば、true = 無音設定
StatusEditor.silenceCheck = function(localSilenceList) {
	var retVal    = false;
	var listCount = localSilenceList.length;
	for (var i = 0; i < listCount; i++) {
		var localInfo = localSilenceList[i];
		if (!localInfo.beforeSilence) {
			retVal = true;
			break;
		}
	}
	return retVal;
};

StatusEditor.setSilent = function(prepData, undoFlag) {
	if (undoFlag === void 0) undoFlag = false;
	var renderer   = ViewManager.getRenderer();
	var newNode    = prepData.newNode;

	if (newNode !== null) {         // ---- 挿入すべきノードがあるのなら
		var node = DocumentManager.getNodeById(prepData.oldCaretId);
		var parentNode = node.parentNode;
		if (undoFlag) {                    // ---- undoなら
			parentNode.removeChild(newNode);        // newNode を削除
		} else {                            // ---- redo・初設定なら
			parentNode.insertBefore(newNode, node); // newNode を挿入
		}
	} else {                        // ---- silence の変更なら
		var silenceList = prepData.silenceList;
		var infoCount  = silenceList.length;
		for (var infoIdx = 0; infoIdx < infoCount; infoIdx++) {
			var localInfo = silenceList[infoIdx];
			var localSilenceCount = localInfo.length;
			for (var silentIdx = 0; silentIdx < localSilenceCount; silentIdx++) {
				var localSilenceInfo = localInfo[silentIdx];
				localNode  = localSilenceInfo.node;
				DataClass.bindDataClassMethods(localNode);
				// ---- undo / redo に応じて、旧無音設定と新無音設定の設定を変えます。
				var newSilence = undoFlag ? localSilenceInfo.beforeSilence : localSilenceInfo.afterSilence;
				// ---- 話者を設定します。
				localNode.silence = newSilence;
				renderer.setUpdatedNode(localNode); // モード変更のみなのでレンダラへ登録
			}
		}
	}

	// ---- レンダラ 段落更新
	var paragraphList  = prepData.paragraphList; // 対象段落リスト
	var paragraphCount = paragraphList.length;
	for (var counter = 0; counter < paragraphCount; counter++) {
		renderer.setUpdatedParagraph(paragraphList[counter]);
	}

	// ---- その他、undo / redo 依存処理
	var srObj = prepData.srObj;
	var nodeList = srObj.nodeList;
	var selectedRangeManager = EditManager.getSelectedRangeManager();
	if (undoFlag) { // ---- undo なら
		if (nodeList.length) { // ---- 選択範囲があったなら
				selectedRangeManager.reconfigureSelectedNode(nodeList); // 範囲選択復活
		}
	} else {       // ---- redo なら
		if (nodeList.length) { // ---- 選択範囲があったなら
			selectedRangeManager.clearSelectedRange();    // 範囲選択リセット
		}
	}
	// カーソル位置復帰
	var caretId = prepData.oldCaretId;
	ViewManager.getSelectionUpdater().setCaretPostion(caretId); // カーソル移動
	renderer.setCaretPos(null, caretId);         // レンダラへカーソル移動登録
};



