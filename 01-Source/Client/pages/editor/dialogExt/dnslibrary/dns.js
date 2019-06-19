// +--------------------------------------------------------------------------+
// |  ファイル名 ： dns.js                                                    |
// |  概要       ： Javascript汎用ツール                                      |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// |                株式会社デジタルノーツ                                    |
// +--------------------------------------------------------------------------+

//=============================================================================
// イベント追加
function DnsAddEventProc(obj, eventname, funcname, useCapture )
{
    useCapture = ( useCapture === true ) ;
    if( eventname == 'mousewheel' && window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1 )
    {
        window.addEventListener( 'DOMMouseScroll', funcname, useCapture ) ;
    }
    else
    {
        if (obj.addEventListener != undefined)
        {
            obj.addEventListener(eventname, funcname, useCapture );
        }
        else {
            obj.attachEvent('on' + eventname, funcname);
        }
    }
}
//-----------------------------------------------------------------------------
// イベント削除
function DnsRemoveEventProc(obj, eventname, funcname, useCapture )
{
    useCapture = ( useCapture === true ) ;
    if (obj.removeEventListener != undefined) {
        obj.removeEventListener(eventname, funcname);
    }
    else {
        obj.detachEvent('on' + eventname, funcname);
    }
}
//-----------------------------------------------------------------------------
// Javascript/CSSのインクルード(遅延読み込み)
function include( strFile )
{
    if( strFile.match(/.js$/i) != null )
    {
        var script = document.createElement('script') ;
        script.src = strFile ;
        script.type = 'text/javascript';
        script.defer = true;
        document.getElementsByTagName('head').item(0).appendChild(script);
    }
    else if( strFile.match(/.css$/i) != null )
    {

        var styleSheet = document.createElement("link") ;
        styleSheet.type = 'text/css' ;
        styleSheet.rel  = 'stylesheet' ;
        styleSheet.href = strFile ;
        document.head.appendChild( styleSheet ) ;
    }
}
//-----------------------------------------------------------------------------
// URLのパラメータ取得
function GetParams()
{
    var req = {}, query = location.search.replace('?', '').split('&') ;

    for( ; query.length > 0 ; )
    {
        var ar = query.pop().split('=');
        req[ar[0]] = ar[1];
    } ;
    return req ;
}
//-----------------------------------------------------------
// ノード中の不要なテキストを削除する
function DnsRemoveNeedlessText( element, callback )
{
    if( element != null )
    {
        for( var i = element.childNodes.length - 1 ; i >= 0 ; i-- )
        {
            if( element.childNodes[i].nodeType == 3 )
            {
                if( element.childNodes[i].textContent.replace(/[\r,\n,\t, ]/g, '' ).length == 0 )
                {
                    element.removeChild( element.childNodes[i] ) ;
                }
            }
            else if( callback === true && element.childNodes[i].nodeType == 1 )
            {
                DnsRemoveNeedlessText( element.childNodes[i], callback ) ;
            }
        }
    }
}
//-----------------------------------------------------------
// イベントをキャンセルする
function CancelEvenet( event )
{
    if( event != undefined )
    {
        event.preventDefault();
        event.stopPropagation();
        if( event.returnValue != undefined )
        {
            event.returnValue = false ;
        }
    }
    if( Event != undefined )
    {
        if( Event.preventDefault != undefined )
        {
            Event.preventDefault();
        }
        if( Event.stopPropagation != undefined )
        {
            Event.stopPropagation();
        }
    }
    return false;
}
//============================================================================
// 設定の取得：LocalStrageから値を取得する
function DnsGetSettingString( name, strDefault )
{
    if( window.localStorage )
    {
        var strResult = window.localStorage[name] ;
        if( strResult != undefined )
        {
            return strResult ;
        }
    }
    return strDefault ;
}
//------------------------------------------------------------
// 設定の保存：LocalStrageに設定値を保存する
function DnsSetSettingValue( name, data )
{
    if( window.localStorage )
    {
        if( data != null && data != undefined )
        {
            window.localStorage[name] = data ;
        }
        else
        {
            window.localStorage.removeItem(name);
        }
    }
}
//------------------------------------------------------------
// 文字列の右から取得
String.prototype.right = function( nLen )
{
    var strResult = this.valueOf();
    strResult = strResult.substr(strResult.length-nLen,nLen);
    return strResult ;
}
//=============================================================================
