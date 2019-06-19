/**
 * ここにはページ終了時の処理を記述します。
 */


function UnloadEvents() {};

UnloadEvents.init = function() {
	window.addEventListener('beforeunload', UnloadEvents.before);
	window.addEventListener('unload', UnloadEvents.after);
};

/**
 * ページのアンロード前のイベントです
 */
UnloadEvents.before = function(event) {
	if (StatusManager.getSaveAttribute()) {
		event.returnValue = 'データが変更されていますが、このままページから移動しますか？';
	}
};

/**
 * ページのアンロード確定後のイベントです
 */
UnloadEvents.after = function() {
	console.log('Exiting editor page.');

	// 文書IDを取得します
    var docId = DocumentManager.getDocId();

	// 編集状態と、データ変換サーバの辞書登録を解除します
	Communicator.requestSync( 'docEndEdit', {id: docId});
//	Communicator.request( 'dicUnregister', {doc_id: docId}, function(){}, function(){});
	Communicator.requestSync( 'dicUnregister', {doc_id: docId}, function(){}, function(){});

	console.log('Exit editor page.');
};
