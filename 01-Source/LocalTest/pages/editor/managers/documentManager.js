/**
 * DocumentManager クラス
 *
 * ページで扱われるデータ全てへの参照を管理するクラスです。
 * また、唯一の編集中文書の読み込み・保存機能を提供します。
 * 加えて、ページにおける唯一の編集中文書のメソッドを一部ラップしたメソッドも提供します。
 */


/////////////////////////////////////////////////////////////////////////
// コンストラクタ
/////////////////////////////////////////////////////////////////////////

function DocumentManager() {
	// 編集中の文書オブジェクト
	this.currentDocument = null;
	// 現在操作中のセクションのインデックス
	this.currentSectionIndex = null;
	// 文書読み込みを代行するオブジェクト
	this.loader = null;
	// IDマネージャ
	this.idManager = new IDManager();
	// 検索対象データ
	this,searchTargetParagraph = null;
	// 挿入文書データ
	this.insertDocumentData = null;
	// 現在編集中の文書の文書ID
	this.documentId = null;
};


DocumentManager._instance = null;

Object.defineProperty(DocumentManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (DocumentManager._instance === null) {
			DocumentManager._instance = new DocumentManager();
		};

		return DocumentManager._instance;
	},
});


/**
 * DocumentManager 初期化
 */
DocumentManager.init = function() {
	var docId = DocumentManager.getDocIdFromParam();

	if (!docId) {
//		alert('文書IDが指定されていません。');
//		return null;

		// ★ローカルデバッグの時は、loadDocument には 1 を渡します
		DocumentManager.loadDocument(1);

	} else {
		//alert('DocumentManager の文書ID取得部を修正しましたか？');
		DocumentManager.loadDocument(docId);
	}
};


/////////////////////////////////////////////////////////////////////////
// 文書の読み込み
/////////////////////////////////////////////////////////////////////////


/**
 * 文書データの取得を実行します。
 */
DocumentManager.loadDocument = function (documentId) {
	// ローダを作成し、読み込みを開始させます
	//DocumentManager.instance.loader = new Loader(documentId, DocumentManager.onReceiveDocument, DocumentManager.onReceiveComplete);
	DocumentManager.instance.loader = new DocumentLoader(
			documentId,
			DocumentManager.onReceiveDocument,
			DocumentManager.onReceiveComplete,
			DocumentManager.onErrorAtLoad,
			ViewManager.getRenderer())
	DocumentManager.instance.loader.post();

	// 文書IDを登録します
	DocumentManager.instance.documentId = documentId;
};

/**
 * 文書情報の取得時に呼び出されるべきコールバック関数です。
 * 文書情報をメンバとして保持した後、
 * セクションペインに再描画を行うよう、通知します。
 * @param document
 */
DocumentManager.onReceiveDocument = function(document) {
	// ドキュメントを設定します
	DocumentManager.instance.currentDocument = document;

    ViewManager.getRenderer().setDocument(DocumentManager.getDocument());
    Renderer.updateStyleClass();

	// ★セクションペインに再描画を行うよう、通知します
	var indexPaneObj = ViewManager.getIndexPane();
	indexPaneObj.sectionIndexReady(DocumentManager.instance.currentDocument);
	indexPaneObj.RedrawSection(null);

	// 最初のセクションを選択状態にします
	if (DocumentManager.getSectionInfoList().length > 0) {
	    IndexToolClass.SelectSection(0, false, false);
	    IndexToolClass.HilightSection();                              // セクションの選択状態を反映します。
	    IndexToolClass.ReadySectionTitle();                           // タイトルをセクションタイトルバーへ反映します。
	    ViewManager.getRenderer().render(0);
//	    ViewManager.getRenderer().update();                           // エディタペイン再描画
	}

};

/**
 * 文書情報および段落情報を全て取得し終わった時に呼び出されるべきコールバック関数です。
 * 文書情報をメンバとして保持した後、
 * セクションペインに再描画を行うよう、通知します。
 */
DocumentManager.onReceiveComplete = function(document) {
	if (DocumentManager.instance.currentDocument == null) {
		// ドキュメントを設定します
		DocumentManager.instance.currentDocument = document;

		// ★セクションペインに再描画を行うよう、通知します
		var indexPaneObj = ViewManager.getIndexPane();
		indexPaneObj.sectionIndexReady(DocumentManager.instance.currentDocument);
		indexPaneObj.RedrawSection(null);
	}

	// ★段落がまだ表示されていなければ、ここで段落を表示します

	// ローダを破棄します
	DocumentManager.instance.loader = null;
};

/**
 * ロード中のエラーを受け取るエラーハンドラです。
 * @param message	エラーメッセージを表す文字列
 */
DocumentManager.onErrorAtLoad = function(message) {
	alert(message);
};


/////////////////////////////////////////////////////////////////////////
// 編集中の文書へのアクセス
/////////////////////////////////////////////////////////////////////////


/**
 * 文書が編集可能な否かを取得します。
 * 読み込み未完了の場合は、false、
 * ReadManager が管理する読み上げモードが ON の時は、0 を返します
 *
 */
DocumentManager.isEditable = function() {
	// 文書が編集可能でなければ、false を返します
	var result = this.instance.currentDocument.isEditable();
	if (!result) return false;

	// 読み上げモードオンの時は 0 を返します
	if (ReadManager.instance.readingMode) return 0;

	return true;
};

/**
 * 全てのセクションの情報を配列として取得します。
 * セクションペインから呼び出されます。
 */
DocumentManager.getSectionInfoList = function() {
	if (DocumentManager.instance.currentDocument == null) {
		return [{id:-1, depth:0, title:'読み込み待ち…',}];
	};

	// セクション情報を取得します
	return DocumentManager.instance.currentDocument.getSectionInfoList();
};

/**
 * カレントセクションを設定します
 */
DocumentManager.setCurrentSection = function(sectionIndex) {
	// カレントセクションを設定します
	if (sectionIndex !== (void 0)) {
		DocumentManager.instance.currentSectionIndex = sectionIndex;
	}
};

/**
 * 現在表示中のセクションへの参照を取得します。
 */
DocumentManager.getCurrentSection = function() {
	if (DocumentManager.instance.currentDocument == null) return null;
	var sectionIndex = DocumentManager.instance.currentSectionIndex;
	return DocumentManager.instance.currentDocument.getSection(sectionIndex);
};

/**
 * 現在表示中のセクションのインデックスを取得します。
 */
DocumentManager.getCurrentSectionIndex = function() {
	if (DocumentManager.instance.currentDocument == null) return null;
	return DocumentManager.instance.currentSectionIndex;
};

/**
 * 現在の編集対象となっている文書のDOMルートを取得します。
 */
DocumentManager.getDocument = function() {
	if (DocumentManager.instance.currentDocument == null) return null;
	return DocumentManager.instance.currentDocument.getSectionList();
};

/**
 * 現在の文書のプロパティを表すxml文字列を取得します。
 */
DocumentManager.getCurrentDocumentPropertyXml = function() {
	if (DocumentManager.instance.currentDocument == null) return null;
	return DocumentManager.instance.currentDocument.property.toXml();
};

/**
 * 現在の文書のプロパティオブジェクトを取得します。
 */
DocumentManager.getCurrentDocumentProperty = function() {
	if (DocumentManager.instance.currentDocument == null) return null;
	return DocumentManager.instance.currentDocument.property;
};


/////////////////////////////////////////////////////////////////////////
// その他
/////////////////////////////////////////////////////////////////////////

/**
 * IDManager のインスタンスを取得します。
 */
DocumentManager.getIdManager = function() {
	return DocumentManager.instance.idManager;
};

/**
 * GET パラメータを解析して、文書 ID を取得します。
 * 初期化でしか使ってはいけません。
 * @returns
 */
DocumentManager.getDocIdFromParam = function() {
	var url = location.href;
	parameters = url.split('?');

	if (parameters.length < 2) return null;

	params = parameters[1].split('&');
	var paramsArray = [];

	for (var i = 0; i < params.length; i++ ) {
		var temp = params[i].split('=');
		paramsArray.push(temp[0]);
		paramsArray[temp[0]] = temp[1];
	}

	return paramsArray['doc_id'];
};


/**
 * 現在編集中の文書の文書IDを取得します。
 */
DocumentManager.getDocId = function() {
	return DocumentManager.instance.documentId;
};

/**
 * 現在編集中の文書の文書IDを更新します。
 * これは「名前をつけて保存」時にサーバにより新しく割り当てられたIDを登録するためのメソッドです。
 */
DocumentManager.setDocId = function(documentId) {
	DocumentManager.instance.documentId = documentId;
};

/**
 * 編集中の文書から指定IDを有するデータノードを取得します。
 */
DocumentManager.getNodeById = function(id) {
	var dom = DocumentManager.instance.currentDocument.getSectionList();
	var node = $(dom).find('#' + id);

	if (node.length <= 0) return null;
	return node[0];
};


/////////////////////////////////////////////////////////////////////////
// 別文書挿入関連
/////////////////////////////////////////////////////////////////////////

DocumentManager.getAdditionalDocument = function(docInfo) {
	// 指定文書のサーバからの取得を開始します
	DocumentManager.instance.adLoader = new DocumentLoader(
			docInfo.id,
			DocumentManager.onLoadAdditionalDocument,
			DocumentManager.onCompleteAdditionalDocument,
			DocumentManager.onErrorGetAdditionalDocument)
	DocumentManager.instance.adLoader.post();

	$('#Dialog_LoadAdditionalDocument').dialog('open');
};

/**
 * 追加文書の情報取得時のコールバック
 * @param document
 */
DocumentManager.onLoadAdditionalDocument = function(document) {
	// 何もしません。
};

/**
 * 追加文書の読み込み完了時のコールバック
 * @param document
 */
DocumentManager.onCompleteAdditionalDocument = function(document) {
	// 読み込みを完了します
	$('#Dialog_LoadAdditionalDocument').dialog('close');
	DocumentManager.instance.adLoader = null;

	// ★挿入箇所を制御する場合、以降はjQuery Dialog からのコールバックで実行してください。

	// 挿入処理を実行します
	DocumentManager._insertDocument(document);
	EditManager.getCommandExecutor().clear();
	StatusManager.setUndoAttribute(false);
	StatusManager.setRedoAttribute(false);

	// セクションペインを更新します
	var indexPaneObj = ViewManager.getIndexPane();
	indexPaneObj.RedrawSection(null);
};

/**
 * セクションの挿入処理。これは複合処理層への移動が望ましいです。
 * @param document
 * @param insertLast
 */
DocumentManager._insertDocument = function(document, insertLast) {
	var sectionList = DocumentManager.instance.currentDocument.getSectionList();

	// 挿入先を決定します
	var at = null;
	//var index = DocumentManager.instance.currentSectionIndex;
	//if (index < sectionList.length - 1) at = sectionList[index + 1];
	//if (!insertLast) at = null;

	// 挿入します
	var newSectionList = document.getSectionList();

	for (var i = 0; i < newSectionList.children.length; i++) {
		sectionList.insertBefore(newSectionList.children[i], at);
	};
};

/**
 * 追加文書読み込み時エラー時のコールバック
 * @param message
 */
DocumentManager.onErrorGetAdditionalDocument = function(message) {
	$('#Dialog_LoadAdditionalDocument').dialog('close');
	alert('別文書の追加読み込みに失敗しました。' + message);
	DocumentManager.instance.adLoader = null;
};
