/**
 * インデックスペインにおけるキーボードショートカットの処理を提供します。
 */
function IndexPaneShortcutHandler(){};

/*********************************************************************
 * KeyDown イベント
 *********************************************************************/

/**
 * ショートカットを処理します。
 */
IndexPaneShortcutHandler.onKeyDown = function(event) {
	// ★編集禁止時は、このメソッドは一部ショートカット以外何もしないこと★
	var editable = DocumentManager.isEditable();
	if (editable !== true) {
		if (!KeyEventHandler.isAudioControlable(event, editable)) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	}
	console.log('インデックスペインで onKeyDown が発生しました。' + event.key);

	// ショートカットを検索し、対応する処理文字列を取得します
	console.log('++++++++++++++++');
	var execStr = KeyEventHandler.findShortcut(event, IndexPaneShortcutHandler.shortCuts);

	// 対応するショートカットが取得された場合、
	// ショートカットを実行し、デフォルトの処理を含む以降の処理をキャンセルします
	if (execStr !== null) {
        event.preventDefault();
        event.stopPropagation();
		eval(execStr.func); // 機能実行
		return true;
	}

	return false;
};


/*********************************************************************
 * ショートカットデータ定義
 *********************************************************************/

IndexPaneShortcutHandler.shortCuts = [
	// ---- フォーカス移動
    // Alt + T, セクションタイトル編集フィールドにフォーカス
    { isAlt : true, isCtrl : false, isShift : false, keyCode :  84, key : ['T', 't'],
        func : 'ShortCutCommand.focusToTitle()' },
    // F1, インデックスペインへのフォーカス切替
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  112, key : ['F1'],
        func : 'ShortCutCommand.focusToEditorPane()' },
];
