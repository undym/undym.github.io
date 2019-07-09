import { Scene } from "../undym/scene.js";
import { ILayout, VariableLayout, InnerLayout } from "../undym/layout.js";
import { Rect } from "../undym/type.js";
import DungeonEvent from "../dungeon/dungeonevent.js";
import { Place, Util } from "../util.js";
import { DrawSTBoxes, DrawUnitDetail, DrawDungeonData, DrawTop } from "./sceneutil.js";
import { Img } from "../gl/gltexture.js";
export default class DungeonScene extends Scene {
    static get ins() { return this._ins != null ? this._ins : (this._ins = new DungeonScene()); }
    constructor() {
        super();
        DungeonEvent.now = DungeonEvent.empty;
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawTop.ins);
        super.add(Place.DUNGEON_DATA, DrawDungeonData.ins);
        super.add(Place.MAIN, DrawEvent.ins);
        super.add(Place.MSG, Util.msg);
        super.add(Place.BTN, new VariableLayout(() => DungeonEvent.now.getBtnLayout()));
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.UNIT_DETAIL, DrawUnitDetail.ins);
    }
}
class DrawEvent extends InnerLayout {
    static get ins() { return this._ins != null ? this._ins : (this._ins = new DrawEvent()); }
    constructor() {
        super();
        let evBak = DungeonEvent.now;
        let img = Img.empty;
        let zoomCount = 0;
        super.add(ILayout.createDraw((bounds) => {
            if (evBak != DungeonEvent.now) {
                evBak = DungeonEvent.now;
                img = evBak.getImg();
                if (evBak.isImgZoom()) {
                    zoomCount = 0;
                }
            }
            zoomCount++;
            const base = bounds.w < bounds.h ? bounds.w : bounds.h;
            const size = base * zoomCount / (zoomCount + 1);
            img.draw(new Rect(bounds.cx - size / 2, bounds.cy - size / 2, size, size));
        }));
    }
}
