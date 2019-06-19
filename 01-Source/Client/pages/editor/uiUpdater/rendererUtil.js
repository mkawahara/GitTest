/////////////////////////////////////////////////////////////////////
//
// RendererクラスのStaticメソッドを分離
//
/////////////////////////////////////////////////////////////////////
function RendererUtil() {};


/*-----------------------------------------------------------------*/
/* 段落の分割・結合で使用するメソッド */
/*-----------------------------------------------------------------*/

/**
 * 段落が空行（改行のみ）であるかどうかを判定します。
 */
RendererUtil.isEmptyParagraph = function(para) {
    // 1ノードのみであることを確認します
    if (para.children.length != 1) return false;

    // 改行ノードのみであることを確認します
    return para.firstChild.nodeName == 'BR';
};


/**
 * 全ての子要素を削除します。
 */
RendererUtil.removeAllChildren = function(node) {
    while(node.hasChildNodes()) { node.removeChild(node.firstChild); }
}

/**
 * 子要素を全て移動します。
 * @param toNode    移動先
 * @param fromNode  移動元
 */
RendererUtil.moveAllChildren = function(toNode, fromNode) {
    var count = fromNode.children.length;
    for (var i=0; i<count; i++) {
        // 改ページが存在することを考慮して、後ろから順に移動します
        toNode.insertBefore(fromNode.lastChild, toNode.firstChild);
    }
}

/**
 * ID以外の全ての属性を置き換えます。
 * @param toElem    移動先
 * @param fromElem  移動元
 */
RendererUtil.replaceAllAttributeWithoutID = function(toElem, fromElem) {
    // 移動先要素の属性をすべて削除します
    for (var i=0; i<toElem.attributes.length; i++) {
        var name = toElem.attributes[i].name;
        if (name.toUpperCase() === 'ID') continue;
        toElem.removeAttribute(name);
    }
    // 移動元要素の属性をコピーします
    for (var i=0; i<fromElem.attributes.length; i++) {
        var name = fromElem.attributes[i].name;
        if (name.toUpperCase() === 'ID') continue;
        toElem.setAttribute(name, fromElem.getAttribute(name));
    }
}

/*-----------------------------------------------------------------*/
/* BOX要素（ルビ・読み・囲み枠）のスタイル設定で使用するメソッド */
/*-----------------------------------------------------------------*/

/**
 * カーソル移動に伴い、ルビ・読み・囲み枠のスタイルクラスを変更します
 */
RendererUtil.setBoxCaretClass = function(preNode, postNode) {

    // 移動元がよみ・ルビ・囲み枠のときはカーソルなしの書式にします
    if (RendererUtil._isBoxElement(preNode)) {
        RendererUtil._setNoCaretClass(preNode);
    }
    // 移動先がよみ・ルビ・囲み枠のときはカーソルありの書式にします
    if (RendererUtil._isBoxElement(postNode)) {
        RendererUtil._setCaretClass(postNode);
    }

    // 移動元の兄要素がよみ・ルビ・囲み枠のときはカーソルなしの書式にします
    if (preNode != null && RendererUtil._isBoxElement(preNode.previousSibling)) {
        RendererUtil._setNoCaretClass(preNode.previousSibling);
    }
    // 移動先の兄要素がよみ・ルビ・囲み枠のときはカーソルありの書式にします
    if (postNode != null && RendererUtil._isBoxElement(postNode.previousSibling)) {
        RendererUtil._setCaretClass(postNode.previousSibling);
    }
};

/**
 * カーソル表示方法を切り替えるべきBOX要素であるかを判定します。
 */
RendererUtil._isBoxElement = function(node) {
    return node != null && (node.nodeName === 'DECO' || node.nodeName === 'CREAD' || node.nodeName === 'CRUBY');
};

/**
 * カーソルなしの書式にします
 */
RendererUtil._setNoCaretClass = function(node) {
    var htmlNode = document.getElementById(node.id);
    if (htmlNode != null) {
        if (RendererUtil._getCaretClass(node)) htmlNode.classList.remove(RendererUtil._getCaretClass(node));
        if (RendererUtil._getNoCaretClass(node)) htmlNode.classList.add(RendererUtil._getNoCaretClass(node));
    }
};

/**
 * カーソルありの書式にします
 */
RendererUtil._setCaretClass = function(node) {
    var htmlNode = document.getElementById(node.id);
    if (htmlNode != null) {
        if (RendererUtil._getNoCaretClass(node)) htmlNode.classList.remove(RendererUtil._getNoCaretClass(node));
        if (RendererUtil._getCaretClass(node)) htmlNode.classList.add(RendererUtil._getCaretClass(node));
    }
};

/**
 * BOX要素でカーソルがない時の書式クラス名を取得します。
 */
RendererUtil._getNoCaretClass = function(node) {
    if (node == null) return '';
    else if (node.nodeName === 'DECO') return DecoBoxElement.getNoCaretClass();
    else if (node.nodeName === 'CREAD') return ReadingElement.getNoCaretClass();
    else if (node.nodeName === 'CRUBY') return RubyElement.getNoCaretClass();
    else return '';
};

/**
 * BOX要素でカーソルがある時の書式クラス名を取得します。
 */
RendererUtil._getCaretClass = function(node) {
    if (node == null) return '';
    else if (node.nodeName === 'DECO') return DecoBoxElement.getCaretClass();
    else if (node.nodeName === 'CREAD') return ReadingElement.getCaretClass();
    else if (node.nodeName === 'CRUBY') return RubyElement.getCaretClass();
    else return;
};


/*-----------------------------------------------------------------*/
/* 選択範囲の背景色を設定するメソッド */
/*-----------------------------------------------------------------*/

/**
 * ノードの背景色を設定します。
 * @param dataNode      設定対象となるデータノード
 * @param background    背景色（元に戻すときは空文字を指定）
 */
RendererUtil.setBackground = function(dataNode, background) {

    // 段落の場合は子要素に設定します
    if (dataNode.nodeName == 'PARAGRAPH') {
        for (var i = 0; i < dataNode.children.length; i++) {
            RendererUtil.setBackground(dataNode.children[i], background);
        }
        return;
    }

    // HTMLのノードを取得します
    var htmlNode = document.getElementById(dataNode.id);
    if (htmlNode == null) return;

    // データノードのプロパティを使用可能にします
    DataClass.bindDataClassMethods(dataNode);

    // 画像は反転します
    if (dataNode.nodeName =='CIMG') {
        if (background == '') {
            // 元の色に戻します
            if (htmlNode.src != dataNode.data) htmlNode.src = dataNode.data;
        }
        else {
            // 色を反転します
            if (htmlNode.src == dataNode.data) RendererUtil._inverseColor(htmlNode);
        }
        return;
    }

    // 数式のレイアウト要素は兄ノードに対して色設定します
    if (dataNode.nt != CIO_XML_TYPE.text && htmlNode != null &&
            htmlNode.previousSibling != null &&
            htmlNode.previousSibling.id != null &&
            htmlNode.previousSibling.id.indexOf('MathJax-Color-') === 0) {
        htmlNode = htmlNode.previousSibling;
    }

    // 背景を設定します
    htmlNode.style.background = background;
};

/**
 * 画像の色を反転します
 * @img 画像HTMLノード
 */
RendererUtil._inverseColor = function(img) {
    if (img == null) return;

    // 一時的なキャンパスに画像データを設定します
    var canvas = $('<canvas/>')[0];
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);

    // 色を反転させます
    var imageData = context.getImageData(0, 0, img.width, img.height);
    var pixels = imageData.data;
    for (var i = 0; i < img.width*img.height; i++) {
        pixels[i*4] = 255-pixels[i*4]; // Red
        pixels[i*4+1] = 255-pixels[i*4+1]; // Green
        pixels[i*4+2] = 255-pixels[i*4+2]; // Blue
    }
    context.putImageData(imageData, 0, 0);

    // 反転した色を反映します
    img.src = canvas.toDataURL('image/jpeg');
};
