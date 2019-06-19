/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_paragraph.js                                    */
/* -                                                                         */
/* -    概      要     ： データクラス群: Paragraph(段落)クラス              */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, DC_groupElement.js, utility.js         */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月19日                         */

// *************************************************************
// ** GroupElement(グループ要素)クラス                        **
// **   │                                                    **
// **   ├ Paragraph(段落)クラス                              **
// **   ├ ・・・                                             **
// *************************************************************



// ------------- コンストラクタ
function Paragraph() {
	// 何もしません。
};



// ------------- GroupBaseClass クラス継承
Paragraph.prototype = new GroupBaseClass(); // 親クラス: GroupBaseClass
// ※Paragraph クラスは、GroupBaseClass を継承するため、HTML(Unknown)Element の継承は不要。



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
Paragraph.createNew = function(emptyFlag) {
	// emptyFlag : true  = 改行要素すら持たない段落要素を作成します。
	//           : false = <br>要素を１つだけもつ段落要素を作成します。
	// 返値 dom [obj]    : DOM

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj = document.createElement('paragraph');  // xmlタグ名にはクラス名を全小文字で使用します。
	domObj.id  = DataClass.getNewParagraphID(); // 文書内で一意なidを与えます。
	if (!emptyFlag) $(domObj).append( LineBreak.createNew() ); // emptyFlag が false なら、<br>要素を１つ持たせます。
	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
Paragraph.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, Paragraph); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
Paragraph.prototype.toHtml = function(caretId, noChildFlag) {

	// 子要素のtoHtml結果をまとめて取得します。
	var xml = '';
	if (!noChildFlag) xml = DataClass.getChildrenHtml(this.children, caretId);

	// 連続している中間タグを整理します。
	// (ここの処理のため、uline は cmath や mmath、span 等の外に配置しなくてはなりません。)
	xml = Paragraph.removeOverlapMidHtml(xml);

	// 数式番号中間タグを処理します
	xml = Paragraph.replaceEqNumber(xml);

	// math 系中間タグを置換します。
	xml = Paragraph.replaceMath(xml, this);

	// slc (無音領域) を置換します
	xml = Paragraph.replaceSlc(xml);

	// uline (下線) を置換
	xml = Paragraph.replaceUline(xml, this);

	// 改ページタグを作成します
	var pbreakStr = Paragraph.createPageBreak(this.pageBreak);

	// ページ番号タグを作成します
	if (this.pageNumber) xml = '<sub class="number_attr">ページ番号</sub>' + xml;

	// <p> タグを追加します
	{
		// ページ番号属性無しの場合

		// ---- align 書式指定
		var align = 'left';
		if (this.align == PARAGRAPH_ALIGN.right)  align = 'right';
		if (this.align == PARAGRAPH_ALIGN.center) align = 'center';

		// 出力 html を作成します
		xml = '<div id="' + this.id + '" align="' + align + '" class="paragraph ' + this.fontSize + '">' + xml + pbreakStr + '</div>';
	}

	//console.log(xml);

	return xml;
};


/////////////////////////////////////////////////////////////////////////////////
// toHtml で使用される中間 html 処理用メソッド
/////////////////////////////////////////////////////////////////////////////////

Paragraph.removeOverlapMidHtml = function(xml) {
	var re = /<\/eqnumber><eqnumber>/g;                  // eqnumber (数式番号) を整理
	xml = xml.replace(re, '');
	re = /<\/uline><uline>|<\/slc><slc>|<\/mslc><mslc>/g;           // uline (下線), slc (無音領域) を整理
	xml = xml.replace(re, '');
	re = /<\/cmath><cmath>|<\/mmath><mmath>/g;                      // math 系タグを整理
	xml = xml.replace(re, '');

	return xml;
};

Paragraph.replaceEqNumber = function(xml) {
	var re = /<eqnumber>/g;
	var newXml = xml.replace(re, '<div style="display:inline; float: right;"><sub class="number_attr">数式番号</sub>');
	if (newXml != xml) {
	    // 数式番号がある場合のみ置き換えます
	    xml = newXml;
	    re = /<\/eqnumber>/g;
	    xml = xml.replace(re, '');
	    xml += '</div><div style="clear: both;"></div>';
	}

	return xml;
};

Paragraph.replaceMath = function(xml, paraNode) {
	// 置換時に動的にIDを埋め込むための関数
	var createNewMathStr = function(para) {
		var str = '<span id="m' + para.id + '-' + para.mathIdCount +
			'"><math display="inline" class="mathcolor">';
		return str;
	};
	var createNewChemStr = function(para) {
		return '<span id="m' + para.id + '-' + para.mathIdCount +
			'"><math display="inline" class="chemcolor">';
	};

	// ---- mmath 置換
	var re = /<mmath>/g;
	xml = xml.replace(re, function() { return createNewMathStr(paraNode);});
	re = /<\/mmath>/g;
	xml = xml.replace(re, '</math></span>');

	// ---- cmath 置換
	var re = /<cmath>/g;
	xml = xml.replace(re, function() { return createNewChemStr(paraNode);});
	re = /<\/cmath>/g;
	xml = xml.replace(re, '</math></span>');

	return xml;
};

Paragraph.replaceSlc = function(xml) {
	var re = /<slc>/g;
	xml = xml.replace(re, '<span class="silence">');
	re = /<\/slc>/g;
	xml = xml.replace(re, '</span>');

	var re = /<mslc>/g;
	xml = xml.replace(re, '<mstyle class="silence">');
	re = /<\/mslc>/g;
	xml = xml.replace(re, '</mstyle>');

	return xml;
};

Paragraph.replaceUline = function(xml, node) {
	var ulineStartTagRe = /<uline>/g;    // 下線開始タグ検索用正規表現
	var ulineEndTagRere = /<\/uline>/g;  // 下線終了タグ検索用正規表現
	DataClass.bindDataClassMethods(node); // doop
	if (node.nt == CIO_XML_TYPE.text) {   // ---- テキストレベルなら
		xml = xml.replace(ulineStartTagRe, '<span class="underline">');
		xml = xml.replace(ulineEndTagRere, '</span>');
	} else {                             // ---- 数式レベルなら
		xml = xml.replace(ulineStartTagRe, '<munder');
		xml = xml.replace(ulineEndTagRere, '</munder>');
	}

	return xml;
};

Paragraph.createPageBreak = function(flag) {
	if (!flag) return '';

	var str = '<table style="width: 100%;"><tr><td style="width: 45%;"><hr class="pagedelimitor"><td style="text-align: center; white-space: nowrap;">改ページ<td style="width: 45%;"><hr class="pagedelimitor"></tr></table>';
	return str;
}


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


//------------- 指定要素以降を別段落として分割します。
Paragraph.prototype.divide = function(nodeId, brNode) {
	// nodeId [str]               : 分割位置のノードID
	// brNode [DOM]               : 分割位置に挿入する新しい改行要素。
	// 返値 node [DOM ノード配列] : 分割位置以降の全てのデータノードの配列 (元々の改行要素が含まれます)。
	var node = [];                                       // 返値
	var childrenLength = this.children.length;         // 元段落の子要素数
	var divideFlag = true;                               // 段落分割位置判定用フラグ

	for (i = this.children.length - 1; i >= 0; i--) {  // ---- 元段落の子要素数分ループを行います。
		var targetNode = this.children[i];                     // 対象ノードへの参照を取得します。
		if (divideFlag) {                                        // ---- 分割対象ノードなら、
			node.unshift(targetNode);                                    // 分割後ノード用の配列へ加えます。
			this.removeChild(targetNode);                                // 分割元段落からノードを取り除きます。
		}
		if (targetNode.id == nodeId) divideFlag = false;         // 分割対象ノードであるかどうかを判断します。
	}
	this.appendChild(brNode);                            // 元段落の最後に改行要素を追加します。
	return node;
}

//------------- 指定段落のデータを、現在の段落の最後に追加します。
//現在の段落の末尾にある改行要素は削除され、削除された改行要素インスタンスへの参照が返されます。
//※ここでは、paraNode の中身は空にされません。
Paragraph.prototype.combine = function(paraNode) {
	// paraNode [PARAGRAPHオブジェクト] : 追加したい段落データ
	// 返値 deletedBr [DOM]             : 削除された改行要素インスタンスへの参照
	var deletedBr = this.removeChild( this.children[this.children.length - 1] ); // 末尾の改行要素を削除します。
	var paraNodeChildren = paraNode.children;     // 追加したい段落データの子要素配列への参照を取得します。
	var childrenLength   = paraNodeChildren.length; // 追加したい段落データの子要素配列の長さを取得します。
	for (var i = 0; i < childrenLength; i++) {      // ---- 追加したい段落データの子要素配列分ループを行います。
		this.appendChild( paraNodeChildren[0] );            // 親段落へ、追加したい段落データの子要素を順次追加します。
		// appendChild によって移動されたノードは、元の親元からは自動的に消えるので、常に paraNodeChildren[0] で良い。
	}
	return deletedBr;
}

//------------- 段落のchildrenを指定されたノード配列で強制的に上書きします。
//引数となるノード配列の末尾には改行記号が必要である。
//※このメソッドが実行される時には、段落ノードの children は空でなければなりません。
//それ以外の場合は不適切なタイミングでの呼び出しと考えられます。
Paragraph.prototype.forceOverWrite = function(node) {
	// node [ DOM node 配列 ] : 貼り付けるべき子ノードの配列
	var nodeCount = node.length;
	for (var i = 0; i < node.length; i++) {
		this.appendChild( node[i] );
	}
};

//------------- 段落の children を、末尾の改行要素まで含めて強制的に空にします。
Paragraph.prototype.forceEmpty = function() {
	// 子要素数分ループし、各子要素を removeChild します。
	for (var i = this.children.length - 1; i >= 0; i--) {
		this.removeChild( this.children[i] );
	}
}



/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

// ------------- nodeType を取得します。
Object.defineProperty(Paragraph.prototype, 'nt', {
	enumerable: true,
	configurable: true,
	get: function(){ return CIO_XML_TYPE.text; },
});

/**
 * isTextGroup プロパティ：読取りのみ
 */
Object.defineProperty(Paragraph.prototype, 'isTextGroup', {
	enumerable: true,
	configurable: true,
	get: function(){ return true; },
});

/**
 * fontSize プロパティ：読み書き可
 */
Object.defineProperty(Paragraph.prototype, 'fontSize', {
	enumerable: true,
	configurable: true,
	get: function(){
		var fontSize = this.getAttribute('fontSize');
		return fontSize ? fontSize : FONT_SIZE.medium;
	},
	set: function(value){
		if (value === '') {
			this.removeAttribute('fontSize');
		} else {
			this.setAttribute('fontSize', value);
		}
	},
});

/**
 * align プロパティ：読み書き可
 */
Object.defineProperty(Paragraph.prototype, 'align', {
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

/**
 * mathIdCount プロパティ：readonly
 */
Object.defineProperty(Paragraph.prototype, 'mathIdCount', {
	enumerable: true,
	configurable: true,
	get: function(){
		var count = Number(this.getAttribute('mathIdCount')) + 1;
		this.setAttribute('mathIdCount', count);
		return count;
	},
});

/**
 * ページ番号属性を扱うプロパティ
 */
Object.defineProperty(Paragraph.prototype, 'pageNumber', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('pagenumber') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('pagenumber', true);
		} else {
			this.removeAttribute('pagenumber');
		}
	},
});

/**
 * 改ページ属性を扱うプロパティ
 */
Object.defineProperty(Paragraph.prototype, 'pageBreak', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('pagebreak') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('pagebreak', true);
		} else {
			this.removeAttribute('pagebreak');
		}
	},
});



//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
//子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftLeftFromChild = function() {
	return null;
};

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftRightFromChild = function() {
	return null;
};

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftUpFromChild = function() {
	return null;
};

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftDownFromChild = function() {
	return null;
};

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftByEnterFromChild = function() {
	return null;
};

/**
* 親レイアウトのIDを返します。
*/
Paragraph.prototype.shiftByEscFromChild = function() {
	return null;
};

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftHomeFromChild = function() {
//	return this.firstChild.id;
	return null;
};

/**
* 親レイアウトの同名の関数を呼び出し、その戻り値を返します。
*/
Paragraph.prototype.shiftEndFromChild = function() {
//	return this.lastChild.id;
	return null;
};
