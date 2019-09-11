import { PUnit, Prm, Unit } from "./unit.js";
import { Tec, PassiveTec } from "./tec.js";
import { Job } from "./job.js";



export abstract class Player{
    private static _values:Player[] = [];
    static values():ReadonlyArray<Player>{return this._values;}
    private static _valueOf = new Map<string,Player>();
    static valueOf(uniqueName:string):Player|undefined{
        return this._valueOf.get( uniqueName );
    }

    private _ins:PUnit;
    get ins(){
        if(!this._ins){
            this._ins = this.create();
        }
        return this._ins;
    }

    member = false;

    constructor(public readonly uniqueName:string){
        this.toString = ()=>this.uniqueName;

        Player._values.push(this);
        Player._valueOf.set( this.uniqueName, this );
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

        res.prm(Prm.HP).base = res.prm(Prm.MAX_HP).total;

        for(let tec of res.tecs){
            res.setMasteredTec(tec, true);
        }

        res.setJobLv( res.job, 1 );

        return res;
    }
    /**合成等でのプレイヤーの加入処理。 */
    join(){
        this.member = true;
        for(let i = 0; i < Unit.players.length; i++){
            if(Unit.players[i].player === Player.empty){
                Unit.setPlayer(i, this);
                break;
            }
        }
    }


}


export namespace Player{
    export const             empty = new class extends Player{
        constructor(){super("empty");}
        createInner(p:PUnit){
            p.exists = false;
        }
    };
    export const             スメラギ = new class extends Player{
        constructor(){super("スメラギ");}
        createInner(p:PUnit){
            p.job = Job.しんまい;
            p.prm(Prm.MAX_HP).base = 20;
            p.prm(Prm.STR).base = 2;

            p.tecs = [
                Tec.殴る,
                Tec.empty,
                Tec.empty,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
    export const             よしこ = new class extends Player{
        constructor(){super("よしこ");}
        createInner(p:PUnit){
            p.job = Job.魔法使い;
            p.prm(Prm.MAX_HP).base = 16;
            p.prm(Prm.STR).base = 2;
            p.prm(Prm.MAG).base = 4;
            
            p.tecs = [
                Tec.殴る,
                Tec.マジカルパンチ,
                Tec.empty,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
}