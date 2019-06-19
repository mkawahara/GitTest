/**
 * ViewManager クラス
 *
 * 画面部品を扱う各クラスへの参照を管理・提供します。
 * DocumentManager のように、唯一のクラスのメソッドのラップを提供することはありません。
 */

function ViewManager() {
	this.editorPane       = EditorPaneClass;
	this.indexPane        = IndexToolClass;
	this.selectionUpdater = new SelectionUpdater(this.editorPane, this.indexPane);

	var doc = DocumentManager.getDocument();
	if (doc !== null) {
		this.mainRenderer  = new Renderer( DocumentManager.getDocument(), document.getElementById('EDT_MasterLayer'), IndexToolClass );
	} else {
		this.mainRenderer  = null;
	}

	this.subRenderer   = null;
	this.statusManager    = StatusManager;
};

ViewManager.instance = null;

/**
 * レンダラーを初期化します。
 * 成功時は true, 失敗時は false を返します
 * @returns {Boolean}
 */
ViewManager.init = function() {
	if (ViewManager.instance == null) ViewManager.instance = new ViewManager();
	if (ViewManager.instance.mainRenderer === null) {
		var doc = DocumentManager.getDocument();
        ViewManager.instance.mainRenderer  = new Renderer( doc, document.getElementById('EDT_MasterLayer'), IndexToolClass );
//		if (doc !== null) {
//			ViewManager.instance.mainRenderer  = new Renderer( DocumentManager.getDocument(), document.getElementById('EDT_MasterLayer'), IndexToolClass );
//			return true;
//		} else {
//			ViewManager.instance.mainRenderer  = null;
//			return false;
//		}
	}

	return true;
}

/**
 * エディタペインクラスへの参照を取得します
 * @returns
 */
ViewManager.getEditorPane = function() {
	ViewManager.init();

	return ViewManager.instance.editorPane;
};

/**
 * インデックスペインクラスへの参照を取得します
 * @returns
 */
ViewManager.getIndexPane = function() {
	ViewManager.init();

	return ViewManager.instance.indexPane;
};

/**
 * セレクションアップデータクラスへの参照を取得します
 * @returns
 */
ViewManager.getSelectionUpdater = function() {
	ViewManager.init();

	return ViewManager.instance.selectionUpdater;
};

/**
 * メインレンダラーへの参照を取得します
 * @returns
 */
ViewManager.getRenderer = function() {
	if (!ViewManager.init()) return null;

	return ViewManager.instance.mainRenderer;
};

/**
 * サブレンダラーへの参照を取得します
 * ※サブレンダラーは、検索ダイアログ上のペインへの描画担当を想定します
 * @returns
 */
ViewManager.getSubRenderer = function() {
	if (!ViewManager.init()) return null;

	return ViewManager.instance.subRenderer;
};

/**
 * ステータスマネージャへの参照を取得します
 * @returns
 */
ViewManager.getStatusManager = function() {
	ViewManager.init();

	return ViewManager.instance.statusManager;
};
