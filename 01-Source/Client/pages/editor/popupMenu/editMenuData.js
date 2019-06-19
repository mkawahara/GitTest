/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： editMenuData.js                                    */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: 編集系メニューデータ         */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月26日                         */

// メニューバー：編集系メニュー
PopupMenu.editMenu = {'type' : 'ul', 'id' : 'MB_Edit_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '元に戻す(U)', 'shortcut' : 'Ctrl+Z', 'id' : 'MB_Edit_Undo',  'icon' : '54.png',
			'func' : 'EditMenuEventHandler.onClickUndo()' },

		{'type' : 'li', 'title' : 'やり直し(R)', 'shortcut' : 'Ctrl+Y', 'separator' : true, 'id' : 'MB_Edit_Redo',  'icon' : '52.png',
			'func' : 'EditMenuEventHandler.onClickRedo()' },

		{'type' : 'li', 'title' : '切り取り(T)', 'shortcut' : 'Ctrl+X', 'id' : 'MB_Edit_Cut',   'icon' : '44.png',
			'func' : 'EditMenuEventHandler.onClickCut()'},

		{'type' : 'li', 'title' : 'コピー(C)',   'shortcut' : 'Ctrl+C', 'id' : 'MB_Edit_Copy',  'icon' : '42.png',
			'func' : 'EditMenuEventHandler.onClickCopy()'},

		{'type' : 'li', 'title' : '貼り付け(P)', 'shortcut' : 'Ctrl+V', 'separator' : true, 'id' : 'MB_Edit_Paste', 'icon' : '50.png',
			'func' : 'EditMenuEventHandler.onClickPaste()'},

//		{'type' : 'li', 'title' : '選択範囲を画像としてコピー', 'shortcut' : 'Ctrl+Shift+C',
//		 'id' : 'MB_Edit_CopyAsImage',   'icon' : '252.png', 'func' : '' },

//		{'type' : 'li', 'title' : '拡張メタ形式貼り付け', 'shortcut' : 'Alt+Ctrl+V',
//		 'id' : 'MB_Edit_PasteAsEMF',   'icon' : '256.png',  'func' : '' },

		{'type' : 'li', 'title' : '全て選択(A) ', 'shortcut' : 'Ctrl+A', 'id' : 'MB_Edit_SelectAll',
		 'icon' : '254.png', 'func' : 'EditMenuEventHandler.onSelectAll()' },

//		{'type' : 'li', 'title' : '画像の挿入(I)', 'shortcut' : 'Alt+T',
//			'id' : 'MB_Edit_InsertImage', 'icon' : '208.png',
//			'func' : 'EditorToolBarEventHandler.onClickInsertImage()' },

		{'type' : 'li', 'title' : '表を挿入', 'shortcut' : 'Ctrl+Shift+T',
		 'id' : 'MB_Edit_InsertTable', 'icon' : '56.png', 'func' : 'EditorToolBarEventHandler.onTable()' },
	]
};



// ツールバー：画像系メニュー
PopupMenu.pictureMenu = {'type' : 'ul', 'id' : 'ET_Edit_InsertImage_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '画像の設定', 'shortcut' : '',
		 'id' : 'ET_Edit_InsertImage_Setting',  'icon' : '424.png', 'func' : 'EditorToolBarEventHandler.onImage()' },
	]
};



