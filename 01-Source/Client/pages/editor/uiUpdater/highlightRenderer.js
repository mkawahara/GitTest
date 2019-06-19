/**
 * ハイライト表示を担当するレンダラークラス
 */

function HighlightRenderer() {
	// 段落の innerHTML のバックアップ
	this._backupHtml = null;

	// ハイライト中のhtml段落ノード
	this._currentHtmlParagraph = null;

	// ハイライトのオンオフ
	this._show = true;
	// ハイライト非表示から表示に切り替えた時に表示すべきノード
	this._hideHighlightNodes = null;
};

Object.defineProperty(HighlightRenderer.prototype, 'show', {
	enumerable: true,
	configurable: true,
	set: function(value){
		this._show = value;
	},
});

/**
 * 新しい段落をハイライトします。
 * 既にハイライトされている段落があれば、そちらはクリアします。
 */
HighlightRenderer.prototype.highlightParagraph = function(pId) {
	//
	//this._hideHighlightNodes = null;

	// ハイライト非表示モードなら何もしません
	if (!this._show) return;

	// ハイライト済み段落があれば、クリアします
	this.clearParagraphHighlight();

	// 段落ノードを取得します
	var paraNode = document.getElementById(pId);
	if (paraNode === null) {
		console.log('指定ID(' + pId + ')の段落は見つかりませんでした。');
		return;
	};

	this._currentHtmlParagraph = paraNode;

	// 段落をハイライトします
	this._currentHtmlParagraph.style['background-color'] = ConfigManager.instance.HighlightBgColor;
};

/**
 * ハイライトされている段落があれば、解除します。
 */
HighlightRenderer.prototype.clearParagraphHighlight = function() {
	// ハイライトされている段落がなければ何もしません
	if (this._currentHtmlParagraph === null) return;

	// 段落中のハイライトを解除します
	this.clearHighlightNodes();

	// 段落のハイライトを解除します
	this._currentHtmlParagraph.style['background-color'] = 'transparent';

	// ハイライト段落情報をクリアします
	this._currentHtmlParagraph = null;
};

/**
 * ID指定されたノードをハイライトします。
 * 既にハイライトされているノードがあれば、そちらはクリアします。
 * @param nodeIdList
 */
HighlightRenderer.prototype.highlightNodes = function(nodeIdList) {
	// ノードが指定されていなければ、何もしません
	if ((nodeIdList === null) || (nodeIdList === void 0) || (nodeIdList.length === 0)) {
		// 非表示から表示に切り替えた時のためのノードリストも空なら、何もしません
		if (this._hideHighlightNodes === null) {
				return;
		}
		// 表示オンのためのリストがある場合、そこからハイライト表示を行います
		else {
			nodeIdList = this._hideHighlightNodes;
		}
	}
	else {
		// 非表示から表示に切り替えた時のためにノードをバックアップします
		this._hideHighlightNodes = nodeIdList.concat();
	}

	// ハイライト非表示モードなら何もしません
	if (!this._show) return;

	// ハイライト段落がなければ段落を先に設定します
	if (this._currentHtmlParagraph === null) {
		// ノードを取得します
		var paraNode = document.getElementById(nodeIdList[0]);
		if (paraNode === null) {
			console.log('ノード（' + nodeIdList[0] + '）は存在しません。in HighlightRenderer.');
			return;
		}

		// ノードの親を辿って、段落を取得します
		var re = /^[0-9]+$/;

		while (true) {
			var res = re.exec(paraNode.id);
			if (res) break;
			paraNode = paraNode.parentNode;
			if (paraNode === null) break;
		};

		// 段落が取得できなければ、何もしません
		if (paraNode === null) {
			console.log('指定されたノードID(' + nodeIdList[0] + ')からの段落取得に失敗しました。');
			return;
		};

		// ハイライト段落を設定します
		this.highlightParagraph(paraNode.id);
	};

	// ハイライトを解除します
	this.clearHighlightNodes();

	// ハイライト解除のためにhtmlをバックアップします
	this._backupHtml = this._currentHtmlParagraph.innerHTML;

	// 指定ノードに背景色を設定します
	var bgColor = ConfigManager.instance.HighlightForeColor;
	for (var i = 0; i < nodeIdList.length; i++) {
		var node = document.getElementById(nodeIdList[i]);
		if (node === null) continue;

		node.style['background-color'] = bgColor;
	};
};

/**
 * ハイライトされているノードがあれば、クリアします。
 */
HighlightRenderer.prototype.clearHighlightNodes = function() {
	// ハイライト段落やバックアップhtmlがなければ何もしません
	if (this._currentHtmlParagraph === null) return;
	if (this._backupHtml === null) return;

	// html を復元します
	this._currentHtmlParagraph.innerHTML = this._backupHtml;

	// バックアップを削除します
	this._backupHtml = null;
};

/**
 * 全てのハイライトを削除します。
 */
HighlightRenderer.prototype.clearAll = function() {
	this._currentHtmlParagraph = null;
	this._hideHighlightNodes = null;
	this._backupHtml = null;
};
