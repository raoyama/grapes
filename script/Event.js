'use strict';


class Event {

	constructor() {
		this.mode = 0;	//0は移動 1は回転
		this.drag = 0;
		this.didFirstClick = 0;
		this.didKeyDown = 0;
		this.previous_x = 0;
		this.previous_y = 0;
		this.gesture_flg = false;
		this.timer;
		this.last_keyup = '';
		this.dir_scale = 0.5;

		this.key_state = {};

	}
	//キー操作
	keydown(ev) {
		this.key_state[ev.code] = true;
		log('key', JSON.stringify(this.key_state));

		//連続キー対応 キーが離された後連続で同じキーが押されたら
		if(this.didKeyDown == 1) {
			if(this.last_keyup == ev.code) {
				if(ev.code == 'Space') {
					player.a_y = 8;
				} else {
					player.speed = 2;
				}
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
		delete this.key_state[ev.code];
		log('key', JSON.stringify(this.key_state));
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

		player.add_dir_x(dx * this.dir_scale);
		player.add_dir_y(dy * this.dir_scale * -1);

		this.previous_x = ev.clientX;
	    this.previous_y = ev.clientY;
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

	buttonstart(ev, code) {
		ev.preventDefault();
		ev.code = this.getkey(code);
		this.keydown(ev);
	}

	buttonend(ev, code) {
		ev.preventDefault();
		ev.code = this.getkey(code);
		this.keyup(ev);
	}
	getkey(code) {
		switch(code) {
			case 0:	
				return 'KeyW';
			case 1:	
				return 'KeyD';
			case 2:	
				return 'KeyS';
			case 3:	
				return 'KeyA';
			case 4:	
				return 'Space';
		}
	}

}
