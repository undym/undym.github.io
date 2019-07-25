import { EUnit, Prm, Unit } from "./unit.js";
import { ActiveTec, PassiveTec } from "./tec.js";
export class Job {
    constructor(args) {
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.appearLv = args.appearLv;
        this.lvupExp = args.lvupExp;
        this.getGrowthPrms = args.grow;
        this.getLearningTecs = args.learn;
        this.canJobChange = args.canJobChange;
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
Job.DEF_LVUP_EXP = 5;
//------------------------------------------------------------------
//
//
//
//------------------------------------------------------------------
Job.しんまい = new class extends Job {
    constructor() {
        super({ uniqueName: "しんまい",
            appearLv: 0, lvupExp: Job.DEF_LVUP_EXP,
            grow: () => [{ prm: Prm.MAX_HP, value: 2 }],
            learn: () => [PassiveTec.HP自動回復, ActiveTec.二回殴る, ActiveTec.大いなる動き],
            canJobChange: (p) => true,
        });
        this.setEnemyInner = (e) => {
            e.tecs = [ActiveTec.殴る, ActiveTec.殴る, ActiveTec.殴る, ActiveTec.殴る, ActiveTec.練気];
        };
    }
};
Job.剣士 = new class extends Job {
    constructor() {
        super({ uniqueName: "剣士",
            appearLv: 1, lvupExp: Job.DEF_LVUP_EXP,
            grow: () => [{ prm: Prm.STR, value: 1 }],
            learn: () => [PassiveTec.格闘攻撃UP, ActiveTec.人狼剣, ActiveTec.閻魔の笏],
            canJobChange: (p) => p.isMasteredJob(Job.しんまい),
        });
        this.setEnemyInner = (e) => {
            e.tecs = [ActiveTec.殴る, ActiveTec.殴る, ActiveTec.殴る, ActiveTec.二回殴る, ActiveTec.人狼剣];
        };
    }
};
Job.魔法使い = new class extends Job {
    constructor() {
        super({ uniqueName: "魔法使い",
            appearLv: 1, lvupExp: Job.DEF_LVUP_EXP,
            grow: () => [{ prm: Prm.MAG, value: 1 }],
            learn: () => [ActiveTec.ヴァハ, PassiveTec.MP自動回復],
            canJobChange: (p) => p.isMasteredJob(Job.しんまい),
        });
        this.setEnemyInner = (e) => {
            e.tecs = [ActiveTec.ヴァハ, ActiveTec.ヴァハ, ActiveTec.殴る, ActiveTec.殴る, ActiveTec.殴る];
        };
    }
};
