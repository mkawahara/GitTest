/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： fileMenuEvent.js                                   */
/* -                                                                         */
/* -    概      要     ： ファイルメニュー用イベントハンドラ                 */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年05月01日                         */

function FileMenuEventHandler() {};


////////////////////////////////////////////////////////////////
// 保存実行インターフェース
////////////////////////////////////////////////////////////////

/**
 * 上書き保存
 */
FileMenuEventHandler.onClickSave = function() {
	if (DocumentManager.isEditable() === -1) showMessageDialog('読み上げモードの時は保存はできません。', '操作エラー');
	if (DocumentManager.isEditable() !== true) return;
	MainToolClass.MT_Save();
};

/**
 * 別名保存
 */
FileMenuEventHandler.onClickSaveAs = function() {
	if (DocumentManager.isEditable() !== true) return;
	// 接続が切れている時は、再ログインウィンドウを出すだけです
	if (ServerManager.Disconnected) {
		WindowManager.instance.openReLoginWindow();
		return;
	}

	// ファイル名選択して、ダイアログでOK時に保存を実行します
	$('#_inputFileNameDialog').dialog('open');
};

/**
 * 別文書を挿入します
 */
FileMenuEventHandler.onClickInsertDoc = function() {
	if (DocumentManager.isEditable() !== true) return;
	// 接続が切れている時は、再ログインウィンドウを出すだけです
	if (ServerManager.Disconnected) {
		WindowManager.instance.openReLoginWindow();
		return;
	}

    WindowManager.instance.openFileSelectWindow();
}

//別名保存用ファイル名
FileMenuEventHandler.saveFileName = null;


////////////////////////////////////////////////////////////////
// 内部メソッド
////////////////////////////////////////////////////////////////

/**
 * ファイル名入力ダイアログでOKを押した時の処理です
 */
FileMenuEventHandler.onClickOkOnSaveAsDialog = function(fileName) {
	ServerManager.checkFileExist(fileName, void 0, FileMenuEventHandler.onFileExist, FileMenuEventHandler.onFileNone);
	FileMenuEventHandler.saveFileName = fileName;
};

/**
 * 同名のファイルが既に存在していた場合の処理です
 */
FileMenuEventHandler.onFileExist = function() {
	$('#_overwriteFileDialog').dialog('open');
};

/**
 * 同名のファイルが存在しなかった場合の処理です
 */
FileMenuEventHandler.onFileNone = function() {
	FileMenuEventHandler.saveAs(FileMenuEventHandler.saveFileName, false);
};

/**
 * 上書き確認で「はい」を選択した時の処理です
 */
FileMenuEventHandler.onClickForceOnOverwriteDialog = function() {
	FileMenuEventHandler.saveAs(FileMenuEventHandler.saveFileName, true);
};

/**
 * 上書き確認で「いいえ」を選択した時の処理です
 */
FileMenuEventHandler.onClickNoOnOverwriteDialog = function() {
	FileMenuEventHandler.saveFileName = null;
};

/**
 * 別名保存処理です
 * @param fileName
 * @param force
 */
FileMenuEventHandler.saveAs = function(fileName, force) {
	// ---- ダイアログ表示
	$('#Dialog_SaveStatus').dialog({
		modal:     true,  // モーダルダイアログ。
		draggable: false, // ドラッグによる位置変更を許可しない。
		resizable: false, // サイズ変更を許可しない。
	});

	// 保存を実行します。
	var doc = DocumentManager.instance.currentDocument;
	var docId = DocumentManager.getDocId();
	ServerManager.saveAs(fileName, void 0, docId, doc.toXml(), doc.getParagraphXmlList(), force,
			FileMenuEventHandler.onSuccessSaveAs, FileMenuEventHandler.onErrorSaveAs);
};

FileMenuEventHandler.onSuccessSaveAs = function(data) {
	// 文書ID を保存します
	DocumentManager.setDocId(data.id);
	_fileNameLabel.textContent = FileMenuEventHandler.saveFileName;
	DocumentManager.instance.fileName = FileMenuEventHandler.saveFileName;

	// 別名保存の終了処理です
	$('#Dialog_SaveStatus').dialog('close');                // 保存中ダイアログを閉じます。
	ViewManager.getStatusManager().setSaveAttribute(false); // 上書き保存アイコンを無効化します。

	FileMenuEventHandler.saveFileName = null;
};

FileMenuEventHandler.onErrorSaveAs = function(data) {
	$('#Dialog_SaveStatus').dialog('close');                // 保存中ダイアログを閉じます。
	alert('保存に失敗しました。\n' + data.message);         // 保存失敗を警告します。

	FileMenuEventHandler.saveFileName = null;
};
