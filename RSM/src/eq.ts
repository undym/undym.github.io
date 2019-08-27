import { Force, Dmg, Action } from "./force.js";
import { Unit, Prm } from "./unit.js";
import { Num, Mix } from "./mix.js";
import { Item } from "./item.js";
import { ActiveTec, TecType } from "./tec.js";
import { Condition } from "./condition.js";
import { Util, PlayData } from "./util.js";
import { Battle } from "./battle.js";


export class EqPos{
    private static _values:EqPos[] = [];
    static values(){return this._values;}

    private static ordinalNow = 0;

    private _eqs:Eq[];
    get eqs():ReadonlyArray<Eq>{
        if(!this._eqs){
            this._eqs = Eq.values().filter(eq=> eq.pos === this);
        }
        return this._eqs;
    }

    readonly ordinal:number;

    private constructor(name:string){
        this.toString = ()=>name;

        this.ordinal = EqPos.ordinalNow++;

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

    private static _valueOf = new Map<string,Eq>();
    static valueOf(uniqueName:string):Eq|undefined{
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
        this.uniqueName = args.uniqueName;
        this.toString = ()=>this.uniqueName;
        this.info = args.info;
        this.pos = args.pos;
        this.appearLv = args.lv;

        Eq._values.push(this);
        Eq._valueOf.set( this.uniqueName, this );
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
    export const                         魔女のとんがり帽 = new class extends Eq{
        constructor(){super({uniqueName:"魔女のとんがり帽", info:["最大MP+50"], 
                                pos:EqPos.頭, lv:3});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 50;
        }
    }
    export const                         魔女の高級とんがり帽 = new class extends Eq{
        constructor(){super({uniqueName:"魔女の高級とんがり帽", info:["最大MP+100"], 
                                pos:EqPos.頭, lv:30});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 100;
        }
    }
    export const                         魔女の最高級とんがり帽 = new class extends Eq{
        constructor(){super({uniqueName:"魔女の最高級とんがり帽", info:["最大MP+150"], 
                                pos:EqPos.頭, lv:60});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 150;
        }
    }
    export const                         魔女の超最高級とんがり帽 = new class extends Eq{
        constructor(){super({uniqueName:"魔女の超最高級とんがり帽", info:["最大MP+200"], 
                                pos:EqPos.頭, lv:90});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 200;
        }
    }
    export const                         山男のとんかつ帽 = new class extends Eq{
        constructor(){super({uniqueName:"山男のとんかつ帽", info:["最大TP+50"], 
                                pos:EqPos.頭, lv:3});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_TP).eq += 50;
        }
    }
    export const                         山男の高級とんかつ帽 = new class extends Eq{
        constructor(){super({uniqueName:"山男の高級とんかつ帽", info:["最大TP+100"], 
                                pos:EqPos.頭, lv:30});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_TP).eq += 100;
        }
    }
    export const                         山男の最高級とんかつ帽 = new class extends Eq{
        constructor(){super({uniqueName:"山男の最高級とんかつ帽", info:["最大TP+150"], 
                                pos:EqPos.頭, lv:60});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_TP).eq += 150;
        }
    }
    export const                         山男の超最高級とんかつ帽 = new class extends Eq{
        constructor(){super({uniqueName:"山男の超最高級とんかつ帽", info:["最大TP+200"], 
                                pos:EqPos.頭, lv:90});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_TP).eq += 200;
        }
    }
    export const                         千里ゴーグル = new class extends Eq{
        constructor(){super({uniqueName:"千里ゴーグル", info:["銃・弓攻撃時稀にクリティカル"], 
                                pos:EqPos.頭, lv:120});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any(TecType.格闘) && Math.random() < 0.2){
                Util.msg.set("＞千里ゴーグル");
                dmg.pow.mul *= 1.5;
            }
        }   
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
        constructor(){super({uniqueName:"棒", info:["格闘攻撃x1.3"],
                                pos:EqPos.武, lv:20});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.格闘){
                dmg.pow.add += 2;
                dmg.pow.mul *= 1.3;
            }
        }
    }
    //再構成トンネル・財宝
    export const                         魔法の杖 = new class extends Eq{
        constructor(){super({uniqueName:"魔法の杖", info:["魔法+15"],
                                pos:EqPos.武, lv:40});}
        equip(unit:Unit){
            unit.prm(Prm.MAG).eq += 15;
        }
    }
    //shop
    export const                         う棒 = new class extends Eq{
        constructor(){super({uniqueName:"う棒", info:["力+3光+3"],
                                pos:EqPos.武, lv:7});}
        equip(unit:Unit){
            unit.prm(Prm.STR).eq += 3;
            unit.prm(Prm.LIG).eq += 3;
        }
    }
    //shop
    export const                         銅剣 = new class extends Eq{
        constructor(){super({uniqueName:"銅剣", info:["力+10光+10"],
                                pos:EqPos.武, lv:15});}
        equip(unit:Unit){
            unit.prm(Prm.STR).eq += 10;
            unit.prm(Prm.LIG).eq += 10;
        }
    }
    //shop
    export const                         鉄拳 = new class extends Eq{
        constructor(){super({uniqueName:"鉄拳", info:["力+30光+30"],
                                pos:EqPos.武, lv:35});}
        equip(unit:Unit){
            unit.prm(Prm.STR).eq += 30;
            unit.prm(Prm.LIG).eq += 30;
        }
    }
    //shop
    export const                         はがねの剣 = new class extends Eq{
        constructor(){super({uniqueName:"はがねの剣", info:["力+100光+100"],
                                pos:EqPos.武, lv:75});}
        equip(unit:Unit){
            unit.prm(Prm.STR).eq += 100;
            unit.prm(Prm.LIG).eq += 100;
        }
    }
    //shop
    export const                         杖 = new class extends Eq{
        constructor(){super({uniqueName:"杖", info:["魔+3闇+3"],
                                pos:EqPos.武, lv:7});}
        equip(unit:Unit){
            unit.prm(Prm.MAG).eq += 3;
            unit.prm(Prm.DRK).eq += 3;
        }
    }
    //shop
    export const                         スギの杖 = new class extends Eq{
        constructor(){super({uniqueName:"スギの杖", info:["魔+10闇+10"],
                                pos:EqPos.武, lv:15});}
        equip(unit:Unit){
            unit.prm(Prm.MAG).eq += 10;
            unit.prm(Prm.DRK).eq += 10;
        }
    }
    //shop
    export const                         ヒノキの杖 = new class extends Eq{
        constructor(){super({uniqueName:"ヒノキの杖", info:["魔+30闇+30"],
                                pos:EqPos.武, lv:35});}
        equip(unit:Unit){
            unit.prm(Prm.MAG).eq += 30;
            unit.prm(Prm.DRK).eq += 30;
        }
    }
    //shop
    export const                         漆の杖 = new class extends Eq{
        constructor(){super({uniqueName:"漆の杖", info:["魔+100闇+100"],
                                pos:EqPos.武, lv:75});}
        equip(unit:Unit){
            unit.prm(Prm.MAG).eq += 100;
            unit.prm(Prm.DRK).eq += 100;
        }
    }
    //shop
    export const                         木の鎖 = new class extends Eq{
        constructor(){super({uniqueName:"木の鎖", info:["鎖+3過+3"],
                                pos:EqPos.武, lv:7});}
        equip(unit:Unit){
            unit.prm(Prm.CHN).eq += 3;
            unit.prm(Prm.PST).eq += 3;
        }
    }
    //shop
    export const                         銅の鎖 = new class extends Eq{
        constructor(){super({uniqueName:"銅の鎖", info:["鎖+10過+10"],
                                pos:EqPos.武, lv:15});}
        equip(unit:Unit){
            unit.prm(Prm.CHN).eq += 10;
            unit.prm(Prm.PST).eq += 10;
        }
    }
    //shop
    export const                         鉄の鎖 = new class extends Eq{
        constructor(){super({uniqueName:"鉄の鎖", info:["鎖+30過+30"],
                                pos:EqPos.武, lv:35});}
        equip(unit:Unit){
            unit.prm(Prm.CHN).eq += 30;
            unit.prm(Prm.PST).eq += 30;
        }
    }
    //shop
    export const                         銀の鎖 = new class extends Eq{
        constructor(){super({uniqueName:"銀の鎖", info:["鎖+100過+100"],
                                pos:EqPos.武, lv:75});}
        equip(unit:Unit){
            unit.prm(Prm.CHN).eq += 100;
            unit.prm(Prm.PST).eq += 100;
        }
    }
    //shop
    export const                         パチンコ = new class extends Eq{
        constructor(){super({uniqueName:"パチンコ", info:["銃+3弓+3"],
                                pos:EqPos.武, lv:7});}
        equip(unit:Unit){
            unit.prm(Prm.GUN).eq += 3;
            unit.prm(Prm.ARR).eq += 3;
        }
    }
    //shop
    export const                         ボウガン = new class extends Eq{
        constructor(){super({uniqueName:"ボウガン", info:["銃+10弓+10"],
                                pos:EqPos.武, lv:15});}
        equip(unit:Unit){
            unit.prm(Prm.GUN).eq += 10;
            unit.prm(Prm.ARR).eq += 10;
        }
    }
    //shop
    export const                         投石器 = new class extends Eq{
        constructor(){super({uniqueName:"投石器", info:["銃+30弓+30"],
                                pos:EqPos.武, lv:35});}
        equip(unit:Unit){
            unit.prm(Prm.GUN).eq += 30;
            unit.prm(Prm.ARR).eq += 30;
        }
    }
    //shop
    export const                         大砲 = new class extends Eq{
        constructor(){super({uniqueName:"大砲", info:["銃+100弓+100"],
                                pos:EqPos.武, lv:75});}
        equip(unit:Unit){
            unit.prm(Prm.GUN).eq += 100;
            unit.prm(Prm.ARR).eq += 100;
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
    //shop
    export const                         銅板 = new class extends Eq{
        constructor(){super({uniqueName:"銅板", info:["防御値+50"],
                                pos:EqPos.盾, lv:12});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 50;
        }
    }
    //shop
    export const                         鉄板 = new class extends Eq{
        constructor(){super({uniqueName:"鉄板", info:["防御値+100"],
                                pos:EqPos.盾, lv:22});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 100;
        }
    }
    //shop
    export const                         鋼鉄板 = new class extends Eq{
        constructor(){super({uniqueName:"鋼鉄板", info:["防御値+200"],
                                pos:EqPos.盾, lv:32});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 200;
        }
    }
    //shop
    export const                         チタン板 = new class extends Eq{
        constructor(){super({uniqueName:"チタン板", info:["防御値+300"],
                                pos:EqPos.盾, lv:42});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 300;
        }
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
    export const                         草の服 = new class extends Eq{
        constructor(){super({uniqueName:"草の服", info:["最大HP+10"],
                                pos:EqPos.体, lv:15});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 10;}
    }
    export const                         布の服 = new class extends Eq{
        constructor(){super({uniqueName:"布の服", info:["最大HP+30"],
                                pos:EqPos.体, lv:35});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 30;}
    }
    export const                         皮の服 = new class extends Eq{
        constructor(){super({uniqueName:"皮の服", info:["最大HP+50"],
                                pos:EqPos.体, lv:55});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 50;}
    }
    export const                         木の鎧 = new class extends Eq{
        constructor(){super({uniqueName:"木の鎧", info:["最大HP+100"],
                                pos:EqPos.体, lv:95});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 100;}
    }
    export const                         青銅の鎧 = new class extends Eq{
        constructor(){super({uniqueName:"青銅の鎧", info:["最大HP+200"],
                                pos:EqPos.体, lv:125});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 200;}
    }
    export const                         鉄の鎧 = new class extends Eq{
        constructor(){super({uniqueName:"鉄の鎧", info:["最大HP+300"],
                                pos:EqPos.体, lv:145});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 300;}
    }
    export const                         鋼鉄の鎧 = new class extends Eq{
        constructor(){super({uniqueName:"鋼鉄の鎧", info:["最大HP+400"],
                                pos:EqPos.体, lv:160});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 400;}
    }
    export const                         銀の鎧 = new class extends Eq{
        constructor(){super({uniqueName:"銀の鎧", info:["最大HP+500"],
                                pos:EqPos.体, lv:180});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 500;}
    }
    export const                         金の鎧 = new class extends Eq{
        constructor(){super({uniqueName:"金の鎧", info:["最大HP+600"],
                                pos:EqPos.体, lv:200});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 600;}
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
    export const                         ゲルマンベルト = new class extends Eq{//黒平原財宝
        constructor(){super({uniqueName:"ゲルマンベルト", info:["攻撃+10%"],
                                pos:EqPos.腰, lv:50});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.pow.mul *= 1.1;
        }
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
    export const                         ミュータント = new class extends Eq{
        constructor(){super({uniqueName:"ミュータント", info:["戦闘開始時<盾>化"],
                                pos:EqPos.指, lv:10});}
        battleStart(unit:Unit){
            unit.setCondition( Condition.盾, 1 );
        }
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
        constructor(){super({uniqueName:"安全靴", info:["被攻撃時稀に<盾>化"],
                                pos:EqPos.脚, lv:40});}
        afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type !== TecType.状態 && Math.random() < 0.6){
                Battle.setCondition(target, Condition.盾, 1);
            }
        }
    }
}