var dicMenu = [
    {
        caption: 'ファイル',
        submenu: [
            { id: 'mi_aud_save',      caption: '保存' },
            /*{ id: 'mi_aud_export',    caption: 'エクスポート' },*/
            { separator: 1 },
            { id: 'mi_close',         caption: '閉じる' },
        ]
    },
    {
        caption: '編集',
        submenu: [
            { id: 'mi_aud_append',    caption: 'アイテムを追加' },
            { id: 'mi_aud_delete',    caption: 'アイテムを削除' },
            { id: 'mi_aud_speak',     caption: '発声テスト' }
        ]
    },
    /*{
        caption: 'ソート',
        submenu: [
            { id: 'mi_udic_sort_word_asc',    caption: '単語(昇順)'},
            { id: 'mi_udic_sort_word_desc',   caption: '単語(降順)' },
            { id: 'mi_udic_sort_yomi_asc',    caption: '読み(昇順)'},
            { id: 'mi_udic_sort_yomi_desc',   caption: '読み(降順)' }
        ]
    },*/
    {
        caption: '設定',
        submenu: [
            { id: 'mi_aud_edit_mode',     caption: '編集機能' },
            { id: 'mi_aud_auto_read',     caption: 'リストを読み上げる' },
            { id: 'mi_aud_auto_update',   caption: 'アイテムの自動更新' },
            { id: 'mi_aud_show_control',  caption: '特殊文字を表示する' }
        ]
    }
] ;
