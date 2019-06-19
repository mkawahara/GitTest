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
	// 検索開始位置が指定されていなければ、検索終了とします
	if (startNode === null) {
		this.isSearched = false;
		return null;
	}

	// target から データノードとプレーンテキストを作成します
	var targetNode = $(target)[0];
	var targetText = targetNode.textContent;

	// 検索開始段落を特定します
	var startParaIndex = SearchManager._getStartParagraph(section, startNode);

	// 開始段落以降の段落の textContent を取得します
	var textList = SearchManager._getTextList(section, startParaIndex, section.children.length - 1);

	// target の textContent を含む段落リストを作成します
	textList = SearchManager._abstractTextList(textList, targetText);

	// 段落が残らなければ、null を返します
	if (textList.length <= 0) {
		// ★ここで次セクションの先頭からと設定し、再帰呼び出し。
		return this._renext(section, target, isMatchCase);
	}

	// 検索対象の先頭ノードの名称を取得します
	var targetTopName = targetNode.children[0].nodeName;

	// 開始段落において、target の第一ノードと同名のノードのリストを取得します
	var topNodeList = section.children[textList[0].index].getElementsByTagName(targetTopName);
	console.log('段落中の検索対象ノード(' + targetTopName + ')：', topNodeList);

	// 上記リストから、開始位置以降のノードのみを抽出します
	topNodeList = SearchManager._abstractNodes(topNodeList, startNode, true);
	console.log('検索開始ノード：', startNode);
	console.log('抽出後の検索対象：', topNodeList);

	// ノードリストに対し、target と一致するノードを検索します
	var matchNode = SearchManager._getFirstMatch(topNodeList, targetNode, true);

	if (matchNode === null) {
		for (var paraIndex = 1; paraIndex < textList.length; paraIndex++) {
			// 段落において、target の第一ノードと同名のノードのリストを取得します
			var topNodeList = section.children[textList[paraIndex].index].getElementsByTagName(targetTopName);

			// ノードリストに対し、target と一致するノードを検索します
			matchNode = SearchManager._getFirstMatch(topNodeList, targetNode, true);
			if (matchNode !== null) break;
		}
	}

	// 検索結果を返します
	if (matchNode !== null) {
		this.isSearched = true;
		var result = {
			section: section,
			top: matchNode.top,
			end: matchNode.end,
		};

		return result;
	} else {
		// ★ここで次セクションの先頭からと設定し、再帰呼び出し。
		var result = this._renext(section, target, isMatchCase);
		if (result === null) this.isSearched = false;
		return result;
	}
};

SearchManager.prototype._renext = function(section, target, isMatchCase) {
	// 次のセクションを取得します。最終セクションの場合、nullを返します
	var section = section.nextSibling;
	if (section === null) return null;

	// セクションの先頭データノードを取得します
	// セクションの段落が１つもない状態は想定しません
	var startNode = section.firstChild.firstChild;

	// 再帰呼び出しを行います
	return this.next(section, startNode, target, isMatchCase);
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
	// ★テスト用サンプルデータ
	//target = '<paragraph><c>a</c><c>b</c><c>c</c></paragraph>';
	//target = '<paragraph><cn nt="2">c<g><br></g><g><br></g><g><br></g><g><br></g></cn></paragraph>';

	// 検索開始位置が指定されていなければ、検索終了とします
	if (startNode === null) {
		this.isSearched = false;
		return null;
	}

	// target から データノードとプレーンテキストを作成します
	var targetNode = $(target)[0];
	var targetText = targetNode.textContent;

	// 検索開始段落を特定します
	var startParaIndex = SearchManager._getStartParagraph(section, startNode);

	// 開始段落以前の段落の textContent を取得します
	var textList = SearchManager._getTextList(section, 0, startParaIndex);

	// target の textContent を含む段落リストを作成します
	textList = SearchManager._abstractTextList(textList, targetText);

	// 段落が残らなければ、null を返します
	if (textList.length <= 0) {
		// ★ここで次セクションの終端からと設定し、再帰呼び出し。
		return this._reprev(section, target, isMatchCase);
	}

	// 検索対象の先頭ノードの名称を取得します
	var targetTopName = targetNode.children[targetNode.children.length - 1].nodeName;

	// 開始段落において、target の第一ノードと同名のノードのリストを取得します
	var topNodeList = section.children[textList[textList.length - 1].index].getElementsByTagName(targetTopName);

	// 上記リストから、開始位置以前のノードのみを抽出します
	topNodeList = SearchManager._abstractNodes(topNodeList, startNode, false);

	// ノードリストに対し、target と一致するノードを検索します
	var matchNode = SearchManager._getFirstMatch(topNodeList, targetNode, false);

	if (matchNode === null) {
		for (var paraIndex = textList.length - 2; paraIndex >= 0; paraIndex--) {
			// 段落において、target の第一ノードと同名のノードのリストを取得します
			var topNodeList = section.children[textList[paraIndex].index].getElementsByTagName(targetTopName);

			// ノードリストに対し、target と一致するノードを検索します
			matchNode = SearchManager._getFirstMatch(topNodeList, targetNode, false);
			if (matchNode !== null) break;
		}
	}

	// 検索結果を返します
	if (matchNode !== null) {
		this.isSearched = true;
		var result = {
			section: section,
			top: matchNode.top,
			end: matchNode.end,
		};

		return result;
	} else {
		// ★ここで次セクションの終端からと設定し、再帰呼び出し。
		var result = this._reprev(section, target, isMatchCase);
		if (result === null) this.isSearched = false;
		return result;
	}
};

SearchManager.prototype._reprev = function(section, target, isMatchCase) {
	// 次のセクションを取得します。最終セクションの場合、nullを返します
	var section = section.previousSibling;
	if (section === null) return null;

	// セクションの先頭データノードを取得します
	// セクションの段落が１つもない状態は想定しません
	var startNode = section.lastChild.lastChild;

	// 再帰呼び出しを行います
	return this.previous(section, startNode, target, isMatchCase);
};


///////////////////////////////////////////////////////////////////////////
// 以下、補助用プライベートメソッド
///////////////////////////////////////////////////////////////////////////


/**************************************************************************
 * 指定ノードがセクション上の何番目の段落に存在するかを取得します。
 */
SearchManager._getStartParagraph = function(section, startNode) {
	var paraNode = startNode;

	// 開始ノードの属する段落を取得します
	while(paraNode.nodeName !== 'PARAGRAPH') paraNode = paraNode.parentNode;

	// セクション中での段落番号を取得します
	return DataClass.getNodeIndex(paraNode, section.children);
};

/**************************************************************************
 * 指定セクションから、指定範囲の段落のテキストをリストで取得します。
 */
SearchManager._getTextList = function(section, start, end) {
	var textList = [];
	var isReverse = (start > end);

	// start と end の値を補正します
	if (isReverse) {
		var temp = start;
		start = end;
		end = temp;
	}

	// 不適切な範囲が指定されていた場合、null を返して終了します
	if (start < 0) return null;
	if (end >= section.children.length) return null;

	// リストを取得します
	for (var i = start; i <= end; i++) {
		var newFactor = {
			index: i,
			text: section.children[i].textContent,
		};

		textList.push(newFactor);
	};

	return textList;
};

/**************************************************************************
 * 段落をテキスト化したリストから、検索文字列を含む要素のみを取得します
 */
SearchManager._abstractTextList = function(srcList, targetText) {
	for (var i = srcList.length - 1; i >= 0; i--) {
		if (srcList[i].text.indexOf(targetText) < 0) srcList.splice(i, 1);
	}

	return srcList;
};

/**************************************************************************
 * 指定ノード以降/以前のノードのみをリストから抽出します
 * @param nodeList
 * @param startNode
 * @param getAfter	true なら以降を、false なら以前を抽出します
 */
SearchManager._abstractNodes = function(nodeList, startNode, getAfter) {
	var top = 0;
	var end = nodeList.length - 1;
	var index = 0;

	// 切替点を検出します
	/*while (top <= end) {
		index = Math.floor((top + end) / 2);

		var order = SearchManager._getOrder(nodeList[index], startNode);

		if (order === 0) break;
		if (order < 0) top = index + 1;
		if (order > 0) end = index - 1;
	};*/

	for (var i = nodeList.length - 1; i >= 0; i--) {
		var order = SearchManager._getOrder(nodeList[i], startNode);
		console.log('order is :' + order + ' / ' + i);
		if (order <= 0) {
			index = i;
			break;
		}
	};

	console.log('検索切替点は nodeList[' + index + ']: ' + nodeList[index]);

	// 切替点を含むか否かを決定します
	var order = SearchManager._getOrder(nodeList[index], startNode);

	var mes = (getAfter ? '後方検索: ' : '前方検索: ') + order;
	console.log(mes);

	if (getAfter && (order < 0)) index++;
	if (!getAfter && (order > 0)) index--;

	return SearchManager._sliceHtmlCollection(nodeList, index, getAfter);
};

/**
 * ２つのノードの位置関係を判定します。
 * 共通親ノード上での位置が node1 が先なら -1、
 * 後なら 1、同じなら 0 が取得されます。
 * @param node1
 * @param node2
 */
SearchManager._getOrder = function(node1, node2) {
	// 一致する場合は無条件で 0 とします
	if (node1 === node2) return 0;

	// 共通親ノードを取得します
	var parentNode = SearchManager._getSharedNode(node1, node2);

	// node1が共通親ノードと一致した場合、0 を返します
	if (parentNode === node1) return -1;
	// node2が共通親ノードと一致した場合、親ノード中の先頭要素を取得するためにここでは 1 を返します
	if (parentNode === node2) return 1;

	// node1の位置を取得します
	var pos1 = SearchManager._getNodeIndex(parentNode, node1);

	// node2の位置を取得します
	var pos2 = SearchManager._getNodeIndex(parentNode, node2);

	if (pos1 === pos2) return 0;
	if (pos1 < pos2) return -1;
	return 1;
};

/**
 * ２つのノードの共通ノードを取得します。
 * @param node1
 * @param node2
 * @returns
 */
SearchManager._getSharedNode = function(node1, node2) {
	var work1 = node1;
	while(work1 !== null) {
		var work2 = node2;
		while(work2 !== null) {
			if (work1 === work2) return work1;
			work2 = work2.parentNode;
		};
		work1 = work1.parentNode;
	};

	return null;
};

/**
 * 指定親ノード上での指定ノードの位置を取得します
 * （親ノードの孫などの場合、属する子ノードの位置です）
 * @param parent
 * @param node
 */
SearchManager._getNodeIndex = function(parent, node) {
	// 子ノードを取得します
	while (node.parentNode !== parent) {
		node = node.parentNode;
	}

	return DataClass.getNodeIndex(node, parent.children);
};

/**
 * 指定位置以降・以前の要素を抽出し、新しい配列を作成します
 */
SearchManager._sliceHtmlCollection = function(list, start, getAfter) {
	var result = [];

	if (getAfter) {
		for (var i = start; i < list.length ;i++) {
			result.push(list[i]);
		};
	} else {
		for (var i = 0; i <= start ;i++) {
			result.push(list[i]);
		};
	};

	return result;
};

/**************************************************************************
 * 最初にマッチするデータを検索します。
 * なければ、null を返します。
 */
SearchManager._getFirstMatch = function(nodeList, target, fromTop) {
	if (fromTop) {
		// 順方向検索
		for (var i = 0; i < nodeList.length; i++) {
			DataClass.bindDataClassMethods(target.children[0]);
			var end = target.children[0].compareWith(nodeList[i], true);

			if (end !== null) {
				var result = {
					top: nodeList[i],
					end: end,
				};
				return result;
			}
		}
	} else {
		// 逆方向検索
		for (var i = nodeList.length - 1; i >= 0; i--) {
			DataClass.bindDataClassMethods(target.children[target.children.length - 1]);
			var end = target.children[target.children.length - 1].compareWith(nodeList[i], false);

			if (end !== null) {
				var result = {
					top: end,
					end: nodeList[i],
				};
				return result;
			}
		}
	}

	return null;
};
