/**
 * ルビ設定ダイアログ用クラスです。
 */

function ReplaceDialog() {
};

ReplaceDialog._instance = null;

Object.defineProperty(ReplaceDialog, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ReplaceDialog._instance === null) ReplaceDialog._instance = new ReplaceDialog();
		return ReplaceDialog._instance;
	},
});


/**
 * 前回の検索・置換文字列を取得します。
 */
ReplaceDialog.prototype.getPreviousXml = function() {
	// 親ウィンドウからデータを取得します。
	var str = window.opener.MessageManager.getSearchXml();

	if (str === null) {
		this.preSearchXml  = ''; // 検索文字列　空
		this.preReplaceXml = ''; // 置換文字列　空
		return;
	}
	this.preSearchXml   = str.preSearchXml;  // 検索文字列用 xml
	this.preReplaceXml  = str.preReplaceXml; // 置換文字列用 xml
	return;
};

ReplaceDialog.prototype.setPreviousXml = function() {
	// 検索・置換段落の内容を outerHTML ではき出し、messageManager へ保存します。
	var sectionList = DocumentManager.getDocument();
	var beforePara  = sectionList.children[0].firstChild; // 検索用セクションの段落ノード
	var afterPara   = sectionList.children[1].firstChild; // 置換用セクションの段落ノード
	var upper       = beforePara.outerHTML; // 検索用段落の xml
	var bottom      = afterPara.outerHTML;  // 置換用段落の xml
	window.opener.MessageManager.saveSearchXml(upper, bottom);
};
