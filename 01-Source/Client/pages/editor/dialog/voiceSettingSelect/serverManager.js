function ServerManager() {};


///////////////////////////////////////////////////////////////////////////
// システム音声設定名一覧取得
///////////////////////////////////////////////////////////////////////////

/**
 * システム音声設定名リストを取得します。
 */
ServerManager.requestVoiceSettingList = function(onSuccess, onError, onUnexpected) {

    // コールバック関数を決定します
    var success = onSuccess;
    if (!success) success = ServerManager.onSuccessRequestVoiceSettingList;

    var error = onError;
    if (!error) error = ServerManager.onErrorRequestVoiceSettingList;

    var unexpected = onUnexpected;
    if (!unexpected) unexpected = ServerManager.onUnexpectedErrorVoiceSettingList;

    // リクエストを発行します
    Communicator.request( 'voiceSettingSystemList', null, success, error, false, unexpected );
};

ServerManager.onSuccessRequestVoiceSettingList = function(data) {
    alert('システム音声設定名一覧に成功しました。');
};

ServerManager.onErrorRequestVoiceSettingList = function(data) {
    alert('システム音声設定名一覧の取得に失敗しました。');
};

ServerManager.onUnexpectedErrorVoiceSettingList = function(errorInfo) {
    console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 文書の音声設定置換
///////////////////////////////////////////////////////////////////////////

/**
 * 文書音声設定の置き換えリクエストを送信します。
 */
ServerManager.requestSetVoiceSetting = function(docId, settingName, refDocId, onSuccess, onError, onUnexpected) {
    // 送信データを作成します
    var data = ServerManager.buildRequestSetDictionary(docId, settingName, refDocId);

    // コールバック関数を決定します
    var success = onSuccess;
    if (!success) success = ServerManager.onSuccessRequestSetVoiceSetting;

    var error = onError;
    if (!error) error = ServerManager.onErrorRequestSetVoiceSetting;

    var unexpected = onUnexpected;
    if (!unexpected) unexpected = ServerManager.onUnexpectedErrorSetVoiceSetting;

    // リクエストを発行します
    Communicator.request( 'voiceSettingReplace', data, success, error, false, unexpected );
};

ServerManager.buildRequestSetDictionary = function(docId, settingName, refDocId) {
    var data = {
            doc_id : docId,
            voicesetting_name: settingName,
            ref_doc_id: refDocId,
    }
    return data;
};

ServerManager.onSuccessRequestSetVoiceSetting = function(data) {
    alert('音声設定置換に成功しました。');
};

ServerManager.onErrorRequestSetVoiceSetting = function(data) {
    alert('音声設定置換に失敗しました。');
};

ServerManager.onUnexpectedErrorSetVoiceSetting = function(errorInfo) {
    console.log('サーバとの通信に失敗しました。');
};
