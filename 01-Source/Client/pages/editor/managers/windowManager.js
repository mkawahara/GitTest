/**
 * WindowManager クラス
 *
 *
 *
 */


function WindowManager() {
	this.replaceWindow = null;		// 置換ダイアログ
	this.tableWindow = null;		// 表作成ダイアログ
	this.rubyWindow = null;			// ルビ設定ダイアログ
	this.readingWindow = null;		// 読み設定ダイアログ
	this.editorConfigWindow = null;	// 設定ダイアログ
	this.imageSettingWindow = null;	// 画像設定ダイアログ
	this.docSettingWindow = null;	// 文書設定ダイアログ
	this.dicSelectWindow = null;	// 辞書選択ダイアログ
	this.dicInfoWindow = null;		// 辞書情報ダイアログ
    this.dicEditWindow = null;      // 辞書編集ダイアログ
	this.voiceSelectWindow = null;  // 音声設定選択ダイアログ
	this.voiceSettingWindow = null; // 音声設定ダイアログ
	this.animeEditWindow = null;	// アニメーション編集ダイアログ
	this.fileSelectWindow = null;   // ファイル選択ダイアログ
	this.reloginWindow = null;      // 再ログインダイアログ
};

WindowManager._instance = null;

Object.defineProperty(WindowManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (WindowManager._instance === null) WindowManager._instance = new WindowManager();
		return WindowManager._instance;
	},
});


WindowManager.openStableDialog = function(url, name, width, height) {
	var browser = window.navigator;
	var top = window.screenY + window.outerWidth / 4;
	var left = window.screenX + window.outerHeight / 1.5;
	if (browser.userAgent.indexOf('Trident') < 0) {
		return window.open(url, name, 'innerWidth=' + width + ',innerHeight=' + height + ',top=' + top + ',left=' + left + ',menubar=no,location=no,status=no,scrollbars=no,directories=no,dialog=yes');
	} else {
		width += 8;
		height += 30;
		return window.open(url, name, 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',menubar=no,location=no,status=no,scrollbars=no,directories=no,dialog=yes');
	}
}

WindowManager.openDialog = function(url, name, width, height) {
	return window.open(url, name, 'innerWidth=' + width + ',innerHeight=' + height + ',menubar=no,location=no,dependent=yes,status=no,scrollbars=yes');
	//return window.open(url, name, 'innerWidth=' + width + ',innerHeight=' + height + ',menubar=no,location=no,dependent=yes,status=no,scrollbars=no');
}

/*************************************************************
 * ファイル選択ダイアログ
 */
WindowManager.prototype.openFileSelectWindow = function() {
    if ((this.fileSelectWindow === null) || (this.fileSelectWindow.closed)) {
        this.fileSelectWindow = WindowManager.openStableDialog('./dialog/fileSelect/', 'FILE_SELECT_DIALOG', 800, 500);
        this.fileSelectWindow.width = 810;
        this.fileSelectWindow.height = 520;
    };

    this.fileSelectWindow.focus();
}

/*************************************************************
 * 検索・置換ダイアログ
 */

WindowManager.prototype.openReplaceWindow = function(param) {
	if ((this.replaceWindow === null) || (this.replaceWindow.closed)) {
		if (param) {
			this.replaceWindow = WindowManager.openStableDialog('./dialog/replace/?replace=true', 'REPLACE_DIALOG', 450, 290);
	        this.replaceWindow.width = 460;
	        this.replaceWindow.height = 310;
		} else {
			this.replaceWindow = WindowManager.openStableDialog('./dialog/replace/', 'REPLACE_DIALOG', 450, 200);
	        this.replaceWindow.width = 460;
	        this.replaceWindow.height = 220;
		};
	};

	this.replaceWindow.focus();

	// 継続検索フラグをリセットします
	SearchManager.instance.IsSearched = false;
};

WindowManager.prototype.closeReplaceWindow = function() {
	if (this.replaceWindow !== null) this.replaceWindow.close();
};

/*************************************************************
 * 表作成ダイアログ
 */

WindowManager.prototype.openTableWindow = function() {
	if ((this.tableWindow === null) || (this.tableWindow.closed)) {
		this.tableWindow = WindowManager.openStableDialog('./dialog/table/', 'TABLE_DIALOG', 120, 140);
        this.tableWindow.width = 130;
        this.tableWindow.height = 160;
	};

	// ---- 数式添字・行列等の内部へテーブルを作ることはできません。
	var caretPos  = ViewManager.getEditorPane().getCaret().pos;
	var dataDom   = DocumentManager.getDocument();
	var caretNode = $(dataDom).find('#' + caretPos);
	if (caretNode.length <= 0) {
		console.log('表ダイアログを開く前に、カーソル位置の取得に失敗しました。');
		return;
	}
	var parentNode = caretNode[0].parentNode;
	DataClass.bindDataClassMethods(parentNode);
	if (parentNode.nt != CIO_XML_TYPE.text) {
		alert('数式添字や行列内部へ表を作ることはできません。'); // ワーニング
		var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
		editorPane.updateCaret();                     // カーソルの表示位置を更新します
		editorPane.FocusFrontTextBox();               // キャレットをフォーカス
		return;
	}

	this.tableWindow.focus();
};

WindowManager.prototype.closeTableWindow = function() {
	if (this.tableWindow !== null) this.tableWindow.close();
};

/*************************************************************
 * ルビ設定ダイアログ
 */

WindowManager.prototype.openRubyWindow = function() {
	var selectedRange = EditManager.instance.SelectedRangeManager;
	var rubyNode = null;
	// 選択範囲が存在するか確認します
	if (!selectedRange.hasSelectedRange) {
		// 選択範囲が存在しなければ、カーソル位置にルビが設定されているか確認します
		rubyNode = WindowManager._getLayoutNodeAtCaret('cruby');

	} else {
		// 選択範囲が存在する場合でも、選択範囲を囲む同種ノードがあるか調べ、取得を試みます
		var selectedCount = selectedRange.count;
		rubyNode = WindowManager._getLayoutNodeAtNode(
			selectedRange.selectedRange.getSelectedFirstNode(), 'cruby', selectedCount);
	}

	// カーソル・選択範囲を囲むルビが設定されていれば、ルビを選択範囲とします
	if (rubyNode !== null) {
		selectedRange.startSelect(rubyNode);
		selectedRange.updateSelectedRange(rubyNode.nextSibling);
	}

	// 選択範囲がなければ、ウィンドウは表示しません
	if (!selectedRange.hasSelectedRange) return;

	// 複数段落が選択されていたら、ウィンドウは表示しません
	var nodeList = selectedRange.getSelectedRange();
	var paragraphList = DataClass.targetParagraphs(nodeList);
	if (paragraphList.length > 1) {
		alert('複数行に対してルビを振ることはできません。'); // ワーニング
		var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
		editorPane.updateCaret();                     // カーソルの表示位置を更新します
		editorPane.FocusFrontTextBox();               // キャレットをフォーカス
		return;
	}

	// 画像が含まれていたら、ウィンドウは表示しません
	var nodeCount = nodeList.length;
	for (var i = 0; i < nodeCount; i++) {
		var localNode = nodeList[i];
		if (localNode.nodeName == 'CIMG') {
			alert('画像にルビを振ることはできません。'); // ワーニング
			var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
			editorPane.updateCaret();                     // カーソルの表示位置を更新します
			editorPane.FocusFrontTextBox();               // キャレットをフォーカス
			return;
		} else {
			var parentNode = localNode.parentNode;
			DataClass.bindDataClassMethods(parentNode);
			if (parentNode.nt != CIO_XML_TYPE.text) {
				alert('数式添字や行列内部へルビを振ることはできません。'); // ワーニング
				var editorPane = ViewManager.getEditorPane(); // エディタペーン取得
				editorPane.updateCaret();                     // カーソルの表示位置を更新します
				editorPane.FocusFrontTextBox();               // キャレットをフォーカス
				return;
			}
		}
	}

	if ((this.rubyWindow === null) || (this.rubyWindow.closed)) {
		this.rubyWindow = WindowManager.openStableDialog('./dialog/ruby/', 'RUBY_DIALOG', 400, 160);
        this.rubyWindow.width = 410;
        this.rubyWindow.height = 180;
	};

	this.rubyWindow.focus();

	// 選択範囲表示を更新します
	ViewManager.getRenderer().update();
	// 継続検索フラグをリセットします
	SearchManager.instance.IsSearched = false;
};

WindowManager.prototype.closeRubyWindow = function() {
	if (this.rubyWindow !== null) this.rubyWindow.close();
};

/**
 * カーソル位置に存在する指定名のレイアウトノードを取得します。
 * 取得できなければ、nullが返ります
 * @param layoutName
 * @returns
 */
WindowManager._getLayoutNodeAtCaret = function(layoutName) {
	var caretPos = ViewManager.getEditorPane().getCaret().pos;
	var dataDom = DocumentManager.getDocument();
	var caretNode = $(dataDom).find('#' + caretPos);
	if (caretNode.length <= 0) {
		console.log('ルビダイアログを開く前に、カーソル位置の取得に失敗しました。');
		return;
	}

	return WindowManager._getLayoutNodeAtNode(caretNode[0], layoutName);

	caretNode = caretNode[0];

	var targetLayoutNode = caretNode;
	while ((targetLayoutNode !== null) && (targetLayoutNode.nodeName.toLowerCase() !== layoutName)) {
		targetLayoutNode = targetLayoutNode.parentNode;
	}

	return targetLayoutNode;
};

WindowManager._getLayoutNodeAtNode = function(node, layoutName, selectedCount) {
	var targetLayoutNode = node;
	while ((targetLayoutNode !== null) && (targetLayoutNode.nodeName.toLowerCase() !== layoutName)) {
		targetLayoutNode = targetLayoutNode.parentNode;
	}
	if (node === targetLayoutNode && selectedCount > 1) return null;

	return targetLayoutNode;
};


/*************************************************************
 * 読み設定ダイアログ
 */

WindowManager.prototype.openReadingWindow = function() {
	var selectedRange = EditManager.instance.SelectedRangeManager;
	var readNode = null;
	// 選択範囲が存在するか確認します
	if (!selectedRange.hasSelectedRange) {
		// 選択範囲が存在しなければ、カーソル位置に読みが設定されているか確認します
		readNode = WindowManager._getLayoutNodeAtCaret('cread');

	} else {
		// 選択範囲が存在する場合でも、選択範囲を囲む同種ノードがあるか調べ、取得を試みます
		var selectedCount = selectedRange.count;
		readNode = WindowManager._getLayoutNodeAtNode(
			selectedRange.selectedRange.getSelectedFirstNode(), 'cread', selectedCount);
	}

	// カーソル・選択範囲を囲む読みが設定されていれば、読みを選択範囲とします
	if (readNode !== null) {
		selectedRange.startSelect(readNode);
		selectedRange.updateSelectedRange(readNode.nextSibling);
	}

	// 選択範囲がなければ、ウィンドウは表示しません
	if (!selectedRange.hasSelectedRange) return;

	// 複数段落が選択されていたら、ウィンドウは表示しません
	var nodeList = selectedRange.getSelectedRange();
	var paragraphList = DataClass.targetParagraphs(nodeList);
	if (paragraphList.length > 1) {
		alert('複数行に対して読みを設定することはできません。'); // ワーニング
		return;
	}

	if ((this.readingWindow === null) || (this.readingWindow.closed)) {
		this.readingWindow = WindowManager.openStableDialog('./dialog/reading/', 'READING_DIALOG', 420, 210);
        this.readingWindow.width = 430;
        this.readingWindow.height = 230;
	};

	this.readingWindow.focus();

	// 選択範囲表示を更新します
	ViewManager.getRenderer().update();
	// 継続検索フラグをリセットします
	SearchManager.instance.IsSearched = false;
};

WindowManager.prototype.closeReadingWindow = function() {
	if (this.readingWindow !== null) this.readingWindow.close();
};

/*************************************************************
 * 設定ダイアログ
 */

WindowManager.prototype.openConfigWindow = function() {
	if ((this.editorConfigWindow === null) || (this.editorConfigWindow.closed)) {
		this.editorConfigWindow = WindowManager.openStableDialog('./dialog/settings/', 'CONFIG_DIALOG', 370, 350);
        this.editorConfigWindow.width = 380;
        this.editorConfigWindow.height = 370;
	};

	this.editorConfigWindow.focus();
};

WindowManager.prototype.closeConfigWindow = function() {
	if (this.editorConfigWindow !== null) this.editorConfigWindow.close();
};

/*************************************************************
 * 画像設定ダイアログ
 */

WindowManager.prototype.openImageWindow = function(nodeId) {
	// ---- 指定ノードが画像ならウインドウを開く
	dataNode = DocumentManager.getNodeById(nodeId);
	if (dataNode.nodeName != "CIMG") {
		alert('対象が画像の場合のみ有効です。');
		return;
	}

	if ((this.imageSettingWindow === null) || (this.imageSettingWindow.closed)) {
		this.imageSettingWindow = WindowManager.openStableDialog('./dialog/imageProperty/?ID=' + nodeId, 'IMAGE_DIALOG', 280, 220);
        this.imageSettingWindow.width = 290;
        this.imageSettingWindow.height = 240;
	};

	this.imageSettingWindow.focus();
};

WindowManager.prototype.closeImageWindow = function() {
	if (this.imageSettingWindow !== null) this.imageSettingWindow.close();
};

/*************************************************************
 * 文書設定ダイアログ
 */

WindowManager.prototype.openPropertyWindow = function() {
	if ((this.docSettingWindow === null) || (this.docSettingWindow.closed)) {
		this.docSettingWindow = WindowManager.openStableDialog('./dialog/docProperty/', 'DOC_PROP_DIALOG', 370, 300);
        this.docSettingWindow.width = 380;
        this.docSettingWindow.height = 320;
	};

	this.docSettingWindow.focus();
};

WindowManager.prototype.closePropertyWindow = function() {
	if (this.docSettingWindow !== null) this.docSettingWindow.close();
};

/*************************************************************
 * 辞書選択ダイアログ
 */

WindowManager.prototype.openDicSelectWindow = function(docId) {
    if ((this.dicSelectWindow === null) || (this.dicSelectWindow.closed)) {
        this.dicSelectWindow = WindowManager.openStableDialog('./dialog/dicSelect/', 'DIC_SELECT_DIALOG', 800, 500);
        this.dicSelectWindow.width = 810;
        this.dicSelectWindow.height = 520;
    };

    this.dicSelectWindow.focus();
};

WindowManager.prototype.closeDicSelectWindow = function() {
    if (this.dicSelectWindow !== null) this.dicSelectWindow.close();
};

/*************************************************************
 * 辞書情報ダイアログ
 */

WindowManager.prototype.openDicInfoWindow = function() {
    if ((this.dicInfoWindow === null) || (this.dicInfoWindow.closed)) {
        this.dicInfoWindow = WindowManager.openStableDialog('./dialog/dicInfo/', 'DIC_INFO_DIALOG', 350, 130);
        this.dicInfoWindow.width = 360;
        this.dicInfoWindow.height = 150;
    };

    this.dicInfoWindow.focus();
};

WindowManager.prototype.closeDicInfoWindow = function() {
	// 対象ウィンドウはフォーカスロスト時に自動的に閉じるため、使われません。
    if (this.dicInfoWindow !== null) this.dicInfoWindow.close();
};

/*************************************************************
 * 音声設定選択ダイアログ
 */

WindowManager.prototype.openVoiceSelectWindow = function(docId) {
    if ((this.voiceSelectWindow === null) || (this.voiceSelectWindow.closed)) {
        this.voiceSelectWindow = WindowManager.openStableDialog('./dialog/voiceSettingSelect/', 'VOICE_SETTING_SELECT_DIALOG', 800, 500);
        this.voiceSelectWindow.width = 810;
        this.voiceSelectWindow.height = 520;
    };

    this.voiceSelectWindow.focus();
};

WindowManager.prototype.closeVoiceSelectWindow = function() {
    if (this.voiceSelectWindow !== null) this.voiceSelectWindow.close();
};

/*************************************************************
 * 音声設定ダイアログ
 */

WindowManager.prototype.openVoiceSettingWindow = function(type) {
    if ((this.voiceSettingWindow === null) || (this.voiceSettingWindow.closed)) {
        var html;
        if (type === 'JP') html = 'japanese.html';
        else if (type === 'EN') html = 'english.html';
        else if (type === 'Math') html = 'math.html';
        else return;

        this.voiceSettingWindow = WindowManager.openDialog('./dialog/voiceSettings/' + html, 'VOICE_SETTING_DIALOG', 1000, 600);
        //this.voiceSettingWindow = WindowManager.openStableDialog('./dialog/voiceSettings/' + html, 'VOICE_SETTING_DIALOG', 1000, 600);
        this.voiceSettingWindow.width = 1010;
        this.voiceSettingWindow.height = 620;
    };

    this.voiceSettingWindow.focus();
};

WindowManager.prototype.closeVoiceSettingWindow = function() {
    if (this.voiceSettingWindow !== null) this.voiceSettingWindow.close();
};

/*************************************************************
 * 辞書編集ダイアログ
 */

WindowManager.prototype.openDicEditWindow = function(word) {
    if ((this.dicEditWindow === null) || (this.dicEditWindow.closed)) {
        var url = './dialogExt/dicEdit/';
        if (word) url += '?word=' + encodeURIComponent(word);
        this.dicEditWindow = WindowManager.openStableDialog(url, 'DIC_EDIT_DIALOG', 640, 480);
        this.dicEditWindow.width = 650;
        this.dicEditWindow.height = 500;
    };

    this.dicEditWindow.focus();
};

WindowManager.prototype.closeDicEditWindow = function() {
    if (this.dicEditWindow !== null) this.dicEditWindow.close();
};

/**
 * 辞書編集ウィンドウが開いているか取得します。
 */
Object.defineProperty(WindowManager.prototype, 'isOpened', {
	enumerable: true,
	configurable: true,
	get: function(){
		return !((this.dicEditWindow === null) || (this.dicEditWindow.closed));
	},
});

/*************************************************************
 * アニメーション編集ダイアログ
 */

WindowManager.prototype.openAnimeWindow = function(imageId, animeId) {
    if ((this.animeEditWindow === null) || (this.animeEditWindow.closed)) {
        this.animeEditWindow = WindowManager.openStableDialog('./dialogExt/animation/?animeId='+animeId+'&imageId='+imageId, 'ANIMATION_DIALOG', 800, 600);
        this.animeEditWindow.width = 810;
        this.animeEditWindow.height = 620;
    };

    this.animeEditWindow.focus();
};

WindowManager.prototype.closeAnimeWindow = function() {
    if (this.animeEditWindow !== null) this.animeEditWindow.close();
};

/*************************************************************
 * 再ログイン ダイアログ
 */

WindowManager.prototype.openReLoginWindow = function() {
    if ((this.reloginWindow === null) || (this.reloginWindow.closed)) {
        this.reloginWindow = WindowManager.openStableDialog('./dialog/relogin/', 'RELOGIN_DIALOG', 800, 600);
        this.reloginWindow.width = 810;
        this.reloginWindow.height = 620;
    };

    this.reloginWindow.focus();
};

// フォーカスを失った時点で消すので、closeは定義しません。