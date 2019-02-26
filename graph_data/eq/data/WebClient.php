<?php 
require_once "HTTP/Client.php"; 

/*
■使い方

□XPATHの指定
	・普通の
	/html/body[1]/div[1]/table[1]/tr[1]/td[1]/div[1]/div[1]/div[1]/div[2]/div[1]/ul[1]/li[1]/a
	・リンクを取得したい
	/html/body/div/table/tr[2]/td/table/tr/td/table[4]/tr/td/table/tr/td[8]/a/@href
	'//a'

□設定
user-agent
proxy

□値取得
Xpath
DOMDocument::loadHTML
正規表現

*/


/*
□残タスク
・次ページへのデータ引継ぎ法
・function定義
・sleep設定
・プロキシ対応


・リクエストデータ取得
parosデータからダンプできると良いかも

*/

class WebClient extends HTTP_Client {

	const METHOD_GET = "GET";
	const METHOD_POST = "POST";
	private $page_count = 0;
	private $conf_file = null;


	public function __construct() {
		parent::__construct(
//			array(
//			    'proxy_host' => 'localhost', // proxy ホスト
//			    'proxy_port' => 8080, // proxy ポート(省略時 8080)
//			)
			array(
			    'timeout' => '4', // タイムアウト
			)


		);

//		parent::__construct();

	}

	public function setConfFile($conf_file) {
		$this->conf_file = $conf_file;
	}

	//User-Agent設定
	public function setUserAgent($user_agent) {
		$this->setDefaultHeader('User-Agent',$user_agent);
	}


	/**
	 * ファイル出力
	 */
	public function fputBody($file, $response) {
		$fp = fopen($file, "w");
		fwrite($fp, $response['body']);
		fclose($fp);
	}
	public function fputHeader($file, $response) {
		$fp = fopen($file, "w");
		$headers = $response['headers'];
		foreach ($headers as $key => $val) {
			fwrite($fp, "$key:$val\n");
		}
		fclose($fp);
	}


	/**
	 * コマンドラインから選択したリクエストを送信
	 * setting.incのページ情報から選択したページをpageStartを用いて送信
	 */
	public function comStart() {
		if(is_null($this->conf_file) || !file_exists($this->conf_file)) {
			print("設定ファイルが選択されていません");
			return;
		}

		while (true) {
			print(">");
			$input = fgets(STDIN,4096);
			$input = trim($input);

			//終了判定
			if ($input === 'exit' || $input === 'quit') break;

			//設定ファイルを動的に読み込み
			require($this->conf_file);

			switch($input) {

				//使用可能なデータを表示
				case 'list':
					print("---------------------------------------\n");
					foreach(array_keys($data) as $key) {
						print("$key\n");
					}
					print("---------------------------------------\n");
					break;

				//ヘルプを表示
				case 'help':
					print("---------------------------------------\n");
					print("help : ヘルプ\n");
					print("exit : 終了\n");
					print("list : データリスト\n");
					print("---------------------------------------\n");
					break;

				default:
					if (isset($data[$input])) {
						//ページアクセス
						$this->pageStart($data[$input]);
					} else {
						print("not exist!\n");
					}
				break;
			}
		}
	}


	/**
	 * 1ページ毎の基本処理
	 */
	public function pageStart($data) {
		$this->page_count ++;
		print("page $this->page_count start\n");

		try {
	        $this->_responses            = array();	//メモリリーク対策

			//必須paramチェック
			if(!isset($data['name']) || !isset($data['method']) || !isset($data['url'])){
				return;
			}

			//リクエスト送信
			print("url:".$data['url']."\n");
			if(isset($data['encode'])) mb_convert_variables($data['encode'], 'SJIS', $data['param']);
			if($data['method'] === 'GET') {
				if(!isset($data['param']))$data['param'] = array();
				print_r($data['param']);
				$this->get($data['url'], $data['param']);
			} else {
				if(!isset($data['param']))$data['param'] = array();
				print("POST!! ".$data['url'].":".$data['param']."\n");
				print_r($data['param']);
				$this->post($data['url'], $data['param']);
			}

			$response = $this->currentResponse();
			print("status:".$response['code']."\n");
			print("content-length:".strlen($response['body'])."\n");

			//ファイル出力
			if (isset($data['file']) && $data['file']) {
				$file_body = sprintf("%03d_%s_body.html", $this->page_count, $data['name']);
				$this->fputBody('log/'.$file_body, $response);

				$file_header = sprintf("%03d_%s_header.txt", $this->page_count, $data['name']);
				$this->fputHeader('log/'.$file_header, $response);
			}

			//response解析（XPATH）
			if(isset($data['res_xpath']) && count($data['res_xpath']) !== 0) {

				$doc = new DOMDocument();
				@$doc->loadHTML($response['body']);

 				//XPATHの書き下しを実施する？
//				$this->parseDom($doc);

				$xpath = new DOMXPath($doc);	//UTF-8に変換される。
				$ret_xpath = array();
				//指定されたXpathの数だけループ
				foreach ($data['res_xpath'] as $name => $pattern) {
					$nodes = $xpath->query($pattern);
					$array = array();
					//見つかった結果の数だけループ
					foreach ($nodes as $node) {

						//htmlで取得したい場合
						if ($name === 'refound' || $name === 'refound_yobi') {
							$temp_str = trim(strip_tags($node->C14N(), '<br>'));
						} elseif (preg_match('/xurl/', $name)) {
							$temp_str = $node->C14N();
						} else {
							//それ以外はTEXTのみ
							$temp_str = trim($node->nodeValue);
						}

						$temp_str = str_replace ("\xC2\xA0" , '' , $temp_str);	//&nbspが文字化けする

						if(strlen($temp_str) === 0) {
							$temp_str = null;
						}
						$array[] = $temp_str;
					}
					$ret_xpath[$name] = $array;
				}
				
			}

			//response解析（正規表現）
			if(isset($data['res_reg']) && count($data['res_reg']) !== 0) {
				$ret_reg = array();
				foreach ($data['res_reg'] as $name => $pattern) {
					preg_match_all($pattern, $response['body'], $m, PREG_SET_ORDER);
					$ret_reg[$name] = $m;
				}
			}

			//終了処理
			$ret = array();
			if(isset($ret_xpath))$ret['ret_xpath'] = $ret_xpath;
			if(isset($ret_reg))$ret['ret_reg'] = $ret_reg;

			print("page $this->page_count end\n");
			return $ret;

		} catch (Exception $e) {
			print("error $e->getMessage()\n");
		}
	}

	private function parseDom($node, $preStr = '/') {
		if (strlen($preStr) > 500) exit;

		//XML_ELEMENT_NODE の場合
		if ($node->nodeType === 1) {
			$nodeList = $node->childNodes;

			//子nodeがいなければ終了
			if (is_null($nodeList)) return;

			$preName = '';
			$tagNumList = array();
			foreach ($nodeList as $child_node) {

				if(isset($tagNumList[$child_node->nodeName]) === true) {
					$tagNumList[$child_node->nodeName] ++;
				} else {
					$tagNumList[$child_node->nodeName] = 1;
				}


				//XML_TEXT_NODE or XML_CDATA_SECTION_NODE の場合
				if ($child_node->nodeType === 3 | $child_node->nodeType === 4) {
					$str = trim($child_node->nodeValue);
					if (strlen($str) !== 0) {
						//ここを表示するとXPATH書き下しがでる
						print($preStr.' = '.trim($str)."\n");
					}
				} else {

					$nextPreStr = $preStr.'/'.$child_node->nodeName.'['.$tagNumList[$child_node->nodeName].']';

					$this->parseDom($child_node, $nextPreStr);
					$preName = $child_node->nodeName;
				}
			}
		}
		//XML_HTML_DOCUMENT_NODE の場合
		elseif ($node->nodeType === 13) {

			$nodeList = $node->childNodes;
			if (is_null($nodeList)) return;
			foreach ($nodeList as $child_node) {
				$this->parseDom($child_node, $preStr.'html');
			}
		}

	}

}

?> 