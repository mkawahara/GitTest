/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                           == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_cornerElement.js                                */
/* -                                                                         */
/* -    概      要     ： CornerElement(四隅の添え字要素)クラス              */
/* -                                                                         */
/* -    依      存     ： DC_enum.js, utility.js                             */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月06日                         */

// *************************************************************
// **          CornerElement(四隅の添え字要素)クラス          **
// *************************************************************

/* このクラスで使用するDOM属性一覧
	'id'           : [str]  idです。doopメソッド内で、idマネージャから取得した「文書内で一意のid」を割りあてられます。
	'bs'           : [str]  ベース文字列 2015/07/02 テキストノードへ変更
	'ital'         : [bool] イタリック設定
	'bold'         : [bool] ボールド設定
	'fontFamily'   : [enum:未実装]
	'uline'        : [bool] 下線設定
*/

// ------------- コンストラクタ
function CornerElement() {
	// 何もしません
}



// ------------- HTMLUnknownElementクラス継承
// HTMLUnknownElement.prototypeを本オブジェクトのプロトタイプに設定します。
CornerElement.prototype = Object.create(LayoutBaseClass.prototype);
//CornerElement.prototype = Object.create(HTMLUnknownElement.prototype);



// [static] ------------- クラス用の xmlノード DOM を用意し、文書内で一意なidを与えます。
// CornerElement では、createNew の際に GroupElementを4個だけ作成します。
CornerElement.createNew = function(strBase, xmlType, option, entity) {
	// strBase [str]     : ベース文字列。必須です。
	// xmlType [enum]    : CIO_XML_TYPE.text     テキストモード
	//                                 .math     数式モード
	//                                 .chemical 化学式モード
	// 返値 dom [obj]    : DOM

	// テキストモード指定の場合は、強制的に数式モードへ変更します。
	xmlType = xmlType == CIO_XML_TYPE.text ? CIO_XML_TYPE.math : xmlType;

	// 新しいDOMを作成します。 xmlタグ名は存在しないもの(HtmlUnknownElement)で構いません。
	var domObj    = document.createElement('cn');   // xmlタグ名は全て小文字です。
	domObj.id = DataClass.getNewNodeID();    // 文書内で一意なidを与えます。
	var textNode = null;
	if ((entity === void 0) || (entity === null)) {
		textNode = document.createTextNode(strBase);
	} else {
		textNode = document.createTextNode(entity);
	}
	domObj.appendChild(textNode);

	// CornerElement は、必ず子要素として GroupElement を4個だけ持ちます。
	for (var i = 0; i <= 3; i++) {
		var childGroup = GroupElement.createNew(xmlType);
//		$(domObj).append(childGroup);
		domObj.appendChild(childGroup);
	}

	// nodeType 属性を登録します。
	if (xmlType) domObj.setAttribute('nt', xmlType);

	if (option) {
	    // font属性を登録します
	    if (option.font) domObj.setAttribute('font', option.font);

	    // normalonly属性を登録します
	    if (option.normalonly) domObj.setAttribute('normalonly', option.normalonly);
	}

	return domObj;
};



// [static] ------------- xmlノードオブジェクトにクラスを貼り付けます。
CornerElement.doop = function(domObj) {
	// 引数 domObj [I/O, obj]: createNewで作成されたDOMオブジェクトです。
	// 返値なし
	DataClass.insertPrototype(domObj, CornerElement); // utility.js 依存部分です。第二引数は、クラス名のみです。
};



// ------------- デフォルトのカーソル位置をノードIDとして取得します。
CornerElement.prototype.getDefaultCursorPos = function() {
	return null;
}



/*
<mi mathvariant="normal">b</mi>
<mn mathvariant="bold">9</mn>
<mi mathvariant="bold">b</mi>
<mn mathvariant="italic">8</mn>
<mn mathvariant="bold-italic">7</mn>
<mi mathvariant="fraktur">A</mi>
<mi mathvariant="double-struck">A</mi>
<mi mathvariant="-tex-caligraphic">A</mi>
<mi mathvariant="script">A</mi>
*/

/* 数字: mn, アルファベット1文字: mi, その他: mo
	アルファベット1文字: mi は、isItalic == true でもmathvariantは不要、もともとイタリック
	　isItalic == false ならmathvariantはnormal
*/

// ------------- オブジェクトのデータをブラウザ表示用 html 文字列に変換します。
// <mmultiscripts>タグ, <mi>タグ, 他
//CornerElement.prototype.toHtml = function(type, caretId) { 5/1 湯本 type 削除
CornerElement.prototype.toHtml = function(caretId) {
	// type  [I, str]  : テキスト = CIO_XML_TYPE.text
	//                   数式     = CIO_XML_TYPE.math
	//                   化学式   = CIO_XML_TYPE.chemical
	// caretId [I, str]: キャレットが今いるDOMの持つID
	// 返値 htmlStr [str] : html文字列

	// 親要素が Paragraph かどうか判断し、math タグの必要性を判断します。
	var mathStartTag = '';
	var mathEndTag   = '';
	var parentNode = this.parentNode;
	DataClass.bindDataClassMethods(parentNode);
	if (parentNode.isTextGroup) {
		var tags = this.createMathTag();
		mathStartTag = tags.start;
		mathEndTag = tags.end;
	}

	// ・大元の mathML タグを決定します：添え字があれば mmultiscripts で開始、添え字がなければmmultiscriptsは不要。
	// 　※孫要素4つ全てにおいて、lb以外無い場合は、mmultiscripts はいらず、miに直接 id がつくようにします。
	// 　　したがって、cn の子要素である group が、さらに子要素(cnの孫要素)をいくつ持っているかをチェックします。
	// ・要素分ループするので、上記の判断と同時に子要素の toHtml も実行します。
	// ・また、子要素配列中にキャレットID を、
	var textNode = this.childNodes[0];

	var children    = this.children;   // 子要素配列への参照
	var childrenCnt = children.length; // 子要素数
	var childrenStr = '';
	var caretIdFlag = false; // cn の孫要素 にキャレットIDで指定されたものが存在しているか。
	var mmultiFlag  = false; // この cn の孫要素全 にキャレットIDで指定されたものが存在するか。

	for (var i = 0; i < childrenCnt; i++) {
		// 子要素からとる情報の数は決まっています。
		// 1個め: 右下文字
		// 2個め; 右上文字
		// ※2個めの後に、<mprescripts/>が必要です。
		// 3個め: 左下文字
		// 4個め; 左上文字

		var child = children[i];
		// 添え字の長さが 1 以上 (改行以外を含む) あるいは、カーソルが 1 文字目に存在する場合、
		// 子要素表示文字列を作成します。
		if ((child.children.length > 1) || (child.children[0].id === caretId)) {
			DataClass.bindDataClassMethods(child);
			childrenStr += child.toHtml(caretId);
			mmultiFlag = true;
		}
		// それ以外の場合、<none/>とします。
		else {
			childrenStr += '<none/>';
		}
		childrenStr += i == 1 ? '<mprescripts/>' : ''; // 右側添え字が終了したら、<mprescripts/>を追加します。
	}
	// caretId を考慮に入れたうえで、添え字要素のレンダリングが必要かどうか判断する。
	mmultiFlag = (mmultiFlag || caretIdFlag); // 添え字が必要かどうかの最終判断を mmultiFlag へ統合します。
	if (!mmultiFlag) childrenStr = '';        // 添え字が必要ないなら、せっかく作った子要素html文字列も破棄します。

	// ベース文字列を表現するためのタグを生成します：mi, mn, mo, mrow
	// タグテーブルにベース文字列 が登録されていれば、テーブル内で指定されているタグを使用します。
    var baseStr = this.firstChild.textContent;
	baseTag = CornerElement.tagTable[baseStr];
	// タグテーブルに登録されていないものには mi タグを適用します。
	baseTag = (baseTag === undefined) ? 'mi' : baseTag;
	// normalonly 属性が設定されている場合は立体表示のため mo タグにします
	if (this.getAttribute('normalonly') != null) baseTag = 'mo';

	// mで始まるタグで囲まれていたら MathML 文字列と判定して mrow にします
	if (baseStr.indexOf('<m') == 0 && baseStr.lastIndexOf('>') == baseStr.length-1) baseTag = 'mrow';

	// ベース文字列用のタグに合わせて、文字修飾情報を生成します。
	var attrStr = this.makeMathvariant(baseTag);

	// コンテンツの内容に合わせて、mathML 用タグを決定します。
	// ------ 修飾用属性タグ
	var mathvarStr = '';                                              // 修飾用属性タグ
	if (attrStr != '') mathvarStr = ' mathvariant="' + attrStr + '"'; // --- 修飾用属性タグ設定
	// ------ 添え字、及びベース文字列用タグ
	var mmultStartStr = '';                                // 添え字用      開始タグ 空文字列
	var mmultEndStr   = '';                                // 添え字用      終了タグ 空文字列
	var mstyleStartStr = '';                               // 括弧が大きくならないための開始タグ
	var mstyleEndStr = '';                                 // 括弧が大きくならないための終了タグ
	if ((baseStr === '(') || (baseStr === '[') || (baseStr === '{') ||
			(baseStr === ')') || (baseStr === ']') || (baseStr === '}')) {
		mstyleStartStr = '<mstyle>';
		mstyleEndStr = '<mo></mo></mstyle>';
	};
	var spaceClass = '';
	if (baseStr === '&nbsp;') {
		baseStr = '&#x2423;';
		spaceClass = 'mathspace ';
	}
	if (baseStr === '　') {
		baseStr = '&#x25A1;';
		spaceClass = 'mathspace ';
	}
	var mxStartStr    = '<'  + baseTag + mathvarStr;       // ベース文字列用開始タグ (閉じ'>'未付属)
	var mxEndStr      = '</' + baseTag + '>';              // ベース文字列用終了タグ 完成

	// speaker 属性の処理
	var spkStr = DataClass.getSpeakerClassStr(this);

	if (mmultiFlag) {                                      // ---- 添え字が存在する場合
		// mmultiscripts タグで開始します。
//		mmultStartStr  = '<mmultiscripts id="' + this.id + '">';   // 添え字用      開始タグ 完成
		mmultStartStr  = '<mmultiscripts id="' + this.id + '" class="' + spkStr + '" style="border: solid 0px white;">';   // 添え字用      開始タグ 完成
		mmultEndStr    = '</mmultiscripts>';                       // 添え字用      終了タグ 完成
		mxStartStr    += '>';                                      // ベース文字列用開始タグ 完成
	} else {                                               // ---- 添え字が存在しない場合
		// mi, mo, mn タグに id を付けます。
//		mxStartStr     = '<' + baseTag + ' id="' + this.id + '">'; // ベース文字列用開始タグ 完成
		mxStartStr     = '<' + baseTag +' id="' + this.id + '" ' + mathvarStr + ' class="' + spkStr + spaceClass + '">'; // ベース文字列用開始タグ 完成
	}

	// 出力用html =  <math> + <mmultiscripts> + <mi mn mo> + ベース文字列 + </mi /mn /mo>
	var htmlStr = mathStartTag + mmultStartStr + mstyleStartStr + mxStartStr + baseStr + mxEndStr + mstyleEndStr;
	//          + 子要素html + </mmultiscripts> + </math>
	htmlStr += childrenStr + mmultEndStr + mathEndTag;

	// silence 属性の処理
	var silenceStr = DataClass.getSilenceClassStr(this);
	htmlStr = silenceStr.start + htmlStr + silenceStr.end;

	return htmlStr;
};

/**
 * MathML の mathvariant 属性に設定すべき文字列を生成します
 */
CornerElement.prototype.makeMathvariant = function(baseTag) {
    // font属性が設定されている場合は全てに優先します
    var font = this.getAttribute('font');
    if (font) {
        switch(font) {
        case MATH_FONT.frak:    return 'fraktur';
        case MATH_FONT.cal:     return '-tex-caligraphic';
        case MATH_FONT.scr:     return 'script';
        case MATH_FONT.Bbb:     return 'double-struck';
        }
    }

    // イタリック、太字属性から作成します
    // ※ mi のみ斜体/立体を切り替えられます
    //    mn / mo は必ず立体のため、mathvariant で italic のみ指定することはありません
    var isItalic    = (this.getAttribute('ut') == null); // イタリック ※デフォルトをイタリックとするので ut 属性で判定
    var isBold      = (this.getAttribute('bold' ) != null); // 太字

    if (isBold) { // 太字属性なら
        // mi タグのときのみ斜体が有効です
        return (baseTag == 'mi' && isItalic ) ? 'bold-italic' : 'bold';
    }
    else {
        // mi タグはデフォルトが斜体なので、立体指定では normal を指定します
        if (baseTag == 'mi' && !isItalic) return 'normal';

        // それ以外は何も指定しません
        return '';
    }
}


/////////////////////////////////////////////////////////////////////
// プロパティ定義
/////////////////////////////////////////////////////////////////////

/**
 * italic プロパティ：読み書き可
 * デフォルトがイタリックのため、ut 属性を使用します
 * 明示的に ut 属性が設定されていない限りイタリックと判定します
 */
Object.defineProperty(CornerElement.prototype, 'ital', {
    enumerable: true,
    configurable: true,
    get: function(){ return this.getAttribute('ut') == null; },
    set: function(value){
        if (value == true) {
            this.removeAttribute('ut');
        } else {
            this.setAttribute('ut', true);
       }
    },
});

/**
 * ut プロパティ：読み書き可
 */
Object.defineProperty(CornerElement.prototype, 'ut', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('ut') !== null; },
	set: function(value){
		if (value == true) {
			this.setAttribute('ut', true);
		} else {
			this.removeAttribute('ut');
		}
	},
});

/**
 * font プロパティ：読み書き可
 */
Object.defineProperty(CornerElement.prototype, 'font', {
	enumerable: true,
	configurable: true,
	get: function(){ return this.getAttribute('font'); },
	set: function(value){ this.setAttribute('font', true); },
});


/////////////////////////////////////////////////////////////////////
// 検索に使用する比較メソッド
/////////////////////////////////////////////////////////////////////

/**
 * 検索対象データを文書上の文字データと比較します。
 * 文字要素では、文字の値のみを比較し、文字属性は比較しません。
 * @param node
 * @param checkNext	true の場合、弟要素も比較します。false の場合、兄要素も比較します。
 */
CornerElement.prototype.compareWith = function(node, checkNext) {
	// ノード名とテキストを比較します
	if (node.nodeName !== 'CN') return null;
	if (this.textContent !== node.textContent) return null;

	// 属性を比較します
	if (this.getAttribute('nt') !== node.getAttribute('nt')) return null;
	if (this.getAttribute('font') !== node.getAttribute('font')) return null;

	// 添え字の比較を行います
	for (var i = 0; i < this.children.length; i++) {
		var mychild = this.children[i].children[0];
		var tgchild = node.children[i].children[0];
		DataClass.bindDataClassMethods(mychild);
		if (mychild.compareWith(tgchild, true) === null) return null;	// 子要素は後方検索で十分です
	};

	// 兄弟要素の比較を行います
	if (checkNext) {
		// 弟要素の有無を比較します
		if (this.nextSibling === null) return node;
		if (node.nextSibling === null) return null;

		// 弟要素の比較を行います
		DataClass.bindDataClassMethods(this.nextSibling);
		return this.nextSibling.compareWith(node.nextSibling, checkNext);
	} else {
		// 兄要素の有無を比較します
		if (this.previousSibling === null) return node;
		if (node.previousSibling === null) return null;

		// 兄要素の比較を行います
		DataClass.bindDataClassMethods(this.previousSibling);
		return this.previousSibling.compareWith(node.previousSibling, checkNext);
	}
};


/////////////////////////////////////////////////////////////////////
// キー操作によるカーソル移動を扱うメソッド
/////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
// 子要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 添え字要素間での左移動時の次のカーソル位置を返します。
 */
CornerElement.prototype.shiftLeftFromChild = function(childId) {
	// 右側の添え字にカーソルがある場合、対応する左側の添え字から次のカーソル位置を取得します。
	if (this.children[0].id === childId) {
		var nextNode = this.children[2];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	if (this.children[1].id === childId) {
		var nextNode = this.children[3];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};

	// 右側の添え字にカーソルがない＝左側の添え字にカーソルがある場合、
	// 自身のIDを次の移動先として返します。
	return this.id;
};

/**
 * 添え字要素間での右移動時の次のカーソル位置を返します。
 */
CornerElement.prototype.shiftRightFromChild = function(childId) {
	// 左側の添え字にカーソルがある場合、対応する右側の添え字から次のカーソル位置を取得します。
	if (this.children[2].id === childId) {
		var nextNode = this.children[0];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	if (this.children[3].id === childId) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};

	// 左側の添え字にカーソルがない＝右側の添え字にカーソルがある場合、
	// 自身の shiftRight を呼び出し、その戻り値を返します。
	return this.shiftRight();
};

/**
 * 添え字要素間での上移動時の次のカーソル位置を返します。
 */
CornerElement.prototype.shiftUpFromChild = function(childId) {
	// 下側の添え字にカーソルがある場合、対応する上側の添え字から次のカーソル位置を取得します。
	if (this.children[0].id === childId) {
		var nextNode = this.children[1];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	if (this.children[2].id === childId) {
		var nextNode = this.children[3];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};


	// 下側の添え字にカーソルがない＝上側の添え字にカーソルがある場合、
	// 自身の shiftUp を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftUpFromChild();
};

/**
 * 添え字要素間での下移動時の次のカーソル位置を返します。
 */
CornerElement.prototype.shiftDownFromChild = function(childId) {
	// 上側の添え字にカーソルがある場合、対応する下側の添え字から次のカーソル位置を取得します。
	if (this.children[1].id === childId) {
		var nextNode = this.children[0];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};
	if (this.children[3].id === childId) {
		var nextNode = this.children[2];
		DataClass.bindDataClassMethods(nextNode);
		return nextNode.getLastPos();
	};


	// 下側の添え字にカーソルがない＝上側の添え字にカーソルがある場合、
	// 自身の shiftUp を呼び出し、その戻り値を返します。
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftDownFromChild();
};

/**
 * 添え字要素間でのEnterによる移動時の次のカーソル位置を返します。
 */
CornerElement.prototype.shiftByEnterFromChild = function(childId) {
	return this.shiftRight();
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
CornerElement.prototype.shiftHomeFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftHomeFromChild();
};

/**
 * 親グループの同名メソッドを呼び出し、その戻り値を返します。
 */
CornerElement.prototype.shiftEndFromChild = function() {
	var parent = this.parentElement;
	DataClass.bindDataClassMethods(parent);
	return parent.shiftEndFromChild();
};


/////////////////////////////////////////////////////////////////////
// 弟要素から呼び出されるメソッド
/////////////////////////////////////////////////////////////////////

/**
 * 右上添え字の要素を取得します。
 */
CornerElement.prototype.shiftUpFromNext = function() {
	var rightTop = this.children[1];
	DataClass.bindDataClassMethods(rightTop);
	return rightTop.getLastPos();
};

/**
 * 右下添え字の要素を取得します。
 */
CornerElement.prototype.shiftDownFromNext = function() {
	var rightBottom = this.children[0];
	DataClass.bindDataClassMethods(rightBottom);
	return rightBottom.getLastPos();
};

/////////////////////////////////////////////////////////////////////
// モード変換メソッド
/////////////////////////////////////////////////////////////////////

// ---- モード変更制限
CornerElement.prototype.convertibleToText = true;  // 子孫を含めてのテキストモードへの変換は可能か？
CornerElement.prototype.convertibleToMath = true;  // 子孫を含めての数式・化学式モードへの変換は可能か？
CornerElement.prototype.hasTextMode       = false; // 自身がテキストモードを持つことは可能か？
CornerElement.prototype.hasMathMode       = true;  // 自身が数式・化学式モードを持つことは可能か？

CornerElement.prototype.AltNodeForText = function(result, inputMode) {
	// ---- 数式 → テキスト： C へ変換します。
	//      孫要素は切り捨てます。
	// 直上の g が テキストモードでなければ、変換は行われません。
	var parentGNode = this.parentNode;
	DataClass.bindDataClassMethods(parentGNode); // doop
	if (parentGNode.nt == CIO_XML_TYPE.text) { // ---- 親がテキストモードなら

		// コーナーエレメントの g 0-3 が、改行のみなら変換。

		// ステータスも反映すべし

		// ---- C へ変換します。
		var strBase = this.firstChild.textContent;
		result.convertedNodeList = [ CharacterElement.createNew(strBase) ];
		result.convertedNtList   = [ inputMode ];
	} else {                                   // ---- 親がテキストモードでないなら
		result.convertedNtList   = [ this.nt ];        // モード変更なし
	}
	return result;
};

