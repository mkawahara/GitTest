/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： editMenuEvent.js                            */
/* -                                                                         */
/* -    概      要     ： ファイルメニュー用イベントハンドラ                 */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年09月24日                         */

function EditMenuEventHandler() {};

EditMenuEventHandler.onClickSetOption = function() {
	WindowManager.instance.openConfigWindow();
};



// メニュー上のコピー機能をクリック
EditMenuEventHandler.onClickCopy = function() {
	showMessageDialog('コピー機能は、ショートカット (Ctrl + C) から実行して下さい。', 'メッセージ');
	var editorPane = ViewManager.getEditorPane();
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
};

// メニュー上の切り取り機能をクリック
EditMenuEventHandler.onClickCut = function() {
	showMessageDialog('切り取り機能は、ショートカット (Ctrl + X) から実行して下さい。', 'メッセージ');
	var editorPane = ViewManager.getEditorPane();
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
};

// メニュー上の貼り付け機能をクリック
EditMenuEventHandler.onClickPaste = function() {
	showMessageDialog('貼り付け機能は、ショートカット (Ctrl + V) から実行して下さい。', 'メッセージ');
	var editorPane = ViewManager.getEditorPane();
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
};

// メニュー上の削除機能をクリック
EditMenuEventHandler.onClickDel = function() {
	var editorPane = ViewManager.getEditorPane();           // エディタペーンへの参照を取得します。
	var nodeList   = EditManager.getSelectedRangeManager().getSelectedRange(); // 選択範囲取得
	if (nodeList) {
		nextNodeId = UiCommandWrapper.removeMultiNode(nodeList);
	} else {
		var caret = editorPane.getCaret();                 // キャレットへの参照を取得します。
		nextNodeId = UiCommandWrapper.deleteOperation(false, caret);
	}
	ViewManager.getRenderer().update();                                   // レンダラ update
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
};


EditMenuEventHandler.onClickUndo = function() {
	if (DocumentManager.isEditable() === -1) showMessageDialog('読み上げモードの時、指定された操作は実行できません。', '操作エラー');
	if (DocumentManager.isEditable() !== true) return;

	var editorPane = ViewManager.getEditorPane();

	UiCommandWrapper.Undo();

	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
};



EditMenuEventHandler.onClickRedo = function() {
	if (DocumentManager.isEditable() === -1) showMessageDialog('読み上げモードの時、指定された操作は実行できません。', '操作エラー');
	if (DocumentManager.isEditable() !== true) return;

	var editorPane = ViewManager.getEditorPane();

	UiCommandWrapper.Redo();

	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
};

