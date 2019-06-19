/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月07日                         */
KeyEventHandler.shortCuts = [
	// ---- 編集系
	// \, 入力アシスト
	{ isAlt : false, isCtrl : false, isShift : false, keyCode : 220, key : ['\\'],
		func : 'ShortCutCommand.codeAssist()' },
	// Ctrl + z, Undo
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  90, func : 'EditMenuEventHandler.onClickUndo()' },
	// Ctrl + y, Redo
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  89, func : 'EditMenuEventHandler.onClickRedo()' },
	// Ctrl + A
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  65, func : 'EditMenuEventHandler.onSelectAll()' },

	// ---- 編集系: テーブル / 行列
	// Ctrl + Shift + T, 表の挿入
	{ isAlt : false, isCtrl : true,  isShift : true,  keyCode :  84, key : ['T', 't'],
		func : 'EditorToolBarEventHandler.onTable()' },
	// Shift + Enter, 表/行列: 下へ 1 行挿入
	{ isAlt : false, isCtrl : false, isShift : true,  keyCode :  13,
		func : 'EditMenuEventHandler.onInsertRowBelow()' },
	// Shift + Delete, 表/行列: 行の削除
	{ isAlt : false, isCtrl : false, isShift : true,  keyCode :  46,
		func : 'EditMenuEventHandler.onDeleteRow()' },
	// Shift + Ctrl + Enter, 表/行列: 後方に 1 列挿入
	{ isAlt : false, isCtrl : true,  isShift : true,  keyCode :  13,
		func : 'EditMenuEventHandler.onInsertColAfter()' },
	// Shift + Ctrl + Delete, 表/行列: 列を削除
	{ isAlt : false, isCtrl : true,  isShift : true,  keyCode :  46,
		func : 'EditMenuEventHandler.onDeleteCol()' },

	// ---- 編集系: tab
	{ isAlt : false, isCtrl : false,  isShift : false,  keyCode :  9,
		func : 'EditorToolBarEventHandler.onTabKey()' },


	// ---- 書式系
	// Ctrl + Space, 入力モード：テキスト / 数式切り替え
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  32, key : ['Space'],
		func : 'EditorToolBarEventHandler.onSwitchInputMode()' },
	// Ctrl + T, 入力モード：テキスト入力モード
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  84, key : ['T', 't'],
		func : 'EditorToolBarEventHandler.onClickInputMode(CIO_XML_TYPE.text)' },
	// Ctrl + M, 入力モード：数式入力モード
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  77, key : ['M', 'm'],
		func : 'EditorToolBarEventHandler.onClickInputMode(CIO_XML_TYPE.math)' },
	// Ctrl + K, 入力モード：化学式入力モード
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  75, key : ['K', 'k'],
		func : 'EditorToolBarEventHandler.onClickInputMode(CIO_XML_TYPE.chemical)' },
	// Ctrl + I, 斜体(イタリック)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  73, key : ['I', 'i'],
		func : 'EditorToolBarEventHandler.onClickItaric()' },
	// Ctrl + B, 太字(ボールド)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  66, key : ['B', 'b'],
		func : 'EditorToolBarEventHandler.onClickBold()' },
	// Ctrl + U, 下線
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  85, key : ['U', 'u'],
		func : 'EditorToolBarEventHandler.onClickUnderline()' },

	// Ctrl + L, 左寄せ(L)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  76, key : ['L', 'l'],
		func : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.left)' },
	// Ctrl + E, 中央寄せ(C)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  69, key : ['E', 'e'],
		func : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.center)' },
	// Ctrl + R, 右寄せ(R)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  82, key : ['R', 'r'],
		func : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.right)' },

	// ---- 音声系
	// Ctrl + Shift + S, 短ポーズ挿入
	{ isAlt : false, isCtrl : true,  isShift : true, keyCode :  83, key : ['S', 's'],
		func : 'ReadMenuEventHandler.onInsertPause(false)' },
	// Ctrl + Shift + L, 長ポーズ挿入
	{ isAlt : false, isCtrl : true,  isShift : true, keyCode :  76, key : ['L', 'l'],
		func : 'ReadMenuEventHandler.onInsertPause(true)' },
	// Shift + Space, テキスト入力モードなら短ポーズ挿入、それ以外なら長ポーズ挿入
	{ isAlt : false, isCtrl : false,  isShift : true, keyCode :  32, key : ['Space'],
		func : 'ReadMenuEventHandler.onInsertPause()' },
	// Ctrl + 0, 無音設定
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  48, key : ['0'],
		func : 'ReadMenuEventHandler.onClickSilent()' },

	// ---- 数式構文
	// F5, 分数
	{ isAlt : false, isCtrl : false,  isShift : false, keyCode :  116,
		func : 'AssistHandler.insert(\'\', {inputmode:2, type: LAYOUT_NODE_TYPE.FRAC, fromshortcut: true})' },
	// F6, 根号
	{ isAlt : false, isCtrl : false,  isShift : false, keyCode :  117,
		func : 'AssistHandler.insert(\'\', {inputmode:2, type: LAYOUT_NODE_TYPE.ROOT, fromshortcut: true})' },
	// F7, 総和
	{ isAlt : false, isCtrl : false,  isShift : false, keyCode :  118,
		func : 'AssistHandler.insert(\'&sum;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER, fromshortcut: true})' },
	// F8, 積分
	{ isAlt : false, isCtrl : false,  isShift : false, keyCode :  119,
		func : 'AssistHandler.insert(\'&int;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL, fromshortcut: true})' },
	// F9, 極限
	{ isAlt : false, isCtrl : false,  isShift : false, keyCode :  120,
		func : 'AssistHandler.insert(\'lim\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER, fromshortcut: true})' },

    // ---- 数式ショートカット
    // 数式モードで「'」, プライム
    { isAlt : false, isCtrl : false,  isShift : true, keyCode : 55, condition: 'ShortCutCommand.isMathMode()',
        func : 'ShortCutCommand.insertChar(\'\\\'\', \'&prime;\', {normalonly: true})'},
    // テンキー「*」, \times
    { isAlt : false, isCtrl : false,  isShift : false, keyCode : 106,
        func : 'ShortCutCommand.insertChar(\'*\', \'&times;\', {inputmode: 2, normalonly: true})'},
    // テンキー「/」, \times
    { isAlt : false, isCtrl : false,  isShift : false, keyCode : 111,
        func : 'ShortCutCommand.insertChar(\'/\', \'&div;\', {inputmode: 2, normalonly: true})'},

	// ----添え字移動
	// コーナーエレメントの右側で「＾」, 右上添え字位置へ
	{ isAlt : false, isCtrl : false,  isShift : false, keyCode : 160, condition: 'ShortCutCommand.brotherHasSuperScript()', func : 'ShortCutCommand.shiftUp(\'^\')' },
	// コーナーエレメントの右側で「_」, 右下添え字位置へ
	{ isAlt : false, isCtrl : false,  isShift : true, keyCode : 220, condition: 'ShortCutCommand.brotherHasSubScript()', func : 'ShortCutCommand.shiftDown(\'_\')' },

];
