function ClipboardManager() {
	this.inputParts = null;	// 入力用 span タグの記録
};

//////////////////////////////////////////////////////////////////////////
// シングルトン

ClipboardManager._instance = null;

Object.defineProperty(ClipboardManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ClipboardManager._instance === null) ClipboardManager._instance = new ClipboardManager();
		return ClipboardManager._instance;
	},
	});

//////////////////////////////////////////////////////////////////////////

/**
 * クリップボードに指定されたデータを保存します。
 * データは SelectedRange が出力する json です。
 */
ClipboardManager.prototype.setData = function(event, jsonData) {
	// Web Strage にデータを保存します
	//var jsonStr = JSON.stringify(jsonData);
	StorageManager.instance.save(StorageManager.instance.keyList.CLIPBOARD, jsonData);

	// OS のクリップボードにプレーンテキストを保存します
	var plainText = jsonData.text;
	var clipboard = event.clipboardData;
	if (clipboard === void 0) clipboard = window.clipboardData;
	clipboard.setData('text', plainText);
};


//////////////////////////////////////////////////////////////////////////

/**
 * クリップボードからデータを取得します。
 * @param inputbox	画像データを有する 入力部品 (通常、入力用インプットボックス)
 */
ClipboardManager.prototype.getData = function(event, inputbox, inputText) {
	var result = null;

	// クリップボードを取得します
	//var clipboard = event.clipboardData;
	//if (clipboard === void 0) clipboard = window.clipboardData;

	// クリップボードとストレージからデータを取得します
	//var clipText = clipboard.getData('text');
//	var clipText = inputbox.textContent;
	var clipText = (inputText !== void 0) ? inputText : inputbox.textContent;

	var strageData = StorageManager.instance.load(StorageManager.instance.keyList.CLIPBOARD);

	// span 要素中に img 要素が含まれているか調べます
	if (ClipboardManager.hasImageNode(inputbox)) {
		// img 要素が含まれていた場合
		// img 要素の src を取得し、ImageElement を作成します
		result = ClipboardManager.createFromImg(inputbox.children[0]);
		console.log('Copy from Image.');
	}
	else if ((strageData === null) || (strageData.text !== clipText)) {
		// クリップボード上の文字列と Web Storage 上のプレーンテキストを比較します
		// 一致しなかった場合、改行が含まれているか判定します。
		if (ClipboardManager.hasBr(clipText)) {
			// 改行が含まれていた場合、段落を含むノードリストを作成します。
			result = ClipboardManager.createFromPlainTextWithBr(clipText);
		}
		else {
			// 改行が含まれていなかった場合、段落を含まないノードリストを作成します。
			result = ClipboardManager.createFromPlainText(clipText);
		}
		console.log('Copy from Plain text.');
	}
	else {
		// クリップボード上の文字列と Web Storage 上のプレーンテキストが一致した場合、
		// Web Storage 上の xml をそのまま取得します。
		result = ClipboardManager.createFromXml(strageData);
		//result = strageData;
		console.log('Copy from Web Storage.');
	}

	// span 要素を空にします
	inputbox.innerHTML = '';

	// 取得結果を返します
	return result;
};

/**
 * 指定ノードが img 要素を有するか確認します
 * @param node
 * @returns {Boolean}
 */
ClipboardManager.hasImageNode = function(node) {
	if (node.children.length === 0) return false;
	if (node.children[0].nodeName !== 'IMG') return false;
	return true;
};

/**
 * 指定テキストが改行を有するか確認します
 * @param text
 */
ClipboardManager.hasBr = function(text) {
	return (text.indexOf('\n') >= 0);
};


/***********************************************************
 * img 要素から ImageElement を含む戻り値を作成します
 * @param img
 * @returns
 */
ClipboardManager.createFromImg = function(img) {
	var cimg = ImageElement.createNew(img.src);

	var result = {
		prevsize: 1,
		nodeList: [cimg],
	};

	return result;
};

/***********************************************************
 * 改行を有さないテキストから戻り値を作成します
 * @param text
 */
ClipboardManager.createFromPlainText = function(text) {
	// 文字を全て CharacterElement のリストに変換します。
	var list = [];

	for (var i = 0; i < text.length; i++) {
		list.push(CharacterElement.createNew(text.substr(i, 1)));
	};

	var result = {
		prevsize: list.length,
		nodeList: list,
	};

	return result;
};

/***********************************************************
 * 改行を有するテキストから戻り値を作成します
 */
ClipboardManager.createFromPlainTextWithBr = function(text) {
	var workingList = [];
	var list = [];

	for (var cidx = 0; cidx < text.length; cidx++) {
		var char = text.substr(cidx, 1);

		if (char === '\r') continue;
		if (char !== '\n') {
			// 改行までの文字を CharacterElement のリストに変換します
			workingList.push(CharacterElement.createNew(char));
		} else {
			// 改行が見つかれば、段落要素を作成し、作業リスト上のノードを登録します
			var paraNode = Paragraph.createNew(true);

			for (var i = 0; i < workingList.length; i++) {
				paraNode.appendChild(workingList[i]);
			}

			// 段落末端の改行を追加します
			paraNode.appendChild(LineBreak.createNew());

			// 段落ノードを登録します
			list.push(paraNode);

			// 作業リストをクリアします
			workingList = [];
		}
	};

	// 全てのテキストを処理し終えたら、作業リスト上のノードを結果リストに直接登録します
	for (var i = 0; i < workingList.length; i++) {
		list.push(workingList[i]);
	}

	// 結果を作成して返します
	var result = {
		prevsize: 0,
		nodeList: list,
	};

	return result;
};

/***********************************************************
 * Web Strage に保存されていた json から戻り値を作成します
 */
ClipboardManager.createFromXml = function(jsonData) {
	//var jsonData = JSON.parse(jsonStr);
	var prevCount = jsonData.prevsize;
	var xmlList = jsonData.nodeList;

	var nodeList = [];

	for (var i = 0; i < xmlList.length; i++) {
		var node = $(xmlList[i])[0];

		// ID は削除されているので追加し直します
		if (node.nodeName === 'PARAGRAPH') {
			ParagraphParser.setNewParagraphId(node);
		} else {
			ParagraphParser.setNewId(node);
		}

		nodeList.push(node);
	};

	// 結果を作成して返します
	var result = {
		prevsize: prevCount,
		nodeList: nodeList,
	};

	return result;
};


////////////////////////////////////////////////////////////////////////
// 外部から呼び出され、入力用 span の中に隠し選択範囲を作成・削除します
////////////////////////////////////////////////////////////////////////

/**
 *
 */

ClipboardManager.prototype.setHideSelectedNode = function(spanNode) {
	this.inputParts = spanNode;

//	var newNode = $('<span>1</span>')[0];
	var newNode = $('<span style="display: none;">1</span>')[0];

	// ノードのクリアと新規登録を行います
	spanNode.innerHTML = '';
	spanNode.appendChild(newNode);

	// 新しく作成したノードを選択状態にします
	var selection = window.getSelection();
	var range = document.createRange();

	range.setStart(spanNode, 0);
	range.setEnd(spanNode, 1);

	selection.removeAllRanges();
	selection.addRange(range);

	// フォーカスを設定します
	spanNode.focus();
};

ClipboardManager.prototype.clearHideSelectedNode = function() {
	if (this.inputParts === null) return;

	// ノードのクリアと新規登録を行います
	this.inputParts.innerHTML = '';

	// フォーカスを設定します
	this.inputParts.focus();
};
