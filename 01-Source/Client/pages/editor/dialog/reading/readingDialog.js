/**
 * 読み設定ダイアログ用クラスです。
 */

function ReadingDialog() {
	// 読み設定対象のデータノードを表す xml 文字列
	// 対象文字列の編集機能はないため、ロード＞表示の後、データノード自体は破棄されます。
	this.targetXmlList = [];
	this.view = null;
	this.readingBox = null;
	this.accentBox = null;

	this.paragraphNode = null;
};

ReadingDialog._instance = null;

Object.defineProperty(ReadingDialog, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ReadingDialog._instance === null) ReadingDialog._instance = new ReadingDialog();
		return ReadingDialog._instance;
	},
});

Object.defineProperty(ReadingDialog.prototype, 'View', {
	enumerable: true,
	configurable: true,
	set: function(value){
		this.view = value;
	},
});

Object.defineProperty(ReadingDialog.prototype, 'ReadingBox', {
	enumerable: true,
	configurable: true,
	set: function(value){
		this.readingBox = value;
	},
});

Object.defineProperty(ReadingDialog.prototype, 'AccentBox', {
	enumerable: true,
	configurable: true,
	set: function(value){
		this.accentBox = value;
	},
});

Object.defineProperty(ReadingDialog.prototype, 'XmlList', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.targetXmlList; },
});

Object.defineProperty(ReadingDialog.prototype, 'ParaNode', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.paragraphNode; },
});

/**
 * 読み設定対象文字列を取得します。
 */
ReadingDialog.prototype.getTargetText = function() {
	// 親ウィンドウからデータを取得します。
	var json = window.opener.MessageManager.getSelectedRange('read');

	if (json === null) {
		this.view.innerHTML = '';
		this.readingBox.value = '';
		return;
	}

	// ノード情報が収められた xml 文字列だけを取得します
	this.targetXmlList = json.nodeList;

	// 段落ノードを作成します
	var paraNode = Paragraph.createNew(true);

	// 段落ノードに取得した xml から作成したノードを登録します
	if (this.targetXmlList.length === 1 && this.targetXmlList[0].indexOf('<cread') === 0) {
		// 読み設定済みのデータを受け取った場合
		var readingNode = $(this.targetXmlList[0])[0];
		var nodeList = readingNode.firstChild.children;

		while (nodeList.length > 0) {
			paraNode.appendChild(nodeList[0]);
		};

		// 読みを反映します
		this.readingBox.value = decodeString(readingNode.getAttribute('yomi'));
		// アクセントを反映します
		this.accentBox.checked = (readingNode.getAttribute('accent_control') === 'true');
	} else {
		// 読み未設定のデータを受け取った場合
		for (var i = 0; i < this.targetXmlList.length; i++) {
			var newNode = $(this.targetXmlList[i])[0];
			paraNode.appendChild(newNode);
		};

		// 読みを反映します
		this.readingBox.value = '';
		// アクセントのデフォルトを設定します
		this.accentBox.checked = true;
	};

	// html を作成し、指定ノードに出力します
	DataClass.bindDataClassMethods(paraNode);
	paraNode.align = PARAGRAPH_ALIGN.center;
	var html = paraNode.toHtml(null);

	this.view.innerHTML = html;
	$('#1').css('margin-top', '0.3em');

	// MathJAX を適用します
	MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.view.id]);

	// 検索のために、表示用に作成した段落データを登録します
	this.paragraphNode = paraNode;
};
