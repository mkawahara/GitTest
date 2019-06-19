/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： indexMenuData.js                                   */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: インデックス系メニューデータ */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月26日                         */

// メニューバー：インデックス系メニュー
PopupMenu.indexMenu = {'type' : 'ul', 'id' : 'MB_Index_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : 'インデックスを追加', 'shortcut' : 'Alt+Ctrl+I',
			'id' : 'MB_Index_Add',   'icon' : '156.png', 'func' : 'IndexEventHandler.onClickAdd()'},
		{'type' : 'li', 'title' : 'インデックスを削除', 'shortcut' : 'Alt+Ctrl+D', 
			'id' : 'MB_Index_Del', 'icon' : '158.png', 'func' : 'IndexEventHandler.onClickDel()'},
		{'type' : 'li', 'title' : 'レベルを上げる ', 'shortcut' : 'Ctrl+←', 
			'id' : 'MB_Index_Up',   'icon' : '162.png', 'func' : 'IndexEventHandler.onClickShift(-1)'},
		{'type' : 'li', 'title' : 'レベルを下げる ', 'shortcut' : 'Ctrl+→', 
			'id' : 'MB_Index_Down',   'icon' : '160.png', 'func' : 'IndexEventHandler.onClickShift(1)'},
		{'type' : 'li', 'title' : '前に移動 ', 'shortcut' : 'Ctrl+↑', 
			'id' : 'MB_Index_Before',   'icon' : '164.png', 'func' : 'IndexEventHandler.onClickMove(-1)'},
		{'type' : 'li', 'title' : '後ろに移動 ', 'shortcut' : 'Ctrl+↓', 
			'id' : 'MB_Index_After',   'icon' : '166.png', 'func' : 'IndexEventHandler.onClickMove(1)'},
		{'type' : 'li', 'title' : 'セクションを分割 ', 'shortcut' : 'Alt+RETURN', 
			'id' : 'MB_Index_Divide',   'icon' : '168.png', 'func' : 'IndexEventHandler.onClickDivide()'},
		{'type' : 'li', 'title' : 'セクションを連結 ', 'shortcut' : '', 
			'id' : 'MB_Index_Connect',   'icon' : '170.png', 'func' : 'IndexEventHandler.onClickConnect()'},
//		{'type' : 'li', 'title' : 'セクションタイトルバー ', 'shortcut' : 'Alt+T', 
//			'id' : 'MB_Index_TitleBar',   'icon' : '461.png', 'func' : ''},
	]
};



