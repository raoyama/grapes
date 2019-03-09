'use strict';
var m = new matIV();
//var mMatrix = m.identity(m.create());
//var tmpMatrix1 = m.identity(m.create());
var mvpMatrix = m.identity(m.create());

// マウス操作用変数

var z_scale = 10.0;

var g_base_x = 0.0;
var g_base_y = 0.0;
var g_base_z = 0.0;

var g_trans_x = .0;
var g_trans_y = 0.0;

var g_rot_scale = 0.005;	//回転量　0.01ぐらいがよい
var g_rot_x = 0.0;
var g_rot_y = 0.0;


class Canvas {

	/*** キャンバス初期化 ***/
	constructor() {
		this.mode = 0;	//0は移動 1は回転
		this.drag = 0;
		this.didFirstClick = 0;
		this.previous_x = 0;
		this.previous_y = 0;
		this.gesture_flg = false;

		// canvasエレメントを取得
		this.c = document.getElementById('canvas');

		this.c.width = window.innerWidth;
		this.c.height = window.innerHeight;

		// webglコンテキストを取得
		gl = this.c.getContext('webgl') || this.c.getContext('experimental-webgl');

		// イベントリスナー登録
		// イベント関数内ではthisの対象が選択されたオブジェクトになり、Canvasクラスのインスタンスではない
		// そのため各関数に.bind(this)つけて強制する。 ※setTimeoutも同様
		this.c.addEventListener('mousewheel',		this.wheelHandler.bind(this),	false);
		this.c.addEventListener('mousedown',		this.mousedown.bind(this),		false);
		this.c.addEventListener('mouseup',			this.mouseup.bind(this),		false);
		this.c.addEventListener('mousemove',		this.mousemove.bind(this),		false);
		this.c.addEventListener('dblclick',			this.dblclick.bind(this),		false);

		this.c.addEventListener('touchstart',		this.mousedown.bind(this),		false);
		this.c.addEventListener('touchmove',		this.mousemove.bind(this),		false);
		this.c.addEventListener('touchend',			this.mouseup.bind(this),		false);

		this.c.addEventListener('gesturechange',	this.gesturechange.bind(this),	false);
		this.c.addEventListener('gesturestart',		this.gesturestart.bind(this),	false);
		this.c.addEventListener('gestureend',		this.gestureend.bind(this),		false);
		this.c.style.cursor = 'all-scroll';
	}
	
	//イベント関数：thisの中身が
	//マウス操作
	wheelHandler(ev) {
		var del = 0.1;
		var ds = ((ev.detail || ev.wheelDelta) < 0) ? 1.1 : 0.9;
		z_scale = z_scale * ds;

		draw_display();
		ev.preventDefault();
	}

	mousedown(ev) {
		if(this.gesture_flg == true) return;
	    this.drag = 1;

		if(this.mode == 0) {
			this.c.style.cursor = 'all-scroll';
		} else {
			this.c.style.cursor = 'nw-resize';
		}

		//スマホ ダブルタップ対応
		if(ev.targetTouches != undefined) {
			ev.preventDefault();	//ブラウザ標準動作を抑止する。
			ev = ev.targetTouches[0];

			if(this.didFirstClick == 0) {
				this.didFirstClick = 1;
				this.didFirstClick = setTimeout( function() {
					this.didFirstClick = 0 ;
				}.bind(this), 300 ) ;

			} else {
				this.dblclick(ev);
				this.didFirstClick = 0 ;
			}

		}

	    this.previous_x = ev.clientX;
	    this.previous_y = ev.clientY;
	    draw_display();
	}

	mouseup(ev) {
		if(this.gesture_flg == true) return;

	    this.drag = 0;
	    draw_display();
	}

	mousemove(ev) {
		if(this.drag == 0) return;
		if(this.gesture_flg == true) return;

		//スマホ対応
		if(ev.targetTouches != undefined) {
			ev.preventDefault();	//ブラウザ標準動作を抑止する。
			ev = ev.targetTouches[0];
		}

		 //移動量
		var dx = ev.clientX - this.previous_x;
		var dy = ev.clientY - this.previous_y;

		if(this.mode == 0) {
			/*
			移動量計算
			・半径=z_scaleの円を視野角で切り取る
			・Y方向が基準となり、X方向に適用される。（アスペクト比に関係ない）
			*/
			g_trans_x += dx * z_scale / (this.c.height / 2);
			g_trans_y += -1 * dy * z_scale / (this.c.height / 2);
		} else {
			//回転
			g_rot_x += dx * g_rot_scale;
			g_rot_y += dy * g_rot_scale;
		}

	    this.previous_x = ev.clientX;
	    this.previous_y = ev.clientY;

		draw_display();

	}

	dblclick(ev) {
	    this.mode += 1;
	    this.mode = this.mode % 2;

		let e = document.getElementById('mode');
		if(this.mode == 0) {
			e.innerHTML = 'translate';
			this.c.style.cursor = 'all-scroll';
		} else {
			e.innerHTML = 'rotate';
			this.c.style.cursor = 'nw-resize';
		}

	}

	//マルチタッチ対応
	gesturechange(ev) {
		var ds = 1 - ((ev.scale - 1) * 0.05);
		z_scale = z_scale * ds;
		draw_display();
	}
	gesturestart(ev) {
		ev.preventDefault();
		this.gesture_flg = true;
	}
	gestureend(ev) {
		ev.preventDefault();
		this.gesture_flg = false;
	}

}

//MVPマトリックスを作成する。
function set_mvp(){
	let vMatrix = m.identity(m.create());
	let pMatrix = m.identity(m.create());
	let vpMatrix = m.identity(m.create());

	/*
	matIV.lookAt(eye, center, up, dest)
	eye		> カメラの位置を表すベクトル
	center	> カメラの注視点を表すベクトル
	up		> カメラの上方向を表すベクトル
	dest	> 演算結果を格納する行列
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
	fovy	> 視野角
	aspect	> スクリーンのアスペクト比
	near	> ニアクリップ
	far		> ファークリップ
	dest	> 演算結果を格納する行列
	*/
	m.perspective(90, can.c.width / can.c.height, 0.00001, 10000, pMatrix);

	m.multiply(pMatrix, vMatrix, vpMatrix);

	let mMatrix = m.identity(m.create());

	m.rotate(mMatrix, g_rot_x , [0.0, 1.0, 0.0], mMatrix);
	m.rotate(mMatrix, g_rot_y , [1.0, 0.0, 0.0], mMatrix);
	m.translate(mMatrix, [g_trans_x, g_trans_y, 0.0], mMatrix);
//	m.rotate(mMatrix, Math.PI , [1.0, 0.0, 0.0], mMatrix);

	m.multiply(vpMatrix, mMatrix, mvpMatrix);
}
