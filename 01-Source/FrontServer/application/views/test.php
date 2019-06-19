<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>ChattyInftyOnline API テスト</title>

	<style type="text/css">
		h2 {
			background-color: lightskyblue;
			padding: 0.2em 0.4em;
			margin-top: 2em;
		}
		h3 {
			background-color: lightcyan;
			padding: 0.2em 0.4em;
			margin-top: 2em;
		}
		section {
			margin: 0 1em;
		}
		table.input {
			border-collapse: collapse;
			border: none;
		}
		table.input tr {
		}
		table.input td {
			border: 2px solid #A7C0DE;
			padding: 0.2em 0.2em;
		}
		table.input th {
			border: 2px solid #A7C0DE;
			background-color:	#4F81BD;
			color: white;
			text-align: center;
			padding: 0.2em 0.5em;
		}
		table.input tr.button td {
			border: none;
			background-color: white;
			text-align: right;
		}
		pre.response {
			border: 1px solid gray;
			padding: 0.2em 0.4em;
			white-space: pre-wrap;
		}
	</style>
	<script type="text/javascript">

		function trim(str) {
			return str.replace(/^[　\s]+|[　\s]+$/g, '');
		}

		function clearResponse(elem, xmlElem) {
			$(elem).text('通信中...');
			if (xmlElem) {
				$(xmlElem).text('');
			}
		}

		/**
		 * Ajax 成功を処理するための関数を作成します。
		 * 指定された jQuery オブジェクトの .text() メソッドによって、
		 * JavaScript オブジェクトを表示します。
		 */
		function createSuccessHandler(elem, xmlField, xmlElem) {
			return function (obj, textStatus, jqXHR) {

				// エラー表示用の要素を取得します。
				var errorElem = $(elem);
				errorElem = errorElem.parent().find('div.error') || errorElem;

				// PHP エラーが発生しても、Ajax 的には成功の場合がある。
				// その場合は、obj が文字列になるので、それを HTML として表示します。
				if (typeof(obj) === 'string') {
					errorElem.html(obj);
					return;
				}

				// エラーでない場合は、前回のエラーを消去します。
				errorElem.html('');

				// XML フィールドが指定されている場合は、フィールド値を取得し、置換します。
				var xml = '';
				if (xmlField) {
					if (obj.hasOwnProperty(xmlField)) {
						xml = obj[xmlField];
						obj[xmlField] = '(下に表示)';
					}
				}

				// JSON を表示します。
				var json = JSON.stringify(obj, null, 2);
				$(elem).text(json);

				// XML フィールドが指定されている場合
				if (xmlField) {
					$(xmlElem).text(xml);
				}
			}
		}

		/**
		 * Ajax エラーを処理するための関数を作成します。
		 * 指定された jQuery オブジェクトの .text() メソッドによって、
		 * エラー内容を表示します。
		 */
		function createErrorHandler(elem) {
			return function (jqXHR, textStatus, errorThrown) {
				elem = $(elem);
				elem = elem.parent().find('div.error') || elem;
				elem.html(jqXHR.responseText);
			}
		}
	</script>
</head>
<body>

	<h1>ChattyInftyOnline API テスト</h1>

	<section>
		<h2>ログイン/ログアウト</h2>

		<section>
			<h3>チャレンジ文字列の取得</h3>
			<form name="userChallengeForm" action="none">
				<input type="button" name="userChallengeButton" value="user/challenge" onclick="onUserChallengeButton()">
			</form>
			<div class="error"></div>
			<pre class="response" id="userChallengeResponse"></pre>
			<script type="text/javascript">
				var g_userChallenge = '';
				function onUserChallengeButton() {
					var form = document.forms['userChallengeForm'];
					clearResponse('#userChallengeResponse');
					$.ajax({
						'url':		'<?php echo base_url("user/challenge") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	onUserChallengeResponse,
						'error':	createErrorHandler('#userChallengeResponse'),
					});
				}
				function onUserChallengeResponse(obj) {
					var json = JSON.stringify(obj, null, 2);
					$('#userChallengeResponse').text(json);
					g_userChallenge = obj.value;
				}
			</script>
		</section>

		<section>
			<h3>ログイン</h3>
			<p>チャレンジ文字列を取得してから実行してください。</p>
			<form name="userLoginForm" action="none">
			<table class="input">
				<tr>
					<th>【アカウント ID】</th>
					<td><input type="text" name="account" value="user1" size="20"></td>
				</tr>
				<tr>
					<th>【パスワード】</th>
					<td><input type="text" name="password" value="pass1" size="20"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="userLoginButton" value="user/login" onclick="onUserLoginButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="userLoginResponse"></pre>
			<script type="text/javascript">
				function onUserLoginButton() {
					var form = document.forms['userLoginForm'];
					var account = form['account'].value;
					var password = form['password'].value;
					var text = account + ':' + password;
					var passwordHash = (new jsSHA(text, 'TEXT')).getHash('SHA-256', 'HEX');
					text = passwordHash + ':' + g_userChallenge;
					var responseHash = (new jsSHA(text, 'TEXT')).getHash('SHA-256', 'HEX');
					clearResponse('#userLoginResponse');
					$.ajax({
						'url':		'<?php echo base_url("user/login") ?>',
						'type':		'POST',
						'data':		{ 'account':account, 'response':responseHash },
						'success':	createSuccessHandler('#userLoginResponse'),
						'error':	createErrorHandler('#userLoginResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ログインしているか？</h3>
			<form name="userHasloginedForm" action="none">
			<table class="input">
				<tr class="button">
					<td colspan="1">
						<input type="button" name="userHasloginedButton" value="user/haslogined" onclick="onUserHasloginedButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="userHasloginedResponse"></pre>
			<script type="text/javascript">
				function onUserHasloginedButton() {
					var form = document.forms['userHasloginedForm'];
					clearResponse('#userHasloginedResponse');
					$.ajax({
						'url':		'<?php echo base_url("user/haslogined") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#userHasloginedResponse'),
						'error':	createErrorHandler('#userHasloginedResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ログアウト</h3>
			<form name="userLogoutForm" action="none">
				<input type="button" name="userLogoutButton" value="user/logout" onclick="onUserLogoutButton()">
			</form>
			<div class="error"></div>
			<pre class="response" id="userLogoutResponse"></pre>
			<script type="text/javascript">
				var g_logout = '';
				function onUserLogoutButton() {
					var form = document.forms['userLogoutForm'];
					clearResponse('#userLogoutResponse');
					$.ajax({
						'url':		'<?php echo base_url("user/logout") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#userLogoutResponse'),
						'error':	createErrorHandler('#userLogoutResponse'),
					});
				}
			</script>
		</section>

	</section>


	<section>
		<h2>お知らせ情報</h2>

		<section>
			<h3>お知らせ情報の取得</h3>
			<p>ログインしていなくても取得できます。</p>
			<form name="newsGetdForm" action="none">
			<table class="input">
				<tr class="button">
					<td colspan="1">
						<input type="button" name="newsGetdButton" value="news/get" onclick="onNewsGetdButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="newsGetdResponse"></pre>
			<script type="text/javascript">
				function onNewsGetdButton() {
					var form = document.forms['newsGetdForm'];
					clearResponse('#newsGetdResponse');
					$.ajax({
						'url':		'<?php echo base_url("news/get") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#newsGetdResponse'),
						'error':	createErrorHandler('#newsGetdResponse'),
					});
				}
			</script>
		</section>
	</section>

	<section>
		<h2>ユーザー情報</h2>

		<section>
			<h3>ユーザー設定の取得</h3>
			<form name="usersettingGetForm" action="none">
				<input type="button" name="usersettingGetButton" value="usersetting/get" onclick="onUsersettingGetButton()">
			</form>
			<pre class="response" id="usersettingGetResponse"></pre>
			<pre class="response" id="usersettingGetResponseXml"></pre>
			<script type="text/javascript">
				function onUsersettingGetButton() {
					var form = document.forms['usersettingGetForm'];
					clearResponse('#usersettingGetResponse', '#usersettingGetResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("usersetting/get") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#usersettingGetResponse', 'user_setting', '#usersettingGetResponseXml'),
						'error':	createErrorHandler('#usersettingGetResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ユーザー設定の保存</h3>
			<form name="usersettingSaveForm" action="none">
				<table class="input">
				<tr>
					<th>【ユーザー設定】</th>
					<td><textarea name="user_setting" rows="5" cols="40">&lt;user_setting&gt;
  &lt;sample&gt;
    サンプル設定
  &lt;/sample&gt;
&lt;/user_setting&gt;</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="usersettingSaveButton" value="usersetting/save" onclick="onUsersettingSaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="usersettingSaveResponse"></pre>
			<script type="text/javascript">
				function onUsersettingSaveButton() {
					var form = document.forms['usersettingSaveForm'];
					var user_setting = form['user_setting'].value;
					clearResponse('#usersettingSaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("usersetting/save") ?>',
						'type':		'POST',
						'data':		{ 'user_setting':user_setting },
						'success':	createSuccessHandler('#usersettingSaveResponse'),
						'error':	createErrorHandler('#usersettingSaveResponse'),
					});
				}
			</script>
		</section>


		<section>
			<h3>エディタ設定の取得</h3>
			<form name="editorsettingGetForm" action="none">
				<input type="button" name="editorsettingGetButton" value="editorsetting/get" onclick="onEditorsettingGetButton()">
			</form>
			<pre class="response" id="editorsettingGetResponse"></pre>
			<pre class="response" id="editorsettingGetResponseXml"></pre>
			<script type="text/javascript">
				function onEditorsettingGetButton() {
					var form = document.forms['editorsettingGetForm'];
					clearResponse('#editorsettingGetResponse', '#editorsettingGetResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("editorsetting/get") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#editorsettingGetResponse', 'editor_setting', '#editorsettingGetResponseXml'),
						'error':	createErrorHandler('#editorsettingGetResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>エディタ設定の保存</h3>
			<form name="editorsettingSaveForm" action="none">
				<table class="input">
				<tr>
					<th>【エディタ設定】</th>
					<td><textarea name="editor_setting" rows="5" cols="40">&lt;editor_setting&gt;
  &lt;sample&gt;
    サンプル設定
  &lt;/sample&gt;
&lt;/editor_setting&gt;</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="editorsettingSaveButton" value="editorsetting/save" onclick="onEditorsettingSaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="editorsettingSaveResponse"></pre>
			<script type="text/javascript">
				function onEditorsettingSaveButton() {
					var form = document.forms['editorsettingSaveForm'];
					var editor_setting = form['editor_setting'].value;
					clearResponse('#editorsettingSaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("editorsetting/save") ?>',
						'type':		'POST',
						'data':		{ 'editor_setting':editor_setting },
						'success':	createSuccessHandler('#editorsettingSaveResponse'),
						'error':	createErrorHandler('#editorsettingSaveResponse'),
					});
				}
			</script>
		</section>

	</section>

	<section>
		<h2>ファイル操作</h2>

		<section>
			<h3>ファイル ツリーの取得</h3>
			<form name="fileTreeForm" action="none">
				<input type="button" name="fileTreeButton" value="file/tree" onclick="onFileTreeButton()">
			</form>
			<div class="error"></div>
			<pre class="response" id="fileTreeResponse"></pre>
			<script type="text/javascript">
				function onFileTreeButton() {
					var form = document.forms['fileTreeForm'];
					clearResponse('#fileTreeResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/tree") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#fileTreeResponse'),
						'error':	createErrorHandler('#fileTreeResponse'),
					});
				}
			</script>
		</section>


		<section>
			<h3>ファイル/フォルダの存在確認</h3>
			<form name="fileExistsForm" action="none">
				<table class="input">
				<tr>
					<th>【親フォルダ ID】</th>
					<td><input type="text" name="parent_id" size="4"></td>
				</tr>
				<tr>
					<th>【ファイル名】</th>
					<td><input type="text" name="file_name" size="30"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileExistsButton" value="file/exists" onclick="onFileExistsButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileExistsResponse"></pre>
			<script type="text/javascript">
				function onFileExistsButton() {
					var form = document.forms['fileExistsForm'];
					var parent_id = form['parent_id'].value;
					var file_name = form['file_name'].value;
					clearResponse('#fileExistsResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/exists") ?>',
						'type':		'POST',
						'data':		{ 'parent_id':parent_id, 'file_name':file_name },
						'success':	createSuccessHandler('#fileExistsResponse'),
						'error':	createErrorHandler('#fileExistsResponse'),
					});
				}
			</script>
		</section>


		<section>
			<h3>ファイル/フォルダの作成</h3>
			<form name="fileCreateForm" action="none">
				<table class="input">
				<tr>
					<th>【タイプ】</th>
					<td><input type="text" name="type" size="4"> (1=ファイル, 2=フォルダ)</td>
				</tr>
				<tr>
					<th>【親フォルダ ID】</th>
					<td><input type="text" name="parent_id" size="4"></td>
				</tr>
				<tr>
					<th>【ベース名】</th>
					<td><input type="text" name="name" size="30"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileCreateButton" value="file/create" onclick="onFileCreateButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileCreateResponse"></pre>
			<script type="text/javascript">
				function onFileCreateButton() {
					var form = document.forms['fileCreateForm'];
					var type = form['type'].value;
					var parent_id = form['parent_id'].value;
					var name = form['name'].value;
					clearResponse('#fileCreateResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/create") ?>',
						'type':		'POST',
						'data':		{ 'type':type, 'parent_id':parent_id, 'name':name },
						'success':	createSuccessHandler('#fileCreateResponse'),
						'error':	createErrorHandler('#fileCreateResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイル/フォルダの移動</h3>
			<form name="fileMoveForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr>
					<th>【旧親フォルダ ID】</th>
					<td><input type="text" name="old_parent_id" size="4"></td>
				</tr>
				<tr>
					<th>【新親フォルダ ID】</th>
					<td><input type="text" name="new_parent_id" size="4"></td>
				</tr>
				<tr>
					<th>【強制フラグ】</th>
					<td><input type="text" name="force" value="false" size="8"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileMoveButton" value="file/move" onclick="onFileMoveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileMoveResponse"></pre>
			<script type="text/javascript">
				function onFileMoveButton() {
					var form = document.forms['fileMoveForm'];
					var id = form['id'].value;
					var old_parent_id = form['old_parent_id'].value;
					var new_parent_id = form['new_parent_id'].value;
					var force = form['force'].value;
					clearResponse('#fileMoveResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/move") ?>',
						'type':		'POST',
						'data':		{ 'id':id, 'old_parent_id':old_parent_id, 'new_parent_id':new_parent_id, 'force':force },
						'success':	createSuccessHandler('#fileMoveResponse'),
						'error':	createErrorHandler('#fileMoveResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイルのコピー</h3>
			<form name="fileCopyForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr>
					<th>【親フォルダ ID】</th>
					<td><input type="text" name="parent_id" size="4"></td>
				</tr>
				<tr>
					<th>【強制フラグ】</th>
					<td><input type="text" name="force" value="cancel" size="8"> ※yes/rename/cancel</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileCopyButton" value="file/copy" onclick="onFileCopyButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileCopyResponse"></pre>
			<script type="text/javascript">
				function onFileCopyButton() {
					var form = document.forms['fileCopyForm'];
					var id = form['id'].value;
					var parent_id = form['parent_id'].value;
					var force = form['force'].value;
					clearResponse('#fileCopyResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/copy") ?>',
						'type':		'POST',
						'data':		{ 'id':id, 'parent_id':parent_id, 'force':force },
						'success':	createSuccessHandler('#fileCopyResponse'),
						'error':	createErrorHandler('#fileCopyResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイル/フォルダの削除</h3>
			<form name="fileDeleteForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileDeleteButton" value="file/delete" onclick="onFileDeleteButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileDeleteResponse"></pre>
			<script type="text/javascript">
				function onFileDeleteButton() {
					var form = document.forms['fileDeleteForm'];
					var id = form['id'].value;
					clearResponse('#fileDeleteResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/delete") ?>',
						'type':		'POST',
						'data':		{ 'id':id },
						'success':	createSuccessHandler('#fileDeleteResponse'),
						'error':	createErrorHandler('#fileDeleteResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイル/フォルダの名前変更</h3>
			<form name="fileRenameForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr>
					<th>【旧ファイル名】</th>
					<td><input type="text" name="old_name" size="30"></td>
				</tr>
				<tr>
					<th>【新ファイル名】</th>
					<td><input type="text" name="new_name" size="30"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileRenameButton" value="file/rename" onclick="onFileRenameButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileRenameResponse"></pre>
			<script type="text/javascript">
				function onFileRenameButton() {
					var form = document.forms['fileRenameForm'];
					var id       = form['id'].value;
					var old_name = form['old_name'].value;
					var new_name = form['new_name'].value;
					clearResponse('#fileRenameResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/rename") ?>',
						'type':		'POST',
						'data':		{ 'id':id, 'old_name':old_name, 'new_name':new_name },
						'success':	createSuccessHandler('#fileRenameResponse'),
						'error':	createErrorHandler('#fileRenameResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイルのインポート開始</h3>
			<form name="fileImportForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル】</th>
					<td><input type="file" name="file" size="30"></td>
				</tr>
				<tr>
					<th>【親フォルダ ID】</th>
					<td><input type="text" name="parent_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileImportButton" value="file/import" onclick="onFileImportButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileImportResponse"></pre>
			<script type="text/javascript">
				function onFileImportButton() {
					var form = document.forms['fileImportForm'];
					//var formData = new FormData(form);
					var formData = new FormData();
					formData.append('file', form['file'].files[0] );
					formData.append('parent_id', form['parent_id'].value );
					//var file      = new FormData(form['file']); //form['file'].value;
					//var parent_id = form['parent_id'].value;
					clearResponse('#fileImportResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/import") ?>',
						'type':		'POST',
						'data':		formData,
						'success':	createSuccessHandler('#fileImportResponse'),
						'error':	createErrorHandler('#fileImportResponse'),
						'processData': false,	// ファイル送信に必要
						'contentType': false,	// ファイル送信に必要
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイルのインポート確認</h3>
			<form name="fileImportinfoForm" action="none">
				<table class="input">
				<tr>
					<th>【タスク ID】</th>
					<td><input type="text" name="task_id" size="40"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileImportinfoButton" value="file/importinfo" onclick="onFileImportinfoButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileImportinfoResponse"></pre>
			<script type="text/javascript">
				function onFileImportinfoButton() {
					var form = document.forms['fileImportinfoForm'];
					var task_id = form['task_id'].value;
					clearResponse('#fileImportinfoResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/importinfo") ?>',
						'type':		'POST',
						'data':		{ 'task_id':task_id },
						'success':	createSuccessHandler('#fileImportinfoResponse'),
						'error':	createErrorHandler('#fileImportinfoResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイルのエクスポート開始</h3>
			<form name="fileExportForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル ID】</th>
					<td><input type="text" name="file_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileExportButton" value="file/export" onclick="onFileExportButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileExportResponse"></pre>
			<script type="text/javascript">
				function onFileExportButton() {
					var form = document.forms['fileExportForm'];
					var file_id = form['file_id'].value;
					clearResponse('#fileExportResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/export") ?>',
						'type':		'POST',
						'data':		{ 'id':file_id },
						'success':	createSuccessHandler('#fileExportResponse'),
						'error':	createErrorHandler('#fileExportResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>ファイルのエクスポート確認</h3>
			<form name="fileExportinfoForm" action="none">
				<table class="input">
				<tr>
					<th>【タスク ID】</th>
					<td><input type="text" name="task_id" size="40"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="fileExportinfoButton" value="file/exportinfo" onclick="onFileExportinfoButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="fileExportinfoResponse"></pre>
			<script type="text/javascript">
				function onFileExportinfoButton() {
					var form = document.forms['fileExportinfoForm'];
					var task_id = form['task_id'].value;
					clearResponse('#fileExportinfoResponse');
					$.ajax({
						'url':		'<?php echo base_url("file/exportinfo") ?>',
						'type':		'POST',
						'data':		{ 'task_id':task_id },
						'success':	createSuccessHandler('#fileExportinfoResponse'),
						'error':	createErrorHandler('#fileExportinfoResponse'),
					});
				}
			</script>
		</section>

	</section>

	<section>
		<h2>文書操作</h2>

		<section>
			<h3>文書のファイル情報取得</h3>
			<form name="docFileForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docFileButton" value="doc/file" onclick="onDocFileButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docFileResponse"></pre>
			<script type="text/javascript">
				function onDocFileButton() {
					var form = document.forms['docFileForm'];
					var id = form['id'].value;
					clearResponse('#docFileResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/file") ?>',
						'type':		'POST',
						'data':		{ 'id':id },
						'success':	createSuccessHandler('#docFileResponse'),
						'error':	createErrorHandler('#docFileResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書の編集開始</h3>
			<form name="docBegineditForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docBegineditButton" value="doc/beginedit" onclick="onDocBegineditButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docBegineditResponse"></pre>
			<script type="text/javascript">
				function onDocBegineditButton() {
					var form = document.forms['docBegineditForm'];
					var id = form['id'].value;
					clearResponse('#docBegineditResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/beginedit") ?>',
						'type':		'POST',
						'data':		{ 'id':id },
						'success':	createSuccessHandler('#docBegineditResponse'),
						'error':	createErrorHandler('#docBegineditResponse'),
					});
				}
			</script>
		</section>


		<section>
			<h3>文書の強制編集</h3>
			<form name="docForceeditForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docForceeditButton" value="doc/forceedit" onclick="onDocForceeditButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docForceeditResponse"></pre>
			<script type="text/javascript">
				function onDocForceeditButton() {
					var form = document.forms['docForceeditForm'];
					var id = form['id'].value;
					clearResponse('#docForceeditResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/forceedit") ?>',
						'type':		'POST',
						'data':		{ 'id':id },
						'success':	createSuccessHandler('#docForceeditResponse'),
						'error':	createErrorHandler('#docForceeditResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書の編集解除</h3>
			<form name="docEndeditForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docEndeditButton" value="doc/endedit" onclick="onDocEndeditButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docEndeditResponse"></pre>
			<script type="text/javascript">
				function onDocEndeditButton() {
					var form = document.forms['docEndeditForm'];
					var id = form['id'].value;
					clearResponse('#docEndeditResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/endedit") ?>',
						'type':		'POST',
						'data':		{ 'id':id },
						'success':	createSuccessHandler('#docEndeditResponse'),
						'error':	createErrorHandler('#docEndeditResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書の情報取得</h3>
			<form name="docInfoForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docInfoButton" value="doc/info" onclick="onDocInfoButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docInfoResponse"></pre>
			<pre class="response" id="docInfoResponseXml"></pre>
			<script type="text/javascript">
				function onDocInfoButton() {
					var form = document.forms['docInfoForm'];
					var id = form['id'].value;
					clearResponse('#docInfoResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/info") ?>',
						'type':		'POST',
						'data':		{ 'id':id },
						'success':	createSuccessHandler('#docInfoResponse', 'content', '#docInfoResponseXml'),
						'error':	createErrorHandler('#docInfoResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書の段落取得</h3>
			<form name="docPForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【段落 ID】</th>
					<td><input type="text" name="p_id" size="4"></td>
				</tr>
				<tr>
					<th>【リビジョン番号】</th>
					<td><input type="text" name="revision" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docPButton" value="doc/p" onclick="onDocPButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docPResponse"></pre>
			<pre class="response" id="docPResponseXml"></pre>
			<script type="text/javascript">
				function onDocPButton() {
					var form = document.forms['docPForm'];
					var doc_id   = form['doc_id'].value;
					var p_id     = form['p_id'].value;
					var revision = form['revision'].value;
					clearResponse('#docPResponse', '#docPResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("doc/p") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'p_id':p_id, 'revision':revision },
						'success':	createSuccessHandler('#docPResponse', 'content', '#docPResponseXml'),
						'error':	createErrorHandler('#docPResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書の上書き保存</h3>
			<form name="docSaveForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【文書内容】</th>
					<td>
						文書内容の XML を指定します。<br>
						<textarea name="content" rows="8" cols="80">&lt;InftyOnlineDocument&gt;
  &lt;document_property&gt;
    &lt;font_family&gt;へも字フォント&lt;/font_family&gt;&lt;font_size&gt;39&lt;/font_size&gt;
  &lt;/document_property&gt;
  &lt;section_list&gt;
    &lt;section indexdepth="0" title="オレ様のセクション"&gt;
      &lt;paragraph_id_list&gt;1,2,3&lt;/paragraph_id_list&gt;
    &lt;/section&gt;
  &lt;/section_list&gt;
&lt;/InftyOnlineDocument&gt;</textarea></td>
				</tr>
				<tr>
					<th>【段落内容】</th>
					<td>
						段落 ID から段落 XML への連想配列を JSON 形式で指定します。<br>
						<textarea name="p_list" rows="8" cols="80">[
{ "id":1, "content":"&lt;paragraph id=\"1\" align=\"left\" class=\"font-mediam\"&gt;段落１だぜ&lt;br/&gt;&lt;/paragraph&gt;" },
{ "id":2, "content":"&lt;paragraph id=\"2\" align=\"left\" class=\"font-mediam\"&gt;段落２だぜ&lt;br/&gt;&lt;/paragraph&gt;" },
{ "id":3, "content":"&lt;paragraph id=\"3\" align=\"left\" class=\"font-mediam\"&gt;段落３だぜ&lt;br/&gt;&lt;/paragraph&gt;" }
]</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docSaveButton" value="doc/save" onclick="onDocSaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docSaveResponse"></pre>
			<script type="text/javascript">
				function onDocSaveButton() {
					var form = document.forms['docSaveForm'];
					var doc_id  = form['doc_id'].value;
					var content = form['content'].value;
					var p_list  = form['p_list'].value;
					clearResponse('#docSaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/save") ?>',
						'type':		'POST',
						'data':		{ 'id':doc_id, 'content':content, 'p_list':p_list },
						'success':	createSuccessHandler('#docSaveResponse'),
						'error':	createErrorHandler('#docSaveResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書の別名保存</h3>
			<form name="docSaveAsForm" action="none">
				<table class="input">
				<tr>
					<th>【親フォルダ ID】</th>
					<td><input type="text" name="parent_id" size="4"></td>
				</tr>
				<tr>
					<th>【元文書 ID】</th>
					<td><input type="text" name="org_doc_id" size="4"></td>
				</tr>
				<tr>
					<th nowrap>【新しいファイル名】</th>
					<td><input type="text" name="new_name" size="40"></td>
				</tr>
				<tr>
					<th>【強制フラグ】</th>
					<td><input type="text" name="force" value="false" size="8"></td>
				</tr>
				<tr>
					<th>【文書内容】</th>
					<td>
						文書内容の XML を指定します。<br>
						<textarea name="content" rows="8" cols="70">&lt;InftyOnlineDocument&gt;
  &lt;document_property&gt;
    &lt;font_family&gt;もけ字フォント&lt;/font_family&gt;&lt;font_size&gt;24&lt;/font_size&gt;
  &lt;/document_property&gt;
  &lt;section_list&gt;
    &lt;section indexdepth="0" title="ボクちんのセクション"&gt;
      &lt;paragraph_id_list&gt;1,2,3&lt;/paragraph_id_list&gt;
    &lt;/section&gt;
  &lt;/section_list&gt;
&lt;/InftyOnlineDocument&gt;</textarea></td>
				</tr>
				<tr>
					<th>【段落内容】</th>
					<td>
						段落 ID から段落 XML への連想配列を JSON 形式で指定します。<br>
						<textarea name="p_list" rows="8" cols="70">[
{ "id":1, "content":"&lt;paragraph id=\"1\" align=\"left\" class=\"font-mediam\"&gt;段落１だよ&lt;br/&gt;&lt;/paragraph&gt;" },
{ "id":2, "content":"&lt;paragraph id=\"2\" align=\"left\" class=\"font-mediam\"&gt;段落２だよ&lt;br/&gt;&lt;/paragraph&gt;" },
{ "id":3, "content":"&lt;paragraph id=\"3\" align=\"left\" class=\"font-mediam\"&gt;段落３だよ&lt;br/&gt;&lt;/paragraph&gt;" }
]</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="docSaveAsButton" value="doc/saveas" onclick="onDocSaveAsButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="docSaveAsResponse"></pre>
			<script type="text/javascript">
				function onDocSaveAsButton() {
					var form = document.forms['docSaveAsForm'];
					var parent_id   = form['parent_id'].value;
					var org_doc_id  = form['org_doc_id'].value;
					var new_name    = form['new_name'].value;
					var force       = form['force'].value;
					var content     = form['content'].value;
					var p_list      = form['p_list'].value;
					clearResponse('#docSaveAsResponse');
					$.ajax({
						'url':		'<?php echo base_url("doc/saveas") ?>',
						'type':		'POST',
						'data':		{ 'parent_id':parent_id, 'org_doc_id':org_doc_id, 'new_name':new_name, 'content':content, 'p_list':p_list, 'force':force },
						'success':	createSuccessHandler('#docSaveAsResponse'),
						'error':	createErrorHandler('#docSaveAsResponse'),
					});
				}
			</script>
		</section>
	</section>

	<section>
		<h2>文書のエクスポート</h2>

		<section>
			<h3>エクスポート可能性の確認</h3>
			<form name="exportAvailableForm" action="none">
				<input type="button" name="exportAvailableButton" value="export/available" onclick="onExportAvailableButton()">
			</form>
			<div class="error"></div>
			<pre class="response" id="exportAvailableResponse"></pre>
			<script type="text/javascript">
				function onExportAvailableButton() {
					var form = document.forms['exportAvailableForm'];
					clearResponse('#exportAvailableResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/available") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#exportAvailableResponse'),
						'error':	createErrorHandler('#exportAvailableResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>エクスポート変換の開始</h3>
			<form name="exporStartForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【出力するファイル形式】</th>
					<td><input type="text" name="file_type" value="imlx" size="10"> (epub3/daisy/imlx)</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="exporStartButton" value="export/start" onclick="onExporStartButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="exporStartResponse"></pre>
			<script type="text/javascript">
				function onExporStartButton() {
					var form = document.forms['exporStartForm'];
					var doc_id    = form['doc_id'].value;
					var file_type = form['file_type'].value;
					clearResponse('#exporStartResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/start") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'file_type':file_type },
						'success':	createSuccessHandler('#exporStartResponse'),
						'error':	createErrorHandler('#exporStartResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>エクスポート変換の状態確認</h3>
			<form name="exporStatusForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="exporStatusButton" value="export/status" onclick="onExporStatusButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="exporStatusResponse"></pre>
			<script type="text/javascript">
				function onExporStatusButton() {
					var form = document.forms['exporStatusForm'];
					var doc_id    = form['doc_id'].value;
					clearResponse('#exporStatusResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/status") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#exporStatusResponse'),
						'error':	createErrorHandler('#exporStatusResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>エクスポート変換のデータ取得</h3>
			<form name="exporFileForm" action="none">
				<table class="input">
				<tr>
					<th>【タスク ID】</th>
					<td><input type="text" name="task_id" size="40"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="exporFileButton" value="export/file" onclick="onExporFileButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="exporFileResponse"></pre>
			<script type="text/javascript">
				function onExporFileButton() {
					var form = document.forms['exporFileForm'];
					var task_id = form['task_id'].value;
					clearResponse('#exporFileResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/file") ?>',
						'type':		'POST',
						'data':		{ 'task_id':task_id },
						'success':	onExporFileSuccess,
						'error':	onExporFileError,
					});
				}
				// サーバーは成功時にはバイナリ、失敗時には JSON を返すため、
				// 特殊なハンドラを設定しています。
				function onExporFileSuccess (obj, textStatus, jqXHR) {
					var responseElem = $('#exporFileResponse');
					var message = '成功しました。サーバーはバイナリを返しました。\n' +
								'再度別ウィンドウで開きますので、内容を確認してください。' ;
					responseElem.text(message);

					// 成功したら別ウィンドウで開きます。
					var form = document.forms['exporFileForm'];
					var task_id = form['task_id'].value;
					var url = '<?php echo base_url("export/file") ?>?task_id=' + encodeURIComponent(task_id);
					window.open(url);
				}
				function onExporFileError(jqXHR, textStatus, errorThrown) {
					var responseElem = $('#exporFileResponse');

					// レスポンスを JSON として解析を試みます。
					var obj;
					try {
						obj = jQuery.parseJSON(jqXHR.responseText);
					}
					catch (e) {
						obj = null;
					}

					// レスポンスが JSON として解析できる場合。
					if (obj) {
						// API としては正常に動作しているので、レスポンスとして表示します。
						var json = JSON.stringify(obj, null, 2);
						responseElem.text(json);
					}
					// 解析できない場合は、PHP スクリプト エラーなどで API が正常動作していないので、
					// <div class="error"> に表示します。
					else {
						responseElem.parent().find('div.error').html(jqXHR.responseText);
					}
				}
			</script>
		</section>

		<section>
			<h3>エクスポート変換のキャンセル</h3>
			<form name="exporCancelForm" action="none">
				<table class="input">
				<tr>
					<th>【タスク ID】</th>
					<td><input type="text" name="task_id" size="40"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="exporCancelButton" value="export/cancel" onclick="onExporCancelButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="exporCancelResponse"></pre>
			<script type="text/javascript">
				function onExporCancelButton() {
					var form = document.forms['exporCancelForm'];
					var task_id = form['task_id'].value;
					clearResponse('#exporCancelResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/cancel") ?>',
						'type':		'POST',
						'data':		{ 'task_id':task_id },
						'success':	createSuccessHandler('#exporCancelResponse'),
						'error':	createErrorHandler('#exporCancelResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>エクスポート変換の個数</h3>
			<form name="exportCountForm" action="none">
				<input type="button" name="exportCountButton" value="export/count" onclick="onExportCountButton()">
			</form>
			<div class="error"></div>
			<pre class="response" id="exportCountResponse"></pre>
			<script type="text/javascript">
				function onExportCountButton() {
					var form = document.forms['exportCountForm'];
					clearResponse('#exportCountResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/count") ?>',
						'type':		'GET',
						'data':		{ },
						'success':	createSuccessHandler('#exportCountResponse'),
						'error':	createErrorHandler('#exportCountResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>エクスポート変換の登録</h3>
			<div>
				この API は音声サーバーから呼び出すためのものですが、<br>
				スクリプト エラーがないかの確認のためにここでテストします。
			</div>
			<form name="exporRegisterForm" action="none">
				<table class="input">
				<tr>
					<th>【タスク ID】</th>
					<td><input type="text" name="task_id" size="40"></td>
				</tr>
				<tr>
					<th>【変換終了日時】</th>
					<td><input type="text" name="completed_at" value="2015-09-18T13:29:03+09:00" size="40"></td>
				</tr>
				<tr>
					<th>【状態】</th>
					<td><input type="text" name="status" value="completed" size="40"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="exporRegisterButton" value="export/register" onclick="onExporRegisterButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="exporRegisterResponse"></pre>
			<script type="text/javascript">
				function onExporRegisterButton() {
					var form = document.forms['exporRegisterForm'];
					var task_id      = form['task_id'].value;
					var completed_at = form['completed_at'].value;
					var status       = form['status'].value;
					clearResponse('#exporRegisterResponse');
					$.ajax({
						'url':		'<?php echo base_url("export/register") ?>',
						'type':		'POST',
						'data':		{ 'task_id':task_id, 'completed_at':completed_at, 'status':status },
						'success':	createSuccessHandler('#exporRegisterResponse'),
						'error':	createErrorHandler('#exporRegisterResponse'),
					});
				}
			</script>
		</section>

	</section>


	<section>
		<h2>文書のインポート</h2>

		<section>
			<h3>インポート変換の開始</h3>
			<form name="importStartForm" action="none">
				<table class="input">
				<tr>
					<th>【ファイル】</th>
					<td><input type="file" name="imlx_file" size="30"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="importStartButton" value="import/start" onclick="onImportStartButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="importStartResponse"></pre>
			<script type="text/javascript">
				function onImportStartButton() {
					var form = document.forms['importStartForm'];
					var formData = new FormData();
					formData.append('imlx_file', form['imlx_file'].files[0] );
					clearResponse('#importStartResponse');
					$.ajax({
						'url':		'<?php echo base_url("import/start") ?>',
						'type':		'POST',
						'data':		formData,
						'success':	createSuccessHandler('#importStartResponse'),
						'error':	createErrorHandler('#importStartResponse'),
						'processData': false,	// ファイル送信に必要
						'contentType': false,	// ファイル送信に必要
					});
				}
			</script>
		</section>

		<section>
			<h3>インポート変換の完了処理</h3>
			<form name="importCompleteForm" action="none">
				<table class="input">
				<tr>
					<th>【タスク ID】</th>
					<td><input type="text" name="task_id" size="40"></td>
				</tr>
				<tr>
					<th>【フォルダ ID】</th>
					<td><input type="text" name="folder_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="importCompleteButton" value="import/complete" onclick="onImportCompleteButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="importCompleteResponse"></pre>
			<script type="text/javascript">
				function onImportCompleteButton() {
					var form = document.forms['importCompleteForm'];
					var task_id = form['task_id'].value;
					var folder_id = form['folder_id'].value;
					clearResponse('#importCompleteResponse');
					$.ajax({
						'url':		'<?php echo base_url("import/complete") ?>',
						'type':		'POST',
						'data':		{ 'task_id':task_id, 'folder_id':folder_id },
						'success':	createSuccessHandler('#importCompleteResponse'),
						'error':	createErrorHandler('#importCompleteResponse'),
					});
				}
			</script>
		</section>

	</section>


	<section>
		<h2>アニメーション操作</h2>

		<section>
			<h3>アニメーションの取得</h3>
			<form name="animationGetForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【アニメーション ID】</th>
					<td><input type="text" name="animation_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="animationGetButton" value="animation/get" onclick="onAnimationGetButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="animationGetResponse"></pre>
			<pre class="response" id="animationGetResponseXml"></pre>
			<script type="text/javascript">
				function onAnimationGetButton() {
					var form = document.forms['animationGetForm'];
					var doc_id       = form['doc_id'].value;
					var animation_id = form['animation_id'].value;
					clearResponse('#animationGetResponse', '#animationGetResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("animation/get") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'animation_id':animation_id },
						'success':	createSuccessHandler('#animationGetResponse', 'content', '#animationGetResponseXml'),
						'error':	createErrorHandler('#animationGetResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>アニメーションの保存</h3>
			<form name="animationSaveForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【アニメーション ID】</th>
					<td><input type="text" name="animation_id" size="4"></td>
				</tr>
				<tr>
					<th>【アニメーション内容】</th>
					<td>
						<textarea name="content" rows="8" cols="70">&lt;ianimations&gt;
  &lt;ianimation x-id="1"&gt;アニメ１&lt;/ianimation&gt;
  &lt;ianimation x-id="2"&gt;アニメ２&lt;/ianimation&gt;
  &lt;ianimation x-id="3"&gt;アニメ３&lt;/ianimation&gt;
&lt;/ianimations&gt;</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="animationSaveButton" value="animation/save" onclick="onAnimationSaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="animationSaveResponse"></pre>
			<script type="text/javascript">
				function onAnimationSaveButton() {
					var form = document.forms['animationSaveForm'];
					var doc_id       = form['doc_id'].value;
					var animation_id = form['animation_id'].value;
					var content      = form['content'].value;
					clearResponse('#animationSaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("animation/save") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'animation_id':animation_id, 'content':content },
						'success':	createSuccessHandler('#animationSaveResponse'),
						'error':	createErrorHandler('#animationSaveResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>アニメーションの削除</h3>
			<form name="animationDeleteForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【アニメーション ID】</th>
					<td><input type="text" name="animation_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="animationDeleteButton" value="animation/delete" onclick="onAnimationDeleteButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="animationDeleteResponse"></pre>
			<script type="text/javascript">
				function onAnimationDeleteButton() {
					var form = document.forms['animationDeleteForm'];
					var doc_id       = form['doc_id'].value;
					var animation_id = form['animation_id'].value;
					clearResponse('#animationDeleteResponse');
					$.ajax({
						'url':		'<?php echo base_url("animation/delete") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'animation_id':animation_id },
						'success':	createSuccessHandler('#animationDeleteResponse'),
						'error':	createErrorHandler('#animationDeleteResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>未使用アニメーションの整理</h3>
			<form name="animationDeleteUnusedForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【使用アニメーション ID の配列】</th>
					<td>
						JSON 形式で指定します。<br>
						<textarea name="used_animation_id_list" rows="2" cols="40">[1,2,3]</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="animationDeleteUnusedButton" value="animation/deleteunused" onclick="onAnimationDeleteUnusedButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="animationDeleteUnusedResponse"></pre>
			<script type="text/javascript">
				function onAnimationDeleteUnusedButton() {
					var form = document.forms['animationDeleteUnusedForm'];
					var doc_id = form['doc_id'].value;
					var used_animation_id_list = form['used_animation_id_list'].value;
					clearResponse('#animationDeleteUnusedResponse');
					$.ajax({
						'url':		'<?php echo base_url("animation/deleteunused") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'used_animation_id_list':used_animation_id_list },
						'success':	createSuccessHandler('#animationDeleteUnusedResponse'),
						'error':	createErrorHandler('#animationDeleteUnusedResponse'),
					});
				}
			</script>
		</section>

	</section>

	<section>
		<h2>話者情報</h2>

		<section>
			<h3>話者名一覧の取得</h3>

			<form name="speakerListForm" action="none">
				<table class="input">
				<tr class="button">
					<td colspan="2">
						<input type="button" name="speakerListButton" value="speaker/list" onclick="onSpeakerListButton()">
					</td>
				</tr>
				</table>
			</form>
			<pre class="response" id="speakerListResponse"></pre>
			<script type="text/javascript">
				function onSpeakerListButton() {
					var form = document.forms['speakerListForm'];
					clearResponse('#speakerListResponse');
					$.ajax({
						'url':		'<?php echo base_url("speaker/list") ?>',
						'type':		'GET',
						'data':		{  },
						'success':	createSuccessHandler('#speakerListResponse'),
						'error':	createErrorHandler('#speakerListResponse'),
					});
				}
			</script>
		</section>
	</section>


	<section>
		<h2>文書辞書</h2>

		<section>
			<h3>システム辞書一覧の取得</h3>

			<form name="dictionarySystemListForm" action="none">
				<table class="input">
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionarySystemListButton" value="dictionary/systemlist" onclick="onDictionarySystemListButton()">
					</td>
				</tr>
				</table>
			</form>
			<pre class="response" id="dictionarySystemListResponse"></pre>
			<script type="text/javascript">
				function onDictionarySystemListButton() {
					var form = document.forms['dictionarySystemListForm'];
					clearResponse('#dictionarySystemListResponse');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/systemlist") ?>',
						'type':		'GET',
						'data':		{  },
						'success':	createSuccessHandler('#dictionarySystemListResponse'),
						'error':	createErrorHandler('#dictionarySystemListResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書辞書の取得</h3>

			<form name="dictionaryGetForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionaryGetButton" value="dictionary/get" onclick="onDictionaryGetButton()">
					</td>
				</tr>
				</table>
			</form>
			<pre class="response" id="dictionaryGetResponse"></pre>
			<pre class="response" id="dictionaryGetResponseXml"></pre>
			<script type="text/javascript">
				function onDictionaryGetButton() {
					var form = document.forms['dictionaryGetForm'];
					var doc_id = form['doc_id'].value;
					clearResponse('#dictionaryGetResponse', '#dictionaryGetResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/get") ?>',
						'type':		'GET',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#dictionaryGetResponse', 'dictionary', '#dictionaryGetResponseXml'),
						'error':	createErrorHandler('#dictionaryGetResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書辞書の保存</h3>
			<form name="dictionarySaveForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【文書辞書】</th>
					<td><textarea name="dictionary" rows="5" cols="40">&lt;userdic&gt;
  &lt;sample&gt;
    サンプル文書辞書
  &lt;/sample&gt;
&lt;/userdic&gt;</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionarySaveButton" value="dictionary/save" onclick="onDictionarySaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="dictionarySaveResponse"></pre>
			<script type="text/javascript">
				function onDictionarySaveButton() {
					var form = document.forms['dictionarySaveForm'];
					var doc_id = form['doc_id'].value;
					var dictionary = form['dictionary'].value;
					clearResponse('#dictionarySaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/save") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'dictionary':dictionary },
						'success':	createSuccessHandler('#dictionarySaveResponse'),
						'error':	createErrorHandler('#dictionarySaveResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書辞書の置換</h3>
			<form name="dictionaryReplaceForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【辞書の名前】</th>
					<td><input type="text" name="dictionary_name" size="40"></td>
				</tr>
				<tr>
					<th>【参照文書 ID】</th>
					<td><input type="text" name="ref_doc_id" size="4"> (空も可)</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionaryReplaceButton" value="dictionary/replace" onclick="onDictionaryReplaceButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="dictionaryReplaceResponse"></pre>
			<script type="text/javascript">
				function onDictionaryReplaceButton() {
					var form = document.forms['dictionaryReplaceForm'];
					var doc_id = form['doc_id'].value;
					var dictionary_name = form['dictionary_name'].value;
					var ref_doc_id = form['ref_doc_id'].value;
					if (ref_doc_id == '' || ref_doc_id == 'null') ref_doc_id = null;
					clearResponse('#dictionaryReplaceResponse');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/replace") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'dictionary_name':dictionary_name, 'ref_doc_id':ref_doc_id },
						'success':	createSuccessHandler('#dictionaryReplaceResponse'),
						'error':	createErrorHandler('#dictionaryReplaceResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書辞書の情報</h3>
			<form name="dictionaryInfoForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionaryInfoButton" value="dictionary/info" onclick="onDictionaryInfoButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="dictionaryInfoResponse"></pre>
			<script type="text/javascript">
				function onDictionaryInfoButton() {
					var form = document.forms['dictionaryInfoForm'];
					var doc_id = form['doc_id'].value;
					clearResponse('#dictionaryInfoResponse');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/info") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#dictionaryInfoResponse'),
						'error':	createErrorHandler('#dictionaryInfoResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書辞書の登録通知</h3>
			<form name="dictionaryRegisterForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionaryRegisterButton" value="dictionary/register" onclick="onDictionaryRegisterButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="dictionaryRegisterResponse"></pre>
			<script type="text/javascript">
				function onDictionaryRegisterButton() {
					var form = document.forms['dictionaryRegisterForm'];
					var doc_id = form['doc_id'].value;
					clearResponse('#dictionaryRegisterResponse');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/register") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#dictionaryRegisterResponse'),
						'error':	createErrorHandler('#dictionaryRegisterResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>文書辞書の登録解除通知</h3>
			<form name="dictionaryUnregisterForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="dictionaryUnregisterButton" value="dictionary/unregister" onclick="onDictionaryUnregisterButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="dictionaryUnregisterResponse"></pre>
			<script type="text/javascript">
				function onDictionaryUnregisterButton() {
					var form = document.forms['dictionaryUnregisterForm'];
					var doc_id = form['doc_id'].value;
					clearResponse('#dictionaryUnregisterResponse');
					$.ajax({
						'url':		'<?php echo base_url("dictionary/unregister") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#dictionaryUnregisterResponse'),
						'error':	createErrorHandler('#dictionaryUnregisterResponse'),
					});
				}
			</script>
		</section>

	</section>


	<section>
		<h2>音声設定</h2>

		<section>
			<h3>システム音声設定名一覧の取得</h3>

			<form name="voiceSettingSystemListForm" action="none">
				<table class="input">
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voiceSettingSystemListButton" value="voicesetting/systemlist" onclick="onVoiceSettingSystemListButton()">
					</td>
				</tr>
				</table>
			</form>
			<pre class="response" id="voiceSettingSystemListResponse"></pre>
			<script type="text/javascript">
				function onVoiceSettingSystemListButton() {
					var form = document.forms['voiceSettingSystemListForm'];
					clearResponse('#voiceSettingSystemListResponse');
					$.ajax({
						'url':		'<?php echo base_url("voicesetting/systemlist") ?>',
						'type':		'GET',
						'data':		{  },
						'success':	createSuccessHandler('#voiceSettingSystemListResponse'),
						'error':	createErrorHandler('#voiceSettingSystemListResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>音声設定の取得</h3>

			<form name="voicesettingGetForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voicesettingGetButton" value="voicesetting/get" onclick="onVoicesettingGetButton()">
					</td>
				</tr>
				</table>
			</form>
			<pre class="response" id="voicesettingGetResponse"></pre>
			<pre class="response" id="voicesettingGetResponseXml"></pre>
			<script type="text/javascript">
				function onVoicesettingGetButton() {
					var form = document.forms['voicesettingGetForm'];
					var doc_id = form['doc_id'].value;
					clearResponse('#voicesettingGetResponse', '#voicesettingGetResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("voicesetting/get") ?>',
						'type':		'GET',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#voicesettingGetResponse', 'voice_setting', '#voicesettingGetResponseXml'),
						'error':	createErrorHandler('#voicesettingGetResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>音声設定の保存</h3>
			<form name="voicesettingSaveForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【音声設定】</th>
					<td><textarea name="voice_setting" rows="5" cols="40">&lt;voice_setting&gt;
  &lt;sample&gt;
    サンプル音声設定
  &lt;/sample&gt;
&lt;/voice_setting&gt;</textarea></td>
				</tr>
				<tr>
					<th>【ユーザー規定】</th>
					<td><input type="text" name="as_default" size="8" value="false"> (true/false)</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voicesettingSaveButton" value="voicesetting/save" onclick="onVoicesettingSaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="voicesettingSaveResponse"></pre>
			<script type="text/javascript">
				function onVoicesettingSaveButton() {
					var form = document.forms['voicesettingSaveForm'];
					var doc_id = form['doc_id'].value;
					var voice_setting = form['voice_setting'].value;
					var as_default = form['as_default'].value;
					clearResponse('#voicesettingSaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("voicesetting/save") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'voice_setting':voice_setting, 'as_default':as_default },
						'success':	createSuccessHandler('#voicesettingSaveResponse'),
						'error':	createErrorHandler('#voicesettingSaveResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>音声設定の置換</h3>
			<form name="voiceSettingReplaceForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【音声設定の名前】</th>
					<td><input type="text" name="voice_setting_name" size="40"></td>
				</tr>
				<tr>
					<th>【参照文書 ID】</th>
					<td><input type="text" name="ref_doc_id" size="4"> (空も可)</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voiceSettingReplaceButton" value="voicesetting/replace" onclick="onVoiceSettingReplaceButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="voiceSettingReplaceResponse"></pre>
			<script type="text/javascript">
				function onVoiceSettingReplaceButton() {
					var form = document.forms['voiceSettingReplaceForm'];
					var doc_id = form['doc_id'].value;
					var voice_setting_name = form['voice_setting_name'].value;
					var ref_doc_id = form['ref_doc_id'].value;
					if (ref_doc_id == '' || ref_doc_id == 'null') ref_doc_id = null;
					clearResponse('#voiceSettingReplaceResponse');
					$.ajax({
						'url':		'<?php echo base_url("voicesetting/replace") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'voice_setting_name':voice_setting_name, 'ref_doc_id':ref_doc_id },
						'success':	createSuccessHandler('#voiceSettingReplaceResponse'),
						'error':	createErrorHandler('#voiceSettingReplaceResponse'),
					});
				}
			</script>
		</section>

	</section>


	<section>
		<h2>変換設定</h2>

		<section>
			<h3>変換設定の取得</h3>

			<form name="convertsettingGetForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="convertsettingGetButton" value="convertsetting/get" onclick="onConvertsettingGetButton()">
					</td>
				</tr>
				</table>
			</form>
			<pre class="response" id="convertsettingGetResponse"></pre>
			<pre class="response" id="convertsettingGetResponseXml"></pre>
			<script type="text/javascript">
				function onConvertsettingGetButton() {
					var form = document.forms['convertsettingGetForm'];
					var doc_id = form['doc_id'].value;
					clearResponse('#convertsettingGetResponse', '#convertsettingGetResponseXml');
					$.ajax({
						'url':		'<?php echo base_url("convertsetting/get") ?>',
						'type':		'GET',
						'data':		{ 'doc_id':doc_id },
						'success':	createSuccessHandler('#convertsettingGetResponse', 'convert_setting', '#convertsettingGetResponseXml'),
						'error':	createErrorHandler('#convertsettingGetResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>変換設定の保存</h3>
			<form name="convertsettingSaveForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【変換設定】</th>
					<td><textarea name="convert_setting" rows="5" cols="40">&lt;convert_setting&gt;
  &lt;sample&gt;
    サンプル変換設定
  &lt;/sample&gt;
&lt;/convert_setting&gt;</textarea></td>
				</tr>
				<tr>
					<th>【ユーザー規定】</th>
					<td><input type="text" name="as_default" size="8" value="false"> (true/false)</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="convertsettingSaveButton" value="convertsetting/save" onclick="onConvertsettingSaveButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="convertsettingSaveResponse"></pre>
			<script type="text/javascript">
				function onConvertsettingSaveButton() {
					var form = document.forms['convertsettingSaveForm'];
					var doc_id = form['doc_id'].value;
					var convert_setting = form['convert_setting'].value;
					var as_default = form['as_default'].value;
					clearResponse('#convertsettingSaveResponse');
					$.ajax({
						'url':		'<?php echo base_url("convertsetting/save") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'convert_setting':convert_setting, 'as_default':as_default },
						'success':	createSuccessHandler('#convertsettingSaveResponse'),
						'error':	createErrorHandler('#convertsettingSaveResponse'),
					});
				}
			</script>
		</section>

	</section>

	<section>
		<h2>音声読み上げ</h2>

		<section>
			<h3>ハイライト分割の取得</h3>
			<form name="voiceHighlightForm" action="none">
				<table class="input">
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4" value="1"></td>
				</tr>
				<tr>
					<th>【段落データの XML】</th>
					<td><textarea name="p" rows="5" cols="40">&lt;paragraph&gt;&lt;c id="C1"&gt;サ&lt;/c&gt;&lt;c id="C2"&gt;ン&lt;/c&gt;&lt;c id="C3"&gt;プ&lt;/c&gt;&lt;c id="C4"&gt;ル&lt;/c&gt;&lt;/paragraph&gt;</textarea></td>
				</tr>
				<tr>
					<th>【開始位置】</th>
					<td><input type="text" name="start_id" size="4" value="C1"></td>
				</tr>
				<tr>
					<th>【話者リスト】</th>
					<td>
						JSON 形式の文字列配列で指定します。<br>
						<textarea name="speaker_list" rows="2" cols="40">[ "山田太郎", "佐藤花子" ]</textarea>
					</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voiceHighlightButton" value="voice/highlight" onclick="onVoiceHighlightButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="voiceHighlightResponse"></pre>
			<script type="text/javascript">
				function onVoiceHighlightButton() {
					var form = document.forms['voiceHighlightForm'];
					var doc_id		= form['doc_id'].value;
					var p			= form['p'].value;
					var start_id	= form['start_id'].value;
					var speaker_list = form['speaker_list'].value;

					clearResponse('#voiceHighlightResponse');
					$.ajax({
						'url':		'<?php echo base_url("voice/highlight") ?>',
						'type':		'POST',
						'data':		{ 'doc_id':doc_id, 'p':p, 'start_id':start_id, 'speaker_list':speaker_list },
						'success':	createSuccessHandler('#voiceHighlightResponse'),
						'error':	createErrorHandler('#voiceHighlightResponse'),
					});
				}
			</script>
		</section>

		<section>
			<h3>読み上げ音声の取得</h3>

			<form name="voiceDataForm" action="none">
				<table class="input">
				<tr>
					<th>【音声 ID】</th>
					<td><input type="text" name="audio_id" size="50"></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voiceDataButton" value="voice/data" onclick="onVoiceDataButton()">
					</td>
				</tr>
				</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="voiceDataResponse"></pre>
			<pre class="response" id="voiceDataResponseAudio"><audio controls id="voiceDataAudio"></pre>
			<script type="text/javascript">

				function onVoiceDataButton() {
					var form = document.forms['voiceDataForm'];
					var audio_id = form['audio_id'].value;
					clearAudioResponse('#voiceDataResponse', '#voiceDataAudio');

					$.ajax({
						'url':		'<?php echo base_url("voice/data") ?>',
						'type':		'GET',
						'data':		{ 'audio_id':audio_id },
						'success':	createAudioSuccessHandler('#voiceDataResponse', '#voiceDataAudio'),
						'error':	createAudioErrorHandler('#voiceDataResponse', '#voiceDataAudio'),

						'beforeSend': createAudioBeforeSend(),
						'dataType': 'binary',
						'converters' : createAudioConverters(),
					});
				}

				function clearAudioResponse(reponseElem, audioElem) {
					$(reponseElem).text('通信中...');
					$(audioElem).css('display', 'none');
				}

				function createAudioSuccessHandler(reponseElem, audioElem) {
					return function (obj, textStatus, jqXHR) {
						reponseElem = $(reponseElem);
						audioElem = $(audioElem);
						reponseElem.text('(音声データを取得しました)');
						var src = 'data:audio/mp3;base64,' + window.btoa(obj);
						//window.alert(src);
						//audioElem.attr('src', src);
						audioElem.get(0).src = src;
						audioElem.css('display', '');
					}
				}

				function createAudioErrorHandler(reponseElem, audioElem) {
					return function (jqXHR, textStatus, errorThrown) {
						reponseElem = $(reponseElem);
						audioElem = $(audioElem);
						var obj = $.parseJSON(jqXHR.responseText);
						var text = JSON.stringify(obj, null, 2);
						reponseElem.text(text);
						//audioElem.attr('src', '');
					}
				}

				function createAudioBeforeSend() {
					return function(xhr) {
						xhr.overrideMimeType('text/plain; charset=x-user-defined');
					}
				}

				function createAudioConverters() {
					return {"* binary": audioBinaryConverter };
				}

				function audioBinaryConverter(response) {
					var bytes = [];
					var adjustedResponse = '';
					for(var i=0; i < response.length; i++) {
						bytes[i] = response.charCodeAt(i) & 0xff;
						adjustedResponse += String.fromCharCode(bytes[i]);
					}
					return adjustedResponse;
				}
		</script>
		</section>

		<section>
			<h3>テスト再生音声の取得</h3>
			<form name="voiceTestDataForm" action="none">
				<table class="input">
				<tr>
					<th>【読み上げ対象文字列】</th>
					<td><input type="text" name="text" size="40" value="おはよう"></td>
				</tr>
				<tr>
					<th>【文書 ID】</th>
					<td><input type="text" name="doc_id" size="4"></td>
				</tr>
				<tr>
					<th>【辞書 XML】</th>
					<td><textarea name="dictionary" rows="5" cols="40"></textarea></td>
				</tr>
				<tr>
					<th>【音声設定 XML】</th>
					<td><textarea name="voice_setting" rows="5" cols="40"></textarea></td>
				</tr>
				<tr>
					<th>【アクセント制御】</th>
					<td><input type="text" name="accent_control" size="10" value=""> (true/false/空)</td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voiceTestDataButton" value="voice/testdata" onclick="onVoiceTestDataButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="voiceTestDataResponse"></pre>
			<pre class="response" id="voiceTestDataResponseAudio"><audio controls id="voiceTestDataAudio"></pre>
			<script type="text/javascript">
				function onVoiceTestDataButton() {
					var form = document.forms['voiceTestDataForm'];
					var text			= form['text'].value;
					var doc_id			= form['doc_id'].value;
					var dictionary		= form['dictionary'].value;
					var voice_setting	= form['voice_setting'].value;
					var accent_control	= form['accent_control'].value;

					clearAudioResponse('#voiceTestDataResponse', '#voiceTestDataAudio');

					$.ajax({
						'url':		'<?php echo base_url("voice/testdata") ?>',
						'type':		'POST',
						'data':		{ 'text':text, 'doc_id':doc_id, 'dictionary':dictionary, 'voice_setting':voice_setting, 'accent_control':accent_control },
						'success':	createAudioSuccessHandler('#voiceTestDataResponse', '#voiceTestDataAudio'),
						'error':	createAudioErrorHandler('#voiceTestDataResponse', '#voiceTestDataAudio'),

						'beforeSend': createAudioBeforeSend(),
						'dataType': 'binary',
						'converters' : createAudioConverters(),
					});
				}
			</script>
		</section>

		<section>
			<h3>読み上げテキストの取得</h3>
			<form name="voiceReadTextForm" action="none">
				<table class="input">
				<tr>
					<th>【読み上げ対象文字列】</th>
					<td><textarea name="text" rows="2" cols="40">おはよう
こんにちは</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="voiceReadTextButton" value="voice/readtext" onclick="onVoiceReadTextButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="voiceReadTextResponse"></pre>
			<script type="text/javascript">
				function onVoiceReadTextButton() {
					var form = document.forms['voiceReadTextForm'];
					var text = form['text'].value;
					clearResponse('#voiceReadTextResponse');
					$.ajax({
						'url':		'<?php echo base_url("voice/readtext") ?>',
						'type':		'POST',
						'data':		{ 'text':text },
						'success':	createSuccessHandler('#voiceReadTextResponse'),
						'error':	createErrorHandler('#voiceReadTextResponse'),
					});
				}
			</script>
		</section>
	</section>

	<section>
		<h2>文字コード処理</h2>

		<section>
			<h3>SJIS 変換の確認</h3>
			<form name="encodingSjisCheckForm" action="none">
				<table class="input">
				<tr>
					<th>【象文字列】</th>
					<td><textarea name="word" rows="2" cols="40">おはよう
こんにちは</textarea></td>
				</tr>
				<tr class="button">
					<td colspan="2">
						<input type="button" name="encodingSjisCheckButton" value="encoding/sjischeck" onclick="onSjisCheckTextButton()">
					</td>
				</tr>
			</table>
			</form>
			<div class="error"></div>
			<pre class="response" id="encodingSjisCheckResponse"></pre>
			<script type="text/javascript">
				function onSjisCheckTextButton() {
					var form = document.forms['encodingSjisCheckForm'];
					var word = form['word'].value;
					clearResponse('#encodingSjisCheckResponse');
					$.ajax({
						'url':		'<?php echo base_url("encoding/sjischeck") ?>',
						'type':		'POST',
						'data':		{ 'word':word },
						'success':	createSuccessHandler('#encodingSjisCheckResponse'),
						'error':	createErrorHandler('#encodingSjisCheckResponse'),
					});
				}
			</script>
		</section>
	</section>

	<sectoion>
		<h2>[API 一覧]</h2>
		<div id="toc">
		</div>
		<div align="right">
			<a href="#">[トップ]</a>
		</div>
		<hr>
	</section>

	<script type="text/javascript" src="<?php echo base_url('js/jquery.js') ?>"></script>
	<script type="text/javascript" src="<?php echo base_url('js/sha256.js') ?>"></script>

	<script type="text/javascript">

		window.onload = function() {
			makeToc();
		}

		/**
		 * [API 一覧] のコンテンツを動的に作成します。
		 */
		function makeToc() {

			var id = 0;
			var toc_ul2 = $('<ul/>');

			// <section> 要素をすべて列挙します。
			$('section').each( function(index2) {
				var section2 = $(this);
				var h2 = section2.children('h2');
				if (h2.length == 0) return;

				id++;
				h2.attr('id', id);

				var a = $('<a/>').attr('href', '#' + id).text(h2.text());
				var toc_ul3 = $('<ul/>');
				var li = $('<li/>').append(a).append(toc_ul3);
				toc_ul2.append(li);

				section2.children('section').each( function(index3) {
					var section3 = $(this);
					var h3 = section3.children('h3');
					if (h3.length == 0) return;

					var api = section3.find('input[type="button"]').attr('value');

					id++;
					h3.attr('id', id);

					var a = $('<a/>').attr('href', '#' + id).text( h3.text() + ' [' + api + ']' );
					var li = $('<li/>').append(a);
					toc_ul3.append(li);
				});
			});

			$('#toc').append(toc_ul2);
		}

	</script>
</body>
</html>