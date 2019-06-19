var itemLabels={
    gp_read_area_label:
    {
        caption: "読み上げテキスト(<u>T</u>)"
    },
    gp_edit_area_label:
    {
        caption: "編集操作(<u>E</u>)"
    },
    read_text:
    {
        tooltip: "選択中のフレームの読み上げテキストを設定します。"
    },
    read_test:
    {
        tooltip: "読み上げテキストを音声で読み上げます。"
    },
    edit_copy:
    {
        caption: "フレームのコピー",
        tooltip: "選択中のフレームを複製します。\nコピーされたフレームは下に追加されます。"
    },
    edit_delete:
    {
        caption: "フレームを削除",
        tooltip: "選択中のフレームを削除します。"
    },
    edit_file:
    {
        caption: "ファイルから挿入",
        tooltip: "ファイルから新しいフレームを追加します。"
    },
    edit_clipbord:
    {
        caption: "クリップボードから挿入",
        tooltip: "クリップボードに保存されている画像を\n新しいフレームとして取り込みます。"
    },
    edit_moveup:
    {
        caption: "▲上に移動",
        tooltip: ""
    },
    edit_movedown:
    {
        caption: "▼下に移動",
        tooltip: ""
    },
    edit_masking:
    {
        caption: "マスキングツール",
        tooltip: "フレーム画像に四角や丸などの\n簡単な模様を描き込みます。"
    },
    edit_paint:
    {
        caption: "ペイントツールで開",
        tooltip: ""
    },
    cmd_play:
    {
        caption: "再生テスト",
        tooltip: "編集中のアニメーションの再生テストを実行します。\n読み上げテキストは全て設定してください。"
    },
    cmd_enter:
    {
        caption: "決定",
        tooltip: "アニメーション編集の内容を保存して\nこの画面を終了します。"
    },
    cmd_cancel:
    {
        caption: "キャンセル",
        tooltip: "アニメーション編集の内容を保存せずに\nこの画面を終了します。"
    },
    status_frame_total:
    {
        caption: "トータル "
    },
    status_frame_pos:
    {
        caption: "選択中"
    },
    message_frame_notext:
    {
        caption: "読み上げテキストが設定されていないフレームがあります。\nテキストを設定してください。",
        tooltip: "テキスト無し"
    },
    //-----------------------------------------------------------
    // 画像サイズの選択ダイアログの定義
    resize_image_caption:
    {
        caption: "画像サイズの選択"
    },
    resize_image_info:
    {
        caption: "追加する画像の取り込みサイズを選択してください"
    },
    resize_image_type_1:
    {
        caption: "トリミング",
        tooltip: "フレームに収まらない部分をカットして新しいフレームとして挿入します。\nフレーム画像より小さい場合は余白を背景色で塗りつぶします。"
    },
    resize_image_type_2:
    {
        caption: "リサイズ(フィット)",
        tooltip: "画像をフレームに収まるように縮小して挿入します。\n画像の縦横比は保持され、余白がある場合は背景色で塗りつぶします。"
    },
    resize_image_type_3:
    {
        caption: "リサイズ(ストレッチ)",
        tooltip: "画像をフレームに収まるように縮小して挿入します。\n画像の縦横はフレームに収まるように拡大や縮小します。"
    },
    resize_image_trim_option:
    {
        caption: "トリミングオプション",
        tooltip: "画像をフレームに配置するための基準点を設定します。"
    },
    resize_image_color_select:
    {
        caption: "背景色の変更",
        tooltip: "トリミングやリサイズ(フィット)で発生する余白の色を選択します。"
    },
    resize_image_cancel:
    {
        caption: "キャンセル",
        tooltip: "画像のリサイズ操作を中止します。\n画像は挿入されません。"
    },
    info_image_size:
    {
        caption: "画像サイズ "
    },
    info_image_width:
    {
        caption: "幅"
    },
    info_image_height:
    {
        caption: "高さ"
    },
    //-----------------------------------------------------------
    // トリミング位置オプションダイアログの定義
    trim_image_caption:
    {
        caption: "画像サイズの選択"
    },
    trim_horz_group_label:
    {
        caption: "横位置"
    },
    trim_horz_left:
    {
        caption: "左",
        tooltip: "画像の左端をフレームの左端に合わせます。"
    },
    trim_horz_center:
    {
        caption: "中央",
        tooltip: "画像の左右中央をフレームの左右中央に合わせます。"
    },
    trim_horz_right:
    {
        caption: "右",
        tooltip: "画像の右端をフレームの右端に合わせます。"
    },
    trim_vert_group_label:
    {
        caption: "縦位置"
    },
    trim_vert_top:
    {
        caption: "上",
        tooltip: "画像の上端をフレームの上端に合わせます。"
    },
    trim_vert_middle:
    {
        caption: "中央",
        tooltip: "画像の上下中央をフレームの上下中央に合わせます。"
    },
    trim_vert_bottom:
    {
        caption: "下",
        tooltip: "画像の下端をフレームの下端に合わせます。"
    },
    trim_image_enter:
    {
        caption: "決定"
    },
    trim_image_cancel:
    {
        caption: "キャンセル"
    },
    amination_play_cmd_stop:
    {
        tooltip: "再生を停止します"
    },
    amination_play_cmd_back:
    {
        tooltip: "前のフレームに戻ります"
    },
    amination_play_cmd_pause:
    {
        tooltip: "再生を一時停止ます"
    },
    amination_play_cmd_play:
    {
        tooltip: "再生を開始します"
    },
    amination_play_cmd_next:
    {
        tooltip: "次のフレームに進みます"
    },
    amination_play_cmd_close:
    {
        tooltip: "再生テストを終了します"
    },
    //-----------------------------------------------------------
    last:
    {
    }
};

var errorMessage = {
    comm_error    : '通信エラーが発生しました',
    error_100     : '指定された文書がありません',
    error_110     : 'アニメーションデータがありません',
    error_400     : '操作権限がありません',
    error_700     : '他のユーザーが文書を編集中です',
    no_image      : '画像情報が不正です',
    frame_is_zero : 'フレームを全て削除することは出来ません\n※最低１つのフレームが必要です',
    audio_error   : '音声の取得ができません',
    server_result   : "サーバーが異常応答しました",
    content_error   : "サーバーは正常応答しましたが、アニメーション情報が取得できませんでした。",
    content_nomatch : "サーバーは正常応答しましたが、アニメーション情報が適合しませんでした。",
    animetion_data  : "サーバーは正常応答しましたが、アニメーション情報が不正です。",
    unknown : '不明なエラーが発生しました'
} ;

