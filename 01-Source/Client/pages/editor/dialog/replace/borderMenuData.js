/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月03日                         */



// ツールバー：囲み枠メニュー
PopupMenu.borderFrame = {'type' : 'ul', 'id' : 'ET_Format_FrameBorder_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '囲み枠なし', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_NoFrame', 'icon' : '174.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(null)' },

		{'type' : 'li', 'title' : '標準の囲み枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Standard', 'icon' : '172.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.normal)' },

		{'type' : 'li', 'title' : '二重線の囲み枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Double', 'icon' : '178.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.double)' },

		{'type' : 'li', 'title' : '角の丸い枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Round', 'icon' : '180.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.round)' },

		{'type' : 'li', 'title' : '太い角の丸い枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Bround', 'icon' : '182.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.bround)' },

		{'type' : 'li', 'title' : '影のある枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Shadow', 'icon' : '184.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.shadow)' },

		{'type' : 'li', 'title' : '丸囲み枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Circle', 'icon' : '186.png',
		 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.circle)' },

	]
};
