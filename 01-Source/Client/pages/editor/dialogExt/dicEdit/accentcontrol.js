// +--------------------------------------------------------------------------+
// |                           ChattyInfty-Online                             |
// |                         株式会社デジタルノーツ                           |
// +--------------------------------------------------------------------------+
// |  ファイル名 ： dictionaryeditor.js                                       |
// |  概要       ： アクセント設定コントロール                                |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// +--------------------------------------------------------------------------+
var svgns = "http://www.w3.org/2000/svg";

var DnsAccentControl = function ( elem, presfolder, updateFnction )
{
    elem.DnsAccentControl = this ;
    this.updateFnction = updateFnction ;
    this.AccentCtrl = elem ;
    this.strAccentText = null ;
    this.AccentCtrl.innerHTML = '<table id="' + presfolder + '_accent_table" class="dic_data_accent_table"><tbody><tr></tr></tbody></table><svg id="' + presfolder + '_accent_svg" class="dic_data_accent_svg"></svg>' ;
    this.itemTR = this.AccentCtrl.getElementsByTagName("TR")[0] ;
    this.svg = document.getElementById( presfolder + '_accent_svg') ;
    this.bModified = false ;
    this.accentBlocks = [] ;
    this.strYomiText = "" ;

    DnsAccentControl.prototype.OnResize = function( event )
    {
        var rc = this.itemTR.getBoundingClientRect() ;
        var itemTDs = this.itemTR.getElementsByTagName('TD') ;
        this.svg.style.left   = '2px' ; // rc.left + 'px' ;
        this.svg.style.top    = '2px' ; // rc.top + 'px' ;
        this.svg.style.width  = rc.width + 'px' ;
        this.svg.style.height = rc.height + 'px' ;

        for( var i = 0, n = 0 ; i < this.accentBlocks.length ; i++ )
        {
            var accentBlock = this.accentBlocks[i] ;
            for( var j = 0 ; j < accentBlock.items.length ; j++, n++ )
            {
                var     accentItem = accentBlock.items[j] ;
                accentItem.point1.className.baseVal = ( accentItem.hi === true ) ? 'dic_data_accent_on'  : 'dic_data_accent_off'  ;
                accentItem.point2.className.baseVal = ( accentItem.hi === true ) ? 'dic_data_accent_off' : 'dic_data_accent_on' ;
                if( accentItem.line != null )
                {
                    accentItem.line.className.baseVal  = 'dic_data_accent_line' + ( j < (accentBlock.items.length-1) ? '' : ' dic_data_accent_separate' ) ;
                }
            }
        }
        var rects   = this.AccentCtrl.getElementsByClassName( 'dic_data_accent_span' ) ;
        var lines   = this.AccentCtrl.getElementsByClassName( 'dic_data_accent_line' ) ;
        var his     = this.AccentCtrl.getElementsByClassName( 'dic_data_accent_on' ) ;
        var los     = this.AccentCtrl.getElementsByClassName( 'dic_data_accent_off' ) ;
        var grids   = this.AccentCtrl.getElementsByClassName( 'dic_data_accent_grid' ) ;
        for( var i = 0 ; i < itemTDs.length ; i++ )
        {
            var x = itemTDs[i].offsetLeft + 14 ;
            var w = itemTDs[i].offsetWidth ;
            if( rects[i] != null )
            {
                rects[i].x.baseVal.value     = x ;
                rects[i].width.baseVal.value = w ;
            }
            if( lines[i] )
            {
                lines[i].x1.baseVal.value    = x ;
                lines[i].x2.baseVal.value    = x + w ; 
                lines[i].y1.baseVal.value    = his[i].cy.baseVal.value ;
                lines[i].y2.baseVal.value    = his[i+1].cy.baseVal.value ;
            }
            his[i].cx.baseVal.value      = x ;
            los[i].cx.baseVal.value      = x ;
            grids[i].x1.baseVal.value = x ;
            grids[i].x2.baseVal.value = x ;
        }
    }
    DnsAccentControl.prototype.SetModify = function( bState )
    {
        this.bModified = ( bState === true ) ;
    }
    DnsAccentControl.prototype.IsModified = function()
    {
        return this.bModified ;
    }
    function IsLinkAccent( text )
    {
        return ( text == 'ッ' || text == 'ー' ) ? true : false ;
    }
    DnsAccentControl.prototype.TraceAccent = function ()
    {
        for( i = 0 ; i < this.accentBlocks.length ; i++ )
        {
            var accentBlock = this.accentBlocks[i] ;
            if( accentBlock.items.length == 1 )
            {
                var     accentItem = accentBlock.items[0] ;
                if( IsLinkAccent( accentItem.cell.textContent ) )
                {
                    accentBlock.items[0].hi = false ;
                    accentBlock.pos = 0 ;
                }
            }
            else
            {
                if( accentBlock.items.length <= accentBlock.pos )
                {
                    accentBlock.pos = 0 ;
                }

                if( 0 < accentBlock.pos && IsLinkAccent( accentBlock.items[accentBlock.pos-1].cell.textContent ) )
                {
                    accentBlock.pos++ ;
                }

                if( accentBlock.pos == 0 )
                {
                    for( var j = 0 ; j < accentBlock.items.length ; j++ )
                    {
                        accentBlock.items[j].hi = ( 0 < j ) ;
                    }
                }
                else if( accentBlock.pos == 1 )
                {
                    for( var j = 0 ; j < accentBlock.items.length ; j++ )
                    {
                        accentBlock.items[j].hi = ( 0 == j ) ;
                    }
                }
                else 
                {
                    for( var j = 0 ; j < accentBlock.items.length ; j++)
                    {
                        accentBlock.items[j].hi = false ;
                    }
                    for( var j = accentBlock.pos - 1 ; j > 0 ; j-- )
                    {
                        accentBlock.items[j].hi = true ;
                    }
                }
            }
        }
    }
    DnsAccentControl.prototype.SetAccent = function ( yomi, text )
    {
        var szSokuon = "ァィゥェォャュョヮヵヶ" ;

        this.strYomiText = yomi ;

        this.itemTR.innerHTML = "" ;
        while( 0 < this.svg.childNodes.length )
        {
            this.svg.removeChild( this.svg.childNodes[0] ) ;
        }

        if( yomi == undefined )
        {
            this.strAccentText = "" ;
            return false ;
        }

        var accentChars  = [] ;

        for( var i = 0, n = 0 ; i < yomi.length ; i++ )
        {
            var c = yomi[i] ;
            if( szSokuon.indexOf(c) == -1 )
            {
                accentChars[n] = c ;
                n++ ;
            }
            else
            {
                accentChars[n-1] += c ;
            }
        }

        if( !text )
        {
            text = '{accent=0-' + accentChars.length + ':accent_con=*}' ;
        }
        this.strYomiText   = yomi ;
        this.strAccentText = text ;

        this.accentBlocks = [] ;
        var tempData = text.split(/[{}:=]/)[2].split(/,/) ;

        for( var i = 0, n = 0 ; i < tempData.length ; i++ )
        {
            var data = tempData[i].split(/-/) ;
            var accPos = parseInt( data[0] ) ;
            var accLen = parseInt( data[1] ) ;
            this.accentBlocks[i] = { pos:parseInt( data[0] ), len:parseInt( data[1] ), items:[] } ;
            for( var j = 0 ; j < this.accentBlocks[i].len ; j++, n++ )
            {
                this.accentBlocks[i].items[j] = { text:accentChars[n], hi:true } ;
            }
        }

        for( i = 0, n = 0 ; i < this.accentBlocks.length ; i++ )
        {
            var accentBlock = this.accentBlocks[i] ;
            for( var j = 0 ; j < accentBlock.items.length ; j++, n++ )
            {
                var     accentItem = accentBlock.items[j] ;
                this.itemTR.appendChild( accentItem.cell = document.createElement("TD") ) ;
                accentItem.cell.textContent = accentItem.text ;
                //---------------------------------------------------
                this.svg.appendChild( accentItem.grid = document.createElementNS( svgns, "line") ) ;
                accentItem.grid.x1.baseVal.value = n * 20 ;
                accentItem.grid.x2.baseVal.value = n * 20 ;
                accentItem.grid.y1.baseVal.value = 0 ;
                accentItem.grid.y2.baseVal.value = 64 ;
                accentItem.grid.style.strokeWidth = '1px' ;
                accentItem.grid.id = 'dic_data_accent_grid_' + n ;
                accentItem.grid.className.baseVal = "dic_data_accent_grid" ;
                accentItem.grid.setAttribute( 'shape-rendering', 'crispEdges' ) ;
                this.svg.appendChild( accentItem.grid ) ;
                //---------------------------------------------------
                if( i < (this.accentBlocks.length-1) || j < (accentBlock.items.length-1) )
                {
                    this.svg.appendChild( accentItem.rect = document.createElementNS( svgns, "rect") ) ;
                    this.svg.appendChild( accentItem.line = document.createElementNS( svgns, "line") ) ;
                    accentItem.rect.accentItem = accentItem ;
                    accentItem.rect.x.baseVal.value = n * 20 ;
                    accentItem.rect.y.baseVal.value = 0 ;
                    accentItem.rect.width.baseVal.value = 30 ;
                    accentItem.rect.height.baseVal.value = 64 ;
                    accentItem.rect.style.strokeWidth = '1px' ;
                    accentItem.rect.id = 'dic_data_accent_span_' + n ;
                    accentItem.rect.className.baseVal = "dic_data_accent_span" ;
                    accentItem.rect.ondblclick = this.OnLineAreaClick ;
                    //- - - - - - - - 
                    accentItem.line.x1.baseVal.value = n * 20 ;
                    accentItem.line.x2.baseVal.value = n * 20 ;
                    accentItem.line.y1.baseVal.value = 10 ;
                    accentItem.line.y2.baseVal.value = 54 ;
                    accentItem.line.style.strokeWidth = '1px' ;
                    accentItem.line.id = 'dic_data_accent_line_' + n ;
                    accentItem.line.className.baseVal = "dic_data_accent_line" ;
                }
                //---------------------------------------------------
                this.svg.appendChild( accentItem.point1 = document.createElementNS( svgns, "circle") ) ;
                this.svg.appendChild( accentItem.point2 = document.createElementNS( svgns, "circle") ) ;
                accentItem.point1.accentItem = accentItem ;
                accentItem.point1.r.baseVal.value  = 4 ;
                accentItem.point1.cx.baseVal.value = n * 20 ;
                accentItem.point1.cy.baseVal.value = 10 ;
                accentItem.point2.accentItem = accentItem ;
                accentItem.point2.r.baseVal.value  = 4 ;
                accentItem.point2.cx.baseVal.value = n * 20 ;
                accentItem.point2.cy.baseVal.value = 54 ;
                accentItem.point1.onclick = accentItem.point2.onclick = this.OnPointClick ;
                accentItem.point1.id = 'dic_data_accent_hi_' + n ;
                accentItem.point2.id = 'dic_data_accent_lo_' + n ;
                accentItem.point1.className.baseVal = "dic_data_accent_on"  ;
                accentItem.point2.className.baseVal = "dic_data_accent_off" ;
                this.svg.appendChild( accentItem.point1 ) ;
                this.svg.appendChild( accentItem.point2 ) ;
            }
        }
        this.TraceAccent() ; 
        this.SetModify( false ) ;
        if( this.svg.firstElementChild != null )
        {
            this.AccentCtrl.removeAttribute("disabled") ;
        }
        else
        {
            this.AccentCtrl.setAttribute("disabled","disabled") ;
        }
        this.OnResize() ;
        return this.accentBlocks ;
    }

    this.DragItem  = null ;
    this.DragPoint = null ;

    DnsAccentControl.prototype.SvgMouseDown = function ( event )
    {
        if( event.target.className != undefined && event.target.className.baseVal != undefined )
        {
            if( event.target.className.baseVal.match(/^dic_data_accent_on/) != null )
            {
                this.DragItem = event.target ;
                this.DragPoint = { X:event.offsetX, Y:event.offsetY } ;
            }
        }
    }
    DnsAccentControl.prototype.SvgMouseUp = function ( event )
    {
        this.DragItem = null ;
        this.DragPoint = null ;
    }
    DnsAccentControl.prototype.SvgMouseMove = function ( event )
    {
        if( this.DragPoint != null || this.DragItem != null )
        {
            if( Math.abs(this.DragPoint.Y-event.offsetY) > 10 )
            {
                if( this.DragItem.id.match(/^dic_data_accent_hi_/) != null )
                {
                    DnsAccentControl.prototype.OnPointClick( { target : this.DragItem.nextElementSibling } ) ;
                }
                else
                {
                    DnsAccentControl.prototype.OnPointClick( { target : this.DragItem.previousElementSibling } ) ;
                }
                this.DragItem = null ;
                this.DragPoint = null ;
            }
        }
    }
    // イベント：<circle>のクリック
    DnsAccentControl.prototype.OnPointClick = function ( event )
    {
        var elem = event.target ;

        while( elem && elem.DnsAccentControl == undefined )
        {
            elem = elem.parentNode ;
        }
        if( elem && elem.DnsAccentControl != undefined )
        {
            elem.DnsAccentControl.PointClick( event ) ;
        }
        return false ;
    }
    DnsAccentControl.prototype.PointClick = function ( event )
    {
        if( event.target.className.baseVal == 'dic_data_accent_off' )
        {
            var type = event.target.id.substr(16,2) ;
            var id   = parseInt( event.target.id.substr(19) ) ;
            var index = this.GetAccentBlockIndex( id ) ;
            if( index != undefined )
            {
                var nBlockID = index.block ;
                var nItemID  = index.item ;

                if( event.target.accentItem != undefined )
                {
                    event.target.accentItem.hi = ( type == 'hi' ) ? true : false ;
                    if( event.target.accentItem.hi )
                    {
                        this.accentBlocks[nBlockID].pos = nItemID + 1 ;
                    }
                    else
                    {
                        this.accentBlocks[nBlockID].pos = nItemID ;
                        if( 1 < nItemID && IsLinkAccent( this.accentBlocks[nBlockID].items[nItemID-1].cell.textContent ) )
                        {
                            this.accentBlocks[nBlockID].pos-- ;
                        }
                    }
                    this.TraceAccent() ;
                    this.OnResize() ;
                    if( this.updateFnction != undefined )
                    {
                        this.updateFnction( event ) ;
                    }
                }
            }
        }
    }
    // イベント：<rect>のクリック
    DnsAccentControl.prototype.OnLineAreaClick = function ( event )
    {
        var elem = event.target ;

        while( elem && elem.DnsAccentControl == undefined )
        {
            elem = elem.parentNode ;
        }
        if( elem && elem.DnsAccentControl != undefined )
        {
            elem.DnsAccentControl.LineAreaClick( event ) ;
        }
        return false ;
    }
    DnsAccentControl.prototype.LineAreaClick = function ( event )
    {
        if( event.target.className.baseVal == 'dic_data_accent_span' && event.target.accentItem != undefined )
        {
            var id = parseInt( event.target.id.substr(21) ) ;
            var index = this.GetAccentBlockIndex( id ) ;
            if( index != undefined )
            {
                var nBlockID = index.block ;
                var nItemID  = index.item ;

                var line = this.accentBlocks[nBlockID].items[nItemID].line ;

                if( event.target.accentItem.line.className.baseVal == 'dic_data_accent_line' )
                {
                    this.accentBlocks.splice( nBlockID + 1, 0, 1 ) ;
                    this.accentBlocks[nBlockID+1] = { pos:0, len:0, items:[] } ;

                    var block = this.accentBlocks[nBlockID].items ;
                    var next  = this.accentBlocks[nBlockID+1].items ;

                    nItemID++ ;
                    for( var i = 0 ; nItemID < block.length ; i++ )
                    {
                        next[i] = block[nItemID] ;
                        block.splice(nItemID,1) ;
                    }
                    this.accentBlocks[nBlockID].len   = this.accentBlocks[nBlockID].items.length ;
                    this.accentBlocks[nBlockID+1].len = this.accentBlocks[nBlockID+1].items.length ;
                }
                else
                {
                    var block = this.accentBlocks[nBlockID].items ;
                    var next = this.accentBlocks[nBlockID+1].items ;
                    for( var i = 0, j = block.length ; 0 < next.length ; i++, j++ )
                    {
                        block[j] = next[0] ;
                        next.splice(0,1) ;
                    }
                    this.accentBlocks.splice( nBlockID+1, 1 ) ;
                    this.accentBlocks[nBlockID].len = this.accentBlocks[nBlockID].items.length ;
                }
                this.TraceAccent() ;
                this.OnResize() ;
                if( this.updateFnction != undefined )
                {
                    this.updateFnction( event ) ;
                }
            }
        }
    }
    DnsAccentControl.prototype.GetAccentText = function ()
    {
        var result = "{accent=" ;
        for( i = 0 ; i < this.accentBlocks.length ; i++ )
        {
            var accentBlock = this.accentBlocks[i] ;
            result += accentBlock.pos + '-' + accentBlock.items.length + ( ( i < (this.accentBlocks.length-1) ) ? ',' : ':accent_con=*}' ) ;
        }        
        return result ;
    }
    DnsAccentControl.prototype.GetReadText = function ()
    {
        var result = "<" ;
        for( i = 0 ; i < this.accentBlocks.length ; i++ )
        {
            var accentBlock = this.accentBlocks[i] ;
            for( var j = 0 ; j < accentBlock.items.length ; j++ )
            {
                if( 0 < j && j == (accentBlock.pos) )
                {
                    result += "’" ;
                }
                result += accentBlock.items[j].cell.textContent ;
            }
            if( i < (this.accentBlocks.length-1) )
            {
                result += "＿" ;
            }
        }        
        result += ">" ;
        return result ;
    }
    DnsAccentControl.prototype.GetYomiText = function ()
    {
        return this.strYomiText ;
    }
    DnsAccentControl.prototype.GetSvg = function ()
    {
        return this.svg ;
    }
    DnsAccentControl.prototype.GetAccentBlockIndex = function ( id )
    {
        for( var i = 0, n = 0 ; i < this.accentBlocks.length ; i++ )
        {
            for( var j = 0 ; j < this.accentBlocks[i].items.length ; j++, n++ )
            {
                if( id == n )
                {
                    return { block:i, item:j } ;
                }
            }
        }
        return undefined ;
    }
    this.svg.addEventListener( "mousedown", DnsAccentControl.prototype.SvgMouseDown, true ) ;
    this.svg.addEventListener( "mouseup",   DnsAccentControl.prototype.SvgMouseUp, true ) ;
    this.svg.addEventListener( "mousemove", DnsAccentControl.prototype.SvgMouseMove, true ) ;
    this.OnResize() ;
    //this.svg.style.left = this.AccentCtrl.
}
