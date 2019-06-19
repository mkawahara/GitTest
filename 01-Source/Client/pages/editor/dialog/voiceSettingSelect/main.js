
var g_docId = null;         // 文書ID
var g_selectedTab = 0;      // 選択されているタブのインデックス
var g_settingListView = null;   // 音声設定リスト表示領域

$(document).ready(function(){
    // タブを作成します
    $( "#_settingTab" ).tabs({activate: function(event, ui){
        g_selectedTab = ui.newTab.index(); // 選択されているタブのインデックスを保存
    }});

    // キーイベントハンドラを作成します
    document.addEventListener('keydown', onKeyDown);

    // IDを親ページから取得します
    var ids = window.opener.MessageManager.getDocumentId();
    var userId = ids.userId;
    g_docId = ids.docId;
    g_selectedTab = 0;

    // ファイラ内でのドラッグ選択を無効にします
    $('#list_container').disableSelection();

    // ユーザが持つファイルをサーバーからロードします
    FileManager.load(userId);

    // システム音声設定名リストの表示領域を作成します
    g_settingListView = new FileList('setting_list');

    // ローカルデバッグ時に有効にします
//    g_settingListView.setFiles([{type:FILE_TYPE.file, id:0, name:'test'}]);

    // システム音声設定名のリストをサーバーから取得します
    ServerManager.requestVoiceSettingList(onLoadVoiceSettingList);

});

////////////////////////////////////////////////////////////////
// イベントハンドラ

/**
 * キー操作時の処理を定義します
 */
function onKeyDown(event) {
	// Enter キーを押されると、設定の保存をサーバに要求します
	if (event.keyCode === 13) {
		onClickSave();
	}

	// esc キーを押されるとウィンドウを閉じます
	if (event.keyCode === 27) {
		onClickCancel();
	}
};

/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
//	this.close();
};


////////////////////////////////////////////////////////////////
// ページロード時のサーバリクエストの処理

/**
 * システム音声設定名データ取得成功時の処理
 */
function onLoadVoiceSettingList(data) {
    // 音声設定リストを取得して、表示のための仮想的なファイルオブジェクトにします
    var settingList = data.system_voicesetting_list;
    var fileList = [];
    for (var i=0; i<settingList.length; i++) {
        fileList.push({type: FILE_TYPE.file, id: i, name: settingList[i]});
    }

    // 選択可能なリストとしてファイルリストと同じ方法で表示します
    g_settingListView.setFiles(fileList);
};


////////////////////////////////////////////////////////////////
// ボタン操作時の処理

/**
 * 選択状況をサーバに保存します
 */
function onClickSave() {
    var settingName = null;
    var refDocId = null;

    // ファイル一覧タブが表示されているとき
    if (g_selectedTab === 0) {
        // 選択されたファイルを取得します
        var selected = FileManager.getSelectedFile();
        if (selected == null) {
            alert('ファイルを選択してください');
            return;
        }

        refDocId = selected.doc_id;
        settingName = selecte.name;
    }
    // システム音声設定一覧タブが選択されているとき
    else {
        var selected = g_settingListView.getSelectedFile();
        if (selected == null) {
            alert('音声設定を選択してください');
            return;
        }

        settingName = selected.name;
    }

	// サーバにリクエストを送信します
	ServerManager.requestSetVoiceSetting(g_docId, settingName, refDocId, function(data){
	    window.opener.MessageManager.setVoiceSettingName(settingName);
	    onSaveSelection(data);
	    });
};

/**
 * 選択を破棄してウィンドウを閉じます
 */
function onClickCancel() {
	this.close();
};


////////////////////////////////////////////////////////////////
// 保存リクエストに対するレスポンスの処理

/**
 * 保存成功時の処理
 */
function onSaveSelection(data) {
    // 編集画面に名前を通知します

    // ウィンドウを閉じます
	this.close();
};
