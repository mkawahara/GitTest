// +--------------------------------------------------------------------------+
// |                           ChattyInfty-Online                             |
// |                         株式会社デジタルノーツ                           |
// +--------------------------------------------------------------------------+
// |  ファイル名 ： sound.js                                                  |
// |  概要       ： 読み上げテスト(フロントサーバー経由)                      |
// |  開発環境   ： Wiondows 8.1 64bit / VisualStudio2013                     |
// |  ブラウザ   ： InternetExplorer 11                                       |
// |                Mozira Firefox 40.0.3                                     |
// |                Google Chrome 44.0.2403.157 (64-bit)                      |
// |  担当       ： 濱田 謙二                                                 |
// +--------------------------------------------------------------------------+
var AudioTools = function()
{
}
AudioTools.prototype.TextToAudio = function ( text, successProc, errorProc )
{
    var ajaxData = 
    {
        method : "POST",
        cache  : false,
        url     : Communicator.instance.appRoot + Communicator.instance.urlList['audioTest'],
        data    : {
                    text            : text,
                    doc_id          : window.opener.MessageManager.getDocumentInfo().docId,
                    dictionary      : "",
                    voice_setting   : ""
                  },
        success: function(data, status, xhr)
        {
            if( successProc != undefined )
            {
                successProc( "data:audio/mp3;base64,"+ window.btoa(data) ) ;
            }
        },
        error: function(jqXHR, textStatus, error)
        {
	        console.log("sound.js ajax error\n" + ajaxData.url + "\n" + JSON.stringify(jqXHR) ) ;
            if( errorProc != undefined )
            {
                var infoText = "url=" + ajaxData.url + "\n" ;
                for( var n in ajaxData.data )
                {
                    infoText += "data." + n + " = \"" + ajaxData.data[n] + "\"\n" ;
                }
                errorProc( jqXHR, infoText ) ;
            }
        },
        beforeSend: function(xhr)
        {
            xhr.overrideMimeType("text/plain; charset=x-user-defined") ;
        },
        dataType : 'binary',
        converters :
        {
            "* binary": function(response)
            {
                var result = '';
                for(var i = 0 ; i < response.length ; i++ )
                {
                    result += String.fromCharCode( response.charCodeAt(i) & 0xff );
                }
                return result ;
            }
        }
    } ;
    $.ajax( ajaxData ) ;
}
AudioTools.prototype.GetReadText = function ( text, successProc, errorProc )
{
    var ajaxData = 
    {
        method : "POST",
		dataType:'json',
        cache  : false,
        url    : Communicator.instance.appRoot + Communicator.instance.urlList['readText'],
        data   : { text : text },
        success: function(data, status, xhr)
        {
            if( successProc != undefined )
            {
                if( data.error_code != undefined && data.error_code == 0 && data.readtext != undefined )
                {
					successProc( data.readtext ) ;
                }
                else
                {
                    errorProc( data ) ;
                }
            }
        },
        error: function(jqXHR, textStatus, error)
        {
	        console.log("sound.js ajax error\n" + ajaxData.url + "\n" + JSON.stringify(jqXHR) ) ;
            if( errorProc != undefined )
            {
                var infoText = "url=" + ajaxData.url + "\n" + JSON.stringify(ajaxData.data) + "\n" + JSON.stringify(jqXHR) + "\n" ;
                errorProc( jqXHR, infoText ) ;
            }
        }
    } ;
    $.ajax( ajaxData ) ;
}
