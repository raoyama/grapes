'use strict';


class View {
	constructor() {
		this.z_scale = 10.0;

		//カメラの初期位置
		this.init_x = 0.0;
		this.init_y = 0.0;
		this.init_z = 0.0;

		this.trans_x = 0.0;
		this.trans_y = 0.0;
		this.trans_z = 0.0;

		this.camera_x = 0.0;
		this.camera_y = 30.0;
		this.camera_z = 0.0;

		this.rot_scale = 0.01;	//回転量　0.01ぐらいがよい
		this.rot_x = 0.0;
		this.rot_y = 0.0;

		this.deg_scale = 0.5;
		this.deg_x = 0.0;
		this.deg_y = 0.0;

		this.baseMatrix = m.identity(m.create());
		this.mvpMatrix = m.identity(m.create());

		this.shaderP			= new ShaderP(Data.getP());
		this.shaderPcs			= new ShaderPcs(Data.getPcs());
		this.shaderTexture		= new ShaderTexture(Data.getTexture());
		this.shaderTextureMulti	= new ShaderTextureMulti(Data.getMultiTexture());

		//gl.enable(gl.CULL_FACE);	// カリング有効(ポリゴンの裏側の描画処理を行わない)
		gl.enable(gl.DEPTH_TEST);	// 深度テストを有効にする(隠されるポリゴンは描画しない)
		gl.depthFunc(gl.LEQUAL);

	}

	draw_display() {
		GlCommon.gl_clear();

		//this.set_mvp();
		this.set_mvp2();
		m.copy(this.mvpMatrix ,this.baseMatrix);	//shaderTexture用

		this.shaderPcs.draw(this.mvpMatrix);
		this.shaderP.draw(this.mvpMatrix);
		this.shaderTextureMulti.draw(this.mvpMatrix);
		this.shaderTexture.draw(this.baseMatrix, this.mvpMatrix);

		// コンテキストの再描画
		gl.flush();

	}
	//MVPマトリックスを作成する。
	set_mvp(){
		let vMatrix = m.identity(m.create());
		let pMatrix = m.identity(m.create());
		let vpMatrix = m.identity(m.create());

		/*
		matIV.lookAt(eye, center, up, dest)
		eye		> カメラの位置を表すベクトル
		center	> カメラの注視点を表すベクトル
		up		> カメラの上方向を表すベクトル
		dest	> 演算結果を格納する行列
		*/
		m.lookAt(
			[this.init_x - this.trans_x, this.init_y - this.trans_y, this.init_z + this.z_scale],
			[this.init_x - this.trans_x, this.init_y - this.trans_y, -1000],
			[0, 1, 0],
			vMatrix
		);
/*
		m.lookAt(
			[this.init_x, this.init_y, this.init_z + this.z_scale],
			[this.init_x, this.init_y, -1000],
			[0, 1, 0],
			vMatrix
		);
*/
		
		/*
		matIV.perspective(fovy, aspect, near, far, dest)
		fovy	> 視野角
		aspect	> スクリーンのアスペクト比
		near	> ニアクリップ
		far		> ファークリップ
		dest	> 演算結果を格納する行列
		*/
		m.perspective(
			90,
			canvas.c.width / canvas.c.height,
			0.00001,
			10000,
			pMatrix
		);

		m.multiply(pMatrix, vMatrix, vpMatrix);

		let mMatrix = m.identity(m.create());

		m.rotate(mMatrix, this.rot_x , [0.0, 1.0, 0.0], mMatrix);
		m.rotate(mMatrix, this.rot_y , [1.0, 0.0, 0.0], mMatrix);
//		m.translate(mMatrix, [this.trans_x, this.trans_y, 0.0], mMatrix);

		m.multiply(vpMatrix, mMatrix, this.mvpMatrix);
	}
	
	
	//Minecraftチック
	set_mvp2(){
		/*
		console.log('trans_x:' + this.trans_x);
		console.log('trans_z:' + this.trans_z);
		console.log('deg_x:' + this.deg_x);
		console.log('deg_y:' + this.deg_y);
		*/
		let vMatrix = m.identity(m.create());
		let pMatrix = m.identity(m.create());
		let vpMatrix = m.identity(m.create());

		m.lookAt(
			[this.camera_x, this.camera_y, this.camera_z],
			[Math.cos(this.deg_x / 180 * Math.PI) * 1000, Math.sin(this.deg_y / 180 * Math.PI) * 1000, Math.sin(this.deg_x / 180 * Math.PI) * 1000],
			[0, 1, 0],
			vMatrix
		);
		m.perspective(
			90,
			canvas.c.width / canvas.c.height,
			0.00001,
			10000,
			pMatrix
		);

		m.multiply(pMatrix, vMatrix, vpMatrix);

		let mMatrix = m.identity(m.create());

//		m.rotate(mMatrix, this.rot_x , [0.0, 1.0, 0.0], mMatrix);
//		m.rotate(mMatrix, this.rot_y , [1.0, 0.0, 0.0], mMatrix);
//		m.translate(mMatrix, [this.trans_x, this.trans_y, 0.0], mMatrix);

		m.multiply(vpMatrix, mMatrix, this.mvpMatrix);
	}
}
