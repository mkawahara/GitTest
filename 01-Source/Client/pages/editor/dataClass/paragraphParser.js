function ParagraphParser() {
};

/**
 * xmlを解析し、paragraph オブジェクトを作成します。
 */
ParagraphParser.parse = function(xml) {
	// xml の前後にルートエレメントを追加します
	xml = '<root>' + xml + '</root>';
//	alert(xml);

	// jQuery でパースします
	var domRoot = $(xml);

	// paragraph オブジェクトを取得します
	var paragraph = domRoot.children();
	if (paragraph.length != 1) throw '段落データの書式に間違いがあります。ルート要素の数を確認してください。in ParagraphParser.js line 17';
	paragraph = paragraph[0];

	// 元のIDのバックアップをとります
	paragraph.oldId = paragraph.id;

	// 全てのノードに対して ID を振り直します
	ParagraphParser.setNewParagraphId(paragraph);

	// 結果を戻します
	return paragraph;
};

ParagraphParser.setNewParagraphId = function(element) {
	// ID を新しく割り当てます
	element.id = DocumentManager.getIdManager().getNewParagraphId();

	// 子要素を順次処理します
	for (var i = 0; i < element.children.length; i++) {
		ParagraphParser.setNewId(element.children[i]);
	}
};

ParagraphParser.setNewId = function(element) {
	// ID を新しく割り当てます
	element.id = DocumentManager.getIdManager().getNewNodeId();

	// 子要素を順次処理します
	for (var i = 0; i < element.children.length; i++) {
		ParagraphParser.setNewId(element.children[i]);
	}
};
