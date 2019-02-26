<?php
/*
"ticker"	"count"
"AUDCAD"	744253
"AUDCHF"	744074
"AUDJPY"	5474410
"AUDNZD"	744427
"AUDUSD"	5301837
"CADCHF"	743653
"CADJPY"	744241
"CHFJPY"	5573482
"EURAUD"	744713
"EURCAD"	5568270
"EURCHF"	5615906
"EURGBP"	5462672
"EURHKD"	744845
"EURJPY"	5623007
"EURMXN"	744456
"EURNZD"	744749
"EURRUB"	713034
"EURSGD"	744263
"EURTRY"	744777
"EURUSD"	5542953
"EURZAR"	744512
"GBPAUD"	744889
"GBPCAD"	744505
"GBPCHF"	5672335
"GBPJPY"	5654496
"GBPNZD"	744887
"GBPUSD"	5513145
"NZDCAD"	744167
"NZDCHF"	743963
"NZDJPY"	4935877
"NZDUSD"	4854124
"USDCAD"	5301925
"USDCHF"	5599994
"USDCZK"	964848
"USDDKK"	965726
"USDHKD"	741202
"USDHUF"	965127
"USDJPY"	5566167
"USDMXN"	743349
"USDNOK"	966649
"USDPLN"	965705
"USDRUB"	524076
"USDSEK"	966722
"USDSGD"	965701
"USDTRY"	743467
"USDZAR"	967082
"XAGEUR"	421415
"XAGUSD"	2508813
"XAUEUR"	701164
"XAUUSD"	3735358


*/
$conn = pg_connect("dbname=fx user=postgres password=hogehoge host=192.168.10.6");
$sql = "
with main as (
select
	a.date,
	1 as USD,
	(select   bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'AUDUSD') as AUD,
	(select   bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'EURUSD') as EUR,
	(select   bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'GBPUSD') as GBP,
	(select   bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'NZDUSD') as NZD,
	(select 1/bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'USDCAD') as CAD,
	(select 1/bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'USDCHF') as CHF,
	(select 1/bid from fx_data_real b where a.date = to_char(b.time, 'YYYYMMDDHH24MISS') and ticker = 'USDJPY') as JPY
from (
	select distinct(to_char(time, 'YYYYMMDDHH24MISS')) as date
	from fx_data_real
) a
order by a.date
)
--
,ref as (
select 
	* 
from main
where date = '20141010000000'
),
--
relative as (
select
	main.date, 
	main.USD/(select USD from ref) as USD,
	main.AUD/(select AUD from ref) as AUD,
	main.EUR/(select EUR from ref) as EUR,
	main.GBP/(select GBP from ref) as GBP,
	main.NZD/(select NZD from ref) as NZD,
	main.CAD/(select CAD from ref) as CAD,
	main.CHF/(select CHF from ref) as CHF,
	main.JPY/(select JPY from ref) as JPY
from main
),
--
cal1 as (
select 
	date,
	  CASE WHEN COALESCE(USD, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(AUD, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(EUR, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(GBP, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(NZD, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(CAD, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(CHF, 0) > 0 THEN 1 ELSE 0 END
	+ CASE WHEN COALESCE(JPY, 0) > 0 THEN 1 ELSE 0 END
	as cnt,
	  COALESCE(USD, 0)
	+ COALESCE(AUD, 0)
	+ COALESCE(EUR, 0)
	+ COALESCE(GBP, 0)
	+ COALESCE(NZD, 0)
	+ COALESCE(CAD, 0)
	+ COALESCE(CHF, 0)
	+ COALESCE(JPY, 0)
	as total
from relative
),
--
cal2 as (
select 
	date,
	total / cnt as gain
from cal1
where cnt != 0
)
--
select 
a.date,
--b.cnt,
--b.total,
--c.gain,
a.USD / c.gain as USD,
a.AUD / c.gain as AUD,
a.EUR / c.gain as EUR,
a.GBP / c.gain as GBP,
a.NZD / c.gain as NZD,
a.CAD / c.gain as CAD,
a.CHF / c.gain as CHF,
-- a.CZK / c.gain as CZK,
-- a.DKK / c.gain as DKK,
-- a.HKD / c.gain as HKD,
-- a.HUF / c.gain as HUF,
a.JPY / c.gain as JPY,
a.USD / a.JPY as USDJPY,
a.CHF / a.JPY as CHFJPY,
a.GBP / a.JPY as GBPJPY,
a.NZD / a.JPY as NZDJPY,
a.EUR / a.CHF as EURCHF
-- a.MXN / c.gain as MXN,
-- a.NOK / c.gain as NOK,
-- a.PLN / c.gain as PLN,
-- a.RUB / c.gain as RUB,
-- a.SEK / c.gain as SEK,
-- a.SGD / c.gain as SGD,
-- a.TRY / c.gain as TRY,
-- a.ZAR / c.gain as ZAR
from relative a, cal1 b,cal2 c
where a.date = b.date and a.date = c.date
";

/*
$sql = "select time,open from fx_data where ticker = 'AUDCAD'";

$sql = "select
	a.date,
	1 as USD,
	(select open from fx_data b where a.date = b.time and ticker = 'AUDCAD') as AUDCAD,
	(select open from fx_data b where a.date = b.time and ticker = 'AUDCHF') as AUDCHF,
	(select open from fx_data b where a.date = b.time and ticker = 'AUDNZD') as AUDNZD,
	(select open from fx_data b where a.date = b.time and ticker = 'CADCHF') as CADCHF
from (
	select distinct(time) as date
	from fx_data
	where ticker = 'AUDCAD' OR ticker = 'AUDCHF' OR ticker = 'AUDNZD' OR ticker = 'CADCHF' OR ticker = 'CADJPY'
) a
order by a.date";
*/

$keys = null;
$result = pg_query($conn, $sql);
while($data = pg_fetch_assoc($result)) {
	if(is_null($keys)) {
		$keys = array_keys($data);
		print('var data_header = ["'.implode('","', $keys)."\"];\n");
		print("var data = [\n");
	}
	print(implode(",", $data).",\n");
}
print("];\n");


?>
