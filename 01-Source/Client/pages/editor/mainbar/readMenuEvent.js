/**
 * 読み上げ機能のイベントハンドラクラスです。
 */
function ReadMenuEventHandler() {};

/**
 * 音声設定ダイアログを表示します。
 */
ReadMenuEventHandler.onVoiceSetting = function(type) {
    WindowManager.instance.openVoiceSettingWindow(type);
};

/**
 * 音声設定選択ダイアログを表示します。
 */
ReadMenuEventHandler.onSelectVoiceSetting = function() {
    WindowManager.instance.openVoiceSelectWindow();
}

/**
 * 音声のON/OFFを切り替えます。
 */
ReadMenuEventHandler.onClickVoice = function() {
	// ReadManager が不活化されている場合、何もしません
	if (!ReadManager.instance.Enabled) return;

 // ---- マネージャ類取得
 var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
 var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

 // ---- GUI更新
 statusManager.toggleVoice();                  // アイコントグル
 statusManager.changeHilightWithVoice();       // ハイライトの状態を音声の状態に追従させます。

 // 選択範囲が存在する場合、選択範囲をクリアします
 var selectedRangeManager = EditManager.instance.SelectedRangeManager;
 if (selectedRangeManager.hasSelectedRange) {
	 selectedRangeManager.clearSelectedRange();
	 ViewManager.getRenderer().update();
 }

 // ---- キャレットをフォーカス
 editorPane.FocusFrontTextBox();
};

/**
 * ハイライトのON/OFFを切り替えます。
 */
ReadMenuEventHandler.onClickHilight = function() {
 // ---- マネージャ類取得
 var statusManager        = ViewManager.getStatusManager();        // ステータスマネージャ取得
 var editorPane           = ViewManager.getEditorPane();           // エディタペーン　　　取得

 // ---- GUI更新
 statusManager.toggleHilight();                                // アイコントグル

 // ---- キャレットをフォーカス
 editorPane.FocusFrontTextBox();
};

/**
 * 話者を切り替えます
 */
ReadMenuEventHandler.onClickSpeaker = function(speakerIdx) {
	if (DocumentManager.isEditable() !== true) return;
	// speakerIdx : 話者インデックス (範囲: 0 - 4)
	//              null の場合、話者削除
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
	UiCommandWrapper.setSpeaker( speakerIdx, editorPane.getCaret() );
	ViewManager.getRenderer().update();

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
	ViewManager.getStatusManager().showCaretStatus(); // カーソル位置の話者情報をリストへ反映
};

/**
 * 話者を削除します。
 */
ReadMenuEventHandler.onClickDelSpeaker = function() {
	if (DocumentManager.isEditable() !== true) return;
	// キャレット位置の話者を、文章から削除します。
	ReadMenuEventHandler.onClickSpeaker(null);
};

/**
 * 無音設定
 */
ReadMenuEventHandler.onClickSilent = function() {
	if (DocumentManager.isEditable() !== true) return;
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得

	UiCommandWrapper.setSilent( editorPane.getCaret() );
	ViewManager.getRenderer().update();

	// ---- キャレットをフォーカス
    editorPane.updateCaret();   // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();
}

/**
 * ポーズ挿入 isLong あり (true or false) = Ctrl + Shift + L/S
 *                   なし = Shift + Space & 入力モード
 */
ReadMenuEventHandler.onInsertPause = function(isLong) {
	if (DocumentManager.isEditable() !== true) return;
	if (isLong === void 0) isLong = null;
	var editorPane = ViewManager.getEditorPane(); // エディタペーン取得

	if (isLong === null) { // ---- 入力モード依存の呼び出しなら
		var statusManager = ViewManager.getStatusManager();       // ステータスマネージャ取得
		var inputMode = statusManager.getStatus('inputmode');     // インプットモード取得
		isLong = (inputMode == CIO_XML_TYPE.text) ? false : true; // テキストモードなら短ポーズ、違えば長ポーズ
	}

	UiCommandWrapper.insertPause( editorPane.getCaret(), isLong);

	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ　取得
	selectedRangeManager.clearSelectedRange(true);

	ViewManager.getRenderer().update();
	// カーソルの表示位置を更新します
	editorPane.updateCaret();

	// ---- キャレットをフォーカス
	editorPane.FocusFrontTextBox();
};

/**
 * 単語辞書を選択します
 */
ReadMenuEventHandler.onSelectDic = function() {
    WindowManager.instance.openDicSelectWindow();
};


