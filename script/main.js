
//******************************************************************************
//* 変数定義
//******************************************************************************

var shaderP;
var shaderPcs;
var shaderTexture;
var shaderTextureMulti;

var baseMatrix = m.identity(m.create());


//******************************************************************************
//* 初期化
//******************************************************************************
onload = function(){

	init_canvas();
	startTime = performance.now();
	init_gl();
	endTime = performance.now();
	console.log(endTime - startTime); 

	draw_display();

};


//******************************************************************************
//* 共通初期処理
//******************************************************************************
function init_gl() {

	shaderP			= new ShaderP(line_pos);

	shaderPcs		= new ShaderPcs(data_pos, data_cls, data_size);

	texture_data = [];
	texture_data.push([0, 1, 0, 10]);
	texture_data.push([0, 2, 0, 10]);
	shaderTexture	= new ShaderTexture(texture_data);

	multi_texture_data = [];
	for(x = -400; x < 400; x++) {
		for(z = -400; z < 400; z++) {
			if(x % 100 == 0 || z % 100 == 0) {
				multi_texture_data.push([x, 0, z, 0]);
			} else {
				multi_texture_data.push([x, 0, z, 3]);
			}
		}
	}
	shaderTextureMulti	= new ShaderTextureMulti(multi_texture_data);

	//gl.enable(gl.CULL_FACE);	// カリング有効(ポリゴンの裏側の描画処理を行わない)
	gl.enable(gl.DEPTH_TEST);	// 深度テストを有効にする(隠されるポリゴンは描画しない)
	gl.depthFunc(gl.LEQUAL);

}
//******************************************************************************
//* 描画
//******************************************************************************
function draw_display() {

	gl_clear();

	set_mvp();
	m.copy(mvpMatrix ,baseMatrix);	//shaderTexture用

	shaderPcs.draw(mvpMatrix);

	shaderP.draw(mvpMatrix);

	shaderTextureMulti.draw(mvpMatrix);

	shaderTexture.draw(baseMatrix, mvpMatrix);

	// コンテキストの再描画
	gl.flush();

}
