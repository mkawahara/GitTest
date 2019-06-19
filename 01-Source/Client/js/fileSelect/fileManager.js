/**
 * ファイル情報を取得するためのマネージャ
 */
function FileManager() {
    this.fileLoader = null;
};

FileManager._instance = null;

/**
 * 唯一のインスタンスを提供します。
 */
Object.defineProperty(FileManager, 'instance', {
    enumerable: true,
    configurable: true,
    get: function(){
        if (FileManager._instance === null) {
            FileManager._instance = new FileManager();
        };

        return FileManager._instance;
    },
});

/**
 * ユーザの保持するファイルをロードします。
 * @param onDblClick    ダブルクリックハンドラ (fileを引数にとる)
 * @param callback      ロード後に実行するコールバック
 */
FileManager.load = function(userId, onDblClick, callback) {
    FileManager.instance.fileLoader = new FileLoader(userId, onDblClick, callback)
};

/**
 * ファイル情報をサーバからロードして更新します
 * @param callback      データ更新後に実行するコールバック（省略可能）
 * @param args      データ更新後に実行するコールバックの引数（省略可能）
 */
FileManager.updateFiles = function(callback, args) {
    FileManager.instance.fileLoader.updateFiles(callback, args);
}

/**
 * 選択されたファイルを取得します。
 */
FileManager.getSelectedFile = function() {
    return FileManager.instance.fileLoader.fileList.getSelectedFile();
};

/**
 * フォルダツリーを管理するオブジェクトを取得します。
 */
FileManager.getFolderTree = function() {
    return FileManager.instance.fileLoader.folderTree;
};

/**
 * ファイルリストを管理するオブジェクトを取得します。
 */
FileManager.getFileList = function() {
    return FileManager.instance.fileLoader.fileList;
};

/**
 * ファイルリスト内で複数選択できるかどうかを設定します。
 */
FileManager.setMultiSelectable = function(multiSelectable) {
    FileManager.instance.fileLoader.fileList.multiSelectable = multiSelectable;
};
