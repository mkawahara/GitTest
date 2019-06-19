<?php

/**
 * 巨大なバイナリ ファイル内を文字列検索するためのクラスです。
 */
class FileContentSearcher {

	private $buffer_size;		// バッファ サイズ

	private $buffer_pos;		// バッファの読み取り位置

	private $buffer;			// バッファ

	private $file_handle;		// ファイル ハンドル

	private $file_pos;			// 検索開始位置 (ファイル位置)

	/**
	 * コンストラクタ
	 *
	 * @param $buffer_size		バッファ サイズ。
	 *							検索する文字列長よりも長くしなければなりません。
	 */
	public function __construct($buffer_size = 4096) {
		$this->buffer_size	= $buffer_size;
		$this->buffer_pos	= 0;
		$this->buffer 		= "";
		$this->file_handle 	= NULL;
		$this->file_pos		= 0;
	}

	/**
	 * ファイルを閉じます。
	 */
	public function close() {
		if ($this->file_handle) {
			@fclose($this->file_handle);
			$this->file_handle = NULL;
		}
	}

	/**
	 * ファイルを開きます。
	 * @return 成功すると TRUE、失敗すると FALSE を返します。
	 */
	public function open($filename) {

		// ファイルを開きます。
		$this->file_handle = fopen($filename, 'rb');
		if ($this->file_handle === FALSE) return FALSE;

		// バッファに読み取ります。
		$this->buffer_pos = 0;
		$this->buffer = fread($this->file_handle, $this->buffer_size);
		if ($this->buffer === FALSE) return FALSE;

		// 検索開始位置を初期化します。
		$this->file_pos	= 0;

		return TRUE;
	}

	/**
	 * 文字列を検索し、ファイル位置を返します。
	 * 見つからないときは FALSE を返します。
	 * 見つかった場合は、検索された文字列の次の位置に進みます。
	 */
	public function find($str) {

		$margin = strlen($str) - 1;

		while (TRUE) {

			// 現在のバッファ内で文字列を検索します。
			$str_pos = strpos($this->buffer, $str, $this->file_pos - $this->buffer_pos);

			// 文字列が見つかった場合は、ファイル位置を返します。
			if ($str_pos !== FALSE) {
				$found_pos = $this->buffer_pos + $str_pos;
				$this->file_pos = $found_pos + strlen($str);
				return $found_pos;
			}

			// 文字列が見つからなかった場合は、次のバッファを読み取ります。
			// このとき、バッファ境界にまたがる文字列を検索する必要があるので、
			// 検索文字列 -1 の長さ分だけ前から読み取ります。
			if (! $this->next_buffer($margin)) {
				return FALSE;
			}
		}
	}

	/**
	 * 文字列 $str1 または $str2 を検索し、先に出現したほうのファイル位置を返します。
	 * 見つからないときは array(-1, 0) を返します。
	 * 見つかった場合は、検索された文字列の次の位置に進みます。
	 *
	 * @return $index		$str1 または $str2 のファイル位置
	 * @return $found		$str1 が見つかった場合は 1、$str2 が見つかった場合は 2、
	 *						見つからなかった場合は 0 を返します。
	 */
	public function find_first($str1, $str2) {

		$margin = max(strlen($str1), strlen($str2)) - 1;

		while (TRUE) {

			// 現在のバッファ内で文字列を検索します。
			$pos1 = strpos($this->buffer, $str1, $this->file_pos - $this->buffer_pos);
			$pos2 = strpos($this->buffer, $str2, $this->file_pos - $this->buffer_pos);

			// $str1, $str2 のどちらが先に見つかったかを判定します。
			if ($pos1 !== FALSE && $pos2 !== FALSE) {
				$found = ($pos1 <= $pos2) ? 1 : 2;
			}
			elseif ($pos1 !== FALSE) {
				$found = 1;
			}
			elseif ($pos2 !== FALSE) {
				$found = 2;
			}
			else {
				$found = 0;
			}

			// 文字列が見つかった場合は、ファイル位置を返します。
			if ($found > 0) {
				$str_pos = ($found == 1) ? $pos1 : $pos2;
				$str     = ($found == 1) ? $str1 : $str2;

				$found_pos = $this->buffer_pos + $str_pos;
				$this->file_pos = $found_pos + strlen($str);
				return array($found_pos, $found);
			}

			// 文字列が見つからなかった場合は、次のバッファを読み取ります。
			// このとき、バッファ境界にまたがる文字列を検索する必要があるので、
			// 検索文字列の長さ分だけ前から読み取ります。
			if (! $this->next_buffer($margin)) {
				return array(FALSE, 0);
			}
		}
	}

	/**
	 * 次のバッファを読み取ります。
	 * @param	$margin		マージン (0 以上の整数)
	 * @return				成功すれば TRUE、これ以上読み取れないときは FALSE を返します。
	 */
	private function next_buffer($margin) {

		// 前回に EOF に達している場合は、 FALSE を返します。
		if (feof($this->file_handle)) return FALSE;

		// バッファの開始位置を計算します。
		$this->buffer_pos =  $this->buffer_pos + strlen($this->buffer) - $margin;

		// 現在位置をバッファ開始位置に初期化します。
		$this->file_pos = $this->buffer_pos;

		// ファイル位置を移動します。
		fseek($this->file_handle, $this->buffer_pos);

		// バッファに読み取ります。
		$this->buffer = fread($this->file_handle, $this->buffer_size);

		return ($this->buffer !== FALSE);
	}

	/**
	 * 次の文字列を読み取ります。
	 * 指定されたバイト数だけ読み取れないときは、読み取れる分だけ返します。
	 */
	public function read($bytes) {
		$result = '';
		while (TRUE) {

			// バッファの最後まで来ている場合は、次のバッファを読み取ります。
			if ($this->file_pos >= $this->buffer_pos + strlen($this->buffer)) {
				if (! $this->next_buffer(0)) {
					return $result;
				}
			}

			// バッファから読み取ります。
			$piece = substr($this->buffer, $this->file_pos - $this->buffer_pos, $bytes);
			$piece_len = strlen($piece);

			// 読み取れなかった場合は、終了します。
			if ($piece_len == 0) {
				$result;
			}

			// ファイル位置を進めます。
			$this->file_pos += $piece_len;

			// 戻り値を連結します。
			$result .= $piece;
			$bytes -= strlen($piece);
			if ($bytes <= 0) {
				return $result;
			}
		}
	}

	/**
	 * 現在のファイル位置から、XML 属性文字列を読み取ります。
	 * 読み取るのは name="value" という形式です。
	 * 読み取れなかった場合は、$name, $value が共に FALSE になります。
	 *
	 * @return	$name		属性名
	 * @return	$value		属性値
	 */
	public function read_xml_attribute() {

		$result = array(FALSE, FALSE);
		$c = '';

		// 空白文字をスキップします。
		do {
			$c = $this->read(1);
			if ($c === '') return $result;
		}
		while (ctype_space($c));

		// 英数字の文字列を読み込んで、属性名とします。
		$name = $c;
		while (TRUE) {
			$c = $this->read(1);
			if ($c === '') return $result;
			if (! ctype_alnum($c)) break;
			$name .= $c;
		}

		// 空白文字をスキップします。
		while (ctype_space($c)) {
			$c = $this->read(1);
			if ($c === '') return $result;
		}

		// 等号であるか確認します。
		if ($c !== '=') return $result;

		// 空白文字をスキップします。
		do {
			$c = $this->read(1);
			if ($c === '') return $result;
		}
		while (ctype_space($c));

		// 一重引用符、または、二重引用符であるか確認します。
		if (! ($c === "'" || $c === '"')) return $result;
		$quote = $c;

		// 属性値を読み取ります。
		$value = '';
		while (TRUE) {
			$c = $this->read(1);
			if ($c === '') return $result;
			if ($c === $quote) break;
			$value .= $c;
		}

		return array($name, $value);
	}

}


/**
 * FileContentSearcher クラスの目視テスト コードです。
 */
function test_FileContentSearcher() {
	require('TestUtil.php');

	// テスト用のファイルを作成します。
	$text = '<doc>' . "\r\n" .			// バイト 0-6
		'<p_list>' .					// バイト 7-14
		'<p id="1"></p>'.				// バイト 15-28
		'<p id="2"></p>' .				// バイト 29-42
		'</p_list>' . "\r\n" .			// バイト 43-53
		'<p_list><p id="34"></p><p id="56"></p></p_list>' . "\r\n" .	// バイト 54-
		'</doc>';
	$filename = tempnam(sys_get_temp_dir(), 'test');
	file_put_contents($filename, $text);

	// find 関数のテスト
	{
		$searcher = new FileContentSearcher(9);
		$searcher->open($filename);

		// 最初の <p_list> を検索します。
		$index = $searcher->find('<p_list');
		TEST_EQUALS($index, 7);

		// <p> を検索します。
		$index = $searcher->find('<p');
		TEST_EQUALS($index, 15);

		// id 属性を読み取ります。
		list($name, $value) = $searcher->read_xml_attribute();
		TEST_EQUALS($name, 'id');
		TEST_EQUALS($value, '1');

		// </p> を検索します。
		$index = $searcher->find('</p>');
		TEST_EQUALS($index, 25);

		$searcher->close();
	}

	// find_first 関数のテスト
	{
		$searcher = new FileContentSearcher(9);
		$searcher->open($filename);

		// <doc> または <p_list> を検索します。
		list($index, $found) = $searcher->find_first('<doc', '<p_list');
		TEST_EQUALS($index, 0);
		TEST_EQUALS($found, 1);

		// </p> または <p_list> を検索します。
		list($index, $found) = $searcher->find_first('</p>', '<p_list');
		TEST_EQUALS($index, 7);
		TEST_EQUALS($found, 2);

		// <p> または <p_list> を検索します。
		list($index, $found) = $searcher->find_first('<p', '<p_list');
		TEST_EQUALS($index, 15);
		TEST_EQUALS($found, 1);

		// 次が 'id="1"' であることを検証します。
		$c = $searcher->read(7);
		TEST_EQUALS($c, ' id="1"');

		$searcher->close();
	}

	// read 関数のテスト
	{
		$searcher = new FileContentSearcher(2);
		$searcher->open($filename);

		$str = $searcher->read(5);
		TEST_OK($str === '<doc>');

		$str = $searcher->read(2);
		TEST_OK($str === "\r\n");

		$str = $searcher->read(1);
		TEST_OK($str === "<");

		$str = $searcher->read(6);
		TEST_OK($str === "p_list");

		$searcher->close();
	}

	// find 関数のテスト - タグが見つからない場合に FALSE を返すか。
	{
		$searcher = new FileContentSearcher(9);
		$searcher->open($filename);

		$index = $searcher->find('<p_list');
		TEST_EQUALS($index, 7);

		$index = $searcher->find('<p_list');
		TEST_EQUALS($index, 54);

		$index = $searcher->find('<p_list');
		TEST_EQUALS($index, FALSE);
	}

	print "All Done.\n";
}

//test_FileContentSearcher();

