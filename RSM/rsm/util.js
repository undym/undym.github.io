import { Rect } from "./undym/type.js";
import Msg from "./widget/msg.js";
import { Graphics } from "./graphics/graphics.js";
export class Util {
    constructor() { }
    static init() {
        this.msg = new Msg();
    }
}
Util.VERSION = "0.0.13";
Util.DEBUG = true;
export class Place {
    constructor() { }
    static get dotW() { return 1 / Graphics.pixelW; }
    static get dotH() { return 1 / Graphics.pixelH; }
    // static get E_BOX(){return this.e_box !== undefined ? this.e_box : 
    //     (this.e_box = new Rect(1 / Graphics.pixelW, this.P_BOX.y, this.ST_W, this.ST_H));}
    static get E_BOX() {
        return this.e_box !== undefined ? this.e_box :
            (this.e_box = new Rect(this.dotW, this.dotH, 1 - this.dotW * 2, this.ST_H));
    }
    static get MAIN() {
        return this.main !== undefined ? this.main :
            (this.main = new Rect(this.dotW, this.E_BOX.yh, 1 - this.dotW * 2, 0.35));
    }
    static get MSG() {
        return this.msg !== undefined ? this.msg :
            (this.msg = new Rect(this.MAIN.x, this.MAIN.y + 1 / Graphics.pixelW, this.MAIN.w, this.MAIN.h * 0.7));
    }
    static get P_BOX() {
        return this.p_box !== undefined ? this.p_box :
            (this.p_box = new Rect(this.dotW, this.MAIN.yh, 1 - this.dotW * 2, this.ST_H));
    }
    static get BTN() {
        return this.btn !== undefined ? this.btn :
            (this.btn = new Rect(this.dotW, this.P_BOX.yh, 1 - this.dotW * 2, 1 - this.P_BOX.yh));
    }
    static get DUNGEON_DATA() {
        return this.dungeon_data !== undefined ? this.dungeon_data :
            (this.dungeon_data = new Rect(this.MAIN.x + this.MAIN.w * 0.05, this.MSG.yh, this.MAIN.w * 0.9, this.MAIN.h - this.MSG.h - this.dotH));
    }
}
Place.TOP_H = 0.035;
Place.ST_H = 0.125;
export class PlayData {
    constructor() { }
}
PlayData.yen = 0;
