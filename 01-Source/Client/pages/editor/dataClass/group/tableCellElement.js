/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： tableCellElement.js                                */
/* -                                                                         */
/* -    概      要     ： データクラス群: tableCell クラス                   */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, DC_groupElement.js, utility.js         */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月13日                         */



// ------------- コンストラクタ
function TableCellElement() {
	// 何もしません。
};



// ------------- GroupBaseClass(グループ要素)クラス継承
TableCellElement.prototype = new GroupBaseClass(); // 親クラス: GroupElement



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
TableCellElement.createNew = function() {
	// emptyFlag : true  = 改行要素すら持たない段落要素を作成します。
	//           : false = <br>要素を１つだけもつ段落要素を作成します。
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('ctd');  // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID(); // 文書内で一意なidを与えます。

	// TableCellElement は、必ず子要素として LineBreak を1個だけ持ちます。
//	$(domObj).append( LineBreak.createNew() );
	domObj.appendChild( LineBreak.createNew() );

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
TableCellElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, TableCellElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// ---- このノードが属しているテーブル要素を取得します。
TableCellElement.getParentTable = function() {
	return this.parentNode;
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
TableCellElement.prototype.toHtml = function(caretId) {

	// 子要素の toHtml 結果をまとめて取得します。
	var xml = GroupBaseClass.toHtmlCommon(this, caretId, false);

	// テーブルのテキストアラインを設定する style 文字列を作成します
	var styleStr = 'style="text-align: ' + this.align + ';"';

	// <td> タグを追加します
	xml = '<td id="' + this.id + '" class="doc_cell" ' + styleStr + '>'+ xml + '</td>';
	return xml;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////
/*
// ------------- nodeType を取得します。
Object.defineProperty(TableCellElement.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});
*/
/**
 * isTextGroup プロパティ：読取りのみ
 */
Object.defineProperty(TableCellElement.prototype, 'isTextGroup', {
	enumerable: true,
	configurable: true,
	get: function(){ return true; },
});

/**
* align プロパティ：読み書き可
*/
Object.defineProperty(TableCellElement.prototype, 'align', {
	enumerable: true,
	configurable: true,
	get: function(){
		var align = this.getAttribute('align');
		return align ? align : PARAGRAPH_ALIGN.left;
	},
	set: function(value){
		if (value === '') {
			this.removeAttribute('align');
		} else {
			this.setAttribute('align', value);
		}
	},
});


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 座標による移動が必要なため、データノードでは移動はキャンセルされます。
 */
TableCellElement.prototype.shiftUpFromChild = function() {
	return null;
};

/**
 * 座標による移動が必要なため、データノードでは移動はキャンセルされます。
 */
TableCellElement.prototype.shiftDownFromChild = function() {
	return null;
};

/**
 * セル内の先頭に移動します。
 */
TableCellElement.prototype.shiftHomeFromChild = function() {
	return this.firstChild.id;
};

/**
 * セル内の終端へ移動します。
 */
TableCellElement.prototype.shiftEndFromChild = function() {
	return this.lastChild.id;
};


TableCellElement.prototype.getNt = function() {
	return CIO_XML_TYPE.text;
};

