
作成者：(株)知能情報システム
更新日：2015年7月24日

■ディレクトリ構成

application		CodeIgniter 3.x の application フォルダです。
system			CodeIgniter 3.x の system フォルダです。
www				ウェブルートです。Apache からアプリケーション ルートとして参照します。

bin				Imlx コンバータを格納しています。
db				データベース関係のスクリプトを格納しています。
doc				設計ドキュメントを格納しています。
ext				外部ライブラリを格納しています。

log				ログ出力フォルダです。
task			タスクの一時ファイルが記録されます。

■データベースのセットアップ
1. db/db-create.sql によってデータベースを作成します。
   データベース名、ユーザー名、パスワードは適宜変更してください。
2. db/db-schema.sql によってスキーマを作成します。
3. application/database.php の $db['default'] を編集し、
   データベース名。ユーザー名、パスワード、ポート番号などを適宜変更してください。

■URL マッピングの設定
Web サーバーによる URL との対応付けに応じて、
www/.htaccess を編集する必要があります。

たとえば、Apache で次のようにエイリアスをかけている場合、

    Alias /Editor/ "D:/home/ChattyInftyOnlineServer/www/"
    <Directory "D:/home/ChattyInftyOnlineServer/www/" >
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        Allow from all
    </Directory>

 www/.htaccess の RewriteBase ディレクティブを次のように編集してください。

    RewriteBase /Editor/

