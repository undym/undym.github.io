var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { Util } from "../util.js";
import { Rect, Color } from "../undym/type.js";
import { YLayout, ILayout, Layout, Label } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { FieldScene } from "./fieldscene.js";
import { List } from "../widget/list.js";
import { GL } from "../gl/gl.js";
import { FXTest } from "../fx/fx.js";
import { MsgPopup } from "../widget/popup.js";
import { Item } from "../item.js";
import { Font } from "../gl/glstring.js";
export class OptionScene extends Scene {
    constructor() {
        super();
        this.info = "";
    }
    static get ins() { return this._ins != null ? this._ins : (this._ins = new OptionScene()); }
    init() {
        super.clear();
        if (Util.DEBUG) {
            super.add(new Rect(0, 0, 0.2, 1), new YLayout()
                .add(new Label(Font.getDef(), () => this.info))
                .add(new Btn(() => "ITEM+99", () => {
                for (let item of Item.values()) {
                    item.num += 99;
                }
                this.info = "ITEM+99";
            }))
                .add(new Btn(() => "EffectTest", () => __awaiter(this, void 0, void 0, function* () {
                Scene.load(new EffectTest());
            })))
                .add(ILayout.empty));
        }
        {
            let w = 0.2;
            super.add(new Rect(1 - w, 0, w, 1), new YLayout()
                .add(ILayout.empty)
                .add(new Layout()
                .add(new Btn(() => "再読み込み", () => {
                window.location.href = window.location.href;
            }))
                .add(new MsgPopup("left", Font.getDef(), [
                ["新しいバージョンがあれば更新されます", Color.WHITE],
            ])))
                .add(new Btn(() => "<-", () => {
                Scene.load(FieldScene.ins);
            }))
                .add(ILayout.empty));
        }
    }
}
class EffectTest extends Scene {
    init() {
        const _super = Object.create(null, {
            clear: { get: () => super.clear },
            add: { get: () => super.add }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let list = new List();
            _super.clear.call(this);
            _super.add.call(this, new Rect(0, 0.1, 0.2, 0.8), list);
            _super.add.call(this, Rect.FULL, ILayout.createDraw((bounds) => {
                {
                    let w = GL.pixel.w * 5;
                    let h = GL.pixel.h * 5;
                    GL.fillRect(new Rect(FXTest.attacker.x - w / 2, FXTest.attacker.y - h / 2, w, h), Color.RED);
                }
                {
                    let w = GL.pixel.w * 5;
                    let h = GL.pixel.h * 5;
                    GL.fillRect(new Rect(FXTest.target.x - w / 2, FXTest.target.y - h / 2, w, h), Color.CYAN);
                }
            }));
            _super.add.call(this, new Rect(0.8, 0.8, 0.2, 0.2), new Btn(() => "<-", () => {
                Scene.load(OptionScene.ins);
            }));
            for (let v of FXTest.values()) {
                list.add({
                    right: () => v.name,
                    push: () => v.run(),
                });
            }
        });
    }
}
