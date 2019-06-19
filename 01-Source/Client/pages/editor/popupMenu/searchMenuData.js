/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： searchMenuData.js                                  */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: 検索系メニューデータ         */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月26日                         */

// メニューバー：検索系メニュー
PopupMenu.searchMenu = {'type' : 'ul', 'id' : 'MB_Search_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '文字列検索(I)', 'shortcut' : 'Ctrl+F',
		 'id' : 'MB_Search_SearchTextIncFormula',  'icon' : '248.png', 'func' : 'SearchMenuEventHandler.onClickSearch()'},

		{'type' : 'li', 'title' : '文字列置換(J)', 'shortcut' : 'Ctrl+H',
		 'id' : 'MB_Search_ReplaceTextIncFormula', 'icon' : '250.png', 'func' : 'SearchMenuEventHandler.onClickReplace()'},
	]
};



