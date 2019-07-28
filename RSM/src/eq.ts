import { Force, Dmg, Action } from "./force.js";
import { Unit } from "./unit.js";


export class EqPos{
    private static _values:EqPos[] = [];
    static values(){return this._values;}


    private constructor(name:string){
        this.toString = ()=>name;
        EqPos._values.push(this);
    }

    static readonly 頭 = new EqPos("頭");
    static readonly 武 = new EqPos("武");
    static readonly 盾 = new EqPos("盾");
    static readonly 体 = new EqPos("体");
    static readonly 腰 = new EqPos("腰");
    static readonly 腕 = new EqPos("腕");
    static readonly 手 = new EqPos("手");
    static readonly 指 = new EqPos("指");
    static readonly 脚 = new EqPos("脚");
}


export abstract class Eq implements Force{
    private static _values:Eq[] = [];
    static values(){return this._values;}

    private static _posValues:Map<EqPos,Eq[]>;
    static posValues(pos:EqPos):ReadonlyArray<Eq>{
        if(this._posValues === undefined){
            this._posValues = new Map<EqPos,Eq[]>();

            for(let p of EqPos.values()){
                this._posValues.set(p, []);
            }

            for(let eq of this.values()){
                (this._posValues.get(eq.pos) as Eq[]).push(eq);
            }
        }
        return this._posValues.get(pos) as Eq[];
    }

    /**各装備箇所のデフォルト装備を返す.*/
    static getDef(pos:EqPos):Eq{
        if(pos === EqPos.頭){return this.髪;}
        if(pos === EqPos.武){return this.恋人;}
        if(pos === EqPos.盾){return this.板;}
        if(pos === EqPos.体){return this.襤褸切れ;}
        if(pos === EqPos.腰){return this.ひも;}
        if(pos === EqPos.腕){return this.腕;}
        if(pos === EqPos.手){return this.手;}
        if(pos === EqPos.指){return this.肩身の指輪;}
        if(pos === EqPos.脚){return this.きれいな靴;}

        return this.髪;
    }


    readonly info:string[];
    readonly pos:EqPos;
    /**敵が装備し始めるレベル. */
    readonly appearLv:number;
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    private constructor(name:string, info:string[], pos:EqPos, appearLv:number){
        this.toString = ()=>name;
        this.info = info;
        this.pos = pos;

        Eq._values.push(this);
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    phaseStart(unit:Unit){}
    beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    afterDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    //--------------------------------------------------------------------------
    //
    //頭
    //
    //--------------------------------------------------------------------------
    static readonly          髪 = new class extends Eq{
        constructor(){super("髪", ["髪a","髪b"], 
            EqPos.頭,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //武
    //
    //--------------------------------------------------------------------------
    static readonly          恋人 = new class extends Eq{
        constructor(){super("恋人", ["恋人info"],
            EqPos.武,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //盾
    //
    //--------------------------------------------------------------------------
    static readonly          板 = new class extends Eq{
        constructor(){super("板", [],
            EqPos.盾,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //体
    //
    //--------------------------------------------------------------------------
    static readonly          襤褸切れ = new class extends Eq{
        constructor(){super("襤褸切れ", [],
            EqPos.体,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //腰
    //
    //--------------------------------------------------------------------------
    static readonly          ひも = new class extends Eq{
        constructor(){super("ひも", [],
            EqPos.腰,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //腕
    //
    //--------------------------------------------------------------------------
    static readonly          腕 = new class extends Eq{
        constructor(){super("腕", [],
            EqPos.腕,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //手
    //
    //--------------------------------------------------------------------------
    static readonly          手 = new class extends Eq{
        constructor(){super("手", [],
            EqPos.手,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //指
    //
    //--------------------------------------------------------------------------
    static readonly          肩身の指輪 = new class extends Eq{
        constructor(){super("肩身の指輪", [],
            EqPos.指,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //脚
    //
    //--------------------------------------------------------------------------
    static readonly          きれいな靴 = new class extends Eq{
        constructor(){super("きれいな靴", [],
            EqPos.脚,/*lv*/0);}
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
}