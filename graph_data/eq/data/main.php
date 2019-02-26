<?php 
require_once 'WebClient.php';
require_once 'MyDB.php';
$client = new WebClient();
$client->setUserAgent('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0)');
$dbh = new MyDB();

//print_r(getDayList('2004-10-23', '2004-10-25'));
//getDataMain('2004/10/23', '2004/10/25');

getDataMain();
//getDataMain('1932/02/16', '2016/10/19');
//getDataMain('1923/01/01', '1923/01/03');
//getDataMain('1932/02/15');

exit;


// 引数なし … DBの最後の日から2日前を取得（地震サイトにデータが2日前までしか乗らない、ひどい）
// 引数1個 … その日のデータを取得
// 引数2個 … 開始、終了のデータを取得
function getDataMain($start_date = null, $end_date = null) {
	global $dbh;

	$date_list = array();
	$d = new DateTime();

	//引数なし
	if(is_null($start_date)) {
		$d->modify('-2 day');
		$date_list = getDayList($dbh->getLastDate(), $d->format('Y/m/d'));
	}
	//引数1個
	elseif(is_null($end_date)) {
		$date_list[] = $start_date;
	}
	//引数2個
	else {
		$date_list = getDayList($start_date, $end_date);
	}

	foreach ($date_list as $date) {
		getDataDayProc($date);
		sleep(3);
	}
}

//期間の日付一覧作成
function getDayList($start_date, $end_date) {
	$sdatetime = new DateTime($start_date);
	$edatetime = new DateTime($end_date);

	$ret = array();
	for($d = $sdatetime;$d <= $edatetime;$d->modify('+1 day')) {
		$ret[] = $d->format('Y/m/d');
	}
	return $ret;
}



function getDetailDate($date) {
	$ret = array();

	for($i = 0;$i < 24;$i += 3) {
		$s_str = sprintf("%02d", $i);
		$e_str = sprintf("%02d", $i + 2);
		$ret = array_merge($ret, getData($date, $s_str.':00', $date, $e_str.':59'));
		sleep(3);
	}
	return $ret;
}



function getDataDayProc($date) {
	global $dbh;
	$data = getData($date, '00:00', $date, '23:59');

	if(count($data) >= 100) {
		$data = getDetailDate($date);
	}

	foreach ($data as $record) {

		$record = preg_replace('/<[^<>]+>/', "\t", $record);
		$record = explode("\t", $record);

		$ret = array('time' => null,'place' => null,'lat' => null,'lon' => null,'deps' => null,'mag' => null,'shindo' => null);

		if(strpos($record[6], '時')) {
			$record[6] = preg_replace('/時/', ':00:00', $record[6]);
		}
		if(preg_match('/^[\d\s\/\:\.]*$/', $record[6])) {
			$ret['time'] = $record[6];
		} else {
			$ret['time'] = null;
		}

		$ret['place'] = $record[8];

		if(preg_match('/([\d]+)°(\d+\.\d)′/', $record[10], $m)) {
			$ret['lat'] = $m[1] * 60 + $m[2];
		} else {
			continue;
		}

		if(preg_match('/([\d]+)°(\d+\.\d)′/', $record[12], $m)) {
			$ret['lon'] = $m[1] * 60 + $m[2];
		}

		if(preg_match('/([\d]+)km/', $record[14], $m)) {
			$ret['deps'] = $m[1];
		}

		if(preg_match('/Ｍ([0-9\.]*)/', $record[16], $m)) {
			$ret['mag'] = $m[1];
		}

		$ret['shindo'] = mb_convert_kana($record[18], "rn");

		$dbh->insertData($ret);
	}

}


function getData($s_date, $s_time, $e_date, $e_time) {
	global $client;

	$data = array(
		'name'		=>	'top',
		'file'		=>	false,
		'method'	=>	'POST',
		'url'	=>	'http://www.data.jma.go.jp/svd/eqdb/data/shindo/index.php',
		'param' => array(
			'ymdF' => $s_date,
			'hmsF' => $s_time,
			'ymdT' => $e_date,
			'hmsT' => $e_time,
			'MaxI' => 'I1',
			'MinM' => 'F00',
			'MaxM' => 'T95',
			'DepF' => '0',
			'DepT' => '999',
			'EpiN[]' => '999',
			'Pref[]' => '99',
			'City[]' => '99999',
			'Obs[]' => '9999999',
			'Int' => '9',
			'Search' => '',
			'Sort' => 'S1',
			'Comp' => 'C0',
			'DetailFlg' => '0',
		),
		'res_xpath' => array(
			'xurl_2'		=>	'/html/body[1]/div[2]/div[1]/div[1]/div[2]/fieldset[2]/table[1]/tr',
		),
	);
	$ret = $client->pageStart($data);
	return $ret['ret_xpath']['xurl_2'];
}

exit;



?>
