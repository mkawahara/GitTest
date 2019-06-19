/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： editorRightMenuData.js                             */
/* -                                                                         */
/* -    概      要     ： エディタ右クリックメニューデータ                   */
/* -                                                                         */
/* -    依      存     ： popupMenu.js                                       */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年04月24日                         */

// エディタペーン：エディタ右クリックメニュー
PopupMenu.editorRClick = {'type' : 'ul', 'id' : 'ET_Edit_EditorPopup_ConMenu', 'contents' : []};

PopupMenu.editorRClickDefault = {'type' : 'ul', 'id' : 'ET_Edit_EditorPopup_ConMenu',
        'contents' : [
            {'type' : 'li', 'title' : '元に戻す(U)', 'shortcut' : 'Ctrl+Z',
             'id' : 'ET_Edit_EditorPopup_Undo',  'icon' : '54.png', 'func' : 'EditMenuEventHandler.onClickUndo()'},

            {'type' : 'li', 'title' : 'やり直し(R)', 'shortcut' : 'Ctrl+Y', 'separator' : true,
             'id' : 'ET_Edit_EditorPopup_Redo',  'icon' : '52.png', 'func' : 'EditMenuEventHandler.onClickRedo()'},

            {'type' : 'li', 'title' : '切り取り(T)', 'shortcut' : 'Ctrl+X',
             'id' : 'ET_Edit_EditorPopup_Cut',   'icon' : '44.png', 'func' : 'EditMenuEventHandler.onClickCut()'},

            {'type' : 'li', 'title' : 'コピー(C)',   'shortcut' : 'Ctrl+C',
             'id' : 'ET_Edit_EditorPopup_Copy',  'icon' : '42.png', 'func' : 'EditMenuEventHandler.onClickCopy()'},

            {'type' : 'li', 'title' : '貼り付け(P)', 'shortcut' : 'Ctrl+V',
             'id' : 'ET_Edit_EditorPopup_Paste', 'icon' : '50.png', 'func' : 'EditMenuEventHandler.onClickPaste()'},

            {'type' : 'li', 'title' : '削除(P)', 'shortcut' : 'Del', 'separator' : true,
             'id' : 'ET_Edit_EditorPopup_Delete', 'icon' : '46.png', 'func' : 'EditMenuEventHandler.onClickDel()'},

            {'type' : 'li', 'title' : 'スタイル設定', 'shortcut' : '',
             'id' : 'ET_Edit_EditorPopup_Style', 'char' : ''},

			{'type' : 'ul', 'id' : '', 'separator' : true, 'contents' : [

				{'type' : 'li', 'title' : '数式番号', 'shortcut' : '',
				 'id' : 'ET_Edit_EditorPopup_SushikiNum', 'char' : '',
				 'func' : 'EditMenuEventHandler.onFormulaNumber()' },

				{'type' : 'li', 'title' : 'ページ番号', 'shortcut' : '',
				 'id' : 'ET_Edit_EditorPopup_PageNum', 'char' : '', 'func' : 'EditMenuEventHandler.onPageNumber()' },

			]},
     ]};



// エディタペイン右クリック：画像上の右クリックメニュー
PopupMenu.pictureRClick = {'type' : 'ul', 'id' : 'ET_Edit_ImagePopup_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '元に戻す(U)', 'shortcut' : 'Ctrl+Z',
		 'id' : 'ET_Edit_ImagePopup_Undo',  'icon' : '54.png', 'func' : 'EditMenuEventHandler.onClickUndo()'},

		{'type' : 'li', 'title' : 'やり直し(R)', 'shortcut' : 'Ctrl+Y', 'separator' : true,
		 'id' : 'ET_Edit_ImagePopup_Redo',  'icon' : '52.png', 'func' : 'EditMenuEventHandler.onClickRedo()'},

		{'type' : 'li', 'title' : '切り取り(T)', 'shortcut' : 'Ctrl+X',
		 'id' : 'ET_Edit_ImagePopup_Cut',  'icon' : '44.png'},

		{'type' : 'li', 'title' : 'コピー(C)', 'shortcut' : 'Ctrl+C',
		 'id' : 'ET_Edit_ImagePopup_Copy',  'icon' : '42.png'},

		{'type' : 'li', 'title' : '貼り付け(P)', 'shortcut' : 'Ctrl+V',
		 'id' : 'ET_Edit_ImagePopup_Paste',  'icon' : '50.png'},

		{'type' : 'li', 'title' : '削除(P)', 'shortcut' : 'Del', 'separator' : true,
		 'id' : 'ET_Edit_ImagePopup_Delete',  'icon' : '46.png'},

		{'type' : 'li', 'title' : '画像の設定', 'shortcut' : '', 'separator' : true,
		 'id' : 'ET_Edit_ImagePopup_Setting',  'icon' : '424.png', 'func' : 'EditorToolBarEventHandler.onImage()'},

		{'type' : 'li', 'title' : 'アニメーション編集', 'shortcut' : '',
		 'id' : 'ET_Edit_ImagePopup_Animation',  'icon' : '425.png', 'func' : 'EditMenuEventHandler.onAnimation()'}
	]
};



// テーブル・行列右クリックメニュー
PopupMenu.tableRClick = {'type' : 'ul', 'id' : 'ET_Edit_TablePopup_ConMenu', 'contents' : []};

PopupMenu.tableRClickDefault = {'type' : 'ul', 'id' : 'ET_Edit_TablePopup_ConMenu',
	'contents' : [
		{'type' : 'li', 'title' : '元に戻す(U)', 'shortcut' : 'Ctrl+Z',
		 'id' : 'ET_Edit_TablePopup_Undo',  'icon' : '54.png', 'func' : 'EditMenuEventHandler.onClickUndo()'},

		{'type' : 'li', 'title' : 'やり直し(R)', 'shortcut' : 'Ctrl+Y', 'separator' : true,
		 'id' : 'ET_Edit_TablePopup_Redo',  'icon' : '52.png', 'func' : 'EditMenuEventHandler.onClickRedo()'},

		{'type' : 'li', 'title' : '切り取り(T)', 'shortcut' : 'Ctrl+X',
		 'id' : 'ET_Edit_TablePopup_Cut',  'icon' : '44.png'},

		{'type' : 'li', 'title' : 'コピー(C)', 'shortcut' : 'Ctrl+C',
		 'id' : 'ET_Edit_TablePopup_Copy',  'icon' : '42.png'},

		{'type' : 'li', 'title' : '貼り付け(P)', 'shortcut' : 'Ctrl+V',
		 'id' : 'ET_Edit_TablePopup_Paste',  'icon' : '50.png'},

		{'type' : 'li', 'title' : '削除(P)', 'shortcut' : 'Del', 'separator' : true,
		 'id' : 'ET_Edit_TablePopup_Delete',  'icon' : '46.png'},

		{'type' : 'li', 'title' : '上に1行挿入', 'shortcut' : '',
		 'id' : 'ET_Edit_TablePopup_InsertRowAbove',  'icon' : 'dll000d.png',
		 'func' : 'EditMenuEventHandler.onInsertRowAbove()'},

		{'type' : 'li', 'title' : '下に1行挿入', 'shortcut' : 'Shift+Enter',
		 'id' : 'ET_Edit_TablePopup_InsertRowBelow',  'icon' : 'dll000e.png',
		 'func' : 'EditMenuEventHandler.onInsertRowBelow()'},

		{'type' : 'li', 'title' : '行を削除', 'shortcut' : 'Shift+Delete',
		 'id' : 'ET_Edit_TablePopup_DeleteRow',  'icon' : 'dll000f.png',
		 'func' : 'EditMenuEventHandler.onDeleteRow()'},

		{'type' : 'li', 'title' : '前方に1列挿入', 'shortcut' : '',
		 'id' : 'ET_Edit_TablePopup_InsertColumnBefore',  'icon' : 'dll0010.png',
		 'func' : 'EditMenuEventHandler.onInsertColBefore()'},

		{'type' : 'li', 'title' : '後方に1列挿入', 'shortcut' : 'Shift+Ctrl+Enter',
		 'id' : 'ET_Edit_TablePopup_InsertColumnAfter',  'icon' : 'dll0011.png',
		 'func' : 'EditMenuEventHandler.onInsertColAfter()'},

		{'type' : 'li', 'title' : '列を削除', 'shortcut' : 'Shift+Ctrl+Delete', 'separator' : true,
		 'id' : 'ET_Edit_TablePopup_DeleteColumn',  'icon' : 'dll0012.png',
		 'func' : 'EditMenuEventHandler.onDeleteCol()'},

		{'type' : 'li', 'title' : '表を縦方向に読み上げる', 'shortcut' : '', 'separator' : true,
		 'id' : 'ET_Edit_TablePopup_ReadLongitude',  'icon' : 'dll0013.png',
		 'func' : 'EditMenuEventHandler.onReadLongitude()'},

		{'type' : 'li', 'title' : 'スタイル設定', 'shortcut' : '',
			'id' : 'ET_Edit_TablePopup_Style', 'char' : ''},

		{'type' : 'ul', 'id' : '', 'separator' : true, 'contents' : [

			{'type' : 'li', 'title' : '数式番号', 'shortcut' : '',
			 'id' : 'ET_Edit_TablePopup_SushikiNum', 'char' : '',
			 'func' : 'EditMenuEventHandler.onFormulaNumber()' },

			{'type' : 'li', 'title' : 'ページ番号', 'shortcut' : '',
			 'id' : 'ET_Edit_TablePopup_PageNum', 'char' : '', 'func' : 'EditMenuEventHandler.onPageNumber()' },

		]},

	]
};



