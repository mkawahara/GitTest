/**
 * レイアウト要素・単文字要素に共通の基本クラスの定義
 *
 * 主に、キー操作によるカーソル移動のためのメソッドが定義されています。
 */

function LayoutBaseClass() {};

LayoutBaseClass.prototype = Object.create(HTMLUnknownElement.prototype);


/////////////////////////////////////////////////////////////////////
// 自身を起点とする移動処理メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 兄要素の最後の要素を次のカーソル位置として返します。
 */
LayoutBaseClass.prototype.shiftLeft = function() {
	var node = this.previousSibling;

	if (node !== null) {
		DataClass.bindDataClassMethods(node);
		return node.shiftLastFromNext();
	} else {
		var parent = this.parentElement;
		DataClass.bindDataClassMethods(parent);
		return parent.shiftLeftFromChild();
	}
};

/**
 * 弟要素を次のカーソル位置として返します。
 */
LayoutBaseClass.prototype.shiftRight = function() {
	var node = this.nextSibling;

	if (node !== null) {
		return node.id;
	} else {
		var parent = this.parentElement;
		DataClass.bindDataClassMethods(parent);
		return parent.shiftRightFromChild();
	}
};

/**
 * 兄要素の上付き添え字を次のカーソル位置として取得します。
 */
LayoutBaseClass.prototype.shiftUp = function() {
	var node = this.previousSibling

	if (node !== null) {
		DataClass.bindDataClassMethods(node);
		return node.shiftUpFromNext();
	} else {
		var parent = this.parentElement;
		DataClass.bindDataClassMethods(parent);
		return parent.shiftUpFromChild();
	}
};

/**
 * 兄要素の下付き添え字を次のカーソル位置として取得します。
 */
LayoutBaseClass.prototype.shiftDown = function() {
	var node = this.previousSibling

	if (node !== null) {
		DataClass.bindDataClassMethods(node);
		return node.shiftDownFromNext();
	} else {
		var parent = this.parentElement;
		DataClass.bindDataClassMethods(parent);
		return parent.shiftDownFromChild();
	}
};

/**
 * Enterによる移動先を次のカーソル位置として取得します。
 */
LayoutBaseClass.prototype.shiftByEnter = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftByEnterFromChild();
};

/**
 * Escによる移動先を次のカーソル位置として取得します。
 */
LayoutBaseClass.prototype.shiftByEsc = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftByEscFromChild();
};

/**
 * Homeによる移動先を次のカーソル位置として取得します。
 */
LayoutBaseClass.prototype.shiftHome = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

/**
 * Endによる移動先を次のカーソル位置として取得します。
 */
LayoutBaseClass.prototype.shiftEnd = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

// ここに属するメソッドは原則オーバーライドが必要です。

LayoutBaseClass.prototype.shiftLeftFromChild = function(childId) {
	throw this.nodeName + 'に shiftLeftFromChild メソッドが実装されていません。in LayoutBase.js';
};

LayoutBaseClass.prototype.shiftRightFromChild = function(childId) {
	throw this.nodeName + 'に shiftRightFromChild メソッドが実装されていません。in LayoutBase.js';
};

LayoutBaseClass.prototype.shiftUpFromChild = function(childId) {
	throw this.nodeName + 'に shiftUpFromChild メソッドが実装されていません。in LayoutBase.js';
};

LayoutBaseClass.prototype.shiftDownFromChild = function(childId) {
	throw this.nodeName + 'に shiftDownFromChild メソッドが実装されていません。in LayoutBase.js';
};

LayoutBaseClass.prototype.shiftByEnterFromChild = function(childId) {
	throw this.nodeName + 'に shiftByEnterFromChild メソッドが実装されていません。in LayoutBase.js';
};

/* 子要素からオブジェクトのID を取得してしまえば済むため、廃止。
LayoutBaseClass.prototype.shiftByEscFromChild = function() {
};
*/

LayoutBaseClass.prototype.shiftHomeFromChild = function() {
	throw this.nodeName + 'に shiftHomeFromChild メソッドが実装されていません。in LayoutBase.js';
};

LayoutBaseClass.prototype.shiftEndFromChild = function() {
	throw this.nodeName + 'に shiftEndFromChild メソッドが実装されていません。in LayoutBase.js';
};


/////////////////////////////////////////////////////////////////////
// 親要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

// 該当メソッドは存在しません。


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

//ここに属するメソッドは原則オーバーライドが必要です。

LayoutBaseClass.prototype.shiftUpFromNext = function() {
	throw this.nodeName + 'に shiftUpFromNext メソッドが実装されていません。in LayoutBase.js';
};

LayoutBaseClass.prototype.shiftDownFromNext = function() {
	throw this.nodeName + 'に shiftDownFromNext メソッドが実装されていません。in LayoutBase.js';
};

// このメソッドは必要な場合のみオーバーライドしてください。
LayoutBaseClass.prototype.shiftLastFromNext = function() {
	return this.id;
};


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/**
 * 子孫も含む、終端要素を返します。
 */
LayoutBaseClass.prototype.getLastOffspring = function() {
	// 子を持たなければ、自分自身を返します
	if (this.children.length === 0) return this;

	// 自身の最後の子を取得します
	var lastChild = this.lastChild;
	DataClass.bindDataClassMethods(lastChild);

	// 自身の子のメソッドを再帰呼び出しします
	return lastChild.getLastOffspring();
};


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// ここから、カーソル移動以外のメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 数式および下線を表す中間タグ文字列を生成します。
 * @param addStr	mathタグに付加したい追加文字列です (文字列)
 */
LayoutBaseClass.prototype.createMathTag = function() {
	var startTag = '';
	var endTag = '';

	// 化学式モードか否かで、出力する中間 math タグを切り替えます
	if (this.nt == CIO_XML_TYPE.chemical) {
		startTag = '<cmath>';
		endTag = '</cmath>';
	} else {
		startTag = '<mmath>';
		endTag = '</mmath>';
	}

	// 下線が設定されていれば、対応する中間タグを追加します
	if (this.uline) {
		startTag = '<uline>' + startTag;
		endTag += '</uline>';
	}

	// 数式番号が設定されていれば、対応する中間タグを追加します
	if (this.eqnumber) {
		startTag = '<eqnumber>' + startTag;
		endTag += '</eqnumber>';
	}

	return { 'start': startTag, 'end': endTag, };
};


/////////////////////////////////////////////////////////////////////
// 範囲選択用メソッド
/////////////////////////////////////////////////////////////////////

// ---- node[] 指定された２つのノードを基準として、選択されるべきノードのリストを取得します。
// テーブル、行列以外のレイアウト系要素の場合、レイアウト要素そのものが取得される。
LayoutBaseClass.prototype.getSelectedNodeList = function(start, end) {
	// 例外をはくか、もしくはオーバーライド：基本不要なメソッド
	return [this];
};



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変換情報を取得
// クラスによっては、必要に応じて新しいインスタンスを作る必要があります。
// その場合は、クラスごとにメソッドを上書きしてください。
LayoutBaseClass.prototype.getConvertedNodeInfo = function(inputMode) {

	var result = this.getDefaultNodeInfo(inputMode);
	// ---- テキスト指定で、子孫を含めてのテキスト変換が許可されていないなら、return
	if (inputMode == CIO_XML_TYPE.text && !this.convertibleToText) return result;
	// ---- 数式・化学式指定で、子孫を含めての数式・化学式変換が許可されていないなら、return
	if (inputMode != CIO_XML_TYPE.text && !this.convertibleToMath) return result;

	// ---- 上記チェックを抜けたなら、 nt 属性の伝搬は可能
	this.propageteNt = true;

	// ---- テキスト指定時の動作
	if (inputMode == CIO_XML_TYPE.text) {   // ---- テキスト指定にて
		if (!this.hasTextMode) {                    // ---- 自身がテキストになれないのなら
			result = this.AltNodeForText(result, inputMode);     // cn → c 以外では、return result で良い。
		} else {                                    // ---- 自身がテキストになることが可能なら
			result.convertedNtList = [CIO_XML_TYPE.text]; // テキスト属性設定
		}
		result = this.convertNodeNt(result, inputMode); // 子孫要素の、nt 記録
	}

	// ---- 数式・化学式指定時の動作
	if (inputMode != CIO_XML_TYPE.text) {   // ---- 数式・化学式指定にて
		if (!this.hasMathMode) {                    // ---- 自身が数式・化学式になれないのなら
			result = this.AltNodeForMath(result, inputMode);     // c → cn 以外では、return result で良い。
		} else {                                    // ---- 自身が数式・化学式になれるのなら
			result.convertedNtList = [inputMode]; // 数式・化学式属性設定
		}
		result = this.convertNodeNt(result, inputMode); // 子孫要素の、nt 記録
	}

	return result;
};

LayoutBaseClass.prototype.AltNodeForText = function(result, inputMode) {
	return result;
};

LayoutBaseClass.prototype.AltNodeForMath = function(result, inputMode) {
	return result;
};

LayoutBaseClass.prototype.getDefaultNodeInfo = function(inputMode) {
	DataClass.bindDataClassMethods(this);
	var result = {};
	result.originalNodeList  = [this];
	result.originalNtList    = [this.nt];
	result.convertedNodeList = [this];
	result.convertedNtList   = [this.nt];
	return result;
};

// ---- 子要素の変換リストを作成
LayoutBaseClass.prototype.convertNodeNt = function(result, inputMode) {
	var children = this.children;             // テキストノードは、 children には含まれません。
	var childCount = children.length;         // LayoutBaseClass が持つ g の数は、クラスによって異なります。
	for (var i = 0; i < childCount; i++) {
		var localChild = children[i];
		DataClass.bindDataClassMethods(localChild); // doop
		// ---- 変換実行
		var localInfo = localChild.getConvertedNodeInfo(inputMode);
		if (localInfo === void 0) {
			var debugPoint = 1;
		}

		// ---- 元のノードと nt 属性を記録
		result.originalNodeList = result.originalNodeList.concat(localInfo.originalNodeList);
		result.originalNtList   = result.originalNtList.concat(localInfo.originalNtList);
		// ---- 変換後のノードと nt 属性を記録
		result.convertedNodeList = result.convertedNodeList.concat(localInfo.convertedNodeList);
		result.convertedNtList   = result.convertedNtList.concat(localInfo.convertedNtList);
	}
	return result;
};

// ---- nt の変更を許可するか
LayoutBaseClass.prototype.ntCheck = function(value) {
	var changeFlag = false
	if (value == CIO_XML_TYPE.text) {
		if (this.hasTextMode) changeFlag = true;
	} else {
		if (this.hasMathMode) changeFlag = true;
	}
	return changeFlag;
};

// ---- モード変更制限: この既定値は、分数用
LayoutBaseClass.prototype.convertibleToText = false; // 子孫を含めてのテキストモードへの変換は可能か？
LayoutBaseClass.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
LayoutBaseClass.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
LayoutBaseClass.prototype.hasMathMode       = true;  // 自身が数式・化学式モードを持つことは可能か？
LayoutBaseClass.prototype.propageteNt       = false; // nt 変更を子孫に伝搬させるか



/////////////////////////////////////////////////////////////////////
// 話者設定メソッド
/////////////////////////////////////////////////////////////////////

// ---- 自身を含む、子孫の話者情報を返します。
LayoutBaseClass.prototype.getSpeakerList = function(speakerIdx, headFlag) {
	if (headFlag === void 0) headFlag = false;
//	DataClass.bindDataClassMethods(this);
	var beforeSpk = this.speaker;
	var afterSpk  = beforeSpk;

	if (!headFlag) { // もし、まだ headFlag が false なら
		// 親が text グループ、もしくは matrix cell なら有効
		var parentNode = this.parentNode;
		if (parentNode.nt == CIO_XML_TYPE.text || parentNode.nodeName == 'CMATCELL') {
			afterSpk = speakerIdx; // 話者変更
		}
	} else {         // ---- すでに話者変更が起きているなら
		afterSpk = null; // 子孫の話者は削除する
	}

	var retArray = [];  // 返値用配列
	if (this.mutableSpeaker && beforeSpk != afterSpk) { // もし、値の変更が必要なら
		retArray = [ {node : this, beforeSpk : beforeSpk, afterSpk : afterSpk} ]; // 自身を話者情報配列へ入れる
		headFlag = true; // 最初の変更が行われたことを示す。
	}

	var childCount = this.children.length;
	for (var i = 0; i < childCount; i++) {
		var localChild = this.children[i];
		DataClass.bindDataClassMethods(localChild);
		var localRetArray = localChild.getSpeakerList(speakerIdx, headFlag);
		retArray = retArray.concat(localRetArray); // 子孫のリストを、返値用配列へ接続する
	}
	return retArray;
};

LayoutBaseClass.prototype.mutableSpeaker = true; // table は、false にすること

// ---- 同じ話者を持つ兄弟のノードリストを返します。
LayoutBaseClass.prototype.getSameSpeakerSliblings = function() {
//	DataClass.bindDataClassMethods(this);
	var baseSpeaker = this.speaker;
	if (baseSpeaker === null) return null;
	var baseNode = this;

	// ---- 兄方向
	var previousList = [];
	while (baseNode.speaker == baseSpeaker) {
		previousList.push(baseNode);
		baseNode = baseNode.previousSibling;
		if (baseNode === null) break;
		DataClass.bindDataClassMethods(baseNode);
	}

	// --- 弟方向
	var nextList = [];
	baseNode = this.nextSibling;
	if (baseNode !== null) {
		while (baseNode.speaker == baseSpeaker) {
			nextList.push(baseNode);
			baseNode = baseNode.nextSibling;
			if (baseNode === null || baseNode.nodeName == 'BR') break;
			DataClass.bindDataClassMethods(baseNode);
		}
	}

	// ---- 最終的なノードリスト生成
	var filnalList = [];
	var previousCount = previousList.length;
	for (var prevIdx = previousCount - 1; prevIdx >= 0; prevIdx--) {
		filnalList.push(previousList[prevIdx]);
	}
	var nextCount = nextList.length;
	for (var nextIdx = 0; nextIdx < nextCount; nextIdx++) {
		filnalList.push(nextList[nextIdx]);
	}

	return filnalList;
};



/////////////////////////////////////////////////////////////////////
// 無音範囲設定メソッド
/////////////////////////////////////////////////////////////////////
LayoutBaseClass.prototype.getSilenceList = function(silenceFlag, headFlag) {
	if (silenceFlag === void 0) silenceFlag = null;
	if (headFlag    === void 0) headFlag    = false;
	var beforeSilence = this.silence;
	var afterSilence  = false;

	var retArray = [];  // 返値用配列
	if (this.mutableSilence) {    // ---- 無音設定の変更が可能な要素なら
		var parentNode = this.parentNode; // 親が text グループ、もしくは matrix cell なら有効なノード
		var isCorrectParent = (parentNode.nt == CIO_XML_TYPE.text || parentNode.nodeName == 'CMATCELL');
		if (silenceFlag !== null && !headFlag && isCorrectParent)   {
			// ---- 無音設定を変更するなら && まだ headFlag が false なら && 親が有効なら
			afterSilence = silenceFlag;           // 無音設定変更
			headFlag = true;                      // 無音設定の変更を記録
			if (beforeSilence != afterSilence) {  // ---- もし、値の変更が必要なら
				retArray = [ {node : this, beforeSilence : beforeSilence, afterSilence : afterSilence} ];
			}
		} else {                          // ---- 現状の無音設定リストを取得するだけなら
			if (isCorrectParent) {                // ---- 無音設定が有効なノードなら
				retArray = [ {node : this, beforeSilence : beforeSilence, afterSilence : afterSilence} ];
			}
		}
	}

	// ---- 現状の無音設定リストを取得します。
	var childCount = this.children.length;
	for (var i = 0; i < childCount; i++) {
		var localChild = this.children[i];
		DataClass.bindDataClassMethods(localChild);
		var localRetArray = localChild.getSilenceList(silenceFlag, headFlag);
		retArray = retArray.concat(localRetArray); // 子孫のリストを、返値用配列へ接続する
	}
	return retArray;
};

LayoutBaseClass.prototype.mutableSilence = true; // Table は false


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * nt プロパティ
 */
Object.defineProperty(LayoutBaseClass.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){
		var nodeType = this.getAttribute('nt');
		return nodeType ? Number(nodeType) : CIO_XML_TYPE.math;
	},
	set: function(value) {
		// ---- 自身の nt 変更処理
		var changeFlag = this.ntCheck(value);
		if (changeFlag) this.setAttribute('nt', value);

		// ---- 子孫要素の nt 変更処理
		if (this.propageteNt) {
			this.setAttribute('nt', value);
			var children   = this.children;
			var childCount = children.length;
			for (var i = 0; i < childCount; i++) {
				var localNode = children[i];
				DataClass.bindDataClassMethods(localNode); // doop
				localNode.nt = value;
			}
		}
	},
});

/**
* uline プロパティ：読み書き可
*/
Object.defineProperty(LayoutBaseClass.prototype, 'uline', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('uline') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('uline', true);
		} else {
			this.removeAttribute('uline');
		}
	},
});

/**
 * ital プロパティ：読み書き可
 */
Object.defineProperty(LayoutBaseClass.prototype, 'ital', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('ital') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('ital', true);
		} else {
			this.removeAttribute('ital');
		}
	},
});

/**
 * ut プロパティ：読み書き可
 * 立体設定。アルファベットを立体にしたい時に指定する。省略可。
 */
Object.defineProperty(LayoutBaseClass.prototype, 'ut', {
	enumerable  : true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){ },
});

/**
 * bold プロパティ：読み書き可
 */
Object.defineProperty(LayoutBaseClass.prototype, 'bold', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('bold') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('bold', true);
		} else {
			this.removeAttribute('bold');
		}
	},
});

/**
 * font プロパティ：読み書き可
 */
Object.defineProperty(LayoutBaseClass.prototype, 'font', {
	enumerable: true,
	configurable: true,
	get: function(){ return false; },
	set: function(value){ },
});




/**
 * silence プロパティ：読み書き可
 */
Object.defineProperty(LayoutBaseClass.prototype, 'silence', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('silence') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('silence', true);
		} else {
			this.removeAttribute('silence');
		}
	},
});

// ------------- 打消線属性を有効/無効化します。
Object.defineProperty(LayoutBaseClass.prototype, 'strk', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('strk') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('strk', true);
		} else {
			this.removeAttribute('strk');
		}
	},
});

// ------------- 上付き属性を有効/無効化します。
Object.defineProperty(LayoutBaseClass.prototype, 'sup', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('sup') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('sup', true);
		} else {
			this.removeAttribute('sup');
		}
	},
});

// ------------- 下付き属性を有効/無効化します。
Object.defineProperty(LayoutBaseClass.prototype, 'sub', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('sub') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('sub', true);
		} else {
			this.removeAttribute('sub');
		}
	},
});

/**
 * 数式属性を扱うプロパティ
 */
Object.defineProperty(LayoutBaseClass.prototype, 'eqnumber', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('eqnumber') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('eqnumber', true);
		} else {
			this.removeAttribute('eqnumber');
		}
	},
});

/**
 * speaker プロパティ：読み書き可
 */
Object.defineProperty(LayoutBaseClass.prototype, 'speaker', {
	enumerable: true,
	configurable: true,
	get: function(){
		var spNumber = this.getAttribute('speaker');
		if (spNumber !== null) spNumber = Number(spNumber);
		return spNumber;
	},
	set: function(spNumber){
		if (spNumber !== null) {
			this.setAttribute('speaker', spNumber);
		} else {
			this.removeAttribute('speaker');
		}
	},
});
