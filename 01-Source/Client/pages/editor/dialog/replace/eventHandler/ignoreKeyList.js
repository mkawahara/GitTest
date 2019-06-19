/**
 * 各キーイベントで Default の動作を禁止すべきキーリストを定義します。
 * ただし、ショートカットキーが割り当てられている組み合わせはここでは定義しません。
 */

KeyEventHandler.isIgnoreAtPress = function(event) {
	for (var idx = 0; idx < KeyEventHandler.ignoreListForPress.length; idx++) {
		keySet = KeyEventHandler.ignoreListForPress[idx]

		var alt = (keySet.alt === event.altKey);
		var ctrl = (keySet.ctrl === event.ctrlKey);
		var shift = (keySet.shift === event.shiftKey);
		var keyCode = (keySet.keyCode === event.keyCode);

		var key = false;
		for (var i = 0; i < keySet.key.length; i++) {
			if (event,key === keySet.key[i]) key = true;
		};

		var result = (alt && ctrl && shift && (keyCode || key));
		if (result) return true;
	};

	return false;
}

KeyEventHandler.ignoreListForPress = [
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  33, key : ['PageUp'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  33, key : ['PageUp'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  34, key : ['PageDown'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  34, key : ['PageDown'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  35, key : ['End'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  35, key : ['End'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  36, key : ['Home'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  36, key : ['Home'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  37, key : ['ArrowLeft'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  37, key : ['ArrowLeft'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  38, key : ['ArrowUp'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  38, key : ['ArrowUp'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  39, key : ['ArrowRight'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  39, key : ['ArrowRight'] },
	{ alt : false,	ctrl : false,	shift : false,	keyCode :  40, key : ['ArrowDown'] },
	{ alt : false,	ctrl : true,	shift : false,	keyCode :  40, key : ['ArrowDown'] },
];
