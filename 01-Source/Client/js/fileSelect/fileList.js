/**
 * fileList.js
 * 選択されたフォルダのファイルリストのデータと表示を管理します。
 */

/*==========================================================*/
/* 定数 */
/*==========================================================*/
/**
 * ファイルの種類
 */
FILE_TYPE = {
    file: 1,    // ファイル
    folder: 2,  // フォルダ
};

/*==========================================================*/
/* FileList クラス */
/*==========================================================*/
/**
 * FileList のコンストラクタ関数です。
 * @param fileListId        ファイルリストを表示するDIV要素の id
 */
function FileList(fileListId) {
    // メンバ変数を初期化します
    this.fileListKey = '#' + fileListId;
    this.files = [];            // ファイルオブジェクトの配列
    this.selectedFiles = [];    // 選択されているファイルオブジェクトの配列
    this.active = false;        // ファイルリストのアクティブ（フォーカス）状態
    this.onUpdatedCallback = null;      // ファイルリスト更新時のコールバック関数
    this.onUpdatedCallbackArg = null;   // ファイルリスト更新時のコールバック関数の引数
    this.multiSelectable = false;    // 複数ファイルを選択可能か

    // Shift/Ctrlキーの押下を監視します
    this.shiftDown = false; // シフトキー押下
    this.ctrlDown = false;  // コントロールキー押下
    var fileList = this;
    $(document).on('keyup keydown', function(e){fileList.shiftDown = e.shiftKey} );
    $(document).on('keyup keydown', function(e){fileList.ctrlDown = e.ctrlKey} );

    // ファイル部分以外をクリックされた場合は選択解除します
    var fileListObj = this;
    $(this.fileListKey).click(function() {
        fileListObj.select(null, false);
    })
};

/* --------------------------------------------------------------- */
/* FileListクラス内の定数 */
/* --------------------------------------------------------------- */
FileList.FILE_ID_PREFIX = 'file_id';        // ファイルを表示するDIV要素のIDプレフィックス
FileList.ACTIVE_COLOR = '#3169C6';          // アクティブ状態の選択ファイルの背景色
FileList.NONACTIVE_COLOR ='lightgray';      // 非アクティブ状態の選択ファイルの背景色


FileList.SELECT_MODE = {
        SINGLE: 1, // 単一選択
        APPEND: 2, // 複数選択での選択ファイル追加
        REMOVE: 3, // 選択解除
};


/* --------------------------------------------------------------- */
/* ファイルリストの設定・ファイル選択 */
/* --------------------------------------------------------------- */

/**
 * ファイルリストを設定します。
 * @param files         ファイルオブジェクトの配列
 * @param onDblClick    ダブルクリックハンドラ (fileを引数にとる)
 */
FileList.prototype.setFiles = function(files, onDblClick) {
    // ファイル情報を保存します
    this.files = files;
    var fileList = $(this.fileListKey);

    // ファイルリストを全て削除します
    fileList.empty();
    this.selectedFiles = [];
    this.active = false;

    // ファイルリストを追加します
    if (files == null) return;
    var fileListObj = this;
    $.each(files, function(i, file) {
        // ファイル以外では何もしません
        if (file == null || FILE_TYPE.file != file.type) return;

        // 表示するファイル名を取得します
        var name = file.name;
        if (file.edit_user != null) name += ' [編集中：' + file.edit_user.name + '] ';

        // ファイルリストをDIV要素で作成します
        fileList.append($('<div class="file">')
                .attr('id', FileList.FILE_ID_PREFIX + file.id)
                .append($('<span class="file_name">'+name+'</span>')
                        .attr('title', '最終更新: '+ file.updated_at))             // ファイル名
                .append($('<span class="status">'))    // 右寄せのオプション表示項目（変換状態）
                .click({fileList: fileListObj, index: i}, FileList.onClickFile)  // クリックで選択
                .hover(function() {                                 // マウスポインタで色が変わる
                    $(this).css('background-color', 'lightgray');
                }, function() {
                    $(this).css('background-color', 'transparent')
                })
                .dblclick(function() { if (onDblClick) onDblClick(file); })    // ダブルクリックのハンドラ
                );

        // 変換状態は削除します
        file.statusObj = null;
    });

    // コールバックがあれば実行します
    if (this.onUpdatedCallback) {
        this.onUpdatedCallback(this.onUpdatedCallbackArg);
    }

};

/**
 * ファイルのクリックによって選択状態を切り替えるイベントハンドラです。
 */
FileList.onClickFile = function(event) {
    // クリックされた領域がDIVまたはファイル名SPAN以外では何もしません
    if (event.target.nodeName !== 'DIV' && event.target.className !== 'file_name') return;

    event.stopPropagation();

    var fileListObj = event.data.fileList;
    var selectedFile = fileListObj.files[event.data.index];

    // 複数選択可能なとき
    if (fileListObj.multiSelectable) {
        // コントロールキー押下時は選択状態をスイッチします
        if (fileListObj.ctrlDown) {
            var mode = FileList.SELECT_MODE.APPEND;
            if (fileListObj.isSelected(selectedFile)) {
                mode = FileList.SELECT_MODE.REMOVE; // 選択状態ならば解除モード
            }
            fileListObj.select(selectedFile, mode);
        }
        // シフトキー押下時は範囲選択になります
        else if (fileListObj.shiftDown) {
            // 選択ファイルがないときは、そのまま設定します
            if (fileListObj.selectedFiles.length == 0) {
                fileListObj.select(selectedFile, FileList.SELECT_MODE.SINGLE);
            }
            // 選択ファイルがあるとき
            else {
                // 先頭ファイルのインデックスを取得します
                var firstFile = fileListObj.selectedFiles[0];
                var firstFileIndex = fileListObj.getFileIndex(firstFile);

                if (firstFileIndex < 0) {
                    console.error('ファイル範囲選択の開始点取得に失敗しました。')
                    return; // 取得に失敗したらなにもしない
                }

                // 先頭ファイルと同じところをクリックされているときは、単一選択になります
                if (firstFileIndex == event.data.index) {
                    fileListObj.select(selectedFile, FileList.SELECT_MODE.SINGLE);
                }
                // 先頭ファイルと異なるところをクリックされたとき
                else if (firstFileIndex >= 0) {
                    // 範囲を決定するインデックスを取得します
                    var startIndex = Math.min(firstFileIndex, event.data.index);
                    var endIndex = Math.max(firstFileIndex, event.data.index);

                    // 範囲内のすべてのファイルを選択します
                    for (var i=startIndex; i<=endIndex; i++) {
                        fileListObj.select(fileListObj.files[i], FileList.SELECT_MODE.APPEND);
                    }
                }
            }
        }
        // shiftもctrlも押下されていないときは、単一選択です
        else {
            fileListObj.select(selectedFile, FileList.SELECT_MODE.SINGLE);
        }
    }
    else {
        // 単一選択では、クリックされたファイルのみを選択します
        fileListObj.select(selectedFile, FileList.SELECT_MODE.SINGLE);
    }
};

/**
 * 特定のファイルを選択状態にします。
 * @param file  選択するファイルオブジェクト（nullを指定すると選択解除）
 * @param mode  選択モード
 */
FileList.prototype.select = function(file, mode) {

    // 選択ファイルを更新します
    if (mode === FileList.SELECT_MODE.SINGLE || file == null) {
        this.selectedFiles = []; // 単一選択と全解除ではすべての選択ファイルを削除
    }
    if (file != null) {
        if (mode === FileList.SELECT_MODE.REMOVE) {
            this.selectedFiles.splice(this.selectedFiles.indexOf(file), 1);
        } else {
            // 選択済みファイルに既に設定されていないことを確認して追加します
            var index = -1;
            for (var i=0; i<this.selectedFiles.length; i++) {
                if (this.selectedFiles[i].id == file.id) {
                    index = i;
                    break;
                }
            }
            if (index < 0) this.selectedFiles.push(file);
        }
    }

    // アクティブ状態にします
    this.active = true;

    // 選択されているファイルのHTML要素IDを配列化します
    var selectedIds = [];
    $.each(this.selectedFiles, function(i, fileTmp) {
        selectedIds.push(FileList.FILE_ID_PREFIX + fileTmp.id);
    });

    // 色を設定します
    var fileListObj = this;
    $.each($(this.fileListKey).children(), function(i, child) {
        var fileDiv = $(child);
        if (selectedIds.indexOf(fileDiv.attr('id')) >= 0) {
            fileDiv.css('background-color', FileList.ACTIVE_COLOR);
            fileDiv.css('color', 'white');
            fileDiv.unbind('mouseenter').unbind('mouseleave');          // hoverを解除する
        }
        else {
            fileDiv.css('background-color', 'transparent');
            fileDiv.css('color', 'black');
            fileDiv.hover(function() {                                 // マウスポインタで色が変わる
                $(this).css('background-color', 'lightgray');
            }, function() {
                $(this).css('background-color', 'transparent')
            });
        }
    });
};

/**
 * ファイルリスト全体のアクティブ状態を設定します。
 */
FileList.prototype.setActive = function(active) {
    this.active = active;
    if (this.selectedFiles.length == 0) return;

    // 選択されたファイルの背景色を変更します
    for (var i=0; i<this.selectedFiles.length; i++) {
        var id = this.selectedFiles[i].id;
        var backColor = active ? FileList.ACTIVE_COLOR : FileList.NONACTIVE_COLOR;
        $('#' + FileList.FILE_ID_PREFIX + id).css('background-color', backColor);
    }
}

/**
 * 表示しているファイル情報の配列を取得します。
 */
FileList.prototype.getFiles = function() {
    return this.files;
};

/**
 * 選択されているファイルオブジェクトを取得します。
 * 選択されていないときは null になります。
 * 複数選択されているときは先頭データになります。
 */
FileList.prototype.getSelectedFile = function() {
    return (this.selectedFiles.length == 0) ? null : this.selectedFiles[0];
};

/**
 * 選択されているファイルオブジェクトの配列を取得します。
 */
FileList.prototype.getSelectedFiles = function() {
    return this.selectedFiles;
};

/**
 * ファイルのリスト内インデックスを取得します。
 */
FileList.prototype.getFileIndex = function(file) {
    if (file == null) return -1;

    var index = -1;
    $.each(this.files, function(i, fileTmp) {
        if (file.id == fileTmp.id) {
            index = i;
            return false;
        }
    });
    return index;
};

/**
 * あるファイルが選択されているかどうかを取得します。
 */
FileList.prototype.isSelected = function(file) {
    var res = false;
    $.each(this.selectedFiles, function(i, selectedFile) {
        if (file.id == selectedFile.id) {
            res = true;
            return false;
        }
    });
    return res;
}


/* --------------------------------------------------------------- */
/* 変換状態の表示 */
/* --------------------------------------------------------------- */

/**
 * 特定のファイルの変換状態を表示に反映させます
 * @param fileId    ファイルID
 * @param statusObj 変換状態のオブジェクト
 */
FileList.prototype.showStatus = function(file, statusObj) {
    if (file == null || statusObj == null) return;

    // 必要な情報を取得します
    var status = statusObj.status;
    var taskId = statusObj.task_id;
    var fileType = FileList._getConvertType(statusObj.file_type);

    // 状態が変化しない場合は、残り時間以外何もしません
    if (file.statusObj != null &&
            status === file.statusObj.status && taskId === file.statusObj.task_id &&
            statusObj.file_type === file.statusObj.file_type){

        // 完了時は、残り時間だけ更新します
        if (status === 'completed') {
            var div = $('#' + FileList.FILE_ID_PREFIX + file.id);
            var link = div.find('a');
            if (link.length > 0) link[0].setAttribute('title', '残りダウンロード有効時間 ' + statusObj.remain_time);
        }
        return;
    }

    // 変換状態を表示するHTMLノードを取得します
    var div = $('#' + FileList.FILE_ID_PREFIX + file.id)[0];
    if (div == null || div.lastChild == null) {
        console.error('変換状態表示ノードの取得に失敗しました。ファイルID：' + file.id);
        return;
    }
    var span = div.lastChild;
    span = $(span);

    // 表示領域を取得します
    span.empty();

    // 変換なしは、何も表示しません
    if (status === 'never') {
    }
    // 変換開始の待機中であることを表示します
    else if (status === 'pending') {
        span.append($('<img src="./icons/processing.gif">'))   // 変換中アイコン
        .append($('<span>').text(fileType + '開始待ち...'))    // メッセージ
        .append(FileList._getDeleteIcon(taskId, 'キャンセル'));             // キャンセルアイコン
    }
    // 変換中は、変換中であることを表示します
    else if (status === 'processing') {
        span.append($('<img src="./icons/processing.gif">'))   // 変換中アイコン
        .append($('<span>').text(fileType + '変換中...'))    // メッセージ
        .append(FileList._getDeleteIcon(taskId, 'キャンセル'));             // キャンセルアイコン
    }
    // 変換完了は、ダウンロードリンクを表示します
    else if (status === 'completed') {
        var onClick = 'onClick="ExportManager.onExporFile(\'' + taskId + '\')"';
        span.append($('<img src="./icons/down.png">'))   // ダウンロードアイコン
        .append($('<a class="status" ' + onClick + '>' + fileType +'形式</a>')
                .attr('title', '残り ' + statusObj.remain_time))    // ダウンロードリンク
        .append(FileList._getDeleteIcon(taskId, '削除'));             // 削除アイコン
    }
    // 変換失敗
    else if (status === 'errored') {
        span.append($('<span>').text(fileType + '変換失敗'))   // メッセージ
        .append(FileList._getDeleteIcon(taskId, '削除'));                     // 削除アイコン
    }
    // 変換キャンセル
    else if (status === 'cancel') {
        span.append($('<span>').text(fileType + '変換キャンセル済み')) // メッセージ
        .append(FileList._getDeleteIcon(taskId, '削除'));                             // 削除アイコン
    }
    // 想定外
    else { console.error('想定外の変換ステータス : ' + status) }

    // 状態を保存しておきます
    file.statusObj = statusObj;
}

/**
 * 変換ファイルの種類を取得します(DAISY/EPUB3/IMLX)
 */
FileList._getConvertType = function(fileType) {
    if (fileType == null) return null;
    fileType = fileType.toUpperCase();
    if (fileType.substr(0, 5) === 'DAISY') return 'DAISY';
    else if (fileType.substr(0, 5) === 'EPUB3') return 'EPUB3';
    else if (fileType.substr(0, 4) === 'IMLX') return 'IMLX';
    else return fileType;
};

/**
 * 変換キャンセル（削除）のアイコンを表示するためのJQueryオブジェクトを取得します。
 */
FileList._getDeleteIcon = function(taskId, title) {
    var deleteIcon = $('<img src="./icons/cancel.png" title="' + title + '">')
    .click({taskId: taskId}, FileList.onCancelConvert)  // クリックで変換キャンセル（削除）をリクエスト
    .hover(function() {                                 // マウスポインタで色が変わる
        $(this).css('border', '1px solid gray');
        $(this).css('background-color', 'silver');
    }, function() {
        $(this).css('border', '1px solid transparent');
        $(this).css('background-color', 'transparent');
    });

    return deleteIcon;
};

/**
 * 変換削除（キャンセル）をリクエストします
 */
FileList.onCancelConvert = function(event) {
    Communicator.request('exportCancel', {task_id: event.data.taskId}, function(){}, g_onFailure);
};