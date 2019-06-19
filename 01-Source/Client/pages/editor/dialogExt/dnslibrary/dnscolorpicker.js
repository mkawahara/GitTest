// +--------------------------------------------------------------------------+
// |  ファイル名 ： dnscolorpicker.js                                         |
// |  概要       ： 色選択ツール                                              |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// |                株式会社デジタルノーツ                                    |
// +--------------------------------------------------------------------------+

function DnsColorPicker_Initialize()
{
    var scripts = document.getElementsByTagName("script");
    var path = null ;
    for( var i = 0 ; i < scripts.length ; i++ )
    {
        if( (path = scripts[i].src.match(/(^|.*\/)dnscolorpicker\.js$/)) != null )
        {
            include( path[1] + 'dnscolorpicker.css' ) ;
            break ;
        }
    }
}

DnsColorPicker_Initialize() ;

function DnsShowColorPicker( elem, callfunc )
{
    var dns_colors = new Array(
    "#FFFFFF", "#FFCCCC", "#FFCC99", "#FFFF99", "#FFFFCC", "#99FF99", "#99FFFF", "#CCFFFF", "#CCCCFF", "#FFCCFF", 
    "#CCCCCC", "#FF6666", "#FF9966", "#FFFF66", "#FFFF33", "#66FF99", "#33FFFF", "#66FFFF", "#9999FF", "#FF99FF", 
    "#C0C0C0", "#FF0000", "#FF9900", "#FFCC66", "#FFFF00", "#33FF33", "#66CCCC", "#33CCFF", "#6666CC", "#CC66CC", 
    "#999999", "#CC0000", "#FF6600", "#FFCC33", "#FFCC00", "#33CC00", "#00CCCC", "#3366FF", "#6633FF", "#CC33CC", 
    "#666666", "#990000", "#CC6600", "#CC9933", "#999900", "#009900", "#339999", "#3333FF", "#6600CC", "#993399", 
    "#333333", "#660000", "#993300", "#996633", "#666600", "#006600", "#336666", "#000099", "#333399", "#663366", 
    "#000000", "#330000", "#663300", "#663333", "#333300", "#003300", "#003333", "#000066", "#330099", "#330033"
    ) ;
    var div   = document.createElement("div") ;
    var table = document.createElement("table") ;
    var tbody = document.createElement("tbody") ;
    var tr = null ;
    var td = null ;

    div.className = 'dns_color_picker_background' ;
    table.appendChild( tbody ) ;
    table.className = 'dns_color_picker' ;
    div.appendChild( table ) ;
    document.body.appendChild( div ) ;

    // カラー選択テーブルの中に各色のセルを作成する
    for( var i = 0 ; i < dns_colors.length ; i++ )
    {
        if( (i%10) == 0 )
        {
            tbody.appendChild( tr = document.createElement("tr") ) ;
        }
        tr.appendChild( td = document.createElement("td") ) ;
        td.appendChild( document.createElement("br") ) ;
        td.className = 'dns_color_picker_item' ;
        td.style.backgroundColor = td.style.color = dns_colors[i] ;
    }

    var rcTable = table.getBoundingClientRect() ; // カラー選択テーブルの矩形
    var rcElem  = elem.getBoundingClientRect() ;  // 呼び出し要素の矩形

    // 呼び出し要素の右端にカラー選択テーブルを揃える
    table.style.left  = parseInt( rcElem.left ) + 'px' ;
    if( (rcElem.bottom+rcTable.height) < document.body.clientHeight )
    {
        // 呼び出し要素の下側に配置
        table.style.top   = parseInt( rcElem.bottom ) + 'px' ;
    }
    else
    {
        // 呼び出し要素の上側に配置(下側に配置すると、ブラウザのクライアント領域に収まらないため)
        table.style.top   = parseInt( rcElem.top - rcTable.height ) + 'px' ; // ( elem.offsetParent.offsetTop  + elem.offsetTop + elem.offsetHeight ) + 'px' ;
    }

    //---------------------------------------
    // Windowのクリックイベント
    function DnsColorPickerClick( event )
    {
        event.stopPropagation();
        event.preventDefault();
        DnsRemoveEventProc( window, 'click', DnsColorPickerClick ) ;
        DnsRemoveEventProc( window, 'resize', DnsColorPickerCancel ) ;
        DnsRemoveEventProc( window, 'blur', DnsColorPickerCancel ) ;
        if( event.target.className == 'dns_color_picker_item' )
        {
            // 色セルのうちのどれかでクリックされた場合
            var color = event.target.style.backgroundColor ;
            if( callfunc != undefined )
            {
                // 呼び出し側が指定した関数をコールする
                callfunc( color ) ;
            }
        }
        document.body.removeChild( div ) ;
    }
    //---------------------------------------
    // カラー選択テーブルのキャンセル処理
    function DnsColorPickerCancel( event )
    {
        event.stopPropagation();
        event.preventDefault();
        DnsRemoveEventProc( window, 'click', DnsColorPickerClick ) ;
        DnsRemoveEventProc( window, 'resize', DnsColorPickerCancel ) ;
        DnsRemoveEventProc( window, 'blur', DnsColorPickerCancel ) ;
        document.body.removeChild( div ) ;
    }
    // Windowのクリックイベント
    DnsAddEventProc( window, 'click',  DnsColorPickerClick ) ;
    // リサイズされるかフォーカスを失う場合はキャンセル処理
    DnsAddEventProc( window, 'resize', DnsColorPickerCancel ) ;
    DnsAddEventProc( window, 'blur',   DnsColorPickerCancel ) ;
}
