import { EUnit, Prm } from "./unit.js";
import { Tec } from "./tec.js";
import { Player } from "./player.js";
import { EqPos, Eq } from "./eq.js";
import { choice } from "./undym/random.js";
/*
敵のLV毎のHP目安.
e.prm(Prm.MAX_HP).base = 3 + (lv * lv * 0.35);

lv max_hp
0 3
30 318
60 1263
90 2838
120 5043
150 7877
180 11343
210 15437
240 20163
270 25518
300 31502
330 38118
360 45363
390 53238
420 61742
450 70878
480 80643
510 91038
540 102063
570 113718
600 126002
630 138918
660 152463
690 166638
720 181443
750 196878
780 212943
810 229637
840 246962
870 264918
900 283503
930 302718
960 322563
990 343038
*/
export class Job {
    constructor(args) {
        this.args = args;
        Job._values.push(this);
        if (Job._valueOf.has(args.uniqueName)) {
            console.log(`!!Job already has uniqueName "${args.uniqueName}".`);
        }
        else {
            Job._valueOf.set(args.uniqueName, this);
        }
    }
    static get values() { return this._values; }
    static valueOf(uniqueName) { return this._valueOf.get(uniqueName); }
    static rndJob(lv) {
        for (let i = 0; i < 7; i++) {
            const job = choice(Job.values);
            if (job.appearLv <= lv) {
                return job;
            }
        }
        return Job.しんまい;
    }
    static rndSetEnemy(unit, lv) {
        this.rndJob(lv).setEnemy(unit, lv);
    }
    get uniqueName() { return this.args.uniqueName; }
    get info() { return this.args.info; }
    get appearLv() { return this.args.appearLv; }
    get lvupExp() { return this.args.lvupExp; }
    get growthPrms() {
        let res = [];
        for (const set of this.args.grow()) {
            res.push({ prm: set[0], value: set[1] });
        }
        return res;
    }
    get learningTecs() { return this.args.learn(); }
    canJobChange(p) { return this.args.canJobChange(p); }
    toString() { return this.args.uniqueName; }
    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
    get maxLv() { return 10; }
    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
    setEnemy(e, lv) {
        for (const prm of Prm.values()) {
            const set = e.prm(prm);
            set.base = lv / 10 + (lv + 3) * Math.random();
            set.battle = 0;
            set.eq = 0;
        }
        e.name = this.toString();
        e.job = this;
        e.exists = true;
        e.dead = false;
        e.ai = EUnit.DEF_AI;
        e.prm(Prm.LV).base = lv;
        e.prm(Prm.EXP).base = lv + 1;
        e.yen = lv + 1;
        e.prm(Prm.MAX_HP).base = 3 + (lv * lv * 0.35);
        e.prm(Prm.MAX_MP).base = 1 + lv / 20 + Math.random() * lv / 5;
        e.prm(Prm.MAX_TP).base = 1 + lv / 20 + Math.random() * lv / 5;
        e.tp = 0;
        e.ep = 0;
        for (const pos of EqPos.values()) {
            e.setEq(pos, Eq.rnd(pos, lv));
        }
        e.clearAllCondition();
        this.setEnemyInner(e);
        e.equip();
        e.hp = e.prm(Prm.MAX_HP).total;
        e.mp = Math.random() * (e.prm(Prm.MAX_MP).total + 1);
    }
    setEnemyInner(e) { }
}
Job._values = [];
Job._valueOf = new Map();
Job.DEF_LVUP_EXP = 5;
(function (Job) {
    Job.しんまい = new class extends Job {
        constructor() {
            super({ uniqueName: "しんまい", info: "ぺーぺー",
                appearLv: 0, lvupExp: Job.DEF_LVUP_EXP,
                grow: () => [[Prm.MAX_HP, 2]],
                learn: () => [Tec.二回殴る, Tec.HP自動回復, Tec.大いなる動き],
                canJobChange: (p) => true,
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.殴る, Tec.練気];
            };
        }
    };
    Job.先輩 = new class extends Job {
        constructor() {
            super({ uniqueName: "先輩", info: "進化したしんまい",
                appearLv: 15, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.MAX_HP, 2]],
                learn: () => [Tec.癒しの風, Tec.我慢],
                canJobChange: (p) => p.isMasteredJob(Job.しんまい) && p.prm(Prm.LV).base >= 15,
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.HP自動回復, Tec.練気];
            };
        }
    };
    Job.常務 = new class extends Job {
        constructor() {
            super({ uniqueName: "常務", info: "",
                appearLv: 40, lvupExp: Job.DEF_LVUP_EXP * 4,
                grow: () => [[Prm.MAX_HP, 2]],
                learn: () => [Tec.いやらしの風, Tec.風],
                canJobChange: (p) => p.isMasteredJob(Job.先輩),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.癒しの風, Tec.HP自動回復, Tec.練気];
                e.prm(Prm.MAX_HP).base *= 1.5;
            };
        }
    };
    Job.格闘家 = new class extends Job {
        constructor() {
            super({ uniqueName: "格闘家", info: "格闘攻撃を扱う職業",
                appearLv: 1, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.STR, 1]],
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
            super({ uniqueName: "剣士", info: "",
                appearLv: 5, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.STR, 1]],
                learn: () => [Tec.人狼剣, Tec.急所],
                canJobChange: (p) => p.isMasteredJob(Job.格闘家),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.二回殴る, Tec.人狼剣, Tec.急所];
            };
        }
    };
    Job.騎士 = new class extends Job {
        constructor() {
            super({ uniqueName: "騎士", info: "",
                appearLv: 35, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.STR, 1], [Prm.LIG, 1]],
                learn: () => [Tec.聖剣],
                canJobChange: (p) => p.isMasteredJob(Job.剣士) && p.isMasteredJob(Job.天使),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.殴る, Tec.衛生, Tec.ばんそうこう, Tec.聖剣, Tec.聖剣, Tec.天籟];
            };
        }
    };
    Job.魔法使い = new class extends Job {
        constructor() {
            super({ uniqueName: "魔法使い", info: "魔法攻撃を扱う職業",
                appearLv: 1, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.MAG, 1]],
                learn: () => [Tec.ヴァハ, Tec.MP自動回復, Tec.ジョンD],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.ヴァハ, Tec.ヴァハ, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.ウィザード = new class extends Job {
        constructor() {
            super({ uniqueName: "ウィザード", info: "魔法攻撃を扱う職業",
                appearLv: 50, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.MAG, 1]],
                learn: () => [Tec.魔法攻撃UP, Tec.エヴィン, Tec.ルー],
                canJobChange: (p) => p.isMasteredJob(Job.魔法使い),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.ヴァハ, Tec.ヴァハ, Tec.ヴァハ, Tec.ヴァハ, Tec.エヴィン, Tec.エヴィン, Tec.殴る];
            };
        }
    };
    Job.天使 = new class extends Job {
        constructor() {
            super({ uniqueName: "天使", info: "回復に優れる",
                appearLv: 8, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.LIG, 1]],
                learn: () => [Tec.天籟, Tec.ばんそうこう, Tec.ユグドラシル],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.天籟, Tec.ばんそうこう, Tec.天籟, Tec.天籟, Tec.殴る, Tec.ユグドラシル];
            };
        }
    };
    Job.女神 = new class extends Job {
        constructor() {
            super({ uniqueName: "女神", info: "",
                appearLv: 40, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.LIG, 1]],
                learn: () => [Tec.ひんやりゼリー, Tec.衛生],
                canJobChange: (p) => p.isMasteredJob(Job.天使),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.天籟, Tec.衛生, Tec.ばんそうこう, Tec.ばんそうこう, Tec.ひんやりゼリー, Tec.殴る];
                e.prm(Prm.LIG).base *= 1.5;
            };
        }
    };
    Job.暗黒戦士 = new class extends Job {
        constructor() {
            super({ uniqueName: "暗黒戦士", info: "自分の身を削り強力な攻撃を放つ",
                appearLv: 8, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.DRK, 1]],
                learn: () => [Tec.暗黒剣, Tec.ポイズンバタフライ, Tec.自爆],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.暗黒剣, Tec.暗黒剣, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.ヴァンパイア = new class extends Job {
        constructor() {
            super({ uniqueName: "ヴァンパイア", info: "",
                appearLv: 40, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.DRK, 1]],
                learn: () => [Tec.吸血, Tec.吸心, Tec.VBS],
                canJobChange: (p) => p.isMasteredJob(Job.暗黒戦士),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.暗黒剣, Tec.暗黒剣, Tec.吸血, Tec.吸心, Tec.吸心, Tec.吸心, Tec.殴る, Tec.殴る, Tec.殴る];
                e.prm(Prm.DRK).base *= 1.5;
            };
        }
    };
    Job.阿修羅 = new class extends Job {
        constructor() {
            super({ uniqueName: "阿修羅", info: "",
                appearLv: 80, lvupExp: Job.DEF_LVUP_EXP * 4,
                grow: () => [[Prm.DRK, 1]],
                learn: () => [Tec.宵闇, Tec.影の鎧],
                canJobChange: (p) => p.isMasteredJob(Job.ヴァンパイア),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.暗黒剣, Tec.暗黒剣, Tec.吸血, Tec.殴る, Tec.宵闇];
            };
        }
    };
    Job.ダークナイト = new class extends Job {
        constructor() {
            super({ uniqueName: "ダークナイト", info: "",
                appearLv: 50, lvupExp: Job.DEF_LVUP_EXP * 4,
                grow: () => [[Prm.STR, 2], [Prm.DRK, 2]],
                learn: () => [],
                canJobChange: (p) => p.isMasteredJob(Job.ヴァンパイア) && p.isMasteredJob(Job.剣士),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.インドラ, Tec.撃つ, Tec.暗黒剣, Tec.暗黒剣, Tec.吸血, Tec.殴る, Tec.宵闇];
            };
        }
    };
    Job.スネイカー = new class extends Job {
        constructor() {
            super({ uniqueName: "スネイカー", info: "蛇を虐待してる",
                appearLv: 20, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.CHN, 1]],
                learn: () => [Tec.スネイク, Tec.TP自動回復, Tec.凍てつく波動],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.スネイク, Tec.スネイク, Tec.TP自動回復, Tec.殴る, Tec.殴る, Tec.凍てつく波動];
            };
        }
    };
    Job.蛇使い = new class extends Job {
        constructor() {
            super({ uniqueName: "蛇使い", info: "",
                appearLv: 40, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.CHN, 1]],
                learn: () => [Tec.コブラ, Tec.ハブ],
                canJobChange: (p) => p.isMasteredJob(Job.スネイカー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.スネイク, Tec.スネイク, Tec.TP自動回復, Tec.殴る, Tec.コブラ, Tec.コブラ, Tec.コブラ, Tec.ハブ];
            };
        }
    };
    Job.触手 = new class extends Job {
        constructor() {
            super({ uniqueName: "触手", info: "",
                appearLv: 40, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.CHN, 2], [Prm.PST, 2]],
                learn: () => [],
                canJobChange: (p) => p.isMasteredJob(Job.スネイカー) && p.isMasteredJob(Job.ダウザー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.スネイク, Tec.スネイク, Tec.TP自動回復, Tec.殴る, Tec.念力, Tec.念力, Tec.頭痛, Tec.凍てつく波動];
            };
        }
    };
    Job.ダウザー = new class extends Job {
        constructor() {
            super({ uniqueName: "ダウザー", info: "全体攻撃に長ける",
                appearLv: 30, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.PST, 1]],
                learn: () => [Tec.念力, Tec.念, Tec.メテオ],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.念力, Tec.念, Tec.念, Tec.念, Tec.念, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.エスパー = new class extends Job {
        constructor() {
            super({ uniqueName: "エスパー", info: "",
                appearLv: 50, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.PST, 1]],
                learn: () => [Tec.頭痛, Tec.やる気ゼロ, Tec.弱体液],
                canJobChange: (p) => p.isMasteredJob(Job.ダウザー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.念力, Tec.念, Tec.念, Tec.念, Tec.頭痛, Tec.殴る, Tec.殴る, Tec.やる気ゼロ];
            };
        }
    };
    Job.ハイパー = new class extends Job {
        constructor() {
            super({ uniqueName: "ハイパー", info: "",
                appearLv: 80, lvupExp: Job.DEF_LVUP_EXP * 4,
                grow: () => [[Prm.PST, 1]],
                learn: () => [Tec.ネガティヴフィードバック],
                canJobChange: (p) => p.isMasteredJob(Job.エスパー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.念力, Tec.念, Tec.念, Tec.念, Tec.念, Tec.殴る, Tec.弱体液, Tec.やる気ゼロ];
            };
        }
    };
    Job.ガンマン = new class extends Job {
        constructor() {
            super({ uniqueName: "ガンマン", info: "銃攻撃は命中率が低いもののそれを補う手数の多さを持つ",
                appearLv: 7, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.GUN, 1]],
                learn: () => [Tec.撃つ, Tec.二丁拳銃, Tec.あがらない雨],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.撃つ, Tec.撃つ, Tec.撃つ, Tec.二丁拳銃, Tec.二丁拳銃, Tec.殴る, Tec.殴る, Tec.殴る];
            };
        }
    };
    Job.砲撃手 = new class extends Job {
        constructor() {
            super({ uniqueName: "砲撃手", info: "",
                appearLv: 37, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.GUN, 1]],
                learn: () => [Tec.テーブルシールド, Tec.スコープ, Tec.ショットガン],
                canJobChange: (p) => p.isMasteredJob(Job.ガンマン),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.撃つ, Tec.撃つ, Tec.撃つ, Tec.二丁拳銃, Tec.二丁拳銃, Tec.殴る, Tec.殴る, Tec.テーブルシールド];
            };
        }
    };
    Job.アーチャー = new class extends Job {
        constructor() {
            super({ uniqueName: "アーチャー", info: "致命の一撃を放つ",
                appearLv: 10, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.ARR, 1]],
                learn: () => [Tec.射る, Tec.インドラ, Tec.キャンドラ],
                canJobChange: (p) => {
                    if (p.player === Player.スメラギ) {
                        return p.isMasteredJob(Job.格闘家);
                    }
                    else {
                        return p.isMasteredJob(Job.しんまい);
                    }
                },
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.射る, Tec.射る, Tec.射る, Tec.射る, Tec.殴る, Tec.殴る, Tec.インドラ];
            };
        }
    };
    Job.クピド = new class extends Job {
        constructor() {
            super({ uniqueName: "クピド", info: "",
                appearLv: 60, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.ARR, 1]],
                learn: () => [Tec.ヤクシャ, Tec.フェニックスアロー],
                canJobChange: (p) => p.isMasteredJob(Job.アーチャー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.射る, Tec.射る, Tec.射る, Tec.射る, Tec.インドラ, Tec.殴る, Tec.フェニックスアロー];
            };
        }
    };
    Job.測量士 = new class extends Job {
        constructor() {
            super({ uniqueName: "測量士", info: "",
                appearLv: 20, lvupExp: Job.DEF_LVUP_EXP * 2,
                grow: () => [[Prm.GUN, 1], [Prm.ARR, 1]],
                learn: () => [Tec.トランシット, Tec.カイゼルの目],
                canJobChange: (p) => p.isMasteredJob(Job.ガンマン) && p.isMasteredJob(Job.アーチャー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.撃つ, Tec.撃つ, Tec.撃つ, Tec.二丁拳銃, Tec.射る, Tec.射る, Tec.インドラ, Tec.殴る];
            };
        }
    };
    Job.探検家 = new class extends Job {
        constructor() {
            super({ uniqueName: "探検家", info: "",
                appearLv: 14, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.MAX_HP, 2]],
                learn: () => [Tec.便風, Tec.石肌],
                canJobChange: (p) => p.isMasteredJob(Job.格闘家) || p.isMasteredJob(Job.天使) || p.isMasteredJob(Job.スネイカー) || p.isMasteredJob(Job.ガンマン),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.撃つ, Tec.撃つ, Tec.射る, Tec.射る, Tec.HP自動回復, Tec.天籟, Tec.便風, Tec.石肌];
            };
        }
    };
    Job.探求家 = new class extends Job {
        constructor() {
            super({ uniqueName: "探求家", info: "",
                appearLv: 14, lvupExp: Job.DEF_LVUP_EXP * 3,
                grow: () => [[Prm.MAX_HP, 2]],
                learn: () => [Tec.保湿クリーム],
                canJobChange: (p) => p.isMasteredJob(Job.魔法使い) || p.isMasteredJob(Job.暗黒戦士) || p.isMasteredJob(Job.ダウザー) || p.isMasteredJob(Job.アーチャー),
            });
            this.setEnemyInner = (e) => {
                e.tecs = [Tec.撃つ, Tec.撃つ, Tec.射る, Tec.射る, Tec.ヴァハ, Tec.暗黒剣, Tec.保湿クリーム];
            };
        }
    };
})(Job || (Job = {}));
