/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： editManager.js                                     */
/* -                                                                         */
/* -    概      要     ： データ編集機能マネージャ                           */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 38.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月12日                         */


// ---- コンストラクタ
function EditManager() {
//	this.commandExecutor      = new CommandExecutor(100);
	this.commandExecutor      = new CommandExecutor(1000);
	this.selectedRangeManager = new SelectedRangeManager();
};

EditManager._instance = null;

Object.defineProperty(EditManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (EditManager._instance === null) {
			EditManager._instance = new EditManager();
		};

		return EditManager._instance;
	},
});

EditManager.getCommandExecutor = function() {
	return EditManager.instance.commandExecutor;
};

EditManager.getSelectedRangeManager = function() {
	return EditManager.instance.selectedRangeManager;
};



Object.defineProperty(EditManager.prototype, 'SelectedRangeManager', {
	enumerable: true,
	configurable: true,
	get: function(){
		return EditManager.instance.selectedRangeManager;
	},
});

Object.defineProperty(EditManager.prototype, 'CommandExecutor', {
	enumerable: true,
	configurable: true,
	get: function(){
		return EditManager.instance.commandExecutor;
	},
});
