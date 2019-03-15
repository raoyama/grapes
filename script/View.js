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

		this.rot_scale = 0.01;	//回転量　0.01ぐらいがよい
		this.rot_x = 0.0;
		this.rot_y = 0.0;

		this.aspect = canvas.c.width / canvas.c.height;

		this.baseMatrix = m.identity(m.create());
		this.mMatrix = m.identity(m.create());
		this.vMatrix = m.identity(m.create());
		this.pMatrix = m.identity(m.create());
		this.vpMatrix = m.identity(m.create());
		this.mvpMatrix = m.identity(m.create());
		this.camera_back = 4;	//プレイヤーからカメラを少し外す

		this.shaderP			= new ShaderP(Data.getP());
		this.shaderPcs			= new ShaderPcs(Data.getPcs());
//		this.shaderTexture		= new ShaderTexture(Data.getTexture());
		this.shaderTextureMulti	= new ShaderTextureMulti(Data.getMultiTexture());
		this.shaderTextureBlock	= new ShaderTextureBlock(Data.getTextureBlock());

		gl.enable(gl.CULL_FACE);	// カリング有効(ポリゴンの裏側の描画処理を行わない)
		gl.enable(gl.DEPTH_TEST);	// 深度テストを有効にする(隠されるポリゴンは描画しない)
		gl.depthFunc(gl.LEQUAL);

	}

	draw_display() {
		GlCommon.gl_clear();
		log('player.speed', player.speed);

		//this.set_mvp();
		this.set_mvp2();
		m.copy(this.mvpMatrix ,this.baseMatrix);	//shaderTexture用

//		this.shaderPcs.draw(this.mvpMatrix);
//		this.shaderP.draw(this.mvpMatrix);
		this.shaderTextureMulti.draw(this.mvpMatrix);
//		this.shaderTexture.draw(this.baseMatrix, this.mvpMatrix);
		this.shaderTextureBlock.draw(this.baseMatrix, this.mvpMatrix, [player.pos_x, player.pos_y, player.pos_z]);

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
		m.lookAt(
			[player.pos_x - player.cos_dir_x * this.camera_back , player.pos_y + 3, player.pos_z - player.sin_dir_x * this.camera_back],
			[player.cos_dir_x * 1000, player.sin_dir_y * 1000, player.sin_dir_x * 1000],
			[0, 1, 0],
			this.vMatrix
		);
		m.perspective(
			90,
			this.aspect,
			0.00001,
			10000,
			this.pMatrix
		);

		m.multiply(this.pMatrix, this.vMatrix, this.mvpMatrix);
	}
}
