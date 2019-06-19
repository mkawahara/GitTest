function ServerManager() {};


///////////////////////////////////////////////////////////////////////////
// システム辞書名一覧取得
///////////////////////////////////////////////////////////////////////////

/**
 * システム辞書名リストを取得します。
 */
ServerManager.requestDicList = function(onSuccess, onError, onUnexpected) {

    // コールバック関数を決定します
    var success = onSuccess;
    if (!success) success = ServerManager.onSuccessRequestDicList;

    var error = onError;
    if (!error) error = ServerManager.onErrorRequestDicList;

    var unexpected = onUnexpected;
    if (!unexpected) unexpected = ServerManager.onUnexpectedErrorDicList;

    // リクエストを発行します
    Communicator.request( 'dicSystemList', null, success, error, false, unexpected );
};

ServerManager.onSuccessRequestDicList = function(data) {
    alert('システム辞書名一覧に成功しました。');
};

ServerManager.onErrorRequestDicList = function(data) {
    alert('システム辞書名一覧の取得に失敗しました。');
};

ServerManager.onUnexpectedErrorDicList = function(errorInfo) {
    console.log('サーバとの通信に失敗しました。');
};


///////////////////////////////////////////////////////////////////////////
// 文書の辞書置換
///////////////////////////////////////////////////////////////////////////

/**
 * 文書辞書の置き換えリクエストを送信します。
 */
ServerManager.requestSetDictionary = function(docId, dicName, refDocId, onSuccess, onError, onUnexpected) {
    // 送信データを作成します
    var data = ServerManager.buildRequestSetDictionary(docId, dicName, refDocId);

    // コールバック関数を決定します
    var success = onSuccess;
    if (!success) success = ServerManager.onSuccessRequestSetDictionary;

    var error = onError;
    if (!error) error = ServerManager.onErrorRequestSetDictionary;

    var unexpected = onUnexpected;
    if (!unexpected) unexpected = ServerManager.onUnexpectedErrorSetDictionary;

    // リクエストを発行します
    Communicator.request( 'dicReplace', data, success, error, false, unexpected );
};

ServerManager.buildRequestSetDictionary = function(docId, dicName, refDocId) {
    var data = {
            doc_id : docId,
            dictionary_name: dicName,
            ref_doc_id: refDocId,
    }
    return data;
};

ServerManager.onSuccessRequestSetDictionary = function(data) {
    alert('辞書置換に成功しました。');
};

ServerManager.onErrorRequestSetDictionary = function(data) {
    alert('辞書置換に失敗しました。');
};

ServerManager.onUnexpectedErrorSetDictionary = function(errorInfo) {
    console.log('サーバとの通信に失敗しました。');
};
