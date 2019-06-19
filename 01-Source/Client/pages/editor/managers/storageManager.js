/**
 * Web Storage / IndexedDB を使用し、データを保存するクラスです。
 */

function StorageManager() {
	this.keyList = {
		CLIPBOARD : 'clipboard',
	};
};


//////////////////////////////////////////////////////////////////////////
// シングルトン

StorageManager._instance = null;

Object.defineProperty(StorageManager, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (StorageManager._instance === null) StorageManager._instance = new StorageManager();
		return StorageManager._instance;
	},
	});

//////////////////////////////////////////////////////////////////////////

/**
 * key で指定したストレージに jsonData で受け取ったデータを記録します。
 * データは文字列変換されるため、クラスのインスタンス等、保存できないデータがあります。
 * 保存データを指定しなかった場合 (null / undefined)、指定データは削除されます。
 */
StorageManager.prototype.save = function(key, jsonData) {
	if ((jsonData === void 0) || (jsonData === null)) {
		localStorage.removeItem(key);
	} else {
		localStorage.setItem(key, JSON.stringify(jsonData));
	}
};

/**
 * key で指定されたストレージから json 形式のデータを受け取ります。
 * 対応データがない場合、null を返します。
 * @param key
 */
StorageManager.prototype.load = function(key) {
	var jsonStr = localStorage.getItem(key);
	if ((jsonStr === void 0) || !jsonStr ) return null;
	var jsonData = JSON.parse(jsonStr);
	return jsonData;
};
