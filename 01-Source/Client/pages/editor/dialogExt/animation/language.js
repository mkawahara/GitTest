function SetCaptionLanguage( itemLabels )
{
    //-----------------------------------------------------
    // 各要素のラベルを設定する
    if( itemLabels !== null && itemLabels !== undefined )
    {
        for (var key in itemLabels )
        {
            var elem = document.getElementById(key) ;
            var item = itemLabels[key] ;
            if( elem != null && item != undefined )
            {
                if( item.caption != undefined && 0 < item.caption.length )
                {
                    switch( elem.tagName )
                    {
                        case 'INPUT' :
                            elem.value = item.caption  ;
                            if( elem.type == "radio" )
                            {
                                var label = elem.nextElementSibling ; 
                                if( label != null && label.tagName == 'LABEL' )
                                {
                                    label.innerHTML = item.caption  ;
                                }
                            }
                            break ;
                        case 'FIELDSET' :
                            legends = elem.getElementsByTagName('LEGEND') ;
                            if( legends != null && 0 < legends.length )
                            {
                                legends[0].innerHTML = item.caption  ;
                            }
                            break ;
                        default:
                            elem.innerHTML = item.caption  ;
                            break ;
                    }
                }
                if( item.tooltip != undefined && 0 < item.tooltip.length )
                {
                    elem.title = item.tooltip ;
                }
            }
        }
    }
}
