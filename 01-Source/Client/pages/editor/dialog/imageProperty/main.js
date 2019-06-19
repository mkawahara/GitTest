/////////////////////////////////////////////////////////////////
// 初期化
/////////////////////////////////////////////////////////////////


var aspectRatio;


$(document).ready(function() {
	if (window.opener === null) {
		alert('このページを直接開いても動作しません。');
		return;
	};

	var nodeId = getParam();
	var data = window.opener.MessageManager.getImageProperty(nodeId);

	// ダイアログ部品のデータを更新します
	updateDialog(data);
});

function getParam() {
	var url = location.href;
	parameters = url.split('?');

	if (parameters.length < 2) return null;

	params = parameters[1].split('&');
	var paramsArray = [];

	for (var i = 0; i < params.length; i++ ) {
		var temp = params[i].split('=');
		paramsArray.push(temp[0]);
		paramsArray[temp[0]] = temp[1];
	}

	return paramsArray['ID'];
};

/**
 * ダイアログ部品のデータを更新します
 * @param data
 */
function updateDialog(data) {
	_imageWidth.value = data.width;
	_imageHeight.value = data.height;

	aspectRatio = Number(data.width) / Number(data.height);
	g_width = data.width;
	g_height = data.height;

	_imageTitle.value = data.title;
	_spareText.value = data.alt;
	_readText.value = data.reading;
};

/**
 * ウィンドウがフォーカスを失った時の処理です。
 */
window.onblur = function(event) {
	// ★完成後はウィンドウは自動的に消えるようにしてください。
	this.close();
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「適用」をクリックした時の処理
 */
function onClickSubmit() {
	//データ一式を取得します
	var data = getDataJson();

	// 親ウィンドウに処理実行を要求します
	window.opener.MessageManager.setImageProperty(data);

	// ウィンドウを閉じます
	this.close();
};

/**
 * 入力部品からデータを収集し、親ウィンドウにわたす json を作成します
 */
function getDataJson() {
	// 幅
	var width = Number(_imageWidth.value);

	// 高さ
	var height = Number(_imageHeight.value);

	// タイトル
	var title = _imageTitle.value;

	// 代替テキスト
	var alt = _spareText.value;

	// 読上テキスト
	var read = _readText.value;

	return {
		id: getParam(),
		width: width,
		height: height,
		title: title,
		alt: alt,
		read: read,
	};
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

/**
 * 「キャンセル」をクリックした時の処理
 */
function onCancel() {
	this.close();
};


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

function onChangeWidth() {
	if (getFixRatio()) {
		var width = Number(_imageWidth.value);
		var height = width / aspectRatio;
		_imageHeight.value = height;
	} else {
		aspectRatio = Number(_imageWidth.value) / Number(_imageHeight.value);
	}
};

function onChangeHeight() {
	if (getFixRatio()) {
		var height = Number(_imageHeight.value);
		var width = height * aspectRatio;
		_imageWidth.value = width;
	} else {
		aspectRatio = Number(_imageWidth.value) / Number(_imageHeight.value);
	}
};

function getFixRatio() {
	return _fixAspect.checked;
};

