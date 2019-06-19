/**
 * IDManager
 * 文書中の段落および全てのデータノードに割り当てるIDを管理・提供します。
 */

/**
 * コンストラクタ
 */
function IDManager() {
	this._nextNodeId = 0;
	this._nextParagraphId = 1;
	this._nextAnimationId = 1;
};

/**
 * 使用済みの最大の段落ID を取得します。
 * ★多分使用されないため、廃止予定。
 * @returns Pを除去し、数値化された最大の使用済み段落番号
 */
IDManager.prototype.getMaxParagraphId = function() {
	return this._nextParagraphId;
};

/**
 * 割り当て済みとされる段落番号を初期化します。
 * 次回の割り当ては、指定した値の次の番号から行われます。
 * @param id
 */
IDManager.prototype.resetParagraphId = function(id) {
	this._nextParagraphId = id + 1;
};

/**
 * 割り当て済みとされるアニメーションIDを初期化します。
 * ただし、現在割り当て予定の番号より小さい値を指定された場合、更新は行われません。
 * 次回の割り当ては、指定した値の次の番号から行われます。
 * @param id
 */
IDManager.prototype.updateAnimationId = function(id) {
	if (Number(id) >= this._nextAnimationId) {
		this._nextAnimationId = id + 1;
	}
};

/**
 * 次に使用可能な段落IDを取得します。
 * @returns {String}
 */
IDManager.prototype.getNewParagraphId = function() {
	var newId = this._nextParagraphId;
	this._nextParagraphId++;

	return newId;
//	return 'P' + newId;
};

/**
 * 次に使用可能なデータノードIDを取得します。
 * @returns {String}
 */
IDManager.prototype.getNewNodeId = function() {
	var newId = this._nextNodeId;
	this._nextNodeId++;

	return 'C' + newId;
};

/**
 * 次に使用可能なアニメーションIDを取得します。
 * @returns {Number}
 */
IDManager.prototype.getNewAnimationId = function() {
	var newId = this._nextAnimationId;
	this._nextAnimationId++;

	return newId;
};
