function KeyEventHandler(){};

KeyEventHandler.init = function() {
	// IE の場合、span タグで input イベントが発生しないため、
	// タイマーイベントを使用します。
	var nav = window.navigator.userAgent;
	if (nav.indexOf('Trident') >= 0) {
		window.setTimeout(KeyEventHandler.onTimer, 3000);
	}
};

/**
 * IE で Input イベントの代わりに使用されるタイマーイベント
 */
KeyEventHandler.onTimer = function() {
	var event = {
			target: EDT_FrontTextBox,
			preventDefault: function() {},
			stopPropagation: function() {},
			shiftKey: KeyEventHandler.shiftKey,
			altKey: KeyEventHandler.altKey,
			ctrlKey: KeyEventHandler.ctrlKey,
	};

	window.setTimeout(KeyEventHandler.onTimer, 20);
	KeyEventHandler.onInput(event);
};

//各修飾キーの状態を保持するフラグ
KeyEventHandler.shiftKey = false;
KeyEventHandler.altKey = false;
KeyEventHandler.ctrlKey = false;

//日本語入力中であることを表すフラグ
KeyEventHandler.imeFlag = false;

//次の input イベントで日本語入力を確定することを表すフラグ
KeyEventHandler.inputFlag = false;

// 最後に押されたキーのコード
// 半角スペースやタブなどを入力する際に使用します
KeyEventHandler.lastKeyCode = null;

// KeyUp 時に、カーソル位置のフォント状態を取得するか否かを決定するフラグ
// KeyDown 時に設定されます。
KeyEventHandler.cancelGetFontStatus = false;

// 「^」「_」による1文字添え字のショートカットが実行されていることを表すフラグ
KeyEventHandler.cornerShortcut = false;
KeyEventHandler.clearCornerShortcut = function() {
    KeyEventHandler.cornerShortcut = false;
}

// ショートカットにより入力を無視すべき文字列
KeyEventHandler.ignoreInput = null;

/**********************************************************************
 * KeyPress イベント
 **********************************************************************/

KeyEventHandler.onKeyPress = function(event) {
	// IE対応。日本語入力中はこのイベントは何もしません
	if (KeyEventHandler.imeFlag) return;

	// ★編集禁止時は、このメソッドは一部ショートカット以外何もしないこと★
	var editable = DocumentManager.isEditable();
	if (editable !== true) {
		if (!KeyEventHandler.isAudioControlable(event, editable)) {
			event.preventDefault();
			event.stopPropagation();
			console.log('以降のイベントキャンセルしました。');
			return;
		}
	}

	// ChattyInfty Online のショートカットにヒットしない場合、何もしません。
	var execStr = KeyEventHandler.findShortcut(event, KeyEventHandler.shortCuts);
	if ((execStr === null) && !KeyEventHandler.isIgnoreAtPress(event)) {
		return;
	}

	// ChattYInfty Online のショートカットにヒットする場合、
	// ブラウザのショートカットをキャンセルします。
	event.preventDefault();
	event.stopPropagation();
	console.log('以降のイベントキャンセルしました。');
};

KeyEventHandler.isAudioControlable = function(event, editable) {
	if ((33 <= event.keyCode) && (event.keyCode <= 40) && !event.altKey) return true;
	if ((editable === -1 ) && (event.keyCode ===82 || event.key === 'r') && event.altKey) return true;
	return false;
};


/*********************************************************************
 * KeyDown イベント
 *********************************************************************/

KeyEventHandler.onKeyDown = function(event) {
	//var myDate = new Date();
	//console.log('onKeyDown が発生しました。' + myDate.getTime());
	//console.log('onKeyDownが発生しました。' + event.key + myDate.getTime());

	// IE対応。日本語入力中はこのイベントは何もしません
	if (KeyEventHandler.imeFlag) return;

	// ★編集禁止時は、このメソッドは一部ショートカット以外何もしないこと★
	var editable = DocumentManager.isEditable();
	if (editable !== true) {
		if (!KeyEventHandler.isAudioControlable(event, editable)) {
	    	// Ctrl + S, Y, Z を処理します (Alt, Shift の状態は無視しています)
	    	if (event.ctrlKey && ((event.keyCode === 83) || (event.keyCode === 89) || (event.keyCode === 90)))
	    	{
	    		showMessageDialog('読み上げモードの時、指定されたショートカットは実行できません。', '操作エラー');
	    	}
			event.preventDefault();
			event.stopPropagation();
			return;
		}
	}

	// IE入力のため、装飾キーを保存します
	KeyEventHandler.shiftKey = event.shiftKey;;
	KeyEventHandler.altKey = event.altKey;;
	KeyEventHandler.ctrlKey = event.ctrlKey;;

	// 特殊文字入力のため、キーコードを保存します
	KeyEventHandler.lastKeyCode = event.keyCode;

	// 日本語入力中は、IME に処理を任せるため、何もしません。
	if (KeyEventHandler.inputFlag) return;

	// ショートカットを検索し、対応する処理文字列を取得します
	var execStr = KeyEventHandler.findShortcut(event, KeyEventHandler.shortCuts);

	// 対応するショートカットが取得された場合、
	// ショートカットを実行し、デフォルトの処理を含む以降の処理をキャンセルします
	if (execStr !== null) {
        event.preventDefault();
        event.stopPropagation();
		eval(execStr.func); // 機能実行

		// キーが TAB かつテーブルセル内の場合、return しません
		var editorPane	= ViewManager.getEditorPane();           // エディタペーンへの参照を取得します。
		var caret		= editorPane.getCaret();                 // キャレットへの参照を取得します。

		var cellNode = KeyEventHandler.getCellNode(caret.pos);
		if ((cellNode == null) || !KeyEventHandler.isTabEvent(event)) return;
	}

	// 選択範囲の有無を記録します
	var existSelection = EditManager.instance.SelectedRangeManager.hasSelectedRange;

	// ショートカット以外の操作を処理します
	// 基本的な文字入力以外の処理の場合、デフォルトの処理をキャンセルします
	if (KeyEventHandler.execOtherCommand(event)) {
		event.preventDefault();
		event.stopPropagation();

		// 保持されていた選択範囲がなくなっていれば、フォーカスをタイトル入力部品に一瞬だけ移動させます
		// これは、IE で範囲選択時にカーソルが消える問題への対応です
		if (existSelection && !EditManager.instance.SelectedRangeManager.hasSelectedRange) {
			ST_SectionTitleBar.focus();
			EDT_FrontTextBox.focus();
		}

		//var myDate = new Date();
		//console.log('onKeyDown が終了しました。' + myDate.getTime());
		return;
	}
};

/*********************************************************************
 * イベントに付随するキー情報から、
 * ショートカットにより実行される命令文字列を有するショートカットデータを取得します。
 * ショートカットがなければ、null を返します。
 */
KeyEventHandler.findShortcut = function(event, shortcutList) {
	var keyCode = event.keyCode;
	var key     = event.key;

	// IE, Chrome 対応
	if ((event.keyCode === event.charCode) && !event.altKey && !event.ctrlKey && !event.shiftKey) keyCode -= 32;

	// デバッグ用コード
	// if (shortcutList === void 0) console.log('');

	for (var scidx = 0; scidx < shortcutList.length; scidx++) {  // ---- ショートカットの数分ループ
		var shortCutData = shortcutList[scidx];      // 該当ショートカット

		// ---- 修飾キーのチェック
		var altCond   = (shortCutData.isAlt   == event.altKey  ); // Alt   キーの判定
		var ctrlCond  = (shortCutData.isCtrl  == event.ctrlKey ); // Ctrl  キーの判定
		var shiftCond = (shortCutData.isShift == event.shiftKey); // Shift キーの判定

		// MacでのショートカットはCtrlでなくCommandキーを使用します
		if (KeyEventHandler.isMac()) {
		    ctrlCond = (shortCutData.isCtrl  == event.metaKey);
		}

		// 修飾キーが１つでも一致しなければ、次のショートカットの確認に移ります
		var modCondition = altCond && ctrlCond && shiftCond;
		if (!modCondition) continue;

		// ---- キーのチェック
		var localKeys = (shortCutData.key !== void 0) ? shortCutData.key : [];	// ショートカットキーを取得します
		var keyCondition = (localKeys.indexOf(key) >= 0);

		// キーコードのチェック（キーの判断結果とも統合します）
		// ただし、Macの場合、Delete(46) は Backspace(8) とします
		var shortCutKeyCode = shortCutData.keyCode;
		if (KeyEventHandler.isMac() && shortCutKeyCode == 46) {
		    shortCutKeyCode = 8;
		}
		keyCondition = keyCondition || (shortCutKeyCode == keyCode);

        // 実行条件が存在すれば考慮します
        if (shortCutData.condition) keyCondition &= eval(shortCutData.condition);

		// メインキーが一致していれば、命令を記述した文字列を返します
		if (keyCondition) return shortCutData;
	}

	// 対応するショートカットが見つからなければ、null を返します
	return null;
};

/*********************************************************************
 * KeyDown イベントにおける日本語入力、ショートカット以外の処理
 * 主に矢印キーを処理します。
 * @param event
 */
KeyEventHandler.execOtherCommand = function(event) {
	var section              = DocumentManager.getCurrentSection();
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ
	var editorPane           = ViewManager.getEditorPane();           // エディタペーンへの参照を取得します。
	var caret                = editorPane.getCaret();                 // キャレットへの参照を取得します。

	var returnValue = false;	// 戻り値。文字入力以外では true にならなくてはならない

	// 元々のカーソル位置を取得します。
	var forePos = caret.pos;

	// ---- 修飾キーの判定
	if (event.keyCode === 16) {
		// Shift キーが押された場合、範囲選択の準備処理を行います
		KeyEventHandler.doShiftDown(selectedRangeManager, caret);
		return true;
	}

	// カーソル位置から直近のテーブルセルを取得します
	var cellNode = KeyEventHandler.getCellNode(forePos);

	var nextNodeId = null;

	// ---- 移動・範囲選択以外を処理します。
	nextNodeId = null;

	// Enter キーを処理します。条件を満たしていれば、段落分割を行います
	if (event.keyCode === 13) 		nextNodeId = UiCommandWrapper.enter(caret);
	// BackSpace キーを処理します。
	else if (event.keyCode ===  8) nextNodeId = KeyEventHandler.doBackspace(caret);
	// Delete キーを処理します
	else if (event.keyCode === 46)	nextNodeId = KeyEventHandler.doDelete(caret);
	// PageUp キーを処理します
    else if (event.keyCode === 33) nextNodeId = KeyEventHandler.doPageUp(caret);
	// PageDown キーを処理します
    else if (event.keyCode === 34) nextNodeId = KeyEventHandler.doPageDown(caret);
	// テーブル・マトリクスセル中での TAB キーを処理します
	else if ((cellNode != null) && (KeyEventHandler.isTabEvent(event)))	nextNodeId = KeyEventHandler.doTabInCell(event, cellNode);
	// キー操作による移動と範囲選択を判定します。
	else {
		nextNodeId = KeyEventHandler.selectRangeByKey(event.keyCode, event.key, caret, event.shiftKey, event.ctrlKey);
		if (nextNodeId === void 0) nextNodeId = null;

		// 検索状態を初期化します
		SearchManager.instance.IsSearched = false;
	}

	// カーソル位置を表すノードID が変更される場合の処理です
	if (nextNodeId !== null) {
		// カーソル位置IDを更新します
	    caret.pos = nextNodeId;

		// KeyUp イベントで、カーソル位置のフォント情報の取得を指示します
		KeyEventHandler.cancelGetFontStatus = false;

		// エディタペインを更新します
		ViewManager.getRenderer().update();

		// カーソルの表示位置を更新します
		editorPane.updateCaret();
		if (!editorPane.scrollManager) return true;
		editorPane.scrollManager.SetFocusNode(nextNodeId);
		editorPane.scrollManager.ScrollToFocusNode();

	    if (!event.virtual) KeyEventHandler.cornerShortcut = false;

	    // 以降のデフォルトのイベント処理を停止させるため、true を返します
		return true;
	}
	// カーソルの位置を表すノードID が変更されない場合の処理です
	else {
		// KeyUp イベントで、カーソル位置のフォント情報の取得抑制を指示します
		KeyEventHandler.cancelGetFontStatus = true;

		// 通常の文字入力の場合、以降のデフォルトの処理を継続するため、false を返します
		return false;
	};
};

/**
 * BackSpace キーによる削除を実行します
 */
KeyEventHandler.doBackspace = function(caret) {
	var result;

	var nodeList = EditManager.getSelectedRangeManager().getSelectedRange(); // 選択範囲取得
	if (nodeList) {
		// 選択範囲が特定の読み・ルビ要素の中身全てであれば、読み・ルビ要素そのものを選択対象に更新します
		KeyEventHandler.checkAndUpdateSelectedRange(nodeList);
		// 選択範囲を削除します
		result = UiCommandWrapper.removeMultiNode(caret);
	} else {
		// 削除対象が読み・ルビ要素の最後の文字であれば、読み・ルビ要素が削除されるようにキャレット位置を更新します
		var posNode = DocumentManager.getNodeById(caret.pos);
		var parentName = posNode.parentNode.parentNode.nodeName.toLowerCase();
		var checkFlag = ((posNode.nodeName.toLowerCase() == 'br') && (posNode.parentNode.children.length == 2) && ((parentName == 'cread') || (parentName == 'cruby')));
		if (checkFlag) caret.pos = posNode.parentNode.parentNode.nextSibling.id;

		// キャレット位置の手前の要素を削除します
		result = UiCommandWrapper.deleteOperation(true, caret);		// true 指定時は前を削除します
	}

	return result;
};

/**
 * Delete による削除を実行します。範囲選択の有無は内部で判断されます。
 */
KeyEventHandler.doDelete = function(caret) {
	var needUpdateView = false;
	if (caret === void 0) {
		caret = ViewManager.getEditorPane().getCaret();
		needUpdateView = true;
	}

	var result;
	var nodeList = EditManager.getSelectedRangeManager().getSelectedRange(); // 選択範囲取得
	if (nodeList) {
		// 選択範囲が特定の読み・ルビ要素の中身全てであれば、読み・ルビ要素そのものを選択対象に更新します
		KeyEventHandler.checkAndUpdateSelectedRange(nodeList);
		// 選択範囲を削除します
		result = UiCommandWrapper.removeMultiNode(caret);
	} else {
		// 削除対象が読み・ルビ要素の最後の文字であれば、読み・ルビ要素が削除されるようにキャレット位置を更新します
		var posNode = DocumentManager.getNodeById(caret.pos);
		var parentName = posNode.parentNode.parentNode.nodeName.toLowerCase();
		var checkFlag = ((posNode.previousSibling == null) && (posNode.parentNode.children.length == 2) && ((parentName == 'cread') || (parentName == 'cruby')));
		if (checkFlag) caret.pos = posNode.parentNode.parentNode.id;

		// キャレット位置の要素を削除します（見かけ上はキャレットの後の要素）
		result = UiCommandWrapper.deleteOperation(false, caret);	// false 指定時は後ろを削除します
	}

	if (needUpdateView) {
		ViewManager.getRenderer().update();
	    caret.pos = result;
	    ViewManager.getEditorPane().updateCaret();
	};

	return result;
};

/**
 * 選択範囲として渡された要素のリストが、読みあるいはルビ要素の中身全てだった場合、
 * SelectedRangeManager が保持している選択範囲を、その読みあるいはルビ要素に変更します
 */
KeyEventHandler.checkAndUpdateSelectedRange = function(nodeList) {
	// リストの最初と最後のデータが同じグループ要素に属し、
	// そのグループ要素の親が読みあるいはルビ要素であり、
	// リストの最初と最後がグループの先頭と改行以外の最後であるか取得します
	var checkFlag = (nodeList[0].parentNode === nodeList[nodeList.length - 1].parentNode) &&
		(nodeList[0].parentNode.parentNode.nodeName.toLowerCase() == 'cruby' || nodeList[0].parentNode.parentNode.nodeName.toLowerCase() == 'cread') &&
		(nodeList[0].previousSibling == null) && (nodeList[nodeList.length - 1].nextSibling.nodeName.toLowerCase() == 'br');
	if (checkFlag) {
		// 読み・ルビ要素の中身全てを選択していた場合、選択範囲を修正します
		EditManager.getSelectedRangeManager().startSelect(nodeList[0].parentNode.parentNode);
		EditManager.getSelectedRangeManager().updateSelectedRange(nodeList[0].parentNode.parentNode.nextSibling);
	}
}

/**
 * PageUp によるカーソル移動を実行します
 */
KeyEventHandler.doPageUp = function(caret) {
    // ペインの高さを取得します
    var pane = document.getElementById('EDT_MasterLayer');
    if (!pane) return caret.pos;
    var pageRect = pane.getBoundingClientRect();

    // 段落のリストを取得します
    var section = DocumentManager.getCurrentSection();
    var pList = $(section).find('paragraph');

    // ペインの高さを超えない最も上の位置の段落インデックスを
    // 移動先段落として取得します
    var upIndex = KeyEventHandler.getUpIndex(pList, pList.length-1, pageRect);

    // 取得に失敗したら、移動しません
    if (upIndex < 0) return caret.pos

    // 現在のカーソル位置と異なる場合はそのまま採用します
    var caretNode = $(section).find('#' + caret.pos)[0];
    var caretPara = DataClass.getRootParagraph(caretNode);
    if (pList[upIndex].id !== caretPara.id) {
        caret.pos = pList[upIndex].children[0].id;
        return caret.pos;
    }

    // カーソル位置がすでにページの上端にあるときは、もう1ページ進みます
    var startIndex = upIndex == pList.length - 1 ? upIndex : upIndex - 1;
    upIndex = KeyEventHandler.getUpIndex(pList, startIndex, pageRect);
    caret.pos = pList[upIndex].children[0].id;
    return caret.pos;

};

/**
 * 1ページ分上の段落のインデックスを取得します
 */
KeyEventHandler.getUpIndex = function(pList, startIndex, pageRect) {
    var upIndex = -1;
    var height = 0;

    for (var i=startIndex; i>=0; i--) {
        var div = document.getElementById(pList[i].id);
        var rect = div.getBoundingClientRect();
        if (rect.top >= pageRect.bottom) continue;
        height += rect.height;
        // 1ページの高さを超えたら決定されます
        if (height > pageRect.height) {
            upIndex = i;
            break;
        }
        // 先頭行に来たらそれを採用します
        if (i == 0) upIndex = i;
    }
    return upIndex;
};

/**
 * PageDown によるカーソル移動を実行します。
 */
KeyEventHandler.doPageDown = function(caret) {
    // ペインの高さを取得します
    var pane = document.getElementById('EDT_MasterLayer');
    if (!pane) return caret.pos;
    var pageRect = pane.getBoundingClientRect();

    // 段落のリストを取得します
    var section = DocumentManager.getCurrentSection();
    var pList = $(section).find('paragraph');

    // ペインの高さを超えない最も下の位置の段落インデックスを
    // 移動先段落として取得します
    var downIndex = KeyEventHandler.getDownIndex(pList, 0, pageRect);

    // 取得に失敗したら、移動しません
    if (downIndex < 0) return caret.pos

    // 現在のカーソル位置と異なる場合はそのまま採用します
    var caretNode = $(section).find('#' + caret.pos)[0];
    var caretPara = DataClass.getRootParagraph(caretNode);
    if (pList[downIndex].id !== caretPara.id) {
        caret.pos = pList[downIndex].children[0].id;
        return caret.pos;
    }

    // カーソル位置がすでにページの下端にあるときは、もう1ページ進みます
    var startIndex = downIndex == 0 ? downIndex : downIndex + 1
    downIndex = KeyEventHandler.getDownIndex(pList, startIndex, pageRect);
    caret.pos = pList[downIndex].children[0].id;
    return caret.pos;

};

/**
 * 1ページ分下の段落のインデックスを取得します
 */
KeyEventHandler.getDownIndex = function(pList, startIndex, pageRect) {
    var downIndex = -1;
    var height = 0;

    for (var i=startIndex; i<pList.length; i++) {
        var div = document.getElementById(pList[i].id);
        var rect = div.getBoundingClientRect();
        if (rect.top < pageRect.top) continue;
        height += rect.height;
        // 1ページの高さを超えたら決定されます
        if (height > pageRect.height) {
            downIndex = i;
            if (downIndex > 0) downIndex -= 1;
            break;
        }
        // 最終行にきたらそれを採用します
        if (i == pList.length - 1) downIndex = i;
    }
    return downIndex;
};

/**
 * テーブル、マトリクスのセル中での TAB キーによるカーソル移動を処理します
 * @param event
 * @param cellNode
 */
KeyEventHandler.doTabInCell = function(event, cellNode) {
	// Shift キー付きの場合、前のセルへ移動します
	// ※Firefox では、Shift+Tab のブラウザショートカットが停止できません (2016/03/09)
	if (event.shiftKey) {
		if ((cellNode.previousSibling !== null) &&
			((cellNode.previousSibling.nodeName === 'CTD') || (cellNode.previousSibling.nodeName === 'CMATCELL'))) {
			// 前のセルがある場合、兄ノードに移動します
			return cellNode.previousSibling.children[0].id;
		} else {
			// 前のセルがない場合、親テーブルのベースに移動します
			return cellNode.parentNode.id;
		}
	}
	// Shift キーを伴わない場合、次へ移動します
	else {
		if (cellNode.nextSibling !== null) {
			// 次のセルがある場合、弟ノードに移動します
			return cellNode.nextSibling.children[0].id;
		} else {
			// 次のセルがない場合、親テーブルの次ノードに移動します
			return cellNode.parentNode.nextSibling.id;
		}
	}
};


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
// ★2015/11/08 修正

KeyEventHandler.isTabEvent = function(event) {
	// 修飾キーがついている場合、対象外です
	if (event.ctrlKey || event.altKey) return false;
	// キーが Tab か否かを返します
	return (event.keyCode === 9) || (event.key == 'Tab');
};

KeyEventHandler.getCellNode = function(nodeId) {
	var jdocument = $(DocumentManager.getDocument());
	var currentNode = jdocument.find('#' + nodeId);
	if (currentNode.length <= 0) return null;
	currentNode = currentNode[0];

	var node = currentNode;
	while (node != null) {
		if (node.nodeName.toLowerCase() === 'ctd') return node;
		if (node.nodeName.toLowerCase() === 'cmatcell') return node;
		node = node.parentNode;
	}

	return null;
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * Shift キーを押した時の処理です。
 * 範囲選択の準備処理を行います。
 */
KeyEventHandler.doShiftDown = function(selectedRangeManager, caret) {
	if (!selectedRangeManager.isSelecting) {
		selectedRangeManager.isSelecting = true;

		// 範囲選択状態が残っているなら、既存範囲の開始点を流用する
		if (!selectedRangeManager.hasSelectedRange) {
			console.log('範囲選択がないので、範囲開始位置を新たに登録します。');
			// ---- 現在のキャレット位置のノードを開始地点として登録する
			selectedRangeManager.clearSelectedRange(); // 範囲選択を解除
			// ---- 範囲選択：範囲開始ノードを記録
			selectedRangeManager.startSelect( DocumentManager.getNodeById(caret.pos) );
		}
	}
}

// ---- キー操作による範囲選択処理
KeyEventHandler.selectRangeByKey = function(keyCode, eventKey, caret, shiftKey, ctrlKey) {
	// カーソル移動時、見えなくなるカーソルの代わりに入力部品の枠を表示します
	if (!shiftKey && (37 <= keyCode) && (keyCode <= 40)) EditorPaneClass.setCaretBorder(true);

	var section              = DocumentManager.getCurrentSection();   // 現在のセクション
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ
	var forePos              = caret.pos;                             // 移動前のキャレット ID
	var nextId               = undefined;                             // キャレット移動先ノードの ID

	// ---- まず、基本移動動作
	if (       keyCode  === 37    ) {      // ---- 左移動
		nextId = caret.shiftLeft(section);
	} else if (keyCode  === 39    ) {      // ---- 右移動
		nextId = caret.shiftRight(section);
	} else if (keyCode  === 38    ) {      // ---- 上移動
		nextId = caret.shiftUp(section);
	} else if (keyCode  === 40    ) {      // ---- 下移動
		nextId = caret.shiftDown(section);
	} else if (keyCode  === 27    ) {      // ---- Esc
		nextId = caret.shiftEsc(section);
	} else if (eventKey === 'Home') {      // ---- Home
		nextId = ctrlKey ? section.firstChild.firstChild.id : caret.shiftHome(section);
	} else if (eventKey === 'End' ) {      // ---- End
		nextId = ctrlKey ? section.lastChild.lastChild.id : caret.shiftEnd(section);
	}

	// 選択動作か否かを取得します
	var isSelecting = (selectedRangeManager.isSelecting && (33 <= keyCode) && (keyCode <= 40));

	// 範囲選択操作中であれば、カーソル位置を用いて選択範囲を更新します
	if (isSelecting) {
		var node = DocumentManager.getNodeById(caret.pos);
		selectedRangeManager.updateSelectedRange(node);

	}
	// 範囲選択操作中でない場合、選択範囲があればクリアします
	else {
		if (nextId === void 0) return nextId;

		// 選択範囲があれば、選択範囲の先頭あるいは終端にカーソルを移動させ、選択範囲をクリアします
		if (selectedRangeManager.hasSelectedRange) {
			// 選択範囲の先頭と終端を取得します
			var selRange = selectedRangeManager.getSelectedRange();
			var startNode = selRange[0];
			var nodeCount = selRange.length;
			var endNode   = selRange[nodeCount - 1];
			var idPair    = SelectedRangeManager.getEdgeNodeIds(startNode, endNode);

			// セクションが移動していなければ、改めてカーソル移動先を決定します
			if (section === DocumentManager.getCurrentSection()) {
				// 左矢印、上矢印 (Home キー) なら左端へ
				if (keyCode == 37 || keyCode == 38 || eventKey == 'Home')		nextId = idPair.youngId;
				// 右矢印,、下矢印、(End キー)  なら右端へ
				else if (keyCode == 39 || keyCode == 40 || eventKey == 'End')	nextId = idPair.oldId;
			}

			// nextId がテーブル・マトリクスのセルそのものの場合、セル内部の先頭要素を取得します
			nextId = KeyEventHandler.getFirstCellChild(nextId);

			// Home 時は、最初の段落の先頭へ
			if (eventKey == 'Home') {
				caret.pos = nextId;
				nextId = caret.shiftHome(section);
			}
			// End 時は、最後の段落の最後尾へ
			else if (eventKey == 'End') {
				caret.pos = nextId;
				nextId = caret.shiftEnd(section);
			}

			if (nextId !== undefined) selectedRangeManager.clearSelectedRange(); // 範囲選択を解除
		}
	}
	// ---- 移動系キーによる処理が行われた場合、レンダラへカーソル移動を登録します。
	if (nextId !== undefined) ViewManager.getRenderer().setCaretPos(forePos, nextId);
	return nextId;
};

/**
 * ID 指定されたノードがテーブル、マトリクスのセルの場合、最初の子ノードの ID を取得します。
 * それ以外の場合は元の ID をそのまま返します
 */
KeyEventHandler.getFirstCellChild = function(nodeId) {
	var section = DocumentManager.getCurrentSection();

	var jnode = $(section).find('#' + nodeId);
	if (jnode.length === 0) {
		//jnode = $(DocumentManager.getDocument()).find('#' + nodeId);
		console.log('セクションの先頭・終端を含む選択範囲がある時は、セクションを超えるようなカーソル移動はできません。');
		return void 0;
	}

	var node = jnode[0];
	if ((node.nodeName === 'CTD') || (node.nodeName === 'CMATCELL')) {
		return node.firstChild.id;
	}
	else {
		return nodeId;
	}
};



/*********************************************************************
 * Input イベント
 *********************************************************************/

KeyEventHandler.onInput = function(event) {
	//console.log('onInput が発生しました。');

	// ★編集禁止時は、このメソッドは入力文字をキャンセル以外何もしないこと★
	if (!DocumentManager.isEditable()) {
		// 編集禁止時に行われた日本語入力確定時、入力部品をクリアし、日本語入力制御フラグをリセットします
		if (KeyEventHandler.inputFlag) {
			event.target.innerHTML = '';
			KeyEventHandler.imeFlag = false;
			KeyEventHandler.inputFlag = false;

			console.log('onInput にて Input 部品の入力内容をクリアしました。');
		}

		console.log('Input にて、イベントキャンセル');
		event.preventDefault();
		event.stopPropagation();
		return;
	}

	var message = 'Shift; ' + KeyEventHandler.shiftKey + ', Alt: ' + KeyEventHandler.altKey +
				', Ctrl: ' + KeyEventHandler.ctrlKey + ', Ime: ' + KeyEventHandler.imeFlag +
				', Input: ' + KeyEventHandler.inputFlag + ', LastKey: ' + KeyEventHandler.lastKeyCode +
				', Cancel: ' + KeyEventHandler.cancelGetFontStatus + ', Corner: ' + KeyEventHandler.cornerShortcut;
	//console.log('★' + message);

	if ((16 <= KeyEventHandler.lastKeyCode) && (KeyEventHandler.lastKeyCode <= 18)) {
		return;
	}

	var inputObj = EDT_FrontTextBox;
	var target = event.target;

	if (ClipEventHandler.onPasteFlag !== false) {
		try {
			if (ClipEventHandler.onPasteFlag === true) {
				ClipEventHandler.execPaste(event, inputObj);
			} else {
				ClipEventHandler.execPaste(event, inputObj, ClipEventHandler.onPasteFlag);
			}
		}
		catch (e) {
			showMessageDialog('同一ブラウザ上でコピーした画像は貼り付けられません。<br>一度、別アプリに貼り付けてから、それをコピーし直してください。', '貼り付けエラー');
		}
		return;
	}

	// 入力部品の中に改行があれば削除します
	// Enter で段落分割後、Input イベントが抑制されないことがあるバグへの対処です
	if (event.target.innerHTML.indexOf('<br>') >= 0) {
		var temp = event.target.innerHTML.replace('<br>', '');
		event.target.innerHTML = temp;
	}

	if (event.target.innerHTML == '<br>') return;

    // 上下添え字移動、数式のショートカットキーのときは入力を無視します
    if (event.target.textContent === KeyEventHandler.cornerShortcut ||
            event.target.textContent === KeyEventHandler.ignoreInput){
        event.target.innerHTML = '';
        KeyEventHandler.ignoreInput = null;
		console.log('onInput にて 移動、ショートカットに続く処理のため、Input 部品の入力内容をクリアしました。');
        return;
    }

	// 隠し選択領域のみの時は何もしません
    // ３つめの条件式はIE対応です
	if ((target.childNodes.length === 1) && (target.childNodes[0].nodeName.toLowerCase() == 'span') && (target.childNodes[0].textContent === '1')) return;
	if (target.textContent === '') {
		// 日本語入力関連のフラグをクリアします
		KeyEventHandler.imeFlag = false;
		KeyEventHandler.inputFlag = false;
		return;
	}
//	console.log('選択文字列：' + target.textContent);

	// 日本語入力中は何もしません。
	// ★元々は入力部品のサイズ変更をしていました
	if (KeyEventHandler.imeFlag && !KeyEventHandler.inputFlag) {
		// ★IEでログ出力が散々になるので、コメントアウト。
		console.log('Input イベントで日本語入力のため処理をキャンセルしました。');
		return;
	}

//	console.log('Input イベントによる入力処理');

	var entity = null;
	if (target.textContent.length === 1) {
		if (KeyEventHandler.lastKeyCode === 32)	entity = '&nbsp;';
		// TAB はブラウザ上でショートカットとして機能するため、ショートカット枠で処理します
//		if (KeyEventHandler.lastKeyCode === 9)	entity = '&tab;';

		if (KeyEventHandler.shiftKey) {
			if (KeyEventHandler.lastKeyCode === 59)		entity = '&plus;';		// +
			if (KeyEventHandler.lastKeyCode === 58)		entity = '&times;';		// *
		}
		else {
			if (KeyEventHandler.lastKeyCode === 107)	entity = '&plus;';		// ten  +
			if (KeyEventHandler.lastKeyCode === 109)	entity = '&minus;';		// ten  -
			if (KeyEventHandler.lastKeyCode === 173)	entity = '&minus;';		// main -
		}
	}

	// 入力文字列を確定します
	KeyEventHandler.getStrAndRecord(event, entity);

	// 1文字挿入でベースに戻るショートカットが実行された直後は仮想的にEnterキー押下を発行します
	if (KeyEventHandler.cornerShortcut) {
	    KeyEventHandler.execOtherCommand({keyCode: 13, key:'Enter'});
	    KeyEventHandler.cornerShortcut = false;
	}

	KeyEventHandler.imeFlag = false;
	KeyEventHandler.inputFlag = false;
};

/**
 * 入力文字を取得し、データノードに登録します。
 */
KeyEventHandler.getStrAndRecord = function(event, entity) {
	var editorPane    = ViewManager.getEditorPane(); // エディタペーンへの参照を取得します。
	var caret         = editorPane.getCaret();       // Caret オブジェクトへの参照
	var caretId       = caret.pos;                   // 現在のキャレット位置の要素 ID を取得
	var inputObj      = event.target;                // FrontTextBox の jquery オブジェクト
	var inStr         = inputObj.textContent;        // FrontTextBox 内の文字列を取得

	// IE対応コード
	if (inputObj.childNodes.length > 1) {
		inStr = inputObj.childNodes[0].textContent;
	}

	// 入力が半角空白一文字の場合、エンティティを設定します
	if ((inStr.length === 1) && (inStr.charCodeAt(0) === 160)) entity = '&nbsp;';

	// 入力文字列の表示をクリア
	inputObj.innerHTML = '';      // FrontTextBox 内の文字列をクリア
	//console.log('getStrAndRecord にて Input 部品の入力内容をクリアしました。' + event);

	// データノードへキャラクタを書き込み、再描画を行う
	var strLen = inStr.length;
	for (var i = 0; i < strLen; i++) { // 文字を一つづつデータへ登録
		var oneChar = inStr.substr(i, 1);
		UiCommandWrapper.insertChar(oneChar, null, caret, void 0, entity);
	}

	// カーソルが新しく移動した先の段落を再描画します。
	ViewManager.getRenderer().update();
	// ★ここでカーソル位置に合わせた自動スクロール
	EditorPaneClass.scrollManager.SetFocusNode(caret.pos);
	EditorPaneClass.scrollManager.ScrollToFocusNode();
	// カーソルの表示位置を更新します
	editorPane.updateCaret();

	event.preventDefault();  // 他の処理にフォーカスを取られることを防ぎます。
	event.stopPropagation(); // イベントバブリングによる余計な重複処理を防ぎます。
};


/*********************************************************************
 * CompositionStart イベント
 *********************************************************************/

KeyEventHandler.onCompositionStart = function(event) {
	console.log('日本語入力が開始されました。');
	KeyEventHandler.imeFlag = true;
	KeyEventHandler.lastKeyCode = null;
};

/*********************************************************************
 * CompositionEnd イベント
 *********************************************************************/

KeyEventHandler.onCompositionEnd = function(event) {
	console.log('日本語入力が終了しました。');
	KeyEventHandler.inputFlag = true;

	if (browserIsEdge() || browserIsChrome) {
		event.preventDefault = function() {};
		event.stopPropagation = function() {};
		event.shiftKey = KeyEventHandler.shiftKey;
		event.altKey = KeyEventHandler.altKey;
		event.ctrlKey = KeyEventHandler.ctrlKey;

		KeyEventHandler.onInput(event);
	}
};


/**********************************************************************
 * KeyUp イベント
 **********************************************************************/

// ---- shiftKey が離されたら、選択動作を解除します
KeyEventHandler.onKeyUp = function(evt) {
	//var myDate = new Date();
	//console.log('onKeyUp が発生しました。' + myDate.getTime());

	// ★編集禁止時は、このメソッドは一部ショートカット以外何もしないこと★
	if (!DocumentManager.isEditable()) {
		evt.preventDefault();
		evt.stopPropagation();
		return;
	}

	if ((evt.key !== 'Control') && (evt.keyCode !== 17)) {
		//if (!KeyEventHandler.cancelGetFontStatus && (evt.key !== 'Enter') && (evt.keyCode !== 27)) {
		if (!KeyEventHandler.cancelGetFontStatus && (evt.keyCode !== 27)) {
			// カーソル位置から、イタリック等の書式情報を取得し、GUIへ反映します。
			ViewManager.getStatusManager().showCaretStatus();
		};
	}

	//KeyEventHandler.cancelGetFontStatus = false;

	// 無条件に、入力部品の枠を非表示にします
	EditorPaneClass.setCaretBorder(false);

	if (evt.shiftKey === false) {	// Shift キーが押されていなければ、
		EditManager.getSelectedRangeManager().isSelecting = false;
	}

	//var myDate = new Date();
	//console.log('onKeyUp が終了しました。' + myDate.getTime());
}

/**
 * OSがMacか否かを判別します。
 */
KeyEventHandler.isMac = function() {
    return navigator.userAgent.toLowerCase().indexOf('mac') >= 0
};


/**********************************************************************
 * IE 用メンバ
 **********************************************************************/

KeyEventHandler.oldHtml = null;

/**
 * IE か否かの判別用簡易関数
 * @returns {Boolean}
 */
KeyEventHandler.isIE = function() {
	var userAgent = window.navigator.userAgent.toLowerCase();
	if (userAgent.indexOf('msie') != -1 || userAgent.indexOf('trident') != -1) {
		return true;
	}
	return false;
}
