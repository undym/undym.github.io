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
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { FX_Str } from "../fx/fx.js";
import { Eq, EqPos } from "../eq.js";
export class EqScene extends Scene {
    constructor() {
        super();
        this.list = new List();
        this.target = Unit.getFirstPlayer();
    }
    init() {
        super.clear();
        const mainBounds = new Rect(0, 0, 1, 0.8);
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
                    const eq = this.choosedEq;
                    let font = Font.def;
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    const movedP = () => p = p.move(0, font.ratioH);
                    font.draw(`[${eq}]`, p, Color.WHITE);
                    font.draw(`<${eq.pos}>`, movedP(), Color.WHITE);
                    font.draw(`${eq.num}個`, movedP(), Color.WHITE);
                    for (let s of eq.info) {
                        font.draw(s, movedP(), Color.WHITE);
                    }
                } }))
                .add(btnBounds, (() => {
                const set = new Btn("装備", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedEq) {
                        return;
                    }
                    equip(this.target, this.choosedEq);
                    FX_Str(Font.def, `${this.choosedEq}をセットしました`, Point.CENTER, Color.WHITE);
                }));
                const unset = new Btn("外す", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedEq) {
                        return;
                    }
                    equip(this.target, Eq.getDef(this.pos));
                    FX_Str(Font.def, `${this.choosedEq}を外しました`, Point.CENTER, Color.WHITE);
                }));
                const otherBtns = [
                    new Btn("<<", () => {
                        Scene.load(TownScene.ins);
                    }),
                    new VariableLayout(() => {
                        if (this.target.getEq(this.pos) === this.choosedEq) {
                            return unset;
                        }
                        return set;
                    }),
                    new Btn("全て", () => {
                        this.list.clear();
                        for (const pos of EqPos.values()) {
                            this.setList(this.target, pos);
                        }
                    }),
                ];
                const w = 2;
                const h = ((otherBtns.length + EqPos.values().length + 1) / w) | 0;
                const l = new FlowLayout(w, h);
                for (let pos of EqPos.values()) {
                    l.add(new Btn(`${pos}`, () => {
                        this.list.clear();
                        this.setList(this.target, pos);
                    }));
                }
                for (const o of otherBtns) {
                    l.addFromLast(o);
                }
                return l;
            })());
        })()));
        const pboxBounds = new Rect(0, mainBounds.yh, 1, 1 - mainBounds.yh);
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
                        this.list.clear(/*keepPage*/ false);
                        this.setList(p, this.pos);
                        break;
                    }
                }
            } }));
        this.list.clear();
        this.setList(this.target, EqPos.頭);
    }
    setList(unit, pos) {
        this.target = unit;
        this.pos = pos;
        this.choosedEq = undefined;
        this.list.add({
            center: () => `${pos}`,
            groundColor: () => Color.D_GRAY,
        });
        pos.eqs
            .filter(eq => eq.num > 0 || eq === unit.getEq(pos))
            .forEach((eq) => {
            let color = () => {
                if (eq === this.choosedEq) {
                    return Color.ORANGE;
                }
                if (unit.getEq(pos) === eq) {
                    return Color.CYAN;
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => unit.getEq(pos) === eq ? "=" : ``,
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
