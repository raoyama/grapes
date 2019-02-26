//******************************************************************************
//* データごとに定義
//******************************************************************************
var g_range_x;				//X軸のデータ-座標比
var g_range_y		= 1;	//Y軸のデータ-座標比（固定）
var g_point_size	= 5;	//点描画のサイズ

var g_aspect_ratio				= 6;	//データ部分のアスペクト比（数字が多いと横長）
var g_scale_line_x_split_num	= 30;	//Y軸目盛線　分割数
var g_scale_line_y_split_num	= 10;	//Y軸目盛線　分割数
var g_scale_line_y_min			= undefined;	//Y軸目盛線　最小値(undefinedだと自動計算)
//var g_scale_line_y_min			= 0.5;	//Y軸目盛線　最小値(undefinedだと自動計算)
//var g_scale_line_y_max			= 1.5;	//Y軸目盛線　最大値
//var g_scale_line_y_step			= 0.131;	//Y軸目盛線　幅

//******************************************************************************
//* 変数定義
//******************************************************************************
var prg_data;
var prg_texture;
var loc_data_position;
var loc_data_color;
var loc_data_mvpMatrix;
var loc_data_pointSize;
var loc_texture_position;
var loc_texture_textureCoord;
var loc_texture_mvpMatrix;
var loc_texture_texture;

//VBO
var vbo_base_pos;
var vbo_base_clr;
var vbo_data_pos_list = [];		//データ ポジション VBO配列
var vbo_data_clr_list = [];		//データ 色 VBO配列
var vbo_label_x_pos_list = [];	//ラベルX軸 ポジション VBO配列
var vbo_label_y_pos_list = [];	//ラベルY軸 ポジション VBO配列
var vbo_scale_lines_pos;		//目盛線 ポジション
var vbo_scale_lines_clr;		//目盛線 色
var texture_label_x_list = [];	//ラベルX軸 テクスチャ 配列
var texture_label_y_list = [];	//ラベルY軸 テクスチャ 配列
var vbo_label_textureCoord;		//テクスチャ用 ポジション VBO
var ibo_label;					//テクスチャIBO

//データ
var data_num;					//データ数
var data_pos_list = [];			//データ ポジション 配列
var data_clr_list = [];			//データ 色 配列
var series_num;					//系列数
var series_list;				//系列
var label_x_datas = [];			//ラベルX軸
var label_y_datas = [];			//ラベルY軸
var scale_lines_pos = [];		//目盛線 ポジション
var scale_lines_cls = [];		//目盛線 色
var base_pos;					//基準線 ポジション
var base_clr;					//基準線 色

var checked_list;				//選択された列オブジェクト
var with_point_flg = false;		//選択された列オブジェクト

var textures = [];
//******************************************************************************
//* 初期化
//******************************************************************************
onload = function(){

	init_canvas();

	init_gl();

	//データ読み込み
	convert_data2();

	//凡例表示
	disp_legend();

	//ラベル
	init_labels();

	//データ
	init_datas();

	//目盛線
	init_scale_lines();

	//基準線
	init_base();

	draw_display();

};


//******************************************************************************
//* 描画
//******************************************************************************
function draw_display() {

	gl_clear();

	set_mvp();

	//ラベル
	draw_labels();

	//データ
	draw_datas();

	//目盛線
	draw_scale_lines();

	//基準線
	draw_base();

	// コンテキストの再描画
	gl.flush();

}

//******************************************************************************
//* 共通初期処理
//******************************************************************************
function init_gl() {

	//データ シェーダー
	prg_data = make_program_var(shader_data_vs, shader_data_fs);
//	prg_data = make_program('data_vs', 'data_fs');
	loc_data_position	= gl.getAttribLocation(prg_data, 'position');
	loc_data_color		= gl.getAttribLocation(prg_data, 'color');
	loc_data_mvpMatrix	= gl.getUniformLocation(prg_data, 'mvpMatrix');
	loc_data_pointSize	= gl.getUniformLocation(prg_data, 'pointSize');

	//テクスチャー シェーダー
	prg_texture = make_program_var(shader_texture_vs, shader_texture_fs);
//	prg_texture = make_program_var('texture_vs', 'texture_fs');
	loc_texture_position		= gl.getAttribLocation(prg_texture, 'position');
	loc_texture_textureCoord	= gl.getAttribLocation(prg_texture, 'textureCoord');
	loc_texture_mvpMatrix		= gl.getUniformLocation(prg_texture, 'mvpMatrix');
	loc_texture_texture			= gl.getUniformLocation(prg_texture, 'texture');

	// 深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

}

//******************************************************************************
//* データ読込&変換処理
//******************************************************************************
//変数「data」が定義されている事
function convert_data() {

	data_num	= data.length - 1;				//データ個数
	series_num	= data[0].length - 1;			//系列数
	clr_deg		= Math.floor(360 / series_num);	//系列ごとの色角度

	//系列分格納場所作成
	for(i = 0;i < series_num;i ++) {
		data_pos_list[i] = new Array();
		data_clr_list[i] = new Array();
	}

	//系列名を格納
	series_list = data[0];
	series_list.shift();

	data.shift();

	//一旦データを走査する
	g_data_y_min = 100000000;
	g_data_y_max = 0;
	for(i = 0;i < data.length;i ++) {
		for(j = 1;j < data[i].length;j ++) {
			if(g_data_y_min > data[i][j])g_data_y_min = data[i][j];
			if(g_data_y_max < data[i][j])g_data_y_max = data[i][j];
		}
	}
	g_data_y_center		= (g_data_y_min + g_data_y_max) / 2;
	g_data_y_width		= g_data_y_max - g_data_y_min;
	g_data_y_step		= g_data_y_width / g_scale_line_y_split_num;
	g_data_x_min		= 0;
	g_data_x_max		= data.length;
	g_data_x_center		= (g_data_x_min + g_data_x_max) / 2;
	g_data_x_width		= g_data_x_max - g_data_x_min;

	//初期化可能変数
	g_range_x = g_data_y_width / g_data_x_width * g_aspect_ratio;

	//描画中心を移動
	g_trans_x = - g_data_x_center * g_range_x;
	g_trans_y = - g_data_y_center * g_range_y;
	z_scale = g_data_y_width;

	//変数カスタム初期化
	init_custom_var();

	var scale_line_x_span = Math.floor(data_num / g_scale_line_x_split_num);

	//データの個数ループ
	for(i = 0;i < data.length;i ++) {

		var line = data[i];

		//X軸ラベルを取得
		label_name = line[0];	//["20160909",10,10,10]
		line.shift();

		//ラベル・目盛線データ格納
		if(i % scale_line_x_span == 0) {
			label_x_datas.push([label_name, i]);
		}

		//系列ごとループ
		for(j = 0;j < line.length;j ++) {
			if(line[j] == undefined) continue;

			//POS
			data_pos_list[j].push(g_range_x * i);	//X座標
			data_pos_list[j].push(line[j]);		//Y座標
			data_pos_list[j].push(0);			//Z座標

			//COLOR
			rgb = hsv2rgb(clr_deg * j);
			data_clr_list[j].push(rgb['r']/256);
			data_clr_list[j].push(rgb['g']/256);
			data_clr_list[j].push(rgb['b']/256);
			data_clr_list[j].push(1);
		}
	}

	//Y軸ラベル・目盛線データ作成
	if(g_scale_line_y_min == undefined) {
		g_scale_line_y_min = g_data_y_min;
		g_scale_line_y_max = g_data_y_max;
		g_scale_line_y_step = g_data_y_step;
	}
	for(i = g_scale_line_y_min;i <= g_scale_line_y_max;i += g_scale_line_y_step) {
		var n = 100;	//小数点3ケタ
		label_y_datas.push([Math.round(i * n)/n + "", i]);
	}
}

//変数「data_header」、「data」が定義されている事
function convert_data2() {

	var data_col_num	= data_header.length;		//データの列数
	series_num		= data_col_num - 1;	//系列数
	data_num	= data.length / data_col_num;		//データ個数
	clr_deg		= Math.floor(360 / series_num);	//系列ごとの色角度

	//系列分格納場所作成
	for(i = 0;i < data_col_num;i ++) {
		data_pos_list[i] = new Array();
		data_clr_list[i] = new Array();
	}

	//系列名を格納
	series_list = data_header;
	series_list.shift();


	//一旦データを走査する
	g_data_y_min = 100000000;
	g_data_y_max = 0;
	for(i = 0;i < data.length;i += data_col_num) {
		for(j = 1;j < data_col_num;j ++) {
			if(g_data_y_min > data[i + j])g_data_y_min = data[i + j];
			if(g_data_y_max < data[i + j])g_data_y_max = data[i + j];
		}
	}
	g_data_y_center		= (g_data_y_min + g_data_y_max) / 2;
	g_data_y_width		= g_data_y_max - g_data_y_min;
	g_data_y_step		= g_data_y_width / g_scale_line_y_split_num;
	g_data_x_min		= 0;
	g_data_x_max		= data.length / data_col_num;
	g_data_x_center		= (g_data_x_min + g_data_x_max) / 2;
	g_data_x_width		= g_data_x_max - g_data_x_min;

	//初期化可能変数
	g_range_x = g_data_y_width / g_data_x_width * g_aspect_ratio;

	//描画中心を移動
	g_trans_x = - g_data_x_center * g_range_x;
	g_trans_y = - g_data_y_center * g_range_y;
	z_scale = g_data_y_width;

	//変数カスタム初期化
	init_custom_var();

	var scale_line_x_span = Math.floor(data_num / g_scale_line_x_split_num);

	//データの個数ループ
	for(i = 0;i < data.length / data_col_num;i ++) {

		var line = new Array();
		for(j = 0;j < data_col_num;j ++) {
			line.push(data[i * data_col_num + j]);
		}

		//X軸ラベルを取得
		label_name = line[0];	//["20160909",10,10,10]
		line.shift();

		//ラベル・目盛線データ格納
		if(i % scale_line_x_span == 0) {
			label_x_datas.push([label_name, i]);
		}

		//系列ごとループ
		for(j = 0;j < line.length;j ++) {
			if(line[j] == undefined) continue;

			//POS
			data_pos_list[j].push(g_range_x * i);	//X座標
			data_pos_list[j].push(line[j]);		//Y座標
			data_pos_list[j].push(0);			//Z座標

			//COLOR
			rgb = hsv2rgb(clr_deg * j);
			data_clr_list[j].push(rgb['r']/256);
			data_clr_list[j].push(rgb['g']/256);
			data_clr_list[j].push(rgb['b']/256);
			data_clr_list[j].push(1);
		}
	}

	//Y軸ラベル・目盛線データ作成
	if(g_scale_line_y_min == undefined) {
		g_scale_line_y_min = g_data_y_min;
		g_scale_line_y_max = g_data_y_max;
		g_scale_line_y_step = g_data_y_step;
	}
	for(i = g_scale_line_y_min;i <= g_scale_line_y_max;i += g_scale_line_y_step) {
		var n = 100;	//小数点3ケタ
		label_y_datas.push([Math.round(i * n)/n + "", i]);
	}
}

//******************************************************************************
//* ラベル処理
//******************************************************************************
function init_labels() {

	var label_height		= 0.1;
	var length_to_width		= 0.05;
	var length_to_width_px	= 32;	//2の階乗
	var label_width;
	var label_width_px;
	var label_z			= -0.0001;

	var max_length		= 0;

	//X軸ラベル
	//※テクスチャのpxサイズは2の階乗である必要があるので
	//length_to_width_pxとmax_lengthの両方を2の階乗にする。
	max_length		= get_max_length(label_x_datas);
	label_width		= max_length * length_to_width;
	label_width_px	= max_length * length_to_width_px;

	//ポジション、テクスチャ設定
	for(i = 0;i < label_x_datas.length;i ++) {
		pos = label_x_datas[i][1] * g_range_x;
		var label_pos = [
			0 + pos,				0,				label_z,
			0 + pos,				- label_width,	label_z,
			label_height + pos,		- label_width,	label_z,
			label_height + pos,		0,				label_z
		];
		vbo_label_x_pos_list[i] = create_vbo(label_pos);

		texture_label_x_list[i] = make_string_texture(label_x_datas[i][0], label_width_px);
	}

	//Y軸ラベル
	max_length = get_max_length(label_y_datas);
	label_width		= max_length * length_to_width;
	label_width_px	= max_length * length_to_width_px;

	//ポジション、テクスチャ設定
	for(i = 0;i < label_y_datas.length;i ++) {
		pos = label_y_datas[i][1] * g_range_y;
		var label_pos = [
			- label_width,	pos,				label_z,
			0,				pos,				label_z,
			0,				label_height + pos,	label_z,
			- label_width,	label_height + pos,	label_z
		];
		vbo_label_y_pos_list[i] = create_vbo(label_pos);

		texture_label_y_list[i] = make_string_texture(label_y_datas[i][0], label_width_px);
	}

	// テクスチャ座標
	var label_textureCoord = [
		0.0, 1.0,
		1.0, 1.0,
		1.0, 0.0,
		0.0, 0.0,
	];
	vbo_label_textureCoord = create_vbo(label_textureCoord);	//共通

	var label_index = [
		0, 1, 2,
		0, 2, 3,
	];
	ibo_label = create_ibo(label_index);						//共通
}

//最大文字数取得
//["20160909",0.5],…形式の配列からラベルの最大文字数取得
//それを超える最大の2の階乗の値にする。
function get_max_length(tgt) {
	max_length		= 0;
	for(i = 0;i < tgt.length;i ++) {
		tmp_str = tgt[i][0] + "";
		tmp_length = tmp_str.length;
		if(max_length < tmp_length)max_length = tmp_length;
	}
	var pow_max_length = 2;
	while(1) {
		if(max_length <= pow_max_length)break;
		pow_max_length *= 2;
	}
	return pow_max_length;
}

function draw_labels() {
	gl.useProgram(prg_texture);
	for(i = 0;i < label_x_datas.length;i ++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_label_x_pos_list[i]);
		gl.enableVertexAttribArray(loc_texture_position);
		gl.vertexAttribPointer(loc_texture_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_label_textureCoord);
		gl.enableVertexAttribArray(loc_texture_textureCoord);
		gl.vertexAttribPointer(loc_texture_textureCoord, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo_label);

		gl.bindTexture(gl.TEXTURE_2D, texture_label_x_list[i]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.uniformMatrix4fv(loc_texture_mvpMatrix, false, mvpMatrix);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

	for(i = 0;i < label_y_datas.length;i ++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_label_y_pos_list[i]);
		gl.enableVertexAttribArray(loc_texture_position);
		gl.vertexAttribPointer(loc_texture_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_label_textureCoord);
		gl.enableVertexAttribArray(loc_texture_textureCoord);
		gl.vertexAttribPointer(loc_texture_textureCoord, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo_label);

		gl.bindTexture(gl.TEXTURE_2D, texture_label_y_list[i]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.uniformMatrix4fv(loc_texture_mvpMatrix, false, mvpMatrix);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

}

function make_string_texture(str, width) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = 64;
	var ctx = canvas.getContext('2d');
	ctx.font = "bold 36px 'メイリオ'";
	ctx.fillStyle = 'rgba(0,0,0,1.0)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fillText(str, 10, 47);
	return create_texture_canvas(canvas);
}
//******************************************************************************
//* 目盛線処理
//******************************************************************************
function init_scale_lines() {

	//X軸目盛線用ポイント・色作成
	for(i = 0;i < label_x_datas.length;i ++) {
		scale_lines_pos.push(g_range_x * label_x_datas[i][1]);
		scale_lines_pos.push(-g_data_y_max * 3);
		scale_lines_pos.push(0);
		scale_lines_pos.push(g_range_x * label_x_datas[i][1]);
		scale_lines_pos.push(g_data_y_max * 3);
		scale_lines_pos.push(0);

		for(j  = 0;j < 2;j++) {
			scale_lines_cls.push(0.5);
			scale_lines_cls.push(0.5);
			scale_lines_cls.push(0.5);
			scale_lines_cls.push(1);
		}
	}

	for(i = 0;i < label_y_datas.length;i ++) {
		scale_lines_pos.push(-g_data_x_max);
		scale_lines_pos.push(g_range_y * label_y_datas[i][1]);
		scale_lines_pos.push(0);
		scale_lines_pos.push(g_data_x_max * g_range_x);
		scale_lines_pos.push(g_range_y * label_y_datas[i][1]);
		scale_lines_pos.push(0);

		for(j  = 0;j < 2;j++) {
			scale_lines_cls.push(0.3);
			scale_lines_cls.push(0.3);
			scale_lines_cls.push(0.3);
			scale_lines_cls.push(1);
		}
	}

	vbo_scale_lines_pos = create_vbo(scale_lines_pos);
	vbo_scale_lines_cls = create_vbo(scale_lines_cls);
}

//目盛線描画
function draw_scale_lines() {

	gl.useProgram(prg_data);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_scale_lines_pos);
	gl.enableVertexAttribArray(loc_data_position);
	gl.vertexAttribPointer(loc_data_position, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_scale_lines_cls);
	gl.enableVertexAttribArray(loc_data_color);
	gl.vertexAttribPointer(loc_data_color, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//線描画
	gl.uniformMatrix4fv(loc_data_mvpMatrix, false, mvpMatrix);
	gl.drawArrays(gl.LINES, 0, scale_lines_pos.length / 3);
}


//******************************************************************************
//* データ表示処理
//******************************************************************************
function init_datas() {
	for(i = 0;i < series_num;i ++) {
		vbo_data_pos_list.push(create_vbo(data_pos_list[i]));
		vbo_data_clr_list.push(create_vbo(data_clr_list[i]));
	}
}

function draw_datas() {
	gl.useProgram(prg_data);

	//系列数ループ
	for(i = 0;i < series_num;i ++) {
		if(checked_list[i] == false) {
			continue;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_data_pos_list[i]);
		gl.enableVertexAttribArray(loc_data_position);
		gl.vertexAttribPointer(loc_data_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_data_clr_list[i]);
		gl.enableVertexAttribArray(loc_data_color);
		gl.vertexAttribPointer(loc_data_color, 4, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		//線描画
		gl.uniformMatrix4fv(loc_data_mvpMatrix, false, mvpMatrix);
		gl.drawArrays(gl.LINE_STRIP, 0, data_pos_list[i].length / 3);

		//点描画
		if(with_point_flg == true) {
			gl.uniform1f(loc_data_pointSize, g_point_size);
			gl.drawArrays(gl.POINTS, 0, data_pos_list[i].length / 3);
		}
	}
}

//******************************************************************************
//* 基準線処理
//******************************************************************************
function init_base() {
	base_pos = [
		0,-1000,0,
		0,1000,0,
		-1000,0,0,
		1000,0,0,
	];
	base_clr = [
		1,1,1,1,
		1,1,1,1,
		1,1,1,1,
		1,1,1,1,
	];

	vbo_base_pos = create_vbo(base_pos);
	vbo_base_clr = create_vbo(base_clr);
}

function draw_base() {
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_base_pos);
	gl.enableVertexAttribArray(loc_data_position);
	gl.vertexAttribPointer(loc_data_position, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_base_clr);
	gl.enableVertexAttribArray(loc_data_color);
	gl.vertexAttribPointer(loc_data_color, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//線描画
	gl.uniformMatrix4fv(loc_data_mvpMatrix, false, mvpMatrix);
	gl.drawArrays(gl.LINES, 0, base_pos.length/3); 

}

//******************************************************************************
//* 凡例表示処理
//******************************************************************************
function disp_legend() {
	e = document.getElementById("legend");

	//点表示
	elemLi = document.createElement('li');
	elemLi.innerHTML = '<input type="checkbox" name="with_point" id="with_point" onclick="with_point();"></input>' 
	+ '<label for="with_point">with point</label>';
	e.appendChild(elemLi);

	//全選択
	var elemLi = document.createElement('li');
	elemLi.innerHTML = '<input type="checkbox" name="all_check" id="all_check" checked onclick="all_check();"></input>' 
	+ '<label for="all_check">all check</label>';
	e.appendChild(elemLi);

	//仕切り線
	elemLi = document.createElement('hr');
	e.appendChild(elemLi);

	//凡例作成
	clr_deg = Math.floor(360 / series_num);
	for(i = 0;i < series_num;i ++) {

		elemLi = document.createElement('li');
		var id = 'check_' + i;
		elemLi.innerHTML = '<input type="checkbox" name="' + id +'" id="'+id+'" checked onclick="get_check_status();"></input>' 
		+ '<label for="'+id+'">' + series_list[i] + '[' + data_pos_list[i].length/3 + ']</label>';

		rgb = hsv2rgb(clr_deg * i);
		var color_str = 'rgb(' + rgb['r']+ ',' + rgb['g'] + ',' + rgb['b'] + ')';
		elemLi.style.color = color_str;
		e.appendChild(elemLi);
	}

	//選択状態初期化
	checked_list = new Object();
	for(i = 0;i < series_num;i ++) {
		checked_list[i] = true;
	}
}

//選択状態取得
function get_check_status() {
	checked_list = new Object();
	for(i = 0;i < series_num;i ++) {
		e = document.getElementById('check_' + i);
		if(e.checked == true) {
			checked_list[i] = true;
		} else {
			checked_list[i] = false;
		}
	}
	draw_display();
}

//全選択/解除 切替
function all_check() {
	checked_list = new Object();
	ea = document.getElementById('all_check');

	for(i = 0;i < series_num;i ++) {
		e = document.getElementById('check_' + i);
		if(ea.checked == true) {
			checked_list[i] = true;
			e.checked = true;
		} else {
			checked_list[i] = false;
			e.checked = false;
		}
	}
	draw_display();
}

//点描画 切替
function with_point() {
	e = document.getElementById('with_point');

	if(e.checked == true) {
		with_point_flg = true;
	} else {
		with_point_flg = false;
	}
	draw_display();
}

//凡例 表示/非表示 切替
function change_legend() {
	var elem = document.getElementById("legend")
	if(elem.style.display == "block") {
		elem.style.display = "none";
	} else {
		elem.style.display = "block";
	}
}

