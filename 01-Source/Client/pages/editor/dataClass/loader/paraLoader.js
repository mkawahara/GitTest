/**
 * 段落読み込みを行うクラス。
 * １クラス１段落の読み込みを行う。
 * 失敗時のリトライはハードコーディング定義。
 */

/**************************************************************
 * 段落取得クラスを作成します。
 * @param url		段落リクエスト先 URL
 * @param docId		段落を所有する文書のID
 * @param pid		取得する段落のID
 * @param revision	読み込みリビジョン
 * @param dLoader	DocumentLoader への参照
 * @param preSpeakers	文書に記録されている話者リスト
 * @param postSpeakers	データ変換サーバから通知された話者リスト。変更がない場合は null
 */
function ParagraphLoader(url, docId, pid, revision, dLoader, preSpeakers, postSpeakers) {
	// 取得用データ等を登録します
	this.docId = docId;
	this.pid = pid;
	this.docLoader = dLoader;
	this.revision = revision;

	// XmlHttpRequest を作成します
	this.xhr = new XMLHttpRequest();
	this.url = url; //Communicator.urlList.docP;

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

	// 話者リストを記録します
	this.preSpeakers = preSpeakers;
	this.postSpeakers = postSpeakers;
};

/**************************************************************
 * リクエストを発行します
 */
ParagraphLoader.prototype.post = function() {
	// リクエストデータを作成します
	var dataStr = 'doc_id=' + this.docId + '&p_id=' + this.pid + '&revision=' + this.revision;

	// リクエストを発行します
	this.xhr.open('POST', this.url);
	this.xhr.setRequestHeader('Accept', 'application/json, */*; q=0.01');
	this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	this.xhr.send(dataStr);
};

/**
 * リクエストを停止します。
 */
ParagraphLoader.prototype.stop = function() {
	this.xhr.abort();
};


/**************************************************************
 * XmlHttpRequest の状態変更時のイベントハンドラ
 * @param xhr
 */
ParagraphLoader.prototype.onStatusChange = function(xhr) {
	// 完了時のみ処理を実行します
	if (xhr.readyState === 4) {
		// 正常にデータを取得できた時の処理です
		if (xhr.status === 200) {
			var response = xhr.response;
			if (response.error_code === void 0) response = JSON.parse(response);

			this.onResponseSuccess(response);
		}

		// 正常にデータを取得できなかった時の処理です
		else {
			// エラーをカウントし、5回以上発生していた場合は、
			// 再試行を中断します。
			console.log('段落(ID:' + this.pid + ')の取得に失敗しました。');

			this.errorCounter++;
			if (this.errorCounter > 5) {
				this.docLoader.onErrorLoadingParagraph('段落(' + this.pid + ')データ取得中にサーバとの通信に失敗しました。');
				return;
			}

			// データリクエストを再試行します
			this.post();
		}
	}
};

/**************************************************************
 * 受信成功時の処理です。
 * サーバでの処理が成功しているとは限りません。
 */
ParagraphLoader.prototype.onResponseSuccess = function(data) {
	// 成功時は文書ローダに段落情報を渡します
	if (data.error_code === 0) {
		var xml = data.content;
		if ((this.postSpeakers !== void 0) && (this.postSpeakers !== null)) {
			xml = ParagraphLoader.replaceSpeaker(xml, this.preSpeakers, this.postSpeakers);
		}
		this.docLoader.appendParagraph(this.pid, xml);
	}

	// 失敗時はエラーハンドラを実行します
	else {
		this.errorHandler(data.message);
	}
};

/**
 * xml 文字列中の speaker 属性の置換を行います
 * @param xml
 * @param preList	元々の話者リスト
 * @param newList	変更後の話者リスト
 * @returns
 */
ParagraphLoader.replaceSpeaker = function(xml, preList, newList) {
	// リストの対応関係を確認し、削除、置換、何もしないに分類します
	// null: 削除、false: なにもしない、数値: 置換
	var workList = [];

	for (var i = 0; i < preList.length; i++) {
		var newPos = newList.indexOf(preList[i]);
		if (newPos >= 0) {
			if (newPos === i) {
				workList.push(false);
			} else {
				workList.push(newPos);
			}
		} else {
			workList.push(null);
		}
	}

	// 不要な話者属性を削除します
	for (var i = 0; i < workList.length; i++) {
		if (workList[i] !== null) continue;

		var re = 'speaker=\"' + i + '\"';
		var reg = new RegExp(re, 'g');
		xml = xml.replace(reg, '');
	}

	// 古い話者インデックスを一度、別のインデックスに置換します
	// ★ここの都合上、話者は最大8名までしか設定できません
	var middleList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
	for (var i = 0; i < workList.length; i++) {
		if ((workList[i] === null) || (workList[i] === false)) continue;

		var pre = 'speaker=\"' + i + '\"';
		var post = 'speaker="' + middleList[i] + '"';
		var preReg = new RegExp(pre, 'g');
		xml = xml.replace(preReg, post);
	}

	// 中間インデックスを更に置換します
	for (var i = 0; i < workList.length; i++) {
		if ((workList[i] === null) || (workList[i] === false)) continue;

		var pre = 'speaker=\"' + middleList[i] + '\"';
		var post = 'speaker="' + workList[i] + '"';
		var preReg = new RegExp(pre, 'g');
		xml = xml.replace(preReg, post);
	}

	return xml;
};
