function ImageElement() {};


//------------- HTMLUnknownElementクラス継承
//HTMLUnknownElement.prototypeを本オブジェクトのプロトタイプに設定します。
ImageElement.prototype = Object.create(LayoutBaseClass.prototype);

// 画像サイズの取得カウンター
ImageElement.retryCounter = 0;

//[static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
ImageElement.createNew = function(data) {
	// 返値 dom [obj]    : DOM
	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('cimg'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID();
	domObj.setAttribute('data', data);
    domObj.setAttribute('title', '');
	domObj.setAttribute('alttext', '');
	domObj.setAttribute('readingtext', '');

	// サイズ取得のために一時的な画像オブジェクトを作成します
	ImageElement.lastImgObject = new Image();
	ImageElement.lastImgObject.src = data;
	ImageElement.lastCreateNode = domObj;

	ImageElement.retryCounter = 0;
	setTimeout('ImageElement._setAutoSize()', 0);

	return domObj;
};

/**
 * 画像サイズを自動設定します。
 * このメソッドはタイマーにより呼び出されます。
 */
ImageElement._setAutoSize = function() {
	// サイズを取得します
	var width = ImageElement.lastImgObject.width;
	var height = ImageElement.lastImgObject.height;

	if ((width == 0) || (height == 0)) {
		ImageElement.retryCounter++;
		if (ImageElement.retryCounter < 5) {
			setTimeout('ImageElement._setAutoSize()', 0);
			return;
		}

		alert('貼り付けられた画像サイズが取得できなかったため、5cm x 5cm で貼り付けます。');
		width = 50;
		height = 50;
	}

	// 新規サイズを決定します
	var newWidth = width / 3.91;
	if (newWidth > 100) newWidth = 100;
	var newHeight = height * (newWidth / width);

	// サイズを修正して設定します
	ImageElement.doop(ImageElement.lastCreateNode);
	ImageElement.lastCreateNode.width = newWidth;
	ImageElement.lastCreateNode.height = newHeight;

	// データノードのルート段落を取得します
	var paraNode = null;
	try {
		paraNode = DataClass.getRootParagraph(ImageElement.lastCreateNode);
	}
	catch(e) {
		// 何もしません
	}

	// 一時オブジェクトを破棄します
	ImageElement.lastImgObject = null;
	ImageElement.lastCreateNode = null;

	// 親段落が取得できていれば、レンダラーを呼び出し、画面を更新します
	if (paraNode !== null) {
		ViewManager.getRenderer().setUpdatedParagraph(paraNode);
		ViewManager.getRenderer().update();
	}
};


//[static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
ImageElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, ImageElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



//[static] ------------- 既存オブジェクトをコピーして新しいオブジェクトを作成します。
ImageElement.copyFrom = function(src) {
	// 引数  src [I, obj]: コピー元オブジェクト
	// 返値  [obj]   : コピーによって生成された新しいオブジェクト
	return $(src).clone();
};



//------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
ImageElement.prototype.toHtml = function() {
	// 返値 htmlStr [str] : html文字列

	// 大元の 開始htmlタグと終了htmlタグを決定します。
	var htmlStartTag = '<img id="' + this.id + '" src="' + this.data + '" alt="' + this.alttext + '" style="vertical-align: bottom;';
	var htmlEndTag   = '">';

	var width = this.getAttribute('width');
	if (width !== null) {
		width = 'width:' + width + 'mm;'
	} else {
		width = '';
	};
	var height = this.getAttribute('height');
	if (height !== null) {
		height = 'height:' + height + 'mm;'
	} else {
		height = '';
	};

	// img タグ文字列を生成します。
	var htmlStr = htmlStartTag + width + height + htmlEndTag;

	// アニメーションID を有する場合、アニメーションアイコンを追加します
	if (this.getAttribute('animationid') != null) {
		htmlStr = '<span style="position: relative;">' + htmlStr + '<img src="icons/anime_image.png" style="position: absolute; left: 0px; top: 0px;"></span>';
	}

	return htmlStr;
	// <img id="" src="" alt="" style="width: 10mm; height: 10mm;">
};

/////////////////////////////////////////////////////////////////////
// 書式設定は全て無視します。
/////////////////////////////////////////////////////////////////////

// ------------- nodeType を取得します。
Object.defineProperty(ImageElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});

//------------- イタリック体属性を有効/無効化します。
Object.defineProperty(ImageElement.prototype, 'ital', {
});

//------------- 太字属性を有効/無効化します。
Object.defineProperty(ImageElement.prototype, 'bold', {
});

//------------- 下線属性を有効/無効化します。
Object.defineProperty(ImageElement.prototype, 'uline', {
});

//------------- 打消線属性を有効/無効化します。
Object.defineProperty(ImageElement.prototype, 'strk', {
});

//------------- 上付き属性を有効/無効化します。
Object.defineProperty(ImageElement.prototype, 'sup', {
});

//------------- 下付き属性を有効/無効化します。
Object.defineProperty(ImageElement.prototype, 'sub', {
});

//////////////////////////////////////////////////////////////

Object.defineProperty(ImageElement.prototype, 'title', {
    enumerable: true,
    configurable: true,
    get: function(){
        return this.getAttribute('title');
    },
    set: function(value) {
        this.setAttribute('title', value);
    },
});

Object.defineProperty(ImageElement.prototype, 'alttext', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('alttext');
	},
	set: function(value) {
		this.setAttribute('alttext', value);
	},
});

Object.defineProperty(ImageElement.prototype, 'readingtext', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('readingtext');
	},
	set: function(value) {
		if ((value === null) || (value === void 0)) value = '';
		this.setAttribute('readingtext', value);
	},
});

Object.defineProperty(ImageElement.prototype, 'animationId', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('animationid');
	},
	set: function(value) {
		if ((value !== null) && (value !== void 0)) {
			this.setAttribute('animationid', value);
		} else {
			this.removeAttribute('animationid');
		}
	},
});

Object.defineProperty(ImageElement.prototype, 'width', {
	enumerable: true,
	configurable: true,
	get: function(){
		return Number(this.getAttribute('width'));
	},
	set: function(value) {
		this.setAttribute('width', value);
	},
});

Object.defineProperty(ImageElement.prototype, 'height', {
	enumerable: true,
	configurable: true,
	get: function(){
		var height = Number(this.getAttribute('height'));
		if (isNaN(height)) {
			var img = new Image();
			img.src = this.getAttribute('data');
			return this.width * img.height / img.width;
		}
		return Number(this.getAttribute('height'));
	},
	set: function(value) {
		this.setAttribute('height', value);
	},
});

Object.defineProperty(ImageElement.prototype, 'data', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.getAttribute('data');
	},
	set: function(value) {
		this.setAttribute('data', value);
	},
});


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
ImageElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CIMG') return null;

	if (checkNext) {
		// 弟要素の有無を比較します
		if (this.nextSibling === null) return node;
		if (node.nextSibling === null) return null;

		// 弟要素の比較を行います
		DataClass.bindDataClassMethods(this.nextSibling);
		return this.nextSibling.compareWith(node.nextSibling, checkNext);
	} else {
		// 兄要素の有無を比較します
		if (this.previousSibling === null) return node;
		if (node.previousSibling === null) return null;

		// 兄要素の比較を行います
		DataClass.bindDataClassMethods(this.previousSibling);
		return this.previousSibling.compareWith(node.previousSibling, checkNext);
	}
};


/////////////////////////////////////////////////////////////////////
//キー操作によるカーソル移動を扱うメソッド
/////////////////////////////////////////////////////////////////////

//ImageElement は子要素を持たないため、FromChild 系メソッドは実装されません。


/////////////////////////////////////////////////////////////////////
//弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

ImageElement.prototype.shiftUpFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

ImageElement.prototype.shiftDownFromNext = function() {
	var parent = this.parentElement
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};
