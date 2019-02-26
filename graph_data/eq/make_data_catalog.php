<?php
ini_set('memory_limit', '3000M');
include('../../../common/common.php');


$pp = fopen('tmp_poslist.txt', 'w');
$cp = fopen('tmp_collist.txt', 'w');
$mp = fopen('tmp_maglist.txt', 'w');



fwrite($pp, "// モデル(頂点)データ\n");
fwrite($pp, "var data_pos = [\n");

fwrite($cp, "// 色データ\n");
fwrite($cp, "var data_cls = [\n");

fwrite($mp, "// sizeデータ\n");
fwrite($mp, "var data_size = [\n");


$size_type = 0;
if(isset($argv[1]))$size_type = intval($argv[1]);

$conn = pg_connect("host=192.168.10.6 dbname=eq user=postgres password=hogehoge");
//$conn = pg_connect("dbname=postgres user=postgres password=hogehoge");

$sql = "select * from eq_catalog order by id limit 10000";
//$sql = "select * from eq where mag is not null order by id";
//$sql = "select * from eq where to_char(time, 'yyyy/mm/dd hh24:mm') order by id";
//$sql = "select * from eq where to_char(time, 'yyyy') = '1923' order by id";
//$sql = "select * from eq where mag is not null and to_char(time, 'yyyy') = '1923' order by id";
//$sql = "select * from eq where mag is not null and time >= to_date('1943', 'YYYY') and time <= to_date('1953', 'YYYY') order by id";
//$sql = "select * from eq where mag is not null and to_char(time, 'YYYYMMDD') = '20160414' order by id";
//$sql = "select * from eq where mag is not null and to_char(time, 'YYYYMMDD') = '20161021' order by id";


$result = pg_query($conn, $sql);
while($record = pg_fetch_assoc($result)) {
	$point = array();
	$color = array();

	//0.0091 … 地図上の1分角の距離(緯度)
	//0.0075 … 地図上の1分角の距離(経度) 0.0091 * cos(緯度)
	//1.855 … 1分角当たりの距離(km)、40075(地球の周囲km) / 全周の分角（360°×60′）
	$point[] = 0.0075 * $record['lon'] - 62.093;
	$point[] = 0.0091 * $record['lat'] - 20.122;

	$point[] = -1 * $record['deps'] / 1.855 * 0.0091;

	$rgb = hsv(-1 * $record['mag'], -8.3, -2);

	$color[] = $rgb[0];
	$color[] = $rgb[1];
	$color[] = $rgb[2];

	$size = magToSize($record['mag']);

	fwrite($pp, $point[0].','.$point[1].','.$point[2].",\n");
	fwrite($cp, $color[0].','.$color[1].','.$color[2].",\n");
	fwrite($mp, $size.",\n");
}


function magToSize($mag) {

	if(empty($mag))$mag = 1;
	if($mag < 0)$mag = 1;

	$size = array();
	$size[0] = 0.5;
	$size[1] = 0.5;
	$size[2] = 0.5;
	$size[3] = 0.7;
	$size[4] = 0.7;
	$size[5] = 1.3;
	$size[6] = 3.0;
	$size[7] = 6.0;
	$size[8] = 9.0;
	$size[9] = 14.0;
	$size[10] = 15.0;

	$c = $mag - floor($mag);
	return ($size[floor($mag) + 1] - $size[floor($mag)]) * $c + $size[floor($mag)];
}

fwrite($pp, "];\n");
fwrite($cp, "];\n");
fwrite($mp, "];\n");

fclose($pp);
fclose($cp);
fclose($mp);

exit;

?>
