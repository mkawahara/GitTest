/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： indexEvent.js                                  */
/* -                                                                         */
/* -    概      要     ： インデックスツール用イベントハンドラ               */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年05月25日                         */

function IndexEventHandler() {};


// ------ セクションの選択を変更します　-1 = 前のセクション、+1 = 後ろのセクション
IndexEventHandler.onKeySectionSelect = function(direction) {
	IndexToolClass.moveSectionWithKey(direction);
	IndexToolClass.RedrawSection(null);
	Renderer.updateStyleClass();
	ViewManager.getRenderer().update();
};



// ------ レベルをシフトします。-1 = 深度を浅く、+1 = 深度を深く
IndexEventHandler.onClickShift = function(direction) {
	if (DocumentManager.isEditable() !== true) return;
	// 選択されているセクションのインデックス番号を取得します。
	var indexPane = ViewManager.getIndexPane();
	var indexArr = indexPane.getSelectedSectionIndex();
	UiCommandWrapper.shiftIndex(indexArr, direction);
	ViewManager.getRenderer().update();
};



// ------ セクションの上下移動。-1 = 上へ、+1 = 下へ
IndexEventHandler.onClickMove = function(direction) {
	if (DocumentManager.isEditable() !== true) return;
	var indexPane    = ViewManager.getIndexPane();          // セクションペーン
	var indexArr     = indexPane.getSelectedSectionIndex(); // 選択されているセクションインデックス番号の配列
	var currentIndex = indexPane.getLatestSectionIndex();   // 現在表示されているセクションのインデックス番号
	var result = UiCommandWrapper.moveIndex(indexArr, currentIndex, direction); // 上移動実行
	if (result !== null) ViewManager.getRenderer().update();             // 画面更新が必要なら、レンダラへ要求
};



// ------ セクションの追加
IndexEventHandler.onClickAdd = function() {
	if (DocumentManager.isEditable() !== true) return;
	var indexPane    = ViewManager.getIndexPane();          // セクションペーン
	var indexArr     = indexPane.getSelectedSectionIndex(); // 選択されているセクションインデックス番号の配列
	var currentIndex = indexPane.getLatestSectionIndex();   // 現在表示されているセクションのインデックス番号
	UiCommandWrapper.appendSection(indexArr, currentIndex);
    ViewManager.getRenderer().setUpdateEditorPane();
	ViewManager.getRenderer().update();
//	ViewManager.getEditorPane().FocusFrontTextBox();  // フォーカスをエディタへ戻す
};



// ------ セクションの削除
IndexEventHandler.onClickDel = function() {
	if (DocumentManager.isEditable() !== true) return;
	var indexPane    = ViewManager.getIndexPane();          // セクションペーン
	var indexArr     = indexPane.getSelectedSectionIndex(); // 選択されているセクションインデックス番号の配列
	var currentIndex = indexPane.getLatestSectionIndex();   // 現在表示されているセクションのインデックス番号
	UiCommandWrapper.removeSection(indexArr, currentIndex); // セクションの削除
	ViewManager.getRenderer().preserveEditorPaneClear();    // エディタペインはクリア
	ViewManager.getRenderer().update();
};



// ------ セクションの分割
IndexEventHandler.onClickDivide = function() {
	if (DocumentManager.isEditable() !== true) return;
	var indexPane    = ViewManager.getIndexPane();          // セクションペーン
	var indexArr     = indexPane.getSelectedSectionIndex(); // 選択されているセクションインデックス番号の配列
	var currentIndex = indexPane.getLatestSectionIndex();   // 現在表示されているセクションのインデックス番号
	UiCommandWrapper.divideSection(indexArr, currentIndex); // セクションの分割
	ViewManager.getRenderer().setUpdateEditorPane();
	ViewManager.getRenderer().update();

	var editorPane = ViewManager.getEditorPane();
    editorPane.scrollManager.SetFocusNode(editorPane.getCaret().pos);
    editorPane.scrollManager.ScrollToFocusNode();
    editorPane.updateCaret();
};



// ------ セクションの連結
IndexEventHandler.onClickConnect = function() {
	if (DocumentManager.isEditable() !== true) return;
	var indexPane    = ViewManager.getIndexPane();           // セクションペーン
	var indexArr     = indexPane.getSelectedSectionIndex();  // 選択されているセクションインデックス番号の配列
	var currentIndex = indexPane.getLatestSectionIndex();    // 現在表示されているセクションのインデックス番号
	UiCommandWrapper.combineSection(indexArr, currentIndex); // セクションの連結
    ViewManager.getRenderer().setUpdateEditorPane();
	ViewManager.getRenderer().update();
};



// ------ セクションタイトル設定
IndexEventHandler.onBlurSectionTitle = function() {
	var sectionPane    = ViewManager.getIndexPane();           // セクションペーン
	// 現在表示されているセクションのインデックス番号を取得
	var currentIndex = sectionPane.getLatestSectionIndex();
	var titleStr     = sectionPane.getSectionTitleInput();
	UiCommandWrapper.setSectionTitle(currentIndex, titleStr); // セクションタイトル設定
	ViewManager.getRenderer().update();
};

IndexEventHandler.onChangeSectionTitle = function() {
    // 現在表示されているセクションのインデックス番号を取得
    var sectionPane    = ViewManager.getIndexPane();           // セクションペーン
    var currentIndex = sectionPane.getLatestSectionIndex();
    // セクションペインのタイトル表示のみ更新
    Renderer.updateSectionTitle(currentIndex);
 }

