var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Prm } from "./unit.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
import { Force, Dmg, Targeting } from "./force.js";
import { Condition } from "./condition.js";
import { Color } from "./undym/type.js";
import { FX_Str } from "./fx/fx.js";
import { Font } from "./graphics/graphics.js";
export class TecType {
    constructor(name) {
        this.toString = () => name;
        TecType._values.push(this);
    }
    static values() { return this._values; }
    get tecs() {
        if (!this._tecs) {
            let actives = ActiveTec.values().filter(tec => tec.type === this);
            let passives = PassiveTec.values().filter(tec => tec.type === this);
            let tmp = [];
            this._tecs = tmp.concat(actives, passives);
        }
        return this._tecs;
    }
}
TecType._values = [];
TecType.格闘 = new class extends TecType {
    constructor() { super("格闘"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.STR).total(),
            def: target.prm(Prm.MAG).total(),
        });
        ;
    }
    ;
};
TecType.魔法 = new class extends TecType {
    constructor() { super("魔法"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.MAG).total(),
            def: target.prm(Prm.STR).total(),
        });
        ;
    }
    ;
};
TecType.神格 = new class extends TecType {
    constructor() { super("神格"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.LIG).total(),
            def: target.prm(Prm.DRK).total(),
        });
        ;
    }
    ;
};
TecType.暗黒 = new class extends TecType {
    constructor() { super("暗黒"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.DRK).total(),
            def: target.prm(Prm.LIG).total(),
        });
        ;
    }
    ;
};
TecType.練術 = new class extends TecType {
    constructor() { super("練術"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.CHN).total(),
            def: target.prm(Prm.PST).total(),
        });
        ;
    }
    ;
};
TecType.過去 = new class extends TecType {
    constructor() { super("過去"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.PST).total(),
            def: target.prm(Prm.CHN).total(),
        });
        ;
    }
    ;
};
TecType.銃術 = new class extends TecType {
    constructor() { super("銃術"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.GUN).total(),
            def: target.prm(Prm.ARR).total(),
        });
        ;
    }
    ;
};
TecType.弓術 = new class extends TecType {
    constructor() { super("弓術"); }
    createDmg(attacker, target) {
        return new Dmg({
            pow: attacker.prm(Prm.ARR).total(),
            def: target.prm(Prm.GUN).total(),
        });
        ;
    }
    ;
};
TecType.強化 = new class extends TecType {
    constructor() { super("強化"); }
    createDmg(attacker, target) { return new Dmg(); }
    ;
};
TecType.回復 = new class extends TecType {
    constructor() { super("回復"); }
    createDmg(attacker, target) { return new Dmg(); }
    ;
};
TecType.その他 = new class extends TecType {
    constructor() { super("その他"); }
    createDmg(attacker, target) { return new Dmg(); }
    ;
};
export class Tec extends Force {
    static get empty() {
        return this._empty ? this._empty : (this._empty = new class extends Tec {
            constructor() {
                super();
                this.uniqueName = "empty";
                this.info = [];
                this.type = TecType.格闘;
            }
        });
    }
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
}
export class PassiveTec extends Tec {
    constructor(args) {
        super();
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.info = args.info;
        this.type = args.type;
        PassiveTec._values.push(this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (const tec of this.values()) {
                this._valueOf.set(tec.uniqueName, tec);
            }
        }
        return this._valueOf.get(uniqueName);
    }
}
PassiveTec._values = [];
//--------------------------------------------------------------------------
//
//格闘
//
//--------------------------------------------------------------------------
PassiveTec.格闘攻撃UP = new class extends PassiveTec {
    constructor() {
        super({ uniqueName: "格闘攻撃UP", info: ["格闘攻撃x1.2"],
            type: TecType.格闘,
        });
    }
    beforeDoAtk(action, attacker, target, dmg) {
        if (action instanceof ActiveTec && action.type === TecType.格闘) {
            dmg.pow.add += 1;
            dmg.pow.mul *= 1.2;
        }
    }
};
//--------------------------------------------------------------------------
//
//回復
//
//--------------------------------------------------------------------------
PassiveTec.HP自動回復 = new class extends PassiveTec {
    constructor() {
        super({ uniqueName: "HP自動回復", info: ["行動開始時HP+1%"],
            type: TecType.回復,
        });
    }
    phaseStart(unit) {
        const value = (unit.prm(Prm.MAX_HP).total() * 0.01) | 0;
        unit.hp += value;
    }
};
PassiveTec.MP自動回復 = new class extends PassiveTec {
    constructor() {
        super({ uniqueName: "MP自動回復", info: ["行動開始時MP+10"],
            type: TecType.回復,
        });
    }
    phaseStart(unit) {
        const value = 10;
        unit.mp += value;
    }
};
export class ActiveTec extends Tec {
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    constructor(args) {
        super();
        this.uniqueName = args.uniqueName;
        this.info = args.info;
        this.type = args.type;
        this.targetings = args.targetings;
        this.mul = args.mul;
        const num = args.num;
        this.rndAttackNum = () => num;
        this.hit = args.hit;
        this.mpCost = args.mp ? args.mp : 0;
        this.tpCost = args.tp ? args.tp : 0;
        ActiveTec._values.push(this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (const tec of this.values()) {
                this._valueOf.set(tec.uniqueName, tec);
            }
        }
        return this._valueOf.get(uniqueName);
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    checkCost(u) {
        return (u.prm(Prm.MP).base >= this.mpCost
            && u.prm(Prm.TP).base >= this.tpCost);
    }
    payCost(u) {
        u.prm(Prm.MP).base -= this.mpCost;
        u.prm(Prm.TP).base -= this.tpCost;
    }
    use(attacker, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            Util.msg.set(`${attacker.name}の[${this}]`, Color.D_GREEN.bright);
            yield wait();
            if (targets.length === 0) {
                return;
            }
            if (!this.checkCost(attacker)) {
                Util.msg.set("コストを支払えなかった");
                yield wait();
                return;
            }
            this.payCost(attacker);
            let num = this.rndAttackNum();
            for (let i = 0; i < num; i++) {
                for (let t of targets) {
                    yield this.run(attacker, t);
                }
            }
        });
    }
    run(attacker, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let dmg = this.createDmg(attacker, target);
            attacker.beforeDoAtk(this, target, dmg);
            target.beforeBeAtk(this, attacker, dmg);
            yield this.runInner(attacker, target, dmg);
            attacker.afterDoAtk(this, target, dmg);
            target.afterBeAtk(this, attacker, dmg);
        });
    }
    runInner(attacker, target, dmg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield target.doDmg(dmg);
        });
    }
    createDmg(attacker, target) {
        let dmg = this.type.createDmg(attacker, target);
        dmg.pow.mul = this.mul;
        dmg.hit.base = this.hit;
        return dmg;
    }
    toString() { return this.uniqueName; }
}
ActiveTec._values = [];
//--------------------------------------------------------------------------
//
//格闘
//
//--------------------------------------------------------------------------
ActiveTec.殴る = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "殴る", info: ["一体に格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 1, hit: 1,
        });
    }
};
ActiveTec.二回殴る = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "二回殴る", info: ["一体に二回格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 2, hit: 1,
            tp: 20,
        });
    }
};
ActiveTec.大いなる動き = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "大いなる動き", info: ["敵全体に格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.ALL,
            mul: 1, num: 1, hit: 1,
            tp: 60,
        });
    }
};
ActiveTec.人狼剣 = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "人狼剣", info: ["一体に自分の力値分のダメージを与える"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 1, hit: 3,
            tp: 10,
        });
    }
    createDmg(attacker, target) {
        return new Dmg({
            absPow: attacker.prm(Prm.STR).total(),
            hit: this.hit,
        });
    }
};
ActiveTec.閻魔の笏 = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "閻魔の笏", info: ["一体に5回格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 5, hit: 1,
            tp: 100,
        });
    }
};
ActiveTec.マジカルパンチ = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "マジカルパンチ", info: ["マジカル格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 1, hit: 1,
            mp: 10,
        });
    }
    createDmg(attacker, target) {
        let dmg = super.createDmg(attacker, target);
        dmg.pow.base = attacker.prm(Prm.MAG).total();
        return dmg;
    }
};
// static readonly          タックル = new class extends Tec{
//     constructor(){super("タックル", ["一体に格闘攻撃x1.5"]
//                     ,TecType.格闘,/*mul*/1.5,/*num*/()=>1,/*hit*/1);}
//     get targetings(){return Targeting.SELECT;}
//     get tpCost()    {return 20;}
// }
//--------------------------------------------------------------------------
//
//魔法
//
//--------------------------------------------------------------------------
ActiveTec.ヴァハ = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "ヴァハ", info: ["一体に魔法攻撃"],
            type: TecType.魔法, targetings: Targeting.SELECT,
            mul: 1, num: 1, hit: 1.5,
            mp: 20,
        });
    }
};
ActiveTec.エヴィン = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "エヴィン", info: ["一体に魔法攻撃x2"],
            type: TecType.魔法, targetings: Targeting.SELECT,
            mul: 2, num: 1, hit: 1.5,
            mp: 40,
        });
    }
};
//--------------------------------------------------------------------------
//
//強化
//
//--------------------------------------------------------------------------
ActiveTec.練気 = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "練気", info: ["自分を＜練＞化"],
            type: TecType.強化, targetings: Targeting.SELF,
            mul: 1, num: 1, hit: 1,
        });
    }
    run(attacker, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = target.getConditionValue(Condition.練);
            setCondition(target, Condition.練, value + 1);
        });
    }
};
ActiveTec.グレートウォール = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "グレートウォール", info: ["味方全体を＜盾＞化"],
            type: TecType.強化, targetings: Targeting.ALL | Targeting.ONLY_FRIEND,
            mul: 1, num: 1, hit: 1,
        });
    }
    run(attacker, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = target.getConditionValue(Condition.盾);
            setCondition(target, Condition.盾, value + 1);
        });
    }
};
//--------------------------------------------------------------------------
//
//その他
//
//--------------------------------------------------------------------------
ActiveTec.何もしない = new class extends ActiveTec {
    constructor() {
        super({ uniqueName: "何もしない", info: ["何もしないをする"],
            type: TecType.その他, targetings: Targeting.SELF,
            mul: 1, num: 1, hit: 1,
        });
    }
    use(attacker, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            Util.msg.set(`${attacker.name}は空を眺めている...`);
            yield wait();
        });
    }
};
const setCondition = (target, condition, value) => {
    target.setCondition(condition, value);
    FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
    Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.CYAN.bright);
};
