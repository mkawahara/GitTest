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
// EDT_FrontTextMask spanタグ
// EDT_HiddenTextBox 隠れテキストボックス

// ============================= 定数 =============================

const LIM_DOM_SEARCH = 100; // 親DOMを探す際、何階層上まで見に行くか

// ------------- ブラウザがドキュメントを読み込んだ直後に実行されます。

// *************************************************************
// **                 エディタペーンクラス                    **
// *************************************************************
function EditorPaneClass(editorNodeId, sectionIndex, parentDivId) {
	this.parentDivId  = (parentDivId  === void 0) ? 'ID_EditorPage' : parentDivId; // 親 div ID を記録
	this.sectionIndex = (sectionIndex === void 0) ? 0 : sectionIndex; // 自分のセクション番号を記憶しておく。
	this.editorNodeId = (editorNodeId === void 0) ? 'replaceObject' : editorNodeId;
	this.editorNode   = document.getElementById(this.editorNodeId);
//	this.Caret        = new Caret(this.editorNode);        // Caretクラスのインスタンス作成。
	this.CodeAssist   = new CodeAssist('codeAssist', 5); // 入力支援クラス作成。

	this.preEndNodeId   = null;  // ドラッグによる範囲選択動作中の仮の選択範囲終了点
	this.leftDownFlag   = false; // ドラッグによる範囲選択動作のためのマウス左ボタン押下状態
	                             // ※クロスブラウザ目的
	this.rangeStartNode = null;  // 範囲選択動作中か確認するための変数
	this.rangeNodeList  = [];    // 選択範囲のノードのリスト

	// スクロール用に追加
//	this.scrollManager = new ScrollManager(this.editorNode);

	this.SetCaretMouseEvent();                      // キャレット用マウスイベントを登録
	this.SetRightClick();                           // 右クリックコンテキストメニューを表示

	// ---- キー入力用初期化処理
	KeyEventHandler.init();                         // ブラウザ毎の動作の差異に対応
	this.SetCaretInputEvent();                     // キャレット用入力イベントを登録

};

EditorPaneClass._scrollManager = null;

Object.defineProperty(EditorPaneClass, 'scrollManager', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (EditorPaneClass._scrollManager === null) {
			var currentEditorNode = ViewManager.getEditorPane().editorNode;
			EditorPaneClass._scrollManager = new ScrollManager(currentEditorNode);
		}
		return EditorPaneClass._scrollManager;
	},
});



EditorPaneClass.prototype.getCaret = function() {
	//return this.Caret;
	//return null;
	return ViewManager.getCaret();
};


// ------------- CodeAssistオブジェクトへの参照取得
EditorPaneClass.prototype.getCodeAssist = function() {
	return this.CodeAssist;
};

/**
 * カーソルに右境界線を設定・解除します。
 */
EditorPaneClass.setCaretBorder = function(isShown) {
	// 以下のメソッドは共通クラスに移動した方が良いかも知れません。
	var styleRule = Renderer.getStyleClass('EDT_FrontTextBox');
	if (styleRule === void 0) {
		var debugPoint = 1;
	}

	if (isShown) {
		styleRule.style['border-right'] = 'solid 1px black';
		//styleRule.style['font-size'] = size2 + 'pt';
	} else {
		styleRule.style['border-right'] = 'solid 0px black';
	}
};


EditorPaneClass.Init = function() {
/*
//	var editorNode = document.getElementById('EDT_MasterLayer');
	var editorNode = document.getElementById('replaceObject');
	EditorPane.Caret      = new Caret(editorNode);        // Caretクラスのインスタンス作成。
//	EditorPane.Command    = new CommandExecutor(100);     // 2015/06/12 削除 湯本
	EditorPane.CodeAssist = new CodeAssist('codeAssist'); // 入力支援クラス作成。

	// スクロール用に追加
	EditorPane.scrollManager = new ScrollManager(editorNode);

	EditorPane.SetCaretMouseEvent();                      // キャレット用マウスイベントを登録

	EditorPane.SetRightClick();                           // 右クリックコンテキストメニューを表示

	// ---- キー入力用初期化処理
	KeyEventHandler.init();               // ブラウザ毎の動作の差異に対応
	EditorPane.SetCaretInputEvent(); // キャレット用入力イベントを登録
*/
};



// ---- 右クリック：コンテキストメニュー
EditorPaneClass.prototype.SetRightClick = function() {
	var editorPane = this;
	// ---- 右クリック：コンテキストメニュー
	$('#' + this.editorNodeId).on('contextmenu', function (evt){
		console.log('エディタペーンで右クリック');

		editorPane.RightClick(this, evt);

		evt.preventDefault();
	});
	$('#EDT_FrontTextBox').on('contextmenu', function (evt){
		console.log('テキストボックスで右クリック');

		editorPane.RightClick(this, evt, true);

		evt.preventDefault();

	});
};



EditorPaneClass.prototype.RightClick = function(obj, evt, inputboxFlag) {
	inputboxFlag = inputboxFlag !== undefined ? inputboxFlag : false;
	var selectedRangeManager = EditManager.getSelectedRangeManager(); // 範囲選択マネージャを取得
	var dataNode             = null;                                  // データノード用変数
	var nodeName             = null;                                  // ノード名用変数
	var rContextMenuId       = this.GetRContextNormal();   // 規定値として、通常用コンテキストメニューを用意

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
		if (!inputboxFlag) this.moveCaret(obj, evt);           // カーソル移動を行います。
//		var caretId  = this.getCaret().pos;                    // カーソル位置のノードの id 取得
		var caretId  = ViewManager.getCaret().pos;                    // カーソル位置のノードの id 取得
		var dataNode = DocumentManager.getNodeById(caretId);              // データノード取得
		nodeName     = dataNode.nodeName;                                 // ノード名取得
	}

	// ---- テーブル処理用に、先祖ノードを取得する
	if (nodeName != 'CIMG') {                                     // ---- 画像でないなら
		var ancestorNode = $(dataNode).closest('ctd') ;                   // 祖先ノードのテーブルセルをチェック
		if (ancestorNode[0] !== undefined) {                              // ---- あったなら
			nodeName = ancestorNode[0].nodeName;                                  // ノード名取得
		}
	}

	// ---- 右クリックメニューを決定します。
	if (nodeName == 'CIMG') {                                     // ---- 画像なら
		rContextMenuId = this.GetRContextImage();                // 画像用コンテキストメニューを用意
	} else if (nodeName == 'CTD') {                               // ---- テーブル要素があるなら
		rContextMenuId = this.GetRContextTable();                // テーブル用コンテキストメニューを用意
	}

	// ---- 表示位置を決定します。
	// 現在は何もしていません。クリック位置へそのまま表示しています。

	// ---- コンテキストメニューを表示します。
	EditorToolClass.ShowContextMenu(rContextMenuId, evt.clientX, evt.clientY);
};

// static jquery-ui オブジェクト 通常用コンテキストメニューを返す
EditorPaneClass.prototype.GetRContextNormal = function() {
	return 'ET_Edit_EditorPopup_ConMenu';
};

EditorPaneClass.prototype.GetRContextImage = function() {
	return 'ET_Edit_ImagePopup_ConMenu';
};

EditorPaneClass.prototype.GetRContextTable = function() {
	return 'ET_Edit_TablePopup_ConMenu';
};



// ------------- テキストボックスへのキー入力によるイベント処理
EditorPaneClass.prototype.SetCaretInputEvent = function() {

	// テキストボックスへの input イベント
	EDT_FrontTextBox.addEventListener('keydown',          KeyEventHandler.onKeyDown);
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
EditorPaneClass.prototype.SetCaretMouseEvent = function() {
	var editorPane = this;

	// ---- 左ボタン押下
	$('#' + this.editorNodeId).on('mousedown', function (evt){
		if (evt.button == 0) {
			editorPane.onMouseDown(this, evt);
		}
	});
	$('#EDT_FrontTextBox').on('mousedown', function (evt){
		if (evt.button == 0) {
			editorPane.onMouseDown(this, evt, true);
		}
	});

	// ---- ドラッグ選択
//	$('#EDT_MasterLayer').on('mousemove', function (evt){
	$('#' + this.editorNodeId).on('mousemove', function (evt){
		if (evt.button == 0) {
			editorPane.onMouseMove(this, evt);
		}
	});

	// ---- 左ボタン開放
//	$('#EDT_MasterLayer').on('mouseup', function (evt){
	$('#' + this.editorNodeId).on('mouseup', function (evt){
		if (evt.button == 0) {
			editorPane.onMouseUp(this, evt);
		}
	});
	$('#EDT_FrontTextBox').on('mouseup', function (evt){
		if (evt.button == 0) {
			editorPane.onMouseUp(this, evt);
		}
	});
};



// ---- マウスダウン処理
EditorPaneClass.prototype.onMouseDown = function(obj, evt, inputboxFlag) {
	console.log('EditorPane mouse down.');
	// ---- DocumentManager に、セクション通知
	var currentSectionIdx = DocumentManager.instance.getCurrentSection();
	if (currentSectionIdx != this.sectionIndex) {
		DocumentManager.instance.setCurrentSection(this.sectionIndex);
	}

	inputboxFlag = inputboxFlag !== undefined ? inputboxFlag : false; //
	ToolbarUtilityClass.AutoHideContext(); // コンテキストメニューの hide 処理

	// ---- マウスダウンによるカーソル位置移動を行います。
	if (!inputboxFlag) this.moveCaret(obj, evt);

	// ---- 範囲選択処理を行います。
	this.selectRange(obj, evt);

	// ---- レンダラ update
	ViewManager.getRenderer().update();

	// ---- フォーカス移動のための後処理
	evt.preventDefault();              // 他の処理にフォーカスを取られることを防ぎます。
	evt.stopPropagation();             // イベントバブリングによる余計な重複処理を防ぎます。
	// ※preventDefault() と stopPropagation() の両方を実行しないと、フォーカス移動が保持されません。
	this.leftDownFlag = true; // ドラッグによる範囲選択動作のためのマウス左ボタン押下状態
	console.log('マウスボタンdown', this.leftDownFlag);

};



// ---- マウス移動処理
EditorPaneClass.prototype.onMouseMove = function(obj, evt) {
	// ---- ドラッグによる範囲選択を行います。
	this.dragRange(obj, evt);
};



// ---- ドラッグによる範囲選択を行います。
EditorPaneClass.prototype.dragRange = function(obj, evt) {
	if (this.rangeStartNode !== null && this.leftDownFlag) { // ---- 範囲選択中なら

		// ---- 現在のノードを取得し、前回のノードと異なるなら選択しなおします。
		var id = this.getMouseOverId(obj, evt);      // マウス位置に最も近い本文要素の ID を取得
		if (this.preEndNodeId !== null && id != this.preEndNodeId) {
			// 範囲選択を更新
			var section  = DocumentManager.getCurrentSection(); // section 取得
			var dataNode = $(section).find('#' + id)[0];        // ID 示す論理データノードを取得
			this.endSelectRange(dataNode);           // 範囲選択確定
		}
		// ---- カーソル位置移動の確定処理
		this.finalizeMoveCaret(this.preEndNodeId, id);

		this.preEndNodeId = id; // 現在のカーソル位置を記録

		// ---- レンダラ update
		ViewManager.getRenderer().update();

		// ---- デフォルト処理の禁止
		evt.preventDefault();
		evt.stopPropagation();
	}
};



// ---- マウスアップ処理
EditorPaneClass.prototype.onMouseUp = function(obj, evt) {

	this.leftDownFlag = false; // ドラッグによる範囲選択動作のためのマウス左ボタン押下状態※
	console.log('マウスボタンup', this.leftDownFlag);

	evt.preventDefault();
	evt.stopPropagation();
};


/////////////////////////////////////////////////////////////////////
// 範囲選択
/////////////////////////////////////////////////////////////////////


// ---- 範囲選択処理
// 選択範囲の終了点としてクリックしたノードを、新規に選択範囲開始地点ノードにしようとしてクリックしても、イベント取ることができません。前面に input がいるから。考え中。
EditorPaneClass.prototype.selectRange = function(obj, evt) {

	// 範囲選択マネージャを取得
	var selectedRangeManager = EditManager.getSelectedRangeManager();

	// キャレット位置が示す論理データノードを取得
	var section  = DocumentManager.getCurrentSection();
//	var dataNode = $(section).find('#' + this.Caret.pos)[0];
	var caret = ViewManager.getCaret();
	var dataNode = $(section).find('#' + caret.pos)[0];

	if (!evt.shiftKey) {    // ---- シフトキーが押されていないなら、範囲開始点取得
		this.clearRange(); // 範囲選択を解除
		// 範囲開始ノードを登録します。
		this.preEndNodeId = null;          // 範囲選択開始時、ドラッグ選択用情報をリセット
		selectedRangeManager.startSelect(dataNode);   // 範囲選択：範囲開始ノードを記録
		this.rangeStartNode = dataNode;
		console.log('選択開始点' , dataNode.textContent )
	} else {                // ---- シフトキーが押されているなら、終了点取得
		this.endSelectRange(dataNode);
	}
};



// ---- 範囲選択終了点確定
EditorPaneClass.prototype.endSelectRange = function(dataNode) {
	// 範囲選択マネージャを取得
	var selectedRangeManager = EditManager.getSelectedRangeManager();

	if (this.rangeStartNode == dataNode) return;
	console.log('選択終了点' , dataNode.textContent, this.leftDownFlag )
	selectedRangeManager.updateSelectedRange(dataNode);                  // 範囲終了ノードを記録
	this.rangeNodeList = selectedRangeManager.getSelectedRange(); // 最新の範囲情報を保持する
};



// ---- 選択範囲クリア
EditorPaneClass.prototype.clearRange = function() {
	this.rangeStartNode = null;                                  // 範囲選択動作解除
	var selectedRangeManager       = EditManager.getSelectedRangeManager(); // 範囲選択マネージャ取得
	if (selectedRangeManager.hasSelectedRange) {                          // ---- 選択範囲があるなら
		selectedRangeManager.clearSelectedRange();                                // 範囲選択情報をクリア
	}
};



// ---- マウス位置に存在するノードの ID を取得
EditorPaneClass.prototype.getMouseOverId = function(obj, evt) {
	// ---- ノード取得処理
	// 以下の優先度で処理を行います。以下 1.2.3. は、排他処理です。
	// 1. クリック / マウスオーバー位置に本文要素があるなら、その要素へカーソルを移動
	// 2. 上記に該当しなければ、マウス位置の左右に段落要素があるか確認し、あるなら最も近い子要素へカーソルを移動。
	// 3. 上記に該当しなければ、上に段落要素があるか確認し、あるなら最も近い子要素へカーソルを移動。

	// ---- クリック位置の本文要素を取得
	// 親DOMをたどり (evt.target 自身も含みます)、Cで始まるIDを探します。
	var id = this.TrackbackIdByCaptital(evt.target, 'C', obj.id);
	// テーブルセルを避けます。
	if (id) {
		var tempNode = DocumentManager.getNodeById(id);
		if (tempNode) {
			if (tempNode.nodeName == 'CTD') id = null;
		}
	}

	// ---- クリック位置に本文要素がないか、id を持たない要素の場合の処理
	if (id == null) {                                                    // ---- クリック位置に本文要素がないなら
//		var editorPaneNode = document.getElementById('EDT_MasterLayer');         // html エディタペーンノード
//		var editorPaneNode = document.getElementById('replaceObject');           // html エディタペーンノード
		var editorPaneNode = this.editorNode;                                // html エディタペーンノード
		var targetParaNode = evt.target;                                         // クリックされた段落ノードが対象
		if (evt.target.tagName != 'P') {                                 // ---- 段落外でクリックされたら
			var htmlParagraphs = editorPaneNode.children;                      // html 段落ノードリスト取得
			targetParaNode     = htmlParagraphs[htmlParagraphs.length - 1];      // 最後の段落ノードが対象
		}

		// ---- 段落ノードのすべての子孫において、中心座標とクリック座標との間の距離が最も小さい要素を探します。
		var minDistanceSqr = Number.MAX_VALUE;                           // もっとも小さい距離二乗値
		var minId          = null;                                       // 　上記に該当する要素の ID
		var mouseX         = evt.clientX;                                // マウスの X 座標
		var mouseY         = evt.clientY;                                // マウスの Y 座標
		var $descendents   = $(targetParaNode).find('*');                // 該当段落ノードのすべての子孫
		$descendents.each( function(index, element) {                    // ---- 子孫要素全てについてループ
			var $element   = $(element);
			var middleX    = $element.offset().left + $element.width()  / 2;     // 要素の中心点 X 座標
			var middleY    = $element.offset().top  + $element.height() / 2;     // 要素の中心点 Y 座標
			var distanceSqr= Math.pow(middleX - mouseX, 2) + Math.pow(middleY - mouseY, 2);  // 距離の二乗

			var judgeFlag = (element.id !== '') && (distanceSqr < minDistanceSqr); // id があり、距離が以前より近いか
			if (judgeFlag) judgeFlag = (element.nodeName != 'TD');                // そして、テーブルセルではない

//			if ((element.id !== '') && (distanceSqr < minDistanceSqr)) { // ---- id があり、距離が以前より近い要素なら
			if (judgeFlag) {
				minDistanceSqr = distanceSqr;                                    // 距離 (の二乗) を記録
				minId          = element.id;                                     // 　上記に該当する要素の ID
			}
		});
		id = minId; // マウスクリック位置と最も距離の近い要素の ID
	}
	return id;
};



// ---- マウスダウンによるカーソル位置移動処理
EditorPaneClass.prototype.moveCaret = function(obj, evt) {

	// ---- 移動前のカーソル位置を取得します。
//	var foreId = this.getCaret().pos;
	var foreId = ViewManager.getCaret().pos;

	// ---- クリック位置に最も近い本文要素の ID を取得
	var id = this.getMouseOverId(obj, evt);

	// ---- カーソル位置移動の確定処理
	this.finalizeMoveCaret(foreId, id);
};

EditorPaneClass.prototype.initCaretPos = function() {
	// 第一セクションの先頭要素を取得します
	DocumentManager.setCurrentSection(0);
	var section = DocumentManager.getCurrentSection()
	var id = section.children[0].children[0].id;
	console.log(id);

	// ---- カーソル位置移動の確定処理
	this.finalizeMoveCaret(id, id);
};


// ---- カーソル位置移動の確定処理
EditorPaneClass.prototype.finalizeMoveCaret = function(foreId, id) {

	// ---- カーソルを移動します。
//	this.Caret.pos = id;
	ViewManager.getCaret().pos = id;

	// ---- カーソル位置から、イタリック等の書式情報を取得し、GUIへ反映します。
	/*if (foreId != id) */ViewManager.getStatusManager().showCaretStatus();

	// ---- renderer 及び caret 処理
	if (id != null) {
		ViewManager.getRenderer().setCaretPos(foreId, id);
//		this.Caret.clearUpDownMode();
		ViewManager.getCaret().clearUpDownMode();
	}
	this.updateCaret();
};



// ------------- 開始ノードから親ノードをさかのぼって、指定された文字列で始まる id をもつノードの裸DOMを返します。
// ★段落はこれでは検出できなくなっているので注意（2015/4/16時点では段落検出には使用されていないこと確認済み）
EditorPaneClass.prototype.TrackbackIdByCaptital = function(originNode, capitalLetter, stopId) {
	// originNode  [I, 裸DOM]: 起点とするノードオブジェクト。検索対象に含まれます。
	// capitalLetter [I, str]: 頭文字文字列。一文字である必要はありません。
	// stopId        [I, str]: 検索を停止するID(例: 'EDT_MasterLayer')
	// 返値 id [str]: 該当id文字列。もし該当なしならば、null
	var id = null;                       // 返値
	var targetDom = $(originNode);         // ターゲットのノードを jquery オブジェクト化
	var capitalLen = capitalLetter.length; // 頭文字列の長さ
	for (var i = 0; i < LIM_DOM_SEARCH; i++) { // ------ 親DOM探索ループ
		targetId = targetDom.attr('id');                    // ターゲットの ID 取得
		if ( targetId != undefined ) { // ------------------------ id があるなら
			if (targetId == stopId) break;                      // 検索停止。
			var targetCapital = targetId.substr(0, capitalLen); // id の頭文字列切り出し
			if (targetCapital == capitalLetter) { // ---------------- 頭文字列が一致したら、
				id = targetId;                                     // 記録して
				break;                                             // ループ中断
			};
		}
		targetDom = targetDom.parent();                    // 親要素を、次のチェック対象にします。
	} // ----------------------------------------------- 親DOM探索ループ ここまで
	return(id);
}



/**
 * エディタペイン全体を再描画します。
 * @param index	描画するセクションのインデックス
 */
EditorPaneClass.prototype.RedrawEditorPane = function(index) {
	var renderer = ViewManager.getRenderer();
	if (index === null) {
		renderer.preserveEditorPaneClear();
	} else {
		if (renderer != null) renderer.render(index);
	}
};



// ------------- 指定した html ノードへキャレットを移動します。
EditorPaneClass.prototype.updateCaret = function() {
	// htmlNode [I, DOM(非JQ 生ノード)]:

//	var id = this.Caret.pos;
	var id = ViewManager.getCaret().pos;
//	var htmlNode = $('#EDT_MasterLayer #' + id);      // マスタレイヤを先祖にもつ子要素のうち、id が一致するもの
//	var htmlNode = $('#replaceObject #' + id);      // マスタレイヤを先祖にもつ子要素のうち、id が一致するもの
	var htmlNode = $( document.getElementById(id) );

//	var parPos       = $('#ID_EditorPage').offset(); // 親div の座標情報　　　を取得します。
//	var parPos       = $(this.editorNode).offset(); // 親div の座標情報　　　を取得します。
	var parPos       = $('#' + this.parentDivId).offset(); // 親div の座標情報　　　を取得します。
	var pos          = htmlNode.offset();         // 指定ノードの座標情報　を取得します。
	var textVal      = htmlNode.text();           // 指定ノードのテキスト値を取得します。
	var targetWidth  = htmlNode.width();          // 指定ノードの横幅を取得します。
	var targetHeight = htmlNode.height();         // 指定ノードの高さを取得します。

	if (pos === void 0) {
	    return;
	}

	// フォント周りのパラメータ取得
	var targetFontSize   = htmlNode.css('font-size');
	var targetFontFamily = htmlNode.css('font-family');
	var targetFont = htmlNode.css('font');

	var newTop  = pos.top  - 2;       // 新 Y 座標算出
	var newLeft = pos.left - 2;       // 新 X 座標算出

	var jqFrontTextBox  = $('#EDT_FrontTextBox' ); // 前面テキストボックス　　のjqueryオブジェクト
	var jqFrontTextMask = $('#EDT_FrontTextMask'); // テキストボックス用マスクのjqueryオブジェクト
	var jqHiddenTextBox = $('#EDT_HiddenTextBox'); // テキストボックス用マスクのjqueryオブジェクト

	// テキストボックスの位置を変更する
	jqFrontTextBox.css('top' , newTop );
	jqFrontTextBox.css('left', newLeft);

	// FronTextBox へ フォーカスをあてる
//	$('#EDT_FrontTextBox').focus();    // FrontTextBoxにフォーカスを移します。
	this.FocusFrontTextBox();
};


// ------------- フロントテキストボックスをフォーカスします。
EditorPaneClass.prototype.FocusFrontTextBox = function() {
	$('#EDT_FrontTextBox').focus();
};

// ------------- フロントテキストボックスの表示位置を取得します。
EditorPaneClass.prototype.GetFrontTextBoxPos = function() {
	var parPos  = $('#ID_EditorPage').offset();    // 親div の座標情報　　　を取得します。
	var pos     = $('#EDT_FrontTextBox').offset(); // 指定ノードの座標情報　を取得します。
	var newTop  = pos.top  - parPos.top  - 2;      // 新 Y 座標算出
	var newLeft = pos.left - parPos.left - 2;      // 新 X 座標算出
	return( {'top' : newTop, 'left' : newLeft} );
};

// ------------- 入力文字列の表示をクリアします。
EditorPaneClass.prototype.clearInputElements = function() {
	// 入力文字列の表示をクリア
	$('#EDT_FrontTextBox' ).val('');               // FrontTextBox 内の文字列をクリア
	$('#EDT_FrontTextMask').text('');              // span         内の文字列をクリア
}



// ------------- 画像の挿入
EditorPaneClass.prototype.InsertImage = function() {
	// ---- ダイアログ表示
//	Dialog_SaveAs
	$('#Dialog_InsertImage').dialog({
		modal:     true,  // モーダルダイアログ。
		draggable: false, // ドラッグによる位置変更を許可しない。
		resizable: false, // サイズ変更を許可しない。
	});
}


// 画像リサイズ用の矩形を表示する関数のモックです
EditorPaneClass.adjustResizingRectPosition = function() {
};