/*************************************
 * ログイン処理を定義しています。
 *************************************/


/**
 * ログイン処理を行います
 */
function doLogin(account, password, onLoginSuccess) {

    // アカウントとパスワードのハッシュ文字列を取得します
    var passwordHash = getHash(account + ':' + password);

    // レスポンス文字列を生成します
    var response = getHash(passwordHash + ':' + g_challenge);

    // レスポンス文字列を Web Storage に保存します (ログインできない無効なものでも保存します)
    var cres = { 'cres': response, };
    saveChallangeRes(cres);

    // パスワードとチャレンジ文字列を消去します
    $('#TXT_Pass').val('');
    $('#HDN_Challenge').val('');

    // リクエストを送信します
    Communicator.request(
    		'userLogin',
    		{'account': account, 'response': response},
    		onLoginSuccess,
    		function(res) {
    			Communicator.request('userChallenge', {}, function(res) { g_challenge = res.value; }, g_onFailure),
    			g_onFailure(res)
    		});
}

/**
 * SHA-256 によるハッシュ文字列を取得します。
 * @param inputString
 */
function getHash(inputString) {
    var sha = new jsSHA(inputString, 'TEXT');
    return sha.getHash('SHA-256', 'HEX');
}

