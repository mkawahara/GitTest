/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月26日                         */

/**
 * エディタペインツールバーのイベントハンドラクラス
 */

function EditorToolBarEventHandler() {};

/**
 * 入力モード切替アイコンクリック
 * @param inputMode
 */
EditorToolBarEventHandler.onClickInputMode = function(inputMode) {
	ViewManager.getStatusManager().setInputMode(inputMode);
	EditorToolBarEventHandler.convertType(); // テキスト - 数式 - 化学式変換
	ViewManager.getRenderer().update();                                   // レンダラ update
	ViewManager.getEditorPane().FocusFrontTextBox();
};

// ---- キーボードショートカットにて、入力モードをスイッチ
EditorToolBarEventHandler.onSwitchInputMode = function() {
	var statusManager = ViewManager.getStatusManager();

	var IsShortcutTargetChem = ConfigManager.instance.IsShortcutTargetChem; // 化学へも切り替えるか？
	var inputMode = statusManager.getStatus('inputmode'); // インプットモード取得
	if (inputMode == CIO_XML_TYPE.text) {
		inputMode = CIO_XML_TYPE.math;
	} else if (inputMode == CIO_XML_TYPE.math && IsShortcutTargetChem) {
		inputMode = CIO_XML_TYPE.chemical;
	} else {
		inputMode = CIO_XML_TYPE.text;
	}
	statusManager.setInputMode(inputMode);
	EditorToolBarEventHandler.convertType(); // テキスト - 数式 - 化学式変換
	ViewManager.getRenderer().update();                                   // レンダラ update
	ViewManager.getEditorPane().FocusFrontTextBox();
};

// テキスト - 数式 - 化学式変換
EditorToolBarEventHandler.convertType = function() {
	var statusManager = ViewManager.getStatusManager();
	var inputMode = statusManager.getStatus('inputmode'); // インプットモード取得
	UiCommandWrapper.convertMode(inputMode, ViewManager.getEditorPane().getCaret()); // 指定モードへ変換する
};

/**
 * イタリック指定切替アイコンクリック
 */
EditorToolBarEventHandler.onClickItaric = function() {
	// ---- マネージャ取得
	var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

	// ---- GUI更新
	statusManager.toggleItalic();                                     // アイコントグル

	// ---- 本文更新: 選択範囲がなければ無効
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得
	if (nodeList) {                                                   // ---- 選択範囲があるならイタリック指定実行
		var italicFlag = statusManager.getStatus('italic');                   // イタリックの指定状態取得
		UiCommandWrapper.setItalic(nodeList, italicFlag);                     // イタリック指定実行
		ViewManager.getRenderer().update();                                   // レンダラ update
	}

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * 太字指定切替アイコンクリック
 */
EditorToolBarEventHandler.onClickBold = function() {
	// ---- マネージャ取得
	var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

	// ---- GUI更新
	statusManager.toggleBold();

	// ---- 本文更新: 選択範囲がなければ無効
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得
	if (nodeList) {                                                   // ---- 選択範囲があるなら太字指定実行
		var boldFlag = statusManager.getStatus('bold');                       // 太字の指定状態取得
		UiCommandWrapper.setBold(nodeList, boldFlag);                         // 太字の指定実行
		ViewManager.getRenderer().update();                                   // レンダラ update
	}

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * 下線指定切替アイコンクリック
 */
EditorToolBarEventHandler.onClickUnderline = function() {
		// ---- マネージャ取得
	var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

	// ---- GUI更新
	statusManager.toggleUnderline();

	// ---- 本文更新: 選択範囲がなければ無効
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得
	if (nodeList) {                                                   // ---- 選択範囲があるなら下線指定実行
		var ulineFlag = statusManager.getStatus('underline');                 // 下線の指定状態取得
		UiCommandWrapper.setUnderLine(nodeList, ulineFlag);                   // 下線指定実行
		ViewManager.getRenderer().update();                                   // レンダラ update
	}

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * 打消し線指定切替アイコンクリック
 */
EditorToolBarEventHandler.onClickStrike = function() {
		// ---- マネージャ取得
	var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

	// ---- GUI更新
	statusManager.toggleStrike();

	// ---- 本文更新: 選択範囲がなければ無効
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得
	if (nodeList) {                                                   // ---- 選択範囲があるなら打消線指定実行
		var strikeFlag = statusManager.getStatus('strike');                   // 打消線の指定状態取得
		UiCommandWrapper.setStrike(nodeList, strikeFlag);                     // 下線指定実行
		ViewManager.getRenderer().update();                                   // レンダラ update
	}

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * 脚注書式指定切替アイコンクリック
 */
EditorToolBarEventHandler.onClickFootnote = function(targetType) {
	// targetType :  : SM_FOOTNOTE_FORMAT.sup  = 「脚注書式上付き」をトグルする
	//                                   .sub  = 「脚注書式下付き」をトグルする

	// ---- マネージャ類取得
	var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

	// ---- GUI更新
	statusManager.toggleFootnote(targetType);

	// ---- 本文更新: 選択範囲がなければ無効
	var nodeList = selectedRangeManager.getSelectedRange();           // 選択範囲取得
	if (nodeList) {                                                   // ---- 選択範囲があるなら脚注書式指定実行
		var footNoteType = statusManager.getStatus('footnote');               // 脚注書式の指定状態取得
		UiCommandWrapper.setFootNote(nodeList, footNoteType);                 // 脚注書式指定実行
		ViewManager.getRenderer().update();                                   // レンダラ update
	}

	// カーソルの表示位置を更新します
	editorPane.updateCaret();

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * アライン指定切替アイコンクリック
 */
EditorToolBarEventHandler.onClickAlign = function(alignType) {
	if (DocumentManager.isEditable() !== true) return;
	// alignType : PARAGRAPH_ALIGN.left   = 左揃え
	//                            .center = 中央揃え
	//                            .right  = 右揃え
	// ---- マネージャ類取得
	var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

	// ---- GUI更新
	statusManager.setAlign(alignType);                                // アイコントグル

	// ---- 本文更新: 選択範囲がなければ、キャレット位置の段落、もしくはテーブルセルを対象とする
	var nodeList   = selectedRangeManager.getSelectedRange();         // 選択範囲取得
	var selectFlag = true;                                            // 選択範囲があったかどうか
	if (!nodeList) {                                                  // ---- 選択範囲がなければ、
		nodeList   = [ DocumentManager.getNodeById(editorPane.getCaret().pos) ]; // キャレット位置のノード取得
		selectFlag = false;                                                   // 選択範囲があったかどうか→なかった
	}

	var align = statusManager.getStatus('align');                     // アライン取得
	UiCommandWrapper.setAlign(nodeList, align, selectFlag);           // アライン指定実行
	ViewManager.getRenderer().update();                               // レンダラ update

	// カーソルの表示位置を更新します
	editorPane.updateCaret();

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};



/**
 * フォントサイズ変更
 */
EditorToolBarEventHandler.onFontSize = function(fontSize) {
	if (DocumentManager.isEditable() !== true) return;
	// fontSize : FONT_SIZE.x_small = フォントサイズ 1 最少
	//                     .small   = フォントサイズ 2
	//                     .medium  = フォントサイズ 3 既定値
	//                     .large   = フォントサイズ 4
	//                     .x_large = フォントサイズ 5 最大
	var statusManager = ViewManager.getStatusManager(); // ステータスマネージャ取得
	var editorPane    = ViewManager.getEditorPane();    // エディタペーン取得
	var caret         = editorPane.getCaret();          // キャレット

	// ---- GUI更新
	statusManager.setFontSize(fontSize);

	UiCommandWrapper.setFontSize(fontSize, caret); // 囲み枠指定実行
	ViewManager.getRenderer().update();            // レンダラ update

	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // キャレットをフォーカス
};



/**
 * 画像設定 //2017/06/20 使用されていません。対応するイベントハンドラは editorToolBar.js にあります
 * @param inputMode
 */
EditorToolBarEventHandler.onClickInsertImage = function() {
	if (DocumentManager.isEditable() !== true) return;
	EditorPaneClass.InsertImage();

	ViewManager.getEditorPane().FocusFrontTextBox();
};

/**
 * IE で使用するための画像貼り付けダイアログを表示します
 * 2017/06/22 呼び出し部品を隠蔽しているため、事実上未使用です
 */
EditorToolBarEventHandler.onClickPasteImage = function() {
    var dialog = $('#_imagePasteDialog');
    dialog.dialog('open');
};

/**
 * 囲み枠指定アイコンクリック
 */
EditorToolBarEventHandler.onFrameBorder = function(frameType) {
	if (DocumentManager.isEditable() !== true) return;
	// frameType [enum] :               null 囲み枠なし
	//                    BORDER_TYPE.normal 標準の枠
	//                                double 二重線の枠
	//                                round  角の丸い枠
	//                                bround 太い角の丸い枠
	//                                shadow 影のある枠
	//                                circle 丸囲み枠

	// ---- マネージャ類取得
	var selectedRangeManager = EditManager.getSelectedRangeManager();     // 範囲選択マネージャ　取得
	var editorPane           = ViewManager.getEditorPane();               // エディタペーン　　　取得

	// ---- box 操作用のノードリストを取得します。
	var nodeList   = selectedRangeManager.getBoxNodeList();               // 選択範囲取得
	var selectFlag = true;
	if (!nodeList.length) {
		return;
		//nodeList   = [ DocumentManager.getNodeById(editorPane.getCaret().pos) ]; // キャレット位置のノード取得
		//selectFlag = false;                                               // 選択範囲があったかどうか→なかった
	}
	// ---- 本文更新: 選択範囲がなければ無効
	UiCommandWrapper.setFrameBorder(nodeList, frameType, selectFlag);     // 囲み枠指定実行
	ViewManager.getRenderer().update();                                   // レンダラ update

	// カーソルの表示位置を更新します
	editorPane.updateCaret();

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * セクションタイトルのリセットアイコンクリック
 */
EditorToolBarEventHandler.onClickTitleReset = function() {
    ViewManager.getIndexPane().setSectionTitleInput('');
}

/**
 * セクションタイトルの自動編集アイコンクリック
 */
EditorToolBarEventHandler.onClickTitleAuto = function() {
    // 表示中のセクションからタイトル文字列を取得します
    var index = DocumentManager.getCurrentSectionIndex();
    var title = IndexToolClass.getSectionTitleAuto(index);

    // タイトルが取得できなければ何もしません
    if (title == '') return;

    // セクションタイトルを更新します
    ViewManager.getIndexPane().setSectionTitleInput(title);
}


/**
 * ルビ設定
 */
EditorToolBarEventHandler.onRuby = function() {
	if (DocumentManager.isEditable() !== true) return;
	WindowManager.instance.openRubyWindow();
};

/**
 * 画像設定
 */
EditorToolBarEventHandler.onImage = function() {
	if (DocumentManager.isEditable() !== true) return;
	var editorPane = ViewManager.getEditorPane();               // エディタペーン　　　取得
	var nodeId = null;

	// ---- 選択領域がある場合、選択されているノードが一つだけなら
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;

	if (selectedRangeManager.hasSelectedRange) { // ---- 選択範囲があるなら
		if (selectedRangeManager.count == 1) {           // ---- 選択されているノードが一つだけなら
			var nodeList = selectedRangeManager.getSelectedRange();
			nodeId = nodeList[0].id;                              // そのノードを対象とする
		} else {
			alert('選択対象が二つ以上ある場合、無効です。');
		}
	} else {                                     // ---- 選択範囲がないなら
		nodeId = editorPane.getCaret().pos;                       // キャレット位置のノードの id 取得
	}

	if (nodeId !== null) {
		WindowManager.instance.openImageWindow(nodeId);
	}

	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // キャレットをフォーカス
};



/**
 * テーブル挿入
 */
EditorToolBarEventHandler.onTable = function() {
	if (DocumentManager.isEditable() !== true) return;
	WindowManager.instance.openTableWindow()
};

/**
 * Shift+Enterキーの処理を定義します
 */
EditMenuEventHandler.onShiftEnter = function() {
    // チェック
    var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
    var caret      = editorPane.getCaret();       // キャレット
    var section    = DocumentManager.getCurrentSection();
    var caretNode  = $(section).find('#' + caret.pos)[0];

    // 親が段落のときは段落途中改行とします
    if (caretNode != null && caretNode.parentNode != null &&
            caretNode.parentNode.nodeName == 'PARAGRAPH') {
        UiCommandWrapper.insertChar('', null, caret, void 0 , '&br;');
        ViewManager.getRenderer().update();           // レンダラ update
        editorPane.updateCaret();       // カーソルの表示位置を更新します
        editorPane.FocusFrontTextBox(); // ---- キャレットをフォーカス
    }
    // それ以外は表の後方への行挿入のことがあります
    else {
        EditMenuEventHandler.onInsertRowBelow();
    }
}

// ---- 上へ 1 行挿入
EditMenuEventHandler.onInsertRowAbove = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = editorPane.getCaret();       // キャレット

	UiCommandWrapper.insertRow(caret, true);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // ---- キャレットをフォーカス
};

// ---- 下へ 1 行挿入
EditMenuEventHandler.onInsertRowBelow = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = editorPane.getCaret();       // キャレット
	UiCommandWrapper.insertRow(caret, false);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 行の削除
EditMenuEventHandler.onDeleteRow = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = editorPane.getCaret();       // キャレット

	UiCommandWrapper.removeRow(caret);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 前へ 1 列挿入
EditMenuEventHandler.onInsertColBefore = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = editorPane.getCaret();       // キャレット

	UiCommandWrapper.insertCol(caret, true);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // ---- キャレットをフォーカス
};

// ---- 後へ 1 列挿入
EditMenuEventHandler.onInsertColAfter = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = editorPane.getCaret();       // キャレット

	UiCommandWrapper.insertCol(caret, false);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 列の削除
EditMenuEventHandler.onDeleteCol = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = editorPane.getCaret();       // キャレット

	UiCommandWrapper.removeCol(caret);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};


// ---- 全選択
EditMenuEventHandler.onSelectAll = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;

	// ノードリスト作成、範囲登録
	selectedRangeManager.clearSelectedRange(true);
	var section   = DocumentManager.getCurrentSection(); // section 取得
	var startNode = section.firstChild.firstChild;
	var endNode   = section.lastChild.lastChild;
	selectedRangeManager.startSelect(startNode);
	selectedRangeManager.updateSelectedRange(endNode);

	ViewManager.getRenderer().update();           // レンダラ update
	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 数式番号
EditMenuEventHandler.onFormulaNumber = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;

	// ---- box 操作用のノードリストを取得します。
	var nodeList   = selectedRangeManager.getBoxNodeList();               // 選択範囲取得
	var selectFlag = true;
	if (!nodeList.length) {
		nodeList   = [ DocumentManager.getNodeById(editorPane.getCaret().pos) ]; // キャレット位置のノード取得
		selectFlag = false;                                               // 選択範囲があったかどうか→なかった
	}

	UiCommandWrapper.formulaNumber( nodeList, selectFlag );
//	UiCommandWrapper.formulaNumber( editorPane.getCaret() );
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};


// ---- ページ番号
EditMenuEventHandler.onPageNumber = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得

	UiCommandWrapper.pageNumber( editorPane.getCaret() ); // ページ番号設定

	// ページ番号設定するときは右寄せします
	var caretNode = DocumentManager.getNodeById(editorPane.getCaret().pos)
	var paragraph = DataClass.getRootParagraph(caretNode);
	DataClass.bindDataClassMethods(paragraph);
	if (paragraph.pageNumber) {
        nodeList   = [ caretNode ]; // キャレット位置のノード取得
        selectFlag = false;         // 選択範囲があったかどうか→なかった
        UiCommandWrapper.setAlign(nodeList, PARAGRAPH_ALIGN.right, selectFlag); // 右寄せ
    }

	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- tab 入力
EditorToolBarEventHandler.onTabKey = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得

	UiCommandWrapper.insertChar('', null, editorPane.getCaret(), void 0, '&tab;');
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 読みの設定
EditorToolBarEventHandler.onRead = function() {
	WindowManager.instance.openReadingWindow();

};

/**
 * アニメーションの編集
 */
EditMenuEventHandler.onAnimation = function() {
    // キャレット位置を取得します
    var editorPane  = ViewManager.getEditorPane();
    var imageId = editorPane.getCaret().pos;

    // データノードからアニメーションIDを取得します
    var dataDom = DocumentManager.getDocument();
    var imgNode = $(dataDom).find('#' + imageId);
    if (imgNode.length < 1) return;
    imgNode = imgNode[0];
    DataClass.bindDataClassMethods(imgNode);
    var id = imgNode.animationId;

    // データノードから取得できていればその値を、出来ていなければIDManagerからIDを取得します
    var animeId = ((id === null) || (id === '')) ? DocumentManager.getIdManager().getNewAnimationId() : id;

    // アニメーション編集ダイアログを表示します
    WindowManager.instance.openAnimeWindow(imageId, animeId);

}

// ---- 表の読み上げ方向
EditMenuEventHandler.onReadLongitude = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得

	UiCommandWrapper.readLongitude( editorPane.getCaret() );
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 改ページ挿入
EditMenuEventHandler.onPageBreak = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得

	UiCommandWrapper.enter( editorPane.getCaret(), true);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

/**
 * フレーズ分割を挿入
 */
EditMenuEventHandler.onHighlightDivide = function() {
	var editorPane = ViewManager.getEditorPane();
	UiCommandWrapper.insertHighlightCtrl(editorPane.getCaret());

	ViewManager.getRenderer().update();
	editorPane.updateCaret();
	editorPane.FocusFrontTextBox();
}

/**
 * フレーズ結合/解除
 */
EditMenuEventHandler.onSetPhrase = function() {
	// 各マネージャを取得します
	var selectedRangeManager = EditManager.getSelectedRangeManager();
	var editorPane = ViewManager.getEditorPane();

	// 操作対象のノードリストを取得します
	var nodeList = selectedRangeManager.getBoxNodeList();
	var selectFlag = true;
	if (!nodeList.length) {
		return;
		//nodeList = [ DocumentManager.getNodeById(editorPane.getCaret().pos) ]; // キャレット位置のノード取得
		//selectFlag = false;                                               // 選択範囲があったかどうか→なかった
	}

	// 実処理を実行します
	UiCommandWrapper.setPhraseBox(nodeList, selectFlag);	// ★selectFlag は true しか来ない

	ViewManager.getRenderer().update();
	editorPane.updateCaret();
	editorPane.FocusFrontTextBox();
}
