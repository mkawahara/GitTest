/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： selectionUpdater.js                                */
/* -                                                                         */
/* -    概      要     ： 選択状態更新クラス。                               */
/* -                      複合処理層から UI 層への一方通行操作用機能群です。 */
/* -                      Undo / Redo 層から
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年05月21日                         */



// ---- コンストラクタ
function SelectionUpdater(editorPane, sectionPaneClass, statusManager){
//	this.editorPane    = editorPane;
//	this.sectionPane   = sectionPaneClass;
//	this.statusManager = statusManager;
};



// ---- セクションの選択状態を登録
SelectionUpdater.prototype.setSectionSelect = function(indexArr) {
//	this.sectionPane.setSelectedSectionIndex(indexArr);
};



// ---- セクションペーン上のカレントセクションの登録
SelectionUpdater.prototype.setCurrentSelect = function(index) {
//	this.sectionPane.setLatestSectionIndex(index);
};



// ---- カーソル位置の登録
SelectionUpdater.prototype.setCaretPostion = function(id) {
	// カーソルの表示位置を更新します
//	this.editorPane.MoveCaretByID(id);
//	this.editorPane.getCaret().pos = id;
	ViewManager.getCaret().pos = id;
};



// ---- 文書上の選択範囲の登録
SelectionUpdater.prototype.setEditorSelect = function(idArr) {
};

