/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_common.js                                       */
/* -                                                                         */
/* -    概      要     ： ツールバーユーティリティークラス                   */
/* -                                                                         */
/* -    依      存     ： ToolBar.html, TB_common.css, TB_menuBar.ls         */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年04月28日                         */

/* =================== ツールバークラス 命名規則 (暫定) ==================== */
/* TBC_ : Tool Bar Common    : 全クラス共通                                  */
/* MB_  : MenuBar            : メニューバー                                  */
/* MT_  : Main   Toolbar     : メインツールバー（大アイコン表示）            */
/* IT_  : Index  Toolbar     : インデックス操作用ツールバー（小アイコン表示）*/
/* ET_  : Editor Toolbar     : エディタ部用ツールバー（小アイコン表示）      */
/* ST_  : Section Title bar  : セクションタイトルバー（小アイコン表示）      */
/* ※HTMLタグIDは、上記接頭文字から始めます。                                */
/* ※CSS classは、cl_ の後、上記接頭文字を続ける形とします。                 */
/*========================================================================== */

/* ===================== ツールバークラス 基本方針 ========================= */
/* ・アイコンの disable/enable 状態及び、チェックマークの状態は、            */
/*   当モジュール内では管理しません。                                        */
/* ========================================================================= */

// ------------- 視覚効果のスタイル文字列を定義します。
const TBC_CMN_COL_TRANSPARENT = 'transparent';              // 透明色指定
const TBC_HL_BORDER_BASE_STR  = '1px solid ';               // ハイライト用枠線の種類
const TBC_HL_BORDER_COL       = 'rgba(0, 100, 255, 0.70)';  // ハイライトON時の枠線の色
const TBC_HL_BACK_COL_LIGHT   = 'rgba(0, 255, 255, 0.15)';  // マウスオーバー時のハイライトON背景色
const TBC_HL_BACK_COL_DARK    = 'rgba(0, 255, 255, 0.50)';  // アイコンクリック時の濃いハイライトON背景色

// ------------- キーボード関連の定数を定義します。
const TBC_KEY_ESC    = 27;	// キーコード: ESC


// *************************************************************
// **            ツールバーユーティリティークラス             **
// **                ツールバー類の共通機能群                 **
// *************************************************************
function ToolbarUtilityClass() {};



// ============================= プロパティ設定 =============================

ToolbarUtilityClass.ShownDropMenuID = '';      // 表示されているコンテキストメニューのulタグID
// マウスダウンの時、メニューの非表示はドキュメントでは行わないためのフラグ
ToolbarUtilityClass.is_down_menu    = false;
ToolbarUtilityClass.DocumentObj     = null;    // データクラスのドキュメントオブジェクトです。



// ============================= 初期化処理 =============================

// ------------- ツールバーユーティリティークラスの初期化処理を行います。
ToolbarUtilityClass.Init = function() {
	this.SetCommonEvent();       // 共通のイベント処理を登録します。
	                             // ※上記関数は、何よりも最初に実行しておくべき処理も含んでいます。
	this.SetHoverFunc();         // アイコンの hover 動作を設定します。
	this.SetIconPushHighlight(); // アイコン押下の動作を設定します。
	this.PrevToolDrug();         // ツール類のドラッグを禁止します。
	this.SetResizeEvent();       // クライアント領域のサイズ変更イベントに対する設定を行います。
	                             // load 時にも呼ばれます。
}



// ============================= 最優先される共通処理 =============================

ToolbarUtilityClass.SetCommonEvent = function() {

	$(document).on({
		'mousedown': function (evt) {	// マウス押下時の動作
			// ------------- コンテキストメニューの自動非表示: document側の処理を記述します。
			// コンテキストメニュー以外の場所でマウスクリックが行われたときに、
			// コンテキストメニューを非表示にする機能です。
			// この処理は、jQuery ui へメニューを登録するよりも前に、実行しておかなければなりません。
//			evt.preventDefault();
//			if (!ToolbarUtilityClass.is_down_menu) {
//				// メニューバーのチェック消去等の処理もまとめて、コンテキストメニューを非表示にします。
//				ToolbarUtilityClass.HideContextWithRelatedFunctions();
//			}
//			ToolbarUtilityClass.is_down_menu = false;
			ToolbarUtilityClass.AutoHideContext(evt);
		},
		'keydown': function (evt) {

			// 工事中

		}
	});

}

ToolbarUtilityClass.AutoHideContext = function(evt) {
	if (!ToolbarUtilityClass.is_down_menu) {
		// メニューバーのチェック消去等の処理もまとめて、コンテキストメニューを非表示にします。
		ToolbarUtilityClass.HideContextWithRelatedFunctions();
	}
	ToolbarUtilityClass.is_down_menu = false;

	ViewManager.getEditorPane().FocusFrontTextBox(evt);

}



// ------------- 画面サイズ変更イベントに対する処理を登録します。
ToolbarUtilityClass.SetResizeEvent = function() {

	$(window).on('load resize', function(){

		// サイズが可変の領域に対して、サイズを自動指定します。
		ToolbarUtilityClass.WindowResize();
		/* 処理を記載 */
	});
}

// ------------- 画面サイズ変更イベント発生時に行うサイズ再設定処理です。
ToolbarUtilityClass.WindowResize = function() {
	// 縦方向の % 指定されていた部品を px でサイズを指定します
	var appAreaHeight = document.body.offsetHeight - 102;
	if (appAreaHeight < 200) appAreaHeight = 200;
	appArea.style.height = appAreaHeight + 'px';
	ID_EditorPage.style.height = (appAreaHeight - 10) + 'px';

	var curHeight    = $('#ID_EditorPage' ).height(); // 大枠 div の高さを取得します。
	var headerHeight = $('#ID_ToolHeader' ).height(); // メニューバー + ツールバー 20px + 32px = 52px
	var footerHeight = $('#SB_MasterLayer').height(); // ステータスバー 24px

	// インデックス部とエディタ部を統合しているdivへ設定する高さを算出
	var targetHeight = curHeight - (headerHeight + footerHeight) - 32;

	// ------ インデックスエリア
	// インデックス部とエディタ部を統合しているdivへ、高さを設定
	$('#ID_MainOpeDiv').height(targetHeight);

	// インデックス部へ、高さを設定
	var indexOpeAreaHeight = targetHeight + 24;
	$('#IndexOpeArea').height(indexOpeAreaHeight);

	var indexToolHeight = $('#IT_MasterLayer').height();  // インデックスツールの高さ
	var indexTreeHeight = targetHeight;                   // インデックスツリー部へ設定する高さを算出
	$('#IDT_MasterLayer').height(indexTreeHeight);        // インデックスツリー部へ高さを設定

	// ------ エディタエリア
	var editorHeight = targetHeight - 24
	$('#EDT_MasterLayer').height(editorHeight - 16);        // エディタペーンへ高さを設定
	var indexWidth   = $('#IDT_MasterLayer').width();
	var mainOpeWidth = $('#ID_MainOpeDiv'  ).width();
	var editorWidth  = mainOpeWidth - indexWidth - 10;
	$('#EDT_MasterLayer').width(editorWidth);          // エディタペーンへ幅を設定
//	$('#EDT_MasterLayer').css('background', '#FFFF00');

    // 画像リサイズ用の矩形の位置を対象の画像に合わせます。
    EditorPaneClass.adjustResizingRectPosition();

    // カーソルを追従させます
    ViewManager.getEditorPane().updateCaret();

	console.log(
		'curHeight:'      + curHeight,
		'headerHeight:'   + headerHeight,
		'footerHeight:'   + footerHeight,
		'targetHeight'    + targetHeight,
		'indexToolHeight' + indexToolHeight,
		'indexTreeHeight' + indexTreeHeight);

	console.log(
		'indexWidth:'   + indexWidth,
		'mainOpeWidth:' + mainOpeWidth,
		'editorWidth:'  + editorWidth);
}

// ============================= 画像のDnD =============================

// ---- 画像 DnD 対応：DragOver 禁止
ToolbarUtilityClass.onDragOver = function(event) {
	event.preventDefault();
};

// ---- 画像 DnD 処理
ToolbarUtilityClass.onDrop = function(event) {
	// テキストモード以外への画像貼り付けを禁止する場合。
	// ---- キャレット位置のノードを取得します。
	var section   = DocumentManager.getCurrentSection(); // 現在のセクションを取得します。
	var caretPos  = ViewManager.getEditorPane().getCaret().pos;
	var caretNode = $(section).find('#' + caretPos)[0];
	if (caretNode !== null) {
		var parentNode = caretNode.parentNode;
		DataClass.bindDataClassMethods(parentNode); // doop
		if (parentNode.nt != CIO_XML_TYPE.text) { // ---- 親がテキストモードでなければ
			alert('数式・化学式の添字や行列へ画像を挿入することはできません。');
			event.preventDefault();
			return;
		}
	}

	var dropData = event.dataTransfer;
	if (dropData.files.length > 0) {
		var file = dropData.files[0];
		var reader = new FileReader();

		//dataURL形式でファイルを読み込む
		reader.readAsDataURL(file);

		//ファイルの読込が終了した時の処理
		reader.onload = function(){
			var dataUrl = reader.result;
			var dataType = reader.result.split('/');
			if (dataType[0] == 'data:image') {
				// 画像挿入。
				UiCommandWrapper.insertImage(dataUrl);
				ViewManager.getRenderer().update();
			}
		};
	} else {
		var text = event.dataTransfer.getData("text/plain");
//		drop.innerHTML = text;
	}
	event.preventDefault();
};


// ============================= マウス・キーボードの動作 =============================

// ------------- アイコンの hover 動作を設定します。
ToolbarUtilityClass.SetHoverFunc = function() {
// hoverに関しては、on メソッドを用いるよりも、hoverメソッドのほうがわかりやすい
// コードとなるため、あえて on メソッドを使用していません。
// on を用いる場合は、'mouseenter' と 'mouseleave' を用いることになります。
	$('.cl_TBC_Main_Highlight').hover( function () {  // ---------- hover状態時
		// ------------- 該当アイコンが disable なら何もしません。
		if ( $(this).css('z-index') == -10) return;
		// ------------- 枠線色とハイライト色を変更: 水色
		$(this).css('border',
			TBC_HL_BORDER_BASE_STR + TBC_HL_BORDER_COL);
		$(this).css('background-color', TBC_HL_BACK_COL_LIGHT);
	}, function () {  // ------------------------------------------- hover解除時
		// ------------- 枠線とハイライト表示を解除: 透明指定
		$(this).css('border',
			TBC_HL_BORDER_BASE_STR + TBC_CMN_COL_TRANSPARENT);
		$(this).css('background-color', TBC_CMN_COL_TRANSPARENT);
	});
}

// ------------- アイコン押下の動作を設定します。
ToolbarUtilityClass.SetIconPushHighlight = function() {
	// アイコン押下時: ハイライトが濃くなります。
	// アイコン解放時: ハイライトが元に戻ります。
	var preObj;
	$('.cl_TBC_DarkHighlight').on({
		'mousedown': function (evt) {
			$(this).css('background-color', TBC_HL_BACK_COL_DARK);
			preObj = this;
			// マウス解放イベントによる関数再入時のthisは、
			// ターゲットのアイコンを指しているとは限らないため、
			// ここでthisオブジェクトを保存します。
		},
		'mouseup mouseleave': function (evt) {
			$(preObj).css('background-color', TBC_CMN_COL_TRANSPARENT);
		}
	});
}

// ------------- ツール類のドラッグを禁止します。
ToolbarUtilityClass.PrevToolDrug = function() {
	$('.cl_TBC_PrevDrag').on({
		'mousedown': function (evt) {
			evt.preventDefault();	// ドラッグ防止
		},
		'mouseup':   function (evt) {
			evt.preventDefault();	// ドラッグ防止
		}
	});
}



// =============================== アイコン動作 ===============================

// ------------- アイコンの disable / enable を変更します。
ToolbarUtilityClass.setIconAttr = function(iconID, iconStat) {
	// iconID   [I, str]: アイコン用divタグのID
	// iconStat [I, str]: アイコンの状態
	//                    true = enable, false = disable
	var zIndexVal = iconStat ? 12 : 10;
	// 表示状態変更
	$('#' + iconID).css('z-index', zIndexVal.toString());
}

// ------------- アイコンのチェック状態を変更します。
ToolbarUtilityClass.setIconCheck = function(checkMarkID, iconStat) {
	// checkMarkID [I, str]: アイコンチェックマーク用divタグのID
	// iconStat    [I, str]: アイコンの状態
	//                       true = チェックON, false = チェックOFF
	var checkBorderColor = TBC_CMN_COL_TRANSPARENT;
	var checkBackColor   = TBC_CMN_COL_TRANSPARENT;
	if (iconStat) {
		checkBorderColor = TBC_HL_BORDER_COL;
		checkBackColor   = TBC_HL_BACK_COL_DARK;
	}
	checkBorderColor = TBC_HL_BORDER_BASE_STR + checkBorderColor;
	// 表示状態変更
	$('#' + checkMarkID).css('border', checkBorderColor);
	$('#' + checkMarkID).css('background-color', checkBackColor);
}

// ------------- メニューのチェック状態を変更します。
ToolbarUtilityClass.setMenuCheck = function(checkMarkID, menuStat) {
	// checkMarkID [I, str]: メニューチェックマーク用 div タグの ID
	// menuStat    [I, str]: メニューの状態
	//                       true = チェックON, false = チェックOFF
	var checkBorderColor = TBC_CMN_COL_TRANSPARENT; // チェックマーク用枠線色
	if (menuStat) { // チェック on なら
		checkBorderColor = 'black'; // 黒枠にします。
	}
	checkBorderColor = TBC_HL_BORDER_BASE_STR + checkBorderColor;
	// 表示状態変更
	$('[id^=' + checkMarkID + ']').css('border', checkBorderColor);
}



// =============================== コンテキストメニュー ===============================

// ------------- コンテキストメニューを登録
// 使用するコンテキストメニューを、ここで登録します。
// 全てのドキュメントが読み込まれた後に呼び出してください。
ToolbarUtilityClass.RegistContextMenu = function(menuHashObj) {
	// menuHashObj [I, 連想配列1 {'コンテキストメニューの ulタグID' : 連想配列2 {～} } ]
	// ・連想配列1のハッシュキーにコンテキストメニューの ulタグID (文字列) がセットされている必要があります。
	// ・この機能が呼ばれる時点では、連想配列1の参照先は空オブジェクトでも問題はありませんが、事前に
	//   'iconID'ハッシュキーを持った連想配列2への参照を持たせておくことをお勧めします。

	// 各コンテキストメニューを jquery ui へ menu オブジェクトとして登録します。
	for (var menuID in menuHashObj) {
		ToolbarUtilityClass.SetDropMenu(menuID);
	}
}

// コンテキストメニュー上で
ToolbarUtilityClass.MenuMovableFlags = { 'left' : true, 'right' : true };

// ------------- コンテキストメニューを jQuery-uiへ 登録します。
// ドキュメントがすべて読み込まれてから実行してください。
// なお、関連する機能が、ToolbarUtilityClass.SetCommonEvent() にもあります。
// 必ず、ToolbarUtilityClass.SetCommonEvent() が先に実行されているようにしてください。
// ToolbarUtilityClass.SetCommonEvent()は、ドキュメント読み込み後、一回だけ実行されていれば
// 問題ありません。
ToolbarUtilityClass.SetDropMenu = function(dropdownID) {
	// dropdownID [I, str]: ドロップダウン用ulタグのID
	var jqSelector = $('#' + dropdownID);

	// ------------- コンテキストメニューを jQuery-ui へ追加します。
	jqSelector.menu({
		'select': function(evt, ui) {

			evt.stopPropagation();
			// 選択された要素がulタグを持っているなら(サブメニューを持っているなら)
			// コンテキストメニューを非表示にしません。
			// それ以外なら非表示にします。
			if ( $(ui.item).children('ul').length <= 0 ) {
				// ulタグを持っていない(サブメニューを持っていない)なら
				// メニューバーのチェック消去等の処理もまとめて、コンテキストメニューを非表示にします。

				ToolbarUtilityClass.HideContextWithRelatedFunctions();

				// ---- 指定されたメニューの機能を呼び出します。
				//var tempStr = ui.item.attr( 'id' );
				var evalStr = ui.item.attr('func');
				eval(evalStr);

				if (evalStr.indexOf('AssistHandler.insert') == 0) {
				    ConfigManager.instance.addRecentSymbol(ui.item.attr('id'));
				    PopupMenu.refreshRClick();
				}
			}
		},
		'focus': function(evt, ui) {
			ToolbarUtilityClass.ClearMenuMovableFlags();
		}
	});
	jqSelector.hide();

	// ------------- コンテキストメニューの自動非表示: コンテキストメニュー側の処理を記述します。
	jqSelector.on({
		'mousedown': function (evt, ui) {	// マウス押下時の動作
			ToolbarUtilityClass.is_down_menu = true;
		},
		'keydown': function (evt, ui) {
			// ESCキーでコンテキストメニューを非表示にします。
			switch (evt.keyCode) {
				case TBC_KEY_ESC:
					// メニューバーのチェック消去等の処理もまとめて、コンテキストメニューを非表示にします。
					ToolbarUtilityClass.HideContextWithRelatedFunctions();
					break;
			}
		}
	});
}


// ------------- コンテキストメニューへのキーボード操作でメインメニュー項目を移動できるか示すフラグを
// クリアします。
ToolbarUtilityClass.ClearMenuMovableFlags = function() {
	ToolbarUtilityClass.MenuMovableFlags['left']  = true;
	ToolbarUtilityClass.MenuMovableFlags['right'] = true;
}


// ------------- コンテキストメニューが非表示にされるときの代表的な処理も実行します。
// コンテキストメニュー表示時、ESC、Altやメニュー外クリックが行われると、
// メニューバー側でも必要な処理が発生するため、まとめて実行します。
ToolbarUtilityClass.HideContextWithRelatedFunctions = function() {
	MenuBarClass.ClearMenuCheck();       // メニュー選択のチェックを全てクリアします。
	ToolbarUtilityClass.HideDropMenu();  // コンテキストメニューを非表示にします。
//	$('#MB_Overall').blur();	// メニューバーからフォーカスを外します。
	$(document.activeElement).blur();
}

// ------------- コンテキストメニューを表示します。
ToolbarUtilityClass.ShowContextMenu = function(menuID, dropMenuPosArr) {
	// menuD   [I, str]: コンテキストメニュー用ulタグのID
	ToolbarUtilityClass.HideDropMenu();	// 既に表示されているコンテキストメニューがあれば非表示にします。
	ToolbarUtilityClass.ClearMenuMovableFlags();
	ToolbarUtilityClass.ShownDropMenuID = menuID;  // 表示するコンテキストメニューのulタグIDを記録します。
	$('#' + menuID).show();
	$('#' + menuID).offset(dropMenuPosArr);
	$('#' + menuID).focus();
}

// ------------- コンテキストメニューを非表示にします。
ToolbarUtilityClass.HideDropMenu = function() {
	var menuID_register = ToolbarUtilityClass.ShownDropMenuID;  // 表示されているコンテキストメニューのulタグIDを取得します。
	if (menuID_register != '') {  // 何らかのコンテキストメニューが現在表示されているなら
		$('#' + menuID_register).hide();  // 該当コンテキストメニューを非表示にします。
		ToolbarUtilityClass.ShownDropMenuID = '';
		ToolbarUtilityClass.ClearMenuMovableFlags();
	}
}

// ------------- コンテキストメニューを表示すべき座標を取得します。
ToolbarUtilityClass.GetDropMenuPosition = function(masterLayerID, iconID) {
//
	// masterLayerID [I, str]: マスターレイヤ用divタグのID（相対座標）
	// iconID        [I, str]: 位置の基準とするアイコン用divタグのID（相対座標）
	// 返値        [連想配列]: { top : Y座標, left : X座標 }（絶対座標）
	var masterTop  = $('#' + masterLayerID).position().top;
	var masterLeft = $('#' + masterLayerID).position().left;
//	var iconTop    = $('#' + iconID).position().top;
//	var iconLeft   = $('#' + iconID).position().left;
	var iconTop    = $('#' + iconID).offset().top;
	var iconLeft   = $('#' + iconID).offset().left;
	var iconHeight = $('#' + iconID).get(0).offsetHeight;
//	var dropTop    = masterTop  + iconTop + iconHeight;
//	var dropLeft   = masterLeft + iconLeft;
	var dropTop    = iconTop + iconHeight;
	var dropLeft   = iconLeft;
	return({top : dropTop, left : dropLeft});
}

