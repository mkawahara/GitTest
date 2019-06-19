// +--------------------------------------------------------------------------+
// |  ファイル名 ： dnsdialog.js                                              |
// |  概要       ： ファイアログ/メッセージボックスツール                     |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// |                株式会社デジタルノーツ                                    |
// +--------------------------------------------------------------------------+

function DnsDialog_Initialize()
{
    var scripts = document.getElementsByTagName("script");
    var path = null ;
    for( var i = 0 ; i < scripts.length ; i++ )
    {
        if( (path = scripts[i].src.match(/(^|.*\/)dnsdialog\.js$/)) != null )
        {
            include( path[1] + 'dnsdialog.css' ) ;
            break ;
        }
    }
}

DnsDialog_Initialize() ;

var DnsDialog = function ( rarentElement )
{
}

var DnsMessageBox = function ( messageText, captionText, buttonTexts, proc1, proc2, proc3 )
{
    overlap = document.createElement('div') ;
    msgbox  =  document.createElement('div') ;

    overlap.id        = 'dns_overlap_area' ;
    overlap.className = 'dns_overlap_area' ;
    
    if( captionText == undefined )
    {
        captionText = 'ERROR' ;
    }

    messageText = String(messageText).replace("\n","<br/>") ;

    msgbox.className = 'dns_message_box' ;
    msgbox.style.display = 'none' ;
    msgbox.innerHTML = 
    '<div id="dns_message_caption" class="dns_message_caption color">' + captionText + '<div id="dns_message_button_close">M</div></div>' +
    '<div id="dns_message_text"    class="dns_message_text">' +          messageText + '</div>' +
    '<div class="dns_message_button_aera"></div>' ;

    overlap.appendChild( msgbox ) ;
    document.body.appendChild( overlap ) ;

    var buttonArea = msgbox.getElementsByClassName('dns_message_button_aera')[0] ;
    if( buttonTexts && 0 < (buttonTexts=buttonTexts.split(/[,;\t]/)).length )
    {
        var maxWidth = 0 ;
        for( var i = 0 ; i < buttonTexts.length && i < 3 ; i++ )
        {
            var button = document.createElement('input') ;
            button.type = 'button' ;
            button.id = 'dns_message_button_' + ( i + 1 ) ;
            button.className = 'button color dns_message_button' ;
            button.value = buttonTexts[i] ;
            buttonArea.appendChild( button ) ;
            DnsAddEventProc( button, 'click', OnButtonClick ) ;
        }
    }
    else
    {
        var buttonOK   = document.createElement('input') ;
        buttonOK.type = 'button' ;
        buttonOK.id = 'dns_message_button_ok' ;
        buttonOK.className = 'button color dns_message_button' ;
        buttonOK.value ='OK' ;
        buttonOK.style.styleFloat = 'right' ;
        buttonOK.style.marginRight = '10px' ;
        buttonArea.appendChild( buttonOK ) ;
        DnsAddEventProc( buttonOK, 'click', OnOk ) ;
    }

    setTimeout( function ( overlap, msgbox ) 
    {
        msgbox.style.display = '' ;
        msgbox.style.left = ((overlap.clientWidth-msgbox.clientWidth)/2) + 'px' ;
        msgbox.style.top  = ((overlap.clientHeight-msgbox.clientHeight)/2) + 'px' ;

        var buttons = buttonArea.getElementsByClassName('dns_message_button') ;
        if( 1 < buttons.length )
        {
            var maxWidth = 0 ;
            for( var i = 0 ; i < buttons.length ; i++ )
            {
                maxWidth = Math.max( maxWidth, buttons[i].offsetWidth ) ;
            }
            for( var i = 0 ; i < buttons.length ; i++ )
            {
                buttons[i].style.width = buttons[i].style.maxWidth = maxWidth + 'px' ;
            }
        } ;
        buttons[0].focus() ;
    }, 50, overlap, msgbox ) ;

    DnsAddEventProc( overlap, 'click', CancelEvenet ) ;
    DnsAddEventProc( window, 'beforeunload', BeforeUnload ) ;
    DnsAddEventProc( document.getElementById('dns_message_button_close'), 'click', OnCancel ) ;

    function OnOk( event )
    {
        DnsRemoveEventProc( window, 'beforeunload', BeforeUnload ) ;
        overlap.style.display = 'none' ;
        overlap.parentElement.removeChild( overlap ) ;
        if( proc1 != undefined )
        {
            proc1() ;
        }
        return true ;
    }
    function OnCancel( event )
    {
        DnsRemoveEventProc( window, 'beforeunload', BeforeUnload ) ;
        overlap.style.display = 'none' ;
        overlap.parentElement.removeChild( overlap ) ;
        if( proc2 != undefined )
        {
            proc2() ;
        }
        return false ;
    }
    function OnButtonClick( event )
    {
        DnsRemoveEventProc( window, 'beforeunload', BeforeUnload ) ;
        overlap.style.display = 'none' ;
        overlap.parentElement.removeChild( overlap ) ;
        switch( event.target.id )
        {
            case 'dns_message_button_1' : if( proc1 != undefined ) { proc1() ; } ; break ;
            case 'dns_message_button_2' : if( proc2 != undefined ) { proc2() ; } ; break ;
            case 'dns_message_button_3' : if( proc3 != undefined ) { proc3() ; } ; break ;
        }
        return true ;
    }
    //------------------------------------------
    function BeforeUnload( event )
    {
        return false ;
    }
}
