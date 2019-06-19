/**
 * 検索機能を提供するクラスです。
 */

function SearchManager() {
	// 検索実行直後か否かを保持するためのフラグです。
	this.isSearched = false;
};

SearchManager._instance = null;

Object.defineProperty(SearchManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (SearchManager._instance === null) SearchManager._instance = new SearchManager();
		return SearchManager._instance;
	},
});

Object.defineProperty(SearchManager.prototype, 'IsSearched', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.isSearched; },
	set: function() { this.isSearched = false; },	// 書き換えでは強制的に false が設定されます
});


///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 次のデータを検索します。
 * 戻り値は検索結果範囲の開始位置と終了位置になります。
 * データが見つからなければ、null を返します。
 * @param section		検索対象セクション インスタンス
 * @param startNode		検索開始位置のノード インスタンス
 * @param target		検索対象ノードの xml (段落付き)
 */
SearchManager.prototype.next = function(section, startNode, target, isMatchCase) {
	return null;
};

SearchManager.prototype._renext = function(section, target, isMatchCase) {
	return null;
};


///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 前のデータを検索します
 * @param section		検索対象セクション インスタンス
 * @param startNode		検索開始位置のノード インスタンス
 * @param target		検索対象ノードの xml (段落付き)
 */
SearchManager.prototype.previous = function(section, startNode, target, isMatchCase) {
	return null;
};

SearchManager.prototype._reprev = function(section, target, isMatchCase) {
	return null;
};
