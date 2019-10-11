var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Unit, Prm, PUnit } from "./unit.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
import { Dmg, Targeting } from "./force.js";
import { Condition, ConditionType } from "./condition.js";
import { Color } from "./undym/type.js";
import { FX_格闘, FX_魔法, FX_神格, FX_暗黒, FX_練術, FX_過去, FX_銃術, FX_回復 } from "./fx/fx.js";
import { randomInt } from "./undym/random.js";
import { Item } from "./item.js";
export class TecType {
    constructor(name) {
        this.toString = () => name;
        TecType._values.push(this);
    }
    static values() { return this._values; }
    get tecs() {
        if (!this._tecs) {
            let actives = ActiveTec.values.filter(tec => tec.type === this);
            let passives = PassiveTec.values.filter(tec => tec.type === this);
            let tmp = [];
            this._tecs = tmp.concat(actives, passives);
        }
        return this._tecs;
    }
    /**一つでも当てはまればtrue. */
    any(...types) {
        for (const t of types) {
            if (this === t) {
                return true;
            }
        }
        return false;
    }
}
TecType._values = [];
(function (TecType) {
    TecType.格闘 = new class extends TecType {
        constructor() { super("格闘"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.STR).total + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.MAG).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_格闘(target.bounds.center);
        }
    };
    TecType.魔法 = new class extends TecType {
        constructor() { super("魔法"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.MAG).total + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.STR).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_魔法(target.bounds.center);
        }
    };
    TecType.神格 = new class extends TecType {
        constructor() { super("神格"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.DRK).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_神格(target.bounds.center);
        }
    };
    TecType.暗黒 = new class extends TecType {
        constructor() { super("暗黒"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.DRK).total + attacker.prm(Prm.LV).total * 0.75,
                def: target.prm(Prm.LIG).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_暗黒(target.bounds.center);
        }
    };
    TecType.練術 = new class extends TecType {
        constructor() { super("練術"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.CHN).total + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.PST).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_練術(attacker.bounds.center, target.bounds.center);
        }
    };
    TecType.過去 = new class extends TecType {
        constructor() { super("過去"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.PST).total + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.CHN).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_過去(target.bounds.center);
        }
    };
    TecType.銃術 = new class extends TecType {
        constructor() { super("銃術"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.GUN).total + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.ARR).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_銃術(attacker.bounds.center, target.bounds.center);
        }
    };
    TecType.弓術 = new class extends TecType {
        constructor() { super("弓術"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.ARR).total * 2 + attacker.prm(Prm.LV).total / 2,
                def: target.prm(Prm.GUN).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_銃術(attacker.bounds.center, target.bounds.center);
        }
    };
    TecType.状態 = new class extends TecType {
        constructor() { super("状態"); }
        createDmg(attacker, target) { return new Dmg(); }
        effect(attacker, target, dmg) {
            // FX_格闘(target.bounds.center);
        }
    };
    TecType.回復 = new class extends TecType {
        constructor() { super("回復"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
            });
        }
        effect(attacker, target, dmg) {
            FX_回復(target.bounds.center);
        }
    };
    TecType.その他 = new class extends TecType {
        constructor() { super("その他"); }
        createDmg(attacker, target) { return new Dmg(); }
        effect(attacker, target, dmg) {
            // FX_格闘(target.bounds.center);
        }
    };
})(TecType || (TecType = {}));
export class Tec {
    static get empty() {
        return this._empty ? this._empty : (this._empty = new class extends Tec {
            constructor() {
                super();
                this.uniqueName = "empty";
                this.info = "";
                this.type = TecType.格闘;
            }
        });
    }
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    equip(unit) { }
    battleStart(unit) { }
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
    phaseEnd(unit) { }
}
export class PassiveTec extends Tec {
    constructor(args) {
        super();
        this.args = args;
        PassiveTec._values.push(this);
        if (PassiveTec._valueOf.has(this.uniqueName)) {
            console.log(`PassiveTec already has uniqueName "${this.uniqueName}".`);
        }
        else {
            PassiveTec._valueOf.set(this.uniqueName, this);
        }
    }
    static get values() { return this._values; }
    static valueOf(uniqueName) {
        return this._valueOf.get(uniqueName);
    }
    get uniqueName() { return this.args.uniqueName; }
    get info() { return this.args.info; }
    get type() { return this.args.type; }
    toString() { return `-${this.uniqueName}-`; }
}
PassiveTec._values = [];
PassiveTec._valueOf = new Map();
export class ActiveTec extends Tec {
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    constructor(args) {
        super();
        this.args = args;
        ActiveTec._values.push(this);
        if (ActiveTec._valueOf.has(this.uniqueName)) {
            console.log(`!!ActiveTec already has uniqueName "${this.uniqueName}".`);
        }
        else {
            ActiveTec._valueOf.set(this.uniqueName, this);
        }
    }
    static get values() { return this._values; }
    static valueOf(uniqueName) {
        return this._valueOf.get(uniqueName);
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    get uniqueName() { return this.args.uniqueName; }
    get info() { return this.args.info; }
    get type() { return this.args.type; }
    get mpCost() { return this.args.mp ? this.args.mp : 0; }
    get tpCost() { return this.args.tp ? this.args.tp : 0; }
    get epCost() { return this.args.ep ? this.args.ep : 0; }
    ;
    get itemCost() {
        if (this.args.item) {
            let res = [];
            for (const set of this.args.item()) {
                res.push({ item: set[0], num: set[1] });
            }
            return res;
        }
        return [];
    }
    /**攻撃倍率 */
    get mul() { return this.args.mul; }
    /**攻撃回数生成 */
    rndAttackNum() { return this.args.num; }
    get hit() { return this.args.hit; }
    get targetings() { return this.args.targetings; }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    checkCost(u) {
        if (u instanceof PUnit) {
            for (const set of this.itemCost) {
                if (set.item.remainingUseNum < set.num) {
                    return false;
                }
            }
        }
        return (u.mp >= this.mpCost
            && u.tp >= this.tpCost
            && u.ep >= this.epCost);
    }
    payCost(u) {
        u.mp -= this.mpCost;
        u.tp -= this.tpCost;
        u.ep -= this.epCost;
        if (u instanceof PUnit) {
            for (const set of this.itemCost) {
                set.item.remainingUseNum -= set.num;
            }
        }
    }
    effect(attacker, target, dmg) {
        this.type.effect(attacker, target, dmg);
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
            for (let t of targets) {
                yield this.run(attacker, t);
            }
        });
    }
    run(attacker, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let dmg = this.createDmg(attacker, target);
            yield attacker.beforeDoAtk(this, target, dmg);
            yield target.beforeBeAtk(this, attacker, dmg);
            yield this.runInner(attacker, target, dmg);
            yield attacker.afterDoAtk(this, target, dmg);
            yield target.afterBeAtk(this, attacker, dmg);
        });
    }
    runInner(attacker, target, dmg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield target.doDmg(dmg);
            this.effect(attacker, target, dmg);
            yield wait();
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
ActiveTec._valueOf = new Map();
(function (Tec) {
    //--------------------------------------------------------------------------
    //
    //格闘Active
    //
    //--------------------------------------------------------------------------
    Tec.殴る = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "殴る", info: "一体に格闘攻撃",
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1,
            });
        }
        createDmg(attacker, target) {
            const dmg = super.createDmg(attacker, target);
            dmg.abs.base += 1;
            return dmg;
        }
    };
    Tec.二回殴る = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "二回殴る", info: "一体に二回格闘攻撃",
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 2, hit: 1, tp: 2,
            });
        }
    };
    Tec.大いなる動き = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "大いなる動き", info: "敵全体に格闘攻撃",
                type: TecType.格闘, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 1, ep: 1,
            });
        }
    };
    Tec.人狼剣 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "人狼剣", info: "一体に自分の力値分のダメージを与える",
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 3, tp: 1,
            });
        }
        createDmg(attacker, target) {
            return new Dmg({
                absPow: attacker.prm(Prm.STR).total,
                hit: this.hit,
            });
        }
    };
    Tec.閻魔の笏 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "閻魔の笏", info: "一体に4回格闘攻撃",
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 4, hit: 1, ep: 1,
            });
        }
    };
    Tec.マジカルパンチ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "マジカルパンチ", info: "マジカル格闘攻撃",
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1, mp: 1,
            });
        }
        createDmg(attacker, target) {
            let dmg = super.createDmg(attacker, target);
            dmg.pow.base = attacker.prm(Prm.MAG).total + attacker.prm(Prm.LV).total;
            return dmg;
        }
    };
    Tec.聖剣 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "聖剣", info: "一体に格闘攻撃　攻撃後光依存で回復",
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1, mp: 3, tp: 2,
            });
        }
        run(attacker, target) {
            const _super = Object.create(null, {
                run: { get: () => super.run }
            });
            return __awaiter(this, void 0, void 0, function* () {
                yield _super.run.call(this, attacker, target);
                const value = attacker.prm(Prm.LIG).total;
                Unit.healHP(attacker, value);
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //格闘Passive
    //
    //--------------------------------------------------------------------------
    Tec.格闘攻撃UP = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "格闘攻撃UP", info: "格闘攻撃x1.2",
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
    Tec.カウンター = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "カウンター", info: "被格闘攻撃時反撃",
                type: TecType.格闘,
            });
        }
        afterBeAtk(action, attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (action instanceof Tec && action.type === TecType.格闘 && !dmg.counter) {
                    Util.msg.set(">カウンター");
                    yield wait();
                    let cdmg = TecType.格闘.createDmg(target, attacker);
                    cdmg.counter = true;
                    attacker.doDmg(cdmg);
                    yield wait();
                }
            });
        }
    };
    Tec.急所 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "急所", info: "格闘攻撃時稀にクリティカル発生",
                type: TecType.格闘,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type === TecType.格闘 && Math.random() < 0.3) {
                Util.msg.set(">急所");
                dmg.pow.mul *= 1.5;
            }
        }
    };
    Tec.石肌 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "石肌", info: "被格闘・神格・練術・銃術攻撃-33%",
                type: TecType.格闘,
            });
        }
        beforeBeAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type.any(TecType.格闘, TecType.神格, TecType.練術, TecType.銃術)) {
                dmg.pow.mul *= 0.67;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //魔法Active
    //
    //--------------------------------------------------------------------------
    Tec.ヴァハ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ヴァハ", info: "一体に魔法攻撃",
                type: TecType.魔法, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1.2, mp: 1,
            });
        }
    };
    Tec.エヴィン = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "エヴィン", info: "一体に魔法攻撃x2",
                type: TecType.魔法, targetings: Targeting.SELECT,
                mul: 2, num: 1, hit: 1.2, mp: 2,
            });
        }
    };
    Tec.ルー = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ルー", info: "一体に魔法攻撃x3",
                type: TecType.魔法, targetings: Targeting.SELECT,
                mul: 3, num: 1, hit: 1.2, mp: 4,
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //魔法Passive
    //
    //--------------------------------------------------------------------------
    Tec.魔法攻撃UP = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "魔法攻撃UP", info: "魔法攻撃x1.2",
                type: TecType.魔法,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type === TecType.魔法) {
                dmg.pow.mul *= 1.2;
            }
        }
    };
    Tec.保湿クリーム = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "保湿クリーム", info: "被魔法・暗黒・過去・弓術攻撃-33%",
                type: TecType.魔法,
            });
        }
        beforeBeAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type.any(TecType.魔法, TecType.暗黒, TecType.過去, TecType.弓術)) {
                dmg.pow.mul *= 0.67;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //神格Active
    //
    //--------------------------------------------------------------------------
    Tec.天籟 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "天籟", info: "一体に神格攻撃",
                type: TecType.神格, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1.5,
            });
        }
    };
    // export const                          炎の鞭:ActiveTec = new class extends ActiveTec{
    //     constructor(){super({ uniqueName:"炎の鞭", info:"一体に鎖値を加算した神格攻撃",
    //                           type:TecType.神格, targetings:Targeting.SELECT,
    //                           mul:1, num:1, hit:1.5, mp:1, tp:1,
    //     });}
    //     createDmg(attacker:Unit, target:Unit){
    //         const dmg = super.createDmg(attacker, target);
    //         dmg.pow.add += attacker.prm(Prm.CHN).total;
    //         return dmg;
    //     }
    // }
    //--------------------------------------------------------------------------
    //
    //暗黒Active
    //
    //--------------------------------------------------------------------------
    Tec.暗黒剣 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "暗黒剣", info: "一体に暗黒攻撃攻撃後反動ダメージ",
                type: TecType.暗黒, targetings: Targeting.SELECT,
                mul: 2, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            const _super = Object.create(null, {
                run: { get: () => super.run }
            });
            return __awaiter(this, void 0, void 0, function* () {
                yield _super.run.call(this, attacker, target);
                Util.msg.set(">反動");
                const cdmg = new Dmg({
                    absPow: target.prm(Prm.LIG).total + target.prm(Prm.LV).total / 2,
                    counter: true,
                });
                attacker.doDmg(cdmg);
                yield wait();
            });
        }
    };
    Tec.吸血 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "吸血", info: "相手からHPを吸収暗黒依存",
                type: TecType.暗黒, targetings: Targeting.SELECT,
                mul: 0.5, num: 1, hit: 2, mp: 3, tp: 2,
            });
        }
        runInner(attacker, target, dmg) {
            const _super = Object.create(null, {
                runInner: { get: () => super.runInner }
            });
            return __awaiter(this, void 0, void 0, function* () {
                _super.runInner.call(this, attacker, target, dmg);
                if (dmg.result.isHit) {
                    attacker.hp += dmg.result.value;
                }
            });
        }
    };
    Tec.VBS = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "VBS", info: "敵全体に吸血",
                type: TecType.暗黒, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 2, ep: 1,
            });
        }
        runInner(attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                Tec.吸血.runInner(attacker, target, dmg);
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //暗黒Passive
    //
    //--------------------------------------------------------------------------
    Tec.宵闇 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "宵闇", info: "暗黒攻撃x2　攻撃時HP-20%",
                type: TecType.暗黒,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type.any(TecType.暗黒)) {
                Util.msg.set("＞宵闇");
                attacker.hp -= attacker.prm(Prm.MAX_HP).total * 0.2;
                dmg.pow.mul *= 2;
            }
        }
    };
    Tec.影の鎧 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "影の鎧", info: "自分と相手の暗黒値に応じて与・被ダメージが増減　高い側に有利に働く",
                type: TecType.暗黒,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type.any(TecType.暗黒)) {
                let mul = 1 + attacker.prm(Prm.DRK).total / target.prm(Prm.DRK).total * 0.05;
                if (mul < 0.5) {
                    mul = 0.5;
                }
                if (mul > 1.5) {
                    mul = 1.5;
                }
                dmg.pow.mul *= mul;
            }
        }
        beforeBeAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type.any(TecType.暗黒)) {
                let mul = 1 + target.prm(Prm.DRK).total / attacker.prm(Prm.DRK).total * 0.05;
                if (mul < 0.5) {
                    mul = 0.5;
                }
                if (mul > 1.5) {
                    mul = 1.5;
                }
                dmg.pow.mul *= mul;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //練術Active
    //
    //--------------------------------------------------------------------------
    Tec.スネイク = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "スネイク", info: "全体に練術攻撃",
                type: TecType.練術, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 0.85, tp: 2,
            });
        }
    };
    Tec.コブラ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "コブラ", info: "一体に練術攻撃2回",
                type: TecType.練術, targetings: Targeting.SELECT,
                mul: 1, num: 2, hit: 0.85, tp: 3,
            });
        }
    };
    Tec.ハブ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ハブ", info: "全体に練術攻撃　稀に対象を<毒>化",
                type: TecType.練術, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 0.85, tp: 4,
            });
        }
        runInner(attacker, target, dmg) {
            const _super = Object.create(null, {
                runInner: { get: () => super.runInner }
            });
            return __awaiter(this, void 0, void 0, function* () {
                _super.runInner.call(this, attacker, target, dmg);
                if (dmg.result.isHit && Math.random() < 0.3) {
                    const value = attacker.prm(Prm.DRK).total / 2 + attacker.prm(Prm.CHN).total / 2 + 1;
                    Unit.setCondition(target, Condition.毒, value);
                }
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //過去Active
    //
    //--------------------------------------------------------------------------
    Tec.念力 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "念力", info: "全体に過去攻撃",
                type: TecType.過去, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 1.2, mp: 4,
            });
        }
    };
    Tec.念 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "念", info: "ランダムな一体に過去攻撃",
                type: TecType.過去, targetings: Targeting.RANDOM,
                mul: 1, num: 1, hit: 1.2, mp: 1,
            });
        }
    };
    Tec.メテオ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "メテオ", info: "ランダムに4～6回過去攻撃",
                type: TecType.過去, targetings: Targeting.RANDOM,
                mul: 1, num: 4, hit: 1.2, ep: 1,
            });
            this.rndAttackNum = () => randomInt(4, 6);
        }
    };
    //--------------------------------------------------------------------------
    //
    //過去Passive
    //
    //--------------------------------------------------------------------------
    Tec.ネガティヴフィードバック = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "ネガティヴフィードバック", info: "過去攻撃時　状態異常一つにつき、消費MPの10%を還元",
                type: TecType.過去,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (action instanceof ActiveTec && (action.type === TecType.過去)) {
                    let num = ConditionType.badConditions()
                        .filter(type => attacker.existsCondition(type))
                        .length;
                    if (num === 0) {
                        return;
                    }
                    Unit.healMP(attacker, action.mpCost * 0.1 * num);
                }
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //銃術Active
    //
    //--------------------------------------------------------------------------
    Tec.撃つ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "撃つ", info: "ランダムに銃術攻撃2回",
                type: TecType.銃術, targetings: Targeting.RANDOM,
                mul: 1, num: 2, hit: 0.8,
            });
        }
    };
    Tec.二丁拳銃 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "二丁拳銃", info: "一体に銃術攻撃2回",
                type: TecType.銃術, targetings: Targeting.RANDOM,
                mul: 1, num: 2, hit: 0.8, tp: 1,
            });
        }
    };
    Tec.あがらない雨 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "あがらない雨", info: "全体に銃術攻撃2回",
                type: TecType.銃術, targetings: Targeting.ALL,
                mul: 1, num: 2, hit: 0.7, ep: 1,
            });
        }
    };
    Tec.ショットガン = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ショットガン", info: "ランダムに銃術攻撃4回x0.7",
                type: TecType.銃術, targetings: Targeting.RANDOM,
                mul: 0.7, num: 4, hit: 0.8,
                item: () => [[Item.散弾, 1]],
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //銃術Passive
    //
    //--------------------------------------------------------------------------
    Tec.テーブルシールド = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "テーブルシールド", info: "被銃・弓攻撃-30%",
                type: TecType.銃術,
            });
        }
        beforeBeAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type.any(TecType.銃術, TecType.弓術)) {
                dmg.pow.mul *= 0.7;
            }
        }
    };
    Tec.カイゼルの目 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "カイゼルの目", info: "銃・弓攻撃時稀にクリティカル",
                type: TecType.銃術,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (action instanceof ActiveTec
                    && (action.type.any(TecType.銃術, TecType.弓術))
                    && Math.random() < 0.25) {
                    Util.msg.set("＞カイゼルの目");
                    dmg.pow.mul *= 1.5;
                }
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //弓術Active
    //
    //--------------------------------------------------------------------------
    Tec.射る = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "射る", info: "一体に弓術攻撃",
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 0.9,
            });
        }
    };
    Tec.インドラ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "インドラ", info: "一体に弓術攻撃x2",
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 2, num: 1, hit: 0.9, tp: 2,
            });
        }
    };
    Tec.キャンドラ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "キャンドラ", info: "一体に弓術攻撃x4",
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 4, num: 1, hit: 0.9, ep: 1,
            });
        }
    };
    Tec.ヤクシャ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ヤクシャ", info: "一体に弓術攻撃2回　夜叉の矢",
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 1, num: 2, hit: 0.9, tp: 2, item: () => [[Item.夜叉の矢, 1]],
            });
        }
    };
    Tec.フェニックスアロー = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "フェニックスアロー", info: "一体に弓術攻撃　攻撃後光依存で回復",
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 0.9, mp: 3, tp: 2,
            });
        }
        runInner(attacker, target, dmg) {
            const _super = Object.create(null, {
                runInner: { get: () => super.runInner }
            });
            return __awaiter(this, void 0, void 0, function* () {
                _super.runInner.call(this, attacker, target, dmg);
                const value = attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total / 2;
                if (dmg.result.isHit) {
                    Unit.healHP(attacker, value);
                }
                else {
                    Unit.healHP(attacker, value / 3);
                }
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //状態Active
    //
    //--------------------------------------------------------------------------
    Tec.練気 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "練気", info: "自分を<練>化",
                type: TecType.状態, targetings: Targeting.SELF,
                mul: 1, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = target.getConditionValue(Condition.練) + 1;
                if (value > 4) {
                    return;
                }
                Unit.setCondition(target, Condition.練, value);
            });
        }
    };
    Tec.グレートウォール = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "グレートウォール", info: "味方全体を<盾>化",
                type: TecType.状態, targetings: Targeting.ALL | Targeting.FRIEND_ONLY,
                mul: 1, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = target.getConditionValue(Condition.盾) + 1;
                if (value > 4) {
                    return;
                }
                Unit.setCondition(target, Condition.盾, value);
            });
        }
    };
    Tec.ポイズンバタフライ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ポイズンバタフライ", info: "一体を<毒>化",
                type: TecType.状態, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = attacker.prm(Prm.DRK).total;
                Unit.setCondition(target, Condition.毒, value);
            });
        }
    };
    Tec.凍てつく波動 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "凍てつく波動", info: "敵味方全体の状態を解除",
                type: TecType.状態, targetings: Targeting.ALL | Targeting.WITH_FRIEND,
                mul: 1, num: 1, hit: 10, ep: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                target.clearAllCondition();
                Util.msg.set(`${target.name}の状態が解除された！`, Color.WHITE.bright);
            });
        }
    };
    Tec.癒しの風 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "癒しの風", info: "一体を<癒5>(毎ターン回復)状態にする",
                type: TecType.状態, targetings: Targeting.SELECT | Targeting.FRIEND_ONLY,
                mul: 1, num: 1, hit: 10, mp: 2,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                Unit.setCondition(target, Condition.癒, 5);
            });
        }
    };
    Tec.いやらしの風 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "いやらしの風", info: "味方全体を<癒5>状態にする",
                type: TecType.状態, targetings: Targeting.ALL | Targeting.FRIEND_ONLY,
                mul: 1, num: 1, hit: 10, mp: 6,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                Tec.癒しの風.run(attacker, target);
            });
        }
    };
    Tec.風 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "風", info: "自分を<風3>(回避UP)状態にする",
                type: TecType.状態, targetings: Targeting.ALL | Targeting.FRIEND_ONLY,
                mul: 1, num: 1, hit: 10, mp: 1, tp: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                Unit.setCondition(target, Condition.風, 5);
            });
        }
    };
    Tec.やる気ゼロ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "やる気0", info: "一体を<攻↓5>状態にする",
                type: TecType.状態, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 10, mp: 2,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                Unit.setCondition(target, Condition.攻撃低下, 5);
            });
        }
    };
    Tec.弱体液 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "弱体液", info: "一体を<防↓5>状態にする",
                type: TecType.状態, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 10, mp: 2,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                Unit.setCondition(target, Condition.防御低下, 5);
            });
        }
    };
    Tec.スコープ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "スコープ", info: "自分を<狙4>（命中上昇）状態にする",
                type: TecType.状態, targetings: Targeting.SELF,
                mul: 1, num: 1, hit: 10, mp: 1, tp: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                Unit.setCondition(target, Condition.狙, 4);
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //状態Passive
    //
    //--------------------------------------------------------------------------
    Tec.準備運動 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "準備運動", info: "戦闘開始時<練>化",
                type: TecType.状態,
            });
        }
        battleStart(unit) {
            if (!unit.existsCondition(Condition.練.type)) {
                Unit.setCondition(unit, Condition.練, 1);
            }
        }
    };
    Tec.毒吸収 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "毒吸収", info: "＜毒＞を吸収する",
                type: TecType.状態,
            });
        }
        phaseEnd(unit) {
            if (unit.existsCondition(Condition.毒)) {
                const value = unit.getConditionValue(Condition.毒);
                Unit.healHP(unit, value);
                unit.clearCondition(Condition.毒);
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //回復Active
    //
    //--------------------------------------------------------------------------
    Tec.ばんそうこう = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ばんそうこう", info: "一体を回復(光依存)",
                type: TecType.回復, targetings: Targeting.SELECT | Targeting.FRIEND_ONLY,
                mul: 2, num: 1, hit: 10, mp: 2,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = attacker.prm(Prm.LV).total + attacker.prm(Prm.LIG).total;
                Unit.healHP(target, value);
                Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
            });
        }
    };
    Tec.ひんやりゼリー = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ひんやりゼリー", info: "味方全体を回復",
                type: TecType.回復, targetings: Targeting.ALL | Targeting.FRIEND_ONLY,
                mul: 2, num: 1, hit: 10, mp: 2,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = attacker.prm(Prm.LV).total + attacker.prm(Prm.LIG).total;
                Unit.healHP(target, value);
                Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
            });
        }
    };
    Tec.ジョンD = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ジョンD", info: "自分の最大MPを倍加　MP回復",
                type: TecType.回復, targetings: Targeting.SELF,
                mul: 1, num: 1, hit: 10, ep: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                target.prm(Prm.MAX_MP).battle += target.prm(Prm.MAX_MP).total;
                target.mp = target.prm(Prm.MAX_MP).total;
                Util.msg.set(`${target.name}に魔力が満ちた！`);
                yield wait();
            });
        }
    };
    Tec.ユグドラシル = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ユグドラシル", info: "味方全員を蘇生・回復",
                type: TecType.回復, targetings: Targeting.ALL | Targeting.FRIEND_ONLY | Targeting.WITH_DEAD,
                mul: 1, num: 1, hit: 10, ep: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                if (target.dead) {
                    target.dead = false;
                    target.hp = 1;
                }
                const dmg = TecType.回復.createDmg(attacker, target);
                Unit.healHP(target, dmg.calc().value);
            });
        }
    };
    Tec.吸心 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "吸心", info: "一体をからTPを2吸収",
                type: TecType.回復, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 10, tp: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = 2;
                target.tp -= value;
                attacker.tp += value;
                Util.msg.set(`${target.name}からTPを${value}吸収した`);
                yield wait();
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //回復Passive
    //
    //--------------------------------------------------------------------------
    Tec.HP自動回復 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "HP自動回復", info: "行動開始時HP+1%",
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            Unit.healHP(unit, 1 + unit.prm(Prm.MAX_HP).total * 0.01);
        }
    };
    Tec.衛生 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "衛生", info: "行動開始時味方のHP+5%",
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            const members = unit.getParty(/*withHimSelf*/ true);
            const lim = unit.prm(Prm.LIG).total * 10;
            for (const u of members) {
                const value = u.prm(Prm.MAX_HP).total * 0.05 + 1;
                const v = value < lim ? value : lim;
                Unit.healHP(u, 1 + unit.prm(Prm.MAX_HP).total * 0.01);
            }
        }
    };
    Tec.体力機関 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "体力機関", info: "戦闘開始時最大HP･HP+10%",
                type: TecType.回復,
            });
        }
        battleStart(unit) {
            const value = unit.prm(Prm.MAX_HP).total * 0.1;
            unit.prm(Prm.MAX_HP).battle += value;
            Unit.healHP(unit, value);
        }
    };
    Tec.MP自動回復 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "MP自動回復", info: "行動開始時MP+1%",
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            let value = unit.prm(Prm.MAX_MP).total * 0.01;
            if (value < 1) {
                value = 1;
            }
            Unit.healMP(unit, value);
        }
    };
    Tec.頭痛 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "頭痛", info: "行動開始時MP+10%　回復MP分のダメージを受ける",
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            return __awaiter(this, void 0, void 0, function* () {
                let value = unit.prm(Prm.MAX_MP).total * 0.1;
                Unit.healMP(unit, value);
                unit.doDmg(new Dmg({ absPow: value }));
                yield wait();
            });
        }
    };
    Tec.TP自動回復 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "TP自動回復", info: "行動開始時TP+1%",
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            let value = unit.prm(Prm.MAX_TP).total * 0.01;
            if (value < 1) {
                value = 1;
            }
            Unit.healTP(unit, value);
        }
    };
    //--------------------------------------------------------------------------
    //
    //その他Active
    //
    //--------------------------------------------------------------------------
    Tec.何もしない = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "何もしない", info: "何もしないをする",
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
    Tec.自爆 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "自爆", info: "敵全体に自分のHP分のダメージを与える　HP=0",
                type: TecType.その他, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 1, ep: 1,
            });
        }
        use(attacker, targets) {
            const _super = Object.create(null, {
                use: { get: () => super.use }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const canUse = this.checkCost(attacker);
                Util.msg.set(`${attacker.name}の体から光が溢れる...`);
                yield wait();
                _super.use.call(this, attacker, targets);
                if (canUse) {
                    attacker.hp = 0;
                }
                else {
                    Util.msg.set(`光に吸い寄せられた虫が体にいっぱいくっついた...`);
                    yield wait();
                }
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const dmg = new Dmg({ absPow: attacker.hp });
                target.doDmg(dmg);
                yield wait();
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //その他Passive
    //
    //--------------------------------------------------------------------------
    Tec.我慢 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "我慢", info: "防御値x1.2+99",
                type: TecType.その他,
            });
        }
        beforeBeAtk(action, attacker, target, dmg) {
            dmg.def.mul *= 1.2;
            dmg.def.add += 99;
        }
    };
    Tec.トランシット = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "トランシット", info: "攻撃命中率上昇",
                type: TecType.その他,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            dmg.hit.add += 0.07;
        }
    };
    Tec.便風 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "便風", info: "攻撃回避率上昇",
                type: TecType.その他,
            });
        }
        beforeBeAtk(action, attacker, target, dmg) {
            dmg.hit.mul *= 0.9;
        }
    };
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
})(Tec || (Tec = {}));
