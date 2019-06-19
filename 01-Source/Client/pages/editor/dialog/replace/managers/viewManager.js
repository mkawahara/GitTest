/**
 * ViewManager クラス
 *
 * 画面部品を扱う各クラスへの参照を管理・提供します。
 * DocumentManager のように、唯一のクラスのメソッドのラップを提供することはありません。
 */

function ViewManager() {
//	this.editorPane       = EditorPaneClass;
	this.editorPanes      = [];
	this.editorPanes.push( new EditorPaneClass('searchTarget',  0, 'ID_EditorPage') ); // 検索用エディタペーン
	this.editorPanes.push( new EditorPaneClass('replaceObject', 1, 'ID_EditorPage') ); // 置換用エディタペーン
	this.currentEditorPaneIdx = 0;
	this.Caret            = new Caret(this.editorPanes[0].editorNode); // Caretクラスのインスタンス作成。
	this.CodeAssist       = new CodeAssist('codeAssist', 6);               // 入力支援クラス作成。ダイアログ内なので6行に制限

	this.indexPane        = null;
//	this.selectionUpdater = new SelectionUpdater(this.editorPane, this.indexPane);
	this.selectionUpdater = new SelectionUpdater();

	var doc = DocumentManager.instance.getDocument();
	if (doc !== null) {
//		this.mainRenderer  = new Renderer( DocumentManager.getDocument(), document.getElementById('EDT_MasterLayer'), IndexToolClass );
		this.renderers  = [];
		this.renderers.push( new Renderer( DocumentManager.instance.getDocument(), this.editorPanes[0].editorNode, IndexToolClass ) );
		this.renderers.push( new Renderer( DocumentManager.instance.getDocument(), this.editorPanes[1].editorNode, IndexToolClass ) );
	} else {
		this.renderers  = null;
	}

	this.subRenderer   = null;
	this.statusManager = StatusManager.instance;
};

//ViewManager.instance = null;


//////////////////////////////////////////////////////////////////////////
// シングルトン

ViewManager._instance = null;

Object.defineProperty(ViewManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ViewManager._instance === null) ViewManager._instance = new ViewManager();
		return ViewManager._instance;
	},
});



/**
 * セレクションアップデータクラスへの参照を取得します
 * @returns
 */
ViewManager.getSelectionUpdater = function() {
	return ViewManager.instance.getSelectionUpdater();
};
ViewManager.prototype.getSelectionUpdater = function() {
	return this.selectionUpdater;
};


/**
 * レンダラーを初期化します。
 * 成功時は true, 失敗時は false を返します
 * @returns {Boolean}
 */
/*
ViewManager.init = function() {
	if (ViewManager.instance == null) ViewManager.instance = new ViewManager();
	if (ViewManager.instance.renderers === null) {
		var doc = DocumentManager.getDocument();
		if (doc !== null) {
//			ViewManager.instance.mainRenderer  = new Renderer( DocumentManager.getDocument(), document.getElementById('EDT_MasterLayer'), IndexToolClass );

		renderers  = [];
		renderers.push( new Renderer( DocumentManager.getDocument(), this.editorPanes[0].editorPane, IndexToolClass ) );
		renderers.push( new Renderer( DocumentManager.getDocument(), this.editorPanes[1].editorPane, IndexToolClass ) );
		ViewManager.instance.renderers = renderers;

			return true;
		} else {
			ViewManager.instance.renderers  = null;
			return false;
		}
	}

	return true;
}
*/

// ---- カレントエディタペーンのインデックスをセットします。
ViewManager.prototype.setEditorPaneIdx = function(editorPaneIdx) {
	this.currentEditorPaneIdx = editorPaneIdx;
	var currentEditorPane = this.editorPanes[editorPaneIdx];
	this.Caret.pane = currentEditorPane.editorNode;
};

// ---- キャレットを取得します。
ViewManager.getCaret = function() {
	return ViewManager.instance.getCaret();
};
ViewManager.prototype.getCaret = function() {
	return this.Caret;
};

// ---- CodeAssist を取得します。
ViewManager.getCodeAssist = function() {
	return ViewManager.instance.getCodeAssist();
};
ViewManager.prototype.getCodeAssist = function() {
	return this.CodeAssist;
};


/**
 * エディタペインクラスへの参照を取得します
 * @returns
 */
ViewManager.getEditorPane = function() {
	var editorPane = ViewManager.instance.getEditorPane();
	return editorPane;
}

ViewManager.prototype.getEditorPane = function() {
//	ViewManager.init();

	var editorPaneIdx = this.currentEditorPaneIdx;
	return this.editorPanes[editorPaneIdx];
};

/**
 * インデックスペインクラスへの参照を取得します
 * @returns
 */
ViewManager.prototype.getIndexPane = function() {
	return null;
};
ViewManager.getIndexPane = function() {
	return null;
};

/**
 * レンダラーへの参照を取得します
 * @returns
 */
ViewManager.getRenderer = function() {
	return ViewManager.instance.getRenderer();
};

ViewManager.prototype.getRenderer = function() {
//	if (!ViewManager.init()) return null;

	var editorPaneIdx = this.currentEditorPaneIdx;
	return this.renderers[editorPaneIdx];
};

/**
 * ステータスマネージャへの参照を取得します
 * @returns
 */
ViewManager.getStatusManager = function() {
	return ViewManager.instance.getStatusManager();
};

ViewManager.prototype.getStatusManager = function() {
//	ViewManager.init();

	return this.statusManager;
};
