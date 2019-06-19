/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： TB_indexTool.js                                    */
/* -                                                                         */
/* -    概      要     ： インデックス操作クラス                             */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年12月11日                         */

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

/* 外部インターフェース一覧
	IndexToolClass.sectionIndexReady(); // セクション情報が使用可能になったとき外部から呼び出されます。


*/


// ============================= 定数 =============================
const IDT_SECTION_ID_HEADER = 'IDT_SEC_';   // セクション用 div の ID の接頭語
                                            // DOMのID名に数値のみを使用するとjQueryのセレクタで問題が起きるため

// *************************************************************
// **                 インデックス操作クラス                  **
// *************************************************************
function IndexToolClass() {}



// ============================= プロパティ設定 =============================
// セクションツリー表示用ひな形DOMへの参照用オブジェクト
IndexToolClass.SectionDOM  = null;           // 1セクション分のひな形 div DOM
IndexToolClass.IndexDivDOM = null;           // インデックス深度用 div(空div) DOM
IndexToolClass.SupIconDOM  = { 'VerticalConnect' : null, // 「├」
                                          'Hook' : null, // 「└」
                               'VerticalLine'    : null  // 「│」
                             };              // 罫線アイコンDOMの配列
IndexToolClass.MainIconDOM = [];             // セクションアイコンDOMの配列
IndexToolClass.SelectedSectionArray = [0];    // 選択されているセクション のインデックスの配列
IndexToolClass.sectionRangeStart = null;     // 連続範囲選択時の起点のセクションインデックス
IndexToolClass.LatestSectionIndex = 0;       // 直近に選択されたセクションのセクションインデックス



// ======================== 初期化処理 ========================

IndexToolClass.Init = function() {
	// デフォルトのインデックスツリー用DOMをコピーします。
	IndexToolClass.SectionDOM                 = $('#IDT_DefaultSection').clone(true);          // 1セクション分のひな形div
	IndexToolClass.IndexDivDOM                = $('#IDT_IndexDepth').clone(true);              // インデックス深度用div(空div)
	IndexToolClass.SupIconDOM['VerticalConnect'] = $('#IDT_IndexRuling_VerticalConnect').clone(true);  // 「├」
	IndexToolClass.SupIconDOM['Hook'           ] = $('#IDT_IndexRuling_Hook').clone(true);             // 「└」
	IndexToolClass.SupIconDOM['VerticalLine'   ] = $('#IDT_IndexRuling_VerticalLine').clone(true);     // 「│」
	IndexToolClass.MainIconDOM[0]             = $('#IDT_IndexBubble_0').clone(true);                // ファイルマーク
	IndexToolClass.MainIconDOM[1]             = $('#IDT_IndexBubble_1').clone(true);                // 黄緑玉
	IndexToolClass.MainIconDOM[2]             = $('#IDT_IndexBubble_2').clone(true);                // 赤玉
	IndexToolClass.MainIconDOM[3]             = $('#IDT_IndexBubble_3').clone(true);                // 黄玉
	IndexToolClass.MainIconDOM[4]             = $('#IDT_IndexBubble_4').clone(true);                // 水玉
	IndexToolClass.MainIconDOM[5]             = $('#IDT_IndexBubble_5').clone(true);                // 橙玉
	IndexToolClass.MainIconDOM[6]             = $('#IDT_IndexBubble_6').clone(true);                // 桃玉
	IndexToolClass.MainIconDOM[7]             = $('#IDT_IndexBubble_7').clone(true);                // 深緑玉
	IndexToolClass.MainIconDOM[8]             = $('#IDT_IndexBubble_8').clone(true);                // 紫玉

	IndexToolClass.SetEvents();		// インデックス操作用のイベントを登録します。
//	IndexToolClass.RedrawSection(null);	// インデックス再描画

	IndexToolClass.SetRightClick();           // 右クリックコンテキストメニューを表示
//	IDT_MasterLayer.addEventListener('keydown',          KeyEventHandler.onKeyDown);
//	IDT_MasterLayer.addEventListener('keyup',            KeyEventHandler.onKeyUp);

}

// ---- 右クリック：コンテキストメニュー
IndexToolClass.SetRightClick = function() {

	// ---- 右クリック：コンテキストメニュー
	$('#IDT_MasterLayer').on('contextmenu', function (evt){
		console.log('セクションペーンで右クリック');

		IndexToolClass.RightClick(this, evt);

		evt.preventDefault();
	});
};



// ---- コンテキストメニューを表示します。
IndexToolClass.RightClick = function(obj, evt) {
	var posArr = {'top' : evt.clientY, 'left' : evt.clientX};

	// ポップアップメニューのサイズと位置、ウィンドウサイズから、位置の補正を行います
	var jmenu = $('#MB_Index_ConMenu');
	var height = jmenu.height();
	var docHeight = document.documentElement.clientHeight;
	if ((posArr.top + height) > docHeight) posArr.top = docHeight - height;

	ToolbarUtilityClass.ShowContextMenu('MB_Index_ConMenu', posArr);
};



// ------------- インデックス操作用のイベントを登録します。
IndexToolClass.SetEvents = function() {


	// ---- 値の変更によるセクションタイトル反映
    $('#ST_SectionTitleBar').on('change', function() {
        IndexToolClass.updateSectionTitle();
    });
    // リアルタイムなセクション
    $('#ST_SectionTitleBar')[0].addEventListener('input', function() {
        //IndexToolClass.updateSectionTitle();
        // インデックスペインの表示のみ更新します
        IndexEventHandler.onChangeSectionTitle();
    });

	// セクションインデックス上でのクリックによるセクション選択
	$('#IDT_MasterLayer').on('mousedown', 'div.cl_IDT_Section', function (event) {
		// ---- クリックされたセクションを選択状態にします。
		if (event.button == 0) {
			IndexToolClass.clickSectionItem(this, event);
			$('#IDT_MasterLayer').focus();
			event.preventDefault();
			event.stopPropagation();
		}
	});

	// セクションインデックス上でのキー操作によるセクション選択
	$('#IDT_MasterLayer').on('keydown', function (event) {
		// ----キーボード入力によりセクション操作を行います。
		var cursorKeyFlag = IndexToolClass.keyOpeSectionItem(event);
		if (cursorKeyFlag) event.preventDefault();
	});

}

// ---- クリックによるセクション選択
IndexToolClass.clickSectionItem = function(obj, event) {
	// セクションのインデックスを取得
	// ※ DOMに対する ID が数値のみだと、jQueryのセレクタ動作で不具合を起こすため、接頭文字列がついています。
	var sectionIndex = $(obj).attr('id').substr(IDT_SECTION_ID_HEADER.length);
	// 数値へ変換します。
	sectionIndex = Number(sectionIndex);
	// セクションタイトルに変更があれば、先にタイトル変更を行います。
	IndexToolClass.updateSectionTitle();
	// セクションを選択します。
	var cursorKeyFlag = IndexToolClass.SelectSection(sectionIndex, event.shiftKey, event.ctrlKey);
	// セクションの選択状態を反映します。
	IndexToolClass.HilightSection();
	// 選択されたセクションの タイトル を、セクションタイトルバーへ反映します。
	IndexToolClass.ReadySectionTitle();
	// エディタペイン再描画
    ViewManager.getRenderer().setUpdateEditorPane();
	Renderer.updateStyleClass();
	ViewManager.getRenderer().update();

	// キャレットの表示を更新します
	var editorPane = ViewManager.getEditorPane();
	if (editorPane.scrollManager) {
		editorPane.scrollManager.SetFocusNode(editorPane.getCaret().pos);
		editorPane.scrollManager.ScrollToFocusNode();
	}

	// 読み上げ中であれば、読み上げを停止します
	ReadManager.instance.stopReading();

	return cursorKeyFlag;
};


// ---- セクションインデックス上でのキー操作によるセクション選択
IndexToolClass.keyOpeSectionItem = function(event) {
	// ショートカットを実行します
	// 該当するショートカットを検出・実行した場合、true 返しで終了します
	if (IndexPaneShortcutHandler.onKeyDown(event)) return true;

	var redrawFlag   = false;                                     // 再描画が必要か？
	var localKeyCode = event.keyCode;                             // キーコード
	var direction    = null;                                      // 移動方向
	if (localKeyCode == 38 || localKeyCode == 37) direction = -1; // 上か左キーなら、上移動 (-1)
	if (localKeyCode == 40 || localKeyCode == 39) direction =  1; // 下か右キーなら、下移動 (+1)
	if (direction === null) return false;                         // 矢印キーでなければ false 返しで抜けます。

	// Mac では Ctrl→Commandキー
	var isCtrl = event.ctrlKey;
    if (KeyEventHandler.isMac()) isCtrl = event.metaKey;

	// ---- キー判定による処理分け
	if (event.shiftKey || isCtrl) {                        // ---- Shift キーや Ctrl キーが押下されていれば
		if (isCtrl) {                                              // ---- Ctrl キーなら
			if (localKeyCode == 37 || localKeyCode == 39) {                       // ---- 左右キーなら
				IndexEventHandler.onClickShift(direction);                                // レベルシフト
				return true;
			} else {                                                              // ---- 上下キーなら
				IndexEventHandler.onClickMove(direction);                                 // 位置上下移動
				return true;
			}
		} else {                                                          // ---- Shift キーなら
			redrawFlag = IndexToolClass.selectSectionWithShift(direction);        // Shift 範囲選択
		}
	} else {                                                      // ---- 修飾キー入力がなければ
		redrawFlag = IndexToolClass.moveSectionWithKey(direction);        // カレントセクション変更処理
	}
	if (!redrawFlag) return true;                                 // 再描画が不要なら true 返しで return します。

	// ---- 再描画処理
	IndexToolClass.HilightSection();                              // セクションの選択状態を反映します。
	IndexToolClass.ReadySectionTitle();                           // タイトルをセクションタイトルバーへ反映します。
    ViewManager.getRenderer().setUpdateEditorPane();
    ViewManager.getRenderer().preventEditorFocus();
	ViewManager.getRenderer().update();                           // エディタペイン再描画

	// キャレットの表示を更新します
	var editorPane = ViewManager.getEditorPane();
	if (editorPane.scrollManager) {
		editorPane.scrollManager.SetFocusNode(editorPane.getCaret().pos);
		editorPane.scrollManager.ScrollToFocusNode();
	}

	// 読み上げ中であれば、読み上げを停止します
	ReadManager.instance.stopReading();

	return true;
};

// ---- Shift キーと矢印キーによる範囲選択
IndexToolClass.selectSectionWithShift = function(direction) {
	// direction [数値]: -1 or +1 。-1 = 上選択、+1 = 下選択
	var secInfoList         = DocumentManager.getSectionInfoList();
	var finalSectionIndex   = secInfoList.length - 1;
	var currentSectionIndex = IndexToolClass.getLatestSectionIndex();

	// ---- レンジチェック
	if (direction < 0 && currentSectionIndex <= 0)                 return false;
	if (direction > 0 && currentSectionIndex >= finalSectionIndex) return false;

	var newIndex = currentSectionIndex + direction;                 // 移動先インデックス
	IndexToolClass.selectWithShiftKey(newIndex);                    // 範囲選択
	IndexToolClass.setLatestSectionIndex(newIndex);                 // カレントセクション設定

	return true;
};

IndexToolClass.selectWithShiftKey = function(sectionIndex) {
	// ---- 範囲選択の基準点を取得
	if (IndexToolClass.sectionRangeStart === null) {                // 範囲選択の基準点が設定されていなければ
		 // 最後に選択したインデックスを、範囲選択の基準点とします。
		IndexToolClass.sectionRangeStart = IndexToolClass.getLatestSectionIndex();
	}

	// ---- 選択順序決定
	var selectedSectionCount = sectionIndex - IndexToolClass.sectionRangeStart; // 選択セクション数 - 1
	var incNum = selectedSectionCount >= 0 ? 1 : -1;                // 選択順序算出
	selectedSectionCount = selectedSectionCount * incNum + 1;       // 選択セクション数を絶対値へ
	IndexToolClass.SelectedSectionArray = [];                       // 選択済みセクション配列をクリア
	var baseIndex = IndexToolClass.sectionRangeStart;               // 選択起点インデックスを取得
	for (var i = 0; i < selectedSectionCount; i++) {                // ---- 選択セクション数分ループ
		IndexToolClass.SelectedSectionArray.push(baseIndex + incNum * i);   // 選択範囲を追加
	}
};


// ---- カレントセクション変更処理
IndexToolClass.moveSectionWithKey = function(direction) {
	// direction [数値]: -1 or +1 。-1 = 上選択、+1 = 下選択
	var secInfoList         = DocumentManager.getSectionInfoList();
	var finalSectionIndex   = secInfoList.length - 1;
	var currentSectionIndex = IndexToolClass.getLatestSectionIndex();

	// 範囲選択の基準点をクリアします。
	IndexToolClass.sectionRangeStart = null;

	// ---- レンジチェック
	if (direction < 0 && currentSectionIndex <= 0)                 return false;
	if (direction > 0 && currentSectionIndex >= finalSectionIndex) return false;

	// ------ セクションインデックスの選択状態を設定します。
	currentSectionIndex += direction;                                     // カレントセクションインデックス変更
	IndexToolClass.setSelectedSectionIndex([currentSectionIndex]);        // 選択セクション設定
	IndexToolClass.setLatestSectionIndex(currentSectionIndex);            // カレントセクション設定

	return true;
};


/**
 * セクションインデックスを直接指定します
 * (類似メソッド２つを順次呼び出すことで実現できますが、その他の処理を含めたラッパです)
 */
IndexToolClass.moveSectionWithIndex = function(index) {
	// セクション情報リストを取得します
	var secInfoList         = DocumentManager.getSectionInfoList();

	// 範囲選択の基準点をクリアします。
	IndexToolClass.sectionRangeStart = null;

	// インデックスチェックを行います
	if ((index < 0) || (secInfoList.length <= index)) return false;

	// セクションインデックスの選択状態を設定します。
	IndexToolClass.setSelectedSectionIndex([index]);        // 選択セクション設定
	IndexToolClass.setLatestSectionIndex(index);            // カレントセクション設定

	return true;
};


// セクションタイトルに変更があれば、先にタイトル変更を行います。
IndexToolClass.updateSectionTitle = function() {
	var inputTitle          = IndexToolClass.getSectionTitleInput();  // セクションタイトル入力ボックス内の文字列取得
	var currentSectionIndex = IndexToolClass.getLatestSectionIndex(); // カレントセクションのインデックス番号取得
	if (currentSectionIndex === null) return; // カレントセクションが指定されていなければ return
	var sectionInfoList     = DocumentManager.getSectionInfoList();   // セクションインフォ取得
	var currentSectionTitle = sectionInfoList[currentSectionIndex].title;
	if (inputTitle != currentSectionTitle) IndexEventHandler.onBlurSectionTitle();
};


// ------------- 指定されたセクションを選択状態にします。
IndexToolClass.SelectSection = function(sectionIndex, shiftKeyFlag, ctrlKeyFlag) {
	// sectionIndex [str] : セクションインデックス
	// shiftKeyFlag [bool]: true = 複数 (範囲) 選択
	// ctrlKeyFlag  [bool]: true = 複数 (個別) 選択
	if (ctrlKeyFlag || shiftKeyFlag) {                      // ---- 複数選択が指示されているなら
		// ---- 複数選択
		if (ctrlKeyFlag) {                                          // ---- ctrl  キー: 個別複数選択
			var selectedSectionCount = IndexToolClass.SelectedSectionArray.length;
			var targetIndex = null;
			for (var i = 0; i < selectedSectionCount; i++) {                // ---- 選択済みセクション配列をループ
				if (IndexToolClass.SelectedSectionArray[i] == sectionIndex) {       // ---- すでに選択されていなら
					targetIndex = i;                                                        // インデックスを記録
					break;                                                                  // ループ中断
				}
			}
			if (targetIndex === null) {                                     // ---- 未選択なら
				IndexToolClass.SelectedSectionArray.push(sectionIndex);             // 選択インデックスを１つ追加
			} else {                                                        // ---- すでに選択されているなら
				IndexToolClass.SelectedSectionArray.splice(targetIndex, 1);         // 選択インデックスをリストから削除
			}
			IndexToolClass.sectionRangeStart = null;                        // 範囲選択の基準点をクリアします。
		}
		if (shiftKeyFlag) {                                         // ---- shift キー: 連続範囲選択
			// ---- 範囲選択の基準点を取得
			IndexToolClass.selectWithShiftKey(sectionIndex);
		}
	} else {                                                // ---- 単独選択なら
		IndexToolClass.SelectedSectionArray = [sectionIndex];       // インデックスを１つ選択
		IndexToolClass.sectionRangeStart    = null;                 // 範囲選択の基準点をクリアします。
	}
	// ---- 直近に選択されたインデックスの番号を保存します。
	IndexToolClass.setLatestSectionIndex(sectionIndex);
};



// ---- セクションの選択状態を画面へ反映します。
IndexToolClass.HilightSection = function() {
	var selectedSectionCount = IndexToolClass.SelectedSectionArray.length;
	var sectionInfoList      = DocumentManager.getSectionInfoList();
	var sectionCount         = sectionInfoList.length;
	var slectStatus          = [];

	// ---- セクションの選択 / 非選択状態を配列へ格納します。
	for (var i = 0; i < sectionCount; i++) {                    // ---- 総セクション数分ループ
		slectStatus[i] = false;                                         // 選択状態を false で初期化
	}
	for (var i = 0; i < selectedSectionCount; i++) {            // ---- 選択されているセクション数分ループ
		var localSectionIndex = IndexToolClass.SelectedSectionArray[i]; // 選択されているセクションだけ
		slectStatus[localSectionIndex]  = true;                         // 　 状態を true
	}

	// ---- セクションの選択 / 非選択状態を画面へ反映します。
	for (var i = 0; i < sectionCount; i++) {                    // ---- 総セクション数分ループ
		var backCol = 'white';                                          // 背景色デフォルト (非選択時) : 白
		var strCol  = 'black';                                          // 文字色デフォルト (非選択時) : 黒
		if (slectStatus[i]) {                                   // ---- 選択状態なら
			backCol = 'blue' ;                                          // 選択時の背景色 : 青
			strCol  = 'white';                                          // 選択時の文字色 : 白
		}
		// 該当要素をの jquery オブジェクト作成
		var $targetObj =
			$('div.cl_IDT_Section#' + IDT_SECTION_ID_HEADER + i, '#IDT_MasterLayer').children('div:last');
		$targetObj.css('background-color', backCol);            // 背景色セット
		$targetObj.css('color'           , strCol );            // 文字色セット
	}
};



// ---- 選択されたセクションのタイトルを、セクションタイトルバーへ反映します。
IndexToolClass.ReadySectionTitle = function() {
	var sectionInfoList = DocumentManager.getSectionInfoList();       // セクションインフォリスト
	var index           = IndexToolClass.getLatestSectionIndex();     // 最新の選択セクションが格納されている場所
	// データノードからセクションタイトルを持ってきます。
	if (index !== null)
	{
		$('#ST_SectionTitleBar').val(
			sectionInfoList[index].title
				.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
		);
	}
};



// ---- input の セクションのタイトル文字列を取得します。
IndexToolClass.getSectionTitleInput = function() {
	return $('#ST_SectionTitleBar').val()
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/ /g, '&nbsp;');
};

//---- セクションタイトルを設定します。inputタグも同時に変更します。
IndexToolClass.setSectionTitleInput = function(value) {
    var input = document.getElementById('ST_SectionTitleBar');
    if (input) {
        input.value = value
			.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
        IndexToolClass.updateSectionTitle();
    }
}


// ------ 選択されているセクションインデックスの配列を、新規生成のインスタンスとしてソートして返します。
IndexToolClass.getSelectedSectionIndex = function() {
	var indexCount = IndexToolClass.SelectedSectionArray.length;
	var indexArr   = new Array(indexCount);
	for (var i = 0; i < indexCount; i++) { indexArr[i] = IndexToolClass.SelectedSectionArray[i]; };
	// ---- ソートします。
	indexArr.sort( function(a,b) { // ---- 値の小さい順にソートします。
		if( a < b ) return  -1;
		if( a > b ) return   1;
		return 0;
	} );
	return indexArr;
};



// ------ もっとも最近選択されたセクションのインデックス番号を取得します。
IndexToolClass.getLatestSectionIndex = function() {
	return IndexToolClass.LatestSectionIndex;
};



// ------ もっとも最近選択されたセクションのインデックス番号を設定します。
IndexToolClass.setLatestSectionIndex = function(index) {
	IndexToolClass.LatestSectionIndex = index;
	DocumentManager.setCurrentSection(index);

	// 読み上げ中であれば、読み上げを停止します
	//ReadManager.instance.stopReading();
};



// ------ セクションインデックスの選択状態を設定します。
IndexToolClass.setSelectedSectionIndex = function(indexArr) {
	var indexCount = indexArr.length;
	IndexToolClass.SelectedSectionArray = new Array(indexCount);
	for (var i = 0; i < indexCount; i++) {
		IndexToolClass.SelectedSectionArray[i] = indexArr[i];
	}
}



// ------------- セクションインデックスリストを取得します。
IndexToolClass.GetSectionInfoList = function() {
	return DocumentManager.getSectionInfoList();
}


// ------------- セクション情報が使用可能になったとき外部から呼び出されます。
IndexToolClass.sectionIndexReady = function() {
	DocumentManager.setCurrentSection(0);
	ViewManager.getEditorPane().RedrawEditorPane(0);
}



// セクションインデックスのDOM構造
// ┏ div: DOMのIDに、セクションIDを持っています ━━━━━━━━━━━┓
// ┃┌ div  ┐　　　　　　┌ div  ┐┌ div  ────────────┐┃
// ┃│      │　　　　　　│      ││┌ span ──────────┐│┃
// ┃│接続線│・・・・・・│ icon │││ セクションタイトル文字列 ││┃
// ┃│      │　　　　　　│      ││└─────────────┘│┃
// ┃└───┘　　　　　　└───┘└───────────────┘┃
// ┃(接続線はインデックスの深さと同じ個数)                            ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ------------- セクションインデックスを再描画します。
// 引数により、全描画が部分描画かが決まります。
IndexToolClass.RedrawSection = function(sectionIndex) {
	// sectionIndex [I, obj]: null以外 = 指定されたセクションインデックスのみ再描画されます。
	//                        null or undefined = 全てのセクションインデックスが再描画されます。

	$('#IDT_MasterLayer').empty();            // インデックスツリー表示をすべて削除します。

	var secIndexList = IndexToolClass.GetSectionInfoList();  // セクションインデックスリストを取得します。
	var sectionNum   = secIndexList.length;                // セクション数を取得します。
//	var newSections  = new Array(sectionNum - 1);          // 新しいセクションDOMの配列を作成します。
	if (sectionNum <= 0) return;
	var newSections  = new Array(sectionNum - 1);          // 新しいセクションDOMの配列を作成します。

//	$('#IDT_MasterLayer').empty();            // インデックスツリー表示をすべて削除します。

	// まずセクションインデックスDOMを作成します。
	for (var i = 0; i < sectionNum; i = i + 1) {  // セクション数分ループします
		var sectionInfo = secIndexList[i];               // 生成するセクションの情報への参照です。
		var localCopy   = IndexToolClass.SectionDOM.clone(true);   // セクションひな形DOMからクローンを作成します。
		newSections[i]  = localCopy;                     // 新しいセクションDOMへの参照を記憶します。

		// 操作中のセクションへ、固有の情報をセットします。
//		localCopy.attr('id', IDT_SECTION_ID_HEADER + sectionInfo['id']);  // セクションID
		localCopy.attr('id', IDT_SECTION_ID_HEADER + i); // セクションを一意に識別するための ID を割り振ります。

		var tempTitle = sectionInfo['title'];
		if (tempTitle == '' || tempTitle == null) tempTitle = IndexToolClass.getSectionTitleAuto(i);
		if (tempTitle == '' || tempTitle == null) tempTitle = '< セクション ' + (i + 1) + '>';
		localCopy.children( 'div:last' ).children( 'span' ).html( tempTitle );  // セクションタイトル

		// インデックス深度に応じたセクションアイコンを設定します。
		var indexDepth = sectionInfo['depth'];    // インデックス深度を取得します。
		var iconIndex = indexDepth < 9 ? indexDepth : 8;

		// インデックスアイコン用divを追加します。
		var baseDiv = IndexToolClass.IndexDivDOM.clone(true);              // アイコン格納用空のdivクローンを作成します。
		var iconImg = IndexToolClass.MainIconDOM[iconIndex].clone(true);  // 該当インデックスアイコンのクローンを作成します。
		$(baseDiv).prepend(iconImg);                             // 空divへアイコンイメージを格納します。
		$(localCopy).prepend(baseDiv);                           // アイコンイメージを持ったdivを、セクションdivへ追加

		// インデックス深度に応じた個数の、深度表現divを追加します。
		for (var j = 1; j <= indexDepth; j++) {
			baseDiv = IndexToolClass.IndexDivDOM.clone(true); // アイコン格納用空のdivクローンを作成します。
			$(localCopy).prepend(baseDiv);          // アイコンイメージを持ったdivを、セクションdivへ追加
		}

		$('#IDT_MasterLayer').append(localCopy); // 生成したセクションインデックスを、ツリー最後尾へ追加します。
	}

	// セクションツリーの罫線を作成します。
	for (var baseIndex = sectionNum - 1; 0 < baseIndex; baseIndex = baseIndex - 1) {  // セクション数分ループします

		// ツリーをさかのぼって罫線を描画します。
		IndexToolClass.FollowIndexDepth(secIndexList, baseIndex);
	}

	IndexToolClass.HilightSection(); // 選択状態を反映します。
	IndexToolClass.ReadySectionTitle(); // 選択されたセクションの タイトル を、セクションタイトルバーへ反映します。
}

/**
 * 任意のセクションに対し、1行目から自動的にセクションタイトルの文字列を取得します。
 * @param index     セクションのインデックス
 */
IndexToolClass.getSectionTitleAuto = function(index) {
    var section = DocumentManager.getDocument().getSection(index);
    if (section == null || section.children.length == 0) return '';

    // ページ番号である段落、及び改行のみの段落は無視します。
	var firstPara = null;
    for (var paragraphIndex = 0; paragraphIndex < section.children.length; paragraphIndex++) {
		var localParagraph = section.children[paragraphIndex];
		Paragraph.doop(localParagraph);
		// 段落がページ番号ではなく、改行のみの行でもでないなら
		if (!localParagraph.pageNumber && (localParagraph.children.length > 1) ) {
			firstPara = localParagraph; // この段落をセクションタイトルとして採用します。
			break;
		}
	}
	if (firstPara === null) return '';

    // 段落の子要素を順に操作してセクションタイトル文字列を取得します
    var title = '';
    var prevNodeType = CIO_XML_TYPE.text;   // ひとつ前の NodeType
    for (var i=0; i<firstPara.children.length; i++) {
        var dataNode = firstPara.children[i];
        DataClass.bindDataClassMethods(dataNode);

        // 改行は無視します
        if (dataNode.nodeName == 'BR') continue;

        // テキストは属性を無視して追加
        if (dataNode.nodeName == 'C') {
            if (dataNode.textContent == '&tab;') title += '\t';         // タブ
            else if (dataNode.textContent == '&nbsp;') title += ' ';    // 半角スペース
            else title += dataNode.textContent;
        }
        // 画像
        else if (dataNode.nodeName == 'CIMG') {
            title += '《画像》';
        }
        // 表
        else if (dataNode.nodeName == 'CTABLE') {
            title += '《表》';
        }
        // 数式へ変わったとき
        else if (dataNode.nt != prevNodeType && dataNode.nt == CIO_XML_TYPE.math) {
            title += '《数式》';
        }
        // 化学式へ変わったとき
        else if (dataNode.nt != prevNodeType && dataNode.nt == CIO_XML_TYPE.chemical) {
            title += '《化学式》';
        }
        // 置換が不要なノードは内部テキストを抽出して追加します
        else {
        	title += dataNode.innerText.replace(/&nbsp;/g, ' ');;
        }

        // NodeType を更新します
        prevNodeType = dataNode.nt;
    }

    return title
    	.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');;
}


// セクションインデックスのDOM構造
// ┏ div: DOMのIDに、セクションIDを持っています ━━━━━━━━━━━┓
// ┃┌ div  ┐　　　　　　┌ div  ┐┌ div  ────────────┐┃
// ┃│      │　　　　　　│      ││┌ span ──────────┐│┃
// ┃│接続線│・・・・・・│ icon │││ セクションタイトル文字列 ││┃
// ┃│      │　　　　　　│      ││└─────────────┘│┃
// ┃└───┘　　　　　　└───┘└───────────────┘┃
// ┃(接続線はインデックスの深さと同じ個数)                            ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
//       ↑                    ↑
//       │                 baseDepth ・・・この場合「1」
//       │
//    rulePosition = baseDepth - 1 ・・・・ この場合「0」
//
// ------------- セクションインデックスをたどってツリー構造を描画します。
// [private]
IndexToolClass.FollowIndexDepth = function (secIndexList, baseIndex) {
	// secIndexList [ I, 配列 [ 連想配列 ] ] : セクション情報
	//              連想配列 = {id : セクションID,
	//                       title : セクションタイトル,
	//                       depth : 深度番号 (0開始) }
	// baseIndex    [ I, num               ] : 追跡を開始するセクションのインデックス番号
	var sectionCnt = secIndexList.length;

	// インデックス深度が0ならば、何も処理しません。
	var baseDepth = secIndexList[baseIndex][ 'depth' ];
	if (baseDepth == 0) return;

	// セクションアイコンの左に"└"だけ描画します。
	var rulePosition = baseDepth - 1;  // 罫線アイコン描画位置です。
	// 罫線描画ターゲットのDOMを取得します。
	var parentDiv = $('#IDT_MasterLayer').children( 'div:eq(' + baseIndex + ')' );
	var targetDiv = parentDiv.children('div:eq(' + rulePosition + ')' );
	// まだ罫線要素がなければ、罫線を追加します (罫線処理ですでに子要素が追加されている場合は何もしません)。
	if ( targetDiv.children().length <= 0) targetDiv.append( IndexToolClass.SupIconDOM['Hook'].clone(true) );

	// 上の深度を調査します。
	for (var i = baseIndex - 1; 0 < i; i--) {
		var preDepth = secIndexList[i][ 'depth' ];
		// 1つ上の深度の方が浅いなら、// 何もせずにループを中断します。
		if (preDepth < baseDepth) break;

		// 罫線描画ターゲットのDOMを取得します。
		parentDiv = $('#IDT_MasterLayer').children( 'div:eq(' + i + ')' );
		targetDiv = parentDiv.children('div:eq(' + rulePosition + ')' );

		// 1つ上の深度が同じなら、1つ上の罫線アイコン描画位置へ"├"を描画し、ループを中断します。
		if (preDepth == baseDepth) {
			targetDiv.append( IndexToolClass.SupIconDOM['VerticalConnect'].clone(true) );
			break;
		} else {
		// 1つ上の深度の方が深いなら、1つ上の罫線アイコン描画位置へ"│"を描画し、ループを継続します。
			targetDiv.append( IndexToolClass.SupIconDOM['VerticalLine'].clone(true) );
		}
	}
}



