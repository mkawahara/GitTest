// +--------------------------------------------------------------------------+
// |                           ChattyInfty-Online                             |
// |                         株式会社デジタルノーツ                           |
// +--------------------------------------------------------------------------+
// |  ファイル名 ： dictionaryappend.js                                       |
// |  概要       ： 単語辞書追加画面                                          |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// +--------------------------------------------------------------------------+

var DnsDictionaryAppend = function()
{
    DnsDictionaryAppend.instance = this ;
    this.Screen    = document.getElementById('dic_append_area_back');
    this.Dialog    = document.getElementById('dic_append_area_dialog');
    this.cWord     = document.getElementById('add_dic_data_1') ;
    this.cYomi     = document.getElementById('add_dic_data_2') ;
    this.cType     = document.getElementById('add_dic_data_3') ;
    this.cTypes    = this.cType.getElementsByTagName('OPTION') ;
    this.cLevel    = document.getElementById('add_dic_data_4') ;
    this.cLevelRadios = [ document.getElementById('add_dic_data_4_1'), document.getElementById('add_dic_data_4_2'), document.getElementById('add_dic_data_4_3'), document.getElementById('add_dic_data_4_4'), document.getElementById('add_dic_data_4_5') ] ;
    this.cLevelLabels = [ document.getElementById('add_dic_data_4_1_label'), document.getElementById('add_dic_data_4_2_label'), document.getElementById('add_dic_data_4_3_label'), document.getElementById('add_dic_data_4_4_label'), document.getElementById('add_dic_data_4_5_label') ] ;
    this.btnTest   = document.getElementById('add_dic_test' ) ;
    this.btnEnter  = document.getElementById('add_dic_enter' ) ;
    this.btnCancel = document.getElementById('add_dic_cancel' ) ;
    this.addAccent = new DnsAccentControl( document.getElementById('add_dic_data_accent'), 'add', AddAccentChange ) ;
    this.tempWord  = '' ;
    this.cLevel.GetLevelValue = GetLevelValue ;

    DnsAddEventProc( this.btnTest,   'click',  OnReadTest ) ;
    DnsAddEventProc( this.cWord,     'keyup',  OnWordKeyUp ) ;
    DnsAddEventProc( this.cWord,     'change', OnWordChange ) ;
    DnsAddEventProc( this.cYomi,     'keyup',  OnYomiKeyUp ) ;
    DnsAddEventProc( this.cType,     'change', OnHinshiChange ) ;
    DnsAddEventProc( this.btnEnter,  'click',  OnEnter ) ;
    DnsAddEventProc( this.btnCancel, 'click',  OnCancel ) ;
    DnsAddEventProc( document.getElementById('dic_append_area_close'), 'click', OnCancel ) ;

    // 優先度設定のラジオボタンのイベント設定
    for( var i = 0 ; i < this.cLevelRadios.length ; i++ )
    {
        this.cLevelRadios[i].onchange  = OnLevelChange ;
        this.cLevelLabels[i].onkeydown = OnRadioButtonLabelKeyDown ;
    }
     
    //----------------------------------------------------------
    // 画面のリサイズイベント(ウィンドウの中央に配置)
    DnsDictionaryAppend.prototype.OnResize = function ()
    {
        if( DnsDictionaryAppend.instance != null )
        {
            var cThis = DnsDictionaryAppend.instance ;
            cThis.Dialog.style.left = ( ( cThis.Screen.offsetWidth  - cThis.Dialog.offsetWidth  ) / 2 ) + 'px' ;
            cThis.Dialog.style.top  = ( ( cThis.Screen.offsetHeight - cThis.Dialog.offsetHeight ) / 2 ) + 'px' ;
        }
    }
    //----------------------------------------------------------
    // 追加登録画面を表示する
    DnsDictionaryAppend.prototype.Append = function ( word )
    {
        var cThis = DnsDictionaryAppend.instance ;
        var item = DnsDictionaryEditor.instance.DataGrid.FirstItem() ;

        if( typeof word == 'string' && 0 < word.length )
        {
            // 全てを全角文字に変換
            word = decodeURI( word ).replace( /[A-Za-z0-9-!"#$%&'()=<>,.?_\[\]{}@^~\\]/g, function(str){ return String.fromCharCode(str.charCodeAt(0) + 65248); } ) ;
            while( item != null )
            {
                if( item.GetColumn( 0 ) == word )
                {
                    break ;
                }
                item = item.nextElementSibling ;
            }
            if( item != null )
            {
                DnsMessageBox( '「' + word + '」は既に登録済みです。', '確認' ) ;
                DnsDictionaryEditor.instance.ItemSelect( item ) ;
                return false ;
            }
        }
        else
        {
            word = undefined ;
        }

        if( word != undefined )
        {
            SjisCheck( word, function(){ DnsDictionaryAppend.instance.Show( word ) } ) ;
        }
    }
    function SjisCheck( word, successProc, errorProc )
    {
        Communicator.request('sjisCheck',
            {
                word:word
            },
            function ( res )
            {
                if( res.error_code == 0 )
                {
                    if( res.result == true )
                    {
                        if( successProc != undefined )
                        {
                            successProc() ;
                        }
                    }
                    else
                    {
                        var pattern = RegExp('[^' + res.text + ']','g') ;
                        var checks = word.match(pattern) ;
                        var errs  = "" ;
                        var codes = [] ;
                        for( var c = 0 ; c < checks.length ; c++ )
                        {
                            codes[checks[c]] = checks[c] ;
                        }
                        for( var c in codes )
                        {
                            errs += '「' + c + '」' ;
                        }
                        DnsMessageBox( "「" + word + "」には登録できない文字" + errs + "が含まれています。\nシフトＪＩＳコードで表示可能な文字を指定してください。", "警告", undefined, errorProc ) ;
                    }
                }
            },
            function ( res )
            {
                console.log('Shft-Jis Check Error') ;
                if( errorProc != undefined )
                {
                    errorProc( res )
                }
            }
        ) ;
    }
    //----------------------------------------------------------
    // 追加登録画面を表示する
    DnsDictionaryAppend.prototype.Show = function( word )
    {
        DnsDictionaryEditor.instance.Activeate( false ) ;
        cThis = DnsDictionaryEditor.instance.append ;
        cThis.cWord.tabIndex = 1 ;
        cThis.cYomi.tabIndex = 2 ;
        cThis.Screen.style.display = '' ;
        cThis.OnResize() ;
        if( word != undefined )
        {
            cThis.cWord.value = word ;
            cThis.cYomi.value = '' ;
            cThis.SetYomiText( word ) ;
            cThis.cWord.disabled = true ;
            setTimeout( function () { cThis.cYomi.focus() ; }, 500 ) ;
        }
        else
        {
            cThis.cWord.value = '' ;
            cThis.cWord.disabled = false ;
            setTimeout( function () { cThis.cWord.focus() ; }, 500 ) ;
        }
        cThis.addAccent.SetAccent( "" ) ;
        cThis.cYomi.value = '' ;
        cThis.cTypes[0].selected = true ;
        cThis.cLevelRadios[2].checked = true ;
        cThis.btnTest.disabled = false ;
        cThis.btnEnter.disabled = false ;
    }
    //----------------------------------------------------------
    // 追加登録画面を非表示にする
    function OnCancel( event )
    {
        DnsDictionaryAppend.instance.Screen.style.display = 'none' ;
        setTimeout( function(){ DnsDictionaryEditor.instance.stdAccent.OnResize() ; }, 100 ) ;
        DnsDictionaryEditor.instance.Activeate( true ) ;
    }
    //----------------------------------------------------------
    // 音声サーバーを使って単語からカタカナを取得して、
    // 読みとアクセントを設定する
    DnsDictionaryAppend.prototype.SetYomiText = function ( word )
    {
        if( word != undefined && word != null && 0 < word.length )
        {
            AudioTools.prototype.GetReadText( word, 
                function( data )
                {
                    if( typeof data == 'string' )
                    {
                        var strChars = data.match(/[ァ-ンー]/g) ;
                        if( strChars != null )
                        {
                            var strTemp = '' ;
                            for( var c = 0 ; c < strChars.length ; c++ )
                            {
                                strTemp += strChars[c] ;
                            }
                            DnsDictionaryAppend.instance.addAccent.SetAccent( strTemp ) ;
                            DnsDictionaryAppend.instance.cYomi.value = strTemp ;
                        }
                    }
                },
                function(jqXHR, textStatus, error)
                {
                }
            ) ;
        }
        else
        {
            DnsDictionaryAppend.instance.addAccent.SetAccent( "" ) ;
            DnsDictionaryAppend.instance.cYomi.value = "" ;
        }
    }
    //----------------------------------------------------------
    // 決定キーイベント
    function OnEnter( event )
    {
        var cThis  = DnsDictionaryAppend.instance ;
        var cEdit = DnsDictionaryEditor.instance ;
        var strWord  = cThis.cWord.value ;
        var strYomi  = cThis.cYomi.value ;
        var strHnshi = cThis.cType.value ;
        var nLevel   = cThis.cLevel.GetLevelValue() ;
        var strAccent= cThis.addAccent.GetAccentText() ;
        var item ;

        if( strWord.length == 0 )
        {
            DnsMessageBox( "表記(単語)を設定してください。", "確認" ) ;
            return ;
        }
        else if( (item=cEdit.DataGrid.FindItem( strWord )) != null )
        {
            DnsMessageBox( strWord + "は既に登録されています。", "確認" ) ;
            cEdit.ItemSelect( item ) ;
            return ;
        }
        if( strYomi.length == 0 )
        {
            DnsMessageBox( "読みを設定してください。", "確認" ) ;
            return ;
        }
        SjisCheck( strWord, function(){
            setTimeout( function(){ 
                DnsDictionaryEditor.instance.AppendItem( strWord, strYomi, strAccent, strHnshi, nLevel ) ;
            }, 100 ) ;
            cThis.Screen.style.display = 'none' ;        
            cEdit.Activeate( true ) ;
        } ) ;
    }
    //----------------------------------------------------------
    // 読み上げテスト
    function OnReadTest( event )
    {
        if( DnsDictionaryAppend.instance == null )
        {
            return false ;
        }
        var read_text = DnsDictionaryAppend.instance.addAccent.GetReadText() ;
        DnsDictionaryAppend.prototype.ReadTest( read_text, DnsDictionaryAppend.instance.btnTest ) ;
    }
    //----------------------------------------------------------
    // アクセントコントロールの変更イベント
    function AddAccentChange( event )
    {
        if( DnsDictionaryAppend.instance.addAccent == null )
        {
            return false ;
        }
        DnsDictionaryAppend.instance.btnEnter.disabled = false ;
        DnsDictionaryAppend.prototype.ReadTest( DnsDictionaryAppend.instance.addAccent.GetReadText(), DnsDictionaryAppend.instance.btnTest ) ;
    }
    //----------------------------------------------------------
    // 単語の変更処理
    function OnWordKeyUp( event )
    {
        var cThis = DnsDictionaryAppend.instance ;
        if( cThis == null )
        {
            return false ;
        }
        if( cThis.tempWord != cThis.cWord.value )
        {
            cThis.tempWord = cThis.cWord.value ;
            cThis.SetYomiText( cThis.cWord.value, cThis ) ;
        }
    }
    function OnWordChange( event )
    {
        var cThis = DnsDictionaryAppend.instance ;
        var word = cThis.cWord.value ;
        if( 0 < word.length )
        {
            SjisCheck( cThis.cWord.value, function(){
                setTimeout( function (){ cThis.cWord.focus() ; }, 100 ) ;
            } ) ;
        }
    }
    //----------------------------------------------------------
    // 読みテキストボックスでのキーアップ処理
    // (入力を強制的に全角カタカナに変換する)
    function OnYomiKeyUp( event )
    {
        var cThis = DnsDictionaryAppend.instance ;
        if( cThis == null )
        {
            return false ;
        }
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
                cThis.btnEnter.disabled = false ;
            }
            if( cThis.cYomi.value != cThis.addAccent.GetYomiText() )
            {
                cThis.addAccent.SetAccent( cThis.cYomi.value ) ;
                cThis.btnEnter.disabled = false ;
            }
        }
    }
    //-------------------------------------------------------------
    // イベント：品詞のドロップダウンリスト変更イベント
    function OnHinshiChange( event )
    {
        var cThis = DnsDictionaryAppend.instance ;
        if( 0 < cThis.cWord.value.length && 0 < cThis.cYomi.value.length )
        {
            cThis.btnEnter.disabled = false ;
        }
    }
    //-------------------------------------------------------------
    // イベント：優先度のラジオボタン変更イベント 
    function OnLevelChange( event )
    {
        var cThis = DnsDictionaryAppend.instance ;
        cThis.btnEnter.disabled = false ;
    }
    //-------------------------------------------------------------
    // イベント：優先度ラジオボタンでのキーダウン
    function OnRadioButtonLabelKeyDown( event )
    {
        var cThis = DnsDictionaryAppend.instance ;
        var item = event.target ;
        switch( event.keyCode )
        {
            case 0x20 :
                {
                    item.previousElementSibling.checked = true ;
                    var e = [] ;
                    e.target = item.previousElementSibling ;
                    item.previousElementSibling.onchange( e ) ;
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
}


function GetLevelValue()
{
    var items = this.querySelectorAll("input[type=radio]") ;
    var result = null ;

    for( var i = 0 ; i < items.length ; i++ )
    {
        if( items[i].checked != false )
        {
            var levelValue = items[i].attributes.getNamedItem('level_value') ;
            if( levelValue != null )
            {
                result = parseInt( levelValue.value ) ;
            }
            break ;
        }
    }
    return result ;
}
function SetLevelValue( level )
{
    if( level == undefined || level == null )
    {
        return false ;
    }
    if( typeof level == 'string' )
    {
        level = parseInt(level) ;
    }

    var items = this.querySelectorAll("input[type=radio]") ;
    var result = false ;

    for( var i = 0 ; i < items.length ; i++ )
    {
        var levelValue = items[i].attributes.getNamedItem('level_value') ;
        if( levelValue != null && level == parseInt( levelValue.value ) )
        {
            items[i].checked = true ;
            result = true ;
        }
        else
        {
            items[i].checked = false ;
        }
    }
    return result ;
}
//----------------------------------------------------------
// 追加登録画面のインスタンス
DnsDictionaryAppend.instance = null ;
