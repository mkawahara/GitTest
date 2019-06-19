/**
 * 通信以外の共通処理を定義します。
 */


/**
 * ユーザ情報の保存キー
 */
const LOCAL_STRAGE_KEY_USER ='ChattyInftyOnline-CJS-User-Key';

// チャレンジレスポンス文字列の保存キー
const LOCAL_STORAGE_KEY_CRES = 'ChattyInftyOnline-CJS-Challenge-Response';

/**
 * リスエスト失敗時のコールバック関数です。
 */
var g_onFailure = function(res) {
    // エラーメッセージを表示します
    showMessageDialog(res.message, '通信エラー');
};

/**
 * ログインしていることを確認します。
 * @param callback ログイン済みの時に実行するコールバック
 */
function confirmLogin(callback) {
    Communicator.request('loginCheck', null, function(res){
        // ログインしていない場合はメッセージを表示してログイン画面に遷移します
        if (res.value == false) {
            showMessageDialog('ログインしていません', 'メッセージ', function() {
              window.location.href = "../login/index.html";
            });
        }
        // ログインしていれば、コールバックを実行します。
        else if (callback) {
            callback();
        }
    }, function(res) {});
}


/**
 * ログアウトのイベントハンドラです。
 */
function onLogout() {
    Communicator.request('userLogout', {}, function(){
        // ログアウトしたことを表示します
        showMessageDialog('ログアウトしました', 'メッセージ', function () {
          window.location.href = "../login/index.html";
        });
    }, g_onFailure);
}

/**
 * メッセージダイアログを作成します
 */
function setupMessageDialog() {
    $('#DLG_Message').dialog({
        autoOpen: false,
        width: 400,
        modal: true,
        buttons: {
          OK: function() {
            $( this ).dialog( "close" );
          }
        }
      });
}


/**
 * メッセージダイアログを表示します。
 */
function showMessageDialog(message, title, response, label) {
//    alert(message);

    // ボタンの処理を定義します
    var buttons = {};
    if (label == null) label = 'OK';
    if (response) buttons[label] = function() { response(); $(this).dialog('close'); };
    else buttons[label] = function() { $(this).dialog('close'); };

    // タイトルを定義します
    var titleNew = 'メッセージ';
    if (title) titleNew = title;

    // ダイアログを表示します
    var dialogObj = $('#DLG_Message');
    dialogObj.dialog('option', {
      title: titleNew,
      buttons: buttons,
    });
    dialogObj.html(message);
    dialogObj.dialog('open');
}

/**
 * ユーザ情報を保存します
 * @param user
 */
function saveUser(user) {
    var str = JSON.stringify(user);
    localStorage.setItem(LOCAL_STRAGE_KEY_USER, str);
}

/**
 * ユーザ情報を取得します
 * @returns
 */
function getUser() {
    var json = localStorage.getItem(LOCAL_STRAGE_KEY_USER);
    if ((json == 'undefined') || !json) return null;
    return JSON.parse(json);
}

/**
 * ユーザ情報を削除します
 */
function removeUser() {
    localStorage.removeItem(LOCAL_STRAGE_KEY_USER)
}


/**
 * チャレンジレスポンス文字列を保存します
 * @param user
 */
function saveChallangeRes(cres) {
    var str = JSON.stringify(cres);
    localStorage.setItem(LOCAL_STORAGE_KEY_CRES, str);
}

/**
 * チャレンジレスポンス文字列を取得します
 * @returns
 */
function getChallangeRes() {
    var json = localStorage.getItem(LOCAL_STORAGE_KEY_CRES);
    if ((json == 'undefined') || !json) return null;
    return JSON.parse(json);
}

/**
 * チャレンジレスポンス文字列を削除します
 */
function removeChallangeRes() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_CRES)
}


/**
 * ブラウザが Edge なら true, その他なら false を返します
 * @returns {Boolean}
 */
function browserIsEdge() {
	var name = navigator.userAgent.toLowerCase();
	var version = navigator.appVersion.toLowerCase();

	return ((name.indexOf('edge') > 0) && (version.indexOf('edge') > 0));
};

/**
 * ブラウザが Edge なら true, その他なら false を返します
 * @returns {Boolean}
 */
function browserIsChrome() {
	var name = navigator.userAgent.toLowerCase();
	var version = navigator.appVersion.toLowerCase();

	return ((name.indexOf('chrome') > 0) && (version.indexOf('chrome') > 0));
};
