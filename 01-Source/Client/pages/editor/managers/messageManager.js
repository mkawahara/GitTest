/**
 * ダイアログとの通信を担うクラスです。
 */

function MessageManager() {};


/**************************************************************
 * 読み上げ機能の可否
 **************************************************************/

/**
 * 読み上げ機能が有効か否かを取得します。
 * ページ表示時に辞書登録に失敗している場合、false が返ります。
 */
MessageManager.isEnableReading = function() {
	return ReadManager.instance.Enable;
};

/**************************************************************
 * ID取得
 **************************************************************/

/**
 * 文書IDおよびユーザIDを取得します。（非推奨）
 */
MessageManager.getDocumentId = function() {
	var docId = DocumentManager.instance.documentId;
	var userData = getUser();

	/*if (userData === null) {
		userData = { id: -1, };
	} else {
		alert('messageManager.js の getDocumentId をサーバ用に修正しましたか？');
	}*/

	return {
		docId: docId,
		userId: userData.id,
	};
};

/**
 * ユーザIDを取得します。
 */
MessageManager.getUserId = function() {
    var userData = getUser();
    return (userData === null) ? null : userData.id;
};

/**
 * 文書情報（IDとファイル名）を取得します。
 */
MessageManager.getDocumentInfo = function() {
    return {
        docId: DocumentManager.instance.documentId,
        fileName: DocumentManager.instance.fileName,
    }
};


/**************************************************************
 * テーブル作成ダイアログ
 **************************************************************/

/**
 * 指定した列・行数で、現在のカーソル位置に新しいテーブルを挿入します。
 */
MessageManager.createTable = function(colCount, rowCount) {
	var editorPane = ViewManager.getEditorPane();                        // エディタペーン取得

	UiCommandWrapper.insertTable(colCount, rowCount);                    // テーブル作成

	ViewManager.getRenderer().update();                                  // レンダラ update
	editorPane.updateCaret();                                            // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                                      // キャレットをフォーカス
};


/**************************************************************
 * 検索･置換、ルビ、読みダイアログ
 **************************************************************/

// 検索、置換、ルビ、読み設定で使用する静的変数
MessageManager.preSearchXml  = '<paragraph><br/></paragraph>';
MessageManager.preReplaceXml = '<paragraph><br/></paragraph>';
MessageManager.preSectionIndex = -1;

/**
 * 選択範囲のデータノードを表す json 文字列を取得します。
 * @param mode 'ruby', 'read' のいずれかを指定しておくと、
 *             対象範囲にルビ、読みが設定されていれば、
 *             それに応じた範囲を返す。その他は選択範囲となる。
 *             ※ ダイアログを開く時に選択範囲を作成するようにしたため、意味はありません。
 */
MessageManager.getSelectedRange = function(mode) {
	var json = EditManager.instance.SelectedRangeManager.getJsonText(mode);

	// 選択範囲がない場合、null を返します
	if (json === null) return null;
	console.log('Json:', JSON.stringify(json));

	return json;
};

/**
 * 検索・置換ダイアログの入力内容をエディタページに保持させます。
 * @param upper		検索・置換対象文字列
 * @param bottom	置換後文字列（null の場合、保存されない）
 */
MessageManager.saveSearchXml = function(upper, bottom) {
	MessageManager.preSearchXml  = upper;
	MessageManager.preReplaceXml = bottom;
};

/**
 * 検索・置換ダイアログの前回の入力内容をエディタページから取得します。
 */
MessageManager.getSearchXml = function() {
	// return { 検索用, 置換用 }
	var result = {};
	result.preSearchXml  = MessageManager.preSearchXml;
	result.preReplaceXml = MessageManager.preReplaceXml;
	return result;
};

// キャレットを先頭に配置します。
MessageManager.setCaretToTop = function() {
	// 現在のセクションを取得します
	var section = DocumentManager.getCurrentSection();
	var caret   = ViewManager.getEditorPane().getCaret();
	caret.pos = section.firstChild.firstChild;
};


/**
 * 現在の選択範囲・カーソル位置の前後から検索を実行します。
 * @param paraNode		検索データを保有する段落ノード
 * @param isNext		true: 後方検索 false:前方検索
 * @param isMatchCase	true: 大文字小文字を区別する
 */
MessageManager.searchNext = function(paraNode, isNext, isMatchCase, disableAlert) {
	if (disableAlert === void 0) disableAlert = false;
	var startNode = null;
	var endNode   = null;

	// 現在のセクションを取得します
	var section = DocumentManager.getCurrentSection();

	// SelectedRangeManager から選択範囲を取得します
	var selectedRange = EditManager.instance.SelectedRangeManager.getSelectedRange();
	if (selectedRange !== null) {
		//var selectedNodeList = selectedRange.getSelectedRange();
		startNode = selectedRange[0];
		endNode = selectedRange[selectedRange.length - 1];
	};

	// 選択範囲がなければ、カーソル位置を取得します
	if (startNode === null) {
		var caretPos = ViewManager.getEditorPane().getCaret().pos;
		// カーソルがなかった場合、現在のセクションの先頭から検索を開始します
		if (caretPos === '') caretPos = section.children[0].children[0].id;
		var jPosNode = $(section).find('#' + caretPos);
		if (jPosNode.length <= 0) {
			console.log('検索起点となる ID: ' + caretPos + ' のノードが見つかりません。');
			return;
		}

		startNode = jPosNode[0];
		endNode = jPosNode[0];
	};

	// 検索開始位置を決定します
	if (isNext) {
		// 次へ検索二回目
		if (SearchManager.instance.IsSearched) startNode = MessageManager.getNextNode(endNode);
		// 次へ検索初回：何もしません。
	}
	else {
		// 前へ検索二回目
		if (SearchManager.instance.IsSearched) startNode = MessageManager.getPreviousNode(startNode);
		// 前へ検索初回：何もしません。
	}
	console.log('★検索開始位置：', startNode , startNode.textContent, endNode, endNode.textContent);
	console.log('継続検索か否か：', SearchManager.instance.IsSearched);

	// SearchManager により検索を実行します
	var result = null;
	if (isNext) {
		result = SearchManager.instance.next(section, startNode, paraNode.outerHTML, isMatchCase);
	} else {
		result = SearchManager.instance.previous(section, startNode, paraNode.outerHTML, isMatchCase);
	}
	if (!result) {
		if (!disableAlert) showMessageDialog('検索が終了しました。', 'メッセージ');
		return false;
	}

	// セクションが変更されていた場合、セクションの表示切り替えを行います
	if (section !== result.section) {
		// セクションインデックスを取得します
		var currentSectionIndex = DataClass.getNodeIndex(result.section, section.parentNode.children);

		// セクションペインを更新します
		IndexToolClass.moveSectionWithIndex(currentSectionIndex);
		ViewManager.getRenderer().setUpdateSectionPane();

		// カレントセクションを変更します
		DocumentManager.setCurrentSection(currentSectionIndex);

		// エディタペインを更新します
		ViewManager.getRenderer().render(currentSectionIndex);
	}

	// 検索結果を基に、選択範囲を作成します
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	selectedRangeManager.clearSelectedRange(false);
	selectedRangeManager.startSelect(result.top);
	selectedRangeManager.updateSelectedRange(result.end.nextSibling);

	console.log('★', startNode.id, result.top.id, result.end.id);

	// 表示を更新します
	ViewManager.getRenderer().update();

	// カーソルを移動させ、スクロールを行います
	var editorPane = ViewManager.getEditorPane();
	var scrollManager = editorPane.getScrollManager();
	editorPane.getCaret().pos = selectedRangeManager.selectedRange.startNode.id;
	scrollManager.SetFocusNode(editorPane.getCaret().pos);
	scrollManager.ScrollToFocusNode();
	editorPane.updateCaret();
	console.log('スクロール');

	return true;
};

MessageManager.getNextNode = function(node) {
	// 改行が検索結果に含まれることはないため、確実に１行目が実行される
	if (node.nextSibling !== null) return node.nextSibling;
	return null;	// この行は実行されません
};

MessageManager.getPreviousNode = function(node) {
	do {
		// 兄ノードが存在すれば、その子孫の最終要素を取得します
		if (node.previousSibling !== null) {
			var prevNode = node.previousSibling;
			DataClass.bindDataClassMethods(prevNode);
			return prevNode.getLastOffspring();
		}

		// 兄ノードがいなければ、親ノードを取得します
		node = node.parentNode;
	}
	while (node !== null);

	return null;
};

MessageManager.multiTargetInfo = null; // 全置換、全ルビ・読み用

MessageManager.prepareReplaceAll = function(resetFlag, before, after, isEdge) {
	if (resetFlag) {
		MessageManager.multiTargetInfo = null;
		return;
	}

	// Edge の場合、xml で受け取ったノードデータをパースします
	if (isEdge) {
		before = $(before)[0];
		after = $(after)[0];
	}

	// ---- 選択範囲を取得します
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	var nodeList = selectedRangeManager.getSelectedRange();
	// ---- 選択範囲が置換前データに一致するか確認します
	var beforeChildren = before.children;
	var childCount = beforeChildren.length;
	for (var i = 0; i < childCount; i++) {
		var localSrcNode  = beforeChildren[i];
		var localDistNode = nodeList[i];
		// 各種判定
		var isNameOK = (localSrcNode.nodeName    == localDistNode.nodeName);    // ノード名
		var isTextOK = (localSrcNode.textContent == localDistNode.textContent); // テキスト
		if (!isNameOK || !isTextOK) return; // 一致しなければ何もせず return;
	}

	// 置換先文字ノードを用意します。
	var replaceNodeList   = [];
	var replaceChildCount = after.children.length;
	DataClass.remapDataNodeId(after.children);
	for (var j = 0; j < replaceChildCount; j++) {
		replaceNodeList.push(after.children[j]);
	}

	// ---- ノードリストを記録
	if (MessageManager.multiTargetInfo === null) {
		MessageManager.multiTargetInfo = [];
	}
	var localInfo = {selectedNodeList : nodeList, replaceNodeList : replaceNodeList};
	MessageManager.multiTargetInfo.push(localInfo);
};

MessageManager.replaceAll= function() {
	var editorPane = ViewManager.getEditorPane();                        // エディタペーン取得

	UiCommandWrapper.replaceAll(MessageManager.multiTargetInfo);         // 全置換

	ViewManager.getRenderer().update();                                  // レンダラ update
	editorPane.updateCaret();                                            // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                                      // キャレットをフォーカス
};


/***************************************************
 * 現在の選択範囲が一致すれば置換します。
 * @param before	置換前データを表す段落ノード
 * @param after		置換後データを表す段落ノード
 * @param isMatchCase	true: 大文字小文字を区別する
 * @param isEdge	true の場合、before, after はノードを表す xml 文字列
 */
MessageManager.replaceText = function(before, after, isMatchCase, isEdge) {
	// Edge の場合、xml で受け取ったノードデータをパースします
	if (isEdge) {
		before = $(before)[0];
		after = $(after)[0];
	}

	// ---- 選択範囲を取得します
	var selectedRangeManager = EditManager.instance.SelectedRangeManager;
	var nodeList = selectedRangeManager.getSelectedRange();

	// ---- 選択範囲が置換前データに一致するか確認します
	var beforeChildren = before.children;
	var childCount = beforeChildren.length;
	for (var i = 0; i < childCount; i++) {
		var localSrcNode  = beforeChildren[i];
		var localDistNode = nodeList[i];
		// 各種判定
		var isNameOK = (localSrcNode.nodeName    == localDistNode.nodeName);    // ノード名
		var isTextOK = (localSrcNode.textContent == localDistNode.textContent); // テキスト
		if (!isNameOK || !isTextOK) return; // 一致しなければ何もせず return;
	}

	// ---- 置換を実行し、選択範囲をクリアします
	var replaceNodeList   = [];
	var replaceChildCount = after.children.length;
	DataClass.remapDataNodeId(after.children);
	for (var j = 0; j < replaceChildCount; j++) {
		replaceNodeList.push(after.children[j]);
	}

	var editorPain = ViewManager.getEditorPane();
	var caret      = editorPain.getCaret();               // 現在のキャレット
	var comObj     = EditManager.getCommandExecutor();    // commandExecutor インスタンス取得
	var replaceObj = new ReplaceCommand(replaceNodeList, caret); // 置換
	comObj.execute(replaceObj);                           // 置換・ペースト実行
	ViewManager.getRenderer().update();

	// カーソルを置換後文字列の後に配置します
	var editorPane = ViewManager.getEditorPane();
	editorPane.updateCaret();       // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();

	console.log('MessageManager.replaceTextへ来ました。');
};

/**
 * 連続検索が途切れたことを文書編集ページに通知します
 */
MessageManager.clearSerialSearch = function() {
	SearchManager.instance.IsSearched = false;
};

// メッセージマネージャーへ、変換結果をまとめさせます。
MessageManager.prepareRubyTypeAll = function(resetFlag, read, accent) {
	if (resetFlag) {
		MessageManager.multiTargetInfo = null;
		return;
	}
	var editorPane = ViewManager.getEditorPane();                            // エディタペーン取得
	var nodeList   = EditManager.getSelectedRangeManager().getBoxNodeList(); // 選択範囲取得
	if (MessageManager.multiTargetInfo === null) {
		MessageManager.multiTargetInfo = {};
		MessageManager.multiTargetInfo.optionalStr = read;
		MessageManager.multiTargetInfo.optionalAccent = accent;
		MessageManager.multiTargetInfo.nodeListArr = [];
	}
	MessageManager.multiTargetInfo.nodeListArr.push(nodeList);
};

/***************************************************
 * 現在の選択範囲が一致すればルビを設定します。
 * @param xmlList
 * @param ruby	設定するルビ文字列。空文字列の場合、対象に設定されているルビが解除されます。
 */
MessageManager.setRubyAll = function() {
	if (MessageManager.multiTargetInfo === null) return;
	var editorPane = ViewManager.getEditorPane();                        // エディタペーン取得

	var ruby        = MessageManager.multiTargetInfo.optionalStr;
	var nodeListArr = MessageManager.multiTargetInfo.nodeListArr;
	UiCommandWrapper.setRubyAll(nodeListArr, ruby);                      // ルビ設定実行

	if (MessageManager.preSectionIndex != DocumentManager.getCurrentSectionIndex()) ViewManager.getRenderer().setUpdateEditorPane();
	ViewManager.getRenderer().update();                                  // レンダラ update
	editorPane.updateCaret();                                            // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                                      // キャレットをフォーカス
};

/***************************************************
 * 現在の選択範囲が一致すればルビを設定します。
 * @param xmlList
 * @param ruby	設定するルビ文字列。空文字列の場合、対象に設定されているルビが解除されます。
 */
MessageManager.setRuby = function(xmlList, ruby) {
	var editorPane = ViewManager.getEditorPane();                            // エディタペーン取得
	var nodeList   = EditManager.getSelectedRangeManager().getBoxNodeList(); // 選択範囲取得

	var selectFlag = true;                                                   // 選択範囲があったかどうか
	if (!nodeList.length) {                                              // ---- 選択範囲がなかったら
		nodeList   = [ DocumentManager.getNodeById(editorPane.getCaret().pos) ]; // キャレット位置のノード取得
		selectFlag = false;                                                      // 選択範囲があったかどうか→なかった
	}
	UiCommandWrapper.setRuby(nodeList, ruby, selectFlag);                // ルビ設定実行

	ViewManager.getRenderer().update();                                  // レンダラ update
	editorPane.updateCaret();                                            // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                                      // キャレットをフォーカス
};



/***************************************************
 * 現在の選択範囲が一致すれば読みを設定します。
 * @param xml
 * @param read	設定する読み文字列。空文字列の場合、対象に設定されている読みが解除されます。
 */
MessageManager.setReadingAll = function() {
	if (MessageManager.multiTargetInfo === null) return;

	var editorPane = ViewManager.getEditorPane();                        // エディタペーン取得

	var read        = MessageManager.multiTargetInfo.optionalStr;
	var accent		= MessageManager.multiTargetInfo.optionalAccent;
	var nodeListArr = MessageManager.multiTargetInfo.nodeListArr;
	UiCommandWrapper.setReadingAll(nodeListArr, read, accent);			// 読み設定実行

	if (MessageManager.preSectionIndex != DocumentManager.getCurrentSectionIndex()) ViewManager.getRenderer().setUpdateEditorPane();
	ViewManager.getRenderer().update();                                  // レンダラ update
	editorPane.updateCaret();                                            // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                                      // キャレットをフォーカス
};

/***************************************************
 * 現在の選択範囲が一致すれば読みを設定します。
 * @param xml
 * @param read		設定する読み文字列。空文字列の場合、対象に設定されている読みが解除されます。
 * @param accent	アクセント制御スイッチ
 */
MessageManager.setReading = function(xml, read, accent) {
	var editorPane = ViewManager.getEditorPane();								// エディタペーン取得
	var nodeList   = EditManager.getSelectedRangeManager().getBoxNodeList();	// 選択範囲取得

	var selectFlag = true;                                                   // 選択範囲があったかどうか
	if (!nodeList.length) {                                              // ---- 選択範囲がなかったら
		nodeList   = [ DocumentManager.getNodeById(editorPane.getCaret().pos) ]; // キャレット位置のノード取得
		selectFlag = false;                                                      // 選択範囲があったかどうか→なかった
	}
	UiCommandWrapper.setReading(nodeList, read, selectFlag, accent);			// 読み設定実行

	ViewManager.getRenderer().update();                                  // レンダラ update
	editorPane.updateCaret();                                            // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                                      // キャレットをフォーカス
};

/**
 * レンダラーに編集開始前のセクションを登録します
 */
MessageManager.setPreRenderSection = function() {
	ViewManager.getRenderer().setPreUpdateSectionIndex();
	MessageManager.preSectionIndex = DocumentManager.getCurrentSectionIndex();
};


/**************************************************************
 * エディタ設定ダイアログ
 **************************************************************/

/**
 * エディタ設定文字列を xml 文字列で取得します。
 */
MessageManager.getEditorSetting = function() {
	return ConfigManager.instance.getSettingXml();
};

/**
 * エディタ設定を xml 文字列で ConfigManager に保存します。
 * @param xml
 */
MessageManager.setEditorSetting = function(xml) {
	ConfigManager.instance.setXml(xml);
	ConfigManager.instance.save();
};


/**************************************************************
 * 文書設定ダイアログ
 **************************************************************/

/**
 * 文書プロパティを json オブジェクトで取得します。
 */
MessageManager.getDocumentProperty = function() {
	var json = {
		title: '',
		font: '',
		fontSize: '',
	};

	var docProp = DocumentManager.getCurrentDocumentProperty();
	if (docProp !== null) {
		json.title = docProp.title,
		json.font = docProp.font;
		json.fontSize = docProp.fontSize;
	};

	return json;
};

/**
 * 文書プロパティを json オブジェクトで保存します。
 * @param json
 */
MessageManager.setDocumentProperty = function(json) {
	// 文書に設定を反映します
	var docProp = DocumentManager.getCurrentDocumentProperty();
	docProp.font = json.font;
	docProp.fontSize = json.fontSize;

	// エディタ設定に反映します
	if (json.asDefault) {
		ConfigManager.instance.FontSize = json.fontSize;
		ConfigManager.instance.FontName = json.font;
		ConfigManager.instance.save();
	};

	// 表示を更新します
	Renderer.updateStyleClass();

	// 編集フラグを設定します
	StatusManager.setSaveAttribute(true);
};


/**************************************************************
 * 画像設定ダイアログ
 **************************************************************/

/**
 * 画像プロパティを json で取得します。
 */
MessageManager.getImageProperty = function(nodeId) {
	// return string
	// ★
	var documentDom = DocumentManager.getDocument();
	var imageNode = $(documentDom).find('#' + nodeId);

	if (imageNode.length <= 0) return '';

	var imageNode = imageNode[0];
	DataClass.bindDataClassMethods(imageNode);

	var json = {
		title: imageNode.title,
		alt: imageNode.alttext,
		reading: imageNode.readingtext,
		animeId: imageNode.animationId,
		width: imageNode.width,
		height: imageNode.height,
	};

	return json;
};



/**
 * 画像プロパティを json で保存します。
 * @param xml
 */
MessageManager.setImageProperty = function(json) {
	// json.id     : 画像ノードの ID
	// json.width  : 画像の幅
	// json.height : 画像の高さ
	// json.title  : 画像のタイトル
	// json.alt    : 画像の代替えテキスト
	// json.read   : 読み文字列
	var editorPane = ViewManager.getEditorPane();         // エディタペーン取得

	var imageNode = DocumentManager.getNodeById(json.id);
	UiCommandWrapper.setImageProperty(imageNode, json);   // 画像設定実行

	console.log('Image用処理');                           // 画像用ウェィト

	ViewManager.getRenderer().update();                   // レンダラ update
	editorPane.updateCaret();                             // カーソルの表示位置を更新します
	editorPane.FocusFrontTextBox();                       // キャレットをフォーカス
};



/**************************************************************
 * アニメーション編集設定ダイアログ
 **************************************************************/

/**
 * アニメーション サムネイルをデータ URL文字列で取得します。
 */
MessageManager.getThumnail = function(nodeId) {
	// 編集中の文書データのルートノードを取得します
	var section = DocumentManager.getCurrentSection();

	// 指定されたIDを有する ImageElement を検索します
	// 見つからなければ、null を返します
	var jnode = $(section).find('#' + nodeId);
	if (jnode.length <= 0) return null;

	var imgNode = jnode[0];
	DataClass.bindDataClassMethods(imgNode);

	// ImageElement の画像データを取得します
	return imgNode.data;
};

/**
 * アニメーション サムネイルをデータ URL文字列で更新します。
 * @param nodeId
 * @param animeId		アニメーションが削除される時は null を指定します
 * @param image
 * @param readingText	animeId に null が指定された時に静止画に設定する読みテキスト
 */
MessageManager.updateThumnail = function(nodeId, animeId, image, readingText) {
	// 編集中の文書データのルートノードを取得します
	var section = DocumentManager.getCurrentSection();

	// 指定されたIDを有する ImageElement を検索します
	// 見つからなければ、null を返します
	var jnode = $(section).find('#' + nodeId);
	if (jnode.length <= 0) return null;

	var imgNode = jnode[0];
	DataClass.bindDataClassMethods(imgNode);

	// ImageElement の画像データを更新します
	imgNode.data = image;
	imgNode.animationId = animeId;

	if ((animeId === null) || (animeId === void 0)) {
		imgNode.readingtext = readingText;
	}

	// 画像が存在している段落を取得します
	var paraNode = DataClass.getRootParagraph(imgNode);

	// レンダラーに更新を要求します
	ViewManager.getRenderer().setUpdatedParagraph(paraNode);
	ViewManager.getRenderer().update();

	// 編集フラグを設定します
	StatusManager.setSaveAttribute(true);
};


/**************************************************************
 * 辞書編集ダイアログ
 **************************************************************/

/**
 * 新しい単語を辞書に登録します。
 * ダイアログが開いていなかった場合は開きます。
 * ※同名のメソッドが、辞書編集ダイアログにも必要です。
 * @param word
 */
MessageManager.registNewWord = function() {
	// 選択範囲から文字列を取得します (textContentで十分です)
	var word = EditManager.instance.SelectedRangeManager.getSelectedText();
	if (word == null || word == '') {
	    showMessageDialog('登録するテキストを範囲選択してください');
	    return;
	}

	// 既に辞書編集ページが開いていれば、ページのメソッドを呼び出します
	if (WindowManager.instance.isOpened) {
		// ★★ここは辞書編集ページのメソッド呼び出しのため、定義が来るまで実装不可。
	    var dialog = WindowManager.instance.dicEditWindow;
	    var message = {'method' : 'add', 'word' : word};
	    dialog.postMessage(JSON.stringify(message), '*');
	    dialog.focus();
	}
	// 辞書編集ページが開いていなければ、GETパラメータ付きで辞書編集ページを開きます
	else {
		WindowManager.instance.openDicEditWindow(word);
	}
};


/**************************************************************
 * 別文書挿入ダイアログ
 **************************************************************/

/**
 * 指定文書をサーバから取得し、編集中の文書に挿入します。
 */
MessageManager.insertDocument = function(docInfo) {
	// DocumentManager に別文書読み込みを指示します
	DocumentManager.getAdditionalDocument(docInfo);
};

/**************************************************************
 * 再ログイン ウィンドウ
 **************************************************************/

/**
 * 接続維持用のpingを再開します
 */
MessageManager.restartPing = function() {
	if (!ServerManager.Disconnected) return;

	ServerManager.resetUpdateSession();
	setTimeout('ServerManager.updateSession()', 300000);
};


/**************************************************************
 * 辞書選択ダイアログ
 **************************************************************/

/**
 * 編集画面で表示する辞書名を設定します。
 */
MessageManager.setDictionaryName = function(dictionaryName) {
    _docDicTitleLabel.textContent = dictionaryName;
}


/**************************************************************
 * 音声設定選択ダイアログ
 **************************************************************/

/**
 * 編集画面で表示する音声設定名を設定します。
 */
MessageManager.setVoiceSettingName = function(voiceSettingName) {
    _docAudioSettingTitleLabel.textContent = dictionaryName;
}


