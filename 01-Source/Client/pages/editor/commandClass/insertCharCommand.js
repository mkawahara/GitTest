/**
 * 1文字挿入コマンドクラスです。Undo, Redoメソッドを実装します。
 * id:挿入先ノードのIDです。
 * char:設定される文字です。
 * option:挿入オプション（type:ノードの種類, font:数式フォント、normalonly:立体のみかどうか）
 * type:挿入されるノードの種類です。
 * status:作成するノードのステータス情報です。
 */
var InsertCharCommand = function(doc, id, char, option, itemStatus, entity) {
	// ドキュメントの参照を取得します。
	this.doc = doc;
	// 挿入先ノードidを取得します。
	this.id = id;
	// 作成するノードのステータス情報です。
	this.itemStatus = {};
	this.itemStatus['italic']    = itemStatus.italic;
	this.itemStatus['bold']      = itemStatus.bold;
	this.itemStatus['underline'] = itemStatus.underline;
	this.itemStatus['strike']    = itemStatus.strike;
	this.itemStatus['footnote']  = itemStatus.footnote;
	// カーソル初期位置のデータノードIDです。
	this.defaultCursorPos = null;

	// ---- 挿入ノードを生成します。
	var inputMode = itemStatus.inputmode; // 入力モード: テキスト / 数式 / 化学式
	// ---- 禁則処理
	// ---- 自分が数式、親が数式、CTD, CMATCELL の場合、&tab; は入力禁止
	var currentNode = DocumentManager.getNodeById(id);
	var parentNode = currentNode.parentNode;
	DataClass.bindDataClassMethods(parentNode);
	var parentName = parentNode.nodeName;
	var prohibitFlag = (parentNode.nt != CIO_XML_TYPE.text) || (inputMode != CIO_XML_TYPE.text);
	prohibitFlag = (prohibitFlag || parentName == 'CTD' || parentName == 'CMATCELL');
	if (prohibitFlag && entity == '&tab;') {
		this.node = null;
	} else {
		this.node = NodeCreator.createNode(char, inputMode, option, entity);
	}
};

/**
 * Command基底クラスを継承します。
 */
InsertCharCommand.prototype = new BaseCommand();

/**
 * execute()をオーバーライドします。
 */
InsertCharCommand.prototype.execute = function() {
	if (this.node === null) return false;	// 数式添字内 tab 等の無効な入力を弾きます。
	// カレントセクションインデックスを取得
	this.currentSecIndex = IndexToolClass.getLatestSectionIndex();

	// ---- 範囲削除を行います。実行後、キャレットは、基準位置へ移動しています。
	this.comObj = new CommandExecutor(1000);              // ローカルスタックを作成します。
	this.caret  = ViewManager.getEditorPane().getCaret(); // キャレットを取得します。
	this.removeObj = new RemoveMultiNodeCommand(this.caret);
	if (this.removeObj.isDeletable) {
		this.comObj.execute(this.removeObj);
		this.id = this.caret.pos;
	}

	// 1文字挿入します。
	var obj = TextEditor.insertChar(this.doc, this.id, this.node, this.itemStatus);
	var resultFlag = !(obj === null);
	if (resultFlag) this.defaultCursorPos = obj.cursorPos; // 成功なら、カーソルのデフォルト位置を取得します。

	// 成否を返します。
	return resultFlag;
};

/**
 * undo()をオーバーライドします。
 */
InsertCharCommand.prototype.undo = function() {
	// カレントセクションへ移動
	IndexToolClass.setLatestSectionIndex(this.currentSecIndex);
	IndexToolClass.setSelectedSectionIndex([this.currentSecIndex]);
	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。
	// 1文字削除します。
	TextEditor.removeNode(this.doc, this.id, true);
	
	// ---- 範囲削除を Undo します。
	if (this.removeObj.isDeletable)  this.comObj.undo();
};

/**
 * redo()をオーバーライドします。
 */
InsertCharCommand.prototype.redo = function() {
	// カレントセクションへ移動
	IndexToolClass.setLatestSectionIndex(this.currentSecIndex);
	IndexToolClass.setSelectedSectionIndex([this.currentSecIndex]);
	ViewManager.getRenderer().setUpdateSectionPane(); // インデックスペーンが更新されたことをレンダラーへ登録します。

	// ---- 範囲削除を Redo します。
	if (this.removeObj.isDeletable ) this.comObj.redo();

	// 1文字挿入します。
	TextEditor.insertChar(this.doc, this.id, this.node, this.itemStatus);
};

/**
 * getMemCost()をオーバーライドします。
 * Commandごとのメモリコストを返します。
 */
InsertCharCommand.prototype.getMemCost = function() {
	return 1;
};


