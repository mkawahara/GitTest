/**
 * main.js
 * ログインページの JavaScript
 */

/**
 * チャレンジ文字列
 */
var g_challenge;

/**
 * 初期化処理です。
 * DOM要素の読み込み終了時点で実行されます。
 */
$(document).ready(function() {

    // ログインしているかチェックします
    Communicator.request('loginCheck', null, function(res){
        // ログインしている場合はメニュー画面に遷移します
        if (res.value == true) {
            window.location.href = "../menu/index.html";
        }
        // ログインしていなければ、ログイン画面を表示します
        else  {

            // UIを整形します
            $('button').button();
            $('input[type="button"]').button();
            $('input[type="submit"]').button();
            setupMessageDialog();

            // チャレンジ文字列を取得します
            Communicator.request('userChallenge', {}, function(res) {
                g_challenge = res.value;
            }, g_onFailure);

            // お知らせを取得します
            requestInfomation();

            // イベントハンドラを設定します
            $('#BTN_Login').click(onLogin);
            $('#TXT_Pass').keypress(onKeyPress);
        }
    }, function(res) {});

});

/**
 * ログインボタンのイベントハンドラです。
 */
function onLogin() {

    // アカウントとパスワードを取得します
    var account = $('#TXT_Acoount').val();
    var password = $('#TXT_Pass').val();

    // アカウントとパスワードが存在することを確認します
    if (account == '' || password == '') {
        showMessageDialog('アカウントとパスワードを入力してください');
        return;
    }

    // ログイン処理を行います
	doLogin(account, password, function(res) {
        // ユーザ情報を保存します
        saveUser(res.user);

        // メニュー画面に遷移します
        window.location.href = '../menu/index.html';
    });
}

/**
 * パスワード入力テキストボックスでのキーイベントハンドラです。
 * @param event
 */
function onKeyPress(event) {
    // エンテーキー押下ならログイン処理を実行します
    if (event.keyCode == 13) onLogin()
}