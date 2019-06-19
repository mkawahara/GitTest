//////////////////////////////////////////////////////////////////
// 初期化
//////////////////////////////////////////////////////////////////

/**
 * ハイライトリストクラス
 */

function HighlightList() {
	this.highlightList = [];
	this.iterator = null;		// ハイライトイテレータ。
};


HighlightList.prototype.toString = function() {
	var result = '\r\n';

	for (var i = 0; i < this.highlightList.length; i++) {
		result += (this.highlightList[i].toString() + '\r\n');
	}

	return result;
};

//////////////////////////////////////////////////////////////////
// ハイライトの登録
//////////////////////////////////////////////////////////////////

/**
 * ハイライトデータを追加します。
 * 追加されるデータは通常１段落分です。
 * 追加されたデータはセクションと段落インデックスに基づき、即時ソートされます。
 * ノードに基づいたソートは行われないため、このメソッドに渡すハイライトリストは、
 * 再生順にソートされていなくてはなりません。
 * ハイライトイテレータはよしなに更新されます。
 * @param highlightList
 */
HighlightList.prototype.append = function(highlightList) {
	console.log('HighlightList.append/ ハイライト登録');

	if (highlightList.length <= 0) return;

	// 現在のイテレータが示すハイライトへの参照を取得します
	var preIterator = (this.iterator !== null) ? this.highlightList[this.iterator] : null;
	console.log('HighlightList.append/ イテレータ参照 (append1): ' + this.iterator);

	// 同じ段落IDのデータをリストから除去します
	var paraId = highlightList[0]._paragraphId;
	console.log('HighlightList.append/ 同一段落IDのハイライト整理：' + paraId);
	this.removeHighlightById(paraId);

	// 挿入先を検索します
	// 同一段落に属するデータが複数あること、段落の数は多くても３～４程度で止めることから
	// 線形探索を行います。
	var insertTarget = 0;
	for (insertTarget = 0; insertTarget < this.highlightList.length; insertTarget++) {
		if (HighlightData.compareOrder(highlightList[0], this.highlightList[insertTarget]) < 0) break;
	}

	// 挿入を実行します
	var postArray = this.highlightList.splice(insertTarget);
	this.highlightList = this.highlightList.concat(highlightList);
	if (postArray.length > 0) this.highlightList = this.highlightList.concat(postArray);

	// イテレータ位置のデータを取得します
	var postIterator = (this.iterator !== null) ? this.highlightList[this.iterator] : null;
	console.log('HighlightList.append/ イテレータ参照 (append2): ' + this.iterator);

	// イテレータが示すハイライトが一致しなければ、イテレータを無効化します
	if (preIterator !== postIterator) {
		this.iterator = null;
		console.log('HighlightList.append/ ハイライトイテレータ更新 (append)：' + this.iterator);
	}
};

/**
 * 音声データのリクエストを発行します。
 * 再生は行われません。
 * @param endHandler	取得終了時に実行すべきハンドラ。
 * 						第一引数は接続エラーにより取得できなかったデータのある段落IDリスト、
 * 						第二引数はサーバエラーにより取得できなかったデータのある段落IDリスト。
 */
HighlightList.prototype.preload = function(endHandler) {
	console.log('HighlightList.preload/ 音声プリロード');
	var obj = this;

	// 音声データ未取得のハイライトをカウントします
	this.preloadCounter = 0;
	for (var i = 0; i < this.highlightList.length; i++) {
		if (!this.highlightList[i].hasSound) this.preloadCounter++;
	}
	console.log('HighlightList.preload/ イテレータ参照 (preload1): ' + this.iterator + ', Counter : ' + this.preloadCounter + ' / ' + this.highlightList.length);
	this.connectErrorList = [];		// 接続そのもののエラーなど
	this.noFileErrorList = [];	// 404 等、サーバ処理中のエラー

	var start = this.iterator ? this.iterator : 0;	// イテレータが無効化されている場合は、0 から開始します
	console.log('HighlightList.preload/ イテレータ参照 (preload2): ' + this.iterator);

	// 取得すべきハイライトの数
	var hilightCount = this.highlightList.length - start;
	// 再生開始するハイライトの数
	var startCount = (hilightCount > 2) ? 2 : hilightCount;
	// 再生開始するハイライト数の内、受信残量
	this.preloadCounterStart = startCount;

	// 最初の２つ分のハイライトを取得します
	for (var i = start; i < start + startCount; i++) {
		console.log('HighlightList.preload/ ハイライト音声リクエスト：' + i);
		this.highlightList[i].preload(
			// 受信成功を処理するイベントハンドラ
			function(highlight) {
				// 再生カウントが０になれば、再生を開始します
				obj.preloadCounterStart--;
				if (obj.preloadCounterStart === 0) endHandler([], []);

				obj.preloadCounter--;
				console.log('HighlightList.preload/ ハイライト音声受信 残数：' + obj.preloadCounter);
			},
			// 受信失敗を処理するイベントハンドラ
			function(highlight, reason) {
				if (reason) {
					// サーバ上で発生したエラーを登録します
					obj.noFileErrorList.push(highlight);
				} else {
					// サーバとの接続中に発生したエラーを登録します
					obj.connectErrorList.push(highlight);
				}
				obj.preloadCounter--;
				if (obj.preloadCounter === 0) obj.onErrorPreload(endHandler);
			}
		);
	};

	// ３つめ以降のハイライトを取得します
	for (var i = start + startCount; i < this.highlightList.length; i++) {
		console.log('HighlightList.preload/ ハイライト音声リクエスト：' + i);
		this.highlightList[i].preload(
			// 受信成功を処理するイベントハンドラ
			function(highlight) {
				obj.preloadCounter--;
				console.log('HighlightList.preload/ ハイライト音声受信 残数：' + obj.preloadCounter);
				if (obj.preloadCounter === 0) obj.onErrorPreload(null);
			},
			// 受信失敗を処理するイベントハンドラ
			function(highlight, reason) {
				if (reason) {
					// サーバ上で発生したエラーを登録します
					obj.noFileErrorList.push(highlight);
				} else {
					// サーバとの接続中に発生したエラーを登録します
					obj.connectErrorList.push(highlight);
				}
				obj.preloadCounter--;
				if (obj.preloadCounter === 0) obj.onErrorPreload(endHandler);
			}
		);
	};
};

/**
 * 全ての preload 終了時に実行され、指定された preload 終了ハンドラを実行します。
 * @param endHandler
 */
HighlightList.prototype.onErrorPreload = function(endHandler) {
	console.log('HighlightList.onErrorPreload/ ハイライト整理');
	var connectErrorList = HighlightList.minimizeHighlightList(this.connectErrorList);
	var noFileErrorList = HighlightList.minimizeHighlightList(this.noFileErrorList);
	if (endHandler !== null) endHandler(connectErrorList, noFileErrorList);
};

/**
 * 受け取ったハイライトデータリストから段落IDの重複を除去した段落IDリストを作成します。
 * @param list
 * @returns {Array}
 */
HighlightList.minimizeHighlightList = function(list) {
	var workingList = [];

	if (list.length <= 0) return workingList;

	workingList.push(list[0].ParagraphId);
	for (var listIdx = 1; listIdx < list.length; listIdx++) {
		var isExist = false;
		for (var workIdx = 0; workIdx < workingList.length; workIdx++) {
			if (workingList[workIdx] === list[listIdx].ParagraphId) {
				isExist = true;
				break;
			}
		}

		if (!isExist) workingList.push(list[listIdx].ParagraphId);
	}

	return workingList;
};


//////////////////////////////////////////////////////////////////
// ハイライトの取得
//////////////////////////////////////////////////////////////////

/**
 * 指定ノードを有するハイライトを取得します。
 * ノードを指定しなかった場合、登録されている最初のハイライトを取得し、
 * ハイライトイテレータを設定します。
 * 指定ノードを有するハイライトが見つからなかった場合、null を返します。
 * @param dataDom
 * @param nodeId
 */
HighlightList.prototype.getHighlight = function(dataDom, nodeId) {
	console.log('HighlightList.getHighlight/ ハイライト取得');

	// 指定ノードの系統をIDリストとして取得します
	var raceList = [];
	var jnode = $(dataDom).find('#' + nodeId);
	if (jnode.length <= 0) {
		console.log('HighlightList.getHighlight/ 読み上げ開始ノードの特定に失敗しました。');
		return null;
	}
	var node = jnode[0];

	// 段落直下に達するまでのノードの系統を取得します
	while (node !== null) {
		raceList.push(node.id);
		if (node.parentNode.nodeName === 'PARAGRAPH') break;
		node = node.parentNode;
	}


	while (node !== null) {
		// 指定ノードを有するハイライトを検索します
		for (var hidx = 0; hidx < this.highlightList.length; hidx++) {
			var nodeIdList = this.highlightList[hidx].NodeIdList;

			console.log('HighlightList.getHighlight/ 要素数：' + raceList.length + ', ' + nodeIdList.length);
			for (var nidx = 0; nidx < nodeIdList.length; nidx++) {
				for (var ridx = 0; ridx < raceList.length; ridx++) {
					if (raceList[ridx] === nodeIdList[nidx]) {
						console.log('HighlightList.getHighlight/ ハイライトイテレータ更新 (getHighlight)：' + hidx);
						this.iterator = hidx;
						return this.highlightList[hidx];
					};
				};
			};
		}

		node = node.nextSibling;
	}

	return null;
};

/**
 * 次のハイライトデータを取得します。
 * このメソッドが実行されるとハイライトイテレータが１進みます。
 * 次のデータが取得できなかった場合、null を返します。
 * getHighlight()、あるいは getNext() が成功した後でのみ実行可能です。
 */
HighlightList.prototype.getNext = function() {
	if (this.iterator === null) return null;
	console.log('次ハイライト取得');

	this.iterator++;
	console.log('ハイライトイテレータ更新 (getNext1)：' + this.iterator);

	if (this.iterator >= this.highlightList.length) {
		console.log('ハイライトイテレータ更新 (getNext2)：null');
		this.iterator = null;
		return null;
	};

	return this.highlightList[this.iterator];
};

/**
 * 前のハイライトデータを取得します。
 * このメソッドが実行されるとハイライトイテレータが１戻ります。
 * 次のデータが取得できなかった場合、null を返します。
 */
HighlightList.prototype.getFore = function() {
	if (this.iterator === null) return null;

	this.iterator--;
	console.log('ハイライトイテレータ更新 (getFore1)：' + this.iterator);

	if (this.iterator < 0) {
		console.log('ハイライトイテレータ更新 (getFore2)：null');
		this.iterator = null;
		return null;
	};

	return this.highlightList[this.iterator];
};

/**
 * 最後のハイライトデータを取得します。
 * イテレータは移動しません。
 */
HighlightList.prototype.getLast = function() {
	if (this.highlightList.length <= 0) return null;
	return this.highlightList[this.highlightList.length - 1];
};

/**
 * 未再生の段落の数を取得します。
 * ハイライトイテレータが存在する段落は含まれません。
 */
HighlightList.prototype.getRestParagraphCount = function() {
	// イテレータの示すハイライトの段落IDを取得します
	var currentParaId = this.highlightList[this.iterator];
	console.log('イテレータ参照 (getRestParagraphCount): ' + this.iterator);

	var counter = 0;

	// 段落IDの変更箇所をカウントします
	for (var i = this.iterator + 1; i < this.highlightList.length; i++) {
		if (currentParaId !== this.highlightList[i].ParagraphIndex) {
			counter++;
			currentParaId = this.highlightList[i].ParagraphIndex;
		}
	}

	return counter;
};

/**
 * 未再生のハイライトの数を取得します。
 * ハイライトイテレータが存在するハイライトは含まれません。
 */
HighlightList.prototype.getRestHighlightCount = function() {
	console.log('イテレータ参照 (getRestHighlightCount): ' + this.iterator);
	return (this.highlightList.length - this.iterator - 1);

};


//////////////////////////////////////////////////////////////////
// 不要ハイライトの削除
//////////////////////////////////////////////////////////////////

/**
 * セクションと段落インデックスで指定されたハイライトを全て削除します。
 * ハイライトイテレータはよしなに更新されます。
 * @param sectionIdx
 * @param paragraphIdx
 */
HighlightList.prototype.removeHighlight = function(sectionIdx, paragraphIdx) {
	// ★呼び出しがどこにもありません。
	console.log('removeHighlight メソッドによるハイライト整理');
	// 削除対象ハイライトデータの位置を決定します
	var start = HighlightList.findStartByIndex(this.highlightList, sectionIdx, paragraphIdx);
	// 段落IDを取得します
	var pid = this.highlightList[start].ParagraphId;

	// 段落IDで削除処理を実行します
	this.removeHighlightById(pid, start);
};

/**
 * ID指定された段落のハイライトを全て削除します。
 * ハイライトイテレータはよしなに更新されます。
 * @param paragraphId
 */
HighlightList.prototype.removeHighlightById = function(paragraphId, startPos) {
	console.log('IDによるハイライト削除');
	// 削除対象段落にハイライトイテレータがある場合、イテレータを無効化します
	console.log('イテレータ参照 (removeHighlightById1): ' + this.iterator);
	if (this.iterator !== null) {
		if (this.highlightList[this.iterator].ParagraphId === paragraphId) {
			console.log('ハイライトイテレータ更新 (removeHighlightById1)：null');
			this.iterator = null;
		}
	}

	// 削除対象ハイライトデータの位置を決定します
	var start = startPos;
	if (start === void 0) start = HighlightList.findStartByPId(this.highlightList, paragraphId);
	// 対象が検出されなければ、メソッドを終了します
	if (start < 0) return;
	// 対象個数を取得します
	var count = HighlightList.countHighlightByPId(this.highlightList, start, paragraphId);

	// ハイライトデータを削除します
	this.highlightList.splice(start, count);

	// ハイライトイテレータが削除対象より後ろにあった場合、
	// 削除されたハイライトの個数分だけ前にシフトします
	// ※削除対象範囲にあった場合は無効化済みのため、start と比較すれば、
	//   削除対象の前か後か特定できます。
	console.log('イテレータ参照 (removeHighlightById2): ' + this.iterator);
	if ((this.iterator !== null) && (this.iterator > start)) {
		this.iterator -= count;
		console.log('ハイライトイテレータ更新 (removeHighlightById2)：' + this.iterator);
	}
};

/**
 * 指定したセクションインデックスと段落インデックスを有する
 * 最初のハイライトデータの位置を取得します。
 * @param list
 * @param sectionIdx
 * @param paragraphIdx
 * @returns {Number}
 */
HighlightList.findStartByIndex = function(list, sectionIdx, paragraphIdx) {
	for (var i = 0; i < list.length; i++) {
		var highlight = list[i];
		if ((highlight.SectionIndex === sectionIdx) && (highlight.ParagraphIndex === paragraphIdx)) {
			return i;
		}
	}

	return -1;
};

/**
 * 指定した段落IDの開始位置を取得します
 * @param list
 * @param id
 * @returns {Number}
 */
HighlightList.findStartByPId = function(list, id) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].paragraphId === id) return i;
	}

	return -1;
};

/**
 * 指定した段落IDを有するハイライトがいくつあるか取得します
 * @param list
 * @param start
 * @param id
 * @returns {Number}
 */
HighlightList.countHighlightByPId = function(list, start, id) {
	var count = 1;

	for (var i = start + 1; i < list.length; i++) {
		if (list[i].paragraphId !== id) break;
		count++;
	}

	return count;
};

/**
 * 再生が完了した（ハイライトイテレータより前の）段落のハイライトを全て削除します。
 */
HighlightList.prototype.arrangeHighlight = function() {
	if (this.iterator === null) return;
	console.log('ハイライト整理');

	// イテレータのあるハイライトの段落IDを取得します
	var pid = this.highlightList[this.iterator].ParagraphId;

	// 先頭のハイライトの段落IDがイテレータのあるハイライトのそれと等しければ、何もしません
	if (pid === this.highlightList[0].ParagraphId) return;

	// 段落IDが一致しないハイライトをカウントします
	// イテレータまでのハイライトのみが対象です
	var count = 1;
	console.log('イテレータ参照 (arrangeHightlight): ' + this.iterator);
	for (var i = 1; i < this.iterator; i++) {
		if (this.highlightList[i].ParagraphId === pid) break;
		count++;
	}

	// ハイライトを削除します
	this.highlightList.splice(0, count);

	// イテレータを補正します
	this.iterator -= count;
	console.log('整理されたハイライト数：' + count);
	console.log('ハイライトイテレータ更新 (arrangeHighlight)：' + this.iterator);
};

/**
 * ハイライトを全て削除します。
 */
HighlightList.prototype.clear = function() {
	this.highlightList = [];
	this.iterator = null;
	console.log('ハイライトイテレータ更新 (clear)：' + this.iterator);
};


//////////////////////////////////////////////////////////////////
// ユーティリティ
//////////////////////////////////////////////////////////////////

/**
 * HighlightData クラスに設定するノードIDのリストを作成します。
 * ただし、開始ノードと終了ノードは共通の親ノードを持たなくてはなりません。
 * @param jdomRoot
 * @param startId
 * @param nextStartId
 */
HighlightList.getHighlightNodeList = function(jdomRoot, startId, nextStartId) {
	// jQuery を使用し、開始ノードと次のハイライト開始ノードを取得します
	var startNode = jdomRoot.find('#' + startId);
	var nextStartNode = jdomRoot.find('#' + nextStartId);

	// 開始ノードを検出できなかった場合、nullを返します
	if (startNode.length <= 0) return null;

	// 通常のノードオブジェクトを取得します
	startNode = startNode[0];
	nextStartNode = (nextStartNode.length > 0) ? nextStartNode[0] : null;

	var result = [];

	// 開始ノードから、以下の終了条件を満たすまでリストに追加します
	// [次の開始ノード、テーブル系ノード、セル・ボックスノード終端、段落終端]
	var node = startNode;
	while ( (node !== null) && (node !== nextStartNode) ) {
		var nodeName = node.nodeName.toLowerCase();
		//if ((nodeName === 'ctable') || (nodeName === 'cmat') || (nodeName === 'copen') || (nodeName === 'cclose')) break;
		if (nodeName === 'ctable') break;
		result.push(node.id);

		node = node.nextSibling;
	};

	return result;
};
