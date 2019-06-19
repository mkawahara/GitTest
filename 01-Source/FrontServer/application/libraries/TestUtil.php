<?php
/**
 * TestUtil.php
 */
 
/**
 * 単体テスト用の関数です。
 */
function TEST_OK($ok) {
	if (! $ok) {
		var_dump(debug_backtrace());
	}
}

/**
 * 単体テスト用の関数です。
 */
function TEST_EQUALS($x, $y) {
	if ($x !== $y) {
		print "TEST FAILED: left = $x, right = $y\r\n";
		var_dump(debug_backtrace());
	}
}

