import { PUnit, Prm, Unit } from "./unit.js";
import { Tec, ActiveTec, PassiveTec } from "./tec.js";
import { Job } from "./job.js";



export abstract class Player{
    private static _values:Player[] = [];
    static values():ReadonlyArray<Player>{return this._values;}
    private static _valueOf:{[key:string]:Player} = {};
    static valueOf(uniqueName:string):Player|undefined{
        return this._valueOf[ uniqueName ];
    }

    private _ins:PUnit;
    get ins(){
        if(!this._ins){
            this._ins = this.create();
        }
        return this._ins;
    }

    constructor(public readonly uniqueName:string){
        this.toString = ()=>this.uniqueName;

        Player._values.push(this);
    }
    
    abstract createInner(p:PUnit):void;

    create():PUnit{
        let res = new PUnit(this);

        res.name = this.toString();
        res.exists = true;
        res.dead = false;
        res.prm(Prm.MAX_MP).base = Unit.DEF_MAX_MP;
        res.prm(Prm.MAX_TP).base = Unit.DEF_MAX_TP;

        this.createInner(res);

        res.prm(Prm.HP).base = res.prm(Prm.MAX_HP).total();

        for(let tec of res.tecs){
            res.setMasteredTec(tec, true);
        }

        res.setJobLv( res.job, 1 );

        return res;
    }


    static readonly empty = new class extends Player{
        constructor(){super("");}
        createInner(p:PUnit){
            p.exists = false;
        }
    };
    static readonly          ルイン = new class extends Player{
        constructor(){super("ルイン");}
        createInner(p:PUnit){
            p.job = Job.しんまい;
            p.prm(Prm.MAX_HP).base = 30;
            p.prm(Prm.STR).base = 3;

            p.tecs = [
                ActiveTec.殴る,
                PassiveTec.HP自動回復,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
    static readonly          ピアー = new class extends Player{
        constructor(){super("ピアー");}
        createInner(p:PUnit){
            p.job = Job.魔法使い;
            p.prm(Prm.MAX_HP).base = 20;
            p.prm(Prm.STR).base = 2;
            p.prm(Prm.MAG).base = 6;
            
            p.tecs = [
                ActiveTec.殴る,
                ActiveTec.マジカルパンチ,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
    static readonly          test1 = new class extends Player{
        constructor(){super("test1");}
        createInner(p:PUnit){
            p.prm(Prm.MAX_HP).base = 20;
            p.prm(Prm.STR).base = 2;
            p.prm(Prm.MAG).base = 4;
            
            p.tecs = [
                ActiveTec.グレートウォール,
                ActiveTec.ヴァハ,
                ActiveTec.殴る,
            ];
        }
    };
    static readonly          test2 = new class extends Player{
        constructor(){super("test2");}
        createInner(p:PUnit){
            p.prm(Prm.MAX_HP).base = 20;
            p.prm(Prm.STR).base = 2;
            p.prm(Prm.MAG).base = 4;
            
            p.tecs = [
                ActiveTec.グレートウォール,
                ActiveTec.ヴァハ,
                ActiveTec.殴る,
            ];
        }
    };
}