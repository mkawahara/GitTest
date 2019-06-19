/**
 * コンストラクタ。
 * スクロール対象とするエディタペインを引数として、
 * 新しい ScrollManager を作成します。
 */
function ScrollManager(editorPane) {
	this.editorPane = editorPane;
	this.focusNode = null;
};

/**
 * スクロールによる表示対象とするノードを指定します。
 * @param nodeId
 */
ScrollManager.prototype.SetFocusNode = function(nodeId) {
	this.focusNode = document.getElementById(nodeId);
};

/**
 * 予め指定したノードを表示するように、
 * エディタペインをスクロールします。
 * ノードが指定されていなければ、何もしません。
 */
ScrollManager.prototype.ScrollToFocusNode = function() {
	if (this.focusNode === null) return;

	var pos = this.GetNodePos();
	this.ScrollTo(pos);

	this.focusNode = null;
};

/**
 * 指定ノードのエディタペイン上での相対座標を取得します。
 */
ScrollManager.prototype.GetNodePos = function() {
	// offsetLeft/Top は DOM における要素の属性の影響を受けることがあるため、
	// jQuery で座標を取得します。

	var nodeOffset = $(this.focusNode).offset();
	var paneOffset = $(this.editorPane).offset();

	var left = nodeOffset.left - paneOffset.left + this.editorPane.scrollLeft;
	var top = nodeOffset.top - paneOffset.top + this.editorPane.scrollTop;

	return { left: left, top: top, };
};

/**
 * 指定位置にエディタペインをスクロールします。
 * @param pos
 */
ScrollManager.prototype.ScrollTo = function(nodePos) {
	// 対象ノードのサイズを取得します
	var nodeWidth = this.focusNode.offsetWidth;
	var nodeHeight = this.focusNode.offsetHeight;

	// エディタペインの領域サイズを取得します
	var paneWidth = this.editorPane.clientWidth;
	var paneHeight = this.editorPane.clientHeight;

	// X 軸方向の位置を決定します
	if (nodePos.left < this.editorPane.scrollLeft) this.editorPane.scrollLeft = nodePos.left - 10;
	if ((nodePos.left + nodeWidth) > (this.editorPane.scrollLeft + paneWidth)) this.editorPane.scrollLeft = nodePos.left + nodeWidth - paneWidth + 10;

	// Y 軸方向の位置を決定します
	if (nodePos.top < this.editorPane.scrollTop) this.editorPane.scrollTop = nodePos.top - 10;
	if ((nodePos.top + nodeHeight) > (this.editorPane.scrollTop + paneHeight)) this.editorPane.scrollTop = nodePos.top + nodeHeight - paneHeight + 10;
};
