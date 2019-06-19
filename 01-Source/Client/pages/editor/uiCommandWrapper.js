/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： uiCommandWrapper.js                                */
/* -                                                                         */
/* -    概      要     ： UI-Command層用 ラッパクラス                        */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js                             */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年08月24日                         */


// ------------- コンストラクタ
function UiCommandWrapper() { };

//////////////////////////////////////////////////////////////////////////////////////
//                                 段落、及び編集一般                               //
//////////////////////////////////////////////////////////////////////////////////////



// ************************************************************************
// **                               Enter                                **
// ************************************************************************
UiCommandWrapper.enter = function(caret, pageBreak) {
	if (pageBreak === void 0) pageBreak = false;

	var caretId    = caret.pos;                               // 現在のキャレットノード ID
	var nextNodeId = caretId;                                 // キャレット移動先ノード ID のデフォルト値

	// ---- 段落内でのカーソル位置情報を取得します。
	var section = DocumentManager.getCurrentSection();        // セクションを取得
	Section.doop(section);                                    // セクション doop
	var result = section.nodeLocation(caretId);               // 段落内でのカーソル位置情報を取得

	if (result.current_para != null) {                        // ---- 段落直属であれば
		UiCommandWrapper.divideParagraph(result.current_para, caret, pageBreak); // 段落分割を実行
	} else {                                                  // ---- 段落直属でなければ
		nextNodeId = caret.shiftEnter(section);                       // カーソル移動先取得
		ViewManager.getRenderer().setCaretPos(caretId, nextNodeId);   // カーソル移動情報を登録
	}
	return nextNodeId;
};



// ************************************************************************
// **                 一文字削除操作・・・処理分岐判断                   **
// ************************************************************************

UiCommandWrapper.deleteOperation = function(isPrevious, caret) {
	// caret      [obj ]: キャレットのインスタンス
	// isPrevious [bool]: true  = 兄要素を　　　　削除します (BACKSPACE 動作)。
	//                    false = 起点となる要素を削除します (DELETE 動作) 。
	// 返値 [str]: カーソル移動先の要素ID
	const REMOVE_TYPE = {
		'combine'     : 1, // 前の段落へ段落結合
		'remove_node' : 2, // 一文字削除
		'none'        : 3, // 処理なし
	};
	var removeType = REMOVE_TYPE.remove_node;          // 既定値 : 一文字削除動作
	var target     = null;                             // 段落結合動作時の、結合先段落
	var appendPara = null;                             // 段落結合動作時の、結合される段落
	var caretId    = caret ? caret.pos : ViewManager.getEditorPane().getCaret().pos; // 現在のキャレット ID
	var resultId   = caretId;                          // 処理終了後にキャレットが移動すべきノード ID のデフォルト値

	// ---- 段落内でのカーソル位置を判定し、文字削除処理か段落結合処理かを選びます。
	var section = DocumentManager.getCurrentSection(); // セクションを取得
	Section.doop(section);                             // セクション doop
	var result = section.nodeLocation(caretId);        // 段落中での先頭・途中・末尾を判断。

	if ( isPrevious && result.top) {                   // ---- BACKSPACE 動作かつ、段落の先頭なら、
	                                                   // 前の段落への段落結合準備を行います。
	                                                   // キャレットの ID は変化しません。
		removeType = REMOVE_TYPE.combine;                      // 前の段落へ結合
		target     = result.previous_para;                     // 結合先として、前の段落ノードを指定します。
		appendPara = result.current_para;                      // 結合される段落として、現在の段落を指定します。
		// 結合条件が揃わなければ、結合動作を行いません。
		if (target == null || appendPara == null) removeType = REMOVE_TYPE.none;
	}

	if (!isPrevious && result.last) {                  // ---- DELETE 動作かつ、段落の末尾なら、
	                                                   // 後ろの段落からの段落結合準備を行います。
		removeType = REMOVE_TYPE.combine;                      // 後ろの段落からの結合
		target     = result.current_para;                      // 結合先として、現在の段落を指定します。
		appendPara = result.next_para;                         // 結合される段落として、一つ後ろの段落を指定します。
		//
		if (target == null || appendPara == null) {            // ---- 結合条件が揃わない場合、
			removeType = REMOVE_TYPE.none;                             // 結合動作を行いません。
		} else {                                               // ---- 結合条件がそろっているときは
			resultId   = appendPara.children[0].id;                  // キャレット ID を更新します。
		}
	}

	// ---- 一文字削除処理
	if (removeType == REMOVE_TYPE.remove_node) resultId = UiCommandWrapper.removeNode(isPrevious, caret);
	// ---- 段落結合処理
//	if (removeType == REMOVE_TYPE.combine) UiCommandWrapper.combineParagraph(target, appendPara);
	if (removeType == REMOVE_TYPE.combine) {
		if (target.children.length <= 1) {
			// 統合先段落が空なら、統合先段落自体を削除
			UiCommandWrapper.deleteParagraph(target);
		} else {
			// 統合先段落が空でないなら、結合を実行
			UiCommandWrapper.combineParagraph(target, appendPara);
		}
	}

	return(resultId);
};



// ************************************************************************
// **                             一文字削除                             **
// ************************************************************************

UiCommandWrapper.removeNode = function(isPrevious, caret) {
	// caret      [obj ]: キャレットのインスタンス
	// isPrevious [bool]: true  = 兄要素を　　　　削除します (BACKSPACE 動作)。
	//                    false = 起点となる要素を削除します (DELETE 動作) 。
	// 返値 [str]: カーソル移動先の要素ID

	var editorPane = ViewManager.getEditorPane();
	var comObj     = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID

	// 一文字削除処理
	var remComObj = new RemoveNodeCommand(DocumentManager.getDocument(), caretId, isPrevious);
	comObj.execute(remComObj); // -------------------------------- 工事中！！ Document系に移す予定
	var resultId = remComObj.nextId;

	return(resultId);
};



// ************************************************************************
// **                           複数ノード削除                           **
// ************************************************************************
UiCommandWrapper.removeMultiNode = function(caret) {
	var editorPane = ViewManager.getEditorPane();
	var caret = caret !== void 0 ? caret : editorPane.getCaret(); // 現在のキャレット
	var comObj         = EditManager.getCommandExecutor();        // commandExecutor インスタンス取得
	var removeMultiObj = new RemoveMultiNodeCommand(caret);       // 複数ノード削除コマンドクラス作成
	comObj.execute(removeMultiObj);                               // 複数ノード削除実行
	return removeMultiObj.nextId;                                 // 操作後のキャレット位置を返す。
};

// ************************************************************************
// **                           置換・ペースト                           **
// ************************************************************************

// static void 置換・ペースト
UiCommandWrapper.replaceAndPaste = function(event, inputbox, caret, inputText) {
	var editorPane = ViewManager.getEditorPane();
	var caret = caret !== void 0 ? caret : editorPane.getCaret(); // 現在のキャレット
	var comObj   = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var pasteObj = new PasteCommand(event, inputbox, caret, inputText);      // 置換・ペーストコマンド
	comObj.execute(pasteObj);                                     // 置換・ペースト実行
	return pasteObj.nextId;                                       // 操作後のキャレット位置
};



// ************************************************************************
// **                            一文字入力                              **
// ************************************************************************

UiCommandWrapper.insertChar = function(char, option, caret, itemStatus, entity) {
	// char [str] : 挿入する文字
    // option : 入力する文字の種類や属性を指定するためのオプション (単純な 1 文字入力なら null)
    //          AssistHandler で挿入する際に指定するもの
    // caret : カーソルクラスのオブジェクト
    // itemStatus : ステータス（省略可、GUIの指定を上書きしたいときに指定する）
	var editorPane = ViewManager.getEditorPane();                   // エディタペーン取得
	var defaultCursorPos = null;                                    // カーソル位置 デフォルト
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得

	// ステータスの指定がなければGUIから取得します
	if (itemStatus == void 0) {
	    itemStatus = ViewManager.getStatusManager().getAllStatus();
	}

	// --- 工事中！！ Document系に移す予定
	var insObj     = new InsertCharCommand(DocumentManager.getDocument(), caretId, char, option, itemStatus, entity);

	comObj.execute(insObj);                     // データ挿入実行
	defaultCursorPos = insObj.defaultCursorPos; // デフォルトカーソル位置を返します。
	return defaultCursorPos;
};



// ************************************************************************
// **                             画像挿入                               **
// ************************************************************************

UiCommandWrapper.insertImage = function(imageData, caret) {
	// imageData [文字列] : 挿入する画像の base64 データ文字列
	// caret              : caret
	var editorPane       = ViewManager.getEditorPane();                   // エディタペーン取得
	var defaultCursorPos = null;                                          // カーソル位置 デフォルト
	var caretId          = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj           = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得

	// --- 工事中！！ Document系に移す予定
	var insObj           = new InsertImageCommand(DocumentManager.getDocument(), caretId, imageData);

	comObj.execute(insObj);                     // データ挿入実行
	defaultCursorPos = insObj.defaultCursorPos; // デフォルトカーソル位置を返します。
	return defaultCursorPos;
};



// ************************************************************************
// **                           テーブル挿入                             **
// ************************************************************************

UiCommandWrapper.insertTable = function(colCount, rowCount, caret) {
	// 挿入先が囲み枠やフレーズの中の場合、何もしません
	if (!UiCommandWrapper.checkInsertTable(caret)) return;

	// colCount 列数
	// rowCount 行数
	var editorPane = ViewManager.getEditorPane();                   // エディタペーン取得
	var defaultCursorPos = null;                                    // カーソル位置 デフォルト
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var itemStatus = ViewManager.getStatusManager().getAllStatus(); // すべてのステータスを取得
	var tableObj   = new InsertTableCommand(colCount, rowCount, caretId, itemStatus);
	comObj.execute(tableObj);                                       // テーブル挿入実行
};

UiCommandWrapper.checkInsertTable = function(caret) {
	// カーソル位置のノードを取得します
	var currentNode = DocumentManager.getNodeById(caret ? caret.pos : ViewManager.getEditorPane().getCaret().pos);

	// ノードの祖先にフレーズ、囲み枠がいたらチェックは失敗します
	if (DataClass.getClosest(currentNode, 'PHRASE') != null) return false;
	if (DataClass.getClosest(currentNode, 'DECO') != null) return false;

	return true;
};

// ************************************************************************
// **                        テーブル: 行の削除                          **
// ************************************************************************

UiCommandWrapper.removeRow = function(caret) {
	var editorPane = ViewManager.getEditorPane();                   // エディタペーン取得
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var itemStatus = ViewManager.getStatusManager().getAllStatus(); // すべてのステータスを取得
	var tableObj   = new RemoveRowCommand(caretId);
	comObj.execute(tableObj);                                       // テーブル行の削除実行
};

// ************************************************************************
// **                        テーブル: 行の挿入                          **
// ************************************************************************

UiCommandWrapper.insertRow = function(caret, isBefore) {
	var editorPane = ViewManager.getEditorPane();                   // エディタペーン取得
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var itemStatus = ViewManager.getStatusManager().getAllStatus(); // すべてのステータスを取得
	var tableObj   = new InsertRowCommand(caretId, isBefore);
	comObj.execute(tableObj);                                       // テーブル行の挿入実行
};

// ************************************************************************
// **                        テーブル: 列の削除                          **
// ************************************************************************

UiCommandWrapper.removeCol = function(caret) {
	var editorPane = ViewManager.getEditorPane();                   // エディタペーン取得
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var itemStatus = ViewManager.getStatusManager().getAllStatus(); // すべてのステータスを取得
	var tableObj   = new RemoveColCommand(caretId);
	comObj.execute(tableObj);                                       // テーブル列の削除実行
};

// ************************************************************************
// **                        テーブル: 列の挿入                          **
// ************************************************************************

UiCommandWrapper.insertCol = function(caret, isBefore) {
	var editorPane = ViewManager.getEditorPane();                   // エディタペーン取得
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var itemStatus = ViewManager.getStatusManager().getAllStatus(); // すべてのステータスを取得
	var tableObj   = new InsertColCommand(caretId, isBefore);
	comObj.execute(tableObj);                                       // テーブル列の挿入実行
};


// ************************************************************************
// **                             段落削除                               **
// ************************************************************************
UiCommandWrapper.deleteParagraph = function(target) {
	// target     [Paragraphインスタンス] : 削除段落。
	var editorPane = ViewManager.getEditorPane();
	var comObj     = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var deleteParagraphObj = new DeleteParagraphCommand(target);
	comObj.execute(deleteParagraphObj); // 段落結合実行
}

// ************************************************************************
// **                             段落結合                               **
// ************************************************************************

UiCommandWrapper.combineParagraph = function(target, appendPara) {
	// target     [Paragraphインスタンス] : 結合対象となる段落。
	// appendPara [Paragraphインスタンス] : 結合するべき段落。
	var editorPane = ViewManager.getEditorPane();
	var comObj     = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var combineObj = new CombineParagraphCommand(target, appendPara);
	comObj.execute(combineObj); // 段落結合実行
};



// ************************************************************************
// **                             段落分割                               **
// ************************************************************************
//UiCommandWrapper.divideParagraph = function(target, caret) {
UiCommandWrapper.divideParagraph = function(target, caret, pageBreak) {
	// target [Paragraphインスタンス] : 分割対象段落
	// pos    [str]                   : 対象段落上での分割位置を表すノードID
	var editorPane = ViewManager.getEditorPane();
	var caretId    = caret ? caret.pos : editorPane.getCaret().pos; // 現在のキャレット ID
	var comObj     = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var itemStatus = ViewManager.getStatusManager().getAllStatus(); // ステータス値を全て取得します。
//	var divideObj  = new DivideParagraphCommand(target, caretId);
	var divideObj  = new DivideParagraphCommand(target, caretId, pageBreak);
	comObj.execute(divideObj); // 段落分割実行
};



// ************************************************************************
// **                           アライン変更                             **
// ************************************************************************

UiCommandWrapper.setAlign = function(nodeList, align, selectFlag) {
	// nodeList [DOM配列]         : 選択範囲ノード配列
	// align [enum]               : アライン種類
	//                                  PARAGRAPH_ALIGN.left   左揃え
	//                                  PARAGRAPH_ALIGN.center 中央揃え
	//                                  PARAGRAPH_ALIGN.right  右揃え
	// selectFlag [bool]          : 選択範囲の有り無し
	var comObj   = EditManager.getCommandExecutor();              // commandExecutor インスタンス取得
	var alignObj = new AlignCommand(nodeList, align, selectFlag); // アラインオブジェクト生成
	comObj.execute(alignObj);                                     // アライン実行
};



//////////////////////////////////////////////////////////////////////////////////////
//                                   セクション                                     //
//////////////////////////////////////////////////////////////////////////////////////



// ************************************************************************
// **                       インデックス深度変更                         **
// ************************************************************************

UiCommandWrapper.shiftIndex = function(indexArr, distance) {
	// indexArr    [int] : セクションインデックス番号配列
	// distance [int] : シフトする量。正の数で右に、負の数で左にシフトします。
	var comObj   = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var shiftObj = new ShiftIndexCommand(indexArr, distance);
	comObj.execute(shiftObj); // 深度変更実行
};



// ************************************************************************
// **                     インデックス上下位置変更                       **
// ************************************************************************

UiCommandWrapper.moveIndex = function(indexArr, currentIndex, distance) {
	// indexArr    [int] : セクションインデックス番号配列
	// distance [int] : 上下移動方向。正の数下へ、負の数で上へ移動します。
	var comObj  = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var moveObj = new MoveIndexCommand(indexArr, currentIndex, distance);
	comObj.execute(moveObj); // 上下移動実行
	return moveObj.result === null ? false : true;
};



// ************************************************************************
// **                          セクション追加                            **
// ************************************************************************

UiCommandWrapper.appendSection = function(indexArr, currentIndex) {
	// index [数値] : セクションインデックス。新しいセクションは index の後に追加されます。
	var comObj       = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var appendSecObj = new AppendSection(indexArr, currentIndex);
	comObj.execute(appendSecObj); // セクション追加
};



// ************************************************************************
// **                          セクション削除                            **
// ************************************************************************

UiCommandWrapper.removeSection = function(indexArr, currentIndex) {
	// index [数値] : 削除するセクションのインデックス。
	var comObj       = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var removeSecObj = new RemoveSection(indexArr, currentIndex);
	comObj.execute(removeSecObj); // セクション削除
};



// ************************************************************************
// **                          セクション分割                            **
// ************************************************************************
UiCommandWrapper.divideSection = function(indexArr, currentIndex) {
	var editorPane   = ViewManager.getEditorPane();
	var dividePos    = editorPane.getCaret().pos // 分割先頭位置のノード ID
	var comObj       = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var divideSecObj = new DivideSection(indexArr, currentIndex, dividePos);
	comObj.execute(divideSecObj); // セクション分割
};

// ************************************************************************
// **                          セクション連結                            **
// ************************************************************************
UiCommandWrapper.combineSection = function(indexArr, currentIndex) {
	var comObj        = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var combineSecObj = new CombineSection(indexArr, currentIndex);
	comObj.execute(combineSecObj); // セクション連結
};

// ************************************************************************
// **                      セクションタイトル設定                        **
// ************************************************************************
UiCommandWrapper.setSectionTitle = function(currentIndex, titleStr) {
	console.log('index:' + currentIndex + ', titleStr:' + titleStr);
	var comObj      = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var setTitleObj = new SetSectionTitle(currentIndex, titleStr);
	comObj.execute(setTitleObj); // セクションタイトル設定
};



//////////////////////////////////////////////////////////////////////////////////////
//                                 文字ステータス                                   //
//////////////////////////////////////////////////////////////////////////////////////

// ************************************************************************
// **                             イタリック                             **
// ************************************************************************
UiCommandWrapper.setItalic = function(nodeList, italicFlag) {
	var comObj    = EditManager.getCommandExecutor();        // commandExecutor インスタンス取得
	var italicObj = new ItalicCommand(nodeList, italicFlag); // コマンドクラス作成
	comObj.execute(italicObj);                               // イタリック化実行
};

// ************************************************************************
// **                                太字                                **
// ************************************************************************
UiCommandWrapper.setBold = function(nodeList, boldFlag) {
	var comObj  = EditManager.getCommandExecutor();    // commandExecutor インスタンス取得
	var boldObj = new BoldCommand(nodeList, boldFlag);   // 太字指定コマンドクラス作成
	comObj.execute(boldObj);                             // 太字化実行
};

// ************************************************************************
// **                                下線                                **
// ************************************************************************
UiCommandWrapper.setUnderLine = function(nodeList, ulineFlag) {
	var comObj    = EditManager.getCommandExecutor();          // commandExecutor インスタンス取得
	var ulineObj  = new UnderLineCommand(nodeList, ulineFlag); // 下線化指定コマンドクラス作成
	comObj.execute(ulineObj);                                  // 下線化実行
};

// ************************************************************************
// **                               打消線                               **
// ************************************************************************
UiCommandWrapper.setStrike = function(nodeList, strikeFlag) {
	var comObj    = EditManager.getCommandExecutor();             // commandExecutor インスタンス取得
	var strikeObj  = new StrikeCommand(nodeList, strikeFlag);     // 打消線指定コマンドクラス作成
	comObj.execute(strikeObj);                                    // 打消線指定実行
};

// ************************************************************************
// **                              脚注書式                              **
// ************************************************************************
UiCommandWrapper.setFootNote = function(nodeList, footNoteType) {
	var comObj      = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var footNoteObj = new FootNoteCommand(nodeList, footNoteType); // 脚注書式指定コマンドクラス作成
	comObj.execute(footNoteObj);                                   // 脚注書式指定実行
};


// ************************************************************************
// **                               囲み枠                               **
// ************************************************************************
UiCommandWrapper.setFrameBorder = function(nodeList, frameType, selectFlag) {
	var comObj   = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var frameObj = new FrameBorderCommand(nodeList, frameType, selectFlag); // 囲み枠指定コマンドクラス作成
	comObj.execute(frameObj);                                               // 囲み枠指定実行
};

//************************************************************************
//**                              フレーズ                              **
//************************************************************************
//UiCommandWrapper.setFrameBorder = function(nodeList, frameType, selectFlag) {
UiCommandWrapper.setPhraseBox = function(nodeList, selectFlag) {
	// 選択範囲が不適切であれば、何もしません
	if (!UiCommandWrapper.checkCanSetPhrase(nodeList)) return;

	var comObj   = EditManager.getCommandExecutor();			// commandExecutor インスタンス取得
	var frameObj = new PhraseCommand(nodeList, selectFlag);	// フレーズコマンドクラス作成
	comObj.execute(frameObj);									// フレーズ指定実行
};

UiCommandWrapper.checkCanSetPhrase = function(nodeList) {
	// 最初と最後のノードの親を取得します
	// (段落レベルなら、ここで段落ノードが取得されます)
	var topParent = nodeList[0].parentNode;
	var lastParent = nodeList[nodeList.length - 1].parentNode;

	// それぞれがフレーズならさらに親を取ります
	if (topParent.parentNode.nodeName == 'PHRASE') topParent = topParent.parentNode.parentNode;
	if (lastParent.parentNode.nodeName == 'PHRASE') lastParent = lastParent.parentNode.parentNode;

	// 段落か否かをチェックします
	if (topParent.nodeName.toLowerCase() != 'paragraph' || lastParent.nodeName.toLowerCase() != 'paragraph') return false;

	// 同じ段落かチェックします
	if (topParent !== lastParent) return false;

	// テーブルが含まれていないか確認します
	for (var i = 0; i < nodeList.length; i++) {
		if (nodeList[i].nodeName.toLowerCase() == 'ctable') return false;
	}

	return true;
};

// ************************************************************************
// **                                全置換                              **
// ************************************************************************
UiCommandWrapper.replaceAll = function(multiTargetInfo) {
	var editorPane = ViewManager.getEditorPane();
	var caret      = editorPane.getCaret();
	var comObj     = EditManager.getCommandExecutor();                         // commandExecutor インスタンス取得
	var multiObj   = new MultiCommand(ReplaceCommand, multiTargetInfo, caret); // 全置換コマンドクラス作成
	comObj.execute(multiObj);                                                  // 全置換実行
};

// ************************************************************************
// **                                ルビ                                **
// ************************************************************************
UiCommandWrapper.setRuby = function(nodeList, ruby, selectFlag) {
	var comObj  = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var rubyObj = new RubyCommand(nodeList, ruby, selectFlag); // ルビコマンドクラス作成
	comObj.execute(rubyObj);                                   // ルビ設定実行
};

// ************************************************************************
// **                            ルビ:一括設定                           **
// ************************************************************************
UiCommandWrapper.setRubyAll = function(nodeListArr, ruby) {
	var comObj  = EditManager.getCommandExecutor();                     // commandExecutor インスタンス取得
	var multiObj = new MultiCommand(RubyCommand, nodeListArr, ruby);    // ルビコマンドクラス作成
	comObj.execute(multiObj);                                           // ルビ一括設定実行
};

// ************************************************************************
// **                                読み                                **
// ************************************************************************
UiCommandWrapper.setReading = function(nodeList, read, selectFlag, accent) {
	var comObj  = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var readObj = new ReadingCommand(nodeList, read, selectFlag, accent); // 読みコマンドクラス作成
	comObj.execute(readObj);                                   // 読み設定実行
};

// ************************************************************************
// **                            読み:一括設定                           **
// ************************************************************************
UiCommandWrapper.setReadingAll = function(nodeListArr, read, accent) {
	var comObj   = EditManager.getCommandExecutor();                    // commandExecutor インスタンス取得
	var multiObj = new MultiCommand(ReadingCommand, nodeListArr, read, accent); // 読みコマンドクラス作成
	comObj.execute(multiObj);                                           // 読み設定実行
};

// ************************************************************************
// **                             ポーズ挿入                             **
// ************************************************************************
UiCommandWrapper.insertPause = function(caret, isLong) {
	var comObj  = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	var pauseObj = new InsertPauseCommand(caret, isLong);      // ポーズ挿入コマンドクラス作成
	comObj.execute(pauseObj);                                  // ポーズ挿入実行
};

// ************************************************************************
// **                          フレーズ分割挿入                          **
// ************************************************************************
UiCommandWrapper.insertHighlightCtrl = function(caret) {
	// 挿入先を確認し、挿入できない箇所であれば何もせずに終了します
	var targetNode = DocumentManager.getNodeById(caret.pos);
	if (!DataClass.isParagraphChild(targetNode) && !DataClass.isTableCellChild(targetNode)) return;

	var comObj  = EditManager.getCommandExecutor();				// commandExecutor インスタンス取得
	var pauseObj = new InsertHighlightCtrlCommand(caret);		// コマンドクラス作成
	comObj.execute(pauseObj);									// 実行
};

// ************************************************************************
// **                              画像設定                              **
// ************************************************************************
UiCommandWrapper.setImageProperty = function(imageNode, propertyJson) {
	var comObj   = EditManager.getCommandExecutor();                  // commandExecutor インスタンス取得
	var imageObj = new ImagePropertyCommand(imageNode, propertyJson); // 画像プロパティコマンドクラス作成
	comObj.execute(imageObj);                                         // 画像プロパティ設定実行
};

// ************************************************************************
// **                              数式番号                              **
// ************************************************************************
/*UiCommandWrapper.formulaNumber = function(caret) {
	var comObj   = EditManager.getCommandExecutor();  // commandExecutor インスタンス取得
	var formulaObj = new FormulaNumberCommand(caret); // 画像プロパティコマンドクラス作成
	comObj.execute(formulaObj);                       // 画像プロパティ設定実行
};*/
UiCommandWrapper.formulaNumber = function(nodeList, selectFlag) {
	var comObj   = EditManager.getCommandExecutor();
	var formulaObj = new FormulaNumberCommand(nodeList, selectFlag);
	comObj.execute(formulaObj);
};

// ************************************************************************
// **                             ページ番号                             **
// ************************************************************************
UiCommandWrapper.pageNumber = function(caret) {
	var comObj  = EditManager.getCommandExecutor();  // commandExecutor インスタンス取得
	var pageObj = new PageNumberCommand(caret);      // ページ番号コマンドクラス作成
	comObj.execute(pageObj);                         // ページ番号プロパティ設定実行
};

// ************************************************************************
// **                           フォントサイズ                           **
// ************************************************************************
UiCommandWrapper.setFontSize = function(fontSize, caret) {
	var comObj = EditManager.getCommandExecutor();           // commandExecutor インスタンス取得
	var fsObj  = new FontSizeCommand(fontSize, caret);       // フォントサイズコマンドクラス作成
	comObj.execute(fsObj);                                   // フォントサイズ設定実行
};

// ************************************************************************
// **                 テキスト - 数式 - 化学式 モード変換                **
// ************************************************************************
UiCommandWrapper.convertMode = function(inputMode, caret) {
	var comObj = EditManager.getCommandExecutor();           // commandExecutor インスタンス取得
	var convObj  = new ConvertModeCommand(inputMode, caret); // 変換コマンドクラス作成
	comObj.execute(convObj);                                 // 変換実行
};


// ************************************************************************
// **                              話者選択                              **
// ************************************************************************
UiCommandWrapper.setSpeaker = function(speakerIdx, caret) {
	var comObj = EditManager.getCommandExecutor();           // commandExecutor インスタンス取得
	var spkObj = new SpeakerCommand(speakerIdx, caret);      // 話者コマンドクラス作成
	comObj.execute(spkObj);                                  // 話者設定実行
};

// ************************************************************************
// **                      表を縦方向に読み上げる                        **
// ************************************************************************
UiCommandWrapper.readLongitude = function(caret) {
	StatusEditor.setReadLongitude(caret);
};

// ************************************************************************
// **                             無音設定                               **
// ************************************************************************
UiCommandWrapper.setSilent = function(caret) {
	var comObj = EditManager.getCommandExecutor(); // commandExecutor インスタンス取得
	var silentObj = new SilentCommand(caret);      // 話者コマンドクラス作成
	comObj.execute(silentObj);                     // 話者設定実行
}

// ************************************************************************
// **                                Undo                                **
// ************************************************************************

// [static] ------------- Undoを実行します。
UiCommandWrapper.Undo = function() {
	// 返値無し
//	var comObj = EditorPaneClass.getCommand();        // Command オブジェクト(Undo, Redo用)への参照
	var comObj = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	comObj.undo();

	ViewManager.getRenderer().update();
	var editorPane = ViewManager.getEditorPane();
	var caret = ViewManager.getCaret === void 0 ? ViewManager.getEditorPane().getCaret() : ViewManager.getCaret();
	var caretId = caret.pos;
//	EditorPaneClass.scrollManager.SetFocusNode( editorPane.getCaret().pos );
	EditorPaneClass.scrollManager.SetFocusNode( caretId );
	EditorPaneClass.scrollManager.ScrollToFocusNode();
	// カーソルの表示位置を更新します
	editorPane.updateCaret();
};


// [static] ------------- Redoを実行します。
UiCommandWrapper.Redo = function() {
	// 返値無し
//	var comObj = EditorPaneClass.getCommand();        // Command オブジェクト(Undo, Redo用)への参照
	var comObj = EditManager.getCommandExecutor();            // commandExecutor インスタンス取得
	comObj.redo();

	ViewManager.getRenderer().update();
	var editorPane = ViewManager.getEditorPane();
	var caret = ViewManager.getCaret === void 0 ? ViewManager.getEditorPane().getCaret() : ViewManager.getCaret();
	var caretId = caret.pos;
//	EditorPaneClass.scrollManager.SetFocusNode( editorPane.getCaret().pos );
	EditorPaneClass.scrollManager.SetFocusNode( caretId );
	EditorPaneClass.scrollManager.ScrollToFocusNode();
	// カーソルの表示位置を更新します
	editorPane.updateCaret();
};



