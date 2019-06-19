/**
 * SectionList クラス
 */

function SectionList() {
	// コンストラクタでは何もしません。
};

SectionList.prototype = Object.create(HTMLUnknownElement.prototype);

/**
 * ノードオブジェクトにプロトタイプを設定します。
 * @param nodeObject
 */
SectionList.createNew = function() {
	// 検索・置換ダイアログにおいて新規 sectionList を作成する際、生成方法を統一しないと
	// タグ名の不一致が起きて危険なため、新しく追加しました。 7/17 湯本
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('section_list'); // xmlタグ名にはクラス名を全小文字で使用します。
	return domObj;
};



/**
 * ノードオブジェクトにプロトタイプを設定します。
 * @param nodeObject
 */
SectionList.doop = function(nodeObject) {
	DataClass.insertPrototype(nodeObject, SectionList);
};

/**
 * 全ての section ノードを Section オブジェクトに変換します。
 */
SectionList.prototype.parseChildren = function() {
	var sections = $(this).children('section');

	for (var sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
		var section = sections[sectionIdx];

		// 段落ID ノードを取得します
		var pidListNode = $(section).children('paragraph_id_list');

		if (pidListNode.length != 1) {
			throw 'paragraph_id_list ノードの数が不適切です。in SectionList.js line 32';
		};

		// 子要素を全て削除します
		$(section).empty();

		// 取得した値をsectionに設定します
		Section.doop(section);
		section.parseCsv($(pidListNode).text());
	};
};

/**
 * 全セクションの情報を配列として取得します。
 */
SectionList.prototype.getSectionInfoList = function() {
	var infoList = [];
	var sections = $(this).children('section');

	for (var i = 0; i < sections.length; i++) {
		// ノードオブジェクトの機能拡張を行います
		Section.doop(sections[i]);

		// 指定セクションの情報を取得します
		var info = {
				id: i,
				title: sections[i].title,
				depth: sections[i].depth,
		};

		// セクションの情報をリストに登録します
		infoList.push(info);
	};

	return infoList;
};

/**
 * Section を１つ取得します。
 * @param index
 */
SectionList.prototype.getSection = function(index) {
	var sections = $(this).children('section');

	if (sections.length <= index) return null;
	return sections[index];
};

/**
 * 編集可能か否かを取得します。
 * これは全てのセクションが編集可能になるまで、false を返します。
 */
SectionList.prototype.isEditable = function() {
	var sections = $(this).children('section');

	for (var i = 0; i < sections.length; i++) {
		// ノードオブジェクトの機能拡張を行います
		Section.doop(sections[i]);

		// サーバからまだ取得されていない段落があれば、編集不可です
		//if (!sections[i].getPid()) return false;	// ★旧ローダーの置き換えに伴うコメントアウト
		if (!sections[i].isAllReceived()) return false;
	};

	return true;
};

/**
 * サーバへの保存用文字列を取得します
 */
SectionList.prototype.toXml = function() {
	var xml = '<section_list>';

	var sections = $(this).children('section');
	for (var i = 0; i < sections.length; i++) {
		DataClass.bindDataClassMethods(sections[i]);
		xml += sections[i].toXml();
	};

	xml += '</section_list>';

	return xml;
};

/**
 * 全セクションに属する段落データをxml文字列の配列で取得します。
 */
SectionList.prototype.getParagraphXmlList = function() {
	var list = [];

	var sections = $(this).children('section');
	for (var i = 0; i < sections.length; i++) {
		Array.prototype.push.apply(list, sections[i].getParagraphXmlList());
	};

	return list;
};

SectionList.prototype.getSectionCount = function() {
	return $(this).children('section').length;
};


///////////////////////////////////////////////////////////////////
// 以下、セクションの編集用
///////////////////////////////////////////////////////////////////

/**
 * 指定した２つのセクションの順番を入れ替えます。
 */
SectionList.prototype.swap = function(index1, index2) {
	if (index1 == index2) return;
	var young = index1;
	var old   = index2;
	if (index2 < index1) {
		young = index2;
		old   = index1;
	}
	var sections = this.children;
	this.insertBefore( this.removeChild(sections[old]), sections[young] );
};

SectionList.prototype.insertSectionList = function() {
};



/**
 * 指定位置に新しいSectionを追加します。
 */
SectionList.prototype.appendSection = function(section, index) {
	// section [Section ノード]: 挿入するセクションノード
	// index             [数値]: index の前の位置へ、セクションノードが挿入されます。
	// 現在のセクション数を超えた場所を指定した場合、末尾に追加されます (refNode を null にすればOK)。
	// 返値: 実際に新しい Section が追加された位置のインデックス。
	var childCount = this.children.length;            // 総セクション数
	var refNode = index >= childCount ? null : (index < 0 ? null : this.children[index]);
	this.insertBefore(section, refNode);                // refNode が null の場合、末尾への追加になります。
	return refNode !== null ? index : childCount;       // 実際に新しい Section が追加された位置のインデックス。
};



/**
 *  指定したセクションを削除します。
 */
SectionList.prototype.removeSection = function(index) {
	var childCount = this.children.length;           // 総セクション数
	if (index >= childCount || index < 0) return null; // 指定が無効なら失敗して null が返ります。
	return this.removeChild(this.children[index]);   // 戻り値は削除されたセクションのインスタンスです。
};

