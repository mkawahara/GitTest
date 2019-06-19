/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年08月13日                         */

KeyEventHandler.shortCuts = [
	// ---- インデックス操作系
	// Alt + Enter, セクションを分割
	{ isAlt : true,  isCtrl : false, isShift : false, keyCode :  13, key : ['Enter'],
		func : 'IndexEventHandler.onClickDivide()' },
	// Alt + Ctrl + Del(Mac), インデックスを削除
	// Backspace で文字の削除されないように、document と EditorPane 両方で定義
	{ isAlt : true,  isCtrl : true,  isShift : false, keyCode :  8, key : ['Backspace'],
	    func : 'IndexEventHandler.onClickDel()', condition: 'KeyEventHandler.isMac()'},

	// ---- 編集系
	// \, 入力アシスト
	{ isAlt : false, isCtrl : false, isShift : false, keyCode : 220, key : ['\\'],
		func : 'ShortCutCommand.codeAssist()' },
	// Ctrl + A
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  65, func : 'EditMenuEventHandler.onSelectAll()' },

	// ---- 編集系: テーブル / 行列
	// Ctrl + Shift + T, 表の挿入
	{ isAlt : false, isCtrl : true,  isShift : true,  keyCode :  84, key : ['T', 't'],
		func : 'EditorToolBarEventHandler.onTable()' },
	// Shift + Enter, 段落途中改行 および 表/行列: 下へ 1 行挿入
	{ isAlt : false, isCtrl : false, isShift : true,  keyCode :  13,
		func : 'EditMenuEventHandler.onShiftEnter()' },
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
	// ---- 編集系: 改ページ
	// Ctrl + Enter
	{ isAlt : false, isCtrl : true, isShift : false,  keyCode :  13, key : ['Enter'],
		func : 'EditMenuEventHandler.onPageBreak()' },
	// ---- 編集系：ページ番号スタイル
	// Alt + Ctrl +  P
	{ isAlt : true, isCtrl : true, isShift : false, keyCode : 80, key : ['P', 'p'],
		func : 'EditMenuEventHandler.onPageNumber()' },

	// ---- 検索系
	// Ctrl + F, 検索
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  70, key : ['F', 'f'],
		func : 'SearchMenuEventHandler.onClickSearch()' },
	// Ctrl + H, 置換
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  72, key : ['H', 'h'],
		func : 'SearchMenuEventHandler.onClickReplace()' },

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
	// Ctrl + 1, ルビの設定
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  49, key : ['1'],
		func : 'EditorToolBarEventHandler.onRuby()' },
	// Ctrl + Shift + UP, ルビの設定
	{ isAlt : false, isCtrl : true,  isShift : true,  keyCode :  38,
		func : 'EditorToolBarEventHandler.onRuby()' },
	// Ctrl + Shift + DOWN, 読みの設定
	{ isAlt : false, isCtrl : true,  isShift : true,  keyCode :  40, key : ['Down'],
		func : 'EditorToolBarEventHandler.onRead()' },
	// Ctrl + 2, 読みの設定
	{ isAlt : false, isCtrl : true,  isShift : false,  keyCode :  50, key : ['2'],
	    func : 'EditorToolBarEventHandler.onRead()' },
	// Ctrl + L, 左寄せ(L)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  76, key : ['L', 'l'],
		func : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.left)' },
	// Ctrl + E, 中央寄せ(C)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  69, key : ['E', 'e'],
		func : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.center)' },
	// Ctrl + R, 右寄せ(R)
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  82, key : ['R', 'r'],
		func : 'EditorToolBarEventHandler.onClickAlign(PARAGRAPH_ALIGN.right)' },
	// Ctrl + Enter, 改ページを挿入
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  13,
		func : '' },

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
	// Ctrl + Shift + ;, フレーズ分割の挿入
	{ isAlt : false, isCtrl : true,  isShift : true, keyCode :  191, key : ['/'],
		func : 'EditMenuEventHandler.onHighlightDivide()' },
	// Ctrl + ;, フレーズ設定
	{ isAlt : false, isCtrl : true,  isShift : false, keyCode :  59, key : [';'],
		func : 'EditMenuEventHandler.onSetPhrase()' },

    // ---- 数式構文
    // F5, 分数
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  116, key : ['F5'],
        func : 'AssistHandler.insert(\'\', {inputmode:2, type: LAYOUT_NODE_TYPE.FRAC, fromshortcut: true})' },
    // F6, 根号
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  117, key : ['F6'],
        func : 'AssistHandler.insert(\'\', {inputmode:2, type: LAYOUT_NODE_TYPE.ROOT, fromshortcut: true})' },
    // F7, 総和
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  118, key : ['F7'],
        func : 'AssistHandler.insert(\'&sum;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER, fromshortcut: true})' },
    // F8, 積分
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  119, key : ['F8'],
        func : 'AssistHandler.insert(\'&int;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL, fromshortcut: true})' },
    // F9, 極限
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  120, key : ['F9'],
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

    // ---- 添え字移動
    // コーナーエレメントの右側で「＾」, 右上添え字位置へ
    { isAlt : false, isCtrl : false,  isShift : false, keyCode : 160, key : ['^'], condition: 'ShortCutCommand.brotherHasSuperScript()', func : 'ShortCutCommand.shiftUp(\'^\')' },
    // コーナーエレメントの右側で「_」, 右下添え字位置へ
    { isAlt : false, isCtrl : false,  isShift : true, keyCode : 220, key : ['_'], condition: 'ShortCutCommand.brotherHasSubScript()', func : 'ShortCutCommand.shiftDown(\'_\')' },

    // ---- フォーカス移動
    // Alt + T, セクションタイトル編集フィールドにフォーカス
    { isAlt : true, isCtrl : false, isShift : false, keyCode :  84, key : ['T', 't'],
        func : 'ShortCutCommand.focusToTitle()' },
    // F1, インデックスペインへのフォーカス切替
    { isAlt : false, isCtrl : false,  isShift : false, keyCode :  112, key : ['F1'],
        func : 'ShortCutCommand.focusToIndexPane()' },

    // ---- セクション移動
    // Alt + ↑, 前のセクションへ移動
    { isAlt : true, isCtrl : false, isShift : false, keyCode :  38,
        func : 'ShortCutCommand.moveToPrevSection()' },
    // Alt + ↓, 次のセクションへ移動
    { isAlt : true, isCtrl : false, isShift : false, keyCode :  40,
        func : 'ShortCutCommand.moveToNextSection()' },

];
