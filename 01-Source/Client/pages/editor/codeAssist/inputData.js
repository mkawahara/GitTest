
/**
 * 入力可能なデータを管理するクラスです。
 * 静的メンバのみで構成されます。
 */
function InputData() {};

/**
 * 数式レベル
 */
InputData.MATH_LEVEL = {
        JUNIOUR:    1, // 中学校数学
        HIGH:       2, // 高校数学
        UNIVERSITY: 3, // 理工系大学数学
        SPECIAL:    4, // 専門数学
};

/**
 * ポップアップメニューの Tree 構造
 */
InputData.POPUP_MENU_TREE =
    [
     // 記号・文字 -----------------------------------------------------------------
     {
         category: 'SymbolChar', title: '記号・文字一覧',
         items: [
                 { category: 'Greek',               title:'ギリシャ文字', items: [] },
                 { category: 'RelativeOperator',    title: '関係演算子', items: [] },
                 { category: 'BinaryOperator',      title: '二項演算子', items: [] },
                 { category: 'Arrow',               title: '矢印', items: [] },
                 { category: 'Parenthesis',         title: '括弧類', items: [] },
                 { category: 'Point',               title: '点類', items: [] },
                 { category: 'OtherSymbols',        title: 'その他の記号', items: [] },
                 { category: 'Function',            title: '関数', items: [], separator: true, },
                 { category: 'German',              title: 'ドイツ文字 (German)', items: [] },
                 { category: 'BlackboardBold',      title: '太字 (Blackboard Bold)', items: [] },
                 { category: 'Calligraphic',        title: '花文字 (Calligoaphic)', items: [] },
                 { category: 'Script',              title: '筆記体 (Script)', items: [] },
                 { category: 'Cyrillic',            title: 'キリル文字 (ロシア)', items: [] },
                 ],
     },

     // 数式構文 ------------------------------------------------------------------------
     {
         category: 'MathSyntax', title: '数式構文一覧', separator: true,
         items: [
                 { category: 'Integral', title: '積分', items: [] },
                 { category: 'Bottom', title: '真下に添え字', items: [] },
                 { category: 'TopBottom', title: '真下と真上に添え字', items: [] },
                 { category: 'Accent', title: 'アクセント記号', items: [] },
                 { category: 'Over', title: 'オーバーライン類', items: [] },
                 { category: 'Under', title: 'アンダーライン類', items: [] },
                 ],
     },

     // テキスト記号 ----------------------------------------------------------------------
     {
         category: 'Text', title: 'テキスト記号',
         items: [
                 { category: 'Super', title: '脚注書式 (上付き)',
                   items: [
                           { category: 'SupSymbol', title: '数字・記号', items: [] },
                           { category: 'SupCapital', title: 'アルファベット大文字', items: [] },
                           { category: 'SupSmall', title: 'アルファベット小文字', items: [] },
                           ] },
                 { category: 'Sub', title: '脚注書式 (下付き)', separator: true,
                   items: [
                           { category: 'SubSymbol', title: '数字・記号', items: [] },
                           { category: 'SubCapital', title: 'アルファベット大文字', items: [] },
                           { category: 'SubSmall', title: 'アルファベット小文字', items: [] },
                           ] },
                 { category: 'Latin1', title: 'ラテン文字 1', items: [] },
                 { category: 'Latin2', title: 'ラテン文字 2', items: [] },
                 ],
     },

     // 化学式
     {
         category: 'Chemical', title: '化学式', items:[], separator: true,
     },

     // 単位
     {
         category: 'Unit', title:'単位',
         items: [
                { category: 'Length', title: '長さ', items: [] },
                { category: 'Area', title: '面積', items: [] },
                { category: 'Volume', title: '体積', items: [] },
                { category: 'Angle', title: '角度', items: [] },
                { category: 'Mass', title: '質量', items: [] },
                { category: 'Temperature', title: '温度', items: [] },
                { category: 'Time', title: '時間', items: [] },
                { category: 'Velocity', title: '速さ', items: [] },
                { category: 'Science', title: '理科', items: [] },
                { category: 'Acceleration', title: '加速度', items: [] },
                ],
     },

     ];

/**
 * 入力補助用のデータを取得します。
 */
InputData.getCodeAssistData = function(mathLevel){

    var assistData = [];

    // データを配列として取得します
    var array, tmp;
    for (var category in InputData.CONTENT) {
        array = InputData.CONTENT[category];
        for (var i = 0; i < array.length; i++) {
            tmp = array[i];

            // コマンドのないものは設定しません
            if (tmp.command == null) continue;

            // 数式レベルを指定されているときは確認します
            if (mathLevel != null && tmp.mathlevel > mathLevel) continue;

            // 入力支援に必要なデータを取得します
            assistData.push({view: tmp.view, command: tmp.command, func: tmp.func});

            // エイリアスが指定されていればコマンドのみ変えて同じデータを追加します
            if (tmp.alias) {
                var aliasArray = tmp.alias.split(',');
                for (var j=0; j<aliasArray.length; j++) {
                    assistData.push({view: tmp.view, command: aliasArray[j], func: tmp.func});
                }
            }
        }
    }

    // command 文字列の昇順にソート
    assistData.sort(function (item1, item2) {
        if (item1.command.toLowerCase() < item2.command.toLowerCase()) return -1;
        else if (item1.command.toLowerCase() > item2.command.toLowerCase()) return 1;
        else return 0;
    });

    return assistData;

};

/**
 * ポップアップのメニュー項目をツリー構造で取得します。
 * @param mathLevel 数式レベル
 * @param menuItems メニュー項目の情報（省略したときはルートとしてInputData.POPUP_MENU_TREE）
 */
InputData.getMenuTree = function(mathLevel, menuItems) {
    var menuTree = [];
    const MAX = 10; // サブメニューの最大数

    if (menuItems == null) menuItems = InputData.POPUP_MENU_TREE;

    for (var i=0; i<menuItems.length; i++) {
        var refItem = menuItems[i];
        var newItem = { type: 'li', title: refItem.title, id: 'Popup_' + refItem.category, func: '', char: '', shortcut:''};
        var childItem = { type: 'ul', id: ''};

        // セパレータが設定されていれば子要素に設定します
        if (refItem.separator) childItem.separator = true;

        // 文字の挿入メニューのデータを作成して追加します
        childItem.contents = InputData.makeMenuItems(refItem.category, mathLevel);
        // 最後のメニューにセパレータを設定します
        var childLength = childItem.contents.length;
        if (childLength > 0) childItem.contents[childLength-1].separator = true;

        // 再起呼び出しにより、サブメニューを追加します
        childItem.contents = childItem.contents.concat(InputData.getMenuTree(mathLevel, refItem.items));

        // 文字の挿入メニューが最大数を超える場合はサブメニューにまとめます
        if (childLength > MAX) {
            var contents = [];  // まとめた後のメニュー内容
            var tmpItem = null;
            var counter = 0;

            // メニューを先頭から順に移動します
            for (var j = 0; j < childLength; j++) {
                // 最大数を超えないようにします
                if (tmpItem == null || tmpItem.contents.length >= MAX) {
                    counter ++;
                    tmpItem = { type: 'ul', id: '', contents:[], };
                    contents.push({type: 'li', title: refItem.title + ' ('+counter+')', id: 'Popup_' + refItem.category + 'Sub'+ counter, func: '', char: '', shortcut:''});
                    contents.push(tmpItem);
                }

                // 移動します
                tmpItem.contents.push(childItem.contents.shift());
            }

            // メニューの先頭に追加します
            childItem.contents = contents.concat(childItem.contents);
        }

        // 子メニューが存在すれば追加します
        if (childItem.contents.length > 0) {
            menuTree.push(newItem);
            menuTree.push(childItem);
        }
    }

    return menuTree;
}

/**
 * あるカテゴリに属する要素を挿入するポップアップメニュー用のアイテムリストを作成します。
 */
InputData.makeMenuItems = function(category, mathLevel) {

    var menuItems = [];

    // カテゴリが一致するデータを配列で取得します
    var array = InputData.CONTENT[category];
    if (array == null) return [];

    var tmp;
    for (var i = 0; i<array.length; i++) {
        tmp = array[i];

        // 数式レベルを指定されているときは確認します
        if (mathLevel != null && tmp.mathlevel > mathLevel) continue;

        // ポップアップメニューに必要なデータを取得します
        menuItems.push({
            type: 'li', title: tmp.title, shortcut: '', id: tmp.id, char: tmp.view+'&nbsp;', func:tmp.func.replace(/&/g, '&amp;'),
        });
    }

    return menuItems;

};

/**
 * IDからメニュー項目オブジェクトを取得します
 */
InputData.getMenuItem = function(id) {
    if (id == null) return null;

    // 定義データから検索します
    var array;
    for (category in InputData.CONTENT) {
        array = InputData.CONTENT[category];
        for (var i=0; i<array.length; i++) {
            if (array[i].id === id) {
                var tmp = array[i];
                return {type: 'li', title: tmp.title, shortcut: '', id: tmp.id, char: tmp.view, func:tmp.func,};
            }
        }
    }

    // 通常はここに来ません
    return null;
}

/**
 * 入力データを定義します。
 *
 */
InputData.CONTENT = {

        // ギリシャ文字
        'Greek' : [
            {id: 'Popup_Greek_1',   view: '&Gamma;',    command: '\\Gamma',     title: 'Gamma',     mathlevel: 2,   func: 'AssistHandler.insert(\'&Gamma;\', {normalonly:true})'},
            {id: 'Popup_Greek_2',   view: '&Delta;',    command: '\\Delta',     title: 'Delta',     mathlevel: 2,   func: 'AssistHandler.insert(\'&Delta;\', {normalonly:true})'},
            {id: 'Popup_Greek_3',   view: '&Theta;',    command: '\\Theta',     title: 'Theta',     mathlevel: 2,   func: 'AssistHandler.insert(\'&Theta;\', {normalonly:true})'},
            {id: 'Popup_Greek_4',   view: '&Lambda;',   command: '\\Lambda',    title: 'Lambda',    mathlevel: 2,   func: 'AssistHandler.insert(\'&Lambda;\', {normalonly:true})'},
            {id: 'Popup_Greek_5',   view: '&Xi;',   command: '\\Xi',    title: 'Xi',    mathlevel: 2,   func: 'AssistHandler.insert(\'&Xi;\', {normalonly:true})'},
            {id: 'Popup_Greek_6',   view: '&Pi;',   command: '\\Pi',    title: 'Pi',    mathlevel: 2,   func: 'AssistHandler.insert(\'&Pi;\', {normalonly:true})'},
            {id: 'Popup_Greek_7',   view: '&Sigma;',    command: '\\Sigma',     title: 'Sigma',     mathlevel: 2,   func: 'AssistHandler.insert(\'&Sigma;\', {normalonly:true})'},
            {id: 'Popup_Greek_8',   view: '&Upsilon;',  command: '\\Upsilon',   title: 'Upsilon',   mathlevel: 2,   func: 'AssistHandler.insert(\'&Upsilon;\', {normalonly:true})'},
            {id: 'Popup_Greek_9',   view: '&Phi;',  command: '\\Phi',   title: 'Phi',   mathlevel: 2,   func: 'AssistHandler.insert(\'&Phi;\', {normalonly:true})'},
            {id: 'Popup_Greek_10',  view: '&Psi;',  command: '\\Psi',   title: 'Psi',   mathlevel: 2,   func: 'AssistHandler.insert(\'&Psi;\', {normalonly:true})'},
            {id: 'Popup_Greek_11',  view: '&Omega;',    command: '\\Omega',     title: 'Omega',     mathlevel: 1,   func: 'AssistHandler.insert(\'&Omega;\', {normalonly:true})'},
            {id: 'Popup_Greek_12',  view: '&alpha;',    command: '\\alpha',     title: 'alpha',     mathlevel: 1,   func: 'AssistHandler.insert(\'&alpha;\', null)'},
            {id: 'Popup_Greek_13',  view: '&beta;',     command: '\\beta',  title: 'beta',  mathlevel: 1,   func: 'AssistHandler.insert(\'&beta;\', null)'},
            {id: 'Popup_Greek_14',  view: '&gamma;',    command: '\\gamma',     title: 'gamma',     mathlevel: 1,   func: 'AssistHandler.insert(\'&gamma;\', null)'},
            {id: 'Popup_Greek_15',  view: '&delta;',    command: '\\delta',     title: 'delta',     mathlevel: 2,   func: 'AssistHandler.insert(\'&delta;\', null)'},
            {id: 'Popup_Greek_16',  view: '&epsilon;',  command: '\\epsilon',   title: 'epsilon',   mathlevel: 2,   func: 'AssistHandler.insert(\'&epsilon;\', null)'},
            {id: 'Popup_Greek_17',  view: '&zeta;',     command: '\\zeta',  title: 'zeta',  mathlevel: 2,   func: 'AssistHandler.insert(\'&zeta;\', null)'},
            {id: 'Popup_Greek_18',  view: '&eta;',  command: '\\eta',   title: 'eta',   mathlevel: 2,   func: 'AssistHandler.insert(\'&eta;\', null)'},
            {id: 'Popup_Greek_19',  view: '&theta;',    command: '\\theta',     title: 'theta',     mathlevel: 2,   func: 'AssistHandler.insert(\'&theta;\', null)'},
            {id: 'Popup_Greek_20',  view: '&iota;',     command: '\\iota',  title: 'iota',  mathlevel: 2,   func: 'AssistHandler.insert(\'&iota;\', null)'},
            {id: 'Popup_Greek_21',  view: '&kappa;',    command: '\\kappa',     title: 'kappa',     mathlevel: 2,   func: 'AssistHandler.insert(\'&kappa;\', null)'},
            {id: 'Popup_Greek_22',  view: '&lambda;',   command: '\\lambda',    title: 'lambda',    mathlevel: 2,   func: 'AssistHandler.insert(\'&lambda;\', null)'},
            {id: 'Popup_Greek_23',  view: '&mu;',   command: '\\mu',    title: 'mu',    mathlevel: 2,   func: 'AssistHandler.insert(\'&mu;\', null)'},
            {id: 'Popup_Greek_24',  view: '&nu;',   command: '\\nu',    title: 'nu',    mathlevel: 2,   func: 'AssistHandler.insert(\'&nu;\', null)'},
            {id: 'Popup_Greek_25',  view: '&xi;',   command: '\\xi',    title: 'xi',    mathlevel: 2,   func: 'AssistHandler.insert(\'&xi;\', null)'},
            {id: 'Popup_Greek_26',  view: '&pi;',   command: '\\pi',    title: 'pi',    mathlevel: 1,   func: 'AssistHandler.insert(\'&pi;\', null)'},
            {id: 'Popup_Greek_27',  view: '&rho;',  command: '\\rho',   title: 'rho',   mathlevel: 2,   func: 'AssistHandler.insert(\'&rho;\', null)'},
            {id: 'Popup_Greek_28',  view: '&sigma;',    command: '\\sigma',     title: 'sigma',     mathlevel: 2,   func: 'AssistHandler.insert(\'&sigma;\', null)'},
            {id: 'Popup_Greek_29',  view: '&tau;',  command: '\\tau',   title: 'tau',   mathlevel: 2,   func: 'AssistHandler.insert(\'&tau;\', null)'},
            {id: 'Popup_Greek_30',  view: '&upsilon;',  command: '\\upsilon',   title: 'upsilon',   mathlevel: 2,   func: 'AssistHandler.insert(\'&upsilon;\', null)'},
            {id: 'Popup_Greek_31',  view: '&phi;',  command: '\\phi',   title: 'phi',   mathlevel: 2,   func: 'AssistHandler.insert(\'&phi;\', null)'},
            {id: 'Popup_Greek_32',  view: '&chi;',  command: '\\chi',   title: 'chi',   mathlevel: 2,   func: 'AssistHandler.insert(\'&chi;\', null)'},
            {id: 'Popup_Greek_33',  view: '&psi;',  command: '\\psi',   title: 'psi',   mathlevel: 2,   func: 'AssistHandler.insert(\'&psi;\', null)'},
            {id: 'Popup_Greek_34',  view: '&omega;',    command: '\\omega',     title: 'omega',     mathlevel: 2,   func: 'AssistHandler.insert(\'&omega;\', null)'},
            {id: 'Popup_Greek_35',  view: '&epsilon;',  command: '\\varepsilon',    title: 'varepsilon',    mathlevel: 2,   func: 'AssistHandler.insert(\'&epsilon;\', null)'},
            {id: 'Popup_Greek_36',  view: '&theta;',    command: '\\vartheta',  title: 'vartheta',  mathlevel: 2,   func: 'AssistHandler.insert(\'&theta;\', null)'},
            {id: 'Popup_Greek_37',  view: '&pi;',   command: '\\varpi',     title: 'varpi',     mathlevel: 2,   func: 'AssistHandler.insert(\'&pi;\', null)'},
            {id: 'Popup_Greek_38',  view: '&rho;',  command: '\\varrho',    title: 'varrho',    mathlevel: 2,   func: 'AssistHandler.insert(\'&rho;\', null)'},
            {id: 'Popup_Greek_39',  view: '&sigma;',    command: '\\varsigma',  title: 'varsigma',  mathlevel: 2,   func: 'AssistHandler.insert(\'&sigma;\', null)'},
            {id: 'Popup_Greek_40',  view: '&phi;',  command: '\\varphi',    title: 'varphi',    mathlevel: 2,   func: 'AssistHandler.insert(\'&phi;\', null)'},
        ],

        // キリル文字
        'Cyrillic' : [
            {id: 'Popup_Cyrillic_1',    view: '&Acy;',  command: '\\cyrA',  title: 'cyrA',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Acy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_2',    view: '&Bcy;',  command: '\\cyrBe',     title: 'cyrBe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Bcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_3',    view: '&Vcy;',  command: '\\cyrVe',     title: 'cyrVe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Vcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_4',    view: '&Gcy;',  command: '\\cyrGe',     title: 'cyrGe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Gcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_5',    view: '&Dcy;',  command: '\\cyrDe',     title: 'cyrDe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Dcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_6',    view: '&IEcy;',     command: '\\cyrJe',     title: 'cyrJe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&IEcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_7',    view: '&ZHcy;',     command: '\\cyrZhe',    title: 'cyrZhe',    mathlevel: 3,   func: 'AssistHandler.insert(\'&ZHcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_8',    view: '&Zcy;',  command: '\\cyrZe',     title: 'cyrZe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Zcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_9',    view: '&Icy;',  command: '\\cyrI',  title: 'cyrI',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Icy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_10',   view: '&Jcy;',  command: '\\cyrIkratkoje',  title: 'cyrIkratkoje',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Jcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_11',   view: '&Kcy;',  command: '\\cyrKa',     title: 'cyrKa',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Kcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_12',   view: '&Lcy;',  command: '\\cyrEl',     title: 'cyrEl',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Lcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_13',   view: '&Mcy;',  command: '\\cyrEm',     title: 'cyrEm',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Mcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_14',   view: '&Ncy;',  command: '\\cyrEn',     title: 'cyrEn',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Ncy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_15',   view: '&Ocy;',  command: '\\cyrO',  title: 'cyrO',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ocy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_16',   view: '&Pcy;',  command: '\\cyrPe',     title: 'cyrPe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Pcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_17',   view: '&Rcy;',  command: '\\cyrEr',     title: 'cyrEr',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Rcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_18',   view: '&Scy;',  command: '\\cyrEs',     title: 'cyrEs',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Scy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_19',   view: '&Tcy;',  command: '\\cyrTe',     title: 'cyrTe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Tcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_20',   view: '&Ucy;',  command: '\\cyrU',  title: 'cyrU',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ucy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_21',   view: '&Fcy;',  command: '\\cyrEf',     title: 'cyrEf',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Fcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_22',   view: '&KHcy;',     command: '\\cyrXa',     title: 'cyrXa',     mathlevel: 3,   func: 'AssistHandler.insert(\'&KHcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_23',   view: '&TScy;',     command: '\\cyrTse',    title: 'cyrTse',    mathlevel: 3,   func: 'AssistHandler.insert(\'&TScy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_24',   view: '&CHcy;',     command: '\\cyrChe',    title: 'cyrChe',    mathlevel: 3,   func: 'AssistHandler.insert(\'&CHcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_25',   view: '&SHcy;',     command: '\\cyrSha',    title: 'cyrSha',    mathlevel: 3,   func: 'AssistHandler.insert(\'&SHcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_26',   view: '&SHCHcy;',   command: '\\cyrShcha',  title: 'cyrShcha',  mathlevel: 3,   func: 'AssistHandler.insert(\'&SHCHcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_27',   view: '&HARDcy;',   command: '\\cyrTvjordyjznak',   title: 'cyrTvjordyjznak',   mathlevel: 3,   func: 'AssistHandler.insert(\'&HARDcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_28',   view: '&Ycy;',  command: '\\cyrL',  title: 'cyrL',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ycy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_29',   view: '&SOFTcy;',   command: '\\cyrMjaxkijznak',    title: 'cyrMjaxkijznak',    mathlevel: 3,   func: 'AssistHandler.insert(\'&SOFTcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_30',   view: '&Ecy;',  command: '\\cyrE',  title: 'cyrE',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ecy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_31',   view: '&YUcy;',     command: '\\cyrJu',     title: 'cyrJu',     mathlevel: 3,   func: 'AssistHandler.insert(\'&YUcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_32',   view: '&YAcy;',     command: '\\cyrJa',     title: 'cyrJa',     mathlevel: 3,   func: 'AssistHandler.insert(\'&YAcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_33',   view: '&IOcy;',     command: '\\cyrJo',     title: 'cyrJo',     mathlevel: 3,   func: 'AssistHandler.insert(\'&IOcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_34',   view: '&acy;',  command: '\\cyra',  title: 'cyra',  mathlevel: 3,   func: 'AssistHandler.insert(\'&acy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_35',   view: '&bcy;',  command: '\\cyrbe',     title: 'cyrbe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&bcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_36',   view: '&vcy;',  command: '\\cyrve',     title: 'cyrve',     mathlevel: 3,   func: 'AssistHandler.insert(\'&vcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_37',   view: '&gcy;',  command: '\\cyrge',     title: 'cyrge',     mathlevel: 3,   func: 'AssistHandler.insert(\'&gcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_38',   view: '&dcy;',  command: '\\cyrde',     title: 'cyrde',     mathlevel: 3,   func: 'AssistHandler.insert(\'&dcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_39',   view: '&iecy;',     command: '\\cyrje',     title: 'cyrje',     mathlevel: 3,   func: 'AssistHandler.insert(\'&iecy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_40',   view: '&zhcy;',     command: '\\cyrzhe',    title: 'cyrzhe',    mathlevel: 3,   func: 'AssistHandler.insert(\'&zhcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_41',   view: '&zcy;',  command: '\\cyrze',     title: 'cyrze',     mathlevel: 3,   func: 'AssistHandler.insert(\'&zcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_42',   view: '&icy;',  command: '\\cyri',  title: 'cyri',  mathlevel: 3,   func: 'AssistHandler.insert(\'&icy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_43',   view: '&jcy;',  command: '\\cyrikratkoje',  title: 'cyrikratkoje',  mathlevel: 3,   func: 'AssistHandler.insert(\'&jcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_44',   view: '&kcy;',  command: '\\cyrka',     title: 'cyrka',     mathlevel: 3,   func: 'AssistHandler.insert(\'&kcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_45',   view: '&lcy;',  command: '\\cyrel',     title: 'cyrel',     mathlevel: 3,   func: 'AssistHandler.insert(\'&lcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_46',   view: '&mcy;',  command: '\\cyrem',     title: 'cyrem',     mathlevel: 3,   func: 'AssistHandler.insert(\'&mcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_47',   view: '&ncy;',  command: '\\cyren',     title: 'cyren',     mathlevel: 3,   func: 'AssistHandler.insert(\'&ncy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_48',   view: '&ocy;',  command: '\\cyro',  title: 'cyro',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ocy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_49',   view: '&pcy;',  command: '\\cyrpe',     title: 'cyrpe',     mathlevel: 3,   func: 'AssistHandler.insert(\'&pcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_50',   view: '&rcy;',  command: '\\cyrer',     title: 'cyrer',     mathlevel: 3,   func: 'AssistHandler.insert(\'&rcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_51',   view: '&scy;',  command: '\\cyres',     title: 'cyres',     mathlevel: 3,   func: 'AssistHandler.insert(\'&scy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_52',   view: '&tcy;',  command: '\\cyrte',     title: 'cyrte',     mathlevel: 3,   func: 'AssistHandler.insert(\'&tcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_53',   view: '&ucy;',  command: '\\cyru',  title: 'cyru',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ucy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_54',   view: '&fcy;',  command: '\\cyref',     title: 'cyref',     mathlevel: 3,   func: 'AssistHandler.insert(\'&fcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_55',   view: '&khcy;',     command: '\\cyrxa',     title: 'cyrxa',     mathlevel: 3,   func: 'AssistHandler.insert(\'&khcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_56',   view: '&tscy;',     command: '\\cyrtse',    title: 'cyrtse',    mathlevel: 3,   func: 'AssistHandler.insert(\'&tscy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_57',   view: '&chcy;',     command: '\\cyrche',    title: 'cyrche',    mathlevel: 3,   func: 'AssistHandler.insert(\'&chcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_58',   view: '&shcy;',     command: '\\cyrsha',    title: 'cyrsha',    mathlevel: 3,   func: 'AssistHandler.insert(\'&shcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_59',   view: '&shchcy;',   command: '\\cyrshcha',  title: 'cyrshcha',  mathlevel: 3,   func: 'AssistHandler.insert(\'&shchcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_60',   view: '&hardcy;',   command: '\\cyrtvjordyjznak',   title: 'cyrtvjordyjznak',   mathlevel: 3,   func: 'AssistHandler.insert(\'&hardcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_61',   view: '&ycy;',  command: '\\cyrl',  title: 'cyrl',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ycy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_62',   view: '&softcy;',   command: '\\cyrmjaxkijznak',    title: 'cyrmjaxkijznak',    mathlevel: 3,   func: 'AssistHandler.insert(\'&softcy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_63',   view: '&ecy;',  command: '\\cyre',  title: 'cyre',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ecy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_64',   view: '&yucy;',     command: '\\cyrju',     title: 'cyrju',     mathlevel: 3,   func: 'AssistHandler.insert(\'&yucy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_65',   view: '&yacy;',     command: '\\cyrja',     title: 'cyrja',     mathlevel: 3,   func: 'AssistHandler.insert(\'&yacy;\', {inputmode:1})'},
            {id: 'Popup_Cyrillic_66',   view: '&iocy;',     command: '\\cyrjo',     title: 'cyrjo',     mathlevel: 3,   func: 'AssistHandler.insert(\'&iocy;\', {inputmode:1})'},
        ],

      //  ラテン文字１
      'Latin1' : [
      {id: 'Popup_Latin1_1',  view: '&Agrave;',   command: '\\Agrave',    title: 'Agrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Agrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_2',  view: '&Aacute;',   command: '\\Aacute',    title: 'Aacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Aacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_3',  view: '&Acirc;',    command: '\\Ahat',  title: 'Ahat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Acirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_4',  view: '&Atilde;',   command: '\\Atilde',    title: 'Atilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Atilde;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_5',  view: '&Auml;',     command: '\\Aumlaut',   title: 'Aumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&Auml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_6',  view: '&Aring;',    command: '\\Acirc',     title: 'Acirc',     mathlevel: 3,   func: 'AssistHandler.insert(\'&Aring;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_7',  view: '&Ccedil;',   command: '\\Ccedille',  title: 'Ccedille',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ccedil;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_8',  view: '&Egrave;',   command: '\\Egrave',    title: 'Egrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Egrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_9',  view: '&Eacute;',   command: '\\Eacute',    title: 'Eacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Eacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_10',     view: '&Ecirc;',    command: '\\Ehat',  title: 'Ehat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ecirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_11',     view: '&Euml;',     command: '\\Eumlaut',   title: 'Eumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&Euml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_12',     view: '&Igrave;',   command: '\\Igrave',    title: 'Igrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Igrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_13',     view: '&Iacute;',   command: '\\Iacute',    title: 'Iacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Iacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_14',     view: '&Icirc;',    command: '\\Ihat',  title: 'Ihat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Icirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_15',     view: '&Iuml;',     command: '\\Iumlaut',   title: 'Iumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&Iuml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_16',     view: '&Ntilde;',   command: '\\Ntilde',    title: 'Ntilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Ntilde;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_17',     view: '&Ograve;',   command: '\\Ograve',    title: 'Ograve',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Ograve;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_18',     view: '&Oacute;',   command: '\\Oacute',    title: 'Oacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Oacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_19',     view: '&Ocirc;',    command: '\\Ohat',  title: 'Ohat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ocirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_20',     view: '&Otilde;',   command: '\\Otilde',    title: 'Otilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Otilde;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_21',     view: '&Ouml;',     command: '\\Oumlaut',   title: 'Oumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&Ouml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_22',     view: '&Oslash;',   command: '\\Oslash',    title: 'Oslash',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Oslash;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_23',     view: '&Ugrave;',   command: '\\Ugrave',    title: 'Ugrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Ugrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_24',     view: '&Uacute;',   command: '\\Uacute',    title: 'Uacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Uacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_25',     view: '&Ucirc;',    command: '\\Uhat',  title: 'Uhat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Ucirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_26',     view: '&Uuml;',     command: '\\Uumlaut',   title: 'Uumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&Uuml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_27',     view: '&Yacute;',   command: '\\Yacute',    title: 'Yacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Yacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_28',     view: '&szlig;',    command: '\\ss',    title: 'ss',    mathlevel: 3,   func: 'AssistHandler.insert(\'&szlig;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_29',     view: '&agrave;',   command: '\\agrave',    title: 'agrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&agrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_30',     view: '&aacute;',   command: '\\aacute',    title: 'aacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&aacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_31',     view: '&acirc;',    command: '\\ahat',  title: 'ahat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&acirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_32',     view: '&atilde;',   command: '\\atilde',    title: 'atilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&atilde;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_33',     view: '&auml;',     command: '\\aumlaut',   title: 'aumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&auml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_34',     view: '&aring;',    command: '\\acirc',     title: 'acirc',     mathlevel: 3,   func: 'AssistHandler.insert(\'&aring;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_35',     view: '&ccedil;',   command: '\\ccedille',  title: 'ccedille',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ccedil;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_36',     view: '&egrave;',   command: '\\egrave',    title: 'egrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&egrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_37',     view: '&eacute;',   command: '\\eacute',    title: 'eacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&eacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_38',     view: '&ecirc;',    command: '\\ehat',  title: 'ehat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ecirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_39',     view: '&euml;',     command: '\\eumlaut',   title: 'eumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&euml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_40',     view: '&igrave;',   command: '\\igrave',    title: 'igrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&igrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_41',     view: '&iacute;',   command: '\\iacute',    title: 'iacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&iacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_42',     view: '&icirc;',    command: '\\ihat',  title: 'ihat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&icirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_43',     view: '&iuml;',     command: '\\iumlaut',   title: 'iumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&iuml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_44',     view: '&ntilde;',   command: '\\ntilde',    title: 'ntilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&ntilde;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_45',     view: '&ograve;',   command: '\\ograve',    title: 'ograve',    mathlevel: 3,   func: 'AssistHandler.insert(\'&ograve;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_46',     view: '&oacute;',   command: '\\oacute',    title: 'oacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&oacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_47',     view: '&ocirc;',    command: '\\ohat',  title: 'ohat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ocirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_48',     view: '&otilde;',   command: '\\otilde',    title: 'otilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&otilde;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_49',     view: '&ouml;',     command: '\\oumlaut',   title: 'oumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&ouml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_50',     view: '&oslash;',   command: '\\oslash',    title: 'oslash',    mathlevel: 3,   func: 'AssistHandler.insert(\'&oslash;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_51',     view: '&ugrave;',   command: '\\ugrave',    title: 'ugrave',    mathlevel: 3,   func: 'AssistHandler.insert(\'&ugrave;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_52',     view: '&uacute;',   command: '\\uacute',    title: 'uacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&uacute;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_53',     view: '&ucirc;',    command: '\\uhat',  title: 'uhat',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ucirc;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_54',     view: '&uuml;',     command: '\\uumlaut',   title: 'uumlaut',   mathlevel: 3,   func: 'AssistHandler.insert(\'&uuml;\', {inputmode: 1})'},
      {id: 'Popup_Latin1_55',     view: '&yacute;',   command: '\\yacute',    title: 'yacute',    mathlevel: 3,   func: 'AssistHandler.insert(\'&yacute;\', {inputmode: 1})'},
      ],

        // ラテン文字２
        'Latin2' : [
{id: 'Popup_Latin2_1',  view: '&Amacr;',    command: '\\Abar',  title: 'Abar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Amacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_2',  view: '&amacr;',    command: '\\abar',  title: 'abar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&amacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_3',  view: '&Abreve;',   command: '\\Abreve',    title: 'Abreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Abreve;\', {inputmode: 1})'},
{id: 'Popup_Latin2_4',  view: '&abreve;',   command: '\\abreve',    title: 'abreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&abreve;\', {inputmode: 1})'},
{id: 'Popup_Latin2_5',  view: '&Aogon;',    command: '\\Aogon',     title: 'Aogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Aogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_6',  view: '&aogon;',    command: '\\aogon',     title: 'aogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&aogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_7',  view: '&Cacute;',   command: '\\Cacute',    title: 'Cacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Cacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_8',  view: '&cacute;',   command: '\\cacute',    title: 'cacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&cacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_9',  view: '&Ccirc;',    command: '\\Ccirc',     title: 'Ccirc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Ccirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_10',     view: '&ccirc;',    command: '\\ccirc',     title: 'ccirc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&ccirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_11',     view: '&Cdot;',     command: '\\Cdot',  title: 'Cdot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Cdot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_12',     view: '&cdot;',     command: '\\cwithdot',  title: 'cwithdot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&cdot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_13',     view: '&Ccaron;',   command: '\\Ccheck',    title: 'Ccheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Ccaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_14',     view: '&ccaron;',   command: '\\ccheck',    title: 'ccheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ccaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_15',     view: '&Dcaron;',   command: '\\Dcheck',    title: 'Dcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Dcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_16',     view: '&dcaron;',   command: '\\dcheck',    title: 'dcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&dcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_17',     view: '&Dstrok;',   command: '\\Dstrok',    title: 'Dstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Dstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_18',     view: '&dstrok;',   command: '\\dstrok',    title: 'dstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&dstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_19',     view: '&Emacr;',    command: '\\Ebar',  title: 'Ebar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Emacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_20',     view: '&emacr;',    command: '\\ebar',  title: 'ebar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&emacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_21',     view: '&#x0114;',   command: '\\Ebreve',    title: 'Ebreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&#x0114;\', {inputmode: 1})'},
{id: 'Popup_Latin2_22',     view: '&#x0115;',   command: '\\ebreve',    title: 'ebreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&#x0115;\', {inputmode: 1})'},
{id: 'Popup_Latin2_23',     view: '&Edot;',     command: '\\Edot',  title: 'Edot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Edot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_24',     view: '&edot;',     command: '\\edot',  title: 'edot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&edot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_25',     view: '&Eogon;',    command: '\\Eogon',     title: 'Eogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Eogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_26',     view: '&eogon;',    command: '\\eogon',     title: 'eogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&eogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_27',     view: '&Ecaron;',   command: '\\Echeck',    title: 'Echeck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Ecaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_28',     view: '&ecaron;',   command: '\\echeck',    title: 'echeck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ecaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_29',     view: '&Gcirc;',    command: '\\Gcirc',     title: 'Gcirc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Gcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_30',     view: '&gcirc;',    command: '\\gcirc',     title: 'gcirc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&gcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_31',     view: '&Gbreve;',   command: '\\Gbreve',    title: 'Gbreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Gbreve;\', {inputmode: 1})'},
{id: 'Popup_Latin2_32',     view: '&gbreve;',   command: '\\gbreve',    title: 'gbreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&gbreve;\', {inputmode: 1})'},
{id: 'Popup_Latin2_33',     view: '&Gdot;',     command: '\\Gdot',  title: 'Gdot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Gdot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_34',     view: '&gdot;',     command: '\\gdot',  title: 'gdot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&gdot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_35',     view: '&Gcedil;',   command: '\\Gcedil',    title: 'Gcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Gcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_36',     view: '&gacute;',   command: '\\gacute',    title: 'gacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&gacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_37',     view: '&Hcirc;',    command: '\\Hcirc',     title: 'Hcirc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Hcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_38',     view: '&hcirc;',    command: '\\hcirc',     title: 'hcirc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&hcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_39',     view: '&Hstrok;',   command: '\\Hstrok',    title: 'Hstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Hstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_40',     view: '&hstrok;',   command: '\\hstrok',    title: 'hstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&hstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_41',     view: '&Itilde;',   command: '\\Itilde',    title: 'Itilde',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Itilde;\', {inputmode: 1})'},
{id: 'Popup_Latin2_42',     view: '&itilde;',   command: '\\itilde',    title: 'itilde',    mathlevel: 4,   func: 'AssistHandler.insert(\'&itilde;\', {inputmode: 1})'},
{id: 'Popup_Latin2_43',     view: '&Imacr;',    command: '\\Ibar',  title: 'Ibar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Imacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_44',     view: '&imacr;',    command: '\\ibar',  title: 'ibar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&imacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_45',     view: '&#x012C;',   command: '\\Ibreve',    title: 'Ibreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&#x012C;\', {inputmode: 1})'},
{id: 'Popup_Latin2_46',     view: '&#x012D;',   command: '\\ibreve',    title: 'ibreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&#x012D;\', {inputmode: 1})'},
{id: 'Popup_Latin2_47',     view: '&Iogon;',    command: '\\Iogon',     title: 'Iogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Iogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_48',     view: '&iogon;',    command: '\\iogon',     title: 'iogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&iogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_49',     view: '&Idot;',     command: '\\Idot',  title: 'Idot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Idot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_50',     view: '&imath;',    command: '\\imath',     title: 'imath',     mathlevel: 4,   func: 'AssistHandler.insert(\'&imath;\', {inputmode: 1})'},
{id: 'Popup_Latin2_51',     view: '&IJlig;',    command: '\\IJlig',     title: 'IJlig',     mathlevel: 4,   func: 'AssistHandler.insert(\'&IJlig;\', {inputmode: 1})'},
{id: 'Popup_Latin2_52',     view: '&ijlig;',    command: '\\ijlig',     title: 'ijlig',     mathlevel: 4,   func: 'AssistHandler.insert(\'&ijlig;\', {inputmode: 1})'},
{id: 'Popup_Latin2_53',     view: '&Jcirc;',    command: '\\Jhat',  title: 'Jhat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Jcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_54',     view: '&jcirc;',    command: '\\jhat',  title: 'jhat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&jcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_55',     view: '&Kcedil;',   command: '\\Kcedil',    title: 'Kcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Kcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_56',     view: '&kcedil;',   command: '\\kcedil',    title: 'kcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&kcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_57',     view: '&kgreen;',   command: '\\kgreen',    title: 'kgreen',    mathlevel: 4,   func: 'AssistHandler.insert(\'&kgreen;\', {inputmode: 1})'},
{id: 'Popup_Latin2_58',     view: '&Lacute;',   command: '\\Lacute',    title: 'Lacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Lacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_59',     view: '&lacute;',   command: '\\lacute',    title: 'lacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_60',     view: '&Lcedil;',   command: '\\Lcedil',    title: 'Lcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Lcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_61',     view: '&lcedil;',   command: '\\lcedil',    title: 'lcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_62',     view: '&Lcaron;',   command: '\\Lcalon',    title: 'Lcalon',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Lcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_63',     view: '&lcaron;',   command: '\\lcaron',    title: 'lcaron',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_64',     view: '&Lmidot;',   command: '\\Lmidot',    title: 'Lmidot',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Lmidot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_65',     view: '&lmidot;',   command: '\\lmidot',    title: 'lmidot',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lmidot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_66',     view: '&Lstrok;',   command: '\\Lstrok',    title: 'Lstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Lstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_67',     view: '&lstrok;',   command: '\\lstrok',    title: 'lstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_68',     view: '&Nacute;',   command: '\\Nacute',    title: 'Nacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Nacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_69',     view: '&nacute;',   command: '\\nacute',    title: 'nacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&nacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_70',     view: '&Ncedil;',   command: '\\Ncedil',    title: 'Ncedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Ncedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_71',     view: '&ncedil;',   command: '\\ncedil',    title: 'ncedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ncedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_72',     view: '&Ncaron;',   command: '\\Ncheck',    title: 'Ncheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Ncaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_73',     view: '&ncaron;',   command: '\\ncheck',    title: 'ncheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ncaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_74',     view: '&napos;',    command: '\\napos',     title: 'napos',     mathlevel: 4,   func: 'AssistHandler.insert(\'&napos;\', {inputmode: 1})'},
{id: 'Popup_Latin2_75',     view: '&ENG;',  command: '\\ENG',   title: 'ENG',   mathlevel: 4,   func: 'AssistHandler.insert(\'&ENG;\', {inputmode: 1})'},
{id: 'Popup_Latin2_76',     view: '&eng;',  command: '\\eng',   title: 'eng',   mathlevel: 4,   func: 'AssistHandler.insert(\'&eng;\', {inputmode: 1})'},
{id: 'Popup_Latin2_77',     view: '&Omacr;',    command: '\\Obar',  title: 'Obar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Omacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_78',     view: '&omacr;',    command: '\\obar',  title: 'obar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&omacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_79',     view: '&#x014E;',   command: '\\Obreve',    title: 'Obreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&#x014E;\', {inputmode: 1})'},
{id: 'Popup_Latin2_80',     view: '&#x014F;',   command: '\\obreve',    title: 'obreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&#x014F;\', {inputmode: 1})'},
{id: 'Popup_Latin2_81',     view: '&Odblac;',   command: '\\Olong',     title: 'Olong',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Odblac;\', {inputmode: 1})'},
{id: 'Popup_Latin2_82',     view: '&odblac;',   command: '\\olong',     title: 'olong',     mathlevel: 4,   func: 'AssistHandler.insert(\'&odblac;\', {inputmode: 1})'},
{id: 'Popup_Latin2_83',     view: '&OElig;',    command: '\\OElig',     title: 'OElig',     mathlevel: 4,   func: 'AssistHandler.insert(\'&OElig;\', {inputmode: 1})'},
{id: 'Popup_Latin2_84',     view: '&oelig;',    command: '\\oelig',     title: 'oelig',     mathlevel: 4,   func: 'AssistHandler.insert(\'&oelig;\', {inputmode: 1})'},
{id: 'Popup_Latin2_85',     view: '&Racute;',   command: '\\Racute',    title: 'Racute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Racute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_86',     view: '&racute;',   command: '\\racute',    title: 'racute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&racute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_87',     view: '&Rcedil;',   command: '\\Rcedil',    title: 'Rcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Rcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_88',     view: '&rcedil;',   command: '\\rcedil',    title: 'rcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&rcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_89',     view: '&Rcaron;',   command: '\\Rcheck',    title: 'Rcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Rcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_90',     view: '&rcaron;',   command: '\\rcheck',    title: 'rcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&rcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_91',     view: '&Sacute;',   command: '\\Sacute',    title: 'Sacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Sacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_92',     view: '&sacute;',   command: '\\sacute',    title: 'sacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&sacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_93',     view: '&Scirc;',    command: '\\Shat',  title: 'Shat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Scirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_94',     view: '&scirc;',    command: '\\shat',  title: 'shat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&scirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_95',     view: '&Scedil;',   command: '\\Scedil',    title: 'Scedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Scedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_96',     view: '&scedil;',   command: '\\scedil',    title: 'scedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&scedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_97',     view: '&Scaron;',   command: '\\Scheck',    title: 'Scheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Scaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_98',     view: '&scaron;',   command: '\\scheck',    title: 'scheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&scaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_99',     view: '&Tcedil;',   command: '\\Tcedil',    title: 'Tcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Tcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_100',    view: '&tcedil;',   command: '\\tcedil',    title: 'tcedil',    mathlevel: 4,   func: 'AssistHandler.insert(\'&tcedil;\', {inputmode: 1})'},
{id: 'Popup_Latin2_101',    view: '&Tcaron;',   command: '\\Tcheck',    title: 'Tcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Tcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_102',    view: '&tcaron;',   command: '\\tcheck',    title: 'tcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&tcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_103',    view: '&Tstrok;',   command: '\\Tstrok',    title: 'Tstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Tstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_104',    view: '&tstrok;',   command: '\\tstrok',    title: 'tstrok',    mathlevel: 4,   func: 'AssistHandler.insert(\'&tstrok;\', {inputmode: 1})'},
{id: 'Popup_Latin2_105',    view: '&Utilde;',   command: '\\Utilde',    title: 'Utilde',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Utilde;\', {inputmode: 1})'},
{id: 'Popup_Latin2_106',    view: '&utilde;',   command: '\\utilde',    title: 'utilde',    mathlevel: 4,   func: 'AssistHandler.insert(\'&utilde;\', {inputmode: 1})'},
{id: 'Popup_Latin2_107',    view: '&Umacr;',    command: '\\Ubar',  title: 'Ubar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Umacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_108',    view: '&umacr;',    command: '\\ubar',  title: 'ubar',  mathlevel: 4,   func: 'AssistHandler.insert(\'&umacr;\', {inputmode: 1})'},
{id: 'Popup_Latin2_109',    view: '&Ubreve;',   command: '\\Ubreve',    title: 'Ubreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Ubreve;\', {inputmode: 1})'},
{id: 'Popup_Latin2_110',    view: '&ubreve;',   command: '\\ubreve',    title: 'ubreve',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ubreve;\', {inputmode: 1})'},
{id: 'Popup_Latin2_111',    view: '&Uring;',    command: '\\Uring',     title: 'Uring',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Uring;\', {inputmode: 1})'},
{id: 'Popup_Latin2_112',    view: '&uring;',    command: '\\uring',     title: 'uring',     mathlevel: 4,   func: 'AssistHandler.insert(\'&uring;\', {inputmode: 1})'},
{id: 'Popup_Latin2_113',    view: '&Udblac;',   command: '\\Ulong',     title: 'Ulong',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Udblac;\', {inputmode: 1})'},
{id: 'Popup_Latin2_114',    view: '&udblac;',   command: '\\ulong',     title: 'ulong',     mathlevel: 4,   func: 'AssistHandler.insert(\'&udblac;\', {inputmode: 1})'},
{id: 'Popup_Latin2_115',    view: '&Uogon;',    command: '\\Uogon',     title: 'Uogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&Uogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_116',    view: '&uogon;',    command: '\\uogon',     title: 'uogon',     mathlevel: 4,   func: 'AssistHandler.insert(\'&uogon;\', {inputmode: 1})'},
{id: 'Popup_Latin2_117',    view: '&Wcirc;',    command: '\\What',  title: 'What',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Wcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_118',    view: '&wcirc;',    command: '\\what',  title: 'what',  mathlevel: 4,   func: 'AssistHandler.insert(\'&wcirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_119',    view: '&Ycirc;',    command: '\\Yhat',  title: 'Yhat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Ycirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_120',    view: '&ycirc;',    command: '\\yhat',  title: 'yhat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&ycirc;\', {inputmode: 1})'},
{id: 'Popup_Latin2_121',    view: '&Yuml;',     command: '\\Yumlaut',   title: 'Yumlaut',   mathlevel: 4,   func: 'AssistHandler.insert(\'&Yuml;\', {inputmode: 1})'},
{id: 'Popup_Latin2_122',    view: '&Zacute;',   command: '\\Zacute',    title: 'Zacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Zacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_123',    view: '&zacute;',   command: '\\zacute',    title: 'zacute',    mathlevel: 4,   func: 'AssistHandler.insert(\'&zacute;\', {inputmode: 1})'},
{id: 'Popup_Latin2_124',    view: '&Zdot;',     command: '\\Zdot',  title: 'Zdot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&Zdot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_125',    view: '&zdot;',     command: '\\zdot',  title: 'zdot',  mathlevel: 4,   func: 'AssistHandler.insert(\'&zdot;\', {inputmode: 1})'},
{id: 'Popup_Latin2_126',    view: '&Zcaron;',   command: '\\Zcheck',    title: 'Zcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&Zcaron;\', {inputmode: 1})'},
{id: 'Popup_Latin2_127',    view: '&zcaron;',   command: '\\zcheck',    title: 'zcheck',    mathlevel: 4,   func: 'AssistHandler.insert(\'&zcaron;\', {inputmode: 1})'},
        ],

        /*-------------------------------------------------------------*/
        /* 数式フォント */
        /*-------------------------------------------------------------*/
        'German' : [
            {id: 'Popup_German_1',  view: '<math><mi mathvariant=\'fraktur\'>A</mi></math>',  command: '\\frakA',     title: 'frakA',     mathlevel: 3,   func: 'AssistHandler.insert(\'A\', {font: \'frak\'})'},
            {id: 'Popup_German_2',  view: '<math><mi mathvariant=\'fraktur\'>B</mi></math>',  command: '\\frakB',     title: 'frakB',     mathlevel: 3,   func: 'AssistHandler.insert(\'B\', {font: \'frak\'})'},
            {id: 'Popup_German_3',  view: '<math><mi mathvariant=\'fraktur\'>C</mi></math>',  command: '\\frakC',     title: 'frakC',     mathlevel: 3,   func: 'AssistHandler.insert(\'C\', {font: \'frak\'})'},
            {id: 'Popup_German_4',  view: '<math><mi mathvariant=\'fraktur\'>D</mi></math>',  command: '\\frakD',     title: 'frakD',     mathlevel: 3,   func: 'AssistHandler.insert(\'D\', {font: \'frak\'})'},
            {id: 'Popup_German_5',  view: '<math><mi mathvariant=\'fraktur\'>E</mi></math>',  command: '\\frakE',     title: 'frakE',     mathlevel: 3,   func: 'AssistHandler.insert(\'E\', {font: \'frak\'})'},
            {id: 'Popup_German_6',  view: '<math><mi mathvariant=\'fraktur\'>F</mi></math>',  command: '\\frakF',     title: 'frakF',     mathlevel: 3,   func: 'AssistHandler.insert(\'F\', {font: \'frak\'})'},
            {id: 'Popup_German_7',  view: '<math><mi mathvariant=\'fraktur\'>G</mi></math>',  command: '\\frakG',     title: 'frakG',     mathlevel: 3,   func: 'AssistHandler.insert(\'G\', {font: \'frak\'})'},
            {id: 'Popup_German_8',  view: '<math><mi mathvariant=\'fraktur\'>H</mi></math>',  command: '\\frakH',     title: 'frakH',     mathlevel: 3,   func: 'AssistHandler.insert(\'H\', {font: \'frak\'})'},
            {id: 'Popup_German_9',  view: '<math><mi mathvariant=\'fraktur\'>I</mi></math>',  command: '\\frakI',     title: 'frakI',     mathlevel: 3,   func: 'AssistHandler.insert(\'I\', {font: \'frak\'})'},
            {id: 'Popup_German_10',     view: '<math><mi mathvariant=\'fraktur\'>J</mi></math>',  command: '\\frakJ',     title: 'frakJ',     mathlevel: 3,   func: 'AssistHandler.insert(\'J\', {font: \'frak\'})'},
            {id: 'Popup_German_11',     view: '<math><mi mathvariant=\'fraktur\'>K</mi></math>',  command: '\\frakK',     title: 'frakK',     mathlevel: 3,   func: 'AssistHandler.insert(\'K\', {font: \'frak\'})'},
            {id: 'Popup_German_12',     view: '<math><mi mathvariant=\'fraktur\'>L</mi></math>',  command: '\\frakL',     title: 'frakL',     mathlevel: 3,   func: 'AssistHandler.insert(\'L\', {font: \'frak\'})'},
            {id: 'Popup_German_13',     view: '<math><mi mathvariant=\'fraktur\'>M</mi></math>',  command: '\\frakM',     title: 'frakM',     mathlevel: 3,   func: 'AssistHandler.insert(\'M\', {font: \'frak\'})'},
            {id: 'Popup_German_14',     view: '<math><mi mathvariant=\'fraktur\'>N</mi></math>',  command: '\\frakN',     title: 'frakN',     mathlevel: 3,   func: 'AssistHandler.insert(\'N\', {font: \'frak\'})'},
            {id: 'Popup_German_15',     view: '<math><mi mathvariant=\'fraktur\'>O</mi></math>',  command: '\\frakO',     title: 'frakO',     mathlevel: 3,   func: 'AssistHandler.insert(\'O\', {font: \'frak\'})'},
            {id: 'Popup_German_16',     view: '<math><mi mathvariant=\'fraktur\'>P</mi></math>',  command: '\\frakP',     title: 'frakP',     mathlevel: 3,   func: 'AssistHandler.insert(\'P\', {font: \'frak\'})'},
            {id: 'Popup_German_17',     view: '<math><mi mathvariant=\'fraktur\'>Q</mi></math>',  command: '\\frakQ',     title: 'frakQ',     mathlevel: 3,   func: 'AssistHandler.insert(\'Q\', {font: \'frak\'})'},
            {id: 'Popup_German_18',     view: '<math><mi mathvariant=\'fraktur\'>R</mi></math>',  command: '\\frakR',     title: 'frakR',     mathlevel: 3,   func: 'AssistHandler.insert(\'R\', {font: \'frak\'})'},
            {id: 'Popup_German_19',     view: '<math><mi mathvariant=\'fraktur\'>S</mi></math>',  command: '\\frakS',     title: 'frakS',     mathlevel: 3,   func: 'AssistHandler.insert(\'S\', {font: \'frak\'})'},
            {id: 'Popup_German_20',     view: '<math><mi mathvariant=\'fraktur\'>T</mi></math>',  command: '\\frakT',     title: 'frakT',     mathlevel: 3,   func: 'AssistHandler.insert(\'T\', {font: \'frak\'})'},
            {id: 'Popup_German_21',     view: '<math><mi mathvariant=\'fraktur\'>U</mi></math>',  command: '\\frakU',     title: 'frakU',     mathlevel: 3,   func: 'AssistHandler.insert(\'U\', {font: \'frak\'})'},
            {id: 'Popup_German_22',     view: '<math><mi mathvariant=\'fraktur\'>V</mi></math>',  command: '\\frakV',     title: 'frakV',     mathlevel: 3,   func: 'AssistHandler.insert(\'V\', {font: \'frak\'})'},
            {id: 'Popup_German_23',     view: '<math><mi mathvariant=\'fraktur\'>W</mi></math>',  command: '\\frakW',     title: 'frakW',     mathlevel: 3,   func: 'AssistHandler.insert(\'W\', {font: \'frak\'})'},
            {id: 'Popup_German_24',     view: '<math><mi mathvariant=\'fraktur\'>X</mi></math>',  command: '\\frakX',     title: 'frakX',     mathlevel: 3,   func: 'AssistHandler.insert(\'X\', {font: \'frak\'})'},
            {id: 'Popup_German_25',     view: '<math><mi mathvariant=\'fraktur\'>Y</mi></math>',  command: '\\frakY',     title: 'frakY',     mathlevel: 3,   func: 'AssistHandler.insert(\'Y\', {font: \'frak\'})'},
            {id: 'Popup_German_26',     view: '<math><mi mathvariant=\'fraktur\'>Z</mi></math>',  command: '\\frakZ',     title: 'frakZ',     mathlevel: 3,   func: 'AssistHandler.insert(\'Z\', {font: \'frak\'})'},
            {id: 'Popup_German_27',     view: '<math><mi mathvariant=\'fraktur\'>a</mi></math>',  command: '\\fraka',     title: 'fraka',     mathlevel: 3,   func: 'AssistHandler.insert(\'a\', {font: \'frak\'})'},
            {id: 'Popup_German_28',     view: '<math><mi mathvariant=\'fraktur\'>b</mi></math>',  command: '\\frakb',     title: 'frakb',     mathlevel: 3,   func: 'AssistHandler.insert(\'b\', {font: \'frak\'})'},
            {id: 'Popup_German_29',     view: '<math><mi mathvariant=\'fraktur\'>c</mi></math>',  command: '\\frakc',     title: 'frakc',     mathlevel: 3,   func: 'AssistHandler.insert(\'c\', {font: \'frak\'})'},
            {id: 'Popup_German_30',     view: '<math><mi mathvariant=\'fraktur\'>d</mi></math>',  command: '\\frakd',     title: 'frakd',     mathlevel: 3,   func: 'AssistHandler.insert(\'d\', {font: \'frak\'})'},
            {id: 'Popup_German_31',     view: '<math><mi mathvariant=\'fraktur\'>e</mi></math>',  command: '\\frake',     title: 'frake',     mathlevel: 3,   func: 'AssistHandler.insert(\'e\', {font: \'frak\'})'},
            {id: 'Popup_German_32',     view: '<math><mi mathvariant=\'fraktur\'>f</mi></math>',  command: '\\frakf',     title: 'frakf',     mathlevel: 3,   func: 'AssistHandler.insert(\'f\', {font: \'frak\'})'},
            {id: 'Popup_German_33',     view: '<math><mi mathvariant=\'fraktur\'>g</mi></math>',  command: '\\frakg',     title: 'frakg',     mathlevel: 3,   func: 'AssistHandler.insert(\'g\', {font: \'frak\'})'},
            {id: 'Popup_German_34',     view: '<math><mi mathvariant=\'fraktur\'>h</mi></math>',  command: '\\frakh',     title: 'frakh',     mathlevel: 3,   func: 'AssistHandler.insert(\'h\', {font: \'frak\'})'},
            {id: 'Popup_German_35',     view: '<math><mi mathvariant=\'fraktur\'>i</mi></math>',  command: '\\fraki',     title: 'fraki',     mathlevel: 3,   func: 'AssistHandler.insert(\'i\', {font: \'frak\'})'},
            {id: 'Popup_German_36',     view: '<math><mi mathvariant=\'fraktur\'>j</mi></math>',  command: '\\frakj',     title: 'frakj',     mathlevel: 3,   func: 'AssistHandler.insert(\'j\', {font: \'frak\'})'},
            {id: 'Popup_German_37',     view: '<math><mi mathvariant=\'fraktur\'>k</mi></math>',  command: '\\frakk',     title: 'frakk',     mathlevel: 3,   func: 'AssistHandler.insert(\'k\', {font: \'frak\'})'},
            {id: 'Popup_German_38',     view: '<math><mi mathvariant=\'fraktur\'>l</mi></math>',  command: '\\frakl',     title: 'frakl',     mathlevel: 3,   func: 'AssistHandler.insert(\'l\', {font: \'frak\'})'},
            {id: 'Popup_German_39',     view: '<math><mi mathvariant=\'fraktur\'>m</mi></math>',  command: '\\frakm',     title: 'frakm',     mathlevel: 3,   func: 'AssistHandler.insert(\'m\', {font: \'frak\'})'},
            {id: 'Popup_German_40',     view: '<math><mi mathvariant=\'fraktur\'>n</mi></math>',  command: '\\frakn',     title: 'frakn',     mathlevel: 3,   func: 'AssistHandler.insert(\'n\', {font: \'frak\'})'},
            {id: 'Popup_German_41',     view: '<math><mi mathvariant=\'fraktur\'>o</mi></math>',  command: '\\frako',     title: 'frako',     mathlevel: 3,   func: 'AssistHandler.insert(\'o\', {font: \'frak\'})'},
            {id: 'Popup_German_42',     view: '<math><mi mathvariant=\'fraktur\'>p</mi></math>',  command: '\\frakp',     title: 'frakp',     mathlevel: 3,   func: 'AssistHandler.insert(\'p\', {font: \'frak\'})'},
            {id: 'Popup_German_43',     view: '<math><mi mathvariant=\'fraktur\'>q</mi></math>',  command: '\\frakq',     title: 'frakq',     mathlevel: 3,   func: 'AssistHandler.insert(\'q\', {font: \'frak\'})'},
            {id: 'Popup_German_44',     view: '<math><mi mathvariant=\'fraktur\'>r</mi></math>',  command: '\\frakr',     title: 'frakr',     mathlevel: 3,   func: 'AssistHandler.insert(\'r\', {font: \'frak\'})'},
            {id: 'Popup_German_45',     view: '<math><mi mathvariant=\'fraktur\'>s</mi></math>',  command: '\\fraks',     title: 'fraks',     mathlevel: 3,   func: 'AssistHandler.insert(\'s\', {font: \'frak\'})'},
            {id: 'Popup_German_46',     view: '<math><mi mathvariant=\'fraktur\'>t</mi></math>',  command: '\\frakt',     title: 'frakt',     mathlevel: 3,   func: 'AssistHandler.insert(\'t\', {font: \'frak\'})'},
            {id: 'Popup_German_47',     view: '<math><mi mathvariant=\'fraktur\'>u</mi></math>',  command: '\\fraku',     title: 'fraku',     mathlevel: 3,   func: 'AssistHandler.insert(\'u\', {font: \'frak\'})'},
            {id: 'Popup_German_48',     view: '<math><mi mathvariant=\'fraktur\'>v</mi></math>',  command: '\\frakv',     title: 'frakv',     mathlevel: 3,   func: 'AssistHandler.insert(\'v\', {font: \'frak\'})'},
            {id: 'Popup_German_49',     view: '<math><mi mathvariant=\'fraktur\'>w</mi></math>',  command: '\\frakw',     title: 'frakw',     mathlevel: 3,   func: 'AssistHandler.insert(\'w\', {font: \'frak\'})'},
            {id: 'Popup_German_50',     view: '<math><mi mathvariant=\'fraktur\'>x</mi></math>',  command: '\\frakx',     title: 'frakx',     mathlevel: 3,   func: 'AssistHandler.insert(\'x\', {font: \'frak\'})'},
            {id: 'Popup_German_51',     view: '<math><mi mathvariant=\'fraktur\'>y</mi></math>',  command: '\\fraky',     title: 'fraky',     mathlevel: 3,   func: 'AssistHandler.insert(\'y\', {font: \'frak\'})'},
            {id: 'Popup_German_52',     view: '<math><mi mathvariant=\'fraktur\'>z</mi></math>',  command: '\\frakz',     title: 'frakz',     mathlevel: 3,   func: 'AssistHandler.insert(\'z\', {font: \'frak\'})'},
        ],

        'Calligraphic' : [
            {id: 'Popup_Calligraphic_1',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>A</mi></math>',     command: '\\calA',  title: 'calA',  mathlevel: 2,   func: 'AssistHandler.insert(\'A\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_2',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>B</mi></math>',     command: '\\calB',  title: 'calB',  mathlevel: 2,   func: 'AssistHandler.insert(\'B\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_3',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>C</mi></math>',     command: '\\calC',  title: 'calC',  mathlevel: 2,   func: 'AssistHandler.insert(\'C\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_4',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>D</mi></math>',     command: '\\calD',  title: 'calD',  mathlevel: 2,   func: 'AssistHandler.insert(\'D\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_5',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>E</mi></math>',     command: '\\calE',  title: 'calE',  mathlevel: 2,   func: 'AssistHandler.insert(\'E\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_6',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>F</mi></math>',     command: '\\calF',  title: 'calF',  mathlevel: 2,   func: 'AssistHandler.insert(\'F\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_7',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>G</mi></math>',     command: '\\calG',  title: 'calG',  mathlevel: 2,   func: 'AssistHandler.insert(\'G\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_8',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>H</mi></math>',     command: '\\calH',  title: 'calH',  mathlevel: 2,   func: 'AssistHandler.insert(\'H\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_9',    view: '<math><mi mathvariant=\'-tex-caligraphic\'>I</mi></math>',     command: '\\calI',  title: 'calI',  mathlevel: 2,   func: 'AssistHandler.insert(\'I\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_10',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>J</mi></math>',     command: '\\calJ',  title: 'calJ',  mathlevel: 2,   func: 'AssistHandler.insert(\'J\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_11',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>K</mi></math>',     command: '\\calK',  title: 'calK',  mathlevel: 2,   func: 'AssistHandler.insert(\'K\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_12',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>L</mi></math>',     command: '\\calL',  title: 'calL',  mathlevel: 2,   func: 'AssistHandler.insert(\'L\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_13',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>M</mi></math>',     command: '\\calM',  title: 'calM',  mathlevel: 2,   func: 'AssistHandler.insert(\'M\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_14',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>N</mi></math>',     command: '\\calN',  title: 'calN',  mathlevel: 2,   func: 'AssistHandler.insert(\'N\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_15',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>O</mi></math>',     command: '\\calO',  title: 'calO',  mathlevel: 2,   func: 'AssistHandler.insert(\'O\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_16',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>P</mi></math>',     command: '\\calP',  title: 'calP',  mathlevel: 2,   func: 'AssistHandler.insert(\'P\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_17',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>Q</mi></math>',     command: '\\calQ',  title: 'calQ',  mathlevel: 2,   func: 'AssistHandler.insert(\'Q\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_18',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>R</mi></math>',     command: '\\calR',  title: 'calR',  mathlevel: 2,   func: 'AssistHandler.insert(\'R\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_19',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>S</mi></math>',     command: '\\calS',  title: 'calS',  mathlevel: 2,   func: 'AssistHandler.insert(\'S\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_20',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>T</mi></math>',     command: '\\calT',  title: 'calT',  mathlevel: 2,   func: 'AssistHandler.insert(\'T\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_21',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>U</mi></math>',     command: '\\calU',  title: 'calU',  mathlevel: 2,   func: 'AssistHandler.insert(\'U\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_22',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>V</mi></math>',     command: '\\calV',  title: 'calV',  mathlevel: 2,   func: 'AssistHandler.insert(\'V\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_23',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>W</mi></math>',     command: '\\calW',  title: 'calW',  mathlevel: 2,   func: 'AssistHandler.insert(\'W\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_24',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>X</mi></math>',     command: '\\calX',  title: 'calX',  mathlevel: 2,   func: 'AssistHandler.insert(\'X\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_25',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>Y</mi></math>',     command: '\\calY',  title: 'calY',  mathlevel: 2,   func: 'AssistHandler.insert(\'Y\', {font: \'cal\'})'},
            {id: 'Popup_Calligraphic_26',   view: '<math><mi mathvariant=\'-tex-caligraphic\'>Z</mi></math>',     command: '\\calZ',  title: 'calZ',  mathlevel: 2,   func: 'AssistHandler.insert(\'Z\', {font: \'cal\'})'},
        ],

        'Script' : [
            {id: 'Popup_Script_1',  view: '<math><mi mathvariant=\'script\'>A</mi></math>',   command: '\\scrA',  title: 'scrA',  mathlevel: 1,   func: 'AssistHandler.insert(\'A\', {font: \'scr\'})'},
            {id: 'Popup_Script_2',  view: '<math><mi mathvariant=\'script\'>B</mi></math>',   command: '\\scrB',  title: 'scrB',  mathlevel: 1,   func: 'AssistHandler.insert(\'B\', {font: \'scr\'})'},
            {id: 'Popup_Script_3',  view: '<math><mi mathvariant=\'script\'>C</mi></math>',   command: '\\scrC',  title: 'scrC',  mathlevel: 1,   func: 'AssistHandler.insert(\'C\', {font: \'scr\'})'},
            {id: 'Popup_Script_4',  view: '<math><mi mathvariant=\'script\'>D</mi></math>',   command: '\\scrD',  title: 'scrD',  mathlevel: 1,   func: 'AssistHandler.insert(\'D\', {font: \'scr\'})'},
            {id: 'Popup_Script_5',  view: '<math><mi mathvariant=\'script\'>E</mi></math>',   command: '\\scrE',  title: 'scrE',  mathlevel: 1,   func: 'AssistHandler.insert(\'E\', {font: \'scr\'})'},
            {id: 'Popup_Script_6',  view: '<math><mi mathvariant=\'script\'>F</mi></math>',   command: '\\scrF',  title: 'scrF',  mathlevel: 1,   func: 'AssistHandler.insert(\'F\', {font: \'scr\'})'},
            {id: 'Popup_Script_7',  view: '<math><mi mathvariant=\'script\'>G</mi></math>',   command: '\\scrG',  title: 'scrG',  mathlevel: 1,   func: 'AssistHandler.insert(\'G\', {font: \'scr\'})'},
            {id: 'Popup_Script_8',  view: '<math><mi mathvariant=\'script\'>H</mi></math>',   command: '\\scrH',  title: 'scrH',  mathlevel: 1,   func: 'AssistHandler.insert(\'H\', {font: \'scr\'})'},
            {id: 'Popup_Script_9',  view: '<math><mi mathvariant=\'script\'>I</mi></math>',   command: '\\scrI',  title: 'scrI',  mathlevel: 1,   func: 'AssistHandler.insert(\'I\', {font: \'scr\'})'},
            {id: 'Popup_Script_10',     view: '<math><mi mathvariant=\'script\'>J</mi></math>',   command: '\\scrJ',  title: 'scrJ',  mathlevel: 1,   func: 'AssistHandler.insert(\'J\', {font: \'scr\'})'},
            {id: 'Popup_Script_11',     view: '<math><mi mathvariant=\'script\'>K</mi></math>',   command: '\\scrK',  title: 'scrK',  mathlevel: 1,   func: 'AssistHandler.insert(\'K\', {font: \'scr\'})'},
            {id: 'Popup_Script_12',     view: '<math><mi mathvariant=\'script\'>L</mi></math>',   command: '\\scrL',  title: 'scrL',  mathlevel: 1,   func: 'AssistHandler.insert(\'L\', {font: \'scr\'})'},
            {id: 'Popup_Script_13',     view: '<math><mi mathvariant=\'script\'>M</mi></math>',   command: '\\scrM',  title: 'scrM',  mathlevel: 1,   func: 'AssistHandler.insert(\'M\', {font: \'scr\'})'},
            {id: 'Popup_Script_14',     view: '<math><mi mathvariant=\'script\'>N</mi></math>',   command: '\\scrN',  title: 'scrN',  mathlevel: 1,   func: 'AssistHandler.insert(\'N\', {font: \'scr\'})'},
            {id: 'Popup_Script_15',     view: '<math><mi mathvariant=\'script\'>O</mi></math>',   command: '\\scrO',  title: 'scrO',  mathlevel: 1,   func: 'AssistHandler.insert(\'O\', {font: \'scr\'})'},
            {id: 'Popup_Script_16',     view: '<math><mi mathvariant=\'script\'>P</mi></math>',   command: '\\scrP',  title: 'scrP',  mathlevel: 1,   func: 'AssistHandler.insert(\'P\', {font: \'scr\'})'},
            {id: 'Popup_Script_17',     view: '<math><mi mathvariant=\'script\'>Q</mi></math>',   command: '\\scrQ',  title: 'scrQ',  mathlevel: 1,   func: 'AssistHandler.insert(\'Q\', {font: \'scr\'})'},
            {id: 'Popup_Script_18',     view: '<math><mi mathvariant=\'script\'>R</mi></math>',   command: '\\scrR',  title: 'scrR',  mathlevel: 1,   func: 'AssistHandler.insert(\'R\', {font: \'scr\'})'},
            {id: 'Popup_Script_19',     view: '<math><mi mathvariant=\'script\'>S</mi></math>',   command: '\\scrS',  title: 'scrS',  mathlevel: 1,   func: 'AssistHandler.insert(\'S\', {font: \'scr\'})'},
            {id: 'Popup_Script_20',     view: '<math><mi mathvariant=\'script\'>T</mi></math>',   command: '\\scrT',  title: 'scrT',  mathlevel: 1,   func: 'AssistHandler.insert(\'T\', {font: \'scr\'})'},
            {id: 'Popup_Script_21',     view: '<math><mi mathvariant=\'script\'>U</mi></math>',   command: '\\scrU',  title: 'scrU',  mathlevel: 1,   func: 'AssistHandler.insert(\'U\', {font: \'scr\'})'},
            {id: 'Popup_Script_22',     view: '<math><mi mathvariant=\'script\'>V</mi></math>',   command: '\\scrV',  title: 'scrV',  mathlevel: 1,   func: 'AssistHandler.insert(\'V\', {font: \'scr\'})'},
            {id: 'Popup_Script_23',     view: '<math><mi mathvariant=\'script\'>W</mi></math>',   command: '\\scrW',  title: 'scrW',  mathlevel: 1,   func: 'AssistHandler.insert(\'W\', {font: \'scr\'})'},
            {id: 'Popup_Script_24',     view: '<math><mi mathvariant=\'script\'>X</mi></math>',   command: '\\scrX',  title: 'scrX',  mathlevel: 1,   func: 'AssistHandler.insert(\'X\', {font: \'scr\'})'},
            {id: 'Popup_Script_25',     view: '<math><mi mathvariant=\'script\'>Y</mi></math>',   command: '\\scrY',  title: 'scrY',  mathlevel: 1,   func: 'AssistHandler.insert(\'Y\', {font: \'scr\'})'},
            {id: 'Popup_Script_26',     view: '<math><mi mathvariant=\'script\'>Z</mi></math>',   command: '\\scrZ',  title: 'scrZ',  mathlevel: 1,   func: 'AssistHandler.insert(\'Z\', {font: \'scr\'})'},
        ],

        'BlackboardBold' : [
            {id: 'Popup_BlackboardBold_1',  view: '<math><mi mathvariant=\'double-struck\'>A</mi></math>',    command: '\\BbbA',  title: 'BbbA',  mathlevel: 2,   func: 'AssistHandler.insert(\'A\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_2',  view: '<math><mi mathvariant=\'double-struck\'>B</mi></math>',    command: '\\BbbB',  title: 'BbbB',  mathlevel: 2,   func: 'AssistHandler.insert(\'B\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_3',  view: '<math><mi mathvariant=\'double-struck\'>C</mi></math>',    command: '\\BbbC',  title: 'BbbC',  mathlevel: 2,   func: 'AssistHandler.insert(\'C\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_4',  view: '<math><mi mathvariant=\'double-struck\'>D</mi></math>',    command: '\\BbbD',  title: 'BbbD',  mathlevel: 2,   func: 'AssistHandler.insert(\'D\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_5',  view: '<math><mi mathvariant=\'double-struck\'>E</mi></math>',    command: '\\BbbE',  title: 'BbbE',  mathlevel: 2,   func: 'AssistHandler.insert(\'E\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_6',  view: '<math><mi mathvariant=\'double-struck\'>F</mi></math>',    command: '\\BbbF',  title: 'BbbF',  mathlevel: 2,   func: 'AssistHandler.insert(\'F\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_7',  view: '<math><mi mathvariant=\'double-struck\'>G</mi></math>',    command: '\\BbbG',  title: 'BbbG',  mathlevel: 2,   func: 'AssistHandler.insert(\'G\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_8',  view: '<math><mi mathvariant=\'double-struck\'>H</mi></math>',    command: '\\BbbH',  title: 'BbbH',  mathlevel: 2,   func: 'AssistHandler.insert(\'H\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_9',  view: '<math><mi mathvariant=\'double-struck\'>I</mi></math>',    command: '\\BbbI',  title: 'BbbI',  mathlevel: 2,   func: 'AssistHandler.insert(\'I\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_10',     view: '<math><mi mathvariant=\'double-struck\'>J</mi></math>',    command: '\\BbbJ',  title: 'BbbJ',  mathlevel: 2,   func: 'AssistHandler.insert(\'J\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_11',     view: '<math><mi mathvariant=\'double-struck\'>K</mi></math>',    command: '\\BbbK',  title: 'BbbK',  mathlevel: 2,   func: 'AssistHandler.insert(\'K\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_12',     view: '<math><mi mathvariant=\'double-struck\'>L</mi></math>',    command: '\\BbbL',  title: 'BbbL',  mathlevel: 2,   func: 'AssistHandler.insert(\'L\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_13',     view: '<math><mi mathvariant=\'double-struck\'>M</mi></math>',    command: '\\BbbM',  title: 'BbbM',  mathlevel: 2,   func: 'AssistHandler.insert(\'M\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_14',     view: '<math><mi mathvariant=\'double-struck\'>N</mi></math>',    command: '\\BbbN',  title: 'BbbN',  mathlevel: 2,   func: 'AssistHandler.insert(\'N\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_15',     view: '<math><mi mathvariant=\'double-struck\'>O</mi></math>',    command: '\\BbbO',  title: 'BbbO',  mathlevel: 2,   func: 'AssistHandler.insert(\'O\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_16',     view: '<math><mi mathvariant=\'double-struck\'>P</mi></math>',    command: '\\BbbP',  title: 'BbbP',  mathlevel: 2,   func: 'AssistHandler.insert(\'P\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_17',     view: '<math><mi mathvariant=\'double-struck\'>Q</mi></math>',    command: '\\BbbQ',  title: 'BbbQ',  mathlevel: 2,   func: 'AssistHandler.insert(\'Q\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_18',     view: '<math><mi mathvariant=\'double-struck\'>R</mi></math>',    command: '\\BbbR',  title: 'BbbR',  mathlevel: 2,   func: 'AssistHandler.insert(\'R\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_19',     view: '<math><mi mathvariant=\'double-struck\'>S</mi></math>',    command: '\\BbbS',  title: 'BbbS',  mathlevel: 2,   func: 'AssistHandler.insert(\'S\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_20',     view: '<math><mi mathvariant=\'double-struck\'>T</mi></math>',    command: '\\BbbT',  title: 'BbbT',  mathlevel: 2,   func: 'AssistHandler.insert(\'T\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_21',     view: '<math><mi mathvariant=\'double-struck\'>U</mi></math>',    command: '\\BbbU',  title: 'BbbU',  mathlevel: 2,   func: 'AssistHandler.insert(\'U\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_22',     view: '<math><mi mathvariant=\'double-struck\'>V</mi></math>',    command: '\\BbbV',  title: 'BbbV',  mathlevel: 2,   func: 'AssistHandler.insert(\'V\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_23',     view: '<math><mi mathvariant=\'double-struck\'>W</mi></math>',    command: '\\BbbW',  title: 'BbbW',  mathlevel: 2,   func: 'AssistHandler.insert(\'W\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_24',     view: '<math><mi mathvariant=\'double-struck\'>X</mi></math>',    command: '\\BbbX',  title: 'BbbX',  mathlevel: 2,   func: 'AssistHandler.insert(\'X\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_25',     view: '<math><mi mathvariant=\'double-struck\'>Y</mi></math>',    command: '\\BbbY',  title: 'BbbY',  mathlevel: 2,   func: 'AssistHandler.insert(\'Y\', {font: \'Bbb\'})'},
            {id: 'Popup_BlackboardBold_26',     view: '<math><mi mathvariant=\'double-struck\'>Z</mi></math>',    command: '\\BbbZ',  title: 'BbbZ',  mathlevel: 2,   func: 'AssistHandler.insert(\'Z\', {font: \'Bbb\'})'},
        ],

        'RelativeOperator' : [
{id: 'Popup_RelativeOperator_1',    view: '<',  command: '\\lt',    title: 'lt',    mathlevel: 1,   func: 'AssistHandler.insert(\'<\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_2',    view: '=',  command: '\\equal',     title: 'equal',     mathlevel: 1,   func: 'AssistHandler.insert(\'=\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_3',    view: '>',  command: '\\gt',    title: 'gt',    mathlevel: 1,   func: 'AssistHandler.insert(\'>\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_4',    view: '<math><mo>&in;</mo></math>',     command: '\\in',    title: 'in',    mathlevel: 2,   func: 'AssistHandler.insert(\'&in;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_5',    view: '<math><mo>&ni;</mo></math>',     command: '\\ni',    title: 'ni',    mathlevel: 3,   func: 'AssistHandler.insert(\'&ni;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_6',    view: '<math><mo>&subset;</mo></math>',     command: '\\subset',    title: 'subset',    mathlevel: 2,   func: 'AssistHandler.insert(\'&subset;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_7',    view: '<math><mo>&supset;</mo></math>',     command: '\\supset',    title: 'supset',    mathlevel: 2,   func: 'AssistHandler.insert(\'&supset;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_8',    view: '<math><mo>&Subset;</mo></math>',     command: '\\Subset',    title: 'Subset',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Subset;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_9',    view: '<math><mo>&Supset;</mo></math>',     command: '\\Supset',    title: 'Supset',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Supset;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_10',   view: '<math><mo>&leq;</mo></math>',    command: '\\leq', alias: '\\<=',    title: 'leq',   mathlevel: 2,   func: 'AssistHandler.insert(\'&leq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_11',   view: '<math><mo>&geq;</mo></math>',    command: '\\geq', alias: '\\>=',    title: 'geq',   mathlevel: 2,   func: 'AssistHandler.insert(\'&geq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_12',   view: '<math><mo>&leqq;</mo></math>',   command: '\\leqq', alias: '\\<==',  title: 'leqq',  mathlevel: 1,   func: 'AssistHandler.insert(\'&leqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_13',   view: '<math><mo>&geqq;</mo></math>',   command: '\\geqq', alias: '\\>==',  title: 'geqq',  mathlevel: 1,   func: 'AssistHandler.insert(\'&geqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_14',   view: '<math><mo>&ll;</mo></math>',     command: '\\ll', alias: '\\<<',     title: 'll',    mathlevel: 3,   func: 'AssistHandler.insert(\'&ll;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_15',   view: '<math><mo>&gg;</mo></math>',     command: '\\gg', alias: '\\<<',     title: 'gg',    mathlevel: 3,   func: 'AssistHandler.insert(\'&gg;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_16',   view: '<math><mo>&equiv;</mo></math>',  command: '\\equiv',     title: 'equiv',     mathlevel: 1,   func: 'AssistHandler.insert(\'&equiv;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_17',   view: '<math><mo>&doteqdot;</mo></math>',   command: '\\doteqdot',  title: 'doteqdot',  mathlevel: 1,   func: 'AssistHandler.insert(\'&doteqdot;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_18',   view: '<math><mo>&ne;</mo></math>',     command: '\\neq',   title: 'neq',   mathlevel: 1,   func: 'AssistHandler.insert(\'&ne;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_19',   view: '<math><mo>&nsub;</mo></math>',   command: '\\notsubset',     title: 'notsubset',     mathlevel: 3,   func: 'AssistHandler.insert(\'&nsub;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_20',   view: '<math><mo>&nsup;</mo></math>',   command: '\\notsupset',     title: 'notsupset',     mathlevel: 3,   func: 'AssistHandler.insert(\'&nsup;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_21',   view: '<math><mo>&notin;</mo></math>',  command: '\\notin',     title: 'notin',     mathlevel: 3,   func: 'AssistHandler.insert(\'&notin;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_22',   view: '<math><mo>&notni;</mo></math>',  command: '\\notni',     title: 'notni',     mathlevel: 3,   func: 'AssistHandler.insert(\'&notni;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_23',   view: '<math><mo>&sim;</mo></math>',    command: '\\sim',   title: 'sim',   mathlevel: 3,   func: 'AssistHandler.insert(\'&sim;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_24',   view: '<math><mo>&approx;</mo></math>',     command: '\\approx',    title: 'approx',    mathlevel: 3,   func: 'AssistHandler.insert(\'&approx;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_25',   view: '<math><mo>&simeq;</mo></math>',  command: '\\simeq',     title: 'simeq',     mathlevel: 3,   func: 'AssistHandler.insert(\'&simeq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_26',   view: '<math><mo>&cong;</mo></math>',   command: '\\cong',  title: 'cong',  mathlevel: 2,   func: 'AssistHandler.insert(\'&cong;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_27',   view: '<math><mo>&prec;</mo></math>',   command: '\\prec',  title: 'prec',  mathlevel: 4,   func: 'AssistHandler.insert(\'&prec;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_28',   view: '<math><mo>&succ;</mo></math>',   command: '\\succ',  title: 'succ',  mathlevel: 4,   func: 'AssistHandler.insert(\'&succ;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_29',   view: '<math><mo>&propto;</mo></math>',     command: '\\propto',    title: 'propto',    mathlevel: 1,   func: 'AssistHandler.insert(\'&propto;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_30',   view: '<math><mo>&parallel;</mo></math>',   command: '\\parallel',  title: 'parallel',  mathlevel: 1,   func: 'AssistHandler.insert(\'&parallel;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_31',   view: '<math><mo>&perp;</mo></math>',   command: '\\perp',  title: 'perp',  mathlevel: 1,   func: 'AssistHandler.insert(\'&perp;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_32',   view: '<math><mo>&vdash;</mo></math>',  command: '\\vdash',     title: 'vdash',     mathlevel: 4,   func: 'AssistHandler.insert(\'&vdash;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_33',   view: '<math><mo>&dashv;</mo></math>',  command: '\\dashv',     title: 'dashv',     mathlevel: 4,   func: 'AssistHandler.insert(\'&dashv;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_34',   view: '<math><mo>&triangleleft;</mo></math>',   command: '\\triangleleft',  title: 'triangleleft',  mathlevel: 4,   func: 'AssistHandler.insert(\'&triangleleft;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_35',   view: '<math><mo>&triangleright;</mo></math>',  command: '\\triangleright',     title: 'triangleright',     mathlevel: 4,   func: 'AssistHandler.insert(\'&triangleright;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_36',   view: '<math><mo>&risingdotseq;</mo></math>',   command: '\\risingdotseq',  title: 'risingdotseq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&risingdotseq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_37',   view: '<math><mo>&fallingdotseq;</mo></math>',  command: '\\fallingdotseq',     title: 'fallingdotseq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&fallingdotseq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_38',   view: '<math><mo>&subseteq;</mo></math>',   command: '\\subseteq',  title: 'subseteq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&subseteq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_39',   view: '<math><mo>&supseteq;</mo></math>',   command: '\\supseteq',  title: 'supseteq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&supseteq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_40',   view: '<math><mo>&subseteqq;</mo></math>',  command: '\\subseteqq',     title: 'subseteqq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&subseteqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_41',   view: '<math><mo>&supseteqq;</mo></math>',  command: '\\supseteqq',     title: 'supseteqq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&supseteqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_42',   view: '<math><mo>&subsetneq;</mo></math>',  command: '\\subsetnoteq',   title: 'subsetnoteq',   mathlevel: 4,   func: 'AssistHandler.insert(\'&subsetneq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_43',   view: '<math><mo>&supsetneq;</mo></math>',  command: '\\supsetnoteq',   title: 'supsetnoteq',   mathlevel: 4,   func: 'AssistHandler.insert(\'&supsetneq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_44',   view: '<math><mo>&subsetneqq;</mo></math>',     command: '\\subsetnoteqq',  title: 'subsetnoteqq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&subsetneqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_45',   view: '<math><mo>&supsetneqq;</mo></math>',     command: '\\supsetnoteqq',  title: 'supsetnoteqq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&supsetneqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_46',   view: '<math><mo>&preceq;</mo></math>',     command: '\\preceq',    title: 'preceq',    mathlevel: 4,   func: 'AssistHandler.insert(\'&preceq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_47',   view: '<math><mo>&succeq;</mo></math>',     command: '\\succeq',    title: 'succeq',    mathlevel: 4,   func: 'AssistHandler.insert(\'&succeq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_48',   view: '<math><mo>&models;</mo></math>',     command: '\\models',    title: 'models',    mathlevel: 4,   func: 'AssistHandler.insert(\'&models;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_49',   view: '<math><mo>&nsimeq;</mo></math>',     command: '\\notsimeq',  title: 'notsimeq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&nsimeq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_50',   view: '<math><mo>&nleq;</mo></math>',   command: '\\notleq',    title: 'notleq',    mathlevel: 4,   func: 'AssistHandler.insert(\'&nleq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_51',   view: '<math><mo>&ngeq;</mo></math>',   command: '\\notgeq',    title: 'notgeq',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ngeq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_52',   view: '<math><mo>&nleqq;</mo></math>',  command: '\\notleqq',   title: 'notleqq',   mathlevel: 4,   func: 'AssistHandler.insert(\'&nleqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_53',   view: '<math><mo>&ngeqq;</mo></math>',  command: '\\notgeqq',   title: 'notgeqq',   mathlevel: 4,   func: 'AssistHandler.insert(\'&ngeqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_54',   view: '<math><mo>&nequiv;</mo></math>',     command: '\\notequiv',  title: 'notequiv',  mathlevel: 3,   func: 'AssistHandler.insert(\'&nequiv;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_55',   view: '<math><mo>&lessgtr;</mo></math>',    command: '\\lessgtr',   title: 'lessgtr',   mathlevel: 4,   func: 'AssistHandler.insert(\'&lessgtr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_56',   view: '<math><mo>&gtrless;</mo></math>',    command: '\\gtrless',   title: 'gtrless',   mathlevel: 4,   func: 'AssistHandler.insert(\'&gtrless;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_57',   view: '<math><mo>&ncong;</mo></math>',  command: '\\notcong',   title: 'notcong',   mathlevel: 4,   func: 'AssistHandler.insert(\'&ncong;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_58',   view: '<math><mo>&pitchfork;</mo></math>',  command: '\\varpitchfork',  title: 'varpitchfork',  mathlevel: 4,   func: 'AssistHandler.insert(\'&pitchfork;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_59',   view: '<math><mo>&lessapprox;</mo></math>',     command: '\\lessapprox',    title: 'lessapprox',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lessapprox;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_60',   view: '<math><mo>&gtrapprox;</mo></math>',  command: '\\gtrapprox',     title: 'gtrapprox',     mathlevel: 4,   func: 'AssistHandler.insert(\'&gtrapprox;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_61',   view: '<math><mo>&smile;</mo></math>',  command: '\\smile',     title: 'smile',     mathlevel: 4,   func: 'AssistHandler.insert(\'&smile;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_62',   view: '<math><mo>&frown;</mo></math>',  command: '\\frown',     title: 'frown',     mathlevel: 4,   func: 'AssistHandler.insert(\'&frown;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_63',   view: '<math><mo>&asymp;</mo></math>',  command: '\\asymp',     title: 'asymp',     mathlevel: 4,   func: 'AssistHandler.insert(\'&asymp;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_64',   view: '<math><mo>&nmid;</mo></math>',   command: '\\nmid',  title: 'nmid',  mathlevel: 3,   func: 'AssistHandler.insert(\'&nmid;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_65',   view: '<math><mo>&nsubseteq;</mo></math>',  command: '\\nsubseteq',     title: 'nsubseteq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&nsubseteq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_66',   view: '<math><mo>&nsupseteq;</mo></math>',  command: '\\nsupseteq',     title: 'nsupseteq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&nsupseteq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_67',   view: '<math><mo>&#x2226;</mo></math>',     command: '\\notparallel',   title: 'notparallel',   mathlevel: 4,   func: 'AssistHandler.insert(\'&#x2226;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_68',   view: '<math><mo>&nprec;</mo></math>',  command: '\\nprec',     title: 'nprec',     mathlevel: 4,   func: 'AssistHandler.insert(\'&nprec;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_69',   view: '<math><mo>&nsucc;</mo></math>',  command: '\\nsucc',     title: 'nsucc',     mathlevel: 4,   func: 'AssistHandler.insert(\'&nsucc;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_70',   view: '<math><mo>&lesseqgtr;</mo></math>',  command: '\\lesseqgtr',     title: 'lesseqgtr',     mathlevel: 4,   func: 'AssistHandler.insert(\'&lesseqgtr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_71',   view: '<math><mo>&gtreqless;</mo></math>',  command: '\\gtreqless',     title: 'gtreqless',     mathlevel: 4,   func: 'AssistHandler.insert(\'&gtreqless;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_72',   view: '<math><mo>&lesseqqgtr;</mo></math>',     command: '\\lesseqqgtr',    title: 'lesseqqgtr',    mathlevel: 4,   func: 'AssistHandler.insert(\'&lesseqqgtr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_73',   view: '<math><mo>&gtreqqless;</mo></math>',     command: '\\gtreqqless',    title: 'gtreqqless',    mathlevel: 4,   func: 'AssistHandler.insert(\'&gtreqqless;\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_RelativeOperator_74',   view: '<img src="mathimage/ul.png" height="20">',  command: '\\underleftarrowsim',     title: 'underleftarrowsim',     mathlevel: 4,   func: 'AssistHandler.insert(\'<munder accent=\\\'true\\\'><mo>&sim;</mo><mo>&larr;</mo></munder>\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_RelativeOperator_75',   view: '<img src="mathimage/ur.png" height="20">',  command: '\\underrightarrowsim',    title: 'underrightarrowsim',    mathlevel: 4,   func: 'AssistHandler.insert(\'<munder accent=\\\'true\\\'><mo>&sim;</mo><mo>&rarr;</mo></munder>\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_76',   view: '<math><mo>&lneq;</mo></math>',   command: '\\lneq',  title: 'lneq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&lneq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_77',   view: '<math><mo>&gneq;</mo></math>',   command: '\\gneq',  title: 'gneq',  mathlevel: 4,   func: 'AssistHandler.insert(\'&gneq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_78',   view: '<math><mo>&lneqq;</mo></math>',  command: '\\lneqq',     title: 'lneqq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&lneqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_79',   view: '<math><mo>&gneqq;</mo></math>',  command: '\\gneqq',     title: 'gneqq',     mathlevel: 4,   func: 'AssistHandler.insert(\'&gneqq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_80',   view: '<math><mo>&#x223D</mo></math>',  command: '\\similar',   title: 'similar',   mathlevel: 1,   func: 'AssistHandler.insert(\'&#x223D\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_81',   view: '<math><mo>&sqsubset;</mo></math>',   command: '\\sqsubset',  title: 'sqsubset',  mathlevel: 4,   func: 'AssistHandler.insert(\'&sqsubset;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_82',   view: '<math><mo>&sqsupset;</mo></math>',   command: '\\sqsupset',  title: 'sqsupset',  mathlevel: 4,   func: 'AssistHandler.insert(\'&sqsupset;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_83',   view: '<math><mo>&sqsubseteq;</mo></math>',     command: '\\sqsubseteq',    title: 'sqsubseteq',    mathlevel: 4,   func: 'AssistHandler.insert(\'&sqsubseteq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_84',   view: '<math><mo>&sqsupseteq;</mo></math>',     command: '\\sqsupseteq',    title: 'sqsupseteq',    mathlevel: 4,   func: 'AssistHandler.insert(\'&sqsupseteq;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_RelativeOperator_85',   view: '<math><mo>&top;</mo></math>',    command: '\\top',   title: 'top',   mathlevel: 4,   func: 'AssistHandler.insert(\'&top;\', {inputmode:2, normalonly:true})'},
        ],

        'BinaryOperator' : [
{id: 'Popup_BinaryOperator_1',  view: '<math><mo>&amp;</mo></math>',    command: '\\ampersand',     title: 'ampersand',     mathlevel: 2,   func: 'AssistHandler.insert(\'&amp;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_2',  view: '<math><mo>&ast;</mo></math>',    command: '\\ast',   title: 'ast',   mathlevel: 1,   func: 'AssistHandler.insert(\'&ast;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_3',  view: '<math><mo>&plus;</mo></math>',   command: '\\plus',  title: 'plus',  mathlevel: 1,   func: 'AssistHandler.insert(\'&plus;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_4',  view: '<math><mo>&minus;</mo></math>',  command: '\\minus',     title: 'minus',     mathlevel: 1,   func: 'AssistHandler.insert(\'&minus;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_5',  view: '<math><mo>/</mo></math>',    command: '\\slash',     title: 'slash',     mathlevel: 1,   func: 'AssistHandler.insert(\'/\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_6',  view: '<math><mo>&Backslash;</mo></math>',  command: '\\backslash',     title: 'backslash',     mathlevel: 2,   func: 'AssistHandler.insert(\'&Backslash;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_7',  view: '<math><mo>&pm;</mo></math>',     command: '\\pm', alias: '\\+-',     title: 'pm',    mathlevel: 1,   func: 'AssistHandler.insert(\'&pm;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_8',  view: '<math><mo>&mp;</mo></math>',     command: '\\mp', alias: '\\-+',     title: 'mp',    mathlevel: 2,   func: 'AssistHandler.insert(\'&mp;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_9',  view: '<math><mo>&times;</mo></math>',  command: '\\times',     title: 'times',     mathlevel: 1,   func: 'AssistHandler.insert(\'&times;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_10',     view: '<math><mo>&div;</mo></math>',    command: '\\div',   title: 'div',   mathlevel: 1,   func: 'AssistHandler.insert(\'&div;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_11',     view: '<math><mo>&oplus;</mo></math>',  command: '\\oplus',     title: 'oplus',     mathlevel: 2,   func: 'AssistHandler.insert(\'&oplus;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_12',     view: '<math><mo>&ominus;</mo></math>',     command: '\\ominus',    title: 'ominus',    mathlevel: 2,   func: 'AssistHandler.insert(\'&ominus;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_13',     view: '<math><mo>&otimes;</mo></math>',     command: '\\otimes',    title: 'otimes',    mathlevel: 3,   func: 'AssistHandler.insert(\'&otimes;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_14',     view: '<math><mo>&cup;</mo></math>',    command: '\\cup',   title: 'cup',   mathlevel: 2,   func: 'AssistHandler.insert(\'&cup;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_15',     view: '<math><mo>&cap;</mo></math>',    command: '\\cap',   title: 'cap',   mathlevel: 2,   func: 'AssistHandler.insert(\'&cap;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_16',     view: '<math><mo>&vee;</mo></math>',    command: '\\vee',   title: 'vee',   mathlevel: 4,   func: 'AssistHandler.insert(\'&vee;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_17',     view: '<math><mo>&wedge;</mo></math>',  command: '\\wedge',     title: 'wedge',     mathlevel: 4,   func: 'AssistHandler.insert(\'&wedge;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_18',     view: '<math><mo>&sqcup;</mo></math>',  command: '\\sqcup',     title: 'sqcup',     mathlevel: 3,   func: 'AssistHandler.insert(\'&sqcup;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_19',     view: '<math><mo>&sqcap;</mo></math>',  command: '\\sqcap',     title: 'sqcap',     mathlevel: 3,   func: 'AssistHandler.insert(\'&sqcap;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_20',     view: '<math><mo>&dotplus;</mo></math>',    command: '\\dotplus',   title: 'dotplus',   mathlevel: 3,   func: 'AssistHandler.insert(\'&dotplus;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_21',     view: '<math><mo>&ltimes;</mo></math>',     command: '\\ltimes',    title: 'ltimes',    mathlevel: 4,   func: 'AssistHandler.insert(\'&ltimes;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_22',     view: '<math><mo>&rtimes;</mo></math>',     command: '\\rtimes',    title: 'rtimes',    mathlevel: 4,   func: 'AssistHandler.insert(\'&rtimes;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_23',     view: '<math><mo>&bigodot;</mo></math>',    command: '\\bigodot',   title: 'bigodot',   mathlevel: 4,   func: 'AssistHandler.insert(\'&bigodot;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_24',     view: '<math><mo>&circ;</mo></math>',   command: '\\Hat',   title: 'Hat',   mathlevel: 3,   func: 'AssistHandler.insert(\'&circ;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_BinaryOperator_25',     view: '<math><mo>&ring;</mo></math>',   command: '\\circ',  title: 'circ',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ring;\', {inputmode:2, normalonly:true})'},
                            ],

        'Arrow' : [
{id: 'Popup_Arrow_1',   view: '<math><mo>&larr;</mo></math>',   command: '\\leftarrow',     title: 'leftarrow',     mathlevel: 1,   func: 'AssistHandler.insert(\'&larr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_2',   view: '<math><mo>&rarr;</mo></math>',   command: '\\rightarrow',    title: 'rightarrow',    mathlevel: 1,   func: 'AssistHandler.insert(\'&rarr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_3',   view: '<math><mo>&lArr;</mo></math>',   command: '\\Leftarrow',     title: 'Leftarrow',     mathlevel: 1,   func: 'AssistHandler.insert(\'&lArr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_4',   view: '<math><mo>&rArr;</mo></math>',   command: '\\Rightarrow',    title: 'Rightarrow',    mathlevel: 1,   func: 'AssistHandler.insert(\'&rArr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_5',   view: '<math><mo>&harr;</mo></math>',   command: '\\leftrightarrow',    title: 'leftrightarrow',    mathlevel: 1,   func: 'AssistHandler.insert(\'&harr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_6',   view: '<math><mo>&hArr;</mo></math>',   command: '\\Leftrightarrow',    title: 'Leftrightarrow',    mathlevel: 1,   func: 'AssistHandler.insert(\'&hArr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_7',   view: '<math><mo>&uarr;</mo></math>',   command: '\\uparrow',   title: 'uparrow',   mathlevel: 1,   func: 'AssistHandler.insert(\'&uarr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_8',   view: '<math><mo>&darr;</mo></math>',   command: '\\downarrow',     title: 'downarrow',     mathlevel: 1,   func: 'AssistHandler.insert(\'&darr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_9',   view: '<math><mo>&uArr;</mo></math>',   command: '\\Uparrow',   title: 'Uparrow',   mathlevel: 1,   func: 'AssistHandler.insert(\'&uArr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_10',  view: '<math><mo>&dArr;</mo></math>',   command: '\\Downarrow',     title: 'Downarrow',     mathlevel: 1,   func: 'AssistHandler.insert(\'&dArr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_11',  view: '<math><mo>&searr;</mo></math>',  command: '\\searrow',   title: 'searrow',   mathlevel: 1,   func: 'AssistHandler.insert(\'&searr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_12',  view: '<math><mo>&nearr;</mo></math>',  command: '\\nearrow',   title: 'nearrow',   mathlevel: 1,   func: 'AssistHandler.insert(\'&nearr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_13',  view: '<math><mo>&swarr;</mo></math>',  command: '\\swarrow',   title: 'swarrow',   mathlevel: 1,   func: 'AssistHandler.insert(\'&swarr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_14',  view: '<math><mo>&nwarr;</mo></math>',  command: '\\nwarrow',   title: 'nwarrow',   mathlevel: 1,   func: 'AssistHandler.insert(\'&nwarr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_15',  view: '<math><mo>&map;</mo></math>',    command: '\\mapsto',    title: 'mapsto',    mathlevel: 1,   func: 'AssistHandler.insert(\'&map;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_16',  view: '<math><mo>&rarrhk;</mo></math>',     command: '\\hookrightarrow',    title: 'hookrightarrow',    mathlevel: 3,   func: 'AssistHandler.insert(\'&rarrhk;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_17',  view: '<math><mo>&rlarr;</mo></math>',  command: '\\rightleftarrows',   title: 'rightleftarrows',   mathlevel: 3,   func: 'AssistHandler.insert(\'&rlarr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_18',  view: '<math><mo>&lrarr;</mo></math>',  command: '\\leftrightarrows',   title: 'leftrightarrows',   mathlevel: 3,   func: 'AssistHandler.insert(\'&lrarr;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_19',  view: '<math><mo>&xlarr;</mo></math>',  command: '\\xleftarrow',    title: '左矢印 (伸縮可)',     mathlevel: 2,   func: 'AssistHandler.insert(\'&xlarr;\', {type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Arrow_20',  view: '<math><mo>&xrarr;</mo></math>',  command: '\\xrightarrow',   title: '右矢印 (伸縮可)',     mathlevel: 2,   func: 'AssistHandler.insert(\'&xrarr;\', {type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Arrow_21',  view: '<math><mo>&xlArr;</mo></math>',  command: '\\Xleftarrow',    title: '左二重矢印 (伸縮可)',   mathlevel: 3,   func: 'AssistHandler.insert(\'&xlArr;\', {type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Arrow_22',  view: '<math><mo>&xrArr;</mo></math>',  command: '\\Xrightarrow',   title: '右二重矢印 (伸縮可)',   mathlevel: 3,   func: 'AssistHandler.insert(\'&xrArr;\', {type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Arrow_23',  view: '<math><mo>&xharr;</mo></math>',  command: '\\xleftrightarrow',   title: '左右矢印 (伸縮可)',    mathlevel: 1,   func: 'AssistHandler.insert(\'&xharr;\', {type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Arrow_24',  view: '<math><mo>&xhArr;</mo></math>',  command: '\\Xleftrightarrow',   title: '左右二重矢印 (伸縮可)',  mathlevel: 1,   func: 'AssistHandler.insert(\'&xhArr;\', {type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Arrow_25',  view: '<math><mo>&lharu;</mo></math>',  command: '\\leftharpoonup',     title: 'leftharpoonup',     mathlevel: 4,   func: 'AssistHandler.insert(\'&lharu;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_26',  view: '<math><mo>&rharu;</mo></math>',  command: '\\rightharpoonup',    title: 'rightharpoonup',    mathlevel: 4,   func: 'AssistHandler.insert(\'&rharu;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_27',  view: '<math><mo>&lhard;</mo></math>',  command: '\\leftharpoondown',   title: 'leftharpoondown',   mathlevel: 4,   func: 'AssistHandler.insert(\'&lhard;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_28',  view: '<math><mo>&rhard;</mo></math>',  command: '\\rightharpoondown',  title: 'rightharpoondown',  mathlevel: 4,   func: 'AssistHandler.insert(\'&rhard;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_29',  view: '<math><mo>&lrhar;</mo></math>',  command: '\\leftrightharpoons',     title: 'leftrightharpoons',     mathlevel: 4,   func: 'AssistHandler.insert(\'&lrhar;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_30',  view: '<math><mo>&rlhar;</mo></math>',  command: '\\rightleftharpoons',     title: 'rightleftharpoons',     mathlevel: 4,   func: 'AssistHandler.insert(\'&rlhar;\', {inputmode:2, normalonly:true})'},
{id: 'Popup_Arrow_31',  view: '<math><mo>&larrhk;</mo></math>',     command: '\\hookleftarrow',     title: 'hookleftarrow',     mathlevel: 4,   func: 'AssistHandler.insert(\'&larrhk;\', {inputmode:2, normalonly:true})'},
                   ],

        'Parenthesis' : [
        {id: 'Popup_Parenthesis_1',     view: '|',  command: '\\vert',  title: 'vert',  mathlevel: 2,   func: 'AssistHandler.insert(\'|\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_2',     view: '&Vert;',     command: '\\Vert',  title: 'Vert',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Vert;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_3',     view: '(',  command: '\\leftpar',   title: 'leftpar',   mathlevel: 1,   func: 'AssistHandler.insert(\'(\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_4',     view: ')',  command: '\\rightpar',  title: 'rightpar',  mathlevel: 1,   func: 'AssistHandler.insert(\')\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_5',     view: '{',  command: '\\middleleftpar',     title: 'middleleftpar',     mathlevel: 1,   func: 'AssistHandler.insert(\'{\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_6',     view: '}',  command: '\\middlerightpar',    title: 'middlerightpar',    mathlevel: 1,   func: 'AssistHandler.insert(\'}\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_7',     view: '[',  command: '\\bigleftpar',    title: 'bigleftpar',    mathlevel: 1,   func: 'AssistHandler.insert(\'[\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_8',     view: ']',  command: '\\bigrightpar',   title: 'bigrightpar',   mathlevel: 1,   func: 'AssistHandler.insert(\']\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_9',     view: '&ulcorner;',     command: '\\ulcorner',  title: 'ulcorner',  mathlevel: 4,   func: 'AssistHandler.insert(\'&ulcorner;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_10',    view: '&urcorner;',     command: '\\urcorner',  title: 'urcorner',  mathlevel: 4,   func: 'AssistHandler.insert(\'&urcorner;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_11',    view: '&llcorner;',     command: '\\llcorner',  title: 'llcorner',  mathlevel: 4,   func: 'AssistHandler.insert(\'&llcorner;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_12',    view: '&lrcorner;',     command: '\\lrcorner',  title: 'lrcorner',  mathlevel: 4,   func: 'AssistHandler.insert(\'&lrcorner;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_13',    view: '&lfloor;',   command: '\\lfloor',    title: 'lfloor',    mathlevel: 3,   func: 'AssistHandler.insert(\'&lfloor;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_14',    view: '&rfloor;',   command: '\\rfloor',    title: 'rfloor',    mathlevel: 3,   func: 'AssistHandler.insert(\'&rfloor;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_15',    view: '&lceil;',    command: '\\lceil',     title: 'lceil',     mathlevel: 3,   func: 'AssistHandler.insert(\'&lceil;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_16',    view: '&rceil;',    command: '\\rceil',     title: 'rceil',     mathlevel: 3,   func: 'AssistHandler.insert(\'&rceil;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_17',    view: '&langle;',   command: '\\langle',    title: 'langle',    mathlevel: 3,   func: 'AssistHandler.insert(\'&langle;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_18',    view: '&rangle;',   command: '\\rangle',    title: 'rangle',    mathlevel: 3,   func: 'AssistHandler.insert(\'&rangle;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_19',    view: '&laquo;',    command: '\\LeftDoubleAngleQuotation',  title: 'LeftDoubleAngleQuotation',  mathlevel: 1,   func: 'AssistHandler.insert(\'&laquo;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_20',    view: '&raquo;',    command: '\\RightDoubleAngleQuotation',     title: 'RightDoubleAngleQuotation',     mathlevel: 1,   func: 'AssistHandler.insert(\'&raquo;\', {normalonly: true})'},
        {id: 'Popup_Parenthesis_21',    view: '<math><mo>&#x23DF</mo></math>',  command: '\\underbrace',    title: 'underbrace',    mathlevel: 3,   func: 'AssistHandler.insert(\'&#x23DF\', {type: LAYOUT_NODE_TYPE.UNDERLINE})'},
        {id: 'Popup_Parenthesis_22',    view: '<math><mo>&#x23DE</mo></math>',  command: '\\overbrace',     title: 'overbrace',     mathlevel: 3,   func: 'AssistHandler.insert(\'&#x23DE\', {type: LAYOUT_NODE_TYPE.OVER})'},
             ],

        'OtherSymbols' : [
{id: 'Popup_OtherSymbols_1',    view: '<math><mo>!</mo></math>',    command: '\\exclamation',   title: 'exclamation',   mathlevel: 1,   func: 'AssistHandler.insert(\'!\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_2',    view: '<math><mo>&sharp;</mo></math>',  command: '\\sharp',     title: 'sharp',     mathlevel: 1,   func: 'AssistHandler.insert(\'&sharp;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_3',    view: '<math><mo>&dollar;</mo></math>',     command: '\\doller',    title: 'doller',    mathlevel: 1,   func: 'AssistHandler.insert(\'&dollar;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_4',    view: '<math><mo>&percnt;</mo></math>',     command: '\\parcent',   title: 'parcent',   mathlevel: 1,   func: 'AssistHandler.insert(\'&percnt;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_5',    view: '<math><mo>?</mo></math>',    command: '\\question',  title: 'question',  mathlevel: 1,   func: 'AssistHandler.insert(\'?\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_6',    view: '<math><mo>@</mo></math>',    command: '\\atmark',    title: 'atmark',    mathlevel: 1,   func: 'AssistHandler.insert(\'@\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_7',    view: '<math><mo>&yen;</mo></math>',    command: '\\yen',   title: 'yen',   mathlevel: 1,   func: 'AssistHandler.insert(\'&yen;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_8',    view: '<math><mo>_</mo></math>',    command: '\\lowline',   title: 'lowline',   mathlevel: 1,   func: 'AssistHandler.insert(\'_\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_9',    view: '<math><mo>&infin;</mo></math>',  command: '\\infty',     title: 'infty',     mathlevel: 2,   func: 'AssistHandler.insert(\'&infin;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_10',   view: '<math><mo>&PartialD;</mo></math>',   command: '\\partial',   title: 'partial',   mathlevel: 3,   func: 'AssistHandler.insert(\'&PartialD;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_11',   view: '<math><mo>&nabla;</mo></math>',  command: '\\nabla',     title: 'nabla',     mathlevel: 3,   func: 'AssistHandler.insert(\'&nabla;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_12',   view: '<math><mo>&ell;</mo></math>',    command: '\\ell',   title: 'ell',   mathlevel: 1,   func: 'AssistHandler.insert(\'&ell;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_13',   view: '<math><mo>&hslash;</mo></math>',     command: '\\hslash',    title: 'hslash',    mathlevel: 3,   func: 'AssistHandler.insert(\'&hslash;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_14',   view: '<math><mo>&Re;</mo></math>',     command: '\\re',    title: 're',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Re;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_15',   view: '<math><mo>&Im;</mo></math>',     command: '\\im',    title: 'im',    mathlevel: 3,   func: 'AssistHandler.insert(\'&Im;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_16',   view: '<math><mo>&aleph;</mo></math>',  command: '\\aleph',     title: 'aleph',     mathlevel: 3,   func: 'AssistHandler.insert(\'&aleph;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_17',   view: '<math><mo>&emptyv;</mo></math>',     command: '\\emptyset',  title: 'emptyset',  mathlevel: 3,   func: 'AssistHandler.insert(\'&emptyv;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_18',   view: '<math><mo>&ForAll;</mo></math>',     command: '\\forall',    title: 'forall',    mathlevel: 2,   func: 'AssistHandler.insert(\'&ForAll;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_19',   view: '<math><mo>&Exists;</mo></math>',     command: '\\exists',    title: 'exists',    mathlevel: 2,   func: 'AssistHandler.insert(\'&Exists;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_20',   view: '<math><mo>&not;</mo></math>',    command: '\\neg',   title: 'neg',   mathlevel: 4,   func: 'AssistHandler.insert(\'&not;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_21',   view: '<math><mo>&angle;</mo></math>',  command: '\\angle',     title: 'angle',     mathlevel: 1,   func: 'AssistHandler.insert(\'&angle;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_22',   view: '<math><mo>&triangle;</mo></math>',   command: '\\triangle',  title: 'triangle',  mathlevel: 1,   func: 'AssistHandler.insert(\'&triangle;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_23',   view: '<math><mo>&square;</mo></math>',     command: '\\square',    title: 'square',    mathlevel: 1,   func: 'AssistHandler.insert(\'&square;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_24',   view: '<math><mo>&fltns;</mo></math>',  command: '\\parallelogram',     title: 'parallelogram',     mathlevel: 1,   func: 'AssistHandler.insert(\'&fltns;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_25',   view: '<math><mo>&squarf;</mo></math>',     command: '\\blacksquare',   title: 'blacksquare',   mathlevel: 1,   func: 'AssistHandler.insert(\'&squarf;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_26',   view: '<math><mo>&sect;</mo></math>',   command: '\\section',   title: 'section',   mathlevel: 2,   func: 'AssistHandler.insert(\'&sect;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_27',   view: '<math><mo>&dagger;</mo></math>',     command: '\\dagger',    title: 'dagger',    mathlevel: 3,   func: 'AssistHandler.insert(\'&dagger;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_28',   view: '<math><mo>&Dagger;</mo></math>',     command: '\\ddagger',   title: 'ddagger',   mathlevel: 3,   func: 'AssistHandler.insert(\'&Dagger;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_29',   view: '<math><mo>&para;</mo></math>',   command: '\\KnuthP',    title: 'KnuthP',    mathlevel: 4,   func: 'AssistHandler.insert(\'&para;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_30',   view: '<math><mo>&flat;</mo></math>',   command: '\\flat',  title: 'flat',  mathlevel: 4,   func: 'AssistHandler.insert(\'&flat;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_31',   view: '<math><mo>&natur;</mo></math>',  command: '\\natural',   title: 'natural',   mathlevel: 4,   func: 'AssistHandler.insert(\'&natur;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_32',   view: '<math><mo>&copy;</mo></math>',   command: '\\copyright',     title: 'copyright',     mathlevel: 1,   func: 'AssistHandler.insert(\'&copy;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_33',   view: '<math><mo>&wp;</mo></math>',     command: '\\wp',    title: 'wp',    mathlevel: 4,   func: 'AssistHandler.insert(\'&wp;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_34',   view: '<math><mo>&Star;</mo></math>',   command: '\\star',  title: 'star',  mathlevel: 1,   func: 'AssistHandler.insert(\'&Star;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_35',   view: '<math><mo>&dash;</mo></math>',   command: '\\hyphen',    title: 'hyphen',    mathlevel: 1,   func: 'AssistHandler.insert(\'&dash;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_36',   view: '<math><mo>&mdash;</mo></math>',  command: '\\longhyphen',    title: 'longhyphen',    mathlevel: 1,   func: 'AssistHandler.insert(\'&mdash;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_37',   view: '<math><mo>&hbar;</mo></math>',   command: '\\hbar',  title: 'hbar',  mathlevel: 3,   func: 'AssistHandler.insert(\'&hbar;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_38',   view: '<math><mo>&dd;</mo></math>',     command: '\\differential',  title: 'differential',  mathlevel: 3,   func: 'AssistHandler.insert(\'&dd;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_39',   view: '<math><mo>&ii;</mo></math>',     command: '\\ImaginaryNumber',   title: 'ImaginaryNumber',   mathlevel: 2,   func: 'AssistHandler.insert(\'&ii;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_40',   view: '<math><mo>&ee;</mo></math>',     command: '\\NapierNumber',  title: 'NapierNumber',  mathlevel: 2,   func: 'AssistHandler.insert(\'&ee;\', {normalonly: true})'},
{id: 'Popup_OtherSymbols_41',   view: '<math><mo>&loz;</mo></math>',    command: '\\Diamond',   title: 'Diamond',   mathlevel: 2,   func: 'AssistHandler.insert(\'&loz;\', {normalonly: true})'},
              ],

        'Point' : [
{id: 'Popup_Point_1',   view: '<math><mo>&rdquo;</mo></math>',  command: '\\doubleendquartation',   title: 'doubleendquartation',   mathlevel: 1,   func: 'AssistHandler.insert(\'&rdquo;\', {normalonly: true})'},
{id: 'Popup_Point_2',   view: '<math><mo>&rsquo;</mo></math>',  command: '\\singleendquartation',   title: 'singleendquartation',   mathlevel: 1,   func: 'AssistHandler.insert(\'&rsquo;\', {normalonly: true})'},
{id: 'Popup_Point_3',   view: '<math><mo>,</mo></math>',    command: '\\comma',     title: 'comma',     mathlevel: 1,   func: 'AssistHandler.insert(\',\', {normalonly: true})'},
{id: 'Popup_Point_4',   view: '<math><mo>.</mo></math>',    command: '\\period',    title: 'period',    mathlevel: 1,   func: 'AssistHandler.insert(\'.\', {normalonly: true})'},
{id: 'Popup_Point_5',   view: '<math><mo>&bull;</mo></math>',   command: '\\bullet',    title: 'bullet',    mathlevel: 1,   func: 'AssistHandler.insert(\'&bull;\', {normalonly: true})'},
{id: 'Popup_Point_6',   view: '<math><mo>:</mo></math>',    command: '\\colon',     title: 'colon',     mathlevel: 1,   func: 'AssistHandler.insert(\':\', {normalonly: true})'},
{id: 'Popup_Point_7',   view: '<math><mo>;</mo></math>',    command: '\\semicolon',     title: 'semicolon',     mathlevel: 1,   func: 'AssistHandler.insert(\';\', {normalonly: true})'},
{id: 'Popup_Point_8',   view: '<math><mo>&lsquo;</mo></math>',  command: '\\singlebeginquartation',     title: 'singlebeginquartation',     mathlevel: 1,   func: 'AssistHandler.insert(\'&lsquo;\', {normalonly: true})'},
{id: 'Popup_Point_9',   view: '<math><mo>&ldquo;</mo></math>',  command: '\\doublebeginquartation',     title: 'doublebeginquartation',     mathlevel: 1,   func: 'AssistHandler.insert(\'&ldquo;\', {normalonly: true})'},
{id: 'Popup_Point_10',  view: '<math><mo>&ctdot;</mo></math>',  command: '\\cdots',     title: 'cdots',     mathlevel: 1,   func: 'AssistHandler.insert(\'&ctdot;\', {normalonly: true})'},
{id: 'Popup_Point_11',  view: '<math><mo>&tdot;</mo></math>',   command: '\\ldots',     title: 'ldots',     mathlevel: 2,   func: 'AssistHandler.insert(\'&tdot;\', {normalonly: true})'},
{id: 'Popup_Point_12',  view: '<math><mo>&middot;</mo></math>',     command: '\\cdot',  title: 'cdot',  mathlevel: 2,   func: 'AssistHandler.insert(\'&middot;\', {normalonly: true})'},
{id: 'Popup_Point_13',  view: '<math><mo>&vellip;</mo></math>',     command: '\\vdots',     title: 'vdots',     mathlevel: 3,   func: 'AssistHandler.insert(\'&vellip;\', {normalonly: true})'},
{id: 'Popup_Point_14',  view: '<math><mo>&dtdot;</mo></math>',  command: '\\ddots',     title: 'ddots',     mathlevel: 3,   func: 'AssistHandler.insert(\'&dtdot;\', {normalonly: true})'},
{id: 'Popup_Point_15',  view: '<math><mo>&prime;</mo></math>',  command: '\\prime',     title: 'prime',     mathlevel: 1,   func: 'AssistHandler.insert(\'&prime;\', {normalonly: true})'},
{id: 'Popup_Point_16',  view: '<math><mo>&Prime;</mo></math>',  command: '\\doubleprime',   title: 'doubleprime',   mathlevel: 1,   func: 'AssistHandler.insert(\'&Prime;\', {normalonly: true})'},
{id: 'Popup_Point_17',  view: '<math><mo>&tprime;</mo></math>',     command: '\\tripleprime',   title: 'tripleprime',   mathlevel: 1,   func: 'AssistHandler.insert(\'&tprime;\', {normalonly: true})'},
                  ],

      'Box' : [
        {id: 'Popup_Box_1',     view: '[囲み枠]',  command: '\\fbox',  title: 'fbox',  mathlevel: 1,   func: 'AssistHandler.insert(\'\', {type: LAYOUT_NODE_TYPE.DECOBOX, borderType: \'box-border-normal\'})'},
        {id: 'Popup_Box_2',     view: '[囲み枠]',  command: '\\fcircle',   title: 'fcircle',   mathlevel: 1,   func: 'AssistHandler.insert(\'\', {type: LAYOUT_NODE_TYPE.DECOBOX, borderType: \'box-border-circle\'})'},
               ],

        'MathSyntax' : [
        {id: 'Popup_MathSyntax_2',  view: '√',  command: '\\sqrt', alias: '\\r,\\root',     title: '根号',    mathlevel: 1,   func: 'AssistHandler.insert(\'\', {inputmode:2, type: LAYOUT_NODE_TYPE.ROOT})'},
        {id: 'Popup_MathSyntax_1',  view: '<img src="mathimage/frac.png" height="20">',     command: '\\frac', alias: '\\f',    title: '分数',    mathlevel: 1,   func: 'AssistHandler.insert(\'\', {inputmode:2, type: LAYOUT_NODE_TYPE.FRAC})'},
                       ],

        'Array': [
        {id: 'Popup_Array_1',   view: '[括弧]',   command: '\\left|',     title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'|\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OPEN_BRACKETS})'},
        {id: 'Popup_Array_2',   view: '[括弧]',   command: '\\right|',    title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'|\', {inputmode: 2, type: LAYOUT_NODE_TYPE.CLOSE_BRACKETS})'},
        {id: 'Popup_Array_3',   view: '[括弧]',   command: '\\left||',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Vert;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OPEN_BRACKETS})'},
        {id: 'Popup_Array_4',   view: '[括弧]',   command: '\\right||',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Vert;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.CLOSE_BRACKETS})'},
        {id: 'Popup_Array_5',   view: '[括弧]',   command: '\\(',     title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'(\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OPEN_BRACKETS})'},
        {id: 'Popup_Array_6',   view: '[括弧]',   command: '\\)',     title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\')\', {inputmode: 2, type: LAYOUT_NODE_TYPE.CLOSE_BRACKETS})'},
        {id: 'Popup_Array_7',   view: '[括弧]',   command: '\\{',     title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'{\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OPEN_BRACKETS})'},
        {id: 'Popup_Array_8',   view: '[括弧]',   command: '\\}',     title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'}\', {inputmode: 2, type: LAYOUT_NODE_TYPE.CLOSE_BRACKETS})'},
        {id: 'Popup_Array_9',   view: '[括弧]',   command: '\\[',     title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'[\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OPEN_BRACKETS})'},
        {id: 'Popup_Array_10',  view: '[括弧]',   command: '\\]',     title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\']\', {inputmode: 2, type: LAYOUT_NODE_TYPE.CLOSE_BRACKETS})'},
        {id: 'Popup_Array_11',  view: '[括弧]',   command: '\\<',     title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'&lang;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OPEN_BRACKETS})'},
        {id: 'Popup_Array_12',  view: '[括弧]',   command: '\\>',     title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'&rang;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.CLOSE_BRACKETS})'},
        {id: 'Popup_Array_13',  view: '[括弧]',   command: '\\array|',    title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'||\', {inputmode: 2, type: LAYOUT_NODE_TYPE.MATRIX})'},
        {id: 'Popup_Array_14',  view: '[括弧]',   command: '\\array||',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Vert;&Vert;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.MATRIX})'},
        {id: 'Popup_Array_15',  view: '[括弧]',   command: '\\()',    title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'()\', {inputmode: 2, type: LAYOUT_NODE_TYPE.MATRIX})'},
        {id: 'Popup_Array_16',  view: '[括弧]',   command: '\\{}',    title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'{}\', {inputmode: 2, type: LAYOUT_NODE_TYPE.MATRIX})'},
        {id: 'Popup_Array_17',  view: '[括弧]',   command: '\\[]',    title: '',  mathlevel: 1,   func: 'AssistHandler.insert(\'[]\', {inputmode: 2, type: LAYOUT_NODE_TYPE.MATRIX})'},
        {id: 'Popup_Array_18',  view: '[括弧]',   command: '\\<>',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'&lang;&rang;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.MATRIX})'},
                  ],

        'Integral': [
        {id: 'Popup_Integral_1',    view: '<math><mo>&int;</mo></math>',    command: '\\int',   title: 'int',   mathlevel: 2,   func: 'AssistHandler.insert(\'&int;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL})'},
        {id: 'Popup_Integral_2',    view: '<math><mo>&oint;</mo></math>',   command: '\\oint',  title: 'oint',  mathlevel: 3,   func: 'AssistHandler.insert(\'&oint;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL})'},
        {id: 'Popup_Integral_3',    view: '<math><mo>&Int;</mo></math>',    command: '\\iint',  title: 'iint',  mathlevel: 3,   func: 'AssistHandler.insert(\'&Int;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL})'},
        {id: 'Popup_Integral_4',    view: '<math><mo>&tint;</mo></math>',   command: '\\iiint',     title: 'iiint',     mathlevel: 3,   func: 'AssistHandler.insert(\'&tint;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL})'},
        {id: 'Popup_Integral_5',    view: '<math><mo>&qint;</mo></math>',   command: '\\iiiint',    title: 'iiiint',    mathlevel: 3,   func: 'AssistHandler.insert(\'&qint;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL})'},
        {id: 'Popup_Integral_6',    view: '<math><mo>&int;</mo></math>&ctdot;<math><mo>&int;</mo></math>',  command: '\\idotsint',  title: 'idotsint',  mathlevel: 3,   func: 'AssistHandler.insert(\'&dint;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.INTEGRAL})'},
        {id: 'Popup_Integral_7',    view: '<math><mo>&int;</mo></math>',    command: '\\inttop',    title: '積分（上下に添え字）',    mathlevel: 2,   func: 'AssistHandler.insert(\'&int;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
                     ],
       'TopBottom' : [
        {id: 'Popup_TopBottom_1',   view: '<math><mo>&sum;</mo></math>',    command: '\\sum', alias: '\\s',     title: 'sum',   mathlevel: 2,   func: 'AssistHandler.insert(\'&sum;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_2',   view: '<math><mo>&prod;</mo></math>',   command: '\\prod',  title: 'prod',  mathlevel: 3,   func: 'AssistHandler.insert(\'&prod;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_3',   view: '<math><mo>&coprod;</mo></math>',     command: '\\coprod',    title: 'coprod',    mathlevel: 4,   func: 'AssistHandler.insert(\'&coprod;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_4',   view: '<math><mo>&cup;</mo></math>',    command: '\\bigcup',    title: 'bigcup',    mathlevel: 3,   func: 'AssistHandler.insert(\'&cup;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_5',   view: '<math><mo>&cap;</mo></math>',    command: '\\bigcap',    title: 'bigcap',    mathlevel: 3,   func: 'AssistHandler.insert(\'&cap;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_6',   view: '<math><mo>&or;</mo></math>',     command: '\\bigvee',    title: 'bigvee',    mathlevel: 4,   func: 'AssistHandler.insert(\'&or;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_7',   view: '<math><mo>&and;</mo></math>',    command: '\\bigwedge',  title: 'bigwedge',  mathlevel: 4,   func: 'AssistHandler.insert(\'&and;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_8',   view: '<math><mo>&xoplus;</mo></math>',     command: '\\bigoplus',  title: 'bigoplus',  mathlevel: 4,   func: 'AssistHandler.insert(\'&xoplus;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_9',   view: '<math><mo>&xotime;</mo></math>',     command: '\\bigotimes',     title: 'bigotimes',     mathlevel: 4,   func: 'AssistHandler.insert(\'&xotime;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_10',  view: '<math><mo>&xsqcup;</mo></math>',     command: '\\bigsqcup',  title: 'bigsqcup',  mathlevel: 3,   func: 'AssistHandler.insert(\'&xsqcup;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
        {id: 'Popup_TopBottom_11',  view: '<math><mo>&sqcap;</mo></math>',     command: '\\bigsqcap',  title: 'bigsqcap',  mathlevel: 3,   func: 'AssistHandler.insert(\'&sqcap;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
                      ],

        'Accent' : [
        {id: 'Popup_Accent_1',  view: '<math><mo>&acute;</mo></math>',  command: '\\acute',     title: 'acute',     mathlevel: 3,   func: 'AssistHandler.insert(\'&acute;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_2',  view: '<math><mo>&grave;</mo></math>',  command: '\\grave',     title: 'grave',     mathlevel: 3,   func: 'AssistHandler.insert(\'&grave;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_3',  view: '<math><mo>&circ;</mo></math>',   command: '\\hat',   title: 'hat',   mathlevel: 2,   func: 'AssistHandler.insert(\'&circ;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_4',  view: '<math><mo>&DiacriticalTilde;</mo></math>',   command: '\\tilde',     title: 'tilde',     mathlevel: 2,   func: 'AssistHandler.insert(\'&DiacriticalTilde;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_5',  view: '<math><mo>&caron;</mo></math>',  command: '\\check',     title: 'check',     mathlevel: 3,   func: 'AssistHandler.insert(\'&caron;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_6',  view: '<math><mo>&breve;</mo></math>',  command: '\\breve',     title: 'breve',     mathlevel: 3,   func: 'AssistHandler.insert(\'&breve;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_7',  view: '<math><mo>&DiacriticalDot;</mo></math>',     command: '\\dot',   title: 'dot',   mathlevel: 3,   func: 'AssistHandler.insert(\'&DiacriticalDot;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_8',  view: '<math><mo>&DoubleDot;</mo></math>',  command: '\\ddot',  title: 'ddot',  mathlevel: 3,   func: 'AssistHandler.insert(\'&DoubleDot;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_9',  view: '<math><mo>&tdot;</mo></math>',   command: '\\dddot',     title: 'dddot',     mathlevel: 3,   func: 'AssistHandler.insert(\'&tdot;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_10',     view: '<math><mo>&TildeTilde;</mo></math>',     command: '\\ttilde',    title: 'ttilde',    mathlevel: 3,   func: 'AssistHandler.insert(\'&TildeTilde;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_11',     view: '<math><mo>&ring;</mo></math>',   command: '\\mathring',  title: 'mathring',  mathlevel: 3,   func: 'AssistHandler.insert(\'&ring;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_12',     view: '<math><mo>&larr;</mo></math>',   command: '\\overleftarrow',     title: 'overleftarrow',     mathlevel: 3,   func: 'AssistHandler.insert(\'&larr;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_13',     view: '<math><mo>&rarr;</mo></math>',   command: '\\overrightarrow',    title: 'overrightarrow',    mathlevel: 3,   func: 'AssistHandler.insert(\'&rarr;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_14',     view: '<math><mo>&circ;</mo></math>',   command: '\\widehat',   title: 'widehat',   mathlevel: 2,   func: 'AssistHandler.insert(\'&circ;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Accent_15',     view: '<math><mo>&OverParenthesis;</mo></math>',    command: '\\arc',   title: 'arc',   mathlevel: 1,   func: 'AssistHandler.insert(\'&OverParenthesis;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
                    ],
        'Over' : [
        {id: 'Popup_Over_1',    view: '<math><mo>&OverBar;</mo></math>',    command: '\\overline',  title: 'overline',  mathlevel: 2,   func: 'AssistHandler.insert(\'&OverBar;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
        {id: 'Popup_Over_2',    view: '<math><mo>&rarr;</mo></math>',   command: '\\vec',   title: 'vec',   mathlevel: 2,   func: 'AssistHandler.insert(\'&rarr;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.OVER})'},
                  ],

        'Under' : [
        {id: 'Popup_Under_1',    view: '<math><mo>&UnderBar;</mo></math>',   command: '\\underline',     title: 'underline',     mathlevel: 1,   func: 'AssistHandler.insert(\'&UnderBar;\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDERLINE})'},
                   ],

        'Function' :[
        {id: 'Popup_Function_1',    view: 'sin',    command: '\\sin',   title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'sin\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_2',    view: 'cos',    command: '\\cos',   title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'cos\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_3',    view: 'tan',    command: '\\tan',   title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'tan\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_4',    view: 'log',    command: '\\log',   title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'log\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_5',    view: 'deg',    command: '\\deg',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'deg\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_6',    view: 'det',    command: '\\det',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'det\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_7',    view: 'dim',    command: '\\dim',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'dim\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_8',    view: 'exp',    command: '\\exp',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'exp\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_9',    view: 'sinh',   command: '\\sinh',  title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'sinh\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_10',   view: 'cosh',   command: '\\cosh',  title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'cosh\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_11',   view: 'tanh',   command: '\\tanh',  title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'tanh\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_12',   view: 'cot',    command: '\\cot',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'cot\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_13',   view: 'coth',   command: '\\coth',  title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'coth\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_14',   view: 'csc',    command: '\\csc',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'csc\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_15',   view: 'sec',    command: '\\sec',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'sec\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_16',   view: 'gcd',    command: '\\gcd',   title: '',  mathlevel: 2,   func: 'AssistHandler.insert(\'gcd\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_17',   view: 'arcsin',     command: '\\arcsin',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'arcsin\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_18',   view: 'arccos',     command: '\\arccos',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'arccos\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_19',   view: 'arctan',     command: '\\arctan',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'arctan\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_20',   view: 'Log',    command: '\\Log',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Log\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_21',   view: 'arg',    command: '\\arg',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'arg\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_22',   view: 'ln',     command: '\\ln',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'ln\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_23',   view: 'Re',     command: '\\Re',    title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'Re\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_24',   view: 'Im',     command: '\\Im',    title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'Im\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_25',   view: 'arc',    command: '\\func_arc',  title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'arc\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_26',   view: 'lg',     command: '\\lg',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'lg\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_27',   view: 'Arccos',     command: '\\Arccos',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Arccos\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_28',   view: 'Arcsin',     command: '\\Arcsin',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Arcsin\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_29',   view: 'Arctan',     command: '\\Arctan',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Arctan\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_30',   view: 'Arg',    command: '\\Arg',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Arg\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_31',   view: 'Det',    command: '\\Det',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Det\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_32',   view: 'Dim',    command: '\\Dim',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Dim\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_33',   view: 'ess',    command: '\\ess',   title: '',  mathlevel: 4,   func: 'AssistHandler.insert(\'ess\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_34',   view: 'Exp',    command: '\\Exp',   title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Exp\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_35',   view: 'l.i.m',  command: '\\LIM',   title: '',  mathlevel: 4,   func: 'AssistHandler.insert(\'l.i.m\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_36',   view: 'vol',    command: '\\vol',   title: '',  mathlevel: 4,   func: 'AssistHandler.insert(\'vol\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_37',   view: 'Vol',    command: '\\Vol',   title: '',  mathlevel: 4,   func: 'AssistHandler.insert(\'Vol\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_38',   view: 'sinech',     command: '\\sinech',    title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'sinech\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_39',   view: 'cosech',     command: '\\cosech',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'cosech\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_40',   view: 'tanech',     command: '\\tanech',    title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'tanech\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_41',   view: 'secech',     command: '\\secech',    title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'secech\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_42',   view: 'cotech',     command: '\\cotech',    title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'cotech\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_43',   view: 'cosecech',   command: '\\cosecech',  title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'cosecech\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_44',   view: 'Ln',     command: '\\Ln',    title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'Ln\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_45',   view: 'cosec',  command: '\\cosec',     title: '',  mathlevel: 0,   func: 'AssistHandler.insert(\'cosec\', {inputmode:2, normalonly:true})'},
        {id: 'Popup_Function_46',   view: 'sech',   command: '\\sech',  title: '',  mathlevel: 3,   func: 'AssistHandler.insert(\'sech\', {inputmode:2, normalonly:true})'},
                     ],

        'Bottom' : [
        {id: 'Popup_Bottom_2',  view: 'lim',    command: '\\lim',   title: 'lim',   mathlevel: 2,   func: 'AssistHandler.insert(\'lim\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_3',  view: 'inf',    command: '\\inf',   title: 'inf',   mathlevel: 4,   func: 'AssistHandler.insert(\'inf\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_4',  view: 'sup',    command: '\\sup',   title: 'sup',   mathlevel: 4,   func: 'AssistHandler.insert(\'sup\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_10',     view: 'liminf',     command: '\\liminf',    title: 'liminf',    mathlevel: 4,   func: 'AssistHandler.insert(\'liminf\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_11',     view: 'limsup',     command: '\\limsup',    title: 'limsup',    mathlevel: 4,   func: 'AssistHandler.insert(\'limsup\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_12',     view: '<img src="mathimage/limunder.png" height="17">',  command: '\\varliminf',     title: 'varliminf',     mathlevel: 4,   func: 'AssistHandler.insert(\'limu\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_14',     view: '<img src="mathimage/limover.png" height="17">',    command: '\\varlimsup',     title: 'varlimsup',     mathlevel: 4,   func: 'AssistHandler.insert(\'limo\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_15',     view: '<img src="mathimage/limright.png" height="20">',  command: '\\varinjlim',     title: 'varinjlim',     mathlevel: 4,   func: 'AssistHandler.insert(\'limurar\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_16',     view: 'Pr',     command: '\\Pr',    title: 'Pr',    mathlevel: 4,   func: 'AssistHandler.insert(\'Pr\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_17',     view: '<img src="mathimage/limleft.png" height="20">',  command: '\\varprojlim',    title: 'varprojlim',    mathlevel: 4,   func: 'AssistHandler.insert(\'limular\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_29',     view: 'pr',     command: '\\pr',    title: 'pr',    mathlevel: 4,   func: 'AssistHandler.insert(\'pr\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_41',     view: 'argmax',     command: '\\argmax',    title: 'argmax',    mathlevel: 4,   func: 'AssistHandler.insert(\'argmax\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_42',     view: 'ArgMax',     command: '\\ArgMax',    title: 'ArgMax',    mathlevel: 4,   func: 'AssistHandler.insert(\'ArgMax\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_43',     view: 'argmin',     command: '\\argmin',    title: 'argmin',    mathlevel: 4,   func: 'AssistHandler.insert(\'argmin\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_44',     view: 'ArgMin',     command: '\\ArgMin',    title: 'ArgMin',    mathlevel: 4,   func: 'AssistHandler.insert(\'ArgMin\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
        {id: 'Popup_Bottom_45',     view: 'Lim',    command: '\\Lim',   title: 'Lim',   mathlevel: 4,   func: 'AssistHandler.insert(\'Lim\', {inputmode: 2, type: LAYOUT_NODE_TYPE.UNDER})'},
                    ],

        'BottomEx' : [
        {id: 'Popup_BottomEx_1',    view: 'mod',    command: '\\mod',   title: 'mod',   mathlevel: 4,   func: 'AssistHandler.insert(\'mod\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_5',    view: 'max',    command: '\\max',   title: 'max',   mathlevel: 2,   func: 'AssistHandler.insert(\'max\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_6',    view: 'min',    command: '\\min',   title: 'min',   mathlevel: 2,   func: 'AssistHandler.insert(\'min\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_7',    view: 'hom',    command: '\\hom',   title: 'hom',   mathlevel: 4,   func: 'AssistHandler.insert(\'hom\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_8',    view: 'Div',    command: '\\Div',   title: 'Div',   mathlevel: 3,   func: 'AssistHandler.insert(\'Div\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_9',    view: 'Res',    command: '\\Res',   title: 'Res',   mathlevel: 3,   func: 'AssistHandler.insert(\'Res\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_13',   view: 'ker',    command: '\\ker',   title: 'ker',   mathlevel: 3,   func: 'AssistHandler.insert(\'ker\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_18',   view: 'coker',  command: '\\coker',     title: 'coker',     mathlevel: 4,   func: 'AssistHandler.insert(\'coker\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_19',   view: 'Coker',  command: '\\Coker',     title: 'Coker',     mathlevel: 4,   func: 'AssistHandler.insert(\'Coker\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_20',   view: 'Ext',    command: '\\Ext',   title: 'Ext',   mathlevel: 4,   func: 'AssistHandler.insert(\'Ext\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_21',   view: 'grad',   command: '\\grad',  title: 'grad',  mathlevel: 3,   func: 'AssistHandler.insert(\'grad\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_22',   view: 'Grad',   command: '\\Grad',  title: 'Grad',  mathlevel: 3,   func: 'AssistHandler.insert(\'Grad\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_23',   view: 'hess',   command: '\\hess',  title: 'hess',  mathlevel: 4,   func: 'AssistHandler.insert(\'hess\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_24',   view: 'Hess',   command: '\\Hess',  title: 'Hess',  mathlevel: 4,   func: 'AssistHandler.insert(\'Hess\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_25',   view: 'Hom',    command: '\\Hom',   title: 'Hom',   mathlevel: 4,   func: 'AssistHandler.insert(\'Hom\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_26',   view: 'Ker',    command: '\\Ker',   title: 'Ker',   mathlevel: 3,   func: 'AssistHandler.insert(\'Ker\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_27',   view: 'Max',    command: '\\Max',   title: 'Max',   mathlevel: 2,   func: 'AssistHandler.insert(\'Max\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_28',   view: 'Min',    command: '\\Min',   title: 'Min',   mathlevel: 2,   func: 'AssistHandler.insert(\'Min\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_30',   view: 'res',    command: '\\res',   title: 'res',   mathlevel: 3,   func: 'AssistHandler.insert(\'res\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_31',   view: 'ric',    command: '\\ric',   title: 'ric',   mathlevel: 4,   func: 'AssistHandler.insert(\'ric\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_32',   view: 'Ric',    command: '\\Ric',   title: 'Ric',   mathlevel: 4,   func: 'AssistHandler.insert(\'Ric\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_33',   view: 'Spec',   command: '\\Spec',  title: 'Spec',  mathlevel: 4,   func: 'AssistHandler.insert(\'Spec\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_34',   view: 'spec',   command: '\\spec',  title: 'spec',  mathlevel: 4,   func: 'AssistHandler.insert(\'spec\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_35',   view: 'Tor',    command: '\\Tor',   title: 'Tor',   mathlevel: 4,   func: 'AssistHandler.insert(\'Tor\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_36',   view: 'Trace',  command: '\\Trace',     title: 'Trace',     mathlevel: 3,   func: 'AssistHandler.insert(\'Trace\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_37',   view: 'trace',  command: '\\trace',     title: 'trace',     mathlevel: 3,   func: 'AssistHandler.insert(\'trace\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_38',   view: 'Dom',    command: '\\Dom',   title: 'Dom',   mathlevel: 4,   func: 'AssistHandler.insert(\'Dom\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_39',   view: 'loc',    command: '\\loc',   title: 'loc',   mathlevel: 4,   func: 'AssistHandler.insert(\'loc\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_40',   view: 'ext',    command: '\\ext',   title: 'ext',   mathlevel: 4,   func: 'AssistHandler.insert(\'ext\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
        {id: 'Popup_BottomEx_46',   view: 'Mod',    command: '\\Mod',   title: 'Mod',   mathlevel: 4,   func: 'AssistHandler.insert(\'Mod\', {inputmode:2, type: LAYOUT_NODE_TYPE.UNDER, noDefaultPos:true})'},
                      ],

        'SupCapital' : [
        {id: 'Popup_SupCapital_1',  view: '<sup>A</sup>',       title: 'A',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>A</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_2',  view: '<sup>B</sup>',       title: 'B',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>B</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_3',  view: '<sup>C</sup>',       title: 'C',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>C</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_4',  view: '<sup>D</sup>',       title: 'D',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>D</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_5',  view: '<sup>E</sup>',       title: 'E',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>E</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_6',  view: '<sup>F</sup>',       title: 'F',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>F</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_7',  view: '<sup>G</sup>',       title: 'G',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>G</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_8',  view: '<sup>H</sup>',       title: 'H',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>H</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_9',  view: '<sup>I</sup>',       title: 'I',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>I</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_10',     view: '<sup>J</sup>',       title: 'J',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>J</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_11',     view: '<sup>K</sup>',       title: 'K',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>K</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_12',     view: '<sup>L</sup>',       title: 'L',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>L</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_13',     view: '<sup>M</sup>',       title: 'M',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>M</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_14',     view: '<sup>N</sup>',       title: 'N',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>N</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_15',     view: '<sup>O</sup>',       title: 'O',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>O</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_16',     view: '<sup>P</sup>',       title: 'P',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>P</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_17',     view: '<sup>Q</sup>',       title: 'Q',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>Q</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_18',     view: '<sup>R</sup>',       title: 'R',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>R</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_19',     view: '<sup>S</sup>',       title: 'S',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>S</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_20',     view: '<sup>T</sup>',       title: 'T',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>T</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_21',     view: '<sup>U</sup>',       title: 'U',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>U</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_22',     view: '<sup>V</sup>',       title: 'V',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>V</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_23',     view: '<sup>W</sup>',       title: 'W',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>W</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_24',     view: '<sup>X</sup>',       title: 'X',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>X</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_25',     view: '<sup>Y</sup>',       title: 'Y',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>Y</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupCapital_26',     view: '<sup>Z</sup>',       title: 'Z',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>Z</sup>\', {inputmode: 1, footnote: 1})'},
                        ],
        'SupSmall' : [
        {id: 'Popup_SupSmall_1',    view: '<sup>a</sup>',       title: 'a',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>a</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_2',    view: '<sup>b</sup>',       title: 'b',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>b</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_3',    view: '<sup>c</sup>',       title: 'c',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>c</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_4',    view: '<sup>d</sup>',       title: 'd',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>d</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_5',    view: '<sup>e</sup>',       title: 'e',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>e</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_6',    view: '<sup>f</sup>',       title: 'f',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>f</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_7',    view: '<sup>g</sup>',       title: 'g',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>g</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_8',    view: '<sup>h</sup>',       title: 'h',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>h</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_9',    view: '<sup>i</sup>',       title: 'i',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>i</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_10',   view: '<sup>j</sup>',       title: 'j',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>j</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_11',   view: '<sup>k</sup>',       title: 'k',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>k</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_12',   view: '<sup>l</sup>',       title: 'l',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>l</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_13',   view: '<sup>m</sup>',       title: 'm',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>m</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_14',   view: '<sup>n</sup>',       title: 'n',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>n</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_15',   view: '<sup>o</sup>',       title: 'o',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>o</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_16',   view: '<sup>p</sup>',       title: 'p',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>p</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_17',   view: '<sup>q</sup>',       title: 'q',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>q</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_18',   view: '<sup>r</sup>',       title: 'r',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>r</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_19',   view: '<sup>s</sup>',       title: 's',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>s</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_20',   view: '<sup>t</sup>',       title: 't',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>t</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_21',   view: '<sup>u</sup>',       title: 'u',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>u</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_22',   view: '<sup>v</sup>',       title: 'v',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>v</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_23',   view: '<sup>w</sup>',       title: 'w',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>w</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_24',   view: '<sup>x</sup>',       title: 'x',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>x</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_25',   view: '<sup>y</sup>',       title: 'y',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>y</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSmall_26',   view: '<sup>z</sup>',       title: 'z',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>z</sup>\', {inputmode: 1, footnote: 1})'},
                      ],
       'SupSymbol' : [
        {id: 'Popup_SupSymbol_1',   view: '<sup>0</sup>',       title: '0',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>0</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_2',   view: '<sup>1</sup>',       title: '1',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>1</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_3',   view: '<sup>2</sup>',       title: '2',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>2</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_4',   view: '<sup>3</sup>',       title: '3',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>3</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_5',   view: '<sup>4</sup>',       title: '4',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>4</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_6',   view: '<sup>5</sup>',       title: '5',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>5</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_7',   view: '<sup>6</sup>',       title: '6',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>6</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_8',   view: '<sup>7</sup>',       title: '7',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>7</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_9',   view: '<sup>8</sup>',       title: '8',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>8</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_10',  view: '<sup>9</sup>',       title: '9',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>9</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_11',  view: '<sup>(</sup>',       title: 'leftpar',   mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>(</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_12',  view: '<sup>)</sup>',       title: 'rightpar',  mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>)</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_13',  view: '<sup>&ast;</sup>',       title: 'ast',   mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>&ast;</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_14',  view: '<sup>&dagger;</sup>',        title: 'dagger',    mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>&dagger;</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_15',  view: '<sup>&ddagger;</sup>',       title: 'ddagger',   mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>&ddagger;</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_16',  view: '<sup>&star;</sup>',      title: 'star',  mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>&star;</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_17',  view: '<sup>&prime;</sup>',         title: 'prime',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>&prime;</sup>\', {inputmode: 1, footnote: 1})'},
        {id: 'Popup_SupSymbol_18',  view: '<sup>&#x25CB;</sup>',        title: 'circ',  mathlevel: 2,   func: 'AssistHandler.insert(\'<sup>&#x25CB;</sup>\', {inputmode: 1, footnote: 1})'},
                      ],

       'SubCapital' : [
        {id: 'Popup_SubCapital_1',  view: '<sub>A</sub>',       title: 'A',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>A</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_2',  view: '<sub>B</sub>',       title: 'B',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>B</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_3',  view: '<sub>C</sub>',       title: 'C',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>C</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_4',  view: '<sub>D</sub>',       title: 'D',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>D</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_5',  view: '<sub>E</sub>',       title: 'E',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>E</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_6',  view: '<sub>F</sub>',       title: 'F',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>F</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_7',  view: '<sub>G</sub>',       title: 'G',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>G</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_8',  view: '<sub>H</sub>',       title: 'H',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>H</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_9',  view: '<sub>I</sub>',       title: 'I',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>I</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_10',     view: '<sub>J</sub>',       title: 'J',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>J</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_11',     view: '<sub>K</sub>',       title: 'K',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>K</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_12',     view: '<sub>L</sub>',       title: 'L',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>L</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_13',     view: '<sub>M</sub>',       title: 'M',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>M</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_14',     view: '<sub>N</sub>',       title: 'N',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>N</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_15',     view: '<sub>O</sub>',       title: 'O',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>O</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_16',     view: '<sub>P</sub>',       title: 'P',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>P</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_17',     view: '<sub>Q</sub>',       title: 'Q',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>Q</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_18',     view: '<sub>R</sub>',       title: 'R',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>R</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_19',     view: '<sub>S</sub>',       title: 'S',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>S</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_20',     view: '<sub>T</sub>',       title: 'T',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>T</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_21',     view: '<sub>U</sub>',       title: 'U',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>U</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_22',     view: '<sub>V</sub>',       title: 'V',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>V</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_23',     view: '<sub>W</sub>',       title: 'W',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>W</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_24',     view: '<sub>X</sub>',       title: 'X',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>X</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_25',     view: '<sub>Y</sub>',       title: 'Y',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>Y</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubCapital_26',     view: '<sub>Z</sub>',       title: 'Z',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>Z</sub>\', {inputmode: 1, footnote: 2})'},
                       ],
        'SubSmall' : [
        {id: 'Popup_SubSmall_1',    view: '<sub>a</sub>',       title: 'a',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>a</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_2',    view: '<sub>b</sub>',       title: 'b',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>b</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_3',    view: '<sub>c</sub>',       title: 'c',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>c</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_4',    view: '<sub>d</sub>',       title: 'd',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>d</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_5',    view: '<sub>e</sub>',       title: 'e',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>e</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_6',    view: '<sub>f</sub>',       title: 'f',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>f</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_7',    view: '<sub>g</sub>',       title: 'g',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>g</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_8',    view: '<sub>h</sub>',       title: 'h',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>h</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_9',    view: '<sub>i</sub>',       title: 'i',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>i</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_10',   view: '<sub>j</sub>',       title: 'j',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>j</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_11',   view: '<sub>k</sub>',       title: 'k',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>k</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_12',   view: '<sub>l</sub>',       title: 'l',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>l</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_13',   view: '<sub>m</sub>',       title: 'm',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>m</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_14',   view: '<sub>n</sub>',       title: 'n',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>n</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_15',   view: '<sub>o</sub>',       title: 'o',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>o</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_16',   view: '<sub>p</sub>',       title: 'p',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>p</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_17',   view: '<sub>q</sub>',       title: 'q',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>q</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_18',   view: '<sub>r</sub>',       title: 'r',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>r</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_19',   view: '<sub>s</sub>',       title: 's',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>s</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_20',   view: '<sub>t</sub>',       title: 't',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>t</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_21',   view: '<sub>u</sub>',       title: 'u',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>u</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_22',   view: '<sub>v</sub>',       title: 'v',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>v</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_23',   view: '<sub>w</sub>',       title: 'w',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>w</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_24',   view: '<sub>x</sub>',       title: 'x',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>x</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_25',   view: '<sub>y</sub>',       title: 'y',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>y</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSmall_26',   view: '<sub>z</sub>',       title: 'z',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>z</sub>\', {inputmode: 1, footnote: 2})'},
                      ],
        'SubSymbol' : [
        {id: 'Popup_SubSymbol_1',   view: '<sub>0</sub>',       title: '0',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>0</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_2',   view: '<sub>1</sub>',       title: '1',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>1</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_3',   view: '<sub>2</sub>',       title: '2',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>2</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_4',   view: '<sub>3</sub>',       title: '3',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>3</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_5',   view: '<sub>4</sub>',       title: '4',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>4</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_6',   view: '<sub>5</sub>',       title: '5',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>5</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_7',   view: '<sub>6</sub>',       title: '6',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>6</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_8',   view: '<sub>7</sub>',       title: '7',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>7</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_9',   view: '<sub>8</sub>',       title: '8',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>8</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_10',  view: '<sub>9</sub>',       title: '9',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>9</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_11',  view: '<sub>(</sub>',       title: 'leftpar',   mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>(</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_12',  view: '<sub>)</sub>',       title: 'rightpar',  mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>)</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_13',  view: '<sub>&ast;</sub>',       title: 'ast',   mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>&ast;</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_14',  view: '<sub>&dagger;</sub>',        title: 'dagger',    mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>&dagger;</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_15',  view: '<sub>&ddagger;</sub>',       title: 'ddagger',   mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>&ddagger;</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_16',  view: '<sub>&star;</sub>',      title: 'star',  mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>&star;</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_17',  view: '<sub>&prime;</sub>',         title: 'prime',     mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>&prime;</sub>\', {inputmode: 1, footnote: 2})'},
        {id: 'Popup_SubSymbol_18',  view: '<sub>&#x25CB;</sub>',        title: 'circ',  mathlevel: 2,   func: 'AssistHandler.insert(\'<sub>&#x25CB;</sub>\', {inputmode: 1, footnote: 2})'},
                       ],

        'Chemical' : [
{id: 'Popup_Chemical_1',    view: '<span style="position: relative;"><span style="position: absolute; top: -20%;">&#x2500;</span><span style="opacity: 0.0;">&#x2500;</span></span>',   command: null,    title: '単結合',   mathlevel: 1,   func: 'AssistHandler.insert(\'&chembond1;\', {inputmode: 3})'},
{id: 'Popup_Chemical_2',    view: '<span style="position: relative;" ><span style="position: absolute; top: -50%;">&#x2500;</span><span style="position: absolute; top:  10%;">&#x2500;</span><span style="opacity: 0.0;">&#x2500;</span></span>',  command: null,    title: '２重結合',  mathlevel: 1,   func: 'AssistHandler.insert(\'&chembond2;\', {inputmode: 3})'},
{id: 'Popup_Chemical_3',    view: '<span style="position: relative;" ><span style="position: absolute; top: -50%;">&#x2500;</span><span style="position: absolute; top: -20%;">&#x2500;</span><span style="position: absolute; top:  10%;">&#x2500;</span><span style="opacity: 0.0;">&#x2500;</span></span>',  command: null,    title: '３重結合',  mathlevel: 1,   func: 'AssistHandler.insert(\'&chembond3;\', {inputmode: 3})'},
{id: 'Popup_Chemical_4',    view: '<span style="position: relative;" ><span style="position: absolute; top: -50%;">&#x2500;</span><span style="position: absolute; top: -30%;">&#x2500;</span><span style="position: absolute; top: -10%;">&#x2500;</span><span style="position: absolute; top:  10%;">&#x2500;</span><span style="opacity: 0.0;">&#x2500;</span></span>',  command: null,    title: '４重結合',  mathlevel: 1,   func: 'AssistHandler.insert(\'&chembond4;\', {inputmode: 3})'},
{id: 'Popup_Chemical_5',    view: '<span style="position: relative;" ><span style="position: absolute; top: -50%;">&#x2500;</span><span style="position: absolute; top: -35%;">&#x2500;</span><span style="position: absolute; top: -20%;">&#x2500;</span><span style="position: absolute; top:  -5%;">&#x2500;</span><span style="position: absolute; top:  10%;">&#x2500;</span><span style="opacity: 0.0;">&#x2500;</span></span>',  command: null,    title: '５重結合',  mathlevel: 1,   func: 'AssistHandler.insert(\'&chembond5;\', {inputmode: 3})'},
{id: 'Popup_Chemical_6',    view: '<span style="position: relative;" ><span style="position: absolute; top: -50%;">&#x2500;</span><span style="position: absolute; top: -38%;">&#x2500;</span><span style="position: absolute; top: -26%;">&#x2500;</span><span style="position: absolute; top: -14%;">&#x2500;</span><span style="position: absolute; top:  -2%;">&#x2500;</span><span style="position: absolute; top:  10%;">&#x2500;</span><span style="opacity: 0.0;">&#x2500;</span></span>',  command: null,    title: '６重結合',  mathlevel: 1,   func: 'AssistHandler.insert(\'&chembond6;\', {inputmode: 3})'},
{id: 'Popup_Chemical_7',    view: '&uarr;',     command: null,    title: '上向き矢印',     mathlevel: 1,   func: 'AssistHandler.insert(\'&uarr;\', {inputmode: 3})'},
{id: 'Popup_Chemical_8',    view: '&darr;',     command: null,    title: '下向き矢印',     mathlevel: 1,   func: 'AssistHandler.insert(\'&darr;\', {inputmode: 3})'},
{id: 'Popup_Chemical_9',    view: '&xlarr;',    command: null,    title: '左矢印（伸縮可）',  mathlevel: 1,   func: 'AssistHandler.insert(\'&xlarr;\', {inputmode: 3, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Chemical_10',   view: '&xrarr;',    command: null,    title: '右矢印（伸縮可）',  mathlevel: 1,   func: 'AssistHandler.insert(\'&xrarr;\', {inputmode: 3, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Chemical_11',   view: '&xharr;',    command: null,    title: '左右矢印（伸縮可）',     mathlevel: 1,   func: 'AssistHandler.insert(\'&xharr;\', {inputmode: 3, type: LAYOUT_NODE_TYPE.UNDEROVER})'},
{id: 'Popup_Chemical_12',   view: 'm-',     command: null,    title: 'メラ',    mathlevel: 1,   func: 'AssistHandler.insert(\'m-\', {inputmode: 3})'},
{id: 'Popup_Chemical_13',   view: 'o-',     command: null,    title: 'オルト',   mathlevel: 1,   func: 'AssistHandler.insert(\'o-\', {inputmode: 3})'},
{id: 'Popup_Chemical_14',   view: 'p-',     command: null,    title: 'パラ',    mathlevel: 1,   func: 'AssistHandler.insert(\'p-\', {inputmode: 3})'},
              ],

        'Length' : [
{id: 'Popup_Length_1',  view: 'm',  command: null,  title: 'メートル(m)',   mathlevel: 1,   func: 'AssistHandler.insert(\'m\', {read: \'メートル\', accent: false,})'},
{id: 'Popup_Length_2',  view: 'cm',     command: null,  title: 'センチメートル(cm)',   mathlevel: 1,   func: 'AssistHandler.insert(\'cm\', {read: \'センチメートル\', accent: false,})'},
{id: 'Popup_Length_3',  view: 'km',     command: null,  title: 'キロメートル(km)',    mathlevel: 1,   func: 'AssistHandler.insert(\'km\', {read: \'キロメートル\', accent: false,})'},
{id: 'Popup_Length_4',  view: 'mm',     command: null,  title: 'ミリメートル(mm)',    mathlevel: 1,   func: 'AssistHandler.insert(\'mm\', {read: \'ミリメートル\', accent: false,})'},
                    ],
        'Area' : [
{id: 'Popup_Area_1',    view: '<img src="mathimage/unit_m2.png" height="17">',  command: null,  title: '平方メートル(m^2)',   mathlevel: 1,   func: 'AssistHandler.insert(\'m\', {read: \'平方メートル\', accent: false, sup: 2})'},
{id: 'Popup_Area_2',    view: '<img src="mathimage/unit_cm2.png" height="17">',     command: null,  title: '平方センチメートル(cm^2)',   mathlevel: 1,   func: 'AssistHandler.insert(\'cm\', {read: \'平方センチメートル\', accent: false, sup: 2})'},
{id: 'Popup_Area_3',    view: '<img src="mathimage/unit_km2.png" height="17">',     command: null,  title: '平方キロメートル(km^2)',    mathlevel: 1,   func: 'AssistHandler.insert(\'km\', {read: \'平方キロメートル\', accent: false, sup: 2})'},
{id: 'Popup_Area_4',    view: '<img src="mathimage/unit_mm2.png" height="17">',     command: null,  title: '平方ミリメートル(mm^2)',    mathlevel: 1,   func: 'AssistHandler.insert(\'mm\', {read: \'平方ミリメートル\', accent: false, sup: 2})'},
{id: 'Popup_Area_5',    view: 'ha',     command: null,  title: 'ヘクタール(ha)',     mathlevel: 1,   func: 'AssistHandler.insert(\'ha\', {read: \'ヘクタール\', accent: false,})'},
{id: 'Popup_Area_6',    view: 'a',  command: null,  title: 'アール(a)',    mathlevel: 1,   func: 'AssistHandler.insert(\'a\', {read: \'アール\', accent: false,})'},
                  ],
        'Volume' : [
{id: 'Popup_Volume_1',  view: '<img src="mathimage/unit_m3.png" height="17">',  command: null,  title: '立方メートル(m^3)',   mathlevel: 1,   func: 'AssistHandler.insert(\'m\', {read: \'立方メートル\', accent: false, sup: 3})'},
{id: 'Popup_Volume_2',  view: '<img src="mathimage/unit_cm3.png" height="17">',     command: null,  title: '立方センチメートル(cm^3)',   mathlevel: 1,   func: 'AssistHandler.insert(\'cm\', {read: \'立方センチメートル\', accent: false, sup: 3})'},
{id: 'Popup_Volume_3',  view: '<img src="mathimage/unit_km3.png" height="17">',     command: null,  title: '立方キロメートル(km^3)',    mathlevel: 1,   func: 'AssistHandler.insert(\'km\', {read: \'立方キロメートル\', accent: false, sup: 3})'},
{id: 'Popup_Volume_4',  view: '<img src="mathimage/unit_mm3.png" height="17">',     command: null,  title: '立方ミリメートル(mm^3)',    mathlevel: 1,   func: 'AssistHandler.insert(\'mm\', {read: \'立方ミリメートル\', accent: false, sup: 3})'},
{id: 'Popup_Volume_5',  view: '&#8467;',    command: null,  title: 'リットル(l)',   mathlevel: 1,   func: 'AssistHandler.insert(\'&#8467;\', {read: \'リットル\', accent: false,})'},
{id: 'Popup_Volume_6',  view: 'L',  command: null,  title: 'リットル(L)',   mathlevel: 1,   func: 'AssistHandler.insert(\'L\', {read: \'リットル\', accent: false,})'},
{id: 'Popup_Volume_7',  view: 'd&#8467;',   command: null,  title: 'デシリットル(dl)',    mathlevel: 1,   func: 'AssistHandler.insert(\'d&#8467;\', {read: \'デシリットル\', accent: false,})'},
{id: 'Popup_Volume_8',  view: 'dL',     command: null,  title: 'デシリットル(dL)',    mathlevel: 1,   func: 'AssistHandler.insert(\'dL\', {read: \'デシリットル\', accent: false,})'},
{id: 'Popup_Volume_9',  view: 'm&#8467;',   command: null,  title: 'ミリリットル(ml)',    mathlevel: 1,   func: 'AssistHandler.insert(\'m&#8467;\', {read: \'ミリリットル\', accent: false,})'},
{id: 'Popup_Volume_10',     view: 'mL',     command: null,  title: 'ミリリットル(mL)',    mathlevel: 1,   func: 'AssistHandler.insert(\'mL\', {read: \'ミリリットル\', accent: false,})'},
{id: 'Popup_Volume_11',     view: 'cc',     command: null,  title: 'cc',    mathlevel: 1,   func: 'AssistHandler.insert(\'cc\', {read: \'シーシー\', accent: false,})'},
                    ],
        'Angle' : [
{id: 'Popup_Angle_1',   view: '&ring;',     command: null,  title: '°(角度)',     mathlevel: 1,   func: 'AssistHandler.insert(\'&ring;\', {read: \'度\', accent: false,})'},
                   ],
        'Mass' : [
{id: 'Popup_Mass_1',    view: 'g',  command: null,  title: 'グラム(g)',    mathlevel: 1,   func: 'AssistHandler.insert(\'g\', {read: \'グラム\', accent: false,})'},
{id: 'Popup_Mass_2',    view: 'kg',     command: null,  title: 'キログラム(kg)',     mathlevel: 1,   func: 'AssistHandler.insert(\'kg\', {read: \'キログラム\', accent: false,})'},
{id: 'Popup_Mass_3',    view: 'mg',     command: null,  title: 'ミリグラム(mg)',     mathlevel: 1,   func: 'AssistHandler.insert(\'mg\', {read: \'ミリグラム\', accent: false,})'},
{id: 'Popup_Mass_4',    view: 't',  command: null,  title: 'トン(t)',     mathlevel: 1,   func: 'AssistHandler.insert(\'t\', {read: \'トン\', accent: false,})'},
                  ],
        'Temperature' : [
{id: 'Popup_Temperature_1',     view: '℃',  command: null,  title: '℃(度)',  mathlevel: 1,   func: 'AssistHandler.insert(\'℃\', {read: \'度\', accent: false,})'},
{id: 'Popup_Temperature_2',     view: '&ring;',     command: null,  title: '°(温度)',     mathlevel: 1,   func: 'AssistHandler.insert(\'&ring;\', {read: \'度\', accent: false,})'},
{id: 'Popup_Temperature_3',     view: '&ring;F',     command: null,  title: '°F(華氏)',    mathlevel: 1,   func: 'AssistHandler.insert(\'&ring;F\', {read: \'ファーレンハイト度\', accent: false,})'},
{id: 'Popup_Temperature_4',     view: 'K',  command: null,  title: 'K(絶対零度)',   mathlevel: 1,   func: 'AssistHandler.insert(\'K\', {read: \'ケルビン\', accent: false,})'},
                         ],
        'Time' : [
{id: 'Popup_Time_1',    view: 'sec',    command: null,  title: '秒(sec)',    mathlevel: 1,   func: 'AssistHandler.insert(\'sec\', {read: \'秒\', accent: false,})'},
{id: 'Popup_Time_2',    view: 's',  command: null,  title: '秒(s)',  mathlevel: 1,   func: 'AssistHandler.insert(\'s\', {read: \'秒\', accent: false,})'},
{id: 'Popup_Time_3',    view: 'min',    command: null,  title: '分(min)',    mathlevel: 1,   func: 'AssistHandler.insert(\'min\', {read: \'分\', accent: false,})'},
{id: 'Popup_Time_4',    view: 'm',  command: null,  title: '分(m)',  mathlevel: 1,   func: 'AssistHandler.insert(\'m\', {read: \'分\', accent: false,})'},
{id: 'Popup_Time_5',    view: 'h',  command: null,  title: '時(ジ)',  mathlevel: 1,   func: 'AssistHandler.insert(\'h\', {read: \'時\', accent: false,})'},
                  ],
        'Velocity' : [
{id: 'Popup_Velocity_1',    view: 'm/h',    command: null,  title: 'メートル毎時(m/h)',   mathlevel: 1,   func: 'AssistHandler.insert(\'m/h\', {read: \'メートル毎時\', accent: false,})'},
{id: 'Popup_Velocity_2',    view: 'km/h',   command: null,  title: 'キロメートル毎時(km/h)',    mathlevel: 1,   func: 'AssistHandler.insert(\'km/h\', {read: \'キロメートル毎時\', accent: false,})'},
{id: 'Popup_Velocity_3',    view: 'm/min',  command: null,  title: 'メートル毎分(m/min)',     mathlevel: 1,   func: 'AssistHandler.insert(\'m/min\', {read: \'メートル<マイ＿フン>\', accent: false,})'},
{id: 'Popup_Velocity_4',    view: 'cm/min',     command: null,  title: 'センチメートル毎分(cm/min)',     mathlevel: 1,   func: 'AssistHandler.insert(\'cm/min\', {read: \'センチメートル<マイ＿フン>\', accent: false,})'},
{id: 'Popup_Velocity_5',    view: 'km/min',     command: null,  title: 'キロメートル毎分(km/min)',  mathlevel: 1,   func: 'AssistHandler.insert(\'km/min\', {read: \'キロメートル<マイ＿フン>\', accent: false,})'},
{id: 'Popup_Velocity_6',    view: 'm/sec',  command: null,  title: 'メートル毎秒(m/sec)',     mathlevel: 1,   func: 'AssistHandler.insert(\'m/sec\', {read: \'メートル毎秒\', accent: false,})'},
{id: 'Popup_Velocity_7',    view: 'm/s',    command: null,  title: 'メートル毎秒(m/s)',   mathlevel: 1,   func: 'AssistHandler.insert(\'m/s\', {read: \'メートル毎秒\', accent: false,})'},
{id: 'Popup_Velocity_8',    view: 'cm/sec',     command: null,  title: 'センチメートル毎秒(cm/sec)',     mathlevel: 1,   func: 'AssistHandler.insert(\'cm/sec\', {read: \'センチメートル毎秒\', accent: false,})'},
{id: 'Popup_Velocity_9',    view: 'cm/s',   command: null,  title: 'センチメートル毎秒(cm/s)',   mathlevel: 1,   func: 'AssistHandler.insert(\'cm/s\', {read: \'センチメートル毎秒\', accent: false,})'},
{id: 'Popup_Velocity_10',   view: 'kt',     command: null,  title: 'ノット(kt)',   mathlevel: 1,   func: 'AssistHandler.insert(\'kt\', {read: \'ノット\', accent: false,})'},
{id: 'Popup_Velocity_11',   view: 'kn',     command: null,  title: 'ノット(kn)',   mathlevel: 1,   func: 'AssistHandler.insert(\'kn\', {read: \'ノット\', accent: false,})'},
                      ],
        'Science' : [
{id: 'Popup_Science_1',     view: 'MJ',     command: null,  title: 'メガジュール(MJ)',    mathlevel: 1,   func: 'AssistHandler.insert(\'MJ\', {read: \'メガジュール\', accent: false,})'},
{id: 'Popup_Science_2',     view: 'mSv',    command: null,  title: 'ミリシーベルト(mSv)',  mathlevel: 1,   func: 'AssistHandler.insert(\'mSv\', {read: \'ミリシーベルト\', accent: false,})'},
{id: 'Popup_Science_3',     view: '&ohm;',  command: null,  title: 'オーム(Ω)',    mathlevel: 1,   func: 'AssistHandler.insert(\'&ohm;\', {read: \'オーム\', accent: false,})'},
{id: 'Popup_Science_4',     view: 'C',  command: null,  title: 'クーロン(C)',   mathlevel: 1,   func: 'AssistHandler.insert(\'C\', {read: \'クーロン\', accent: false,})'},
{id: 'Popup_Science_5',     view: 'rad',    command: null,  title: 'ラジアン(rad)',     mathlevel: 1,   func: 'AssistHandler.insert(\'rad\', {read: \'<ラ’ジアン>\', accent: true,})'},
{id: 'Popup_Science_6',     view: 's',  command: null,  title: '秒(s)',  mathlevel: 1,   func: 'AssistHandler.insert(\'s\', {read: \'秒\', accent: false,})'},
{id: 'Popup_Science_7',     view: 'N',  command: null,  title: 'ニュートン(N)',  mathlevel: 1,   func: 'AssistHandler.insert(\'N\', {read: \'<ニュ’ートン>\', accent: true,})'},
{id: 'Popup_Science_8',     view: 'kgw',    command: null,  title: '重量キログラム(kgw)',  mathlevel: 1,   func: 'AssistHandler.insert(\'kgw\', {read: \'重量キログラム\', accent: false,})'},
{id: 'Popup_Science_9',     view: 'N/m',    command: null,  title: 'ニュートン毎メートル(N/m)',   mathlevel: 1,   func: 'AssistHandler.insert(\'N/m\', {read: \'<ニュ’ートン＿マイメ’ートル>\', accent: true,})'},
{id: 'Popup_Science_10',    view: 'Pa',     command: null,  title: 'パスカル(Pa)',  mathlevel: 1,   func: 'AssistHandler.insert(\'Pa\', {read: \'<パ’スカル>\', accent: true,})'},
{id: 'Popup_Science_11',    view: '<img src="mathimage/unit_Nps2.png" height="17">',    command: null,  title: 'ニュートン毎平方メートル(N/m^2)',   mathlevel: 1,   func: 'AssistHandler.insert(\'N/m\', {read: \'ニュートン毎平方メートル\', accent: false, sup: 2})'},
{id: 'Popup_Science_12',    view: 'atm',    command: null,  title: '気圧(atm)',   mathlevel: 1,   func: 'AssistHandler.insert(\'atm\', {read: \'気圧\', accent: false,})'},
{id: 'Popup_Science_13',    view: 'J',  command: null,  title: 'ジュール(J)',   mathlevel: 1,   func: 'AssistHandler.insert(\'J\', {read: \'<ジュ’ール>\', accent: true,})'},
{id: 'Popup_Science_14',    view: 'N&dot;m',    command: null,  title: 'ニュートンメートル(N・m)',    mathlevel: 1,   func: 'AssistHandler.insert(\'N&dot;m\', {read: \'<ニュートンメ’ートル>\', accent: true,})'},
{id: 'Popup_Science_15',    view: 'W',  command: null,  title: 'ワット(W)',    mathlevel: 1,   func: 'AssistHandler.insert(\'W\', {read: \'<ワ’ット>\', accent: true,})'},
{id: 'Popup_Science_16',    view: 'K',  command: null,  title: 'ケルビン(K)',   mathlevel: 1,   func: 'AssistHandler.insert(\'K\', {read: \'<ケ’ルビン>\', accent: true,})'},
{id: 'Popup_Science_17',    view: 'cal',    command: null,  title: 'カロリー(cal)',     mathlevel: 1,   func: 'AssistHandler.insert(\'cal\', {read: \'<カ’ロリー>\', accent: true,})'},
{id: 'Popup_Science_18',    view: 'J/K',    command: null,  title: 'ジュール毎ケルビン(J/K)',    mathlevel: 1,   func: 'AssistHandler.insert(\'J/K\', {read: \'ジュール毎ケルビン\', accent: false,})'},
{id: 'Popup_Science_19',    view: 'J/(g&dot;K)',    command: null,  title: 'ジュール毎グラム毎ケルビン(J/(g・K))',    mathlevel: 1,   func: 'AssistHandler.insert(\'J/(g&dot;K)\', {read: \'ジュール毎グラム毎ケルビン\', accent: false,})'},
{id: 'Popup_Science_20',    view: 'J/(kg&dot;K)',   command: null,  title: 'ジュール毎キログラム毎ケルビン(J/(kg・K))',     mathlevel: 1,   func: 'AssistHandler.insert(\'J/(kg&dot;K)\', {read: \'ジュール毎キログラム毎ケルビン\', accent: false,})'},
{id: 'Popup_Science_21',    view: '/K',     command: null,  title: '毎ケルビン(/K)',     mathlevel: 1,   func: 'AssistHandler.insert(\'/K\', {read: \'毎ケルビン\', accent: false,})'},
{id: 'Popup_Science_22',    view: 'Hz',     command: null,  title: 'ヘルツ(Hz)',   mathlevel: 1,   func: 'AssistHandler.insert(\'Hz\', {read: \'<ヘ’ルツ>\', accent: true,})'},
{id: 'Popup_Science_23',    view: '/s',     command: null,  title: '毎秒(/s)',    mathlevel: 1,   func: 'AssistHandler.insert(\'/s\', {read: \'<マイビョー>\', accent: true,})'},
{id: 'Popup_Science_24',    view: 'A&dot;s',    command: null,  title: 'アンペア秒(A・s)',    mathlevel: 1,   func: 'AssistHandler.insert(\'A&dot;s\', {read: \'アンペア秒\', accent: false,})'},
{id: 'Popup_Science_25',    view: 'A',  command: null,  title: 'アンペア(A)',   mathlevel: 1,   func: 'AssistHandler.insert(\'A\', {read: \'アンペア\', accent: false,})'},
{id: 'Popup_Science_26',    view: 'V',  command: null,  title: 'ボルト(V)',    mathlevel: 1,   func: 'AssistHandler.insert(\'V\', {read: \'ボルト\', accent: false,})'},
{id: 'Popup_Science_27',    view: 'J/C',    command: null,  title: 'ジュール毎クーロン(J/C)',    mathlevel: 1,   func: 'AssistHandler.insert(\'J/C\', {read: \'ジュール毎クーロン\', accent: false,})'},
{id: 'Popup_Science_28',    view: 'V/A',    command: null,  title: 'ボルト毎アンペア(V/A)',     mathlevel: 1,   func: 'AssistHandler.insert(\'V/A\', {read: \'ボルト毎アンペア\', accent: false,})'},
{id: 'Popup_Science_29',    view: '&ohm;&dot;m',    command: null,  title: 'オームメートル(Ω・m)',  mathlevel: 1,   func: 'AssistHandler.insert(\'&ohm;&dot;m\', {read: \'<オームメ’ートル>\', accent: true,})'},
{id: 'Popup_Science_30',    view: 'Wh',     command: null,  title: 'ワット時(Wh)',  mathlevel: 1,   func: 'AssistHandler.insert(\'Wh\', {read: \'ワット時\', accent: false,})'},
{id: 'Popup_Science_31',    view: 'km/s',   command: null,  title: 'キロメートル毎秒(km/s)',    mathlevel: 1,   func: 'AssistHandler.insert(\'km/s\', {read: \'キロメートル毎秒\', accent: false,})'},
{id: 'Popup_Science_32',    view: 'kJ',     command: null,  title: 'キロジュール',    mathlevel: 1,   func: 'AssistHandler.insert(\'kJ\', {read: \'<キロ’ジュール>\', accent: true,})'},
{id: 'Popup_Science_33',    view: 'mol',    command: null,  title: 'モル',    mathlevel: 1,   func: 'AssistHandler.insert(\'mol\', {read: \'<モ’ル>\', accent: true,})'},
{id: 'Popup_Science_34',    view: 'NA',     command: null,  title: 'エヌエー',  mathlevel: 1,   func: 'AssistHandler.insert(\'NA\', {read: \'<エヌエ’ー>\', accent: true,})'},
{id: 'Popup_Science_35',    view: 'mol/L',  command: null,  title: 'モル毎リットル',   mathlevel: 1,   func: 'AssistHandler.insert(\'mol/L\', {read: \'モル毎リットル\', accent: false,})'},
{id: 'Popup_Science_36',    view: '<img src="mathimage/unit_gpcm3.png" height="17">',   command: null,  title: 'グラム毎立方センチメートル',     mathlevel: 1,   func: 'AssistHandler.insert(\'g/cm\', {read: \'グラム<マイ>立方センチメートル\', accent: false, sup: 3})'},
{id: 'Popup_Science_37',    view: 'kJ/mol',     command: null,  title: 'キロジュール毎モル',     mathlevel: 1,   func: 'AssistHandler.insert(\'kJ/mol\', {read: \'キロジュール毎モル\', accent: false,})'},
{id: 'Popup_Science_38',    view: 'pH',     command: null,  title: 'ピーエイチ',     mathlevel: 1,   func: 'AssistHandler.insert(\'pH\', {read: \'<ピーエイチ>\', accent: true,})'},
                     ],
        'Acceleration' : [
{id: 'Popup_Acceleration_1',    view: '<img src="mathimage/unit_mps2.png" height="17">',    command: null,  title: 'メートル毎秒毎秒(m/s^2)',   mathlevel: 1,   func: 'AssistHandler.insert(\'m/s\', {read: \'メートル毎秒毎秒\', accent: false, sup: 2})'},
                          ],
};


