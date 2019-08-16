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
import { Unit, Prm } from "../unit.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { Place, PlayData } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Eq } from "../eq.js";
export class ShopScene extends Scene {
    constructor() {
        super();
        this.list = new List();
        if (!ShopScene.completedInitGoods) {
            ShopScene.completedInitGoods = true;
            initGoods();
        }
    }
    init() {
        super.clear();
        const mainBounds = new Rect(0, 0, 1, 0.8);
        super.add(mainBounds, new XLayout()
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.7);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                    let font = Font.def;
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    const movedP = () => p = p.move(0, font.ratioH);
                    font.draw(`所持金:${PlayData.yen | 0}円`, p, Color.YELLOW);
                    const goods = this.choosedGoods;
                    if (!goods) {
                        return;
                    }
                    font.draw(`[${goods}]`, movedP(), Color.WHITE);
                    font.draw(`${goods.price}円`, movedP(), Color.WHITE);
                    if (goods.num()) {
                        font.draw(`所持:${goods.num()}`, movedP(), Color.WHITE);
                    }
                    else {
                        movedP();
                    }
                    movedP();
                    for (let s of goods.info) {
                        font.draw(s, movedP(), Color.WHITE);
                    }
                } }))
                .add(btnBounds, (() => {
                const l = new FlowLayout(2, 1);
                l.addFromLast(new Btn("<<", () => {
                    Scene.load(TownScene.ins);
                }));
                // const choosedTecIsSetting = ()=> this.target.tecs.some(t=> t === this.choosedTec)
                const buy = new Btn("買う", () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.choosedGoods) {
                        return;
                    }
                    const goods = this.choosedGoods;
                    if (PlayData.yen >= goods.price) {
                        PlayData.yen -= goods.price;
                        goods.buy();
                    }
                }));
                const no = new Btn("-", () => __awaiter(this, void 0, void 0, function* () { }));
                l.addFromLast(new VariableLayout(() => {
                    if (this.choosedGoods && this.choosedGoods.isVisible()) {
                        return buy;
                    }
                    return no;
                }));
                return l;
            })());
        })()));
        const pboxBounds = new Rect(0, mainBounds.yh, 1, 1 - mainBounds.yh);
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
        this.setList();
    }
    setList() {
        this.list.clear();
        Goods.values()
            .filter(g => g.isVisible())
            .forEach(goods => {
            this.list.add({
                left: () => {
                    const num = goods.num();
                    return num ? `${num}` : "";
                },
                leftColor: () => Color.WHITE,
                right: () => goods.isVisible() ? goods.toString() : `-`,
                rightColor: () => Color.WHITE,
                push: (elm) => {
                    this.choosedGoods = goods;
                },
            });
        });
    }
}
ShopScene.completedInitGoods = false;
class Goods {
    constructor(name, info, price, isVisible, buy, num = () => undefined) {
        this.name = name;
        this.info = info;
        this.price = price;
        this.isVisible = isVisible;
        this.buy = buy;
        this.num = num;
        this.toString = () => this.name;
        Goods._values.push(this);
    }
    static values() {
        return this._values;
    }
}
Goods._values = [];
const createEqGoods = (eq, price, isVisible) => {
    let info = [`＜${eq.pos}＞`];
    new Goods(eq.toString(), info.concat(eq.info), price, isVisible, () => eq.add(1), () => eq.num);
};
const initGoods = () => {
    // new Goods(
    //     "よしこ",
    //     ["よしこが仲間になる"],
    //     100,
    //     ()=>!Player.よしこ.member,
    //     ()=>Player.よしこ.join(),
    // );
    createEqGoods(Eq.銅板, 100, () => true);
    createEqGoods(Eq.鉄板, 300, () => Unit.getFirstPlayer().prm(Prm.LV).base > 10);
    createEqGoods(Eq.鋼鉄板, 1000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20);
    createEqGoods(Eq.チタン板, 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 30);
};
