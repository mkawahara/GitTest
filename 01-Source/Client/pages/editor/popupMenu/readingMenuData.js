/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年08月14日                         */

// メニューバー：読み上げ機能系メニュー
PopupMenu.readingMenu = {'type' : 'ul', 'id' : 'MB_Reading_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '音声 ON/OFF', 'shortcut' : 'Alt+R',
			'id' : 'MB_Reading_Voice_OnOff',  'icon' : '337.png',
			'func' : 'ReadMenuEventHandler.onClickVoice()'},

		{'type' : 'li', 'title' : 'ハイライトモード ON/OFF', 'shortcut' : '', 'separator' : true,
			'id' : 'MB_Reading_Hilight_OnOff',  'icon' : '339.png',
			'func' : 'ReadMenuEventHandler.onClickHilight()'},

		{'type' : 'li', 'title' : '無音範囲に設定', 'shortcut' : 'Ctrl+0',
			'id' : 'MB_Reading_Silent',  'icon' : '90.png',
			'func' : 'ReadMenuEventHandler.onClickSilent()'},

		{'type' : 'li', 'title' : 'フレーズ結合', 'shortcut' : 'Ctrl+;',
			'id' : 'MB_Reading_Phrase',  'icon' : 'phrase.png',
			'func' : 'EditMenuEventHandler.onSetPhrase()'},
		{'type' : 'li', 'title' : 'フレーズ分割の挿入', 'shortcut' : 'Ctrl+Shift+/',
			'id' : 'MB_Reading_HighlightDivide',  'icon' : 'highlight_div.png',
			'func' : 'EditMenuEventHandler.onHighlightDivide()'},


		{'type' : 'li', 'title' : '話者切り替え', 'shortcut' : '',
			'id' : 'MB_Reading_SwitchVoice', 'icon' : '416.png',
			'func' : ''},
		{'type' : 'ul', 'id' : 'MB_Speaker_ConMenu', 'separator' : true, 'contents' : [	]},


		{'type' : 'li', 'title' : '単語辞書の選択', 'shortcut' : '',
			'id' : 'MB_Reading_SelectDict', 'icon' : '84.png',
			'func' : 'ReadMenuEventHandler.onSelectDic()'},

		{'type' : 'li', 'title' : '単語辞書の編集', 'shortcut' : '',
			'id' : 'MB_Reading_EditDict', 'icon' : '86.png',
			'func' : 'WindowManager.instance.openDicEditWindow()'},

		{'type' : 'li', 'title' : '単語の追加', 'shortcut' : '',
			'id' : 'MB_Reading_AddToDict', 'icon' : '88.png',
			'func' : 'MessageManager.registNewWord()'},

		{'type' : 'li', 'title' : '単語辞書の情報', 'shortcut' : '', 'separator' : true,
			'id' : 'MB_Reading_DictInfo', 'icon' : '381.png',
			'func' : 'WindowManager.instance.openDicInfoWindow()'},

	]
};

// ツールバー：話者選択
PopupMenu.speaker = {'type' : 'ul', 'id' : 'ET_Edit_Speaker_ConMenu',
	'contents' : [
//		{'type' : 'li', 'title' : 'なぎさ', 'shortcut' : '',
//		 'id' : 'Et_Speaker_Nagisa', 'icon' : '', char : '',
//		 'func' : '' },

//		{'type' : 'li', 'title' : 'せいじ', 'shortcut' : '',
//		 'id' : 'Et_Speaker_Seiji', 'icon' : '', char : '', 'separator' : true,
//		 'func' : '' },

		{'type' : 'li', 'title' : '話者を解除', 'shortcut' : '',
		 'id' : 'Et_Speaker_SwitchVoice_Del', 'icon' : '', char : '',
		 'func' : '' },
	]
};

