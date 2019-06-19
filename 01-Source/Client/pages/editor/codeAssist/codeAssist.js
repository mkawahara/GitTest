/**
 * codeAssist.js
 *
 * 入力支援機能のための部品とデータを管理します。
 *
 */


/*==========================================================*/
/* CodeAssist クラス */
/*==========================================================*/

/****************************************************************
 * CodeAssistクラスのコンストラクタです。
 * @param id    コンテンツを作成する div タグの ID
 * @param rowCount  表示する行数（省略時は定数ROW_COUNT）
 */
function CodeAssist(id, rowCount) {
    // プライベートメンバ変数を初期化します
    this._key = '#' + id;                   // DOM 要素を特定するためのキー
    this._assistData = null;                // 入力支援内容を定義するデータ
    this._assistIndexes = null;             // 入力支援内容の検索を高速化するためのインデックスデータ
    this._showRows = (rowCount === undefined) ? CodeAssist.consts.ROW_COUNT : rowCount;   // 表示する行数
    this.visibleDate = null;                // 入力支援が表示された時間

    // 公開メンバ変数を初期化します
    this.selectedIndex = -1;                // 選択されているインデックス
    this.topIndex = 0;                      // 表示されている先頭データのインデックス

}

/*--------------------------------------------------------------------------*/
/* 定数 */
/*--------------------------------------------------------------------------*/

CodeAssist.consts = {
        ID_INPUT: 'CA_innerInput',        // 入力テキストボックスの ID
        ID_DIV: 'CA_innerDiv',            // 入力支援内容を表示するテーブルを子要素にもつ div の ID
        ID_TBODY: 'CA_innerTableBody',    // 入力支援内容を表示するテーブル Body の ID
        ID_PREFIX_TR: 'CA_innerTableTr_', // 入力支援内容を表示するテーブル行の ID
        ID_PREFIX_TD: 'CA_innerTableTd_', // 入力支援内容を表示するテーブル行の ID
        ROW_COUNT: 10,                    // 一度に表示する行数
        SELECTED_COLOR: '#AACCFF',        // 選択状態の背景色
};
CodeAssist.keys = {
        INPUT: '#' + CodeAssist.consts.ID_INPUT,
        DIV: '#' + CodeAssist.consts.ID_DIV,
        TBODY:'#' + CodeAssist.consts.ID_TBODY,
        PREFIX_TR: '#' + CodeAssist.consts.ID_PREFIX_TR,
};

/*--------------------------------------------------------------------------*/
/* 初期化 */
/*--------------------------------------------------------------------------*/

/**
 * 入力支援データを初期化します
 */
CodeAssist.prototype._initialize = function() {
    // データを設定します
    this._assistData = InputData.getCodeAssistData();
    this._assistIndexes = CodeAssist._getIndexes(this._assistData);

    // 表示行数はデータ数以下となることを保証します
    this._showRows = Math.min(this._assistData.length, this._showRows);

    // DOM 要素を構築します
    this._setupDOMElements();

    // 初期状態は非表示です
    this.setVisible(false, 0, 0, false); // 入力領域へのフォーカス移動要求は不要

};

/**
 * 検索用のインデックスを取得します。
 */
CodeAssist._getIndexes = function(assistData) {
    var indexes = {};
    var command, key1, key2;
    for (var i=0; i<assistData.length; i++) {
        command = assistData[i].command;
        // 最初の文字が「\」であることを考慮して、3文字目まで検索するものとします
        if (command.length >= 1) key1 = command.substr(0,1).toLowerCase();
        if (command.length >= 2) key2 = command.substr(0,2).toLowerCase();
        if (command.length >= 3) key3 = command.substr(0,3).toLowerCase();

        // 1文字目までがヒットするインデックスを保存します
        if (command.length >= 1 && (key1 in indexes) === false) {
            indexes[key1] = i;
        }
        // 2文字目までがヒットするインデックスを保存します
        if (command.length >= 2 && (key2 in indexes) === false) {
            indexes[key2] = i;
        }
        // 3文字目までがヒットするインデックスを保存します
        if (command.length >= 3 && (key3 in indexes) === false) {
            indexes[key3] = i;
        }
    }
    return indexes;
};

/**
 * DOM 要素を構築します。
 */
CodeAssist.prototype._setupDOMElements = function() {
    this._setupInput(); // 入力フィールド
    this._setupTable(); // 入力支援内容表示用テーブル
};

/**
 * 入力フィールドを構築します。
 */
CodeAssist.prototype._setupInput = function() {
    // 入力フィールドを生成します
    var input = $('<input>').attr({
        id:     CodeAssist.consts.ID_INPUT,
        type:   'text',
    });

    // イベントハンドラを設定します
    input.keydown( {src: this}, CodeAssist.onKeyDown );
    input.keyup( {src:this}, CodeAssist.onKeyUp );

    // 表示のきっかけとなった「\」の入力は無効とするための仕掛けを設定します
    var codeAssist = this;
    input[0].addEventListener('input', function(evt) { CodeAssist.onInput(evt, codeAssist); });

    // 入力支援の外部をクリックしたら非表示にします
    if (document.getElementById('EDT_MasterLayer') != null) {
        // エディタペインのクリックでは、非表示後に入力領域へフォーカスします
        $('#EDT_MasterLayer').click({src:this}, function(event){
            CodeAssist.onOutSideClick(event, true);
        });
        // インデックスペインとセクションタイトル部分のクリックでは、非表示にしますが入力領域へフォーカスしません
        $('#IndexOpeArea').click({src:this}, function(event){
            CodeAssist.onOutSideClick(event, false);
        });
        $('#ST_MasterLayer').click({src:this}, function(event){
            CodeAssist.onOutSideClick(event, false);
        });
    }
    else {
        // 検索ダイアログでは body 全体に非表示にするイベントハンドラを設定します
        $('body').click({src:this}, function(event){
            CodeAssist.onOutSideClick(event, true);
        });
    }

    // 要素に追加します
    $(this._key).append(input);
};

/**
 * テキストが入力されたときのイベントハンドラです。
 * 入力支援が表示されたときに「\\」となることを回避するための仕掛けです。
 */
CodeAssist.onInput = function(event, codeAssist) {
    if (codeAssist == null || codeAssist.visibleDate == null) return;

    // 入力支援ポップアップが表示されてから非常に近い（100ミリ秒以内）の「\」入力は無視します
    var value = codeAssist.getInputValue(); // 入力フィールドの値
    if (new Date() - codeAssist.visibleDate < 100 &&
            (value == '\\' || value == '\\\\')) {
        codeAssist.setInputValue('\\');
        event.preventDefault();
        event.stopPropagation();
    }
}

/**
 * 入力支援領域の外側をクリックされたときのイベントハンドラです。
 * 入力支援のポップアップを非表示にします。
 * @param event         イベントオブジェクト(event.data.srcにCodeAssistオブジェクト）
 * @param inputFocus    非表示後、エディタペインの入力用領域にフォーカスするかどうか
 */
CodeAssist.onOutSideClick = function(event, inputFocus) {
    // クリックされた要素が入力支援の部品でなければ、非表示にします
    if (event.target.id.indexOf('CA_inner') != 0) {
        var codeAssist = event.data.src;
        codeAssist.setVisible(false, 0, 0, inputFocus);  // 非表示設定
    }
};

/**
 * 入力支援の内容を表示するテーブルを DIV タグの中に構築します。
 */
CodeAssist.prototype._setupTable = function() {
    // div 要素を生成します
    var div = $('<div>').attr('id', CodeAssist.consts.ID_DIV);

    // table要素を生成します
    var table = $('<table>').append($('<tbody>').attr('id', CodeAssist.consts.ID_TBODY));
    table.disableSelection();   // 選択無効

    // データ分だけテーブルに行を追加します
    const PREFIX_TR = CodeAssist.consts.ID_PREFIX_TR;
    const PREFIX_TD = CodeAssist.consts.ID_PREFIX_TD;
    var tr, data;
    for (var i=0; i<this._assistData.length && i<this._showRows; i++) {
        data = this._assistData[i];

        // 行要素を生成します
        tr = $('<tr>').attr('id', PREFIX_TR + i);

        // マウスクリックイベントのハンドラを登録します
        tr.click( {src:this}, CodeAssist.onTrClick );

        // 列を追加します
        tr.append($('<td>').attr({
            id: PREFIX_TD + 'view' + i,
            style: 'text-align: center; width:40%;',
        }).append(data.view));

        tr.append($('<td>').attr({
            id: PREFIX_TD + 'command' + i
        }).append(data.command));

        // テーブルに行を追加します
        table.append(tr);
    }

    // 要素を追加します
    div.append(table);
    $(this._key).append(div);

};

/*--------------------------------------------------------------------------*/
/* 公開メソッド */
/*--------------------------------------------------------------------------*/

/**
 * 入力支援の表示/非表示を設定します。
 * @param visible       表示・非表示 (true/false)
 * @param x             表示するときのX座標（省略可）
 * @param y             表示するときのY座標（省略可）
 * @param inputFocus    非表示にするとき、エディタペインの入力領域へフォーカス移動するかどうか（省略可、true/fase）
 */
CodeAssist.prototype.setVisible = function(visible, x, y, inputFocus) {
    if (visible) {  // 表示
        if (this._assistData == null) {
            this._initialize();
        }
        this.visibleDate = new Date();
        $(this._key).css('visibility', 'visible');
        $(this._key).css('top', y);
        $(this._key).css('left', x);
        $(CodeAssist.keys.INPUT).focus();
        $(CodeAssist.keys.INPUT).val('\\');
    }
    else {          // 非表示
        this.select(-1);            // 選択状態を初期化
        $(CodeAssist.keys.INPUT).val('');  // 入力文字列を初期化
        $(this._key).css('visibility', 'hidden');
        if (inputFocus === undefined || inputFocus === true) {
            ViewManager.getEditorPane().FocusFrontTextBox();
        }
        this.visibleDate = null;
    }
};


/*--------------------------------------------------------------------------*/
/* イベントハンドラからアクセスするメソッド */
/*--------------------------------------------------------------------------*/

/**
 * 入力フィールドの文字列を取得します。
 */
CodeAssist.prototype.getInputValue = function() {
    return $(CodeAssist.keys.INPUT).val();
};

/**
 * 入力フィールドに文字列を設定します。
 */
CodeAssist.prototype.setInputValue = function(value) {
    $(CodeAssist.keys.INPUT).val(value);
};

/**
 * 入力支援の特定の行を選択します。
 */
CodeAssist.prototype.select = function(index) {
    if (this._assistData == null ||index < -1 || index >= this._assistData.length) return; // 初期化のために -1 のみ許容

    // テーブル行の背景色を設定します
    for (var i=0; i<this._showRows; i++) {
        var color = (i == index - this.topIndex) ? CodeAssist.consts.SELECTED_COLOR : 'white';
        $(CodeAssist.keys.PREFIX_TR + i).css('background-color', color);
    }

    // 入力フィールドに command を設定します
    if (index >= 0 && index < this._assistData.length) {
        this.setInputValue(this._assistData[index].command);

        // 「\」以降の文字列を選択します
        var input = $(CodeAssist.keys.INPUT);
        input.prop('selectionStart', 1);
        input.prop('selectionEnd', input.val().length);

        // 入力フィールドにフォーカスします
        input.focus();
    }

    // インデックスを保存します
    this.selectedIndex = index;
}

/**
 * 一番上に表示するデータのインデックスを設定し、必要であれば
 * 表示データの内容を更新します。
 */
CodeAssist.prototype.setTopIndex = function(topIndex) {
    // 範囲内のインデックスであることを保証します
    topIndex = Math.max(0, topIndex);
    topIndex = Math.min(this._assistData.length - this._showRows, topIndex);

    // 現在の値と同じであれば、何もしません
    if (this.topIndex === topIndex) return;

    // 表示を更新します
    const PREFIX_VIEW = CodeAssist.consts.ID_PREFIX_TD + 'view';
    const PREFIX_COMMAND = CodeAssist.consts.ID_PREFIX_TD + 'command';
    for (var i=0; i<this._showRows; i++) {
        // データを取得します
        var data = this._assistData[topIndex + i];

        // HTMLを更新します
        document.getElementById(PREFIX_VIEW + i).innerHTML = data.view;
        document.getElementById(PREFIX_COMMAND + i).innerHTML = data.command;
    }

    // インデックスを保存します
    this.topIndex = topIndex;
};

/**
 * 入力されている文字と前方一致するデータのインデックスを取得します。
 * 空文字や、一致するデータが存在しないときは-1を返します。
 */
CodeAssist.prototype.findIndex = function() {
    var value = this.getInputValue().toLowerCase();    // 検索は大文字小文字を区別しません
    if (value == '') return -1;

    // 最大3文字の検索キーを取得します
    var key;
    if (value.length <= 3) key = value;
    else  key = value.substr(0, 3);

    // 前方一致でデータ検索してインデックスを返します
    if (key in this._assistIndexes) {
        // まずは、保存したインデックスで検索開始位置を取得します
        var index = this._assistIndexes[key];

        // 入力文字が3文字より大きいときは、前方一致するデータを順に探します
        if (value.length > 3) {
            var command;
            for (var i=index; i<this._assistData.length; i++) {
                command = this._assistData[i].command.toLowerCase();

                // 検索キーと異なる文字から始まるコマンド文字になったら、一致データは存在しません
                // ※データは辞書順にソートされている前提です
                if (command.length < key.length || command.substr(0, key.length) !== key) {
                    index = -1;
                    break;
                }

                // 前方一致したときはインデックスを更新して検索を終了します
                if (value === command.substr(0, value.length)) {
                    index = i;
                    break;
                }

                // 最後のデータでここまでくるときは、一致データは存在しません
                if (i === this._assistData.length - 1) index = -1;
            }
        }

        return index;
    }
    else {
        return -1;
    }
};

/**
 * 現在の選択状態で確定します。
 */
CodeAssist.prototype.fix = function() {
    if (this.selectedIndex < 0 || this.selectedIndex >= this._assistData.length) {
        // 選択ができていないとき、完全一致するデータがあれば実行します
        var value = this.getInputValue();
        $.each(this._assistData, function(i, data) {
            if (data.command == value) {
                eval(data.func);
                return false // break
            }
        });
        // TODO 一致するデータがないとき
    }
    else {
        // 選択行で定義された命令文を実行します
        eval(this._assistData[this.selectedIndex].func);
    }

    // 非表示にします
    this.setVisible(false);
}


/*--------------------------------------------------------------------------*/
/* データを選択するイベントハンドラ */
/*--------------------------------------------------------------------------*/

CodeAssist.onKeyDown = function(event) {
    var codeAssist = event.data.src;

    // Esc : 非表示にします
    if (event.keyCode == 27) {
        codeAssist.setVisible(false);
        event.preventDefault();
    }
    // ↑ or ↓ : 選択行をずらします
    if (event.keyCode == 38 || event.keyCode == 40) {
        // ↑：選択行を上にずらします
        if (event.keyCode == 38 && codeAssist.selectedIndex > 0) {
            // 一番上が選択されているときは表示を更新します
            if (codeAssist.selectedIndex === codeAssist.topIndex) {
                codeAssist.setTopIndex(codeAssist.topIndex - 1);
            }
            // 一つ前のデータを選択します
            codeAssist.select(codeAssist.selectedIndex - 1);
        }
        // ↓：選択行を下にずらします
        else if (event.keyCode == 40 && codeAssist.selectedIndex < codeAssist._assistData.length) {
            // 選択されていないときは、表示されている一番上の行を選択します。
            if (codeAssist.selectedIndex == -1) {
                codeAssist.select(codeAssist.topIndex);
            }
            // 選択されているときは、一つ後のデータを選択します
            else {
                // 一番下が選択されているときは表示を更新します
                if (codeAssist.selectedIndex === codeAssist.topIndex + codeAssist._showRows - 1) {
                    codeAssist.setTopIndex(codeAssist.topIndex + 1);
                }
                // 一つ後のデータを選択します
                codeAssist.select(codeAssist.selectedIndex + 1);
            }
        }
        event.preventDefault();
    }
    // Enter or Space : 決定
    else if (event.keyCode == 13 || event.keyCode == 32) {
        codeAssist.fix();
        event.preventDefault();
    }
}

CodeAssist.onKeyUp = function(event) {
    var codeAssist = event.data.src;
    var value = codeAssist.getInputValue(); // 入力フィールドの値

    console.log('CodeAssist onKeyUp : value=「'+value + '」, keyCode='+event.keyCode
            + ", visible time = " + (new Date() - codeAssist.visibleDate) + ' ms');

    // テキストが空になったら非表示にします
    if (value == '' && (event.keyCode == 8 || event.keyCode == 46)) {
        codeAssist.setVisible(false);
        return;
    }

    // 入力内容が選択行と異なる場合は、選択を解除します
    var index = codeAssist.selectedIndex;
    if (index >= 0 && value != codeAssist._assistData[index].command) {
        codeAssist.select(-1);
    }

    // 上下矢印以外では、入力内容で表示更新します
    if (event.keyCode == 38 || event.keyCode == 40) return;
    var index = codeAssist.findIndex();
    if (index !== -1) {
        // 前方一致するデータを一番上に表示します
        codeAssist.setTopIndex(index);
    }
}

CodeAssist.onTrClick = function(event) {
    // クリックされた行のインデックスを取得します
    var clickedIndex = $(this).index();

    // 取得した行を選択します
    var codeAssist = event.data.src;
    codeAssist.select(clickedIndex + codeAssist.topIndex);
}



