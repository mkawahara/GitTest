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
/* -  担当 / 最終更新  ： 湯本 直杉 / 2015年06月29日                         */

function PopupMenu() {};

PopupMenu.iconIdList = {}; // アイコン用IDの管理リストです。IDの競合対策に用いています。
PopupMenu.MenuSectionTable  = {};  // 最初は空の連想配列です。

// ポップアップメニューを作成し、jqueryuiへ登録します。
//PopupMenu.CreateMenu = function(menuInfo) {
PopupMenu.CreateMenuHtml = function(menuInfo) {
	if (!menuInfo) return;
	// ul, li 構造を表す html 文字列を作成します。
	var htmlStr = PopupMenu.ScanUl(menuInfo);
	// 一番外側のタグを外します。
	htmlStr = htmlStr.replace(/\<ul .*?\>/, ''); // 先頭　の ul タグ消去
	htmlStr = htmlStr.replace(/\<\/ul\>$/,  ''); // 最後尾の ul タグ消去
	// innerHtml へ流し込みます。
	var targetId = menuInfo['id'];
	var node = document.getElementById(targetId);
	if (node == null) return;
	node.outerHTML = '<ul id="' + targetId + '" class="cl_TBC_MenuFont cl_TBC_DropDownMenu">'
	$('#' + targetId).html(htmlStr);
};



// ポップアップメニュー用配列をスキャンし、ul, li タグの文字列を生成します。
PopupMenu.ScanUl = function(ulInfo) {
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
			localHtml = PopupMenu.OutLiHtml(localTgt);
		}
		htmlStr += localHtml;

        // セパレータが設定されている場合は1行追加します
        if (localTgt.separator && i < liLen-1) htmlStr += '<li/>';
	}
	htmlStr += '</ul>';

	return(htmlStr);
};



PopupMenu.OutLiHtml = function(liInfo) {
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
			while ( iconId in PopupMenu.iconIdList ) { // ID 名が既出なら、競合がなくなるまでループ
				tailNum = tailNum + 1;
				iconId = iconIdBase + tailNum + '_'; // icon192_1_ のようになります。
			}
			// この時点で、iconId には、競合しない ID 名が入ったので、
			PopupMenu.iconIdList[iconId] = true; // ID をキーとし、true を記録します。 (true でもなんでも良い)
			// なお、jQuery のセレクタでは、頭の icon192_ を用いてワイルドカード指定を行います。

			tableStr += ' id="' + iconId + '">';                       // アイコン div へ ID を付けます。
			tableStr += '<img src="./icons/' + liInfo['icon'] + '" class="cl_TBC_Centering" width="16" height="16">';
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
    PopupMenu.refreshRClick();
}

/**
 * 保存された数式レベルに従って右クリックメニューを更新します。
 */
PopupMenu.refreshRClick = function() {
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

    // 最近実行されたコマンドを登録します
    var recentSymbols = ConfigManager.instance.RecentSymbols;
    for (i=0; i<recentSymbols.length; i++) {
        var symbolId = recentSymbols[i];
        var menuItem = InputData.getMenuItem(symbolId);
        menuItem.id = 'Popup_Recent_'+i;
        if (menuItem) {
            PopupMenu.editorRClick.contents.push(menuItem);
            PopupMenu.tableRClick.contents.push(menuItem);
        }
    }

    // 右クリックメニューを HTML で生成します
    PopupMenu.CreateMenu(ID_PM_ET_EDITOR ); // エディタ部上での右クリック時のポップアップメニュー
    PopupMenu.CreateMenu(ID_PM_ET_TABLE  ); // テーブル・行列上での右クリック時のポップアップメニュー

/*
    PopupMenu.CreateMenu(PopupMenu.editorRClick ); // エディタ部上での右クリック時のポップアップメニュー
    PopupMenu.CreateMenu(PopupMenu.tableRClick  ); // テーブル・行列上での右クリック時のポップアップメニュー

    // JQueryUI を適用します
    var tgtHash = {};
    tgtHash[ID_PM_ET_EDITOR] = null;        // エディタ部上での右クリック時のポップアップメニュー
    tgtHash[ID_PM_ET_TABLE]  = null;        // テーブル上での右クリック時のポップアップメニュー

    ToolbarUtilityClass.RegistContextMenu(tgtHash);  // コンテキストメニューを登録します。
*/
}

PopupMenu.copyMenuData = function(src, dst) {
    dst.contents = [];
    for (var i=0; i<src.contents.length; i++) {
        dst.contents.push(src.contents[i]);
    }
}



//PopupMenu.CreateMenuSuper = function(menuId) {
PopupMenu.CreateMenu = function(menuId) {
//	var tgtHash = {};

	switch(menuId) {
	case ID_MB_DDM_FILE:    // ファイル系　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.fileMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 1, 'iconID' : 'MB_File'   , 'checkMarkID' : 'MB_File_CheckMark'   };
//		tgtHash[menuId] = {'index' : 1, 'iconID' : 'MB_File'   , 'checkMarkID' : 'MB_File_CheckMark'   };
		break;
	case ID_MB_DDM_INDEX:   // インデックス系メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.indexMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 2, 'iconID' : 'MB_Index'  , 'checkMarkID' : 'MB_Index_CheckMark'  };
//		tgtHash[menuId] = {'index' : 2, 'iconID' : 'MB_Index'  , 'checkMarkID' : 'MB_Index_CheckMark'  };
		break;
	case ID_MB_DDM_EDIT:    // 編集系　　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.editMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 3, 'iconID' : 'MB_Edit'   , 'checkMarkID' : 'MB_Edit_CheckMark'   };
//		tgtHash[menuId] = {'index' : 3, 'iconID' : 'MB_Edit'   , 'checkMarkID' : 'MB_Edit_CheckMark'   };
		break;
	case ID_MB_DDM_SEARCH:  // 検索系　　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.searchMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 4, 'iconID' : 'MB_Search' , 'checkMarkID' : 'MB_Search_CheckMark' };
//		tgtHash[menuId] = {'index' : 4, 'iconID' : 'MB_Search' , 'checkMarkID' : 'MB_Search_CheckMark' };
		break;
	case ID_MB_DDM_FORMAT:  // 書式系　　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.formatMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 5, 'iconID' : 'MB_Format' , 'checkMarkID' : 'MB_Format_CheckMark' };
//		tgtHash[menuId] = {'index' : 5, 'iconID' : 'MB_Format' , 'checkMarkID' : 'MB_Format_CheckMark' };
		break;
	case ID_MB_DDM_VIEW:    // 表示系　　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.viewMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 6, 'iconID' : 'MB_View'   , 'checkMarkID' : 'MB_View_CheckMark'   };
//		tgtHash[menuId] = {'index' : 6, 'iconID' : 'MB_View'   , 'checkMarkID' : 'MB_View_CheckMark'   };
		break;
	case ID_MB_DDM_READING: // 読み上げ機能メニュー
	    // 話者リストを更新して、メインメニューを作成します。
	    PopupMenu.changeMainSpeakerMenu(PopupMenu.speakerList);
		PopupMenu.CreateMenuHtml(PopupMenu.readingMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 7, 'iconID' : 'MB_Reading', 'checkMarkID' : 'MB_Reading_CheckMark'};
	    // 話者リストを更新して、コンテキストメニューを作成します。
		PopupMenu.changeDropSpeakerMenu(PopupMenu.speakerList);
		PopupMenu.CreateMenuHtml(PopupMenu.speaker);
		PopupMenu.MenuSectionTable[ID_CM_ET_SPEAKER] = {'iconID' : 'ET_Edit_Speaker'};  // 話者選択
		break;
	case ID_MB_DDM_SETTING: // 設定系　　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.settingMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 8, 'iconID' : 'MB_Setting', 'checkMarkID' : 'MB_Setting_CheckMark'};
//		tgtHash[menuId] = {'index' : 8, 'iconID' : 'MB_Setting', 'checkMarkID' : 'MB_Setting_CheckMark'};
		break;
	case ID_MB_DDM_HELP:    // ヘルプ系　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.helpMenu);
		PopupMenu.MenuSectionTable[menuId] =
			{'index' : 9, 'iconID' : 'MB_Help'   , 'checkMarkID' : 'MB_Help_CheckMark'   };
//		tgtHash[menuId] = {'index' : 9, 'iconID' : 'MB_Help'   , 'checkMarkID' : 'MB_Help_CheckMark'   };
		break;
	case ID_CM_ET_FRAMEBORDER: // 囲み枠　　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.borderFrame);
		PopupMenu.MenuSectionTable[menuId] = {'iconID' : 'ET_Format_FrameBorder_Standard'}; // 囲み枠系
//		tgtHash[menuId] = {'iconID' : 'ET_Format_FrameBorder_Standard'}; // 囲み枠系
		break;
	case ID_CM_ET_FONTSIZE: // フォントサイズ　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.fontSize);
		PopupMenu.MenuSectionTable[menuId] = {'iconID' : 'ET_Format_FontSize'            }; // フォントサイズ
//		tgtHash[menuId] = {'iconID' : 'ET_Format_FontSize'            }; // フォントサイズ
		break;
//	case ID_CM_ET_SPEAKER: // 話者選択　メニュー
//	    // 話者リストを更新して、メニューを作成します。
//	    if ( PopupMenu.changeDropSpeakerMenu(PopupMenu.speakerList) ) {
//			PopupMenu.CreateMenuHtml(PopupMenu.speaker);
//			PopupMenu.MenuSectionTable[menuId] = {'iconID' : 'ET_Edit_Speaker'            };  // 話者選択
//		}
//		break;
	case ID_CM_ET_INSERTIMAGE: // 画像処理　　　メニュー
		PopupMenu.CreateMenuHtml(PopupMenu.pictureMenu);
		PopupMenu.MenuSectionTable[menuId] = {'iconID' : 'ET_Edit_InsertImage'           }; // 画像処理
//		tgtHash[menuId] = {'iconID' : 'ET_Edit_InsertImage'           }; // 画像処理
		break;
	case ID_PM_ET_IMAGE:  // 画像上での右クリック時のポップアップメニュー
		PopupMenu.CreateMenuHtml(PopupMenu.pictureRClick);
		PopupMenu.MenuSectionTable[menuId] = null;
//		tgtHash[menuId] = null;
		break;
	case ID_PM_ET_EDITOR: // エディタ部上での右クリック時のポップアップメニュー
		PopupMenu.CreateMenuHtml(PopupMenu.editorRClick);
		PopupMenu.MenuSectionTable[menuId] = null;
//		tgtHash[menuId] = null;
		break;
	case ID_PM_ET_TABLE:  // テーブル上での右クリック時のポップアップメニュー
		PopupMenu.CreateMenuHtml(PopupMenu.tableRClick);
		PopupMenu.MenuSectionTable[menuId] = null;
//		tgtHash[menuId] = null;
		break;
	}
	ToolbarUtilityClass.RegistContextMenu(PopupMenu.MenuSectionTable);  // コンテキストメニューを登録します。
//	ToolbarUtilityClass.RegistContextMenu(tgtHash);  // コンテキストメニューを登録します。
};

PopupMenu.speakerList = [];

PopupMenu.setSpeakerList = function(speakerList) {
	// speakerList[] : 文字列配列
	if (speakerList.length !== void 0) {
		PopupMenu.speakerList = speakerList.concat();
	}
	else {
		console.log('話者リストを受信できていません。');
	}
};

// ---- メインメニュー用 データの、話者情報を書き換えます。
PopupMenu.changeMainSpeakerMenu = function(speakerList) {
	var localContents = PopupMenu.getSpeakerContentsHtml(speakerList);
	if (localContents === null) return false;

	// メインメニュー PopupMenu.readingMenu.contents[6].content の中身を書き換えます。
	PopupMenu.readingMenu.contents[4].contents = localContents.concat();
	return true;
};

// ---- ドロップダウン用 データの、話者情報を書き換えます。
PopupMenu.changeDropSpeakerMenu = function(speakerList) {
	var localContents = PopupMenu.getSpeakerContentsHtml(speakerList);
	if (localContents === null) return false;

	// ドロップダウン用メニュー PopupMenu.speaker.contents の中身を書き換えます。
	PopupMenu.speaker.contents = localContents.concat();
	return true;
};

// ---- 話者コンテンツを表現するオブジェクトを作成します。
PopupMenu.getSpeakerContentsHtml = function(speakerList) {
	var speakerCount = speakerList.length;
	if (!speakerCount) return null;

	// ---- 話者一覧
	var localContents = [];
	for (var i = 0; i < speakerCount; i++) {
//		var localItem = {type : 'li', title : speakerList[i], shortcut : '', id : '', icon : '', char : '',
		var localItem = {type : 'li', title : speakerList[i], shortcut : '', id : '', char : '■',
			func : 'ReadMenuEventHandler.onClickSpeaker(' + i + ')' };
		localContents.push(localItem);
	}
	localContents[i - 1].separator = true; // セパレータを付ける
	// ---- 「話者を解除」メニュー
	localContents.push(
		{'type' : 'li', 'title' : '話者を解除', 'shortcut' : '', 'id' : '', 'icon' : '', char : '',
		 'func' : 'ReadMenuEventHandler.onClickDelSpeaker()' }
	);
	return localContents;
};

// ---- 話者リストアイコンに色を付けます。
PopupMenu.colorSpeakerIcon = function() {
	var speakerList = ConfigManager.instance.SpeakerList;
	if (speakerList.length < 1) return;
	// ---- 話者アイコンへ色設定
	var mainMenu = $('#MB_Speaker_ConMenu .cl_TBC_Menu_Col1_TD');      // メインメニューの話者リスト
	var toolMenu = $('#ET_Edit_Speaker_ConMenu .cl_TBC_Menu_Col1_TD'); // ツールメニューの話者リスト
	var speakerCount = mainMenu.length - 1;                            // 話者数
	for (var i = 0; i < speakerCount; i++) {
		var speakerClass = 'speaker' + i + '_mark';
		$(mainMenu[i]).addClass(speakerClass);
		$(toolMenu[i]).addClass(speakerClass);
	}
};



