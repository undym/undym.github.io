import { Rect, Color } from "./undym/type.js";
import Msg from "./widget/msg.js";
import { GL } from "./gl/gl.js";
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
    static get TOP() {
        return this.top !== undefined ? this.top :
            (this.top = new Rect(0, 0, 1, this.TOP_H));
    }
    static get BTN() {
        return this.btn !== undefined ? this.btn :
            (this.btn = new Rect(1 - this.BTN_W, this.TOP.yh, this.BTN_W, 1 - this.TOP.yh));
    }
    static get P_BOX() {
        return this.p_box !== undefined ? this.p_box :
            (this.p_box = new Rect(1 - this.BTN_W - this.ST_W - GL.pixel.w, this.TOP.yh, this.ST_W, this.ST_H));
    }
    static get E_BOX() {
        return this.e_box !== undefined ? this.e_box :
            (this.e_box = new Rect(GL.pixel.w, this.P_BOX.y, this.ST_W, this.ST_H));
    }
    static get MAIN() {
        return this.main !== undefined ? this.main :
            (this.main = new Rect(this.E_BOX.xw, this.E_BOX.y, this.P_BOX.x - this.E_BOX.xw, this.E_BOX.h));
    }
    static get MSG() {
        return this.msg !== undefined ? this.msg :
            (this.msg = new Rect(this.MAIN.x, this.MAIN.y + GL.pixel.w, this.MAIN.w, this.MAIN.h * 0.7));
    }
    static get DUNGEON_DATA() {
        return this.dungeon_data !== undefined ? this.dungeon_data :
            (this.dungeon_data = new Rect(this.MAIN.x + this.MAIN.w * 0.05, this.MSG.yh, this.MAIN.w * 0.9, this.MAIN.h - this.MSG.h - GL.pixel.h));
    }
    static get UNIT_DETAIL() {
        return this.unit_detail !== undefined ? this.unit_detail :
            (this.unit_detail = new Rect(GL.pixel.w, this.E_BOX.yh + GL.pixel.h * 2, this.P_BOX.xw - GL.pixel.w, 1 - this.E_BOX.yh - GL.pixel.h * 3));
    }
}
Place.GAMBIT_H = 0.05;
Place.TOP_H = 0.035;
Place.BTN_W = 0.2;
Place.ST_W = 0.15;
Place.ST_H = 0.7;
export class Colors {
    static get UNIT_NAME() { return Color.ORANGE; }
    static get ITEM() { return Color.GREEN; }
    static get TEC() { return Color.GREEN.darker(); }
}
export class PlayData {
    constructor() { }
}
PlayData.yen = 0;
