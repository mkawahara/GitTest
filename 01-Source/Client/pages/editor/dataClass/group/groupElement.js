/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_groupElement.js                                 */
/* -                                                                         */
/* -    概      要     ： GroupElement(グループ要素)クラス                   */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js                             */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月13日                         */

// *************************************************************
// **            GroupElement(グループ要素)クラス             **
// **                  ※スーパークラスです                   **
// *************************************************************

/* このクラスで使用するDOM属性一覧

	// ノードのデフォルトプロパティ値を設定します。
	'id'       : [str]   idです。doopメソッド内で、idマネージャから取得した「文書内で一意のid」を割りあてられます。
*/

// ------------- コンストラクタ
function GroupElement() {
	// 何もしません
};



// ------------- GroupBaseClass クラス継承
GroupElement.prototype = Object.create(GroupBaseClass.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
// GroupElement では、createNew の際に 子要素として LineBreak を1個だけ作成します。
GroupElement.createNew = function(xmlType) {
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                 .math     数式モード
	//                                 .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('g'); // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewNodeID(); // 文書内で一意なidを与えます。

	// GroupElement は、必ず子要素として LineBreak を1個だけ持ちます。
	$(domObj).append( LineBreak.createNew() );

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
GroupElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, GroupElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};


// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
// ※常にmrowタグです。
GroupElement.prototype.toHtml = function(caretId) {
	// caretId [str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// 大元の 開始htmlタグと終了htmlタグを決定します。
	var htmlTag = 'mrow';
	GroupElement.doop(this);
	if (this.nt == CIO_XML_TYPE.text) htmlTag = 'span';
	var htmlStartTag = '<'  + htmlTag + ' id="' + this.id + '">'; // 開始タグ
	var htmlEndTag   = '</' + htmlTag + '>';                      // 終了タグ

	// 子DOMから取得した内容を文字列へ反映し、html文字列を作成します。
	htmlStr = htmlStartTag + DataClass.getChildrenHtml(this.children, caretId) + htmlEndTag;

	return htmlStr;
};
