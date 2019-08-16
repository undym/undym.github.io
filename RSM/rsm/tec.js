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
import { Dmg, Targeting } from "./force.js";
import { Condition } from "./condition.js";
import { Color } from "./undym/type.js";
import { FX_Str } from "./fx/fx.js";
import { Font } from "./graphics/graphics.js";
import { randomInt } from "./undym/random.js";
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
(function (TecType) {
    TecType.格闘 = new class extends TecType {
        constructor() { super("格闘"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.STR).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.MAG).total,
            });
            ;
        }
        ;
    };
    TecType.魔法 = new class extends TecType {
        constructor() { super("魔法"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.MAG).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.STR).total,
            });
            ;
        }
        ;
    };
    TecType.神格 = new class extends TecType {
        constructor() { super("神格"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.DRK).total,
            });
            ;
        }
        ;
    };
    TecType.暗黒 = new class extends TecType {
        constructor() { super("暗黒"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.DRK).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.LIG).total,
            });
            ;
        }
        ;
    };
    TecType.練術 = new class extends TecType {
        constructor() { super("練術"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.CHN).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.PST).total,
            });
            ;
        }
        ;
    };
    TecType.過去 = new class extends TecType {
        constructor() { super("過去"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.PST).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.CHN).total,
            });
            ;
        }
        ;
    };
    TecType.銃術 = new class extends TecType {
        constructor() { super("銃術"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.GUN).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.ARR).total,
            });
            ;
        }
        ;
    };
    TecType.弓術 = new class extends TecType {
        constructor() { super("弓術"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.ARR).total + attacker.prm(Prm.LV).total,
                def: target.prm(Prm.GUN).total,
            });
            ;
        }
        ;
    };
    TecType.状態 = new class extends TecType {
        constructor() { super("状態"); }
        createDmg(attacker, target) { return new Dmg(); }
        ;
    };
    TecType.回復 = new class extends TecType {
        constructor() { super("回復"); }
        createDmg(attacker, target) {
            return new Dmg({
                pow: attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
            });
            ;
        }
        ;
    };
    TecType.その他 = new class extends TecType {
        constructor() { super("その他"); }
        createDmg(attacker, target) { return new Dmg(); }
        ;
    };
})(TecType || (TecType = {}));
export class Tec {
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
    equip(unit) { }
    battleStart(unit) { }
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
        this.toString = () => `-${this.uniqueName}-`;
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
        this.epCost = args.ep ? args.ep : 0;
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
    checkCost(u) {
        return (u.mp >= this.mpCost
            && u.tp >= this.tpCost
            && u.ep >= this.epCost);
    }
    payCost(u) {
        u.mp -= this.mpCost;
        u.tp -= this.tpCost;
        u.ep -= this.epCost;
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
(function (Tec) {
    //--------------------------------------------------------------------------
    //
    //格闘Active
    //
    //--------------------------------------------------------------------------
    Tec.殴る = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "殴る", info: ["一体に格闘攻撃"],
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1,
            });
        }
    };
    Tec.二回殴る = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "二回殴る", info: ["一体に二回格闘攻撃"],
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 2, hit: 1, tp: 20,
            });
        }
    };
    Tec.大いなる動き = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "大いなる動き", info: ["敵全体に格闘攻撃"],
                type: TecType.格闘, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 1, ep: 1,
            });
        }
    };
    Tec.人狼剣 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "人狼剣", info: ["一体に自分の力値分のダメージを与える"],
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 3, tp: 10,
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
            super({ uniqueName: "閻魔の笏", info: ["一体に4回格闘攻撃"],
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 4, hit: 1, ep: 1,
            });
        }
    };
    Tec.マジカルパンチ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "マジカルパンチ", info: ["マジカル格闘攻撃"],
                type: TecType.格闘, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1, mp: 10,
            });
        }
        createDmg(attacker, target) {
            let dmg = super.createDmg(attacker, target);
            dmg.pow.base = attacker.prm(Prm.MAG).total;
            return dmg;
        }
    };
    //--------------------------------------------------------------------------
    //
    //格闘Passive
    //
    //--------------------------------------------------------------------------
    Tec.格闘攻撃UP = new class extends PassiveTec {
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
    Tec.カウンター = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "カウンター", info: ["被格闘攻撃時反撃"],
                type: TecType.格闘,
            });
        }
        afterBeAtk(action, attacker, target, dmg) {
            if (action instanceof Tec && action.type === TecType.格闘 && !dmg.counter) {
                Util.msg.set("＞カウンター");
                let cdmg = TecType.格闘.createDmg(target, attacker);
                cdmg.counter = true;
                attacker.doDmg(cdmg);
            }
        }
    };
    Tec.急所 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "急所", info: ["格闘攻撃時稀にクリティカル発生"],
                type: TecType.格闘,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type === TecType.格闘 && Math.random() < 0.3) {
                Util.msg.set("＞急所");
                dmg.pow.mul *= 1.5;
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
            super({ uniqueName: "ヴァハ", info: ["一体に魔法攻撃"],
                type: TecType.魔法, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1.2, mp: 10,
            });
        }
    };
    Tec.エヴィン = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "エヴィン", info: ["一体に魔法攻撃x2"],
                type: TecType.魔法, targetings: Targeting.SELECT,
                mul: 2, num: 1, hit: 1.2, mp: 25,
            });
        }
    };
    Tec.ルー = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ルー", info: ["一体に魔法攻撃x3"],
                type: TecType.魔法, targetings: Targeting.SELECT,
                mul: 3, num: 1, hit: 1.2, mp: 40,
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
            super({ uniqueName: "魔法攻撃UP", info: ["魔法攻撃x1.2"],
                type: TecType.魔法,
            });
        }
        beforeDoAtk(action, attacker, target, dmg) {
            if (action instanceof ActiveTec && action.type === TecType.魔法) {
                dmg.pow.mul *= 1.2;
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
            super({ uniqueName: "天籟", info: ["一体に神格攻撃"],
                type: TecType.神格, targetings: Targeting.SELECT,
                mul: 1, num: 1.5, hit: 1.5,
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //暗黒Active
    //
    //--------------------------------------------------------------------------
    Tec.暗黒剣 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "暗黒剣", info: ["一体に暗黒攻撃", "攻撃後反動ダメージ"],
                type: TecType.暗黒, targetings: Targeting.SELECT,
                mul: 2, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            const _super = Object.create(null, {
                run: { get: () => super.run }
            });
            return __awaiter(this, void 0, void 0, function* () {
                _super.run.call(this, attacker, target);
                Util.msg.set("＞反動");
                const cdmg = new Dmg({
                    pow: target.prm(Prm.LIG).total,
                    counter: true,
                });
                attacker.doDmg(cdmg);
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //練術Active
    //
    //--------------------------------------------------------------------------
    Tec.スネイク = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "スネイク", info: ["全体に練術攻撃"],
                type: TecType.練術, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 0.85,
                tp: 20,
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
            super({ uniqueName: "念力", info: ["全体に過去攻撃"],
                type: TecType.過去, targetings: Targeting.ALL,
                mul: 1, num: 1, hit: 1.2, mp: 40,
            });
        }
    };
    Tec.念 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "念", info: ["ランダムな一体に過去攻撃"],
                type: TecType.過去, targetings: Targeting.RANDOM,
                mul: 1, num: 1, hit: 1.2, mp: 10,
            });
        }
    };
    Tec.メテオ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "メテオ", info: ["ランダムに4～6回過去攻撃"],
                type: TecType.過去, targetings: Targeting.RANDOM,
                mul: 1, num: 4, hit: 1.2, ep: 1,
            });
            this.rndAttackNum = () => randomInt(4, 6);
        }
    };
    //--------------------------------------------------------------------------
    //
    //銃術Active
    //
    //--------------------------------------------------------------------------
    Tec.撃つ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "撃つ", info: ["ランダムに銃術攻撃2回"],
                type: TecType.銃術, targetings: Targeting.RANDOM,
                mul: 1, num: 2, hit: 0.8,
            });
        }
    };
    Tec.二丁拳銃 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "二丁拳銃", info: ["一体に銃術攻撃2回"],
                type: TecType.銃術, targetings: Targeting.RANDOM,
                mul: 1, num: 2, hit: 0.8, tp: 10,
            });
        }
    };
    Tec.あがらない雨 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "あがらない雨", info: ["全体に銃術攻撃2回"],
                type: TecType.銃術, targetings: Targeting.ALL,
                mul: 1, num: 2, hit: 0.7, ep: 1,
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
            super({ uniqueName: "射る", info: ["一体に弓術攻撃"],
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 1.5, num: 1, hit: 0.9,
            });
        }
    };
    Tec.インドラ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "インドラ", info: ["一体に弓術攻撃x3"],
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 3, num: 1, hit: 0.9, tp: 30,
            });
        }
    };
    Tec.キャンドラ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "キャンドラ", info: ["一体に弓術攻撃x6"],
                type: TecType.弓術, targetings: Targeting.SELECT,
                mul: 6, num: 1, hit: 0.9, ep: 1,
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
            super({ uniqueName: "練気", info: ["自分を＜練＞化"],
                type: TecType.状態, targetings: Targeting.SELF,
                mul: 1, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const condition = Condition.練;
                const value = target.getConditionValue(Condition.練) + 1;
                if (value > 4) {
                    return;
                }
                target.setCondition(condition, value);
                FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
                Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.CYAN.bright);
            });
        }
    };
    Tec.グレートウォール = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "グレートウォール", info: ["味方全体を＜盾＞化"],
                type: TecType.状態, targetings: Targeting.ALL | Targeting.ONLY_FRIEND,
                mul: 1, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const condition = Condition.盾;
                const value = target.getConditionValue(Condition.盾) + 1;
                if (value > 4) {
                    return;
                }
                target.setCondition(condition, value);
                FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
                Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.CYAN.bright);
            });
        }
    };
    Tec.ポイズンバタフライ = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ポイズンバタフライ", info: ["一体を＜毒＞化"],
                type: TecType.状態, targetings: Targeting.SELECT,
                mul: 1, num: 1, hit: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const condition = Condition.毒;
                const value = attacker.prm(Prm.DRK).total;
                target.setCondition(condition, value);
                FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
                Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, cnt => Color.RED.wave(Color.GREEN, cnt));
            });
        }
    };
    Tec.凍てつく波動 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "凍てつく波動", info: ["敵味方全体の状態を解除"],
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
            super({ uniqueName: "癒しの風", info: ["一体を＜癒5＞状態にする"],
                type: TecType.状態, targetings: Targeting.SELECT | Targeting.ONLY_FRIEND,
                mul: 1, num: 1, hit: 10, mp: 20,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const condition = Condition.癒;
                const value = 5;
                if (value > 4) {
                    return;
                }
                target.setCondition(condition, value);
                FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
                Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.CYAN.bright);
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
            super({ uniqueName: "準備運動", info: ["戦闘開始時＜練＞化"],
                type: TecType.状態,
            });
        }
        battleStart(unit) {
            if (!unit.existsCondition(Condition.練.type)) {
                setCondition(unit, Condition.練, 1);
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
            super({ uniqueName: "ばんそうこう", info: ["一体を光依存で回復"],
                type: TecType.回復, targetings: Targeting.SELECT,
                mul: 2, num: 1, hit: 10, mp: 20,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = attacker.prm(Prm.LV).total + attacker.prm(Prm.LIG).total;
                healHP(target, value);
            });
        }
    };
    Tec.ジョンD = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ジョンD", info: ["自分の最大MPを倍加", "MP回復"],
                type: TecType.回復, targetings: Targeting.SELF,
                mul: 1, num: 1, hit: 10, ep: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                target.prm(Prm.MAX_MP).battle *= 2;
                target.mp = target.prm(Prm.MAX_MP).total;
                Util.msg.set(`${target.name}に魔力が満ちた！`);
                yield wait();
            });
        }
    };
    Tec.ユグドラシル = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "ユグドラシル", info: ["味方全員を蘇生・回復"],
                type: TecType.回復, targetings: Targeting.ALL | Targeting.ONLY_FRIEND | Targeting.WITH_DEAD,
                mul: 1, num: 1, hit: 10, ep: 1,
            });
        }
        run(attacker, target) {
            return __awaiter(this, void 0, void 0, function* () {
                target.dead = false;
                target.hp = target.prm(Prm.MAX_HP).total;
                Util.msg.set(`${target.name}は回復した`);
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
            super({ uniqueName: "HP自動回復", info: ["行動開始時HP+1%"],
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            unit.hp += 1 + unit.prm(Prm.MAX_HP).total * 0.01;
        }
    };
    Tec.MP自動回復 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "MP自動回復", info: ["行動開始時MP+10"],
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            unit.mp += 10;
        }
    };
    Tec.TP自動回復 = new class extends PassiveTec {
        constructor() {
            super({ uniqueName: "TP自動回復", info: ["行動開始時TP+10"],
                type: TecType.回復,
            });
        }
        phaseStart(unit) {
            unit.tp += 10;
        }
    };
    //--------------------------------------------------------------------------
    //
    //その他Active
    //
    //--------------------------------------------------------------------------
    Tec.何もしない = new class extends ActiveTec {
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
    Tec.自爆 = new class extends ActiveTec {
        constructor() {
            super({ uniqueName: "自爆", info: ["敵全体に自分のHP分のダメージを与える", "HP=0"],
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
            super({ uniqueName: "我慢", info: ["防御値+99"],
                type: TecType.その他,
            });
        }
        beforeBeAtk(action, attacker, target, dmg) {
            dmg.def.add += 99;
        }
    };
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
})(Tec || (Tec = {}));
const setCondition = (target, condition, value) => {
    target.setCondition(condition, value);
    FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
    Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.WHITE.bright);
};
const healHP = (target, value) => {
    if (target.dead) {
        return;
    }
    value = value | 0;
    FX_Str(Font.def, `${value}`, target.bounds.center, Color.GREEN);
    target.hp += value;
    Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
};
