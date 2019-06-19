/**
 * 各種ショートカットから呼び出されるコマンドを定義するクラスです。
 * 他の UI クラスにインターフェースが存在するコマンドは、
 * 基本的にここでは定義されていません。
 */

function ShortCutCommand() {
};


/**********************************************************************
 * 入力補助機能呼び出し
 **********************************************************************/

ShortCutCommand.codeAssist = function() {
	// 入力補助
	var pos = ViewManager.getEditorPane().GetFrontTextBoxPos();
	var codeAssist = ViewManager.getEditorPane().getCodeAssist();
	codeAssist.setVisible(true, pos.left, pos.top);
};


/**********************************************************************
 * 数式モードのショートカット
 **********************************************************************/

/**
 * 数式モードかどうかを取得します。
 */
ShortCutCommand.isMathMode = function() {
    var inputmode = ViewManager.getStatusManager().getAllStatus().inputmode;
    return (inputmode === CIO_XML_TYPE.math);
};

/**
 * Inputイベントの入力を無視する必要のある入力ショートカット
 * @param text インプット
 * @param char  挿入する文字（レイアウト要素の場合はベース文字）
 * @param option 挿入対象の種類や属性を指定するオプション
 */
ShortCutCommand.insertChar = function(text, char, option) {
    // onInputの入力を無視すべきショートカットが実行されたことを保存します
    KeyEventHandler.ignoreInput = text;
    // ショートカットによる文字の挿入を実行します
    AssistHandler.insert(char, option);
};


/**********************************************************************
 * 上下の添え字へ移動（移動可能なレイアウト要素のみ）
 **********************************************************************/

/**
 * キャレット位置の兄要素が上付き添え字をもつレイアウト要素であるかどうかを判定します。
 */
ShortCutCommand.brotherHasSuperScript = function() { return ShortCutCommand.brotherHasSubSup(true); };

/**
 * キャレット位置の兄要素が下付き添え字をもつレイアウト要素であるかどうかを判定します。
 */
ShortCutCommand.brotherHasSubScript = function() { return ShortCutCommand.brotherHasSubSup(false); };

/**
 * キャレット位置の兄要素が、右側に添え字をもつレイアウト要素であるかどうかを判定します。
 */
ShortCutCommand.brotherHasSubSup = function(isUp) {
    // キャレット位置のノードを取得します
    var section = DocumentManager.getCurrentSection();
    var caretId = ViewManager.getEditorPane().getCaret().pos;
    var caretNode = $(section).find('#'+caretId)[0];
    if (caretNode == null) return false;

    // 兄要素が右添え字を持つかどうかをノード名で判定します
    // ★TODO 本当はデータクラスにプロパティを定義すべき
    var prevNode = caretNode.previousSibling;
    return prevNode != null &&
    (prevNode.nodeName == 'CN' || prevNode.nodeName == 'CMAT' || prevNode.nodeName == 'INT' ||
            prevNode.nodeName == 'ULINE' || prevNode.nodeName == 'TOP' || prevNode.nodeName == 'TPBTM' ||
            (isUp && prevNode.nodeName == 'ROOT') || (!isUp && prevNode.nodeName == 'BTM'));
};

/**
 * ハット「^」キーによりる上添え字への移動を定義します。
 */
ShortCutCommand.shiftUp = function(text) {
    // 1文字挿入でベースに戻るショートカットが実行されたことを保存します
    KeyEventHandler.cornerShortcut = text;

    // 上矢印キーの押下を仮想的に実行します
    KeyEventHandler.execOtherCommand({keyCode: 38, key:'ArrowUp', virtual:true, shiftKey:false, ctrlKey:false});
};

/**
 * アンダーバー「_」キーによる下添え字への移動を定義します。
 */
ShortCutCommand.shiftDown = function(text) {
    // 1文字挿入でベースに戻るショートカットが実行されたことを保存します
    KeyEventHandler.cornerShortcut = text;

    // Shiftキーが押されるので範囲選択は解除する必要があります
    var selectedManager = EditManager.getSelectedRangeManager();
    selectedManager.clearSelectedRange();
    selectedManager.isSelecting = false;

    // 下矢印キーの押下を仮想的に実行します
    KeyEventHandler.execOtherCommand({keyCode: 40, key:'ArrowDown', virtual:true});
};

/**
 * セクションタイトルのテキストボックスにフォーカス移動します。
 */
ShortCutCommand.focusToTitle = function() {
    ST_SectionTitleBar.focus();
};

/**
 * インデックスペインにフォーカス移動します。
 */
ShortCutCommand.focusToIndexPane = function() {
    IDT_MasterLayer.focus();
};

/**
 * エディタペインにフォーカス移動します。
 */
ShortCutCommand.focusToEditorPane = function() {
    EDT_FrontTextBox.focus();
};

/**
 * 前のセクションへ移動します。
 */
ShortCutCommand.moveToPrevSection = function() {
    ShortCutCommand.moveSection(-1);
};

/**
 * 次のセクションへ移動します。
 */
ShortCutCommand.moveToNextSection = function() {
    ShortCutCommand.moveSection(1);
};

ShortCutCommand.moveSection = function(direction)
{
	var redrawFlag = IndexToolClass.moveSectionWithKey(direction);
    if (redrawFlag === false) return;

    // ---- 再描画処理
    IndexToolClass.HilightSection();                              // セクションの選択状態を反映します。
    IndexToolClass.ReadySectionTitle();                           // タイトルをセクションタイトルバーへ反映します。
    ViewManager.getRenderer().setUpdateEditorPane();
    ViewManager.getRenderer().preventEditorFocus();
    ViewManager.getRenderer().update();                           // エディタペイン再描画

    // キャレットの表示を更新します
    var editorPane = ViewManager.getEditorPane();
    if (editorPane.scrollManager) {
        editorPane.scrollManager.SetFocusNode(editorPane.getCaret().pos);
        editorPane.scrollManager.ScrollToFocusNode();
    }
};
