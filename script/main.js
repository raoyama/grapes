
//******************************************************************************
//* 変数定義
//******************************************************************************

var gl;
var shaderP;
var shaderPcs;
var shaderTexture;
var shaderTextureMulti;
var baseMatrix = m.identity(m.create());
var can;

//******************************************************************************
//* 初期化
//******************************************************************************
onload = function(){
	can = new Canvas();
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

	shaderP			= new ShaderP(Data.getP());

	shaderPcs		= new ShaderPcs(Data.getPcs());

	shaderTexture	= new ShaderTexture(Data.getTexture());

	shaderTextureMulti	= new ShaderTextureMulti(Data.getMultiTexture());

	//gl.enable(gl.CULL_FACE);	// カリング有効(ポリゴンの裏側の描画処理を行わない)
	gl.enable(gl.DEPTH_TEST);	// 深度テストを有効にする(隠されるポリゴンは描画しない)
	gl.depthFunc(gl.LEQUAL);

}
//******************************************************************************
//* 描画
//******************************************************************************
function draw_display() {

	GlCommon.gl_clear();

	set_mvp();
	m.copy(mvpMatrix ,baseMatrix);	//shaderTexture用

	shaderPcs.draw(mvpMatrix);

	shaderP.draw(mvpMatrix);

	shaderTextureMulti.draw(mvpMatrix);

	shaderTexture.draw(baseMatrix, mvpMatrix);

	// コンテキストの再描画
	gl.flush();

}
