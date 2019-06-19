/**
 * folderTree.js
 *
 * フォルダツリーのデータと表示を管理します。
 * fileList.js に依存します。
 */

/*==========================================================*/
/* FolderTree クラス */
/*==========================================================*/
/**
 * FolderTree のコンストラクタ関数です。
 * ツリーボックスを初期化します。
 * @param userId        ユーザID
 * @param treeId        フォルダツリーボックスの id
 * @param fileList      ファイルリストオブジェクト
 * @param onDblClick    ダブルクリックハンドラ (fileを引数にとる)
 */
function FolderTree(userId, treeId, fileList, onDblClick) {

    // メンバ変数
    this.userId = userId;       // ユーザID
    this.tree = $('#'+treeId);  // ツリーオブジェクト
    this.driveList = [];        // ドライブのリスト

    // ツリーボックスを初期化します
    this.tree.dynatree({
        // 選択されたときの処理です
        onActivate : function(node) {
            // ファイルリストを更新します
            fileList.setFiles(node.data.files, onDblClick);

            // 選択色の整合性のため、必ずフォーカスを要求します
            node.focus();
        },

        // アクティブなノードの親フォルダを展開して可視化します
        activeVisible : true,

        // フォルダの展開状態をクッキーに保存します
        persist : true,

        // フォーカスが外れたときのアクティブ色を灰色にします
        onBlur: function(node) {
            // アクティブであれば色を変えます
            var activeNode = $('#'+treeId).dynatree('getActiveNode');
            if (activeNode.data.fileInfo.id == node.data.fileInfo.id) {
                $('#'+treeId).find('span.dynatree-active').find('a')
                .css({'cssText' : 'background-color: lightgray !important;'});
            }
        },
        onFocus : function(node) {
            // フォーカスされたノードがある場合は色の設定を削除します
            $('#'+treeId).find('span.dynatree-node').find('a').css('background-color', '');
        },
    });

    // タイトルのクリックではフォルダを開閉しないようにします
    this.tree.click(function(event) {
        if (event.target.nodeName == 'A') $('#'+treeId).dynatree('getActiveNode').toggleExpand();
    });

};

/**
 * ドライブリストからファイルツリーを構成します。
 * @param driveList             ファイルのツリー構造を含むドライブリスト
 */
FolderTree.prototype.setupFiles = function(driveList) {
    if (driveList == null) return;
    this.driveList = driveList;

    // ツリーのルートノードの子要素を削除します
    var rootNode = this.tree.dynatree('getRoot');
    rootNode.removeChildren();

    // ツリーにフォルダを追加します
    var userId = this.userId;
    $.each(driveList, function(i, drive) {
        // ドライブのフォルダを追加します
        var childNode = FolderTree.addFolderNode(rootNode, drive.root, drive.grouser_id == userId, true);
    })

};

/**
 * 選択されたフォルダの情報を取得します。
 */
FolderTree.prototype.getSelectedFolder = function() {
    // アクティブな要素を取得します
    var activeNode = this.tree.dynatree('getActiveNode');
    return (activeNode == null) ? null : activeNode.data.fileInfo;
};

/**
 * フォルダのIDを使って要素をアクティブにします。
 */
FolderTree.prototype.activateByFolderId = function(activeFolderId) {
    // フォルダのIDが一致したものをアクティブにします。
    this.tree.dynatree('getTree').visit(function(node) {
        if (node.data.fileInfo.id == activeFolderId) {
            node.activate();
            return false;
        }
    });
};

/**
 * ドライブの所有者IDを使ってアクティブにします。
 */
FolderTree.prototype.activateByOwnderId = function(ownerId) {
    // ドライブの所有IDが一致するフォルダのIDを取得します
    var activeFolderId = undefined;
    $.each(this.driveList, function(i, drive) {
        if (drive.grouser_id == ownerId) {
            activeFolderId = drive.root.id;
        }
    })

    // アクティブにすべきフォルダIDが取得できた場合にアクティブ操作を実行します
    if (activeFolderId != undefined) {
        this.activateByFolderId(activeFolderId);
    }
};

/**
 * ヘルパー関数
 * フォルダツリーにデータを追加します。
 * @param parentNode    追加すべき親ツリーノード
 * @param file          追加対象ファイル
 * @param isMyDocument  マイドキュメントフォルダであるかどうか
 * @param isDrive       ドライブフォルダ（マイドキュメント、グループフォルダ）であるかどうか
 * @returns 追加した子要素
 */
FolderTree.addFolderNode = function(parentNode, file, isMyDocument, isDrive) {
    if (parentNode == null || file == null) return null;

    // フォルダ以外は追加しません
    if (FILE_TYPE.folder != file.type) return null;

    // ドライブフォルダであるかどうかを保存します
    file.isDrive = isDrive;
    for (var i=0; i<file.files; i++) file.files[i].isDrive = false;

    // 子ノードを追加します
    var childNode = parentNode.addChild({
        title : (isMyDocument ? 'マイ ドキュメント' : file.name), // 名前
        isFolder : true,        // フォルダであること
        fileInfo : file,        // ファイル情報（独自拡張）
        files : file.files,     // ファイル一覧（独自拡張）
    });

    // 再帰的に追加します
    if (file.files != null) {
        // 名前でソート
        file.files.sort(function (file1, file2) {
            if (file1.name.toLowerCase() < file2.name.toLowerCase()) return -1;
            else if (file1.name.toLowerCase() > file2.name.toLowerCase()) return 1;
            else return 0;
        });

        // 子ノードを追加
        $.each(file.files, function (i, fileTmp) {
            FolderTree.addFolderNode(childNode, fileTmp, false, false);
        });
    }

    // 追加した子要素を返します
    return childNode;
};

