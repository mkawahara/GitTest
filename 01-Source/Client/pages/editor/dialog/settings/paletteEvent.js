function onBackground(color) {
	var bgColorRule = getStyleClass('bgcolor');
	if (bgColorRule !== null) bgColorRule.style['background-color'] = color;
	ConfigManager.instance.BackgroundColor = color;
};

function onText(color) {
	$('#textcolor').css('color', color);
	ConfigManager.instance.TextColor = color;
};

function onMath(color) {
	$('#mathcolor').css('color', color);
	ConfigManager.instance.MathColor = color;
};

function onChem(color) {
	$('#chemcolor').css('color', color);
	ConfigManager.instance.ChemColor = color;
};

function onCtrl(color) {
	$('#ctrlcolor').css('color', color);
	ConfigManager.instance.ControlColor = color;
};

function onMathCtrl(color) {
	$('#mathctrlcolor').css('color', color);
	ConfigManager.instance.MathControlColor = color;
};

function onRuby(color) {
	$('#rubycolor').css('color', color);
	ConfigManager.instance.RubyColor = color;
};

function onRange(color) {
	//$('#selectioncolor').css('color', ConfigManager.instance.TextColor);
	$('#selectioncolor').css('background-color', color);
	ConfigManager.instance.Selection = color;
};

function onHighFore(color) {
	$('#hlforecolor').css('background-color', color);
	ConfigManager.instance.HighlightForeColor = color;
};

function onHighBack(color) {
	$('#hlbgcolor').css('background-color', color);
	ConfigManager.instance.HighlightBgColor = color;
};
