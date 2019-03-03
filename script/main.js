
//******************************************************************************
//* 変数定義
//******************************************************************************

var shaderP;
var shaderPcs;
var shaderTexture;

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
//* 共通初期処理
//******************************************************************************
function init_gl() {

	shaderPcs		= new ShaderPcs(data_pos, data_cls, data_size);
	shaderP			= new ShaderP(line_pos);
	shaderTexture	= new ShaderTexture();

	gl.enable(gl.CULL_FACE);	// カリング有効(ポリゴンの裏側の描画処理を行わない)
	gl.enable(gl.DEPTH_TEST);	// 深度テストを有効にする(隠されるポリゴンは描画しない)
	gl.depthFunc(gl.LEQUAL);

}
//******************************************************************************
//* 描画
//******************************************************************************
function draw_display() {

	gl_clear();

	set_mvp();

	m.copy(mvpMatrix ,baseMatrix);

	shaderPcs.draw(mvpMatrix);

	shaderP.draw(mvpMatrix);
/*
	shaderTexture.draw(baseMatrix, mvpMatrix, 0, 0, 0, 1);
	shaderTexture.draw(baseMatrix, mvpMatrix, 1, 0, 0, 0);
	shaderTexture.draw(baseMatrix, mvpMatrix, 2, 0, 0, 0);
	shaderTexture.draw(baseMatrix, mvpMatrix, 3, 0, 0, 0);
	shaderTexture.draw(baseMatrix, mvpMatrix, 4, 0, 0, 0);
	shaderTexture.draw(baseMatrix, mvpMatrix, 5, 0, 0, 0);
*/
	for(x = -50; x <= 50; x++) {
		for(z = -50; z <= 50; z++) {
			shaderTexture.draw(baseMatrix, mvpMatrix, x, 0, z, 3);
		}
	}

	// コンテキストの再描画
	gl.flush();

}
