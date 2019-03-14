'use strict';


class Canvas {

	/*** キャンバス初期化 ***/
	constructor() {
		this.mode = 0;	//0は移動 1は回転
		this.drag = 0;
		this.didFirstClick = 0;
		this.didKeyDown = 0;
		this.previous_x = 0;
		this.previous_y = 0;
		this.gesture_flg = false;
		this.timer;

		this.key_state = {};
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
		document.addEventListener('keydown',		this.keydown.bind(this),		false);
		document.addEventListener('keyup',			this.keyup.bind(this),			false);
		window.addEventListener('blur',				this.blur.bind(this),			false);

		document.addEventListener('mousemove',		this.mousemove.bind(this),		false);
		this.c.addEventListener('mousedown',		this.mousedown.bind(this),		false);
		this.c.addEventListener('mouseup',			this.mouseup.bind(this),		false);

		//スマホ用
//		this.c.addEventListener('touchstart',		this.touchstart.bind(this),		false);
//		this.c.addEventListener('touchend',			this.touchend.bind(this),		false);
		this.c.addEventListener('touchstart',		this.touchstart.bind(this),		false);
		this.c.addEventListener('touchmove',		this.touchmove.bind(this),		false);
		this.c.addEventListener('touchend',			this.touchend.bind(this),		false);

	}
	//キー操作
	keydown(ev) {
		console.log('keydown');
		this.key_state[ev.code] = true;
		log('key', JSON.stringify(canvas.key_state));

		//連続キー対応 キーが離された後連続で同じキーが押されたら
		if(this.didKeyDown == 1) {
			if(this.last_keyup == ev.code) {
				player.speed = 2;
			}
			this.didKeyDown = 0 ;
		}
		if(this.timer == undefined) {
			this.timer = setInterval(this.keyloop.bind(this), 66);
		}
	}
	keyup(ev) {
		ev.preventDefault();

		player.speed = 1;
		//連続キー対応 キーが離された後連続で同じキーが押されたら
		if(this.didKeyDown == 0) {
			this.last_keyup = ev.code;
			this.didKeyDown = 1;
			setTimeout( function() {
				this.didKeyDown = 0 ;
			}.bind(this), 100 ) ;
		}
		console.log('keyup');
		delete this.key_state[ev.code];
		log('key', JSON.stringify(canvas.key_state));
		if(Object.keys(this.key_state).length == 0) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}
	keyloop() {
		player.keyevent();
	}
	blur() {
		this.key_state = {};
	}


	mousedown(ev) {
		if(this.gesture_flg == true) return;
	    this.drag = 1;

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

		//移動量
		let dx = ev.clientX - this.previous_x;
		let dy = ev.clientY - this.previous_y;

		player.view_x += dx * player.view_scale;
		player.view_y -= dy * player.view_scale;
		player.view_x = player.view_x % 360;
		if(player.view_y > 90)player.view_y = 90;
		if(player.view_y < -90)player.view_y = -90;
	    this.previous_x = ev.clientX;
	    this.previous_y = ev.clientY;
		log('view_x', player.view_x);
		log('view_y', player.view_y);
		view.draw_display();
	}

	touchstart(ev) {
		ev.preventDefault();
		ev = ev.targetTouches[0];
		this.mousedown(ev);
	}

	touchmove(ev) {
		ev.preventDefault();
		ev = ev.targetTouches[0];
		this.mousemove(ev);
	}

	touchend(ev) {
		ev.preventDefault();
		ev = ev.targetTouches[0];
		this.mouseup(ev);
	}



}

