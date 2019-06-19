
var g_docId = null;         // 文書ID
var g_selectedTab = 0;      // 選択されているタブのインデックス
var g_dicListView = null;   // 辞書リスト表示領域

$(document).ready(function(){
    // タブを作成します
    $( "#_dicTab" ).tabs({activate: function(event, ui){
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

    // システム辞書名リストの表示領域を作成します
    g_dicListView = new FileList('dic_list');

    // ローカルデバッグ時に有効にします
//    g_dicListView.setFiles([{type:FILE_TYPE.file, id:0, name:'test'}]);

    // システム辞書名のリストをサーバーから取得します
    ServerManager.requestDicList(onLoadDicList);

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
 * システム辞書名データ取得成功時の処理
 */
function onLoadDicList(data) {
    // 辞書リストを取得して、表示のための仮想的なファイルオブジェクトにします
    var dicList = data.system_dictionary_list;
    var fileList = [];
    for (var i=0; i<dicList.length; i++) {
        fileList.push({type: FILE_TYPE.file, id: i, name: dicList[i]});
    }

    // 選択可能なリストとしてファイルリストと同じ方法で表示します
    g_dicListView.setFiles(fileList);
};


////////////////////////////////////////////////////////////////
// ボタン操作時の処理

/**
 * 選択状況をサーバに保存します
 */
function onClickSave() {
    var dicName = null;
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
        dicName = selected.name;
    }
    // システム辞書一覧タブが選択されているとき
    else {
        var selected = g_dicListView.getSelectedFile();
        if (selected == null) {
            alert('辞書を選択してください');
            return;
        }

        dicName = selected.name;
    }

	// サーバにリクエストを送信します
	ServerManager.requestSetDictionary(g_docId, dicName, refDocId, function(data){
	    window.opener.MessageManager.setDictionaryName(dicName);
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
	this.close();
};
