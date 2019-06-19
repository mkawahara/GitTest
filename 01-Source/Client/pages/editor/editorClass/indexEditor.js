/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： indexEditor.js                                     */
/* -                                                                         */
/* -    概      要     ： 複合処理層 IndexEditorクラス                       */
/* -                                                                         */
/* -    依      存     ： utility.js                                         */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年05月21日                         */

// ------------- コンストラクタ
function IndexEditor(){};

// ************************************************************************
// **                   セクションインデックス深度変更                   **
// ************************************************************************

// [static] ------ インデックス深度を指定方向へ 1 つシフトします。
IndexEditor.shiftIndexDepth = function(indexArr, distance) {
	// indexArr [int配列] : 操作するセクションのインデックス番号を格納した配列 ( インデックス番号は 0 始まり )
	// distance [int]     : シフトする方向。負の数で左へ、0 はシフトなし、正の数で右へシフトします。
	// 返値 shiftedDepthArr { 'index' : セクションインデックス, 'depth' : インデックス深度 }[配列]
	//      失敗時は null

	var secInfoList   = DocumentManager.getSectionInfoList();  // セクション情報リストを取得します。
	var sectionCount  = secInfoList.length;                    // セクション総数
	var indexArrCount = indexArr.length;                       // インデックス配列の長さを取得

	// ----引数やセクション情報に不正値があれば、失敗します。
	if (sectionCount <= 0 || indexArrCount <= 0 || indexArrCount > sectionCount) return null;

	// ---- 単純な深度変更計算を行います。
	distance = distance < 0 ? -1 : (distance > 0 ? 1 : 0);     // シフト方向の指示を正規化します。
	for (var i = 0; i < indexArrCount; i++) {                  // ---- インデックス配列数分ループ
		var localIndex              = indexArr[i];                     // 今回処理するセクションインデックス番号を取得
		var localInfoList           = secInfoList[localIndex];         // 処理中の情報オブジェクトへの参照
		localInfoList.originaldepth = localInfoList.depth;             // 変更前の深度を記録しておきます。
		localInfoList.depth        += distance;                        // 単純な深度変更を行います。
	}

	// ---- 深度の調整を行い、差分値を取得します。
	var diffList = IndexEditor.adjustDepth(secInfoList);       // 深度の調整を行い、差分値を取得します。
	if (diffList === null) return null;                        // 深度変更の必要がなければ、null を返します。

	// ---- 深度をシフトします。
	IndexEditor.multiShift(diffList);                          // 深度シフト: 第二引数を省いています。
	return diffList;
};

// [static] ------ セクションインフォリストから、インデックス深度シフト用情報を生成します。
IndexEditor.adjustDepth = function(secInfoList) {
	var diffList = [];                                        // インデックス番号と深度差分値のペア
	var sectionCount = secInfoList.length;                    // セクション総数
	for (var i = 0; i < sectionCount; i++) {                  // ---- 全セクション分ループ
		var maxDepth     = i == 0 ? 0 : secInfoList[i - 1].depth + 1; // 最大深度取得
		var localInfo    = secInfoList[i];                            // 深度変更フラグ
		var changeFlag   = false;                                     // 深度変更の必要があるか
		var originalFlag = ('originaldepth' in localInfo);            // すでに深度変更が指示されていた項目か
		var currentDepth = localInfo.depth;                           // 現在深度取得
		// 調整深度を取得します。
		var targetDepth  = currentDepth > maxDepth ? maxDepth : (currentDepth < 0 ? 0 : currentDepth);
		if (originalFlag) currentDepth = localInfo.originaldepth;     // 変更前の深度値
		var depthDiff    = targetDepth - currentDepth;                // 深度の差分を取得します。
		if (depthDiff != 0) changeFlag = true;                        // 深度の変更が必要か
		// 深度の変更が必要なら、インデックスと深度差分値のペアを保存します。
		if (changeFlag) diffList.push( {'index' : i, 'depthdiff' : depthDiff } );
		secInfoList[i].depth = targetDepth;
	}
	if (diffList.length == 0) diffList = null;                // 移動の必要がなかったなら
	return diffList;
};

// [static] ------ セクションのインデックス深度をまとめてシフトします (multiShiftRaw のラッパです) 。
IndexEditor.multiShift = function(diffList, depthCoef) {
	IndexEditor.multiShiftRaw(diffList, depthCoef);   // セクションのインデックス深度をまとめてシフトします。
	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
};

// [static] ------ セクションのインデックス深度をまとめてシフトします。
IndexEditor.multiShiftRaw = function(diffList, depthCoef) {
	depthCoef = depthCoef === undefined ? 1 : depthCoef;          // 深度差分値への係数設定
	var sectionCount = diffList.length;                           // 指定セクション数取得
	for (var i = 0; i < sectionCount; i++) {                       // ---- 指定セクション数分ループ
		var localInfo    = diffList[i];                                    // 対象差分値への参照
		var sectionList  = DocumentManager.getDocument();                  // セクションリスト DOM を取得します。
		var section      = sectionList.children[localInfo.index];        // 指定セクション DOM を取得します。
		Section.doop(section);                                             // Section.doop
		var currentDepth = section.depth;                                  // 現在の深度を取得
		section.depth = currentDepth + (depthCoef * localInfo.depthdiff);  // インデックス深度をシフトします。
	}
};



// ************************************************************************
// **                       セクション上下位置変更                       **
// ************************************************************************

// [static] ------ セクションの上下位置を 1 つ移動します (moveSectionsRaw のラッパです)。
IndexEditor.moveSections = function(indexArr, currentIndex, diffList, distance) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( 小さい順にソート済み )
	// currentIndex [数値] : カレントセクションのインデックス番号
	// distance     [数値] : 移動する方向。負の数で上へ、0 は移動なし、正の数で下へ移動します。
	// 返値 shiftedDepthArr { 'index' : セクションインデックス, 'depth' : インデックス深度 }[配列]
	//      失敗時は null

	// ---- 移動量チェック
	if (distance      == 0) return null;                       // 移動の必要がなければ、null 返しで抜けます。
	distance = distance < 0 ? -1 : (distance > 0 ? 1 : 0);     // 上下移動方向の指示を正規化します。

	// ---- インデックス配列チェック
	var indexArrCount = indexArr.length;                       // インデックス配列のサイズを取得
	if (indexArrCount <= 0) return null;                       // 移動の必要がなければ、null 返しで抜けます。

	// ---- 基本パラメータ取得
	var secInfoList   = DocumentManager.getSectionInfoList();  // セクション情報リストを取得します。
	var sectionCount  = secInfoList.length;                    // セクション総数

	// ---- 移動制限をチェック
	if (distance < 0 && indexArr[0] <= 0)                                   return null; // 先頭　が上移動不可
	if (distance > 0 && (indexArr[indexArrCount - 1] >= sectionCount - 1) ) return null; // 最後尾が下移動不可

	// ---- セクションの上下位置を 1 つ移動します。
	var result = IndexEditor.moveSectionsRaw(indexArr, currentIndex, diffList, distance);

	return result;
};

// [static] ------ セクションの上下位置を 1 つ移動します。
IndexEditor.moveSectionsRaw = function(indexArr, currentIndex, diffList, distance) {

	// ---- ソート済みインデックス配列を用いて、単純な移動処理を行います。
	var result = IndexEditor.simpleMove(indexArr, currentIndex, distance);

	// ---- 深度の調整を行ます。
	if (diffList === null) diffList = IndexEditor.adjustDepth( DocumentManager.getSectionInfoList() );
	if (diffList !== null) IndexEditor.multiShiftRaw(diffList); // 深度変更の必要があれば、深度を調整します。

	IndexEditor.finishSectionOperate(result.indexArr, result.currentIndex); // レンダラ登録等の最終処理を行います。
	return {'indexArr' : result.indexArr, 'currentIndex' : result.currentIndex, 'diffList' : diffList};
};

// [static] ------ セクションの上下位置移動の Undo 処理です。
IndexEditor.moveSectionsUndo = function(indexArr, currentIndex, diffList, distance) {
	if (diffList !== null) IndexEditor.multiShiftRaw(diffList, -1); // 深度変更を逆処理します。
	result = IndexEditor.simpleMove(indexArr, currentIndex, distance, -1);   // 移動処理を逆処理します。

	IndexEditor.finishSectionOperate(result.indexArr, result.currentIndex); // レンダラ登録等の最終処理を行います。
	return {'indexArr' : result.indexArr, 'currentIndex' : result.currentIndex};
};

// [static] ------ ソート済みインデックス配列を用いて、単純な移動処理を行います。
IndexEditor.simpleMove = function(indexArr, currentIndex, distance, moveCoef) {
	moveCoef = moveCoef === undefined ? 1 : moveCoef; // 上下移動への係数設定 1: 通常処理, -1: 逆転処理
	distance = distance * moveCoef;                   // 上下移動方向の決定
	var indexArrCount = indexArr.length;              // インデックス配列のサイズを取得
	var sections = DocumentManager.getDocument();     // セクションリストを取得
	SectionList.doop(sections);                       // SectionList.doop

	// ---- スキャン用パラメータ取得
	var baseIndex = 0;                                // デフォルトは上移動 : 配列の先頭からスキャンを初めて
	var incNum    = 1;                                // デフォルトは上移動 : インデックス増加方向へ処理を進める。
	if (distance > 0) {                               // ---- 下移動の場合
		baseIndex = indexArrCount - 1;                        // 配列の最後尾からスキャンを初めて
		incNum    = -1;                                       // インデックス減少方向へ処理を進める。
	}

	// ---- セクションの位置変更を行います。
	for (i = 0; i < indexArrCount; i++) {             // ---- インデックス配列の長さ分ループ
		var localIndex         = baseIndex + i * incNum;       // 処理対象の配列内インデックス
		var targetSectionIndex = indexArr[localIndex];         // 処理対象のセクションインデックス
		// ---- 入れ替えるセクションインデックスを設定
		var youngIndex = targetSectionIndex - 1;               // デフォルトは上移動 : 指定インデックス - 1 と
		var oldIndex   = targetSectionIndex;                   // デフォルトは上移動 : 指定インデックスを入れ替えます。
		if (incNum == -1) {                                    // ---- 下移動の場合
			youngIndex = targetSectionIndex;                           //  指定インデックス - 1 と
			oldIndex   = targetSectionIndex + 1;                       //  指定インデックス + 1 を入れ替えます。
		}
		// ---- youngIndex と oldIndex を入れ替えます。
		sections.swap(youngIndex, oldIndex);                   // 入れ替え処理実行
	}

	// ---- 選択セクションのインデックス番号を更新します。
	for (i = 0; i < indexArrCount; i++) {              // ---- インデックス配列の長さ分ループ
		indexArr[i] += distance;                               // 選択セクションのインデックス番号を更新します。
	}
	currentIndex += distance;                          // カレントセクションのインデックス番号を更新します。

	// ---- 位置変更後の各情報を返します。
	return {'indexArr' : indexArr, 'currentIndex' : currentIndex};
};

// [static] ------ セクション編集処理を完了します。
IndexEditor.finishSectionOperate = function(indexArr, currentIndex) {

	var selUp = ViewManager.getSelectionUpdater();
	selUp.setSectionSelect(indexArr);     // 選択範囲登録
	selUp.setCurrentSelect(currentIndex); // カレントセクション登録

	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
};


// ************************************************************************
// **                           セクション追加                           **
// ************************************************************************

// [static] ------ 新しいセクションを追加します (appendSectionRow のラッパです)。
IndexEditor.appendSection = function(index, section) {
	// index [数値]           : セクションインデックス。新しいセクションは index の後に追加されます。
	// section [データノード] : (Undo / Redo 用) 追加するセクションノード。指定されなければ、新規作成します。

	if (index < 0 || index === null) index = -1; // index が 0 未満か null なら、先頭位置を指定します。

	// ---- 現在のインデックス深度を取得します。
	var depth = 0;
	if (index >= 0) {
		var secInfoList = DocumentManager.getSectionInfoList();
		depth = (index < 0 || index >= secInfoList.length) ? 0 : secInfoList[index].depth;
	}

	// ---- 現在のセクション選択状態を取得します。
	var originalSelection = IndexToolClass.getSelectedSectionIndex();

	// ---- セクションを追加します。
	if (!section) section = Section.createNew(false, depth);      // 空段落を一つだけ持つセクションノードの新規作成
	var newIndex = IndexEditor.appendSectionRaw(index, section);  // セクション追加

	return newIndex;
};

// [static] ------ 新しいセクションを追加します。
IndexEditor.appendSectionRaw = function(index, section) {
	// index [数値]           : セクションインデックス。新しいセクションは index の後に追加されます。
	// section [データノード] : 追加するセクションノード。

	var sectionList = DocumentManager.getDocument();              // セクションリストを取得
	SectionList.doop(sectionList);                                // SectionList.doop
//	var newIndex = sectionList.appendSection(section, index);     // セクション追加
	var newIndex = sectionList.appendSection(section, index + 1); // セクション追加

	IndexEditor.finishSectionOperate([newIndex], newIndex);       // レンダラ登録等の最終処理を行います。

	return newIndex;
}

// [static] ------ Undo 用関数です。
IndexEditor.appendSectionUndo = function(index, originalSelection) {
	// index [数値]           : セクション追加時の指定インデックスです。
	// セクション削除
	var newIndex = index + 1;
	var node = IndexEditor.simpleRemoveSection(newIndex); // セクション削除

	IndexEditor.finishSectionOperate(originalSelection, index);   // レンダラ登録等の最終処理を行います。

	return node;
}



// ************************************************************************
// **                           セクション削除                           **
// ************************************************************************

// [static] ------ 指定した範囲のセクションを削除します (removeSectionRaw のラッパです)。
IndexEditor.removeSection = function(indexArr) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( インデックス番号は 0 始まり )

	var secInfoList   = DocumentManager.getSectionInfoList(); // セクションインフォリスト取得
	var sectionCount  = secInfoList.length;                   // セクション総数
	var indexArrCount = indexArr.length;                      // インデックス配列の長さを取得

	// ---- 指定範囲の不正をチェックします。
	if (indexArrCount <= 0) return null;
	for (var i = 0; i < indexArrCount; i++) {
		var localIndex = indexArr[i];
		if (localIndex < 0 || localIndex >= sectionCount) return null; // 範囲外のインデックス指定があれば、失敗
	}

	// ------ 指定した範囲のセクションを削除します。
	var result = IndexEditor.removeSectionRaw(indexArr);
	if (!result) return null;                               // 失敗したら null 返しで抜けます。

	return result;
};

// [static] ------ 指定した範囲のセクションを削除します。
IndexEditor.removeSectionRaw = function(indexArr, diffList) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( インデックス番号は 0 始まり )

	// ---- セクションノードを削除します。
	var removedSectionList = IndexEditor.multiRemoveSections(indexArr);

	// ---- 深度調整を行います。
	if (diffList === undefined) diffList = IndexEditor.adjustDepth( DocumentManager.getSectionInfoList() );
	if (diffList !== null) IndexEditor.multiShiftRaw(diffList);

	IndexEditor.finishSectionOperate([], null);       // レンダラ登録等の最終処理を行います。

	return {'nodes' : removedSectionList, 'diffList' : diffList};
};

// [static] ------ Undo を行います。
IndexEditor.removeSectionUndo = function(indexArr, nodes, currentIndex, diffList) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( インデックス番号は 0 始まり )

	// ---- 深度調整を逆転します。
	if (diffList !== null) IndexEditor.multiShiftRaw(diffList, -1); // 深度変更を undo します。

	// ---- 削除されたセクションを追加します。
	var sectionList = DocumentManager.getDocument();              // セクションリストを取得
	SectionList.doop(sectionList);                                // SectionList.doop
	var indexCount = indexArr.length;
//	var baseIndex  = indexArr[0] - 1;
	for (var i = 0; i < indexCount; i++) {
//		sectionList.appendSection(nodes[i], indexArr[i] - 1);
		sectionList.appendSection(nodes[i], indexArr[i]);
	}

	IndexEditor.finishSectionOperate(indexArr, currentIndex);       // レンダラ登録等の最終処理を行います。
};

// [static] ------ 複数のセクションを単純に削除する機能です。
IndexEditor.multiRemoveSections = function(indexArr) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( インデックス番号は 0 始まり )
	var indexArrCount      = indexArr.length;                  // インデックス配列の長さを取得
	var removedSectionList = [];                               // 削除したノードのリスト
	for (var i = indexArrCount - 1; i >= 0; i--) {             // ---- インデックスの大きい方から順次ノードを削除
		var localIndex = indexArr[i];                                  // 対象とするセクションのインデックス番号
		var node = IndexEditor.simpleRemoveSection(localIndex);        // 1 ノード削除
		removedSectionList.unshift(node);                              // 削除したノードのインスタンスを保存
	}
	return removedSectionList;
}

// [static] ------ 単純なセクション削除機能です。
IndexEditor.simpleRemoveSection = function(index) {
	// index [数値] : 削除するセクションのインデックス番号
	var sectionList = DocumentManager.getDocument();      // セクションリストを取得
	SectionList.doop(sectionList);                        // SectionList.doop
	var node = sectionList.removeSection(index);          // セクション削除
	return node;
}



// ************************************************************************
// **                           セクション分割                           **
// ************************************************************************

// [static] ------ 前処理を含め、セクションの分割を行います。します (divideSectionRaw のラッパです)。
IndexEditor.divideSection = function(indexArr, currentIndex, dividePos) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( 小さい順にソート済み )
	// currentIndex [数値] : カレントセクションのインデックス番号
	// dividePos  [文字列] : 対象段落上での分割位置を表すノード ID

	// ---- レンジのチェック
	if ( !IndexEditor.checkSectionIndexRange(indexArr) ) return null;

	// ---- 分割元セクションの段落ノード数をチェックします。
	var sectionList = DocumentManager.getDocument();            // セクションリストを取得
	var srcSection  = sectionList.children[currentIndex];     // 分割元セクションを取得
	var emptySectionFlag = (srcSection.children.length <= 1); // 空セクションフラグ設定: true = 空になる
	// ---- 分割後、分割元が空セクションになるなら、改行だけを持つシンプルな段落ノードを作成します。
	var simpleParaNode = emptySectionFlag ? Paragraph.createNew(false) : null;

	// ---- 分割基準段落を取得します。
	var $baseChildNode = $(srcSection).find('#' + dividePos);
	var baseParaNode   = DataClass.getRootParagraph($baseChildNode[0]); // 段落ノード取得

	// ---- 分割先として新しいセクションを作成し、現在の深度を設定します。
	var secInfoList = DocumentManager.getSectionInfoList();
	var depth = (currentIndex < 0 || currentIndex >= secInfoList.length) ?
		0 : secInfoList[currentIndex].depth;                    // 深度取得
	var destSection = Section.createNew(true, depth);           // 完全な空セクションノードの新規作成

	// ---- セクションを分割します。
	IndexEditor.divideSectionRaw(currentIndex, srcSection, destSection, baseParaNode, simpleParaNode);

	var result = {};
	result.srcSection     = srcSection;     // 分割元セクションノード
	result.destSection    = destSection;    // 分割先セクションノード
	result.baseParaNode   = baseParaNode;   // 移動基準位置の段落ノード
	result.simpleParaNode = simpleParaNode; // 改行のみの段落ノード (null 時は不要)

	return result;
};

// [static] ------ セクションを分割します。
IndexEditor.divideSectionRaw = function(srcIndex, srcSection, destSection, baseParaNode, simpleParaNode) {
	// srcIndex [数値] : 分割元セクションのインデックス番号
	// srcSection       [Section ノード] : 分割元セクションノード
	// destSection      [Section ノード] : 分割先セクションノード
	// simpleParaNode [Paragraph ノード] : 改行のみの段落ノード、もしくは null

	// ---- 分割先セクションをセクションリストへ追加します。
	var sectionList = srcSection.parentNode;                 // セクションリストを取得
	SectionList.doop(sectionList);                           // SectionList.doop
//	sectionList.appendSection(destSection, srcIndex);        // セクション追加
	sectionList.appendSection(destSection, srcIndex + 1);    // セクション追加

	// ---- 分割元セクションの段落を、分割先セクションへ移動します。
	var paraCount = srcSection.children.length;            // 分割元セクションの総段落数
	var refNode   = null;                                    // insertBefore 用参照ノード
	for (var i = paraCount - 1; i >= 0; i--) {               // ---- 最終段落から順にループします。
		var targetParaNode = srcSection.children[i];               // 移動する段落ノード
		destSection.insertBefore(targetParaNode, refNode);           // 段落ノードの移動
		if (targetParaNode.id == baseParaNode.id) break;             // 必要な段落移動が終わったなら、ループ終了。
		refNode = targetParaNode;                                    // 次の段落は、今回移動した段落前へ移動されます。
	}

	// ---- 元セクションが空になるなら、元セクションへ改行のみの段落を挿入します。
	if (simpleParaNode !== null) srcSection.insertBefore(simpleParaNode, null);

	// ---- レンダラ登録等の最終処理を行います。
	var newIndex = srcIndex + 1;                              // 分割先セクションのインデックス番号
	IndexEditor.finishSectionOperate([newIndex], newIndex);   // 終了処理
	ViewManager.getRenderer().setUpdateEditorPane();		// エディタペインの更新を予約します
};

IndexEditor.divideSectionUndo = function(indexArr, srcIndex, dividePos, srcSection, destSection, simpleParaNode) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( 小さい順にソート済み )
	// srcIndex [数値] : カレントセクションのインデックス番号
	// dividePos  [文字列] : 対象段落上での分割位置を表すノード ID
	// srcSection       [Section ノード] : 分割元セクションノード
	// destSection      [Section ノード] : 分割先セクションノード
	// simpleParaNode [Paragraph ノード] : 改行のみの段落ノード、もしくは null

	// 必要なら元セクションを空にします。
	if (simpleParaNode !== null) srcSection.removeChild(simpleParaNode);

	// 分割先セクションへ移動した段落を分割元セクションへ戻します。
	var paraCount = destSection.children.length;
	for (var i = 0; i < paraCount; i++) {
		var targetParaNode = destSection.children[0];
		srcSection.appendChild(targetParaNode);
	}

	// 新規セクションを削除
	var sectionList = destSection.parentNode;             // セクションリストを取得
	sectionList.removeChild(destSection);

	// ---- レンダラ登録等の最終処理を行います。
	IndexEditor.finishSectionOperate(indexArr, srcIndex);   // 終了処理
	ViewManager.getRenderer().setUpdateEditorPane();		// エディタペインの更新を予約します
//	ViewManager.getSelectionUpdater().setCaretPostion(dividePos);
//	ViewManager.getStatusManager().showCaretStatus();
};

// ---- 指定セクションインデックス範囲の不正をチェックします。
IndexEditor.checkSectionIndexRange = function(indexArr) {
	// 範囲外のインデックス指定があれば、失敗 (false)
	var result        = false;
	var secInfoList   = DocumentManager.getSectionInfoList();
	var sectionCount  = secInfoList.length;
	var indexArrCount = indexArr.length;

	if (indexArrCount <= 0) return result;
	for (var i = 0; i < indexArrCount; i++) {
		var localIndex = indexArr[i];
		if (localIndex < 0 || localIndex >= sectionCount) return result;
	}
	result = true;
	return result;
};



// ************************************************************************
// **                           セクション結合                           **
// ************************************************************************

// [static] ------ 前処理を含め、セクションの結合を行います。 (combineSectionRaw のラッパです)。
IndexEditor.combineSection = function(indexArr) {
	// indexArr [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( 小さい順にソート済み )

	// ---- レンジのチェック
	if ( !IndexEditor.checkSectionIndexRange(indexArr) ) return null;

	// ---- 各セクションの先頭段落ノードへの参照をリストにします。
	var targetSectionCount = indexArr.length;                // 対象セクションの数
	var sectionArr         = new Array(targetSectionCount);  // 先頭段落参照リスト
	var sectionList        = DocumentManager.getDocument();  // セクションリストを取得
	for (var i = 0; i < targetSectionCount; i++) {           // ---- 対象セクション分ループ
		var localSecIndex   = indexArr[i];                           // ローカルなセクションインデックス番号取得
		var localSection    = sectionList.children[localSecIndex]; // ローカルな Section ノード取得
		sectionArr[i] = { 'node' : localSection,                     // Section ノードへの参照を記録
			'topParagraph' : localSection.children[0] };           // 先頭段落　　　への参照を記録
	}

	var result = IndexEditor.combineSectionRaw(indexArr);
	// result.diffList 深度調整情報
	// result に要素を追加して return します。
	result.sectionArr = sectionArr;
	return result;
};

// [static] ------ セクションの結合を行います。
IndexEditor.combineSectionRaw = function(indexArr, diffList) {
	// indexArr       [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( 小さい順にソート済み )
	// diffList [連想配列の配列] : 深度調整情報。undefined なら、新規に作成する。

	// ---- 結合元セクション内の段落ノードを、結合先セクションへ全て移動します。
	var sectionList      = DocumentManager.getDocument();      // セクションリストを取得
	var distSectionIndex = indexArr[0];                        // 結合先セクションのインデックス番号
	var distSectionNode  = sectionList.children[distSectionIndex]; // 結合先の Section ノード
	var sectionCount     = indexArr.length;                    // 操作対象セクションの数
	for (var i = 1; i < sectionCount; i++) {                   // ---- 対象セクション分ループ
		var srcSectionIndex = indexArr[i];                             // 結合元セクションインデックス番号取得
		var srcSectionNode  = sectionList.children[srcSectionIndex]; // 結合元 Section ノード取得
		var paraCount       = srcSectionNode.children.length;        // 結合元 Section ノード内の段落ノード総数
		for (var j = 0; j < paraCount; j++) {                          // ---- 該当セクション内の段落数分ループ
			var localParaNode = srcSectionNode.children[0];                  // 結合元セクションの先頭段落ノード
			distSectionNode.appendChild(localParaNode);                        // 結合先セクションへ段落ノードを移動
		}
	}

	// ---- 結合元 Section ノードを削除します。なお、インデックスの大きい方から削除しないと矛盾が出ます。
	SectionList.doop(sectionList);                             // SectionList.doop
	for (var i = sectionCount - 1; i >= 1; i--) {              // ---- 対象セクション分ループ
		sectionList.removeSection(indexArr[i]);                        // セクションを削除
	}

	// ---- 深度を調整します。
	// 深度調整リストを作成
	if (diffList === undefined) diffList = IndexEditor.adjustDepth( DocumentManager.getSectionInfoList() );
	if (diffList !== null) IndexEditor.multiShiftRaw(diffList);                  // 深度調整実行

	// ---- レンダラ登録等の最終処理を行います。
	IndexEditor.finishSectionOperate([distSectionIndex], distSectionIndex);      // 終了処理
	ViewManager.getRenderer().setUpdateEditorPane();		// エディタペインの更新を予約します

	return {'diffList' : diffList};
};

// [static] ------ セクション結合の Undo を行います。
IndexEditor.combineSectionUndo = function(indexArr, currentIndex, diffList, sectionArr) {
	// indexArr         [数値配列] : 操作するセクションのインデックス番号を格納した配列 ( 小さい順にソート済み )
	// currentIndex         [数値] : 操作前のカレントセクションのインデックス番号
	// diffList   [連想配列の配列] : 深度調整情報
	// sectionArr [連想配列の配列] : Section ノード と、先頭段落ノードの情報

	// ---- 深度変更を逆処理します。
	if (diffList !== null) IndexEditor.multiShiftRaw(diffList, -1);

	// ---- 旧セクションを連結します。
	var sectionList  = sectionArr[0].node.parentNode;         // SectionList ノード取得
	var sectionCount = sectionArr.length;                     // 操作対象セクションの総数
	for (var i = 1; i < sectionCount; i++) {                  // ---- 結合元セクション数分ループします。
		var referenceSecIndex = indexArr[i];                          // 連結基準点となるセクションのインデックス番号
		var srcSectionNode    = sectionArr[i].node;                   // 旧セクションのインスタンスを取得します。
		sectionList.appendSection(srcSectionNode, referenceSecIndex); // 旧セクションを復活させます。
	}

	// ---- 結合先セクションから、段落ノードをもとの結合元セクションへ移動します。
	var destSectionNode = sectionArr[0].node;                 // 結合先 Section ノード取得
	var indexOfIndexArr = sectionCount - 1;                   // indexArr 用インデックス
	var localSectionArr = sectionArr[indexOfIndexArr];
	var localSrcSection = localSectionArr.node;               // もとの結合元セクションの中で最も番号が大きいもの
	var refNode         = null;
	var paraCount       = destSectionNode.children.length;  // 結合先セクション内の総段落数
	for (var i = paraCount - 1; i >= 0; i--) {                // ---- 結合先セクション内の段落数分ループします。
		localParaNode = destSectionNode.children[i];               // 結合先セクションの最後の段落ノードへの参照
		localSrcSection.insertBefore(localParaNode, refNode);        // 段落を、もとの結合元セクションへ移動
		refNode = localParaNode;                                     // リファレンスノード更新
		if (localParaNode === localSectionArr.topParagraph) { // ---- セクションを切り替えるべき
			indexOfIndexArr -= 1;
			if (indexOfIndexArr <= 0) break;                         // ループ終了
			localSectionArr = sectionArr[indexOfIndexArr];
			localSrcSection = localSectionArr.node;
			refNode         = null;
		}
	}

	// ---- レンダラ登録等の最終処理を行います。
	IndexEditor.finishSectionOperate(indexArr, currentIndex); // 終了処理
	ViewManager.getRenderer().setUpdateEditorPane();		// エディタペインの更新を予約します
};



// ************************************************************************
// **                       セクションタイトル設定                       **
// ************************************************************************

// [static] ------ 前処理を含め、セクションタイトルの設定をを行います。 (combineSectionRaw のラッパです)。
IndexEditor.setSectionTitle = function(index, titleStr) {
	// index      [数値] : セクションインデックス番号
	// titleStr [文字列] : セクションタイトル」文字列

	var secInfoList   = DocumentManager.getSectionInfoList();
	// ---- 範囲チェック
	if (index < 0 || index >= secInfoList.length) return null;
	// ---- 文字列修正
	if (!titleStr) titleStr = '';

	// ---- 対象 Section ノード取得
	var sectionList   = DocumentManager.getDocument(); // セクションリストを取得
	var section       = sectionList.children[index]; // Section ノード取得
	var originalTitle = section.title;                 // 元のセクションタイトル取得

	// ---- セクションタイトルを設定します。
	IndexEditor.setSectionTitleRaw(section, titleStr);

	var result = {};
	result.titleStr      = titleStr;
	result.originalTitle = originalTitle;
	result.section       = section;

	return result;
};

IndexEditor.setSectionTitleRaw = function(section, titleStr) {

	section.title = titleStr;
	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
};



