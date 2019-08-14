import { Force, Dmg, Action } from "./force.js";
import { Unit } from "./unit.js";
import { Num, Mix } from "./mix.js";
import { Item } from "./item.js";
import { ActiveTec, TecType } from "./tec.js";
import { Condition } from "./condition.js";
import { Util, PlayData } from "./util.js";


export class EqPos{
    private static _values:EqPos[] = [];
    static values(){return this._values;}

    private _eqs:Eq[];
    get eqs():ReadonlyArray<Eq>{
        if(!this._eqs){
            this._eqs = Eq.values().filter(eq=> eq.pos === this);
        }
        return this._eqs;
    }

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


export abstract class Eq implements Force, Num{
    private static _values:Eq[] = [];
    static values(){return this._values;}

    private static _valueOf:Map<string,Eq>;
    static valueOf(uniqueName:string):Eq|undefined{
        if(!this._valueOf){
            this._valueOf = new Map<string,Eq>();

            for(let eq of this.values()){
                this._valueOf.set(eq.uniqueName, eq);
            }
        }
        return this._valueOf.get(uniqueName);
    }

    private static _posValues:Map<EqPos,Eq[]>;
    static posValues(pos:EqPos):ReadonlyArray<Eq>{
        if(!this._posValues){
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

    readonly uniqueName:string;
    readonly info:string[];
    readonly pos:EqPos;
    /**敵が装備し始めるレベル. */
    readonly appearLv:number;
    
    get mix():Mix|undefined{return this._mix ? this._mix : (this._mix = this.createMix());}
    private _mix:Mix|undefined;
    protected createMix():Mix|undefined{return undefined;}

    num = 0;
    totalGetNum = 0;
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    protected constructor(args:{
        uniqueName:string,
        info:string[],
        pos:EqPos,
        lv:number,
    }){
    // private constructor(name:string, info:string[], pos:EqPos, appearLv:number){
        this.uniqueName = args.uniqueName;
        this.toString = ()=>this.uniqueName;
        this.info = args.info;
        this.pos = args.pos;
        this.appearLv = args.lv;

        Eq._values.push(this);
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    equip(unit:Unit){}
    battleStart(unit:Unit){}
    phaseStart(unit:Unit){}
    beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    afterDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}

    add(v:number){
        Num.add(this, v);

        PlayData.gotAnyEq = true;
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
}


export namespace Eq{
    //--------------------------------------------------------------------------
    //
    //頭
    //
    //--------------------------------------------------------------------------
    export const                         髪 = new class extends Eq{
        constructor(){super({uniqueName:"髪", info:["髪a","髪b"], 
                                pos:EqPos.頭, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //武
    //
    //--------------------------------------------------------------------------
    export const                         恋人 = new class extends Eq{
        constructor(){super({uniqueName:"恋人", info:["恋人info"],
                                pos:EqPos.武, lv:0});}
    }
    export const                         棒 = new class extends Eq{
        constructor(){super({uniqueName:"棒", info:["格闘攻撃+10x1.1"],
                                pos:EqPos.武, lv:20});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.格闘){
                dmg.pow.add += 10;
                dmg.pow.mul *= 1.1;
            }
        }
    }
    // export const                         忍者刀 = new class extends Eq{
    //     constructor(){super({uniqueName:"忍者刀", info:["格闘攻撃時稀に追加攻撃"],
    //                             pos:EqPos.武, lv:99});}
    //     createMix(){return new Mix({
    //         result:[this,1],
    //         materials:[[Item.石, 1]],
    //     });}
    // }
    //--------------------------------------------------------------------------
    //
    //盾
    //
    //--------------------------------------------------------------------------
    export const                         板 = new class extends Eq{
        constructor(){super({uniqueName:"板", info:[],
                                pos:EqPos.盾, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //体
    //
    //--------------------------------------------------------------------------
    export const                         襤褸切れ = new class extends Eq{
        constructor(){super({uniqueName:"襤褸切れ", info:[],
                                pos:EqPos.体, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //腰
    //
    //--------------------------------------------------------------------------
    export const                         ひも = new class extends Eq{
        constructor(){super({uniqueName:"ひも", info:[],
                                pos:EqPos.腰, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //腕
    //
    //--------------------------------------------------------------------------
    export const                         腕 = new class extends Eq{
        constructor(){super({uniqueName:"腕", info:[],
                                pos:EqPos.腕, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //手
    //
    //--------------------------------------------------------------------------
    export const                             手 = new class extends Eq{
            constructor(){super({uniqueName:"手", info:[],
                                    pos:EqPos.手, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //指
    //
    //--------------------------------------------------------------------------
    export const                         肩身の指輪 = new class extends Eq{
        constructor(){super({uniqueName:"肩身の指輪", info:[],
                                pos:EqPos.指, lv:0});}
    }
    //--------------------------------------------------------------------------
    //
    //脚
    //
    //--------------------------------------------------------------------------
    export const                         きれいな靴 = new class extends Eq{
        constructor(){super({uniqueName:"きれいな靴", info:[],
                                pos:EqPos.脚, lv:0});}
    }
    export const                         安全靴 = new class extends Eq{
        constructor(){super({uniqueName:"安全靴", info:["被攻撃時稀に＜盾＞化"],
                                pos:EqPos.脚, lv:40});}
        afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && Math.random() < 0.7){
                target.setCondition(Condition.盾, 1);
            }
        }
    }
}