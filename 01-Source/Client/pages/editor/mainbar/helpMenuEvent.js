/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： helpMenuEvent.js                                   */
/* -                                                                         */
/* -    概      要     ： ヘルプメニュー用イベントハンドラ                   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 41.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年10月10日                         */

function HelpMenuEventHandler() {};

HelpMenuEventHandler.onClickOperationManual = function() {
	window.open('./helpPdf/operationManual.pdf');
};

HelpMenuEventHandler.onClickInputManual = function() {
	window.open('./helpPdf/inputManual.pdf');
};

HelpMenuEventHandler.onClickShortcutList = function() {
	window.open('./helpPdf/shortCut_list.pdf');
};

HelpMenuEventHandler.onClickVersionInfo = function() {
	alert('バージョン情報');
};


