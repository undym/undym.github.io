var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Prm } from "./unit.js";
import { Util, Colors } from "./util.js";
import { wait } from "./undym/scene.js";
import { Dmg, Targeting } from "./force.js";
import { Condition } from "./condition.js";
import { Color } from "./undym/type.js";
export class TecType {
    constructor() { }
}
TecType.格闘 = new class extends TecType {
    createDmg(attacker, target) {
        let dmg = new Dmg();
        dmg.pow = attacker.prm(Prm.STR).total();
        dmg.def = target.prm(Prm.MAG).total();
        return dmg;
    }
    ;
};
TecType.魔法 = new class extends TecType {
    createDmg(attacker, target) {
        let dmg = new Dmg();
        dmg.pow = attacker.prm(Prm.MAG).total();
        dmg.def = target.prm(Prm.STR).total();
        return dmg;
    }
    ;
};
TecType.強化 = new class extends TecType {
    createDmg(attacker, target) { return new Dmg(); }
    ;
};
TecType.回復 = new class extends TecType {
    createDmg(attacker, target) { return new Dmg(); }
    ;
};
TecType.その他 = new class extends TecType {
    createDmg(attacker, target) { return new Dmg(); }
    ;
};
export class PassiveTec {
    constructor(values) {
        const name = values.name;
        this.toString = () => name;
        this.info = values.info;
        this.type = values.type;
        PassiveTec._values.push(this);
    }
    static values() { return this._values; }
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
PassiveTec._values = [];
//--------------------------------------------------------------------------
//
//
//
//--------------------------------------------------------------------------
PassiveTec.HP自動回復 = new class extends PassiveTec {
    constructor() {
        super({ name: "HP自動回復", info: ["行動開始時HP+1%"],
            type: TecType.回復,
        });
    }
    phaseStart(unit) {
        const value = (unit.prm(Prm.MAX_HP).total() * 0.01) | 0;
        unit.prm(Prm.HP).base += value;
        unit.fixPrm();
    }
};
export class ActiveTec {
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    // private constructor(name:string, info:string[], type:TecType, mul:number, rndAttackNum:()=>number, hit:number){
    constructor(values) {
        const name = values.name;
        this.toString = () => name;
        this.info = values.info;
        this.type = values.type;
        this.targetings = values.targetings;
        this.mul = values.mul;
        const num = values.num;
        this.rndAttackNum = () => num;
        this.hit = values.hit;
        this.mp = values.mp !== undefined ? values.mp : 0;
        this.tp = values.tp !== undefined ? values.tp : 0;
        ActiveTec._values.push(this);
    }
    static values() { return this._values; }
    get mpCost() { return this.mp; }
    get tpCost() { return this.tp; }
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
            Util.msg.set(`${attacker.name}`, Colors.UNIT_NAME);
            Util.msg.add(`の`);
            Util.msg.add(`[${this}]`, Colors.TEC);
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
            let value = dmg.calc();
            yield target.doDmg(value);
        });
    }
    createDmg(attacker, target) {
        let dmg = this.type.createDmg(attacker, target);
        dmg.hit = this.hit;
        return dmg;
    }
}
ActiveTec._values = [];
//--------------------------------------------------------------------------
//
//格闘
//
//--------------------------------------------------------------------------
ActiveTec.殴る = new class extends ActiveTec {
    constructor() {
        super({ name: "殴る", info: ["一体に格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 1, hit: 1,
        });
    }
};
ActiveTec.二回殴る = new class extends ActiveTec {
    constructor() {
        super({ name: "二回殴る", info: ["一体に二回格闘攻撃"],
            type: TecType.格闘, targetings: Targeting.SELECT,
            mul: 1, num: 2, hit: 1,
            tp: 20,
        });
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
        super({ name: "ヴァハ", info: ["一体に魔法攻撃"],
            type: TecType.魔法, targetings: Targeting.SELECT,
            mul: 1, num: 1, hit: 1,
            mp: 20,
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
        super({ name: "練気", info: ["自分を＜練＞化"],
            type: TecType.強化, targetings: Targeting.SELF,
            mul: 1, num: 1, hit: 1,
        });
    }
    run(attacker, target) {
        return __awaiter(this, void 0, void 0, function* () {
            setCondition(target, Condition.create練(1));
        });
    }
};
ActiveTec.グレートウォール = new class extends ActiveTec {
    constructor() {
        super({ name: "グレートウォール", info: ["味方全体を＜盾＞化"],
            type: TecType.強化, targetings: Targeting.ALL | Targeting.ONLY_FRIEND,
            mul: 1, num: 1, hit: 1,
        });
    }
    run(attacker, target) {
        return __awaiter(this, void 0, void 0, function* () {
            setCondition(target, Condition.create盾(1));
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
        super({ name: "何もしない", info: ["何もしないをする"],
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
const setCondition = (target, condition) => {
    target.setCondition(condition);
    Util.msg.set(`${target.name}は＜${condition}＞になった`, Color.CYAN.bright);
};
