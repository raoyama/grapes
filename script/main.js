
//******************************************************************************
//* 変数定義
//******************************************************************************

var prg_texture;
var loc_texture_position;
var loc_texture_textureCoord;
var loc_texture_mvpMatrix;
var loc_texture_texture;

var shaderP;
var shaderPcs;

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

	init_gl();

	draw_display();

};


//******************************************************************************
//* 描画
//******************************************************************************
function draw_display() {

	gl_clear();

	set_mvp();
	m.copy(mvpMatrix ,baseMatrix);

	shaderPcs.draw(mvpMatrix);

	shaderP.draw(mvpMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo1);
	gl.enableVertexAttribArray(loc_texture_position);
	gl.vertexAttribPointer(loc_texture_position, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_textureCoord);
	gl.enableVertexAttribArray(loc_texture_textureCoord);
	gl.vertexAttribPointer(loc_texture_textureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//ブロック
	draw_block(0, 0, 0, 0);

	// コンテキストの再描画
	gl.flush();

}

//******************************************************************************
//* 共通初期処理
//******************************************************************************
function init_gl() {


	shaderPcs = new ShaderPcs(data_pos, data_cls, data_size);
	shaderP = new ShaderP(line_pos);

	
	gl.enable(gl.CULL_FACE);	//カリング有効

	//テクスチャー シェーダー
	prg_texture = GlCommon.make_program_var(shader_texture_vs, shader_texture_fs);
	loc_texture_position		= gl.getAttribLocation(prg_texture, 'position');
	loc_texture_textureCoord	= gl.getAttribLocation(prg_texture, 'textureCoord');
	loc_texture_mvpMatrix		= gl.getUniformLocation(prg_texture, 'mvpMatrix');
	loc_texture_texture			= gl.getUniformLocation(prg_texture, 'texture');

	// 深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	GlCommon.create_texture('texture/block1.png', 0);
	GlCommon.create_texture('texture/block2.png', 1);

	vbo1 = GlCommon.create_vbo(vertex_position);

	vbo_textureCoord = GlCommon.create_vbo(textureCoord);

	ibo = GlCommon.create_ibo(index);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

}

//******************************************************************************
//* データ表示処理
//******************************************************************************


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

