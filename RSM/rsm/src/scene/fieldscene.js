var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { RatioLayout, XLayout, YLayout, ILayout, VariableLayout, Label } from "../undym/layout.js";
import { Place, Util } from "../util.js";
import { Btn } from "../widget/btn.js";
import { Dungeon, DungeonArea } from "../dungeon/dungeon.js";
import { Rect, Color } from "../undym/type.js";
import DungeonScene from "./dungeonscene.js";
import { GL } from "../gl/gl.js";
import DungeonEvent from "../dungeon/dungeonevent.js";
import { DrawUnitDetail, DrawSTBoxes, DrawTop } from "./sceneutil.js";
import { Unit, Prm } from "../unit.js";
import { OptionScene } from "./optionscene.js";
import { ItemScene } from "./itemscene.js";
import { Font } from "../gl/glstring.js";
import { Targeting } from "../force.js";
export class FieldScene extends Scene {
    static get ins() { return this._ins != null ? this._ins : (this._ins = new FieldScene()); }
    constructor() {
        super();
    }
    init() {
        super.clear();
        super.add(Rect.FULL, ILayout.createDraw((bounds) => {
            GL.fillRect(bounds, Color.BLACK);
        }));
        super.add(Place.TOP, DrawTop.ins);
        const dInfoH = 0.15;
        const dEnterW = 0.15;
        const dBtnSpace = new Rect(0, Place.TOP.yh, Place.P_BOX.x, Place.P_BOX.h - dInfoH);
        const dInfo = new Rect(dBtnSpace.x, dBtnSpace.yh, dBtnSpace.w - dEnterW, dInfoH);
        const dEnterBounds = new Rect(dInfo.xw, dInfo.y, dEnterW, dInfo.h);
        super.add(dBtnSpace, (() => {
            let l = new RatioLayout();
            //dungeon
            for (let d of DungeonArea.now.getDungeons()) {
                if (!d.isVisible()) {
                    continue;
                }
                l.add(d.getBounds(), new Btn(d.toString(), () => __awaiter(this, void 0, void 0, function* () {
                    this.selectedDungeon = d;
                })));
            }
            //areamove
            for (let set of DungeonArea.now.getAreaMoveBtns()) {
                if (set.area.getDungeons().find(d => d.isVisible())) {
                    l.add(set.bounds, new Btn(`＞${set.area}`, () => __awaiter(this, void 0, void 0, function* () {
                        DungeonArea.now = set.area;
                        this.init();
                    })));
                }
            }
            return l;
        })());
        {
            const font = Font.def;
            const dInfoLayout = new YLayout()
                .add(new Label(font, () => `[${this.selectedDungeon}] Rank:${this.selectedDungeon.getRank()}`))
                .add(new XLayout()
                .add(new Label(font, () => `攻略回数:${this.selectedDungeon.clearNum}`, () => this.selectedDungeon.clearNum > 0 ? Color.WHITE : Color.GRAY)))
                .add(ILayout.empty);
            super.add(dInfo, new VariableLayout(() => {
                if (this.selectedDungeon !== undefined) {
                    return dInfoLayout;
                }
                return ILayout.empty;
            }));
        }
        {
            const dungeonEnter = new Btn("侵入", () => __awaiter(this, void 0, void 0, function* () {
                Dungeon.now = this.selectedDungeon;
                Dungeon.auNow = 0;
                DungeonEvent.now = DungeonEvent.empty;
                fullCare();
                Util.msg.set(`[${Dungeon.now}]に侵入しました`);
                Scene.load(DungeonScene.ins);
            }));
            super.add(dEnterBounds, new VariableLayout(() => {
                if (this.selectedDungeon !== undefined) {
                    return dungeonEnter;
                }
                return ILayout.empty;
            }));
        }
        super.add(Place.BTN, new YLayout()
            .add(new Btn(";技のセット", () => {
        }))
            .add(new Btn(";職業", () => {
        }))
            .add(new Btn("アイテム", () => __awaiter(this, void 0, void 0, function* () {
            Scene.load(ItemScene.ins({
                selectUser: true,
                user: Unit.players[0],
                use: (item, user) => __awaiter(this, void 0, void 0, function* () {
                    if (item.targetings & Targeting.SELECT) {
                        yield item.use(user, [user]);
                    }
                    else {
                        let targets = Targeting.filter(item.targetings, user, Unit.players);
                        if (targets.length > 0) {
                            yield item.use(user, targets);
                        }
                    }
                }),
                returnScene: () => {
                    Scene.load(FieldScene.ins);
                },
            }));
        })))
            .add(new Btn("OPTION", () => __awaiter(this, void 0, void 0, function* () {
            Scene.load(OptionScene.ins);
        }))));
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.UNIT_DETAIL, DrawUnitDetail.ins);
        //----------------------------------------------------
        fullCare();
        //----------------------------------------------------
    }
}
const fullCare = () => {
    for (let u of Unit.players) {
        u.prm(Prm.HP).base = u.prm(Prm.MAX_HP).total();
        u.prm(Prm.MP).base = u.prm(Prm.MAX_MP).total();
    }
};
