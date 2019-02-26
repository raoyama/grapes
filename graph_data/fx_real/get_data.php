<?php
$url = 'http://www.gaitameonline.com/rateaj/getrate';
$json = file_get_contents($url);
if($json === false)exit;
$data = json_decode($json, TRUE);

$conn = pg_connect("dbname=fx user=postgres password=hogehoge host=192.168.10.6");
$time = date("Y-m-d H:i:s"); 
foreach ($data['quotes'] as $line) {
	$sql = "INSERT INTO fx_data_real(ticker, time, open, high, low, bid, ask) 
	VALUES ('".$line['currencyPairCode']."', '".$time."', ".$line['open'].", ".$line['high'].", ".$line['low'].", ".$line['bid'].", ".$line['ask'].")";
	pg_query($conn, $sql);
}
exit;
?>
