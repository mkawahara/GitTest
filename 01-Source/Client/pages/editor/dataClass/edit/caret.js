/**
 * キー操作でキャレット移動するクラスです。
 */
function Caret(pane) {
    this.pane = pane;            // カーソルが配されるペイン
    this.positionId = '';        // カーソル位置
    this.baseLeft = null;        // 上下移動の横方向基準位置（ノードIDと座標）
    this.prevUpDown = Caret.UPDOWN_MODE.none; // 前回のカーソル移動で上下移動したか

    this.prevNodeId = null;
    this.parentGroupId = null;
};

/**
 * 行をまたぐ上下移動に関するモードを定義する列挙型です。
 */
Caret.UPDOWN_MODE = {
        none:   0,  // なし
        up:     1,  // 上の行へ移動
        down:   2,
};

/////////////////////////////////////////////////////////////////////
// キャレットの位置設定
/////////////////////////////////////////////////////////////////////

/**
 * pos プロパティ：読み書き可
 * カーソルの位置をデータノード ID にて保持します。
 */
Object.defineProperty(Caret.prototype, 'pos', {
	enumerable: true,
	configurable: true,
	get: function(){
//        console.log('caret.get-pos: ' + this.positionId);
			return this.positionId;
	},
	set: function(value){
		this.positionId = value;

		// セクションを取得し、カーソルの左位置ならびに親グループを取得します
        var section = DocumentManager.getCurrentSection();
        var currentNode = $(section).find('#' + this.positionId);
        if (currentNode.length == 0) {
        	console.warn('カーソル位置に指定されたノードが現在のセクションから取得できませんでした。');
        	return;
        }
        if (currentNode[0].previousSibling != null) {
        	this.prevNodeId = currentNode[0].previousSibling.id;
        }
        else {
        	this.prevNodeId = null;
        }
        this.parentGroupId = currentNode[0].parentNode.id;

        //console.log('Current: ' + this.positionId + ', Prev: ' + this.prevNodeId + ', Parent: ' + this.parentGroupId);
	},
});

/**
 * prev プロパティ：取得のみ
 * カーソルの位置をデータノード ID にて保持します。
 */
Object.defineProperty(Caret.prototype, 'prev', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.prevNodeId;
	},
});

/**
 * parent プロパティ：取得のみ
 * カーソルの位置をデータノード ID にて保持します。
 */
Object.defineProperty(Caret.prototype, 'parent', {
	enumerable: true,
	configurable: true,
	get: function(){
		return this.parentGroupId;
	},
});


/////////////////////////////////////////////////////////////////////
// キー操作に伴う移動先の決定
/////////////////////////////////////////////////////////////////////
/**
 * 左へとカーソルを移動します。
 * @param section    現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftLeft = function(section) {
    return this.shiftLeftRight(section, true, Caret.isSelecting());
}

/**
 * 右へとカーソルを移動します。
 * @param section    現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftRight = function(section) {
    return this.shiftLeftRight(section, false, Caret.isSelecting());
}

/**
 * 左右へカーソルを移動します。
 * @param section   現在のセクションへの参照
 * @param isLeft    true: 左への移動、false: 右への移動
 * @param rangeSelecting    範囲選択中であれば true
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftLeftRight = function(section, isLeft, rangeSelecting) {
    // カーソルが存在するデータノードを取得します
    var currentNode = Caret.getCurrentNode(this, section);
    DataClass.bindDataClassMethods(currentNode);

    // データレベルでのカーソル移動処理を行います
    // 範囲選択では兄弟ノードへ移動します
    var nextNodeId = null;
    var brotherNode = isLeft ? currentNode.previousSibling : currentNode.nextSibling;
    if (rangeSelecting == true && brotherNode != null) nextNodeId = brotherNode.id;
    else {
		try {
		nextNodeId = isLeft ? currentNode.shiftLeft() : currentNode.shiftRight();
		}
		catch(e) {
			console.log(currentNode);
		}
	}

    if (nextNodeId !== null) {
        // データレベルでのカーソル移動に成功した場合
        // 結果を反映します
        this.positionId = nextNodeId;
    } else {
        // データレベルでのカーソル移動処理に失敗した場合
        // 前の段落への移動を行います。
        // 前の段落が存在しない場合、移動は行われません。
        var paraNode = DataClass.getRootParagraph(currentNode);

        var brotherParaNode = isLeft ? paraNode.previousSibling : paraNode.nextSibling;

        // 兄弟段落が取得できた場合、そこにカーソルを移動します
        if (brotherParaNode !== null) {
            // 兄第ノードの終端を取得します
            var preNode = paraNode.previousSibling;
            DataClass.bindDataClassMethods(brotherParaNode);
            nextNodeId = isLeft ? brotherParaNode.getLastPos() : brotherParaNode.getFirstPos();

            // 結果を反映します
            this.positionId = nextNodeId;
        }
        // 兄弟段落が取得できなかった場合、セクションを超えて段落を検索します
        // ただし、範囲選択中はセクションは超えません
        else if (!rangeSelecting){
        	nextNodeId = this._getNeighbourSectionNode(section, isLeft);
        	if (nextNodeId !== null) this.positionId = nextNodeId;
        }
    }

    // 上下移動の横方向基準位置と行をまたぐカーソル移動がなかったことを保存します
    this.clearUpDownMode();

    // 結果を返します
    return nextNodeId;
};

/**
 * 指定セクションの隣のセクションから新しいカーソル位置を取得します
 * 取得できなければ null を返します
 * 取得成功時は、カレントセクションを変更し、表示の更新を予約します
 */
Caret.prototype._getNeighbourSectionNode = function(section, isLeft) {
	var currentSection = section;
    var brotherSection = isLeft ? currentSection.previousSibling : currentSection.nextSibling;

    // 兄弟セクションが取得できなければ何もしません
    if (brotherSection === null) return null;

	// セクションの切替に伴う表示更新を予約します
	var shiftIndex = isLeft ? -1 : 1;
	var nextSectionIndex = DocumentManager.getCurrentSectionIndex() + shiftIndex;
	DocumentManager.setCurrentSection(nextSectionIndex);
	IndexToolClass.moveSectionWithIndex(nextSectionIndex);
	ViewManager.getRenderer().setUpdateSectionPane();
	ViewManager.getRenderer().setUpdateEditorPane();
	ViewManager.getRenderer().cancelCaretAutoUpdate();

    // 兄弟セクションにカーソルを移動します
	if (isLeft) {
		return brotherSection.lastChild.lastChild.id;
	}
	else {
		return brotherSection.firstChild.firstChild.id;
	}
}


/**
 * 上へとカーソルを移動します。
 * @param section      現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftUp = function(section) {
	return this.shiftUpDown(section, true, Caret.isSelecting());
};

/**
 * 下へとカーソルを移動します。
 * @param section      現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftDown = function(section) {
	return this.shiftUpDown(section, false, Caret.isSelecting());
};

/**
 * 上下へとカーソルを移動します。
 * @param section   現在のセクションへの参照
 * @param isUp      true:上へ移動、false:下へ移動
 * @param rangeSelecting    範囲選択中であれば true
 * @returns         移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftUpDown = function(section, isUp, rangeSelecting) {

    // カーソルが存在するデータノードを取得します
    var currentNode = Caret.getCurrentNode(this, section);

    // 範囲選択中でなく、ひとつ前の移動が行をまたぐ上下移動でなければ、
    // データレベルでのカーソル移動処理を行います
    var nextNodeId = null;
    var updown = isUp ? Caret.UPDOWN_MODE.up : Caret.UPDOWN_MODE.down;
    if (rangeSelecting != true && updown != this.prevUpDown) {
        nextNodeId = isUp ? currentNode.shiftUp() : currentNode.shiftDown();
    }

    // データレベルでのカーソル移動に成功した場合
    if (nextNodeId !== null) {
        // 結果を反映します
        this.positionId = nextNodeId;

        // 行をまたぐカーソル移動がなかったことを保存します
        this.prevUpDown = Caret.UPDOWN_MODE.none;

        return nextNodeId;
    }
    // データレベルでのカーソル移動に失敗した場合
    else {
        // 横方向基準位置の整合性を確認します
        if (this.baseLeft) {
            var baseNode = document.getElementById(this.baseLeft.id);
            if (baseNode) {
                var currentBaseRect = this.getRectInPane(baseNode);

                // スクロールなどで移動している場合は、現在のカーソル位置を基準とします
                if (currentBaseRect.left != this.baseLeft.value) {
                    this.registerBaseLeft();
                }
            }
            else { this.registerBaseLeft(); }
        }
        else { this.registerBaseLeft(); }

        // 移動先の候補となるノードのリストを取得します -----------------------------
        // 同じ段落内で次の行になる場合（表構造のセル移動 → 段落内折り返し） → 次の段落
        var nodeList = this._getNextMovableParagraphList(currentNode, isUp);

        // 移動先候補がある場合：
        if (nodeList.length > 0) {
	        // 最も近いノードを移動先として採用します -----------------------------------
	        var paneRect = this.pane.getBoundingClientRect();   // エディタペインの矩形

	        // 横座標が最も近いノードのインデックスを取得します
	        var min, minIndex;
	        for (var i = 0; i < nodeList.length; i++) {
	            // エディタペイン上の矩形領域を取得します
	            var htmlNode = document.getElementById(nodeList[i].id);
	            var rect = this.getRectInPane(htmlNode, paneRect);

	            // 基準位置との横方向距離を計算し、最小値を更新します
	            var distanceX = Math.abs(rect.left - this.baseLeft.value);
	            if (i == 0 || distanceX < min) {
	                min = distanceX;
	                minIndex = i;
	            }
	        }

	        // 最寄りノードを取得します
	        nextNodeId = nodeList[minIndex].id;
	        this.positionId = nextNodeId;

	        // 行をまたぐ移動があったことを保存します
	        this.prevUpDown = (isUp ? Caret.UPDOWN_MODE.up : Caret.UPDOWN_MODE.down);

	        return nextNodeId;
        }
        // 移動先候補がない場合：
        else {
        	// 範囲選択中であれば、移動失敗を表す null を返します
        	if (rangeSelecting) return null;

        	// 範囲選択中でなければ、隣接セクションへの移動を試みます
        	nextNodeId = this._getNeighbourSectionNode(section, isUp);
        	return nextNodeId;
        }
    }
}

/**
 * 次の行を構成する（＝移動先の候補となる）ノードのリストを取得します
 */
Caret.prototype._getNextMovableParagraphList = function(currentNode, isUp) {
    var nodeList = [];  // 次の行を構成する（＝移動先の候補となる）ノードのリスト

	// 行列、表でのセル移動を考慮します
	var cellNode = Caret.getAncestralCell(currentNode);
	if (cellNode) {
		var nextLineCell = Caret.getNextLineCell(cellNode, isUp);
		if (nextLineCell) {
			Caret.appendCandidate(nodeList, nextLineCell.children, isUp);
		}
	}

	// 段落の直近の子要素を調べます
	if (nodeList.length == 0) {
		var paraChild = currentNode;
		while (paraChild.parentNode != null && paraChild.parentNode.nodeName != 'PARAGRAPH') {
			paraChild = paraChild.parentNode;
		}
		var nextLineNodes = Caret.getNextLineNodes(paraChild, isUp);
		Caret.appendCandidate(nodeList, nextLineNodes, isUp);
	}

	// 次の段落を調べます
	// 折り返しを想定して、1行分のノードのみ取得します
	if (nodeList.length == 0) {
		var paraNode = DataClass.getRootParagraph(currentNode);
		var neighborParaNode = isUp ? paraNode.previousSibling : paraNode.nextSibling;
		if (neighborParaNode) {
			// 次行を検索する開始ノードを取得します
			var startNode = isUp ? neighborParaNode.lastChild : neighborParaNode.firstChild;
			if (startNode) {
				var nextLineNodes = Caret.getNextLineNodes(startNode, isUp, true);
				Caret.appendCandidate(nodeList, nextLineNodes, isUp);
			}
		}
	}

	return nodeList;
};

/**
 * 表構造のセル要素
 */
Caret.CELL_ELEMENT_NAMES = ['CMATCELL', 'CTD'];

/**
 * データの直近先祖の表セル要素のノードを取得します。
 * 戻り値は null になることがあります。
 */
Caret.getAncestralCell = function(dataNode) {
    while (dataNode) {
        if (Caret.CELL_ELEMENT_NAMES.indexOf(dataNode.nodeName) >= 0) {
            return dataNode;
        }
        else if (dataNode.nodeName == 'PARAGRAPH') return null;
        dataNode = dataNode.parentNode;
    }
    console.log('UpDown によるカーソル移動処理でここが実行されてはいけません。');
    return null;    // 通常はここに来ないはず
}

/**
 * テーブルのセルを出発点に、真下（または真上）のセルを次行として取得します。
 * @param current   検索の出発地点となるデータノード：表構造（表・行列・片括弧）の子要素
 * @param isUp      true:上移動、false:下移動
 */
Caret.getNextLineCell = function(current, isUp) {
    var brother = current;      // 兄弟ノード

    // 表構造はプロパティを使用できるようにしておきます
    var parentTable = null;
    if (Caret.CELL_ELEMENT_NAMES.indexOf(current.nodeName) >= 0) {
        parentTable = current.parentNode;
        DataClass.bindDataClassMethods(parentTable);
    }
    if (parentTable == null) return null;

    // 列数を取得します
    var cols = parentTable.colCount;

    // 列数分移動したセルが真上（または真下）です
    for(var i=0; i<cols; i++) {
        // 兄弟ノードを更新します
        brother = isUp ? brother.previousSibling : brother.nextSibling;
        if (brother == null) return null;
    }

    return brother;
}

/**
 * 兄弟間で上下方向に次の行となる要素のリストを取得します。
 * @param current   検索の出発地点となるデータノード：段落の子要素
 * @param isUp      true:上移動、false:下移動
 * @param nextLineFlg(デフォルトはfalse) trueにするとcurrentがすでに次の行内にあるものとして検索します
 */
Caret.getNextLineNodes = function(current, isUp, nextLineFlg) {
    var nodeList = [];
    var brother = current;      // 兄弟ノード
    var rectPrev = Caret.getHtmlRect(current);  // 一つ前に計算した画面矩形領域の保存用
    if (nextLineFlg === undefined) nextLineFlg = false;    // 兄弟ノードで次の行と判断できたかどうかのフラグ

    // 出発地点のノードが次の行にある場合は追加します
    if (nextLineFlg) nodeList.push(current);

    while (true) {
        // 兄弟ノードを更新します
        brother = isUp ? brother.previousSibling : brother.nextSibling;
        if (brother == null) break;

        // 兄弟ノードの領域座標を取得します
        var rect = Caret.getHtmlRect(brother);

        // 次行フラグを更新します
        if (nextLineFlg == false) {
            // 兄弟ノードで X 座標が順方向でない増減（上移動なら増加、下移動なら減少）をしたとき次の行とみなします
            if (nextLineFlg == false) {
                nextLineFlg = isUp ? rect.left > rectPrev.left : rect.left < rectPrev.left;
            }
        }

        // 1行分だけ必要なので、さらに次の行へ遷移するときは検索を終了します
        else {
            // 兄弟ノードで X 座標が順方向でない増減（上移動なら増加、下移動なら減少）をしたとき次の行とみなします
            if (isUp ? rect.left > rectPrev.left : rect.left < rectPrev.left) {
                break;
            }
        }

        // 次行フラグがたっていれば、兄弟をリストに追加します
        // ただし、表構造は隣接行のみなので列数分を最大数とします
        if (nextLineFlg) {
            nodeList.push(brother);
        }

        // 兄弟ノードの領域を次のループで使用できるように保存します
        rectPrev = rect;
    }
    return nodeList;
}

/**
 * 画面上に占める矩形領域を取得します。
 */
Caret.getHtmlRect = function(dataNode) {
    var htmlNode = document.getElementById(dataNode.id);
    return htmlNode ? htmlNode.getBoundingClientRect() : null;
}

/**
 * ボックス要素（行列、片括弧、表、囲み枠、ルビ、よみ）のデータノード名
 */
Caret.BOX_ELEMENT_NAMES = ['CMAT', 'COPEN', 'CCLOSE', 'CTABLE', 'DECO', 'CRUBY', 'READ'];
/**
 * 表要素（行列、片括弧、表）のデータノード名
 */
Caret.TABLE_ELEMENT_NAMES = ['CMAT', 'COPEN', 'CCLOSE', 'CTABLE'];

/**
 * 上下移動の候補となる要素を追加します。
 * ただし、 行列、片括弧、表、囲み枠、ルビ、よみは再起呼び出しにより
 * 内部のデータも取得します。
 * @param targetList    追加対象リスト
 * @param candList      追加したい候補ノードのリスト
 * @param isUp          true:上移動、false:下移動
 */
Caret.appendCandidate = function(targetList, candList, isUp) {
    var candNode;
    for (var i = 0; i < candList.length; i++) {
        candNode = candList[i];

        // ボックス要素は孫ノードを追加します
        if (Caret.BOX_ELEMENT_NAMES.indexOf(candNode.nodeName) >= 0) {
            range = [0, candNode.children.length];  // 子要素の範囲

            // 表構造は先頭または最後の行のみ追加対象とします
            if (Caret.TABLE_ELEMENT_NAMES.indexOf(candNode.nodeName) >= 0) {
                DataClass.bindDataClassMethods(candNode);
                // 行列の子要素1,2番目は添え字なので無視します
                var subcount = ('subCount' in candNode) ? candNode.subCount : 0;

                // 上移動なら最終行、下移動なら先頭行
                if (isUp) {
                    range[0] = subcount + candNode.colCount * (candNode.rowCount - 1);
                }
                else {
                    range[0] = subcount;
                    range[1] = subcount + candNode.colCount;
                }

            }
            Caret.appendGrandChildren(targetList, candNode, range);
        }
        // それ以外はそのまま追加します
        else {
            targetList.push(candNode);
        }
    }
}
/**
 * appendCandidate関数を使用することで、リストに孫要素を追加します。
 * @param targetList    追加対象リスト
 * @param parentLayout  孫要素を検索するレイアウトノード
 * @param range         追加対象としてよい子要素の範囲
 */
Caret.appendGrandChildren = function(targetList, parentLayout, range) {
    var childGroup; // 子要素はグループノード
    for (var i = range[0]; i < range[1]; i++) {
        childGroup = parentLayout.children[i];
        Caret.appendCandidate(targetList, childGroup.children);
    }
}


/**
 * 次の入力位置へとカーソルを移動します。
 * @param section    現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftEnter = function(section) {
    // カーソルが存在するデータノードを取得します
    var currentNode = Caret.getCurrentNode(this, section);

    // データレベルでのカーソル移動処理を行います
    var nextNodeId = currentNode.shiftByEnter();

    if (nextNodeId !== null) {
        // データレベルでのカーソル移動に成功した場合
        // 結果を反映します
        this.positionId = nextNodeId;
        this.clearUpDownMode();
        return nextNodeId;
    } else {
        // データレベルでのカーソル移動処理に失敗した場合
        // 何もしません。
        console.log('Enter によるカーソル移動処理でここが実行されてはいけません。');
        return null;
    }
};

/**
 * ベース位置へとカーソルを移動します。
 * @param section    現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftEsc = function(section) {
    // カーソルが存在するデータノードを取得します
    var currentNode = Caret.getCurrentNode(this, section);

    // データレベルでのカーソル移動処理を行います
    var nextNodeId = currentNode.shiftByEsc();

    if (nextNodeId !== null) {
        // データレベルでのカーソル移動に成功した場合
        // 結果を反映します
        this.positionId = nextNodeId;
        this.clearUpDownMode();
       return nextNodeId;
    } else {
        // データレベルでのカーソル移動処理に失敗した場合
        // 何もしません。
        return null;
    };
};

/**
 * 行先頭へとカーソルを移動します。
 * @param section    現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftHome = function(section) {
    // カーソルが存在するデータノードを取得します
    var currentNode = Caret.getCurrentNode(this, section);

    // データレベルでのカーソル移動処理を行います
    var nextNodeId = currentNode.shiftHome();

    // データレベルでのカーソル移動処理に失敗した場合
    // 行の先頭へ移動します
    if (nextNodeId == null) {

        // カーソルが存在するデータノードを取得します
        var currentNode = Caret.getCurrentNode(this, section);

        // 段落の直接の子要素になるまで親をたどります
        while (currentNode.parentNode != null && currentNode.parentNode.nodeName != 'PARAGRAPH') {
            currentNode = currentNode.parentNode;
        }

        // 段落の先頭であれば何もしません
        if (currentNode.previousSibling == null) return null;

        // 行の最初のデータノードを取得します
        var nextNode = currentNode; // 次にカーソルが来るべきデータノード
        var left = Caret.getHtmlRect(nextNode).left
        for (; nextNode.previousSibling != null; nextNode=nextNode.previousSibling) {
            // 水平方向座標が増加するときは、違う行と判定してループを中断します
            var leftNew = Caret.getHtmlRect(nextNode.previousSibling).left;
            if (leftNew > left) break;
            left = leftNew;
        }

        // 結果的に移動しない場合は何もしません
        if (currentNode.id == nextNode.id) return null;
        else nextNodeId = nextNode.id;

    }

    // 結果を反映して返します
    this.positionId = nextNodeId;
    this.clearUpDownMode();
    return nextNodeId;

};

/**
 * 行終端へとカーソルを移動します。
 * @param section    現在のセクションへの参照
 * @returns            移動先となるカーソル位置。移動失敗時はnull
 */
Caret.prototype.shiftEnd = function(section) {
    // カーソルが存在するデータノードを取得します
    var currentNode = Caret.getCurrentNode(this, section);

    // データレベルでのカーソル移動処理を行います
    var nextNodeId = currentNode.shiftEnd();

    // データレベルでのカーソル移動処理に失敗した場合
    // 行の末尾へ移動します ★カーソルが段落の子要素にある前提
    if (nextNodeId == null){

        // カーソルが存在するデータノードを取得します
        var currentNode = Caret.getCurrentNode(this, section);

        // 段落の直接の子要素になるまで親をたどります
        while (currentNode.parentNode != null && currentNode.parentNode.nodeName != 'PARAGRAPH') {
            currentNode = currentNode.parentNode;
        }

        // 段落の最後であれば何もしません
        if (currentNode.nextSibling == null) return null;

        // 行の最後のデータノードを取得します
        var nextNode = currentNode; // 次にカーソルが来るべきデータノード
        var left = Caret.getHtmlRect(nextNode).left
        for (; nextNode.nextSibling != null; nextNode=nextNode.nextSibling) {
            // 水平方向座標が減少するときは、違う行と判定してループを中断します
            var leftNew = Caret.getHtmlRect(nextNode.nextSibling).left;
            if (leftNew < left) break;
            left = leftNew;
        }

        // 結果的に移動しない場合は何もしません
        if (currentNode.id == nextNode.id) return null;
        else nextNodeId = nextNode.id;

    }

    // 結果を反映して返します
    this.positionId = nextNodeId;
    this.clearUpDownMode();
    return nextNodeId;
};


/**
 * IDを元にデータノードを取得します。
 * @param caret          カーソルを表すオブジェクト
 * @param section        現在のセクションへの参照
 */
Caret.getCurrentNode = function(caret, section) {
    // カーソルが存在するデータノードを取得します
    var currentNode = $(section).find('#' + caret.pos);

    if (currentNode.length == 0) {
        // カーソル位置ノードが削除されていた場合、兄あるいは親を介して位置を決定し直します
    	if (caret.prev != null) {
    		var prevNode = $(section).find('#' + caret.prev)[0];
    		currentNode = prevNode.nextSibling;
    	}
    	else {
    		var parentNode = $(section).find('#' + caret.parent)[0];
    		currentNode = parentNode.children[0];
    	}
		caret.pos = currentNode.id;
    }
    else {
    	// カーソル位置ノードが取得できた場合、jQuery > 通常ノード変換を行います
    	currentNode = currentNode[0];
    }

    DataClass.bindDataClassMethods(currentNode);

    return currentNode;
};

/**
 * 現在のカーソル位置を、上下移動の横方向基準位置として登録します
 */
Caret.prototype.registerBaseLeft = function() {
    var htmlNode = document.getElementById(this.positionId);
    if (htmlNode == null) return;
    this.baseLeft = {
            id:     this.positionId,                      // ノードID
            value:   this.getRectInPane(htmlNode).left,  // X座標
            };
};


/**
 * スクロールに依存しない、要素のエディタペインに対する相対位置での矩形を取得します。
 * @param htmlNode  位置を取得したいHTML要素
 * @paarm paneRect  エディタペインの矩形（省略可）
 */
Caret.prototype.getRectInPane = function(htmlNode, paneRect) {

    var elemRect = htmlNode.getBoundingClientRect();
    if (paneRect == null) paneRect = this.pane.getBoundingClientRect();

    // Window のスクロールは差分を取ることで除去されるので、エディタペインのスクロール量のみ
    // 加算して相対座標を計算します
    return {
        left:   Math.round(elemRect.left - paneRect.left + this.pane.scrollLeft),
        top:    Math.round(elemRect.top - paneRect.top + this.pane.scrollTop),
        width:  elemRect.width,
        height: elemRect.height,
    };
};

/**
 * 行をまたぐ上下移動のモードを解除します。
 *
 * ★行をまたぐ上下移動でないカーソル移動が発生した場合は必ず呼び出す必要があります。
 *
 */
Caret.prototype.clearUpDownMode = function() {
    // 行をまたぐ上下移動でないことを保存します
    this.prevUpDown = Caret.UPDOWN_MODE.none;

    // 上下移動の予行方向基準位置を登録します
    this.registerBaseLeft();
};


///////////////////////////////////////////////////////////////
// SelectedManager　から情報を取得するヘルパー関数
///////////////////////////////////////////////////////////////

/**
 * 選択範囲中かどうかを取得します。
 */
Caret.isSelecting = function() {
    return EditManager.getSelectedRangeManager().isSelecting;
};

///////////////////////////////////////////////////////////////
// カーソルの書式
///////////////////////////////////////////////////////////////

Caret.prototype.setCaretStyle = function(caretNode, fotmatData) {
	var temp = fotmatData['fontsize'];
	var fontSize = 0;
	if (temp === 'font-x-small') {
		fontSize = -2;
	} else if (temp === 'font-small') {
		fontSize = -1;
	} else if (temp === 'font-medium') {
		fontSize = 0;
	} else if (temp === 'font-large') {
		fontSize = 1;
	} else {
		fontSize = 2;
	}

	var temp = fotmatData.footnote;
	if (temp !== 0) {
		fontSize -= 2;
	}

	//var fontSizeList = ['xx-small', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large'];
	var fontSizeList = [0.482, 0.579, 0.694, 0.833, 1, 1.2, 1.44];
	//var fontSizeStr = fontSizeList[fontSize + 4];
	var fontSize = fontSizeList[fontSize + 4];

	var jHtmlNode = $('#' + this.pos);
	var nodeFontSize = jHtmlNode[0].style.fontSize;
	if (nodeFontSize !== '') {
		var ratio = Number(nodeFontSize.substr(0, nodeFontSize.length - 1));
		if (!isNaN(ratio)) fontSize *= (ratio / 100);
	}

	caretNode.style.fontSize = fontSize + 'rem';
	caretNode.style.height = (fontSize + 0.22) + 'rem';
	//console.log(fontSize + 'rem');
};
