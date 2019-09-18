var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit } from "../unit.js";
import { Input } from "../undym/input.js";
import { Rect, Color, Point } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { FX_Str } from "../fx/fx.js";
import { Eq, EqPos, EqEar } from "../eq.js";
export class EqScene extends Scene {
    constructor() {
        super();
        this.list = new List();
        this.target = Unit.getFirstPlayer();
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
        super.add(mainBounds, new XLayout()
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.4);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                    if (!this.choosedEq) {
                        return;
                    }
                    if (this.choosedEq instanceof Eq) {
                        const eq = this.choosedEq;
                        let font = Font.def;
                        let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                        const moveP = () => p = p.move(0, font.ratioH);
                        font.draw(`[${eq}]`, p, Color.WHITE);
                        font.draw(`<${eq.pos}>`, moveP(), Color.WHITE);
                        font.draw(`${eq.num}個`, moveP(), Color.WHITE);
                        for (let s of eq.info) {
                            font.draw(s, moveP(), Color.WHITE);
                        }
                    }
                    if (this.choosedEq instanceof EqEar) {
                        const ear = this.choosedEq;
                        let font = Font.def;
                        let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                        const moveP = () => p = p.move(0, font.ratioH);
                        font.draw(`[${ear}]`, p, Color.WHITE);
                        font.draw(`<耳>`, moveP(), Color.WHITE);
                        font.draw(`${ear.num}個`, moveP(), Color.WHITE);
                        for (let s of ear.info) {
                            font.draw(s, moveP(), Color.WHITE);
                        }
                    }
                } }))
                .add(btnBounds, (() => {
                const set = new Btn("装備", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedEq) {
                        return;
                    }
                    if (this.choosedEq instanceof Eq) {
                        equip(this.target, this.choosedEq);
                    }
                    FX_Str(Font.def, `${this.choosedEq}をセットしました`, Point.CENTER, Color.WHITE);
                }));
                const unset = new Btn("外す", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedEq) {
                        return;
                    }
                    if (this.choosedEq instanceof Eq) {
                        equip(this.target, Eq.getDef(this.pos));
                    }
                    FX_Str(Font.def, `${this.choosedEq}を外しました`, Point.CENTER, Color.WHITE);
                }));
                const setEar = new Btn("装備", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedEq) {
                        return;
                    }
                    if (this.choosedEq instanceof EqEar) {
                        let index = 0;
                        for (let i = 0; i < Unit.EAR_NUM; i++) {
                            if (this.target.getEqEar(i) === EqEar.getDef()) {
                                index = i;
                                break;
                            }
                        }
                        equipEar(this.target, index, this.choosedEq);
                        FX_Str(Font.def, `耳${index + 1}に${this.choosedEq}をセットしました`, Point.CENTER, Color.WHITE);
                    }
                }));
                const unsetEar = new Btn("外す", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedEq) {
                        return;
                    }
                    if (this.choosedEq instanceof EqEar) {
                        for (let i = 0; i < Unit.EAR_NUM; i++) {
                            if (this.target.getEqEar(i) === this.choosedEq) {
                                equipEar(this.target, i, EqEar.getDef());
                                FX_Str(Font.def, `耳${i + 1}の${this.choosedEq}を外しました`, Point.CENTER, Color.WHITE);
                                break;
                            }
                        }
                    }
                }));
                const otherBtns = [
                    new Btn("<<", () => {
                        Scene.load(TownScene.ins);
                    }),
                    new VariableLayout(() => {
                        if (!this.choosedEq) {
                            return ILayout.empty;
                        }
                        if (this.choosedEq instanceof Eq) {
                            if (this.target.getEq(this.pos) === this.choosedEq) {
                                return unset;
                            }
                            return set;
                        }
                        if (this.choosedEq instanceof EqEar) {
                            for (let i = 0; i < Unit.EAR_NUM; i++) {
                                if (this.target.getEqEar(i) === this.choosedEq) {
                                    return unsetEar;
                                }
                            }
                            return setEar;
                        }
                        return ILayout.empty;
                    }),
                    new Btn("全て", () => {
                        (this.resetList = () => {
                            this.list.clear();
                            this.setEarList();
                            for (const pos of EqPos.values()) {
                                this.setList(pos);
                            }
                        })();
                    }),
                ];
                const w = 2;
                const h = ((otherBtns.length + /*耳*/ 1 + EqPos.values().length + 1) / w) | 0;
                const l = new FlowLayout(w, h);
                l.add(new Btn("耳", () => {
                    (this.resetList = () => {
                        this.list.clear();
                        this.setEarList();
                    })();
                }));
                for (let pos of EqPos.values()) {
                    l.add(new Btn(`${pos}`, () => {
                        (this.resetList = () => {
                            this.list.clear();
                            this.setList(pos);
                        })();
                    }));
                }
                for (const o of otherBtns) {
                    l.addFromLast(o);
                }
                return l;
            })());
        })()));
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
        super.add(Rect.FULL, ILayout.create({ draw: (bounds) => {
                Graphics.fillRect(this.target.bounds, new Color(0, 1, 1, 0.2));
            } }));
        super.add(Rect.FULL, ILayout.create({ ctrl: (bounds) => {
                if (!Input.click) {
                    return;
                }
                for (let p of Unit.players.filter(p => p.exists)) {
                    if (p.bounds.contains(Input.point)) {
                        this.target = p;
                        this.resetList();
                        break;
                    }
                }
            } }));
        (this.resetList = () => {
            this.list.clear();
            this.setEarList();
            for (const pos of EqPos.values()) {
                this.setList(pos);
            }
        })();
    }
    setEarList() {
        this.list.add({
            center: () => `耳`,
            groundColor: () => Color.D_GRAY,
        });
        EqEar.values
            .filter(ear => {
            if (ear.num > 0) {
                return true;
            }
            for (let i = 0; i < Unit.EAR_NUM; i++) {
                if (this.target.getEqEar(i) === ear) {
                    return true;
                }
            }
            return false;
        })
            .forEach(ear => {
            let color = () => {
                if (ear === this.choosedEq) {
                    return Color.ORANGE;
                }
                for (let i = 0; i < Unit.EAR_NUM; i++) {
                    if (this.target.getEqEar(i) === ear) {
                        return Color.CYAN;
                    }
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => {
                    let res = "";
                    for (let i = 0; i < Unit.EAR_NUM; i++) {
                        if (this.target.getEqEar(i) === ear) {
                            res += `${i + 1}`;
                        }
                    }
                    return res;
                },
                leftColor: color,
                right: () => `${ear}`,
                rightColor: color,
                push: (elm) => {
                    this.choosedEq = ear;
                },
            });
        });
    }
    setList(pos) {
        this.pos = pos;
        this.choosedEq = undefined;
        this.list.add({
            center: () => `${pos}`,
            groundColor: () => Color.D_GRAY,
        });
        pos.eqs
            .filter(eq => eq.num > 0 || eq === this.target.getEq(pos))
            .forEach((eq) => {
            let color = () => {
                if (eq === this.choosedEq) {
                    return Color.ORANGE;
                }
                if (this.target.getEq(pos) === eq) {
                    return Color.CYAN;
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => this.target.getEq(pos) === eq ? "=" : ``,
                leftColor: color,
                right: () => `${eq}`,
                rightColor: color,
                push: (elm) => {
                    this.choosedEq = eq;
                },
            });
        });
    }
}
const equip = (unit, newEq) => {
    const oldEq = unit.getEq(newEq.pos);
    oldEq.num++;
    newEq.num--;
    unit.setEq(newEq.pos, newEq);
    unit.equip();
};
const equipEar = (unit, index, newEar) => {
    const oldEar = unit.getEqEar(index);
    oldEar.num++;
    newEar.num--;
    unit.setEqEar(index, newEar);
    unit.equip();
};
