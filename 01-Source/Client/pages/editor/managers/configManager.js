/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： configManager.js                                   */
/* -                                                                         */
/* -    概      要     ： エディタ設定機能群                                 */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 38.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月02日                         */

const DEFAULT_CONFIG_XML =
'<setting>'+
	'<common>'+
		'<lastmodify></lastmodify>'+
	'</common>'+
	'<docEditor>'+
		'<general>'+
			'<inputswitchshortcut targetchem="true">0</inputswitchshortcut>'+
			'<showspace>'+
				'<text>true</text>'+
				'<math>true</math>'+
			'</showspace>'+
			'<cursorinfrac isfirstnum="true"/>'+
		'</general>'+
		'<color>'+
			'<background>#ffffff</background>'+
			'<text>#000000</text>'+
			'<math>#0000FF</math>'+
			'<chem>#00CC00</chem>'+
			'<control>#888888</control>'+
			'<mathcontrol>#888888</mathcontrol>'+
			'<ruby>#FF0000</ruby>'+
			'<selection>#FFAA00</selection>'+
			'<highlightback>#FFFF00</highlightback>'+
			'<highlightfore>#00FF00</highlightfore>'+
		'</color>'+
		'<font size="12pt">ＭＳ Ｐ明朝</font>'+
		'<mathlevel>1</mathlevel>'+
		'<recentSymbols></recentSymbols>'+
	'</docEditor>'+
	'<dicEditor>文書編集ページでは使用されない</dicEditor>'+
	'<animEditor>文書編集ページでは使用されない</animEditor>'+
'</setting>';


/////////////////////////////////////////////////////////////////////
// 初期化とシングルトン
/////////////////////////////////////////////////////////////////////

// ---- コンストラクタ
function ConfigManager() {
	// xml [文字列] : 設定内容を xml 文字列で表現したもの
	this.settingDataDom = $(DEFAULT_CONFIG_XML)[0];  // デフォルト設定を作成

	// xml に保存されない設定
	this._speakerList = null;	// 話者リスト
};

ConfigManager._instance = null;

Object.defineProperty(ConfigManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (ConfigManager._instance === null) ConfigManager._instance = new ConfigManager();
		return ConfigManager._instance;
	},
});


/////////////////////////////////////////////////////////////////////
// 内容の取得と保存
/////////////////////////////////////////////////////////////////////

/**
 * サーバから設定を取得します。
 */
ConfigManager.prototype.load = function() {
	// サーバマネージャに設定取得を要求します
	ServerManager.requestSetting(this.onConfigLoad, this.onConfigLoad, this.onUnexpectedErrorWhenLoad);
};

/**
 * 設定取得成功・失敗時のコールバック関数
 * コールバックのため、this が window になってるので注意。
 */
ConfigManager.prototype.onConfigLoad = function(data) {
	var severXml = '';
	var storageXml = '';

	// 成功時のみ設定文字列を取得します
	if(data.error_code === 0) severXml = data.editor_setting;

	// Web Storage にデータがあれば、設定文字列を取得します
	var configJson = StorageManager.instance.load('editor_config');
	if (configJson !== null) storageXml = configJson.editor_setting;

	// 両方共に空の場合は、デフォルト設定を使用するため、何もしません
	if ((severXml === '') && (storageXml === '')) return;

	// 設定xml をパースします
	var serverDom = null;
	var storageDom = null;

	if (severXml !== '') serverDom = $(severXml);
	if (storageXml !== '') storageDom = $(storageXml);

	// それぞれの更新日時を取得します
	var serverDate = ConfigManager.getLastModifyValue(serverDom);
	var storagerDate = ConfigManager.getLastModifyValue(storageDom);

	// 更新日時がいずれからも取得できなかった場合、デフォルトの設定を使用します
	if (serverDate + storagerDate === 0) return;

	// 日時が新しい設定を使用します
	if (serverDate > storagerDate) {
		ConfigManager.instance.setXml(severXml);
		//this.setXml(severXml);
	} else {
		ConfigManager.instance.setXml(storageXml);
		//this.setXml(storageXml);
	}
};

/**
 * 指定 dom から最終更新時刻を表す値を取得します
 */
ConfigManager.getLastModifyValue = function(dom) {
	if (dom === null) return 0;

	var node = dom.find('lastmodify');
	if (node.length > 0) return (new Date(node[0].textContent)).getTime();
	return 0;
}

/**
 * 設定取得時、サーバとの接続に失敗した場合の処理です。
 * コールバックのため、this が window になってるので注意。
 */
ConfigManager.prototype.onUnexpectedErrorWhenLoad = function() {
	var storageXml = '';

	// Web Storage にデータがあれば、設定文字列を取得します
	var configJson = StorageManager.instance.load('editor_config');
	if (configJson !== null) storageXml = configJson.xml;

	// 空の場合は、デフォルト設定を使用するため、何もしません
	if (storageXml === '') return;

	// 設定xml をパースし、更新日時を取得します
	var storagerDate = $(storageXml).find('lastmodify');
	if (storagerDate.length > 0) {
		storagerDate = (new Date(storagerDate[0].textContent)).getTime();
	} else {
		// 更新日時が取得できなかった場合、形式異常疑いのため、デフォルト設定を使用します
		return;
	}

	// 設定を適用します
	ConfigManager.instance.setXml(storageXml);
	//this.setXml(storageXml);
};


/**
 * サーバに設定を保存します。
 */
ConfigManager.prototype.save = function() {
	// 設定更新日時を登録します
	this.LastModify = new Date();

	// 設定データを作成します
	var jsonData = { editor_setting: this.getSettingXml(), };

	// Web Storage に保存します
	StorageManager.instance.save('editor_config', jsonData);

	// サーバに保存リクエストを発行します
	ServerManager.saveSetting (jsonData, this.onConfigSave, this.onConfigSave, this.onUnexpectedConfigSave);
};

/**
 * 保存成功・失敗時の処理です。
 * コールバックのため、this が window になってるので注意。
 */
ConfigManager.prototype.onConfigSave = function(data) {
	// 何もしません。
	if (data.error_code === 0) {
		console.log('サーバへの設定の保存に成功しました。');
	} else {
		console.log('サーバへの設定の保存に失敗しました。');
	}
};

/**
 * 設定保存時、サーバに接続できなかった時の処理です。
 * コールバックのため、this が window になってるので注意。
 */
ConfigManager.prototype.onUnexpectedConfigSave = function(error_info) {
	console.log('設定保存時、サーバに接続できませんでした。');
};


/////////////////////////////////////////////////////////////////////
// 設定データの更新
/////////////////////////////////////////////////////////////////////

// ---- 設定一式を含んだ xml 文字列を与え、オブジェクトが有する設定一式を更新します。
// xml文字列に docEditor ノードがない場合、デフォルトの設定を docEditor ノードへ挿入します。
ConfigManager.prototype.setXml = function(xml) {
	// 返値なし
	var directredData = $(xml)[0];                                      // 与えられた xml による新設定値 DOM
//	if ( $(directredData).find('docEditor').length > 0 ) {              // ---- docEditor が指定されていない場合
	if ( !directredData.getElementsByTagName('docEditor') ) {                 // ---- docEditor が指定されていない場合
		var defaultSetting   = $(DEFAULT_CONFIG_XML);                   // デフォルト設定を作成
		var defaultDocEditor = defaultSetting.find('docEditor')[0];     // デフォルト設定内の docEditor
		directredData.appendChild(defaultDocEditor);                    // docEditor を設定
	}
	this.settingDataDom = directredData;                           // 既存設定へ新設定を反映

	// パッシブな設定を更新します
	this.reflectSetting();
};

// ----設定一式を初期化します。
// ただし、初期化対象は文書編集ページが扱う <docEditor> ノード以下のデータ一式のみです。
ConfigManager.prototype.reset = function() {
	// 返値なし
	var defaultSetting    = $(DEFAULT_CONFIG_XML)[0];                        // デフォルト設定を作成
	var defaultDocEditor  = defaultSetting.getElementsByTagName('docEditor')[0];       // デフォルト設定内の docEditor
	var existingDocEditor = this.settingDataDom.getElementsByTagName('docEditor')[0];  // 既存設定内の docEditor
	this.settingDataDom.removeChild(existingDocEditor);                      // 既存設定内の docEditor を除去
	this.settingDataDom.appendChild(defaultDocEditor);                       // 既存設定へ、デフォルト docEditor を追加
};

/**
 * ConfigManager の設定を、システムに反映します。
 * これは、ConfigManager にデータを取得に来ることが出来ないスタイル設定用の処理です。
 * カーソル移動やショートカットは、必要に応じて ConfigManager からデータを取得してください。
 */
ConfigManager.prototype.reflectSetting = function() {
	// 配色系の設定は全てレンダラーの静的メソッドを使用します
	try {
		Renderer.updateEditorColor();
	}
	catch (e) {
		// Renderer がなければ何もしません。
	}
};


/////////////////////////////////////////////////////////////////////
// 保存用文字列の取得
/////////////////////////////////////////////////////////////////////

// ---- 設定一式を含んだxml文字列を取得します。
ConfigManager.prototype.getSettingXml = function() {
	// 返値：設定一式を含んだxml文字列
	return this.settingDataDom.outerHTML;
};


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * 更新日時 プロパティ
 */
Object.defineProperty(ConfigManager.prototype, 'LastModify', {
	enumerable: true,
	configurable: true,
	get: function(){
		var targetNode = this.settingDataDom.getElementsByTagName('lastmodify')[0];
		return new Date( targetNode.textContent );
	},
	set: function(value){
		var targetNode = this.settingDataDom.getElementsByTagName('lastmodify')[0];
		targetNode.textContent = value + '';
	},
});

/**
 * ModeSwitchShortcut プロパティ
 * テキスト・数式切替方式: 0 = Ctrlキー, 1 = Ctrl + Space キー
 */
Object.defineProperty(ConfigManager.prototype, 'ModeSwitchShortcut', {
	enumerable: true,
	configurable: true,
	get: function(){
		var targetNode = this.settingDataDom.getElementsByTagName('inputSwitchShortcut')[0];
		return Number( targetNode.textContent );
	},
	set: function(val){
		var targetNode = this.settingDataDom.getElementsByTagName('inputSwitchShortcut')[0];
		targetNode.textContent = String(val);
	},
});

/**
 * IsShortcutTargetChem プロパティ
 * 化学式モードも切替に含める： true / false
 */
Object.defineProperty(ConfigManager.prototype, 'IsShortcutTargetChem', {
	enumerable: true,
	configurable: true,
	get: function(){
		var targetNode = this.settingDataDom.getElementsByTagName('inputSwitchShortcut')[0];
		return (targetNode.getAttribute('targetChem') == 'true');
	},
	set: function(boolVal){
		var targetNode = this.settingDataDom.getElementsByTagName('inputSwitchShortcut')[0];
		targetNode.setAttribute('targetChem', boolVal);
	},
});

/**
 * IsShowTextSpace プロパティ
 * テキスト部分のスペース文字の表示： true / false
 */
Object.defineProperty(ConfigManager.prototype, 'IsShowTextSpace', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('showSpace')[0]; // 親ノード取得
		var nodeForText = pareNode.getElementsByTagName('text')[0];                 // テキスト設定用ノード取得
		return (nodeForText.textContent == 'true');
	},
	set: function(boolVal){
		var pareNode    = this.settingDataDom.getElementsByTagName('showSpace')[0]; // 親ノード取得
		var nodeForText = pareNode.getElementsByTagName('text')[0];                 // テキスト設定用ノード取得
		nodeForText.textContent = boolVal ? 'true' : 'false';
	},
});

/**
 * IsShowMathSpace プロパティ
 * 数式部分のスペース文字の表示： true / false
 */
Object.defineProperty(ConfigManager.prototype, 'IsShowMathSpace', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('showSpace')[0]; // 親ノード取得
		var nodeForMath = pareNode.getElementsByTagName('math')[0];                 // 数式設定用ノード取得
		return (nodeForMath.textContent == 'true');
	},
	set: function(boolVal){
		var pareNode    = this.settingDataDom.getElementsByTagName('showSpace')[0]; // 親ノード取得
		var nodeForMath = pareNode.getElementsByTagName('math')[0];                 // 数式設定用ノード取得
		nodeForMath.textContent = boolVal ? 'true' : 'false';
	},
});

/**
 * IsFirstCursorPosNumInFrac プロパティ
 * 分数内のカーソル移動順序：true = 分母→分子の順, false = 分子→分母の順
 */
Object.defineProperty(ConfigManager.prototype, 'IsFirstCursorPosNumInFrac', {
	enumerable: true,
	configurable: true,
	get: function(){
		var targetNode = this.settingDataDom.getElementsByTagName('cursorInFrac')[0]; // 親ノード取得
		return (targetNode.getAttribute('isFirstNum') == 'true');
	},
	set: function(boolVal){
		var targetNode = this.settingDataDom.getElementsByTagName('cursorInFrac')[0]; // 親ノード取得
		targetNode.setAttribute('isFirstNum', boolVal ? 'true' : 'false');
	},
});

/**
 * BackgroundColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'BackgroundColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode  = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForBg = pareNode.getElementsByTagName('background')[0];       // 対象ノード取得
		return (nodeForBg.textContent);
	},
	set: function(rgbStr){
		var pareNode  = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForBg = pareNode.getElementsByTagName('background')[0];       // 対象ノード取得
		nodeForBg.textContent = rgbStr;
	},
});

/**
 * TextColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'TextColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForText = pareNode.getElementsByTagName('text')[0];             // 対象ノード取得
		return (nodeForText.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForText = pareNode.getElementsByTagName('text')[0];             // 対象ノード取得
		nodeForText.textContent = rgbStr;
	},
});

/**
 * MathColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'MathColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForMath = pareNode.getElementsByTagName('math')[0];             // 対象ノード取得
		return (nodeForMath.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForMath = pareNode.getElementsByTagName('math')[0];             // 対象ノード取得
		nodeForMath.textContent = rgbStr;
	},
});

/**
 * ChemColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'ChemColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForChem = pareNode.getElementsByTagName('chem')[0];             // 対象ノード取得
		return (nodeForChem.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForChem = pareNode.getElementsByTagName('chem')[0];             // 対象ノード取得
		nodeForChem.textContent = rgbStr;
	},
});

/**
 * ControlColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'ControlColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForCtrl = pareNode.getElementsByTagName('control')[0];          // 対象ノード取得
		return (nodeForCtrl.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForCtrl = pareNode.getElementsByTagName('control')[0];          // 対象ノード取得
		nodeForCtrl.textContent = rgbStr;
	},
});

/**
 * MathControlColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'MathControlColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeList = pareNode.getElementsByTagName('mathcontrol');			// 対象ノードを取得
		if (nodeList.length <= 0) {
			// 対象ノードがなければ、デフォルト値を返します
			return '#888888';
		} else {
			// 対象ノードがあれば、そこから取得して返します
			return (nodeList[0].textContent);
		}
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0];	// 親　ノード取得
		var nodeList = pareNode.getElementsByTagName('mathcontrol');			// 対象ノードを取得
		if (nodeList.length <= 0) {
			// 対象ノードがなければ新規作成して登録します
			var node = document.createElement('mathcontrol');
			node.textContent = rgbStr;
			pareNode.appendChild(node);
		} else {
			// 対象ノードがあれば、そのまま登録します
			nodeList[0].textContent = rgbStr;
		}
	},
});

/**
 * RubyColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'RubyColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForRuby = pareNode.getElementsByTagName('ruby')[0];             // 対象ノード取得
		return (nodeForRuby.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForRuby = pareNode.getElementsByTagName('ruby')[0];             // 対象ノード取得
		nodeForRuby.textContent = rgbStr;
	},
});

/**
 * Selection プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'Selection', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForSelection = pareNode.getElementsByTagName('selection')[0];   // 対象ノード取得
		return (nodeForSelection.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForSelection = pareNode.getElementsByTagName('selection')[0];   // 対象ノード取得
		nodeForSelection.textContent = rgbStr;
	},
});

/**
 * HighlightBgColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'HighlightBgColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForHiBg = pareNode.getElementsByTagName('highlightBack')[0];    // 対象ノード取得
		return (nodeForHiBg.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForHiBg = pareNode.getElementsByTagName('highlightBack')[0];             // 対象ノード取得
		nodeForHiBg.textContent = rgbStr;
	},
});

/**
 * HighlightForeColor プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'HighlightForeColor', {
	enumerable: true,
	configurable: true,
	get: function(){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForHiFo = pareNode.getElementsByTagName('highlightFore')[0];    // 対象ノード取得
		return (nodeForHiFo.textContent);
	},
	set: function(rgbStr){
		var pareNode    = this.settingDataDom.getElementsByTagName('color')[0]; // 親　ノード取得
		var nodeForHiFo = pareNode.getElementsByTagName('highlightFore')[0];    // 対象ノード取得
		nodeForHiFo.textContent = rgbStr;
	},
});

/**
 * FontName プロパティ
 *
 */
Object.defineProperty(ConfigManager.prototype, 'FontName', {
	enumerable: true,
	configurable: true,
	get: function(){
		var targetNode    = this.settingDataDom.getElementsByTagName('font')[0];
		return (targetNode.textContent);
	},
	set: function(fontNameStr){
		var targetNode    = this.settingDataDom.getElementsByTagName('font')[0];
		targetNode.textContent = fontNameStr;
	},
});

/**
 * FontSize プロパティ (常にpt付きで扱います)
 *
 */
Object.defineProperty(ConfigManager.prototype, 'FontSize', {
	enumerable: true,
	configurable: true,
	get: function(){
		var targetNode = this.settingDataDom.getElementsByTagName('font')[0];
		var fontSizeText = targetNode.getAttribute('size');
		return fontSizeText;
	},
	set: function(fontSizeStr){
		var targetNode = this.settingDataDom.getElementsByTagName('font')[0];
		targetNode.setAttribute('size', fontSizeStr);
	},
});

/**
 * MathLevel プロパティ
 */
Object.defineProperty(ConfigManager.prototype, 'MathLevel', {
    enumerable: true,
    configurable: true,
    get: function() {
        var targetNode = this.settingDataDom.getElementsByTagName('mathlevel')[0];
        return Number(targetNode.textContent);
    },
    set: function(value) {
        var targetNode = this.settingDataDom.getElementsByTagName('mathlevel')[0];
        targetNode.textContent = value;
    },
});



/**
 * RecentSymbols プロパティ(直近で選択したポップアップの記号、最大5個）
 */
Object.defineProperty(ConfigManager.prototype, 'RecentSymbols', {
    enumerable: true,
    configurable: true,
    get: function() {
        var targetNode = this.settingDataDom.getElementsByTagName('recentSymbols')[0];
        var res = [];
        for (var i=0; i<targetNode.children.length; i++) res.push(targetNode.children[i].textContent)
        return res;
    },
});

/**
 * RecentSymbols (直近で選択したポップアップの記号、最大5個）のデータを追加します
 */
ConfigManager.prototype.addRecentSymbol = function(value) {
    var symbols = this.RecentSymbols;

    // 同じデータは削除します
    symbols = symbols.filter(function(v, i){ return v !== value});

    // 保存済みデータに追加します
    symbols.push(value);

    // 最大5個にします
    const MAX = 5;
    if (symbols.length > MAX) {
        symbols.shift();    // 古いデータから削除します
    }

    // データを保存します
    var html = '';
    for (var i=0; i<symbols.length; i++) {
        html += '<item>' + symbols[i] + '</item>';
    }
    var targetNode = this.settingDataDom.getElementsByTagName('recentSymbols')[0];
    targetNode.innerHTML = html;
}

/**
 * 話者リストを取得・設定します。
 * このデータはページを開く度にデータ変換サーバから取得するため、サーバには保存されません。
 */
Object.defineProperty(ConfigManager.prototype, 'SpeakerList', {
	enumerable: true,
	configurable: true,
	get: function(){
		if ((this._speakerList === null) || (this._speakerList === void 0)) return [];
		return this._speakerList;
	},
	set: function(value){
		this._speakerList = value;
	},
});
