/**
 * セクションタイトルを設定します。Undo, Redoメソッドを実装します。
 * index:選択セクションのインデックス番号
 * titleStr:セクションタイトル文字列
 */
var SetSectionTitle = function(index, titleStr) {
	// タイトルを設定するセクションです。
	this.index     = index;
	// 設定するセクションタイトルです。
	this.titleStr  = titleStr;
	// Undo / Redo 用情報です。
	this.originalTitle = null; // もともとのセクションタイトル
	this.section       = null; // 操作対象 Section ノード
};

/**
 * Command基底クラスを継承します。
 */
SetSectionTitle.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
SetSectionTitle.prototype.execute = function() {
	// セクションタイトルを設定します。
	var result = IndexEditor.setSectionTitle(this.index, this.titleStr);
	if (result === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.titleStr      = result.titleStr;
		this.originalTitle = result.originalTitle;
	    this.section       = result.section;
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
SetSectionTitle.prototype.undo = function() {
	// セクションタイトルを復元します。
	IndexEditor.setSectionTitle(this.index, this.originalTitle);
};

/**
 * redo()をオーバーライドします。
 */
SetSectionTitle.prototype.redo = function() {
	// セクションタイトルを設定します。
	IndexEditor.setSectionTitle(this.index, this.titleStr);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
SetSectionTitle.prototype.getMemCost = function() {
	return 1;
};
