function ReplaceData() {
	// 検索対象文字列と置換後文字列を有するdom
	this.dataDom = document.createElement('root');
};

ReplaceData._instance = null;

Object.defineProperty(ReplaceData, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ReplaceData._instance === null) ReplaceData._instance = new ReplaceData();
		return ReplaceData._instance;
	},
});

/**
 * 検索対象データと置換後データを xml 文字列で設定します。
 * 設定されたデータには段落要素が自動追加されます。
 */
ReplaceData.prototype.setData = function(targetXml, replaceXml) {
};

/**
 * 検索対象データの表示用 html 文字列を取得します
 */
ReplaceData.prototype.toTargetHtml = function() {
};

/**
 * 置換後データの表示用 html 文字列を取得します
 */
ReplaceData.prototype.toReplaceHtml = function() {
};

