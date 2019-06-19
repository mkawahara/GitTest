/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： formatMenuData.js                                  */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー: 書式系メニューデータ         */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年08月13日                         */

// メニューバー：書式系メニュー
PopupMenu.formatMenu = {'type' : 'ul', 'id' : 'MB_Format_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : 'テキストモード', 'shortcut' : '', 'id' : 'MB_Format_Text',  'icon' : '220.png',
			'func' : 'EditorToolBarEventHandler.onClickInputMode(CIO_XML_TYPE.text)'},

		{'type' : 'li', 'title' : '数式モード', 'shortcut' : '', 'id' : 'MB_Format_Formula', 'icon' : '222.png',
			'func' : 'EditorToolBarEventHandler.onClickInputMode(CIO_XML_TYPE.math)'},

		{'type' : 'li', 'title' : '化学式モード', 'shortcut' : '', 'separator' : true, 'id' : 'MB_Format_Chemical', 'icon' : '224.png',
			'func' : 'EditorToolBarEventHandler.onClickInputMode(CIO_XML_TYPE.chemical)'},

		{'type' : 'li', 'title' : '斜体(イタリック)', 'shortcut' : 'Ctrl+I',
		 'id' : 'MB_Format_Italic', 'icon' : '228.png', 'func' : 'EditorToolBarEventHandler.onClickItaric()' },

		{'type' : 'li', 'title' : '太字(ボールド)', 'shortcut' : 'Ctrl+B',
		 'id' : 'MB_Format_Bold', 'icon' : '230.png', 'func' : 'EditorToolBarEventHandler.onClickBold()' },

		{'type' : 'li', 'title' : '下線', 'shortcut' : 'Ctrl+U', 'id' : 'MB_Format_Underline', 'icon' : '232.png',
			'func' : 'EditorToolBarEventHandler.onClickUnderline()' },

		{'type' : 'li', 'title' : '打ち消し線', 'shortcut' : '',
		 'id' : 'MB_Format_Strikethrough', 'icon' : '234.png',
		 	'func' : 'EditorToolBarEventHandler.onClickStrike()' },

		{'type' : 'li', 'title' : '脚注書式(上付き)', 'shortcut' : '',
		 'id' : 'MB_Format_FootnoteTop', 'icon' : '238.png',
		 	'func' : 'EditorToolBarEventHandler.onClickFootnote(SM_FOOTNOTE_FORMAT.sup)' },

		{'type' : 'li', 'title' : '脚注書式(下付き)', 'shortcut' : '',
		 'id' : 'MB_Format_FootnoteBottom', 'icon' : '240.png',
		 	'func' : 'EditorToolBarEventHandler.onClickFootnote(SM_FOOTNOTE_FORMAT.sub)' },

		{'type' : 'li', 'title' : 'ルビの設定', 'shortcut' : 'Ctrl+Shift+UP',
		 'id' : 'MB_Format_Ruby', 'icon' : '412.png', 'func' : 'EditorToolBarEventHandler.onRuby()' },

		{'type' : 'li', 'title' : '読みの設定', 'shortcut' : 'Ctrl+Shift+DOWN', 'separator' : true,
		 'id' : 'MB_Format_Read', 'icon' : '414.png', 'func' : 'EditorToolBarEventHandler.onRead()' },

		{'type' : 'li', 'title' : '左寄せ(L)', 'shortcut' : 'Ctrl+L',
		 'id' : 'MB_Format_Left', 'icon' : '242.png',
			'func' : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.left)' },

		{'type' : 'li', 'title' : '中央寄せ(C)', 'shortcut' : 'Ctrl+E',
		 'id' : 'MB_Format_Center', 'icon' : '244.png',
			'func' : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.center)' },

		{'type' : 'li', 'title' : '右寄せ(R)', 'shortcut' : 'Ctrl+R', 'separator' : true,
		 'id' : 'MB_Format_Right', 'icon' : '246.png',
			'func' : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.right)' },

		{'type' : 'li', 'title' : '改ページを挿入', 'shortcut' : 'Ctrl+RETURN',
		 'id' : 'MB_Format_FormFeed', 'icon' : '210.png', 'func' : 'EditMenuEventHandler.onPageBreak()' },

		{'type' : 'li', 'title' : 'フォントサイズ', 'shortcut' : '', 'id' : 'MB_Format_FontSize', 'icon' : '196.png',
			'func' : '' },

		{'type' : 'ul', 'id' : '', 'contents' : [

			{'type' : 'li', 'title' : 'フォントサイズ1', 'shortcut' : '',
			 'id' : 'MB_Format_FontSize_1', 'icon' : '198.png',
			 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.x_small)' },

			{'type' : 'li', 'title' : 'フォントサイズ2', 'shortcut' : '',
			 'id' : 'MB_Format_FontSize_2', 'icon' : '200.png',
 			 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.small)' },

			{'type' : 'li', 'title' : 'フォントサイズ3', 'shortcut' : '',
			 'id' : 'MB_Format_FontSize_3', 'icon' : '202.png',
 			 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.medium)' },

			{'type' : 'li', 'title' : 'フォントサイズ4', 'shortcut' : '',
			 'id' : 'MB_Format_FontSize_4', 'icon' : '204.png',
 			 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.large)' },

			{'type' : 'li', 'title' : 'フォントサイズ5', 'shortcut' : '',
			 'id' : 'MB_Format_FontSize_5', 'icon' : '206.png',
 			 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.x_large)' },

		]},

		{'type' : 'li', 'title' : '枠線', 'shortcut' : '', 'id' : 'MB_Format_FrameBorder', 'icon' : '172.png',
			'func' : '' },

		{'type' : 'ul', 'id' : '', 'contents' : [

			{'type' : 'li', 'title' : '囲み枠なし', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_NoFrame', 'icon' : '174.png',
			 'func' : 'EditorToolBarEventHandler.onFrameBorder(null)' },

			{'type' : 'li', 'title' : '標準の囲み枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Standard', 'icon' : '172.png',
			 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.normal)' },

			{'type' : 'li', 'title' : '二重線の囲み枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Double', 'icon' : '178.png',
 			 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.double)' },

			{'type' : 'li', 'title' : '角の丸い枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Round', 'icon' : '180.png',
 			 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.round)' },

			{'type' : 'li', 'title' : '太い角の丸い枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Bround', 'icon' : '182.png',
 			 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.bround)' },

			{'type' : 'li', 'title' : '影のある枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Shadow', 'icon' : '184.png',
 			 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.shadow)' },

			{'type' : 'li', 'title' : '丸囲み枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Circle', 'icon' : '186.png',
 			 'func' : 'EditorToolBarEventHandler.onFrameBorder(BORDER_TYPE.circle)' },

			{'type' : 'li', 'title' : '逐次表示枠', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_Browse', 'icon' : '188.png', 'func' : '' },

			{'type' : 'li', 'title' : '分かち書き', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_WordSeparated', 'icon' : '190.png', 'func' : '' },

			{'type' : 'li', 'title' : '数式番号', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_FormulaNumber_1', 'icon' : '192.png', 'func' : '' },

			{'type' : 'li', 'title' : '数式番号', 'shortcut' : '',
			 'id' : 'MB_Format_FrameBorder_Con_FormulaNumber_2', 'icon' : '194.png', 'func' : '' },
		]}
	]
};



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

		{'type' : 'li', 'title' : '逐次表示枠', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_Browse', 'icon' : '188.png'},

		{'type' : 'li', 'title' : '分かち書き', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_WordSeparated', 'icon' : '190.png'},

		{'type' : 'li', 'title' : '数式番号', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_FormulaNumber_1', 'icon' : '192.png'},

		{'type' : 'li', 'title' : '数式番号', 'shortcut' : '',
		 'id' : 'ET_Format_FrameBorder_Con_FormulaNumber_2', 'icon' : '194.png'}
	]
};



// ツールバー：フォントサイズメニュー
PopupMenu.fontSize = {'type' : 'ul', 'id' : 'ET_Format_FontSize_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : 'フォントサイズ1', 'shortcut' : '',
		 'id' : 'ET_Format_FontSize_Size1', 'icon' : '198.png',
		 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.x_small)' },

		{'type' : 'li', 'title' : 'フォントサイズ2', 'shortcut' : '',
		 'id' : 'ET_Format_FontSize_Size2', 'icon' : '200.png',
		 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.small)' },

		{'type' : 'li', 'title' : 'フォントサイズ3', 'shortcut' : '',
		 'id' : 'ET_Format_FontSize_Size3', 'icon' : '202.png',
		 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.medium)' },

		{'type' : 'li', 'title' : 'フォントサイズ4', 'shortcut' : '',
		 'id' : 'ET_Format_FontSize_Size4', 'icon' : '204.png',
		 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.large)' },

		{'type' : 'li', 'title' : 'フォントサイズ5', 'shortcut' : '',
		 'id' : 'ET_Format_FontSize_Size5', 'icon' : '206.png',
		 'func' : 'EditorToolBarEventHandler.onFontSize(FONT_SIZE.x_large)' },
	]
};


/*
// ステータスバー：入力モードメニュー
PopupMenu.inputMode = {'type' : 'ul', 'id' : 'SB_InputMode_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : 'テキストモード', 'shortcut' : '',
		 'id' : 'SB_InputMode_Text', 'icon' : '220.png'},

		{'type' : 'li', 'title' : '数式モード', 'shortcut' : '',
		 'id' : 'SB_InputMode_Formula', 'icon' : '222.png'},

		{'type' : 'li', 'title' : '脚注書式(上付き)', 'shortcut' : '',
		 'id' : 'SB_InputMode_FootnoteTop', 'icon' : '238.png'},

		{'type' : 'li', 'title' : '脚注書式(下付き)', 'shortcut' : '',
		 'id' : 'SB_InputMode_FootnoteBottom', 'icon' : '240.png'}
	]
};
*/


