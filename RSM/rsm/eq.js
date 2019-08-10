import { Num } from "./mix.js";
import { ActiveTec, TecType } from "./tec.js";
import { Condition } from "./condition.js";
import { PlayData } from "./util.js";
export class EqPos {
    constructor(name) {
        this.toString = () => name;
        EqPos._values.push(this);
    }
    static values() { return this._values; }
    get eqs() {
        if (!this._eqs) {
            this._eqs = Eq.values().filter(eq => eq.pos === this);
        }
        return this._eqs;
    }
}
EqPos._values = [];
EqPos.頭 = new EqPos("頭");
EqPos.武 = new EqPos("武");
EqPos.盾 = new EqPos("盾");
EqPos.体 = new EqPos("体");
EqPos.腰 = new EqPos("腰");
EqPos.腕 = new EqPos("腕");
EqPos.手 = new EqPos("手");
EqPos.指 = new EqPos("指");
EqPos.脚 = new EqPos("脚");
export class Eq {
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    constructor(args) {
        this.num = 0;
        this.totalGetNum = 0;
        // private constructor(name:string, info:string[], pos:EqPos, appearLv:number){
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.info = args.info;
        this.pos = args.pos;
        this.appearLv = args.lv;
        Eq._values.push(this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (let eq of this.values()) {
                this._valueOf.set(eq.uniqueName, eq);
            }
        }
        return this._valueOf.get(uniqueName);
    }
    static posValues(pos) {
        if (!this._posValues) {
            this._posValues = new Map();
            for (let p of EqPos.values()) {
                this._posValues.set(p, []);
            }
            for (let eq of this.values()) {
                this._posValues.get(eq.pos).push(eq);
            }
        }
        return this._posValues.get(pos);
    }
    /**各装備箇所のデフォルト装備を返す.*/
    static getDef(pos) {
        if (pos === EqPos.頭) {
            return this.髪;
        }
        if (pos === EqPos.武) {
            return this.恋人;
        }
        if (pos === EqPos.盾) {
            return this.板;
        }
        if (pos === EqPos.体) {
            return this.襤褸切れ;
        }
        if (pos === EqPos.腰) {
            return this.ひも;
        }
        if (pos === EqPos.腕) {
            return this.腕;
        }
        if (pos === EqPos.手) {
            return this.手;
        }
        if (pos === EqPos.指) {
            return this.肩身の指輪;
        }
        if (pos === EqPos.脚) {
            return this.きれいな靴;
        }
        return this.髪;
    }
    get mix() { return this._mix ? this._mix : (this._mix = this.createMix()); }
    createMix() { return undefined; }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
    add(v) {
        Num.add(this, v);
        PlayData.gotAnyEq = true;
    }
}
Eq._values = [];
//--------------------------------------------------------------------------
//
//
//
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//
//頭
//
//--------------------------------------------------------------------------
Eq.髪 = new class extends Eq {
    constructor() {
        super({ uniqueName: "髪", info: ["髪a", "髪b"],
            pos: EqPos.頭, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//武
//
//--------------------------------------------------------------------------
Eq.恋人 = new class extends Eq {
    constructor() {
        super({ uniqueName: "恋人", info: ["恋人info"],
            pos: EqPos.武, lv: 0 });
    }
};
Eq.棒 = new class extends Eq {
    constructor() {
        super({ uniqueName: "棒", info: ["格闘攻撃+10x1.1"],
            pos: EqPos.武, lv: 20 });
    }
    beforeDoAtk(action, attacker, target, dmg) {
        if (action instanceof ActiveTec && action.type === TecType.格闘) {
            dmg.pow.add += 10;
            dmg.pow.mul *= 1.1;
        }
    }
};
// static readonly                      忍者刀 = new class extends Eq{
//     constructor(){super({uniqueName:"忍者刀", info:["格闘攻撃時稀に追加攻撃"],
//                             pos:EqPos.武, lv:99});}
//     createMix(){return new Mix({
//         result:[this,1],
//         materials:[[Item.石, 1]],
//     });}
// }
//--------------------------------------------------------------------------
//
//盾
//
//--------------------------------------------------------------------------
Eq.板 = new class extends Eq {
    constructor() {
        super({ uniqueName: "板", info: [],
            pos: EqPos.盾, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//体
//
//--------------------------------------------------------------------------
Eq.襤褸切れ = new class extends Eq {
    constructor() {
        super({ uniqueName: "襤褸切れ", info: [],
            pos: EqPos.体, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//腰
//
//--------------------------------------------------------------------------
Eq.ひも = new class extends Eq {
    constructor() {
        super({ uniqueName: "ひも", info: [],
            pos: EqPos.腰, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//腕
//
//--------------------------------------------------------------------------
Eq.腕 = new class extends Eq {
    constructor() {
        super({ uniqueName: "腕", info: [],
            pos: EqPos.腕, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//手
//
//--------------------------------------------------------------------------
Eq.手 = new class extends Eq {
    constructor() {
        super({ uniqueName: "手", info: [],
            pos: EqPos.手, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//指
//
//--------------------------------------------------------------------------
Eq.肩身の指輪 = new class extends Eq {
    constructor() {
        super({ uniqueName: "肩身の指輪", info: [],
            pos: EqPos.指, lv: 0 });
    }
};
//--------------------------------------------------------------------------
//
//脚
//
//--------------------------------------------------------------------------
Eq.きれいな靴 = new class extends Eq {
    constructor() {
        super({ uniqueName: "きれいな靴", info: [],
            pos: EqPos.脚, lv: 0 });
    }
};
Eq.安全靴 = new class extends Eq {
    constructor() {
        super({ uniqueName: "安全靴", info: ["被攻撃時稀に＜盾＞化"],
            pos: EqPos.脚, lv: 40 });
    }
    afterBeAtk(action, attacker, target, dmg) {
        if (action instanceof ActiveTec && Math.random() < 0.7) {
            target.setCondition(Condition.盾, 1);
        }
    }
};
