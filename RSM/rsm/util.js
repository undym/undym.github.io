import { Rect } from "./undym/type.js";
import Msg from "./widget/msg.js";
import { Graphics } from "./graphics/graphics.js";
import { Scene } from "./undym/scene.js";
import { TownScene } from "./scene/townscene.js";
import DungeonScene from "./scene/dungeonscene.js";
export class Debug {
}
Debug.DEBUG = true;
Debug.debugMode = false;
export class Util {
    constructor() { }
    static init() {
        this.msg = new Msg();
    }
}
export class Place {
    constructor() { }
    static get dotW() { return 1 / Graphics.pixelW; }
    static get dotH() { return 1 / Graphics.pixelH; }
    static get TOP() {
        return this.top ? this.top :
            (this.top = new Rect(this.dotW, this.dotH, 1 - this.dotW * 2, 0.03));
    }
    static get E_BOX() {
        return this.e_box ? this.e_box :
            (this.e_box = new Rect(this.dotW, this.TOP.yh + this.dotH, 1 - this.dotW * 2, this.ST_H));
    }
    static get MAIN() {
        return this.main ? this.main :
            (this.main = new Rect(this.dotW, this.E_BOX.yh, 1 - this.dotW * 2, 0.345));
    }
    static get MSG() {
        return this.msg ? this.msg :
            (this.msg = new Rect(this.MAIN.x, this.MAIN.y + 1 / Graphics.pixelW, this.MAIN.w, this.MAIN.h * 0.7));
    }
    static get P_BOX() {
        return this.p_box ? this.p_box :
            (this.p_box = new Rect(this.dotW, this.MAIN.yh, 1 - this.dotW * 2, this.ST_H));
    }
    static get BTN() {
        return this.btn ? this.btn :
            (this.btn = new Rect(this.dotW, this.P_BOX.yh, 1 - this.dotW * 2, 1 - this.P_BOX.yh));
    }
    static get DUNGEON_DATA() {
        return this.dungeon_data ? this.dungeon_data :
            (this.dungeon_data = new Rect(this.MAIN.x + this.MAIN.w * 0.05, this.MSG.yh, this.MAIN.w * 0.9, this.MAIN.h - this.MSG.h - this.dotH));
    }
}
Place.ST_H = 0.125;
export class PlayData {
    constructor() { }
}
PlayData.yen = 0;
/**職業変更ボタンの出現フラグ。 */
PlayData.masteredAnyJob = false;
/**装備ボタンの出現フラグ. */
PlayData.gotAnyEq = false;
export class SceneType {
    /**
     * actionLoadSaveData: 読み込み時の処理。
     */
    constructor(uniqueName, loadAction) {
        this.uniqueName = uniqueName;
        this.loadAction = loadAction;
        if (!SceneType._valueOf) {
            SceneType._valueOf = new Map();
        }
        SceneType._valueOf.set(uniqueName, this);
    }
    static valueOf(uniqueName) {
        return this._valueOf.get(uniqueName);
    }
    static get now() { return this._now; }
    set() {
        SceneType._now = this;
    }
}
SceneType.TOWN = new SceneType("TOWN", () => Scene.load(TownScene.ins));
SceneType.DUNGEON = new SceneType("DUNGEON", () => Scene.load(DungeonScene.ins));
SceneType.BATTLE = new SceneType("BATTLE", () => Scene.load(DungeonScene.ins));
