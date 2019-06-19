// +--------------------------------------------------------------------------+
// |  ファイル名 ： dnsgrid.js                                                |
// |  概要       ： グリッドコントロールツール                                |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// |                株式会社デジタルノーツ                                    |
// +--------------------------------------------------------------------------+

function DnsGrid_Initialize()
{
    var scripts = document.getElementsByTagName("script");
    var path = null ;
    for( var i = 0 ; i < scripts.length ; i++ )
    {
        if( (path = scripts[i].src.match(/(^|.*\/)dnsgrid\.js$/)) != null )
        {
            include( path[1] + 'dnsgrid.css' ) ;
            break ;
        }
    }
}

DnsGrid_Initialize() ;

CSSStyleSheet.prototype.append = function( name, value )
{
    var index  = ( this.cssRules != undefined ) ? this.cssRules.length : this.rules.length ;
    var retult = undefined ;
    if( this.addRule != undefined )
    {
        this.addRule( name, value ) ;
    }
    else if( this.insertRule != undefined )
    {
        this.insertRule( name + '{' + value + '}', index ) ;
    }

    if( this.cssRules != undefined )
    {
        retult = this.cssRules[index] ;
    }
    else
    {
        retult = this.rules[index] ;
    }
    return retult ;
}

//=============================================================================
// グリッドクラス
var DnsGrid = function ( parent, data, width, height, checkproc )
{
    var grid  = null ;
    var ghead = null ;
    var table = null ;      // <TABLE>本体
    var thead = null ;      // <THEAD>本体
    var tbody = null ;      // <TBODY>本体
    var ths   = [] ;        // <TH>の配列
    var sheet = null ;      // 独自のスタイルシート
    var curRow = null ;     // カレント行
    var keyCode = 0 ;       // キー入力コード
    var moveCol = null ;    // 列幅変更中の<SPAN>要素
    var moveX   = null ;    // 列幅変更中のpageX
    //styleTable = null ;  // <TABLE>のスタイル
    //styleHead = null ;  // <THEAD>のスタイル
    //styleBody = null ;  // <TBODY>のスタイル
    var colClass = [] ;     // 列のクラス名配列
    var colRules = [] ;     // 列のスタイル配列
    var scroll = { x:0, y:0 } ;
    var client = { cx:width, cy:height } ;
    var glippers = [] ;     // グリップ領域の配列
    var style ;

    id = ( 100 + document.getElementsByClassName('dng_grid') + 1 ).toString().substr( 1, 2 ) ; // グリッドのＩＤを作成する

    //-------------------------------------------
    // 専用のスタイルシートを準備
    document.head.appendChild( style = document.createElement('style') ) ;
    style.type = 'text/css' ;
    style.rel  = 'stylesheet' ;
    sheet = document.styleSheets[document.styleSheets.length-1] ;
    //-------------------------------------------
    grid  = document.createElement('div') ;
    ghead = document.createElement('span') ;
    table = document.createElement('table') ;
    table.appendChild( thead = document.createElement('thead') ) ;
    table.appendChild( tbody = document.createElement('tbody') ) ;
    grid.className  = 'dng_grid' ;
    grid.id         = 'dng_grid_' + id ;
    ghead.className = 'dng_grid_span color' ;
    ghead.className = 'color' ;
    ghead.textContent = "" ;
    table.className = 'dng_table' ;
    table.id        = 'dng_table_' + id ;
    thead.className = 'dng_table_head' ;
    thead.className = 'dng_table_head color' ;
    tbody.className = 'dng_table_body' ;
    if( 0 < parent.tabIndex )
    {
        var tabIndex = parseInt( parent.tabIndex ) ;
        parent.tabIndex = 0 ;
        tbody.tabIndex  = tabIndex ;
    }

    grid.appendChild( ghead ) ;
    grid.appendChild( table ) ;
    thead.appendChild( tr = document.createElement('tr') ) ;

    //-------------------------------------------
    for( var col = 0 ; col < data.head.length ; col++ )
    {
        tr.appendChild( ths[col] = th = document.createElement('th') ) ;
        th.id = th.className = colClass[col] = 'dns_gr' + id + '_col' + ( 100 + col + 1 ).toString().substr( 1, 2 ) ;
        glippers[col] = document.createElement('span')
        glippers[col].id        = th.id + '_gripper' ;
        glippers[col].className = 'dns_table_glipper' ;
        if( data.head[col].caption != undefined )
        {
            th.textContent = data.head[col].caption ;
        }
        var colwidth = ( ( data.head[col].width != undefined ) ? data.head[col].width : 100 ) - 6 ; 
        th.appendChild( glippers[col] ) ;
        th.className += ' color' ;
        colRules[col] = sheet.append( '.' + colClass[col], 'width:' + colwidth + 'px;min-width:' + colwidth + 'px;max-width:' + colwidth + 'px;' ) ;
    }
    //-------------------------------------------
    DnsGrid.prototype.AppendItem = function ( item, length )
    {
        var tr ;
        var td ;
        var p ;
        if( length == undefined )
        {
            length = thead.getElementsByTagName("TH").length ;
        }
        tbody.appendChild( tr = document.createElement('tr') ) ;
        tr.attributes.setNamedItem( document.createAttribute('modified') ) ;
        tr.SetColumn = SetColumnText ;
        tr.GetColumn = GetColumnText ;
        tr.PrevItem  = GetPrevItem ;
        tr.NextItem  = GetNextItem ;
        if( checkproc !== undefined && checkproc( item ) == false )
        {
            tr.style.display = 'none' ;
        }
        if( item['data'] != undefined )
        {
            tr.data = item['data'] ;
        }
        for( col = 0 ; col < length ; col++ )
        {
            tr.appendChild( td = document.createElement('td') ) ;
            td.appendChild( p = document.createElement('p') ) ;
            td.className = colClass[col] ;
            if( item['col'+(col+1)] != undefined )
            {
                p.textContent = item['col'+(col+1)] ;
            }
            else
            {
                p.innerHTML = "<br/>" ;
            }
        }
        return tr ;
    }
    for( var row = 0 ; row < data.body.length ; row++ )
    {
        DnsGrid.prototype.AppendItem( data.body[row], data.head.length ) ;
    }
    if( (curRow = tbody.firstElementChild) != null )
    {
        while( curRow != null && curRow.style.display != '' )
        {
            curRow = curRow.previousElementSibling ;
        }
        if( curRow != null )
        {
            //curRow.className = 'dns_select_tr' ;
            setTimeout( function () {
                DnsGrid.prototype.ItemSelect( curRow, event ) ;
            }
            , 100 ) ;
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid::グリッドエリアのサイズを指定
    DnsGrid.prototype.SetGridSize = function ( width, height )
    {
        if( width !== undefined )
        {
            grid.style.maxWidth  = grid.style.minWidth  = grid.style.width  = ( width - 2 ) + 'px' ; 
            table.style.maxWidth = table.style.minWidth = table.style.width = ( width - 2 ) + 'px' ; 
            ghead.style.maxWidth = ghead.style.minWidth = ghead.style.width = ( width - 2 ) + 'px' ; 
            thead.style.maxWidth = thead.style.minWidth = thead.style.width = ( width - 2 ) + 'px' ;
            tbody.style.maxWidth = tbody.style.minWidth = tbody.style.width = ( width - 2 ) + 'px' ;
            client.cx = width ; 
        }
        if( height !== undefined )
        {
            client.cy = height ; 
            grid.style.maxHeight  = grid.style.minHeight  = grid.style.height  = ( height - 2 ) + 'px' ; 
            table.style.maxHeight = table.style.minHeight = table.style.height = ( height - 2 ) + 'px' ; 
            tbody.style.maxHeight = tbody.style.minHeight = tbody.style.height = ( height - thead.offsetHeight - 2 ) + 'px' ;
            ghead.style.maxHeight = ghead.style.minHeight = ghead.style.height = ( thead.offsetHeight - 1 ) + 'px' ; 
        }
        for( var c = 0 ; c < ths.length ; c++ )
        {
            glippers[c].style.top  = ths[c].offsetTop + 'px' ;
            glippers[c].style.left = ( ths[c].offsetLeft + ths[c].offsetWidth - (glippers[c].offsetWidth/2) ) + 'px' ;
            glippers[c].style.height = ths[c].offsetHeight + 'px' ;
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid::グリッドエリアにフォーカスを設定
    DnsGrid.prototype.SetFocus = function ( )
    {
        tbody.focus() ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:グリッドエリアのクリック
    DnsGrid.prototype.OnClick = function ( event )
    {
        if( event.target != undefined )
        {
            if( event.target.tagName == 'TD' || event.target.tagName == 'P' )
            {
                var tr = event.target.parentElement ;
                while( tr !== undefined && tr.tagName != 'TR' )
                {
                    tr = tr.parentElement ;
                }
                if( tr !== undefined )
                {
                    DnsGrid.prototype.ItemSelect( tr, event ) ;
                    if( curRow != null )
                    {
                        DnsGrid.prototype.EndSelect( curRow, curRow.data ) ;
                    }
                }
            }

            switch( event.target.tagName )
            {
                case 'TD' :
                    break ;
                case 'SPAN' :
                    break ;
            }
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:グリッドエリアのマウスダウ
    DnsGrid.prototype.OnMouseDown = function ( event )
    {
        if( event.target != undefined && event.target.tagName == 'SPAN' && event.target.id.match(/^dns_gr\d\d_col\d\d_gripper/) !== null ) 
        {
            moveCol = parseInt( event.target.id.substr( 12, 2 ), 10 ) -1 ; 
            moveX = event.pageX - event.target.offsetLeft - table.offsetLeft ;
            //event.target.style.backgroundColor = 'RGBa(255,0,0,0.5)' ;
            DnsAddEventProc( window, 'mousemove', DnsGrid.prototype.OnMouseMove ) ;
            DnsAddEventProc( window, 'mouseup',   DnsGrid.prototype.OnMouseUp ) ;
            DnsAddEventProc( window, 'mouseout',  DnsGrid.prototype.OnMouseUp ) ;
            event.preventDefault() ;
            return  ;
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:マウス移動
    DnsGrid.prototype.OnMouseMove = function ( event )
    {
        //document.getElementById('dumparea').value = event.pageX + ',' + event.pageY + '    (' + (table.offsetLeft+table.offsetWidth) + ')' ;
        if( moveCol !== null )
        {
            var th   = ths[moveCol] ;
            var glip = glippers[moveCol] ;
            newWidth = event.pageX - th.offsetLeft - table.offsetLeft - moveX ;
            if( 10 < newWidth )
            {
                rule = colRules[moveCol] ;
                rule.style.width = rule.style.minWidth = rule.style.maxWidth = ( newWidth ) + 'px' ;
                glip.style.left = ( th.offsetLeft + th.offsetWidth - (glip.offsetWidth/2) ) + 'px' ;
            }
        }
        event.preventDefault() ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:マウスボタンの開放
    DnsGrid.prototype.OnMouseUp = function ( event )
    {
        if( moveCol !== null )
        {
            if( event.type == 'mouseup' || event.pageX < table.offsetLeft || (table.offsetLeft+table.offsetWidth) <= event.pageX )
            {
                //glippers[moveCol].style.backgroundColor = 'transparent' ;
                moveCol = null ;
                DnsRemoveEventProc( window, 'mousemove', DnsGrid.prototype.OnMouseMove ) ;
                DnsRemoveEventProc( window, 'mouseup',   DnsGrid.prototype.OnMouseUp ) ;
                DnsRemoveEventProc( window, 'mouseout',  DnsGrid.prototype.OnMouseUp ) ;
                DnsGrid.prototype.SetGridSize() ;
            }
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:マウススクロールの開放
    DnsGrid.prototype.OnScroll = function ( event )
    {
        if( tbody.scrollLeft != scroll.x )
        {
            scroll.x = tbody.scrollLeft ;
            thead.style.left = ( -scroll.x ) + 'px' ;
        }
        if( tbody.scrollTop != scroll.y )
        {
            if( curRow != null )
            {
                //curRow.className = '' ;
            }
            if( keyCode == 34 )
            {
                n = 0 ;
            }
            else if( keyCode == 38 )
            {
                n = 0 ;
            }
            keyCode = 0 ;
            scroll.y = tbody.scrollTop ;
        }
    }
    DnsGrid.prototype.ItemChanging = function( row, data )
    {
        return ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:キーイベント
    DnsGrid.prototype.OnKeyDown = function ( event )
    {
        var newRow = null ;

        switch( event.keyCode )
        {
            case 38 : // カーソル上移動
                newRow = ( curRow != null ) ? curRow.previousElementSibling : null ;
                while( newRow != null && newRow.style.display != '' )
                {
                    newRow = newRow.previousElementSibling ;
                }
                break ;
            case 40 : // カーソル下移動
                newRow = ( curRow != null ) ? curRow.nextElementSibling : null ;
                while( newRow != null && newRow.style.display != '' )
                {
                    newRow = newRow.nextElementSibling ;
                }
                break ;
            case 33 : // ページアップ
                nRowCount = parseInt( tbody.clientHeight/curRow.offsetHeight ) - 1 ;
                newRow = curRow.previousElementSibling ;
                while( 0 < nRowCount && newRow != null )
                {
                    if( newRow.style.display == '' )
                    {
                        nRowCount-- ;
                    }
                    newRow = newRow.previousElementSibling ;
                }
                if( newRow == null )
                {
                    newRow = DnsGrid.prototype.FirstItem( true ) ;
                }
                break ;
            case 34 : // ページダウン
                nRowCount = parseInt( tbody.clientHeight/curRow.offsetHeight ) - 1 ;
                newRow = curRow.nextElementSibling ;
                while( 0 < nRowCount && newRow != null )
                {
                    if( newRow.style.display == '' )
                    {
                        nRowCount-- ;
                    }
                    newRow = newRow.nextElementSibling ;
                }
                if( newRow == null )
                {
                    newRow = DnsGrid.prototype.LastItem() ;
                }
                break ;
            case 36 : // HOMEキー
                newRow = DnsGrid.prototype.FirstItem( true ) ;
                /*
                newRow = tbody.firstElementChild ;
                while( newRow != null && newRow.style.display != '' )
                {
                    newRow = newRow.nextElementSibling ;
                }
                */
                break ;
            case 35 : // ENDキー
                newRow = DnsGrid.prototype.LastItem() ;
                /*
                newRow = tbody.lastElementChild ;
                while( newRow != null && newRow.style.display != '' )
                {
                    newRow = newRow.previousElementSibling ;
                }
                */
                break ;
            default :
                return ;
        }

        if( newRow != null && DnsGrid.prototype.ItemSelect( newRow, event ) != false )
        {
            event.keyCode = 0 ;
            event.preventDefault() ;
            return ;
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:イベント:キーイベント
    DnsGrid.prototype.OnKeyUp = function ( event )
    {
        var newRow = null ;

        switch( event.keyCode )
        {
            case 38 : // カーソル上移動
            case 40 : // カーソル下移動
            case 33 : // ページアップ
            case 34 : // ページダウン
            case 36 : // HOMEキー
            case 35 : // ENDキー
                DnsGrid.prototype.EndSelect( curRow, curRow.data ) ;
                DnsGrid.prototype.KeyUp( event.keyCode ) ;
                break ;
            default :
                DnsGrid.prototype.KeyUp( event.keyCode ) ;
                return ;
        }
        event.keyCode = 0 ;
        event.preventDefault() ;
    }
    DnsGrid.prototype.KeyUp = function ( keyCode )
    {
        return ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:最初のアイテムを取得
    DnsGrid.prototype.FirstItem = function ( visible )
    {
        var newRow = tbody.firstElementChild ;

        if( visible === true )
        {
            while( newRow != null && newRow.style.display != '' )
            {
                newRow = newRow.nextElementSibling ;
            }
        }
        return newRow ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:最後のアイテムを取得
    DnsGrid.prototype.LastItem = function ()
    {
        var newRow = tbody.lastElementChild ;
        while( newRow != null && newRow.style.display != '' )
        {
            newRow = newRow.previousElementSibling ;
        }
        return newRow ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:アイテムの選択通知
    DnsGrid.prototype.ItemChanged = function ( item, data, event )
    {
        return ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:グリッドエレメントの取得
    DnsGrid.prototype.GetElement = function ()
    {
        return grid ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:グリッドエレメントの取得
    DnsGrid.prototype.GetBodyElement = function ()
    {
        return tbody ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:カラム幅を取得
    DnsGrid.prototype.GetColumnWidths = function ()
    {
        var result = [] ;
        for( c = 0 ; c < ths.length ; c++ )
        {
            //result[c] = ths[c].offsetWidth - 1 ;
            result[c] = parseInt( ths[c].scrollWidth ) ;
            if( result[c] < 0 )
            {
                var a = 0 ;
            }
        }
        return result ;
    }
    //-----------------------------------------------------------------------------
    // グリッドオブジェクトにフォーカスを設定する。
    DnsAddEventProc( tbody,  'focus',     function(event)
    {
        if( tbody.className.indexOf(' dns_grid_active') == -1 )
        {
            tbody.className += ' dns_grid_active' ;
        }
    }
    , true ) ;
    //-----------------------------------------------------------------------------
    // グリッドオブジェクトがフォーカスを失う
    DnsAddEventProc( tbody,  'blur',      function(event)
    {
        setTimeout( function()
        {
            var elem = document.activeElement ;
            while( elem != undefined && elem != null )
            {
                if( elem.id == table.id )
                {
                    return ;
                }
                elem = elem.parentElement ;
            }
            tbody.className = tbody.className.replace(/ dns_grid_active/g, '' ) ;
        }, 10 ) ;
    }
    , true ) ;
    //-----------------------------------------------------------------------------
    parent.appendChild( grid ) ;
    if( width !== undefined || height !== undefined )
    {
        DnsGrid.prototype.SetGridSize( width, height ) ;
    }
    DnsAddEventProc( table,  'click',     DnsGrid.prototype.OnClick ) ;
    DnsAddEventProc( table,  'mousedown', DnsGrid.prototype.OnMouseDown ) ;
    DnsAddEventProc( tbody,  'scroll',    DnsGrid.prototype.OnScroll ) ;
    DnsAddEventProc( tbody,  'keydown',   DnsGrid.prototype.OnKeyDown ) ;
    DnsAddEventProc( tbody,  'keyup',     DnsGrid.prototype.OnKeyUp ) ;
    //-----------------------------------------------------------------------------
    // DnsGrid:グリッドのアイテム選択処理
    // 必要に応じて<TBODY>をスクロールする
    DnsGrid.prototype.ItemSelect = function ( newItem, event )
    {
        if( newItem != undefined && newItem != null )
        {
            if( curRow != null )
            {
                DnsGrid.prototype.ItemChanging( curRow, curRow.data ) ;
                curRow.className = '' ;
            }
            curRow = newItem ;
            curRow.className = 'dns_select_tr' ;

            if( (tbody.scrollTop+tbody.offsetTop) > curRow.offsetTop )
            {
                tbody.scrollTop = curRow.offsetTop-tbody.offsetTop ;
            }
            else if( (tbody.offsetTop+tbody.clientHeight+tbody.scrollTop) < (curRow.offsetTop+curRow.offsetHeight) )
            {
                tbody.scrollTop = (curRow.offsetTop+curRow.offsetHeight) - (tbody.offsetTop+tbody.clientHeight) ;
            }
            data = [] ;
            cells = curRow.getElementsByTagName('td') ;
            for( i = 0 ; i < cells.length ; i++ )
            {
                data[i] = cells[i].textContent ;
            }
            DnsGrid.prototype.ItemChanged( data, curRow.data, event ) ;

            return true ;
        }
        return false ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:グリッドのアイテム選択処理
    // 必要に応じて<TBODY>をスクロールする
    DnsGrid.prototype.EndSelect = function ( item, data )
    {
        return false ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:選択されたアイテム<TR>を返す
    DnsGrid.prototype.GetSelected = function ()
    {
        return curRow ;
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:選択されたアイテム<TR>を返す
    DnsGrid.prototype.ChoiceItems = function ( checkFunction )
    {
        var item = tbody.firstElementChild ;
        while( item )
        {
            item.style.display = checkFunction( item ) ? '' : 'none' ;
            item = item.nextElementSibling ;
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:アイテムの指定列のテキストを設定する。
    //  ※これはTRエレメントのメンバ関数として利用する
    function SetColumnText( colIndex, newText )
    {
        var cells = this.getElementsByTagName('TD') ;
        if( 0 <= colIndex && colIndex < cells.length )
        {
            cells[colIndex].getElementsByTagName('P')[0].textContent = newText ;
        }
    }
    //-----------------------------------------------------------------------------
    // DnsGrid:アイテムの指定列のテキストを設定する。
    //  ※これはTRエレメントのメンバ関数として利用する
    function GetColumnText( colIndex )
    {
        var cells = this.getElementsByTagName('TD') ;
        if( 0 <= colIndex && colIndex < cells.length )
        {
            return cells[colIndex].getElementsByTagName('P')[0].textContent ;
        }
        return "" ;
    }
    function GetPrevItem( visible )
    {
        var result = null ;

        visible = ( visible === true ) ? true : false ;
        if( visible === true )
        {
            for( result = this.previousElementSibling ; result != null ; result = result.previousElementSibling )
            {
                if( result.style.display == '' )
                {
                    break ;
                }
            }
        }
        else
        {
            result = this.previousElementSibling ;
        }
        return result ;
    }
    function GetNextItem( visible )
    {
        var result = null ;

        visible = ( visible === true ) ? true : false ;
        if( visible === true )
        {
            for( result = this.nextElementSibling ; result != null ; result = result.nextElementSibling )
            {
                if( result.style.display == '' )
                {
                    break ;
                }
            }
        }
        else
        {
            result = this.nextElementSibling ;
        }
        return result ;
    }
    //------------------------------------------------------------
    // ソート機能
    // グリッドデータを指定列(column)でソートする
    // deskをtrueにすると逆ソートする
    DnsGrid.prototype.Sort = function ( column, desk )
    {
        var cols = thead.getElementsByTagName('TH').length ;
        var trs = tbody.getElementsByTagName('TR') ;
        var items = [] ;

        desk = ( desk === true ) ? true : false ;

        if( 0 <= column && column < cols )
        {
            for( var i = 0 ; i < trs.length ; i++ )
            {
                items[i] = trs[i] ;
            }
            while( tbody.firstChild != null )
            {
                tbody.removeChild( tbody.firstChild ) ;
            }

            items.sort( function( row1, row2 )
            {
                var t1 = row1.GetColumn( column ) ;
                var t2 = row2.GetColumn( column ) ;
                if( t1 == t2 )
                {
                    return 0 ;
                }
                else if( desk == false )
                {
                    return t1 < t2 ? -1 : 1 ;
                }
                else
                {
                    return t1 > t2 ? -1 : 1 ;
                }
            } ) ;
            for( var i = 0 ; i < items.length ; i++ )
            {
                tbody.appendChild( items[i] ) ;
            }
            return true ;
        }
        return false ;
    }
    //------------------------------------------------------------
    // 検索機能
    // グリッドデータからtextと一致するアイテム<TR>を取得する
    // columnを省略するとすべての列から探し出す。
    // 一致するものがない場合はnullを返す
    DnsGrid.prototype.FindItem = function ( text, column )
    {
        var cols = thead.getElementsByTagName('TH').length ;

        if( column != undefined && ( column < 0 || cols <= column ) )
        {
            return null ;
        }

        var colStart = ( column == undefined ) ? 0    : column  ;
        var colEnd   = ( column == undefined ) ? cols : (column+1) ;
        var items    = tbody.getElementsByTagName('TR') ;

        for( var r = 0 ; r < items.length ; r++ )
        {
            for( var c = colStart ; c < colEnd ; c++ )
            {
                if( items[r].GetColumn( c ) == text )
                {
                    return items[r] ;
                }
            }
        }

        return null ;
    }
    //------------------------------------------------------------
    // アイテムの総数を返す
    DnsGrid.prototype.GetItemCount = function ( visible )
    {
        var items = tbody.getElementsByTagName('TR') ;
        var result = 0 ;

        if( visible !== true )
        {
            result = items.length ;
        }
        else
        {
            for( var r = 0 ; r < items.length ; r++ )
            {
                if( items[r].style.display != 'none' )
                {
                    result++ ;
                }
            }
        }
        return result ;
    }
    //------------------------------------------------------------
}
//=============================================================================

