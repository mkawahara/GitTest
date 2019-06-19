/**
 * このファイルでは、ページロード時の初期化処理、あるいはその呼び出しを記述しています。
 */

// ------------- ブラウザがドキュメントを読み込んだ直後に実行されます。
$(document).ready( function () {
	console.log('ページの初期化を開始します。');
	console.log('ユーザ情報を表示します');
    showUserName();             // ユーザ情報を表示します

    // 設定を取得します
	console.log('設定を取得します。');
	ConfigManager.instance.load();

	// ページ部品クラスを初期化します
	console.log('ページの部品クラスを初期化します。');
	MenuBarClass.Init();						// メニューバー クラス
	MainToolClass.Init();						// メインツール クラス
	EditorToolClass.Init();						// ツールバー クラス
	ViewManager.getIndexPane().Init();			// インデックスツール クラス
	StatusBarClass.Init();						// ステータスバー クラス
	ToolbarUtilityClass.Init();					// ツールバーユーティリティー クラス
	ViewManager.getEditorPane().Init();			// エディタペーン クラス
	// ！！！注意！！！エディタペーンクラスは、ステータスマネージャより先に初期化されている必要があります。
	// (Caret インスタンス生成の都合上)

	// 話者リストを取得します
	console.log('話者リストを取得します。');
	getSpeakerList();

	// 話者リストがなければ初期化できないクラスを初期化します
	// ★これ、話者リスト取得成功時のコールバックに入れるべきです。
	ViewManager.getStatusManager().Init();		// ステータスマネージャ クラス

	// MathJAX を初期化します
	console.log('MathJAX を初期化します。');
	MathJax.Hub.Configured();

	// 文書に関連するデータを取得します（文書本体はここでは取得しません）
	console.log('文書データを初期化します。');
	GetDocumentInfo();							// 文書ファイル情報
	getDicInfo();								// 文書辞書情報を取得し、辞書名をページに表示します
	getAudioSettingInfo();						// 音声設定を取得し、タイトルをページに表示します

	// 文書の編集開始を通知します
	console.log('文書の編集開始をサーバに通知します。');
	notifyBeginEdit();

	//DocumentManager.init();						// DocumentManager を初期化し、文書本体のデータをサーバから取得します
	//UnloadEvents.init();						// ページ終了イベントを登録します
	console.log('接続維持サイクルを開始します。');
	ServerManager.onSuccessUpdateSession(null);	// 接続維持コマンドの自動実行を開始します

	// ダイアログを初期化します
	console.log('ページ内ダイアログを初期化します。');
	createSaveAsDialogs();
	createLoadingDialog();
	createImagePasteDialog();

	// ページ全体の keydown を設定します
	console.log('ショートカットを初期化します。');
	DocumentShortcutHandler.init();

	// ポップアップメニューを禁止します
	console.log('ブラウザのポップアップを禁止します。');
	forbiddenBrowserPopup();

    // メッセージダイアログを初期化します
	console.log('メッセージダイアログを初期化します。');
    setupMessageDialog();
});

/**
 * ユーザ情報を取得して名前表示します。
 */
function showUserName() {
    // ユーザ情報を取得します
    var user = getUser();
    if (user != null) {
        $('#user_name').text(user.name);
    }
}

/**
 * 話者リストを取得し、話者メニューを作成します
 */
function getSpeakerList() {
	ServerManager.requestSpeakerList(
			// 取得成功時のコールバック
			function(data) {
				var list = data.speaker_list;
				PopupMenu.setSpeakerList(list);
				PopupMenu.CreateMenu(ID_MB_DDM_READING);
				ConfigManager.instance.SpeakerList = list;

				PopupMenu.colorSpeakerIcon(); // 話者リストアイコンに色を付ける
			},
			// サーバ上での処理エラー時のコールバック
			function(data) {
				var list = [];
				PopupMenu.setSpeakerList(list);
				PopupMenu.CreateMenu(ID_MB_DDM_READING);
				ConfigManager.instance.SpeakerList = list;
			},
			// 想定されないエラー時のコールバック
			function(errorInfo) {
				var list = [];
				PopupMenu.setSpeakerList(list);
				PopupMenu.CreateMenu(ID_MB_DDM_READING);
				ConfigManager.instance.SpeakerList = list;
			}
		);
}

///////////////////////////////////////////////////////////////////////////////
// 右クリックポップアップの禁止
///////////////////////////////////////////////////////////////////////////////

function forbiddenBrowserPopup() {
	document.oncontextmenu = function(event) {
		event.preventDefault();
	};
};

///////////////////////////////////////////////////////////////////////////////
// 文書の補助情報の取得と表示
///////////////////////////////////////////////////////////////////////////////

/**
 * ページロード時に文書ファイル情報を取得し、文書タイトルをページに表示します
 */
function GetDocumentInfo() {
	var docId = DocumentManager.getDocIdFromParam();
	ServerManager.requestFileInfo(docId, _fileNameLabel);
};

/**
 * ページロード時に文書辞書情報を取得し、辞書タイトルをページに表示します
 */
function getDicInfo() {
	var docId = DocumentManager.getDocIdFromParam();
	ServerManager.requestDicInfo(docId, receiveDicInfo);
};

function receiveDicInfo(data) {
	_docDicTitleLabel.textContent = data.info.name;
};

/**
 * ページロード時に文書音声設定情報を取得し、そのタイトルをページに表示します
 * ★このメソッドと次のメソッドは、音声設定のタイトルの定義がなされるまで、実装できません。★
 */
function getAudioSettingInfo() {
	var docId = DocumentManager.getDocIdFromParam();
	ServerManager.requestAudioSetting(docId, receiveAudioSetting, receiveAudioSetting, receiveAudioSetting);
};

function receiveAudioSetting(data) {
	var settingName = '音声設定名未実装';
	var voiceSetting = $(data.voice_setting);
	if (voiceSetting.attr('name')) settingName = voiceSetting.attr('name');
	_docAudioSettingTitleLabel.textContent = settingName;
};


///////////////////////////////////////////////////////////////////////////////
// 編集および辞書の通知 (解除は exitPage.js にて。)
///////////////////////////////////////////////////////////////////////////////

function notifyBeginEdit() {
	// ReadOnly でなければ、編集権限を取得します
	if (!DocumentManager.isReadOnly()) {
		var docId = DocumentManager.getDocIdFromParam();
		ServerManager.notifyOpenDocument(docId, successBeginEdit, failureBeginEdit);
	}
	// ReadOnly の場合、編集権限の取得をスキップして編集(実際には文書取得)を開始します
	else {
		successBeginEdit(null);
	}
};

function successBeginEdit(data) {
	// データ変換サーバに辞書を登録します
	registerDic();
	// DocumentManager を初期化し、文書本体のデータをサーバから取得します
	DocumentManager.init();

	// ページ終了イベントを登録します
	UnloadEvents.init();
};

function failureBeginEdit(data) {
	if (!DocumentManager.isReadOnly()) {
		showMessageDialog(
				'文書の編集権限を取得できなかったため、前のページに戻ります。',
				'編集権エラー',
				function() { window.location = '../filer/'; }
			);
	}
};

function registerDic() {
	var docId = DocumentManager.getDocIdFromParam();
	ServerManager.requestRegisterDic(docId, successRegisterDic, failureRegisterDic, failureRegisterDic);
};

function successRegisterDic(data) {
	ReadManager.instance.Enabled = true;
};

function failureRegisterDic(data) {
	ReadManager.instance.Enabled = false;
	showMessageDialog('データ変換サーバへの辞書登録に失敗しました。ページをリロードするまで、読み上げに関する機能は使用できません。', '読み上げ機能エラー');
};


///////////////////////////////////////////////////////////////////////////////
// ダイアログの初期化
///////////////////////////////////////////////////////////////////////////////

/**
 * 名前を付けて保存処理で使用するダイアログを初期化します。
 */
function createSaveAsDialogs() {
	// ファイル名入力ダイアログ
	$('#_inputFileNameDialog').dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			'OK': function() {
				// ファイル名を取得します
				var fileName = _inputFileNameTextbox.value;
				FileMenuEventHandler.onClickOkOnSaveAsDialog(fileName);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
	});

	// 上書き確認ダイアログ
	$('#_overwriteFileDialog').dialog({
		resizable: false,
		modal: true,
		autoOpen: false,
		buttons: {
			'はい': function() {
				FileMenuEventHandler.onClickForceOnOverwriteDialog();
				$( this ).dialog( "close" );
			},
			'いいえ': function() {
				FileMenuEventHandler.onClickNoOnOverwriteDialog();
				$( this ).dialog( "close" );
			}
		},
	});
};

/**
 * 別文書読み込み中ダイアログを作成します
 */
function createLoadingDialog() {
	$('#Dialog_LoadAdditionalDocument').dialog({
		resizable: false,
		draggable: false, // ドラッグによる位置変更を許可しない。
		modal: true,
		autoOpen: false,
	});
};

/**
 * IE 用の画像貼り付けダイアログを作成します
 * 2017/06/22 呼び出す部品が非表示のため、事実上使用されません
 */
function createImagePasteDialog() {
	$('#_imagePasteDialog').dialog({
		resizable: false,
		draggable: false, // ドラッグによる位置変更を許可しない。
		modal: true,
		autoOpen: false,
		open: function(event, ui) {
			_pasteForIe.innerHTML = '';
			_pasteForIe.focus();
			window.setTimeout(PasteDialogEventHandler.onTimer, 20);
		},
	});
};
