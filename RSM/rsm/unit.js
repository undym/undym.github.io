var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Player } from "./player.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
import { Color, Rect } from "./undym/type.js";
import { Tec, ActiveTec, PassiveTec } from "./tec.js";
import { Targeting } from "./force.js";
import { Job } from "./job.js";
import { FX_ShakeStr } from "./fx/fx.js";
import { ConditionType, Condition } from "./condition.js";
import { Eq, EqPos } from "./eq.js";
import { choice } from "./undym/random.js";
import { Graphics, Font } from "./graphics/graphics.js";
class PrmSet {
    constructor() {
        this.base = 0;
        this.eq = 0;
        this.battle = 0;
    }
    total() {
        let res = this.base + this.eq + this.battle;
        if (res < 0) {
            return res;
        }
        return res;
    }
}
export class Prm {
    constructor(_toString) {
        this.toString = () => _toString;
        Prm._values.push(this);
    }
    static values() { return this._values; }
}
Prm._values = [];
Prm.HP = new Prm("HP");
Prm.MAX_HP = new Prm("最大HP");
Prm.MP = new Prm("MP");
Prm.MAX_MP = new Prm("最大MP");
Prm.TP = new Prm("TP");
Prm.MAX_TP = new Prm("最大TP");
Prm.STR = new Prm("力");
Prm.MAG = new Prm("魔");
Prm.LIG = new Prm("光");
Prm.DRK = new Prm("闇");
Prm.CHN = new Prm("鎖");
Prm.PST = new Prm("過");
Prm.GUN = new Prm("銃");
Prm.ARR = new Prm("弓");
Prm.LV = new Prm("Lv");
Prm.EXP = new Prm("Exp");
export class Unit {
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    constructor() {
        this.name = "";
        this.exists = false;
        this.dead = false;
        this.prmSets = new Map();
        this.equips = new Map();
        this.tecs = [];
        /**戦闘時の技ページ。 */
        this.tecPage = 0;
        // protected conditions = new Map<ConditionType,Condition>();
        this.conditions = [];
        this.bounds = Rect.ZERO;
        for (let prm of Prm.values()) {
            this.prmSets.set(prm, new PrmSet());
        }
        this.job = Job.しんまい;
        // for(let type of ConditionType.values()){
        //     this.conditionSets.set(type, {condition:Condition.empty, value:0});
        // }
        for (let pos of EqPos.values()) {
            this.equips.set(pos, Eq.getDef(pos));
        }
    }
    static get players() { return this._players; }
    static get enemies() { return this._enemies; }
    static get all() { return this._all; }
    static init() {
        let player_num = 4;
        let enemy_num = 4;
        for (let i = 0; i < player_num; i++) {
            this._players.push(Player.empty.ins);
        }
        for (let i = 0; i < enemy_num; i++) {
            this._enemies.push(new EUnit());
        }
        this.resetAll();
    }
    static setPlayer(index, p) {
        this._players[index] = p;
        this.resetAll();
    }
    static resetAll() {
        this._all = [];
        for (let p of this._players) {
            this._all.push(p);
        }
        for (let e of this._enemies) {
            this._all.push(e);
        }
    }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    prm(p) { return this.prmSets.get(p); }
    get hp() { return this.prm(Prm.HP).base; }
    set hp(value) {
        this.prm(Prm.HP).base = value;
        this.fixPrm(Prm.HP, Prm.MAX_HP);
    }
    get mp() { return this.prm(Prm.MP).base; }
    set mp(value) {
        this.prm(Prm.MP).base = value;
        this.fixPrm(Prm.MP, Prm.MAX_MP);
    }
    get tp() { return this.prm(Prm.TP).base; }
    set tp(value) {
        this.prm(Prm.TP).base = value;
        this.fixPrm(Prm.TP, Prm.MAX_TP);
    }
    get exp() { return this.prm(Prm.EXP).base; }
    set exp(value) { this.prm(Prm.EXP).base = value; }
    fixPrm(checkPrm, maxPrm) {
        if (this.prm(checkPrm).base < 0) {
            this.prm(checkPrm).base = 0;
        }
        else if (this.prm(checkPrm).base > this.prm(maxPrm).total()) {
            this.prm(checkPrm).base = this.prm(maxPrm).total();
        }
    }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    doDmg(dmg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.exists || this.dead) {
                return;
            }
            const result = dmg.calc();
            const p = {
                x: this.bounds.cx + (1 / Graphics.pixelW) * 20 * (Math.random() * 2 - 1),
                y: this.bounds.cy + (1 / Graphics.pixelH) * 20 * (Math.random() * 2 - 1),
            };
            if (result.isHit) {
                this.hp -= result.value;
                FX_ShakeStr(new Font(30, Font.BOLD), `${result.value}`, p, Color.RED);
                Util.msg.set(`${this.name}に${result.value}のダメージ`, Color.RED.bright);
                yield wait();
            }
            else {
                FX_ShakeStr(new Font(30, Font.BOLD), `MISS`, p, Color.RED);
                Util.msg.set("MISS");
                yield wait();
            }
        });
    }
    judgeDead() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.exists || this.dead) {
                return;
            }
            if (this.prm(Prm.HP).base > 0) {
                return;
            }
            this.dead = true;
            Util.msg.set(`${this.name}は死んだ`, Color.RED);
            yield wait();
        });
    }
    //---------------------------------------------------------
    //
    //force
    //
    //---------------------------------------------------------
    phaseStart() { this.force(f => f.phaseStart(this)); }
    beforeDoAtk(action, target, dmg) { this.force(f => f.beforeDoAtk(action, this, target, dmg)); }
    beforeBeAtk(action, attacker, dmg) { this.force(f => f.beforeBeAtk(action, attacker, this, dmg)); }
    afterDoAtk(action, target, dmg) { this.force(f => f.afterDoAtk(action, this, target, dmg)); }
    afterBeAtk(action, attacker, dmg) { this.force(f => f.afterBeAtk(action, this, attacker, dmg)); }
    force(forceDlgt) {
        for (let tec of this.tecs) {
            forceDlgt(tec);
        }
        for (let eq of this.equips.values()) {
            forceDlgt(eq);
        }
    }
    existsCondition(a) {
        if (a instanceof ConditionType) {
            return this.conditions.some(c => c.type === a);
        }
        if (a instanceof Condition) {
            return this.conditions.some(c => c.name === a.name);
        }
        return false;
    }
    clearCondition(a) {
        if (a instanceof ConditionType) {
            this.conditions = this.conditions.filter(c => c.type !== a);
        }
        if (a instanceof Condition) {
            this.conditions = this.conditions.filter(c => c.name !== a.name);
        }
    }
    setCondition(condition) {
        if (condition.type === ConditionType.INVISIBLE) {
            this.conditions.push(condition);
            return;
        }
        this.conditions = this.conditions.filter(c => c.type !== condition.type);
        this.conditions.push(condition);
    }
    getCondition(type) {
        let res = this.conditions.find(c => c.type === type);
        if (res === undefined) {
            return Condition.empty;
        }
        return res;
    }
    //---------------------------------------------------------
    //
    //Eq
    //
    //---------------------------------------------------------
    getEq(pos) { return this.equips.get(pos); }
    setEq(eq) { this.equips.set(eq.pos, eq); }
}
Unit.DEF_MAX_MP = 100;
Unit.DEF_MAX_TP = 100;
Unit._players = [];
Unit._enemies = [];
Unit._all = [];
export class PUnit extends Unit {
    // private jobExps = new Map<Job,number>();
    constructor(player) {
        super();
        this.jobLvs = new Map();
        this.masteredTecs = new Map();
        this.player = player;
        for (let job of Job.values()) {
            this.jobLvs.set(job, { lv: 0, exp: 0 });
        }
        for (let tec of ActiveTec.values()) {
            this.masteredTecs.set(tec, false);
        }
        for (let tec of PassiveTec.values()) {
            this.masteredTecs.set(tec, false);
        }
    }
    isFriend(u) { return (u instanceof PUnit); }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    addExp(exp) {
        return __awaiter(this, void 0, void 0, function* () {
            this.prm(Prm.EXP).base += exp;
            if (this.prm(Prm.EXP).base >= this.getNextLvExp()) {
                this.prm(Prm.LV).base++;
                this.prm(Prm.EXP).base = 0;
                Util.msg.set(`${this.name}はLv${this.prm(Prm.LV).base}になった`, Color.ORANGE.bright);
                yield wait();
                const growHP = this.prm(Prm.LV).base / 100 + 1;
                this.growPrm(Prm.MAX_HP, growHP | 0);
                for (let grow of this.job.getGrowthPrms()) {
                    this.growPrm(grow.prm, grow.value);
                }
            }
        });
    }
    getNextLvExp() { return Math.pow(this.prm(Prm.LV).base, 2) * 3; }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    getJobLvSet(job) { return this.jobLvs.get(job); }
    setJobExp(job, exp) { this.getJobLvSet(job).exp = exp; }
    getJobExp(job) { return this.getJobLvSet(job).exp; }
    addJobExp(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isMasteredJob(this.job)) {
                return;
            }
            const set = this.getJobLvSet(this.job);
            set.exp += value;
            if (set.exp >= this.job.lvupExp) {
                set.lv += 1;
                set.exp = 0;
                Util.msg.set(`${this.name}の${this.job}Lvが${set.lv}になった`, Color.ORANGE.bright);
                yield wait();
                for (let grow of this.job.getGrowthPrms()) {
                    this.growPrm(grow.prm, grow.value);
                }
                const tecs = this.job.getLearningTecs();
                const ratio = set.lv / this.job.getMaxLv();
                for (let i = 0; i < tecs.length; i++) {
                    if (i + 1 > tecs.length * ratio) {
                        break;
                    }
                    if (this.isMasteredTec(tecs[i])) {
                        continue;
                    }
                    this.setMasteredTec(tecs[i], true);
                    Util.msg.set(`[${tecs[i]}]を習得した！`, Color.GREEN.bright);
                    yield wait();
                    //技スロットに空きがあれば覚えた技をセット
                    for (let ei = 0; ei < this.tecs.length; ei++) {
                        if (this.tecs[ei] === Tec.empty) {
                            this.tecs[ei] = tecs[i];
                            break;
                        }
                    }
                }
                if (set.lv >= this.job.getMaxLv()) {
                    Util.msg.set(`${this.job}を極めた！`, Color.ORANGE.bright);
                    yield wait();
                }
            }
        });
    }
    setJobLv(job, lv) { this.getJobLvSet(job).lv = lv; }
    getJobLv(job) { return this.getJobLvSet(job).lv; }
    isMasteredJob(job) { return this.getJobLvSet(job).lv >= job.getMaxLv(); }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    setMasteredTec(tec, b) { this.masteredTecs.set(tec, b); }
    isMasteredTec(tec) { return this.masteredTecs.get(tec); }
    //---------------------------------------------------------
    //
    //
    //
    //---------------------------------------------------------
    growPrm(prm, value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.prm(prm).base += value;
            Util.msg.set(`[${prm}]+${value}`, Color.GREEN.bright);
            yield wait();
        });
    }
}
export class EUnit extends Unit {
    constructor() {
        super();
        this.yen = 0;
        this.ai = EUnit.DEF_AI;
    }
    isFriend(u) { return (u instanceof EUnit); }
}
EUnit.DEF_AI = (attacker, targetCandidates) => __awaiter(this, void 0, void 0, function* () {
    let activeTecs = attacker.tecs.filter(tec => tec instanceof ActiveTec);
    if (activeTecs.length === 0) {
        ActiveTec.何もしない.use(attacker, [attacker]);
        return;
    }
    for (let i = 0; i < 7; i++) {
        let tec = choice(activeTecs);
        if (tec.checkCost(attacker)) {
            let targets = Targeting.filter(tec.targetings, attacker, targetCandidates);
            if (targets.length === 0) {
                continue;
            }
            yield tec.use(attacker, targets);
            return;
        }
    }
    ActiveTec.何もしない.use(attacker, [attacker]);
});
