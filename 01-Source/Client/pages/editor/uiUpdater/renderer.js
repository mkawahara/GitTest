/**
 * 描画部分を更新するレンダラーを作成します。
 * @param document		データ DOM
 * @param editorPane	表示対象HTML ノード
 */
function Renderer(document, editorPane, sectionPaneClass) {
	this.sectionList = document;
	this.editorPane = editorPane;
    this.sectionPaneClass = sectionPaneClass;

	this.resetUpdate();
};

Renderer.prototype.setDocument = function(document) {
    this.sectionList = document;
}

Renderer.SELECTED_COLOR = '#a8cdf1';
//Renderer.SELECTED_COLOR = '#ffff00';

/**
 * 更新情報をリセットします
 */
Renderer.prototype.resetUpdate = function() {
	// 処理前後のカーソル位置情報
	this.cursorPos = { 'pre': null, 'post': null, };

	// 更新が発生した段落リスト
	this.updatedParaList = [];

    // 分割された段落情報
    this.dividedParaList = [];

    // 結合された段落情報
    this.combinedParaList = [];

	// 挿入された段落リスト
	this.insertedParaList = [];

	// 削除された段落IDリスト
	this.removedParaIdList = [];

	// 更新されたノードIDリスト
	this.updatedNodeIdList = [];

    // セクションペインの更新フラグ
    this.sectionListUpdated = false;

    // エディタペインの更新フラグ
    this.sectionUpdated = false;

    // エディタペインのクリアフラグ
    this.editorPaneCleared = false;

    // キャレット位置の更新フラグ
    this.cancelUpdateCaretId = false;

    // 次の update/render 時にエディタペインへのフォーカスを防ぐ
    this.isPreventEditorFocus = false;

    // 直前まで選択されていたノードリスト
    this.oldSelectedNodeList = [];

    // 新しく選択されたノードリスト
    this.selectedNodeList = [];

    // 更新前のセクションのインデックス
    this.preUpdateSectionIndex = -1;
};

/**
 * 指定セクション全体を描画します
 */
Renderer.prototype.render = function(index) {
	// 表示すべきセクションを取得します
	DataClass.bindDataClassMethods(this.sectionList);
	var section = this.sectionList.getSection(index);

	// 表示すべきセクションのHTML出力を取得します
	DataClass.bindDataClassMethods(section);

	// 苦肉の改造
	var caret = ViewManager.getCaret === void 0 ? ViewManager.getEditorPane().getCaret() : ViewManager.getCaret();
	var caretId = caret.pos;
//	var html = section.getHtml();
	var html = section.getHtml(caretId);

	// 出力先ノードにHTML出力を貼り付けます
	this.editorPane.innerHTML = html;

	// html に含まれるものと同じページ上の数式を MathJAX で処理します。
	Renderer.renderAllMath(html);

	// セクション再表示の際は、カーソルをセクション先頭に移動させ、
	// フォーカスを設定します
	var editorPane = ViewManager.getEditorPane();
	if (DocumentManager.getCurrentSection().children.length <= 0) return;
	if (DocumentManager.getCurrentSection().children[0].children.length <= 0) return;
	if (!this.cancelUpdateCaretId) editorPane.getCaret().pos = DocumentManager.getCurrentSection().children[0].children[0].id;
	editorPane.updateCaret(this.isPreventEditorFocus);
	//editorPane.FocusFrontTextBox();
};

/**
 * 予め登録された情報を元に、編集領域の一部の表示のみを更新します。
 * このメソッドはカーソル移動だけでも呼び出されます。
 */
Renderer.prototype.update = function() {
    // セクションペインを更新します
    if (this.sectionListUpdated) {
        this.sectionPaneClass.RedrawSection();
    }

    var editorPaneUpdated = false

    // エディタペインを空にします
    if (this.editorPaneCleared) {
        $(this.editorPane).empty();
        editorPaneUpdated = true;
    }
    // エディタペイン全体を更新します
    else if (this.sectionUpdated ||
            (this.preUpdateSectionIndex >= 0 && this.preUpdateSectionIndex != DocumentManager.getCurrentSectionIndex())) {
        this.render(DocumentManager.getCurrentSectionIndex());
        editorPaneUpdated = true;
    }
    else {
        // カーソル移動による更新の必要性を判定します
        if (this.cursorPos.pre != null) {
            this.updateByCursorMoving();
            editorPaneUpdated = true;
        }

        // 段落操作の表示を更新します
        editorPaneUpdated |= this.updateByParagraph();
    }

    // エディタペインが更新されていれば、画像リサイズ用の矩形の位置を対象の画像に合わせます
    if (editorPaneUpdated) EditorPaneClass.adjustResizingRectPosition()

    // 選択範囲の表示を更新します
    this.updateSelectedRange();

	// 更新情報をリセットします
	this.resetUpdate();
};

/**
 * 更新登録されているかどうかを取得します
 */
Renderer.prototype.updateByParagraph = function() {
    var updated = false;

    // セクションタイトル更新のため、先頭段落が更新対象となっているか取得します
    var isUpdatedTopParagraph = false;
    var topParagraph = DocumentManager.getCurrentSection().children[0];

    // 段落分割の処理
    if (this.dividedParaList.length > 0) {
        if (this.dividedParaList[0].fore.id == topParagraph.id) isUpdatedTopParagraph = true;
    	updated |= this.processForDividedParagraph();
    }

    // 段落結合の処理
    if (this.combinedParaList.length > 0) {
        if (this.combinedParaList[0].combined.id == topParagraph.id) isUpdatedTopParagraph = true;
    	updated |= this.processForCombinedParagraph();
    }

    // 段落挿入
    if (this.insertedParaList.length > 0) {
    	for (var i = 0; i < this.insertedParaList.length; i++) {
    		if (this.insertedParaList[i].inserted.id == topParagraph.id) {
    			isUpdatedTopParagraph = true;
    			break;
    		}
    	}
    	updated |= this.insertParagraph();
    }

    // 段落更新
    if (this.updatedParaList.length > 0) {
        if (this.updatedParaList.indexOf(topParagraph) >= 0) isUpdatedTopParagraph = true;
    	updated |= this.updateParagraph();
    }

    // 段落削除
    if (this.removedParaIdList.length > 0) {
        if (this.removedParaIdList.indexOf(topParagraph.id) >= 0) isUpdatedTopParagraph = true;
    	updated |= this.removeParagraph();
    }

    // 段落の変更があり、セクションタイトルが設定されていないときは、
    // 1行目の内容が変更されている可能性を考慮してインデックスペインの表示を更新します
    if (topParagraph.nextSibling == void 0 || (isUpdatedTopParagraph && DocumentManager.getCurrentSection().title == '')) {
        Renderer.updateSectionTitle(DocumentManager.getCurrentSectionIndex());
    }

    return updated;
}


/////////////////////////////////////////////////////////////////////////
// カーソル移動に伴う更新
/////////////////////////////////////////////////////////////////////////

/**
 * カーソル移動に伴う更新を行います
 */
Renderer.prototype.updateByCursorMoving = function() {
	// ローカル変数にデータを取得します
	var sectionList = $(this.sectionList);
	var preNode = sectionList.find('#' + this.cursorPos.pre)[0];
	var postNode = sectionList.find('#' + this.cursorPos.post)[0];

	// 前のカーソル位置が取得できなかった場合、後のカーソル位置で上書きしてごまかします
	if (preNode == void 0) {
		preNode = postNode;
		this.cursorPos.pre = this.cursorPos.post;
	}

	// ルビ・読み・囲み枠のカーソルに関するスタイルクラスを変更します
	RendererUtil.setBoxCaretClass(preNode, postNode);

	// 移動前後で親が同じであれば更新しません
	if ((preNode) && (preNode.parentNode === postNode.parentNode)) return;


	// 移動元の更新後段落HTMLを取得し、DOM化します
	// 移動先の更新後段落HTMLは取得する必要がありません (別段落なら再描画不要で、同じ段落ならそのまま使用できるため)
	var prePara = Renderer.getRootParagraph(preNode);
	DataClass.bindDataClassMethods(prePara);
//	var newHtml = prePara.toHtml(null, this.cursorPos.post); 5/1 湯本 xmlType 削除
	var newHtml = prePara.toHtml(this.cursorPos.post);
	var newDom = $(newHtml);

	// 更新後データでの移動元Mathノードを取得します
	var preMath = Renderer.getMathNode(newDom, this.cursorPos.pre);
    if (preMath === null && Renderer.isCnChild(preNode)) {
        // 空添え字のときは祖父から検索しないとMathノードを取得できません
        preMath = Renderer.getMathNode(newDom, preNode.parentNode.parentNode.id);
    }
	var preMathId = preMath === null ? null : preMath.id;


	// 移動元の親の親がコーナーエレメントの場合
	// 移動元ノードを再描画します。
	if ((preMath !== null) && (Renderer.isCnChild(preNode))) {
		var oldParaNode = document.getElementById(prePara.id);
		var oldMath = Renderer.getMathNode($(oldParaNode), this.cursorPos.pre);

		oldMath.outerHTML = preMath.outerHTML;
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, preMathId]);
	}
	else {
		// 描画しなかった場合は、IDをクリアします
		preMathId = '';
	}


	// 以下、移動先の再描画処理

	// 移動先が異なる段落の場合、移動先は再描画しません
	if (prePara !== Renderer.getRootParagraph(postNode)) return;

	// 更新後データでの移動先Mathノードを取得します
	var postMath = Renderer.getMathNode(newDom, this.cursorPos.post);
//    if (postMath === null && Renderer.isCnChild(postNode)) {
//        // 空添え字のときは祖父から検索しないとMathノードを取得できません
//        postMath = Renderer.getMathNode(newDom, postNode.parentNode.parentNode.id);
//    }

	// 同じ数式ノードであれば、何もしません
	// (同じだったとしても、表示更新が行われなかった場合は処理を続けます)
	if ((postMath === null) || (preMathId === postMath.id)) return;

	// 別の数式であれば、移動先がコーナーエレメントに属すか調べます
	// 空の場合、移動先ノードを再描画します
	if (Renderer.isCnChild(postNode)) {
		var oldParaNode = document.getElementById(prePara.id);
		var oldMath = Renderer.getMathNode($(oldParaNode), this.cursorPos.post);	// 描画更新前だと、移動先ノードがないよね。。
		if (oldMath === null) {
			oldMath = Renderer.getMathNodeByParent(sectionList, $(oldParaNode), this.cursorPos.post);
		}

		oldMath.outerHTML = postMath.outerHTML;
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, postMath.id]);
	};
};


/**
 * 指定ノードがコーナーエレメントの添え字か判定します
 * @param node
 * @returns {Boolean}
 */
Renderer.isCnChild = function(node) {
    // 再描画の判定基準に使うため、RootElementも対象とします
    return (node.parentNode.parentNode.nodeName === 'CN' || node.parentNode.parentNode.nodeName === 'ROOT');
};

/**
 * 描画用DOM上でノードが属するmathノードを取得します。
 * @param dom
 * @param id
 * @returns
 */
Renderer.getMathNode = function(dom, id) {
    var nodes = dom.find('#' + id);
    if (nodes.length <= 0) return null;

    var node = nodes[0];

    var idTemplate = /m\d+-\d+/;

    while (true) {
    	if ((node.id !== void 0) && (node.id.match(idTemplate) !== null)) break;
//    while (node.nodeName.toUpperCase() !== 'MATH') {
        node = node.parentNode;
        if (node.nodeName === 'DIV') return null;
    };

    return node;
};

/**
 * 描画用DOM上でノードが属するmathノードを取得します。
 * ただし、空の添え字の可能性を考慮し、データDOMにおける祖父要素を取得に使用します。
 * @param dom
 * @param id
 * @returns
 */
Renderer.getMathNodeByParent = function(sectionList, dom, id) {
    var editorPane = $(sectionList).find('#' + id);
    if (editorPane.length <= 0) return null;

    var targetId = editorPane[0].parentNode.parentNode.id;

    var nodes = dom.find('#' + targetId);
    if (nodes.length <= 0) return null;

    var node = nodes[0];

    var idTemplate = /m\d+-\d+/;

    while (node.id.match(idTemplate) === null) {
//    while (node.nodeName.toUpperCase() !== 'MATH') {
        node = node.parentNode;
        if ((node === null) || (node === (void 0))) return null;
    };

    return node;
};


/////////////////////////////////////////////////////////////////////////
// 分割・結合された段落の処理
/////////////////////////////////////////////////////////////////////////

/**
 * 分割された段落情報から、段落の更新と挿入を登録します。
 */
Renderer.prototype.processForDividedParagraph = function() {
    var caretPos = this.getCaretPos();
    var updated = false;

    // ローカル変数を使用します
    var dividedParaList = this.dividedParaList.concat();
    this.dividedParaList = [];

    for (var i=0; i<dividedParaList.length; i++) {
        var docFore = dividedParaList[i].fore;    // 前方の段落
        var docNext = dividedParaList[i].next;    // 後方の段落

        // 前段落 (fore) が空行のとき ⇒ 先頭での分割なので、next の更新操作が不要になります
        if (RendererUtil.isEmptyParagraph(docFore)) {
        	console.log('前の段落が空の時：');
        	//console.log(EDT_MasterLayer.innerHTML);

            // nextのIDと属性をもつ空の表示段落を生成します
            DataClass.bindDataClassMethods(docFore);
            DataClass.bindDataClassMethods(docNext);

            var viewNext = $(docNext.toHtml(caretPos, false))[0];

            // 2017/05/22 既存の前ノードを取得し、その内容を移動させます
            var viewFore = document.getElementById(docFore.id);
            if (viewFore != void 0 || viewFore != null) {
            	// 前の段落のノードを次の段落のノードに全て移動させます
            	while (viewNext.firstChild) viewNext.removeChild(viewNext.firstChild);
            	while (viewFore.firstChild) viewNext.insertBefore(viewFore.firstChild, null);

            	// 元々の前ノードを一度削除します
            	EDT_MasterLayer.removeChild(viewFore);
            }
            else {
            	console.log('段落先頭への改行挿入時、元の表示段落を取得できませんでした。');
            }

            // 2017/05/12 削除した表示段落を置換する表示用ノードを作成します
            var viewNewFore = $(docFore.toHtml(caretPos, false))[0];

            // 挿入基準位置を取得します
            var postPara = (docNext.nextSibling == null) ? null : document.getElementById(docNext.nextSibling.id);

            // ここに至るまでに、データ上では元段落が削除されている
            // 代わりに分割後の段落が挿入されているが、画面とは一致しない

            // nextを挿入します
            //viewFore.parentNode.insertBefore(viewNext, viewFore.nextSibling);	// 2017/05/12 viewFore はとれないので削除
            EDT_MasterLayer.insertBefore(viewNewFore, postPara);	// 2017/05/12 代わりに別途取得した段落を基準に挿入
            EDT_MasterLayer.insertBefore(viewNext, postPara);	    // なお、挿入先セクションは対応要素が画面上にないため、ID をハードコーディングしている

        	//console.log(EDT_MasterLayer.innerHTML);

            // 後の挿入を無効化します
            this.insertedParaList.splice(0,this.insertedParaList.length);

            updated = true;

        }
        else  {
        	console.log('後の段落が空の時：');

            // 後段落 (next) が空行 ⇒ 末尾での分割なので、 fore は更新不要です ★最後の改行のみ修正必要
            if (RendererUtil.isEmptyParagraph(docNext)) {
                var viewFore = document.getElementById(docFore.id);

                // 分割前のforeに改ページがあるときは削除しておきます
                if (viewFore.lastChild.nodeName == 'TABLE') {
                    viewFore.removeChild(viewFore.lastChild);
                }

                // fore最後の改行を置き換えます
                var dataBR = docFore.lastChild;
                DataClass.bindDataClassMethods(dataBR);
                viewFore.replaceChild($(dataBR.toHtml(caretPos))[0], viewFore.lastChild);

                // foreに本来改ページがあるべきときは、追加します
                DataClass.bindDataClassMethods(docFore);
                if (docFore.pageBreak) {
                    viewFore.insertBefore($(Paragraph.createPageBreak(true))[0], null);
                }
            }
            else {
                // fore を更新段落として登録します
                this.setUpdatedParagraph(docFore);
            }

            // next を挿入段落として登録します
            // Mathjax 軽減のために fore を数式検索対象段落として設定します ★docForeを先に更新してしまわないこと！
            this.setInsertedParagraph(docNext, docNext.nextSibling, docFore.id);
        }
    }

    return updated;
};

/**
 * 結合された段落情報から、段落の更新と削除を登録します。
 */
Renderer.prototype.processForCombinedParagraph = function() {

    var combinedParaList = this.combinedParaList.concat();
    this.combinedParaList = [];

    for (var i=0; i<combinedParaList.length; i++) {
        var combined = combinedParaList[i].combined;    // 結合された段落
        var appendedId = combinedParaList[i].appendedId;// 結合により追加された段落のID
        var position = combinedParaList[i].position;    // 結合により追加された先頭ノードID

        // 結合位置が先頭 ⇒ 空行への結合 ⇒ appendedの内容をそのまま表示します
        if (position == combined.firstChild.id) {
            // combinedの子要素を、appended の子要素にそのまま置き換えます
            var viewCombined = document.getElementById(combined.id);
            var viewAppended = document.getElementById(appendedId);
            RendererUtil.removeAllChildren(viewCombined);
            RendererUtil.moveAllChildren(viewCombined, viewAppended);

            // ID以外の属性も置き換えます TODO データ更新も反映させてから
//            RendererUtil.replaceAllAttributeWithoutID(viewCombined, viewAppended);
        }
        // 結合位置が末尾 ⇒ 追加段落が空行 ⇒ 結合段落の更新は不要です ★最後の改行のみ修正必要
        else if (position == combined.lastChild.id) {
            var viewCombined = document.getElementById(combined.id);

            // 結合前の前半段落に改ページがあれば、削除しておきます
            // 段落HTMLの最後がテーブルかどうかで判断します（combinedは削除済みのためデータが残っていないので）
            if (viewCombined.lastChild.nodeName == 'TABLE') {
                viewCombined.removeChild(viewCombined.lastChild);
            }

            // 最後の改行を置き換えます
            var dataBR = combined.lastChild;
            DataClass.bindDataClassMethods(dataBR);
            viewCombined.replaceChild($(dataBR.toHtml())[0], viewCombined.lastChild);
        }
        // 結合位置が文中 ⇒ 結合段落を更新として登録します
        else {
            // TODO appended をMathjax軽減のための数式検索段落としておくとよいかも
            this.setUpdatedParagraph(combined);
        }

        // 追加段落の ID を削除として登録します
        this.setRemovedParagraph(appendedId);
    }

    return false;   // 必ず削除処理が残っているので
};


/////////////////////////////////////////////////////////////////////////
// 段落の挿入と削除
/////////////////////////////////////////////////////////////////////////

/**
 * 挿入予約された段落の表示を更新します。
 */
Renderer.prototype.insertParagraph = function() {
    var caretPos = this.getCaretPos();
    var updated = false;

    var insertedParaList = this.insertedParaList.concat();
    this.insertedParaList = [];

    for (var index=0; index<insertedParaList.length; index++) {
        var dataPara = insertedParaList[index].inserted;
        var nextPara = insertedParaList[index].next;
        var refParaId = insertedParaList[index].refId;

        // 更新対象段落のデータノードを取得し、そこから HTML を作成します
        DataClass.bindDataClassMethods(dataPara);
        var newHtml = dataPara.toHtml(caretPos);

        var unReplacedMaths = [];   // 更新前と一致せずにに置き換えられなかった数式
        var newHtmlDom;             // 挿入すべき新しい HTML の DOM オブジェクト

        // 数式が存在する場合
        if (Renderer.hasMathNodeInNew(newHtml)) {
            // 参照すべき段落が存在するなら、更新前と一致した数式はMathjax処理済みと置き換えます
            if (refParaId) {
                var refViewPara = $(document.getElementById(refParaId));
                result = this.ReplaceMath(newHtml, refViewPara);
                newHtml = result.newHtml;
                unReplacedMaths = result.unReplaced;
                newHtmlDom = $(newHtml)[0];
            }
            else {
                newHtmlDom = $(newHtml)[0];
                unReplacedMaths.push(newHtmlDom);
            }
        }
        else newHtmlDom = $(newHtml)[0];

        // セクションに追加します
        var nextViewPara = (nextPara == null) ? null : document.getElementById(nextPara.id);
        this.editorPane.insertBefore(newHtmlDom, nextViewPara);

        // 数式をMathjax処理します
        for (var i=0; i<unReplacedMaths.length; i++) {
            Renderer.renderAllMath(unReplacedMaths[i].outerHTML);
        }

        updated = true;
    }

    return updated;
};

/**
 * 削除予約された段落の表示を更新します。
 */
Renderer.prototype.removeParagraph = function() {
    var updated = false;

    var removedParaIdList = this.removedParaIdList.concat();
    this.removedParaIdList = [];

    for (var i=0; i<removedParaIdList.length; i++) {
        // 削除対象の段落を取得します
        var paraId = removedParaIdList[i];
        var viewPara = document.getElementById(paraId);

        // 削除を実行します
        this.editorPane.removeChild(viewPara);

        updated = true;
    }

    return updated;
};

/////////////////////////////////////////////////////////////////////////
// 段落の表示更新
/////////////////////////////////////////////////////////////////////////

/**
* 更新予約された段落の表示を更新します。
*/
Renderer.prototype.updateParagraph = function() {
    // ローカル変数を準備します
    var pane = $(this.editorPane);
    var caretPos = this.getCaretPos();
    var updated = false;

    var updatedParaList = this.updatedParaList.concat();
    this.updatedParaList = [];

    for (var pIndex = 0; pIndex < updatedParaList.length; pIndex++) {
        // 更新対象段落のデータノードを取得し、そこから HTML を作成します
        var dataPara = updatedParaList[pIndex];
        DataClass.bindDataClassMethods(dataPara);
        var newHtml = dataPara.toHtml(caretPos);

        var oldPara = document.getElementById(dataPara.id);   // ページ上の更新先段落
        var unReplacedMaths = [];   // 更新前と一致せずにに置き換えられなかった数式

        // 数式が存在する場合は検索します
        if (Renderer.hasMathNodeInNew(newHtml)) {
            // 更新前の段落に数式が存在するとき
            if (Renderer.hasMathNodeInOld(oldPara.innerHTML)) {
                oldPara = $(oldPara); // findよりこちらの方が早い

                // 更新前と一致している数式は置き換えます
                result = this.ReplaceMath(newHtml, oldPara);
                unReplacedMaths = result.unReplaced;
                newHtml = result.newHtml;

                oldPara = oldPara[0];
            }
            // 更新前の段落に数式が存在しないとき
            else {
                // 全て置き換えられなかったものとして初期化します
                unReplacedMaths = Renderer.findMath($(newHtml));

            }
        }

        // 画像がマウスクリックにより選択されている場合は反転した色で表示します
        if (this.selectedNodeList.length == 1 && this.selectedNodeList[0].nodeName == 'CIMG') {
            var imgNode = this.selectedNodeList[0]; // 画像CIOデータノード
            var newPara = $(newHtml);               // 新しい段落をオブジェクト化
            var newHtmlNode = newPara.find('#'+imgNode.id);     // 新しい段落の画像HTMLノード
            var oldHtmlNode = $(oldPara).find('#'+imgNode.id);  // 更新前の段落の画像HTMLノード

            if (newHtmlNode.length == 1 && oldHtmlNode.length == 1 && newHtmlNode[0].src != oldHtmlNode[0].src) {
                // 反転されている色に更新します
                newHtmlNode[0].src = oldHtmlNode[0].src;
                // 新しい段落の文字列を取得します
                newHtml = newPara[0].outerHTML;
                // 範囲選択は更新不要です
                this.selectedNodeList = [];
                this.oldSelectedNodeList = [];
            }
        }

        // 表示を更新します
        oldPara.outerHTML = newHtml;

        // 置き換えできなかった数式をMathjax処理します
        for (var i=0; i<unReplacedMaths.length; i++) {
            Renderer.renderAllMath(unReplacedMaths[i].outerHTML);
        }

        updated = true;
    };

    return updated;
};

/**
 * HTML内に数式（化学式）が存在するか
 */
Renderer.hasMathNodeInOld = function(html) {
    return html.match(/\s+id\s*=\s*"m\d+-\d+/) != null;
};

Renderer.hasMathNodeInNew = function(newHtml) {
    return newHtml.indexOf('<math') >= 0;
}

/**
 * 可能であれば、HTML内の数式部分をMathjax処理済みのものと置き換えます。
 * @param   newHtml
 * @param   oldPara 数式検索の対象となる表示上の段落（jQueryオブジェクト)
 * @return  連想配列 newHtml : 数式を置き換えたHTML、unReplaced：置き換えられなかった数式のリスト
 */
Renderer.prototype.ReplaceMath = function(newHtml, oldPara) {
    var unReplacedMaths = [];
    var newPara = $(newHtml);
    var newMathList = Renderer.findMath(newPara);   // 更新後の数式リスト
    var oldMathList = Renderer.findMath(oldPara);   // 更新前の数式リスト

    // 更新前と一致している数式は置き換えます
    for (var i=0; i<newMathList.length; i++) {
        var newMath = $(newMathList[i]);    // 更新後の数式
        var replaced = false;

        for (var j=0; j<oldMathList.length; j++) {
            var oldMath = $(oldMathList[j]);    // 更新前の数式
            // 更新前後で数式が一致していれば、Mathjax処理済みの更新前数式と置き換えます
            if (this.isSameMath(newMath, oldMath)) {
                newMath[0].outerHTML = oldMath[0].outerHTML;
                replaced = true;
                break;
            }
        }

        if (replaced == false) unReplacedMaths.push(newMath[0]);
    }
    if (unReplacedMaths.length != newMathList.length) newHtml = newPara[0].outerHTML;

    return {unReplaced: unReplacedMaths, newHtml: newHtml};
}

/**
 * HTMLのDOM内にある数式ノードを検索します。
 */
Renderer.findMath = function(dom) {
    return dom.find('span[id^="m"]');   // id が m で始まるノード
};

/**
 * 数式ノードが一致しているかどうかを判定します。
 */
Renderer.prototype.isSameMath = function(math1, math2) {
    var chars1 = math1.find('[id^="C"]');
    var chars2 = math2.find('[id^="C"]');

    // 文字の数を比較します
    if (chars1.length != chars2.length) return false;

    chars1.sort(Renderer.compareMathChar);
    chars2.sort(Renderer.compareMathChar);

    // ID を比較します
    for (var i=0; i<chars1.length; i++) {
        // ID が一致しなければ同じ数式とみなしません
        if (chars1[i].id != chars2[i].id) return false;

        // 更新されたノードとして登録されていれば同じ数式とみなしません
        if ($.inArray(chars1[i].id, this.updatedNodeIdList) >= 0) return false;
    }

    // 全て一致していれば true を返します
    return true;
};

/**
 * 数式の比較方法を定義します。
 */
Renderer.compareMathChar = function(char1, char2) {
    // ID で比較します
    if (char1.id < char2.id) return -1;
    else if (char1.id > char2.id) return 1;
    else return 0;
};


/////////////////////////////////////////////////////////////////////////
// 共通的なヘルパー関数
/////////////////////////////////////////////////////////////////////////

/**
 * キャレット位置を取得します。
 */
Renderer.prototype.getCaretPos = function() {
    if (this.cursorPos.post != null) return this.cursorPos.post;
    // 登録されていなければ、エディタペインから取得します
//    else return ViewManager.getEditorPane().getCaret().pos; // 苦肉の改造
    else {
		var caret = ViewManager.getCaret === void 0 ? ViewManager.getEditorPane().getCaret() : ViewManager.getCaret();
		return caret.pos;
	}
}

/**
 * ノードが属する段落ノードを取得します
 */
Renderer.getRootParagraph = function(node) {
	// 正常に使用される限り問題はないが、異常な使用の場合、例外落ちする可能性あり。
	while (node.nodeName !== 'PARAGRAPH') {
		node = node.parentNode;
	};

	return node;
};

/**
 * 数式（化学式）ノードであるかどうかを判定します。
 */
Renderer.isMath = function(node) {
    return node != null && (node.nt == CIO_XML_TYPE.math || node.nt == CIO_XML_TYPE.chemical);
};

/**
 * 指定した HTML 文字列を基準に、ページ上の数式を更新します。
 * 対象数式は、HTML 文字列に含まれる数式のみです。
 * @param html
 */
Renderer.renderAllMath = function(html) {
	// 数式を全て検出します
	var idTemplate = / id="m\d+-\d+"/g;
	var mathList = html.match(idTemplate);

	if (mathList != null) {
		// 検出された数式を１つずつMathJAXで処理します
		for (var i = 0; i < mathList.length; i++) {
			var idStr = mathList[i].substr(5, mathList[i].length - 6);
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, idStr]);
		};
		MathJax.Hub.Queue(Renderer.postRender);
	}
};

/**
 * 数式のレンダリング後に実行される処理です
 */
Renderer.postRender = function() {
	ViewManager.getEditorPane().updateCaret();
}



/////////////////////////////////////////////////////////////////////
// 選択範囲の更新
/////////////////////////////////////////////////////////////////////

/**
 * 範囲選択の変更に伴い表示を更新します。
 */
Renderer.prototype.updateSelectedRange = function() {

    // 古い選択範囲の表示を戻します
    for (var i = 0; i < this.oldSelectedNodeList.length; i++) {
        var dataNode = this.oldSelectedNodeList[i];

        // 再登録されるノードはスキップします
        if (this.selectedNodeList.indexOf(dataNode) >= 0) continue;

        // 背景を除去します
        RendererUtil.setBackground(dataNode, '');
    }

    // 新しい選択範囲の背景を更新します
    for (var i = 0; i < this.selectedNodeList.length; i++) {
        var dataNode = this.selectedNodeList[i];

        // 登録済みノードはスキップします
        if (this.oldSelectedNodeList.indexOf(dataNode) >= 0) continue;

        RendererUtil.setBackground(dataNode, Renderer.SELECTED_COLOR);
    }

};


/////////////////////////////////////////////////////////////////////
// データ更新の登録
/////////////////////////////////////////////////////////////////////

/**
 * 段落が挿入されたことを登録します
 * @param inserted  追加された段落
 * @param next      追加された段落の次の段落。nullの場合、末尾への挿入を表します。
 * @param refId       数式検索対象とする段落のID
 */
Renderer.prototype.setInsertedParagraph = function(inserted, next, refId) {
    if (DocumentManager.getCurrentSection() != inserted.parentNode) {
        return false;
    }
    this.insertedParaList.push({inserted: inserted, next: next, refId: refId});
    return true;
};

/**
 * 段落全体が更新されたことを登録します
 * @param para	更新された段落
 */
Renderer.prototype.setUpdatedParagraph = function(para) {
    // 既に登録済みの場合は何もしません
    for(var i=0; i<this.updatedParaList.length; i++) {
        if (para.id == this.updatedParaList[i].id) return
    }
    this.updatedParaList.push(para);
};

/**
 * 段落が削除されたことを登録します
 * @param paraId	削除された段落のID
 */
Renderer.prototype.setRemovedParagraph = function(paraId) {
    this.removedParaIdList.push(paraId);
};

/**
 * 段落が分割されたことを登録します。
 * @param fore	分割された段落の前側の段落 (分割前の段落とIDが一致します)
 * @param next	分割された段落の後側の段落
 */
Renderer.prototype.setDividedParagraph = function(fore, next) {
    this.dividedParaList.push({ fore: fore, next: next });
};

/**
 * 段落が結合されたことを登録します。
 * @param combined      結合された段落 (結合前の段落とIDが一致します)
 * @param appended      結合によって追加された段落のID（更新処理にてIDの一致する段落は削除されます）
 * @param position      結合によって追加された先頭ノードのID
 */
Renderer.prototype.setCombinedParagraph = function(combined, appendedId, position) {
    this.combinedParaList.push({ combined: combined, appendedId: appendedId, position: position });
};

/**
 * ノードが挿入されたことを登録します。表示更新は段落単位になります。
 * @param node  挿入されたデータノード
 */
Renderer.prototype.setInsertedNode = function(node) {
    // 段落の更新を登録します。
    this.setUpdatedParagraph(Renderer.getRootParagraph(node));
};

/**
 * ノードが更新されたことを登録します。
 * @param node  更新されたデータノード
 */
Renderer.prototype.setUpdatedNode = function(node) {
    // IDを保存します
    if ($.inArray(node.id, this.updatedNodeIdList) == -1) this.updatedNodeIdList.push(node.id);

    // 段落の更新を登録します。
    this.setUpdatedParagraph(Renderer.getRootParagraph(node));
};

/**
 * ノードが削除されたことを登録します。
 * @param node      削除されたデータノード（現在使用していないが、念のため）
 * @param parent    削除ノードの親
 */
Renderer.prototype.setRemovedNode = function(node, parent) {
    // 段落の更新を登録します。
    this.setUpdatedParagraph(Renderer.getRootParagraph(parent));
};

/**
 * カーソル移動情報を登録します。
 * データの編集に伴いカーソル位置が変更された場合は、
 * 第一引数は null とし、第二引数に処理後のカーソル位置を指定します
 * @param fore	移動前のカーソル位置を指定します。
 * @param next	移動後のカーソル位置を指定します。
 */
Renderer.prototype.setCaretPos = function(fore, next) {
	if ((fore === '') || (fore === (void 0))) fore = null;
	if ((next === '') || (next === (void 0))) next = null;
	if (next == null) return;
	this.cursorPos = { pre: fore, post: next, };
};

/**
 * セクションペインの更新を予約します。
 */
Renderer.prototype.setUpdateSectionPane = function() {
    this.sectionListUpdated = true;
};


/**
 * エディタペイン全体の更新を予約します。
 */
Renderer.prototype.setUpdateEditorPane = function() {
    this.sectionUpdated = true;
}

/**
 * エディタペインのクリアを予約します。
 */
Renderer.prototype.preserveEditorPaneClear = function() {
    this.editorPaneCleared = true;
};

/**
 * キャレットの自動更新をキャンセルします
 * キーによるカーソル移動でセクションが切り替わった時のための処理です
 */
Renderer.prototype.cancelCaretAutoUpdate = function() {
	this.cancelUpdateCaretId = true;
};

/**
 * 直前まで選択されていたノードリストを登録します。
 */
Renderer.prototype.setOldSelectedRange = function(nodeList) {
	this.oldSelectedNodeList = this.oldSelectedNodeList.concat(nodeList);
};

/**
 * 新しく選択されたノードリストを登録します。
 */
Renderer.prototype.setSelectedRange = function(nodeList) {
    this.selectedNodeList = nodeList.concat();
};

/**
 * 次の update/render 時にフォーカスがエディタペインに移動するのを防ぎます。
 */
Renderer.prototype.preventEditorFocus = function() {
	this.isPreventEditorFocus = true;
}

/**
 * 更新の登録と実際の表示更新の間にセクションが切り替わっている場合を考慮して
 * 更新前のセクション インデックスを登録します。
 */
Renderer.prototype.setPreUpdateSectionIndex = function() {
    this.preUpdateSectionIndex = DocumentManager.getCurrentSectionIndex();
}


/////////////////////////////////////////////////////////////////////////////
// 文書表示に使用されるスタイルクラスの更新
/////////////////////////////////////////////////////////////////////////////

/**
 * 文書プロパティに基づき、スタイルクラスを更新します
 */
Renderer.updateStyleClass = function() {
	// 文書プロパティオブジェクトを取得します
	var docProp = DocumentManager.getCurrentDocumentProperty();
	if (docProp === null) return;	// 取得できなければ、関数は終了します

	// フォントサイズをフォント名を取得します
	var baseFontSize = docProp.fontSize;
	var fontFamily = docProp.font;

	// 設定対象のスタイルクラスを取得します
	var font1 = Renderer.getStyleClass('font-x-small');
	var font2 = Renderer.getStyleClass('font-small');
	var font3 = Renderer.getStyleClass('font-medium');
	var font4 = Renderer.getStyleClass('font-large');
	var font5 = Renderer.getStyleClass('font-x-large');
	var fontfamily = Renderer.getStyleClass('editpaneStyle');

	baseFontSize = Number(baseFontSize.substr(0, baseFontSize.length - 2));

	// フォントサイズ一式を決定します
	var size1 = baseFontSize - 4;
	var size2 = baseFontSize - 2;
	var size3 = baseFontSize;
	var size4 = baseFontSize + 2;
	var size5 = baseFontSize + 4;

	// スタイルを更新します
	font1.style['font-size'] = size1 + 'pt';
	font2.style['font-size'] = size2 + 'pt';
	font3.style['font-size'] = size3 + 'pt';
	font4.style['font-size'] = size4 + 'pt';
	font5.style['font-size'] = size5 + 'pt';
	fontfamily.style['font-family'] = fontFamily;
};

/**
 * エディタ設定に基づき、エディタの配色を更新します
 */
Renderer.updateEditorColor = function() {
	// テキスト中のスペースの配色
	var textSpaceRule = Renderer.getStyleClass('space');
	if (textSpaceRule !== null) {
		if (ConfigManager.instance.IsShowTextSpace) {
			textSpaceRule.style['color'] = ConfigManager.instance.ControlColor;
			textSpaceRule.style['opacity'] = '';
		} else {
			textSpaceRule.style['opacity'] = '0.0';
		}
	}

	// 数式中のスペースの配色
	var mathSpaceRule = Renderer.getStyleClass('mathspace');
	if (mathSpaceRule !== null) {
		if (ConfigManager.instance.IsShowMathSpace) {
			mathSpaceRule.style['color'] = ConfigManager.instance.MathControlColor;
			mathSpaceRule.style['opacity'] = '';
		} else {
			mathSpaceRule.style['opacity'] = '0.0';
		}
	}

	// テキストと背景の配色
	var textColorRule = Renderer.getStyleClass('editpaneStyle');
	if (textColorRule !== null) {
		textColorRule.style['color'] = ConfigManager.instance.TextColor;
		textColorRule.style['background-color'] = ConfigManager.instance.BackgroundColor;
	}

	// 数式の配色
	var mathColorRule = Renderer.getStyleClass('mathcolor');
	if (mathColorRule !== null) mathColorRule.style['color'] = ConfigManager.instance.MathColor;

	// 化学式の配色
	var chemColorRule = Renderer.getStyleClass('chemcolor');
	if (chemColorRule !== null) chemColorRule.style['color'] = ConfigManager.instance.ChemColor;

	// ルビの配色
	var rubyColorRule = Renderer.getStyleClass('rubycolor');
	if (rubyColorRule !== null) rubyColorRule.style['color'] = ConfigManager.instance.RubyColor;

	// ハイライト前景色
	var hlColorRule   = Renderer.getStyleClass('highlightColor');
	if (hlColorRule !== null) hlColorRule.style['color'] = ConfigManager.instance.HighlightForeColor;

	// ハイライト背景色
	var hlBgColorRule = Renderer.getStyleClass('highlightBgColor');
	if (hlBgColorRule !== null) hlBgColorRule.style['color'] = ConfigManager.instance.HighlightBgColor;

	// 選択範囲の配色
	Renderer.SELECTED_COLOR = ConfigManager.instance.Selection;
};

Renderer.getStyleClass = function(className) {
	var css_list = document.styleSheets;

	// スタイルシートリストの順次確認
	for (var cssListIdx = 0; cssListIdx < css_list.length; cssListIdx++) {
		// 無関係なスタイルリストはスキップします
		if (css_list[cssListIdx].title !== 'rewritableStyleClass') continue;

		// リスト内のルールを順次確認し、目的のスタイルを取得します
		var ruleList = css_list[cssListIdx].cssRules;
		for (var cssIdx = 0; cssIdx < ruleList.length; cssIdx++) {
			var pattern = new RegExp(className.replace(".", "\\.") + ",?");
			if(ruleList[cssIdx].selectorText.search(pattern) > 0) return ruleList[cssIdx];
		};
	};

	return null;
};

/**
 * セクションタイトルの表示を更新します。
 */
Renderer.updateSectionTitle = function(index){
    var sectionPane    = ViewManager.getIndexPane();
    if (sectionPane == null) return;
    var titleStr = sectionPane.getSectionTitleInput();

    // タイトルが入力されていなければ、1行目から取得します
    if (titleStr == '') {
        titleStr = IndexToolClass.getSectionTitleAuto(index);
    }
    // 1行目も存在しなければデフォルト
    if (titleStr == '') {
        titleStr = '< セクション ' + (index + 1) + '>';
    }

    // データには反映させず、表示のみ更新します
    // インデックスを表示しているHTML要素を取得します
    var indexNode = document.getElementById("IDT_SEC_"+index);
    if (indexNode == null) return;
    // セクションタイトルは最後の子要素である想定
    var titleNode = indexNode.children[indexNode.children.length-1];
    if (titleNode == null) return;
    titleNode.innerHTML = '<span>' + titleStr + '</span>';

}
