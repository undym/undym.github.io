import { Unit, Prm, PUnit } from "./unit.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
import { Force, Dmg, Targeting, Action } from "./force.js";
import { Condition, ConditionType } from "./condition.js";
import { Color } from "./undym/type.js";
import { FX_Str, FX_格闘 } from "./fx/fx.js";
import { Font } from "./graphics/graphics.js";
import { randomInt } from "./undym/random.js";
import { Battle } from "./battle.js";
import { Num } from "./mix.js";
import { Item } from "./item.js";



export abstract class TecType{
    private static _values:TecType[] = [];
    static values():ReadonlyArray<TecType>{return this._values;}
    
    private _tecs:Tec[];
    get tecs():ReadonlyArray<Tec>{
        if(!this._tecs){
            let actives = ActiveTec.values().filter(tec=> tec.type === this);
            let passives = PassiveTec.values().filter(tec=> tec.type === this);
            let tmp:Tec[] = [];
            this._tecs = tmp.concat( actives, passives );
        }
        return this._tecs;
    }

    protected constructor(name:string){
        this.toString = ()=>name;
        TecType._values.push(this);
    }


    abstract createDmg(attacker:Unit, target:Unit):Dmg;
    abstract effect(attacker:Unit, target:Unit, dmg:Dmg):void;

    /**一つでも当てはまればtrue. */
    any(...types:TecType[]){
        for(const t of types){
            if(this === t){return true;}
        }
        return false;
    }
}



export namespace TecType{
    export const             格闘 = new class extends TecType{
        constructor(){super("格闘");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.STR).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.MAG).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             魔法 = new class extends TecType{
        constructor(){super("魔法");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.MAG).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.STR).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             神格 = new class extends TecType{
        constructor(){super("神格");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.DRK).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             暗黒 = new class extends TecType{
        constructor(){super("暗黒");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.DRK).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.LIG).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             練術 = new class extends TecType{
        constructor(){super("練術");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.CHN).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.PST).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             過去 = new class extends TecType{
        constructor(){super("過去");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.PST).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.CHN).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             銃術 = new class extends TecType{
        constructor(){super("銃術");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.GUN).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.ARR).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             弓術 = new class extends TecType{
        constructor(){super("弓術");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.ARR).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.GUN).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             状態 = new class extends TecType{
        constructor(){super("状態");}
        createDmg(attacker:Unit, target:Unit):Dmg{return new Dmg();}
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             回復 = new class extends TecType{
        constructor(){super("回復");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
            });
        }
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
    export const             その他 = new class extends TecType{
        constructor(){super("その他");}
        createDmg(attacker:Unit, target:Unit):Dmg{return new Dmg();}
        effect(attacker:Unit, target:Unit, dmg:Dmg){
            FX_格闘(target.bounds.center);
        }
    };
}




export abstract class Tec implements Force{
    private static _empty:Tec;
    static get empty():Tec{
        return this._empty ? this._empty : (this._empty = new class extends Tec{
            uniqueName:string = "empty";
            info:string[] = [];
            type:TecType = TecType.格闘;
            constructor(){
                super();
            }
        });
    }

    abstract uniqueName:string;
    abstract info:string[];
    abstract type:TecType;
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    equip(unit:Unit){}
    battleStart(unit:Unit){}
    phaseStart(unit:Unit){}
    beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    afterDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
    afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){}
}



export abstract class PassiveTec extends Tec{
    private static _values:PassiveTec[] = [];
    static values():ReadonlyArray<PassiveTec>{return this._values;}
    private static _valueOf = new Map<string,PassiveTec>();
    static valueOf(uniqueName:string):PassiveTec|undefined{
        return this._valueOf.get(uniqueName);
    }
    
    readonly uniqueName:string;
    readonly info:string[];
    readonly type:TecType;

    protected constructor(args:{
        uniqueName:string,
        info:string[],
        type:TecType,
    }){
        super();
        this.uniqueName = args.uniqueName;
        this.toString = ()=>`-${this.uniqueName}-`;
        this.info = args.info;
        this.type = args.type;

        PassiveTec._values.push(this);
        if(PassiveTec._valueOf.has(this.uniqueName)){
            console.log(`PassiveTec already has uniqueName "${this.uniqueName}".`);
        }
        PassiveTec._valueOf.set( this.uniqueName, this );
    }
}



export abstract class ActiveTec extends Tec implements Action{
    private static _values:ActiveTec[] = [];
    static values():ReadonlyArray<ActiveTec>{return this._values;}
    
    private static _valueOf = new Map<string,ActiveTec>();
    static valueOf(uniqueName:string):ActiveTec|undefined{
        return this._valueOf.get(uniqueName);
    }
    
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    get uniqueName():string{return this.args.uniqueName;}
    get info():string[]{return this.args.info;}
    get type():TecType{return this.args.type;}

    get mpCost():number{return this.args.mp ? this.args.mp : 0;}
    get tpCost():number{return this.args.tp ? this.args.tp : 0;}
    get epCost():number{return this.args.ep ? this.args.ep : 0};
    get itemCost():{item:Item, num:number}[]{
        if(this.args.item){
            let res:{item:Item, num:number}[] = [];
            for(const set of this.args.item()){
                res.push( {item:set[0], num:set[1]} );
            }
            return res;
        }
        return [];
    }
    
    /**攻撃倍率 */
    get mul():number{return this.args.mul;}
    /**攻撃回数生成 */
    rndAttackNum():number{return this.args.num;}
    get hit():number{return this.args.hit;}
    get targetings():number{return this.args.targetings;}
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    protected constructor(
        private args:{
            uniqueName:string,
            info:string[],
            type:TecType,
            targetings:number,
            mul:number,
            num:number,
            hit:number,
            mp?:number,
            tp?:number,
            ep?:number,
            item?:()=>[Item,number][],
    }){
        super();

        ActiveTec._values.push(this);
        if(ActiveTec._valueOf.has(this.uniqueName)){
            console.log(`!!ActiveTec already has uniqueName "${this.uniqueName}".`);
        }
        ActiveTec._valueOf.set( this.uniqueName, this );
    }

    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    checkCost(u:Unit):boolean{
        if(u instanceof PUnit){       
            for(const set of this.itemCost){
                if(set.item.remainingUseCount < set.num){
                    return false;
                }
            }
        }

        return (
                       u.mp >= this.mpCost
                    && u.tp >= this.tpCost
                    && u.ep >= this.epCost
               );
    }

    payCost(u:Unit):void{
        u.mp -= this.mpCost;
        u.tp -= this.tpCost;
        u.ep -= this.epCost;

        if(u instanceof PUnit){       
            for(const set of this.itemCost){
                set.item.remainingUseCount -= set.num;
            }
        }
    }

    effect(attacker:Unit, target:Unit, dmg:Dmg):void{
        this.type.effect(attacker, target, dmg);
    }

    async use(attacker:Unit, targets:Unit[]){

        Util.msg.set(`${attacker.name}の[${this}]`, Color.D_GREEN.bright); await wait();

        if(targets.length === 0){return;}

        if(!this.checkCost(attacker)){
            Util.msg.set("コストを支払えなかった"); await wait();
            return;
        }

        this.payCost(attacker);

        for(let t of targets){
            await this.run(attacker, t);
        }
    }

    async run(attacker:Unit, target:Unit){
        let dmg = this.createDmg(attacker, target);
        attacker.beforeDoAtk(this, target, dmg);
        target.beforeBeAtk(this, attacker, dmg);

        await this.runInner(attacker, target, dmg);

        attacker.afterDoAtk(this, target, dmg);
        target.afterBeAtk(this, attacker, dmg);
    }

    async runInner(attacker:Unit, target:Unit, dmg:Dmg){
        await target.doDmg(dmg);
        this.effect(attacker, target, dmg);
    }

    createDmg(attacker:Unit, target:Unit):Dmg{
        let dmg = this.type.createDmg(attacker, target);
        dmg.pow.mul = this.mul;
        dmg.hit.base = this.hit;
        return dmg;
    }

    toString(){return this.uniqueName;}
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
}


export namespace Tec{

    //--------------------------------------------------------------------------
    //
    //格闘Active
    //
    //--------------------------------------------------------------------------
    export const                          殴る:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"殴る", info:["一体に格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1,
        });}
    }
    export const                          二回殴る:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"二回殴る", info:["一体に二回格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:2, hit:1, tp:20,
        });}
    }
    export const                          大いなる動き:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"大いなる動き", info:["敵全体に格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.ALL,
                              mul:1, num:1, hit:1, ep:1,
        });}
    }
    export const                          人狼剣:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"人狼剣", info:["一体に自分の力値分のダメージを与える"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:3, tp:10,
        });}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                        absPow:attacker.prm(Prm.STR).total,
                        hit:this.hit,
                    });
        }
    }
    export const                          閻魔の笏:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"閻魔の笏", info:["一体に4回格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:4, hit:1, ep:1,
        });}
    }
    export const                          マジカルパンチ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"マジカルパンチ", info:["マジカル格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1, mp:10,
        });}
        createDmg(attacker:Unit, target:Unit):Dmg{
            let dmg = super.createDmg(attacker, target);
            dmg.pow.base = attacker.prm(Prm.MAG).total + attacker.prm(Prm.LV).total;
            return dmg;
        }
    }
    //--------------------------------------------------------------------------
    //
    //格闘Passive
    //
    //--------------------------------------------------------------------------
    export const                         格闘攻撃UP:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"格闘攻撃UP", info:["格闘攻撃x1.2"],
                                type:TecType.格闘,
        });}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.格闘){
                dmg.pow.add += 1;
                dmg.pow.mul *= 1.2;
            }
        }
    };
    export const                         カウンター:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"カウンター", info:["被格闘攻撃時反撃"],
                                type:TecType.格闘,
        });}
        afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof Tec && action.type === TecType.格闘 && !dmg.counter){
                Util.msg.set(">カウンター");
                let cdmg = TecType.格闘.createDmg(target, attacker);
                cdmg.counter = true;
                attacker.doDmg(cdmg);
            }
        }
    };
    export const                         急所:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"急所", info:["格闘攻撃時稀にクリティカル発生"],
                                type:TecType.格闘,
        });}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.格闘 && Math.random() < 0.3){
                Util.msg.set(">急所");
                dmg.pow.mul *= 1.5;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //魔法Active
    //
    //--------------------------------------------------------------------------
    export const                          ヴァハ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ヴァハ", info:["一体に魔法攻撃"],
                              type:TecType.魔法, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1.2, mp:10,
        });}
    }
    export const                          エヴィン:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"エヴィン", info:["一体に魔法攻撃x2"],
                              type:TecType.魔法, targetings:Targeting.SELECT,
                              mul:2, num:1, hit:1.2, mp:25,
        });}
    }
    export const                          ルー:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ルー", info:["一体に魔法攻撃x3"],
                              type:TecType.魔法, targetings:Targeting.SELECT,
                              mul:3, num:1, hit:1.2, mp:40,
        });}
    }
    //--------------------------------------------------------------------------
    //
    //魔法Passive
    //
    //--------------------------------------------------------------------------
    export const                         魔法攻撃UP:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"魔法攻撃UP", info:["魔法攻撃x1.2"],
                                type:TecType.魔法,
        });}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type === TecType.魔法){
                dmg.pow.mul *= 1.2;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //神格Active
    //
    //--------------------------------------------------------------------------
    export const                          天籟:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"天籟", info:["一体に神格攻撃"],
                              type:TecType.神格, targetings:Targeting.SELECT,
                              mul:1, num:1.5, hit:1.5,
        });}
    }
    //--------------------------------------------------------------------------
    //
    //暗黒Active
    //
    //--------------------------------------------------------------------------
    export const                          暗黒剣:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"暗黒剣", info:["一体に暗黒攻撃","攻撃後反動ダメージ"],
                              type:TecType.暗黒, targetings:Targeting.SELECT,
                              mul:2, num:1, hit:1,
        });}
        async run(attacker:Unit, target:Unit){
            super.run(attacker, target);

            Util.msg.set(">反動");
            const cdmg = new Dmg({
                            absPow:target.prm(Prm.LIG).total + target.prm(Prm.LV).total,
                            counter:true,
                        });
            attacker.doDmg(cdmg);
        }
    }
    export const                          吸血:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"吸血", info:["相手からHPを吸収","暗黒依存"],
                              type:TecType.暗黒, targetings:Targeting.SELECT,
                              mul:0.5, num:1, hit:2, mp:20, tp:10,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            super.runInner(attacker, target, dmg);

            if(dmg.result.isHit){
                attacker.hp += dmg.result.value;
            }
        }
    }
    export const                          VBS:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"VBS", info:["敵全体に吸血"],
                              type:TecType.暗黒, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:2, ep:1,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            Tec.吸血.runInner(attacker, target, dmg);
        }
    }
    //--------------------------------------------------------------------------
    //
    //暗黒Passive
    //
    //--------------------------------------------------------------------------
    export const                         宵闇:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"宵闇", info:["暗黒攻撃x2", "攻撃時HP-20%"],
                                type:TecType.暗黒,
        });}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any( TecType.暗黒 )){
                Util.msg.set("＞宵闇");
                attacker.hp -= attacker.prm(Prm.MAX_HP).total * 0.2;
                dmg.pow.mul *= 2;
            }
        }
    };
    export const                         影の鎧:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"影の鎧", info:["自分と相手の暗黒値に応じて", "与・被ダメージが増減", "高い側に有利に働く"],
                                type:TecType.暗黒,
        });}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any( TecType.暗黒 )){
                let mul = 1 + attacker.prm(Prm.DRK).total / target.prm(Prm.DRK).total * 0.05;
                if(mul < 0.5){mul = 0.5;}
                if(mul > 1.5){mul = 1.5;}
                dmg.pow.mul *= mul;
            }
        }
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any( TecType.暗黒 )){
                let mul = 1 + target.prm(Prm.DRK).total / attacker.prm(Prm.DRK).total * 0.05;
                if(mul < 0.5){mul = 0.5;}
                if(mul > 1.5){mul = 1.5;}
                dmg.pow.mul *= mul;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //練術Active
    //
    //--------------------------------------------------------------------------
    export const                          スネイク:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"スネイク", info:["全体に練術攻撃"],
                              type:TecType.練術, targetings:Targeting.ALL,
                              mul:1, num:1, hit:0.85, tp:20,
        });}
    }
    export const                          コブラ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"コブラ", info:["一体に練術攻撃2回"],
                              type:TecType.練術, targetings:Targeting.SELECT,
                              mul:1, num:2, hit:0.85, tp:30,
        });}
    }
    export const                          ハブ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ハブ", info:["全体に練術攻撃","稀に対象を<毒>化"],
                              type:TecType.練術, targetings:Targeting.ALL,
                              mul:1, num:1, hit:0.85, tp:40,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            super.runInner(attacker, target, dmg);
            if(dmg.result.isHit && Math.random() < 0.3){
                const value = attacker.prm(Prm.DRK).total / 2 + attacker.prm(Prm.CHN).total / 2 + 1;
                Battle.setCondition(target, Condition.毒, value);
            }
        }
    }
    //--------------------------------------------------------------------------
    //
    //過去Active
    //
    //--------------------------------------------------------------------------
    export const                          念力:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"念力", info:["全体に過去攻撃"],
                              type:TecType.過去, targetings:Targeting.ALL,
                              mul:1, num:1, hit:1.2, mp:40,
        });}
    }
    export const                          念:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"念", info:["ランダムな一体に過去攻撃"],
                              type:TecType.過去, targetings:Targeting.RANDOM,
                              mul:1, num:1, hit:1.2, mp:10,
        });}
    }
    export const                          メテオ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"メテオ", info:["ランダムに4～6回過去攻撃"],
                              type:TecType.過去, targetings:Targeting.RANDOM,
                              mul:1, num:4, hit:1.2, ep:1,
        });}
        rndAttackNum = ()=> randomInt(4,6);
    }
    //--------------------------------------------------------------------------
    //
    //過去Passive
    //
    //--------------------------------------------------------------------------
    export const                         ネガティヴフィードバック:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"ネガティヴフィードバック", info:["過去攻撃時","状態異常一つにつき、消費MPの10%を還元"],
                                type:TecType.過去,
        });}
        async beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && (action.type === TecType.過去)){
                let num = ConditionType.badConditions()
                                        .filter(type=> attacker.existsCondition(type))
                                        .length;
                if(num === 0){return;}
                Battle.healMP( attacker, action.mpCost * 0.1 * num);
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //銃術Active
    //
    //--------------------------------------------------------------------------
    export const                          撃つ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"撃つ", info:["ランダムに銃術攻撃2回"],
                              type:TecType.銃術, targetings:Targeting.RANDOM,
                              mul:1, num:2, hit:0.8,
        });}
    }
    export const                          二丁拳銃:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"二丁拳銃", info:["一体に銃術攻撃2回"],
                              type:TecType.銃術, targetings:Targeting.RANDOM,
                              mul:1, num:2, hit:0.8, tp:10,
        });}
    }
    export const                          あがらない雨:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"あがらない雨", info:["全体に銃術攻撃2回"],
                              type:TecType.銃術, targetings:Targeting.ALL,
                              mul:1, num:2, hit:0.7, ep:1,
        });}
    }
    export const                          ショットガン:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ショットガン", info:["ランダムに銃術攻撃4回x0.7", "散弾-4"],
                              type:TecType.銃術, targetings:Targeting.RANDOM,
                              mul:0.7, num:4, hit:0.8,
                              item:()=>[[Item.散弾, 4]],
        });}
    }
    //--------------------------------------------------------------------------
    //
    //銃術Passive
    //
    //--------------------------------------------------------------------------
    export const                         テーブルシールド:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"テーブルシールド", info:["被銃・弓攻撃-30%"],
                                type:TecType.銃術,
        });}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(action instanceof ActiveTec && action.type.any(TecType.銃術, TecType.弓術)){
                dmg.pow.mul *= 0.7;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //弓術Active
    //
    //--------------------------------------------------------------------------
    export const                          射る:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"射る", info:["一体に弓術攻撃"],
                              type:TecType.弓術, targetings:Targeting.SELECT,
                              mul:1.5, num:1, hit:0.9,
        });}
    }
    export const                          インドラ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"インドラ", info:["一体に弓術攻撃x3"],
                              type:TecType.弓術, targetings:Targeting.SELECT,
                              mul:3, num:1, hit:0.9, tp:30,
        });}
    }
    export const                          キャンドラ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"キャンドラ", info:["一体に弓術攻撃x6"],
                              type:TecType.弓術, targetings:Targeting.SELECT,
                              mul:6, num:1, hit:0.9, ep:1,
        });}
    }
    export const                          ヤクシャ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ヤクシャ", info:["一体に弓術攻撃2回"],
                              type:TecType.弓術, targetings:Targeting.SELECT,
                              mul:1.5, num:2, hit:0.9, tp:10, item:()=>[[Item.夜叉の矢, 2]],
        });}
    }
    export const                          フェニックスアロー:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"フェニックスアロー", info:["一体に弓術攻撃","攻撃後光依存で回復"],
                              type:TecType.弓術, targetings:Targeting.SELECT,
                              mul:1.5, num:1, hit:0.9, mp:20, tp:10,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            super.runInner(attacker, target, dmg);

            const value = attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total / 2;
            if(dmg.result.isHit){
                Battle.healHP(attacker, value);
            }else{
                Battle.healHP(attacker, value / 3);
            }
        }
    }
    //--------------------------------------------------------------------------
    //
    //状態Active
    //
    //--------------------------------------------------------------------------
    export const                          練気:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"練気", info:["自分を<練>化"],
                              type:TecType.状態, targetings:Targeting.SELF,
                              mul:1, num:1, hit:1,
        });}
        async run(attacker:Unit, target:Unit){
            const value = target.getConditionValue(Condition.練) + 1;
            if(value > 4){return;}

            Battle.setCondition( target, Condition.練, value );
        }
    }
    export const                          グレートウォール:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"グレートウォール", info:["味方全体を<盾>化"],
                              type:TecType.状態, targetings:Targeting.ALL | Targeting.ONLY_FRIEND,
                              mul:1, num:1, hit:1,
        });}
        async run(attacker:Unit, target:Unit){
            const value = target.getConditionValue(Condition.盾) + 1;
            if(value > 4){return;}

            Battle.setCondition( target, Condition.盾, value );
        }
    }
    export const                          ポイズンバタフライ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ポイズンバタフライ", info:["一体を<毒>化"],
                              type:TecType.状態, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1,
        });}
        async run(attacker:Unit, target:Unit){
            const value = attacker.prm(Prm.DRK).total;
            Battle.setCondition(target, Condition.毒, value);
        }
    }
    export const                          凍てつく波動:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"凍てつく波動", info:["敵味方全体の状態を解除"],
                              type:TecType.状態, targetings:Targeting.ALL | Targeting.WITH_FRIEND,
                              mul:1, num:1, hit:10, ep:1,
        });}
        async run(attacker:Unit, target:Unit){
            target.clearAllCondition();
            Util.msg.set(`${target.name}の状態が解除された！`, Color.WHITE.bright);
        }
    }
    export const                          癒しの風:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"癒しの風", info:["一体を<癒5>(毎ターン回復)状態にする"],
                              type:TecType.状態, targetings:Targeting.SELECT | Targeting.ONLY_FRIEND,
                              mul:1, num:1, hit:10, mp:20,
        });}
        async run(attacker:Unit, target:Unit){
            Battle.setCondition(target, Condition.癒, 5);
        }
    }
    export const                          いやらしの風:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"いやらしの風", info:["味方全体を<癒5>状態にする"],
                              type:TecType.状態, targetings:Targeting.ALL | Targeting.ONLY_FRIEND,
                              mul:1, num:1, hit:10, mp:60,
        });}
        async run(attacker:Unit, target:Unit){
            Tec.癒しの風.run(attacker, target);
        }
    }
    export const                          風:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"風", info:["自分を<風3>(回避UP)状態にする"],
                              type:TecType.状態, targetings:Targeting.ALL | Targeting.ONLY_FRIEND,
                              mul:1, num:1, hit:10, tp:10,
        });}
        async run(attacker:Unit, target:Unit){
            Battle.setCondition( target, Condition.風, 5 );
        }
    }
    export const                          やる気ゼロ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"やる気0", info:["一体を<攻↓5>状態にする"],
                              type:TecType.状態, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:10, mp:10,
        });}
        async run(attacker:Unit, target:Unit){
            Battle.setCondition( target, Condition.攻撃低下, 5 );
        }
    }
    export const                          弱体液:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"弱体液", info:["一体を<防↓5>状態にする"],
                              type:TecType.状態, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:10, mp:10,
        });}
        async run(attacker:Unit, target:Unit){
            Battle.setCondition( target, Condition.防御低下, 5 );
        }
    }
    export const                          スコープ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"スコープ", info:["自分を<狙4>（命中上昇）状態にする"],
                              type:TecType.状態, targetings:Targeting.SELF,
                              mul:1, num:1, hit:10, mp:10, tp:10,
        });}
        async run(attacker:Unit, target:Unit){
            Battle.setCondition( target, Condition.狙, 4 );
        }
    }
    //--------------------------------------------------------------------------
    //
    //状態Passive
    //
    //--------------------------------------------------------------------------
    export const                         準備運動:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"準備運動", info:["戦闘開始時<練>化"],
                                type:TecType.状態,
        });}
        battleStart(unit:Unit){
            if(!unit.existsCondition(Condition.練.type)){
                Battle.setCondition(unit, Condition.練, 1);
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //回復Active
    //
    //--------------------------------------------------------------------------
    export const                          ばんそうこう:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ばんそうこう", info:["一体を回復(光依存)"],
                              type:TecType.回復, targetings:Targeting.SELECT,
                              mul:2, num:1, hit:10, mp:20,
        });}
        async run(attacker:Unit, target:Unit){
            const value = attacker.prm(Prm.LV).total + attacker.prm(Prm.LIG).total;
            Battle.healHP(target, value);
            Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
        }
    }
    export const                          ひんやりゼリー:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ひんやりゼリー", info:["味方全体を回復"],
                              type:TecType.回復, targetings:Targeting.ALL | Targeting.ONLY_FRIEND,
                              mul:2, num:1, hit:10, mp:20,
        });}
        async run(attacker:Unit, target:Unit){
            const value = attacker.prm(Prm.LV).total + attacker.prm(Prm.LIG).total;
            Battle.healHP(target, value);
            Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
        }
    }
    export const                          ジョンD:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ジョンD", info:["自分の最大MPを倍加","MP回復"],
                              type:TecType.回復, targetings:Targeting.SELF,
                              mul:1, num:1, hit:10, ep:1,
        });}
        async run(attacker:Unit, target:Unit){
            target.prm(Prm.MAX_MP).battle *= 2;
            target.mp = target.prm(Prm.MAX_MP).total;

            Util.msg.set(`${target.name}に魔力が満ちた！`); await wait();
        }
    }
    export const                          ユグドラシル:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ユグドラシル", info:["味方全員を蘇生・回復"],
                              type:TecType.回復, targetings:Targeting.ALL | Targeting.ONLY_FRIEND | Targeting.WITH_DEAD,
                              mul:1, num:1, hit:10, ep:1,
        });}
        async run(attacker:Unit, target:Unit){
            target.dead = false;
            target.hp = target.prm(Prm.MAX_HP).total;

            Util.msg.set(`${target.name}は回復した`); await wait();
        }
    }
    export const                          吸心:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"吸心", info:["一体をからTPを20吸収"],
                              type:TecType.回復, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:10, tp:10,
        });}
        async run(attacker:Unit, target:Unit){
            const value = 20;
            target.tp -= value;
            attacker.tp += value;
            Util.msg.set(`${target.name}からTPを${value}吸収した`); await wait();
        }
    }
    //--------------------------------------------------------------------------
    //
    //回復Passive
    //
    //--------------------------------------------------------------------------
    export const                         HP自動回復:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"HP自動回復", info:["行動開始時HP+1%"],
                                type:TecType.回復,
        });}
        phaseStart(unit:Unit){
            Battle.healHP(unit, 1 + unit.prm(Prm.MAX_HP).total * 0.01);
        }
    };
    export const                         衛生:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"衛生", info:["行動開始時味方のHP+5%"],
                                type:TecType.回復,
        });}
        phaseStart(unit:Unit){
            const members = unit.getParty(/*withHimSelf*/true);
            const lim = unit.prm(Prm.LIG).total * 10;
            for(const u of members){
                const value = u.prm(Prm.MAX_HP).total * 0.05 + 1;
                const v = value < lim ? value : lim;
                Battle.healHP(u, 1 + unit.prm(Prm.MAX_HP).total * 0.01);
            }
        }
    };
    export const                         体力機関:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"体力機関", info:["戦闘開始時最大HP･HP+10%"],
                                type:TecType.回復,
        });}
        battleStart(unit:Unit){
            const value = unit.prm(Prm.MAX_HP).total * 0.1;
            unit.prm(Prm.MAX_HP).battle += value;
            unit.hp += value;
        }
    };
    export const                         MP自動回復:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"MP自動回復", info:["行動開始時MP+10"],
                                type:TecType.回復,
        });}
        phaseStart(unit:Unit){
            unit.mp += 10;
        }
    };
    export const                         頭痛:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"頭痛", info:["行動開始時MP+10%","回復MP分のダメージを受ける"],
                                type:TecType.回復,
        });}
        phaseStart(unit:Unit){
            const value = unit.prm(Prm.MAX_MP).total * 0.1;
            unit.mp += value;
            unit.doDmg(new Dmg({absPow:value}));
        }
    };
    export const                         TP自動回復:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"TP自動回復", info:["行動開始時TP+10"],
                                type:TecType.回復,
        });}
        phaseStart(unit:Unit){
            unit.tp += 10;
        }
    };
    //--------------------------------------------------------------------------
    //
    //その他Active
    //
    //--------------------------------------------------------------------------
    export const                          何もしない:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"何もしない", info:["何もしないをする"],
                              type:TecType.その他, targetings:Targeting.SELF,
                              mul:1, num:1, hit:1,
        });}
        async use(attacker:Unit, targets:Unit[]){
            Util.msg.set(`${attacker.name}は空を眺めている...`); await wait();
        }
    }
    export const                          自爆:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"自爆", info:["敵全体に自分のHP分のダメージを与える","HP=0"],
                              type:TecType.その他, targetings:Targeting.ALL,
                              mul:1, num:1, hit:1, ep:1,
        });}
        async use(attacker:Unit, targets:Unit[]){
            const canUse = this.checkCost(attacker);

            Util.msg.set(`${attacker.name}の体から光が溢れる...`); await wait();
            super.use(attacker, targets);
            
            if(canUse){
                attacker.hp = 0;
            }else{
                Util.msg.set(`光に吸い寄せられた虫が体にいっぱいくっついた...`); await wait();
            }
        }
        async run(attacker:Unit, target:Unit){
            const dmg = new Dmg({absPow:attacker.hp});
            target.doDmg(dmg);
        }
    }
    //--------------------------------------------------------------------------
    //
    //その他Passive
    //
    //--------------------------------------------------------------------------
    export const                         我慢:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"我慢", info:["防御値+99"],
                                type:TecType.その他,
        });}
        beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.def.add += 99;
        }
    };
    export const                         トランシット:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"トランシット", info:["攻撃命中率上昇"],
                                type:TecType.その他,
        });}
        beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            dmg.hit.add += 0.07;
        }
    };
    export const                         カイゼルの目:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"カイゼルの目", info:["銃・弓攻撃時稀にクリティカル"],
                                type:TecType.その他,
        });}
        async beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
            if(
                action instanceof ActiveTec 
                && (action.type.any(TecType.銃術, TecType.弓術))
                && Math.random() < 0.25
            ){
                Util.msg.set("＞カイゼルの目");
                dmg.pow.mul *= 1.5;
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
}
