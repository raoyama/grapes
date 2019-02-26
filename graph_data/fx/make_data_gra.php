<?php
/*
取引量の重心をベースにしている
https://www.bis.org/publ/rpfx16fx.pdf

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
	(select   open from fx_data_day b where a.date = b.date and ticker = 'AUDUSD') as AUD,
	(select   open from fx_data_day b where a.date = b.date and ticker = 'EURUSD') as EUR,
	(select   open from fx_data_day b where a.date = b.date and ticker = 'GBPUSD') as GBP,
	(select   open from fx_data_day b where a.date = b.date and ticker = 'NZDUSD') as NZD,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDCAD') as CAD,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDCHF') as CHF,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDCZK') as CZK,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDDKK') as DKK,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDHKD') as HKD,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDHUF') as HUF,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDJPY') as JPY,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDMXN') as MXN,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDNOK') as NOK,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDPLN') as PLN,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDRUB') as RUB,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDSEK') as SEK,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDSGD') as SGD,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDTRY') as TRY,
	(select 1/open from fx_data_day b where a.date = b.date and ticker = 'USDZAR') as ZAR
from (
	select distinct(date) as date
	from fx_data_day
) a
order by a.date
)
--
,ref as (
select 
	* 
from main
where date = '20141001'
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
	main.CZK/(select CZK from ref) as CZK,
	main.DKK/(select DKK from ref) as DKK,
	main.HKD/(select HKD from ref) as HKD,
	main.HUF/(select HUF from ref) as HUF,
	main.JPY/(select JPY from ref) as JPY,
	main.MXN/(select MXN from ref) as MXN,
	main.NOK/(select NOK from ref) as NOK,
	main.PLN/(select PLN from ref) as PLN,
	main.RUB/(select RUB from ref) as RUB,
	main.SEK/(select SEK from ref) as SEK,
	main.SGD/(select SGD from ref) as SGD,
	main.TRY/(select TRY from ref) as TRY,
	main.ZAR/(select ZAR from ref) as ZAR
from main
),
--
cal1 as (
select 
	date,
	  CASE WHEN COALESCE(USD, 0) > 0 THEN 87.6	ELSE 0 END
	+ CASE WHEN COALESCE(AUD, 0) > 0 THEN 6.9	ELSE 0 END
	+ CASE WHEN COALESCE(EUR, 0) > 0 THEN 31.4	ELSE 0 END
	+ CASE WHEN COALESCE(GBP, 0) > 0 THEN 12.8	ELSE 0 END
	+ CASE WHEN COALESCE(NZD, 0) > 0 THEN 2.1	ELSE 0 END
	+ CASE WHEN COALESCE(CAD, 0) > 0 THEN 5.1	ELSE 0 END
	+ CASE WHEN COALESCE(CHF, 0) > 0 THEN 4.8	ELSE 0 END
	+ CASE WHEN COALESCE(CZK, 0) > 0 THEN 0.3	ELSE 0 END
	+ CASE WHEN COALESCE(DKK, 0) > 0 THEN 0.8	ELSE 0 END
	+ CASE WHEN COALESCE(HKD, 0) > 0 THEN 1.7	ELSE 0 END
	+ CASE WHEN COALESCE(HUF, 0) > 0 THEN 0.3	ELSE 0 END
	+ CASE WHEN COALESCE(JPY, 0) > 0 THEN 21.6	ELSE 0 END
	+ CASE WHEN COALESCE(MXN, 0) > 0 THEN 1.9	ELSE 0 END
	+ CASE WHEN COALESCE(NOK, 0) > 0 THEN 1.7	ELSE 0 END
	+ CASE WHEN COALESCE(PLN, 0) > 0 THEN 0.7	ELSE 0 END
	+ CASE WHEN COALESCE(RUB, 0) > 0 THEN 1.1	ELSE 0 END
	+ CASE WHEN COALESCE(SEK, 0) > 0 THEN 2.2	ELSE 0 END
	+ CASE WHEN COALESCE(SGD, 0) > 0 THEN 1.8	ELSE 0 END
	+ CASE WHEN COALESCE(TRY, 0) > 0 THEN 1.4	ELSE 0 END
	+ CASE WHEN COALESCE(ZAR, 0) > 0 THEN 1	ELSE 0 END
	as cnt,
	  COALESCE(USD, 0) * 87.6
	+ COALESCE(AUD, 0) * 6.9
	+ COALESCE(EUR, 0) * 31.4
	+ COALESCE(GBP, 0) * 12.8
	+ COALESCE(NZD, 0) * 2.1
	+ COALESCE(CAD, 0) * 5.1
	+ COALESCE(CHF, 0) * 4.8
	+ COALESCE(CZK, 0) * 0.3
	+ COALESCE(DKK, 0) * 0.8
	+ COALESCE(HKD, 0) * 1.7
	+ COALESCE(HUF, 0) * 0.3
	+ COALESCE(JPY, 0) * 21.6
	+ COALESCE(MXN, 0) * 1.9
	+ COALESCE(NOK, 0) * 1.7
	+ COALESCE(PLN, 0) * 0.7
	+ COALESCE(RUB, 0) * 1.1
	+ COALESCE(SEK, 0) * 2.2
	+ COALESCE(SGD, 0) * 1.8
	+ COALESCE(TRY, 0) * 1.4
	+ COALESCE(ZAR, 0) * 1
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
--a.USD as R_USD,
--a.EUR as R_EUR,
--a.NZD as R_NZD,
--a.JPY as R_JPY,
-- c.gain as GIN,
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
