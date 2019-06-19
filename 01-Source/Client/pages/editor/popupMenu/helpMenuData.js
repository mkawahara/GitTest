/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： helpMenuData.js                                    */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: ヘルプ系メニューデータ       */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 41.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年04月24日                         */

// メニューバー：ヘルプ系メニュー
PopupMenu.helpMenu = {type : 'ul', id : 'MB_Help_ConMenu',
	contents : [
		{type : 'li', title : '操作説明', shortcut : '',
		 id : 'MB_Help_Operation',  icon : '104.png', func : 'HelpMenuEventHandler.onClickOperationManual()'},

		{type : 'li', title : '入力説明', shortcut : '',
		 id : 'MB_Help_Input',  icon : '106.png', func : 'HelpMenuEventHandler.onClickInputManual()'},

		{type : 'li', title : 'ショートカット一覧(S)', shortcut : 'Alt+Ctrl+Shift+S',
		 id : 'MB_Help_Shortcut',  icon : '114.png', func : 'HelpMenuEventHandler.onClickShortcutList()'},

		{type : 'li', title : 'バージョン情報(A)', shortcut : '',
		 id : 'MB_Help_Shortcut',  icon : '114.png', func : 'HelpMenuEventHandler.onClickVersionInfo()'}
	]
};



