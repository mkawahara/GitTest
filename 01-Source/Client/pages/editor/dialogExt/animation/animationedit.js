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
include('../dnslibrary/dnsdialog.js') ;         // ダイアログ機能の読み込み
include('../dnslibrary/dnsstatusbar.js') ;      // ステータスバー機能の読み込み
include('../dnslibrary/sound.js') ;             // 音声サポート
include('./animationedit_lang.js') ;
include('./animationplay.js') ;
include('./language.js') ;

DnsAddEventProc( window, 'load', AnimationEditorInit) ;

var params = GetParams() ;
var animeID = params['animeId'] ;
var imageID = params['imageId'] ;
var docID = null ;

// アニメーションエディタの初期化処理
function AnimationEditorInit()
{
	SetCaptionLanguage( itemLabels ) ; // 各要素のラベルを設定する

	if ( !window.opener )
	{
		alert('このページを直接開いても動作しません。');
		window.close() ;
		return;
	};
	if ( !window.opener.MessageManager == undefined )
	{
		alert('不正な呼び出し方法です。');
		window.close() ;
		return;
	} ;
	
	docInfo = window.opener.MessageManager.getDocumentInfo() ;
	document.title = "「" + docInfo.fileName + "」" + document.title ;
	//-----------------------------------------------------
	// アニメーション情報の初期化
	Communicator.request('animeGet', { doc_id:docInfo.docId,animation_id:params['animeId']}, 
		function( res )
		{
			// サーバーからアニメーション情報を取得できた差場合
			if( res.error_code == 0 && res.content != undefined && res.content.replace(/^\s+|\s+$/g,'').match(/^\<ianimation/) )
			{
				aimationdata = document.createElement('div') ;
				aimationdata.innerHTML = res.content ;
				aimationdata = aimationdata.getElementsByTagName('ianimation') ;
				if( aimationdata != null && 0 < aimationdata.length )
				{
					aimationdata = aimationdata[0] ;
					new DnsAnimationEditor( aimationdata, true ) ;
				}
				else
				{
					alert( errorMessage.animetion_data ) ; 
					window.close() ;
					return ;
				}
			}
			else
			{
				if( res.error_code != 0 )
				{
					alert( errorMessage.server_result + "\nerror code(" + res.error_code + ")" ) ;
				}
				else if( res.content == undefined )
				{
					alert( errorMessage.content_error ) ;
				}
				else if( res.content != undefined )
				{
					alert( errorMessage.content_nomatch ) ;
				}
				else
				{
					alert( errorMessage.error_unknown ) ;
				}
				window.close() ;
				return ;
			}
		},
		function( error_info )
		{
			// サーバーから情報失敗
			switch( error_info.error_code )
			{
			case 100 : // タイムアウトエラー
				alert( errorMessage.error_100 ) ;
				break ;
			case 400 : // 権限がない
				alert( errorMessage.error_400 ) ;
				break ;
			case 110 : // サバーにアニメーション情報がない
				// この場合は、編集画面に画像を問い合わせて、アニメーション
				// の1フレーム目にする
				var data = window.opener.MessageManager.getImageProperty(imageID);
				var thumb = window.opener.MessageManager.getThumnail(imageID);
				if( thumb != undefined && thumb != null && thumb.length )
				{
					aimationdata = document.createElement('ianimation') ;
					if( data.alt == null || data.alt == undefined )
					{
						data.alt = '' ;
					}
					if( data.title == null || data.title == undefined )
					{
						data.title = '' ;
					}
					if( data.reading == null || data.reading == undefined )
					{
						data.reading = '' ;
					}
					aimationdata.innerHTML = '<img src="' + thumb + '" alt="' + data.alt + '" title="' + data.title + '" read_text="' + data.reading + '"/>' ;
					new DnsAnimationEditor( aimationdata, false ) ;
					return ; // この処理はここで終了し、リターンする。(画面を閉じてしまわないため)
				}
				else
				{
					// 画像情報が正しくない
					alert( errorMessage.no_image ) ;
				}
				break ;
			default : // 不明なエラー
				alert( errorMessage.comm_error + '(' + error_info.error_code + ')' ) ;
			}
			window.close() ;
		}
	) ;
}

function ImageURLtoBase64( image )
{
	var c = document.createElement("canvas");

	c.width  = image.naturalWidth ;
	c.height = image.naturalHeight ;
	var ctx = c.getContext("2d");
 
	ctx.drawImage( image, 0, 0, image.naturalWidth, image.naturalHeight );
	return c.toDataURL() ;
}

var DnsAnimationEditor = function ( ianimation, bDbAnimation )
{
	DnsAnimationEditor.instance = this ;
	srcIanimation = ianimation ;
	this.bCreateNew		   = bDbAnimation == false ;
	this.AnimationPlay     = new DnsAnimationPlay() ;
	this.audio             = document.createElement('audio') ;
	this.cReadText         = document.getElementById('read_text') ;
	this.btnReadTest       = document.getElementById('read_test') ;
	this.btnEditCopy       = document.getElementById('edit_copy') ;
	this.btnEditDelete     = document.getElementById('edit_delete') ;
	this.btnEditFile       = document.getElementById('edit_file') ;
	this.btnEditClipbord   = document.getElementById('edit_clipbord') ;
	this.btnEditMoveup     = document.getElementById('edit_moveup') ;
	this.btnEditMovedown   = document.getElementById('edit_movedown') ;
	this.btnEditMasking    = document.getElementById('edit_masking') ;
	this.btnCmdPlay        = document.getElementById('cmd_play') ;
	this.btnCmdEnter       = document.getElementById('cmd_enter') ;
	this.btnCmdCancel      = document.getElementById('cmd_cancel') ;

	overlap = null ;
	msgbox = null ;
	maskingtool = null ;
	selected = null ; // 選択中の<TR>要素
	bFrameListFocus = false ;
	var frames = null ;
	var imageSize = { cx:0, cy:0 } ;
	var dispSize  = { cx:0, cy:0 } ;

	if( bDbAnimation == false )
	{
		document.title += "(新規)" ;
	}
	//------------------------------
	this.audio.id = 'dns_audio_test' ;
	//------------------------------
	images = ianimation.getElementsByTagName('img') ;
	framelist = document.getElementById('framelist') ;
	framelist_table = document.getElementById('framelist_table') ;
	framelist_tbody = framelist_table.firstElementChild ;
	framelist_tbody.tabIndex = 1 ;
	frames    = document.getElementById('frames') ;

	DnsAddEventProc( window, "dragover",    DragOver ) ;
	DnsAddEventProc( window, "drop",         DroppedFile ) ;
	//DnsAddEventProc( window, "beforeunload", OnBeforeUnload ) ;
	window.onbeforeunload = OnBeforeUnload ;
	//------------------------------
	// ステータスバーの作成
	statusbar = new DnsStatusBar( document.body, true ) ;
	statusbar.SetText( "Ready" ) ;
	statusbar.AppendPane( 100 ) ;
	statusbar.AppendPane( 100 ) ;
	//------------------------------
	// アニメーションのフレームを追加
	for( var i = 0, nImages = images.length ; i < nImages ; i++ )
	{
		var image = images[0] ;
		if( i == 0 )
		{
			CalcDispSize( image ) ;
		}
		tr = CreateFrame( image ) ;
		if( i == 0 )
		{
			var img = tr.getImage() ;
			if( img != null )
			{
				imageSize.cx = img.naturalWidth ;
				imageSize.cy = img.naturalHeight ;
				dispSize.cx =  img.offsetWidth ;
				dispSize.cy =  img.offsetHeight ;
			}
		}
		if( image.src.match(/^data\:image/) == null )
		{
			image.src = ImageURLtoBase64( image ) ;
		}
	}
	SetFrameData() ;

	this.btnReadTest.disabled     = false ;
	this.btnEditCopy.disabled     = false ;
	this.btnEditDelete.disabled   = false ;
	this.btnEditFile.disabled     = false ;
	this.btnEditClipbord.disabled = false ;
	this.btnEditMoveup.disabled   = false ;
	this.btnEditMovedown.disabled = false ;
	this.btnEditMasking.disabled  = false ;
	this.btnCmdPlay.disabled      = false ;
	this.btnCmdEnter.disabled     = true ;
	this.btnCmdCancel.disabled    = false ;

	DnsAddEventProc( window, "resize", Resize ) ;

	DnsAddEventProc( document.body, "contextmenu", CmdContextMenu, true ) ;
	DnsAddEventProc( framelist_tbody, 'click', FrameClick ) ;
	DnsAddEventProc( framelist_tbody, 'dblclick', FrameDblClick ) ;

	DnsAddEventProc( this.cReadText,        "keydown", ReadTextKeyDown ) ;
	DnsAddEventProc( this.cReadText,        "keyup",   ReadTextKeyUp ) ;
	DnsAddEventProc( this.btnReadTest,      'click', CmdReadTest ) ;
	DnsAddEventProc( this.btnEditCopy,      'click', CmdEditCopy ) ;
	DnsAddEventProc( this.btnEditDelete,    'click', CmdEditDelete ) ;
	DnsAddEventProc( this.btnEditFile,      'click', CmdFile ) ;
	DnsAddEventProc( this.btnEditClipbord,  'click', CmdClipbord ) ;
	DnsAddEventProc( this.btnEditMoveup,    'click', CmdMoveUp ) ;
	DnsAddEventProc( this.btnEditMovedown,  'click', CmdMoveDown ) ;
	DnsAddEventProc( this.btnEditMasking,   'click', EditMasking ) ;
	DnsAddEventProc( this.btnCmdPlay,       'click', CmdPlay ) ;
	DnsAddEventProc( this.btnCmdEnter,      'click', CmdEnter ) ;
	DnsAddEventProc( this.btnCmdCancel,     'click', CmdCancel ) ;
	DnsAddEventProc( document.getElementById('cmd_cancel'),      'click', CmdCancel ) ;
	DnsAddEventProc( framelist_tbody, "keydown", KeyDown ) ;
	DnsAddEventProc( framelist_tbody, "focus", ListFocus ) ;
	DnsAddEventProc( framelist_tbody, "blur",  ListFocus ) ;

	
	if( window.File && window.FileReader && window.FileList && window.Blob )
	{
		document.getElementById('edit_file').disabled = false ; 
	}
	else
	{
		document.getElementById('edit_file').disabled = true ; 
	}

	SetSel() ; // 最初のアイテムを選択
	SetStatusInfo() ; // ステータスバーに情報を表示する

	Resize() ;
	framelist_tbody.focus();

	// メインの初期化処理はここまで

	//-----------------------------------------------------------
	// すべてのフレームの表示情報を更新する
	function SetFrameData()
	{
		//i = 1 ;
		for( var item = framelist_tbody.firstElementChild ; item != null ; item = item.nextElementSibling, i++ )
		{
			item.setReadText() ;
		}
	}
	//-----------------------------------------------------------
	// フレームを追加する
	// data = 画像データ
	// insertPos = 挿入位置(整数)※省略時は最後に追加
	function CreateFrame( data, insertPos )
	{
		var frames = framelist_tbody.getElementsByTagName('TR') ;
		var tr = document.createElement('tr') ;

		tr.getIndex    = getFrameIndex ;
		tr.getImage    = getFrameImage ;
		tr.setReadText = setReadText ;
		tr.getReadText = getReadText ;
		tr.appendChild( td1 = document.createElement('td') ) ;
		tr.appendChild( td2 = document.createElement('td') ) ;
		tr.appendChild( td3 = document.createElement('td') ) ;
		td2.innerHTML = '<p class="frametext"/>' ;
		if( typeof data === 'string' )
		{
			image = document.createElement('img') ;
			image.src = data ;
			image.onload = function ()
			{
				if( frames.length == 0 )
				{
					// 画面上の表示サイズを設定する
					//CalcDispSize( image ) ;
					//image.style.width  = dispSize.cx + 'px' ;
					//image.style.height = dispSize.cy + 'px' ;
				}
			}
			td2.appendChild( image ) ;
		}
		else
		{
			td2.appendChild( data ) ;
		}
		if( typeof insertPos == 'number' && 0 <= insertPos && insertPos < frames.length )
		{
			framelist_tbody.insertBefore( tr, frames.item(insertPos) ) ;
		}
		else
		{
			framelist_tbody.appendChild( tr ) ;
		}
		return tr ;
	}
	//-----------------------------------------------------------
	// 画面上の表示サイズを設定する
	// 幅180pxか高さ200pxを最大として、範囲に収まるように計算する
	function CalcDispSize( image ) 
	{
		var aspect = image.naturalWidth/image.naturalHeight ;
		if( (200/aspect) < 200 )
		{
			dispSize.cx = 180 ;
			dispSize.cy = parseInt(200/aspect) ;
		}
		else
		{
			dispSize.cx = parseInt(180*aspect) ;
			dispSize.cy = 200 ;
		}
		statusbar.SetText( itemLabels['info_image_size'].caption + ' ' + itemLabels.info_image_width.caption + '=' + image.naturalWidth + 'px ' + itemLabels.info_image_height.caption + '=' + image.naturalHeight + 'px' ) ;
	}
	//-----------------------------------------------------------
	// フレームを選択する
	function SetSel( item )
	{
		var cThis = DnsAnimationEditor.instance ;
		selected = null ;
		frames = framelist_tbody.getElementsByTagName('TR') ;

		statusbar.SetText( 2, itemLabels['status_frame_total'].caption + frames.length ) ;
		if( item == undefined )
		{
			item = 0 ;
		}
		if( typeof item == 'number' && 0 <= item && item < frames.length )
		{
			item = frames[item] ;
		}
		else if( typeof item == 'number' )
		{
			// インデックスが有効範囲にない場合は何もしない
			return false ;
		}
		if( item != null && item != undefined )
		{
			for( i = 0 ; i < frames.length ; i++ )
			{
				frames[i].className = '' ;
			}
			selected = item ;
			item.className = 'selected' ;
			td = item.getElementsByTagName('td').item(1) ;   // 画像のTD
			image = td.getElementsByTagName('img').item(0) ; // 画像要素

			if( selected.offsetTop < framelist.scrollTop )
			{
				// アイテムがフレームリストの表示範囲に収まっていないので上スクロール
				framelist.scrollTop = selected.offsetTop ;
			}
			else if( (framelist.scrollTop+framelist.clientHeight) < (selected.offsetTop+selected.offsetHeight) )
			{
				// アイテムがフレームリストの表示範囲に収まっていないので下スクロール
				framelist.scrollTop = (selected.offsetTop+selected.offsetHeight) - framelist.clientHeight ;
			}
			
			rtext = image.attributes.getNamedItem('read_text') ;
			if( rtext != null && rtext != undefined )
			{
				cThis.cReadText.value = rtext.value ;
			}
			else
			{
				cThis.cReadText.value = '' ;
			}
			SetStatusInfo() ;
		}
	}
	//-----------------------------------------------------------
	// 選択中のフレーム番号を取得する
	// 　※未選択の場合は-1を返す
	function GetSel()
	{
		frames = framelist_tbody.getElementsByTagName('TR') ;
		for( i = 0 ; i < frames.length ; i++ )
		{
			if( frames[i].className == 'selected' )
			{
				return i ;
			}
		}
		return -1 ;
	}
	//-----------------------------------------------------------
	// フレーム数を取得する
	DnsAnimationEditor.prototype.GetFrameCount = function ()
	{
		return framelist_tbody.getElementsByTagName('TR').length ;
	}
	//-----------------------------------------------------------
	// 指定されたフレーム(TR要素)を取得する
	DnsAnimationEditor.prototype.GetFrame = function( index )
	{
		var frames = framelist_tbody.getElementsByTagName('TR');
		if( frames != null && 0 <= index && index < frames.length )
		{
			return frames[index] ;
		}
		return null ;
	}
	//-----------------------------------------------------------
	// 指定されたフレーム画像(IMG要素)を取得する
	DnsAnimationEditor.prototype.GetFrameImage = function( index )
	{
		if( (result = DnsAnimationEditor.instance.GetFrame( index )) != null )
		{
			return result.getElementsByTagName('IMG').item(0) ;
		}
		return null ;
	}
	//-----------------------------------------------------------
	// 指定されたフレームの読み上げテキストを取得する
	DnsAnimationEditor.prototype.GetFrameText = function( index )
	{
		var result = DnsAnimationEditor.instance.GetFrame( index ) ;
		if( result != null )
		{
			result = result.getElementsByTagName('IMG').item(0) ;
			if( result != null )
			{
				result = result.attributes.getNamedItem('read_text') ;
				if( result != null && result.textContent != undefined )
				{
					return result.textContent ;
				}
			}
		}
		return '' ;
	}
	//-----------------------------------------------------------
	// 選択中のフレーム(TR要素)を取得する
	// 　※未選択の場合はnullを返す
	function GetSelFrame()
	{
		frames = framelist_tbody.getElementsByTagName('TR') ;
		for( i = 0 ; i < frames.length ; i++ )
		{
			if( frames[i].className == 'selected' )
			{
				return frames[i] ;
			}
		}
		return null ;
	}
	//-----------------------------------------------------------
	// ステータスバーに情報を表示する
	function SetStatusInfo()
	{
		frames = framelist_tbody.getElementsByTagName('TR') ;
		statusbar.SetText( 1, '' ) ;
		statusbar.SetText( 2, itemLabels['status_frame_total'].caption + frames.length ) ;
		for( i = 0 ; i < frames.length ; i++ )
		{
			if( frames[i].className == 'selected' )
			{
				statusbar.SetText( 1, itemLabels['status_frame_pos'].caption + (i+1) ) ;
			}
		}
	}
	//-----------------------------------------------------------
	// ウィンドウのサイズ変更イベント
	function Resize( event )
	{
		sb_hi = document.getElementById('statusArea').offsetHeight ;
		statusArea
		framelist.style.top = '0px' ;
		framelist.style.height = ( window.innerHeight - sb_hi - 2 ) + 'px' ;
	}
	function FrameTextRead( readtext, endedProc )
	{
		if( typeof readtext == 'string' && 0 < readtext.length )
		{
			var cThis = DnsAnimationEditor.instance ;
			// 音声URLを作成します。
			var docId = window.opener.MessageManager.getDocumentInfo().docId;
			var audioUrl = Communicator.getUrl('audioTest') + '?text=' + readtext + '&docid=' + docId;
			console.log('Audio.src: ' + audioUrl);

			cThis.audio.onended = function ()
			{
				cThis.audio.pause() ;
				if( endedProc != undefined )
				{
					endedProc() ;
				}
			}
			cThis.audio.onloadedmetadata= function ()
			{
				cThis.audio.play() ;
			}
			cThis.audio.onerror = function ()
			{
				alert(errorMessage.audio_error) ;
			}
			// AUDIO要素のsrcにurlを設定し、再生を開始
			cThis.audio.src = audioUrl ;
		}
	}
	//-----------------------------------------------------------
	// フレームリストでのキー押下イベント
	function KeyDown( event )
	{
		switch( event.keyCode )
		{
			case 116 :
				event.keyCode = null ;
				break ;
			case 38 : // ↑カーソル上移動
				SetSel( GetSel()-1 ) ;
				break ;
			case 40 : // ↓カーソル下移動
				SetSel( GetSel()+1 ) ;
				break ;
			case 33 : // ページアップ
				break ;
			case 34 : // ページダウン
				break ;
			case 36 : // HOMEキー
				break ;
			case 35 : // ENDキー
				break ;
			default :
				return true ;
		}
		event.preventDefault() ;
		return false ;
	}
	// フレームリストでのフォーカスの変化
	function ListFocus( event )
	{
		bFrameListFocus = ( event.type == "focus" ) ? true : false ;
		framelist_table.className = bFrameListFocus ? "focus" : "" ;
	}
	// フレームアイテムのクリックイベント
	function FrameClick( event )
	{
		var cThis = DnsAnimationEditor.instance ;
		if( bFrameListFocus == false )
		{
			framelist_table.focus() ;
			bFrameListFocus = true ;
			framelist_table.className = "focus" ;
		}

		var item = event.target ;
		while( item != null && item.tagName != 'TR' )
		{
			item = item.parentElement ;
		}
		if( item.className != 'selected' )
		{
			for( tr = framelist_tbody.firstElementChild ; tr != null ; tr = tr.nextElementSibling )
			{
				tr.className = '' ;
			}
			if( item != null )
			{
				SetSel( item ) ;
				CmdReadTest() ;
				//TextReadTest( cThis.cReadText.value, cThis.btnReadTest ) ;
			}
		}
	}
	// フレームアイテムのダブルクリックイベント
	function FrameDblClick( event )
	{
		if( selected != null )
		{
			EditMasking() ;
		}
	}
	//-----------------------------------------------------------
	// ボタンイベント:テスト再生実行
	function CmdPlay( event )
	{
		var cThis = DnsAnimationEditor.instance ;
		// フレームに読み上げテキストが設定されているかチェックする
		if( IsSafeFrames() == false )
		{
			// 読み上げテキストが不足している場合は、再生を実行しない
			CancelEvenet( event ) ;
			return false ;
		}

		cThis.AnimationPlay.Start( cThis ) ;
		return ;

		var srcImage = GetFrameImage( 0 ) ;

		if( srcImage != null )
		{
			var overlapArea = document.createElement('table') ;
			var infoText    = null ;
			var playImage   = null ;
			var playAudio   = null ;
			var playIndex   = 0 ;
			var siClient    = { cx:document.body.clientWidth, cy:document.body.clientHeight - 50 } ;
			var siImage     = { cx:srcImage.naturalWidth,     cy:srcImage.naturalHeight } ;
			overlapArea.className = 'amination_play_area' ;
			overlapArea.innerHTML = '<tbody><tr><td><p>&nbsp;</p><br/><!-- </td></tr><tr><td> --><img playmode="play"/><audio></audio><br/><!-- </td></tr><tr><td> -->' + 
				'<span class="amination_play_cmd" id="amination_play_cmd_stop" >a</span>' +
				'&nbsp;&nbsp;' +
				'<span class="amination_play_cmd" id="amination_play_cmd_back" >e</span>' +
				'<span class="amination_play_cmd" id="amination_play_cmd_pause">b</span>' +
				'<span class="amination_play_cmd" id="amination_play_cmd_play" >c</span>' +
				'<span class="amination_play_cmd" id="amination_play_cmd_next" >d</span>' +
				'<span class="amination_play_cmd" id="amination_play_cmd_close">f</span>' +
				'</td></tr></tbody>' ;
			document.body.appendChild( overlapArea ) ;
			var playCmdStop     = document.getElementById('amination_play_cmd_stop') ;
			var playCmdNext     = document.getElementById('amination_play_cmd_next') ;
			var playCmdPause    = document.getElementById('amination_play_cmd_pause') ;
			var playCmdPlay     = document.getElementById('amination_play_cmd_play') ;
			var playCmdBack     = document.getElementById('amination_play_cmd_back') ;
			var playCmdClose    = document.getElementById('amination_play_cmd_close') ;

			if( cThis.audio.paused == false )
			{
				cThis.audio.pause() ;
			}

			infoText  = overlapArea.getElementsByTagName('P').item(0) ; 
			playImage = overlapArea.getElementsByTagName('IMG').item(0) ; 
			playAudio = overlapArea.getElementsByTagName('AUDIO').item(0) ; 

			infoText.style.width = infoText.style.minWidth = infoText.style.maxWidth =  parseInt(  siClient.cx * 0.8 ) + 'px' ;

			if( (siImage.cx/siClient.cx) < (siImage.cy/siClient.cy) )
			{
				playImage.style.height  = parseInt(  siClient.cy * 0.8 ) + 'px' ;
				playImage.style.width   = parseInt( (siClient.cy * 0.8 ) * (siImage.cx/siImage.cy) ) + 'px' ;
			}
			else
			{
				playImage.style.width  = parseInt(  siClient.cx * 0.8 ) + 'px' ;
				playImage.style.height = parseInt( (siClient.cx * 0.8 ) * (siImage.cy/siImage.cx) ) + 'px' ;
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// 閉じるボタン
			playCmdClose.onclick = function ()
			{
				if( playAudio.paused == false )
				{
					playAudio.pause() ;
				}
				document.body.removeChild( overlapArea ) ;
				overlapArea.innerHTML = '' ;
				overlapArea     = null ;
				infoText        = null ;
				playImage       = null ;
				playAudio       = null ;
				playIndex       = 0 ;
				playCmdStop     = null ;
				playCmdNext     = null ;
				playCmdPause    = null ;
				playCmdPlay     = null ;
				playCmdBack     = null ;
				playCmdClose    = null ;
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// 停止ボタン
			playCmdStop.onclick = function ()
			{
				playIndex = 0 ;
				if( (srcImage = GetFrameImage( playIndex )) != null )
				{
					playCmdPlay.style.display = '' ;
					playCmdPause.style.display = 'none' ;
					playImage.attributes.getNamedItem('playmode').value = 'stop' ;
					playImage.src = srcImage.src ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// ポーズボタン
			playCmdPause.onclick = function ()
			{
				if( playAudio.paused == false )
				{
					playAudio.pause() ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// 前のフレームボタン
			playCmdBack.onclick = function ()
			{
				if( (srcImage = GetFrameImage( --playIndex )) != null )
				{
					playImage.src = srcImage.src ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// 次のフレームボタン
			playCmdNext.onclick = function ()
			{
				if( (srcImage = GetFrameImage( ++playIndex )) != null )
				{
					playImage.src = srcImage.src ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			document.getElementById('amination_play_cmd_play').onclick = function ()
			{
				if( playAudio.paused != false )
				{
					playAudio.play() ;
				}
			}

			// 画像がロードされた時のイベント
			playImage.onload = function()
			{
				// フレームのテキストを取得して、音声再生CGIを呼び出す
				// ※実際はフロントサーバーの命令を実行する
				var readText = GetFrameText( playIndex ) ;
				SetSel( playIndex ) ;
				infoText.textContent = 'Frame ' + ( playIndex + 1 ) + '/' + ( framelist_tbody.childElementCount ) + '「' + readText + '」' ; 
				var docId = window.opener.MessageManager.getDocumentInfo().docId;
				var audioUrl = Communicator.getUrl('audioTest') + '?text=' + readText + '&docid=' + docId;
				playAudio.src = audioUrl ;

				setTimeout( function()
				{
					// 音声ファイルが無音の場合、Firefoxでは再生に失敗する
					// ので、再生開始後0.5秒後に音声の無効判定を行い、次の
					// フレーム再生に移行する
					if( playAudio != null && isNaN(playAudio.duration) )
					{
						if( (srcImage = GetFrameImage( ++playIndex )) != null )
						{
							playImage.src = srcImage.src ;
						}
					}
				}, 500 ) ;
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// フレームの音声再生開始イベント
			playAudio.onloadedmetadata = function ()
			{
				if( playImage.attributes.getNamedItem('playmode') != null && playImage.attributes.getNamedItem('playmode').value == 'stop' )
				{
					playImage.attributes.getNamedItem('playmode' ).value = 'play' ;
				}
				else
				{
					playAudio.play() ;
				}
				//playAudio.play() ;                
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// フレームの音声再生開始イベント
			playAudio.onplay = function ()
			{
				if( playCmdPlay != null && playCmdPause != null )
				{
					playCmdPlay.style.display = 'none' ;
					playCmdPause.style.display = '' ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// フレームの音声一時停止イベント
			playAudio.onpause = function ()
			{
				if( playCmdPlay != null && playCmdPause != null )
				{
					playCmdPlay.style.display = '' ;
					playCmdPause.style.display = 'none' ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// フレームの音声再生終了イベント
			playAudio.onended = function ()
			{
				playCmdPlay.style.display = '' ;
				playCmdPause.style.display = 'none' ;
				if( (srcImage = GetFrameImage( ++playIndex )) != null )
				{
					playImage.src = srcImage.src ;
				}
				else
				{
					playCmdClose.click() ;
				}
			}
			// - - - - - - - - - - - - - - - - - - - - - - - - - 
			// 最初のフレーム画像をセットして再生開始
			// ※実際は、playImageのonloadが再生のトリガとなる。
			playImage.src = srcImage.src ;
		}
		return true ;
	}
	//-----------------------------------------------------------
	// ボタンイベント:ENTERキーの押下
	function CmdEnter( event )
	{
		var cThis = DnsAnimationEditor.instance ;

		if( IsSafeFrames() == false )
		{
			// 読み上げテキストが設定されていないなどのエラーがある
			CancelEvenet( event ) ;
			return false ;
		}
		
		var frames = framelist_tbody.getElementsByTagName("TR") ;
		var firstImage = null ;
		var firstText  = null ;
		var documentID  = window.opener.MessageManager.getDocumentInfo().docId ;
		var imageID     = params['imageId'] ;
		var animationID = params['animeId'] ;
		var callData = {
			doc_id      : documentID,
			animation_id: animationID
		} ;

		for( f = 0 ; f < frames.length ; f++ )
		{
			var frame = frames[f] ;
			var image = frame.getElementsByTagName("IMG")[0] ;
			var rtext = image.attributes.getNamedItem('read_text').value ;
			
			img = document.createElement("img") ;
			srcIanimation.appendChild( img ) ;
			srcIanimation.appendChild( document.createTextNode("\n") ) ;
			img.setAttribute( 'read_text', rtext ) ;
			img.setAttribute( 'src',       image.src ) ;
			if( f == 0 )
			{
				firstImage = image.src ;
				firstText  = rtext ;
			}
		}

		if( 1 < frames.length )
		{
			// 複数のフレームが存在するのでアニメーションとしてサーバーに登録
			callURL = 'animeSave' ;
			callData.content = srcIanimation.outerHTML ;
		}
		else
		{
			// フレーム数が１か０の場合はアニメーションをサーバーから削除
			// アニメーションを新規作成した場合は、コンテンツサーバとの通信を行わない
			// ため、callURLを''(空白)に設定する。
			callURL = cThis.bCreateNew ? '' : 'animeDelete' ;
			// 2016.06.29
			// 画像の削除の場合は、animationIDをnullに指定するように変更
			animationID = null ;
		}

		cThis.btnCmdEnter.disabled = true ;
		if( callURL != '' )
		{
			Communicator.request(callURL, callData, 
				function( res )
				{
					window.opener.MessageManager.updateThumnail( imageID, animationID, firstImage, firstText ) ;
					window.close() ;
				},
				function( error )
				{
					var errText = errorMessage['error_' + error.error_code] ;
					if( errText == undefined )
					{
						errText = errorMessage.error_unknown ;
					}
					// 2016.06.29
					// アニメーションの保存に失敗した場合の処理を修正
					// エラーメッセージを表示した後、画面を閉じないように変更
					alert( "アニメーションの保存に失敗しました。\n-------------------------------\n" + errText + '(Error=' + error.error_code + ')' ) ;
					cThis.btnCmdEnter.disabled = false ;
					//window.opener.MessageManager.updateThumnail( imageID, animationID, firstImage, firstText ) ;
					//window.close() ;
				}
			) ;
		}
		else
		{
			window.opener.MessageManager.updateThumnail( imageID, animationID, firstImage, firstText ) ;
			window.close() ;
		}
		return ;
	}
	//-----------------------------------------------------------
	// ボタンイベント:キャンセルキーの押下
	function CmdCancel( event )
	{
		var cThis = DnsAnimationEditor.instance ;
		if( cThis.btnCmdEnter.disabled == false )
		{
			DnsMessageBox( 'アニメーションが変更されています。\nキャンセルを実行すると変更は保存されません。', '確認', '実行;キャンセルしない',
			function()
			{
				// 保存せずに終了
				cThis.btnCmdEnter.disabled = true ;
				window.close() ;
			},
			function()
			{
				// キャンセル
			}
			) ;
		}
		else
		{
			window.close() ;
		}
	}
	function OnBeforeUnload( event )
	{
		var cThis = DnsAnimationEditor.instance ;
		if( cThis.btnCmdEnter.disabled == false )
		{
			return "編集の情報は保存されません。" ;
		}
		DnsRemoveEventProc( window, 'beforeunload', OnBeforeUnload ) ;
		window.onbeforeunload = null ;
		return ;
	}
	//-----------------------------------------------------------
	// ボタンイベント:読み上げキーの押下
	function CmdReadTest( event )
	{
		var cThis = DnsAnimationEditor.instance ;

		if( cThis.audio.paused == false )
		{
			cThis.audio.pause() ;
		}

		if( 0 < cThis.cReadText.value.length )
		{
			cThis.btnReadTest.disabled = true ;
			AudioTools.prototype.TextToAudio( cThis.cReadText.value + "●", 
				function( data )
				{
					cThis.audio.onloadeddata = function ()
					{
						cThis.audio.play() ;
					}
					cThis.audio.onended = function ()
					{
						cThis.btnReadTest.disabled = false ;
					}
					cThis.audio.src = data ;
				},
				function( result )
				{
					cThis.btnReadTest.disabled = false ;
				}
			) ;
		}
	}
	function CmdContextMenu( event )
	{
		if( event.target.id == undefined || event.target.id != 'read_text' )
		{
			event.preventDefault() ;
			return false ;
		}
		else
		{
			return true ;
		}
	}
	//-----------------------------------------------------------
	// ボタンイベント:フレームのコピー
	function CmdEditCopy( event )
	{
		if( selected != null )
		{
			var newFrame = document.createElement('tbody') ;
			var newItem ;
			newFrame.innerHTML = selected.outerHTML ;
			newItem = newFrame.firstElementChild ;
			newItem.getIndex    = getFrameIndex ;
			newItem.getImage    = getFrameImage ;
			newItem.setReadText = setReadText ;
			newItem.getReadText = getReadText ;
			if( selected.nextElementSibling != null )
			{
				framelist_tbody.insertBefore( newItem, selected.nextElementSibling ) ;
			}
			else
			{
				framelist_tbody.appendChild( newItem ) ;
			}
			DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
			// フレームを追加してもフレームリストのサイズがリアルタイムに
			// 更新されないので、0.1秒後にリストを更新する。
			setTimeout( function (){
				SetFrameData() ;
				SetStatusInfo() ;
				SetSel( newItem ) ;
			}, 100 ) ;
		}
	}
	//-----------------------------------------------------------
	// ボタンイベント:フレームの削除
	function CmdEditDelete( event )
	{
		if( frames.length < 2 )
		{
			DnsMessageBox( errorMessage.frame_is_zero ) ;
			return ;
		}
		if( selected != null )
		{
			var selIndex = GetSel() ;
			selected.parentElement.removeChild( selected ) ;
			SetFrameData() ;
			SetStatusInfo() ;
			DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
			// フレームを追加してもフレームリストのサイズがリアルタイムに
			// 更新されないので、0.1秒後にリストを更新する。
			setTimeout( function ( event ){
				SetFrameData() ;
				SetStatusInfo() ;
				SetSel( ( 0 < selIndex ) ? ( selIndex-1 ) : 0 ) ;
			}, 100 ) ;
		}
	}
	//-----------------------------------------------------------
	// ボタンイベント:ファイルから追加
	function CmdFile( event )
	{
		var file = null ; // document.getElementById('edit_file_select') ;
		var fileSpan = document.getElementById('edit_file_span') ;
		var strInnrtHtml = fileSpan.innerHTML ;

		fileSpan.innerHTML = strInnrtHtml ;
		file = document.getElementById('edit_file_select') ;
		
		// ②ファイルの選択完了イベント
		file.onchange = function( event )
		{
			if( 0 < event.target.files.length )
			{            
				var file = event.target.files[0] ;
				AppendFile( file, GetSel() ) ;
			}
		} ;
		// ①ファイル選択の実行
		file.value = "" ;
		file.click() ;
	}
	function DragEnter( event )
	{
		//alert('DragEnter') ;
		CancelEvenet() ;
		return false ;
	}
	function DragOver( event )
	{
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}
	//-----------------------------------------------------------
	// ファイルドロップによる追加
	function DroppedFile( event )
	{
		event.stopPropagation();
		event.preventDefault();
		if( event.dataTransfer != undefined && 0 < event.dataTransfer.files.length )
		{            
			var file = event.dataTransfer.files.item(0) ;
			var insertPos = -1 ;
			var elem = null ;

			if( event.target.id == 'framelist' )
			{
				insertPos = framelist_tbody.getElementsByTagName('TR').length ;
			}
			else
			{
				if( event.target.tagName != "TR" )
				{
					elem = event.target ;
					while( elem != null && ( elem.tagName != "TR" || elem.getIndex == undefined ) )
					{
						elem = elem.parentElement ;
					}
				}
				if( elem != null && elem.tagName == 'TR' && elem.getIndex != undefined )
				{
					insertPos = elem.getIndex() ;
				}
				else if( selected != null && selected.getIndex != undefined )
				{
					insertPos = selected.getIndex() ;
				}
			}
			AppendFile( file, insertPos ) ;
		}
		CancelEvenet() ;
		return false ;
	}
	//-----------------------------------------------------------
	// ファイルドロップによる追加
	// file      = ファイルオブジェクト
	// insertPos = フレーム挿入位置(整数)
	//  ※無指定かインデックス範囲が有効でない場合は最後に追加する
	function AppendFile( file, insertPos )
	{
		if( file.type.match(/^image\//) == null )
		{
			// ファイルタイプが画像ではない
			return ;
		}
		fileReader = new FileReader() ;
 
		// ②ファイルの読み込みが完了
		fileReader.onload = function(event)
		{
			var imgTemp = document.createElement("img") ;
			
			// 一時的な<IMG>を作成して、onload後に画像サイズを取得する
			imgTemp.src = event.target.result ;
			imgTemp.onload = function ()
			{            
				//var data = event.target.result ;

				if( framelist_tbody.getElementsByTagName('TR').length == 0 )
				{
					imageSize.cx = imgTemp.naturalWidth ;
					imageSize.cy = imgTemp.naturalHeight ;
					CalcDispSize( imgTemp ) ;
				}

				if( imgTemp.naturalWidth != imageSize.cx || imgTemp.naturalHeight != imageSize.cy )
				{   // 現在のフレーム画像サイズと、新しい画像のサイズか異なる場合は
					// リサイズダイアログを呼び出してサイズ調整を行う
					ShowResizeImageDialog( imgTemp.src, function ( newImageSource ){
						tr = CreateFrame( newImageSource, insertPos+1 ) ;
						setTimeout( function (){
							DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
							SetFrameData() ;
							SetStatusInfo() ;
							SetSel( tr ) ;
							imgTemp.src = '' ;
						}, 100 ) ; }
					) ;
				}
				else
				{   // 現在のフレーム画像サイズと新しい画像のサイズか同じ場合は
					// そのまま新しいフレームとして追加する
					tr = CreateFrame( event.target.result, insertPos+1 ) ;
					setTimeout( function (){
						DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
						SetFrameData() ;
						SetStatusInfo() ;
						SetSel( tr ) ;
						imgTemp.src = '' ;
					}, 100 ) ;
				}
			}
		} ;
		// ①FileAPIを使って読み込みを実行
		fileReader.readAsDataURL(file);
	}
	//-----------------------------------------------------------
	// ボタンイベント:クリップボードから追加
	function CmdClipbord( event )
	{
		// この機能は未使用
	}
	//-----------------------------------------------------------
	// ボタンイベント:フレームを上に移動
	function CmdMoveUp( event )
	{
		if( selected != null && selected.previousElementSibling != null )
		{
			var prev = selected.previousElementSibling ;
			framelist_tbody.removeChild( selected ) ;
			framelist_tbody.insertBefore( selected, prev ) ;
			DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
			SetFrameData() ;
			SetStatusInfo() ;
			SetSel( GetSel() ) ;
		}
	}
	//-----------------------------------------------------------
	// ボタンイベント:フレームを下に移動
	function CmdMoveDown( event )
	{
		if( selected != null && selected.nextElementSibling != null )
		{
			var next = selected.nextElementSibling.nextElementSibling ;
			framelist_tbody.removeChild( selected ) ;
			if( next != null )
			{
				framelist_tbody.insertBefore( selected, next ) ;
			}
			else
			{
				framelist_tbody.appendChild( selected ) ;
			}
			SetFrameData() ;
			SetStatusInfo() ;
			DnsAnimationEditor.instance.btnCmdEnter.disabled = false ;
			setTimeout( function ( event ){
				SetSel( GetSel() ) ;
			}, 100 ) ;
			//SetSel( GetSel() ) ;
		}
	}
	//-----------------------------------------------------------
	// ボタンイベント:マスキングツールを実行
	function EditMasking( event )
	{
		var cThis = DnsAnimationEditor.instance ;
		if( cThis.audio.paused == false )
		{
			// 再生中の場合は停止する
			cThis.audio.pause() ;
		}
		if( maskingtool == null )
		{
			overlap = document.createElement('div') ;
			overlap.className = 'animatin_overlap_area' ;
			document.body.appendChild( overlap ) ;
			maskingtool = window.open('./maskingtool.html','maskingtool', 'width=800, height=480, menubar=no, toolbar=no, scrollbars=no, resizable=yes, location=no');
			maskingtool.width  = 800 ;
			maskingtool.height = 480 ;
			maskingtool.name = 'maskingtool' ;
			maskingtool.focus() ;

			// イベント処理設定
			// アニメーション編集画面がアクティブになったら
			// オーバーラップエリアのonclickを呼び出す
			// ※マスキングツールをアクティブにするため。
			window.onfocus = function ()
			{
				overlap.click() ;
			}
			// アニメーション編集画面が閉じられるときにマスキ
			// ングツールが表示されていれば、強制的に閉じる。
			window.onbeforeunload = function ()
			{                
				if( maskingtool != null )
				{
					maskingtool.close() ;
				}
			}
			// オーバーラップエリアでのマウスボタン押下処理
			// 強制的にマスキングツールをアクティブにする。
			overlap.onclick = function ()
			{
				if( maskingtool != null )
				{
					// タイミングを考慮して、0.1秒後に
					// マスキングツールをアクティブにする。
					setTimeout( function ()
					{
						maskingtool.focus() ;
					}, 100 ) ;
				}
			}
		}
		else
		{
			// ※マスキングツール表示中はオーバーラップエリア
			//   が表示されているので、ここには来ないはず。
			maskingtool.focus() ;
		}
	}
	//-----------------------------------------------------------
	// ペイントツールで開くコマンドボタン
	function EditPaint( event )
	{
		// この機能は未使用
	}
	//-----------------------------------------------------------
	// 読み上げテキストでのキー押下イベント
	function ReadTextKeyDown        ( event )
	{
		if( selected != null && ( event.keyCode == 0x0D || event.keyCode == "\t" ) )
		{
			var cThis = DnsAnimationEditor.instance ;
			selected.setReadText( cThis.cReadText.value ) ;
		}
	}
	//-----------------------------------------------------------
	// 読み上げテキストでのキー開放イベント
	function ReadTextKeyUp( event )
	{
		var cThis = DnsAnimationEditor.instance ;

		if( selected != null && selected.getReadText() != cThis.cReadText.value )
		{
			cThis.btnCmdEnter.disabled = false ;
			selected.setReadText( cThis.cReadText.value ) ;
		}
	}
	//-----------------------------------------------------------
	// 全てのフレームに読み上げテキストが設定されているかチェックする
	function IsSafeFrames()
	{
		var items = framelist_tbody.getElementsByTagName("TR") ;
		for( var i = 0 ; i < items.length ; i++ )
		{
			var image = items.item(i).getElementsByTagName("IMG")[0] ;
			var rtext = image.attributes.getNamedItem('read_text') ;
			if( rtext == null || rtext.textContent == undefined || typeof rtext.textContent != 'string' || rtext.textContent.length == 0 )
			{
				msgbox = new DnsMessageBox( itemLabels['message_frame_notext']['caption'] ) ;
				SetSel( i ) ;
				return false ;
			}
		}
	}
	//-----------------------------------------------------------
	// フレームのインデックスを取得する
	// TR要素のカスタムメソッド
	function getFrameIndex()
	{
		var nResult = -1 ;
		if( this.tagName == 'TR' && 0 < this.getElementsByClassName( 'frametext' ).length )
		{
			for( var tr = this ; tr != null && tr.tagName == 'TR' ; tr = tr.previousElementSibling )
			{
				nResult++ ;
			}    
		}
		return nResult ;
	}
	//-----------------------------------------------------------
	// フレームの画像<IMG>を取得する
	// TR要素のカスタムメソッド
	function getFrameImage()
	{
		var nResult = -1 ;
		if( this.tagName == 'TR' )
		{
			var image = this.getElementsByTagName("IMG")[0] ;
			if( image != null )
			{
				return image ;
			}
		}
		return null ;
	}
	//-----------------------------------------------------------
	// フレームのテキストを設定する
	// TR要素のカスタムメソッド
	function setReadText( newText )
	{
		if( this.tagName == 'TR' )
		{
			var texts = this.getElementsByClassName( 'frametext' ) ;
			if( 0 < texts.length )
			{
				caption = texts.item(0) ;
				image = this.getElementsByTagName('img').item(0) ;

				if( newText == undefined )
				{
					newText = image.attributes.getNamedItem('read_text') ;
					if( newText != null )
					{
						newText = newText.value ;
					}
					else
					{
						newText = '' ;
					}
				}
				if( typeof newText == 'string' && 0 < newText.length )
				{
					image.setAttribute( 'read_text', newText ) ;
					rtext = '「' +  newText + '」' ;
				}
				else
				{
					image.setAttribute( 'read_text', '' ) ;
					rtext = '<span style="color:red;font-weight:bold;">' + itemLabels['message_frame_notext'].tooltip + '</span>' ;
				}
				caption.innerHTML = '#' + ( 100000 + this.getIndex() + 1 ).toString().substr(4,2) + rtext ;
				return true ;
			}
		}
		return false ;
	}
	//-----------------------------------------------------------
	// フレームのテキストを取得する
	// TR要素のカスタムメソッド
	function getReadText()
	{
		if( this.tagName == 'TR' )
		{
			var image = this.getElementsByTagName('img').item(0) ;
			if( image != undefined && image != null )
			{
				var readText = image.attributes.getNamedItem('read_text') ;
				if( readText != null )
				{
					return readText.value ;
				}
			}
		}
		return "" ;
	}
	//-----------------------------------------------------------
	// 追加画像のリサイズ設定ダイアログ処理
	function ShowResizeImageDialog( source, callFunc )
	{
		var overlapArea = document.getElementById('resize_image_area') ;
		var resizeImageSource = document.getElementById('resize_image_source') ;
		var resizeImage = document.getElementById('resize_image_dialog') ;
		var resizeImageTypes = resizeImage.getElementsByClassName('resize_image_type') ;
		var aspect = imageSize.cx / imageSize.cy ;
		var thumbSize = { cx: ( 1 < aspect ) ? 120 : parseInt(120/aspect) , cy: ( 1 > aspect ) ? 120 : parseInt(120/aspect) } ;

		for( var i = 0 ; i < resizeImageTypes.length ; i++ )
		{
			var item  = resizeImageTypes[i] ;
			var thumb = document.getElementById(item.id + '_thumb') ;
			if( thumb == null )
			{
				thumb = document.createElement('img') ;
				thumb.className = 'resize_image_thumb' ;
				thumb.id = item.id + '_thumb' ;
				thumb.title = item.title ;
				item.appendChild( thumb ) ;
				item.onclick = thumb.onclick = SelectResizeImage ;
			}
			thumb.style.width  = thumbSize.cx + 'px' ;
			thumb.style.height = thumbSize.cy + 'px' ;
		}
		
		overlapArea.style.display = '' ;

		document.getElementById('resize_image_color_area').style.backgroundColor = DnsGetSettingString( 'cio_resize_imagE_backcolor', '#888' ) ;
		
		overlapArea.resize = function ()
		{
			resizeImage.style.left = ( ( overlapArea.offsetWidth  - resizeImage.offsetWidth  ) / 2 ) + 'px' ;
			resizeImage.style.top  = ( ( overlapArea.offsetHeight - resizeImage.offsetHeight ) / 2 ) + 'px' ;
		}
		overlapArea.onresize = function ()
		{
			overlapArea.resize() ;
		}
		document.getElementById('resize_image_cancel').onclick = function ()
		{
			overlapArea.style.display = 'none' ;
		}
		document.getElementById('resize_image_close').onclick = function ()
		{
			overlapArea.style.display = 'none' ;
		}
		document.getElementById('resize_image_trim_option').onclick = function ()
		{
			ShowTrimImageDialog( SetButtonImages ) ;
		}
		document.getElementById('resize_image_color_area').onclick = function ( event )
		{
			event.stopPropagation();
			event.preventDefault();
			document.getElementById('resize_image_color_select').click() ;
		}        
		document.getElementById('resize_image_color_select').onclick = function ( event )
		{
			event.stopPropagation();
			event.preventDefault();
			DnsShowColorPicker( document.getElementById('resize_image_color_area'), function ( newColor )
			{
				document.getElementById('resize_image_color_area').style.backgroundColor = newColor ;
				DnsSetSettingValue( 'cio_resize_imagE_backcolor', newColor ) ;
				SetButtonImages() ;
			} ) ;
		}
		function SetButtonImages()
		{
			var thumb1 = document.getElementById('resize_image_type_1_thumb') ;
			var thumb2 = document.getElementById('resize_image_type_2_thumb') ;
			var thumb3 = document.getElementById('resize_image_type_3_thumb') ;
			var canvas = document.createElement('canvas') ;
			var context = canvas.getContext('2d') ;
			var pos = { x:0, y:0 } ;
			canvas.width = imageSize.cx ;
			canvas.height = imageSize.cy ;
			//--------------------------
			context.fillStyle = document.getElementById('resize_image_color_area').style.backgroundColor ;
			context.fillRect( 0, 0, imageSize.cx, imageSize.cy ) ;
			switch( parseInt( DnsGetSettingString( "cio_trim_image_horz", "2" ) ) )
			{
				case 1  : pos.x = 0   ; break ;
				case 3  : pos.x = imageSize.cx - resizeImageSource.naturalWidth ; break ;
				default : pos.x = (imageSize.cx - resizeImageSource.naturalWidth)/2 ; break ;
			}
			switch( parseInt( DnsGetSettingString( "cio_trim_image_vert", "2" ) ) )
			{
				case 1  : pos.y = 0 ; break ;
				case 3  : pos.y = imageSize.cy - resizeImageSource.naturalHeight ; break ;
				default : pos.y = (imageSize.cy - resizeImageSource.naturalHeight)/2 ; break ;
			}
			context.drawImage( resizeImageSource, pos.x, pos.y, resizeImageSource.naturalWidth, resizeImageSource.naturalHeight ) ; 
			thumb1.src = canvas.toDataURL() ;
			//--------------------------
			context.fillStyle = document.getElementById('resize_image_color_area').style.backgroundColor ;
			context.fillRect( 0, 0, imageSize.cx, imageSize.cy ) ;
			if( (imageSize.cx/imageSize.cy) < (resizeImageSource.naturalWidth/resizeImageSource.naturalHeight) )
			{
				pos.w = imageSize.cx ;
				pos.h = imageSize.cx / (resizeImageSource.naturalWidth/resizeImageSource.naturalHeight) ;
				pos.x = 0 ;
				pos.y = (imageSize.cy-pos.h)/2 ;
			}
			else
			{
				pos.h = imageSize.cy ;
				pos.w = imageSize.cy * (resizeImageSource.naturalWidth/resizeImageSource.naturalHeight) ;
				pos.y = 0 ;
				pos.x = (imageSize.cx-pos.w)/2 ;
			}
			context.drawImage( resizeImageSource, pos.x, pos.y, pos.w, pos.h ) ; 
			thumb2.src = canvas.toDataURL() ;
			//--------------------------
			context.drawImage( resizeImageSource, 0, 0, imageSize.cx, imageSize.cy ) ; 
			thumb3.src = canvas.toDataURL() ;
			//--------------------------
		}
		function SelectResizeImage( event ) 
		{
			event.stopPropagation();
			event.preventDefault();
			overlapArea.style.display = 'none' ;
			var item = event.target ;

			if( item.className == "resize_image_type" )
			{
				item = document.getElementById( item.id + '_thumb' ) ;
			}
			if( item.tagName == 'IMG' )
			{
				if( callFunc != undefined )
				{
					callFunc( item.src ) ;
				}
			}
			return ;
		}
		resizeImageSource.onload = function()
		{
			SetButtonImages() ;
		}
		resizeImageSource.src = source ;
		overlapArea.resize() ;
	}
	//-----------------------------------------------------------
	// トリミングオプションダイアログ処理
	function ShowTrimImageDialog( callfunc )
	{
		var overlapArea = document.getElementById('trim_image_area') ;
		var resizeImage = document.getElementById('trim_image_dialog') ;
		var radioHorz = null ;
		var radioVert = null ;
		overlapArea.style.display = '' ;

		switch( parseInt( DnsGetSettingString( "cio_trim_image_horz", "2" ) ) )
		{
			case 1  : radioHorz = document.getElementById('trim_horz_left')   ; break ;
			case 3  : radioHorz = document.getElementById('trim_horz_right')  ; break ;
			default : radioHorz = document.getElementById('trim_horz_center') ; break ;
		}
		switch( parseInt( DnsGetSettingString( "cio_trim_image_vert", "2" ) ) )
		{
			case 1  : radioVert = document.getElementById('trim_vert_top') ; break ;
			case 3  : radioVert = document.getElementById('trim_vert_bottom') ; break ;
			default : radioVert = document.getElementById('trim_vert_middle') ; break ;
		}
		overlapArea.resize = function ()
		{
			resizeImage.style.left = ( ( overlapArea.offsetWidth  - resizeImage.offsetWidth  ) / 2 ) + 'px' ;
			resizeImage.style.top  = ( ( overlapArea.offsetHeight - resizeImage.offsetHeight ) / 2 ) + 'px' ;
		}

		overlapArea.onresize = function ()
		{
			overlapArea.resize() ;
		}
		document.getElementById('trim_image_enter').onclick = function ()
		{
			var radioHorzs = document.getElementsByName('trim_horz') ;
			var radioVerts = document.getElementsByName('trim_vert') ;
			for( var i = 0 ; i < radioHorzs.length ; i++ )
			{
				if( radioHorzs[i].checked === true )
				{
					DnsSetSettingValue( "cio_trim_image_horz", i+1 ) ;
				}
			}
			for( var i = 0 ; i < radioVerts.length ; i++ )
			{
				if( radioVerts[i].checked === true )
				{
					DnsSetSettingValue( "cio_trim_image_vert", i+1 ) ;
				}
			}
			overlapArea.style.display = 'none' ;
			if( callfunc != undefined )
			{
				callfunc() ;
			}
		}
		document.getElementById('trim_image_cancel').onclick = function ()
		{
			overlapArea.style.display = 'none' ;
		}
		document.getElementById('trim_image_close').onclick = function ()
		{
			overlapArea.style.display = 'none' ;
		}
		overlapArea.onkeydown = function( event )
		{
			if( event.keyCode == 13 )
			{
				event.stopPropagation();
				event.preventDefault();
				document.getElementById('trim_image_enter').click() ;
			}
		}
		overlapArea.resize() ;
		radioHorz.checked = true ;
		radioVert.checked = true ;
		radioHorz.focus() ;
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

DnsAnimationEditor.instance = null ;

//===========================================================

// 選択中の画像を取得する(マスキングツールからの要求用)
DnsAnimationEditor.prototype.GetSelectedImage = function ()
{
	if( selected != null )
	{
		td = selected.getElementsByTagName('td').item(1) ;
		image = td.getElementsByTagName('img').item(0) ;
		return image ;
	}
	return null ;
}
// マスキングツールを閉じる(削除)処理
DnsAnimationEditor.prototype.MaskingToolClose = function ()
{
	if( maskingtool != null )
	{
		overlap.parentElement.removeChild( overlap ) ;
		overlap = null ;
		window.onfocus = null ;
		window.onbeforeunload = null ;
		maskingtool.close() ;
		maskingtool = null ;
	}
}

window.addEventListener("message", receiveMessage, false) ;

function receiveMessage( event )
{
	var data = window.JSON.parse(event.data) ;
	if( data.method === 'close' )
	{
		DnsAnimationEditor.instance.btnCmdEnter.disabled = true ;
		window.close() ;
	}
}
