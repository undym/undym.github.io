var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Util, SceneType } from "./util.js";
import { Color } from "./undym/type.js";
import { wait } from "./undym/scene.js";
import { Prm } from "./unit.js";
import { FX_RotateStr } from "./fx/fx.js";
import { Targeting } from "./force.js";
import { choice } from "./undym/random.js";
import { Font } from "./graphics/graphics.js";
import { Num, Mix } from "./mix.js";
import DungeonEvent from "./dungeon/dungeonevent.js";
import { SaveData } from "./savedata.js";
export class ItemType {
    constructor(name) {
        this.toString = () => name;
    }
    values() {
        if (this._values === undefined) {
            this._values = Item.values()
                .filter(item => item.itemType === this);
        }
        return this._values;
    }
    ;
}
ItemType.HP回復 = new ItemType("HP回復");
ItemType.MP回復 = new ItemType("MP回復");
ItemType.ダンジョン = new ItemType("ダンジョン");
ItemType.鍵 = new ItemType("鍵");
ItemType.玉 = new ItemType("玉");
ItemType.素材 = new ItemType("素材");
export class ItemParentType {
    constructor(name, children) {
        this.children = children;
        this.toString = () => name;
        ItemParentType._values.push(this);
    }
    static values() { return this._values; }
}
ItemParentType._values = [];
ItemParentType.回復 = new ItemParentType("回復", [ItemType.HP回復, ItemType.MP回復]);
ItemParentType.ダンジョン = new ItemParentType("ダンジョン", [ItemType.ダンジョン]);
ItemParentType.その他 = new ItemParentType("その他", [ItemType.鍵, ItemType.玉, ItemType.素材]);
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
        this.num = 0;
        this.totalGetNum = 0;
        /**そのダンジョン内で使用した数. */
        this.usedNum = 0;
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.info = args.info;
        this.itemType = args.type;
        this.rank = args.rank;
        this.dropType = args.drop;
        this.targetings = args.targetings ? args.targetings : Targeting.SELECT;
        this.numLimit = args.numLimit ? args.numLimit : Item.DEF_NUM_LIMIT;
        if (args.consumable) {
            this.consumable = args.consumable;
            Item._consumableValues.push(this);
        }
        else {
            this.consumable = false;
        }
        if (args.use) {
            this.useInner = args.use;
        }
        Item._values.push(this);
    }
    static values() {
        return this._values;
    }
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
            const typeValues = this.values().filter(item => item.dropType & dropType);
            this._dropTypeValues.set(dropType, new ItemValues(typeValues));
        }
        const itemValues = this._dropTypeValues.get(dropType);
        if (itemValues) {
            const rankValues = itemValues.get(rank);
            if (rankValues) {
                return choice(rankValues);
            }
            else {
                if (rank <= 0) {
                    return Item.石;
                }
                return this.rndItem(dropType, rank - 1);
            }
        }
        return Item.石;
    }
    static fluctuateRank(baseRank, rankFluctuatePassProb = 0.3) {
        let add = 0;
        while (Math.random() <= rankFluctuatePassProb) {
            add++;
        }
        if (Math.random() <= 0.5) {
            add *= -1;
        }
        const res = baseRank + add;
        return res > 0 ? res : 0;
    }
    get mix() { return this._mix ? this._mix : (this._mix = this.createMix()); }
    createMix() { return undefined; }
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
            if (!this.canUse()) {
                return;
            }
            if (this.num <= 0 || this.usedNum >= this.num) {
                return;
            }
            for (let t of targets) {
                yield this.useInner(user, t);
            }
            if (this.consumable) {
                this.usedNum++;
            }
            else {
                this.num--;
            }
        });
    }
    canUse() {
        if (this.useInner === undefined) {
            return false;
        }
        if (this.num - this.usedNum <= 0) {
            return false;
        }
        return true;
    }
}
Item._values = [];
// private static _rankValues = new Map<number,Item[]>();
// // private static _rankValues:{[key:number]:Item[];} = {};
// static rankValues(rank:number):ReadonlyArray<Item>|undefined{
//     return this._rankValues.get(rank);
// }
Item._consumableValues = [];
/**
 * 宝箱から出る指定ランクのアイテムを返す。そのランクにアイテムが存在しなければランクを一つ下げて再帰する。
 * @param rank
 */
// static rndBoxRankItem(rank:number):Item{
//     const values = this.rankValues(rank);
//     if(!values){
//         if(rank <= 0){return Item.石;}
//         return this.rndBoxRankItem(rank-1);
//     }
//     for(let i = 0; i < 7; i++){
//         let tmp = choice( values );
//         if(tmp.box && tmp.rank <= rank && tmp.num < tmp.numLimit){
//             return tmp;
//         }
//     }
//     return Item.石;
// }
Item._dropTypeValues = new Map();
Item.DEF_NUM_LIMIT = 999;
Item.DROP_NO = 0;
Item.DROP_BOX = 1 << 0;
Item.DROP_TREE = 1 << 1;
//-----------------------------------------------------------------
//
//HP回復
//
//-----------------------------------------------------------------
Item.スティックパン = new class extends Item {
    constructor() {
        super({ uniqueName: "スティックパン", info: ["HP+10"],
            type: ItemType.HP回復, rank: 0,
            consumable: true, drop: Item.DROP_NO,
            use: (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healHP(target, 10); }),
        });
    }
};
Item.硬化スティックパン = new class extends Item {
    constructor() {
        super({ uniqueName: "硬化スティックパン", info: ["HP+10%"],
            type: ItemType.HP回復, rank: 0,
            consumable: true, drop: Item.DROP_NO,
            use: (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healHP(target, target.prm(Prm.MAX_HP).total / 10); }),
        });
    }
    createMix() {
        return new Mix({
            result: [this, 1],
            limit: () => 5,
            materials: [[Item.石, 5], [Item.土, 5]],
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
        super({ uniqueName: "赤い水", info: ["MP+10"],
            type: ItemType.MP回復, rank: 0,
            consumable: true, drop: Item.DROP_NO,
            use: (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healMP(target, 10); }),
        });
    }
    createMix() {
        return new Mix({
            result: [this, 1],
            limit: () => 5,
            materials: [[Item.水, 5], [Item.土, 1]],
        });
    }
};
//-----------------------------------------------------------------
//
//その他
//
//-----------------------------------------------------------------
Item.脱出ポッド = new class extends Item {
    constructor() {
        super({ uniqueName: "脱出ポッド", info: ["ダンジョンから脱出する"],
            type: ItemType.ダンジョン, rank: 0,
            consumable: true, drop: Item.DROP_NO,
            use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                yield DungeonEvent.ESCAPE_DUNGEON.happen();
            }),
        });
    }
    canUse() {
        return super.canUse() && SceneType.now === SceneType.DUNGEON;
    }
};
Item.記録用粘土板 = new class extends Item {
    constructor() {
        super({ uniqueName: "記録用粘土板", info: ["ダンジョン内でセーブする"],
            type: ItemType.ダンジョン, rank: 0,
            consumable: true, drop: Item.DROP_NO,
            use: (user, target) => __awaiter(this, void 0, void 0, function* () {
                SaveData.save();
            }),
        });
    }
    createMix() {
        return new Mix({
            result: [this, 1],
            limit: () => 1,
            materials: [[Item.石, 3], [Item.土, 3], [Item.枝, 3]],
        });
    }
    canUse() {
        return super.canUse() && SceneType.now === SceneType.DUNGEON;
    }
};
//-----------------------------------------------------------------
//
//鍵
//
//-----------------------------------------------------------------
Item.はじまりの丘の鍵 = new class extends Item {
    constructor() {
        super({ uniqueName: "はじまりの丘の鍵", info: [""],
            type: ItemType.鍵, rank: 0, drop: Item.DROP_NO, });
    }
};
Item.丘の上の鍵 = new class extends Item {
    constructor() {
        super({ uniqueName: "丘の上の鍵", info: [""],
            type: ItemType.鍵, rank: 0, drop: Item.DROP_NO, });
    }
};
//-----------------------------------------------------------------
//
//玉
//
//-----------------------------------------------------------------
Item.はじまりの丘の玉 = new class extends Item {
    constructor() {
        super({ uniqueName: "はじまりの丘の玉", info: [""],
            type: ItemType.玉, rank: 0, drop: Item.DROP_NO, });
    }
};
Item.丘の上の玉 = new class extends Item {
    constructor() {
        super({ uniqueName: "丘の上の玉", info: [""],
            type: ItemType.玉, rank: 0, drop: Item.DROP_NO, });
    }
};
//-----------------------------------------------------------------
//
//素材
//
//-----------------------------------------------------------------
Item.石 = new class extends Item {
    constructor() {
        super({ uniqueName: "石", info: ["いし"],
            type: ItemType.素材, rank: 0, drop: Item.DROP_BOX });
    }
};
Item.枝 = new class extends Item {
    constructor() {
        super({ uniqueName: "枝", info: ["えだ"],
            type: ItemType.素材, rank: 0, drop: Item.DROP_BOX });
    }
};
Item.土 = new class extends Item {
    constructor() {
        super({ uniqueName: "土", info: ["つち"],
            type: ItemType.素材, rank: 0, drop: Item.DROP_BOX });
    }
};
Item.水 = new class extends Item {
    constructor() {
        super({ uniqueName: "水", info: ["水"],
            type: ItemType.素材, rank: 0, drop: Item.DROP_BOX });
    }
};
Item.He = new class extends Item {
    constructor() {
        super({ uniqueName: "He", info: ["ヘェッ"],
            type: ItemType.素材, rank: 2, drop: Item.DROP_BOX });
    }
};
Item.少女の心を持ったおっさん = new class extends Item {
    constructor() {
        super({ uniqueName: "少女の心を持ったおっさん", info: ["いつもプリキュアの話をしている"],
            type: ItemType.素材, rank: 5, drop: Item.DROP_BOX });
    }
};
Item.しいたけ = new class extends Item {
    constructor() {
        super({ uniqueName: "しいたけ", info: [""],
            type: ItemType.素材, rank: 0, drop: Item.DROP_NO, });
    }
};
Item.スギ = new class extends Item {
    constructor() {
        super({ uniqueName: "スギ", info: [""],
            type: ItemType.素材, rank: 1, drop: Item.DROP_TREE });
    }
};
Item.ヒノキ = new class extends Item {
    constructor() {
        super({ uniqueName: "ヒノキ", info: [""],
            type: ItemType.素材, rank: 1, drop: Item.DROP_TREE });
    }
};
class ItemFont {
    static get font() {
        if (!this._font) {
            this._font = new Font(30, Font.BOLD);
        }
        return this._font;
    }
}
const healHP = (target, value) => __awaiter(this, void 0, void 0, function* () {
    value = value | 0;
    target.hp += value;
    FX_RotateStr(ItemFont.font, `${value}`, target.bounds.center, Color.GREEN);
    Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
    yield wait();
});
const healMP = (target, value) => __awaiter(this, void 0, void 0, function* () {
    value = value | 0;
    target.mp += value;
    FX_RotateStr(ItemFont.font, `${value}`, target.bounds.center, Color.PINK);
    Util.msg.set(`${target.name}のMPが${value}回復した`, Color.GREEN.bright);
    yield wait();
});
