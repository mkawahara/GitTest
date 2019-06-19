/**
 * 文書編集ページにおける通信一式を担当するクラス。
 * 各公開メソッドは、サブメソッドとして、
 * リクエストデータ作成、成功時のデフォルト処理、失敗時のデフォルト処理を有する。
 *
 * 文書読み込みは処理が特殊なため、Loader クラスを使用すること。
 * また、音声取得はバイナリでデータを取得するため、Communicator が使えない。
 * そのため、XMLHttpRequest を直接使用すること。
 */
function ServerManager() {
};

///////////////////////////////////////////////////////////////////////////
// 文書ファイル情報取得
///////////////////////////////////////////////////////////////////////////

/*
 * 単体でも動作するように、ファイル名の出力先と親ディレクトリID を保持させていますが、
 * これらの情報は必ずしも ServerManager が保持すべきものではありません。
 * (ViewManager への保存が妥当ですが、内部で直接記述すると依存性が高くなるため採用していません)
 * 保持させない場合は、ServerManager.requestFileInfo の呼び出し引数にて、
 * リクエスト成功時の処理を外部から渡します。
 * また、別名保存処理で使用する重複保存確認リクエストにおいても、
 * 外部で管理している親ディレクトリID を渡すようにします。
 */

// ファイル名表示先部品への参照
ServerManager._fileNameLabel = null;
// 文書の親ディレクトリID
ServerManager._docParentDirId = null;

ServerManager.requestFileInfo = function(docId, fileNameLabel, onSuccess, onError) {
	// 送信データを作成します
	var data = { id: docId, };

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessGetFileInfo;

	var error = onError;
	if (!error) error = ServerManager.onErrorGetFileInfo;

	// ファイル名の表示先を登録します
	ServerManager._fileNameLabel = fileNameLabel;

	// リクエストを発行します
	Communicator.request( 'docFile', data, success, error );
};

/**
 * ファイル情報取得成功時の処理です
 * @param data
 */
ServerManager.onSuccessGetFileInfo = function(data) {
	// ファイル名を表示します
	if (ServerManager._fileNameLabel) {
		ServerManager._fileNameLabel.textContent = data.file.name;
		DocumentManager.instance.fileName = data.file.name;
	};

	ServerManager._fileNameLabel = null;

	// 文書の親ディレクトリIDを保存します
	ServerManager._docParentDirId = data.file.parent_id;
};

ServerManager.onErrorGetFileInfo = function(data) {
	alert('文書のファイル情報の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};


///////////////////////////////////////////////////////////////////////////
// 文書保存
///////////////////////////////////////////////////////////////////////////

/**
 * 文書データをサーバに保存します。
 */
ServerManager.saveDocument = function(docId, docXml, paraXmlList, onSuccess, onError) {
	// 送信データを作成します
	var data = ServerManager.buildSaveDocData(docId, docXml, paraXmlList);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessSaveDoc;

	var error = onError;
	if (!error) error = ServerManager.onErrorSaveDoc;

	// リクエストを発行します
	Communicator.request( 'docSave', data, success, error );
};

/**
 * 文書保存用データを作成します
 * @param docId
 * @param docXml
 * @param paraXmlList
 * @returns {___anonymous1331_1409}
 */
ServerManager.buildSaveDocData = function(docId, docXml, paraXmlList) {
	var data = {
		id: docId,
		content: docXml,
		p_list: JSON.stringify(paraXmlList),
	};

	return data;
};

ServerManager.onSuccessSaveDoc = function(data) {
	alert('文書データの保存に成功しました。');
};

ServerManager.onErrorSaveDoc = function(data) {
	alert('文書データの保存に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

///////////////////////////////////////////////////////////////////////////
// ファイルの重複確認
///////////////////////////////////////////////////////////////////////////

/**
 * 指定された名称のファイルが既に存在しているか否か確認します。
 * @param fileName		確認するファイル名
 * @param parentDirId	確認先ディレクトリID
 * @param onExist		ファイルが既に存在していた場合に実行されるコールバック関数
 * @param onNone		ファイルが存在していなかった場合に実行されるコールバック関数
 */
ServerManager.checkFileExist = function(fileName, parentDirId, onExist, onNone) {
	// 親ディレクトリID を決定します
	var dirId = parentDirId;
	if (!dirId) dirId = ServerManager._docParentDirId;

	// データを作成します
	var data = { parent_id: dirId, file_name: fileName, };

	// コールバック関数を登録します
	ServerManager._onFileExist = onExist;
	ServerManager._onFileNone = onNone;

	// リクエストを発行します
	Communicator.request( 'fileExist', data, ServerManager.onSuccessFileExist, ServerManager.onErrorFileExist );
};

// 以下はコールバック関数への参照
ServerManager._onFileExist = null;
ServerManager._onFileNone = null;

ServerManager.onSuccessFileExist = function(data) {
	if (data.exists) {
		ServerManager._onFileExist();
	} else {
		ServerManager._onFileNone();
	}
};

ServerManager.onErrorFileExist = function(data) {
	alert('ファイルの重複確認に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};


///////////////////////////////////////////////////////////////////////////
// 名前を付けて保存
///////////////////////////////////////////////////////////////////////////

/**
 * 名前を付けて保存します。
 * @param fileName		保存するファイル名
 * @param dirId			保存先ディレクトリID。ServerManager に管理させている場合は undefined, null を指定します
 * @param oldDocId		元の文書ID
 * @param docXml		文書データ
 * @param paraXmlList	段落データ
 * @param force			強制保存の有無
 * @param onSuccess		成功時に実行するコールバック関数 (optional)
 * @param onError		失敗時に実行するコールバック関数 (optional)
 */
ServerManager.saveAs = function(fileName, dirId, oldDocId, docXml, paraXmlList, force, onSuccess, onError) {
	// 親ディレクトリID を決定します
	var dirId = dirId;
	if (!dirId) dirId = ServerManager._docParentDirId;

	// 送信データを作成します(強制上書きは)
	var data = ServerManager.buildSaveAsDocData(dirId, oldDocId, fileName, docXml, paraXmlList, force);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessSaveAs;

	var error = onError;
	if (!error) error = ServerManager.onErrorSaveAs;

	// リクエストを発行します
	Communicator.request( 'docSaveAs', data, success, error );
};

/**
 * 別名保存用の送信データを作成します。
 */
ServerManager.buildSaveAsDocData = function(dirId, oldDocId, fileName, docXml, paraXmlList, force) {
	var data = {
		parent_id: dirId,
		org_doc_id: oldDocId,
		new_name: fileName,
		content: docXml,
		p_list: JSON.stringify(paraXmlList),
		force: force,
	};

	return data;
};

ServerManager.onSuccessSaveAs = function(data) {
	alert('文書データの保存に成功しました。');
};

ServerManager.onErrorSaveAs = function(data) {
	alert('文書データの保存に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};


///////////////////////////////////////////////////////////////////////////
// 文書編集開始通知
///////////////////////////////////////////////////////////////////////////

/**
* 指定文書の編集開始をサーバに通知します。
*/
ServerManager.notifyOpenDocument = function(docId, onSuccess, onError) {
	// 送信データを作成します
	var data = ServerManager.buildOpenDocData(docId);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessOpenDoc;

	var error = onError;
	if (!error) error = ServerManager.onErrorOpenDoc;

	// リクエストを発行します
	Communicator.request( 'docBeginEdit', data, success, error );
};

ServerManager.buildOpenDocData = function(docId) {
	var data = { id: docId, };
	return data;
};

ServerManager.onSuccessOpenDoc = function(data) {
	//alert('編集開始通知に成功しました。');
	// 基本、何もしません。
};

ServerManager.onErrorOpenDoc = function(data) {
	//alert('編集開始通知に失敗しました。');
	// 基本、何もしません。
};


///////////////////////////////////////////////////////////////////////////
// 文書編集終了通知
///////////////////////////////////////////////////////////////////////////

/**
 * 指定文書の編集終了をサーバに通知します。
 */
ServerManager.notifyCloseDocument = function(docId) {
	// 送信データを作成します
	var data = ServerManager.buildCloseDocData(docId);

	// コールバック関数を決定します
	var success = ServerManager.onSuccessCloseDoc;
	var error = ServerManager.onErrorCloseDoc;

	// リクエストを発行します
	Communicator.request( 'docEndEdit', data, success, error );
};

ServerManager.buildCloseDocData = function(docId) {
	var data = { id: docId, };
	return data;
};

ServerManager.onSuccessCloseDoc = function(data) {
	//alert('編集終了通知に成功しました。');
	// 基本、何もしません。
};

ServerManager.onErrorCloseDoc = function(data) {
	//alert('編集終了通知に失敗しました。');
	// 基本、何もしません。
};

///////////////////////////////////////////////////////////////////////////
// セッション維持
///////////////////////////////////////////////////////////////////////////

/**
 * セッション維持のため ping を打ちます。
 */
ServerManager.updateSession = function(onError) {
	var docId = DocumentManager.getDocId();

	// 送信データを作成します
	var data = {};

	// コールバック関数を決定します
	var success = ServerManager.onSuccessUpdateSession;

	var error = onError;
	if (!error) error = ServerManager.onErrorUpdateSession;

	// リクエストを発行します
	console.log('セッション更新送信: ' + docId);
	Communicator.request( 'loginCheck', data, success, error );
};

/**
 * セッション更新成功時の処理です。自動的に次の更新処理を登録します。
 */
ServerManager.onSuccessUpdateSession = function(data) {
    // セッション維持はログインチェックAPIなので、ログイン認証されていないときは value = false
    if ((data !== null) && (data.value === false)) {
        ServerManager.onErrorUpdateSession(data);
        return;
    }

	if (ServerManager._updateSessionFlag) {
		// 300 秒ごとにセッション更新を行います
		setTimeout('ServerManager.updateSession()', 300000);
	}
};

/**
 * セッション更新失敗時の処理です。セッション更新は停止します。
 * @param data
 */
ServerManager.onErrorUpdateSession = function(data) {
	ServerManager.stopUpdateSession;
	alert('セッションの更新に失敗しました。');
};

/*************
 * 以下、セッション更新管理用。
 */

// セッション更新を停止するためのフラグです
// false に設定すると次のセッション更新後、セッション更新が停止します
ServerManager._updateSessionFlag = true;

// セッション更新の停止を予約します
ServerManager.stopUpdateSession = function() {
	ServerManager._updateSessionFlag = false;
};

// セッション更新停止の解除を予約します
// 停止後に再開したい場合、このメソッド実行後にupdateSessionを実行します
ServerManager.resetUpdateSession = function() {
	ServerManager._updateSessionFlag = true;
};

/**
 * 切断されているか否かを取得します。
 */
Object.defineProperty(ServerManager, 'Disconnected', {
	enumerable  : true,
	configurable: true,
	get: function(){ return !ServerManager._updateSessionFlag; },
});

///////////////////////////////////////////////////////////////////////////
// 設定取得
///////////////////////////////////////////////////////////////////////////

/**
 * 設定をサーバから取得します。
 * サーバ上に設定が存在しない場合、失敗が返ります。
 */
ServerManager.requestSetting = function(onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildRequestSettingData();

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestSetting;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestSetting;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorRequestSetting;

	// リクエストを発行します
	Communicator.request( 'getEditorConfig', data, success, error, false, onUnexpected );
};

ServerManager.buildRequestSettingData = function() {
	return {};
};

ServerManager.onSuccessRequestSetting = function(data) {
	alert('設定の取得に成功しました。');
	// ★成功時のコールバックは別途、ConfigManager に設定を与えるものを定義してください。
};

ServerManager.onErrorRequestSetting = function(data) {
	// 設定を取得できなかった場合は、そのままデフォルト設定で動作するため、
	// 特に何もしません。
	console.log('サーバから設定を取得できませんでした。: ' + data.message);
};

/**
 * タイムアウトなど、サーバから正常にレスポンスを取得できなかった時の処理です。
 * @param errorInfo
 */
ServerManager.onUnexpectedErrorRequestSetting = function(errorInfo) {
	console.log('設定取得時、サーバとの通信に失敗しました。');
};

///////////////////////////////////////////////////////////////////////////
// 設定保存
///////////////////////////////////////////////////////////////////////////

/**
 * 設定をサーバに保存します。
 */
ServerManager.saveSetting = function(setting, onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildSaveSettingData(setting);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessSaveSetting;

	var error = onError;
	if (!error) error = ServerManager.onErrorSaveSetting;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorSaveSetting;

	// リクエストを発行します
	Communicator.request( 'saveEditorConfig', data, success, error, false, unexpected );
};

ServerManager.buildSaveSettingData = function(setting) {
	var data = { editor_setting: setting, };
	return data;
};

ServerManager.onSuccessSaveSetting = function(data) {
	// 主にページ遷移時に設定保存は実行されるため、
	// なにもしません。（できません。）
	console.log('サーバに設定を保存しました。');
};

ServerManager.onErrorSaveSetting = function(data) {
	// 主にページ遷移時に設定保存は実行されるため、
	// なにもしません。（できません。）
	console.log('サーバに設定を保存できませんでした。' + data.message);
};

/**
 * タイムアウトなど、サーバから正常にレスポンスを取得できなかった時の処理です。
 * @param errorInfo
 */
ServerManager.onUnexpectedErrorSaveSetting = function(errorInfo) {
	console.log('設定保存時、サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 未使用アニメーションの一括整理
///////////////////////////////////////////////////////////////////////////

ServerManager.requestCleanUnusedAnime = function(docId, usedIdList, onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildRequestCleanUnusedAnime(docId, usedIdList);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestCleanUnusedAnime;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestCleanUnusedAnime;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorCleanUnusedAnime;

	// リクエストを発行します
	Communicator.request( 'animeDeleteUnused', data, success, error, false, unexpected );
};

ServerManager.buildRequestCleanUnusedAnime = function(docId, idList) {
	var data = {
			doc_id: docId,
			used_animation_id_list: JSON.stringify(idList),
	};
	return data;
};

ServerManager.onSuccessRequestCleanUnusedAnime = function(data) {
	// 何もしません。
};

ServerManager.onErrorRequestCleanUnusedAnime = function(data) {
	alert('未使用アニメーションデータの整理に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorCleanUnusedAnime = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 話者リスト取得
///////////////////////////////////////////////////////////////////////////

ServerManager.requestSpeakerList = function(onSuccess, onError, onUnexpected) {
	// 送信データはありません

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestSpeakerList;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestSpeakerList;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorSpeakerList;

	// リクエストを発行します
	Communicator.request( 'speakerList', null, success, error, false, unexpected );
};

ServerManager.onSuccessRequestSpeakerList = function(data) {
	alert('話者リストの取得に成功しました。');
};

ServerManager.onErrorRequestSpeakerList = function(data) {
	alert('話者一覧の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorSpeakerList = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 辞書情報取得
///////////////////////////////////////////////////////////////////////////

/**
 * 文書に含まれる辞書の情報を取得します。
 */
ServerManager.requestDicInfo = function(docId, onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildRequestDicInfoData(docId);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestDicInfo;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestDicInfo;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorDicInfo;

	// リクエストを発行します
	Communicator.request( 'dicInfo', data, success, error, false, unexpected );
};

ServerManager.buildRequestDicInfoData = function(docId) {
	var data = { doc_id: docId, };
	return data;
};

ServerManager.onSuccessRequestDicInfo = function(data) {
	alert('辞書情報の取得に成功しました。');
};

ServerManager.onErrorRequestDicInfo = function(data) {
	alert('辞書情報の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorDicInfo = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// データ変換サーバへの辞書登録
///////////////////////////////////////////////////////////////////////////

ServerManager.requestRegisterDic = function(docId, onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildRequestRegisterDicData(docId);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestRegisterDic;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestRegisterDic;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorRegisterDic;

	// リクエストを発行します
	Communicator.request( 'dicRegister', data, success, error, false, unexpected );
};

ServerManager.buildRequestRegisterDicData = function(docId) {
	var data = { doc_id: docId, };
	return data;
};

ServerManager.onSuccessRequestRegisterDic = function(data) {
	alert('データ変換サーバへの辞書登録に成功しました。');
};

ServerManager.onErrorRequestRegisterDic = function(data) {
	alert('データ変換サーバへの辞書登録に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorRegisterDic = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 選択可能な音声設定一覧取得
///////////////////////////////////////////////////////////////////////////

ServerManager.requestAudioSettingList = function(onSuccess, onError, onUnexpected) {
};

ServerManager.buildRequestAudioSettingList = function() {
};

ServerManager.onSuccessRequestAudioSettingList = function(data) {
};

ServerManager.onErrorRequestAudioSettingList = function(data) {
	alert('音声設定一覧の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorAudioSettingList = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 文書の音声設定取得
///////////////////////////////////////////////////////////////////////////

ServerManager.requestAudioSetting = function(docId, onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildRequestAudioSetting(docId);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestAudioSetting;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestAudioSetting;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorAudioSetting;

	// リクエストを発行します
	Communicator.request( 'voiceSettingGet', data, success, error, false, unexpected );
};

ServerManager.buildRequestAudioSetting = function(docId) {
	var data = { doc_id: docId, };
	return data;
};

ServerManager.onSuccessRequestAudioSetting = function(data) {
};

ServerManager.onErrorRequestAudioSetting = function(data) {
	alert('文書の音声設定の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorAudioSetting = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 文書の音声設定変更
///////////////////////////////////////////////////////////////////////////

ServerManager.requestSetAudioSetting = function(docId, settingId, onSuccess, onError, onUnexpected) {
};

ServerManager.buildRequestSetAudioSetting = function(docId, settingId) {
};

ServerManager.onSuccessRequestSetAudioSetting = function(data) {
};

ServerManager.onErrorRequestSetAudioSetting = function(data) {
	alert('音声設定変更に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorAudioSetting = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// ハイライト情報取得
///////////////////////////////////////////////////////////////////////////

ServerManager.requestHighlight = function(docId, paraXml, startNodeId, speakerList, request_id, onSuccess, onError, onUnexpected) {
	// 送信データを作成します
	var data = ServerManager.buildRequestHighlight(docId, paraXml, startNodeId, speakerList, request_id);

	// コールバック関数を決定します
	var success = onSuccess;
	if (!success) success = ServerManager.onSuccessRequestHighlight;

	var error = onError;
	if (!error) error = ServerManager.onErrorRequestHighlight;

	var unexpected = onUnexpected;
	if (!unexpected) unexpected = ServerManager.onUnexpectedErrorHighlight;

	// リクエストを発行します
	Communicator.request( 'highlight', data, success, error, false, unexpected );
};

ServerManager.buildRequestHighlight = function(docId, paraXml, startNodeId, speakerList, request_id) {
	var data = {
			doc_id: docId,
			p: paraXml,
			start_id: startNodeId,
			speaker_list: JSON.stringify(speakerList),
			request_id: request_id,
	};

	return data;
};

ServerManager.onSuccessRequestHighlight = function(data) {
};

ServerManager.onErrorRequestHighlight = function(data) {
	alert('ハイライト分割情報の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorHighlight = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// テスト用音声URL取得
///////////////////////////////////////////////////////////////////////////

ServerManager.requestTestSoundUrl = function(docId, paraXml, startNodeId, onSuccess, onError, onUnexpected) {
};

ServerManager.buildRequestTestSoundUrl = function(docId, paraXml, startNodeId) {
};

ServerManager.onSuccessRequestTestSoundUrl = function(data) {
};

ServerManager.onErrorRequestTestSoundUrl = function(data) {
	alert('ハイライト分割情報の取得に失敗しました。\ncode: ' + data.error_code + '\n' + data.message);
};

ServerManager.onUnexpectedErrorTestSoundUrl = function(errorInfo) {
	console.log('サーバとの通信に失敗しました。');
};

// ※テスト音声そのものは、<AUDIO>要素のsrcにURLを直接設定して再生するため、
//   取得用APIは必要ありません。（★ベースURLくらいは必要かも知れません）
