/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： fileMenuData.js                                    */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: ファイルメニューデータ       */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月26日                         */

// メニューバー：ファイルメニュー
PopupMenu.fileMenu = {'type' : 'ul', 'id' : 'MB_File_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '上書き保存',             'shortcut' : 'Ctrl+S',
			'id' : 'MB_File_Save',   'icon' : '72.png', 'func' : 'FileMenuEventHandler.onClickSave()'},
		{'type' : 'li', 'title' : '名前を付けて保存...',    'shortcut' : '',
			'id' : 'MB_File_SaveAs', 'icon' : '74.png', 'func' : 'FileMenuEventHandler.onClickSaveAs()'},
	    {'type' : 'li', 'title' : '追加読み込み...',    'shortcut' : '',
	        'id' : 'MB_File_SaveAs', 'icon' : '', 'func' : 'FileMenuEventHandler.onClickInsertDoc()'},
		{'type' : 'li', 'title' : '文書プロパティ',    'shortcut' : '',
			'id' : 'MB_File_SaveAs', 'icon' : '', 'func' : 'WindowManager.instance.openPropertyWindow()'},
	]
};



