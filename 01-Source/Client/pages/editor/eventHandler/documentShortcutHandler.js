/**
 * ページ全体におけるキーボードショートカットの処理を提供します。
 */
function DocumentShortcutHandler(){};

DocumentShortcutHandler.init = function() {
	document.onkeydown = DocumentShortcutHandler.onKeyDown;
};

/*********************************************************************
 * KeyDown イベント
 *********************************************************************/

DocumentShortcutHandler.onKeyDown = function(event) {
	// ★編集禁止時は、このメソッドは一部ショートカット以外何もしないこと★
	var editable = DocumentManager.isEditable();
	if (editable !== true) {
		if (!KeyEventHandler.isAudioControlable(event, editable)) {
		    if (editable === -1)
		    {
		    	// Ctrl + S, Y, Z を処理します (Alt, Shift の状態は無視しています)
		    	if (event.ctrlKey && ((event.keyCode === 83) || (event.keyCode === 89) || (event.keyCode === 90)))
		    	{
		    		showMessageDialog('読み上げモードの時、指定されたショートカットは実行できません。', '操作エラー');
		    	}
		    }
			event.preventDefault();
			event.stopPropagation();
			return;
		}
	}

	// ショートカットを検索し、対応する処理文字列を取得します
	var execStr = KeyEventHandler.findShortcut(event, DocumentShortcutHandler.shortCuts);

	// 対応するショートカットが取得された場合、
	// ショートカットを実行し、デフォルトの処理を含む以降の処理をキャンセルします
	if (execStr !== null) {
		if (execStr.func) {
			eval(execStr.func); // 機能実行
		} else {
			execStr.exec();
		}
		event.preventDefault();
		event.stopPropagation();
	}
};


/*********************************************************************
 * ショートカットデータ定義
 *********************************************************************/

DocumentShortcutHandler.shortCuts = [
	// ---- ファイル系
	// Ctrl + S, 上書き保存
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  83, key : ['S', 's'],
		exec : FileMenuEventHandler.onClickSave},

	// ---- インデックス操作系
	// Alt + Ctrl + I, インデックスを追加
	{ isAlt : true,  isCtrl : true,  isShift : false, keyCode :  73, key : ['I', 'i'],
		func : 'IndexEventHandler.onClickAdd()' },
	// Alt + Ctrl + D, インデックスを削除
	{ isAlt : true,  isCtrl : true,  isShift : false, keyCode :  68, key : ['D', 'd'],
		func : 'IndexEventHandler.onClickDel()' },
	// Alt + Ctrl + Del(Mac), インデックスを削除
	// Backspace で文字の削除されないように、document と EditorPane 両方で定義
	{ isAlt : true,  isCtrl : true,  isShift : false, keyCode :  8, key : ['Backspace'],
	    func : 'IndexEventHandler.onClickDel()', condition: 'KeyEventHandler.isMac()'},
	// Ctrl + PageDown, 次のセクションへ移動
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  34, key : ['PageDown'],
		func : 'IndexEventHandler.onKeySectionSelect(1)' },
	// Ctrl + PageUp, 前のセクションへ移動
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  33, key : ['PageUp'],
		func : 'IndexEventHandler.onKeySectionSelect(-1)' },

	// ---- 編集系
	// Ctrl + z, Undo
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  90, func : 'EditMenuEventHandler.onClickUndo()' },
	// Ctrl + y, Redo
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  89, func : 'EditMenuEventHandler.onClickRedo()' },


	// ---- 検索系


	// ---- 音声系
	// Alt + R, 音声 On/Off
	{ isAlt : true, isCtrl : false,  isShift : false, keyCode :  82, key : ['R', 'r'],
		func : 'ReadMenuEventHandler.onClickVoice()' },


	// ---- ヘルプ系
	// Alt + Ctrl + Shift + S, ショートカット表示
	{ isAlt : true, isCtrl : true,  isShift : true, keyCode :  83, key : ['S', 's'],
		func : 'HelpMenuEventHandler.onClickShortcutList()' },

 ];
