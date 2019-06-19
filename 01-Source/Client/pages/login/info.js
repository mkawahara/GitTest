/*************************************
 * お知らせ表示処理を定義しています。
 *************************************/

/**
 * サーバにお知らせ取得リクエストを送信します
 */
function requestInfomation() {
    // リクエストを送信します
    Communicator.request('getNews', {}, onReceiveInfomation, g_onFailure);
}

/**
 * 受信データをテーブルに登録します
 */
function onReceiveInfomation(data) {
	for (var i = 0; i < data.result.length; i++) {
		var newTr = document.createElement('tr');
		var newTitleCell = document.createElement('td');
		var newDateCell = document.createElement('td');

		newTitleCell.innerHTML = createTitleHtml(data.result[i].infid, data.result[i].title);
		newDateCell.innerHTML = toDateString(data.result[i].pubdate);

		info_table.appendChild(newTr);
		newTr.appendChild(newTitleCell);
		newTr.appendChild(newDateCell);
	}
}

/**
 * ID とタイトルからリンク付き html 文字列を生成します。
 * @param id
 * @param title
 * @returns {String}
 */
function createTitleHtml(id, title) {
	var baseURL = 'https://infty3.nittento.or.jp/AMM/';
	var url = baseURL + 'info?infid=' + id;

	var html = '<a href="' + url + '">' + title + '</a>';

	return html;
}

/**
 * 14桁の整数値 pubdate を日付文字列に変換します
 * @param pubdate
 */
function toDateString(pubdate) {
	pubdate = pubdate + '';

	var year = pubdate.substr(0, 4);
	var month = pubdate.substr(4, 2);
	var day = pubdate.substr(6, 2);
	var hour = pubdate.substr(8, 2);
	var minite = pubdate.substr(10, 2);
	var second = pubdate.substr(12, 2);

	return year + '/' + month + '/' + day + ' ' + hour + ':' + minite;
}

