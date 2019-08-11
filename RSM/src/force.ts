import { Unit, Prm } from "./unit.js";


export class Force{
    // private static _empty:Force;
    // static get empty():Force{return this._empty ? this._empty : (this._empty = new Force());}

    // equip(unit:Unit):void{}
    phaseStart(unit:Unit):void{}
    beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    afterDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
}


export class Dmg{
    //0     1
    //60    0.85
    //300   0.55
    //1,050 0.3
    //2,100 0.2125
    private static calcDefCut(def:number):number{
        return (3000.0 + def * 1) / (3000.0 + def * 10);
    }
    private static calcDmgElm(elm:{base:number, add:number, mul:number}){
        const res = (elm.base + elm.add) * elm.mul;
        return res > 0 ? res : 0;
    }
    /**攻撃力。*/
    pow:{base:number, add:number, mul:number};
    /**防御力。 */
    def:{base:number, add:number, mul:number};
    /**命中率.1が最大. */
    hit:{base:number, add:number, mul:number};
    /**絶対攻撃値。*/
    abs:{base:number, add:number, mul:number};
    /**calc()で出された結果のbak. */
    result = {value:0, isHit:false};

    constructor(args?:{
        pow?:number,
        mul?:number,
        hit?:number,
        def?:number,
        absPow?:number,
        absMul?:number,
    }){
        this.clear();

        if(args){
            if(args.pow)    {this.pow.base = args.pow;}
            if(args.mul)    {this.pow.mul   = args.mul;}
            if(args.hit)    {this.hit.base = args.hit;}
            if(args.def)    {this.def.base = args.def;}
            if(args.absPow) {this.abs.base = args.absPow;}
            if(args.absMul) {this.abs.mul   = args.absMul;}
        }
    }

    clear(){
        this.pow = {
            base:0,
            add:0,
            mul:1,
        };
        this.def = {
            base:0,
            add:0,
            mul:1,
        };
        this.hit = {
            base:1,
            add:0,
            mul:1,
        };
        this.abs = {
            base:0,
            add:0,
            mul:1,
        };

        this.result.value = 0;
        this.result.isHit = false;
    }

    calc():{value:number, isHit:boolean}{
        const _pow = Dmg.calcDmgElm( this.pow );
        const _def = Dmg.calcDmgElm( this.def );
        const _hit = Dmg.calcDmgElm( this.hit );
        const _abs = Dmg.calcDmgElm( this.abs );

        let value = 0;

        let isHit = Math.random() < _hit;
        if(isHit){
            value = _pow * Dmg.calcDefCut(_def);
        }else{
            value = 0;
        }

        if(_abs > 0){
            isHit = true;
            value += _abs;
        }

        this.result.value = value > 0 ? value|0 : 0;
        this.result.isHit = isHit;
        return this.result;
    }
}


export abstract class Action{
    abstract use(attacker:Unit, targets:Unit[]):void;
}




export class Targeting{
    static readonly SELECT      = 1 << 0;
    static readonly SELF        = 1 << 1;
    static readonly ALL         = 1 << 2;
    static readonly WITH_DEAD   = 1 << 3;
    static readonly ONLY_DEAD   = 1 << 4;
    static readonly WITH_FRIEND = 1 << 5;
    static readonly ONLY_FRIEND = 1 << 6;

    static filter(targetings:number, attacker:Unit, targets:Unit[]):Unit[]{
        if(targetings & Targeting.SELF){return [attacker];}

        targets = targets.filter(t=> t.exists);
    
             if(targetings & Targeting.WITH_DEAD){}
        else if(targetings & Targeting.ONLY_DEAD){targets = targets.filter(t=> t.dead);}
        else                                     {targets = targets.filter(t=> !t.dead);}

             if(targetings & Targeting.WITH_FRIEND){}
        else if(targetings & Targeting.ONLY_FRIEND){targets = targets.filter(t=> t.isFriend(attacker));}
        else                                       {targets = targets.filter(t=> !t.isFriend(attacker));}
    
        if((targetings & Targeting.SELECT) 
            && targets.length > 0)
        {
            return [targets[0]];
        }
    
        return targets;
    }
}