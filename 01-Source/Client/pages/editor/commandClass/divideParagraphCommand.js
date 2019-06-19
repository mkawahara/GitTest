/**
 * 段落分割コマンドクラスです。Undo, Redoメソッドを実装します。
 * target:分割対象段落
 * pos:対象段落上での分割位置を表すノードID
*/
var DivideParagraphCommand = function(target, pos, pageBreak) {
	// 分割元段落インスタンスへの参照です。
	this.target  = target;
	// 分割先頭位置にある段落子要素の id です。
	this.pos     = pos;
	// 分割後に分割対象段落の末端に付与される改行ノードのインスタンスです。
	this.br      = LineBreak.createNew();
	// 分割データを受け取る新しい段落ノードのインスタンスです。
	this.newpara = Paragraph.createNew(true);
	
	// ページ分割の指示です。
	this.pageBreak = pageBreak;
};

/**
 * Command基底クラスを継承します。
 */
DivideParagraphCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
DivideParagraphCommand.prototype.execute = function() {
	
	// カレントセクションインデックスを取得
	this.currentSecIndex = IndexToolClass.getLatestSectionIndex();

	// ---- 範囲削除を行います。実行後、キャレットは、基準位置へ移動しています。
	this.comObj    = new CommandExecutor(1000);              // ローカルスタックを作成します。
	var localCaret = ViewManager.getEditorPane().getCaret(); // キャレットを取得します。
	this.removeObj = new RemoveMultiNodeCommand(localCaret);
	if (this.removeObj.isDeletable) {
		this.comObj.execute(this.removeObj);
		this.pos = localCaret.pos;
		var section = DocumentManager.getCurrentSection();        // セクションを取得
		Section.doop(section);                                    // セクション doop
		var result = section.nodeLocation(this.pos); // 段落内でのカーソル位置情報を取得
		this.target = result.current_para;
	}

	// 段落を分割します。
	var newpara = TextEditor.divideParagraph(this.target, this.pos, this.br, this.newpara, this.pageBreak);
	if (newpara === null) {
		// 戻り値がnullの場合falseを返します。
		return false;
	} else {
		// 戻り値から値を取得します。
		this.newpara = newpara;
		// trueを返します。
		return true;
	}
};

/**
 * undo()をオーバーライドします。
 */
DivideParagraphCommand.prototype.undo = function() {
	// カレントセクションへ移動
//	IndexToolClass.setLatestSectionIndex(this.currentSecIndex);
//	IndexToolClass.setSelectedSectionIndex([this.currentSecIndex]);
//	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
	
	// ---- 改ページ対応 undo 処理
	// 改ページ挿入指示であったなら、分割元の改ページ属性を解除
	TextEditor.undoDivideParagraph(this.target, this.pageBreak);
	// 段落を結合します。
	TextEditor.combineParagraph(this.target, this.newpara);
	
	// ---- 範囲削除を Undo します。
	if (this.removeObj.isDeletable) {
		ViewManager.getRenderer().update(); // これがないと、レンダラが落ちます。
		this.comObj.undo();
	}
};

/**
 * redo()をオーバーライドします。
 */
DivideParagraphCommand.prototype.redo = function() {
	// カレントセクションへ移動
//	IndexToolClass.setLatestSectionIndex(this.currentSecIndex);
//	IndexToolClass.setSelectedSectionIndex([this.currentSecIndex]);
//	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。

	// ---- 範囲削除を Redo します。
	if (this.removeObj.isDeletable ) this.comObj.redo();
	
	// 段落を分割します。
	TextEditor.divideParagraph(this.target, this.pos, this.br, this.newpara, this.pageBreak);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
DivideParagraphCommand.prototype.getMemCost = function() {
	return 1;
};
