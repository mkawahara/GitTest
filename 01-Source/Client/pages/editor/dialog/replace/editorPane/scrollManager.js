// このクラスは置換ページでは機能しないモックです。
function ScrollManager(editorPane) {};

ScrollManager.prototype.SetFocusNode = function(nodeId) {};

ScrollManager.prototype.ScrollToFocusNode = function() {};

ScrollManager.prototype.GetNodePos = function() {
	return { left: 0, top: 0, };
};

ScrollManager.prototype.ScrollTo = function(nodePos) {};
