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

	// UIを整形します
	$('button').button();
	$('input[type="button"]').button();
	$('input[type="submit"]').button();
	setupMessageDialog();

	// チャレンジ文字列を取得します
	Communicator.request('userChallenge', {}, function(res) {
			g_challenge = res.value;
	}, g_onFailure);

	// イベントハンドラを設定します
	$('#BTN_Login').click(onLogin);
	$('#logout_btn').click(onLogout);

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

	// アカウントとパスワードのハッシュ文字列を取得します
	var passwordHash = getHash(account + ':' + password);

	// レスポンス文字列を生成します
	var response = getHash(passwordHash + ':' + g_challenge);

	// パスワードとチャレンジ文字列を消去します
	$('#TXT_Pass').val('');
	$('#HDN_Challenge').val('');

	// リクエストを送信します
	Communicator.request('userLogin', {'account': account, 'response': response}, function(res) {
		// ユーザ情報を保存します
		saveUser(res.user);

		// 文書編集ページに再ログインを通知します
		window.opener.MessageManager.restartPing();

		showMessageDialog('このウィンドウが閉じた後、再度、保存等の操作を行ってください。');
		window.close();
	}, g_onFailure);
}

/**
 * SHA-256 によるハッシュ文字列を取得します。
 * @param inputString
 */
function getHash(inputString) {
	var sha = new jsSHA(inputString, 'TEXT');
	return sha.getHash('SHA-256', 'HEX');
}
