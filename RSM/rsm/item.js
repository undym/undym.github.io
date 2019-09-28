var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Util, SceneType } from "./util.js";
import { Color, Point } from "./undym/type.js";
import { Scene, wait } from "./undym/scene.js";
import { Unit, Prm, PUnit } from "./unit.js";
import { FX_Str } from "./fx/fx.js";
import { Targeting } from "./force.js";
import { choice } from "./undym/random.js";
import { Font } from "./graphics/graphics.js";
import { Num } from "./mix.js";
import { DungeonEvent } from "./dungeon/dungeonevent.js";
import DungeonScene from "./scene/dungeonscene.js";
import { Tec } from "./tec.js";
export class ItemType {
    constructor(name) {
        this.toString = () => name;
    }
    get values() {
        if (!this._values) {
            this._values = Item.values
                .filter(item => item.itemType === this);
        }
        return this._values;
    }
    ;
}
ItemType.蘇生 = new ItemType("蘇生");
ItemType.HP回復 = new ItemType("HP回復");
ItemType.MP回復 = new ItemType("MP回復");
ItemType.ダンジョン = new ItemType("ダンジョン");
ItemType.竿 = new ItemType("竿");
ItemType.弾 = new ItemType("弾");
ItemType.ドーピング = new ItemType("ドーピング");
ItemType.書 = new ItemType("書");
ItemType.メモ = new ItemType("メモ");
ItemType.鍵 = new ItemType("鍵");
ItemType.玉 = new ItemType("玉");
ItemType.素材 = new ItemType("素材");
export class ItemParentType {
    constructor(name, children) {
        this.children = children;
        this.toString = () => name;
        ItemParentType._values.push(this);
    }
    static get values() { return this._values; }
}
ItemParentType._values = [];
ItemParentType.回復 = new ItemParentType("回復", [ItemType.蘇生, ItemType.HP回復, ItemType.MP回復]);
ItemParentType.ダンジョン = new ItemParentType("ダンジョン", [ItemType.ダンジョン, ItemType.竿, ItemType.弾]);
ItemParentType.強化 = new ItemParentType("強化", [ItemType.ドーピング, ItemType.書]);
ItemParentType.その他 = new ItemParentType("その他", [ItemType.メモ, ItemType.鍵, ItemType.玉, ItemType.素材]);
export var ItemDrop;
(function (ItemDrop) {
    ItemDrop[ItemDrop["NO"] = 0] = "NO";
    ItemDrop[ItemDrop["BOX"] = 1] = "BOX";
    ItemDrop[ItemDrop["TREE"] = 2] = "TREE";
    ItemDrop[ItemDrop["STRATUM"] = 4] = "STRATUM";
    ItemDrop[ItemDrop["LAKE"] = 8] = "LAKE";
    ItemDrop[ItemDrop["FISHING"] = 16] = "FISHING";
})(ItemDrop || (ItemDrop = {}));
// export const ItemDrop = {
//     get NO()  {return 0;},
//     get BOX() {return 1 << 0;},
//     get TREE(){return 1 << 1;},
//     get DIG() {return 1 << 2;},
// }
class ItemValues {
    constructor(items) {
        this.values = new Map();
        for (const item of items) {
            if (!this.values.has(item.rank)) {
                this.values.set(item.rank, []);
            }
            this.values.get(item.rank).push(item);
        }
    }
    get(rank) {
        return this.values.get(rank);
    }
}
export class Item {
    constructor(args) {
        this.args = args;
        this.num = 0;
        this.totalGetNum = 0;
        /**残り使用回数。*/
        this.remainingUseCount = 0;
        if (args.consumable) {
            Item._consumableValues.push(this);
        }
        Item._values.push(this);
    }
    static get values() { return this._values; }
    static consumableValues() {
        return this._consumableValues;
    }
    /**
     * 指定のタイプの指定のランクのアイテムを返す。そのランクにアイテムが存在しなければランクを一つ下げて再帰する。
     * @param dropType
     * @param rank
     */
    static rndItem(dropType, rank) {
        if (!this._dropTypeValues.has(dropType)) {
            const typeValues = this.values.filter(item => item.dropTypes & dropType);
            this._dropTypeValues.set(dropType, new ItemValues(typeValues));
        }
        const itemValues = this._dropTypeValues.get(dropType);
        if (itemValues) {
            const rankValues = itemValues.get(rank);
            if (rankValues) {
                for (let i = 0; i < 10; i++) {
                    let tmp = choice(rankValues);
                    if (tmp.num < tmp.numLimit) {
                        return tmp;
                    }
                }
            }
            if (rank <= 0) {
                return Item.石;
            }
            return this.rndItem(dropType, rank - 1);
        }
        return Item.石;
    }
    static fluctuateRank(baseRank, rankFluctuatePassProb = 0.4) {
        let add = 0;
        while (Math.random() <= rankFluctuatePassProb) {
            add += 0.5 + Math.random() * 0.5;
        }
        if (Math.random() < 0.5) {
            add *= -1;
        }
        const res = (baseRank + add) | 0;
        return res > 0 ? res : 0;
    }
    get uniqueName() { return this.args.uniqueName; }
    get info() { return this.args.info; }
    get itemType() { return this.args.type; }
    get rank() { return this.args.rank; }
    get targetings() { return this.args.targetings ? this.args.targetings : Targeting.SELECT; }
    get consumable() { return this.args.consumable ? this.args.consumable : false; }
    /**所持上限. */
    get numLimit() { return this.args.numLimit ? this.args.numLimit : Item.DEF_NUM_LIMIT; }
    get dropTypes() { return this.args.drop; }
    toString() { return this.uniqueName; }
    add(v) {
        if (v > 0) {
            if (this.num + v > this.numLimit) {
                v = this.numLimit - this.num;
                if (v <= 0) {
                    Util.msg.set(`[${this}]はこれ以上入手できない`, Color.L_GRAY);
                    return;
                }
            }
        }
        Num.add(this, v);
    }
    use(user, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.canUse(user, targets)) {
                return;
            }
            for (let t of targets) {
                yield this.useInner(user, t);
            }
            if (this.consumable) {
                this.remainingUseCount--;
            }
            else {
                this.num--;
            }
        });
    }
    useInner(user, target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.args.use) {
                yield this.args.use(user, target);
            }
        });
    }
    canUse(user, targets) {
        if (!this.args.use) {
            return false;
        }
        if (this.consumable && this.remainingUseCount <= 0) {
            return false;
        }
        if (!this.consumable && this.num <= 0) {
            return false;
        }
        return true;
    }
}
Item._values = [];
Item._consumableValues = [];
Item._dropTypeValues = new Map();
Item.DEF_NUM_LIMIT = 9999;
(function (Item) {
    //-----------------------------------------------------------------
    //
    //蘇生
    //
    //-----------------------------------------------------------------
    Item.サンタクララ薬 = new class extends Item {
        constructor() {
            super({ uniqueName: "サンタクララ薬", info: "一体をHP1で蘇生",
                type: ItemType.蘇生, rank: 0,
                consumable: true, drop: ItemDrop.NO,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    if (target.dead) {
                        target.dead = false;
                        target.hp = 0;
                        Unit.healHP(target, 1);
                        if (SceneType.now === SceneType.BATTLE) {
                            Util.msg.set(`${target.name}は生き返った`);
                            yield wait();
                        }
                    }
                })
            });
        }
    };
    //-----------------------------------------------------------------
    //
    //HP回復
    //
    //-----------------------------------------------------------------
    Item.スティックパン = new class extends Item {
        constructor() {
            super({ uniqueName: "スティックパン", info: "HP+5%+20",
                type: ItemType.HP回復, rank: 0,
                consumable: true, drop: ItemDrop.NO,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    const value = target.prm(Prm.MAX_HP).total * 0.05 + 20;
                    Unit.healHP(target, value);
                    if (SceneType.now === SceneType.BATTLE) {
                        Util.msg.set(`${target.name}のHPが${value | 0}回復した`, Color.GREEN.bright);
                        yield wait();
                    }
                }),
            });
        }
    };
    Item.硬化スティックパン = new class extends Item {
        constructor() {
            super({ uniqueName: "硬化スティックパン", info: "HP+5%+50",
                type: ItemType.HP回復, rank: 0,
                consumable: true, drop: ItemDrop.NO,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    const value = target.prm(Prm.MAX_HP).total * 0.05 + 50;
                    Unit.healHP(target, value);
                    if (SceneType.now === SceneType.BATTLE) {
                        Util.msg.set(`${target.name}のHPが${value | 0}回復した`, Color.GREEN.bright);
                        yield wait();
                    }
                }),
            });
        }
    };
    //-----------------------------------------------------------------
    //
    //MP回復
    //
    //-----------------------------------------------------------------
    Item.赤い水 = new class extends Item {
        constructor() {
            super({ uniqueName: "赤い水", info: "MP+10%+5",
                type: ItemType.MP回復, rank: 0,
                consumable: true, drop: ItemDrop.NO,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    const value = target.prm(Prm.MAX_MP).total * 0.05 + 5;
                    Unit.healMP(target, value);
                    if (SceneType.now === SceneType.BATTLE) {
                        Util.msg.set(`${target.name}のMPが${value | 0}回復した`, Color.GREEN.bright);
                        yield wait();
                    }
                }),
            });
        }
    };
    //-----------------------------------------------------------------
    //
    //ダンジョン
    //
    //-----------------------------------------------------------------
    Item.脱出ポッド = new class extends Item {
        constructor() {
            super({ uniqueName: "脱出ポッド", info: "ダンジョンから脱出する",
                type: ItemType.ダンジョン, rank: 0,
                consumable: true, drop: ItemDrop.NO,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    Scene.load(DungeonScene.ins);
                    yield DungeonEvent.ESCAPE_DUNGEON.happen();
                }),
            });
        }
        canUse(user, targets) {
            return super.canUse(user, targets) && SceneType.now === SceneType.DUNGEON;
        }
    };
    //-----------------------------------------------------------------
    //
    //竿
    //
    //-----------------------------------------------------------------
    Item.ボロい釣竿 = new class extends Item {
        constructor() {
            super({ uniqueName: "ボロい釣竿", info: "釣りに使用　稀に壊れる",
                type: ItemType.竿, rank: 10, drop: ItemDrop.NO, });
        }
    };
    //-----------------------------------------------------------------
    //
    //弾
    //
    //-----------------------------------------------------------------
    Item.散弾 = new class extends Item {
        constructor() {
            super({ uniqueName: "散弾", info: "ショットガンに使用",
                type: ItemType.鍵, rank: 10, consumable: true, drop: ItemDrop.NO, });
        }
    };
    Item.夜叉の矢 = new class extends Item {
        constructor() {
            super({ uniqueName: "夜叉の矢", info: "ヤクシャに使用",
                type: ItemType.鍵, rank: 10, consumable: true, drop: ItemDrop.NO, });
        }
    };
    //-----------------------------------------------------------------
    //
    //ドーピング
    //
    //-----------------------------------------------------------------
    Item.いざなみの命 = new class extends Item {
        constructor() {
            super({ uniqueName: "いざなみの命", info: "最大HP+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.MAX_HP).base += 1;
                    FX_Str(Font.def, `${target.name}の最大HP+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.おおげつ姫 = new class extends Item {
        constructor() {
            super({ uniqueName: "おおげつ姫", info: "最大MP+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.MAX_MP).base += 1;
                    FX_Str(Font.def, `${target.name}の最大MP+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.アラハバキ神 = new class extends Item {
        constructor() {
            super({ uniqueName: "アラハバキ神", info: "最大TP+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.MAX_TP).base += 1;
                    FX_Str(Font.def, `${target.name}の最大TP+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.この花咲くや姫 = new class extends Item {
        constructor() {
            super({ uniqueName: "この花咲くや姫", info: "力+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.STR).base += 1;
                    FX_Str(Font.def, `${target.name}の力+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.つくよみの命 = new class extends Item {
        constructor() {
            super({ uniqueName: "つくよみの命", info: "魔+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.MAG).base += 1;
                    FX_Str(Font.def, `${target.name}の魔+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.よもつおお神 = new class extends Item {
        constructor() {
            super({ uniqueName: "よもつおお神", info: "光+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.LIG).base += 1;
                    FX_Str(Font.def, `${target.name}の光+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.わたつみの神 = new class extends Item {
        constructor() {
            super({ uniqueName: "わたつみの神", info: "闇+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.DRK).base += 1;
                    FX_Str(Font.def, `${target.name}の闇+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.へつなぎさびこの神 = new class extends Item {
        constructor() {
            super({ uniqueName: "へつなぎさびこの神", info: "鎖+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.CHN).base += 1;
                    FX_Str(Font.def, `${target.name}の鎖+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.ほのかぐつちの神 = new class extends Item {
        constructor() {
            super({ uniqueName: "ほのかぐつちの神", info: "過+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.PST).base += 1;
                    FX_Str(Font.def, `${target.name}の過+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.たけみかづちの命 = new class extends Item {
        constructor() {
            super({ uniqueName: "たけみかづちの命", info: "銃+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.GUN).base += 1;
                    FX_Str(Font.def, `${target.name}の銃+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    Item.すさのおの命 = new class extends Item {
        constructor() {
            super({ uniqueName: "すさのおの命", info: "弓+1",
                type: ItemType.ドーピング, rank: 10, drop: ItemDrop.BOX,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.prm(Prm.ARR).base += 1;
                    FX_Str(Font.def, `${target.name}の弓+1`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) { return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE; }
    };
    //-----------------------------------------------------------------
    //
    //書
    //
    //-----------------------------------------------------------------
    Item.兵法指南の書 = new class extends Item {
        constructor() {
            super({ uniqueName: "兵法指南の書", info: "技のセット可能数を6に増やす",
                type: ItemType.書, rank: 10, drop: ItemDrop.NO,
                use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                    target.tecs.push(Tec.empty);
                    FX_Str(Font.def, `${target.name}の技セット可能数が6になった`, Point.CENTER, Color.WHITE);
                }),
            });
        }
        canUse(user, targets) {
            for (const u of targets) {
                if (!(u instanceof PUnit && u.tecs.length === 5)) {
                    return false;
                }
            }
            return super.canUse(user, targets) && SceneType.now !== SceneType.BATTLE;
        }
    };
    //-----------------------------------------------------------------
    //
    //メモ
    //
    //-----------------------------------------------------------------
    Item.消耗品のメモ = new class extends Item {
        constructor() {
            super({ uniqueName: "消耗品のメモ", info: "スティックパンなどの一部消耗品はダンジョンに入る度に補充される",
                type: ItemType.メモ, rank: 0, drop: ItemDrop.BOX, numLimit: 1 });
        }
    };
    Item.夏のメモ = new class extends Item {
        constructor() {
            super({ uniqueName: "夏のメモ", info: "夏はいつ終わるの？",
                type: ItemType.メモ, rank: 1, drop: ItemDrop.BOX, numLimit: 1 });
        }
    };
    Item.合成許可証 = new class extends Item {
        constructor() {
            super({ uniqueName: "合成許可証", info: "合成が解放される",
                type: ItemType.メモ, rank: 10, drop: ItemDrop.NO, numLimit: 1 });
        }
    };
    Item.パーティースキル取り扱い許可証 = new class extends Item {
        constructor() {
            super({ uniqueName: "パーティースキル取り扱い許可証", info: "パーティースキルが解放される",
                type: ItemType.メモ, rank: 10, drop: ItemDrop.NO, numLimit: 1 });
        }
    };
    //-----------------------------------------------------------------
    //
    //鍵
    //
    //-----------------------------------------------------------------
    Item.はじまりの丘の鍵 = new class extends Item {
        constructor() { super({ uniqueName: "はじまりの丘の鍵", info: "", type: ItemType.鍵, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.再構成トンネルの鍵 = new class extends Item {
        constructor() { super({ uniqueName: "再構成トンネルの鍵", info: "", type: ItemType.鍵, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.リテの門の鍵 = new class extends Item {
        constructor() { super({ uniqueName: "リ・テの門の鍵", info: "", type: ItemType.鍵, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.黒平原の鍵 = new class extends Item {
        constructor() { super({ uniqueName: "黒平原の鍵", info: "", type: ItemType.鍵, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.黒遺跡の鍵 = new class extends Item {
        constructor() { super({ uniqueName: "黒遺跡の鍵", info: "", type: ItemType.鍵, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.PAINの鍵 = new class extends Item {
        constructor() { super({ uniqueName: "PAINの鍵", info: "", type: ItemType.鍵, rank: 10, drop: ItemDrop.NO, }); }
    };
    //-----------------------------------------------------------------
    //
    //玉
    //
    //-----------------------------------------------------------------
    Item.はじまりの丘の玉 = new class extends Item {
        constructor() { super({ uniqueName: "はじまりの丘の玉", info: "", type: ItemType.玉, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.再構成トンネルの玉 = new class extends Item {
        constructor() { super({ uniqueName: "再構成トンネルの玉", info: "", type: ItemType.玉, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.リテの門の玉 = new class extends Item {
        constructor() { super({ uniqueName: "リ・テの門の玉", info: "", type: ItemType.玉, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.黒平原の玉 = new class extends Item {
        constructor() { super({ uniqueName: "黒平原の玉", info: "", type: ItemType.玉, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.黒遺跡の玉 = new class extends Item {
        constructor() { super({ uniqueName: "黒遺跡の玉", info: "", type: ItemType.玉, rank: 10, drop: ItemDrop.NO, }); }
    };
    Item.PAINの玉 = new class extends Item {
        constructor() { super({ uniqueName: "PAINの玉", info: "", type: ItemType.玉, rank: 10, drop: ItemDrop.NO, }); }
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank0
    //
    //-----------------------------------------------------------------
    Item.石 = new class extends Item {
        constructor() {
            super({ uniqueName: "石", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.少女の心を持ったおっさん = new class extends Item {
        constructor() {
            super({ uniqueName: "少女の心を持ったおっさん", info: "いつもプリキュアの話をしている",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.土 = new class extends Item {
        constructor() {
            super({ uniqueName: "土", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX | ItemDrop.STRATUM });
        }
    };
    Item.水 = new class extends Item {
        constructor() {
            super({ uniqueName: "水", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX | ItemDrop.LAKE });
        }
    };
    Item.紙 = new class extends Item {
        constructor() {
            super({ uniqueName: "紙", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.しいたけ = new class extends Item {
        constructor() {
            super({ uniqueName: "しいたけ", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.血 = new class extends Item {
        constructor() {
            super({ uniqueName: "血", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX | ItemDrop.LAKE });
        }
    };
    Item.葛 = new class extends Item {
        constructor() {
            super({ uniqueName: "葛", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.短針 = new class extends Item {
        constructor() {
            super({ uniqueName: "短針", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.草 = new class extends Item {
        constructor() {
            super({ uniqueName: "草", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX });
        }
    };
    Item.枝 = new class extends Item {
        constructor() {
            super({ uniqueName: "枝", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX | ItemDrop.TREE });
        }
    };
    Item.葉っぱ = new class extends Item {
        constructor() {
            super({ uniqueName: "葉っぱ", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.BOX | ItemDrop.TREE });
        }
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank1
    //
    //-----------------------------------------------------------------
    Item.銅 = new class extends Item {
        constructor() {
            super({ uniqueName: "銅", info: "",
                type: ItemType.素材, rank: 1, drop: ItemDrop.BOX | ItemDrop.STRATUM });
        }
    };
    Item.朽ち果てた鍵 = new class extends Item {
        constructor() {
            super({ uniqueName: "朽ち果てた鍵", info: "",
                type: ItemType.素材, rank: 1, drop: ItemDrop.BOX });
        }
    };
    Item.エネルギー = new class extends Item {
        constructor() {
            super({ uniqueName: "エネルギー", info: "触るとビリビリする",
                type: ItemType.素材, rank: 1, drop: ItemDrop.BOX });
        }
    };
    Item.ほぐし水 = new class extends Item {
        constructor() {
            super({ uniqueName: "ほぐし水", info: "",
                type: ItemType.素材, rank: 1, drop: ItemDrop.BOX | ItemDrop.LAKE });
        }
    };
    Item.ひも = new class extends Item {
        constructor() {
            super({ uniqueName: "ひも", info: "",
                type: ItemType.素材, rank: 1, drop: ItemDrop.BOX });
        }
    };
    Item.消えない炎 = new class extends Item {
        constructor() {
            super({ uniqueName: "消えない炎", info: "たまに消える",
                type: ItemType.素材, rank: 1, drop: ItemDrop.BOX });
        }
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank2
    //
    //-----------------------------------------------------------------
    Item.He = new class extends Item {
        constructor() {
            super({ uniqueName: "He", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX });
        }
    };
    Item.Li = new class extends Item {
        constructor() {
            super({ uniqueName: "Li", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX });
        }
    };
    Item.黒い石 = new class extends Item {
        constructor() {
            super({ uniqueName: "黒い石", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX | ItemDrop.STRATUM });
        }
    };
    Item.黒い砂 = new class extends Item {
        constructor() {
            super({ uniqueName: "黒い砂", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX | ItemDrop.STRATUM });
        }
    };
    Item.黒い枝 = new class extends Item {
        constructor() {
            super({ uniqueName: "黒い枝", info: "とても黒い！！！！！",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX });
        }
    };
    Item.黒い青空 = new class extends Item {
        constructor() {
            super({ uniqueName: "黒い青空", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX });
        }
    };
    Item.鉄 = new class extends Item {
        constructor() {
            super({ uniqueName: "鉄", info: "かたい",
                type: ItemType.素材, rank: 2, drop: ItemDrop.BOX | ItemDrop.STRATUM });
        }
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank3
    //
    //-----------------------------------------------------------------
    Item.鋼鉄 = new class extends Item {
        constructor() {
            super({ uniqueName: "鋼鉄", info: "とてもかたい",
                type: ItemType.素材, rank: 3, drop: ItemDrop.BOX });
        }
    };
    Item.岩 = new class extends Item {
        constructor() {
            super({ uniqueName: "岩", info: "",
                type: ItemType.素材, rank: 3, drop: ItemDrop.BOX | ItemDrop.STRATUM });
        }
    };
    Item.おにく = new class extends Item {
        constructor() {
            super({ uniqueName: "おにく", info: "",
                type: ItemType.素材, rank: 3, drop: ItemDrop.BOX });
        }
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank4
    //
    //-----------------------------------------------------------------
    Item.チタン = new class extends Item {
        constructor() {
            super({ uniqueName: "チタン", info: "",
                type: ItemType.素材, rank: 4, drop: ItemDrop.BOX });
        }
    };
    //-----------------------------------------------------------------
    //
    //素材TREE only
    //
    //-----------------------------------------------------------------
    Item.竹 = new class extends Item {
        constructor() {
            super({ uniqueName: "竹", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.TREE });
        }
    };
    Item.松 = new class extends Item {
        constructor() {
            super({ uniqueName: "松", info: "",
                type: ItemType.素材, rank: 0, drop: ItemDrop.TREE });
        }
    };
    Item.スギ = new class extends Item {
        constructor() {
            super({ uniqueName: "スギ", info: "",
                type: ItemType.素材, rank: 1, drop: ItemDrop.TREE });
        }
    };
    Item.赤松 = new class extends Item {
        constructor() {
            super({ uniqueName: "赤松", info: "",
                type: ItemType.素材, rank: 1, drop: ItemDrop.TREE });
        }
    };
    Item.ヒノキ = new class extends Item {
        constructor() {
            super({ uniqueName: "ヒノキ", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.TREE });
        }
    };
    Item.無法松 = new class extends Item {
        constructor() {
            super({ uniqueName: "無法松", info: "通りすがりのたい焼き屋サン",
                type: ItemType.素材, rank: 8, drop: ItemDrop.TREE });
        }
    };
    //-----------------------------------------------------------------
    //
    //素材DIG only
    //
    //-----------------------------------------------------------------
    //-----------------------------------------------------------------
    //
    //合成素材
    //
    //-----------------------------------------------------------------
    Item.布 = new class extends Item {
        constructor() {
            super({ uniqueName: "布", info: "",
                type: ItemType.素材, rank: 2, drop: ItemDrop.NO });
        }
    };
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
})(Item || (Item = {}));
