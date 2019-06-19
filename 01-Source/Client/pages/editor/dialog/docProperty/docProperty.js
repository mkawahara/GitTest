function DocumentProperty() {
	this.fontSize = '12pt';
	this.fontName = 'ＭＳ Ｐ明朝';
	this.fontAsDefault = false;
};

DocumentProperty._instance = null;

Object.defineProperty(DocumentProperty, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (DocumentProperty._instance === null) DocumentProperty._instance = new DocumentProperty();
		return DocumentProperty._instance;
	},
});


// (常に pt付で扱います)
Object.defineProperty(DocumentProperty.prototype, 'FontSize', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.fontSize;
	},
	set: function(value) {
		this.fontSize = value;
	},
});

Object.defineProperty(DocumentProperty.prototype, 'Font', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.fontName; },
	set: function(value) {
		this.fontName = value;
	},
});

Object.defineProperty(DocumentProperty.prototype, 'FontAsDefault', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.fontAsDefault; },
	set: function(value) {
		this.fontAsDefault = value;
	},
});

