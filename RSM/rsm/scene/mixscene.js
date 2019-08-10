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
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Item } from "../item.js";
import { Mix } from "../mix.js";
import { Eq } from "../eq.js";
import { SaveData } from "../savedata.js";
import { Building } from "../building.js";
export class MixScene extends Scene {
    constructor() {
        super();
        /**セーブフラグ. */
        this.runAnyMix = false;
        this.list = new List();
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
                    if (!this.choosedMix) {
                        return;
                    }
                    const mix = this.choosedMix;
                    const font = Font.def;
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    const movedP = () => p = p.move(0, font.ratioH);
                    if (mix.countLimit() === Mix.LIMIT_INF) {
                        font.draw(`合成回数(${mix.count}/-)`, p, Color.WHITE);
                    }
                    else {
                        font.draw(`合成回数(${mix.count}/${mix.countLimit()})`, p, Color.WHITE);
                    }
                    for (let m of mix.materials) {
                        const color = m.num >= m.object.num ? Color.WHITE : Color.GRAY;
                        font.draw(`[${m.object}] ${m.num}/${m.object.num}`, movedP(), color);
                    }
                    if (this.choosedObj instanceof Item) {
                        const result = this.choosedMix.result;
                        if (!result) {
                            return;
                        }
                        const item = result.object;
                        if (!(item instanceof Item)) {
                            return;
                        }
                        const limit = item.num >= item.numLimit ? "（所持上限）" : "";
                        font.draw(`[${item}]x${result.num} <${item.itemType}> ${limit}`, movedP(), Color.WHITE);
                        for (let info of item.info) {
                            font.draw(info, movedP(), Color.WHITE);
                        }
                    }
                    if (this.choosedObj instanceof Eq) {
                        const result = this.choosedMix.result;
                        if (!result) {
                            return;
                        }
                        const eq = result.object;
                        if (!(eq instanceof Eq)) {
                            return;
                        }
                        font.draw(`[${eq}]x${eq.num} <${eq.pos}>`, movedP(), Color.WHITE);
                        for (let info of eq.info) {
                            font.draw(info, movedP(), Color.WHITE);
                        }
                    }
                } }))
                .add(btnBounds, (() => {
                const l = new FlowLayout(2, 2);
                l.add(new Btn("建築", () => {
                    this.setBuildingList();
                }));
                l.add(new Btn("アイテム", () => {
                    this.setItemList();
                }));
                l.add(new Btn("装備", () => {
                    this.setEqList();
                }));
                l.addFromLast(new Btn("<<", () => {
                    SaveData.save();
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
                    this.runAnyMix = true;
                }));
                const noRun = new Btn("合成", () => __awaiter(this, void 0, void 0, function* () {
                }));
                noRun.stringColor = () => Color.GRAY;
                noRun.groundColor = () => Color.D_GRAY;
                l.addFromLast(new VariableLayout(() => {
                    return canMix() ? run : noRun;
                }));
                return l;
            })());
        })()));
        const pboxBounds = new Rect(0, mainBounds.yh, 1, 1 - mainBounds.yh);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
    }
    setBuildingList() {
        this.list.clear();
        this.list.add({
            center: () => "建築",
            groundColor: () => Color.D_GRAY,
        });
        Building.values()
            .forEach(b => {
            if (!b.mix || !b.mix.isVisible()) {
                return;
            }
            const mix = b.mix;
            const color = () => {
                if (b === this.choosedObj) {
                    return Color.CYAN;
                }
                if (!mix.canRun()) {
                    return Color.GRAY;
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => `${mix.count}`,
                leftColor: color,
                right: () => b.toString(),
                rightColor: color,
                push: (elm) => {
                    this.choosedObj = b;
                    this.choosedMix = b.mix;
                },
            });
        });
    }
    setItemList() {
        this.list.clear();
        this.list.add({
            center: () => "アイテム",
            groundColor: () => Color.D_GRAY,
        });
        Item.values()
            .forEach(item => {
            if (!item.mix || !item.mix.isVisible()) {
                return;
            }
            const mix = item.mix;
            const color = () => {
                if (item === this.choosedObj) {
                    return Color.CYAN;
                }
                if (!mix.canRun()) {
                    return Color.GRAY;
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => `${item.num}/${item.numLimit}`,
                leftColor: color,
                right: () => item.toString(),
                rightColor: color,
                push: (elm) => {
                    this.choosedObj = item;
                    this.choosedMix = item.mix;
                },
            });
        });
    }
    setEqList() {
        this.list.clear();
        this.list.add({
            center: () => "装備",
            groundColor: () => Color.D_GRAY,
        });
        Eq.values()
            .forEach(eq => {
            if (!eq.mix || !eq.mix.isVisible()) {
                return;
            }
            const mix = eq.mix;
            const color = () => {
                if (eq === this.choosedObj) {
                    return Color.CYAN;
                }
                if (!mix.canRun()) {
                    return Color.GRAY;
                }
                return Color.WHITE;
            };
            this.list.add({
                left: () => `${eq.num}`,
                leftColor: color,
                right: () => eq.toString(),
                rightColor: color,
                push: (elm) => {
                    this.choosedObj = eq;
                    this.choosedMix = eq.mix;
                },
            });
        });
    }
}
