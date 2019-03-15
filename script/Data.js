'use strict';

class Data {

	static getP() {
		let ret = [
			-5,5,0,
			-5,-5,0,
			5,5,0,
			5,-5,0,
		];
		return ret;
	}

	static getPcs() {
		let ret = {};
		// 頂点(座標)データ
		ret['pos'] = [
			-10,10,0,
			-10,-10,0,
			10,10,0,
			10,-10,0,
		];

		// 頂点(色)データ
		ret['color'] = [
			0.2,0,1,1.0,
			0.2,1,1,1.0,
			1,1,0,1.0,
			1,0.2,1,1.0,
		];

		// 頂点(size)データ
		ret['size'] = [
			15.5,
			15.5,
			15.5,
			15.5,
		];
		return ret;
	}

	static getTexture() {
		let ret = [];
		ret.push([0, 1, 0, 10]);
		ret.push([0, 2, 0, 10]);
		ret.push([10, 1, 10, 10]);
		ret.push([20, 1, 10, 10]);
		return ret;
	}

	static getTextureBlock() {
		let ret = [];
		ret.push([0, 0, 0, 15]);
		ret.push([0, 1, 0, 16]);
		return ret;
	}

	static getMultiTexture() {
		let ret = [];
		let num = 200;
		for(let x = -1 * num; x < num; x++) {
			for(let z = -1 *  num; z < num; z++) {
					ret.push([x, 0, z, 8]);
				/*
				if(x > 40) {
					ret.push([x, -20, z, 0]);
				} else if(x > 30) {
					ret.push([x, -10, z, 0]);
				} else if(x % 100 == 0 || z % 100 == 0) {
					ret.push([x, 0, z, 0]);
				} else {
					ret.push([x, 0, z, 3]);
				}
				*/
			}
		}

		ret.push([0, 6, 0, 13]);
		ret.push([0, 5, 1, 13]);
		ret.push([0, 4, 2, 13]);
		ret.push([0, 3, 3, 13]);
		ret.push([0, 2, 4, 13]);
		ret.push([0, 1, 5, 13]);
		
		for(let i = 0; i < 300; i ++) {
			
			Data.makeTree(ret, Data.getRandomInt(num) , 0, Data.getRandomInt(num));
		}
		
		
		Data.makeGrape(ret, 70, 49, 0);
		return ret;
	}

	static makeTree(ret, x, y, z) {
		let t = 5;
		for(let i = 0; i < t; i ++) {
			ret.push([x, y + i, z, 13]);
		}
		for(let i = -2; i <= 2; i ++) {
			for(let j = -2; j <= 2; j ++) {
				ret.push([x + i, y + t - 1, z + j, 10]);
			}
		}
		for(let i = -1; i <= 1; i ++) {
			for(let j = -1; j <= 1; j ++) {
				ret.push([x + i, y + t, z + j, 10]);
			}
		}
		ret.push([x, y + t + 1, z, 10]);
	}

	static makeSphare(ret, x, y, z, rad) {
		for(let dx = - rad; dx <= rad; dx ++) {
			for(let dz = - rad; dz <= rad; dz ++) {
				for(let dy = - rad; dy <= rad; dy ++) {
					if(dx * dx + dy * dy + dz * dz < rad * rad) {
						ret.push([x + dx, y + dy, z + dz, 14]);
					}
				}
			}
		}
	}
	static makeGrape(ret, x, y, z) {
		let rad = 20;
		let rad2 = Math.round(Math.sqrt(2) * rad);
		let rad_s = Math.round(Math.sqrt(rad));
		let len = 7;
		for(let i = 0;i < 7; i ++) {
			if(i % 2 == 0) {
				Data.makeSphare(ret, x + rad, y + rad, z + i * rad, rad);
				Data.makeSphare(ret, x + rad, y - rad, z + i * rad, rad);
				Data.makeSphare(ret, x - rad, y + rad, z + i * rad, rad);
				Data.makeSphare(ret, x - rad, y - rad, z + i * rad, rad);
			} else {
				Data.makeSphare(ret, x, y + rad2, z + i * rad, rad);
				Data.makeSphare(ret, x + rad2, y, z + i * rad, rad);
				Data.makeSphare(ret, x - rad2, y, z + i * rad, rad);
				Data.makeSphare(ret, x, y - rad2, z + i * rad, rad);
			}
		}
		Data.makeSphare(ret, x, y, z + len * rad, rad);
		
		for(let dz = - rad * 2; dz <= 0; dz ++) {
			for(let dx = - rad_s; dx <= rad_s; dx ++) {
				for(let dy = - rad_s; dy <= rad_s; dy ++) {
					ret.push([x + dx, y + dy, z + dz, 13]);
				}
			}
		}

	}
	static getRandomInt(max) {
		//数値を決めるランダム
		let rand = Math.floor(Math.random() * Math.floor(max));

		//+か-を決めるランダム
		if (Math.random() < 0.5) {
			rand *= -1;
		}
		return rand;
	}
}
