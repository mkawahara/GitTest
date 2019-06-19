// +--------------------------------------------------------------------------+
// |                           ChattyInfty-Online                             |
// |                         株式会社デジタルノーツ                           |
// +--------------------------------------------------------------------------+
// |  ファイル名 ： dictionaryeditor.js                                       |
// |  概要       ： 単語辞書編集画面                                          |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// +--------------------------------------------------------------------------+
include('../dnslibrary/theme.css') ;            // テーマ定義ファイルの読み込み
include('./dictionaryeditor.css') ;     // 辞書編集スタイルシート
include('./dictionaryeditor_menu.js') ; // 辞書編集メニュー
include('./dictionaryappend.js') ;      // 単語追加
include('../dnslibrary/dnscolorpicker.js') ;    // 色選択ツール
include('../dnslibrary/dnsdialog.js') ;         // ダイアログ機能の読み込み
include('../dnslibrary/dnsstatusbar.js') ;      // ステータスバー機能の読み込み
include('../dnslibrary/dnsgrid.js') ;           // グリッドオブジェクト機能の読み込み
include('../dnslibrary/dnsmenu.js') ;           // メニューブジェクト機能の読み込み
include('../dnslibrary/sound.js') ;      // 音声サポート
include('./accentcontrol.js') ;                          // アクセントコントロールの読み込み

DnsAddEventProc( window, 'load', DictionaryEditorInit ) ;

var errorMessage = {
    error_unknown:"不明なエラーが発生しました。"
} ;

var params = GetParams() ;
var bDebugMode = false ;

// 単語辞書の初期化処理
function DictionaryEditorInit()
{
    var docInfo = null ;

    if( bDebugMode == false )
    {
	    if ( !window.opener )
        {
		    alert('このページを直接開いても動作しません。');
            window.close() ;
		    return;
	    };
	    if ( !window.opener.MessageManager == undefined )
        {
		    alert('不正な呼び出し方法です。');
            window.close() ;
		    return;
	    };
        docInfo = window.opener.MessageManager.getDocumentInfo() ;
        document.title = '[' + docInfo.fileName + '] ' + document.title ;
    }
    else
    {
        info = { doc_id:1 } ;
    }

    //-----------------------------------------------------
    // 単語辞書情報の初期化
    Communicator.request('dicGet', { doc_id:docInfo.docId }, 
		function( res )
        {
            // サーバーからアニメーション情報を取得できた差場合
            if( res.error_code == 0 && res.dictionary != undefined )
            {
                var dicdata = res.dictionary ;

                dicdata = dicdata.replace(/^\s+|\s+$/g,'') ;

                if( dicdata.match(/^\<userdic/) != null )
                {
                    var userdic = document.createElement('div') ;
                    if( dicdata.indexOf('/>') != -1 )
                    {
                        DnsDictionaryEditor.datatype = 1 ;
                        dicdata = dicdata.replace(/\/>/g, '></item>' ) ;
                        userdic.innerHTML = dicdata ;
                        var items = userdic.getElementsByTagName('item') ;
                        for( var i = 0 ; i < items.length ; i++ )
                        {
                            var word = items[i].getAttribute('word') ;
                            items[i].textContent = word ;
                            items[i].removeAttribute('word') ;
                        }
                    }
                    else
                    {
                        userdic.innerHTML = dicdata ;
                    }                    
                    userdic = userdic.getElementsByTagName('userdic')[0] ;
                    DnsDictionaryEditor.instance = new DnsDictionaryEditor( userdic, params['word'] ) ;
                    return ;
                }
                else
                {
                    DnsMessageBox( "サーバーからの応答はありましたが、辞書情報の形式が異なる可能性があります。", "警告", "OK;DUMP", function()
                    {
                        window.close() ;
                        return ;
                    },
                    function()
                    {
                        document.write( "<textarea style='width:100%;height:100%'>" + dicdata + "</textarea>" ) ;
                    } ) ;
                }
            }
            else
            {
                alert( 'error(' + res.error_code + '\ndictionary' + (typeof res.dictionary)  ) ; 
                window.close() ;
            }
            return ;
		},
		function( error )
        {
            alert( errorMessage.error_unknown + '\nerror_code=(' + error.error_code + ')' ) ; 
            window.close() ;
            return ;
        }
    ) ;
}

// 単語辞書編集メイン
var DnsDictionaryEditor = function ( userdic, addWord )
{
    DnsDictionaryEditor.instance = this ;
    this.dicMain = document.getElementById('dns_userdic_editor') ;
    this.dicList = document.getElementById('dns_dic_list') ;
    this.append     = new DnsDictionaryAppend( ) ;
    this.stdAccent  = new DnsAccentControl( document.getElementById('dic_data_accent'), 'std', OnAccentChange ) ;

    var menu = null ;
    var bEditMode  = DnsGetSettingString( 'dns_dic_editmode',   'true' ) == 'true' ? true : false ;
    var bListRead  = DnsGetSettingString( 'dns_dic_listread',   'false' ) == 'true' ? true : false ;
    var bAuotUpdate = DnsGetSettingString( 'dns_dic_autoupdate', 'false' ) == 'true' ? true : false ;
    var bDispAll   = DnsGetSettingString( 'dns_dic_dispall',    'false' ) == 'true' ? true : false ;

    this.audio      = document.getElementById('dns_audio_test') ;
    this.cName     = document.getElementById('dic_name') ;
    this.cNarrows  = document.getElementById('dns_narrow_area') ;
    this.cWord  = document.getElementById('dic_data_1') ;
    this.cYomi  = document.getElementById('dic_data_2') ;
//  this.cLevelRadios = [ document.getElementById('dic_data_4_1'), document.getElementById('dic_data_4_2'), document.getElementById('dic_data_4_3'), document.getElementById('dic_data_4_4'), document.getElementById('dic_data_4_5') ] ;
//  this.cLevelLabels = [ document.getElementById('dic_data_4_1_label'), document.getElementById('dic_data_4_2_label'), document.getElementById('dic_data_4_3_label'), document.getElementById('dic_data_4_4_label'), document.getElementById('dic_data_4_5_label') ] ;
    this.btnTest   = document.getElementById('dns_ud_test') ;
    this.btnAppend = document.getElementById('dns_ud_append') ;
    this.btnUpdate = document.getElementById('dns_ud_update') ;
    this.btnRemove = document.getElementById('dns_ud_remove') ;
    this.btnSave   = document.getElementById('dns_ud_save') ;
    this.btnClose  = document.getElementById('dns_ud_close') ;
    this.cType     = document.getElementById('dic_data_3') ;
    this.cLevel    = document.getElementById('dic_data_4') ;
    this.cSaveArea = document.getElementById('dic_save_area_back' ) ;
    this.cSaveDlg  = document.getElementById('dic_save_area_dialog' ) ;

    this.cNarrows.GetValue = NarrowsGetValue ;
    this.cNarrows.SetValue = NarrowsSetValue ;
    this.cLevel.GetLevelValue = GetLevelValue ;
    this.cLevel.SetLevelValue = SetLevelValue ;
    
    // HTMLソースから不要なテキストを削除
    DnsRemoveNeedlessText( document.getElementById('dns_userdic_editor'), true ) ;
    DnsRemoveNeedlessText( document.getElementById('dic_append_area_back'), true ) ;

    var levels = { 4000:'最低', 3000:'低', 2000:'標準', 1000:'高', 0:'最高' } ;
    var griddata = {
        head:[{caption:'単語',width:150},{caption:'読み',width:200},{caption:'品詞'},{caption:'優先度',align:'center',width:80}],
        body:[]
    } ;

    this.btnAppend.disabled = false ;
    //------------------------------
    // dictionaryeditor_menu.jsからメニューを作成
    menu = DnsMenu( document.getElementById('dns_dic_menu_area') , dicMenu, DicMenuCommand ) ;
    menu.CheckMenuItem( 'mi_aud_edit_mode',    bEditMode ) ;
    menu.CheckMenuItem( 'mi_aud_auto_read',    bListRead ) ;
    menu.CheckMenuItem( 'mi_aud_auto_update',  bAuotUpdate ) ;
    menu.CheckMenuItem( 'mi_aud_show_control', bDispAll ) ;
    //------------------------------
    // ローカルストレージから一覧表のカラム幅を取得して、列の幅を復元する
    var col_text = DnsGetSettingString( 'cio_dictionaryeditor_columns', null ) ;
    if( window.JSON && col_text != null && 0 < col_text.length )
    {
        var cols = window.JSON.parse( col_text ) ;
        for( var i = 0 ; i < griddata.head.length && i < cols.length ; i++ )
        {
            griddata.head[i].width = parseInt( cols[i] ) ;
        }
    }

    //------------------------------
    // ステータスバーの作成
    this.statusbar = new DnsStatusBar( document.body, true ) ;
    this.statusbar.SetText( "Ready" ) ;
    this.statusbar.AppendPane( 100, 'center' ) ;
    this.statusbar.AppendPane( 100, 'center' ) ;

    //------------------------------
    // データを準備
    if( userdic != null )
    {
		this.cName.value = userdic.attributes.getNamedItem('src_name').nodeValue ;
        dicitem=userdic.firstElementChild;
        for( r = 0 ; dicitem != null ; r++, dicitem = dicitem.nextElementSibling )
        {
            griddata.body[r] = 
            {
                col1:dicitem.textContent,
                col2:dicitem.attributes.getNamedItem('yomi').nodeValue,
                col3:dicitem.attributes.getNamedItem('type').nodeValue,
                col4:levels[dicitem.attributes.getNamedItem('level').nodeValue],
                data:dicitem
            } ;
        }
    }

    this.DataGrid = new DnsGrid( this.dicList, griddata, 400, 300, ItemCheckProc ) ;
    this.DataGrid.__proto__.ItemChanged  = ItemChanged ;
    this.DataGrid.__proto__.EndSelect    = EndSelect ;
    this.DataGrid.__proto__.ItemChanging = ItemChanging ;
    this.DataGrid.__proto__.KeyUp        = GridKeyup ;
    this.DataGrid.Sort( 1, false ) ;
    this.DataGrid.ItemSelect( this.DataGrid.FirstItem( true ) ) ;
    this.DataGrid.SetFocus() ;
    this.DataGrid.SetGridSize( 600, 300 ) ;

    window.onresize = OnResize ;

    DnsAddEventProc( this.btnTest,   'click', OnTest ) ;
    DnsAddEventProc( this.btnAppend, 'click', OnAppend ) ;
    DnsAddEventProc( this.btnUpdate, 'click', OnUpdate ) ;
    DnsAddEventProc( this.btnRemove, 'click', OnRemove ) ;
    DnsAddEventProc( this.btnSave,   'click', OnSave ) ;
    DnsAddEventProc( this.btnClose,  'click', OnClose ) ;
    DnsAddEventProc( this.cYomi,     'keydown',  OnYomiKeyDown ) ;
    DnsAddEventProc( this.cYomi,     'keyup',    OnYomiKeyUp ) ;
    DnsAddEventProc( this.cYomi,     'blur',     OnYomiBlur ) ;
    DnsAddEventProc( this.cYomi,     'change',   OnYomiChange ) ;
    DnsAddEventProc( this.cType,     'change',   OnHinshiChange ) ;
    DnsAddEventProc( this.cName,     'blur',     OnNameBlur ) ;
    //DnsAddEventProc( window, 'beforeunload', OnBeforeUnload ) ;
    window.onbeforeunload = OnBeforeUnload ;

    this.cWord.disabled = true ;

    // 読み選択のラジオボタン
    var radios = document.getElementsByClassName('dns_narrow_selection') ;
    for( var i = 0 ; i < radios.length ; i++ )
    {
        radios[i].onchange  = OnNarrowChange ;
        radios[i].nextElementSibling.onkeydown = OnRadioButtonLabelKeyDown ;
    }
    // 優先度設定のラジオボタン
    var cLevelRadios = this.cLevel.getElementsByTagName("INPUT") ;
    var cLevelLabels = this.cLevel.getElementsByTagName("LABEL") ;
    for( var i = 0 ; i < cLevelRadios.length ; i++ )
    {
        cLevelRadios[i].onchange  = OnLevelChange ;
        cLevelLabels[i].onkeydown = OnRadioButtonLabelKeyDown ;
    }
    document.getElementById('dic_edit_area').style.display    = bEditMode ? '' : 'none' ;
    document.getElementById('dic_command_area').style.display = bEditMode ? '' : 'none' ;
    document.getElementById('dns_userdic_editor').style.display = '' ;

    this.cNarrows.SetValue( 0 ) ;
    //-------------------------------------------------------------
    // イベント：ブラウザのリサイズ
    function OnResize( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        // 一覧表の高さを調節する
        cThis.dicMain.style.width  = ( document.body.offsetWidth  - 8 ) + 'px' ;
        cThis.dicMain.style.height = ( document.body.offsetHeight - 4 - cThis.statusbar.GetElement().offsetHeight ) + 'px' ;
        var rows = cThis.dicMain.getElementsByClassName('dns_userdic_editor_row') ;
        var height = ( document.body.offsetHeight - 4 - cThis.statusbar.GetElement().offsetHeight - rows[0].offsetHeight - rows[1].offsetHeight - rows[2].offsetHeight - rows[4].offsetHeight - rows[5].offsetHeight - 6 ) ;
        DnsDictionaryEditor.instance.DataGrid.SetGridSize( document.body.offsetWidth  - 8, height ) ;

        cThis.cSaveDlg.style.left = ( ( cThis.cSaveArea.offsetWidth  - cThis.cSaveDlg.offsetWidth  ) / 2 ) + 'px' ;
        cThis.cSaveDlg.style.top  = ( ( cThis.cSaveArea.offsetHeight - cThis.cSaveDlg.offsetHeight ) / 2 ) + 'px' ;
        // 画面下段の操作ボタンの幅を調整する
        var buttons = document.getElementById('dns_userdic_commands').getElementsByClassName('dns_userdic_command') ;
        for( var i = 0 ; i < buttons.length ; i++ )
        {
            buttons[i].style.width = ( ( document.body.offsetWidth - 10 ) / buttons.length ) + 'px' ;
        }

		cThis.cName.style.width = ( document.body.offsetWidth - cThis.cName.parentElement.previousElementSibling.offsetWidth - 20 ) + 'px' ;

        cThis.stdAccent.OnResize() ;
        cThis.append.OnResize() ;
    }
    //-------------------------------------------------------------
    // イベント：音声テストボタンのクリック(選択中のアイテムを読み上げる)
    function OnTest( event )
    {
        var read_text = DnsDictionaryEditor.instance.stdAccent.GetReadText() ;
        DnsDictionaryAppend.prototype.ReadTest( read_text, DnsDictionaryEditor.instance.btnTest ) ;
    }
    //-------------------------------------------------------------
    // イベント：追加ボタンのクリック(新しいアイテムを追加)
    function OnAppend( event )
    {
        DnsDictionaryEditor.instance.append.Show() ;
    }
    //-------------------------------------------------------------
    // イベント：更新ボタンのクリック(選択中のアイテムの更新)
    function OnUpdate( event, item, userDatas )
    {
        if( item || (item = DnsDictionaryEditor.instance.DataGrid.GetSelected()) )
        {
            if( userDatas || (userDatas = GetDatas()) )
            {
                if( userDatas.yomi.length == 0 )
                {
                    DnsMessageBox( "読みが設定されていません", "確認", undefined, function()
                    {
                        setTimeout( function(){ DnsDictionaryEditor.instance.cYomi.focus() ; }, 200 ) ;
                    } ) ;
                    return ;
                }

                item.SetColumn( 0, userDatas.text ) ;
                item.SetColumn( 1, userDatas.yomi ) ;
                item.SetColumn( 2, userDatas.type ) ;
                item.SetColumn( 3, userDatas.levelText ) ;
                item.data.textContent = userDatas.text ;
                item.data.attributes.getNamedItem('yomi').value = userDatas.yomi ;
                item.data.attributes.getNamedItem('level').value = parseInt( userDatas.levelValue ) ;
                item.data.attributes.getNamedItem('accent').value = userDatas.accent ;
                item.attributes.getNamedItem('modified').value = true ;
                document.getElementById('dns_ud_save').disabled = false ;
            }
        }
        document.getElementById('dns_ud_update').disabled = true ;
    }
    //-------------------------------------------------------------
    // イベント：削除ボタンのクリック(選択中のアイテムを削除)
    function OnRemove( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        var item = cThis.DataGrid.GetSelected() ;
        var userDatas = GetDatas() ; // 現在の設定データを取得
        if( item != null && userDatas != null )
        {
            DnsMessageBox( "「" + userDatas.text + "」を削除しますか？", "確認", "はい,いいえ", function()
                {
                    var newItem = item.NextItem( true ) ;
                    if( !newItem )
                    {
                        newItem = item.PrevItem( true ) ;
                    }
                    if( newItem != null )
                    {
                        cThis.DataGrid.ItemSelect( newItem ) ;
                    }
                    item.parentElement.removeChild( item ) ;
                    cThis.btnSave.disabled = false ;
                    cThis.SetDictionaryInfo() ;
                }
            ) ;
        }
    }
    //-------------------------------------------------------------
    // イベント：保存ボタンのクリック(データベースに対して保存を実行する)
    function OnSave( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        var saveText = '' ;

        if( cThis.btnSave.disabled == true )
        {
            return false ;
        }
		var strName = cThis.cName.value ; // userdic.attributes.getNamedItem('src_name').nodeValue ;
		if( strName.match(/.dic$/i) == null )
		{
			strName += '.dic' ;
		}
		if( strName.match(/_カスタム.dic$/i) == null )
		{
			strName = strName.replace(/.dic$/i, "_カスタム.dic" ) ;
			userdic.attributes.getNamedItem('src_name').nodeValue = strName ;
		}

        while( userdic.firstChild != null )
        {
            userdic.removeChild( userdic.firstChild ) ;
        }
		//userdic.innerHTML = "" ;
        for( var row = cThis.DataGrid.FirstItem() ; row != null ; row = row.nextElementSibling )
        {
            var word = row.data.attributes.getNamedItem('word') ;
            if( DnsDictionaryEditor.datatype == 0 && word != null )
            {
                row.data.removeAttribute('word') ;
            }
            else if( DnsDictionaryEditor.datatype != 0 )
            {
                if( word == null )
                {
                    row.data.attributes.setNamedItem( word = document.createAttribute('word') ) ;
                }
                word.value = row.data.textContent ;
                row.data.textContent = '' ;
            }
            userdic.appendChild( row.data ) ;
        }

        saveText = userdic.outerHTML ;
        saveText = saveText.replace(/><\/item>/g, '/>' ) ;
        saveText = saveText.replace(/<item /g, '\n\t<item ' ) ;
        saveText = saveText.replace(/<\/userdic>/, "\n</userdic>" ) ;

        for( var row = cThis.DataGrid.FirstItem() ; row != null ; row = row.nextElementSibling )
        {
            var word = row.data.attributes.getNamedItem('word') ;
            if( word != null )
            {
                row.data.textContent = word.value ;
            }
        }

        docInfo = window.opener.MessageManager.getDocumentInfo() ;
        cThis.cSaveArea.style.display = '' ;
        OnResize() ;
        Communicator.request('dicSave', { doc_id:docInfo.docId, dictionary: saveText }, 
		    function( res )
            {
                // 単語辞書の更新が正しく実行された
                cThis.btnSave.disabled = true ;
                cThis.cSaveArea.style.display = 'none' ;
                return ;
		    },
		    function( error )
            {
                switch( error.error_code )
                {
                    case 0 :
                        break ;
                    case 100 :
                        alert( '文書がありません' ) ; 
                        break ;
                    case 400 :
                        alert( '操作権限がありません' ) ; 
                        break ;
                    default:
                        alert( '不明なエラーが発生しました(' + error.error_code + ')' ) ; 
                        break ;
                }
                cThis.cSaveArea.style.display = 'none' ;
                return ;
            },
			undefined,
			function( error )
			{
				alert( "予期せぬエラーが発生しました\n" + error.textStatus + "(" + error.XMLHttpRequest + ")" ) ;
                cThis.cSaveArea.style.display = 'none' ;
                return ;
			}
        ) ;
    }
    //-------------------------------------------------------------
    // イベント：閉じるボタンのクリック
    function OnClose( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        if( cThis.btnUpdate.disabled == false || cThis.btnSave.disabled == false )
        {
            DnsMessageBox( '編集の情報を保存して終了しますか？\n「いいえ」を選択すると保存せずに終了します。', '確認', 'はい;いいえ;キャンセル',
            function()
            {
                // 保存して終了
                if( cThis.btnUpdate.disabled == false )
                {
                    OnUpdate() ;
                }
                OnSave() ;
                cThis.btnUpdate.disabled = true ;
                cThis.btnSave.disabled = true ;
                window.close() ;
            },
            function()
            {
                // 保存せずに終了
                cThis.btnUpdate.disabled = true ;
                cThis.btnSave.disabled = true ;
                window.close() ;
            },
            function()
            {
                // キャンセル
            }
            ) ;
        }
        else
        {
            window.close() ;
        }
    }
    function OnBeforeUnload( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        if( cThis.btnUpdate.disabled == false || cThis.btnSave.disabled == false )
        {
            return "編集の情報は保存されません。" ;
        }
        DnsRemoveEventProc( window, 'beforeunload', OnBeforeUnload ) ;
        window.onbeforeunload = null ;
        return ;
    }
    //-------------------------------------------------------------
    // イベント：アンロード処理
    function OnUnload( event )
    {
        // 一覧表のカラム幅をストレージに保存する
        var cols = DnsDictionaryEditor.instance.DataGrid.GetColumnWidths() ;
        if( window.JSON && cols != undefined && cols != null && 0 < cols.length )
        {
            var cps_text = window.JSON.stringify( cols ) ;
            DnsSetSettingValue( 'cio_dictionaryeditor_columns', cps_text )
        }
    }
    function OnNarrowChange( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        var func = undefined ;

        switch( cThis.cNarrows.GetValue() )// event.target.id )
        {
            case  0 : func = function( item ){ return IsExtraChar( item ) ? true : false ; } ; break ;
            case  1 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'ア' <= a[0] && a[0] < 'カ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  2 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'カ' <= a[0] && a[0] < 'サ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  3 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'サ' <= a[0] && a[0] < 'タ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  4 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'タ' <= a[0] && a[0] < 'ナ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  5 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'ナ' <= a[0] && a[0] < 'ハ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  6 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'ハ' <= a[0] && a[0] < 'マ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  7 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'マ' <= a[0] && a[0] < 'ヤ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  8 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'ヤ' <= a[0] && a[0] < 'ラ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case  9 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'ラ' <= a[0] && a[0] < 'ワ' && IsExtraChar( item ) ) ? true : false ; } ; break ;
            case 10 : func = function( item ){ var a = item.GetColumn( 1 ) ; return ( 'ワ' <= a[0] && a[0] < 'ン' && IsExtraChar( item ) ) ? true : false ; } ; break ;
        }
        function IsExtraChar( item )
        {
            var a = item.GetColumn( 0 ) ;
            if( a[0] == '≪' && bDispAll == false )
            {
                return false ;
            }
            return true ;
        }
        cThis.DataGrid.ChoiceItems( func ) ;
        cThis.SetDictionaryInfo( func ) ;
        cThis.DataGrid.ItemSelect( cThis.DataGrid.FirstItem( true ) ) ;
    }
    //-------------------------------------------------------------
    // 一覧表の選択項目が変更される前にグリッドからコールされます。
    function ItemChanging( item, data )
    {
        if( document.getElementById('dns_ud_update').disabled == false )
        {
            // 更新ボタンがアクティブなので更新確認を表示する
            var item = DnsDictionaryEditor.instance.DataGrid.GetSelected() ;
            var userDatas = GetDatas() ; // 現在の設定データを取得
            if( bAuotUpdate == false )
            {
                // 自動更新オフの場合
                DnsMessageBox( "選択されたアイテムの設定が変更されています。\n更新しますか？", "確認", "はい,いいえ", function()
                    {
                        OnUpdate( undefined, item, userDatas ) ;
                    }
                ) ;
            }
            else
            {
                // 自動更新オンの場合
                OnUpdate( undefined, item, userDatas ) ;
            }
        }
    }
    //-------------------------------------------------------------
    // 一覧表の選択項目が変更された時に、グリッドからコールされます。
    function ItemChanged( item, data, event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        var data3 = document.getElementById('dic_data_3') ;
        var data4 = document.getElementById('dic_data_4') ;
        var data4Radios = data4.getElementsByClassName('dic_data_4') ;
        
        if( cThis.cYomi.disabled != false )
        {
            //cThis.cWord.disabled = true ;
            cThis.cYomi.disabled = false ;
            cThis.cType.disabled = false ;
            data4.disabled = false ;
            for( var r = 0 ; r < data4Radios.length ; r++ )
            {
                data4Radios[r].disabled = false ;
                data4Radios[r].nextSibling.disabled = false ;
            }
            cThis.btnTest.disabled = false ;
            cThis.btnRemove.disabled = false ;
            //cThis.stdAccent.AccentCtrl.disabled = false ;
        }

        if( item == undefined )
        {
            if( (item = DnsDictionaryEditor.instance.DataGrid.GetSelected()) == null )
            {
                return ;
            }
            var temp = [] ;
            for( var c = 0 ; c < 4 ; c++ )
            {
                temp[c] = item.GetColumn( c ) ;
            }
            data = item.data ;
            item = temp ;
        }
        
        cThis.cWord.value = item[0] ;
        cThis.cYomi.value = item[1] ;

        for( s = 0 ; s < data3.length ; s++ )
        {
            if( data3[s].textContent == item[2] )
            {
                data3.selectedIndex = s ;
                break ;
            }
        }
        switch( item[3] )
        {
            case '最低' : document.getElementById('dic_data_4_1').checked = true ; break ;
            case '低'   : document.getElementById('dic_data_4_2').checked = true ; break ;
            case '標準' : document.getElementById('dic_data_4_3').checked = true ; break ;
            case '高'   : document.getElementById('dic_data_4_4').checked = true ; break ;
            case '最高' : document.getElementById('dic_data_4_5').checked = true ; break ;
        }
        if( data != undefined && data != null && data.tagName != undefined && data.tagName == 'ITEM' )
        {
            DnsDictionaryEditor.instance.stdAccent.SetAccent(  data.attributes.getNamedItem('yomi').value, 
                                  data.attributes.getNamedItem('accent').value ) ;
            if( bListRead && event != undefined && event.type == 'click' )
            {
                DnsDictionaryAppend.prototype.ReadTest( DnsDictionaryEditor.instance.stdAccent.GetReadText(), DnsDictionaryEditor.btnTest ) ;
            }
        }
        document.getElementById('dns_ud_update').disabled = true ;
        return ;
    }
    function GridKeyup( keyCode )
    {
        switch( keyCode )
        {
            case 38 : // カーソル上移動
            case 40 : // カーソル下移動
                {
                    var read_text = DnsDictionaryEditor.instance.stdAccent.GetReadText() ;
                    if( read_text && 0 < read_text.length )
                    {
                        DnsDictionaryAppend.prototype.ReadTest( read_text, DnsDictionaryEditor.btnTest ) ;
                    }
                }
                break ;
        }
        return ;
    }
    function ItemCheckProc( item )
    {
        if( item != null && item.col1 != undefined && item.col1[0] == '≪' )
        {
            return false ;
        }
        return true ;
    }
    function EndSelect( elem, data )
    {
        if( data != undefined && data != null && data.tagName != undefined && data.tagName == 'ITEM' )
        {
            DnsDictionaryEditor.instance.stdAccent.SetAccent( document.getElementById('dic_data_2').value, data.attributes.getNamedItem('accent').value ) ;
            //DnsDictionaryEditor.instance.statusbar.SetText( 0, window.JSON.stringify( data.attributes.getNamedItem('accent').value.split(/[{}:=]/) ) ) ; //text ) ;
        }
        return false ;
    }
    //-------------------------------------------------------------
    // イベント：品詞のドロップダウンリスト変更イベント
    function OnHinshiChange( event )
    {
        var item = DnsDictionaryEditor.instance.DataGrid.GetSelected() ;
        if( item != null && item.data != undefined )
        {
            var options = event.target.getElementsByTagName('OPTION') ;
            for( var o = 0 ; o < options.length ; o++ )
            {
                if( options[o].selected != false && options[o].textContent != item.data.attributes.getNamedItem('type').value )
                {
                    item.data.attributes.getNamedItem('type').value = options[o].textContent ;
                    document.getElementById('dns_ud_update').disabled = false ;
                    break ;
                }
            }
        }
    }
    //-------------------------------------------------------------
	function OnNameBlur( event )
	{
        var cThis = DnsDictionaryEditor.instance ;
		if( cThis.cName.value != userdic.attributes.getNamedItem('src_name').nodeValue )
		{
			cThis.btnSave.disabled = false ;
		}
	}
    //-------------------------------------------------------------
    // イベント：アクセントの変更イベント
    function OnAccentChange( event )
    {
        document.getElementById('dns_ud_update').disabled = false ;
        DnsDictionaryAppend.prototype.ReadTest( DnsDictionaryEditor.instance.stdAccent.GetReadText(), DnsDictionaryEditor.btnTest ) ;
    }
    //-------------------------------------------------------------
    // イベント：優先度のラジオボタン変更イベント 
    function OnLevelChange( event )
    {
        document.getElementById('dns_ud_update').disabled = false ;
    }
    //-------------------------------------------------------------
    // イベント：優先度ラジオボタンでのキーダウン
    function OnRadioButtonLabelKeyDown( event )
    {
        var item = event.target ;
        switch( event.keyCode )
        {
            case 0x20 :
                {
                    item.previousElementSibling.checked = true ;
                    var e = [] ;
                    e.target = item.previousElementSibling ;
                    item.previousElementSibling.onchange( e ) ;
                    if( item.className.indexOf('dic_data_4_label') != -1 )
                    {
                        //document.getElementById('dns_ud_update').disabled = false ;
                    }
                }
                return ;
            case 37 :
                if( item.previousElementSibling.previousElementSibling != null )
                {
                    item.previousElementSibling.previousElementSibling.focus() ;
                }
                else
                {
                    while( item.nextElementSibling != null )
                    {
                        item = item.nextElementSibling ;
                    }
                    item.focus() ;
                }
                return ;
            case 39 :
                if( item.nextElementSibling != null )
                {
                    item.nextElementSibling.nextElementSibling.focus() ;
                }
                else
                {
                    while( item.previousElementSibling != null && item.previousElementSibling.previousElementSibling != null )
                    {
                        item = item.previousElementSibling.previousElementSibling ;
                    }
                    item.focus() ;
                }
                return ;
            default :
                return ;
        }
    }
    //-------------------------------------------------------------
    // 表記・読み・品詞などの全ての設定内容を取得する
    function GetDatas()
    {
        var cThis = DnsDictionaryEditor.instance ;
        var result = [] ;
        result.text = cThis.cWord.value ;
        result.yomi = cThis.cYomi.value ;
        result.type = cThis.cType.value ;
        result.levelValue = cThis.cLevel.GetLevelValue() ;
        result.levelText  = levels[result.levelValue] ;
        result.accent = DnsDictionaryEditor.instance.stdAccent.GetAccentText() ; // document.getElementById('dic_data_accent').textContent ;
        return result ;
    }
    function DicMenuCommand ( item, event )
    {
        switch( item.id )
        {
            case "mi_aud_save" :
                OnSave() ;
                break ;
            case "mi_aud_export" :
                break ;
            case "mi_close" :
                OnClose() ;
                break ;
            case 'mi_aud_append' :            // アイテムを追加
                OnAppend() ;
                break ;
            case 'mi_aud_delete' :            // アイテムを削除
                OnRemove() ;
                break ;
            case 'mi_aud_speak' :             // 発声テスト
                OnTest() ;
                break ;
            case 'mi_udic_sort_word_asc' :    // 単語(昇順)
                break ;
            case 'mi_udic_sort_word_desc' :   // 単語(降順)
                break ;
            case 'mi_udic_sort_yomi_asc' :    // 読み(昇順)
                break ;
            case 'mi_udic_sort_yomi_desc' :   // 読み(降順)
                break ;
            case 'mi_aud_edit_mode' :         // 編集機能
                {
                    bEditMode = !bEditMode ;
                    menu.CheckMenuItem( 'mi_aud_edit_mode', bEditMode ) ;
                    document.getElementById('dic_edit_area').style.display    = bEditMode ? '' : 'none' ;
                    document.getElementById('dic_command_area').style.display = bEditMode ? '' : 'none' ;
                    DnsSetSettingValue( 'dns_dic_editmode', bEditMode ) ;
                    OnResize() ;
                }
                break ;
            case 'mi_aud_auto_read' :         // リストを読み上げる
                bListRead = !bListRead ;
                menu.CheckMenuItem( 'mi_aud_auto_read', bListRead ) ;
                DnsSetSettingValue( 'dns_dic_listread', bListRead ) ;
                break ;
            case 'mi_aud_auto_update' :       // アイテムの自動更新
                bAuotUpdate = !bAuotUpdate;
                menu.CheckMenuItem( 'mi_aud_auto_update', bAuotUpdate ) ;
                DnsSetSettingValue( 'dns_dic_autoupdate', bAuotUpdate ) ;
                break ;
            case 'mi_aud_show_control' :      // 特殊文字を表示する
                bDispAll = !bDispAll ;
                menu.CheckMenuItem( 'mi_aud_show_control', bDispAll ) ;
                DnsSetSettingValue( 'dns_dic_dispall', bDispAll ) ;
                OnNarrowChange() ;
                break ;
        }
        //CancelEvenet( event ) ;
        //return false ;
    }
    function OnYomiKeyDown( event )
    {
    }
    function OnYomiKeyUp( event )
    {
        var cThis = DnsDictionaryEditor.instance ;
        if( cThis.DataGrid.GetSelected() != null )
        {
            var c = cThis.cYomi.value.right(1) ;
            if( c.match(/[A-Za-zＡ-Ｚａ-ｚ]/g) == null )
            {
                var strTemp = cThis.cYomi.value.replace( /[ぁ-ん]/g, function( s ){ return String.fromCharCode( s.charCodeAt( 0 ) + 0x60 ) ; }) ;
                var strChars = strTemp.match(/[ァ-ンー]/g) ;
                strTemp = "" ;
                if( strChars )
                {
                    for( var c = 0 ; c < strChars.length ; c++ )
                    {
                        strTemp += strChars[c] ;
                    }                
                }
                if( cThis.cYomi.value != strTemp )
                {
                    cThis.cYomi.value = strTemp ;
                }
                if( cThis.cYomi.value != DnsDictionaryEditor.instance.stdAccent.GetYomiText() )
                {
                    cThis.stdAccent.SetAccent( cThis.cYomi.value ) ;
                    cThis.btnUpdate.disabled = false ;
                }
            }
        }
    }
    function OnYomiBlur( event )
    {
    }
    function OnYomiChange( event )
    {
    }
    function OnAddAccentChange( event )
    {
        document.getElementById('dns_ud_update').disabled = false ;
    }
    //-----------------------------------------------------------
    // 表示切替
    DnsDictionaryEditor.prototype.Activeate = function ( bActive )
    {
        var cThis = DnsDictionaryEditor.instance ;
        cThis.dicMain.style.display = bActive ? '' : 'none' ;
        //var items = cThis.dicMain.querySelectorAll("INPUT,LABEL,TABLE,TBODY") ;
        //bActive = ( bActive === true ) ;
        //for( var i = 0 ; i <  items.length ; i++ )
        //{
        //    items[i].style.display = bActive ? '' : 'none' ;
        //    //items[i].disabled = true ;
        //    //items[i].tabIndex = null ;
        //}
    }
    //-----------------------------------------------------------
    // アイテム追加
    DnsDictionaryEditor.prototype.AppendItem = function( word, yomi, accent, type, level )
    {
        var dicitem = document.createElement("item") ;
        var newitem = [] ;
        dicitem.textContent = word ;
        dicitem.attributes.setNamedItem( attr = document.createAttribute('yomi'))   ; attr.value = yomi ;
        dicitem.attributes.setNamedItem( attr = document.createAttribute('accent')) ; attr.value = accent ;
        dicitem.attributes.setNamedItem( attr = document.createAttribute('type'))   ; attr.value = type ;
        dicitem.attributes.setNamedItem( attr = document.createAttribute('level'))  ; attr.value = level ;

        newitem = 
        {
            col1:dicitem.textContent,
            col2:dicitem.attributes.getNamedItem('yomi').nodeValue,
            col3:dicitem.attributes.getNamedItem('type').nodeValue,
            col4:levels[dicitem.attributes.getNamedItem('level').nodeValue],
            data:dicitem
        } ;
        newitem = this.DataGrid.AppendItem( newitem ) ;
        this.DataGrid.Sort( 1, false ) ;
        if( this.cNarrows.GetValue() != 0 )
        {
            // 読み選択が[全て]以外の時はすべて表示する。
            this.cNarrows.SetValue( 0 ) ;
            OnNarrowChange() ;
        }
        this.DataGrid.ItemSelect( newitem ) ;
        this.SetDictionaryInfo() ;
        this.btnSave.disabled = false ;
        return true ;
    }
    DnsDictionaryEditor.prototype.SetDictionaryInfo = function ()
    {
        var cThis = DnsDictionaryEditor.instance ;
        var nActive = cThis.DataGrid.GetItemCount( true ) ;
        var nTotal  = cThis.DataGrid.GetItemCount() ;
        cThis.statusbar.SetText( 1, "表示:" + nActive ) ;
        cThis.statusbar.SetText( 2, "総数:" + nTotal ) ;
        if( nActive == 0 )
        {
            DisableFields() ;
        }
    }
    DnsDictionaryEditor.prototype.ItemSelect = function( newItem )
    {
        if( newItem.GetColumn != undefined )
        {
            if( newItem.style.display == 'none' )
            {
                this.cNarrows.SetValue( 0 ) ;
                OnNarrowChange() ;
            }
            this.DataGrid.ItemSelect( newItem ) ;
        }
    }
    function DisableFields()
    {
        var cThis = DnsDictionaryEditor.instance ;
        cThis.cWord.value = '' ;
        cThis.cYomi.value = '' ;
        cThis.cWord.disabled = true ;
        cThis.cYomi.disabled = true ;
        cThis.cType.disabled = true ;
        var cLevels = cThis.cLevel.getElementsByTagName("INPUT") ;
        var cLabels = cThis.cLevel.getElementsByTagName("LABEL") ;
        for( var i = 0 ; i < cLevels.length ; i++ )
        {
            cLevels[i].disabled = true ;
            cLabels[i].disabled = true ;
        }
        cThis.stdAccent.disabled = true ;
        cThis.stdAccent.AccentCtrl.disabled = true ;
        cThis.stdAccent.SetAccent( '' ) ;
        cThis.cLevel.SetLevelValue( 2 ) ;
    }
    function NarrowsGetValue()
    {
        var items = this.querySelectorAll("input[type=radio]") ;
        for( var i = 0 ; i < items.length ; i++ )
        {
            if( items[i].checked != false )
            {
                return i ;
            }
        }
        return -1 ;
    }
    function NarrowsSetValue( index )
    {
        var items = this.querySelectorAll("input[type=radio]") ;
        for( var i = 0 ; i < items.length ; i++ )
        {
            items[i].checked = ( index == i ) ? true : false ;
        }
        return ;
    }
    // 音声再生テスト
    DnsDictionaryAppend.prototype.ReadTest = function ( text, button )
    {
        var cThis = DnsDictionaryEditor.instance ;

        if( cThis.audio.paused == false )
        {
            cThis.audio.pause() ;
        }
        cThis.statusbar.SetText( 0, text ) ;
        if( text != undefined && text != null && 0 < text.length )
        {
            if( button != undefined )
            {
                button.disabled = true ;
            }
            AudioTools.prototype.TextToAudio( text + "●", 
                function( data )
                {
                    cThis.audio.onloadeddata = function ()
                    {
                        cThis.audio.play() ;
                    }
                    cThis.audio.onended = function ()
                    {
                        if( button != undefined )
                        {
                            button.disabled = false ;
                        }
                    }
                    cThis.audio.src = data ;
                },
                function( result, infoText )
                {
                    var errorText = "音声の取得に失敗しました\n\"" ;
                    if( infoText != undefined )
                    {
                        errorText += infoText ;
                    }
                    errorText += "---------------------\n"
                    for( var n in result )
                    {
                        if( typeof result[n] == "string" || typeof result[n] == "number" )
                        {
                            errorText += "responce." + n + " = " + result[n] + "\n" ;
                        }
                    }
                    alert( errorText ) ;
                    if( button != undefined )
                    {
                        button.disabled = false ;
                    }
                }
            ) ;
        }
        return ;
    }

    OnResize() ;
    this.SetDictionaryInfo() ;
    // 単語追加命令
    if( typeof addWord == 'string' && 0 < addWord.length )
    {
        this.append.Append( addWord ) ;
    }
    this.Update = function()
    {
        OnUpdate() ;
    }
	if( navigator.userAgent.toLowerCase().indexOf('edge') > 0 && navigator.appVersion.toLowerCase().indexOf('edge') > 0 )
	{
		setTimeout( function()
		{
			if( (window.width !== void 0) && (window.height !== void 0) )
			{
				window.resizeTo(window.width, window.height);
			}
		}, 30 ) ;
	}
} 

DnsDictionaryEditor.instance = null ;
DnsDictionaryEditor.datatype = 0 ;      // データタイプ設定

window.addEventListener("message", receiveMessage, false) ;

function receiveMessage( event )
{
    var data = window.JSON.parse(event.data) ;
    if( data.method === 'add' && typeof data.word == 'string' && 0 < data.word.length )
    {
        if( DnsDictionaryEditor.instance.btnUpdate.disabled != false )
        {
            DnsDictionaryEditor.instance.append.Append( data.word ) ;
        }
        else
        {
            DnsMessageBox( "選択中の単語を編集中です。\n編集を更新して追加処理を実行しますか？", "確認", "更新する;更新しない;追加をキャンセル",
                function ()
                {
                    DnsDictionaryEditor.instance.Update() ;
                    DnsDictionaryEditor.instance.append.Append( data.word ) ;
                },
                function ()
                {
                    DnsDictionaryEditor.instance.append.Append( data.word ) ;
                },
                function ()
                {
                    return ;
                }
                ) ;
        }
    }
    else if( data.method === 'close' )
    {
        DnsDictionaryEditor.instance.btnUpdate.disabled = true ;
        DnsDictionaryEditor.instance.btnSave.disabled = true ;
        window.close() ;
    }
}
