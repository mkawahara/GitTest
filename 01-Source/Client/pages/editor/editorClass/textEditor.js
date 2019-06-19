/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： textEditor.js                                      */
/* -                                                                         */
/* -    概      要     ： 複合処理層 TextEditorクラス                        */
/* -                                                                         */
/* -    依      存     ： utility.js                                         */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年08月24日                         */

// ------------- コンストラクタ
function TextEditor(){};



// [static] ------------- 指定位置に１ノード分のデータを挿入します。
TextEditor.insertChar = function(doc, id, node, itemStatus) {
	// doc                   [DOM] : 処理対象となる文書DOMへの参照
	// id                    [str] : 挿入先ノードのID。このノードの直前に挿入が実行される
	// node                  [DOM] : 挿入するノードのインスタンスへの参照
	// itemStatus [ステータス情報] : 作成するノードのステータス情報です。
	// 返値 {'node' : [DOM]           undo時に削除すべきノード
	//                                失敗したらnull (段落変更を引き起こす改行コードの場合エラーになるのでは)
	//       'cursorPos' : ノード ID  カーソル移動位置のノード ID

	// ---- ノードへステータスを設定します
	if (itemStatus != undefined) { // ステータス情報が指定されていたら、ステータスを設定
		DataClass.bindDataClassMethods(node);
		if ('ital'  in node) node.ital  = itemStatus.italic;                               // イタリック設定
		if ('bold'  in node) node.bold  = itemStatus.bold;                                 // 太字設定
		if ('uline' in node) node.uline = itemStatus.underline;                            // 下線設定
		if ('strk'  in node) node.strk  = itemStatus.strike;                               // 打消線設定
		if ('sup'   in node) node.sup   = (itemStatus.footnote == SM_FOOTNOTE_FORMAT.sup); // 脚注書式上付き設定
		if ('sub'   in node) node.sub   = (itemStatus.footnote == SM_FOOTNOTE_FORMAT.sub); // 脚注書式下付き設定
	}

	// ---- 親ノードへ、新しいノードを挿入します。
	var targetNode = $(doc).find('#' + id).parent()[0]; // 挿入起点要素の親要素取得
	DataClass.bindDataClassMethods(targetNode);         // 要素へオブジェクト使用直前の doop を行います。
	targetNode.insertNode(id, node);                    // ノードを挿入。
	DataClass.bindDataClassMethods(node);               // ノードを doop
	// カーソル移動初期の初期値があれば、該当ノード ID を取得し、なければ null
	var cursorPos = typeof(node.getDefaultCursorPos ) == 'function' ? node.getDefaultCursorPos() : null;

	// ---- カーソル移動があるなら、カーソルを移動し、レンダラへ登録
	if (cursorPos) {
		ViewManager.getSelectionUpdater().setCaretPostion(cursorPos); // カーソル移動
		ViewManager.getRenderer().setCaretPos(null, cursorPos);         // レンダラへカーソル移動登録
	}

	// ---- レンダラへ登録
	var rootPara = DataClass.getRootParagraph(targetNode);
	ViewManager.getRenderer().setUpdatedParagraph(rootPara);

	return( {'node' : node, 'cursorPos' : cursorPos} );
};



// [static] ------------- 指定位置の１ノードを削除します。
// 段落の先頭あるいは終端で行われた場合、段落の結合が発生することがあります。
// また、セクションの先頭あるいは終端で行われた場合、処理そのものが失敗することがあります。（※段落結合は4/1以降）
TextEditor.removeNode = function(doc, id, isPrevious) {
	// doc [DOM]         : 処理対象文書DOMへの参照
	// id  [str]         : 削除対象ノードのID。ただし、前方削除の場合は兄ノードが削除対象
	// isPrevious [bool] : 削除方向。trueの場合、指定ノードの兄ノードが削除される
	// 返値  [{node, id}]  : 失敗時はnull。
	//         node [node] : 削除されたノードのインスタンスへの参照
	//           id [str]  : 削除されたノードの弟ノード(undo時の挿入先)
	var targetNode = $(doc).find('#' + id)[0];          // 削除起点の要素を取得します。
	if (isPrevious) { // 削除対象要素が id を持つ当人か兄か判断します。
		var tempNode = targetNode.previousSibling;
		var prevNodeName = tempNode === null ? null : tempNode.nodeName;
		if (prevNodeName == null) return(null);
		targetNode = targetNode.previousSibling;
		id = targetNode.id; // 兄要素の id を取得します。
	}
	targetNode = targetNode.parentNode;              // 削除対象要素の親を裸DOMにします。
	DataClass.bindDataClassMethods(targetNode);      // 要素へオブジェクト使用直前の doop を行います。
	var resultObj = targetNode.removeNode(id);       // ノードを削除。

	// 処理が行われていた場合 (ボックス終端の改行を削除しようとするなど、処理が行われないケースがあります)
	if (resultObj != null) {
		// ---- カーソル移動
		ViewManager.getSelectionUpdater().setCaretPostion(resultObj.id); // カーソル移動
		ViewManager.getRenderer().setCaretPos(null, resultObj.id);         // レンダラへカーソル移動登録

		// ---- レンダラへ登録
		var rootPara = DataClass.getRootParagraph(targetNode);
		ViewManager.getRenderer().setUpdatedParagraph(rootPara);
	}

	return( resultObj );
};


// ************************************************************************
// **                              段落削除                              **
// ************************************************************************
TextEditor.deleteParagraph = function(target) {
	var renderer = ViewManager.getRenderer();
	var section  = target.parentNode;
	section.removeChild(target);
	renderer.setRemovedParagraph(target.id);
	return true;
}

TextEditor.undoDeleteParagraph = function(target, nextParagraph, parentSection) {
	var renderer = ViewManager.getRenderer();
	parentSection.insertBefore(target, nextParagraph);
	renderer.setInsertedParagraph(target, nextParagraph); // レンダラへ段落追加を通知
}


// ************************************************************************
// **                              段落結合                              **
// ************************************************************************

// [static] ------------- 段落結合の準備を行います。
TextEditor.prepareCombineParagraph = function(target, appendPara) {
	var prepData = {};

	Paragraph.doop(target);
	Paragraph.doop(appendPara);

	// ---- 基本情報
	prepData.target      = target;     // 統合先段落インスタンスへの参照です。
	prepData.appendPara  = appendPara; // 結合段落のインスタンスへの参照です。
	prepData.removedNode = null;       // 結合時に取り除かれた末尾の改行インスタンスが格納される変数です。
	prepData.pos         = appendPara.children[0].id; // 結合段落子要素の中で先頭の要素の id を保存します。

	// ---- 改ページ対応
	prepData.orgPrePageBreak  = target.pageBreak;
	prepData.orgPostPageBreak = appendPara.pageBreak;

	// ---- 段落属性の保存
	prepData.appendParaFontSize       = appendPara.fontSize;   // 結合段落のフォントサイズ
	prepData.appendParaAlign          = appendPara.align;      // 結合段落のアライン
	prepData.appendParaPageNumber     = appendPara.pageNumber; // 結合段落のページ番号属性

	return prepData;
}

// [static] void ------------- 段落を結合します。
TextEditor.combineParagraph = function(prepData, subData) {
	// この関数を呼び出す場所によって、引数の構成が異なるため、第二引数が未指定か否かで、
	// 処理を振り分けています。
	if (subData == (void 0)) {
		prepData.removedNode = TextEditor.rawCombineParagraph(prepData.target, prepData.appendPara);
	}
	else {
		prepData.removedNode = TextEditor.rawCombineParagraph(prepData, subData);
	}
};

// [static] ------------- 段落を結合します。
TextEditor.rawCombineParagraph = function(target, appendPara) {
//TextEditor.combineParagraph = function(target, appendPara) {
	// target     [Paragraphオブジェクト] : 結合対象となる段落。
	// appendPara [Paragraphオブジェクト] : 結合するべき段落。
	//            ※結合後、データDOMからは削除され、undo/redoのためのコマンドクラスにより管理されるようになります。
	// target 段落の末端の改行ノードを削除した上で、appendPara の内容全てが target 段落の末端に追加されます。
	//
	// 返値 brNode                [node]  : 結合により対象段落から削除された改行ノードのインスタンス

	var position = appendPara.firstChild.id;    // 結合するべき段落の先頭要素の ID を取得しておきます。

	Paragraph.doop(target);                     // 前段落に対して doop を行います。
	Paragraph.doop(appendPara);                 // 後ろ段落に対して doop を行います。

	// ---- ページ分割対応
	if (target.pageBreak) {     // ---- 前段落に改ページ属性がある。
		target.pageBreak = false;       // 前段落の改ページ属性を解除。
	}
	if (appendPara.pageBreak) { // ---- 後段落に改ページ属性がある
		target.pageBreak = true;        // 前段落へ改ページ属性を付与。
	}

	// ---- 段落結合を実施
	var deletedBr = target.combine(appendPara); // 段落を結合し、削除された改行要素インスタンスへの参照を取得します。
	appendPara.forceEmpty();                    // appendPara は forceEmpty によって末尾の改行も含めて空にされます。

	// ---- 不要な段落をセクションから削除
	var sectionNode   = appendPara.parentNode;  // appendPara の親ノード (セクション) を取得します。
	Section.doop(sectionNode);                  // Section doop
	sectionNode.removeParagraph(appendPara);    // appendPara を親ノード (セクション) から削除します。

	// ---- 段落結合をレンダラへ通知します。
	ViewManager.getRenderer().setCombinedParagraph(target, appendPara.id, position);

	return deletedBr;
};

TextEditor.undoCombineParagraph = function(prepData) {
	var appendPara = prepData.appendPara;
	Paragraph.doop(appendPara);

	// ---- 改ページ属性対応
	if (prepData.orgPrePageBreak) {   // ---- 前段落がもともと改ページ属性を持っていたなら
		var target = prepData.target;
		Paragraph.doop(target);      // 前段落へ改ページ属性を付与。
		target.pageBreak = true;
	}
	if (prepData.orgPostPageBreak) {  // ---- 後段落がもともと改ページ属性を持っていたなら
		appendPara.pageBreak = true; // 後段落へ改ページ属性を付与。
	}

	// ---- 段落属性復帰
	appendPara.fontSize   = prepData.appendParaFontSize;  // フォントサイズ
	appendPara.align      = prepData.appendParaAlign;     // アライン
	appendPara.pageNumber = prepData.appendParaPageNumber // ページ番号属性
};

// [static] ------------- 段落を分割します。
//TextEditor.divideParagraph = function(target, pos, br, newpara) {
TextEditor.divideParagraph = function(target, pos, br, newpara, pageBreak) {
	// target  [Paragraphオブジェクト]   : 分割対象段落
	// pos                       [str]   : 対象段落上での分割位置を表すノードID
	// br                    [DOM要素]   : 分割後に分割対象段落の末端に付与される改行ノードのインスタンス
	// newpara [Paragraphオブジェクト]   : 分割データを受け取る新しい段落ノードのインスタンス。
	//                                     省略時はメソッド内部で新しい段落ノードが作成される。
	// pageBreak [bool]                  : true = ページ分割あり, false = ページ分割なし
	// 返値 node [Paragraphオブジェクト] : 分割によって新しく作成された段落ノードのインスタンス。undo時の結合に必要。
	// ※分割位置が段落先頭にある場合、分割対象段落のchildrenが一瞬、真の空になるタイミングがありますが、
	// 　デバッグ時にバグだと誤解せぬよう。

	// ---- 新しい段落ノードを作成
	if (!newpara) newpara = Paragraph.createNew(true); // 改行要素すら含まない完全に空の段落ノードを作成します。
	Paragraph.doop(target);                            // target  に対して doop を行います。
	Paragraph.doop(newpara);                           // newpara に対して doop を行います。
	newpara.forceEmpty();                              // 改行要素を含めて、段落ノード内の子要素を全て削除します。
	newpara.forceOverWrite( target.divide(pos, br) );  // 段落を分割し、切り離された子要素を新しい段落へ格納します。

	// ---- 新しい段落ノードへ継承すべき属性を設定
	newpara.align    = target.align;                   // アライン設定を引き継ぎます。
	newpara.fontSize = target.fontSize;                // フォント設定サイズを引き継ぎます。

	// ---- 改ページ属性対応
	var orgPageBreak = target.pageBreak;    // 分割元の改ページ属性を取得
	if (orgPageBreak) {                     // ---- 分割元段落に改ページ属性がある
		target.pageBreak  = false;                  // 分割元の改ページ属性を削除
		newpara.pageBreak = true;                   // 分割先へ改ページ属性を付与。
	}
	if (pageBreak) target.pageBreak = true; // 改ページ挿入指示であるなら、分割元へ改ページ属性を付ける

	// ---- 新しい段落ノードをセクションへ追加
	var sectionNode   = target.parentNode;             // target の親ノード (セクション)
	Section.doop(sectionNode);                         // Section doop
	sectionNode.insertParagraph(newpara, target.nextSibling); // 新しい段落ノードをセクションへ追加します。

	// ---- 段落分割をレンダラへ通知します。
	ViewManager.getRenderer().setDividedParagraph(target, newpara);

	return newpara;
};

// ---- 改ページ対応 undo 処理
// 改ページ挿入指示であったなら、分割元の改ページ属性を解除
TextEditor.undoDivideParagraph  =function(target, pageBreak) {
	if (pageBreak) {
		Paragraph.doop(target);    // target  に対して doop を行います。
		target.pageBreak = false;  // 分割元の改ページ属性を削除
	}
};



// ************************************************************************
// **                              画像設定                              **
// ************************************************************************

// ---- static paragraphList[] 画像設定の準備を行います。
TextEditor.prepareImageProperty = function(imageNode, newProperty) {
	// imageNode : 画像ノードのインスタンス
	// newProperty.width  : 画像の幅
	//            .height : 画像の高さ
	//            .title  : 画像のタイトル
	//            .alt    : 画像の代替えテキスト
	//            .read   : 読み文字列

	// ---- 現在の状態を取得
	var oldProperty = {};
	ImageElement.doop(imageNode);
	oldProperty.width  = imageNode.width;  // 画像の幅
	oldProperty.height = imageNode.height; // 画像の高さ
	oldProperty.title  = imageNode.title;  // 画像のタイトル
	oldProperty.alt    = imageNode.alt;    // 画像の代替えテキスト
	oldProperty.read   = imageNode.read;   // 読み文字列

	// ---- レンダリングの要不要を判断
	var targetParagraph = null;
	if (oldProperty.width != newProperty.width || oldProperty.height != newProperty.height) {
		targetParagraph = DataClass.getRootParagraph(imageNode); // 要レンダリングなら、対象段落を記録
	}

	// ---- 返値を作成
	var prepData = {};
	prepData.targetParagraph = targetParagraph; // レンダリング対象段落
	prepData.oldProperty     = oldProperty;     // 古い設定内容

	return prepData;
};

TextEditor.setImageProperty = function(imageNode, imgProperty, targetParagraph) {
	if (imgProperty.width !== void 0) imageNode.width  = imgProperty.width;  // 画像の幅
	if (imgProperty.height !== void 0) imageNode.height = imgProperty.height; // 画像の高さ
	if (imgProperty.title !== void 0) imageNode.title  = imgProperty.title;  // 画像のタイトル
	if (imgProperty.alt !== void 0) imageNode.alttext    = imgProperty.alt;    // 画像の代替えテキスト
	if (imgProperty.read !== void 0) imageNode.readingtext   = imgProperty.read;   // 読み文字列

	if (targetParagraph) ViewManager.getRenderer().setUpdatedParagraph(targetParagraph);

	return true;
};



//////////////////////////////////////////////////////////////////////////////////////
//                                    box 編集                                      //
//////////////////////////////////////////////////////////////////////////////////////

const BOX_OPERATION = {
	'NONE'				: 'NONE',				// すべき処理なし: Undo スタックに登録しない。
	'CANCEL'			: 'CANCEL',				// 囲み枠 / ルビなし
	'CHANGE'			: 'CHANGE',				// 既存 decoBox / ruby 枠線変更
	'INSERT'			: 'INSERT',				// decoBox / ruby 挿入
	'CANCEL_AND_INSERT'	: 'CANCEL_AND_INSERT',	// 既存ボックスの破棄と、新たなボックス作成
	'DIVIDE'			: 'DIVIDE',				// 既存ボックスの分割（実際には破棄１つと作成複数）
};

// ************************************************************************
// **                               囲み枠                               **
// ************************************************************************

// ---- static {} 囲み枠指定の準備を行います。
TextEditor.prepareSetFrameBorder = function(nodeList, borderType) {
	// nodeList  [DOM配列] : 対象要素のリスト
	// frameType [enum]    : 囲み枠タイプ null 囲み枠なし
	//                      BORDER_TYPE.normal 標準の枠
	//                                  double 二重線の枠
	//                                  round  角の丸い枠
	//                                  bround 太い角の丸い枠
	//                                  shadow 影のある枠
	//                                  circle 丸囲み枠

	// ---- 操作対象となる段落ノードを記録します。
	var targetParagraph = DataClass.getRootParagraph(nodeList[0]);

	// ---- 最初と最後の共通親の祖先に decoBox があるなら、取得
	var nodeCount = nodeList.length;             // ノードリストの要素数
	var pareNode  = nodeList[0];                         // 操作対象要素の親要素
	if (nodeCount > 1) {                                 // ---- 複数のノードがある場合、共通の親を取得します。
		pareNode  = DataClass.getSharedParent('#' + nodeList[0].id + ' , #' + nodeList[nodeCount - 1].id);
	};
	var decoNode = null;                                 // 既存 decoBox ノード
	var ancestorNode = $(pareNode).closest('deco');      // 祖先ノードの decoBox 要素をチェック
	if (ancestorNode[0] !== undefined) {                 // ---- 祖先ノードに decoBox 要素があったなら
		decoNode = ancestorNode[0];                              // 既存 decoBox 発見
	}
	var childList = [];
	var orgBorderType = null;                            // 既存 decoBox ノードのもともとの囲み枠タイプ
	if (decoNode) {                                      // ---- 既存 decoBox ノードが存在するなら
		DecoBoxElement.doop(decoNode);                           // doop
		// ---- childList を作成
		var childCount = decoNode.firstChild.children.length - 1;
		for (var i = 0; i < childCount; i++) {
			childList.push(decoNode.firstChild.children[i]);
		}
		// ---- オリジナルの囲み枠タイプを記録します。
		orgBorderType = decoNode.borderType;                     // 既存 decoBox ノードのもともとの囲み枠タイプ
	}

	// ---- 操作タイプを決定します。
	var opeType = BOX_OPERATION.NONE;
	if (borderType === null && decoNode != null) opeType = BOX_OPERATION.CANCEL; // 囲み枠なし
	if (borderType !== null && decoNode != null && orgBorderType != borderType) {
		opeType = BOX_OPERATION.CHANGE;                                         // 囲み枠変更
	}
	if (borderType !== null && decoNode == null) opeType = BOX_OPERATION.INSERT; // 囲み枠新規作成

	// ---- 囲み枠の新規作成ならば、新しい decoBox を作成します。
	var newDecoNode = null;                              // 新しい decoBox 要素
	if (opeType == BOX_OPERATION.INSERT) {              // ---- 囲み枠新規作成操作なら
		DataClass.bindDataClassMethods(pareNode);                // doop
		var xmlType = pareNode.nt;                               // 親からモード取得
		newDecoNode = DecoBoxElement.createNew(xmlType);         // 新しい decoBox 要素を作成
		DecoBoxElement.doop(newDecoNode);                        // doop
		newDecoNode.borderType = borderType;                     // 囲み枠タイプ設定
	}

	// ---- 準備結果
	var prepData = {};
	prepData.targetParagraph = targetParagraph;          // 対象段落ノード: renderer 更新用
	prepData.decoNode        = decoNode;                 // 既存 decoBox ノード
	prepData.childList       = childList;                // 既存 decoBox ノードの子要素ノードリスト
	prepData.orgBorderType   = orgBorderType;            // 既存 decoBox ノードのもともとの囲み枠タイプ
	prepData.opeType         = opeType;                  // 操作タイプ
	prepData.newDecoNode     = newDecoNode;              // 新しい decoBox ノード

	return prepData;
};

// ---- static
TextEditor.setFrameBorder = function(nodeList, borderType, prepData, selectFlag, undoFlag) {
	// nodeList  [DOM配列]            : 対象要素のリスト
	selectedRangeManager = EditManager.getSelectedRangeManager();
	undoFlag = undoFlag === undefined ? false : undoFlag;

	var opeType = prepData.opeType;
	if (opeType == BOX_OPERATION.CANCEL) {        // ---- 囲み枠なし

		if (!undoFlag) { // ---- 実行 / Redo なら
			TextEditor.cancelFrameBorderRaw(prepData.decoNode);
		} else {         // ---- Undo なら
			TextEditor.setFrameBorderRaw(prepData.childList, prepData.decoNode);
		}
	} else if (opeType == BOX_OPERATION.CHANGE) { // ---- 囲み枠変更

		var localBorderType = undoFlag ? prepData.orgBorderType : borderType;
		TextEditor.changeFrameBorderRaw(prepData.decoNode, localBorderType);
	} else if (opeType == BOX_OPERATION.INSERT) { // ---- 囲み枠新規作成

		if (!undoFlag) { // ---- 実行 / Redo なら
			TextEditor.setFrameBorderRaw(nodeList, prepData.newDecoNode);
		} else {         // ---- Undo なら
			TextEditor.cancelFrameBorderRaw(prepData.newDecoNode);
		}
	}

	// 選択範囲のクリアを行います。
	selectedRangeManager.clearSelectedRange();

	// Undo 時には、必要に応じて選択範囲の復元を行います。
	if (undoFlag && selectFlag) {
		selectedRangeManager.reconfigureSelectedNode(nodeList);
	}

	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(prepData.targetParagraph);
	return true;
};



// ---- static decoBox をキャンセルします。
TextEditor.cancelFrameBorderRaw = function(decoNode) {
	// decoNode [node インスタンス] : 既存 decoBox ノード

	// ---- キャンセル操作前の準備
	var baseNode     = decoNode.nextSibling;     // 挿入先の基準となるノード (既存 decoBox の弟ノード)
	var decoPareNode = decoNode.parentNode ;     // 既存 decoBox の親ノード

	// ---- decoBox を 親から切り離し、子ノードの引越しを行います。
	decoPareNode.removeChild(decoNode);          // 既存 decoBox を、親から切り離します。

	// ---- 子ノードの引っ越し準備：対象子ノードへの参照を配列へ格納
	var childList  = [];
	var childCount = decoNode.firstChild.children.length - 1; // 子要素の数 (G 内の BR は除外)
	for (var i = 0; i < childCount; i++) {
		childList.push(decoNode.firstChild.children[i]);
	}

	// ---- 子ノードの引越し
	for (var i = 0; i < childCount; i++) {       // ---- 子ノード分ループ
		var localChild = childList[i];                   // 該当子ノード
		decoPareNode.insertBefore(localChild, baseNode); // 子ノード引っ越し
	}

	// カーソル位置を更新します
	if (decoNode.firstChild.children[decoNode.firstChild.children.length - 1].id == EditorPaneClass.getCaret().pos) {
		EditorPaneClass.getCaret().pos = baseNode.id;
	}
};



// ---- static decoBox の囲み枠を変更します。
TextEditor.changeFrameBorderRaw = function(decoNode, borderType) {
	DecoBoxElement.doop(decoNode);                       // doop
	decoNode.borderType = borderType;
};



// ---- static decoBox を挿入します。
TextEditor.setFrameBorderRaw = function(nodeList, newDecoNode) {
	// ---- 新しい decoBox ノード挿入
	var pareNode = nodeList[0].parentNode;
	pareNode.insertBefore(newDecoNode, nodeList[0]);

	// ---- nodeList のノードを、newDecoNode 配下の G　配下へ引越し
	var distGNode = newDecoNode.firstChild;
	var baseNode  = distGNode.lastChild;    // 挿入先基準位置
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		distGNode.insertBefore(nodeList[i], baseNode);
	}
};



// ************************************************************************
// **                           フレーズ結合                             **
// ************************************************************************
// ★★★ 仕様確認中ですが、仮実装しました 2017/1/19 ★★★
/**
 * フレーズ設定の準備を行います。
 * @param nodeList	対象ノードの配列
 */
TextEditor.prepareSetPhraseBox = function(nodeList) {
	// ---- 操作対象となる段落ノードを記録します。
	var targetParagraph = DataClass.getRootParagraph(nodeList[0]);

	// ---- 既存ノードに基づいて、必要なノード情報を収集
	var existingNodeInfo = TextEditor.checkExistingNodes(nodeList, 'PHRASE');

	// 操作タイプを決定します
	var opeType = TextEditor.GetPhraseOpeType(existingNodeInfo, nodeList);

	// 新規作成ならば、新しいノードを作成します。
	var newPhraseNode = null;
	if (opeType == BOX_OPERATION.INSERT || opeType == BOX_OPERATION.CANCEL_AND_INSERT) {
		newPhraseNode = PhraseElement.createNew();
	}
	// フレーズ分割の場合、
	else if (opeType == BOX_OPERATION.DIVIDE) {
		// フレーズノードを複数作成します
		var nodeCount = TextEditor.GetDivideCount(existingNodeInfo, nodeList);
		newPhraseNode = [];
		for (var i = 0; i < nodeCount; i++) newPhraseNode.push(PhraseElement.createNew());

		// パラメータ existingNodeInfo を作り直します
		// 親フレーズを表すexistingNodeInfo.existingNode と existingNodeInfo.childList は空にします
		// existingNodeInfo.canceledNodes を代わりに設定します
		existingNodeInfo.canceledNodes = [{existingNode : existingNodeInfo.existingNode, existingChildlen : existingNodeInfo.childList}];
		existingNodeInfo.existingNode = null;
		// existingNodeInfo.nodeListForCancel を複数作成します
		existingNodeInfo.nodeListForCancel = TextEditor.DividePhraseChildren(nodeList, existingNodeInfo.childList);
		existingNodeInfo.childList = [];
	}
	//if (opeType == BOX_OPERATION.DIVIDE) opeType = BOX_OPERATION.CANCEL;	// ★分割はとりあえずキャンセル扱いにします

	// 準備結果をまとめます
	var prepData = {};
	prepData.targetParagraph	= targetParagraph;					// 対象段落ノード: renderer 更新用
	prepData.phraseNode			= existingNodeInfo.existingNode;	// 既存フレーズノード（範囲の上位にあるノード）
	prepData.childList			= existingNodeInfo.childList;		// 既存フレーズノードの子要素ノードリスト
	prepData.opeType			= opeType;							// 操作タイプ
	prepData.newPhraseNode		= newPhraseNode;					// 新しいフレーズノード
	// ★分割の場合、上のんは複数保持が必要
	prepData.canceledNodes		= existingNodeInfo.canceledNodes;	// 範囲内に存在し、解除される既存フレーズノード
	// ★分割の場合、上の配列は複数セット保持が必要
	prepData.nodeListForCancel	= existingNodeInfo.nodeListForCancel; // 新規フレーズノードに登録されるノードのリスト

	return prepData;
};

/**
 * フレーズの操作種別を判定します
 * @param existingNodeInfo	ruby 等と同じ判定処理の結果
 * @param nodeList			選択されているノードのリスト
 */
TextEditor.GetPhraseOpeType = function(existingNodeInfo, nodeList) {
	var existingNode  = existingNodeInfo.existingNode;						// 範囲を含む解除対象フレーズ
	var canceledNodes = existingNodeInfo.canceledNodes;						// 範囲内に含まれる解除対象フレーズ

	if (canceledNodes.length) return BOX_OPERATION.CANCEL_AND_INSERT;		// 範囲内フレーズを解除の後、新規設定
	if (existingNode == null) return BOX_OPERATION.INSERT;				// フレーズの設定

	// フレーズ内の一部範囲を選択していた場合は、既存フレーズの分割
	var lastIndex = nodeList.length - 1;
	if (existingNodeInfo.childList.length != nodeList.length) return BOX_OPERATION.DIVIDE;
	if (existingNodeInfo.childList[0] != nodeList[0]) return BOX_OPERATION.DIVIDE;
	if (existingNodeInfo.childList[lastIndex] != nodeList[lastIndex]) return BOX_OPERATION.DIVIDE;

	if (existingNode != null) return BOX_OPERATION.CANCEL;				// 既存フレーズの解除

	return BOX_OPERATION.NONE;
};

/**
 * 分割後のフレーズ数を取得します
 * @param existingNodeInfo	ruby 等と同じ判定処理の結果
 * @param nodeList			選択されているノードのリスト
 */
TextEditor.GetDivideCount = function(existingNodeInfo, nodeList) {
	var count = 1;

	if (existingNodeInfo.childList[0] != nodeList[0]) count++;
	if (existingNodeInfo.childList[existingNodeInfo.childList.length - 1] != nodeList[nodeList.length - 1]) count++;

	return count;
};

/**
 *
 */
TextEditor.DividePhraseChildren = function(selectedList, phraseChildren) {
	var result = [];
	var counter = 0;

	// １つめを作成します
	if (selectedList[0] !== phraseChildren[0]) {
		var temp = [];
		while (selectedList[0] !== phraseChildren[counter]) {
			temp.push(phraseChildren[counter]);
			counter++;
		}
		result.push(temp);
	}

	// ２つめを作成します
	{
		var temp = [];
		var endTo = counter + selectedList.length;
		for (; counter < endTo; counter++) {
			temp.push(phraseChildren[counter]);
		}
		result.push(temp);
	}

	// ３つめを作成します
	if (selectedList[selectedList.length - 1] !== phraseChildren[phraseChildren.length - 1]) {
		var temp = [];
		for (; counter < phraseChildren.length; counter++) {
			temp.push(phraseChildren[counter]);
		}
		result.push(temp);
	}

	return result;
};

/**
 * フレーズを設定します (既存フレーズの解除なども行う上位処理です)
 * @param nodeList		対象ノードの配列
 * @param prepData		あらかじめ用意された処理に使用するデータ
 * @param selectFlag	選択範囲の有無
 * @param undoFlag		呼び出し元が undo の場合 true
 */
TextEditor.setPhraseBox = function(nodeList, prepData, selectFlag, undoFlag) {
	selectedRangeManager = EditManager.getSelectedRangeManager();
	undoFlag = (undoFlag === undefined ? false : undoFlag);
	var opeType = prepData.opeType;

	// フレーズの単純解除の実行および undo/redo
	if (opeType == BOX_OPERATION.CANCEL) {
		if (!undoFlag) {
			TextEditor.cancelReadingRaw(prepData.phraseNode);
		} else {
			TextEditor.setReadingRaw(prepData.childList, prepData.phraseNode);
		}
	}

	// フレーズの単純作成の実行および undo/redo
	else if (opeType == BOX_OPERATION.INSERT) {
		if (!undoFlag) {
			TextEditor.setReadingRaw(nodeList, prepData.newPhraseNode);
		} else {
			TextEditor.cancelReadingRaw(prepData.newPhraseNode);
		}
	}

	// 既存フレーズの解除と新規作成の実行および undo/redo
	else if (opeType == BOX_OPERATION.CANCEL_AND_INSERT || opeType == BOX_OPERATION.DIVIDE) {
		// 解除されるノードのリストと数を取得します
		var canceledNodes = prepData.canceledNodes;
		var canceledCount = canceledNodes.length;

		// 実行 /redo
		if (!undoFlag) {
			// 既存フレーズを解除します
			// ★ここは特に変わらなくていいはず。
			for (var i = 0; i < canceledCount; i++) {
				var localPhrase = canceledNodes[i].existingNode;
				TextEditor.cancelPhraseBoxRaw(localPhrase);
			}
			// フレーズを設定します
			// ★フレーズノードとそこに渡すノード配列が複数のケースが発生する
			if (prepData.newPhraseNode.length == void 0) {
				TextEditor.setPhraseBoxRaw(prepData.nodeListForCancel, prepData.newPhraseNode);
			}
			else {
				for (var i = 0; i < prepData.newPhraseNode.length; i++)
					TextEditor.setPhraseBoxRaw(prepData.nodeListForCancel[i], prepData.newPhraseNode[i]);
			}
		}
		// undo
		else {
			// フレーズを削除します
			// ★解除されるフレーズが複数のケースが発生する
			if (prepData.newPhraseNode.length == void 0) {
				TextEditor.cancelPhraseBoxRaw(prepData.newPhraseNode);
			}
			else {
				for (var i = 0; i < prepData.newPhraseNode.length; i++)
					TextEditor.cancelPhraseBoxRaw(prepData.newPhraseNode[i]);
			}
			// 元々のフレーズを回復します
			// ★ここは特に変更しなくてよい、か
			for (var i = 0; i < canceledCount; i++) {
				var localInfo = canceledNodes[i];
				var localRead = localInfo.existingNode;
				var localNodeList = localInfo.existingChildlen;
				TextEditor.setPhraseBoxRaw(localNodeList, localRead);
			}
		}
	}

	// 選択範囲をクリアします
	selectedRangeManager.clearSelectedRange();

	// Undo 時には、必要に応じて選択範囲を復元します
	if (undoFlag && selectFlag) {
		selectedRangeManager.reconfigureSelectedNode(nodeList);
	}

	// レンダラへ段落変更を通知します
	ViewManager.getRenderer().setUpdatedParagraph(prepData.targetParagraph);
	return true;
};

/**
 * フレーズを解除します
 * @param decoNode 既存のフレーズノードのインスタンス
 */
TextEditor.cancelPhraseBoxRaw = function(phraseNode) {
	TextEditor.cancelFrameBorderRaw(phraseNode);           // 囲み枠のキャンセルと全く同じ動作です。
};

/**
 * 指定ノードにフレーズを設定します
 * @param nodeList		フレーズを設定するノードの配列
 * @param phraseNode	フレーズノード
 */
TextEditor.setPhraseBoxRaw = function(nodeList, phraseNode) {
	TextEditor.setFrameBorderRaw(nodeList, phraseNode); // 囲み枠の新規作成と全く同じ動作です。
};


// ************************************************************************
// **                                ルビ                                **
// ************************************************************************

TextEditor.checkExistingNodes = function(nodeList, nodeName) {

	// ---- 最初と最後の共通親の祖先に ruby があるなら、取得: 既存ルビ書き換え用
	var nodeCount = nodeList.length;                     // ノードリストの要素数
	var pareNode  = nodeList[0];                         // 操作対象要素の親要素
	if (nodeCount > 1) {                                 // ---- 複数のノードがある場合、共通の親を取得します。
		pareNode  = DataClass.getSharedParent('#' + nodeList[0].id + ' , #' + nodeList[nodeCount - 1].id);
	};

	var ancestorNode	= $(pareNode).closest(nodeName);	// 直近の同種の祖先ノード（見つからなければ undefined）
	var existingNode	= null;								// 変更対象としての既存ノード
	var childList		= [];								// 変更対象としての既存ノードの子要素の配列
	var orgString		= null;								// 既存ノードのもともとの追加文字列（フレーズでは使用しない）
	var orgAccent		= null;								// 既存ノードのアクセント文字列（cread 専用）

	var canceledNodes	= [];								// 解除対象となる既存ノードの配列
	var nodeListForCancel = [];								// 既存ノード解除時に新規ノードに渡すノードを収める配列

	// 祖先に同種ノードがあったなら、既存ノードとして書き換えます
	if (ancestorNode[0] !== undefined) {
		// 祖先ノードを取得します
		existingNode = ancestorNode[0];
		DataClass.bindDataClassMethods(existingNode);

		// 祖先ノードの子要素配列を作成します
		var childCount = existingNode.firstChild.children.length - 1;
		for (var i = 0; i < childCount; i++) {
			childList.push(existingNode.firstChild.children[i]);
		}

		// 既存ノードの追加文字列を記録します（フレーズの場合は関係ありません）
		switch(nodeName) {
		case 'CRUBY':
			orgString = existingNode.ruby;
			break;
		case 'CREAD':
			orgString = existingNode.yomi;
			orgAccent = existingNode.accent;
			break;
		}
	}

	// 祖先に同種ノードがなければ、新規ノードを作成します
	else {
		// ---- 直下の段落にルビが含まれていないか
		for (var i = 0; i < nodeCount; i++) {
			var localNode = nodeList[i];
			var localNodeName = localNode.nodeName;

			// ルビノード追加時、対象に画像ノードが含まれていた場合、処理をキャンセルします
			if (nodeName == 'CRUBY' && localNodeName == 'CIMG') return null;

			// 直下に同種ノードがあった場合
			if (localNodeName == nodeName) {
				// 検出された同種ノードの子要素を収集します
				var existingChildlen = [];
				var childCount   = localNode.firstChild.children.length - 1;
				for (var j = 0; j < childCount; j++) {
					var localChild = localNode.firstChild.children[j];
					existingChildlen.push(localChild);
					// 既存ノード解除時に新規ノードに渡すリストに登録します
					nodeListForCancel.push(localChild);
				}
				var localExistingInfo = {existingNode : localNode, existingChildlen : existingChildlen};
				canceledNodes.push(localExistingInfo);
			}
			// 同種ノードでなかった場合、
			// 既存ノード解除時に新規ノードに渡すリストにそのまま登録します
			else {
				nodeListForCancel.push(localNode);
			}
		}
	}

	var existingNodeInfo = {};
	existingNodeInfo.existingNode		= existingNode;
	existingNodeInfo.childList			= childList;
	existingNodeInfo.orgString			= orgString;
	existingNodeInfo.orgAccent			= orgAccent;
	existingNodeInfo.canceledNodes		= canceledNodes;
	existingNodeInfo.nodeListForCancel	= nodeListForCancel;

	return existingNodeInfo;
};

// ---- 操作タイプを決定
TextEditor.getOperationType = function(existingNodeInfo, optionalStr, accent) {
	var existingNode  = existingNodeInfo.existingNode;
	var childList     = existingNodeInfo.childList;
	var orgString     = existingNodeInfo.orgString;
	var orgAccent		= existingNodeInfo.orgAccent;
	var canceledNodes = existingNodeInfo.canceledNodes;

	var opeType = BOX_OPERATION.NONE;
	if (optionalStr == '' && existingNode != null) opeType = BOX_OPERATION.CANCEL; // ルビなし
	if (optionalStr != '' && existingNode != null && (orgString != optionalStr || orgAccent != accent)) {
		opeType = BOX_OPERATION.CHANGE;                                 // ルビ変更
	}
	if (optionalStr != '' && existingNode == null) opeType = BOX_OPERATION.INSERT; // ルビ新規作成
	if (canceledNodes.length) opeType = BOX_OPERATION.CANCEL_AND_INSERT;           // 既存ルビ削除と、ルビ新規作成

	return opeType;
};

// ---- static {} ルビ指定の準備を行います。
TextEditor.prepareRuby = function(nodeList, ruby) {
	// nodeList  [配列] : 対象要素のリスト
	// ruby [文字列]    : ルビ文字列・・・空文字列なら、ルビ解除

	// ---- 操作対象となる段落ノードを記録します。
	var targetParagraph = DataClass.getRootParagraph(nodeList[0]);

	// ---- 既存ノードに基づいて、必要なノード情報を収集
	var existingNodeInfo = TextEditor.checkExistingNodes(nodeList, 'CRUBY');
	if (existingNodeInfo === null) return null;

	// ---- 操作タイプを決定
	var opeType = TextEditor.getOperationType(existingNodeInfo, ruby);

	// ---- ルビの新規作成ならば、新しい ruby を作成します。
	var newRubyNode = null;                              // 新しい ruby 要素
	if (opeType == BOX_OPERATION.INSERT || BOX_OPERATION.CANCEL_AND_INSERT) { // ---- ルビ新規作成操作なら
		newRubyNode = RubyElement.createNew();           // 新しい ruby 要素を作成
		RubyElement.doop(newRubyNode);                   // doop
		newRubyNode.ruby = ruby;                         // ルビ文字列設定
	}

	// ---- 準備結果
	var prepData = {};
	prepData.targetParagraph   = targetParagraph;          // 対象段落ノード: renderer 更新用
	prepData.rubyNode          = existingNodeInfo.existingNode; // 既存 ruby ノード
	prepData.childList         = existingNodeInfo.childList;                // 既存 ruby ノードの子要素ノードリスト
	prepData.orgRuby           = existingNodeInfo.orgString;                  // 既存 ruby ノードのもともとのルビ文字列
	prepData.opeType           = opeType;                  // 操作タイプ
	prepData.newRubyNode       = newRubyNode;              // 新しい ruby ノード
	prepData.canceledNodes     = existingNodeInfo.canceledNodes; // キャンセルされるルビノード: キャンセル&新規作成時用
	prepData.nodeListForCancel = existingNodeInfo.nodeListForCancel; // 既存ルビキャンセル時用ノードリスト

	return prepData;
};

// ---- static ルビ操作を行います。
TextEditor.setRuby = function(nodeList, ruby, prepData, selectFlag, undoFlag) {
	// nodeList  [DOM配列]            : 対象要素のリスト
	selectedRangeManager = EditManager.getSelectedRangeManager();
	undoFlag = undoFlag === undefined ? false : undoFlag;

	var opeType = prepData.opeType;
	if (opeType == BOX_OPERATION.CANCEL) {        // ---- ルビなし
		if (!undoFlag) {                                  // ---- 実行 / Redo なら
			TextEditor.cancelRubyRaw(prepData.rubyNode);          // ルビ キャンセル
		} else {                                          // ---- Undo なら
			TextEditor.setRubyRaw(prepData.childList, prepData.rubyNode); // ルビ セット
		}
	} else if (opeType == BOX_OPERATION.CHANGE) { // ---- ルビ変更
		var localRuby = undoFlag ? prepData.orgRuby : ruby;     // 実行 / Redo か、Undo かで用意する文字列を変える
		TextEditor.changeRubyRaw(prepData.rubyNode, localRuby); // ルビ文字列変更
	} else if (opeType == BOX_OPERATION.INSERT) { // ---- ルビ新規作成
		if (!undoFlag) {                                  // ---- 実行 / Redo なら
			TextEditor.setRubyRaw(nodeList, prepData.newRubyNode); // ルビ セット
		} else {                                          // ---- Undo なら
			TextEditor.cancelRubyRaw(prepData.newRubyNode);        // ルビ キャンセル
		}
	} else if (opeType == BOX_OPERATION.CANCEL_AND_INSERT) {
		var canceledNodes = prepData.canceledNodes;
		var canceledCount = canceledNodes.length;
		if (!undoFlag) {                                  // ---- 実行 / Redo なら
			// ---- 既存ルビ
			for (var i = 0; i < canceledCount; i++) {
				var localRuby = canceledNodes[i].existingNode;
				TextEditor.cancelRubyRaw(localRuby);          // ルビ キャンセル
			}
			TextEditor.setRubyRaw(prepData.nodeListForCancel, prepData.newRubyNode); // ルビ セット
		} else {                                          // ---- Undo なら
			TextEditor.cancelRubyRaw(prepData.newRubyNode);        // ルビ キャンセル
			// ---- 既存ルビ復活
			for (var i = 0; i < canceledCount; i++) {
				var localInfo = canceledNodes[i];
				var localRuby = localInfo.existingNode;
				var localNodeList = localInfo.existingChildlen;
				TextEditor.setRubyRaw(localNodeList, localRuby); // ルビ セット
			}
		}
	}

	// 選択範囲のクリアを行います。
	selectedRangeManager.clearSelectedRange();

	// Undo 時には、必要に応じて選択範囲の復元を行います。
	if (undoFlag && selectFlag) {
		selectedRangeManager.reconfigureSelectedNode(nodeList);
	}

	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(prepData.targetParagraph);
	return true;
};

// ---- static ruby をキャンセルします。
TextEditor.cancelRubyRaw = function(rubyNode) {
	// rubyNode [node インスタンス] : 既存 rubyNode ノード
	TextEditor.cancelFrameBorderRaw(rubyNode);           // 囲み枠のキャンセルと全く同じ動作です。
};

// ---- static ruby を変更します。
TextEditor.changeRubyRaw = function(rubyNode, ruby) {
	RubyElement.doop(rubyNode);                          // doop
	rubyNode.ruby = ruby;                                // 囲み枠とは 属性名が違います。
};

// ---- static ruby を挿入します。
TextEditor.setRubyRaw = function(nodeList, newRubyNode) {
	// ---- static decoBox を挿入します。
	TextEditor.setFrameBorderRaw(nodeList, newRubyNode); // 囲み枠の新規作成と全く同じ動作です。
};



// ************************************************************************
// **                                読み                                **
// ************************************************************************

// ---- static {} 囲み枠指定の準備を行います。
TextEditor.prepareReading = function(nodeList, read, accent) {
	// nodeList  [配列] : 対象要素のリスト
	// read [文字列]    : 読み文字列・・・空文字列なら、読み解除

	// ---- 操作対象となる段落ノードを記録します。
	var targetParagraph = DataClass.getRootParagraph(nodeList[0]);

	// ---- 既存ノードに基づいて、必要なノード情報を収集
	var existingNodeInfo = TextEditor.checkExistingNodes(nodeList, 'CREAD');

	// ---- 操作タイプを決定
	var opeType = TextEditor.getOperationType(existingNodeInfo, read, accent);


/*
	// ---- 最初と最後の共通親の祖先に read があるなら、取得
	var nodeCount = nodeList.length;                     // ノードリストの要素数
	var pareNode  = nodeList[0];                         // 操作対象要素の親要素
	if (nodeCount > 1) {                                 // ---- 複数のノードがある場合、共通の親を取得します。
		pareNode  = DataClass.getSharedParent('#' + nodeList[0].id + ' , #' + nodeList[nodeCount - 1].id);
	};
	var readNode = null;                                 // 既存 read ノード
	var ancestorNode = $(pareNode).closest('cread');     // 祖先ノードの read 要素をチェック
	if (ancestorNode[0] !== undefined) {                 // ---- 祖先ノードに read 要素があったなら
		readNode = ancestorNode[0];                              // 既存 read 発見
	}
	var childList = [];
	var orgRead   = null;                                // 既存 read ノードのもともとの読み文字列
	if (readNode) {                                      // ---- 既存 read ノードが存在するなら
		ReadingElement.doop(readNode);                              // doop
		// ---- childList を作成
		var childCount = readNode.firstChild.children.length - 1;
		for (var i = 0; i < childCount; i++) {
			childList.push(readNode.firstChild.children[i]);
		}
		// ---- オリジナルの読みを記録します。
		orgRead = readNode.yomi;                         // 既存 read ノードのもともとの読み文字列
	}

	// ---- 操作タイプを決定します。
	var opeType = BOX_OPERATION.NONE;
	if (read == '' && readNode != null) opeType = BOX_OPERATION.CANCEL; // 読みなし
	if (read != '' && readNode != null && orgRead != read) {
		opeType = BOX_OPERATION.CHANGE;                                 // 読み変更
	}
	if (read != '' && readNode == null) opeType = BOX_OPERATION.INSERT; // 読み新規作成
*/
	// ---- 読みの新規作成ならば、新しい read を作成します。
	var newreadNode = null;                              // 新しい read 要素
	if (opeType == BOX_OPERATION.INSERT || BOX_OPERATION.CANCEL_AND_INSERT) { // ---- 読み新規作成操作なら
		var pareNode  = nodeList[0].parentNode;							// 操作対象要素の親要素
		DataClass.bindDataClassMethods(pareNode);
		newreadNode = ReadingElement.createNew(pareNode.nt);	// 新しい read 要素を作成
		ReadingElement.doop(newreadNode);                    // doop
		newreadNode.yomi = read;						// 読み文字列設定
		newreadNode.accent = accent;					// アクセント設定
	}

	// ---- 準備結果
	var prepData = {};
	prepData.targetParagraph = targetParagraph;          // 対象段落ノード: renderer 更新用
//	prepData.readNode        = readNode;                 // 既存 read ノード
	prepData.readNode        = existingNodeInfo.existingNode;   // 既存 read ノード
//	prepData.childList       = childList;                // 既存 read ノードの子要素ノードリスト
	prepData.childList       = existingNodeInfo.childList; // 既存 read ノードの子要素ノードリスト
//	prepData.orgRead         = orgRead;                  // 既存 read ノードのもともとの読み文字列
	prepData.orgRead         = existingNodeInfo.orgString;                  // 既存 read ノードのもともとの読み文字列
	prepData.opeType         = opeType;                  // 操作タイプ
	prepData.newreadNode     = newreadNode;              // 新しい read ノード
	prepData.canceledNodes     = existingNodeInfo.canceledNodes; // キャンセルされる読みノード: キャンセル&新規作成時用
	prepData.nodeListForCancel = existingNodeInfo.nodeListForCancel; // 既存読みキャンセル時用ノードリスト

	return prepData;
};

// ---- static 読み操作を行います。
TextEditor.setReading = function(nodeList, read, prepData, selectFlag, undoFlag, accent) {
	// nodeList  [DOM配列]            : 対象要素のリスト
	selectedRangeManager = EditManager.getSelectedRangeManager();
	undoFlag = undoFlag === undefined ? false : undoFlag;

	var opeType = prepData.opeType;
	if (opeType == BOX_OPERATION.CANCEL) {										// ---- 読みなし
		if (!undoFlag) {														// ---- 実行 / Redo なら
			TextEditor.cancelReadingRaw(prepData.readNode);						// 読み キャンセル
		} else {																// ---- Undo なら
			TextEditor.setReadingRaw(prepData.childList, prepData.readNode);	// 読み セット
		}
	} else if (opeType == BOX_OPERATION.CHANGE) {								// ---- 読み変更
		var localReading = undoFlag ? prepData.orgRead : read;					// 実行 / Redo か、Undo かで用意する文字列を変える
		TextEditor.changeReadingRaw(prepData.readNode, localReading, accent);	// 読み変更
	} else if (opeType == BOX_OPERATION.INSERT) {								// ---- 読み新規作成
		if (!undoFlag) {														// ---- 実行 / Redo なら
			TextEditor.setReadingRaw(nodeList, prepData.newreadNode);			// 読み セット
		} else {																// ---- Undo なら
			TextEditor.cancelReadingRaw(prepData.newreadNode);					// 読み キャンセル
		}
	} else if (opeType == BOX_OPERATION.CANCEL_AND_INSERT) {
		var canceledNodes = prepData.canceledNodes;
		var canceledCount = canceledNodes.length;
		if (!undoFlag) {														// ---- 実行 / Redo なら
			// ---- 既存読み
			for (var i = 0; i < canceledCount; i++) {
				var localRead = canceledNodes[i].existingNode;
				TextEditor.cancelReadingRaw(localRead);							// 読み キャンセル
			}
			TextEditor.setReadingRaw(prepData.nodeListForCancel, prepData.newreadNode); // 読み セット
		} else {																// ---- Undo なら
			TextEditor.cancelReadingRaw(prepData.newreadNode);					// 読み キャンセル
			// ---- 既存読み復活
			for (var i = 0; i < canceledCount; i++) {
				var localInfo = canceledNodes[i];
				var localRead = localInfo.existingNode;
				var localNodeList = localInfo.existingChildlen;
				TextEditor.setReadingRaw(localNodeList, localRead);				// 読み セット
			}
		}
	}


	// 選択範囲のクリアを行います。
	selectedRangeManager.clearSelectedRange();

	// Undo 時には、必要に応じて選択範囲の復元を行います。
	if (undoFlag && selectFlag) {
		selectedRangeManager.reconfigureSelectedNode(nodeList);
	}

	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(prepData.targetParagraph);
	return true;
};

// ---- static read をキャンセルします。
TextEditor.cancelReadingRaw = function(readNode) {
	// readNode [node インスタンス] : 既存 readNode ノード
	TextEditor.cancelFrameBorderRaw(readNode);           // 囲み枠のキャンセルと全く同じ動作です。
};

// ---- static read を変更します。
TextEditor.changeReadingRaw = function(readNode, read, accent) {
	ReadingElement.doop(readNode);                          // doop
	readNode.yomi = read;                                // 囲み枠とは 属性名が違います。
	readNode.accent = accent;
};

// ---- static read を挿入します。
TextEditor.setReadingRaw = function(nodeList, newreadNode) {
	// ---- static decoBox を挿入します。
	TextEditor.setFrameBorderRaw(nodeList, newreadNode); // 囲み枠の新規作成と全く同じ動作です。
};



// ************************************************************************
// **                            ポーズの挿入                            **
// ************************************************************************

// [static] ------------- 指定位置へのポーズ挿入：準備
TextEditor.preparePause = function(caret, isLong) {
	// caret : キャレット
	// isLong : true = LP (ロングポーズ)、false = SP (ショートポーズ)

	// ---- 更新対象段落取得
	var caretNode = DocumentManager.getNodeById(caret.pos);			// キャレット位置のノード
	var targetParagraph = DataClass.getRootParagraph(caretNode);	// レンダラ用更新段落

	// ---- ポーズノード作成
	var pauseNode = PauseElement.createNew();						// pause 要素
	DataClass.bindDataClassMethods(pauseNode);						// doop
	pauseNode.isLong = isLong;										// ロング or ショート

	// ---- 準備結果
	var prepData = {};
	prepData.caretNode = caretNode;									// キャレットノード
	prepData.targetParagraph = targetParagraph;						// 対象段落ノード: renderer 更新用
	prepData.pauseNode = pauseNode;									// 挿入するポーズノード

	return prepData;
};

// [static] ------------- 指定位置へのポーズ挿入：実施
TextEditor.insertPause = function(prepData, undoFlag) {
	if (undoFlag === void 0) undoFlag = false;

	var caretNode  = prepData.caretNode;       // キャレットノード
	var parentNode = caretNode.parentNode;     // 親ノード取得
	var pauseNode  = prepData.pauseNode;       // pause 要素
	if (undoFlag) {                            // ---- undo なら
		parentNode.removeChild(pauseNode);             // ポーズノード削除
	} else {                                   // ---- redo / 初実行なら
		parentNode.insertBefore(pauseNode, caretNode); // ポーズノード挿入
	}

	// ---- レンダラへ段落変更を通知
	var renderer = ViewManager.getRenderer();
	renderer.setUpdatedParagraph(prepData.targetParagraph);

	// カーソル
//	var caretId = caretNode.pos;
//	ViewManager.getSelectionUpdater().setCaretPostion(caretId); // カーソル移動
//	renderer.setCaretPos(null, caretId);         // レンダラへカーソル移動登録
};



// ************************************************************************
// **                       フレーズ分割の挿入                           **
// ************************************************************************

/**
 * 指定位置へのフレーズ分割挿入：準備
 */
TextEditor.prepareHighlightCtrl = function(caret) {
	// caret : キャレット

	// ---- 更新対象段落取得
	var caretNode = DocumentManager.getNodeById(caret.pos);			// キャレット位置のノード
	var targetParagraph = DataClass.getRootParagraph(caretNode);	// レンダラ用更新段落

	// ---- ハイライト制御ノード作成
	var highlightCtrlNode = HighlightDivideElement.createNew();
	DataClass.bindDataClassMethods(highlightCtrlNode);				// doop

	// ---- 準備結果
	var prepData = {};
	prepData.caretNode = caretNode;									// キャレットノード
	prepData.targetParagraph = targetParagraph;						// 対象段落ノード: renderer 更新用
	prepData.highlightCtrlNode = highlightCtrlNode;					// 挿入するハイライト制御ノード

	return prepData;
};

/**
 * 指定位置へのフレーズ分割挿入：実施
 */
TextEditor.insertHighlightCtrl = function(prepData, undoFlag) {
	if (undoFlag === void 0) undoFlag = false;

	var caretNode  = prepData.caretNode;							// キャレットノード
	var parentNode = caretNode.parentNode;							// 親ノード取得
	var highlightCtrlNode  = prepData.highlightCtrlNode;			// pause 要素

	if (undoFlag) {													// ---- undo なら
		parentNode.removeChild(highlightCtrlNode);					// ポーズノード削除
	} else {														// ---- redo / 初実行なら
		parentNode.insertBefore(highlightCtrlNode, caretNode);		// ポーズノード挿入
	}

	// ---- レンダラへ段落変更を通知
	var renderer = ViewManager.getRenderer();
	renderer.setUpdatedParagraph(prepData.targetParagraph);
};



//************************************************************************
//**                              数式番号                              **
//************************************************************************

/**
 * 数式番号指定の準備を行います。
 * @param nodeList	数式番号指定・解除対象ノードのリスト
 */
TextEditor.prepareSetEqNumber = function(nodeList) {
	// 戻り値に使用するため、何もしない準備データを作成します
	var prepData = {};
	prepData.opeType = BOX_OPERATION.NONE;

	// ノードがなければ、null を返します
	if (nodeList.length <= 0) return prepData;

	// 複数段落をまたいでいれば、null を返します
	var paragraphList  = DataClass.targetParagraphs(nodeList);
	if (paragraphList.length > 1) return prepData;

	// 段落丸ごと選択されている場合、子ノードのみにします。
	nodeList = DataClass.pickUpParaChildren(nodeList);

	// 操作対象となる段落ノードを記録します。
	var targetParagraph = DataClass.getRootParagraph(nodeList[0]);
	Paragraph.doop(targetParagraph);
	var originalAlign = targetParagraph.align;

	// 処理タイプを保持する変数
	var opeType = BOX_OPERATION.NONE;

	// 範囲が段落直下である場合、
	// 段落終端を含んでなければ、null を返します
	// 段落終端を含んでいれば、数式番号を作成する準備を行います
	if ((nodeList[0].parentNode.nodeName === 'PARAGRAPH') &&  (nodeList[nodeList.length - 1].parentNode.nodeName === 'PARAGRAPH')) {
		if (nodeList[nodeList.length - 1].nextSibling.nodeName !== 'BR') return prepData;
		opeType = BOX_OPERATION.INSERT;
	}

	var eqNumberNode = null;

	// 範囲が数式番号を含んでいる場合、
	// 数式番号要素を取得します
	// 数式番号は段落レベルにしか設定できないため、選択範囲の子や孫は確認しません。また、終端以外は確認しません。
	if (nodeList[nodeList.length - 1].nodeName === 'ENUMBER') {
		eqNumberNode = nodeList[nodeList.length - 1];
		opeType = BOX_OPERATION.CANCEL;
	}

	// 範囲の祖先に数式番号がある場合、
	// 数式番号要素を取得します
	// 範囲の一部だけが数式番号要素に含まれることはないため、先頭要素のみ確認します
	var ancestorNode = DataClass.getClosest(nodeList[0], 'ENUMBER')
	if (ancestorNode !== null) {
		eqNumberNode = ancestorNode;
		opeType = BOX_OPERATION.CANCEL;
	}

	// すべき操作が特定できていなければ、null を返します
	if (opeType === BOX_OPERATION.NONE) return prepData;

	// 以下、準備実処理です
	var newEqNoNode = null;
	var childList = [];

	if (opeType === BOX_OPERATION.INSERT) {
		// 数式番号要素の作成準備をします
		var newEqNoNode = EquationNumberElement.createNew();
	} else {
		// 数式番号要素の解除準備をします
		// 数式番号要素を取得していた場合、
		// 要素の情報を記録します
		var childCount = eqNumberNode.firstChild.children.length - 1;
		for (var i = 0; i < childCount; i++) {
			childList.push(eqNumberNode.firstChild.children[i]);
		}
	}

	// 準備結果を作成します
	prepData.targetParagraph = targetParagraph;			// 対象段落ノード: renderer 更新用
	prepData.originalAlign   = originalAlign;			// 対象段落のアライン
	prepData.eqNumberNode    = eqNumberNode;			// 既存 ノード
	prepData.childList       = childList;				// 既存 の子要素ノードリスト
	prepData.opeType         = opeType;					// 操作タイプ
	prepData.newEqNoNode     = newEqNoNode;				// 新しいノード

	return prepData;
};

/**
 * 数式番号の設定・解除
 */
TextEditor.setEqNumber = function(nodeList, prepData, selectFlag, undoFlag) {
	// nodeList  [DOM配列]            : 対象要素のリスト
	selectedRangeManager = EditManager.getSelectedRangeManager();
	undoFlag = (undoFlag === void 0) ? false : undoFlag;

	var targetParagraph = prepData.targetParagraph; // 対象段落ノード
	Paragraph.doop(targetParagraph);

	var opeType = prepData.opeType;
	if (opeType == BOX_OPERATION.CANCEL) {        // 数式番号の解除とそのundo

		if (!undoFlag) { // ---- 実行 / Redo なら
			TextEditor.cancelEqNumberRaw(prepData.eqNumberNode);
			targetParagraph.align = PARAGRAPH_ALIGN.left;
		} else {         // ---- Undo なら
			TextEditor.setEqNumberRaw(prepData.childList, prepData.eqNumberNode);
			targetParagraph.align = prepData.originalAlign;
		}
	} else if (opeType == BOX_OPERATION.INSERT) { // 数式番号の設定とそのundo

		if (!undoFlag) { // ---- 実行 / Redo なら
			TextEditor.setEqNumberRaw(nodeList, prepData.newEqNoNode);
			targetParagraph.align = PARAGRAPH_ALIGN.center;
		} else {         // ---- Undo なら
			TextEditor.cancelEqNumberRaw(prepData.newEqNoNode);
			targetParagraph.align = prepData.originalAlign;
		}
	}

	// 選択範囲のクリアを行います。
	selectedRangeManager.clearSelectedRange();

	// Undo 時には、必要に応じて選択範囲の復元を行います。
	if (undoFlag && selectFlag) {
		selectedRangeManager.reconfigureSelectedNode(nodeList);
	}

	// ---- レンダラへ段落変更を通知
	ViewManager.getRenderer().setUpdatedParagraph(prepData.targetParagraph);
	return true;
};


/**
 * 数式番号を解除します。
 */
TextEditor.cancelEqNumberRaw = function(eqNode) {
	// decoNode [node インスタンス] : 既存 decoBox ノード

	// ---- キャンセル操作前の準備
	var baseNode = eqNode.nextSibling;     // 挿入先の基準となるノード (既存ノードの弟ノード)
	var paraNode = eqNode.parentNode ;     // 数式番号要素の親ノード（段落ノード）

	// ---- decoBox を 親から切り離し、子ノードの引越しを行います。
	paraNode.removeChild(eqNode);          // 既存 decoBox を、親から切り離します。

	// ---- 子ノードの引っ越し準備：対象子ノードへの参照を配列へ格納
	var childList  = [];
	var childCount = eqNode.firstChild.children.length - 1; // 子要素の数 (G 内の BR は除外)
	for (var i = 0; i < childCount; i++) {
		childList.push(eqNode.firstChild.children[i]);
	}

	// ---- 子ノードの引越し
	for (var i = 0; i < childCount; i++) {       // ---- 子ノード分ループ
		var localChild = childList[i];                   // 該当子ノード
		paraNode.insertBefore(localChild, baseNode); // 子ノード引っ越し
	}
};


/**
 * 数式番号を作成します
 */
TextEditor.setEqNumberRaw = function(nodeList, newEqNode) {
	// ---- 新しい decoBox ノード挿入
	var paraNode = nodeList[0].parentNode;
	paraNode.insertBefore(newEqNode, nodeList[0]);

	// ---- nodeList のノードを、newDecoNode 配下の G　配下へ引越し
	var distGNode = newEqNode.firstChild;
	var baseNode  = distGNode.lastChild;    // 挿入先基準位置
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		distGNode.insertBefore(nodeList[i], baseNode);
	}
};
