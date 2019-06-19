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
//	var codeAssist = ViewManager.getEditorPane().getCodeAssist();
	var codeAssist = ViewManager.getCodeAssist();
	codeAssist.setVisible(true, pos.left, pos.top);
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
//    var caretId = ViewManager.getEditorPane().getCaret().pos;
    var caretId = ViewManager.getCaret().pos;
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
ShortCutCommand.shiftUp = function() {
    // 上矢印キーの押下を仮想的に実行します
    KeyEventHandler.execOtherCommand({keyCode: 38, key:'ArrowUp'});
}

/**
 * アンダーバー「_」キーによる下添え字への移動を定義します。
 */
ShortCutCommand.shiftDown = function() {
    // Shiftキーが押されるので範囲選択は解除する必要があります
    var selectedManager = EditManager.getSelectedRangeManager();
    selectedManager.clearSelectedRange();
    selectedManager.isSelecting = false;

    // 下矢印キーの押下を仮想的に実行します
    KeyEventHandler.execOtherCommand({keyCode: 40, key:'ArrowDown'});
}

