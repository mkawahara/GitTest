/**
 * DocumentManager クラス
 *
 * ページで扱われるデータ全てへの参照を管理するクラスです。
 * また、唯一の編集中文書の読み込み・保存機能を提供します。
 * 加えて、ページにおける唯一の編集中文書のメソッドを一部ラップしたメソッドも提供します。
 */

const XML_TYPE = {
	html: 1,
	mathml:2,
}

/////////////////////////////////////////////////////////////////////////
// コンストラクタ
/////////////////////////////////////////////////////////////////////////

function DocumentManager() {

	this.currentDocument       = null;// 編集中の文書オブジェクト
	this.currentSectionIndex   = null;// 現在操作中のセクションのインデックス
	this.idManager             = new IDManager();// IDマネージャ
	this.searchTargetParagraph = null;// 検索対象データ
	this.insertDocumentData    = null;// 挿入文書データ
	this.documentId            = 1;   // 現在編集中の文書の文書ID・・・検索・置換ウインドウ専用のため固定値です。
	this.replaceDialog         = ReplaceDialog.instance;

};

//////////////////////////////////////////////////////////////////////////
// シングルトン

DocumentManager._instance = null;

Object.defineProperty(DocumentManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (DocumentManager._instance === null) DocumentManager._instance = new DocumentManager();
		return DocumentManager._instance;
	},
});



/**
 * DocumentManager 初期化: コンストラクタでは行いたくない処理です。
 */
DocumentManager.prototype.init = function() {

	// 前回の表示値を取得
	this.replaceDialog.getPreviousXml();
	var preSearchXml  = this.replaceDialog.preSearchXml;
	var preReplaceXml = this.replaceDialog.preReplaceXml;

	// データDOM化
	var preSearchPara  = (preSearchXml  != '') ? $(preSearchXml)[0]  : Paragraph.createNew(false);
	var preReplacePara = (preReplaceXml != '') ? $(preReplaceXml)[0] : Paragraph.createNew(false);
	// ID 振り直し
	DataClass.remapDataNodeId([preSearchPara, preReplacePara]);

	// セクションリスト構築: 検索置換では、DocumentManager に sectionList を持つ。
	this.currentDocument   = SectionList.createNew();
	var searchSection  = Section.createNew(true, 0, '');      // 検索用 Section 作成
	var replaceSection = Section.createNew(true, 0, '');      // 置換用 Section 作成
	this.currentDocument.appendChild(searchSection);          // 検索用 Section を SectionList にぶら下げる。
	this.currentDocument.appendChild(replaceSection);         // 置換用 Section を SectionList にぶら下げる。
	searchSection.appendChild(preSearchPara);                 // 検索用段落を検索用 Section にぶら下げる。
	replaceSection.appendChild(preReplacePara);               // 置換用段落を置換用 Section にぶら下げる。

	// 検索用エディタペーンへ 検索用セクションを設定
	this.setCurrentSection(0);

	// 置換用エディタペーンへ 置換用セクションを設定
	this.setCurrentSection(1);
};

/**
 * 現在の編集対象となっている文書のDOMルートを取得します。
 */
DocumentManager.getDocument = function() {
	return DocumentManager.instance.getDocument();
};
DocumentManager.prototype.getDocument = function() {
	return this.currentDocument;
};



/**
 * 編集中の文書から指定IDを有するデータノードを取得します。
 */
DocumentManager.getNodeById = function(id) {
	return DocumentManager.instance.getNodeById(id);
};
DocumentManager.prototype.getNodeById = function(id) {
	var sectionList = this.currentDocument;
	SectionList.doop(sectionList);
	var node = $(sectionList).find('#' + id);
	if (node.length <= 0) return null;
	return node[0];
};



/**
 * 現在表示中のセクションへの参照を取得します。
 */
DocumentManager.getCurrentSection = function() {
	return DocumentManager.instance.getCurrentSection();
};
DocumentManager.prototype.getCurrentSection = function() {
	var sectionIndex = this.currentSectionIndex;
	return this.currentDocument.getSection(sectionIndex);
};



/**
 * カレントセクションを設定します
 */
DocumentManager.setCurrentSection = function(sectionIndex) {
	DocumentManager.instance.setCurrentSection(sectionIndex);
};
DocumentManager.prototype.setCurrentSection = function(sectionIndex) {
	// カレントセクションを設定します
	if (sectionIndex === void 0) return;
	this.currentSectionIndex = sectionIndex;
	var viewManager = ViewManager.instance;
	viewManager.setEditorPaneIdx(this.currentSectionIndex);
	var renderer = viewManager.getRenderer();
	renderer.render(this.currentSectionIndex);
};



/**
 * 現在表示中のセクションのインデックスを取得します。
 */
DocumentManager.getCurrentSectionIndex = function() {
	return DocumentManager.instance.getCurrentSectionIndex();
};
DocumentManager.prototype.getCurrentSectionIndex = function() {
	return this.currentSectionIndex;
};

/**
 * 全てのセクションの情報を配列として取得します。
 * セクションペインから呼び出されます。
 */
DocumentManager.getSectionInfoList = function() {
	// セクション情報を取得します
	return DocumentManager.instance.getSectionInfoList();
};
DocumentManager.prototype.getSectionInfoList = function() {
	return this.currentDocument.getSectionInfoList();
};


/**
 * 現在の編集対象となっている文書のDOMルートを取得します。
 */
DocumentManager.getDocument = function() {
	return DocumentManager.instance.getDocument();
};
DocumentManager.prototype.getDocument = function() {
	return this.currentDocument;
};

/**
 * IDManager のインスタンスを取得します。
 */
DocumentManager.getIdManager = function() {
	return DocumentManager.instance.getIdManager();
};
DocumentManager.prototype.getIdManager = function() {
	return this.idManager;
};



// 未変更



/////////////////////////////////////////////////////////////////////////
// 編集中の文書へのアクセス
/////////////////////////////////////////////////////////////////////////



/**
 * 段落 HTML を取得します。
 */
DocumentManager.getParagraphHtml = function() {
	if ((DocumentManager.instance == null) || (DocumentManager.instance.currentDocument == null)) return '';
};


/**
 * 現在表示中のセクションのインデックスを取得します。
 */
DocumentManager.getCurrentSectionIndex = function() {
	if ((DocumentManager.instance == null) || (DocumentManager.instance.currentDocument == null)) return null;
	return DocumentManager.instance.currentSectionIndex;
};


/**
 * 現在の文書のプロパティを表すxml文字列を取得します。
 */
DocumentManager.getCurrentDocumentProperty = function() {
	if ((DocumentManager.instance == null) || (DocumentManager.instance.currentDocument == null)) return null;
	return DocumentManager.instance.currentDocument.property.toXml();
};


/////////////////////////////////////////////////////////////////////////
// その他
/////////////////////////////////////////////////////////////////////////

/**
 * 現在編集中の文書の文書IDを取得します。
 */
DocumentManager.getDocId = function() {
	if (DocumentManager.instance === null) return null;
	return DocumentManager.instance.documentId;
};

/**
 * 現在編集中の文書の文書IDを更新します。
 * これは「名前をつけて保存」時にサーバにより新しく割り当てられたIDを登録するためのメソッドです。
 */
DocumentManager.setDocId = function(documentId) {
	if (DocumentManager.instance === null) return;
	DocumentManager.instance.documentId = documentId;
};

DocumentManager.isEditable = function() {
	return true;
};
