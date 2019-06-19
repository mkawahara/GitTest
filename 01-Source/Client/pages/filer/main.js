/**
 * ファイル操作ページの JavaScript
 */

const TASK_MAX_TRY = 1000;              // タスク完了問い合わせの最大回数
const TASK_INTERVAL = 500;              // タスク完了問い合わせインターバル（ミリ秒）
const CODE_DOC_OTHER = 700;             // 開く文書を他のユーザが編集中であることを表すエラーコード
const CONVERT_STATUS_INTERVAL = 1500;          // 変換状態確認処理のインターバル（ミリ秒）
const CONVERT_DOC_MAX = 10;             // 文書変換可能数の上限
const LOCAL_STRAGE_KEY_FOLDER ='ChattyInftyOnline-CJS-Folder-Key'; // 開いた文書の親フォルダIDを保持するローカルストレージのキー

/*==========================================================*/
/* 初期化 */
/*==========================================================*/

/**
 * 初期化処理です。 DOM要素の読み込み終了時点で実行されます。
 */
$(document).ready(function() {

    // UIを整形します
    $('button').button();
    $('input[type="button"]').button();
    $('input[type="submit"]').button();
    $('#DLG_Input').dialog({
        autoOpen: false,
        width: 400,
        modal: true,
    });
    $('#DLG_Confirm').dialog({
        autoOpen: false,
        width: 400,
        modal: true,
    });
    $('#DLG_InputValue').focus(function() {$(this).select();});
    setupMessageDialog();

    // 選択ファイルを削除します
    $('#upload_file').val('');

    // 全てのボタンを有効にします
    $('input[type="image"]').removeAttr('disabled');

    // ポップアップメニューを禁止します
    forbiddenBrowserPopup();

//    // ファイラ内でのドラッグ選択を無効にします
//    $('#filer_pane').disableSelection();

    // ログインされていることを確認します
    confirmLogin(function() {
        // 新規作成時に選べる辞書の名前を取得します
        Communicator.request('dicSystemList', null, function(res) {
            var dicList = res.system_dictionary_list;
            var select = $('#DLG_InputSelect');
            select.empty();
            for (var i=0; i<dicList.length; i++) {
                select.append($('<option>').val(i).text(dicList[i]));
            }
        }, g_onFailure);

        // ユーザ情報を取得します
        var user = getUser();
        if (user != null) {
            $('#user_name').text(user.name);
        }

        // TODO null のときの挙動
        var userId = (user == null) ? -1: user.id;

        // ユーザが持つファイルをサーバーからロードします
        FileManager.load(userId, function(file) {
            // ダブルクリックでファイルを開くように設定します
            openDocument(file.parent_id, file.doc_id, false);
        }, function(){
            // 開くべきフォルダのIDを取得します
            var folderId = localStorage.getItem(LOCAL_STRAGE_KEY_FOLDER);
            if (folderId != 'undefined' && folderId) {
                // フォルダを選択状態にします
                var folderTree = FileManager.getFolderTree();
                folderTree.activateByFolderId(folderId);
            }
        });

        // 複数選択を可能にします
        FileManager.setMultiSelectable(true);

        // ボタン、ダイアログのイベントハンドラを設定します
        var folderTree = FileManager.getFolderTree();
        var fileList = FileManager.getFileList();
        $('#create_btn').click(
                {folderTree: folderTree, fileList: fileList, fileType: FILE_TYPE.file}, onCreateFile);
        $('#create_folder_btn').click(
                {folderTree: folderTree, fileList: fileList, fileType: FILE_TYPE.folder}, onCreateFile);
        $('#delete_btn').click(
                {folderTree: folderTree, fileList: fileList}, onDelete);
        $('#rename_btn').click(
                {folderTree: folderTree, fileList: fileList}, onRename);
        $('#copy_btn').click(
                {fileList: fileList}, onCopyOrCut);
        $('#cut_btn').click(
                {fileList: fileList}, onCopyOrCut);
        $('#paste_btn').click(
                {folderTree: folderTree, fileList: fileList}, onPaste);
        $('#convert_btn').click(
                {fileList: fileList}, onConvert);
        $('#upload_file').change(
                {folderTree: folderTree}, onUpload);
        $('#open_btn').click(
                {fileList: fileList, readonly:false}, onOpen);
        $('#readonly_open_btn').click(
                {fileList: fileList, readonly:true}, onOpen);

        $('#logout_btn').click(onLogout);
        $('#overlay_close').click(function() {
            $('#overlay').css('display', 'none');
            g_copyFiles = [];
            g_cutFiles = [];
            $('input[type="image"]').removeAttr('disabled');
        });

        // ダイアログ上でのショートカットを無効化します
        $('#DLG_Message').keydown(onKeyDownCancel);
        $('#DLG_Confirm').keydown(onKeyDownCancel);
        $('#DLG_Input').keydown(onKeyDownCancel);

        // キー押下イベントハンドラを設定します
        $('body').keydown(
                {folderTree: folderTree, fileList:fileList}, onKeyDown);

        // 一定時間おきの変換状態の確認を開始します
        var exportManager = ExportManager.createInstance(fileList);
        exportManager.startStatusCheck();
    });

});

/**
 * 右クリックポップアップを禁止します。
 */
function forbiddenBrowserPopup() {
    document.oncontextmenu = function(event) {
        event.preventDefault();
    };
};


/*==========================================================*/
/* ダイアログ表示 */
/*==========================================================*/

/**
 * 名前の入力ダイアログを表示します。
 * @param title         ダイアログのタイトル
 * @param dicVisible    辞書名選択のプルダウンを表示するかどうか
 * @param response      「OK」ボタンが押下されたときに呼び出されるコールバック
 */
function showNameDialog(title, defaultName, dicVisible, response) {

    // OKとキャンセルボタンの処理を定義します
    var buttons = {};
    buttons['OK'] = function(){ response(); $(this).dialog('close'); };
    buttons['キャンセル'] = function(){ $(this).dialog('close'); };

    // メッセージを設定します
    $('#DLG_InputMessage').text('新しい名前を入力してください。')

    // 名前の入力欄を空にします
    $('#DLG_InputValue').val(defaultName);

    // 辞書名選択プルダウンの表示を設定します
    $('#DLG_Dictionary').css('display', dicVisible ? '' : 'none');

    // ダイアログを表示します
    var dialogObj = $('#DLG_Input');
    dialogObj.dialog('option', {
        title: title,
        buttons: buttons
    });
    dialogObj.dialog('open');
}

/**
 * 確認ダイアログを表示します。
 * @param title         ダイアログのタイトル
 * @param message       メッセージ(HTML形式)
 * @param response      「はい」ボタンが押下されたときに呼び出されるコールバック
 */
function showConfirmDialog(title, message, response) {

    // Yes/No ボタンの処理を定義します
    var buttons = {};
    buttons['Yes'] = function() { response(); $(this).dialog('close'); };
    buttons['No'] = function() { $(this).dialog('close'); };

    // メッセージを設定します
    var dialogObj = $('#DLG_Confirm');
    dialogObj.html(message);

    // ダイアログを表示します
    dialogObj.dialog('option', {
        title: title,
        buttons: buttons,
        open: function() {
            // 2番目のボタンをデフォルトで選択します
            $( this ).siblings('.ui-dialog-buttonpane').find('button:eq(1)').focus();

            // 閉じるボタンはフォーカスしません
            $( this ).siblings('.ui-dialog-titlebar').find('a:eq(0)').attr('tabindex', '-1');
        },
    });
    dialogObj.dialog('open');
}


/*==========================================================*/
/* イベントハンドラ */
/*==========================================================*/

/**
 * ファイルの新規作成イベントハンドラです。
 * @param event
 */
function onCreateFile(event) {
    // パラメータを取得します
    var folderTree = event.data.folderTree; // フォルダツリーオブジェクト
    var fileList = event.data.fileList;     // ファイルリストオブジェクト
    var fileType = event.data.fileType;     // ファイルの種類

    // 選択されているフォルダとファイルを取得します
    var selectFolder = folderTree.getSelectedFolder();
    var selectFile = fileList.getSelectedFile();

    // フォルダが選択されていなければ実行しません
    if (selectFolder == null) {
        showMessageDialog('親フォルダを選択してください');
        return;
    }

    // 名前入力ダイアログを表示します
    var fileTypeStr = (fileType== FILE_TYPE.file) ? '文書' : 'フォルダ';
    showNameDialog(fileTypeStr + '新規作成', '新しい'+fileTypeStr, fileType == FILE_TYPE.file, function() {

        // 新しい名前を取得します
        var newName = $('#DLG_InputValue').val();

        // 名前が設定されていなければ何もしません
        if (newName == "") {
            showMessageDialog(fileTypeStr + '名が設定されていません');
            return;
        }

        // 新規作成リクエストパラメータを作成します
        var params = {
                'type' : fileType,
                'parent_id' : selectFolder.id,
                'name' : newName,
        }

        // 新規作成リクエストを送信します
        Communicator.request('fileCreate', params, function(res) {

            // 成功時はファイル名を変更します

            // ファイルオブジェクトを生成します
            var file = {
                id: res.id,
                type: fileType,
                name: res.name,
                parent_id: selectFolder.id,
                doc_id: res.doc_id,
            };

            // 表示を更新して作成したファイルまたはフォルダを選択します
            FileManager.updateFiles(g_selectFile, file);

            // ファイルであれば、辞書変更します
            if (fileType == FILE_TYPE.file) {
                var value = $('#DLG_InputSelect').val();
                if (value !== '' && value !== '0') {
                    var data = {
                            doc_id: file.doc_id,
                            dictionary_name: $('#DLG_InputSelect option:selected').text(),
                            ref_doc_id: null,
                            }
                    Communicator.request('dicReplace', data, function(){
                        // 辞書置換成功：何もしません
                        console.log('辞書置換成功');
                    }, function(){
                        // 辞書置換失敗：TODO メッセージ表示
                        console.log('辞書置換失敗');
                    });
                }
            }

        }, g_onFailure);

    });
}

/**
 * 特定のファイルまたはフォルダを選択します
 * @param file
 */
var g_selectFile = function(file) {
    var folderTree = FileManager.getFolderTree();
    var fileList = FileManager.getFileList();

    if (file.type == FILE_TYPE.file) {
        folderTree.activateByFolderId(file.parent_id)
        fileList.select(file);
    }
    else folderTree.activateByFolderId(file.id);
};

/**
 * ファイル削除イベントハンドラです。
 */
function onDelete(event) {
    // パラメータを取得します
    var folderTree = event.data.folderTree; // フォルダツリーオブジェクト
    var fileList = event.data.fileList;     // ファイルリストオブジェクト

    // ファイルの種類を選択します
    var fileType = fileList.active ? FILE_TYPE.file : FILE_TYPE.folder;

    // 選択されているオブジェクトを取得します
    var selected = [];
    switch (fileType) {
    case FILE_TYPE.file: selected = fileList.getSelectedFiles(); break;
    case FILE_TYPE.folder: selected.push(folderTree.getSelectedFolder()); break;
    default : break;;
    }
    if (selected.length == 0) {
        showMessageDialog('削除するファイルまたはフォルダを選択してください');
        return;
    }

    // ルートフォルダでないかを確認します
    if (fileType == FILE_TYPE.folder && selected[0].isDrive) {
        showMessageDialog('ルートフォルダは削除できません');
        return;
    }

    // ファイル名の文字列を取得します
    var fileNames = '';
    for (var i=0; i<selected.length; i++) {
        fileNames += '「' + selected[i].name + '」';
    }

    // 確認ダイアログを表示します
    var fileTypeStr = (fileType== FILE_TYPE.file) ? 'ファイル' : 'フォルダ';
    showConfirmDialog('削除確認', fileTypeStr + fileNames + 'を削除しますか?<br>この操作は元に戻せません。', function() {
        // YES 押下でリクエストを送信します
        for (var i=0; i<selected.length; i++) {
            Communicator.requestSync('fileDelete', {'id' : selected[i].id}, function() {
                // 最後のファイル削除の成功時は表示を更新します
                if (i < selected.length - 1) return;
                var parentId = selected[i].parent_id;
                FileManager.updateFiles(function() {
                    // 親フォルダを選択します
                    folderTree.activateByFolderId(parentId);
                });

            }, g_onFailure);
        }
    });
}

/**
 * 名前変更イベントハンドラです。
 */
function onRename(event) {
    // パラメータを取得します
    var folderTree = event.data.folderTree; // フォルダツリーオブジェクト
    var fileList = event.data.fileList;     // ファイルリストオブジェクト

    // ファイルの種類を選択します
    var fileType = fileList.active ? FILE_TYPE.file : FILE_TYPE.folder;

    // 選択されたファイルを取得します
    var selected = null;
    if (fileType == FILE_TYPE.file) {
        if (fileList.getSelectedFiles().length == 1) selected = fileList.getSelectedFile();
    }
    else {
        selected = folderTree.getSelectedFolder();

        // 親がいないルートディレクトリは名称変更を禁止します
        if (selected.parent_id == null) {
            showMessageDialog('マイドキュメント、グループのルートフォルダは名称変更できません。');
        	return;
        }
    }
    if (selected == null) {
        showMessageDialog('ファイルまたはフォルダをひとつ選択してください');
        return;
    }

    // 名前入力ダイアログ
    var fileTypeStr = (fileType== FILE_TYPE.file) ? 'ファイル' : 'フォルダ';
    showNameDialog(fileTypeStr + '名変更', selected.name, false, function() {
        // 新しい名前を取得します
        var newName = $('#DLG_InputValue').val();

        // 名前が設定されていなければ何もしません
        if (newName == "") {
            showMessageDialog(fileTypeStr + '名が設定されていません');
            return;
        }
        requestRename(selected, newName, folderTree, fileList);
    });
}

/**
 * 名前変更リクエストを送信します。
 * @param file          ファイルオブジェクト
 * @param newName       新しい名前
 * @param folderTree    フォルダツリーオブジェクト
 * @param fileList      ファイルリストオブジェクト
 * @param onFailure     失敗時のコールバック
 */
function requestRename(file, newName, folderTree, fileList, onFailure) {
    // リクエストを送信します
    Communicator.request('fileRename', {'id': file.id, 'old_name': file.name, 'new_name': newName}, function(res){
        // 成功時：表示を更新して変更したファイルまたはフォルダを選択します
    	file.name = newName;
        FileManager.updateFiles(g_selectFile, file);

    }, function(res) {
        // 失敗時：メッセージを表示します
        g_onFailure(res);
        // コールバックが存在すれば実行します
        if (onFailure) onFailure();
    });
}

/**
 * コピー操作で選択されたファイルの保存用
 */
var g_copyFiles = [];
/**
 * カット操作で選択されたファイルの保存用
 */
var g_cutFiles = [];

/**
 * コピーとカットのイベントハンドラです。
 */
function onCopyOrCut(event, isCopy) {
    // パラメータを取得します
    var fileList = event.data.fileList;     // ファイルリストオブジェクト
    if (isCopy === undefined) isCopy = (event.target.id == 'copy_btn');    // コピーの場合true, カットの場合false

    // 選択されているファイルリストを取得します
    var selectFiles = fileList.getSelectedFiles();

    // ファイルが選択されている必要があります
    if (selectFiles.length == 0) {
        showMessageDialog('ファイルを選択してください');
        return;
    }

    // 選択ファイルを初期化します
    g_copyFiles = [];
    g_cutFiles = [];

    // 選択ファイルを保存します
    if (isCopy) g_copyFiles = selectFiles.concat();
    else g_cutFiles = selectFiles.concat();

    // 選択ファイルの名前を連結して取得します
    var fileNames = '';
    for (var i=0; i<selectFiles.length; i++) {
        if (i !== 0) fileNames += ', ';
        fileNames += selectFiles[i].name;
    }

    // 選択ファイルを表示します
    $('#overlay_file').val(fileNames);
    $('#overlay').css('display', 'block');
    $('#overlay_title').text('[' + (isCopy ? 'コピー' : '切り取り') + '中...]　')

    // 貼り付けボタン以外の有効・無効を切り替えます
    $('input[type="image"]').attr('disabled', true);
    $('#paste_btn').removeAttr('disabled');
}

/**
 * ペーストのイベントハンドラです。
 */
function onPaste(event) {
    // ファイルが選択されていないときは何もしません
    if (g_copyFiles.length == 0 && g_cutFiles.length == 0) return;

    // ファイルが表示されていないときは何もしません
    if ($('#overlay').css('display') == 'none') return;

    // フォルダが選択されていることを確認します
    var folderTree = event.data.folderTree; // フォルダツリーオブジェクト
    var selectFolder = folderTree.getSelectedFolder();

    // フォルダが選択されている必要があります
    if (selectFolder == null) {
        showMessageDialog('貼り付け先フォルダを選択してください');
        return;
    }

    // コピーかカットかを判定してペーストを実行します
    if (g_copyFiles.length > 0) pasteForCopy(selectFolder, folderTree, event.data.fileList);
    else if (g_cutFiles.length > 0) pasteForCut(selectFolder, folderTree, event.data.fileList);

    // 選択ファイルを非表示にします
    $('#overlay').css('display', 'none');

    // 全てのボタンを有効にします
    $('input[type="image"]').removeAttr('disabled');
}

/**
 * コピーによる貼り付けを実行します。
 * @param selectFolder  貼り付け先フォルダ
 * @param folderTree    フォルダツリー
 * @param fileList      ファイルリスト
 */
function pasteForCopy(selectFolder, folderTree, fileList) {
    // リクエストを順番に送信します
    for  (var i=0; i<g_copyFiles.length; i++) {
        // パラメータを設定します
        var params = {
                'id': g_copyFiles[i].id,
                'parent_id': selectFolder.id,
                'force': 'rename',	// yes: 上書きコピー, rename: 番号付きコピー, cancel: 同名ファイル存在時はコピーしない
        };

        // コピーリクエストを送信します
        Communicator.requestSync('fileCopy', params, function(res){
            // 最後のコピーでファイル情報を更新します
            if (i < g_copyFiles.length - 1) return;
            var file = g_copyFiles[i];
            FileManager.updateFiles(function() {
                folderTree.activateByFolderId(selectFolder.id); // 貼り付け先フォルダを選択
                if (file.type == FILE_TYPE.file) {
                    // fileList.select(res.file);        // コピーしたファイルを選択★サーバー修正後にコメントアウト
                }
            });

        }, g_onFailure);
    }

    g_copyFiles = [];
}

/**
 * 切り取りによる貼り付け（＝移動）を実行します。
 * @param selectFolder 貼り付け先フォルダ
 * @param folderTree    フォルダツリー
 * @param fileList      ファイルリスト
 */
function pasteForCut(selectFolder, folderTree, fileList) {
    // リクエストを順番に送信します
    for (var i=0; i<g_cutFiles.length; i++) {
        var params = {
                'id': g_cutFiles[i].id,
                'old_parent_id': g_cutFiles[i].parent_id,
                'new_parent_id': selectFolder.id,
                'force': false,
        };

        // 移動リクエストを送信します
        Communicator.requestSync('fileMove', params, function(res){
            // 最後のコピーでファイル情報を更新します
            if (i < g_cutFiles.length - 1) return;
            var file = g_cutFiles[i];
            FileManager.updateFiles(function() {
                folderTree.activateByFolderId(selectFolder.id); // 貼り付け先フォルダを選択
                if (file.type == FILE_TYPE.file) {
                    fileList.select(file);        // 移動したファイルを選択
                }
            });

        }, g_onFailure);
    }

    g_cutFiles = [];
}

/**
 * 変換のイベントハンドラです。
 * @param event
 */
function onConvert(event) {
    // ユーザーの変換数を確認します
    Communicator.request('exportCount', {}, function(res) {
        // 変換数が上限値以上であれば、変換はできません。
        if (res.count >= CONVERT_DOC_MAX) {
            showMessageDialog('変換/ダウンロードは' + CONVERT_DOC_MAX + '文書までです。<br>' +
                    '変換データをダウンロードまたは「×」押下で削除してください。',
                    '変換文書の数が上限に達しました');
            return;
        }

        // 選択されているファイルを取得します
        var selectedFiles = event.data.fileList.getSelectedFiles();
        if (selectedFiles.length != 1) {
            showMessageDialog('変換するファイルをひとつ選択してください');
            return;
        }

        // 変換ダイアログを表示します
        WindowManager.instance.openConvertWindow(selectedFiles[0].doc_id);

    }, function(res) {
        showMessageDialog('文書変換の数を取得できませんでした。<br>原因：' + res.message, '通信エラー');
    });
}

/**
 * アップロードのイベントハンドラです。
 * @param event
 */
function onUpload(event) {

    // 送信するファイルが設定されていることを確認します
    if ($('#upload_file').val() == '') {
        showMessageDialog('アップロードファイルを選択してください');
        return;
    }

    // 選択されたフォルダを取得します
    var folderTree = event.data.folderTree;
    var selectedFolder = folderTree.getSelectedFolder();
    if (selectedFolder == null) {
        showMessageDialog('フォルダを選択してください');
        return;
    }

    // フォームデータを作成します
    var formData = new FormData();
    formData.append('imlx_file', $('#upload_file').prop('files')[0]);

    // キャンセルフラグを初期化します
    var cancelFlg = false;

    // ダイアログを表示します
    showMessageDialog($('#upload_file').val() + ' のアップロード中です...', 'アップロード メッセージ',
            function() {cancelFlg = true;}, 'キャンセル');

    // アップロードのリクエストを送信します
    Communicator.request('importStart', formData, function(res) {

        // キャンセルされているときは何もしません
        if (cancelFlg) {
            return;
        }

        // タスクIDを取得します
        var taskId = res.result.task_id;
        var counter = 0;

        // 一定時間置きに実行する関数を生成します
        var getUploadInfo = function() {
            Communicator.request('importComplete', {'task_id': taskId, 'folder_id': selectedFolder.id}, function(res) {

                if (res.finished) {

                    // 変換終了しているときは表示を更新します
                    FileManager.updateFiles(function() {
                        folderTree.activateByFolderId(selectedFolder.id); // 移動先フォルダを選択
                    });

                    // アップロードの完了または失敗を通知します
                    var message;
                    var title;
                    if (res.file == null) {
                        // ファイルが存在しないときは失敗と見なします
                        message = 'オンライン版のフォーマットに変換できませんでした。';
                        title = 'アップロード失敗';
                    }
                    else {
                        // それ以外は成功とします
                        message = 'ファイル名「' + res.file.name + '」として保存しました。';
                        title = 'アップロード完了';
                    }
                    //$('#DLG_Message').html(message);
                    showMessageDialog(message, title);
                }
                else if (cancelFlg) {
                    // キャンセル
                    showMessageDialog('アップロードをキャンセルしました。', 'アップロード キャンセル');
                }
                else if (counter < TASK_MAX_TRY) {
                    // 完了を待つときは0.5秒おき、1000回まで繰り返します
                    counter ++;
                    setTimeout(getUploadInfo, TASK_INTERVAL);
                }
                else {
                    // 一定期間経過した後は、タスク完了確認のタイムアウトを通知します
                    var message = '完了確認がタイムアウトしました。';
                    var title = 'アップロード タイムアウト';
                    //$('#DLG_Message').html(message);
                    showMessageDialog(message, title);
                }

            }, g_onFailure);
        };

        // 実行します
        getUploadInfo();

    }, g_onFailure, true);

}

/**
 * ドキュメントを開く操作のイベントハンドラです。
 */
function onOpen(event) {
    // 選択されているファイルを取得します
    var selectedFiles = event.data.fileList.getSelectedFiles();
    if (selectedFiles.length != 1) {
        showMessageDialog('ファイルをひとつ選択してください');
        return;
    }

    // 読み取り専用フラグを取得します
    var readOnly = event.data.readonly;

    // ドキュメントを開きます。
    openDocument(selectedFiles[0].parent_id, selectedFiles[0].doc_id, readOnly);

}

/**
 * ドキュメントを開きます。
 * @param docId
 * @param readOnly
 */
function openDocument(folderId, docId, readOnly) {
    if (readOnly) {
        // 読み取り専用で開きます
        screenTransite(folderId, docId, true);
    }
    else {
        // 文書編集の開始を試みます
        Communicator.request('docBeginEdit', {'id': docId}, function(res) {
            // 編集可能であれば開きます
            screenTransite(folderId, docId, false);
        }, function(res) {
            // エラーコードから他のユーザが編集中であるかを確認します
            if (res.error_code == CODE_DOC_OTHER) {

                // 強制ロック解除をするかどうかを問い合わせます
                var message = '別のアクセスで編集中のようです。<br>'
                    + '保存されていないデータが失われる可能性がありますが、強制的に編集権限を取得しますか？';

                showConfirmDialog('強制編集確認', message, function() {
                    // 「はい」が押下された場合は、強制ロック解除を実行します
                    Communicator.request('docforceEdit', {'id': docId}, function(res) {
                        screenTransite(folderId, docId, false);
                    }, g_onFailure)
                });

            }
            else {
                // 文書編集開始の失敗
                g_onFailure(res);
            }
        });
    }
}

/**
 * 編集画面に遷移します。
 * @param folderId
 * @param docId
 * @param readOnly
 */
function screenTransite(folderId, docId, readOnly) {
    // フォルダIDをローカルストレージに保存します
    localStorage.setItem(LOCAL_STRAGE_KEY_FOLDER, folderId);

    // ドキュメント編集画面に遷移します
    url = '../editor/index.html?doc_id=' + docId;
    if (readOnly) url += '&readonly=true';
    window.location.href = url;
}

/**
 * キー押下イベントハンドラです。
 * @param event
 */
function onKeyDown(event) {
    // Del → 削除
    if (event.keyCode == 46) {
        onDelete(event);
    }
    // F2 → 名前変更
    else if (event.keyCode == 113) {
        onRename(event);
    }
    // Ctrl + C → コピー
    else if (event.ctrlKey && event.keyCode == 67) {
        onCopyOrCut(event, true);
    }
    // Ctrl + X → 切り取り
    else if (event.ctrlKey && event.keyCode == 88) {
        onCopyOrCut(event, false);
    }
    // Ctrl + V → ペースト
    else if (event.ctrlKey && event.keyCode == 86) {
        onPaste(event);
    }
}

/**
 * ダイアログ上でのキー押下イベントハンドラ
 * @param event
 */
function onKeyDownCancel(event) {
	event.originalEvent.stopPropagation();
}