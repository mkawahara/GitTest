/**
 * ノード作成メソッドを提供するクラスの定義です。
 */

function NodeCreator() {};

NodeCreator.createNode = function(char, inputMode, option, entity) {
    // br は段落途中改行として作成
    if (entity == '&br;') {
        return LineBreak.createNew();
    }

    // オプションが設定されているとき
    if (option) {
        // 読みがあるとき、読み要素を作成します(単位生成用）
        if (option.read) return NodeCreator.createReadNode(char, option.read, option.accent, option.sup);

        // 数式フォントが設定されていたら強制的にMathモードとします
        if (option.font) return CornerElement.createNew(char, CIO_XML_TYPE.math, option, entity);

        // 数式の種類が設定されていたらレイアウト要素を作成します
        if (option.type) return NodeCreator.createLayoutNode(option.type, char, inputMode, option);
    }

    // オプション指定がなければ、テキスト文字か CornerElement
    return NodeCreator.createCharacterNode(char, inputMode, option, entity);
}

/**
 * 読みノードを生成します。
 * @base    ベース文字
 * @read    よみ
 * @accent  アクセント制御
 * @sup     右上添え字
 */
NodeCreator.createReadNode = function(base, read, accent, sup) {

    // カーソル位置の親の属性にあわせた入力モードを取得します
    var caretId = ViewManager.getEditorPane().getCaret().pos;
    var caretNode = $(DocumentManager.getCurrentSection()).find('#' + caretId)[0];
    var parentNode = caretNode.parentNode;
    DataClass.bindDataClassMethods(parentNode);
    var xmlType = parentNode.nt;

    // 読み要素を生成します
    var readNode = ReadingElement.createNew(xmlType);
    readNode.setAttribute('yomi', read);
    if (accent != null) readNode.setAttribute('accent_control', accent);

    // CornerElementで中身を作成します
    var option = {normalonly: true};
    var cornerNode = CornerElement.createNew(base, CIO_XML_TYPE.math, option);

    // 右上添え字が必要であれば設定します
    if (sup) {
        var supGroup = cornerNode.children[1];  // 右上添え字のグループ
        var supNode = CornerElement.createNew(sup, CIO_XML_TYPE.math, option);
        supGroup.insertBefore(supNode, supGroup.lastChild);
    }

    // 読みのグループ要素の中に中身を追加します
    var groupNode = readNode.firstChild;
    groupNode.insertBefore(cornerNode, groupNode.lastChild);

    return readNode;
};

/**
 * 文字ノードを作成します。
 * 数式モードの場合、最小単位であるコーナーエレメントを作成します。
 * @param char
 */
NodeCreator.createCharacterNode = function(char, inputMode, option, entity) {
	// テキストモードなら文字、それ以外は CornerElement
	if (inputMode === CIO_XML_TYPE.text) {
		return CharacterElement.createNew(char, entity);
	}
	// 化学式記号だった場合
	else if (ChemCharElement.isChemCharEntity(char)) {
		return ChemCharElement.createNew(char);	// ここでの char にはエンティティが入っていること。
	}
	// テキストでも化学式記号でもなかった場合
	else {
		return CornerElement.createNew(char, inputMode, option, entity);
	};
};

/**
 * 画像ノードを作成します。入力モードは関係ないため、引数にありません。
 * @param data
 */
NodeCreator.createImageNode = function(data) {
	return ImageElement.createNew(data);
};

/**
 * 数式などで使用されるレイアウトノードを作成します。
 * @param type		レイアウト要素の種類
 * @param base		ベース文字、あるいはベース文字列を表す識別子
 * @param inputMode	テキスト・数式・化学式モードを表す値
 */
NodeCreator.createLayoutNode = function(type, base, inputMode, option) {
	if (type == null) return null;

	if (type === LAYOUT_NODE_TYPE.FRAC) {
		return FractionElement.createNew(inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.ROOT) {
		return RootElement.createNew(inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.INTEGRAL) {
		return IntegralElement.createNew(base, inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.UNDEROVER) {
		return TopBottomElement.createNew(base, inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.UNDER) {
	    var noDefaultPos = option.noDefaultPos ? option.noDefaultPos : false;
		return BottomElement.createNew(base, inputMode, noDefaultPos);
	};
	if (type === LAYOUT_NODE_TYPE.UNDERLINE) {
		return UnderlineElement.createNew(base, inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.OVER) {
		return TopElement.createNew(base, inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.RUBY) {
	};
	if (type === LAYOUT_NODE_TYPE.DECOBOX) {
	    var borderType = (option.borderType) ? option.borderType : BORDER_TYPE.normal;
	    var decoNode = DecoBoxElement.createNew(inputMode, borderType);
	    return decoNode;
	};
	if (type === LAYOUT_NODE_TYPE.TABLE) {
	};
	if (type === LAYOUT_NODE_TYPE.MATRIX) {
		return MatrixElement.createNew(base, inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.OPEN_BRACKETS) {
		return OpenBracketElement.createNew(base, inputMode);
	};
	if (type === LAYOUT_NODE_TYPE.CLOSE_BRACKETS) {
		return CloseBracketElement.createNew(base, inputMode);
	};

};
