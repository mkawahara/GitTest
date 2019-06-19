/* Project: [PJ-0136] ChattyInfty */
/* Module : DVM_C_Display         */
/* ========================================================================= */
/* ==                         ChattyInftyOnline                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： DC_section.js                                      */
/* -                                                                         */
/* -    概      要     ： Section(セクション)クラス                          */
/* -                                                                         */
/* -    依      存     ： DC_enum.js                                         */
/* -                                                                         */
/* -    備      考     ： 他ファイルにてクラス継承を行わないと機能しません   */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 松枝 敦夫 / 2015年04月28日                         */


// ------------- コンストラクタ
function Section() {
};

// HTMLUnknownElement の継承
Section.prototype = Object.create(HTMLUnknownElement.prototype);


/////////////////////////////////////////////////////////////////////////
// インスタンスの作成・準備
/////////////////////////////////////////////////////////////////////////

/**
 * 新しいセクションを作成します。
 * @param depth			インデックス深度
 * @param title			セクションタイトル（オプション）
 */
Section.createNew = function(emptyFlag, depth, title) {
	var newNode = document.createElement('section');

	// インデックス深度を設定します
	newNode.setAttribute('indexDepth', depth);

	// セクションタイトルを設定します
	if (title !== (void 0)) {
		newNode.title = title;
	} else {
		newNode.title = '';
	}

	// emptyFlag が空でないなら、空段落を追加します。
	if (!emptyFlag) {
		// 空の段落を作成・追加します
		var newParaGraph = Paragraph.createNew(false);
		newNode.appendChild(newParaGraph);
	}
	return newNode;
};


/**
 * ノードオブジェクトにプロトタイプを設定します。
 */
Section.doop = function(nodeObject) {
	DataClass.insertPrototype(nodeObject, Section);
};

/**
 * 段落内でのノード位置についての情報を返します。
 */
Section.prototype.nodeLocation = function(pos) {
	// pos [str] : 対象ノードの ID
	// 返値 result
	var result = { // 返値デフォルト
		'top'           : false, // 段落先頭判定: true / false
		'middle'        : false, // 段落先頭から何文字めか・・・未使用
		'last'          : false, // 段落末尾判定: true / false
		'previous_para' : null,  // 一つ前の段落ノード,
		'current_para'  : null,  // 対象の段落ノード,
		'next_para'     : null,  // 次の段落ノード
	};
	var dataNode = $(this).find('#' + pos)[0];         // 対象ノードを取得します。

	// ---- 段落直属のノードであるか判断します。
	var pareNode = dataNode.parentNode;
	var paragraphFlag = pareNode != null ? pareNode.nodeName == 'PARAGRAPH' : false;
	if (!paragraphFlag) return result;                // 段落直属のノードではないため、終了します。

	// ---- 返値のデフォルトを更新します。
	result.previous_para = pareNode.previousSibling; // 対象の　段落ノード
	result.current_para  = pareNode;                 // 対象の　段落ノード
	result.next_para     = pareNode.nextSibling;     // 一つ後の段落ノード

	// ---- 段落の先頭か判断します。
	if (dataNode.previousSibling == null) result.top  = true;  // 段落先頭です。

	// ---- 段落の末尾か判断します。
	if (dataNode.nextSibling     == null) result.last = true;  // 段落末尾です。

	return result;
};



/////////////////////////////////////////////////////////////////////////
// ロード時に使用される関数
/////////////////////////////////////////////////////////////////////////


// ID をカンマ区切り文字列で受け取り、paragraphIdList に数値配列として保存します
Section.prototype.parseCsv = function(csv) {
	var idslist = csv.split(',');
	this.paragraphIdList = [];	// [配列(int)] 段落IDリスト
	// paragraphIdListは、文書データ読み込み時にのみ使用され、
	// セクションの全てのデータの読み込み完了後、nullにされる。

	this.paraNodeList = [];	// 段落ノードを一時的に受け取る配列

	// 段落IDの配列と段落ノード受け取り用配列を作成します
	for (var i = 0; i < idslist.length; i++) {
		if (idslist[i] != '') {
			this.paragraphIdList.push(idslist[i]);
			this.paraNodeList.push(null);
		};
	};

};

/**
 * セクションに段落を追加します。
 * このセクションへの登録対象外段落の場合、何もせずに false を返します。
 * @param paraId	登録を試行する段落の ID
 * @param paraNode	登録を試行する段落ノード
 */
Section.prototype.appendParagraph = function(paraId, paraNode, renderer) {
	// 一致する段落 ID を検索します
	var index = this.paragraphIdList.indexOf(paraId);
	if (index < 0) {
		return false;
	}

	// 一致場所に段落ノードを設定します
	this.paraNodeList[index] = paraNode;
	this.paragraphIdList[index] = false;

	// children に移動可能な段落を移動させます。
	var moveList = this.getMoveNodeList();

	// renderer に更新を登録します
	for (var i = 0; i < moveList.length; i++) {
        this.appendChild(moveList[i]);

        if (renderer) {
			// レンダラーに更新予約を行います。
			// ただし、レンダラーの表示しているセクションが、登録段落と一致しなければ、
			// 以降、レンダラーを使用しないために null にします。
			if (!renderer.setInsertedParagraph(moveList[i], null)) {
				renderer = null;
			}
		}
	}

	// renderer に表示を更新させます
	if (renderer) renderer.update();

	// 全ての受信が終わったか否かを判別し、完了時はIDとノードの配列を空にします
	if (Section.isAllFalse(this.paraNodeList)) {
		this.paragraphIdList = [];
		this.paraNodeList = [];
	}

	return true;
};

/**
 * メンバから、children に移動すべき段落ノードのリストを取得します。
 * 同時に、取得された段落ノードの入っていた要素は false にします。
 * @returns {Array}
 */
Section.prototype.getMoveNodeList = function() {
	// children に移動する段落ノードを一時的に保持する作業配列
	var moveNodes = [];

	for (var idx = 0; idx < this.paraNodeList.length; idx++) {
		// 未受信段落が出てきたら、検索を終了します
		if (this.paraNodeList[idx] === null) break;
		// children に移動していないノードを moveNodes に移動させます
		if (this.paraNodeList[idx] !== false) {
			moveNodes.push(this.paraNodeList[idx]);
			this.paraNodeList[idx] = false;
		}
	};

	return moveNodes;
};

/**
 * セクションの全てのデータの受信が完了しているか取得します。
 */
Section.prototype.isAllReceived = function() {
	// 新規作成されたセクションでは、paragraphIdList が定義されません
	return ((this.paragraphIdList === void 0) || (this.paragraphIdList.length === 0));
};

/**
 * 指定配列の全要素が false か判別します。
 * @param list
 */
Section.isAllFalse = function(list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] !== false) return false;
	};

	return true;
};


/////////////////////////////////////////////////////////////////////
// 範囲選択用メソッド
/////////////////////////////////////////////////////////////////////

// ---- node[] 指定された２つのノードを基準として、選択されるべきノードのリストを取得します。
Section.prototype.getSelectedNodeList = function(start, end) {

	// ---- 最初の段落を処理します。
	// ・start が グループの先頭要素ではないなら、start から、start の属するグループの最後の要素までを子要素単位で
	// 　リストへ加えます。
	// ・start が グループの先頭要素なら、start の属するグループ要素をリストへ加えます。
	var startGroup    = DataClass.adjustNodeLevel(this, start);       // start の属する、Section 直下のグループ要素
	var startBaseNode = DataClass.adjustNodeLevel(startGroup, start); // start の属する、startGroup 直下の要素
	var nodeList = startBaseNode.previousSibling ? startGroup.getSelectedNodeList(start, null) : [startGroup];

	// 最初の段落の要素数を取得します
	var prevCount = (nodeList[0].nodeName == 'PARAGRAPH') ? 0 : nodeList.length;

	// ---- 2番目から最後の一つ手前までのグループを、グループ要素単位でリストへ加えます。
	var endGroup = DataClass.adjustNodeLevel(this, end);
	for (var otherGroup = startGroup.nextSibling; otherGroup != endGroup; otherGroup = otherGroup.nextSibling) {
		nodeList.push(otherGroup);
	}

	// ---- 最後の段落を、段落の子要素単位でリストへ加えます。
	// ・end が グループの先頭子要素なら、ここでは何もしません。
	var endBaseNode = DataClass.adjustNodeLevel(endGroup, end); // end の属する、endGroup 直下の要素
	if (endBaseNode.previousSibling) nodeList = nodeList.concat( endGroup.getSelectedNodeList(null, end) );

	// 最初の段落の要素数を表すノードを先頭に挿入します
	var countNode = document.createElement('PREVPARACOUNT');
	countNode.setAttribute('value', prevCount);
	nodeList.unshift(countNode);

	return nodeList;
};


/////////////////////////////////////////////////////////////////////////
// アクセサ
/////////////////////////////////////////////////////////////////////////


//------------- セクションのインデックス深度を取得
Object.defineProperty(Section.prototype, 'depth', {
	  enumerable: true,
	  configurable: true,
	  get: function(){ return Number(this.getAttribute('indexdepth')); },
	  set: function(value){ this.setAttribute('indexdepth', value); }
});

// ★セクションの HTML 文字列を取得します。
//Section.prototype.getHtml = function() { // 7/21 検索置換のために改造　湯本
Section.prototype.getHtml = function(caretId) {
	var result = '';
//	var caretId = ViewManager.getEditorPane().getCaret().getCaretPos();
//	var caretId = ViewManager.getEditorPane().getCaret().pos; // 7/21 削除 湯本

	var children = $(this).children();
//	var xml = DataClass.getChildrenHtml(children, CIO_XML_TYPE.text, caretId); 5/1 湯本 xmlTypeにあたるもの削除
	var xml = DataClass.getChildrenHtml(children, caretId);

	// ★出力文字列のコピー。重たい処理のため、実働時には削除すること
	try { if (IS_CONVERTER_DEVELOP_MODE) {	// コンバータページでのみ動作するように修正
		if (xml.length !== 0) console.log(xml);
		console.log(this.outerHTML);
	}} catch(e) {};


	return xml;
};

/**
 * セクションに対する段落の追加・削除は、HTMLElement の children に対する操作機能を使用します。
 */

/**
 * セクションに属する段落IDを収集し、サーバ保存用xml文字列を作成します。
 */
Section.prototype.toXml = function() {
	var title = this.title;
	var depth = this.depth;

	var xml = '<section title="' + title + '" indexdepth="' + depth + '"><paragraph_id_list>';
	var ids = '';

	var paragraphs = $(this).children();
	for (var i = 0; i < paragraphs.length; i++) {
		ids += (paragraphs[i].id + ',');
	};

	ids = ids.substr(0, ids.length - 1);

	xml += (ids + '</paragraph_id_list></section>');

	return xml;
};

/**
 * セクションに属する全段落データをxml文字列の配列で取得します。
 */
Section.prototype.getParagraphXmlList = function() {
	var list = [];

	var paragraphs = $(this).children();
	for (var i = 0; i < paragraphs.length; i++) {
		var pxml = paragraphs[i].outerHTML;

		// id 文字列を除去します
		var re = / id="C\d+"/g;
		var result = pxml.replace(re, '');
		// 段落のmathidcountを除去します
		var re = / mathidcount="\d+"/g;
		result = result.replace(re, '');

		// <br> タグを xml 仕様に修正します
		re = /<br[^<>]*>/g;
		result = result.replace(re, function(match) {
			return (match.substr(0, match.length - 1) + '/>');
		});

		list.push( { id:  paragraphs[i].id, content: result, });
	};

	return list;
};



// ------ 指定位置に新しい段落データを挿入します。
Section.prototype.insertParagraph = function(newpara, markerNode) {
	// newpara [Paragraphオブジェクト] : 挿入する段落ノードのインスタンス。
	// markerNode                [DOM] : 挿入したい位置にある段落ノードのインスタンス
	if (markerNode == null) {                       // ---- もし、セクション末尾の段落なら
		this.appendChild(newpara);                          // セクションの末尾へ新しい段落を追加します。
	} else {                                        // ---- もし、セクション末尾の段落でないなら
		this.insertBefore(newpara, markerNode);             // markerNode の後ろへ新しい段落を追加します。
	}
};



// ------ 指定した段落を削除します。
Section.prototype.removeParagraph  = function(targetNode) {
	// targetNode [Paragraphオブジェクト] : 削除する段落ノードのインスタンス。
	this.removeChild(targetNode);        // appendPara をセクションから削除します。
};



// ---- セクションのインデックス深度を取得します。
Section.prototype.getDepth = function() {
	return this.depth;
};



Section.prototype.getParagraphCount = function() {
};

Section.prototype.getParagraph = function() {
};

Section.prototype.divideSection = function() {
};

Section.prototype.combineSection = function() {
};
