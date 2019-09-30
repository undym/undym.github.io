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
import { Place, PlayData } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { Player } from "../player.js";
import { EqEar } from "../eq.js";
import { Item } from "../item.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { Job } from "../job.js";
import { PartySkill } from "../partyskill.js";
let 砲撃手master = false;
let クピドmaster = false;
export class ShopScene extends Scene {
    constructor() {
        super();
        this.list = new List();
        クピドmaster = Player.values.some(p => p.ins.getJobLv(Job.クピド) > 0);
        砲撃手master = Player.values.some(p => p.ins.getJobLv(Job.砲撃手) > 0);
        if (!ShopScene.completedInitGoods) {
            ShopScene.completedInitGoods = true;
            initGoods();
        }
        this.setList();
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
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
                    const moveP = () => p = p.move(0, font.ratioH);
                    font.draw(`[${goods}]`, moveP(), Color.WHITE);
                    font.draw(`[${goods.type}]`, moveP(), Color.WHITE);
                    font.draw(`${goods.price()}円`, moveP(), Color.WHITE);
                    if (goods.num()) {
                        font.draw(`所持:${goods.num()}`, moveP(), Color.WHITE);
                    }
                    else {
                        moveP();
                    }
                    moveP();
                    font.draw(goods.info, moveP(), Color.WHITE);
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
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
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
                right: () => goods.isVisible() ? goods.toString() : `-`,
                groundColor: () => goods === this.choosedGoods ? Color.D_CYAN : Color.BLACK,
                push: (elm) => {
                    this.choosedGoods = goods;
                },
            });
        });
    }
}
ShopScene.completedInitGoods = false;
class Goods {
    constructor(name, type, info, price, isVisible, buy, num = () => undefined) {
        this.name = name;
        this.type = type;
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
        new Goods(item.toString(), "アイテム", item.info, price, isVisible, () => item.add(1), () => item.num);
    };
    // const createItemGoodsNum = (item:Item, num:number, price:()=>number, isVisible:()=>boolean)=>{
    //     new Goods(
    //         item.toString(),
    //         item.info,
    //         price,
    //         isVisible,
    //         ()=> item.add(num),
    //         ()=> item.num,
    //     );
    // };
    const createEqGoods = (eq, price, isVisible) => {
        new Goods(eq.toString(), `＜${eq.pos}＞`, eq.info, price, isVisible, () => eq.add(1), () => eq.num);
    };
    const createEarGoods = (ear, price, isVisible) => {
        new Goods(ear.toString(), "＜耳＞", ear.info, price, isVisible, () => ear.add(1), () => ear.num);
    };
    const createPartySkill = (skill, price, isVisible) => {
        new Goods(skill.toString(), "＜パーティースキル＞", "", price, () => isVisible() && !skill.has, () => skill.has = true);
    };
    createItemGoods(Item.合成許可証, () => 300, () => Dungeon.リテの門.dungeonClearCount > 0 && Item.合成許可証.totalGetCount === 0);
    createItemGoods(Item.スティックパン, () => (Item.スティックパン.num + 1) * 30, () => Item.スティックパン.totalGetCount < 5);
    createItemGoods(Item.脱出ポッド, () => 10, () => Item.脱出ポッド.totalGetCount < 1);
    createItemGoods(Item.赤い水, () => (Item.赤い水.num + 1) * 100, () => Item.赤い水.totalGetCount < 10 && Dungeon.再構成トンネル.dungeonClearCount > 0);
    createItemGoods(Item.サンタクララ薬, () => (Item.サンタクララ薬.num + 1) * 50, () => Item.サンタクララ薬.totalGetCount < 4 && Dungeon.再構成トンネル.dungeonClearCount > 0);
    createItemGoods(Item.夜叉の矢, () => (Item.夜叉の矢.num + 1) * 500, () => クピドmaster);
    createItemGoods(Item.散弾, () => (Item.散弾.num + 1) * 500, () => 砲撃手master);
    createItemGoods(Item.ボロい釣竿, () => 300, () => Dungeon.PAIN.dungeonClearCount > 0);
    createItemGoods(Item.マーザン竿, () => 700, () => Dungeon.PAIN.dungeonClearCount > 10);
    createEarGoods(EqEar.おにく, () => 100, () => Dungeon.はじまりの丘.dungeonClearCount > 0 && EqEar.おにく.totalGetCount < 2);
    createEarGoods(EqEar.水晶のピアス, () => 200, () => Dungeon.はじまりの丘.dungeonClearCount > 0 && EqEar.水晶のピアス.totalGetCount < 2);
    createEarGoods(EqEar.魔ヶ玉のピアス, () => 100, () => Dungeon.リテの門.dungeonClearCount > 0 && EqEar.魔ヶ玉のピアス.totalGetCount < 2);
    createEarGoods(EqEar.エメラルドのピアス, () => 100, () => Dungeon.リテの門.dungeonClearCount > 0 && EqEar.エメラルドのピアス.totalGetCount < 2);
    createItemGoods(Item.パーティースキル取り扱い許可証, () => 1000, () => Dungeon.黒遺跡.dungeonClearCount > 0 && Item.パーティースキル取り扱い許可証.num === 0);
    createPartySkill(PartySkill.入手経験値増加, () => 1000, () => Item.パーティースキル取り扱い許可証.num > 0);
    createPartySkill(PartySkill.入手ジョブ経験値増加, () => 1000, () => Item.パーティースキル取り扱い許可証.num > 0);
    createPartySkill(PartySkill.入手金増加, () => 2000, () => Item.パーティースキル取り扱い許可証.num > 0);
    createPartySkill(PartySkill.宝箱チェーン増加, () => 3000, () => Item.パーティースキル取り扱い許可証.num > 0);
    createPartySkill(PartySkill.宝箱ランク増加, () => 4000, () => Item.パーティースキル取り扱い許可証.num > 0);
    createPartySkill(PartySkill.伐採チェーン増加, () => 5000, () => PartySkill.宝箱チェーン増加.has);
};
