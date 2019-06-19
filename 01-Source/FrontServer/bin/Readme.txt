ImlxCioConverter

Imlx 形式と ChattyInftyOnline 形式 (Online形式) の XML を相互変換するプログラム



# クライアントアプリ

変換結果を確認するとこができます

## 使い方

`ImlxCioConverterClient [options] [input file]`

- options
	-p		パイプ入出力モード
		 	無指定の場合はファイル入出力モードになります
		 	入力ファイルの拡張子によって変換の方向を決定します
			入力ファイルと同じ名前の拡張子が異なる出力ファイルが作成されます

	-t 		入力ファイル形式 imlx,cio
		 	パイプ入出力モードでは必須です
		  	ファイル入出力モードではファイル拡張子から判定します

	-m 		mathモード
			mathタグ、mblockタグのみの変換モードです
			パイプ入出力モードと入力ファイル形式の指定が必須です

	-d 		debugモード
			出力するxmlを、インデント付きの見やすい形で出力します

- 終了コード
	0	:	正常終了
	1	:	変換エラー
	2	:	入力ファイルエラー（フォーマット、読み込み）
	3	:	オプション指定エラー


- 例

`ImlxCioConverterClient filename.imlx`
=> filename.xml, filename.userdic.xml, filename.anime.xml が作成されます

`ImlxCioConverterClient -p -t imlx`
=> 標準入力から受け取った Imlx ファイル内容を変換して オンライン版 Xml ファイルの内容を標準出力に書き出します

`ImlxCioconverterClient -p -t cio -m`
=> 標準入力から受け取った Mathml の math タグを変換して Imlx の mblock タグを標準出力に書き出します


# ライブラリ

## 関数

ImlxCioConverter.Converter

- Result ConvertToOnline(string offlineFormatXML, out string onlineFormatXML)
	Imlx -> Online のドキュメント全体の変換

- Result ConvertToOffline(string onlineFormatXML, out string offlineFormatXML)
	Online -> Imlx のドキュメント全体の変換

- Result ConvertToMathml(string mblockString, out string mathmlString)
	Mblock -> Mathml の変換

- Result ConvertToMblock(string mathmlString, out string mblockString)
	Mathml -> Mblock の変換



- string Version()
	{Major}.{Minor}.{Build}.{Revision} 形式でのバージョン文字列

## 使い方

string offlineXMLString = /* 省略 */

string onlineXMLString = ImlxCioConverter.Converter.ConvertToOnline(offlineXMLString);



# ファイルリスト

- bin
	- CodeData.csv					: 変換テーブルデータ
	- CsvHelper.dll 				: 変換テーブルのCSV読み込みに使用するDLL
	- ImlxCioConverter.dll			: プログラム本体ライブラリ
	- ImlxCioConverterClient.exe 	: 動作確認用クライアントアプリ
- samples 							: 動作確認用サンプルデータ
- Readme.txt						: このファイル

dllを使用するときは、exe以外の３つのファイルをリンクするプログラムと同じフォルダに設置してください
exeを使用する場合には、すべてのファイルを同じフォルダに設置した状態で使用してください



# 変更履歴
- 0.21
	アニメーションファイルが存在しない時のcio->imlx変換ができない不具合を修正
	画像の統合ができない不具合を修正
- 0.20
	invisible 削除
- 0.19
	音声、化学式関連の仕様変更に対応
- 0.18
	画像を含んだサイズの大きいファイルを処理するため、変換前に画像を切り出して処理
	キリル文字のサポート
	数式と文章の混合段落不具合の修正
- 0.17
	パラグラフidが文書中で一意になるように修正
- 0.15
	セクションの不具合を修正
	三重積分などの記号名を修正
	書式の指定タグの不具合を修正
	既知の問題: キリル文字、記号エンティティ名未修正
- 0.14
	cn、underline の仕様変更に対応
	各種不具合を修正
	既知の問題：dint が正しく変換されない、img のデータが正しくない場合がある
- 0.13
	行列、表などの仕様変更に対応
- 0.12
	バグ修正
	ユーザー辞書、アニメーションの分割/統合をデフォルトに (0.6)
- 0.11
	複数ファイル分割/統合に対応
	画像の変換
	アニメーションの変換 (0.5)
	その他仕様変更への対応
- 0.10
	バグ修正
- 0.9
	バグ修正
- 0.8
	新仕様に対応
- 0.7
	mathタグを削除
	出力の空白改行を削除
- 0.5
	セクションタイトルを imlx ファイル中の section タグ title_text 属性に埋め込みに対応
- 0.4
	other_properties 変換漏れを修正
	cio -> imlx の変換が白紙になる問題を修正
- 0.3
	変換仕様の変更（cioch, math分割）
	クライアントアプリでの保存形式を UTF-8 に統一
	クライアントアプリに標準入出力による変換を追加
	クライアントアプリにmathモードを追加
	DLL のインターフェースの変更
- 0.2
	クライアントアプリでの Imlx ファイルの保存形式を Shift_JIS に変更
	ルートエレメントの変換漏れを修正
- 0.1
	暫定版リリース
