//////////////////////////////////////////////////////////////////
// 初期化
//////////////////////////////////////////////////////////////////

/**
 * ハイライトデータ管理クラス
 */

function HighlightData(secIdx, paraIdx, paraId, idList, audio_id) {
	// セクションインデックス
	this._sectionIndex = secIdx;

	// 段落インデックス（IDとは異なる。再生順ソートのため、セクション上での順番が必要）
	this._paragraphIndex = paraIdx;

	// 段落ID
	this._paragraphId = paraId;

	// ハイライト対象ノードのIDリスト
	this._nodeIdList = idList;

	// ハイライトに対応する音声ファイルのURL
	this._soundId = audio_id;

	// ハイライトに対応する音声データ
	// nullの場合、再生指示においてはXHRでデータを取得してから再生実行します
	this._soundData = null;

	// 音声再生に使用する<AUDIO>要素
	this.audioElement = null;


	// 空段落用ハイライトか否か
	this._isEmptyHighlight = (audio_id === null);

	// 空段落用無音時間
	this.EMPTY_DURATION = 800;

	// 空段落用無音時間タイマーID
	this._emptyTimerID = null;
};

HighlightData.prototype.toString = function() {
	if (this._nodeIdList.length <= 0) {
		return ('●SID: ' + this._sectionIndex + ', PID: ' + this._paragraphId + ', Node count: ' + this._nodeIdList.length);
	}
	else {
		var ids = [];
		for (var i = 0; i < this._nodeIdList.length; i++) ids += (this._nodeIdList[i] + ', ');
		return ('●SID: ' + this._sectionIndex + ', PID: ' + this._paragraphId + ', NID: ' + ids);
	}
};

/**
 * キャッシュのため、サーバに一度、リクエストを発行します。
 * @param successHandler	成功時に実行されるコールバック関数
 * @param errorHandler		音声取得エラー時に実行されるコールバック関数 (ハイライトデータを引数とします)
 */
HighlightData.prototype.preload = function(successHandler, errorHandler) {
	// 空段落の場合、キャンセルされます
	if (this._isEmptyHighlight) return;

	// 既に取得済みであれば、preload はキャンセルされます
	if (this._soundData !== null) {
		console.log('HighlightData.preload/ ハイライト音声リクエストキャンセル: ' + this._soundData.substr(0, 20));
		return;
	}

	var obj = this;
	var xhr = new XMLHttpRequest();

	// XHR の responseType を設定し、その結果を基にIEか否か判断します
	var isIE = !HighlightData.setResponseType(xhr);

	var url = Communicator.getUrl('audio') + '?audio_id=' + this._soundId;
	xhr.open('GET', url);
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

	// 受信時の処理を定義します
	xhr.onload = function(data) {
		// ステータスが 400 以上であれば、エラーです
		if (data.target.status >= 400) {
			errorHandler(obj, true);
			return;
		}

		// レスポンスを取得します
		obj._soundData = data.target.response;
		if (isIE) obj._soundData = VBArray(data.target.responseBody).toArray();

		// Base64 文字列として記録します
		obj._soundData = 'data:audio/mpeg;base64,' + HighlightData.convertArrayBufferToBase64(obj._soundData);

		// 成功通知ハンドラを実行します
		successHandler(obj);
	};
	xhr.onerror = function(data) {
		// その他のエラーです
		errorHandler(obj, false);
	};

	xhr.send(null);
};

/**
 * XHR に responseType を設定します。成功時はtrueを返します
 * @param xhr
 * @returns {Boolean}
 */
HighlightData.setResponseType = function(xhr) {
	try {
		xhr.responseType = 'arraybuffer';
		return true;
	} catch(e){
		return false;
	}
};


//////////////////////////////////////////////////////////////////
// 再生
//////////////////////////////////////////////////////////////////

/**
 * 音声を再生します。<AUDIO>要素は内部で自動的に用意されます。
 * @param onStop		再生終了時に実行されるコールバック関数
 * @param onError		再生エラー時に実行されるコールバック関数
 * @param onErrorXhr	データリクエストエラー時に実行されるコールバック関数
 */
HighlightData.prototype.play = function(onStop, onError, onErrorXhr) {
	if (this._isEmptyHighlight) {
		console.log('HighlightData.play/ 空段落の無音開始');
		this._emptyTimerID = setTimeout(onStop, this.EMPTY_DURATION);
		return;
	}

	console.log('HighlightData.play/ 再生開始');

	var obj = this;

	// <AUDIO>要素を作成します。1KB強のメモリを消費します
	if (this.audioElement === null) this.audioElement = HighlightData.createAudioElement(this, onStop, onError);
	/*if (this.audioElement === null) this.audioElement = new Audio();

	// イベントハンドラを設定します
	this.audioElement.onended = function(event) { obj.onEnd(onStop); }
	this.audioElement.onerror = onError;*/

	// 音声データの再生を開始します
	if (this._soundData !== null) {
		this.audioElement.src = this._soundData;
		this.audioElement.play();
	}
	// 音声データがない場合は
	// XHR でリクエストを発行し、受信後に再生を開始します
	else {
		var xhr = new XMLHttpRequest();

		// XHR の responseType を設定し、その結果を基にIEか否か判断します
		var isIE = !HighlightData.setResponseType(xhr);

		var url = Communicator.getUrl('audio') + '?audio_id=' + this._soundId;
		xhr.open('GET', url);

		// 受信時の処理を定義します
		xhr.onload = function(data) {
			// ステータスが 400 以上であれば、エラーです
			if (data.target.status >= 400) {
				onErrorXhr(obj, true);
				return;
			}

			// レスポンスを取得します
			var audioData = data.target.response;
			if (isIE) audioData = VBArray(data.target.responseBody).toArray();

			// データをBase64に変換、設定して、再生を開始します
			if (obj.audioElement === null) obj.audioElement = HighlightData.createAudioElement(obj, onStop, onError);
			obj.audioElement.src = 'data:audio/mpeg;base64,' + HighlightData.convertArrayBufferToBase64(audioData);
			obj.audioElement.play();
		};
		xhr.onerror = function(data) {
			// その他のエラーです
			onErrorXhr(obj, false);
		};

		xhr.send(null);
	}
};

HighlightData.createAudioElement = function(obj, onstop, onerror) {
	// <AUDIO>要素を作成します。1KB強のメモリを消費します
	var audioElement = new Audio();

	// イベントハンドラを設定します
	audioElement.onended = function(event) { obj.onEnd(onstop); }
	audioElement.onerror = onerror;

	return audioElement;
};

/**
 * 再生終了時に自動実行されるイベントハンドラ。
 * 再生が終了すると、再び preload を実行するまで、音声データは削除されます。
 * @param onStop
 */
HighlightData.prototype.onEnd = function(onStop) {
	//this._soundData = null; // ★段落ハイライトごと削除するまで、音声は削除しません
	onStop();
};

/**
 * 再生を停止します。
 * 同時に、再生時に関連づけられた<AUDIO>要素を解除します。
 */
HighlightData.prototype.stop = function() {
	// 空段落の場合、無音待機のタイマーを停止します
	if (this._isEmptyHighlight) {
		clearTimeout(this._emptyTimerID);
		return;
	}

	// 通常ハイライトの場合、audio 要素を停止します
	if (this.audioElement !== null) this.audioElement.pause();
	this.audioElement = null;
};


//////////////////////////////////////////////////////////////////
// ソート
//////////////////////////////////////////////////////////////////

/**
 * ２つの HighlightData の大小関係を決定します。ソート用。
 * -1 ならa,b、1ならb,a、0は等価。
 * @param a
 * @param b
 */
HighlightData.compareOrder = function(a, b) {
	if (a.SectionIndex < b.SectionIndex) return -1;
	if (a.SectionIndex > b.SectionIndex) return 1;

	if (a.ParagraphIndex < b.ParagraphIndex) return -1;
	if (a.ParagraphIndex > b.ParagraphIndex) return 1;

	return 0;
};


//////////////////////////////////////////////////////////////////
// プロパティ
//////////////////////////////////////////////////////////////////

Object.defineProperty(HighlightData.prototype, 'SectionIndex', {
	enumerable: true,
	configurable: true,
	get: function(){ return this._sectionIndex; },
});

Object.defineProperty(HighlightData.prototype, 'ParagraphIndex', {
	enumerable: true,
	configurable: true,
	get: function(){ return this._paragraphIndex; },
});

Object.defineProperty(HighlightData.prototype, 'ParagraphId', {
	enumerable: true,
	configurable: true,
	get: function(){ return this._paragraphId; },
});

Object.defineProperty(HighlightData.prototype, 'NodeIdList', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this._nodeIdList;
	},
});

Object.defineProperty(HighlightData.prototype, 'SoundId', {
	enumerable: true,
	configurable: true,
	get: function(){ return this._soundId; },
});

Object.defineProperty(HighlightData.prototype, 'hasSound', {
	enumerable: true,
	configurable: true,
	get: function(){ return (this._soundData !== null); },
});


//////////////////////////////////////////////////////////////////
// ユーティリティ
//////////////////////////////////////////////////////////////////

/**
 * ArrayBuffer を Base64 変換した文字列を取得します
 * @param src
 * @returns {String}
 */
HighlightData.convertArrayBufferToBase64 = function(src) {
	var dic = [
		'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
		'Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f',
		'g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v',
		'w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/'
	];
	var base64 = '';

	var ary_u8 = new Uint8Array(src);

	var length = ary_u8.length;
	var n = 0;
	var b = 0;

	var i = 0;
	while (i < length) {
		b = ary_u8[i];
		base64 += dic[(b >> 2)];
		n = (b & 0x03) << 4;
		i ++;
		if (i >= length) break;

		b = ary_u8[i];
		base64 += dic[n | (b >> 4)];
		n = (b & 0x0f) << 2;
		i ++;
		if (i >= length) break;

		b = ary_u8[i];
		base64 += dic[n | (b >> 6)];
		base64 += dic[(b & 0x3f)];
		i ++;
	}

	var m = length % 3;
	if (m) {
		base64 += dic[n];
	}
	if (m == 1) {
		base64 += '==';
	} else if (m == 2) {
		base64 += '=';
	}

	return base64;
}

/**
 * 新しいハイライトデータを作成します
 * @param targetJson
 * @param nextJson
 * @param jdataDom
 * @returns
 */
HighlightData.createFrom = function(targetJson, nextJson, jdataDom) {
	// 開始ノードを取得します
	var node = jdataDom.find('#' + targetJson.first_id);
	if (node.length <= 0) return null;
	node = node[0];

	// セクションと段落ノードを取得します
	var paraNode = DataClass.getRootParagraph(node);
	var secNode = paraNode.parentNode;

	// それぞれのインデックスを取得します
	var paraIdx = DataClass.getNodeIndex(paraNode, secNode.children);
	var secIdx = DataClass.getNodeIndex(secNode, secNode.parentNode.children);

	// ハイライトのノードIDリストを取得します
	var nextId = (nextJson !== null) ? nextJson.first_id : null;
	var idList = HighlightList.getHighlightNodeList(jdataDom, targetJson.first_id, nextId);

	// 新しい HighlightData を作成します
	return new HighlightData(secIdx, paraIdx, paraNode.id, idList, targetJson.audio_id)
};

/**
 * 新しい空段落用ハイライトデータを作成します
 * @param targetNode	空段落の唯一の改行ノードへの参照
 * @param count			連続する空段落の個数★未使用だが、空段落数に無音時間が比例する場合は必要
 * @returns
 */
HighlightData.createEmpty = function(targetNode, count) {
	// セクションと段落ノードを取得します
	var paraNode = DataClass.getRootParagraph(targetNode);
	var secNode = paraNode.parentNode;

	// それぞれのインデックスを取得します
	var paraIdx = DataClass.getNodeIndex(paraNode, secNode.children);
	var secIdx = DataClass.getNodeIndex(secNode, secNode.parentNode.children);

	// ハイライトのノードIDリストを取得します
	var idList = [targetNode.id];

	// 新しい HighlightData を作成します
	return new HighlightData(secIdx, paraIdx, paraNode.id, idList, null)
};
