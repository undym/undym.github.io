var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Util } from "./util.js";
import { Color } from "./undym/type.js";
import { wait } from "./undym/scene.js";
import { FX_Str } from "./fx/fx.js";
import { Targeting } from "./force.js";
import { choice } from "./undym/random.js";
import { Font } from "./graphics/graphics.js";
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
ItemParentType.素材 = new ItemParentType("素材", [ItemType.素材]);
export class Item {
    constructor(args) {
        this.num = 0;
        this.totalGetNum = 0;
        /**そのダンジョン内で使用した数. */
        this.usedNum = 0;
        const name = args.name;
        this.toString = () => name;
        this.info = args.info;
        this.itemType = args.type;
        this.rank = args.rank;
        this.box = args.box;
        this.targetings = args.targetings ? args.targetings : Targeting.SELECT;
        this.numLimit = args.numLimit ? args.numLimit : Item.DEF_NUM_LIMIT;
        if (args.consumable) {
            this.consumable = args.consumable;
            Item._consumableValues.push(this);
        }
        else {
            this.consumable = false;
        }
        Item._values.push(this);
    }
    static values() {
        return this._values;
    }
    static consumableValues() {
        return this._consumableValues;
    }
    static rndBoxItem(rank) {
        for (let i = 0; i < 7; i++) {
            let tmp = choice(Item.values());
            if (tmp.box && tmp.rank <= rank && tmp.num < tmp.numLimit) {
                return tmp;
            }
        }
        return Item.石;
    }
    add(v) {
        if (this.num + v > this.numLimit) {
            v = this.numLimit - this.num;
        }
        const newItem = this.totalGetNum === 0;
        if (newItem) {
            Util.msg.set("new", Color.rainbow);
        }
        else {
            Util.msg.set("");
        }
        this.num += v;
        this.totalGetNum += v;
        Util.msg.add(`[${this}]を${v}個手に入れた(${this.num})`, Color.D_GREEN.bright);
        if (newItem) {
            for (let str of this.info) {
                Util.msg.set(`"${str}"`, Color.GREEN);
            }
        }
    }
    use(user, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.canUse()) {
                return;
            }
            if (this.num <= 0 || this.usedNum > this.num) {
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
Item._consumableValues = [];
Item.DEF_NUM_LIMIT = 9999;
//-----------------------------------------------------------------
//
//HP回復
//
//-----------------------------------------------------------------
Item.スティックパン = new class extends Item {
    constructor() {
        super({ name: "スティックパン", info: ["HP+10"],
            type: ItemType.HP回復, rank: 0, box: false,
            numLimit: 5, consumable: true,
        });
        this.useInner = (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healHP(target, 10); });
    }
};
//-----------------------------------------------------------------
//
//MP回復
//
//-----------------------------------------------------------------
Item.水 = new class extends Item {
    constructor() {
        super({ name: "水", info: ["MP+20%"],
            type: ItemType.MP回復, rank: 0, box: false,
            numLimit: 5, consumable: true,
        });
        this.useInner = (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healMP(target, 20); });
    }
};
//-----------------------------------------------------------------
//
//素材
//
//-----------------------------------------------------------------
Item.石 = new class extends Item {
    constructor() {
        super({ name: "石", info: ["いし"],
            type: ItemType.素材, rank: 0, box: true });
    }
};
Item.枝 = new class extends Item {
    constructor() {
        super({ name: "枝", info: ["えだ"],
            type: ItemType.素材, rank: 0, box: true });
    }
};
Item.土 = new class extends Item {
    constructor() {
        super({ name: "土", info: ["つち"],
            type: ItemType.素材, rank: 0, box: true });
    }
};
Item.He = new class extends Item {
    constructor() {
        super({ name: "He", info: ["ヘェッ"],
            type: ItemType.素材, rank: 2, box: true });
    }
};
const healHP = (target, value) => __awaiter(this, void 0, void 0, function* () {
    value = value | 0;
    target.hp += value;
    target.fixPrm();
    FX_Str(new Font(30, Font.BOLD), `${value}`, target.bounds.center, Color.GREEN);
    Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
    yield wait();
});
const healMP = (target, value) => __awaiter(this, void 0, void 0, function* () {
    value = value | 0;
    target.mp += value;
    target.fixPrm();
    FX_Str(new Font(30, Font.BOLD), `${value}`, target.bounds.center, Color.PINK);
    Util.msg.set(`${target.name}のMPが${value}回復した`, Color.GREEN.bright);
    yield wait();
});
