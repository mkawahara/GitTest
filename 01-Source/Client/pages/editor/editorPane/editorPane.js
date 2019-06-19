/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_editorPane.js                                   */
/* -                                                                         */
/* -    概      要     ： エディタペインクラス                               */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月24日                         */

/* =================== ツールバークラス 命名規則 (暫定) ==================== */
/* TBC_ : Tool Bar Common    : 全クラス共通                                  */
/* MB_  : MenuBar            : メニューバー                                  */
/* MT_  : Main   Toolbar     : メインツールバー（大アイコン表示）            */
/* IT_  : Index  Toolbar     : インデックス操作用ツールバー（小アイコン表示）*/
/* ET_  : Editor Toolbar     : エディタ用ツールバー（小アイコン表示）        */
/* ST_  : Section Title bar  : セクションタイトルバー（小アイコン表示）      */
/* ※HTMLタグIDは、上記接頭文字から始めます。                                */
/* ※CSS classは、cl_ の後、上記接頭文字を続ける形とします。                 */
/*========================================================================== */

/* ===================== ツールバークラス 基本方針 ========================= */
/* ・アイコンの disable/enable 状態及び、チェックマークの状態は、            */
/*   当モジュール内では管理しません。                                        */
/* ========================================================================= */

// EDT_FrontTextBox  フロントテキストボックス

// ============================= 定数 =============================

const LIM_DOM_SEARCH = 100; // 親DOMを探す際、何階層上まで見に行くか

// ------------- ブラウザがドキュメントを読み込んだ直後に実行されます。

// *************************************************************
// **                 エディタペーンクラス                    **
// *************************************************************
function EditorPaneClass(){};



EditorPaneClass.getCaret = function() {
	return EditorPaneClass.Caret;
};

EditorPaneClass.getScrollManager = function() {
	return EditorPaneClass.scrollManager;
};

// ------------- CodeAssistオブジェクトへの参照取得
EditorPaneClass.getCodeAssist = function() { return(EditorPaneClass.CodeAssist); };



EditorPaneClass.Init = function() {

	var editorNode = document.getElementById('EDT_MasterLayer');
	EditorPaneClass.Caret      = new Caret(editorNode);        // Caretクラスのインスタンス作成。
//	EditorPaneClass.Command    = new CommandExecutor(100);     // 2015/06/12 削除 湯本
	EditorPaneClass.CodeAssist = new CodeAssist('codeAssist'); // 入力支援クラス作成。

	// スクロール用に追加
	EditorPaneClass.scrollManager = new ScrollManager(editorNode);
	editorNode.onscroll = EditorPaneClass.adjustResizingRectPosition;

    // 画像リサイズ用の灰色矩形を追加
    var div = $('<div id="EDT_ImageResizingRect" '
            + 'style="z-index:1; position: absolute; border: 0px; display: none;"/>');
    div[0].appendChild(document.createElement('canvas'));
    editorNode.parentNode.appendChild(div[0]);

	EditorPaneClass.SetCaretMouseEvent();                      // キャレット用マウスイベントを登録

	EditorPaneClass.SetRightClick();                           // 右クリックコンテキストメニューを表示

	EditorPaneClass.SetScrollEvent();							// スクロールイベントを登録します

	// ---- キー入力用初期化処理
	KeyEventHandler.init();               // ブラウザ毎の動作の差異に対応
	EditorPaneClass.SetCaretInputEvent(); // キャレット用入力イベントを登録

};



// ---- 右クリック：コンテキストメニュー
EditorPaneClass.SetRightClick = function() {

	// ---- 右クリック：コンテキストメニュー
	$('#EDT_MasterLayer').on('contextmenu', function (evt){
		EditorPaneClass.RightClick(this, evt);
	});
	$('#EDT_FrontTextBox').on('contextmenu', function (evt){
		EditorPaneClass.RightClick(this, evt, true);
	});
    $('#EDT_ImageResizingRect').on('contextmenu', function (evt){
        EditorPaneClass.RightClick(this, evt, true);
    });
};



EditorPaneClass.RightClick = function(obj, evt, inputboxFlag) {
	// ★編集禁止時は、このメソッドは何もしないこと★
	// このメソッドは、キーボードからポップアップメニューを表示した時にも実行されます。
	if (!DocumentManager.isEditable()) {
		evt.preventDefault();
		evt.stopPropagation();
		return;
	}

	inputboxFlag = inputboxFlag !== undefined ? inputboxFlag : false;
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャを取得
	var dataNode             = null;                                  // データノード用変数
	var nodeName             = null;                                  // ノード名用変数
	var rContextMenuId       = EditorPaneClass.GetRContextNormal();   // 規定値として、通常用コンテキストメニューを用意

	// ---- 範囲選択があるか判別します
	if (selectedRangeManager.hasSelectedRange) {                  // ---- 範囲選択があるなら
		// カーソル移動は行いません。
		var nodeList   = selectedRangeManager.getSelectedRange();         // 選択 nodeList 取得
		var nodeLength = nodeList.length;
		dataNode = nodeList[0];                                           // データノード取得
		var endNode = nodeList[nodeLength - 1];
		if (dataNode === endNode && dataNode.nodeName == 'CIMG') {        // ---- 画像なら
			nodeName = 'CIMG';
		}
	} else {                                                      // ---- 範囲選択がないなら
		if (!inputboxFlag) EditorPaneClass.moveCaret(obj, evt);           // カーソル移動を行います。
//		EditorPaneClass.moveCaret(obj, evt);                              // カーソル移動を行います。
		var caretId  = EditorPaneClass.getCaret().pos;                    // カーソル位置のノードの id 取得
		var dataNode = DocumentManager.getNodeById(caretId);              // データノード取得
		nodeName     = dataNode.nodeName;                                 // ノード名取得
	}

	// ---- テーブル処理用に、先祖ノードを取得する
	if (nodeName != 'CIMG') {                                     // ---- 画像でないなら
//		var ancestorNode = $(dataNode).closest('ctd ') ;                  // 祖先ノードのテーブルセルをチェック
		var ancestorNode = $(dataNode).closest('ctd, cmatcell') ;          // 祖先ノードのテーブルセルをチェック
		if (ancestorNode[0] !== undefined) {                              // ---- あったなら
			nodeName = ancestorNode[0].nodeName;                                  // ノード名取得
		}
	}

	// ---- 右クリックメニューを決定します。
	if (nodeName == 'CIMG') {                                     // ---- 画像なら
		rContextMenuId = EditorPaneClass.GetRContextImage();                // 画像用コンテキストメニューを用意
	} else if (nodeName == 'CTD' || nodeName == 'CMATCELL') {               // ---- テーブル要素があるなら
		rContextMenuId = EditorPaneClass.GetRContextTable();                // テーブル用コンテキストメニューを用意
	}

	// ---- 表示位置を決定します。
	// 現在は何もしていません。クリック位置へそのまま表示しています。

	// ---- コンテキストメニューを表示します。
	EditorToolClass.ShowContextMenu(rContextMenuId, evt.clientX, evt.clientY);


    evt.preventDefault();
    evt.stopPropagation();
};

// static jquery-ui オブジェクト 通常用コンテキストメニューを返す
EditorPaneClass.GetRContextNormal = function() {
	return 'ET_Edit_EditorPopup_ConMenu';
};

EditorPaneClass.GetRContextImage = function() {
	return 'ET_Edit_ImagePopup_ConMenu';
};

EditorPaneClass.GetRContextTable = function() {
	return 'ET_Edit_TablePopup_ConMenu';
};



// ------------- テキストボックスへのキー入力によるイベント処理
EditorPaneClass.SetCaretInputEvent = function() {

	// テキストボックスへの input イベント
	EDT_FrontTextBox.addEventListener('keydown',          KeyEventHandler.onKeyDown);
	EDT_FrontTextBox.addEventListener('keypress',         KeyEventHandler.onKeyPress);
	EDT_FrontTextBox.addEventListener('keyup',            KeyEventHandler.onKeyUp);
	EDT_FrontTextBox.addEventListener('input',            KeyEventHandler.onInput);
	EDT_FrontTextBox.addEventListener('compositionstart', KeyEventHandler.onCompositionStart);
	EDT_FrontTextBox.addEventListener('compositionend',   KeyEventHandler.onCompositionEnd);

	EDT_FrontTextBox.addEventListener('paste',            ClipEventHandler.onPaste);
	EDT_FrontTextBox.addEventListener('copy',             ClipEventHandler.onCopy);
	EDT_FrontTextBox.addEventListener('cut',              ClipEventHandler.onCut);	// IE11 で機能せず。
	//$('#EDT_FrontTextBox').on('cut', ClipEventHandler.onCut);
};



// ------------- マウス押下イベントによるキャレット移動機能の登録
EditorPaneClass.SetCaretMouseEvent = function() {

	// ---- 左ボタン押下
	$('#EDT_MasterLayer').on('mousedown', function (evt){
		if (evt.button == 0) {
			EditorPaneClass.onMouseDown(this, evt);
		}
	});
	$('#EDT_FrontTextBox').on('mousedown', function (evt){
		if (evt.button == 0) {
			EditorPaneClass.onMouseDown(this, evt, true);
		}
	});
    $('#EDT_ImageResizingRect').on('mousedown', function (evt){
        if (evt.button == 0) {
            EditorPaneClass.onMouseDown(this, evt, true);
        }
    });

	// ---- ドラッグ選択
	$('#EDT_MasterLayer').on('mousemove', function (evt){
		if (evt.button == 0) {
			EditorPaneClass.onMouseMove(this, evt);
		}
	});
	$('#EDT_FrontTextBox').on('mousemove', function (evt){
		if (evt.button == 0) {
			EditorPaneClass.onMouseMove(this, evt);
		}
	});
    $('#EDT_ImageResizingRect').on('mousemove', function (evt){
        if (evt.button == 0) {
            EditorPaneClass.onMouseMove(this, evt);
        }
    });

	// ---- 左ボタン開放
	$('#EDT_MasterLayer').on('mouseup', function (evt){
		if (evt.button == 0) {
			EditorPaneClass.onMouseUp(this, evt);
		}
	});
	$('#EDT_FrontTextBox').on('mouseup', function (evt){
		if (evt.button == 0) {
			EditorPaneClass.onMouseUp(this, evt);
		}
	});
    $('#EDT_ImageResizingRect').on('mouseup', function (evt){
        if (evt.button == 0) {
            EditorPaneClass.onMouseUp(this, evt);
        }
    });
};

/**
 * スクロールイベントを登録します
 */
EditorPaneClass.SetScrollEvent = function() {
	$('#EDT_MasterLayer').on('scroll', function (evt){
		EditorPaneClass.updateCaret();
	});
};


/*******************************************************************************************
 * マウスダウン処理
 *
 * @param inputboxFlag	タイトル入力用のテキストボックス上でのクリックの場合 true
 */
EditorPaneClass.onMouseDown = function(obj, evt, inputboxFlag) {
	inputboxFlag = inputboxFlag !== undefined ? inputboxFlag : false; //
	ToolbarUtilityClass.AutoHideContext(evt); // コンテキストメニューの hide 処理

	// 縦スクロールバー上でマウスダウンされた時は何もしません
	var divHeight = EDT_MasterLayer.offsetHeight;
	var childHeight = 0;
	for (var i = 0; i < EDT_MasterLayer.children.length; i++) {
		childHeight += EDT_MasterLayer.children[i].offsetHeight;
	};
	if ((divHeight < (childHeight + 6)) && (evt.offsetX > EDT_MasterLayer.children[0].offsetWidth)) {
		return;
	}

	// ★編集禁止時は、このメソッドはカーソル移動以外、何もしないこと★
	// ただし、読み上げモードの時は読み上げを開始しなくてはならない。
	var editable = DocumentManager.isEditable();

	// 読み込み完了していないため、何もしません
	if (editable === false) {
		evt.preventDefault();
		evt.stopPropagation();
		return;
	}
	// 読み上げモードの処理です
	else if (editable === -1) {
		// カーソル移動を行います
		if (!inputboxFlag) EditorPaneClass.moveCaret(obj, evt);

		// 読み上げを開始します
		var caretPos = EditorPaneClass.Caret.pos;
		console.log("読み上げモードでのクリック：" + caretPos);
		ReadManager.instance.startReading(caretPos);
	}
	// 通常編集時の処理です
	else {
		// ---- マウスダウンによるカーソル位置移動を行います。
		if (!inputboxFlag) EditorPaneClass.moveCaret(obj, evt);
		//EditorPaneClass.moveCaret(obj, evt);

		// 検索状態を初期化します
		SearchManager.instance.IsSearched = false;

		// 未選択画像がクリックされた時
		if (evt.target.nodeName == 'IMG' && EditManager.getSelectedRangeManager().hasSelectedRange == false) {
			EditorPaneClass._clickImage(obj, evt);
		}
		// 画像リサイズ用のオブジェクトがクリックされたとき
		else if (obj.id == 'EDT_ImageResizingRect') {
			EditorPaneClass._clickImageHandle(obj, evt);
		}
		// それ以外は範囲選択を行います
		else {
			EditorPaneClass._clickStartSelection(obj, evt);
		}
	}

	// ---- レンダラ update
	ViewManager.getRenderer().update();

	// ---- フォーカス移動のための後処理
	evt.preventDefault();              // 他の処理にフォーカスを取られることを防ぎます。
	evt.stopPropagation();             // イベントバブリングによる余計な重複処理を防ぎます。
	// ※preventDefault() と stopPropagation() の両方を実行しないと、フォーカス移動が保持されません。

	// 1文字添え字入力でベースに戻るモードが設定されていたらクリアします。
	KeyEventHandler.clearCornerShortcut();
};

EditorPaneClass._clickImage = function(obj, evt) {
	// リサイズ用の灰色矩形を画像と同じサイズで表示します
	var htmlNode = evt.target;
	var rect = htmlNode.getBoundingClientRect();
	var resizeRect = document.getElementById('EDT_ImageResizingRect');
	resizeRect.style.width  = rect.width + 'px';    // 幅
	resizeRect.style.height = rect.height + 'px';   // 高さ
	resizeRect.style.display = '';                  // 表示

	// 画像リサイズ情報を保存します
	var section  = DocumentManager.getCurrentSection();
	EditorPaneClass.resizingImgInfo = {
			dataNode: $(section).find('#' + htmlNode.id)[0], // リサイズ対象画像のデータノード
			resizing:false,                         // リサイズが開始されたか
	};
    EditorPaneClass.adjustResizingRectPosition();   // 位置

    // 灰色矩形をレンダリングします
	var canvas = resizeRect.firstChild;
	if (canvas) {
		EditorPaneClass.drawToCanvas(canvas, rect.width, rect.height);
	}

	// 範囲選択として登録します
	var selectedRangeManager = EditManager.getSelectedRangeManager();
	var dataNode = EditorPaneClass.resizingImgInfo.dataNode;
	selectedRangeManager.startSelect(dataNode);
	selectedRangeManager.updateSelectedRange(dataNode.nextSibling);
};

EditorPaneClass._clickImageHandle = function(obj, evt) {
	if (EditorPaneClass.getCursor() == 'auto') {
		// リサイズ可能でない時にクリックされたら非表示にします
		EditorPaneClass.resizingImgInfo = null;
		obj.style.display = 'none';
		EditManager.getSelectedRangeManager().clearSelectedRange();
	}
	else {
		// ドラッグによる移動の開始を記録します
		EditorPaneClass.resizingImgInfo.resizing = true;
	}
};

EditorPaneClass._clickStartSelection = function(obj, evt) {
	EditorPaneClass.resizingImgInfo = null;
	document.getElementById('EDT_ImageResizingRect').style.display = 'none';

	// 範囲選択処理を行います。
	EditorPaneClass.selectRange(obj, evt);
	EditorPaneClass.leftDownFlag = true; // ドラッグによる範囲選択動作のためのマウス左ボタン押下状態
};


/*******************************************************************************************
 * マウス移動処理
 */
EditorPaneClass.onMouseMove = function(obj, evt) {
	// ★編集禁止時は、このメソッドは何もしないこと★
	if (!DocumentManager.isEditable()) return;

    // 画像リサイズ可能か判定します
	// 画像の端で、マウスカーソルも変更されます
    var resizable = EditorPaneClass.judgeImgResizable(obj, evt);

	// マウスが離れていれば、そこで MouseUp とします
	if (evt.buttons === 0) {
	    EditorPaneClass.onMouseUp(obj, evt);
	    return;
	}

    // ドラッグによる画像リサイズを行います
    if (resizable) {
        EditorPaneClass.dragImgSize(obj, evt);
    }
    // ドラッグによる範囲選択を行います
    else {
        EditorPaneClass.dragRange(obj, evt);
    }
};


//---- ドラッグによる範囲選択を行います。
EditorPaneClass.dragRange = function(obj, evt) {
	if (EditorPaneClass.rangeStartNode !== null && EditorPaneClass.leftDownFlag) { // ---- 範囲選択中なら

		// ---- 現在のノードを取得し、前回のノードと異なるなら選択しなおします。
		var id = EditorPaneClass.getMouseOverId(obj, evt);      // マウス位置に最も近い本文要素の ID を取得
		if (EditorPaneClass.preEndNodeId !== null && id != EditorPaneClass.preEndNodeId) {
			// 範囲選択を更新
			var section  = DocumentManager.getCurrentSection(); // section 取得
			var dataNode = $(section).find('#' + id)[0];        // ID 示す論理データノードを取得
			EditorPaneClass.endSelectRange(dataNode);           // 範囲選択確定
		}
		// ---- カーソル位置移動の確定処理
		EditorPaneClass.finalizeMoveCaret(EditorPaneClass.preEndNodeId, id);

		EditorPaneClass.preEndNodeId = id; // 現在のカーソル位置を記録

		// ---- レンダラ update
		ViewManager.getRenderer().update();

		// ---- デフォルト処理の禁止
		evt.preventDefault();
		evt.stopPropagation();
	}
};


/*******************************************************************************************
 * マウスアップ処理
 */
EditorPaneClass.onMouseUp = function(obj, evt) {
	// ★編集禁止時は、このメソッドは何もしないこと★
	if (!DocumentManager.isEditable()) return;

	EditorPaneClass.leftDownFlag = false; // ドラッグによる範囲選択動作のためのマウス左ボタン押下状態※

	// リサイズ中の画像が存在していれば、サイズ変更を実行します
	var resizingImgInfo = EditorPaneClass.resizingImgInfo;
	if (resizingImgInfo != null && resizingImgInfo.resizing) {
	    // データノードを取得します
        var imgNode = resizingImgInfo.dataNode;
        DataClass.bindDataClassMethods(imgNode);

        // ピクセルとmmのサイズ比を取得します
        var htmlNode = document.getElementById(imgNode.id);
        var mmPerPixel = imgNode.width / htmlNode.getBoundingClientRect().width;

        // 新しいサイズを取得します
        var resizingRect = document.getElementById('EDT_ImageResizingRect');
        var rect = resizingRect.getBoundingClientRect();
        var newWidth = rect.width * mmPerPixel;
        var newHeight = rect.height * mmPerPixel

        // サイズ変更を実行します
	    UiCommandWrapper.setImageProperty(imgNode, {width: newWidth, height: newHeight});

        var selectedRangeManager = EditManager.getSelectedRangeManager();
        selectedRangeManager.clearSelectedRange(true);
        selectedRangeManager.startSelect(imgNode);
        selectedRangeManager.updateSelectedRange(imgNode.nextSibling);
        ViewManager.getRenderer().update();

        resizingImgInfo.resizing = false;

        // レイアウトが移動することがあるので、位置を合わせます
        EditorPaneClass.adjustResizingRectPosition();
	}

	evt.preventDefault();
	evt.stopPropagation();
};


/////////////////////////////////////////////////////////////////////
// 範囲選択
/////////////////////////////////////////////////////////////////////

EditorPaneClass.preEndNodeId   = null;  // ドラッグによる範囲選択動作中の仮の選択範囲終了点
EditorPaneClass.leftDownFlag   = false; // ドラッグによる範囲選択動作のためのマウス左ボタン押下状態※
                                        // ※クロスブラウザ目的
EditorPaneClass.rangeStartNode = null;  // 範囲選択動作中か確認するための変数
EditorPaneClass.rangeNodeList  = [];    // 選択範囲のノードのリスト

// ---- 範囲選択処理
EditorPaneClass.selectRange = function(obj, evt) {

	// 範囲選択マネージャを取得
	var selectedRangeManager = EditManager.getSelectedRangeManager();

	// キャレット位置が示す論理データノードを取得
	var section  = DocumentManager.getCurrentSection();
	var dataNode = $(section).find('#' + EditorPaneClass.getCaret().pos)[0];

	if (!evt.shiftKey) {    // ---- シフトキーが押されていないなら、範囲開始点取得
		// 範囲選択を解除します
		EditorPaneClass.clearRange();

		// 範囲開始ノードを登録します。
		EditorPaneClass.preEndNodeId = null;          // 範囲選択開始時、ドラッグ選択用情報をリセット
		selectedRangeManager.startSelect(dataNode);   // 範囲選択：範囲開始ノードを記録
		EditorPaneClass.rangeStartNode = dataNode;
	} else {                // ---- シフトキーが押されているなら、終了点取得
		EditorPaneClass.endSelectRange(dataNode);
	};
};



// ---- 範囲選択終了点確定
EditorPaneClass.endSelectRange = function(dataNode) {
	// 範囲選択マネージャを取得
	var selectedRangeManager = EditManager.getSelectedRangeManager();

	if (EditorPaneClass.rangeStartNode == dataNode) return;
	selectedRangeManager.updateSelectedRange(dataNode);                  // 範囲終了ノードを記録
	EditorPaneClass.rangeNodeList = selectedRangeManager.getSelectedRange(); // 最新の範囲情報を保持する

};



// ---- 選択範囲クリア
EditorPaneClass.clearRange = function() {
	EditorPaneClass.rangeStartNode = null;                                  // 範囲選択動作解除
	var selectedRangeManager       = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ取得
	if (selectedRangeManager.hasSelectedRange) {                          // ---- 選択範囲があるなら
		selectedRangeManager.clearSelectedRange();                                // 範囲選択情報をクリア
	}
};


/////////////////////////////////////////////////////////////////////
// 画像リサイズ
/////////////////////////////////////////////////////////////////////

/**
* 画像リサイズのための情報を保存するオブジェクト
* dataNode: リサイズ対象画像のデータノード
* resizing: リサイズが開始されたかどうか
*/
EditorPaneClass.resizingImgInfo = null;

/**
* カーソルのスタイルを設定します。
*/
EditorPaneClass.setCursor = function(value) {
    document.getElementById('EDT_MasterLayer').style.cursor = value;
    document.getElementById('EDT_ImageResizingRect').style.cursor = value;
};

/**
* カーソルのスタイルを取得します。
*/
EditorPaneClass.getCursor = function() {
    var paneCursor = document.getElementById('EDT_MasterLayer').style.cursor;
    var rectCursor = document.getElementById('EDT_ImageResizingRect').style.cursor;

    if (paneCursor == null && rectCursor == null) return  'auto';
    else if (paneCursor) return paneCursor;
    else return rectCursor;
};

/**
 * リサイズ対象として選択されている画像のデータノードを取得します。
 * 何も選択されていないときはnullを返します
 * ※外部から呼び出されることを想定します
 */
EditorPaneClass.getResizingImg = function() {
    if (EditorPaneClass.resizingImgInfo == null) return null;
    else EditorPaneClass.resizingImgInfo.dataNode;
}

/**
* 画像リサイズの情報を削除し、リサイズ用の矩形（灰色透明）を非表示にします。
* ※外部から呼び出されることを想定します
*/
EditorPaneClass.clearResizingImgRect = function() {
    EditorPaneClass.resizingImgInfo = null;
    document.getElementById('EDT_ImageResizingRect').style.display = 'none';
};

/**
 * 画像リサイズ用の矩形の位置を対象の画像に合わせます。
 * ※画像位置が変更したとき用
 * ※外部から呼び出されることもあります
 */
EditorPaneClass.adjustResizingRectPosition = function() {
    if (EditorPaneClass.resizingImgInfo == null) return;

    // 対象画像の画面上のノードを取得します
    var htmlNode = document.getElementById(EditorPaneClass.resizingImgInfo.dataNode.id);
    if (htmlNode == null) {
        // 画面上から消えているときは、リサイズ用矩形を非表示にします
        EditorPaneClass.clearResizingImgRect();
        return;
    }
    var scroll = document.getElementById('EDT_MasterLayer').scrollTop;  // スクロール量

    // リサイズ用矩形の位置を設定します
    var resizingRect = document.getElementById('EDT_ImageResizingRect');

    // ID_EditorPane との位置関係を取得します
    var top = htmlNode.offsetTop;
    var left = htmlNode.offsetLeft;
    while (htmlNode.offsetParent && htmlNode.offsetParent.id != 'ID_EditorPage') {
        htmlNode = htmlNode.offsetParent;
        top += htmlNode.offsetTop;
        left += htmlNode.offsetLeft;
    }

    resizingRect.style.top = top - scroll + 'px';
    resizingRect.style.left = left + 'px';
}

/**
* 画像リサイズ可能かどうかを判定します
*/
EditorPaneClass.judgeImgResizable = function(obj, evt) {
    // 画像リサイズ情報を取得します
    var info = EditorPaneClass.resizingImgInfo;

    // ドラッグ中はカーソルの形で判定します
    if (info != null && info.resizing) return EditorPaneClass.getCursor() != 'auto';

    var result = false;

    // 画像リサイズが可能かどうかを判定します
    if (obj.id == 'EDT_ImageResizingRect' && info != null) {
        const DIFF = 20;
        var rect = document.getElementById(info.dataNode.id).getBoundingClientRect();

        // 画像の右下にカーソルがある場合はアスペクト比を保存したリサイズ
        if (Math.abs(rect.right - evt.clientX) <= DIFF && Math.abs(rect.bottom - evt.clientY) <= DIFF) {
            EditorPaneClass.setCursor('se-resize');
            result = true;
        }

        // 画像の右側にカーソルがあるときは幅変更
        else if (Math.abs(rect.right - evt.clientX) <= DIFF &&
                Math.abs((rect.bottom+rect.top)/2 - evt.clientY) <= DIFF) {
            EditorPaneClass.setCursor('e-resize');
            result = true;
        }

        // 画像の下側にカーソルがあるときは高さ変更
        else if (Math.abs((rect.right+rect.left)/2 - evt.clientX) <= DIFF &&
                Math.abs(rect.bottom - evt.clientY) <= DIFF) {
            EditorPaneClass.setCursor('s-resize');
            result = true;
        }

    }

    // リサイズできないときはマウスカーソルを通常にします
    if (result == false) {
        EditorPaneClass.setCursor('auto');
    }

    return result;
};

/**
* ドラッグによる画像リサイズを実行します。
*/
EditorPaneClass.dragImgSize = function(obj, evt) {
    // ドラッグ中のみ実行します
    var info = EditorPaneClass.resizingImgInfo;
    if (info != null && info.resizing) {
        // 画面上の画像ノードを取得します
        var resizingRect = document.getElementById('EDT_ImageResizingRect');
        if (resizingRect == null) return;
        var rect = resizingRect.getBoundingClientRect();

        // 表示上、画像サイズを変更します（Undo/Redoは不要）
        var orgW = rect.width;
        var orgH = rect.height;
        var newW = evt.clientX - rect.left;
        var newH = evt.clientY - rect.top;

        // 新しいサイズを計算します
        if (EditorPaneClass.getCursor() == 'se-resize') {          // アスペクト比を保存したまま変更
            var scale = Math.max(newW/orgW, newH/orgH);
            newW = orgW * scale;
            newH = orgH * scale;
        }
        else if (EditorPaneClass.getCursor() == 'e-resize') {      // 幅変更
            newH = orgH;    // 高さはそのまま
        }
        else if (EditorPaneClass.getCursor() == 's-resize') {      // 高さ変更
            newW = orgW;    // 幅はそのまま
        }
        else return;

        // サイズを設定します
        resizingRect.style.width = newW + 'px';
        resizingRect.style.height = newH + 'px';

        // 描画リサイズ
        EditorPaneClass.drawToCanvas(resizingRect.firstChild, newW, newH);
    }

};

/**
 * リサイズする画像に重ねてグレーなどを描画します。
 */
EditorPaneClass.drawToCanvas = function(canvas, width, height) {
    if (canvas == null) return;

    canvas.width = width+1;
    canvas.height = height+1;
    var ctx = canvas.getContext('2d');
    const RECT_SIZE = 10;

    // ひとまず全消去します
    ctx.fillStyle  = 'black';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, width, height);

    // 枠線
    ctx.strokeStyle  = 'black';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

    // 右下
    ctx.strokeRect(width - RECT_SIZE, height - RECT_SIZE, RECT_SIZE, RECT_SIZE);
    ctx.fillRect(width - RECT_SIZE, height - RECT_SIZE, RECT_SIZE, RECT_SIZE);

    // 右横
    ctx.strokeRect(width - RECT_SIZE, (height - RECT_SIZE)/2, RECT_SIZE, RECT_SIZE);
    ctx.fillRect(width - RECT_SIZE, (height - RECT_SIZE)/2, RECT_SIZE, RECT_SIZE);

    // 中央下
    ctx.strokeRect((width - RECT_SIZE)/2, height - RECT_SIZE, RECT_SIZE, RECT_SIZE);
    ctx.fillRect((width - RECT_SIZE)/2, height - RECT_SIZE, RECT_SIZE, RECT_SIZE);

}


///////////////////////////////////////////////////////////////////////////////////////
// マウス位置を元に新しいカーソル位置を決定する
///////////////////////////////////////////////////////////////////////////////////////

// ---- マウス位置に存在するノードの ID を取得
EditorPaneClass.getMouseOverId = function(obj, evt) {
	// ---- ノード取得処理
	// 以下の優先度で処理を行います。以下 1.2.3. は、排他処理です。
	// 1. クリック / マウスオーバー位置に本文要素があるなら、その要素へカーソルを移動
	// 2. 上記に該当しなければ、マウス位置の左右に段落要素があるか確認し、あるなら最も近い子要素へカーソルを移動。
	// 3. 上記に該当しなければ、上に段落要素があるか確認し、あるなら最も近い子要素へカーソルを移動。

	// クリック位置の html ノードを取得します
	var touchedNode = evt.target;

	if (touchedNode.id === 'EDT_MasterLayer') {
		// エディタペインの場合、最寄りの段落を取得します
		touchedNode = EditorPaneClass.getClosestParagraph(touchedNode, evt.pageY);
	}

	var nextNode = null;

	// テーブル、段落以外の場合、html ツリー上での最寄りノードを取得します
	if ((touchedNode.nodeName !== 'TD') && (touchedNode.nodeName !== 'DIV')) {
		nextNode = EditorPaneClass.getNearestElement(touchedNode);
	}

	// 取得に失敗した場合、座標が最寄りのノードを取得します
	if (nextNode === null) {
		nextNode = EditorPaneClass.getClosestElement(touchedNode, evt.pageX, evt.pageY);
	}

	//console.log('ノード：' + nextNode.id + '(' + nextNode.textContent + ')');
	return nextNode.id;
};

/**
 * エディタペイン上で最寄りの段落ノードを取得します。
 */
EditorPaneClass.getClosestParagraph = function(pane, y) {
	// 各段落の縦座標を取得し、カーソル座標と比較していきます

	for (var paraIdx = 0; paraIdx < pane.children.length; paraIdx++) {
		// 段落の縦座標を取得します
		var top = EditorPaneClass.getPageTop(pane.children[paraIdx])
		var bottom = top + pane.children[paraIdx].offsetHeight;

		// 座標を判定し、ヒットした段落を返します
		if ((top <= y) && (y <= bottom)) return pane.children[paraIdx];
	};

	// ヒットしなかった場合、最後の段落を返します
	return pane.lastChild;
};

/**
 * ターゲットノードの下から、指定座標に最も近いノードを取得します。
 */
EditorPaneClass.getClosestElement = function(target, x, y) {
	var minDist = 1024 * 1024;
	var minIdx = -1;

	var nodeList = target.getElementsByTagName('*');

	for (var idx = 0; idx < nodeList.length; idx++) {
		// ノードID を確認し、データノードに対応しなければスキップします
		// 入力位置になり得ないノードもスキップします
		if (nodeList[idx].id == void 0) continue;
		if (nodeList[idx].id.substr(0, 1) !== 'C') continue;
		if (nodeList[idx].nodeName === 'TABLE') continue;
		if (nodeList[idx].nodeName === 'TD') continue;
		var id = nodeList[idx].id;
		var dataNode = $(DocumentManager.getDocument()).find('#' + id)[0];
		if (dataNode.nodeName.toLowerCase() === 'cmatcell') continue;

		// 座標を取得します
		var jnodePos = $(nodeList[idx]).offset();

		var top = jnodePos.top;
		var bottom = top + nodeList[idx].offsetHeight;
		var left = jnodePos.left;
		var right = left + nodeList[idx].offsetWidth;

		// マウス座標との距離を取得します
		var dist = EditorPaneClass.getDistance(top, bottom, left, right, x, y, EditorPaneClass.isInTable(nodeList[idx]));

		// 最も近い距離か判定し、近ければ記録します
		if (dist < minDist) {
			minIdx = idx;
			minDist = dist;
		}

		//console.log(nodeList[idx].nodeName + ' : ' + nodeList[idx].id, left, right, top, bottom);
		//console.log(dist + ' / (' + x + ', ' + y + ')');
	};

	// 結果を返します
	if (minIdx === -1) return null;
	return nodeList[minIdx];
};

/**
 * html ツリー上でレイアウトノードに対応する最寄りのノードを取得します。
 */
EditorPaneClass.getNearestElement = function(node) {
	// 子要素を持たない、MathJAX色設定ノードの場合
	if ((node.children.length === 0) && (node.id.substr(0, 13) === 'MathJax-Color') && (node.nextSibling !== null)) {
		return node.nextSibling;
	};

	// 対応するデータノードを有する通常ノードの場合
	while (node.parentNode !== null) {
		if (node.id.substr(0, 1) === 'C') return node;
		node = node.parentNode;
	}

	return null;
};

/**
 * 指定ノードのページ上での top を取得します。
 */
EditorPaneClass.getPageTop = function(node) {
	return node.offsetTop;

	/*var top = 0;

	while (node.parentNode !== null) {
		top += node.offsetTop;
		node = node.parentNode;
	}

	return top;*/
};

/**
 * 指定ノードのページ上での left を取得します。
 */
EditorPaneClass.getPageLeft = function(node) {
	return node.offsetLeft;

	/*var left = 0;

	while (node.parentNode !== null) {
		left += node.offsetLeft;
		node = node.parentNode;
	}

	return left;*/
};

/**
 * 指定ノードがテーブルの中にあるか検出します。
 */
EditorPaneClass.isInTable = function(node) {
	while (node.parentNode !== null) {
		if (node.nodeName === 'TD') return true;
		node = node.parentNode;
	};

	return false;
};

/**
 * ノード座標とマウス座標の距離を取得します。
 */
EditorPaneClass.getDistance = function(top, bottom, left, right, x, y, inTable) {
	// X 方向の距離を取得します
	var xdist = 0;
	if ((left < x) && (x < right)) {
		xdist = 0;
	} else if (x < left) {
		xdist = left - x;
	} else {
		xdist = x - right;
	}

	// Y 方向の距離を取得します
	var ydist = 0;
	if ((top < y) && (y < bottom)) {
		ydist = 0;
	} else if (y < top) {
		ydist = top - y;
	} else {
		ydist = y - bottom;
	}

	// 距離を返します
	var correct = inTable ? 1 : 100;
	return Math.sqrt(xdist * xdist + ydist * ydist);
//	return Math.sqrt(xdist * xdist * correct + ydist * ydist);
};


///////////////////////////////////////////////////////////////////////////////////////
// カーソル制御
///////////////////////////////////////////////////////////////////////////////////////

// ---- マウスダウンによるカーソル位置移動処理
EditorPaneClass.moveCaret = function(obj, evt) {

	// ---- 移動前のカーソル位置を取得します。
	var foreId = EditorPaneClass.getCaret().pos;

	// ---- クリック位置に最も近い本文要素の ID を取得
	var id = EditorPaneClass.getMouseOverId(obj, evt);

	// ---- カーソル位置移動の確定処理
	EditorPaneClass.finalizeMoveCaret(foreId, id);
};

// ---- カーソル位置移動の確定処理
EditorPaneClass.finalizeMoveCaret = function(foreId, id) {
	// ---- カーソルを移動します。
	EditorPaneClass.getCaret().pos = id;

	// ---- カーソル位置から、イタリック等の書式情報を取得し、GUIへ反映します。
	ViewManager.getStatusManager().showCaretStatus();

	// ---- renderer 及び caret 処理
	if (id != null) {
		ViewManager.getRenderer().setCaretPos(foreId, id);
		EditorPaneClass.Caret.clearUpDownMode();
	}
	EditorPaneClass.updateCaret();
};

// ------------- 指定した html ノードへキャレットを移動します。
EditorPaneClass.updateCaret = function(noSetFocus) {
	// htmlNode [I, DOM(非JQ 生ノード)]:

	// キャレット位置を取得します。取得できなければ、処理はキャンセルします
	// ★ 表示セクション切り替え時、MathJAX がちんたら働くと、html からノードを取得できません
	var id = EditorPaneClass.Caret.pos;
	if ((id === (void 0)) || (id.length <= 0)) return;

	var htmlNode = $('#EDT_MasterLayer #' + id);      // マスタレイヤを先祖にもつ子要素のうち、id が一致するもの
	if (htmlNode.length == 0) {
		// 指定された ID の要素がなかった場合、
	    var section = DocumentManager.getCurrentSection();

	    if (EditorPaneClass.Caret.prev != null) {
	    	var docPrevNode = $(section).find('#' + EditorPaneClass.Caret.prev)[0];

	    	if (docPrevNode != void 0) {
	    		htmlNode = $('#EDT_MasterLayer #' + docPrevNode.nextSibling.id);
	    	}
	    	else {
	    		// セクション切り替え時に MathJAX の処理が間に合わないと、ここに来ることがあります
	    		console.log('カーソル移動先の取得に失敗しました。 (prev)');
	    		return;
	    	}
		}
		else {
	    	var docParentNode = $(section).find('#' + EditorPaneClass.Caret.parent)[0];

	    	if (docParentNode != void 0) {
	    		htmlNode = $('#EDT_MasterLayer #' + docParentNode.children[0].id);
	    	}
	    	else {
	    		// セクション切り替え時に MathJAX の処理が間に合わないと、ここに来ることがあります
	    		console.log('カーソル移動先の取得に失敗しました。 (parent)');
	    		return;
	    	}
		}

	    console.log('Retry got node: ' + htmlNode[0]);
	    //console.error('Error : カーソル移動先のHTMLノード取得に失敗しました。(カーソル位置=' + id + ')');
	    //return;
	}

	// 数式番号ノードの場合、本文の終端ノードを取得し、その右にカーソルをおけるよう、
	// 終端ノードの幅を取得します
	var leftOffset = 0;
	if (htmlNode[0].className != void 0) {	// MathML ノードがヒットしていた場合は何もしません
		if (htmlNode[0].className.indexOf('eqnumber') >= 0) {
			htmlNode = htmlNode.parent().prev();
			leftOffset = htmlNode.width();
		}

		var parPos       = $('#ID_EditorPage').offset(); // 親div の座標情報　　　を取得します。
		var pos          = htmlNode.offset();         // 指定ノードの座標情報　を取得します。
		var targetWidth  = htmlNode.width();          // 指定ノードの横幅を取得します。
		var targetHeight = htmlNode.height();         // 指定ノードの高さを取得します。

		// フォント周りのパラメータ取得
	//	var targetFontSize   = htmlNode.css('font-size');
	//	var targetFontFamily = htmlNode.css('font-family');
	//	var targetFont = htmlNode.css('font');

		var newTop  = pos.top  - parPos.top  - 2;				// 新 Y 座標算出
		var newLeft = pos.left - parPos.left - 2 + leftOffset;	// 新 X 座標算出

		var jqFrontTextBox  = $('#EDT_FrontTextBox' ); // 前面テキストボックス　　のjqueryオブジェクト

		// テキストボックスの位置を変更する
		jqFrontTextBox.css('top' , newTop );
		jqFrontTextBox.css('left', newLeft);
	//	jqFrontTextBox.css('font-family', targetFontFamily);
	//	jqFrontTextBox.css('font',   targetFont  );

	}
	// FronTextBox へ フォーカスをあてる
	if (noSetFocus !== true) EditorPaneClass.FocusFrontTextBox();
};

// ------------- フロントテキストボックスをフォーカスします。
EditorPaneClass.FocusFrontTextBox = function(evt) {
    // ポップアップを削除した後フォーカス要求することを想定しますが
    // セクションタイトルのテキストボックスをクリックした場合を除外します
    if (evt != null && evt.target != null && evt.target.id == 'ST_SectionTitleBar') return;

    $('#EDT_FrontTextBox').focus();
};

// ------------- フロントテキストボックスの表示位置を取得します。
EditorPaneClass.GetFrontTextBoxPos = function() {
	var parPos  = $('#ID_EditorPage').offset();    // 親div の座標情報　　　を取得します。
	var pos     = $('#EDT_FrontTextBox').offset(); // 指定ノードの座標情報　を取得します。
	var newTop  = pos.top  - parPos.top  - 2;      // 新 Y 座標算出
	var newLeft = pos.left - parPos.left - 2;      // 新 X 座標算出
	return( {'top' : newTop, 'left' : newLeft} );
};

/**
 * カーソルに右境界線を設定・解除します。
 */
EditorPaneClass.setCaretBorder = function(isShown) {
	// 以下のメソッドは共通クラスに移動した方が良いかも知れません。
	var styleRule = Renderer.getStyleClass('EDT_FrontTextBox');

	if (isShown) {
		styleRule.style['border-right'] = 'solid 1px black';
		//styleRule.style['font-size'] = size2 + 'pt';
	} else {
		styleRule.style['border-right'] = 'solid 0px black';
	}
};


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/**
 * エディタペイン全体を再描画します。
 * @param index	描画するセクションのインデックス
 */
EditorPaneClass.RedrawEditorPane = function(index) {
	var renderer = ViewManager.getRenderer();
	if (index === null) {
		renderer.preserveEditorPaneClear();
	} else {
		if (renderer != null) renderer.render(index);
	}
};


// ------------- 画像の挿入
EditorPaneClass.InsertImage = function() {
	if (DocumentManager.isEditable() !== true) return;
	// ---- ダイアログ表示
//	Dialog_SaveAs
	$('#Dialog_InsertImage').dialog({
//	$('#Dialog_SaveAs').dialog({
		modal:     true,  // モーダルダイアログ。
		draggable: false, // ドラッグによる位置変更を許可しない。
		resizable: false, // サイズ変更を許可しない。
	});
}

