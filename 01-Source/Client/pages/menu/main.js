/**
 * main.js
 * メニューページの JavaScript
 */


const accountUrl = 'https://infty3.nittento.or.jp/AMM/';

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

	// ユーザ情報がなくとも動作する部品の機能を割り当てます

    // ログアウトボタン
    $('#logout_btn').click(onLogout);
    // 文書管理画面のボタン
    $('#BTN_DocEdit').click(function() {
       window.location.href = '../filer/index.html';
    });

    // ログインされていることを確認します
    confirmLogin();

    // ユーザ情報を取得します
    var user = getUser();
    var userKind = 1;			// 現在のユーザを仮に一般ユーザとします
    if (user != null) {
        $('#user_name').text(user.name);
        userKind = (user.kind !== void 0) ? user.kind : 1;	// ユーザ情報からユーザ種別を取得します (取得できない時は一般ユーザ扱いです)
    }

    // チャレンジレスポンス文字列を取得します
    var cres = getChallangeRes();
    var responseStr = '';
    if (cres != null) responseStr = cres.cres;

    // イベントハンドラを設定します
	var account = user.account.replace('@', '%40');

    // アカウント管理画面のボタン
	$('#BTN_Account').click(function() {
		window.location.href = accountUrl + 'memberdetail?loginid=' + account + '&cres=' + responseStr;
	});

    // グループ管理画面のボタン
    $('#BTN_Group').click(function() {
       window.location.href = accountUrl + 'grouplist?loginid=' + account + '&cres=' + responseStr;
    });

    if (userKind === 2) {
		// 代表者メニューを表示します
		$('#_delegateMenu').show();

	    // 代表者：会員管理画面のボタン
	    $('#BTN_DelegateMember').click(function() {
	       window.location.href = accountUrl + 'memberlist?loginid=' + account + '&cres=' + responseStr;
	    });

	    // 代表者：登録情報編集画面のボタン
	    $('#BTN_DelegateAccount').click(function() {
	       window.location.href = accountUrl + 'orgdetail?loginid=' + account + '&cres=' + responseStr;
	    });
    }
    else {
	    $('#_delegateMenu').hide();
    }

    if (userKind === 3) {
		// 管理者メニューを表示します
		$('#_rootMenu').show();

	    // 管理者：申請一覧画面のボタン
	    $('#BTN_RootApplicationList').click(function() {
	       window.location.href = accountUrl + 'orgentrylist?loginid=' + account + '&cres=' + responseStr;
	    });

	    // 管理者：登録会員情報管理画面のボタン
	    $('#BTN_RootMember').click(function() {
	       window.location.href = accountUrl + 'orgmemberlist?loginid=' + account + '&cres=' + responseStr;
	    });

	    // 管理者：お知らせ管理画面のボタン
	    $('#BTN_RootInfomation').click(function() {
	       window.location.href = accountUrl + 'infolist?loginid=' + account + '&cres=' + responseStr;
	    });

	    // 管理者：グループリスト画面のボタン
	    $('#BTN_RootGroup').click(function() {
	       window.location.href = accountUrl + 'grouplist?loginid=' + account + '&cres=' + responseStr;
	    });
    }
    else {
	    $('#_rootMenu').hide();
    }

});
