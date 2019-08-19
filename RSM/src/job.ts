import { EUnit, Prm, PUnit, Unit } from "./unit.js";
import { Tec } from "./tec.js";



export abstract class Job{
    private static _values:Job[] = [];
    static values():ReadonlyArray<Job>{return this._values;}
    private static _valueOf:Map<string,Job>;
    static valueOf(uniqueName:string):Job|undefined{
        if(!this._valueOf){
            this._valueOf = new Map<string,Job>();

            for(const job of this.values()){
                this._valueOf.set( job.uniqueName, job );
            }
        }
        return this._valueOf.get(uniqueName);
    }

    static readonly DEF_LVUP_EXP = 3;

    static rndJob(lv:number):Job{
        for(let job of Job.values()){
            if(job.appearLv <= lv){
                return job;
            }
        }

        return Job.しんまい;
    }

    readonly uniqueName:string;
    readonly info:string[];
    readonly appearLv:number;
    readonly lvupExp:number;
    readonly getGrowthPrms:()=>{prm:Prm, value:number}[];
    readonly getLearningTecs:()=>Tec[];
    readonly canJobChange:(p:PUnit)=>boolean;

    protected constructor(args:{
        uniqueName:string,
        info:string[],
        appearLv:number,
        lvupExp:number,
        grow:()=>{prm:Prm, value:number}[],
        learn:()=>Tec[],
        canJobChange:(p:PUnit)=>boolean,
    }){
        this.uniqueName = args.uniqueName;
        this.info = args.info;
        this.toString = ()=>this.uniqueName;
        this.appearLv = args.appearLv;
        this.lvupExp = args.lvupExp;
        this.getGrowthPrms = args.grow;
        this.getLearningTecs = args.learn;
        this.canJobChange = args.canJobChange;

        Job._values.push(this);
    }

    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
    
    getMaxLv(){return 10;}
    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
    setEnemy(e:EUnit, lv:number){

        for(const prm of Prm.values()){
            const set = e.prm(prm);
            set.base = ( lv / 10 +  (lv+3) * Math.random() )|0;
            set.battle = 0;
            set.eq = 0;
        }

        e.name = this.toString();
        e.exists = true;
        e.dead = false;
        e.ai = EUnit.DEF_AI;
        
        e.prm(Prm.LV).base = lv;
        e.prm(Prm.EXP).base = (lv * (0.75 + Math.random() * 0.5) + 1)|0;
        e.yen = lv + 1;

        e.prm(Prm.MAX_HP).base = 3 + (lv * lv * 0.55);

        e.prm(Prm.MAX_MP).base = Unit.DEF_MAX_MP;
        e.prm(Prm.MAX_TP).base = Unit.DEF_MAX_TP;

        e.tp = 0;
        e.ep = 0;
        
        
        this.setEnemyInner(e);

        e.hp = e.prm(Prm.MAX_HP).total;
        e.mp = Math.random() * e.prm(Prm.MAX_MP).total;
    }

    setEnemyInner(e:EUnit){}

    //------------------------------------------------------------------
    //
    //
    //
    //------------------------------------------------------------------
}


export namespace Job{
    export const                         しんまい = new class extends Job{
        constructor(){super({uniqueName:"しんまい", info:["ぺーぺー"],
                                appearLv:0, lvupExp:Job.DEF_LVUP_EXP,
                                grow:()=> [{prm:Prm.MAX_HP, value:2}],
                                learn:()=> [Tec.二回殴る, Tec.HP自動回復, Tec.大いなる動き],
                                canJobChange:(p:PUnit)=>true,
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.殴る, Tec.練気];

        }
    };
    export const                         先輩 = new class extends Job{
        constructor(){super({uniqueName:"先輩", info:["進化したしんまい"],
                                appearLv:40, lvupExp:Job.DEF_LVUP_EXP * 3,
                                grow:()=> [{prm:Prm.MAX_HP, value:2}],
                                learn:()=> [Tec.癒しの風, Tec.我慢],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.HP自動回復, Tec.練気];

        }
    };
    export const                         格闘家 = new class extends Job{
        constructor(){super({uniqueName:"格闘家", info:["格闘攻撃を扱う職業"],
                                appearLv:1, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.STR, value:1}],
                                learn:()=> [Tec.格闘攻撃UP, Tec.カウンター, Tec.閻魔の笏],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.二回殴る, Tec.人狼剣];
        }
    };
    export const                         剣士 = new class extends Job{
        constructor(){super({uniqueName:"剣士", info:[""],
                                appearLv:5, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.STR, value:1}],
                                learn:()=> [Tec.人狼剣, Tec.急所],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.格闘家),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.殴る, Tec.殴る, Tec.殴る, Tec.二回殴る, Tec.人狼剣, Tec.急所];
        }
    };
    export const                         魔法使い = new class extends Job{
        constructor(){super({uniqueName:"魔法使い", info:["魔法攻撃を扱う職業"],
                                appearLv:1, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.MAG, value:1}],
                                learn:()=> [Tec.ヴァハ, Tec.MP自動回復, Tec.ジョンD],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.ヴァハ, Tec.ヴァハ, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
    export const                         ウィザード = new class extends Job{
        constructor(){super({uniqueName:"ウィザード", info:["魔法攻撃を扱う職業"],
                                appearLv:50, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.MAG, value:1}],
                                learn:()=> [Tec.魔法攻撃UP, Tec.エヴィン, Tec.ルー],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.魔法使い),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.ヴァハ, Tec.ヴァハ,Tec.ヴァハ,Tec.ヴァハ, Tec.エヴィン, Tec.エヴィン, Tec.殴る];
        }
    };
    export const                         天使 = new class extends Job{
        constructor(){super({uniqueName:"天使", info:["回復に優れる"],
                                appearLv:8, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.LIG, value:1}],
                                learn:()=> [Tec.天籟, Tec.ばんそうこう, Tec.ユグドラシル],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.天籟, Tec.ばんそうこう, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
    export const                         女神 = new class extends Job{
        constructor(){super({uniqueName:"女神", info:[""],
                                appearLv:40, lvupExp:Job.DEF_LVUP_EXP * 3,
                                grow:()=> [{prm:Prm.LIG, value:1}],
                                learn:()=> [Tec.ひんやりゼリー, Tec.衛生],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.天使),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.天籟, Tec.衛生, Tec.ばんそうこう, Tec.ばんそうこう, Tec.ひんやりゼリー, Tec.殴る];
            e.prm(Prm.LIG).base *= 1.5;
        }
    };
    export const                         暗黒戦士 = new class extends Job{
        constructor(){super({uniqueName:"暗黒戦士", info:["自分の身を削り強力な攻撃を放つ"],
                                appearLv:8, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.DRK, value:1}],
                                learn:()=> [Tec.暗黒剣, Tec.ポイズンバタフライ, Tec.自爆],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.暗黒剣, Tec.暗黒剣, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
    export const                         ヴァンパイア = new class extends Job{
        constructor(){super({uniqueName:"ヴァンパイア", info:[""],
                                appearLv:40, lvupExp:Job.DEF_LVUP_EXP * 3,
                                grow:()=> [{prm:Prm.DRK, value:1}],
                                learn:()=> [Tec.吸血, Tec.吸心, Tec.VBS],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.暗黒戦士),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.暗黒剣, Tec.暗黒剣, Tec.吸血, Tec.吸心, Tec.吸心, Tec.吸心, Tec.殴る, Tec.殴る, Tec.殴る];
            e.prm(Prm.DRK).base *= 1.5;
        }
    };
    export const                         スネイカー = new class extends Job{
        constructor(){super({uniqueName:"スネイカー", info:["全体攻撃に長ける"],
                                appearLv:20, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.CHN, value:1}],
                                learn:()=> [Tec.スネイク, Tec.TP自動回復, Tec.凍てつく波動],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.スネイク, Tec.スネイク, Tec.TP自動回復, Tec.殴る, Tec.殴る];
        }
    };
    export const                         蛇使い = new class extends Job{
        constructor(){super({uniqueName:"蛇使い", info:[""],
                                appearLv:40, lvupExp:Job.DEF_LVUP_EXP * 3,
                                grow:()=> [{prm:Prm.CHN, value:1}],
                                learn:()=> [Tec.コブラ, Tec.ハブ],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.スネイカー),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.スネイク, Tec.スネイク, Tec.TP自動回復, Tec.殴る, Tec.コブラ, Tec.コブラ, Tec.コブラ, Tec.ハブ];
        }
    };
    export const                         ダウザー = new class extends Job{
        constructor(){super({uniqueName:"ダウザー", info:["全体攻撃に長ける"],
                                appearLv:30, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.PST, value:1}],
                                learn:()=> [Tec.念力, Tec.念, Tec.メテオ],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.念力, Tec.念, Tec.念, Tec.念, Tec.念, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
    export const                         エスパー = new class extends Job{
        constructor(){super({uniqueName:"エスパー", info:[""],
                                appearLv:50, lvupExp:Job.DEF_LVUP_EXP * 3,
                                grow:()=> [{prm:Prm.PST, value:1}],
                                learn:()=> [Tec.やる気ゼロ],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.ダウザー),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.念力, Tec.念, Tec.念, Tec.念, Tec.念, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
    export const                         ガンマン = new class extends Job{
        constructor(){super({uniqueName:"ガンマン", info:["銃攻撃は命中率が低いものの","それを補う手数の多さを持つ"],
                                appearLv:7, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.GUN, value:1}],
                                learn:()=> [Tec.撃つ, Tec.二丁拳銃, Tec.あがらない雨],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.撃つ, Tec.撃つ, Tec.撃つ, Tec.二丁拳銃, Tec.二丁拳銃, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
    export const                         アーチャー = new class extends Job{
        constructor(){super({uniqueName:"アーチャー", info:["致命の一撃を放つ"],
                                appearLv:10, lvupExp:Job.DEF_LVUP_EXP * 2,
                                grow:()=> [{prm:Prm.ARR, value:1}],
                                learn:()=> [Tec.射る, Tec.インドラ, Tec.キャンドラ],
                                canJobChange:(p:PUnit)=>p.isMasteredJob(Job.しんまい),
        });}
        setEnemyInner   = (e:EUnit)=>{
            e.tecs = [Tec.射る, Tec.射る, Tec.射る, Tec.射る, Tec.殴る, Tec.殴る, Tec.殴る];
        }
    };
}