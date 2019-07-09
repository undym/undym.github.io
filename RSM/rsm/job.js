import { EUnit, Prm, Unit } from "./unit.js";
import { ActiveTec, PassiveTec } from "./tec.js";
export class Job {
    constructor(name, appearLv, exp) {
        this.toString = () => name;
        this.appearLv = appearLv;
        this.exp = exp;
        Job._values.push(this);
    }
    static values() { return this._values; }
    static rndJob(lv) {
        for (let job of Job.values()) {
            if (job.appearLv <= lv) {
                return job;
            }
        }
        return Job.しんまい;
    }
    /**次のレベルに必要な値. */
    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
    getMaxLv() { return 10; }
    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
    setEnemy(e, lv) {
        for (let prm of Prm.values()) {
            let set = e.prm(prm);
            set.base = Math.floor(lv / 10 + (lv + 3) * Math.random());
            set.battle = 0;
            set.eq = 0;
        }
        e.name = this.toString();
        e.exists = true;
        e.dead = false;
        e.ai = EUnit.DEF_AI;
        e.prm(Prm.LV).base = lv;
        e.prm(Prm.EXP).base = Math.floor(lv * (0.75 + Math.random() * 0.5)) + 1;
        e.yen = lv + 1;
        e.prm(Prm.MAX_HP).base = 3 + Math.floor(lv * lv * 0.55 + lv * lv * 0.2);
        e.prm(Prm.MAX_MP).base = Unit.DEF_MAX_MP;
        e.prm(Prm.MAX_TP).base = Unit.DEF_MAX_TP;
        e.prm(Prm.TP).base = 0;
        this.setEnemyInner(e);
        e.prm(Prm.HP).base = e.prm(Prm.MAX_HP).total();
        e.prm(Prm.MP).base = Math.floor(Math.random() * e.prm(Prm.MAX_MP).total());
    }
    setEnemyInner(e) { }
}
Job._values = [];
Job.DEF_MAX_EXP = 5;
//------------------------------------------------------------------
//
//
//
//------------------------------------------------------------------
Job.しんまい = new class extends Job {
    constructor() {
        super("しんまい", /*appearLv*/ 0, /*exp*/ Job.DEF_MAX_EXP);
        this.getLearningTecs = () => [PassiveTec.HP自動回復, ActiveTec.二回殴る];
        this.canJobChange = (p) => true;
    }
    getGrowingPrm() { return [[Prm.MAX_HP, 2]]; }
    setEnemyInner(e) {
        e.tecs = [ActiveTec.殴る];
    }
};
Job.魔法使い = new class extends Job {
    constructor() {
        super("魔法使い", /*appearLv*/ 1, /*exp*/ Job.DEF_MAX_EXP * 1.5);
        this.getLearningTecs = () => [ActiveTec.ヴァハ];
        this.canJobChange = (p) => p.isMasteredJob(this);
    }
    getGrowingPrm() { return [[Prm.MAG, 1]]; }
    setEnemyInner(e) {
        e.tecs = [ActiveTec.ヴァハ, ActiveTec.ヴァハ, ActiveTec.殴る, ActiveTec.殴る, ActiveTec.殴る];
    }
};
