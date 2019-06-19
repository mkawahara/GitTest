<?php
date_default_timezone_set('Asia/Tokyo');
$ctimestr = date('D, d M Y H:i:s');

//header('Cache-Control: no-cache');
header('Cache-Control: max-age=3');
//header('Expires: Mon, 26 Jul 2016 05:00:00 GMT');
header('Last-Modified: ' . $ctimestr);

$rd = rand();
$rqheaders = apache_request_headers();


$lms = 0;


foreach ($rqheaders as $header => $value) {
    //echo "$header: $value <br />\n";
    if ($header == 'If-Modified-Since') $lms = $value;
}


$ctime = time();
$lmtime = strtotime($lms);

if ($ctime - $lmtime < 6 ) {
  header('HTTP/1.1 304 Not Modified') ;
  exit();
}


print ("<!DOCTYPE html>\n");
print ("<html><body>\n");
print ("wolrd : $rd<br>\n");
print ("<p><a href='http://192.168.10.105:8000/pages/php/cache.php'>click</a></p>");

echo 'Current: ' . date('D, d M Y H:i:s', $ctime);
echo '<br>';
echo 'Last Modified: ' . date('D, d M Y H:i:s', $lmtime);

print ("</body></html>");

?>