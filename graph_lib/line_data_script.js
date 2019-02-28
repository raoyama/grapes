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
var prg_lines;
var prg_texture;

var loc_data_position;
var loc_data_color;
var loc_data_mvpMatrix;
var loc_data_pointSize;
var loc_lines_position;
var loc_lines_textureCoord;
var loc_texture_position;
var loc_texture_textureCoord;
var loc_texture_mvpMatrix;
var loc_texture_texture;

//VBO
var vbo_line_pos;
var vbo_data_pos;
var vbo_data_cls;
var vbo_data_size;
var vertex_position = [
	// Front face
	-1.0, -1.0,  1.0,
	1.0, -1.0,  1.0,
	1.0,  1.0,  1.0,
	-1.0,  1.0,  1.0,

	// Back face
	-1.0, -1.0, -1.0,
	-1.0,  1.0, -1.0,
	1.0,  1.0, -1.0,
	1.0, -1.0, -1.0,

	// Top face
	-1.0,  1.0, -1.0,
	-1.0,  1.0,  1.0,
	1.0,  1.0,  1.0,
	1.0,  1.0, -1.0,

	// Bottom face
	-1.0, -1.0, -1.0,
	1.0, -1.0, -1.0,
	1.0, -1.0,  1.0,
	-1.0, -1.0,  1.0,

	// Right face
	1.0, -1.0, -1.0,
	1.0,  1.0, -1.0,
	1.0,  1.0,  1.0,
	1.0, -1.0,  1.0,

	// Left face
	-1.0, -1.0, -1.0,
	-1.0, -1.0,  1.0,
	-1.0,  1.0,  1.0,
	-1.0,  1.0, -1.0,
];
var textures = [];
var ibo;
var index = [
	0, 1, 2,      0, 2, 3,    // Front face
	4, 5, 6,      4, 6, 7,    // Back face
	8, 9, 10,     8, 10, 11,  // Top face
	12, 13, 14,   12, 14, 15, // Bottom face
	16, 17, 18,   16, 18, 19, // Right face
	20, 21, 22,   20, 22, 23  // Left face
];

// テクスチャ座標
var textureCoord = [
	// Front face
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,

	// Back face
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,

	// Top face
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,

	// Bottom face
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,

	// Right face
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,

	// Left face
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
];
var baseMatrix = m.identity(m.create());


//******************************************************************************
//* 初期化
//******************************************************************************
onload = function(){

	init_canvas();
	gl.enable(gl.CULL_FACE);	//カリング有効

	init_gl();

	vbo_textureCoord = create_vbo(textureCoord);

	ibo = create_ibo(index);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	//データ
	init_datas();

	draw_display();

};


//******************************************************************************
//* 描画
//******************************************************************************
function draw_display() {

	gl_clear();

	set_mvp();
	m.copy(mvpMatrix ,baseMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo1);
	gl.enableVertexAttribArray(loc_texture_position);
	gl.vertexAttribPointer(loc_texture_position, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_textureCoord);
	gl.enableVertexAttribArray(loc_texture_textureCoord);
	gl.vertexAttribPointer(loc_texture_textureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	draw_block(0, 0, 0, 0);

	//データ
	draw_datas();

//	draw_block(10, 10, 0, 1);

	// コンテキストの再描画
	gl.flush();

}

//******************************************************************************
//* 共通初期処理
//******************************************************************************
function init_gl() {

	//位置、色、サイズシェーダー
	prg_data = make_program_var(shader_pcs_vs, shader_pcs_fs);
//	prg_data = make_program('data_vs', 'data_fs');
	loc_data_position	= gl.getAttribLocation(prg_data, 'position');
	loc_data_color		= gl.getAttribLocation(prg_data, 'color');
	loc_data_mvpMatrix	= gl.getUniformLocation(prg_data, 'mvpMatrix');
	loc_data_pointSize	= gl.getAttribLocation(prg_data, 'pointSize');

	//位置シェーダー
	prg_lines = make_program_var(shader_p_vs, shader_p_fs);
	loc_lines_position = gl.getAttribLocation(prg_lines, 'position');
	loc_lines_mvpMatrix = gl.getUniformLocation(prg_lines, 'mvpMatrix');

	//テクスチャー シェーダー
	prg_texture = make_program_var(shader_texture_vs, shader_texture_fs);
	loc_texture_position		= gl.getAttribLocation(prg_texture, 'position');
	loc_texture_textureCoord	= gl.getAttribLocation(prg_texture, 'textureCoord');
	loc_texture_mvpMatrix		= gl.getUniformLocation(prg_texture, 'mvpMatrix');
	loc_texture_texture			= gl.getUniformLocation(prg_texture, 'texture');

	// 深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	create_texture('texture/block1.png', 0);
	create_texture('texture/block2.png', 1);

	vbo1 = create_vbo(vertex_position);

	vbo_textureCoord = create_vbo(textureCoord);

	ibo = create_ibo(index);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

}

//******************************************************************************
//* データ表示処理
//******************************************************************************
function init_datas() {
	vbo_line_pos = create_vbo(line_pos);
	vbo_data_pos = create_vbo(data_pos);
	vbo_data_cls = create_vbo(data_cls);
	vbo_data_size = create_vbo(data_size);
}

function draw_datas() {

	// --------- ライン描画 --------
	gl.useProgram(prg_lines);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_line_pos);
	gl.enableVertexAttribArray(loc_lines_position);
	gl.vertexAttribPointer(loc_lines_position, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.uniformMatrix4fv(loc_lines_mvpMatrix, false, mvpMatrix);
	gl.drawArrays(gl.LINES , 0, line_pos.length / 3);

	// --------- 点描画 ---------
	gl.useProgram(prg_data);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_data_pos);
	gl.enableVertexAttribArray(loc_data_position);
	gl.vertexAttribPointer(loc_data_position, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_data_cls);
	gl.enableVertexAttribArray(loc_data_color);
	gl.vertexAttribPointer(loc_data_color, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_data_size);
	gl.enableVertexAttribArray(loc_data_pointSize);
	gl.vertexAttribPointer(loc_data_pointSize, 1, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.uniformMatrix4fv(loc_data_mvpMatrix, false, mvpMatrix);
	gl.drawArrays(gl.POINTS, 0, data_pos.length / 3);


}
function draw_block(x,y,z, id) {
	trans_size = 2.0;
	a = [x,y,z];
	trans = vec_mul([trans_size, trans_size, trans_size], a);
	gl.useProgram(prg_texture);

	//移動
	gl.bindTexture(gl.TEXTURE_2D, textures[id]);
//	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	m.translate(baseMatrix, trans, mvpMatrix);
	gl.uniformMatrix4fv(loc_texture_mvpMatrix, false, mvpMatrix);
	gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

}

