function ReadManager() {
	// ハイライトリスト
	this._highlightList = null
	// カレントハイライト
	this._currentHighlight = null;
	// 読み上げモードか否か
	this._isReadingMode = false;
	// ハイライトのオンオフ
	this._showHighlight = true;
	// 読み上げ開始ノードID
	this._startNodeId = null;
	// 最後にハイライト情報をリクエストした段落ID
	// ※これを使用することにより、ハイライト取得に失敗した段落があると、そこで読み上げが停止します
	//this._lastRequestParaId = null;
	// 最後にハイライト情報をリクエストした段落ID２つ分のリスト
	this._lastRequestParaIdList = [];
	// レスポンス待ちリクエストのIDリスト
	this._waitForResponseList = [];

	// ハイライトレンダラー
	this._highlightRenderer = new HighlightRenderer();

	// 使用可否：データ変換サーバに辞書登録できなかった場合、false となり、リロードまで変更されません
	this._enable = null;
};

//////////////////////////////////////////////////////////////////////////
// シングルトン

ReadManager._instance = null;

Object.defineProperty(ReadManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ReadManager._instance === null) ReadManager._instance = new ReadManager();
		return ReadManager._instance;
	},
	});


//////////////////////////////////////////////////////////////////////////
// プロパティ
//////////////////////////////////////////////////////////////////////////

Object.defineProperty(ReadManager.prototype, 'readingMode', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this._isReadingMode;
	},
	set: function(value) {
		if (value) {
			// 読み上げモードを設定します
			if (this._isReadingMode) return;
			this._highlightList = new HighlightList();
			this._isReadingMode = true;

		} else {
			// 読み上げモードを解除します
			this.stopReading();
			this._highlightRenderer.clearAll();
			this._highlightList = null;
			this._isReadingMode = false;
		}
	},
});

Object.defineProperty(ReadManager.prototype, 'isReading', {
	enumerable: true,
	configurable: true,
	get: function(){
		return (this._currentHighlight !== null);
	},
});

Object.defineProperty(ReadManager.prototype, 'showHighlight', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this._showHighlight;
	},
	set: function(value) {
		this._showHighlight = value;
		this._highlightRenderer.show = value;

		if (value) {
			// ハイライトを表示します
			this._highlightRenderer.highlightNodes();
		} else {
			// 表示中のハイライトを削除します
			this._highlightRenderer.clearParagraphHighlight();
		}
	},
});

Object.defineProperty(ReadManager.prototype, 'readingParagraphId', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (this._currentHighlight === null) return null;
		return this._currentHighlight.ParagraphId;
	},
});

Object.defineProperty(ReadManager.prototype, 'Enabled', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (this._enable === null) return false;
		return this._enable;
	},
	set: function(value) {
		if (this._enable === null) this._enable = value;
	},
});


//////////////////////////////////////////////////////////////////////////
// インターフェース
//////////////////////////////////////////////////////////////////////////

/**
 * 指定ノードを含むハイライトから読み上げを開始します。
 */
ReadManager.prototype.startReading = function(nodeId) {
	if (!this._isReadingMode) return;

	// 再生中ハイライトがあれば、停止します。
	this.stopReading();

	console.log('再生開始指示');

	// 最後にリクエストした段落情報をリセットします
	this._lastRequestParaIdList = [];

	// レスポンス待ちリストをリセットします
	this._waitForResponseList = [];

	// 再生開始ノードを登録します
	//this._startNodeId = nodeId;

	// 登録されているハイライトリストから、対象を取得します
	var dataDom = DocumentManager.getDocument();
	this._currentHighlight = this._highlightList.getHighlight(dataDom, nodeId);

	// 取得できなければ、ハイライトデータのリクエストを発行します
	if (this._currentHighlight === null) {
		console.log('再生可能なハイライトがないため、リクエスト発行を行います');

		var obj = this;
		// 文書IDを取得します
		var docId = DocumentManager.getDocId();

		// 指定位置以降の連続する空段落(の末尾ノード)のリストを取得します
		var brList = this._getEmptyParagraphByNodeId(nodeId);

		// 空段落が検出された場合、ハイライトに登録します
		if (brList.length > 0) {
			// ハイライトに登録します
			var emptyList = [];
			for (var i = 0; i < brList.length; i++) emptyList.push(HighlightData.createEmpty(brList[i], 1));
			this._highlightList.append(emptyList);

			// カレントハイライトを設定し、再生を開始します (通信が不要のためここで開始できます)
			this._currentHighlight = this._highlightList.getHighlight(DocumentManager.getDocument(), brList[0].id);
			this.play();
			return;
		}

		// 再生開始ノードを登録します
		this._startNodeId = nodeId;

		// 段落XMLを取得します
		var paraXml = ReadManager._getParaXmlById(nodeId);
		// 話者リストを取得します
		var speakerList = ConfigManager.instance.SpeakerList;

		console.log('ハイライトリクエスト (startReading)：' + nodeId);
		this._waitForResponseList.push(nodeId);
		ServerManager.requestHighlight(docId, paraXml, nodeId, speakerList, nodeId,
			// 成功時のコールバック
			function(data) {
				console.log('ハイライトの取得に成功。コールバックを実行します');
				obj.onLoadHighlight(data.info, data.request_id);
			},
			// 失敗時のコールバック
			function(data) {
				console.log('ハイライトの取得に失敗。コールバックを実行します');
				obj.onErrorHighlight(data);
			},
			// 予期せぬ失敗時のコールバック
			function(errorInfo) {
				console.log('ハイライトの取得に予期せぬ失敗。コールバックを実行します');
				obj.onErrorHighlight(errorInfo);
			});
		return;
	}

	// 取得できた場合は、再生を開始します
	else {
		console.log('再生可能なハイライトがあったため、再生開始メソッドを実行します');
		this.play();
	}
};

/**
 * ID で指定されたノードを含む段落以降を検索し、
 * 連続する空段落の末尾<br>のリストを取得します。
 */
ReadManager.prototype._getEmptyParagraphByNodeId = function(nodeId) {
	var document = DocumentManager.getDocument();
	var node = ($(document).find('#' + nodeId))[0];
	var nextPara = DataClass.getRootParagraph(node);

	var result = [];
	while ((nextPara !== null) && (nextPara.children.length === 1)) {
		result.push(nextPara.children[0]);
		nextPara = ReadManager._getNextParagraph(nextPara);
	}

	return result;
}

/**
 * カレントハイライトでの再生を開始します
 */
ReadManager.prototype.play = function() {
	console.log('ReadManager.play/ 再生メソッド開始');
	// ノードリストが空の場合、何もしません
	if (this._currentHighlight.NodeIdList.length <= 0) {
		console.log('ReadManager.play/ ハイライトデータの再生を指示されましたが、ハイライト対象のノードIDリストが空のため中断されました。');
		return;
	}

	var obj = this;
	// ★画面更新必要
	// セクションが移動していた場合、セクション表示を更新します
	// セクションが移動していなければ、何もしません
	if (!this.changeSection()) {
		console.log('ReadManager.play/ セクションの表示切り替え処理中に不適切なデータが検出されたため、ハイライトの再生を中断しました。');
		return;
	}

	// ハイライト表示を更新します
	console.log('ReadManager.play/ ハイライト表示更新');
	this._highlightRenderer.highlightNodes(this._currentHighlight.NodeIdList);
	this._currentHighlight.play(
		// 停止時のコールバック
		function(event) {
			obj.onEndPlay();
		},
		// エラー時のコールバック
		function(event) {
			obj.onErrorPlay(event, null, false);
		},
		// XHR エラー時のコールバック
		function(event, highlight, isServerError) {
			obj.onErrorPlay(highlight, isServerError);
		});

	// ハイライト位置にカーソルを移動させ、スクロールを行います
	var editorPane	= ViewManager.getEditorPane();
	var caret		= editorPane.getCaret();
	caret.pos = this._currentHighlight.NodeIdList[0];
	editorPane.updateCaret();

	EditorPaneClass.scrollManager.SetFocusNode(caret.pos);
	EditorPaneClass.scrollManager.ScrollToFocusNode();
};

/**
 * 表示すべきセクションが変更されていた場合、
 * 表示を切り替えます。
 */
ReadManager.prototype.changeSection = function() {
	// 表示すべきハイライトに対応するセクションを取得します
	var jdataDom = $(DocumentManager.getDocument());
	var dataNode = jdataDom.find('#' + this._currentHighlight.NodeIdList[0]);

	if (dataNode.length <= 0) {
		console.log('ハイライト対象のノードがデータ上に存在しません。');
		return false;
	}

	dataNode = dataNode[0];

	var targetSection = DataClass.getClosest(dataNode, 'SECTION');

	// 表示中のセクションを取得します
	var currentSection = DocumentManager.getCurrentSection();

	// 表示すべきセクションと表示中のセクションが一致した場合、何もしません
	if (targetSection === currentSection) {
		console.log('表示対象セクションは既に表示中のため、読み上げ中のセクションの自動切替はキャンセルされました。');
		return true;
	}

	// セクションの表示を切り替えます

	// 新しい表示対象セクションのインデックスを取得します
	var newIndex = DataClass.getNodeIndex(targetSection, DocumentManager.getDocument().children);

	// インデックスペインを取得します
	var indexPane = ViewManager.getIndexPane();
	if (indexPane === null) {
		console.log('インデックスペインの取得に失敗しました。');
		return false;
	}

	// セクションタイトルに変更があれば、先にタイトル変更を行います。
	indexPane.updateSectionTitle();
	// セクションを選択します。
	indexPane.SelectSection(newIndex, false, false);
	// セクションの選択状態を反映します。
	indexPane.HilightSection();
	// 選択されたセクションの タイトル を、セクションタイトルバーへ反映します。
	indexPane.ReadySectionTitle();
	// エディタペイン再描画
    ViewManager.getRenderer().setUpdateEditorPane();
	Renderer.updateStyleClass();
	ViewManager.getRenderer().update();

	return true;
};

/**
 * ID指定されたノードが属する段落に読み上げ可能な要素があるか否かを取得します。
 */
ReadManager._paraNodeHasData = function(nodeId) {
	// 文書DOMを取得します
	var domRoot = DocumentManager.getDocument();

	// IDが示すノードを取得します
	var node = $(domRoot).find('#' + nodeId);
	if (node.length <= 0) return null;
	node = node[0];

	// 段落ノードを取得します
	var paraNode = DataClass.getRootParagraph(node);

	return (paraNode.children.length > 1);
};

/**
 * ID指定されたノードが属する段落のXMLを取得します。
 */
ReadManager._getParaXmlById = function(nodeId) {
	// 文書DOMを取得します
	var domRoot = DocumentManager.getDocument();

	// IDが示すノードを取得します
	var node = $(domRoot).find('#' + nodeId);
	if (node.length <= 0) return null;
	node = node[0];

	// 段落ノードを取得します
	var paraNode = DataClass.getRootParagraph(node);

	return ReadManager._getParaXml(paraNode);
};

ReadManager._getParaXml = function(paraNode) {
	// 画像があるときはデータを削除します
	var imgCount = $(paraNode).find('cimg').length;
	if (imgCount > 0) {
	    var newParaDOM = $(paraNode.cloneNode(true));
	    var imgNodes = newParaDOM.find('cimg');
	    for (var i=0; i<imgNodes.length; i++) {
	        imgNodes[i].removeAttribute('data');
	    }
	    paraNode = newParaDOM[0];
	}

	// ハイライト取得用 xml の <br> タグ処を処理します
	var xml = paraNode.outerHTML;
	var re = /<br[^<>]*>/g;
	xml = xml.replace(re, function(match) {
		return (match.substr(0, match.length - 1) + '/>');
	});

	return xml;
}

/**
 * 読み上げを停止します。
 */
ReadManager.prototype.stopReading = function() {
	//console.log('再生停止処理を実行します。');
	if (!this._isReadingMode) return;

	// ★画面更新必要
	this._highlightRenderer.clearParagraphHighlight();

	// 再生を停止します
	if (this._currentHighlight) this._currentHighlight.stop();
	this._currentHighlight = null;

	// レスポンス待ちリストをリセットします
	this._waitForResponseList = [];

	// ハイライトリストをクリアします
	this._highlightList.clear();
};


//////////////////////////////////////////////////////////////////////////
// 内部イベントハンドラ
//////////////////////////////////////////////////////////////////////////

/**
 * ハイライトデータ取得時の処理
 */
ReadManager.prototype.onLoadHighlight = function(data, request_id) {
	console.log('ReadManager.onLoadHighlight/ ハイライトロード: ' + data.length + ' / ' + request_id);

	// IDがレスポンス待ちリストに登録されていなければ、何もしません
	var findPos = this._waitForResponseList.indexOf(request_id);
	if (findPos < 0) return;
	this._waitForResponseList.splice(findPos, 1);

	// データDOM のルートを取得します
	var jdataDom = $(DocumentManager.getDocument());

	// 受信データを HighlightData の配列に変換します
	var list = [];
	for (var i = 0; i < data.length; i++) {
		var next = (i < data.length - 1) ? data[i + 1] : null;
		list.push(HighlightData.createFrom(data[i], next, jdataDom));
	}

	// ハイライトリストにデータを追加登録します
	this._highlightList.append(list);

	// ハイライトリストの preload で音声データを取得します
	var obj = this;
	this._highlightList.preload(function(cerr, ferr) { obj.onLoadSound(cerr, ferr); });

	// 直後にいくつの空段落が続くか、取得します
	var emptyBrList = this._getNextEmptyParagraphList();

	// 検出された空段落を登録します
	var emptyList = [];
	for (var i = 0; i < emptyBrList.length; i++) emptyList.push(HighlightData.createEmpty(emptyBrList[i], 1));
	this._highlightList.append(emptyList);

	/*// 空段落が検出された場合、読み上げスリープを表すデータを挿入します
	if (emptyCount > 0) {
		// 直後の段落の改行ノードを取得します
		var brNode = this._getNextParagraphBr();

		// ハイライトデータを作成、登録します
		var emptyList = [];
		emptyList.push(HighlightData.createEmpty(brNode, emptyCount));
		this._highlightList.append(emptyList);
	}*/

	// 次のハイライトデータの取得確認を行います
	this._getNextHighlight();
};

/**
 * 直後に続く空段落の数を取得します。
 * @returns {Number}
 */
ReadManager.prototype._getNextEmptyParagraphList = function() {
	var jdataDom = $(DocumentManager.getDocument());
	var lastParaId = this._highlightList.getLast()._paragraphId;

	// 最後のハイライトの段落ノードを取得します
	var paraNode = jdataDom.find('#' + lastParaId);
	if (paraNode.length <= 0) return;
	paraNode = paraNode[0];

	// 直後の段落ノードを取得します（セクション境界をまたいで検索します）
	var nextPara = ReadManager._getNextParagraph(paraNode);

	var emptyList = [];

	// 直後の段落が空段落の場合、空段落がいくつ続くかカウントして返します
	while ((nextPara !== null) && (nextPara.children.length === 1)) {
		emptyList.push(nextPara.children[0]);
		nextPara = ReadManager._getNextParagraph(nextPara);
	};

	// 結果を返します
	return emptyList;
}


/**
 * 直後に続く空段落の数を取得します。
 * @returns {Number}
 */
ReadManager.prototype._getNextParagraphBr = function() {
	var jdataDom = $(DocumentManager.getDocument());
	var lastParaId = this._highlightList.getLast()._paragraphId;

	// 最後のハイライトの段落ノードを取得します
	var paraNode = jdataDom.find('#' + lastParaId);
	if (paraNode.length <= 0) return;
	paraNode = paraNode[0];

	// 直後の段落ノードを取得します（セクション境界をまたいで検索します）
	var nextPara = ReadManager._getNextParagraph(paraNode);

	// 段落が取得できなければ、null を返します
	if (nextPara === null) return null;

	// 段落の最後の要素を返します
	return nextPara.lastChild;
}


/**
 * 次の段落の最後の改行要素を取得します。
 * 段落はセクションをまたいで検索します
 * @param paraNode
 * @returns 次の段落を取得できなければ、null
 */
ReadManager._getNextParagraph = function(paraNode) {
	// セクション内での次の段落を取得します
	var nextPara = paraNode.nextSibling;

	// セクション内で段落を取得できれば、結果を返します
	if (nextPara !== null) return nextPara;

	// 次のセクションを取得します
	var nextSec = paraNode.parentNode.nextSibling;

	// 次のセクションが取得できなければ、次の段落も存在しません
	if (nextSec === null) return null;

	// 次のセクションの先頭段落を返します
	return nextSec.children[0];
};


/**
 * ハイライトデータ取得失敗時の処理
 */
ReadManager.prototype.onErrorHighlight = function(error) {
	console.log('ReadManager.onErrorHighlight/ ハイライト取得エラーが発生しました。');
	// 再生開始ノードをクリアします
	this._startNodeId = null;

	// ★ここの処理は適当なエラー処理に変更してください。
	if (error.message === void 0) {
		// 接続エラーなど
		alert('コード(' + error.status + ')のエラーが発生しました。');
	} else {
		// サーバ処理エラーなど
		alert(error.message);
	}
};

/**
 * preload 終了後に実行される音声データ取得時の処理
 */
ReadManager.prototype.onLoadSound = function(connectError, fileError) {
	console.log('ReadManager.onLoadSound/ 音声ロード');
	//   カレントハイライトがなければ、ノードIDからカレントを取得して再生
	//   (音声データは全て取得後に実行されるため、音声データはあるはず。)
	//   ハイライト取得に失敗した場合、ここでは何もしない

	// エラー発生時は何もしません。
	if (connectError.length + fileError.length > 0) return;

	// 既にカレントハイライトが設定されている場合、
	// 再生中と判断して、何もしません。
	console.log('ReadManager.onLoadSound/ カレントハイライト：' + this._currentHighlight);
	if (this._currentHighlight !== null) {
		console.log('ReadManager.onLoadSound/ 既に再生中のため、再生開始はキャンセルされました。');
		return;
	}

	// 再生開始ノードが登録されていなければ、再生開始は出来ません
	if (this._startNodeId === null) {
		// ★ここでハイライトさえあれば無条件に先頭から再生開始しても良いけれど？
		console.log('ReadManager.onLoadSound/ 再生開始ノードが不明のため、再生を開始できませんでした。');
		return;
	}

	// カレントハイライトを設定します
	var dataDom = DocumentManager.getDocument();
	this._currentHighlight = this._highlightList.getHighlight(dataDom, this._startNodeId);

	if (this._currentHighlight === null) {
		console.log('ReadManager.onLoadSound/ 再生開始のためのカレントハイライトの取得に失敗しました。');
		return;
	}

	console.log('ReadManager.onLoadSound/ StartNode: ' + this._startNodeId + ', CurrentHighlight: ' + this._currentHighlight);
	this._startNodeId = null;

	// カレントハイライトを再生します
	this.play();

	// 次のハイライトの取得を試行します
	this._getNextHighlight();
};

/**
 * 再生中の予期せぬエラーが発生した時の処理
 */
ReadManager.prototype.onErrorPlay = function(event, highlight, isServerError) {
	// 現在のハイライトの再生が続いていればそれは止めませんが、
	// カレントハイライトは削除します
	console.log('ReadManager.onErrorPlay/ 予期せぬエラーにより、カレントハイライトを削除します。');
	this._currentHighlight = null;

	// ★適当なエラー処理に変更してください。
	var message = (highlight !== null) ? 'ReadManager.onErrorPlay/ サーバから音声を取得できませんでした。' : '再生中の想定しないエラーです。';
	console.log(message);
	//alert(message);
};

/**
 * ハイライトの再生終了時の処理
 */
ReadManager.prototype.onEndPlay = function() {
	console.log('ReadManager.onEndPlay/ 再生終了');

	// ハイライト表示を更新します
	this._highlightRenderer.clearParagraphHighlight();

	// 次のハイライトを取得します
	// 取得できなければ、再生は終了します
	this._currentHighlight = this._highlightList.getNext();
	if (this._currentHighlight === null) {
		/*console.log('次のハイライトが取得できなかったため、読み上げを終了します。');
		return;*/

		// 次の段落があれば、その先頭を次の開始ノードにすれば･･
		var jdataDom = $(DocumentManager.getDocument());
		var lastHighlight = this._highlightList.getLast();
		if (lastHighlight !== null) {
			var lastParaId = lastHighlight.ParagraphId;

			// 最後のハイライトの段落ノードを取得します
			var paraNode = jdataDom.find('#' + lastParaId);
			if (paraNode.length <= 0) return;
			paraNode = paraNode[0];

			// 次の段落を取得します
			var nextPara = ReadManager._getNextAvailableParagraph(paraNode);

			// 次の段落が取得できていれば、その先頭を読み上げ開始ノードに再設定します
			if (nextPara !== null) this._startNodeId = nextPara.children[0].id;
		}

		return;
	}
	console.log('次の再生準備');

	// 再生完了したハイライトを削除します
	this._highlightList.arrangeHighlight();

	// 次のハイライトの取得を試行します
	this._getNextHighlight();

	// 次のハイライトを再生します
	this.play();
};

/**
 * 未再生ハイライトの数を調べ、少ないようなら次のハイライトを取得します
 */
ReadManager.prototype._getNextHighlight = function() {
	// 未再生の段落・ハイライト数を取得します
	var restPara = this._highlightList.getRestParagraphCount();
	var restHighlight = this._highlightList.getRestHighlightCount();

	// 未再生の段落・ハイライトが少ない場合には新しい段落ハイライトを要求します
	if ((restPara < 3) || (restHighlight < 10)) {
		// 最後のハイライトの段落IDを取得します
		// 取得失敗はここでは想定しません
		var jdataDom = $(DocumentManager.getDocument());
		var lastParaId = this._highlightList.getLast()._paragraphId;

		// 最後のハイライトの段落ノードを取得します
		var paraNode = jdataDom.find('#' + lastParaId);
		if (paraNode.length <= 0) return;
		paraNode = paraNode[0];

		// 次の段落を２つ取得します
		var nextParaList = [];

		nextParaList.push(ReadManager._getNextAvailableParagraph(paraNode));
		if (nextParaList[0] === null) return;				// 取得できなければ、以降の処理はスキップします
		nextParaList.push(ReadManager._getNextAvailableParagraph(nextParaList[0]));

		// 前回のリクエストと比較し、リクエスト対象データを決定します
		nextParaList[0] = ReadManager._getNotMatchElement(this._lastRequestParaIdList, nextParaList[0]);
		nextParaList[1] = ReadManager._getNotMatchElement(this._lastRequestParaIdList, nextParaList[1]);

		// 段落のハイライトデータをサーバに要求します
		ReadManager._requestHighlight(this, nextParaList[0]);
		ReadManager._requestHighlight(this, nextParaList[1]);

		// リクエスト済み段落を、リストに登録します
		for (var i = 0; i < 2; i++) {
			if (nextParaList[i] !== null) this._lastRequestParaIdList.push(nextParaList[i]);
		}
		//if (nextParaList[0] !== null) this._lastRequestParaIdList.push(nextParaList[0]);

		// 登録されている要求済み段落情報が多い場合、間引きます
		while (this._lastRequestParaIdList.length > 10) this._lastRequestParaIdList.shift();
	}
};

/**
 * 次の段落を取得します。
 * セクション終端に達した場合、次のセクションから取得されます。
 * 空の段落はスキップされます。
 * @param paraNode
 * @returns 次の段落ノード。次の段落を取得できなければ、null
 */
ReadManager._getNextAvailableParagraph = function(paraNode) {
	var nextPara = paraNode;

	do {
		paraNode = nextPara;
		nextPara = nextPara.nextSibling;
		if (nextPara === null) {
			var nextSec = paraNode.parentNode.nextSibling;
			if (nextSec !== null) nextPara = nextSec.children[0];
		}
	} while ((nextPara !== null) && (nextPara.children.length === 1));

	return nextPara;
};

/**
 * 配列の中に一致するデータがなければ、指定された変数をそのまま返します。
 * 一致するデータがあれば、null を返します。
 * @param oldList	検索対象配列
 * @param newData	配列中に含まれるか検証すべきデータ
 * @returns
 */
ReadManager._getNotMatchElement = function(oldList, newData) {
	if (oldList.indexOf(newData) < 0) return newData;
	return null;
};

/**
 * 指定段落のハイライトをサーバに要求します。
 * @param readManager
 * @param paraNode
 */
ReadManager._requestHighlight = function(readManager, paraNode) {
	if (paraNode === null) return null;
	if (paraNode.children.length == 0) return null;

	// 次の段落の先頭ノードを取得します (空段落は排除されていると想定します)
	var startNodeId = paraNode.children[0].id;

	var obj = readManager;
	// 文書IDを取得します
	var docId = DocumentManager.getDocId();
	// 段落XMLを取得します
	var paraXml = ReadManager._getParaXml(paraNode);
	// 話者リストを取得します
	var speakerList = ConfigManager.instance.SpeakerList;

	console.log('次段落のハイライト取得: ' + startNodeId);
	readManager._waitForResponseList.push(startNodeId);
	ServerManager.requestHighlight(docId, paraXml, startNodeId, speakerList, startNodeId,
		// 成功時のコールバック
		function(data) {
			console.log('次段落のハイライト読み込まれました: ' + data.request_id);
			obj.onLoadHighlight(data.info, data.request_id);
		},
		// 失敗時のコールバック
		function(data) {
			console.log('次段落のハイライト読み込みエラー');
			obj.onErrorHighlight(data);
		},
		// 予期せぬ失敗時のコールバック
		function(errorInfo) {
			console.log('次段落のハイライト読み込みしっぱい');
			obj.onErrorHighlight(errorInfo);
		});
};
