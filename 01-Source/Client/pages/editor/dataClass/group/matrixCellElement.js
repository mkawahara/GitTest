/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： matrixCellElement.js                               */
/* -                                                                         */
/* -    概      要     ： データクラス群: MatrixCell クラス                  */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, DC_groupElement.js, utility.js         */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月13日                         */



// ------------- コンストラクタ
function MatrixCellElement() {
	// 何もしません。
};



// ------------- GroupBaseClass(グループ要素)クラス継承
MatrixCellElement.prototype = new GroupBaseClass(); // 親クラス: GroupElement



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
MatrixCellElement.createNew = function(xmlType) {
	// emptyFlag : true  = 改行要素すら持たない段落要素を作成します。
	//           : false = <br>要素を１つだけもつ段落要素を作成します。
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('cmatcell');  // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID(); // 文書内で一意なidを与えます。

	// MatrixCellElement は、必ず子要素として LineBreak を1個だけ持ちます。
	$(domObj).append( LineBreak.createNew() );

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
MatrixCellElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, MatrixCellElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
MatrixCellElement.prototype.toHtml = function(caretId) {

	// 子要素の toHtml 結果をまとめて取得します。
	var xml = GroupBaseClass.toHtmlCommon(this, caretId, true);

	// <mtd> タグを追加します
	xml = '<mtd id="' + this.id + '">'+ xml + '</mtd>';

	return xml;
};



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
* align プロパティ：読み書き可
*/
Object.defineProperty(MatrixCellElement.prototype, 'align', {
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
MatrixCellElement.prototype.shiftUpFromChild = function() {
	return null;
};

/**
 * 座標による移動が必要なため、データノードでは移動はキャンセルされます。
 */
MatrixCellElement.prototype.shiftDownFromChild = function() {
	return null;
};

/**
 * セル内の先頭に移動します。
 */
MatrixCellElement.prototype.shiftHomeFromChild = function() {
	return this.firstChild.id;
};

/**
 * セル内の終端に移動します。
 */
MatrixCellElement.prototype.shiftEndFromChild = function() {
	return this.lastChild.id;
};



/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////
// ---- モード変更制限
MatrixCellElement.prototype.convertibleToText = false; // 子孫を含めてのテキストモードへの変換は可能か？
MatrixCellElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
MatrixCellElement.prototype.propageteNt       = true;  // nt 変更を子孫に伝搬させるか
