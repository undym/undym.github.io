import { EUnit, Prm, Unit } from "./unit.js";
import { Tec } from "./tec.js";
export class Job {
    constructor(args) {
        this.uniqueName = args.uniqueName;
        this.info = args.info;
        this.toString = () => this.uniqueName;
        this.appearLv = args.appearLv;
        this.lvupExp = args.lvupExp;
        this.getGrowthPrms = args.grow;
        this.getLearningTecs = args.learn;
        this.canJobChange = args.canJobChange;
        Job._values.push(this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (const job of this.values()) {
                this._valueOf.set(job.uniqueName, job);
            }
        }
        return this._valueOf.get(uniqueName);
    }
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
        for (const prm of Prm.values()) {
            const set = e.prm(prm);
            set.base = (lv / 10 + (lv + 3) * Math.random()) | 0;
            set.battle = 0;
            set.eq = 0;
        }
        e.name = this.toString();
        e.exists = true;
        e.dead = false;
        e.ai = EUnit.DEF_AI;
        e.prm(Prm.LV).base = lv;
        e.prm(Prm.EXP).base = (lv * (0.75 + Math.random() * 0.5) + 1) | 0;
        e.yen = lv + 1;
        e.prm(Prm.MAX_HP).base = 3 + (lv * lv * 0.55);
        e.prm(Prm.MAX_MP).base = Unit.DEF_MAX_MP;
        e.prm(Prm.MAX_TP).base = Unit.DEF_MAX_TP;
        e.tp = 0;
        this.setEnemyInner(e);
        e.hp = e.prm(Prm.MAX_HP).total;
        e.mp = Math.random() * e.prm(Prm.MAX_MP).total;
    }
    setEnemyInner(e) { }
}
Job._values = [];
Job.DEF_LVUP_EXP = 3;
(function (Job) {
    Job.しんまい = new class extends Job {
        constructor() {
            super({ uniqueName: "しんまい", info: ["ぺーぺー"],
                appearLv: 0, lvupExp: Job.DEF_LVUP_EXP,
                grow: () => [{ prm: Prm.MAX_HP, value: 2 }],
                learn: () => [Tec.二回殴る, Tec.HP自動回復, Tec.大いなる動き],
                canJobChange: (p) => true,
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.殴る, Tec.練気];
            };
        }
    };
    Job.格闘家 = new class extends Job {
        constructor() {
            super({ uniqueName: "格闘家", info: ["格闘攻撃を扱う職業"],
                appearLv: 1, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.STR, value: 1 }],
                learn: () => [Tec.格闘攻撃UP, Tec.カウンター, Tec.閻魔の笏],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.二回殴る, Tec.人狼剣];
            };
        }
    };
    Job.剣士 = new class extends Job {
        constructor() {
            super({ uniqueName: "剣士", info: ["格闘攻撃を扱う職業"],
                appearLv: 5, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.STR, value: 1 }],
                learn: () => [Tec.人狼剣, Tec.急所],
                canJobChange: (p) => p.isMasteredJob(Job.格闘家),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.二回殴る, Tec.人狼剣, Tec.急所];
            };
        }
    };
    Job.魔法使い = new class extends Job {
        constructor() {
            super({ uniqueName: "魔法使い", info: ["魔法攻撃を扱う職業"],
                appearLv: 1, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.MAG, value: 1 }],
                learn: () => [Tec.ヴァハ, Tec.MP自動回復, Tec.エヴィン,],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.ヴァハ, Tec.ヴァハ, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.天使 = new class extends Job {
        constructor() {
            super({ uniqueName: "天使", info: ["回復に優れる"],
                appearLv: 8, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.LIG, value: 1 }],
                learn: () => [Tec.天籟, Tec.ばんそうこう],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.天籟, Tec.ばんそうこう, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.暗黒戦士 = new class extends Job {
        constructor() {
            super({ uniqueName: "暗黒戦士", info: ["自分の身を削り強力な攻撃を放つ"],
                appearLv: 8, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.DRK, value: 1 }],
                learn: () => [Tec.暗黒剣, Tec.ポイズンバタフライ],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.暗黒剣, Tec.暗黒剣, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.スネイカー = new class extends Job {
        constructor() {
            super({ uniqueName: "スネイカー", info: ["全体攻撃に長ける"],
                appearLv: 20, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.CHN, value: 1 }],
                learn: () => [Tec.スネイク, Tec.TP自動回復],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.スネイク, Tec.スネイク, Tec.TP自動回復, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.ダウザー = new class extends Job {
        constructor() {
            super({ uniqueName: "ダウザー", info: ["全体攻撃に長ける"],
                appearLv: 30, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.PST, value: 1 }],
                learn: () => [Tec.念力, Tec.念],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.念力, Tec.念, Tec.念, Tec.念, Tec.念, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.ガンマン = new class extends Job {
        constructor() {
            super({ uniqueName: "ガンマン", info: ["銃攻撃は命中率が低いものの", "それを補う手数の多さを持つ"],
                appearLv: 30, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.GUN, value: 1 }],
                learn: () => [Tec.撃つ, Tec.二丁拳銃],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.撃つ, Tec.撃つ, Tec.撃つ, Tec.二丁拳銃, Tec.二丁拳銃, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.アーチャー = new class extends Job {
        constructor() {
            super({ uniqueName: "アーチャー", info: ["致命の一撃を放つ"],
                appearLv: 30, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [{ prm: Prm.ARR, value: 1 }],
                learn: () => [Tec.射る, Tec.インドラ],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.射る, Tec.射る, Tec.射る, Tec.射る, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
})(Job || (Job = {}));
