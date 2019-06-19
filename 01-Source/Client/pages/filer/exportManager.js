/**
 * エクスポート変換の状態確認とデータのダウンロード機能を提供するクラスです。
 */
function ExportManager(fileList) {
    this.fileList = fileList;
    this.fileMap = {};      // 文書IDをキーとするファイル検索用オブジェクト
    this.error = false;

    // ファイルリストが更新されたときに初期化するようにコールバックを登録します
    this.fileList.onUpdatedCallback = ExportManager.onFilesUpdated;
    this.fileList.onUpdatedCallbackArg = this;

}

ExportManager._instance = null;

/**
 * インスタンスを生成します。
 */
ExportManager.createInstance = function(fileList) {
    ExportManager._instance = new ExportManager(fileList);
    return ExportManager._instance;
}

/**
 * 表示するファイルリストが更新されたときに実行されるコールバック関数です。
 * 文書IDによるファイル検索マップを初期化します。
 */
ExportManager.onFilesUpdated = function(manager) {
    // ファイルを文書IDから取得できるように検索用マップを初期化します
    manager.fileMap = {};
    for (var i=0; i<manager.fileList.files.length; i++) {
        var file = manager.fileList.files[i];
        if (file.type == FILE_TYPE.folder) continue;    // フォルダは除外
        manager.fileMap[file.doc_id] = file;
    }

    // エラーが発生していなければ、すぐに表示を更新します
    if (manager.error) return;
    for (docId in manager.fileMap) {
        ExportManager.refreshStatus(docId, manager);
    }
};

/**
 * 変換状態の確認を開始します。
 */
ExportManager.prototype.startStatusCheck = function() {
    // 全てのファイルに対して変換状態の確認をリクエストします
    for (docId in this.fileMap) {
        ExportManager.refreshStatus(docId, this, true);
    }

    // 通信エラーがなければ、一定時間でもう一度リクエストを開始します
    if (this.error) {
        showMessageDialog('文書変換状態の確認に失敗しました。<br>' +
        'ページを更新するまで、変換状態の変更は反映されません。');
    }
    else {
        manager = this;
        setTimeout(function(){manager.startStatusCheck();}, 2000);
    }
};

/**
 * 特定の文書の変換状態をサーバーへ問い合わせて表示更新します。
 * setTimeoutによる実行時にはthisがwindowとなるため、プロトタイプ関数ではなく静的関数で定義します。
 * @param docId     文書ID
 * @param manager   ExportManagerクラスのインスタンス (インスタンス生成後であれば省略可）
 * @param inherit   前回確認した「never」状態を引き継ぐか (省略可)
 */
ExportManager.refreshStatus = function(docId, manager, inherit) {
    if (manager == null) manager = ExportManager._instance;
    if (manager == null) {
        console.error('変換状態を更新できませんでした。原因：ExportManagerが生成されていません。');
        return;
    }

    // 過去の変換状態がneverであれば、変換が開始されるまではリクエストしません
    var fileTmp = manager.fileMap[docId];
    if (inherit === true && fileTmp != null && fileTmp.statusObj != null && fileTmp.statusObj.status === 'never') {
        return
    }

    // 変換状態の確認をリクエストします
    Communicator.request('exportStatus', {doc_id: docId},
        // 成功時の処理
        function(res) {
            // 変換状態を確認したファイルを取得します
            var file = manager.fileMap[res.result.document_id];
            if (file == null) {
                // タイミングによってはファイル取得できないことがあるが、処理に問題はないのでエラーではない
                console.warn('変換確認対象のファイルを取得できませんでした。文書ID：' + res.result.document_id);
                return;
            }

            // 変換状態を更新します
            manager.fileList.showStatus(file, res.result);
        },
        // 想定内のエラー時の処理
        function(res) {
            // エラーが発生したことを保存します
            manager.error = true;

        }, false,
        // 想定外の通信エラー時の処理
        function(errorInfo) {
            // エラーが発生したことを保存します
            manager.error = true;
            // エラー詳細をアラート表示します
            errorInfo.getText = function() {
                return "(1)" + errorInfo.XMLHttpRequest + ", (2)" + errorInfo.textStatus + ", (3)" + errorInfo.errorThrown;
            };
            alert("connection error with " + url + " --- " + errorInfo.getText());
        }
    );

};

/**
 * ダウンロードリンクをクリックされたときのイベントハンドラです。
 * データが正しく取得できるかを確認したうえでダウンロードします。
 */
ExportManager.onExporFile = function(taskId) {
    var url = Communicator.getUrl('exportFile');

    // TODO ★本当は、エラーのときには画面遷移しないようにしたいが、リクエストしたらデータが削除されるので
    url = url + '?task_id=' + encodeURIComponent(taskId);
    window.location = url;

//    // リクエストします
//    // サーバーは成功時にはバイナリ、失敗時には JSON を返すため、
//    // 特殊なハンドラを設定しています。
//    $.ajax({
//        'url':      url,
//        'type':     'POST',
//        'data':     { 'task_id': taskId },
//        'success':  function(res) {
//            // 成功したらダウンロードします
//            url = url + '?task_id=' + encodeURIComponent(taskId);
//            window.location = url;
//        },
//        'error':    function(XMLHttpRequest, textStatus, errorThrown){
//            // 失敗したらメッセージを表示します
//
//            // レスポンスを JSON として解析を試みます。
//            var title;
//            var message;
//            try {
//                // JSON として解析できるときは、APIとしては正常動作です
//                obj = jQuery.parseJSON(XMLHttpRequest.responseText);
//                message = obj.message;
//            }
//            catch (e) {
//                // JSON として解析できないときは、想定外のエラーです
//                message = '想定外の通信エラーが発生しました。<br>' + errorThrown.message;
//            }
//
//            // メッセージを表示します
//            showMessageDialog(message, 'ダウンロード失敗');
//        },
//    });
}