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
	
	var inputMode = statusManager.getStatus('inputmode'); // インプットモード取得
	if (inputMode == CIO_XML_TYPE.text) {
		inputMode = CIO_XML_TYPE.math;
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
	UiCommandWrapper.convertMode(inputMode);              // 指定モードへ変換する
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
		nodeList   = [ DocumentManager.getNodeById(ViewManager.getCaret().pos) ]; // キャレット位置のノード取得
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
	// fontSize : FONT_SIZE.x_small = フォントサイズ 1 最少
	//                     .small   = フォントサイズ 2
	//                     .medium  = フォントサイズ 3 既定値
	//                     .large   = フォントサイズ 4
	//                     .x_large = フォントサイズ 5 最大
	var statusManager = ViewManager.getStatusManager(); // ステータスマネージャ取得
	var editorPane    = ViewManager.getEditorPane();    // エディタペーン取得
	var caret         = ViewManager.getCaret();          // キャレット

	// ---- GUI更新
	statusManager.setFontSize(fontSize);

	UiCommandWrapper.setFontSize(fontSize, caret); // 囲み枠指定実行
	ViewManager.getRenderer().update();            // レンダラ update
	
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // キャレットをフォーカス
};



/**
 * 画像設定
 * @param inputMode
 */
EditorToolBarEventHandler.onClickInsertImage = function() {
	EditorPaneClass.InsertImage();

	ViewManager.getEditorPane().FocusFrontTextBox();
};



/**
 * 囲み枠指定アイコンクリック
 */
EditorToolBarEventHandler.onFrameBorder = function(frameType) {
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
		nodeList   = [ DocumentManager.getNodeById(ViewManager.getCaret().pos) ]; // キャレット位置のノード取得
		selectFlag = false;                                               // 選択範囲があったかどうか→なかった
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
 * ルビ設定
 */
EditorToolBarEventHandler.onRuby = function() {
//	var editorPane           = ViewManager.getEditorPane();               // エディタペーン　　　取得

	WindowManager.instance.openRubyWindow();

	// カーソルの表示位置を更新します
//	editorPane.updateCaret();

	// ---- キャレットをフォーカス
//	editorPane.FocusFrontTextBox();
};

/**
 * 画像設定
 */
EditorToolBarEventHandler.onImage = function() {
	var editorPane           = ViewManager.getEditorPane();               // エディタペーン　　　取得

	nodeId = ViewManager.getCaret().pos; // キャレット位置のノードの id 取得
	WindowManager.instance.openImageWindow(nodeId);

	// カーソルの表示位置を更新します
//	editorPane.updateCaret();

	// ---- キャレットをフォーカス
//	editorPane.FocusFrontTextBox();
};



/**
 * テーブル挿入
 */
EditorToolBarEventHandler.onTable = function() {
	WindowManager.instance.openTableWindow()
};

// ---- 上へ 1 行挿入
EditMenuEventHandler.onInsertRowAbove = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = ViewManager.getCaret();       // キャレット

	UiCommandWrapper.insertRow(caret, true);
	ViewManager.getRenderer().update();           // レンダラ update
	
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // ---- キャレットをフォーカス
};

// ---- 下へ 1 行挿入
EditMenuEventHandler.onInsertRowBelow = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = ViewManager.getCaret();       // キャレット

	UiCommandWrapper.insertRow(caret, false);
	ViewManager.getRenderer().update();           // レンダラ update
	
	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 行の削除
EditMenuEventHandler.onDeleteRow = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = ViewManager.getCaret();       // キャレット

	UiCommandWrapper.removeRow(caret);
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 前へ 1 列挿入
EditMenuEventHandler.onInsertColBefore = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = ViewManager.getCaret();       // キャレット

	UiCommandWrapper.insertCol(caret, true);
	ViewManager.getRenderer().update();           // レンダラ update
	
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox(); // ---- キャレットをフォーカス
};

// ---- 後へ 1 列挿入
EditMenuEventHandler.onInsertColAfter = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = ViewManager.getCaret();       // キャレット

	UiCommandWrapper.insertCol(caret, false);
	ViewManager.getRenderer().update();           // レンダラ update
	
	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};

// ---- 列の削除
EditMenuEventHandler.onDeleteCol = function() {
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	var caret      = ViewManager.getCaret();       // キャレット

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
	
	UiCommandWrapper.formulaNumber( ViewManager.getCaret() );
	ViewManager.getRenderer().update();           // レンダラ update

	editorPane.updateCaret();                     // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();               // キャレットをフォーカス
};


