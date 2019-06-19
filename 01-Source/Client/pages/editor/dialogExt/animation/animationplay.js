// +--------------------------------------------------------------------------+
// |                           ChattyInfty-Online                             |
// |                         株式会社デジタルノーツ                           |
// +--------------------------------------------------------------------------+
// |  ファイル名 ： animationedit.js                                          |
// |  概要       ： アニメーション編集画面                                    |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// +--------------------------------------------------------------------------+
include('../dnslibrary/theme.css') ;            // テーマ定義ファイルの読み込み
include('../dnslibrary/dnscolorpicker.js') ;    // 色選択ツール
include('../dnslibrary/sound.js') ;             // 音声サポート
include('../dnslibrary/dnsdialog.js') ;         // ダイアログ機能の読み込み
include('../dnslibrary/dnsstatusbar.js') ;      // ステータスバー機能の読み込み
include('./animationedit_lang.js') ;
include('./language.js') ;

var DnsAnimationPlay = function()
{
    DnsAnimationPlay.instance = this ;
    var cThis = this ;
    this.area        = document.getElementById('amination_play_area') ;
    this.audio       = document.getElementById('amination_play_audio') ;
    this.info        = document.getElementById('amination_play_info') ;
    this.image       = document.getElementById('amination_play_image') ;
    this.btnStop     = document.getElementById('amination_play_cmd_stop') ;
    this.btnBack     = document.getElementById('amination_play_cmd_back') ;
    this.btnPause    = document.getElementById('amination_play_cmd_pause') ;
    this.btnPlay     = document.getElementById('amination_play_cmd_play') ;
    this.btnNext     = document.getElementById('amination_play_cmd_next') ;
    this.btnClose    = document.getElementById('amination_play_cmd_close') ;
    this.Frames      = null ;
    this.nFrameIndex = 0 ;
    this.nFrameCount = 0 ;

    DnsAddEventProc( this.audio,    'loadeddata', OnAudioLoad ) ;
    DnsAddEventProc( this.audio,    'ended',      OnAudioEnded ) ;
    DnsAddEventProc( this.btnStop,  'click',      OnStop ) ;
    DnsAddEventProc( this.btnBack,  'click',      OnBack ) ;
    DnsAddEventProc( this.btnPause, 'click',      OnPause ) ;
    DnsAddEventProc( this.btnPlay,  'click',      OnPlay ) ;
    DnsAddEventProc( this.btnNext,  'click',      OnNext ) ; 
    DnsAddEventProc( this.btnClose, 'click',      OnClose ) ;

    // 再生開始
    DnsAnimationPlay.prototype.Start = function ( cParent )
    {
        var cThis = DnsAnimationPlay.instance ;

        cThis.nFrameIndex = 0 ;
        cThis.nFrameCount = cParent.GetFrameCount() ;
        cThis.Frames = [] ;
        cThis.btnPause.style.display = 'none' ;
        cThis.btnPlay.style.display  = '' ;

        cThis.info.textContent = '音声取得中 しばらくお待ちください....' ;

        if( cThis.nFrameCount  == 0 )
        {
            return false ;
        }

        var srcImage    = cParent.GetFrame( 0 ).getImage() ;
        var siClient    = { cx:document.body.clientWidth, cy:document.body.clientHeight - 50 } ;
        var siImage     = { cx:srcImage.naturalWidth,     cy:srcImage.naturalHeight } ;

        cThis.info.style.width = cThis.info.style.minWidth = cThis.info.style.maxWidth =  parseInt(  siClient.cx * 0.8 ) + 'px' ;

        if( (siImage.cx/siClient.cx) < (siImage.cy/siClient.cy) )
        {
            cThis.image.style.height  = parseInt(  siClient.cy * 0.8 ) + 'px' ;
            cThis.image.style.width   = parseInt( (siClient.cy * 0.8 ) * (siImage.cx/siImage.cy) ) + 'px' ;
        }
        else
        {
            cThis.image.style.width  = parseInt(  siClient.cx * 0.8 ) + 'px' ;
            cThis.image.style.height = parseInt( (siClient.cx * 0.8 ) * (siImage.cy/siImage.cx) ) + 'px' ;
        }
        cThis.image.src = srcImage.src ;

        for( var i = 0 ; i < cThis.nFrameCount ; i++ )
        {
            var cFrame = cParent.GetFrame( i ) ;
            cThis.Frames[i] = 
            {
                frame:cFrame,
                index:cFrame.getIndex(),
                text :cFrame.getReadText(),
                image:cFrame.getImage(),
                src  :''
            } ;
        }
        cThis.area.style.display = '' ;
        DnsAnimationPlay.prototype.AudioProc() ;
        return true ;
    }
    DnsAnimationPlay.prototype.AudioProc = function ( index )
    {
        var cThis = DnsAnimationPlay.instance ;
        if( index == undefined )
        {
            index = 0 ;
        }
        if( cThis.Frames != null && 0 <= index && index < cThis.Frames.length )
        {
            if( cThis.Frames[index].src == '' )
            {
                AudioTools.prototype.TextToAudio( cThis.Frames[index].text, 
                    function( data )
                    {
                        if( cThis.Frames != null )
                        {
                            cThis.Frames[index].src = data ;
                            if( index == cThis.nFrameIndex && ( cThis.audio.src == '' || cThis.audio.ended == true ) )
                            {
                                cThis.image.src = cThis.Frames[index].image.src ;
                                cThis.audio.src = cThis.Frames[index].src ;
                            }
                            DnsAnimationPlay.prototype.AudioProc( index+1 ) ;
                        }
                    },
                    function( result )
                    {
                        alert('音声の取得ができません') ;
                    }
                ) ;
            }
        }
    }
    function OnAudioLoad( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        cThis.info.textContent = 'Frame ' + ( cThis.nFrameIndex + 1 ) + '/' + ( cThis.nFrameCount ) + '「' + cThis.Frames[cThis.nFrameIndex].text + '」' ; 
        cThis.btnPause.style.display = '' ;
        cThis.btnPlay.style.display  = 'none' ;
        cThis.audio.play() ;
    }
    function OnAudioEnded( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        cThis.audio.pause() ;
        if( cThis.nFrameIndex < cThis.nFrameCount )
        {
            cThis.nFrameIndex++ ;
            if( cThis.nFrameIndex < cThis.nFrameCount )
            {
                if( cThis.Frames[cThis.nFrameIndex].src != '' )
                {
                    cThis.image.src = cThis.Frames[cThis.nFrameIndex].image.src ;
                    cThis.audio.src = cThis.Frames[cThis.nFrameIndex].src ;
                }
                else
                {
                    cThis.info.textContent = 'Frame ' + ( cThis.nFrameIndex + 1 ) + '/' + ( cThis.nFrameCount ) + ' 音声取得中 しばらくお待ちください....' ;
                }
            }
            else
            {
                // すべてのフレームの再生が終了したら、1秒後に終了
                cThis.info.textContent = '再生テストが終了しました' ;
                setTimeout( function()
                    { 
                        if( cThis.audio.ended == true && cThis.nFrameIndex == cThis.nFrameCount )
                        {
                            OnClose() ;
                        }
                    }, 1000 ) ;
            }
        }
    }
    function OnStop( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        cThis.btnPause.style.display = 'none' ;
        cThis.btnPlay.style.display  = '' ;
        cThis.nFrameIndex = 0 ;
        cThis.audio.removeAttribute('src') ;
        cThis.audio.pause() ;
    }
    function OnBack( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        if( 0 < cThis.nFrameIndex )
        {
            cThis.nFrameIndex-- ;
        }
        cThis.image.src = cThis.Frames[cThis.nFrameIndex].image.src ;
        cThis.audio.src = cThis.Frames[cThis.nFrameIndex].src ;
    }
    function OnPause( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        cThis.btnPause.style.display = 'none' ;
        cThis.btnPlay.style.display  = '' ;
        cThis.audio.pause() ;
    }
    function OnPlay( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        cThis.btnPause.style.display = '' ;
        cThis.btnPlay.style.display  = 'none' ;
        if( cThis.audio.src == '' )
        {
            cThis.image.src = cThis.Frames[0].image.src ;
            cThis.audio.src = cThis.Frames[0].src ;
        }
        else
        {
            cThis.audio.play() ;
        }
    }
    function OnNext( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        if( cThis.nFrameIndex < (cThis.nFrameCount-1) )
        {
            cThis.nFrameIndex++ ;
            cThis.image.src = cThis.Frames[cThis.nFrameIndex].image.src ;
            if( cThis.Frames[cThis.nFrameIndex].src != '' )
            {
                cThis.audio.src = cThis.Frames[cThis.nFrameIndex].src ;
            }
        }
    }
    function OnClose( event )
    {
        var cThis = DnsAnimationPlay.instance ;
        cThis.Frames = null ;
        cThis.nFrameCount = cThis.nFrameIndex = 0 ;
        cThis.audio.pause() ;
        cThis.audio.removeAttribute('src') ;
        cThis.info.textContent = '' ; 
        cThis.image.src = '' ;
        cThis.area.style.display = 'none' ;
    }
}

DnsAnimationPlay.instance = null ;
