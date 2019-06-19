// +--------------------------------------------------------------------------+
// |                           ChattyInfty-Online                             |
// |                         株式会社デジタルノーツ                           |
// +--------------------------------------------------------------------------+
// |  ファイル名 ： maskingtool.js                                            |
// |  概要       ： アニメーション編集画面                                    |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// +--------------------------------------------------------------------------+
include('../dnslibrary/theme.css') ;
include('../dnslibrary/dnscolorpicker.js') ;  // 色選択ツール
include('../dnslibrary/dnsstatusbar.js') ;
include('./maskingtool.css') ;
include('./maskingtool_lang.js') ;
include('./language.js') ;

DnsAddEventProc( window, 'load', MaskingToolInit) ;

var maskingtool = null ;
var userAgent = window.navigator.userAgent.toLowerCase();

function MaskingToolInit( event )
{
    SetCaptionLanguage( itemLabels ) ; // 各要素のラベルを設定する
   maskingtool = new MaskingTool() ;
}

var MaskingTool = function ()
{
    var params    = GetParams() ;
    var orgImage  = null ; // オリジナルの要素
    var srcImage  = document.createElement('img') ;
    var workCell  = document.getElementById('mst_work') ;
    var workArea  = document.getElementById('mst_workarea') ;
    var dstImage  = document.getElementById('mst_image') ;
    var canvas1   = document.getElementById('mst_canvas1') ;
    var canvas2   = document.getElementById('mst_canvas2') ;
    var drawTypes = document.getElementsByName('mst_type') ;
    var fillModes = document.getElementsByName('mst_mode') ;
    var svgFrame  = document.getElementById('svg_draw_frame') ;
    var svgItem   = null ;
    var context1  = canvas1.getContext("2d") ;
    var context2  = canvas2.getContext("2d") ;
    var size = { cx:0, cy:0 } ;
    var imageURL = null ;
    var drawItem  = null ;
    var drawItems = [] ;

    if( window.opener !== undefined && window.opener !== null && window.opener.DnsAnimationEditor !== undefined && window.opener.DnsAnimationEditor.instance !== null )
    {
        orgImage = window.opener.DnsAnimationEditor.instance.GetSelectedImage();
        if( orgImage != null && orgImage != undefined )
        {
            imageURL = orgImage.src ;
        }
        else
        {
            alert("画像の取得に失敗しました") ;
            window.close() ;
            return false ;
        }
    }
    else if( params['image']  != undefined )
    {
        imageURL = params['image'] ;
    }
    else
    {
        alert("画面の呼び出しが不正です。") ;
        window.close() ;
        return false ;
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // ステータスバーの作成
    statusbar = new DnsStatusBar( document.body, true ) ;
    statusbar.SetText( "Ready" ) ;
    statusbar.AppendPane( 100 ) ;
    statusbar.AppendPane( 100 ) ;

    DnsAddEventProc( window, 'beforeunload', BeforeUnload ) ;
    DnsAddEventProc( window, 'resize', Resize ) ;
    DnsAddEventProc( document.body, 'mousewheel', MouseScroll ) ;
    DnsAddEventProc( document.getElementById('mst_color_area'),   'click',  CmdColorSelect ) ;
    DnsAddEventProc( document.getElementById('mst_color_select'), 'click',  CmdColorSelect ) ;
    DnsAddEventProc( document.getElementById('mst_undo'),         'click',  CmdUndo ) ;
    DnsAddEventProc( document.getElementById('mst_enter'),        'click',  CmdEnter ) ;
    DnsAddEventProc( document.getElementById('mst_cancel'),       'click',  CmdCancel ) ;
    DnsAddEventProc( document.getElementById('mst_type_group'),   'change', CmdTypeChange ) ;
    DnsAddEventProc( document.getElementById('mst_mode_group'),   'change', CmdModeChange ) ;
    DnsAddEventProc( document.getElementById('mst_size'),         'change', CmdSizeChange ) ;
    DnsAddEventProc( document.getElementById('mst_zoom_down'),    'click',  CmdZoomDown ) ;
    DnsAddEventProc( document.getElementById('mst_zoom_up'),      'click',  CmdZoomUp ) ;
    DnsAddEventProc( document,      'keydown',  CmdKeyDown ) ;

    DnsAddEventProc( dstImage, 'mousedown', MouseDownImage ) ;
    DnsAddEventProc( dstImage, 'mousemove', MouseMoveImage ) ;
    DnsAddEventProc( dstImage, 'mouseup',   MouseUpImage ) ;
    DnsAddEventProc( svgFrame, 'mousemove', MouseMoveImage ) ;
    DnsAddEventProc( svgFrame, 'mouseup',   MouseUpImage ) ;
    DnsAddEventProc( workArea, 'mouseup',   MouseUpImage ) ;

    // 描画ツールの初期設定
    SetStrokeSize( GetSettingString('stroke_size', '1' ) ) ;
    SetDrawColor( GetSettingString('color','#FFFF00') ) ; // 初期値を黄色に変更(2016.09.16)
    SetDrawType( GetSettingString('draw_type', '0' ) ) ;
    SetFillMode( GetSettingString('fill_mode', '1' ) ) ; // 初期値をマスクに変更

    DnsAddEventProc( srcImage, 'load', UpdateImageFirst ) ;
    
    Resize() ;
    CmdModeChange() ;
    srcImage.src = imageURL ;

    /* 初期化処理：ここまで */
    //------------------------------------------------------------
    function Close()
    {
        window.close() ;
        return true ;
    }
    function BeforeUnload( event )
    {
        SetSettingValue( 'draw_type',   GetDrawType() ) ;
        SetSettingValue( 'fill_mode',   GetFillMode() ) ;
        SetSettingValue( 'stroke_size', GetStrokeSize() ) ;
        if( window.opener !== undefined && window.opener.DnsAnimationEditor !== undefined )
        {
            window.opener.DnsAnimationEditor.instance.MaskingToolClose() ;
        }
    }
    //------------------------------------------------------------
    // キー入力イベント
    function CmdKeyDown( event )
    {
        switch( event.keyCode )
        {
            case 90 : // Z 
                if( event.ctrlKey == true )
                {
                    CmdUndo() ;
                }
                else
                {
                    return false ;
                }
                break ;
            case 13 : // Enter
                CmdEnter() ;
                break ;
            case 27 : // Escape 
                CmdCancel() ;
                break ;
            case 33 : // Page Down
                if( event.ctrlKey == true )
                {
                    CmdZoomUp() ;
                }
                else
                {
                    return false ;
                }
                break ; 
            case 34 : // Page Up
                if( event.ctrlKey == true )
                {
                    CmdZoomDown() ;
                }
                else
                {
                    return false ;
                }
                break ;
            case 36 : // Page Up
                if( event.ctrlKey == true )
                {
                    ZoomChange( 100 ) ;
                }
                else
                {
                    return false ;
                }
                break ;
            default :
                return false ;
        }
        CancelEvenet( event ) ;
        return false ;
    }
    //------------------------------------------------------------
    // ウィンドウリサイズイベント
    function Resize( event )
    {
        workArea.style.left   = ( workCell.offsetLeft ) + 'px' ;
        workArea.style.top    = ( workCell.offsetTop  ) + 'px' ;
        workArea.style.width  = ( document.body.clientWidth  -  2 ) + 'px' ;
        workArea.style.height = ( document.body.clientHeight - 58 ) + 'px' ;
    }
    //------------------------------------------------------------
    // クリックイベント:色選択
    function CmdColorSelect( event )
    {
        var colorSelect = document.getElementById('mst_color_select') ;
        CancelEvenet( event ) ;
        DnsShowColorPicker( colorSelect, function ( newColor ){
            SetDrawColor( newColor ) ;
            SetSettingValue( 'color', newColor ) ;
        } ) ;
    }
    function CmdTypeChange( event )
    {
        SetDrawType() ;
    }
    function CmdModeChange( event )
    {
        if( GetFillMode() == 2 )
        {
            document.getElementById('mst_color_label').disabled = true ;
            document.getElementById('mst_color_area').disabled = true ;
            document.getElementById('mst_color_select').disabled = true ;
        }
        else
        {
            document.getElementById('mst_color_label').disabled  = false ;
            document.getElementById('mst_color_area').disabled   = false ;
            document.getElementById('mst_color_select').disabled = false ;
        }
    }
    function CmdSizeChange( event )
    {
    }
    //------------------------------------------------------------
    // コマンドボタン:アンドゥー
    function CmdUndo( event )
    {
        if( 0 < drawItems.length )
        {
            drawItems.pop() ;
            UpdateImage() ;
            if( drawItems.length == 0 )
            {
                document.getElementById('mst_undo').disabled = true ;
                document.getElementById('mst_enter').disabled = true ;
            }
        }
    }
    //------------------------------------------------------------
    // コマンドボタン:決定
    function CmdEnter( event )
    {
        if( orgImage != null && orgImage != undefined )
        {
            orgImage.src = dstImage.src ;
            window.opener.DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
        }
        window.close() ;
    }
    //------------------------------------------------------------
    // コマンドボタン:キャンセル
    function CmdCancel( event )
    {
        window.close() ;
    }
    //------------------------------------------------------------
    // コマンドボタン:ズームダウン
    function CmdZoomDown( event )
    {
        ZoomChange( parseInt( dstImage.clientWidth / dstImage.naturalWidth * 10 - 2 ) * 10 ) ;
    }
    //------------------------------------------------------------
    // コマンドボタン:ズームアップ
    function CmdZoomUp( event )
    {
        ZoomChange(  parseInt( dstImage.clientWidth / dstImage.naturalWidth * 10 + 2 ) * 10 ) ;
    }
    //------------------------------------------------------------
    // マウスホイールイベント処理
    // 画像の拡大縮小を行う
    function MouseScroll( event )
    {
        if( event.target != null && event.ctrlKey == true )
        {
            var zoom = parseInt( dstImage.clientWidth / dstImage.naturalWidth * 10 ) * 10 ;
            var delta = 0 ;

            if( event.wheelDelta != undefined )
            {
                delta = event.wheelDelta ;
            }
            else if( event.detail != undefined )
            {
                delta = event.detail ;
            }
            zoom += ( delta > 0 ? 20 : -20 ) ;
            ZoomChange( zoom ) ;
            CancelEvenet( event ) ;
            return false ;
        }
    }
    function ZoomChange( zoom )
    {
        if( 10 < zoom && zoom <= 2000 )
        {
            dstImage.style.width = parseInt( dstImage.naturalWidth * ( zoom / 100.0 ) ) + 'px' ;
            setTimeout( function ()
            {
                statusbar.SetText( 2, 'Zoom ' + parseInt( dstImage.clientWidth / dstImage.naturalWidth * 100 ) + '%' ) ;
            }, 10 ) ;
        }
    }
    //------------------------------------------------------------
    // 画像領域でのマウスボタンダウン
    function MouseDownImage( event )
    {
        {
            var nType = GetDrawType() ;
            var point = { x:0, y:0 } ;

            drawItem = null ;

            switch( nType )
            {
                case 0 :
                case 3 :
                    svgItem = document.getElementById('svg_draw_type1') ;
                    break ;
                case 1 :
                case 4 :
                    svgItem = document.getElementById('svg_draw_type2') ;
                    break ;
                case 2 :
                case 5 :
                    svgItem = document.getElementById('svg_draw_type3') ;
                    break ;
            }
            if( svgItem != null )
            {
                drawItem = [] ;
                svgFrame.style.left   = ( dstImage.offsetLeft ) + 'px' ;
                svgFrame.style.top    = ( dstImage.offsetTop  ) + 'px' ;
                svgFrame.style.width  = dstImage.offsetWidth  + 'px' ;
                svgFrame.style.height = dstImage.offsetHeight + 'px' ;
                svgFrame.style.display = 'inline-block' ;
                svgItem.style.display  = 'inline-block' ;

                point.x = ( event.pageX - workArea.offsetLeft + workArea.scrollLeft - svgFrame.offsetLeft ) ;
                point.y = ( event.pageY - workArea.offsetTop  + workArea.scrollTop  - svgFrame.offsetTop  ) ;

                switch( nType )
                {
                    case 0 :
                    case 3 :
                        drawItem.type = 'rectangle' ;
                        drawItem.start = point ;
                        drawItem.x1 = drawItem.x2 = point.x ;
                        drawItem.y1 = drawItem.y2 = point.y ; 
                        break ;
                    case 1 :
                    case 4 :
                        drawItem.type = 'ellipse' ;
                        if( 0 )
                        {
                            drawItem.start = point ;
                            drawItem.x1 = drawItem.x2 = point.x ;
                            drawItem.y1 = drawItem.y2 = point.y ; 
                        }
                        else
                        {
                            drawItem.cx = point.x ;
                            drawItem.cy = point.y ; 
                            drawItem.rx = 0 ;
                            drawItem.ry = 0 ; 
                        }
                        break ;
                    case 2 :
                    case 5 :
                        drawItem.type = 'round' ;
                        drawItem.start = point ;
                        drawItem.x1 = drawItem.x2 = point.x ;
                        drawItem.y1 = drawItem.y2 = point.y ; 
                        break ;
                }
                switch( nType )
                {
                    case 0 :
                    case 1 :
                    case 2 :
                        drawItem.fillColor = GetDrawColor() ;
                        break ;
                    case 3 :
                    case 4 :
                    case 5 :
                        drawItem.strokeColor = GetDrawColor() ;
                        drawItem.strokeSize  = GetStrokeSize() ;
                        break ;
                }
                switch( GetFillMode() )
                {
                    case 0 : drawItem.fillMode = 'fill' ;   break ;
                    case 1 : drawItem.fillMode = 'mask' ;   break ;
                    case 2 : drawItem.fillMode = 'invert' ; break ;
                }
                DnsAddEventProc( workArea, 'mousemove', MouseMoveImage ) ;
                MouseMoveImage( event ) ;
            }
        }
        CancelEvenet( event ) ;
        return false ;
    }
    //------------------------------------------------------------
    // 画像領域でのマウス移動
    function MouseMoveImage( event )
    {
        if( svgItem != null && drawItem.type != undefined )
        {
            var point = { x:0, y:0 } ;
            point.x = ( event.pageX - workArea.offsetLeft + workArea.scrollLeft - svgFrame.offsetLeft ) ;
            point.y = ( event.pageY - workArea.offsetTop  + workArea.scrollTop  - svgFrame.offsetTop  ) ;

            if( drawItem.start !== undefined )
            {
                drawItem.x1 = Math.min( point.x, drawItem.start.x ) ;
                drawItem.x2 = Math.max( point.x, drawItem.start.x ) ;
                drawItem.y1 = Math.min( point.y, drawItem.start.y ) ;
                drawItem.y2 = Math.max( point.y, drawItem.start.y ) ;
                svgItem.style.left   = drawItem.x1 + 'px' ;
                svgItem.style.top    = drawItem.y1 + 'px' ;
                svgItem.style.width  = ( drawItem.x2 - drawItem.x1 ) + 'px' ;
                svgItem.style.height = ( drawItem.y2 - drawItem.y1 ) + 'px' ;
            }
            else
            {
                var rect = [] ;
                drawItem.rx = Math.abs( drawItem.cx - point.x ) ;
                drawItem.ry = Math.abs( drawItem.cy - point.y ) ;
                rect.x1 = drawItem.cx - drawItem.rx ;
                rect.x2 = drawItem.cx + drawItem.rx ;
                rect.y1 = drawItem.cy - drawItem.ry ;
                rect.y2 = drawItem.cy + drawItem.ry ;
                svgItem.style.left   = rect.x1 + 'px' ;
                svgItem.style.top    = rect.y1 + 'px' ;
                svgItem.style.width  = ( rect.x2 - rect.x1 ) + 'px' ;
                svgItem.style.height = ( rect.y2 - rect.y1 ) + 'px' ;
            }
        }
        var pos = { x:event.offsetX, y:event.offsetY } ;
        pos.x = parseInt( pos.x * (  dstImage.naturalWidth  / dstImage.clientWidth ) ) ;
        pos.y = parseInt( pos.y * (  dstImage.naturalHeight / dstImage.clientHeight ) ) ;
        statusbar.SetText( 0, 'Mouse Pointer ' + pos.x + ' x ' + pos.y ) ;
        //statusbar.SetText( 1, event.offsetX + ' x ' + event.offsetY ) ;
        CancelEvenet( event ) ;
        return false ;
    }
    //------------------------------------------------------------
    // 画像領域でのマウスボタンアップ
    function MouseUpImage( event )
    {
        if( svgItem != null )
        {
            DnsRemoveEventProc( workArea, 'mousemove', MouseMoveImage ) ;
            svgFrame.style.display = 'none' ;
            svgItem.style.display = 'none' ;
            svgItem = null ;

            if( ( drawItem.rx != undefined && drawItem.rx < 4 ) || ( drawItem.ry != undefined && drawItem.ry < 4 ) )
            {
                var a = 0 ;
            }
            else if( ( drawItem.x1 != undefined && (drawItem.x2-drawItem.x1) < 2 ) || ( drawItem.y1 != undefined && (drawItem.y2-drawItem.y1) < 2 ) )
            {
                var a = 0 ;
            }
            else
            {
                if( drawItem.x1 != undefined )
                {
                    drawItem.x1 = parseInt( drawItem.x1 * (  dstImage.naturalWidth  / dstImage.clientWidth ) ) ;
                    drawItem.y1 = parseInt( drawItem.y1 * (  dstImage.naturalHeight / dstImage.clientHeight ) ) ;
                    drawItem.x2 = parseInt( drawItem.x2 * (  dstImage.naturalWidth  / dstImage.clientWidth ) ) ;
                    drawItem.y2 = parseInt( drawItem.y2 * (  dstImage.naturalHeight / dstImage.clientHeight ) ) ;
                    drawItem.w  = drawItem.x2 - drawItem.x1 ;
                    drawItem.h  = drawItem.y2 - drawItem.y1 ;
                }
                else
                {
                    drawItem.cx = parseInt( drawItem.cx * (  dstImage.naturalWidth  / dstImage.clientWidth ) ) ;
                    drawItem.cy = parseInt( drawItem.cy * (  dstImage.naturalHeight / dstImage.clientHeight ) ) ;
                    drawItem.rx = parseInt( drawItem.rx * (  dstImage.naturalWidth  / dstImage.clientWidth ) ) ;
                    drawItem.ry = parseInt( drawItem.ry * (  dstImage.naturalHeight / dstImage.clientHeight ) ) ;
                    drawItem.x1 = drawItem.cx - drawItem.rx ;
                    drawItem.y1 = drawItem.cy - drawItem.ry ;
                    drawItem.x2 = drawItem.cx + drawItem.rx ;
                    drawItem.y2 = drawItem.cy + drawItem.ry ;
                    drawItem.w  = drawItem.x2 - drawItem.x1 ;
                    drawItem.h  = drawItem.y2 - drawItem.y1 ;

                    delete drawItem.cx ;
                    delete drawItem.cy ;
                    delete drawItem.rx ;
                    delete drawItem.ry ;

                }
                document.getElementById('mst_undo').disabled = false ;
                drawItems.push( drawItem ) ;
                UpdateImage() ;
                document.getElementById('mst_enter').disabled = false ;
            }
        }
        CancelEvenet( event ) ;
        return false ;
    }
    //============================================================================
    // 設定の取得：LocalStrageから値と取得する
    function GetSettingString( name, strDefault )
    {
        if( window.localStorage )
        {
            var strResult = window.localStorage["cio_maskingtool_" + name] ;
            if( strResult != undefined )
            {
                return strResult ;
            }
        }
        return strDefault ;
    }
    //------------------------------------------------------------
    // 設定の取得：LocalStrageに設定値を保存する
    function SetSettingValue( name, data )
    {
        if( window.localStorage )
        {
            if( data != null && data != undefined )
            {
                window.localStorage["cio_maskingtool_" + name] = data ;
            }
            else
            {
                window.localStorage.removeItem("cio_maskingtool_" + name );
            }
        }
    }
    //------------------------------------------------------------
    // 描画タイプを設定する
    function SetDrawColor( newValue )
    {
        if( newValue != undefined )
        {
            document.getElementById('mst_color_area').style.backgroundColor = newValue ;
            for( i = 0 ; i < drawTypes.length ; i++ )
            {
                drawTypes[i].nextSibling.style.color = newValue ;
            }
        }
    }
    //------------------------------------------------------------
    // 描画タイプを設定する
    function SetDrawType( newValue )
    {
        if( newValue != undefined )
        {
            newValue = parseInt(newValue) ;
            if( 0 <= newValue && newValue < drawTypes.length )
            {
                drawTypes[newValue].checked = true ;
            }
        }
        document.getElementById('mst_size_label').disabled = ( GetDrawType() < 3 ) ? true : false ;
        document.getElementById('mst_size').disabled = ( GetDrawType() < 3 ) ? true : false ;
    }
    //------------------------------------------------------------
    // 塗りモードを設定する
    function SetFillMode( newValue )
    {
        if( newValue != undefined )
        {
            newValue = parseInt(newValue) ;
            if( 0 <= newValue && newValue < fillModes.length )
            {
                fillModes[newValue].checked = true ;
            }
        }
    }
    //------------------------------------------------------------
    // 線サイズを設定する
    function SetStrokeSize( newValue )
    {
        if( newValue != undefined )
        {
            document.getElementById('mst_size').value = parseInt(newValue) ;
        }
    }
    //------------------------------------------------------------
    // 描画色を取得する
    function GetDrawColor()
    {
        return document.getElementById('mst_color_area').style.backgroundColor ;
    }
    //------------------------------------------------------------
    // 描画タイプを取得する
    function GetDrawType()
    {
        for( i = 0 ; i < drawTypes.length ; i++ )
        {
            if( drawTypes[i].checked === true )
            {
                return i ;
            }
        }
    }
    //------------------------------------------------------------
    // 塗りモードを取得する
    function GetFillMode()
    {
        for( i = 0 ; i < fillModes.length ; i++ )
        {
            if( fillModes[i].checked === true )
            {
                return i ;
            }
        }
    }
    //------------------------------------------------------------
    // 線サイズを取得する
    function GetStrokeSize()
    {
        return document.getElementById('mst_size').value ;
    }
    //------------------------------------------------------------
    // 最初の画像ロード処理
    function UpdateImageFirst( event )
    {
        size.cx = srcImage.naturalWidth ;
        size.cy = srcImage.naturalHeight ;
        canvas1.width  = canvas2.width  = size.cx ;
        canvas1.height = canvas2.height = size.cy ;
        context1.drawImage( srcImage, 0, 0, size.cx, size.cy ) ; 
        dstImage.src = canvas1.toDataURL() ;
        DnsRemoveEventProc( srcImage, 'load', UpdateImageFirst ) ;
        DnsAddEventProc( srcImage, 'load', UpdateImage ) ;        

        if( (size.cx/size.cy) < (workArea.clientWidth/workArea.clientHeight) )
        {
            var cy = parseInt( workArea.clientHeight*0.95 ) ;
            var cx = parseInt( size.cx * ( cy / size.cy ) ) ;
            dstImage.style.width = cx + 'px' ;
        }
        else
        {
            dstImage.style.width = parseInt( workArea.clientWidth*0.95 ) + 'px' ;
        }
        statusbar.SetText( 2, 'Zoom ' + parseInt( dstImage.clientWidth / dstImage.naturalWidth * 100 ) + '%' ) ;
    }
    //------------------------------------------------------------
    // 通常の画像ロード処理
    // drawItemsが要素を保つ場合は追加する
    function UpdateImage( event )
    {
        context1.drawImage( srcImage, 0, 0, size.cx, size.cy ) ; 
        for( var i = 0 ; i < drawItems.length ; i++ )
        {
            var drawItem = drawItems[i] ;

            if( drawItem.strokeSize != undefined )
            {
                context1.lineWidth = context2.lineWidth = drawItem.strokeSize ;
            }
            if( drawItem.fillColor != undefined )
            {
                context1.fillStyle = context2.fillStyle = drawItem.fillColor ;
            }
            if( drawItem.strokeColor != undefined )
            {
                context1.strokeStyle = context2.strokeStyle = drawItem.strokeColor ;
            }

            // 通常の図形描画処理
            if( drawItem.fillMode == 'fill' )
            {
                if( drawItem.type == 'rectangle' )
                {
                    MstRectangle( context1, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, drawItem.fillColor != undefined ) ;
                }
                else if( drawItem.type == 'ellipse' )
                {
                    MstEllipse( context1, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, drawItem.fillColor != undefined ) ;
                }
                else if( drawItem.type == 'round' )
                {
                    var r = Math.min( drawItem.x2-drawItem.x1, drawItem.y2-drawItem.y1 ) / 6 ;
                    MstRoundRect( context1, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, r, drawItem.fillColor != undefined ) ;
                }
            }
            // 選択範囲の反転処理
            else if( drawItem.fillMode == 'invert' )
            {
                context2.fillStyle   = '#FFFFFF' ;
                context2.strokeStyle = '#FFFFFF' ;
                context2.clearRect( 0, 0, size.cx, size.cy ) ;
                if( drawItem.type == 'rectangle' )
                {
                    MstRectangle( context2, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, drawItem.fillColor != undefined ) ;
                }
                else if( drawItem.type == 'ellipse' )
                {
                    MstEllipse( context2, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, drawItem.fillColor != undefined ) ;
                }
                else if( drawItem.type == 'round' )
                {
                    var r = Math.min( drawItem.x2-drawItem.x1, drawItem.y2-drawItem.y1 ) / 6 ;
                    MstRoundRect( context2, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, r, drawItem.fillColor != undefined ) ;
                }
                var rect = { x:drawItem.x1, y:drawItem.y1, w:drawItem.w, h:drawItem.h } ;
                if( 2 < GetDrawType() )
                {
                    var s = parseInt( GetStrokeSize() ) ;
                    rect.x -= parseInt( s/2 ) ;
                    rect.y -= parseInt( s/2 ) ;
                    rect.w += s ;
                    rect.h += s ;
                }
                var data1 = context1.getImageData( rect.x, rect.y, rect.w, rect.h ) ; 
                var data2 = context2.getImageData( rect.x, rect.y, rect.w, rect.h ) ; 
                for( pos = 0 ; pos < data2.data.length ; pos += 4 )
                {
                    if( data2.data[pos+3] != 0 )
                    {
                        data1.data[pos+0] = 255 - data1.data[pos+0] ;
                        data1.data[pos+1] = 255 - data1.data[pos+1] ;
                        data1.data[pos+2] = 255 - data1.data[pos+2] ;
                    }
                }
                context1.putImageData( data1, rect.x, rect.y ) ; 
            }
            // 選択範囲のマスク処理
            else if( drawItem.fillMode == 'mask' )
            {
                context2.clearRect( 0, 0, size.cx, size.cy ) ;
                if( drawItem.type == 'rectangle' )
                {
                    MstRectangle( context2, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, drawItem.fillColor != undefined ) ;
                }
                else if( drawItem.type == 'ellipse' )
                {
                    MstEllipse( context2, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, drawItem.fillColor != undefined ) ;
                }
                else if( drawItem.type == 'round' )
                {
                    var r = Math.min( drawItem.x2-drawItem.x1, drawItem.y2-drawItem.y1 ) / 6 ;
                    MstRoundRect( context2, drawItem.x1, drawItem.y1, drawItem.x2, drawItem.y2, r, drawItem.fillColor != undefined ) ;
                }
                var rect = { x:drawItem.x1, y:drawItem.y1, w:drawItem.w, h:drawItem.h } ;
                if( 2 < GetDrawType() )
                {
                    var s = parseInt( GetStrokeSize() ) ;
                    rect.x -= parseInt( s/2 ) ;
                    rect.y -= parseInt( s/2 ) ;
                    rect.w += s ;
                    rect.h += s ;
                }
                var data1 = context1.getImageData( rect.x, rect.y, rect.w, rect.h ) ; 
                var data2 = context2.getImageData( rect.x, rect.y, rect.w, rect.h ) ; 
                for( pos = 0 ; pos < data2.data.length ; pos += 4 )
                {
                    if( data2.data[pos+3] != 0 )
                    {
                        data1.data[pos+0] = Math.min( data1.data[pos+0], data2.data[pos+0] ) ;
                        data1.data[pos+1] = Math.min( data1.data[pos+1], data2.data[pos+1] ) ;
                        data1.data[pos+2] = Math.min( data1.data[pos+2], data2.data[pos+2] ) ;
                    }
                }
                context1.putImageData( data1, rect.x, rect.y ) ; 
            }
        }
        dstImage.src = canvas1.toDataURL() ;
    }
    //---------------------------------------------------------
    // 四角を描画
    function MstRectangle( context, x1, y1, x2, y2, fill )
    {
        if( fill === true )
        {
            context.fillRect( x1, y1, x2-x1, y2-y1 ) ;
        }
        else
        {
            context.strokeRect( x1, y1, x2-x1, y2-y1 ) ;
        }
    }
    //---------------------------------------------------------
    // 角丸四角を描画
    function MstRoundRect( context, x1, y1, x2, y2, r, fill )
    {
        var pi = Math.PI ;
        var w = (x2-x1) ;
        var h = (y2-y1) ;
        context.beginPath() ;
        context.arc( x1 + r,     y1 + r,     r, - pi,       -0.5*pi,    false) ;
        context.arc( x1 + w - r, y1 + r,     r, - 0.5 * pi, 0,          false) ;
        context.arc( x1 + w - r, y1 + h - r, r, 0,          0.5 * pi,   false) ;
        context.arc( x1 + r,     y1 + h - r, r, 0.5 * pi,   pi,         false) ;
        context.closePath() ;
        if( fill === true )
        {
            context.fill() ;
        }
        else
        {
            context.stroke() ;
        }
    }
    //---------------------------------------------------------
    // 楕円を描画
    function MstEllipse( context, x1, y1, x2, y2, fill )
    {
        var w  = x2 - x1 ;
        var h  = y2 - y1 ;
        var cx = ( x1 + x2 ) / 2 ;
        var cy = ( y1 + y2 ) / 2 ;
        var rx = w / 2 ;
        var ry = h / 2 ;
        var xA = cx - ( rx * 0.56 ) ;
        var xB = cx + ( rx * 0.56 ) ;
        var yA = cy - ( ry * 0.56 ) ;
        var yB = cy + ( ry * 0.56 ) ;

        context.beginPath();
        context.moveTo( x1, cy );
        context.bezierCurveTo( x1, yB, xA, y2, cx, y2 ) ;
        context.bezierCurveTo( xB, y2, x2, yB, x2, cy ) ;
        context.bezierCurveTo( x2, yA, xB, y1, cx, y1 ) ;
        context.bezierCurveTo( xA, y1, x1, yA, x1, cy ) ;
        if( fill === true )
        {
            context.fill() ;
        }
        else
        {
            context.stroke() ;
        }
    }
	// Windows Edge 対応(起動時に画面をリサイズする)
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
