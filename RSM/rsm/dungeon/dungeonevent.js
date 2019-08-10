var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Util, Place, PlayData } from "../util.js";
import { Btn } from "../widget/btn.js";
import { Dungeon } from "./dungeon.js";
import { Scene, cwait, wait } from "../undym/scene.js";
import { TownScene } from "../scene/townscene.js";
import { Item } from "../item.js";
import { ILayout, FlowLayout } from "../undym/layout.js";
import { Color } from "../undym/type.js";
import { Unit, Prm } from "../unit.js";
import { FX_Advance, FX_Return } from "../fx/fx.js";
import { Battle, BattleType, BattleResult } from "../battle.js";
import { BattleScene } from "../scene/battlescene.js";
import DungeonScene from "../scene/dungeonscene.js";
import { ItemScene } from "../scene/itemscene.js";
import { Targeting, Dmg } from "../force.js";
import { Img } from "../graphics/graphics.js";
import { SaveData } from "../savedata.js";
export default class DungeonEvent {
    constructor() {
    }
    getImg() { return this.img ? this.img : (this.img = this.createImg()); }
    createImg() { return Img.empty; }
    happen() {
        return __awaiter(this, void 0, void 0, function* () {
            DungeonEvent.now = this;
            yield this.happenInner();
        });
    }
    isZoomImg() { return true; }
}
DungeonEvent.empty = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.happenInner = () => { Util.msg.set(""); };
        this.createBtnLayout = () => createDefLayout();
    }
};
DungeonEvent.BOX = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.createImg = () => new Img("img/box.png");
        // createImg = ()=> new Img("data:image/png;base64,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");
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () { Util.msg.set("宝箱だ"); });
        this.createBtnLayout = () => createDefLayout()
            .set(ReturnBtn.index, new Btn("開ける", () => __awaiter(this, void 0, void 0, function* () {
            yield DungeonEvent.OPEN_BOX.happen();
        })));
    }
};
DungeonEvent.OPEN_BOX = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.createImg = () => new Img("img/box_open.png");
        // createImg = ()=> new Img("data:image/png;base64,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");
        this.isZoomImg = () => false;
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            let openNum = 1;
            let openBoost = 0.3;
            while (Math.random() <= openBoost) {
                openNum++;
                openBoost /= 2;
            }
            let dungeonRank = Dungeon.now.au;
            for (let i = 0; i < openNum; i++) {
                const itemRank = Item.fluctuateRank(dungeonRank);
                let item = Item.rndBoxRankItem(itemRank);
                let addNum = 1;
                item.add(addNum);
                if (i < openNum - 1) {
                    yield wait();
                }
            }
            if (Math.random() < 0.15) {
                const trends = Dungeon.now.trendItems();
                if (trends.length > 0) {
                    const item = trends[(Math.random() * trends.length) | 0];
                    yield wait();
                    item.add(1);
                }
            }
        });
        this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
    }
};
DungeonEvent.TREASURE = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.createImg = () => new Img("img/treasure.png");
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            Util.msg.set("財宝の箱だ！");
            Util.msg.set(`要:${Dungeon.now.treasureKey}(所持:${Dungeon.now.treasureKey.num}個)`);
        });
        this.createBtnLayout = () => createDefLayout()
            .set(ReturnBtn.index, new Btn("開ける", () => __awaiter(this, void 0, void 0, function* () {
            if (Dungeon.now.treasureKey.num > 0) {
                Dungeon.now.treasureKey.num--;
                Dungeon.now.treasureOpenNum++;
                yield DungeonEvent.OPEN_TREASURE.happen();
            }
            else {
                Util.msg.set("鍵を持っていない");
            }
        })));
    }
};
DungeonEvent.OPEN_TREASURE = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.createImg = () => new Img("img/treasure_open.png");
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            yield Dungeon.now.treasure.add(1);
        });
        this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
    }
};
DungeonEvent.GET_TREASURE_KEY = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            yield Dungeon.now.treasureKey.add(1);
        });
        this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
    }
};
DungeonEvent.TRAP = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.createImg = () => new Img("img/trap.png");
        // createImg = ()=> new Img("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAADAFBMVEUAAAClsZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFRUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADCsb2vprObm5uOjo51dXVQUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADd3d3Kysqzs7OZmZlxcXEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADTBZotAAAAAXRSTlMAQObYZgAAAcxJREFUeJztlUt2wzAIRbWEt4SuoRZz/fa/pgJClp34I6WDDmoGSc6J3tUDY3DuiSf+XUDjczGFEL7C8hEBWDiCRPqeJ4CWJcYQ1UFKNC2PKcYNoExZAKX0C4DI9wCaARBy2gLAAEYOA/hsA3ghkKMAwjAALM0JCoAjAUABY3oSpQBQAQ4R3A5ENNaLoGwAkeqlrCeJMX1OBqjJGHRCzwAxn+txND3GAKxngP7obav3cxEGAKLPtdZmftWbmRt96YD1/FT+W0DXYxDA/t8BtXZD00jyF8Cu3wZrr0EVwF27SjBWejtcFLCzL/er+xEKKWC9HbDu0UdQfVxi9Ak0v2hC+7Y+uEqHE2j2u1pjJWg9TxGFAWjG9y/u1sbpRIACQG9q+3slpHKsB6cAeO/ppGVgr9PxUGMlClR98Kd9ADxVT8aq1KrI1Uf6NtMcvgIPqOOxioqgDPdqAkkGYuQPugDoyaKF7K2IBkjEywHg1RSuAPVJ5Nwal1OWLxbLdI/hHlCbSbIQKc9WUgMNECvgvp0LkoxDWW0QAzuAv3mrYDNF1pHMdl2wHeAHxgp3g85l2G7sAF5U8Ld6deF1tewAflTdGK8xIX7iiSf+IH4A7eugt9+rvsgAAAAASUVORK5CYII=");
        this.happenInner = () => {
            Util.msg.set("罠だ");
        };
        this.createBtnLayout = () => createDefLayout()
            .set(ReturnBtn.index, new Btn("解除", () => __awaiter(this, void 0, void 0, function* () {
            yield DungeonEvent.TRAP_BROKEN.happen();
        })))
            .set(AdvanceBtn.index, new Btn("進む", () => __awaiter(this, void 0, void 0, function* () {
            Util.msg.set("引っかかった！", Color.RED);
            yield wait();
            for (let p of Unit.players) {
                if (!p.exists || p.dead) {
                    continue;
                }
                const dmg = new Dmg({ absPow: p.prm(Prm.MAX_HP).total() / 5 });
                yield p.doDmg(dmg);
                yield p.judgeDead();
            }
            DungeonEvent.TRAP_BROKEN.happen();
        })).setNoMove());
    }
};
DungeonEvent.TRAP_BROKEN = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.createImg = () => new Img("img/trap_broken.png");
        // createImg = ()=> new Img("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAADAFBMVEUAAAClsZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFRUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADCsb2vprObm5uOjo51dXVQUFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADd3d3Kysqzs7OZmZlxcXEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADTBZotAAAAAXRSTlMAQObYZgAAAfZJREFUeJztlkuSgzAMRDlCHyFnGKy9f/c/07SEnRiwPUOoms1EC4rE9FP7g9CyfOITfxO4Kcd6Sy7rHT0kxBBuyGMk4I78BkCQ4h0A01fAe3pKU0QHAIsf5KJKBeAAAMR7//DrnABJBcD73Qqs6+o14teMwNUrAPvVjITggzmIUWZ6AtR8OmVpAHlogXoC7OaYJfwGoHqbvO7ECCBjAPILcHqLDQACeEgGAKQWcAhHQJBFPLjNfQD9TwBYRAEwwEhvgNGwngroYRLpn0XZAEyCRlTDqNSLRj9DNkA71t5vezLRL2KAZ3ao1yPM7I8MmH1UtWU6HiX7l2M9ACdQ7Vf16bVFsd81kAlAMS79dZ7NnwYUUMT9XYJNfwBgYk4Azrmz8UZvD3YHnUOGqfsGq344qg4UPtb3l35HIEISluH8zf20lGVbyNQ7x1L3ZvMx24mUah48djOoocPjvdwAeOhT6TDFJ8HWc1JQMqKWwx3gZGPwyvOZrSRwuFu4XzZi7s9Cj4TV5VNJbRAYF7XNhbNPy+n/cgGXSIZltTLOpwGx1DSusUeYA7rQqAUx8CJvA6KwYQL4afLXAPYoxdouBH8dYJ9iaxUMEDbABQNRH5Y9wF3Qa7NgHdsL4H5sco6A0m8ZgJ0P3AX9HuCuqmtbVuOi+BP/J74B6amgtw2TZAcAAAAASUVORK5CYII=");
        this.isZoomImg = () => false;
        this.happenInner = () => {
            Util.msg.set("解除した");
        };
        this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
    }
};
DungeonEvent.BATTLE = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            Util.msg.set("敵が現れた！");
            Dungeon.now.setEnemy();
            Battle.setup(BattleType.NORMAL, (result) => {
                switch (result) {
                    case BattleResult.WIN:
                        Scene.load(DungeonScene.ins);
                        break;
                    case BattleResult.LOSE:
                        DungeonEvent.ESCAPE_DUNGEON.happen();
                        break;
                    case BattleResult.ESCAPE:
                        Scene.load(DungeonScene.ins);
                        break;
                }
            });
            Scene.load(BattleScene.ins);
        });
        this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
    }
};
DungeonEvent.BOSS_BATTLE = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            Util.msg.set(`[${Dungeon.now}]のボスが現れた！`, Color.WHITE.bright);
            Dungeon.now.setBoss();
            Battle.setup(BattleType.BOSS, (result) => __awaiter(this, void 0, void 0, function* () {
                switch (result) {
                    case BattleResult.WIN:
                        yield DungeonEvent.CLEAR_DUNGEON.happen();
                        break;
                    case BattleResult.LOSE:
                        yield DungeonEvent.ESCAPE_DUNGEON.happen();
                        break;
                    case BattleResult.ESCAPE:
                        yield DungeonEvent.ESCAPE_DUNGEON.happen();
                        break;
                }
            }));
            Scene.load(BattleScene.ins);
        });
        this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
    }
};
DungeonEvent.ESCAPE_DUNGEON = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            Util.msg.set(`${Dungeon.now.toString()}を脱出します...`);
            yield cwait();
            SaveData.save();
            yield cwait();
            Scene.load(TownScene.ins);
        });
        this.createBtnLayout = () => ILayout.empty;
    }
};
DungeonEvent.CLEAR_DUNGEON = new class extends DungeonEvent {
    constructor() {
        super(...arguments);
        this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
            let yen = (Dungeon.now.au + 1) * Dungeon.now.au / 10 * (1 + Dungeon.now.clearNum * 0.02);
            Dungeon.now.clearNum++;
            Util.msg.set(`[${Dungeon.now}]を踏破した！`, Color.WHITE.bright);
            yield cwait();
            PlayData.yen += yen | 0;
            Util.msg.set(`報奨金${yen}円入手`, Color.YELLOW.bright);
            yield cwait();
            Dungeon.now.clearItem().add(1);
            yield cwait();
            DungeonEvent.ESCAPE_DUNGEON.happen();
        });
        this.createBtnLayout = () => ILayout.empty;
    }
};
const createDefLayout = () => {
    //0,1,2,
    //3,4,5,
    return new FlowLayout(3, 2)
        .set(ItemBtn.index, ItemBtn.ins)
        .set(ReturnBtn.index, ReturnBtn.ins)
        .set(AdvanceBtn.index, AdvanceBtn.ins);
};
class AdvanceBtn {
    static get ins() {
        if (!this._ins) {
            this._ins = new Btn(() => "進む", () => __awaiter(this, void 0, void 0, function* () {
                FX_Advance(Place.MAIN);
                Dungeon.auNow += 1;
                if (Dungeon.auNow >= Dungeon.now.au) {
                    Dungeon.auNow = Dungeon.now.au;
                    yield DungeonEvent.BOSS_BATTLE.happen();
                    return;
                }
                yield Dungeon.now.rndEvent().happen();
            }));
        }
        return this._ins;
    }
}
AdvanceBtn.index = 0;
class ReturnBtn {
    static get ins() {
        if (!this._ins) {
            this._ins = new Btn(() => "戻る", () => __awaiter(this, void 0, void 0, function* () {
                FX_Return(Place.MAIN);
                Dungeon.auNow -= 1;
                if (Dungeon.auNow < 0) {
                    Dungeon.auNow = 0;
                    yield DungeonEvent.ESCAPE_DUNGEON.happen();
                    return;
                }
                yield Dungeon.now.rndEvent().happen();
            }));
        }
        return this._ins;
    }
}
ReturnBtn.index = 1;
class ItemBtn {
    static get ins() {
        if (!this._ins) {
            this._ins = new Btn(() => "アイテム", () => __awaiter(this, void 0, void 0, function* () {
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
                        Scene.set(DungeonScene.ins);
                    },
                }));
            }));
        }
        return this._ins;
    }
}
ItemBtn.index = 2;
