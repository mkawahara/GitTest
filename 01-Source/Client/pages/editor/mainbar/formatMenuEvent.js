/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： formatMenuEvent.js                                 */
/* -                                                                         */
/* -    概      要     ： 書式メニュー用イベントハンドラ                 */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 36.0.4             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年05月01日                         */

function FormatMenuEventHandler() {};


FormatMenuEventHandler.onClickInsertTable = function() {
//	Dialogs.openInsertTable();
	Dialogs.onClickOpen(DIALOG.CREATE_TABLE);
};


FormatMenuEventHandler.onClickRuby = function() {
//	Dialogs.openRuby();
};



