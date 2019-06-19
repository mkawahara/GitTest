/* Project: [PJ-0136] ChattyInfty
/* Module : DVM_C_Display
/* ========================================================================= */
/* ==                         ChattyInfty-Online                          == */
/* ==                                                                     == */
/* ==                      株式会社知能情報システム                       == */
/* ========================================================================= */
/* -    ファイル名     ： popupMenu.js                                       */
/* -                                                                         */
/* -    概      要     ： ポップアップメニュー生成機能                       */
/* -                                                                         */
/* -    依      存     ：                                                    */
/* -                                                                         */
/* -  開  発  環  境   ： Wiondows 8.1 Pro 64bit, Firefox 35.0.1             */
/* -                                                                         */
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年07月16日                         */

function PopupMenu(iconPath) {
	this.iconIdList = {}; // アイコン用IDの管理リストです。IDの競合対策に用いています。
	this._iconPath = './icons/';
};

Object.defineProperty(PopupMenu, 'iconPath', {
	enumerable: true,
	configurable: true,
	get: function()    { return this._iconPath; },
	set: function(val) { this._iconPath = val;  },
});

//////////////////////////////////////////////////////////////////////////
// シングルトン

PopupMenu._instance = null;

Object.defineProperty(PopupMenu, 'instance', {
	enumerable: true,
	configurable: true,
	get: function(){
		if (PopupMenu._instance === null) PopupMenu._instance = new PopupMenu();
		return PopupMenu._instance;
	},
});

// ポップアップメニューを作成し、jqueryuiへ登録します。
PopupMenu.prototype.CreateMenu = function(menuInfo) {
	if (!menuInfo) return;
	// ul, li 構造を表す html 文字列を作成します。
	var htmlStr = this.ScanUl(menuInfo);
	// 一番外側のタグを外します。
	htmlStr = htmlStr.replace(/\<ul .*?\>/, ''); // 先頭　の ul タグ消去
	htmlStr = htmlStr.replace(/\<\/ul\>$/,  ''); // 最後尾の ul タグ消去
	// innerHtml へ流し込みます。
	var targetId = menuInfo['id'];
	var node = document.getElementById(targetId);
	node.outerHTML = '<ul id="' + targetId + '" class="cl_TBC_MenuFont cl_TBC_DropDownMenu">'
	$('#' + targetId).html(htmlStr);
};



// ポップアップメニュー用配列をスキャンし、ul, li タグの文字列を生成します。
PopupMenu.prototype.ScanUl = function(ulInfo) {
	var htmlStr = '<ul id="' + ulInfo['id'] + '" class="cl_TBC_MenuFont cl_TBC_DropDownMenu">';
	var liArr = ulInfo['contents'];             // li 配列を取得
	var liLen = liArr.length;                   // li 配列の長さを取得
	// ul 以下に含まれる 配列分ループ
	var localHtml = '';
	for (var i = 0; i < liLen; i++) {
		var localTgt = liArr[i]; // 現在ターゲットにしている要素への参照
		if (localTgt['type'] == 'ul') {
			// もし ul タグが入れ子になっていたら、ScanUl を再帰的に呼び出します。
			localHtml = PopupMenu.ScanUl(localTgt) + '</li>';
			htmlStr = htmlStr.replace(/\<\/li\>$/,  ''); // 最後尾の li タグ消去
		} else {
			// li タグの 文字列を生成します。
			localHtml = this.OutLiHtml(localTgt);
		}
		htmlStr += localHtml;
	}
	htmlStr += '</ul>';
	return(htmlStr);
};



PopupMenu.prototype.OutLiHtml = function(liInfo) {
	// li タグ開始
//	var tableStr = '<li id="' + liInfo['id'] + '"><table><tr>';
	var tableStr = '<li id="' + liInfo['id'] + '" func="' + liInfo.func + '"><table><tr>';

	// 1列目
	// ※アイコン画像ファイルがなければ img タグ無し
	// ※'icon' キーが存在しなければ、'char' キーの文字を直接表示
	tableStr += '<td class="cl_TBC_Menu_Col1_TD"><div class="cl_TBC_Menu_Col1_Icon"';
	if ('icon' in liInfo) {
		if (liInfo['icon'] != '') {

			// アイコンに識別用の ID を付けます。png ファイルのベース名を ID に流用します。
			var iconId = 'icon' + liInfo['icon'].replace(/\.png/, '') + '_'; // icon192_ のようになります。
			var iconIdBase = iconId;
			var tailNum = 0;
			while ( iconId in this.iconIdList ) { // ID 名が既出なら、競合がなくなるまでループ
				tailNum = tailNum + 1;
				iconId = iconIdBase + tailNum + '_'; // icon192_1_ のようになります。
			}
			// この時点で、iconId には、競合しない ID 名が入ったので、
			this.iconIdList[iconId] = true; // ID をキーとし、true を記録します。 (true でもなんでも良い)
			// なお、jQuery のセレクタでは、頭の icon192_ を用いてワイルドカード指定を行います。

			tableStr += ' id="' + iconId + '">';                       // アイコン div へ ID を付けます。
//			tableStr += '<img src="./icons/' + liInfo['icon'] + '" class="cl_TBC_Centering" width="16" height="16">';
			var imgSrc = this.iconPath +  liInfo.icon;
			tableStr += '<img src="' + imgSrc + '" class="cl_TBC_Centering" width="16" height="16">';
		}
	} else {
		tableStr += '>' + liInfo['char'];
	}
	tableStr += '</div></td>';

	// 2列目
	tableStr += '<td class="cl_TBC_Menu_Col2_Title">'    + liInfo['title']    + '</td>';

	// 3列目
	tableStr += '<td class="cl_TBC_Menu_Col3_ShortCut">' + liInfo['shortcut'] + '</td>';

	// 閉め
	tableStr += '</tr></table></li>';
	return(tableStr);
};


/**
 * 数式レベルを保存し、右クリックメニューを更新します。
 */
PopupMenu.setMathLevel = function(mathlevel) {
    // ConfigManagerに数式レベルを登録します
    ConfigManager.instance.MathLevel = mathlevel;

    // ポップアップメニューに数式レベルの変更を通知します
    PopupMenu.refreshMathLevel();
}

/**
 * 保存された数式レベルに従って右クリックメニューを更新します。
 */
PopupMenu.refreshMathLevel = function() {
	return;
    // 数式レベルを取得します
    var mathlevel = ConfigManager.instance.MathLevel;

    // メニューアイコンの選択状態を切り替えます
    // 数式レベルは 1～4 の数字で、それぞれ icon135～icon138 が対応します
    for (var i=1; i<=4; i++) {
        ToolbarUtilityClass.setMenuCheck('icon'+(134+i)+'_', i==mathlevel);
    }

    // コンテキストメニューのデフォルトデータを取得します
    PopupMenu.copyMenuData(PopupMenu.editorRClickDefault, PopupMenu.editorRClick);
    PopupMenu.copyMenuData(PopupMenu.tableRClickDefault, PopupMenu.tableRClick);

    // 数式レベルに従って入力文字のメニュー項目を追加します
    var menuItems = InputData.getMenuTree(mathlevel);
    for (var i=0; i<menuItems.length; i++) {
        PopupMenu.editorRClick.contents.push(menuItems[i]);
        PopupMenu.tableRClick.contents.push(menuItems[i]);
    }

    PopupMenu.CreateMenu(PopupMenu.editorRClick ); // エディタ部上での右クリック時のポップアップメニュー
    PopupMenu.CreateMenu(PopupMenu.tableRClick  ); // テーブル・行列上での右クリック時のポップアップメニュー

    var tgtHash = {};
    tgtHash[ID_PM_ET_EDITOR] = null;        // エディタ部上での右クリック時のポップアップメニュー
    tgtHash[ID_PM_ET_TABLE]  = null;        // テーブル上での右クリック時のポップアップメニュー

    ToolbarUtilityClass.RegistContextMenu(tgtHash);  // コンテキストメニューを登録します。
}

PopupMenu.copyMenuData = function(src, dst) {
    dst.contents = [];
    for (var i=0; i<src.contents.length; i++) {
        dst.contents.push(src.contents[i]);
    }
}
