// +--------------------------------------------------------------------------+
// |  ファイル名 ： dnsstatusbar.js                                           |
// |  概要       ： ステータスバー                                            |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// |                株式会社デジタルノーツ                                    |
// +--------------------------------------------------------------------------+

function DnsSstatusBar_Initialize()
{
    var scripts = document.getElementsByTagName("script");
    var path = null ;
    for( var i = 0 ; i < scripts.length ; i++ )
    {
        if( (path = scripts[i].src.match(/(^|.*\/)dnsstatusbar\.js$/)) != null )
        {
            include( path[1] + 'dnsstatusbar.css' ) ;
            break ;
        }
    }
}

DnsSstatusBar_Initialize() ;

var DnsStatusBar = function ( parentElement, glipper )
{
    var panes = new Array() ;
    var statusbar = null ;
    var tbody = null ;
    var tr = null ;

    parentElement.appendChild( statusbar = document.createElement('table') ) ;
    statusbar.className = 'DnsStatusBar' ;
    statusbar.appendChild( tbody = document.createElement('tbody') ) ;
    tbody.appendChild( tr = document.createElement('tr') ) ;
    tr.appendChild( td = document.createElement('td') ) ;
    td.className = 'firstPane' ;
    td.appendChild( panes[0] = p = document.createElement('p') ) ;

    if( glipper === true )
    {
        tr.appendChild( glipperArea = document.createElement('td') ) ;
        glipperArea.className = 'glipper' ;
        
    }
    //--------------------------------
    // パネルを追加する
    // width ・・・パネルの幅(整数)[省略可]
    // align ・・・パネルのテキスト配置 left,center,right [省略可]
    // text  ・・・パネルのテキスト[省略可]
    DnsStatusBar.prototype.AppendPane = function ( width, align, text )
    {
        var td = document.createElement('td') ;
        var p = panes[panes.length] = document.createElement('p') ;
        tr.appendChild( td ) ;
        td.appendChild( p ) ;
        if( glipperArea != undefined )
        {
            tr.removeChild( glipperArea ) ;
            tr.appendChild( glipperArea ) ;
        }
        if( width != null )
        {
            td.style.width = td.style.minWidth = td.style.maxWidth = width + 'px' ;
            //p.style.width = p.style.minWidth = p.style.maxWidth = ( width - 12 ) + 'px' ;
        }
        if( align != undefined && align != null )
        {
            td.style.textAlign = align ;
        }
        if( text != undefined && text != null )
        {
            p.textContent = text ;
        }
        return ;
    }
    //--------------------------------
    // パネルにテキストを設定
    // argv1・・テキストを設定した場合は最初のパネルにテキストを設定する
    //          数値を設定した場合は、指定したパネルにargv2の的人を設定
    // argv2 
    DnsStatusBar.prototype.SetText = function ( argv1, argv2 )
    {
        var type = typeof argv1 ;
        if( type == 'string' )
        {
            panes[0].textContent = argv1 ;
            return true ;
        }
        else if( type == 'number' && 0 <= argv1 && argv1 < panes.length )
        {
            panes[argv1].textContent = argv2 ;
            return true ;
        }
        return ;
    }
    //--------------------------------
    // ステータスバーの要素を取得する
    DnsStatusBar.prototype.GetElement = function ()
    {
        return statusbar ;
    }
}