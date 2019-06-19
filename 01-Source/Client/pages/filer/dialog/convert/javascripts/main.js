$(function(){

var viewModel = {};
var loaded = {};
var confirmExit = false;	// should false when production
var doc_id;
var debug = true;

var debug_print = function(value){
	if(debug){
		console.log(value);
	}
}


var init = function(){
	window.onbeforeunload = function(){
		if(!confirmExit){
			return '設定内容が保存されていませんので、他のページに移動すると変更内容が反映されません';
		}else{
			return;
		}
	}

	// parse query params
	var qd = {};
	location.search.substr(1).split("&").forEach(function(item) {var s = item.split("="), k = s[0], v = s[1] && decodeURIComponent(s[1]); (k in qd) ? qd[k].push(v) : qd[k] = [v]});
	doc_id = qd['doc_id'][0];

	

	// asert doc_id
	debug_print(doc_id);
	if(doc_id == '' || doc_id === undefined){
		alert('ドキュメントの情報が読み込めませんでした');
	}

	if(typeof Communicator === 'undefined'){
		loadDefaultSettings();
	}else{
		loadSavedSettings();
	}
}

var loadSavedSettings = function(){
	Communicator.request(
		'convertSettingGet',
		{doc_id: doc_id},
		function(res){
			// success
			debug_print(res);
			setup_data(res.convert_setting);
		},
		function(error){
			// error
			debug_print(error);
			alert("ドキュメントの変換設定が読み込めませんでした。デフォルト設定でリセットします");
			loadDefaultSettings();
		}
	);
}

var loadDefaultSettings = function(){
	$.ajax({
		url: "default_all.json",
		success: setup_data,
	});
}

var setup_data = function(res){
	// viewModel = ko.mapping.fromJSON(result);
	loaded = res;
	if(typeof res == 'string'){
		res = res.replace('<convert_setting>', '');
		res = res.replace('</convert_setting>', '');

		if(res.indexOf("<convert_setting") != -1){
			res = res.substring(res.indexOf(">") + 1);
		}

		// migrate
		res = res.replace('daisy30_', 'daisy3_');

		try{
			viewModel = ko.mapping.fromJSON(res);
		}catch(e){
			alert("保存されていた変換設定が正しくありません。デフォルト設定でリセットします");
			loadDefaultSettings();
			return;
		}

	}else{
		viewModel = ko.mapping.fromJS(res);
	}

	// append new attributes if not exist
	var targets = Object.keys(viewModel);
	targets.forEach(function(targetKey){
		var target = viewModel[targetKey];

		// <target>.setting.general.ie_lasted_compatible
		if(targetKey.indexOf('daisy') != -1){
			if(target.setting.general.ie_lasted_compatible === undefined)
				target.setting.general.ie_lasted_compatible = ko.observable(true);
		}

		// <target>.setting.general.embed_chattybooks_express
		if(targetKey.indexOf('daisy') != -1){
			if(target.setting.general.embed_chattybooks_express === undefined){
				target.setting.general.embed_chattybooks_express = ko.observable(true);
			}
		}
	});

	viewModel.target = ko.observable('daisy202_multimedia');
	viewModel.menuClicked = function(v){
		this.target(v);
		debug_print(this);
	};
	viewModel.targetS = function() {
		var res = viewModel.target();
		debug_print(res);
		return res;
	}

	viewModel.requestStatus = ko.observable('');
	viewModel.buttonMessage = ko.pureComputed(function(){
		debug_print(this);
		if(this.requestStatus() == ''){
			return '変換する';
		}
		if(this.requestStatus() == 'processing'){
			return '通信中...';
		}
		if(this.requestStatus() == 'complete'){
			return '変換をリクエストしました';
		}
		if(this.requestStatus() == 'error'){
			return '通信エラー';
		}
	}, viewModel);
	viewModel.buttonAsDefaultMessage = ko.pureComputed(function(){
		debug_print(this);
		if(this.requestStatus() == ''){
			return '既定に設定して変換する';
		}
		if(this.requestStatus() == 'processing'){
			return '通信中...';
		}
		if(this.requestStatus() == 'complete'){
			return '変換をリクエストしました';
		}
		if(this.requestStatus() == 'error'){
			return '通信エラー';
		}
	}, viewModel);
	viewModel.convertButtonPushed = convertButtonPushed;
	viewModel.resetButtonPushed = resetButtonPushed;
	viewModel.cancelButtonPushed = cancelButtonPushed;
	viewModel.convertAsDefaultButtonPushed = convertAsDefaultButtonPushed;

	// setup 'not' binding
	ko.bindingHandlers.not = {
	    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
	        //expects a single, truthy/falsy binding,
	        //    such as checked, visible, enable, etc.
	        var binding = valueAccessor();
	        var observable = binding[Object.keys(binding)[0]];
	        var notComputed = ko.computed({
	            read: function () {
	                return !observable();
	            },
	            write: function (newValue) {
	                observable(!newValue);
	            }
	        });
	        var newBinding = {};
	        newBinding[Object.keys(binding)[0]] = notComputed;
	        ko.applyBindingsToNode(element, newBinding, viewModel);
	    }
	};

	ko.applyBindings(viewModel);
}

var resetup_data = function(res){
	debug_print(res);

	if(typeof res == 'string'){
		ko.mapping.fromJSON(res, viewModel);
	}else{
		ko.mapping.fromJS(res, viewModel);
	}
}

var resetButtonPushed = function(){
	$.ajax({
		url: "default_all.json",
		success: resetup_data
	});
}

var convertButtonPushedInner = function(asDefault, successHandle){
	// save options
	var convert_setting = "<convert_setting>" + ko.mapping.toJSON(viewModel) + "</convert_setting>";

	if(asDefault == 'true'){
		// clear metadata
		var target 		= viewModel.target();
		var temp_json 	= ko.mapping.toJSON(viewModel);
		var temp_object = JSON.parse(temp_json);
		var metadata 	= temp_object[target].setting.metadata
		Object.keys(metadata).forEach(function(key){
			metadata[key] = '';
		});
		var cleared_json = JSON.stringify(temp_object);

		convert_setting = "<convert_setting>" + cleared_json + "</convert_setting>";
		debug_print(convert_setting);
	}

	Communicator.request(
		'convertSettingSave',
		{doc_id: doc_id, convert_setting: convert_setting, as_default: asDefault},
		function(res){
			// success
			debug_print(res);
			// triger execute
			successHandle();
		},
		function(e){
			// error
			alert("設定の保存ができませんでした");
			debug_print(e);
		}
	);
}

var convertAsDefaultButtonPushed = function(){
	convertButtonPushedInner('true', function(){
		convertButtonPushedInner('false', requestExecute);
	});
}

var convertButtonPushed = function(){
	convertButtonPushedInner('false', requestExecute);
}

var requestExecute = function(){
	var targetOption;
	var target = viewModel.target();

	// button change
	viewModel.requestStatus('processing');

	sendRequestToFrontServer(target);
	// sendRequestToDataConvertServer(target);
}

var sendRequestToFrontServer = function(target){
	Communicator.request(
		'exportStart',
		{doc_id: doc_id, file_type: target},
		function(res){
			// success
			debug_print(res);
			requestSuccessHandler();
		},
		function(error){
			// error
			debug_print(error);
			requestErrorHandler();
		}
	);
}

var sendRequestToDataConvertServer = function(target){
	var ajaxOpts = {
		url: "http://52.68.12.127:8880/api/v1/export/request",
		method: "post",
		data: {
			document_id: doc_id,
			// user_id: user_id,
			file_type: target,
			// options: targetOption
		},
		success: requestSuccessHandler,
		error: requestErrorHandler,
	};

	debug_print(ajaxOpts);

	$.ajax(ajaxOpts);
}

var requestSuccessHandler = function(){
	// button change
	viewModel.requestStatus('complete');
	confirmExit = true;

	// notify opener
	window.opener.ExportManager.refreshStatus(doc_id);

	// wait some sec and close
	setTimeout(function(){window.close()}, 1200);
}

var requestErrorHandler = function(e){
	viewModel.requestStatus('error');

	alert('変換のリクエスト時にエラーが発生しました');

	setTimeout(function(){viewModel.requestStatus('')}, 5000);
}

var cancelButtonPushed = function(e){
	window.close();
}

init();

});
