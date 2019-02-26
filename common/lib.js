// WebGLでポリゴンを描画する
var gl;
var c;

var m = new matIV();
var mMatrix = m.identity(m.create());
var vMatrix = m.identity(m.create());
var pMatrix = m.identity(m.create());
var vpMatrix = m.identity(m.create());
var mvpMatrix = m.identity(m.create());
var tmpMatrix1 = m.identity(m.create());

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

// シェーダを生成する関数
function create_shader(id){
	// シェーダを格納する変数
	var shader;
	
	// HTMLからscriptタグへの参照を取得
	var scriptElement = document.getElementById(id);
	
	// scriptタグが存在しない場合は抜ける
	if(!scriptElement){return;}
	
	// scriptタグのtype属性をチェック
	switch(scriptElement.type){
		
		// 頂点シェーダの場合
		case 'x-shader/x-vertex':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
			
		// フラグメントシェーダの場合
		case 'x-shader/x-fragment':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default :
			return;
	}
	
	// 生成されたシェーダにソースを割り当てる
	gl.shaderSource(shader, scriptElement.text);
	
	// シェーダをコンパイルする
	gl.compileShader(shader);
	
	// シェーダが正しくコンパイルされたかチェック
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		
		// 成功していたらシェーダを返して終了
		return shader;
	}else{
		
		// 失敗していたらエラーログをアラートする
		alert(gl.getShaderInfoLog(shader));
	}
}

// プログラムオブジェクトを生成しシェーダをリンクする関数
function create_program(vs, fs){
	// プログラムオブジェクトの生成
	var program = gl.createProgram();
	
	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	
	// シェーダをリンク
	gl.linkProgram(program);
	
	// シェーダのリンクが正しく行なわれたかチェック
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
	
		// 成功していたらプログラムオブジェクトを有効にする
//		gl.useProgram(program);

		// プログラムオブジェクトを返して終了
		return program;
	}else{
		
		// 失敗していたらエラーログをアラートする
		alert(gl.getProgramInfoLog(program));
	}
}


function make_program(vs_id, fs_id){
	vs = create_shader(vs_id);
	fs = create_shader(fs_id);
	return create_program(vs, fs);
}

// シェーダを変数から生成する関数
function make_program_var(str_vs, str_fs){
	vs = create_shader_var(str_vs, 'vs');
	fs = create_shader_var(str_fs, 'fs');
	return create_program(vs, fs);
}

function create_shader_var(str, type){
	var shader;
	switch(type){
		case 'vs':
			shader = gl.createShader(gl.VERTEX_SHADER);
			break;
		case 'fs':
			shader = gl.createShader(gl.FRAGMENT_SHADER);
			break;
		default :
			return;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		return shader;
	}else{
		alert(gl.getShaderInfoLog(shader));
	}
}

// テクスチャを生成する関数
function create_texture(source, n){
	// イメージオブジェクトの生成
	var img = new Image();
	
	// データのオンロードをトリガーにする
	img.onload = function(){
		// テクスチャオブジェクトの生成
		var tex = gl.createTexture();
		
		// テクスチャをバインドする
		gl.bindTexture(gl.TEXTURE_2D, tex);
		
		// テクスチャへイメージを適用
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		
		// ミップマップを生成
		gl.generateMipmap(gl.TEXTURE_2D);
		
		// テクスチャのバインドを無効化
		gl.bindTexture(gl.TEXTURE_2D, null);
		
		// 生成したテクスチャをグローバル変数に代入
		textures[n] = tex;
		draw_display();

	};
	// イメージオブジェクトのソースを指定
	img.src = source;
}

// テクスチャを生成する関数
function create_texture_canvas(element){
	// テクスチャオブジェクトの生成
	var tex = gl.createTexture();
	
	// テクスチャをバインドする
	gl.bindTexture(gl.TEXTURE_2D, tex);
	
	// テクスチャへイメージを適用
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
	
	// ミップマップを生成
	gl.generateMipmap(gl.TEXTURE_2D);
	
	// テクスチャのバインドを無効化
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	return tex;
}


// VBOを生成する関数
function create_vbo(data){
	// バッファオブジェクトの生成
	var vbo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// 生成した VBO を返して終了
	return vbo;
}
// IBOを生成する関数
function create_ibo(data){
	// バッファオブジェクトの生成
	var ibo = gl.createBuffer();

	// バッファをバインドする
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	// バッファにデータをセット
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

	// バッファのバインドを無効化
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	// 生成したIBOを返して終了
	return ibo;
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


//HSV変換RGB変換
function hsv2rgb(h) {
	hsv = { 'h': 0.0, 's': 1.0, 'v': 0.9 };	//vは明るさ
	hsv.h = h;
	var h_index = Math.floor( hsv.h / 60 ) % 6;
	var f = hsv.h / 60 - h_index;
	var p = hsv.v * ( 1 - hsv.s );
	var q = hsv.v * ( 1 - f * hsv.s );
	var t = hsv.v * ( 1 - ( 1 - f ) * hsv.s );

	var v = hsv.v;
	var r, g, b;
	var rgb = "#000000";

	switch ( h_index ) {
	case 0 : {
		r = v; g = t; b = p;
		break;
	}
	case 1 : {
		r = q; g = v; b = p;
		break;
	}
	case 2 : {
		r = p; g = v; b = t;
		break;
	}
	case 3 : {
		r = p; g = q; b = v;
		break;
	}
	case 4 : {
		r = t; g = p; b = v;
		break;
	}
	case 5 : {
		r = v; g = p; b = q;
		break;
	}
	default : {
		console.log( 'Warning : "H index" calculation is incorrect.' );
		r = v; g = t; b = p;
		break;
	}
	}
	r = Math.floor( r * 255 );
	g = Math.floor( g * 255 );
	b = Math.floor( b * 255 );
	return { 'r': r, 'g': g, 'b': b };

	rgb = "#";
	rgb += ("0" + r.toString(16)).slice(-2);
	rgb += ("0" + g.toString(16)).slice(-2);
	rgb += ("0" + b.toString(16)).slice(-2);

	return rgb;
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
			ret.push(a1[i * col + j] + a2[j]);
		}
	}
	return ret;
}
