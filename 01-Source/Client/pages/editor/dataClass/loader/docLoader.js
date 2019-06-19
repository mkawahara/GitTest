/**
 * 文書読み込みを行うクラス。
 * 旧来の Loader の置き換え用。
 */

/**
 * 文書取得クラスを作成します。
 * @param docId				取得したい文書ID
 * @param documentCallback	文書情報の読み込み完了時に実行するコールバック関数
 * @param completeCallBack	文書全体の読み込み完了時に実行するコールバック関数
 * @param errorHandler		読み込み中にエラーが発生した時に実行する実行するコールバック関数
 * @param renderer			文書読み込み時に更新したいレンダラー (null 可能)
 */
function DocumentLoader(docId, documentCallback, completeCallBack, errorHandler, renderer) {
	// 取得用データ等を登録します
	this.docId = docId;
	this.documentCallback = documentCallback;
	this.completeCallBack = completeCallBack;
	this.errorHandler = errorHandler;
	this.renderer = renderer;

	// アニメーションIDリスト
	this._animeIdList = [];

	// エラーハンドラが実行済みか否か保持します
	this.doneErrorHandler = false;

	// XmlHttpRequest を作成します
	this.xhr = new XMLHttpRequest();
	this.url = Communicator.getUrl('docInfo');

	// 失敗カウンターを作成します
	this.errorCounter = 0;

	// 読み込み完了時のイベントを作成します
	var holder = this;
	this.xhr.onreadystatechange = function() {
		holder.onStatusChange(this);
	};

	// レスポンスタイプを json と仮定させます
	// IE では例外が発生します
	try {
		this.xhr.responseType = 'json';
	} catch(e){}

	// 後から定義されるデータメンバ宣言
	this.document = null;
	this.paraLoaderList = [];
};


/**
 * サーバに対し文書データをリクエストします。
 * 段落取得は、文書データの取得に成功した場合、DocumentLoader が自動的に行います。
 */
DocumentLoader.prototype.post = function() {
	// リクエストデータを作成します
	var dataStr = 'id=' + this.docId;

	// リクエストを発行します
	this.xhr.open('POST', this.url);
	this.xhr.setRequestHeader('Accept', 'application/json, */*; q=0.01');
	this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	this.xhr.send(dataStr);
};

/**
 * XmlHttpRequest の readyState が変更された時に実行されるメソッドです
 * ★xhrのonload に登録した方がよいでしょう。
 * @param xhr
 */
DocumentLoader.prototype.onStatusChange = function(xhr) {
	// 完了時のみ処理を実行します
	if (xhr.readyState === 4) {
		// 正常にデータを取得できた時の処理です
		if (xhr.status === 200) {
			var response = xhr.response;
			if (response.error_code === void 0) response = JSON.parse(response);

			// サーバでの処理が成功した時
			if (response.error_code === 0) {
				this.onResponseSuccess(response);
			}

			// 失敗時はエラーハンドラを実行します
			else {
				this.errorHandler(response.message);
			}
		}

		// 正常にデータを取得できなかった時の処理です
		else {
			// エラーをカウントし、5回以上発生していた場合は、
			// 再試行を中断します。
			console.log('文書データの取得に失敗しました。');

			this.errorCounter++;
			if (this.errorCounter > 5) {
				this.errorHandler('文書データ取得中にサーバとの通信に失敗しました。');
				return;
			}

			// データリクエストを再試行します
			this.post();
		}
	}
};

/**
 * 文書情報取得に成功した時の処理です
 * @param data
 */
DocumentLoader.prototype.onResponseSuccess = function(data) {
	// 更新リビジョンを取得します
	var revision = data.revision;

	// Document オブジェクトを作成します
	this.document = new Document(data.content, this.docId);

	// 文書情報取得時に実行すべきコールバックを実行します
	if (this.documentCallback) this.documentCallback(this.document);

	// 文書に属する全ての段落ID を取得します
	var paraIdList = DocumentLoader.getAllParagraphIdList(this.document);

	// 各段落に対応する paraLoader を作成し、実行します
	this.paraLoaderList = [];
	var docSpeakerList = this.document.property.speakerList;
	var configSpeakerList = ConfigManager.instance.SpeakerList;
	for (var idIdx = 0; idIdx < paraIdList.length; idIdx++) {
		var url = Communicator.getUrl('docP');
		var pLoader = new ParagraphLoader(
				url,
				this.docId,
				paraIdList[idIdx],
				revision,
				this,
				docSpeakerList,
				configSpeakerList
				);
		pLoader.post();

		this.paraLoaderList.push(pLoader);
	};

	// 文書プロパティの話者リストを更新します
	this.document.property.speakerList = configSpeakerList;
};

/**
 * 文書に含まれる全ての段落IDを配列として取得します
 * @param document
 * @returns {Array}
 */
DocumentLoader.getAllParagraphIdList = function(document) {
	// 全てのセクションを配列として取得します
	var sectionList = document.getSectionListAsArray();

	var paraList = [];

	// 各セクションから段落IDリストを収集します
	for (var sectionIdx = 0; sectionIdx < sectionList.length; sectionIdx++) {
		var tempList = null;
		var section = sectionList[sectionIdx];
		Section.doop(section);

		tempList = section.paragraphIdList;
		Array.prototype.push.apply(paraList, tempList);
	};

	// 段落IDリストを返します
	return paraList;
};

/**
 * 段落取得時にエラーが発生した時に実行されるエラーハンドラです。
 * 複数回実行されることはありません。
 */
DocumentLoader.prototype.onErrorLoadingParagraph = function(message) {
	// 登録されたエラーハンドラを実行します
	if (!this.doneErrorHandler && this.errorHandler) this.errorHandler(message);
	this.doneErrorHandler = true;

	// 段落ローダを全て停止させます
	for (var i = 0; this.paraLoaderList.length; i++) {
		this.paraLoaderList[i].stop();
	};
};

/**
 * ParagraphLoader から呼び出され、文書に段落を登録します。
 * @param pid
 * @param contentXml
 */
DocumentLoader.prototype.appendParagraph = function(pid, contentXml) {
	// 段落データをノードに変換します
	var paraNode = ParagraphParser.parse(contentXml);

	// 段落中のアニメーションIDリストを取得します
	var ainmeIdList = DocumentLoader.getAnimationList(paraNode);
	if (ainmeIdList.length > 0) {
		this._animeIdList = this._animeIdList.concat(ainmeIdList);

		// IDManager を更新します
		for (var i = 0; i < ainmeIdList.length; i++) {
			DocumentManager.getIdManager().updateAnimationId(ainmeIdList[i]);
		}
	}

	// セクションの配列を取得します
	var sectionList = this.document.getSectionListAsArray();

	for (var i = 0; i < sectionList.length; i++) {
		// セクションに段落データを登録します
		// 同時に、内部でセクションに追加された段落データの表示を更新します
		// セクションの段落登録状況を更新します
		if (sectionList[i].appendParagraph(pid, paraNode, this.renderer)) break;
	};

	// 文書の取得完了チェックを行います
	for (var i = 0; i < sectionList.length; i++) {
		// １つでも完了していないセクションがあれば、メソッドを終了します
		var section = sectionList[i];
		Section.doop(section);
		if (section.isAllReceived() === false) return;
	};

	// 全てのセクションの受信を完了していれば、
	// アニメーション整理要求を発行した後、
	// 文書取得完了のコールバックを実行します
	if (this.completeCallBack) {
		ServerManager.requestCleanUnusedAnime(this.docId, this._animeIdList);
		this.completeCallBack(this.document);
	}
};

/**
 * 指定データDOMに含まれるアニメーションIDを配列として取得します。
 * @param dom
 */
DocumentLoader.getAnimationList = function(dom) {
	var result = [];
	var jimg = $(dom).find('cimg');

	for (var i = 0; i < jimg.length ;i++) {
		var aid = jimg[i].getAttribute('animationid');

		if ((aid !== null) && (aid !== '')) {
			result.push(Number(aid));
		}
	};

	return result;
};
