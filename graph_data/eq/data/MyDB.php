<?php 
class MyDB extends PDO
{
	public function __construct() {
		parent::__construct('pgsql:host=192.168.10.6; dbname=eq', 'postgres', 'hogehoge');
		$this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}

	public function insertData($data) {
		$sql = 
			"insert into eq(time, place, lat, lon, deps, mag, shindo) values(:time, :place, :lat, :lon, :deps, :mag, :shindo)";

		$stmt = $this->prepare($sql);
		$stmt->execute($data);
		return; 
	}

	public function getLastDate() {
		$sql = "select to_char(time + '1 days', 'YYYY/MM/DD') as ret from eq where time is not null order by time desc limit 1";

		$stmt = $this->prepare($sql);
		$stmt->execute();
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return $result['ret']; 
	}

}
?>
