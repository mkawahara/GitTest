// +--------------------------------------------------------------------------+
// |  ファイル名 ： dnsmenu.js                                                |
// |  概要       ： メニューバー                                              |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// |                株式会社デジタルノーツ                                    |
// +--------------------------------------------------------------------------+

function DnsMenu_Initialize()
{
    var scripts = document.getElementsByTagName("script");
    var path = null ;
    for( var i = 0 ; i < scripts.length ; i++ )
    {
        if( (path = scripts[i].src.match(/(^|.*\/)dnsmenu\.js$/)) != null )
        {
            include( path[1] + 'dnsmenu.css' ) ;
            break ;
        }
    }
}

DnsMenu_Initialize() ;

var DnsMenu = function( parentElement, menuData, cmdFunction )
{
    this.menu = DnsCreateMenu( parentElement, menuData, cmdFunction )
    var OnCommandFunction = cmdFunction ;
    
    DnsMenu.prototype.OnClick = function( event )
    {
        if( OnCommandFunction != undefined )
        {
            var item = event.target ;
            while( item != null && item.className != 'dns_menu_item' )
            {
                item = item.parentElement ;
            }
            if( item != null && item.className == 'dns_menu_item' && 0 < item.id.length )
            {
                OnCommandFunction( item, event ) ;
                var classBackup = item.parentElement.parentElement.className ;
                item.parentElement.parentElement.className = '' ;
                setTimeout( function()
                {
                    item.parentElement.parentElement.className = classBackup ;
                }, 1000 ) ;
            }
        }
    }
    DnsAddEventProc( this.menu, 'click', DnsMenu.prototype.OnClick, true ) ;
    return this.menu ;
}
function DnsCreateMenu( parentElement, items, cmdFunction, menuLevel )
{
    var nLevel = 0 ;
    if( menuLevel != undefined )
    {
        nLevel = menuLevel ;
    }
    if( parentElement && items && 0 < items.length )
    {
        var menuList = document.createElement('ol') ;
        var menuItem ;
        var menuAnchor ;
        var menuCheck ;

        if( nLevel == 0 )
        {
            menuList.className = "dns_menu_group dns_menu dns_menu_level_" + ( nLevel + 1 ) ;
        }
        else
        {
            menuList.className = "dns_menu_group dns_menu_level_" + ( nLevel + 1 ) ;
        }

        for( var m = 0 ; m < items.length ; m++ )
        {
            if( items[m].separator == undefined )
            {
                menuList.appendChild( menuItem = document.createElement('li') ) ;
                menuItem.appendChild( menuAnchor = document.createElement('a') ) ;
                menuAnchor.className = 'dns_menu_item' ;
                menuAnchor.appendChild( menuCheck = document.createElement('span') ) ;
                menuCheck.className = 'dns_menu_check_off' ;
                menuAnchor.appendChild( document.createTextNode( items[m].caption ) ) ;
                if( items[m].id != undefined )
                {
                    menuAnchor.id = items[m].id ;
                }
                if( items[m].display != undefined && items[m].display === false )
                {
                    menuItem.style.display = 'none' ;
                }
                if( items[m].submenu != undefined )
                {
                    DnsCreateMenu( menuItem, items[m].submenu, cmdFunction, nLevel+1 ) ;
                }
            }
        }
        menuList.CheckMenuItem = function( id, bCheck )
        {
            var item = document.getElementById(id) ;
            if( item != null )
            {
                item = item.getElementsByTagName('span')[0] ;
                item.className = ( bCheck === true ) ? 'dns_menu_check_on' : 'dns_menu_check_off' ;
            }
        }
        menuList.IsCheckMenuItem = function( id )
        {
            var item = document.getElementById(id) ;
            if( item != null && item.className == 'dns_menu_check_on' )
            {
                return true ;
            }
            return false ;
        }
        parentElement.appendChild( menuList ) ;
        return menuList ;
    }
}
