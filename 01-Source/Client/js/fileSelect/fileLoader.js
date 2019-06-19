/**
 * ファイルリストを取得してツリー表示するためのクラスです。
 * @param userId ユーザID
 * @param onDblClick    ダブルクリックハンドラ (fileを引数にとる)
 * @param callback      ロード後に実行するコールバック
 */
function FileLoader(userId, onDblClick, callback) {
    this.fileList = new FileList('file_list');
    this.folderTree = new FolderTree(userId, 'tree', this.fileList, onDblClick);

    // ファイルツリーを取得して表示します
    this.initialLoad(userId, callback);

    // ツリーボックスのサイズを変更可能にします
    FileLoader.setupTreeResize();

    // フォルダペインのクリックでファイルペインを非アクティブ色にします
    $('#tree').click({src:this}, function(event) {
        event.data.src.fileList.setActive(false);
        });

    // ファイルが選択されているときは、ファイルペインのクリックでアクティブ色にします
    $('#file_list').click({src:this}, function(event) {
        var fileList = event.data.src.fileList;
        if (fileList.getSelectedFile() != null) fileList.setActive(true);
        });
};

/**
 * 初期化処理です。ファイルツリーを取得して表示します。
 */
FileLoader.prototype.initialLoad = function(userId, callback) {
    var folderTree = this.folderTree;
    FileLoader.post(function(driveList){
        // ロードしたファイルデータをフォルダツリーに設定します
        folderTree.setupFiles(driveList);

        // 自分のドライブフォルダを選択します
        folderTree.activateByOwnderId(userId);

        // コールバックを実行します
        if (callback) callback();

    });
};

/**
 * サーバーからファイルのツリー構造を取得します。
 * @param callback  通信成功後に実行するコールバック
 */
FileLoader.post = function(callback) {
    // サーバーにドライブ情報をリクエストします
    Communicator.request('fileTree', {}, function(res) {
        // 成功したらコールバックを実行します
        callback(res.drives);
    }, g_onFailure);

//    // デバッグ時は上をコメントして次を実行
//    callback(g_driveList);

}

/**
 * ファイル情報をサーバからロードして更新します
 * @param callback      データ更新後に実行するコールバック（省略可能）
 * @param args      データ更新後に実行するコールバックの引数（省略可能）
 */
FileLoader.prototype.updateFiles = function(callback, args) {
    var folderTree = this.folderTree;

    FileLoader.post(function(driveList) {
        // ロードしたファイルデータをフォルダツリーに設定します
        folderTree.setupFiles(driveList);

        // コールバックがあれば実行します
        if (callback) callback(args);
    });
};

/**
 * ツリーボックスのサイズを変更可能にします。
 */
FileLoader.setupTreeResize = function() {

    // 境界線をつかんだフラグ
    var _mouseFlag = false;

    // 境界線をつかんだフラグを設定します
    $('#separator').on('mousedown', function() {
    _mouseFlag = true;
    });

    // マウスを動かした時の処理を定義します
    $('body').on('mousemove', function(e) {
        // 境界線をドラッグ中の時は、ツリーボックスの幅を変更します
        if (_mouseFlag) {
            // リサイズカーソルにします
            $(this).css('cursor', 'w-resize');

            // ツリーボックスのサイズを変更します
            var width = e.pageX;
            var tree = $('#tree');
            var fileArea = $('#file_area');
            tree.css('width', (width - tree.position().left) + 'px');
            fileArea.css('width', (fileArea.position().left + fileArea.width() - width - 7) + 'px');
        }
        ;
    });

    // マウスを放した時の処理
    $('body').on('mouseup', function() {
        if (_mouseFlag == true) {
            _mouseFlag = false;
            $(this).css('cursor', 'default');
        }
    });
}

var g_driveList = [{
    id : 1,
    grouser_id : 1,
    root_id : 1,
    root : {
        id : 0,
        name : 'ユーザー１',
        type : 2,
        parent_id : null,
        creator_id : null,
        doc_id : null,
        edit_user : null,
        created_at : 'YYYY-MM-DD HH:MM:SS',
        updated_at : 'YYYY-MM-DD HH:MM:SS',
        files : [{
            id : 1,
            name : 'file1',
            parent_id : 0,
            type : 1,
            doc_id : 4,
            edit_user : null,
            created_at:"2015-06-11 10:42:50",
            updated_at:"2015-06-11 10:53:43",
        }, {
            id : 2,
            name : 'folder',
            parent_id : 0,
            type : 2,
            files : [],
            created_at:"2015-06-11 10:42:50",
            updated_at:"2015-06-11 10:53:43",
      }, {
            id : 3,
            name : 'file2',
            parent_id : 0,
            type : 1,
            doc_id : 2,
            edit_user : {name: 'user2'},
            created_at:"2015-06-11 10:42:50",
            updated_at:"2015-06-11 10:53:43",
       }, {
            id : 4,
            name : 'aaa',
            parent_id : 0,
            type : 2,
            files : [],
            created_at:"2015-06-11 10:42:50",
            updated_at:"2015-06-11 10:53:43",
        }, {
            id : 5,
            name :'file3aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            parent_id : 0,
            type : 1,
            doc_id : 1,
            edit_user : null,
            created_at:"2015-06-11 10:42:50",
            updated_at:"2015-06-11 10:53:43",
        }]
    },
    creator_id : 1,
    created_at : 'YYYY-MM-DD HH:MM:SS',
    updated_at : 'YYYY-MM-DD HH:MM:SS',
  },
  {
    id : '2',
    grouser_id : 2,
    root_id : 2,
    root : {
        id : 21,
        name : 'グループA',
        type : 2,
        files : [{
            id : 22,
            name : 'file2-1',
            parent_id : 21,
            type : 1,
            doc_id : 21,
            edit_user : null,
        }, {
            id : 23,
            name : 'groupfolder',
            parent_id : 21,
            type : 2,
            doc_id : null,
            edit_user : null,
            files : null,
        }]
    },
  }];

