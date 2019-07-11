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
import { Prm } from "./unit.js";
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
ItemType.素材 = new ItemType("素材");
export class ItemParentType {
    constructor(name, children) {
        this.toString = () => name;
        this.children = children;
        ItemParentType._values.push(this);
    }
    static values() { return this._values; }
}
ItemParentType._values = [];
ItemParentType.回復 = new ItemParentType("回復", [ItemType.HP回復]);
ItemParentType.素材 = new ItemParentType("素材", [ItemType.素材]);
export class Item {
    constructor(name, info, itemType, rank, box) {
        this.num = 0;
        this.totalGetNum = 0;
        this.toString = () => name;
        this.info = info;
        this.itemType = itemType;
        this.rank = rank;
        this.box = box;
        Item._values.push(this);
    }
    static values() {
        return this._values;
    }
    static rndBoxItem(rank) {
        for (let i = 0; i < 7; i++) {
            let tmp = choice(Item.values());
            if (tmp.box && tmp.rank <= rank) {
                return tmp;
            }
        }
        return Item.石;
    }
    get targetings() { return Targeting.SELECT; }
    ;
    add(v) {
        if (this.totalGetNum === 0) {
            Util.msg.set("new", Color.rainbow);
        }
        else {
            Util.msg.set("");
        }
        this.num += v;
        this.totalGetNum += v;
        Util.msg.add(`[${this}]を${v}個手に入れた(${this.num})`, Color.D_GREEN.bright);
        if (this.totalGetNum === v) { //new_item
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
            if (this.num <= 0) {
                return;
            }
            for (let t of targets) {
                yield this.useInner(user, t);
            }
            this.num--;
        });
    }
    canUse() { return this.useInner !== undefined; }
}
Item._values = [];
//-----------------------------------------------------------------
//
//HP回復
//
//-----------------------------------------------------------------
Item.スティックパン = new class extends Item {
    constructor() {
        super("スティックパン", ["HP+10"], ItemType.HP回復, /*rank*/ 0, /*box*/ true);
        this.useInner = (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healHP(target, 10); });
    }
};
Item.スティックパンa = new class extends Item {
    constructor() {
        super("スティックパンa", ["HP+10"], ItemType.HP回復, /*rank*/ 0, /*box*/ true);
        this.useInner = (user, target) => __awaiter(this, void 0, void 0, function* () { return yield healHP(target, 10); });
    }
    get targetins() { return Targeting.ONLY_FRIEND | Targeting.ALL; }
};
//-----------------------------------------------------------------
//
//素材
//
//-----------------------------------------------------------------
Item.石 = new class extends Item {
    constructor() {
        super("石", ["いし"], ItemType.素材, /*rank*/ 0, /*box*/ true);
    }
};
Item.枝 = new class extends Item {
    constructor() {
        super("枝", ["えだ"], ItemType.素材, /*rank*/ 0, /*box*/ true);
    }
};
Item.土 = new class extends Item {
    constructor() {
        super("土", ["つち"], ItemType.素材, /*rank*/ 0, /*box*/ true);
    }
};
Item.石2 = new class extends Item {
    constructor() {
        super("石2", ["いし"], ItemType.素材, /*rank*/ 0, /*box*/ false);
    }
};
Item.He = new class extends Item {
    constructor() {
        super("He", ["ヘェッ"], ItemType.素材, /*rank*/ 2, /*box*/ true);
    }
};
const healHP = (target, value) => __awaiter(this, void 0, void 0, function* () {
    value = value | 0;
    target.prm(Prm.HP).base += value;
    target.fixPrm();
    FX_Str(new Font(30, Font.BOLD), `${value}`, target.bounds.center, Color.GREEN);
    Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
    yield wait();
});
