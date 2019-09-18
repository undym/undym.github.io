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
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { TecType, Tec, ActiveTec } from "../tec.js";
import { FX_Str } from "../fx/fx.js";
export class SetTecScene extends Scene {
    constructor() {
        super();
        this.list = new List();
        this.target = Unit.getFirstPlayer();
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
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
                        this.setList(p, this.getListTecs);
                        break;
                    }
                }
            } }));
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
        super.add(mainBounds, new XLayout()
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.4);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                    if (!this.choosedTec) {
                        return;
                    }
                    const tec = this.choosedTec;
                    let font = Font.def;
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    const moveP = () => p = p.move(0, font.ratioH);
                    font.draw(`[${tec}]`, p, Color.WHITE);
                    font.draw(`<${tec.type}>`, moveP(), Color.WHITE);
                    if (tec instanceof ActiveTec) {
                        let _p = moveP();
                        if (tec.mpCost > 0) {
                            font.draw(`MP:${tec.mpCost}`, _p, Color.WHITE);
                        }
                        if (tec.tpCost > 0) {
                            font.draw(`TP:${tec.tpCost}`, _p.move(bounds.w * 1 / 4, 0), Color.WHITE);
                        }
                        if (tec.epCost > 0) {
                            font.draw(`EP:${tec.epCost}`, _p.move(bounds.w * 2 / 4, 0), Color.WHITE);
                        }
                    }
                    else {
                        moveP();
                    }
                    for (let s of tec.info) {
                        font.draw(s, moveP(), Color.WHITE);
                    }
                } }))
                .add(btnBounds, (() => {
                const otherBtns1 = [
                    new Btn("全て", () => {
                        this.setList(this.target, u => {
                            let res = [];
                            for (let type of TecType.values()) {
                                res = res.concat(type.tecs.filter(t => u.isMasteredTec(t)));
                            }
                            return res;
                        });
                    }),
                    new Btn("セット中", () => {
                        this.setList(this.target, u => u.tecs);
                    }),
                ];
                const otherBtns2 = [
                    new Btn("<<", () => {
                        Scene.load(TownScene.ins);
                    }),
                    (() => {
                        const choosedTecIsSetting = () => this.target.tecs.some(t => t === this.choosedTec);
                        const set = new Btn("セット", () => __awaiter(this, void 0, void 0, function* () {
                            if (!this.choosedTec) {
                                return;
                            }
                            for (let i = 0; i < this.target.tecs.length; i++) {
                                if (this.target.tecs[i] === Tec.empty) {
                                    this.target.tecs[i] = this.choosedTec;
                                    FX_Str(Font.def, `${this.choosedTec}をセットしました`, { x: 0.5, y: 0.5 }, Color.WHITE);
                                    // this.setList(this.target, this.getListTecs ,/*keepPage*/true);
                                    return;
                                }
                            }
                            FX_Str(Font.def, `技欄に空きがありません`, { x: 0.5, y: 0.5 }, Color.WHITE);
                        }));
                        const unset = new Btn("外す", () => __awaiter(this, void 0, void 0, function* () {
                            if (!this.choosedTec) {
                                return;
                            }
                            for (let i = 0; i < this.target.tecs.length; i++) {
                                if (this.target.tecs[i] === this.choosedTec) {
                                    this.target.tecs[i] = Tec.empty;
                                    FX_Str(Font.def, `${this.choosedTec}を外しました`, { x: 0.5, y: 0.5 }, Color.WHITE);
                                    // this.setList(this.target, this.getListTecs, /*keepPage*/true);
                                    return;
                                }
                            }
                        }));
                        return new VariableLayout(() => {
                            if (choosedTecIsSetting()) {
                                return unset;
                            }
                            return set;
                        });
                    })(),
                ];
                const w = 2;
                const h = ((otherBtns1.length + otherBtns2.length + TecType.values().length + 1) / w) | 0;
                const l = new FlowLayout(w, h);
                for (let type of TecType.values()) {
                    l.add(new Btn(`${type}`, () => {
                        this.setList(this.target, u => type.tecs.filter(t => u.isMasteredTec(t)));
                    }));
                }
                for (const o of otherBtns1) {
                    l.add(o);
                }
                for (const o of otherBtns2) {
                    l.addFromLast(o);
                }
                return l;
            })());
        })()));
        this.setList(this.target, u => u.tecs);
    }
    setList(unit, getListTecs, keepPage = false) {
        this.target = unit;
        this.getListTecs = getListTecs;
        this.choosedTec = undefined;
        // this.list.add({
        //     center:()=>`${unit.name}`,
        //     groundColor:()=>Color.D_GRAY,
        // });
        this.list.clear(keepPage);
        getListTecs(unit)
            .forEach((tec) => {
            if (tec === Tec.empty) {
                this.list.add({
                    right: () => "-",
                });
            }
            else {
                let color = () => {
                    if (tec === this.choosedTec) {
                        return Color.ORANGE;
                    }
                    if (unit.tecs.some(t => t === tec)) {
                        return Color.CYAN;
                    }
                    return Color.WHITE;
                };
                this.list.add({
                    left: () => unit.tecs.some(t => t === tec) ? "=" : ``,
                    leftColor: color,
                    right: () => `${tec}`,
                    rightColor: color,
                    push: (elm) => {
                        this.choosedTec = tec;
                    },
                });
            }
        });
    }
}
