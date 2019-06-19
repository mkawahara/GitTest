$(document).ready(function() {

    // ファイラ内でのドラッグ選択を無効にします
    $('#list_container').disableSelection();

    // ユーザIDを取得します
    var user = getUser();
    var userId = (user == null) ? -1: user.id; // TODO null のときの挙動

    // ユーザが持つファイルをサーバーからロードします
    FileManager.load(userId);

});

/**
 * 開くボタン押下時の処理
 */
function onOK() {
    var selectedFile = FileManager.getSelectedFile();
    // ファイルが選択されているかを確認します
    if (selectedFile == null) {
        alert('ファイルを選択してください');
        return;
    }

    // ★別文書を挿入する処理を実行します
    this.opener.MessageManager.insertDocument(selectedFile);
    this.close();
}


/**
 * Cancel ボタン押下時の処理
 */
function onCancel() {
    this.close();
};

/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
    this.close();
};
