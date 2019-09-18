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
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Item } from "../item.js";
import { Mix } from "../mix.js";
import { Eq } from "../eq.js";
import { SaveData } from "../savedata.js";
export class MixScene extends Scene {
    constructor() {
        super();
        /**セーブフラグ. */
        this.doneAnyMix = false;
        this.list = new List();
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
        super.add(mainBounds, new XLayout()
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.4);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                    const mix = this.choosedMix;
                    if (!mix) {
                        return;
                    }
                    const font = Font.def;
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    const moveP = () => p = p.move(0, font.ratioH);
                    if (mix.countLimit === Mix.LIMIT_INF) {
                        font.draw(`合成回数(${mix.count}/-)`, p, Color.WHITE);
                    }
                    else {
                        font.draw(`合成回数(${mix.count}/${mix.countLimit})`, p, Color.WHITE);
                    }
                    for (let m of mix.materials) {
                        const color = m.num <= m.object.num ? Color.WHITE : Color.GRAY;
                        font.draw(`[${m.object}] ${m.object.num}/${m.num}`, moveP(), color);
                    }
                    const result = mix.result;
                    if (result) {
                        moveP();
                        if (result.object instanceof Eq) {
                            const eq = result.object;
                            font.draw(`<${eq.pos}>`, moveP(), Color.WHITE);
                            if (!mix.info) {
                                for (const info of eq.info) {
                                    font.draw(info, moveP(), Color.WHITE);
                                }
                            }
                        }
                        if (result.object instanceof Item) {
                            const item = result.object;
                            font.draw(`<${item.itemType}>`, moveP(), Color.WHITE);
                            if (!mix.info) {
                                for (const info of item.info) {
                                    font.draw(info, moveP(), Color.WHITE);
                                }
                            }
                        }
                    }
                    if (mix.info) {
                        moveP();
                        for (const info of mix.info) {
                            font.draw(info, moveP(), Color.WHITE);
                        }
                    }
                    // if(this.choosedObj instanceof Item){
                    //     const result = this.choosedMix.result;
                    //     if(!result){return;}
                    //     const item = result.object;
                    //     if(!(item instanceof Item)){return;}
                    //     const limit = item.num >= item.numLimit ? "（所持上限）" : "";
                    //     font.draw(`[${item}]x${result.num} <${item.itemType}> ${limit}`, moveP(), Color.WHITE);
                    //     for(let info of item.info){
                    //         font.draw(info, moveP(), Color.WHITE);
                    //     }
                    // }
                    // if(this.choosedObj instanceof Eq){
                    //     const result = this.choosedMix.result;
                    //     if(!result){return;}
                    //     const eq = result.object;
                    //     if(!(eq instanceof Eq)){return;}
                    //     font.draw(`[${eq}]x${eq.num} <${eq.pos}>`, moveP(), Color.WHITE);
                    //     for(let info of eq.info){
                    //         font.draw(info, moveP(), Color.WHITE);
                    //     }
                    // }
                } }))
                .add(btnBounds, (() => {
                const l = new FlowLayout(2, 3);
                l.add(new Btn("建築", () => {
                    const values = Mix.values
                        .filter(m => !m.result && m.isVisible());
                    this.setList("建築", values);
                }));
                l.add(new Btn("装備", () => {
                    const values = Mix.values
                        .filter(m => {
                        const result = m.result;
                        if (result && result.object instanceof Eq && m.isVisible()) {
                            return true;
                        }
                        return false;
                    });
                    this.setList("装備", values);
                }));
                l.add(new Btn("アイテム", () => {
                    const values = Mix.values
                        .filter(m => {
                        const result = m.result;
                        if (result && result.object instanceof Item && m.isVisible()) {
                            return true;
                        }
                        return false;
                    });
                    this.setList("アイテム", values);
                }));
                l.addFromLast(new Btn("<<", () => {
                    if (this.doneAnyMix) {
                        SaveData.save();
                    }
                    Scene.load(TownScene.ins);
                }));
                const canMix = () => {
                    if (!this.choosedMix) {
                        return false;
                    }
                    return this.choosedMix.canRun();
                };
                const run = new Btn("合成", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedMix) {
                        return;
                    }
                    this.choosedMix.run();
                    this.doneAnyMix = true;
                }));
                const noRun = new Btn("-", () => __awaiter(this, void 0, void 0, function* () {
                }));
                l.addFromLast(new VariableLayout(() => {
                    return canMix() ? run : noRun;
                }));
                return l;
            })());
        })()));
    }
    setList(name, values) {
        this.list.clear();
        this.list.add({
            center: () => name,
        });
        values
            .forEach(mix => {
            const color = () => {
                if (mix === this.choosedMix) {
                    return Color.CYAN;
                }
                if (!mix.canRun()) {
                    return Color.GRAY;
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => {
                    if (mix.countLimit === Mix.LIMIT_INF) {
                        return `${mix.count}`;
                    }
                    return `${mix.count}/${mix.countLimit}`;
                },
                leftColor: color,
                right: () => mix.toString(),
                rightColor: color,
                push: (elm) => {
                    this.choosedMix = mix;
                },
            });
        });
    }
}
