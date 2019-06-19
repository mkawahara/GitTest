


function ColorPalette(divNode) {
	// 元となる色リスト
	var baseColorList = [
	                     '#FF0000',
	                     '#FF9090',
	                     '#00FF00',
	                     '#0000FF',
	                     '#8090FF',
	                     '#FFFF00',
	                     '#FF00FF',
	                     '#FF90FF',
	                     '#00FFFF',
	                     '#FFFFFF',
	                      ];
	// 各色の明度の段階数
	var valueStepCount = 5;

	this.callback = null;

	this.divNode = divNode;
	divNode.style.display = 'none';
	divNode.style.position = 'absolute';

	// テーブルを作成します
	var tableNode = this._createTableHtml(baseColorList, valueStepCount);
	divNode.appendChild(tableNode);
}

/**
 * テーブルノードを作成します
 * @param colorList
 * @param step
 * @returns {___anonymous543_551}
 */
ColorPalette.prototype._createTableHtml = function(colorList, step) {
	var tableNode = document.createElement('table');
	tableNode.style.border = 'solid 1px black';

	for (var bright = 0; bright < step; bright++) {
		var trNode = document.createElement('tr');
		var ratio = (step - bright - 1) / (step - 1);

		for (var clr = 0; clr < colorList.length; clr++) {
			var tdNode = document.createElement('td');

			var colorData = ColorPalette._getColorData(colorList[clr]);
			ColorPalette._toDark(colorData, ratio);

			var clrStr = ColorPalette._toStr(colorData);
			var obj = this;

			tdNode.style['background-color'] = clrStr;
			tdNode.style.border = 'solid 1px black';
			tdNode.style.width = '20px';
			tdNode.style.height = '20px';
			tdNode.onclick = function(event) {
				obj.setColor(event.target.style['background-color']);
			};

			trNode.appendChild(tdNode);
		}

		tableNode.appendChild(trNode);
	}

	return tableNode;
};

/**
 * 十六進色文字列から色データを取得します。
 * プライベートメンバ
 * @param str
 * @returns {___anonymous1767_1816}
 */
ColorPalette._getColorData = function(str) {
	// Red
	var red = str.substr(1, 2);
	red = parseInt(red, 16);

	// Green
	var green = str.substr(3, 2);
	green = parseInt(green, 16);

	// Blue
	var blue = str.substr(5, 2);
	blue = parseInt(blue, 16);

	return {
		red: red,
		green: green,
		blue: blue,
	}
};

/**
 * 明度を落とします。
 * プライベートメンバ
 * @param src
 * @param ratio
 * @returns
 */
ColorPalette._toDark = function(src, ratio) {
	src.red = Math.round(src.red * ratio);
	src.green = Math.round(src.green * ratio);
	src.blue = Math.round(src.blue * ratio);

	return src;
};

/**
 * 色データをrgb文字列に変換します。
 * プライベートメンバ
 * @param src
 * @returns {String}
 */
ColorPalette._toStr = function(src) {
	return 'rgb(' + src.red + ',' + src.green + ',' + src.blue + ')';
};

/**
 * カラーパレットを開きます。
 * @param left
 * @param top
 * @param callback
 */
ColorPalette.prototype.open = function(event, left, top, callback) {
	this.callback = callback;
	this.divNode.style.left = left + 'px';
	this.divNode.style.top = top + 'px';
	this.divNode.style.display = 'inline';

	event.stopPropagation();
};

/**
 * パレットを隠します。
 */
ColorPalette.prototype.close = function() {
	this.divNode.style.display = 'none';
};

/**
 * rgb色文字列を十六進文字列に変換します。
 * プライベートメンバ
 * @param src
 * @returns {String}
 */
ColorPalette._rgbTo16 = function(src) {
	var str = src.substr(4, src.length - 5);
	var colors = str.split(',');

	var red = parseInt(colors[0]).toString(16);
	if (red.length == 1) red = '0' + red;
	var green = parseInt(colors[1]).toString(16);
	if (green.length == 1) green = '0' + green;
	var blue = parseInt(colors[2]).toString(16);
	if (blue.length == 1) blue = '0' + blue;

	var colorStr = '#' + red + green + blue;

	return colorStr;
};

/**
 * パレットクリック時に実行されるコールバック関数です。
 * @param color
 */
ColorPalette.prototype.setColor = function(color) {
	var colorStr = ColorPalette._rgbTo16(color);
	this.callback(colorStr);
	this.divNode.style.display = 'none';
};