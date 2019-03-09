'use strict';


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

		//PC用
		document.addEventListener('keydown',			this.keydown.bind(this),		false);
		document.addEventListener('mousemove',		this.mousemove2.bind(this),		false);

		this.c.addEventListener('mousewheel',		this.mousewheel.bind(this),	false);
		this.c.addEventListener('mousedown',		this.mousedown.bind(this),		false);
		this.c.addEventListener('mouseup',			this.mouseup.bind(this),		false);
//		this.c.addEventListener('mousemove',		this.mousemove.bind(this),		false);
		this.c.addEventListener('dblclick',			this.dblclick.bind(this),		false);

		//スマホ用
		this.c.addEventListener('touchstart',		this.mousedown.bind(this),		false);
		this.c.addEventListener('touchmove',		this.mousemove.bind(this),		false);
		this.c.addEventListener('touchend',			this.mouseup.bind(this),		false);

		this.c.addEventListener('gesturechange',	this.gesturechange.bind(this),	false);
		this.c.addEventListener('gesturestart',		this.gesturestart.bind(this),	false);
		this.c.addEventListener('gestureend',		this.gestureend.bind(this),		false);
		this.c.style.cursor = 'all-scroll';
	}
	//キー操作
	keydown(ev) {
		let step = 1;
		let jump_step = 10;
		switch(ev.code) {
			case 'KeyW':
				view.camera_x += Math.cos(view.deg_x / 180 * Math.PI);
				view.camera_z += Math.sin(view.deg_x / 180 * Math.PI);
				break;
			case 'KeyD':
				view.camera_x -= Math.sin(view.deg_x / 180 * Math.PI);
				view.camera_z += Math.cos(view.deg_x / 180 * Math.PI);
				break;
			case 'KeyS':
				view.camera_x -= Math.cos(view.deg_x / 180 * Math.PI);
				view.camera_z -= Math.sin(view.deg_x / 180 * Math.PI);
				break;
			case 'KeyA':
				view.camera_x += Math.sin(view.deg_x / 180 * Math.PI);
				view.camera_z -= Math.cos(view.deg_x / 180 * Math.PI);
				break;
			case 'Space':
				view.camera_y += jump_step;
				anime_flg = true;

				break;
		}
		view.draw_display();
	}
	
	//マウス操作
	mousewheel(ev) {
		let del = 0.1;
		let ds = ((ev.detail || ev.wheelDelta) < 0) ? 1.1 : 0.9;
		view.z_scale = view.z_scale * ds;

		view.draw_display();
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
	    view.draw_display();
	}

	mouseup(ev) {
		if(this.gesture_flg == true) return;

	    this.drag = 0;
	    view.draw_display();
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
		let dx = ev.clientX - this.previous_x;
		let dy = ev.clientY - this.previous_y;

		if(this.mode == 0) {
			/*
			移動量計算
			・半径=z_scaleの円を視野角で切り取る
			・Y方向が基準となり、X方向に適用される。（アスペクト比に関係ない）
			*/
			view.trans_x += dx * view.z_scale / (this.c.height / 2);
			view.trans_y += -1 * dy * view.z_scale / (this.c.height / 2);
		} else {
			//回転
			view.rot_x += dx * view.rot_scale;
			view.rot_y += dy * view.rot_scale;
		}

	    this.previous_x = ev.clientX;
	    this.previous_y = ev.clientY;

		view.draw_display();

	}

	mousemove2(ev) {
		if(this.drag == 0) return;
		 //移動量
		let dx = ev.clientX - this.previous_x;
		let dy = ev.clientY - this.previous_y;

		view.deg_x += dx * view.deg_scale;
		view.deg_y += dy * view.deg_scale;
		if(view.deg_y > 90)view.deg_y = 90;
		if(view.deg_y < -90)view.deg_y = -90;
	    this.previous_x = ev.clientX;
	    this.previous_y = ev.clientY;

		view.draw_display();

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
		let ds = 1 - ((ev.scale - 1) * 0.05);
		view.z_scale = view.z_scale * ds;
		view.draw_display();
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

