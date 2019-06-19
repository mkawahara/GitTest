/**
 * ドキュメントの <document_property>ノードを扱うクラス
 * ※Setting と MetaInfo はここに統合。
 */

/**
 * DocumentProperty クラスのコンストラクタ
 */
function DocumentProperty() {
	this.documentProperty = null;
	this.otherProperties = null;
};

/**
 * document_property ノードを登録します。
 * @param node
 */
DocumentProperty.prototype.setProperty = function(node) {
	this.documentProperty = node;
};


/**
 * サーバへの保存用xmlを取得します。
 * @returns
 */
DocumentProperty.prototype.toXml = function() {
	var xml = this.documentProperty.outerHTML;
	return xml;
};


/////////////////////////////////////////////////////////////////////
// プロパティ
/////////////////////////////////////////////////////////////////////

/**
 * 文書タイトル title
 */
Object.defineProperty(DocumentProperty.prototype, 'title', {
	enumerable: true,
	configurable: true,
	get: function(){
		var titleNode = $(this.documentProperty).find('title');
		if (titleNode.length <= 0) {
			return '';
		} else {
			return titleNode.text();
		}
	},
	set: function(value){
		var titleNode = $(this.documentProperty).find('title');

		if (titleNode.length <= 0) {
			// title ノードがなければ、追加します
			titleNode = document.createElement('title');
			this.documentProperty.appendChild(titleNode);
		} else {
			titleNode = titleNode[0];
		}

		titleNode.textContent = value;
	},
});


/**
 * フォント名 font_family
 */
Object.defineProperty(DocumentProperty.prototype, 'font', {
	enumerable: true,
	configurable: true,
	get: function(){
		var fontNode = $(this.documentProperty).find('font_family');
		if (fontNode.length <= 0) {
			// 取得できなかった場合、ConfigManager から取得して設定します。
			var value = ConfigManager.instance.FontName;
			this.font = value;
			return value;
		} else {
			return fontNode.text();
		}
	},
	set: function(value){
		var fontNode = $(this.documentProperty).find('font_family');

		if (fontNode.length <= 0) {
			// font_family ノードがなければ、追加します
			fontNode = document.createElement('font_family');
			this.documentProperty.appendChild(fontNode);
		} else {
			fontNode = fontNode[0];
		}

		fontNode.textContent = value;
	},
});


/**
 * フォントサイズ font_size (常に pt付で扱います)
 */
Object.defineProperty(DocumentProperty.prototype, 'fontSize', {
	enumerable: true,
	configurable: true,
	get: function(){
		var fontSizeNode = $(this.documentProperty).find('font_size');
		if ((fontSizeNode.length <= 0) || (fontSizeNode.text().length <= 0)) {
			// 取得できなかった場合、ConfigManager から取得して設定します。
			var value = ConfigManager.instance.FontSize;
			if (!isNaN(Number(value))) value = value + 'pt';

			this.fontSize = value;
			return value;
		} else {
			return fontSizeNode.text();
		}
	},
	set: function(value){
		var fontSizeNode = $(this.documentProperty).find('font_size');

		if (fontSizeNode.length <= 0) {
			// font_family ノードがなければ、追加します
			fontSizeNode = document.createElement('font_size');
			this.documentProperty.appendChild(fontSizeNode);
		} else {
			fontSizeNode = fontSizeNode[0];
		}

		if (!isNaN(Number(value))) value = value + 'pt';	// 数値で受け取ってしまった場合、pt を付けて保存します

		fontSizeNode.textContent = value;
	},
});

/**
 * 話者名リスト
 * ※配列のインスタンスで保存しているわけではないため、効率の悪いプロパティです。
 */
Object.defineProperty(DocumentProperty.prototype, 'speakerList', {
	enumerable: true,
	configurable: true,
	get: function(){
		var spListNode = $(this.documentProperty).find('speaker_list');
		var result = [];

		if ((spListNode.length > 0) && (spListNode.text().length > 0)) {
			var text = spListNode.text();
			var data = text.split(',');

			for (var i = 0; i < data.length; i++) {
				//result.push(Number(data[i]));
				result.push(data[i]);
			}
		}

		return result;
	},
	set: function(value){
		// 保存先ノードを取得します
		var spListNode = $(this.documentProperty).find('speaker_list');

		if (spListNode.length <= 0) {
			// font_family ノードがなければ、追加します
			spListNode = document.createElement('speaker_list');
			this.documentProperty.appendChild(spListNode);
		} else {
			spListNode = spListNode[0];
		}

		// 保存文字列を作成します
		var data = '';
		for (var i = 0; i < value.length; i++) {
			data += (value[i] + ',');
		};

		// 終端のカンマを除去し、ノードに保存します
		if (value.length > 0) data = data.substr(0, data.length - 1);
		spListNode.textContent = data;
	},
});
