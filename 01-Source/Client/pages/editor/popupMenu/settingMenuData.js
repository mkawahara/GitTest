/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： settingMenuData.js                                 */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: 設定系メニューデータ         */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月26日                         */

// メニューバー：書式系メニュー
PopupMenu.settingMenu = {'type' : 'ul', 'id' : 'MB_Setting_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : 'エディタ設定(O)', 'shortcut' : '',
		 'id' : 'MB_Setting_Option',  'icon' : '80.png', 'func' : 'EditMenuEventHandler.onClickSetOption()'},

		{'type' : 'li', 'title' : '音声設定(V)', 'shortcut' : '',
			'id' : 'MB_Reading_Setting',  'icon' : '82.png',
			'func' : ''},
		{'type' : 'ul', 'id' : '', 'separator' : true, 'contents' : [
			{'type' : 'li', 'title' : '日本語音声設定', 'shortcut' : '',
			 'id' : 'MB_Reading_Setting_JP', 'icon' : '', 'char' : '',
			 'func': 'ReadMenuEventHandler.onVoiceSetting(\'JP\')'},

			{'type' : 'li', 'title' : '英語音声設定', 'shortcut' : '',
			 'id' : 'MB_Reading_Setting_EN', 'icon' : '', 'char' : '',
			 'func': 'ReadMenuEventHandler.onVoiceSetting(\'EN\')'},

			{'type' : 'li', 'title' : '数式音声設定', 'shortcut' : '',
			 'id' : 'MB_Reading_Setting_Math', 'icon' : '', 'char' : '',
			 'func': 'ReadMenuEventHandler.onVoiceSetting(\'Math\')'},

			{'type' : 'li', 'title' : '音声設定選択', 'shortcut' : '',
			 'id' : 'MB_Reading_Setting_JP', 'icon' : '', 'char' : '',
			 'func': 'ReadMenuEventHandler.onSelectVoiceSetting()'},
		]},


//		{'type' : 'li', 'title' : '単語辞書の選択', 'shortcut' : '',
//		 'id' : 'MB_Setting_SelectDict',  'icon' : '84.png', 'func' : ''},

		{'type' : 'li', 'title' : '数式レベル', 'shortcut' : '', 'id' : 'MB_Setting_FormulaLevel', 'icon' : '9.png',
			'func' : ''},

		{'type' : 'ul', 'id' : '', 'contents' : [

			{'type' : 'li', 'title' : '中学校数学', 'shortcut' : '',
			 'id' : 'MB_Setting_FormulaLevel_1', 'icon' : '135.png', 'func' : 'PopupMenu.setMathLevel(1)'},

			{'type' : 'li', 'title' : '高校数学', 'shortcut' : '',
			 'id' : 'MB_Setting_FormulaLevel_2', 'icon' : '136.png', 'func' : 'PopupMenu.setMathLevel(2)'},

			{'type' : 'li', 'title' : ' 理工系大学数学', 'shortcut' : '',
			 'id' : 'MB_Setting_FormulaLevel_3', 'icon' : '137.png', 'func' : 'PopupMenu.setMathLevel(3)'},

			{'type' : 'li', 'title' : '専門数学', 'shortcut' : '',
			 'id' : 'MB_Setting_FormulaLevel_4', 'icon' : '138.png', 'func' : 'PopupMenu.setMathLevel(4)'},

//			{'type' : 'li', 'title' : 'レベルのカスタマイズ', 'shortcut' : '',
//			 'id' : '', 'icon' : ''}
		]}
	]
};



