// WebGLでポリゴンを描画する
var gl;
var c;

var m = new matIV();
//var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var vpMatrix = m.identity(m.create());
var mvpMatrix = m.identity(m.create());
//var tmpMatrix1 = m.identity(m.create());

// マウス操作用変数
var mode = 0;	//0は移動 1は回転


var z_scale = 10.0;

var g_base_x = 0.0;
var g_base_y = 0.0;
var g_base_z = 0.0;

var g_trans_x = .0;
var g_trans_y = 0.0;

var g_rot_scale = 0.005;	//回転量　0.01ぐらいがよい
var g_rot_x = 0.0;
var g_rot_y = 0.0;

var previous_x = 0;
var previous_y = 0;
var pre_gesture_scale = 0;
var gesture_flg = false;
var drag = 0;
var didFirstClick = 0;

/*** キャンバス初期化 ***/
function init_canvas(){

	// canvasエレメントを取得
	c = document.getElementById('canvas');

	c.width = window.innerWidth;
	c.height = window.innerHeight;

	// webglコンテキストを取得
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	// ----------- イベントリスナー登録 ----------- 
	c.addEventListener('mousewheel', wheelHandler, false);
	c.addEventListener('dbclick', dbclick, false);

	c.onmousedown =mousedown;
	c.onmouseup = mouseup;
	c.onmousemove = move;
	c.ondblclick = dbclick;

	c.addEventListener('touchstart', mousedown, false);
	c.addEventListener('touchmove', move, false);
	c.addEventListener('touchend', mouseup, false);

	c.addEventListener('gesturechange', gesturechange, false);
	c.addEventListener('gesturestart', gesturestart, false);
	c.addEventListener('gestureend', gestureend, false);
	canvas.style.cursor = "all-scroll";
}

function gl_clear(){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}

//MVPマトリックスを作成する。
function set_mvp(){

	/*
	matIV.lookAt(eye, center, up, dest)
	eye > カメラの位置を表すベクトル
	center > カメラの注視点を表すベクトル
	up > カメラの上方向を表すベクトル
	dest > 演算結果を格納する行列
	*/
/*
	m.lookAt(
	[g_base_x - g_trans_x, g_base_y - g_trans_y, g_base_z + z_scale],
	[g_base_x - g_trans_x, g_base_y - g_trans_y, -1000],
	[0, 1, 0], vMatrix);
*/

	m.lookAt(
	[g_base_x, g_base_y, g_base_z + z_scale],
	[g_base_x, g_base_y, -1000],
	[0, 1, 0], vMatrix);

	/*
	matIV.perspective(fovy, aspect, near, far, dest)
	fovy > 視野角
	aspect > スクリーンのアスペクト比
	near > ニアクリップ
	far > ファークリップ
	dest > 演算結果を格納する行列
	*/
	m.perspective(90, c.width / c.height, 0.00001, 10000, pMatrix);


	m.multiply(pMatrix, vMatrix, vpMatrix);

	mMatrix = m.identity(m.create());

	m.rotate(mMatrix, g_rot_x , [0.0, 1.0, 0.0], mMatrix);
	m.rotate(mMatrix, g_rot_y , [1.0, 0.0, 0.0], mMatrix);
	m.translate(mMatrix, [g_trans_x, g_trans_y, 0.0], mMatrix);
//	m.rotate(mMatrix, Math.PI , [1.0, 0.0, 0.0], mMatrix);

	m.multiply(vpMatrix, mMatrix, mvpMatrix);
}

/* ############################################################ 
                        イベントジェスチャ
/* ############################################################ */
//マウス操作
function wheelHandler(ev) {

	var del = 0.1;
	var ds = ((ev.detail || ev.wheelDelta) < 0) ? 1.1 : 0.9;
	z_scale = z_scale * ds;

	draw_display();
	ev.preventDefault();
}

function mousedown(ev) {
	if(gesture_flg == true) return;
    drag = 1;

	if(mode == 0) {
		canvas.style.cursor = "all-scroll";
	} else {
		canvas.style.cursor = "nw-resize";
	}

	//スマホ対応
	if(ev.targetTouches != undefined) {
		ev.preventDefault();	//ブラウザ標準動作を抑止する。
		var ev = ev.targetTouches[0];

		if(didFirstClick == 0) {
			didFirstClick = 1;
			didFirstClick = setTimeout( function() {
				didFirstClick = 0 ;
			}, 300 ) ;

		} else {
			dbclick(ev);
			didFirstClick = 0 ;
		}

	}

    previous_x = ev.clientX;
    previous_y = ev.clientY;
    draw_display();
}

function mouseup(ev) {
	if(gesture_flg == true) return;
//    canvas.style.cursor = "pointer";

    drag = 0;
    draw_display();
}

function move(ev) {
	if (drag == 0) return;
	if(gesture_flg == true) return;

	//スマホ対応
	if(ev.targetTouches != undefined) {
		ev.preventDefault();	//ブラウザ標準動作を抑止する。
		var ev = ev.targetTouches[0];
	}

	 //移動量
	var dx = ev.clientX - previous_x;
	var dy = ev.clientY - previous_y;

	if(mode == 0) {
		/*
		移動量計算
		・半径=z_scaleの円を視野角で切り取る
		・Y方向が基準となり、X方向に適用される。（アスペクト比に関係ない）
		*/
		g_trans_x += dx * z_scale / (canvas.height / 2);
		g_trans_y += -1 * dy * z_scale / (canvas.height / 2);
	} else {
		//回転
		g_rot_x += dx * g_rot_scale;
		g_rot_y += dy * g_rot_scale;
	}

    previous_x = ev.clientX;
    previous_y = ev.clientY;

	draw_display();

}

function dbclick(ev) {
    mode += 1;
    mode = mode % 2;

	e = document.getElementById('mode');
	if(mode == 0) {
		e.innerHTML = "translate";
		canvas.style.cursor = "all-scroll";
	} else {
		e.innerHTML = "rotate";
		canvas.style.cursor = "nw-resize";
	}

}

//マルチタッチ対応
function gesturechange(ev) {
	var ds = 1 - ((ev.scale - 1) * 0.05);
	z_scale = z_scale * ds;
	draw_display();
}


function gesturestart(ev) {
	ev.preventDefault();
	gesture_flg = true;
}
function gestureend(ev) {
	ev.preventDefault();
	gesture_flg = false;
}


function debug() {
	console.log("canvas.width:" + canvas.width);
	console.log("canvas.height:" + canvas.height);
	console.log("g_trans_x:" + g_trans_x);
	console.log("g_trans_y:" + g_trans_y);
	console.log("z_scale:" + z_scale);
	console.log("g_base_x:" + g_base_x);
	console.log("g_base_y:" + g_base_y);
	console.log("g_base_z:" + g_base_z);
}


//行列掛け算
function vec_mul(a1, a2) {
	var ret = new Array();
	col = a2.length;
	if (a1.length % col != 0) {
		return false;
	}

	for (i = 0;i < a1.length / col;i ++) {
		for (j = 0;j < a2.length ;j ++) {
			ret.push(a1[i * col + j] * a2[j]);
		}
	}
	return ret;
}

//行列足し算
function vec_add(a1, a2) {
	var ret = new Array();
	col = a2.length;
	if (a1.length % col != 0) {
		return false;
	}

	for (i = 0;i < a1.length / col;i ++) {
		for (j = 0;j < a2.length ;j ++) {
			a2[j] = Number(a2[j]);
			ret.push(a1[i * col + j] + a2[j]);
		}
	}
	return ret;
}
