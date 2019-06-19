/**
 * Document クラス
 */

/**
 * 文書オブジェクトのコンストラクタ。
 * xml から文書オブジェクトを作成します。
 * @param xml	文書情報を収めた xml 文字列
 * @param docId	文書 ID
 */
function Document(xml, docId) {
	// xml から dom を作成します
	var root = $(xml);

	// 文書情報を格納します
	this.property = new DocumentProperty();

	// 文書 ID を保存します
	this.id = docId;

	// 文書情報を DocumentProperty に登録します
	this.property.setProperty(root.find('document_property')[0]);
	//this.property.setOtherProperties(root.find('other_properties')[0]);

	// section_list ノードから SectionList を作成します
	var sectionList = root.find('section_list');
	if (sectionList.length != 1) throw 'SectionList の数が不適切です。in Document.js line 27';
	sectionList = sectionList[0];

	// SectionList の機能を拡張します
	SectionList.doop(sectionList);

	// リスト上のセクションを全て Section オブジェクトに変換します
	sectionList.parseChildren();

	// セクションリストをメンバとして登録します
	this.sectionList = sectionList;
};

/**
 * 全セクションの情報を配列として取得します。
 */
Document.prototype.getSectionInfoList = function() {
	// SectionList の機能を拡張します
	SectionList.doop(this.sectionList);

	return this.sectionList.getSectionInfoList();
};

/**
 * 全セクションをDOMルートとして取得します。
 */
Document.prototype.getSectionList = function() {
	return this.sectionList;
};

/**
 * 全セクションを配列として取得します。
 */
Document.prototype.getSectionListAsArray = function() {
	return this.sectionList.children;
};

/**
 * Section を１つ取得します。
 * @param index
 */
Document.prototype.getSection = function(index) {
	// SectionList の機能を拡張します
	SectionList.doop(this.sectionList);

	return this.sectionList.getSection(index);
};

/**
 * 編集可能か否かを取得します。
 * これは全てのセクションが編集可能になるまで、false を返します。
 */
Document.prototype.isEditable = function() {
	// SectionList の機能を拡張します
	SectionList.doop(this.sectionList);

	return this.sectionList.isEditable();
};

Document.prototype.toXml = function() {
	// DocumentProperty 文字列を取得します
	var prop = this.property.toXml();

	// SectionList 文字列を取得します
	var sections = this.sectionList.toXml();

	// コンテナタグを追加します
	var xml = '<?xml version="1.0" encoding="utf-8"?><InftyOnlineDocument>' + prop + sections + '</InftyOnlineDocument>';

	return xml;
};

/**
 * 文書に属する全段落データをxml文字列の配列で取得します。
 */
Document.prototype.getParagraphXmlList = function() {
	return this.sectionList.getParagraphXmlList();
};
