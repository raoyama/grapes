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
		return ret;
	}

	static getMultiTexture() {
		let ret = [];
		for(let x = -40; x < 40; x++) {
			for(let z = -40; z < 40; z++) {
				if(x % 100 == 0 || z % 100 == 0) {
					ret.push([x, 0, z, 0]);
				} else {
					ret.push([x, 0, z, 3]);
				}
			}
		}
		return ret;
	}

}
