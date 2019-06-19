<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>ChattyInftyOnline データベース閲覧</title>

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
	</script>
</head>
<body>

	<h1>ChattyInftyOnline データベース閲覧</h1>

	<section>

		<form name="queryForm" method="POST" action=".">
		<table class="input">
			<tr>
				<th>【クエリ】</th>
				<td>
					<textarea name="query" rows="5" COLS="50"><?php echo htmlspecialchars($query) ?></textarea>
				</td>
			</tr>
			<tr>
				<th>【パスワード】</th>
				<td>
					<input type="password" name="password" size="30" value="<?php echo htmlspecialchars($password) ?>">
					<input type="button" name="queryButton" value="クエリ実行" onclick="onQueryButton()">
				</td>
			</tr>
		</table>
		</form>

		<pre class="response"><?php print_r($result) ?></pre>
		<script type="text/javascript">
			function onQueryButton() {
				var form = document.forms['queryForm'];
				form.submit()
			}
		</script>

	</section>

</body>
</html>