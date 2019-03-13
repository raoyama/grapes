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
		ret.push([0, 0, 0, 7]);
		ret.push([0, 1, 0, 7]);
		return ret;
	}

	static getMultiTexture() {
		let ret = [];
		for(let x = -100; x < 100; x++) {
			for(let z = -100; z < 100; z++) {
				if(x > 40) {
					ret.push([x, -20, z, 0]);
				} else if(x > 30) {
					ret.push([x, -10, z, 0]);
				} else if(x % 100 == 0 || z % 100 == 0) {
					ret.push([x, 0, z, 0]);
				} else {
					ret.push([x, 0, z, 3]);
				}
			}
		}

		ret.push([10, 1, 10, 1]);
		ret.push([10, 2, 11, 1]);
		ret.push([10, 3, 12, 1]);
		ret.push([10, 4, 13, 1]);
		ret.push([10, 5, 14, 1]);
		ret.push([10, 6, 15, 1]);
		return ret;
	}

}
