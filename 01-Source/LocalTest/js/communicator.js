/**
 * 通信を行うためのクラスです。
 */

// リクエストのタイムアウト時間 (ms)
const REQUEST_TIMEOUT_LENGTH = 40000;

function Communicator() {

	// アプリケーションのルートを指定します。
	// ★ここは相対パスの方がアプリケーション配置が楽。
	//   絶対パスで書いてしまうと、ローカルでのテストと配置時とで書き換えなくてはならず、
	//   余計な修正が必要になってしまう。
	this.appRoot = '../..';
//	this.appRoot = 'http://chatty.chino-js.com:59924/Editor';

	// キーと対応するURL文字列を指定します。
	this.urlList = {
		// ●ユーザ認証
		userChallenge : '/user/challenge',					// チャレンジレスポンス文字列取得
		userLogin : '/user/login',							// ログイン
//		loginCheck : '/user/haslogined',					// ログイン確認、接続維持
		loginCheck: '/pages/editor/json/logincheck.json',
		userLogout : '/user/logout',						// ログアウト

		// ●各種設定
		getUserConfig : '/usersetting/get',							// ユーザ設定取得
		saveUserConfig : '/usersetting/save',						// ユーザ設定保存
		getEditorConfig : '/editorsetting/get',						// エディタ設定取得
		//getEditorConfig : '/pages/editor/json/config.json',
		saveEditorConfig : '/editorsetting/save',					// エディタ設定保存
		//saveEditorConfig : '/pages/editor/json/configsave.json',

		// ●ファイル情報
		fileTree : '/file/tree',						// ファイルツリー取得
		fileCreate : '/file/create',					// ファイル等新規作成
		fileMove : '/file/move',						// ファイル等移動
		fileDelete : '/file/delete',					// ファイル等削除
		fileRename : '/file/rename',					// ファイル等リネーム
//		fileExist : '/file/exists',						// ファイル存在確認
		fileExist : '/pages/editor/json/exist.json',
		fileCopy : '/file/copy',						// ファイルのコピー

		fileImport : '/file/import',					// imlx からの変換
		fileImportInfo : '/file/importinfo',			// imlx からの変換
		fileExport : '/file/export',					// imlx への変換
		fileExportInfo : '/file/exportinfo',			// imlx への変換

		// ●文書編集
//		docFile : '/doc/file',							// ファイル情報取得
		docFile : '/pages/editor/json/file.json',
//		docBeginEdit : '/doc/beginedit',				// 編集権限の取得
		docBeginEdit : '/pages/editor/json/beginedit.json',
		docforceEdit : '/doc/forceedit',				// 編集権限の強制取得
		docEndEdit : '/doc/endedit',					// 編集終了通知
//		docInfo : '/doc/info',							// 文書データ取得
		docInfo : '/pages/php/doc.php',
//		docP : '/doc/p',									// 段落データ取得
		docP: '/pages/php/para.php',
		docSave : '/doc/save',
		//docSave : '/pages/editor/json/save.json',			// 文書の上書き保存
		docSaveAs: '/doc/saveas',
		//docSaveAs: '/pages/editor/json/saveas.json',		// 文書の別名保存

		// ●アニメーション編集
		animeGet:	'/animation/get',						// アニメーション取得
		animeSave:   '/animation/save',						// アニメーション保存
		animeDelete: '/animation/delete',					// アニメーション削除
		animeDeleteUnused: '/animation/deleteunused',		// 未使用アニメーション整理

		// ●話者情報
//		speakerList : '/speaker/list',					// 話者一覧取得
		speakerList: '/pages/editor/json/speaker.json',

		// ●辞書情報
		dicSystemList:  '/dictionary/systemlist',			// システム辞書名一覧
		dicGet : '/dictionary/get',							// 文書辞書取得
		dicSave : '/dictionary/save',						// 文書辞書保存
		dicReplace : '/dictionary/replace',					// 文書辞書置換
//		dicInfo : '/dictionary/info',						// 文書辞書情報
//		dicInfo: '/json/dicinfo.json',
		dicInfo: '/pages/editor/json/dicinfo.json',
//		dicRegister : '/dictionary/notify',					// 文書辞書登録通知 for 音声サーバ
//		dicRegister : '/dictionary/register',
		dicRegister : '/pages/editor/json/dicregister.json',
		dicUnregister: '/dictionary/unregister',			// 文書辞書登録解除通知 for 音声サーバ
//		dicUnregister: '/pages/editor/json/dicunreg.json',

		// ●音声設定情報
		voiceSettingSystemList : '/voicesetting/systemlist',	// システム音声設定名一覧
		voiceSettingGet : '/voicesetting/get',					// 音声設定取得
		voiceSettingSave : '/voicesetting/save',				// 音声設定保存
		voiceSettingReplace : '/voicesetting/replace',			// 音声設定置換

		// ●変換設定情報
		convertSettingGet : '/convertsetting/get',				// 変換設定取得
		convertSettingSave : '/convertsetting/save',			// 変換設定保存

		// ●文書のエクスポート
		exportable : '/export/available',				// エクスポート可能性の確認
		exportStart : '/export/start',					// エクスポート変換開始
		exportStatus : '/export/status',				// エクスポート変換状態確認
		//exportStatus : '/pages/filer/json/exportstatus.json',
		exportFile : '/export/file',					// エクスポート変換済みデータ取得
		exportCancel : '/export/cancel',				// エクスポート変換キャンセル
		exportCount : '/export/count',					// エクスポート変換数取得
		//exportCount : '/pages/filer/json/exportcount.json',

		// ●音声読み上げ
		highlight : '/voice/highlight',					// ハイライト取得
		//highlight: '/pages/php/highlight.php',
		audio : '/voice/data',							// 音声取得
		//audio: '/pages/php/audio.php',
		audioTest : '/voice/testdata',					// テスト用音声データURL取得
		readText : '/voice/readtext',					// 読み上げテキストの取得

		// ●文字コード処理
		sjisCheck : '/encoding/sjischeck',				// SJIS変換確認
	};
};

/**
 * 唯一の Communicator オブジェクトへの参照を保持します
 */
Communicator.instance = null;

/**
 * Communicator で定義されている URL を取得します。
 */
Communicator.getUrl = function(urlid) {
	if (!Communicator.instance) Communicator.instance = new Communicator();
	if (Communicator.instance.urlList[urlid] == null) {
	    console.error(urlid + ' はAPIとして定義されていません');
	}
	return Communicator.instance.appRoot + Communicator.instance.urlList[urlid];
};

/**
 * 通信を行うための静的メソッドです。
 * @param urlid					送信先 URL を指定するためのキー文字列
 * @param data					送信データ (json)
 * @param success_listener		成功時に実行されるべきコールバック関数
 * @param error_listener		失敗時に実行されるべきコールバック関数
 * @param hasFileData			ファイルデータが存在する（省略可能）
 * @param unexpected_listener	予期せぬ障害時に実行されるべきコールバック関数 (省略可能)
 */
Communicator.request = function(urlid, data, success_listener, error_listener, hasFileData, unexpected_listener) {

	// デフォルトはファイルデータを含まない
	if (typeof hasFileData === 'undefined') hasFileData = false;

	// インスタンスが存在しなければ作成します
	if (!Communicator.instance) {
		Communicator.instance = new Communicator();
	};
	if (!success_listener) throw 'リクエスト成功時の処理が指定されていません。';
	if (!error_listener) throw 'リクエスト失敗時の処理が指定されていません。';

	// URL 文字列を決定します
	var url = Communicator.instance.appRoot + Communicator.instance.urlList[urlid];
	if (url == (void 0)) throw 'Invalid URL Key.';

	$.ajax({
		type:			'POST',
		dataType:		'json',
		timeout:		REQUEST_TIMEOUT_LENGTH,
		url:			url,
		data:			data,
		contentType:	hasFileData ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
		processData:	hasFileData == false,
		headers:		{ "If-Modified-Since" : "Thu, 01 Jun 1970 00:00:00 GMT" },
		success: function(res) {
			// 正常にサーバの処理が終了した場合
			if (res.error_code == 0) {
				success_listener(res);
			}
			// 想定内のエラーでサーバの処理が終了した場合
			else {
				error_listener(res);
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			// 想定されない形でリクエストが終了した場合
			console.log('XHR responseText at Error: \n' + XMLHttpRequest.responseText);

			// エラー情報を有するオブジェクトを１つにまとめます
			var error_info = {
					XMLHttpRequest: XMLHttpRequest.status,
					textStatus: textStatus,
					errorThrown: errorThrown.message
			};

			// 処理が定義されている場合、その処理を実行します
			if(unexpected_listener) {
				unexpected_listener(error_info);
				return;
			}

			// 処理が定義されていない場合、エラー情報が表示されます

			// タイムアウトによる終了
			if ((parseInt(XMLHttpRequest.status) == 0) && (textStatus == "timeout")) {
				alert('サーバへのリクエストがタイムアウトしました。');
				return;
			}

			// その他の予期せぬエラーではエラー情報を表示します
			error_info.getText = function() {
				return "(1)" + error_info.XMLHttpRequest + ", (2)" + error_info.textStatus + ", (3)" + error_info.errorThrown;
			};

			alert("connection error with " + url + " --- " + error_info.getText());
		},
	});
};

/**
 * 同期にてサーバにリクエストを発行します
 */
Communicator.requestSync = function(urlid, data, success_listener, error_listener) {

	// インスタンスが存在しなければ作成します
	if (!Communicator.instance) {
		Communicator.instance = new Communicator();
	};

	// URL 文字列を決定します
	var url = Communicator.instance.appRoot + Communicator.instance.urlList[urlid];
	if (url == (void 0)) throw 'Invalid URL Key.';

	$.ajax({
		type:			'POST',
		dataType:		'json',
		timeout:		REQUEST_TIMEOUT_LENGTH,
		url:			url,
		data:			data,
		headers:		{ "If-Modified-Since" : "Thu, 01 Jun 1970 00:00:00 GMT" },
		success: function(res) {
		    // 正常にサーバの処理が終了した場合
            if (res.error_code == 0) {
                if (success_listener) success_listener(res);
            }
            // 想定内のエラーでサーバの処理が終了した場合
            else {
                if (error_listener) error_listener(res);
            }
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
		    // 想定されない形でリクエストが終了した場合
		    console.log('XHR responseText at Error: \n' + XMLHttpRequest.responseText);

		    // エラー情報を有するオブジェクトを１つにまとめます
		    var error_info = {
		            XMLHttpRequest: XMLHttpRequest.status,
		            textStatus: textStatus,
		            errorThrown: errorThrown.message
		    };

		    // タイムアウトによる終了
		    if ((parseInt(XMLHttpRequest.status) == 0) && (textStatus == "timeout")) {
		        alert('サーバへのリクエストがタイムアウトしました。');
		        return;
		    }

		    // その他の予期せぬエラーではエラー情報を表示します
		    error_info.getText = function() {
		        return "(1)" + error_info.XMLHttpRequest + ", (2)" + error_info.textStatus + ", (3)" + error_info.errorThrown;
		    };

		    alert("connection error with " + url + " --- " + error_info.getText());
		},
		async: false,
	});
};
