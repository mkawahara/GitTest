$(function(){

	var viewModel = {};
	var document_id = '';
	var user_id = '';
	var confirmExit = false; // should use false when production
	var debug = true; // should use false when production
	var bindinged = false;

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

		$("#save-button").click(function(){
			save('false');
		});
		$("#save-as-default-button").click(function(){
			save('true');
		});

		$("#reset-button").click(function(){
			reset_part();
		});
		$("#cancel-button").click(function(){
			window.close();
		});
		$("#test-button-japanese").click(function(){
			test_play('japanese');
		});
		$("#test-button-math").click(function(){
			test_play('math');
		});


		// get document id
		if(!this.opener && debug){
			$.ajax({
				url: 'default.json',
				success: setup_data,
			});
			return;
		}

		var doc_info = this.opener.MessageManager.getDocumentId();

		if(doc_info === undefined){
			alert("編集中のドキュメント情報が取得できませんでした\n一度このウィンドウを閉じ、再度設定画面を開いてください");
		}

		document_id = doc_info.docId;
		user_id = doc_info.userId;

		Communicator.request(
			'voiceSettingGet',
			{doc_id: document_id},
			setup_data,
			function(e){
				alert("保存されている音声設定が取得できませんでした");
				debug_print(e);
			}
		);
	}

	var setup_data = function(res){
		debug_print(res);
		var json = res.voice_setting;
		if(json === undefined){
			json = res;
		}

		if(typeof json == 'string'){
			json = json.replace("<voice_setting>", "");
			json = json.replace("</voice_setting>", "");

			if(json.indexOf("<voice_setting") != -1){
				json = json.substring(json.indexOf(">") + 1);
			}

			try{
				viewModel = ko.mapping.fromJSON(json);
			}catch(e){
				alert("保存されていた音声設定が正しくありません。デフォルト設定でリセットします");
				$.ajax({
					url: 'default.json',
					success: setup_data,
				});
				return;
			}

		}else{
			viewModel = ko.mapping.fromJS(json);
		}
		ko.applyBindings(viewModel);
		bindinged = true;
	}

	var resetup_data = function(json){
		debug_print(json);

		if(typeof json == 'string'){
			ko.mapping.fromJSON(json, viewModel);
		}else{
			ko.mapping.fromJS(json, viewModel);
		}
	}

	var save = function(asDefault){
		var voice_setting = ko.mapping.toJSON(viewModel);
		var setting_name = '一般';
		if(viewModel.math.speech_mode == "elementary"){
			setting_name = '小学校';
		}

		voice_setting = "<voice_setting name=\"" + setting_name + "\">" + voice_setting + "</voice_setting>";

		Communicator.request(
			'voiceSettingSave',
			{doc_id: document_id,voice_setting: voice_setting, as_default: asDefault},
			function(res){
				debug_print(res);
				confirmExit = true;
				window.close();
			},
			function(e){
				alert('設定の保存ができませんでした');
				debug_print(e);
			}
		)
	}

	var reset_part = function(){
		var ajaxOpts = {
			url: 'audio-settings.json',
			type: 'GET',
			success: resetup_data,
			error: function(e){
				debug_print(e);
				alert("デフォルト設定が読み込めませんでした");
			}
		}
		$.ajax(ajaxOpts);
	}

	var test_play = function(type){
		// find audio tag
		var audio_tag = document.getElementById("audio-tag");

		// stop audio
		audio_tag.pause();
		audio_tag.src = '';

		// sample speech text
		var speech_text = "こんにちは";

		// merget setting for test play
		var voice_setting = ko.mapping.toJS(viewModel);
		var voice_params = voice_setting[type]["voice"]
		voice_setting["japanese"]["voice"] = voice_params;

		// prepare params
		var json = JSON.stringify(voice_setting);
		var data = new FormData();
		data.append('text', speech_text);
		data.append('voice_setting', json); // data.append('audio_setting', json);


		// prepare ajax
		var request_url = Communicator.getUrl('audioTest'); //"http://52.68.12.127:8880/api/v1/audio-adhoc/mp3";

		var xhr = new XMLHttpRequest();
		xhr.open('POST', request_url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(){
			// parse mp3 binary
			var bytes = new Uint8Array(this.response);
			var binaryData = "";
			for (var i = 0, len = bytes.byteLength; i < len; i++) {
				binaryData += String.fromCharCode(bytes[i]);
			}

			// create data uri
			var dataUri = "data:audio/mp3;base64," + window.btoa(binaryData);

			// set data and play audio
			audio_tag.src = dataUri;
			audio_tag.play();
		};
		xhr.onerror = function(){
			debug_print(this);
			alert('音声の取得ができませんでした');
		}
		debug_print(data);

		// send ajax
		xhr.send(data);

	}

	init();
});
