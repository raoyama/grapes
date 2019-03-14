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
		// そのため各関数に.bind(event)つけて強制する。 ※setTimeoutも同様

		//PC用
		document.addEventListener('keydown',		evt.keydown.bind(evt),		false);
		document.addEventListener('keyup',			evt.keyup.bind(evt),			false);
		window.addEventListener('blur',				evt.blur.bind(evt),			false);

		document.addEventListener('mousemove',		evt.mousemove.bind(evt),		false);
		this.c.addEventListener('mousedown',		evt.mousedown.bind(evt),		false);
		this.c.addEventListener('mouseup',			evt.mouseup.bind(evt),		false);

		//スマホ用
		this.c.addEventListener('touchstart',		evt.touchstart.bind(evt),	false);
		this.c.addEventListener('touchmove',		evt.touchmove.bind(evt),		false);
		this.c.addEventListener('touchend',			evt.touchend.bind(evt),		false);

	}
}

