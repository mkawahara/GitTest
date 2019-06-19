/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： assistHandler.js                                   */
/* -                                                                         */
/* -    概      要     ： 入力支援クラス用イベントハンドラ層                 */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年05月11日                         */

function AssistHandler() {};


/**
 * ひとつの要素を挿入します。
 * @param char  挿入する文字（レイアウト要素の場合はベース文字）
 * @param option 挿入対象の種類や属性を指定するオプション
 *
 */
AssistHandler.insert = function(char, option) {
    // ショートカットからの実行の場合、数式モードでなければ何もしません
    if (option != null && option.fromshortcut) {
        var inputmode = ViewManager.getStatusManager().getAllStatus().inputmode;
        if (inputmode != CIO_XML_TYPE.math) return;
    }

	var editorPane = ViewManager.getEditorPane();
	var caret = editorPane.getCaret();                                     // キャレット
	var itemStatus = AssistHandler.getItemStatus(option);
	UiCommandWrapper.insertChar(char, option, caret, itemStatus);          // 一文入力

	ViewManager.getRenderer().update();               // カーソルが新しく移動した先の段落を再描画します

	var editorPane = ViewManager.getEditorPane();
	EditorPaneClass.scrollManager.SetFocusNode( editorPane.getCaret().pos );
	EditorPaneClass.scrollManager.ScrollToFocusNode();
	// カーソルの表示位置を更新します
	editorPane.updateCaret();

	ViewManager.getStatusManager().showCaretStatus(); // カーソル位置からの書式情報を取得し、GUIへ反映します。
	editorPane.FocusFrontTextBox();                   // フォーカスをエディタペーンへ戻します。
};

/**
 * ステータスを取得します。
 */
AssistHandler.getItemStatus = function(option) {
    // いったん GUI から取得します
    var guiStatus = ViewManager.getStatusManager().getAllStatus();

    // オプションで指定されていたら上書きします
    if (option != null && (option.inputmode != null || option.footnote != null || option.italic != null)) {
        // GUI のステータスで初期化します
        var newStatus = {};
        for (key in guiStatus) {
            newStatus[key] = guiStatus[key];
        }

        // 入力モードを上書きします
        if (option.inputmode != null) {
            // GUI の入力モードと異なるときは、斜体指定をモードのデフォルトに設定します
            if (guiStatus.inputmode != option.inputmode) {
                newStatus.italic = (option.inputmode == CIO_XML_TYPE.math); // 数式モードはデフォルト斜体
            }
            newStatus.inputmode = option.inputmode;
        }

        // 上付き・下付きを上書きします
        if (option.footnote != null) newStatus.footnote = option.footnote;

        // 斜体設定を上書きします
        if (option.italic != null) newStatus.italic = option.italic;

        // 上書きしたステータスを返します
        return newStatus;
    }

    // オプション指定がなければ GUI のステータスをそのまま返します
    else return guiStatus;
}

