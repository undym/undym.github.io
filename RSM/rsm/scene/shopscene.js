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
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place, PlayData } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Player } from "../player.js";
import { Eq } from "../eq.js";
import { Item } from "../item.js";
import { Job } from "../job.js";
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
        super.add(Place.TOP, DrawPlayInfo.ins);
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 0.75);
        super.add(mainBounds, new XLayout()
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.7);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                    const goods = this.choosedGoods;
                    if (!goods) {
                        return;
                    }
                    let font = Font.def;
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    const movedP = () => p = p.move(0, font.ratioH);
                    font.draw(`[${goods}]`, movedP(), Color.WHITE);
                    font.draw(`${goods.price()}円`, movedP(), Color.WHITE);
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
                    if (!goods.isVisible()) {
                        return;
                    }
                    if (PlayData.yen >= goods.price()) {
                        PlayData.yen -= goods.price();
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
const initGoods = () => {
    const createItemGoods = (item, price, isVisible) => {
        new Goods(item.toString(), item.info, price, isVisible, () => item.add(1), () => item.num);
    };
    const createItemGoodsNum = (item, num, price, isVisible) => {
        new Goods(item.toString(), item.info, price, isVisible, () => item.add(num), () => item.num);
    };
    const createEqGoods = (eq, price, isVisible) => {
        let info = [`＜${eq.pos}＞`];
        new Goods(eq.toString(), info.concat(eq.info), price, isVisible, () => eq.add(1), () => eq.num);
    };
    createItemGoods(Item.スティックパン, () => (Item.スティックパン.num + 1) * 30, () => Item.スティックパン.num < 5);
    createItemGoods(Item.脱出ポッド, () => 10, () => Item.脱出ポッド.num < 1);
    createEqGoods(Eq.う棒, () => 500, () => Unit.getFirstPlayer().prm(Prm.LV).base > 10 && Eq.う棒.num === 0);
    createEqGoods(Eq.銅剣, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20 && Eq.銅剣.num === 0);
    createEqGoods(Eq.鉄拳, () => 9000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 40 && Eq.鉄拳.num === 0);
    createEqGoods(Eq.はがねの剣, () => 27000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 60 && Eq.はがねの剣.num === 0);
    createEqGoods(Eq.杖, () => 500, () => Unit.getFirstPlayer().prm(Prm.LV).base > 10 && Eq.杖.num === 0);
    createEqGoods(Eq.スギの杖, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20 && Eq.スギの杖.num === 0);
    createEqGoods(Eq.ヒノキの杖, () => 9000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 40 && Eq.ヒノキの杖.num === 0);
    createEqGoods(Eq.漆の杖, () => 27000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 60 && Eq.漆の杖.num === 0);
    createEqGoods(Eq.木の鎖, () => 500, () => Unit.getFirstPlayer().prm(Prm.LV).base > 10 && Eq.木の鎖.num === 0);
    createEqGoods(Eq.銅の鎖, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20 && Eq.銅の鎖.num === 0);
    createEqGoods(Eq.鉄の鎖, () => 9000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 40 && Eq.鉄の鎖.num === 0);
    createEqGoods(Eq.銀の鎖, () => 27000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 60 && Eq.銀の鎖.num === 0);
    createEqGoods(Eq.パチンコ, () => 500, () => Unit.getFirstPlayer().prm(Prm.LV).base > 10 && Eq.パチンコ.num === 0);
    createEqGoods(Eq.ボウガン, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20 && Eq.ボウガン.num === 0);
    createEqGoods(Eq.投石器, () => 9000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 40 && Eq.投石器.num === 0);
    createEqGoods(Eq.大砲, () => 27000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 60 && Eq.大砲.num === 0);
    createEqGoods(Eq.銅板, () => 200, () => Unit.getFirstPlayer().prm(Prm.LV).base > 3 && Eq.銅板.num === 0);
    createEqGoods(Eq.鉄板, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 10 && Eq.鉄板.num === 0);
    createEqGoods(Eq.鋼鉄板, () => 9000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20 && Eq.鋼鉄板.num === 0);
    createEqGoods(Eq.チタン板, () => 27000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 30 && Eq.チタン板.num === 0);
    createEqGoods(Eq.魔女のとんがり帽, () => 500, () => Unit.getFirstPlayer().prm(Prm.LV).base > 30 && Eq.魔女のとんがり帽.num === 0);
    createEqGoods(Eq.魔女の高級とんがり帽, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 50 && Eq.魔女の高級とんがり帽.num === 0);
    createEqGoods(Eq.魔女の最高級とんがり帽, () => 10000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 70 && Eq.魔女の最高級とんがり帽.num === 0);
    createEqGoods(Eq.魔女の超最高級とんがり帽, () => 100000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 90 && Eq.魔女の超最高級とんがり帽.num === 0);
    createEqGoods(Eq.山男のとんかつ帽, () => 500, () => Unit.getFirstPlayer().prm(Prm.LV).base > 30 && Eq.山男のとんかつ帽.num === 0);
    createEqGoods(Eq.山男の高級とんかつ帽, () => 3000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 50 && Eq.山男の高級とんかつ帽.num === 0);
    createEqGoods(Eq.山男の最高級とんかつ帽, () => 10000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 70 && Eq.山男の最高級とんかつ帽.num === 0);
    createEqGoods(Eq.山男の超最高級とんかつ帽, () => 100000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 90 && Eq.山男の超最高級とんかつ帽.num === 0);
    createEqGoods(Eq.草の服, () => 100, () => Unit.getFirstPlayer().prm(Prm.LV).base > 3 && Eq.草の服.num === 0);
    createEqGoods(Eq.布の服, () => 700, () => Unit.getFirstPlayer().prm(Prm.LV).base > 20 && Eq.布の服.num === 0);
    createEqGoods(Eq.皮の服, () => 5000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 40 && Eq.皮の服.num === 0);
    createEqGoods(Eq.木の鎧, () => 16000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 60 && Eq.木の鎧.num === 0);
    createEqGoods(Eq.青銅の鎧, () => 26000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 80 && Eq.青銅の鎧.num === 0);
    createEqGoods(Eq.鉄の鎧, () => 36000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 100 && Eq.鉄の鎧.num === 0);
    createEqGoods(Eq.鋼鉄の鎧, () => 46000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 120 && Eq.鋼鉄の鎧.num === 0);
    createEqGoods(Eq.銀の鎧, () => 56000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 140 && Eq.銀の鎧.num === 0);
    createEqGoods(Eq.金の鎧, () => 66000, () => Unit.getFirstPlayer().prm(Prm.LV).base > 160 && Eq.金の鎧.num === 0);
    if (Player.values().some(p => p.ins.getJobLv(Job.クピド) > 0)) {
        createItemGoodsNum(Item.夜叉の矢, 2, () => (Item.夜叉の矢.num + 1) * 500, () => true);
    }
    if (Player.values().some(p => p.ins.isMasteredJob(Job.砲撃手))) {
        createItemGoodsNum(Item.散弾, 4, () => (Item.散弾.num + 1) * 300, () => true);
    }
};
