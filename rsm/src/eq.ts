import { Force, Dmg, Action } from "./force.js";
import { Unit, Prm } from "./unit.js";
import { Num, Mix } from "./mix.js";
import { Item } from "./item.js";
import { ActiveTec, TecType } from "./tec.js";
import { Condition } from "./condition.js";
import { Util, PlayData } from "./util.js";
import { Battle } from "./battle.js";
import { choice } from "./undym/random.js";


export class EqPos{
    private static _values:EqPos[] = [];
    static values(){return this._values;}

    private static ordinalNow = 0;

    private _eqs:Eq[];
    get eqs():ReadonlyArray<Eq>{
        if(!this._eqs){
            this._eqs = Eq.values.filter(eq=> eq.pos === this);
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
    static readonly 手 = new EqPos("手");
    static readonly 指 = new EqPos("指");
    static readonly 脚 = new EqPos("脚");
}


export abstract class Eq implements Force, Num{
    static readonly NO_APPEAR_LV = -1;

    private static _values:Eq[] = [];
    static get values():ReadonlyArray<Eq>{return this._values;}

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

            for(let eq of this.values){
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
        if(pos === EqPos.手){return this.手;}
        if(pos === EqPos.指){return this.肩身の指輪;}
        if(pos === EqPos.脚){return this.きれいな靴;}

        return this.髪;
    }

    static rnd(pos:EqPos, lv:number):Eq{
        const _posValues = this.posValues(pos);

        for(let i = 0; i < 8; i++){
            const eq = choice( _posValues );
            if(eq.appearLv !== this.NO_APPEAR_LV && eq.appearLv <= lv){return eq;}
        }
        return this.getDef(pos);
    }

    get uniqueName():string{return this.args.uniqueName;}
    get info():string      {return this.args.info;}
    get pos():EqPos        {return this.args.pos;}
    /**敵が装備し始めるレベル. */
    get appearLv():number  {return this.args.lv;}

    num = 0;
    totalGetCount = 0;
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    protected constructor(
        private args:{
            uniqueName:string,
            info:string,
            pos:EqPos,
            lv:number,
        }
    ){

        Eq._values.push(this);
        Eq._valueOf.set( args.uniqueName, this );
    }


    toString(){return this.args.uniqueName;}
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
    phaseEnd(unit:Unit){}

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


export class EqEar implements Force, Num{
    private static _values:EqEar[] = [];
    static get values():EqEar[]{return this._values;}

    private static _valueOf = new Map<string,EqEar>();
    static valueOf(uniqueName:string):EqEar|undefined{
        return this._valueOf.get(uniqueName);
    }

    static getDef():EqEar{return EqEar.耳たぶ;}

    get uniqueName():string{return this.args.uniqueName;}
    get info():string      {return this.args.info;}
    /**敵が装備し始めるレベル. */
    get appearLv():number  {return this.args.lv;}

    num = 0;
    totalGetCount = 0;
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    protected constructor(
        private args:{
            uniqueName:string,
            info:string,
            lv:number,
        }
    ){
        EqEar._values.push(this);
        EqEar._valueOf.set( args.uniqueName, this );
    }
    
    toString(){return this.args.uniqueName;}
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
    phaseEnd(unit:Unit){}

    add(v:number){
        Num.add(this, v);

        PlayData.gotAnyEq = true;
    }
}



export namespace Eq{
    //--------------------------------------------------------------------------
    //
    //頭
    //
    //--------------------------------------------------------------------------
    export const                         髪:Eq = new class extends Eq{
        constructor(){super({uniqueName:"髪", info:"はげてない、まだはげてない", 
                                pos:EqPos.頭, lv:0});}
    }
    export const                         魔女のとんがり帽:Eq = new class extends Eq{//リテの門EX
        constructor(){super({uniqueName:"魔女のとんがり帽", info:"最大MP+10", 
                                pos:EqPos.頭, lv:3});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 10;
        }
    }
    export const                         山男のとんかつ帽:Eq = new class extends Eq{
        constructor(){super({uniqueName:"山男のとんかつ帽", info:"最大TP+10", 
                                pos:EqPos.頭, lv:3});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_TP).eq += 10;
        }
    }
    export const                         千里ゴーグル:Eq = new class extends Eq{
        constructor(){super({uniqueName:"千里ゴーグル", info:"銃・弓攻撃時稀にクリティカル", 
                                pos:EqPos.頭, lv:120});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any(TecType.格闘) && Math.random() < 0.2){
                Util.msg.set("＞千里ゴーグル");
                dmg.pow.mul *= 1.5;
            }
        }   
    }
    export const                         勾玉:Eq = new class extends Eq{
        constructor(){super({uniqueName:"勾玉", info:"", 
                                pos:EqPos.頭, lv:Eq.NO_APPEAR_LV});}
    }
    export const                         メガネ:Eq = new class extends Eq{
        constructor(){super({uniqueName:"メガネ", info:"", 
                                pos:EqPos.頭, lv:Eq.NO_APPEAR_LV});}
    }
    export const                         マーザンの角:Eq = new class extends Eq{
        constructor(){super({uniqueName:"マーザンの角", info:"防御値+200", 
                                pos:EqPos.頭, lv:30});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 200;
        }
    }
    //--------------------------------------------------------------------------
    //
    //武
    //
    //--------------------------------------------------------------------------
    export const                         恋人:Eq = new class extends Eq{
        constructor(){super({uniqueName:"恋人", info:"",
                                pos:EqPos.武, lv:0});}
    }
    export const                         棒:Eq = new class extends Eq{
        constructor(){super({uniqueName:"棒", info:"格闘攻撃x1.5",
                                pos:EqPos.武, lv:20});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.格闘){
                dmg.pow.mul *= 1.5;
            }
        }
    }
    export const                         魔法の杖:Eq = new class extends Eq{//再構成トンネル・財宝
        constructor(){super({uniqueName:"魔法の杖", info:"魔法攻撃x1.5",
                                pos:EqPos.武, lv:40});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.魔法){
                dmg.pow.mul *= 1.5;
            }
        }
    }
    export const                         う棒:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"う棒", info:"力+20光+20",
                                pos:EqPos.武, lv:25});}
        equip(unit:Unit){ unit.prm(Prm.STR).eq += 20; unit.prm(Prm.LIG).eq += 20; }
    }
    export const                         銅剣:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"銅剣", info:"力+40光+40",
                                pos:EqPos.武, lv:45});}
        equip(unit:Unit){ unit.prm(Prm.STR).eq += 40; unit.prm(Prm.LIG).eq += 40; }
    }
    export const                         はがねの剣:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"はがねの剣", info:"力+70光+70",
                                pos:EqPos.武, lv:65});}
        equip(unit:Unit){ unit.prm(Prm.STR).eq += 70; unit.prm(Prm.LIG).eq += 70; }
    }
    export const                         杖:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"杖", info:"魔+20闇+20",
                                pos:EqPos.武, lv:25});}
        equip(unit:Unit){ unit.prm(Prm.MAG).eq += 20; unit.prm(Prm.DRK).eq += 20; }
    }
    export const                         スギの杖:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"スギの杖", info:"魔+40闇+40",
                                pos:EqPos.武, lv:45});}
        equip(unit:Unit){ unit.prm(Prm.MAG).eq += 40; unit.prm(Prm.DRK).eq += 40; }
    }
    export const                         ヒノキの杖:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"ヒノキの杖", info:"魔+70闇+70",
                                pos:EqPos.武, lv:65});}
        equip(unit:Unit){ unit.prm(Prm.MAG).eq += 70; unit.prm(Prm.DRK).eq += 70; }
    }
    export const                         木の鎖:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"木の鎖", info:"鎖+20過+20",
                                pos:EqPos.武, lv:25});}
        equip(unit:Unit){ unit.prm(Prm.CHN).eq += 20; unit.prm(Prm.PST).eq += 20; }
    }
    export const                         銅の鎖:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"銅の鎖", info:"鎖+40過+40",
                                pos:EqPos.武, lv:45});}
        equip(unit:Unit){ unit.prm(Prm.CHN).eq += 40; unit.prm(Prm.PST).eq += 40; }
    }
    export const                         鉄の鎖:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"鉄の鎖", info:"鎖+70過+70",
                                pos:EqPos.武, lv:65});}
        equip(unit:Unit){ unit.prm(Prm.CHN).eq += 70; unit.prm(Prm.PST).eq += 70; }
    }
    export const                         パチンコ:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"パチンコ", info:"銃+20弓+20",
                                pos:EqPos.武, lv:25});}
        equip(unit:Unit){ unit.prm(Prm.GUN).eq += 20; unit.prm(Prm.ARR).eq += 20; }
    }
    export const                         ボウガン:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"ボウガン", info:"銃+40弓+40",
                                pos:EqPos.武, lv:45});}
        equip(unit:Unit){ unit.prm(Prm.GUN).eq += 40; unit.prm(Prm.ARR).eq += 40; }
    }
    export const                         投石器:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"投石器", info:"銃+70弓+70",
                                pos:EqPos.武, lv:65});}
        equip(unit:Unit){ unit.prm(Prm.GUN).eq += 70; unit.prm(Prm.ARR).eq += 70; }
    }
    //--------------------------------------------------------------------------
    //
    //盾
    //
    //--------------------------------------------------------------------------
    export const                         板:Eq = new class extends Eq{
        constructor(){super({uniqueName:"板", info:"",
                                pos:EqPos.盾, lv:0});}
    }
    export const                         銅板:Eq = new class extends Eq{//合成
        constructor(){super({uniqueName:"銅板", info:"防御値+50",
                                pos:EqPos.盾, lv:12});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 50;
        }
    }
    export const                         鉄板:Eq = new class extends Eq{//合成
        constructor(){super({uniqueName:"鉄板", info:"防御値+100",
                                pos:EqPos.盾, lv:22});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 100;
        }
    }
    export const                         鋼鉄板:Eq = new class extends Eq{//合成
        constructor(){super({uniqueName:"鋼鉄板", info:"防御値+200",
                                pos:EqPos.盾, lv:32});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 200;
        }
    }
    export const                         チタン板:Eq = new class extends Eq{//合成
        constructor(){super({uniqueName:"チタン板", info:"防御値+300",
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
    export const                         襤褸切れ:Eq = new class extends Eq{
        constructor(){super({uniqueName:"襤褸切れ", info:"",
                                pos:EqPos.体, lv:0});}
    }
    export const                         草の服:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"草の服", info:"最大HP+20",
                                pos:EqPos.体, lv:15});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 20;}
    }
    export const                         布の服:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"布の服", info:"最大HP+40",
                                pos:EqPos.体, lv:35});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 40;}
    }
    export const                         皮の服:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"皮の服", info:"最大HP+70",
                                pos:EqPos.体, lv:55});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 70;}
    }
    export const                         木の鎧:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"木の鎧", info:"最大HP+100",
                                pos:EqPos.体, lv:95});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 100;}
    }
    // export const                         青銅の鎧 = new class extends Eq{
    //     constructor(){super({uniqueName:"青銅の鎧", info:"最大HP+200",
    //                             pos:EqPos.体, lv:125});}
    //     equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 200;}
    // }
    // export const                         鉄の鎧 = new class extends Eq{
    //     constructor(){super({uniqueName:"鉄の鎧", info:"最大HP+300",
    //                             pos:EqPos.体, lv:145});}
    //     equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 300;}
    // }
    // export const                         鋼鉄の鎧 = new class extends Eq{
    //     constructor(){super({uniqueName:"鋼鉄の鎧", info:"最大HP+400",
    //                             pos:EqPos.体, lv:160});}
    //     equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 400;}
    // }
    // export const                         銀の鎧 = new class extends Eq{
    //     constructor(){super({uniqueName:"銀の鎧", info:"最大HP+500",
    //                             pos:EqPos.体, lv:180});}
    //     equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 500;}
    // }
    // export const                         金の鎧 = new class extends Eq{
    //     constructor(){super({uniqueName:"金の鎧", info:"最大HP+600",
    //                             pos:EqPos.体, lv:200});}
    //     equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 600;}
    // }
    export const                         防弾チョッキ:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"防弾チョッキ", info:"最大HP+50　被銃術・弓術攻撃-40%",
                                pos:EqPos.体, lv:95});}
        equip(unit:Unit){unit.prm(Prm.MAX_HP).eq += 50;}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any(TecType.銃術, TecType.弓術)){
                dmg.pow.mul *= 0.6;
            }
        }
    }
    //--------------------------------------------------------------------------
    //
    //腰
    //
    //--------------------------------------------------------------------------
    export const                         ひも:Eq = new class extends Eq{
        constructor(){super({uniqueName:"ひも", info:"",
                                pos:EqPos.腰, lv:0});}
    }
    export const                         ゲルマンベルト:Eq = new class extends Eq{//黒平原財宝
        constructor(){super({uniqueName:"ゲルマンベルト", info:"攻撃+10%",
                                pos:EqPos.腰, lv:10});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.pow.mul *= 1.1;
        }
    }
    export const                         オホーツクのひも:Eq = new class extends Eq{//黒平原EX
        constructor(){super({uniqueName:"オホーツクのひも", info:"被攻撃-10%",
                                pos:EqPos.腰, lv:10});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.pow.mul *= 0.9;
        }
    }
    //--------------------------------------------------------------------------
    //
    //手
    //
    //--------------------------------------------------------------------------
    export const                         手:Eq = new class extends Eq{
        constructor(){super({uniqueName:"手", info:"",
                                pos:EqPos.手, lv:0});}
    }
    export const                         手甲:Eq = new class extends Eq{//再構成トンネルEX
        constructor(){super({uniqueName:"手甲", info:"全ステータス+20",
                                pos:EqPos.手, lv:10});}
        equip(unit:Unit){
            const prms:Prm[] = [
                Prm.STR, Prm.MAG,
                Prm.LIG, Prm.DRK,
                Prm.CHN, Prm.PST,
                Prm.GUN, Prm.ARR,
            ];
            for(const p of prms){
                unit.prm(p).eq += 20;
            }
        }
    }
    export const                         パウアハッハ:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"パウアハッハ", info:"魔法・暗黒・過去・弓術攻撃+20%",
                                pos:EqPos.手, lv:12});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any(TecType.魔法, TecType.暗黒, TecType.過去, TecType.弓術)){
                dmg.pow.mul *= 1.2;
            }
        }
    }
    export const                         カンベレグ:Eq = new class extends Eq{//mix
        constructor(){super({uniqueName:"カンベレグ", info:"格闘・神格・練術・銃術攻撃+20%",
                                pos:EqPos.手, lv:12});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any(TecType.魔法, TecType.神格, TecType.練術, TecType.銃術)){
                dmg.pow.mul *= 1.2;
            }
        }
    }
    export const                         ゴーレムの腕:Eq = new class extends Eq{//黒遺跡EX
        constructor(){super({uniqueName:"ゴーレムの腕", info:"神格・過去攻撃+33%",
                                pos:EqPos.手, lv:5});}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any( TecType.神格, TecType.過去 )){
                dmg.pow.mul *= 1.33;
            }
        }
    }
    export const                         ニケ:Eq = new class extends Eq{//マーザン森財宝
        constructor(){super({uniqueName:"ニケ", info:"最大MP+10 最大TP+5 光・闇+50",
                                pos:EqPos.手, lv:45});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 10;
            unit.prm(Prm.MAX_TP).eq += 5;
            unit.prm(Prm.LIG).eq += 50;
            unit.prm(Prm.DRK).eq += 50;
        }
    }
    //--------------------------------------------------------------------------
    //
    //指
    //
    //--------------------------------------------------------------------------
    export const                         肩身の指輪:Eq = new class extends Eq{
        constructor(){super({uniqueName:"肩身の指輪", info:"",
                                pos:EqPos.指, lv:0});}
    }
    export const                         ミュータント:Eq = new class extends Eq{
        constructor(){super({uniqueName:"ミュータント", info:"戦闘開始時<盾>化",
                                pos:EqPos.指, lv:10});}
        battleStart(unit:Unit){
            unit.setCondition( Condition.盾, 1 );
        }
    }
    export const                         魔ヶ玉の指輪:Eq = new class extends Eq{
        constructor(){super({uniqueName:"魔ヶ玉の指輪", info:"行動開始時MP+10%",
                                pos:EqPos.指, lv:20});}
        phaseStart(unit:Unit){
            Unit.healMP(unit, unit.prm(Prm.MAX_MP).total * 0.1 + 1);
        }
    }
    export const                         瑠璃:Eq = new class extends Eq{//はじまりの丘EX
        constructor(){super({uniqueName:"瑠璃", info:"戦闘開始時TP+10%",
                                pos:EqPos.指, lv:50});}
        battleStart(unit:Unit){
            Unit.healTP(unit, unit.prm(Prm.MAX_TP).total * 0.1 + 1);
        }
    }
    //--------------------------------------------------------------------------
    //
    //脚
    //
    //--------------------------------------------------------------------------
    export const                         きれいな靴:Eq = new class extends Eq{
        constructor(){super({uniqueName:"きれいな靴", info:"",
                                pos:EqPos.脚, lv:0});}
    }
    export const                         安全靴:Eq = new class extends Eq{//再構成トンネル財宝
        constructor(){super({uniqueName:"安全靴", info:"被攻撃時稀に<盾>化",
                                pos:EqPos.脚, lv:40});}
        afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type !== TecType.状態 && Math.random() < 0.6){
                Unit.setCondition(target, Condition.盾, 1);
            }
        }
    }
    export const                         鉄下駄:Eq = new class extends Eq{//PAINEX
        constructor(){super({uniqueName:"鉄下駄", info:"攻撃命中率x0.9 防御値x2",
                                pos:EqPos.脚, lv:21});}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec){
                dmg.def.mul *= 2;
            }
        }
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec){
                dmg.hit.mul *= 0.9;
            }
        }
    }
}

//耳は全て店売りにする
export namespace EqEar{
    export const                         耳たぶ:EqEar = new class extends EqEar{
        constructor(){super({uniqueName:"耳たぶ", info:"", lv:0});}
    }
    export const                         おにく:EqEar = new class extends EqEar{//店
        constructor(){super({uniqueName:"おにく", info:"最大HP+29", lv:29});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_HP).eq += 29;
        }
    }
    export const                         水晶のピアス:EqEar = new class extends EqEar{//店
        constructor(){super({uniqueName:"水晶のピアス", info:"行動開始時HP+1%", lv:29});}
        phaseStart(unit:Unit){
            Unit.healHP( unit, unit.prm(Prm.MAX_HP).total * 0.01 + 1 );
        }
    }
    export const                         魔ヶ玉のピアス:EqEar = new class extends EqEar{//店
        constructor(){super({uniqueName:"魔ヶ玉のピアス", info:"最大MP+10", lv:29});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_MP).eq += 10;
        }
    }
    export const                         エメラルドのピアス:EqEar = new class extends EqEar{//店
        constructor(){super({uniqueName:"エメラルドのピアス", info:"最大TP+10", lv:29});}
        equip(unit:Unit){
            unit.prm(Prm.MAX_TP).eq += 10;
        }
    }
}