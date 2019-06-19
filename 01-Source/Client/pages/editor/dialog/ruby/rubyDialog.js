/**
 * ルビ設定ダイアログ用クラスです。
 * 各コントロールへの参照や、編集ページから取得したデータの管理を行います
 */

function RubyDialog() {
	// ルビ設定対象のデータノードを表す xml 文字列
	// 対象文字列の編集機能はありませんが、検索のために以下の構造でデータは保持されます
	// 段落 - [データノード、データノード、データノード] (末端の改行は有さない)
	this.targetXmlList = [];
	this.view = null;
	this.rubyBox = null;

	this.paragraphNode = null;
};

RubyDialog._instance = null;

Object.defineProperty(RubyDialog, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (RubyDialog._instance === null) RubyDialog._instance = new RubyDialog();
		return RubyDialog._instance;
	},
});

Object.defineProperty(RubyDialog.prototype, 'View', {
	enumerable: true,
	configurable: true,
	set: function(value){
		this.view = value;
	},
});

Object.defineProperty(RubyDialog.prototype, 'RubyBox', {
	enumerable: true,
	configurable: true,
	set: function(value){
		this.rubyBox = value;
	},
});

Object.defineProperty(RubyDialog.prototype, 'XmlList', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.targetXmlList; },
});

Object.defineProperty(RubyDialog.prototype, 'ParaNode', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.paragraphNode; },
});

/**
 * ルビ設定対象文字列を取得します。
 */
RubyDialog.prototype.getTargetText = function() {
	// 親ウィンドウからデータを取得します。
	var json = window.opener.MessageManager.getSelectedRange('ruby');

	if (json === null) {
		this.view.innerHTML = '';
		this.rubyBox.value = '';
		return;
	}

	// ノード情報が収められた xml 文字列だけを取得します
	this.targetXmlList = json.nodeList;

	// 段落ノードを作成します
	var paraNode = Paragraph.createNew(true);

	// 段落ノードに取得した xml から作成したノードを登録します
	if (this.targetXmlList.length === 1 && this.targetXmlList[0].indexOf('<cruby') === 0) {
		// ルビ設定済みのデータを受け取った場合
		var rubyNode = $(this.targetXmlList[0])[0];
		var nodeList = rubyNode.firstChild.children;

		while (nodeList.length > 0) {
			paraNode.appendChild(nodeList[0]);
		};

		// ルビを反映します
		this.rubyBox.value = decodeString(rubyNode.getAttribute('ruby'));
	} else {
		// ルビ未設定のデータを受け取った場合
		for (var i = 0; i < this.targetXmlList.length; i++) {
			var newNode = $(this.targetXmlList[i])[0];
			paraNode.appendChild(newNode);
		};

		// ルビを反映します
		this.rubyBox.value = '';
	};

	// html を作成し、指定ノードに出力します
	DataClass.bindDataClassMethods(paraNode);
	paraNode.align = PARAGRAPH_ALIGN.center;
	var html = paraNode.toHtml(null);
	console.log(html);

	this.view.innerHTML = html;
	$('#1').css('margin-top', '0.3em');

	// MathJAX を適用します
	MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.view.id]);

	// 検索のために、表示用に作成した段落データを登録します
	this.paragraphNode = paraNode;
};
