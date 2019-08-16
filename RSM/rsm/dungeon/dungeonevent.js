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
export class DungeonEvent {
    constructor() {
        DungeonEvent._values.push(this);
    }
    static values() {
        return this._values;
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
DungeonEvent._values = [];
(function (DungeonEvent) {
    DungeonEvent.empty = new class extends DungeonEvent {
        constructor() {
            super();
            this.happenInner = () => { Util.msg.set(""); };
            this.createBtnLayout = () => createDefLayout();
        }
    };
    DungeonEvent.BOX = new class extends DungeonEvent {
        constructor() {
            super();
            this.createImg = () => new Img("img/box.png");
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () { Util.msg.set("宝箱だ"); });
            this.createBtnLayout = () => createDefLayout()
                .set(ReturnBtn.index, new Btn("開ける", () => __awaiter(this, void 0, void 0, function* () {
                yield DungeonEvent.OPEN_BOX.happen();
            })));
        }
    };
    DungeonEvent.OPEN_BOX = new class extends DungeonEvent {
        constructor() {
            super();
            this.createImg = () => new Img("img/box_open.png");
            this.isZoomImg = () => false;
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
                let openNum = 1;
                let openBoost = 0.3;
                while (Math.random() <= openBoost) {
                    openNum++;
                    openBoost /= 2;
                }
                let dungeonRank = Dungeon.now.rank;
                for (let i = 0; i < openNum; i++) {
                    const itemRank = Item.fluctuateRank(dungeonRank);
                    let item = Item.rndItem(Item.DROP_BOX, itemRank);
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
            super();
            this.createImg = () => new Img("img/treasure.png");
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
                Util.msg.set("財宝の箱だ！");
                Util.msg.set(`要:${Dungeon.now.treasureKey}(所持:${Dungeon.now.treasureKey.num}個)`);
            });
            this.createBtnLayout = () => createDefLayout()
                .set(ReturnBtn.index, new Btn("開ける", () => __awaiter(this, void 0, void 0, function* () {
                if (Dungeon.now.treasureKey.num > 0) {
                    Dungeon.now.treasureKey.num--;
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
            super();
            this.createImg = () => new Img("img/treasure_open.png");
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
                yield Dungeon.now.treasure.add(1);
            });
            this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
        }
    };
    DungeonEvent.GET_TREASURE_KEY = new class extends DungeonEvent {
        constructor() {
            super();
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
                yield Dungeon.now.treasureKey.add(1);
            });
            this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
        }
    };
    DungeonEvent.TRAP = new class extends DungeonEvent {
        constructor() {
            super();
            this.createImg = () => new Img("img/trap.png");
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
                    const dmg = new Dmg({ absPow: p.prm(Prm.MAX_HP).total / 5 });
                    yield p.doDmg(dmg);
                    yield p.judgeDead();
                }
                DungeonEvent.empty.happen();
            })).setNoMove());
        }
    };
    DungeonEvent.TRAP_BROKEN = new class extends DungeonEvent {
        constructor() {
            super();
            this.createImg = () => new Img("img/trap_broken.png");
            this.isZoomImg = () => false;
            this.happenInner = () => {
                Util.msg.set("解除した");
            };
            this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
        }
    };
    DungeonEvent.TREE = new class extends DungeonEvent {
        constructor() {
            super();
            this.createImg = () => new Img("img/tree.png");
            this.happenInner = () => {
                Util.msg.set("木だ");
            };
            this.createBtnLayout = () => createDefLayout()
                .set(ReturnBtn.index, new Btn("切る", () => __awaiter(this, void 0, void 0, function* () {
                yield DungeonEvent.TREE_BROKEN.happen();
            })))
                .set(AdvanceBtn.index, new Btn("進む", () => __awaiter(this, void 0, void 0, function* () {
                Util.msg.set("いてっ！", Color.RED);
                yield wait();
                for (let p of Unit.players) {
                    if (!p.exists || p.dead) {
                        continue;
                    }
                    const dmg = new Dmg({ absPow: p.prm(Prm.MAX_HP).total / 10 });
                    yield p.doDmg(dmg);
                    yield p.judgeDead();
                }
            })).setNoMove());
        }
    };
    DungeonEvent.TREE_BROKEN = new class extends DungeonEvent {
        constructor() {
            super();
            this.createImg = () => new Img("img/tree_broken.png");
            this.isZoomImg = () => false;
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
                let openNum = 1;
                let openBoost = 0.3;
                while (Math.random() <= openBoost) {
                    openNum++;
                    openBoost /= 2;
                }
                let dungeonRank = Dungeon.now.rank;
                for (let i = 0; i < openNum; i++) {
                    const itemRank = Item.fluctuateRank(dungeonRank);
                    let item = Item.rndItem(Item.DROP_TREE, itemRank);
                    let addNum = 1;
                    item.add(addNum);
                    if (i < openNum - 1) {
                        yield wait();
                    }
                }
            });
            this.createBtnLayout = DungeonEvent.empty.createBtnLayout;
        }
    };
    DungeonEvent.BATTLE = new class extends DungeonEvent {
        constructor() {
            super();
            this.happenInner = () => __awaiter(this, void 0, void 0, function* () {
                Util.msg.set("敵が現れた！");
                Dungeon.now.setEnemy();
                Battle.setup(BattleType.NORMAL, (result) => {
                    switch (result) {
                        case BattleResult.WIN:
                            SaveData.save();
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
            super();
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
            super();
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
            super();
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
})(DungeonEvent || (DungeonEvent = {}));
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
