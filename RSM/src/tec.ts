import { Unit, Prm } from "./unit.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
import { Force, Dmg, Targeting, Action } from "./force.js";
import { Condition, ConditionType } from "./condition.js";
import { Color } from "./undym/type.js";
import { FX_Str } from "./fx/fx.js";
import { Font } from "./graphics/graphics.js";



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

    private constructor(name:string){
        this.toString = ()=>name;
        TecType._values.push(this);
    }



    static readonly          格闘 = new class extends TecType{
        constructor(){super("格闘");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.STR).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.MAG).total,
            });;
        };
    };
    static readonly          魔法 = new class extends TecType{
        constructor(){super("魔法");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.MAG).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.STR).total,
            });;
        };
    };
    static readonly          神格 = new class extends TecType{
        constructor(){super("神格");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.DRK).total,
            });;
        };
    };
    static readonly          暗黒 = new class extends TecType{
        constructor(){super("暗黒");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.DRK).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.LIG).total,
            });;
        };
    };
    static readonly          練術 = new class extends TecType{
        constructor(){super("練術");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.CHN).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.PST).total,
            });;
        };
    };
    static readonly          過去 = new class extends TecType{
        constructor(){super("過去");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.PST).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.CHN).total,
            });;
        };
    };
    static readonly          銃術 = new class extends TecType{
        constructor(){super("銃術");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.GUN).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.ARR).total,
            });;
        };
    };
    static readonly          弓術 = new class extends TecType{
        constructor(){super("弓術");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.ARR).total + attacker.prm(Prm.LV).total,
                def:target.prm(Prm.GUN).total,
            });;
        };
    };
    static readonly          状態 = new class extends TecType{
        constructor(){super("状態");}
        createDmg(attacker:Unit, target:Unit):Dmg{return new Dmg();};
    };
    static readonly          回復 = new class extends TecType{
        constructor(){super("回復");}
        createDmg(attacker:Unit, target:Unit):Dmg{
            return new Dmg({
                pow:attacker.prm(Prm.LIG).total + attacker.prm(Prm.LV).total,
            });;
        };
    };
    static readonly          その他 = new class extends TecType{
        constructor(){super("その他");}
        createDmg(attacker:Unit, target:Unit):Dmg{return new Dmg();};
    };


    abstract createDmg(attacker:Unit, target:Unit):Dmg;
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
    private static _valueOf:Map<string,PassiveTec>;
    static valueOf(uniqueName:string):PassiveTec|undefined{
        if(!this._valueOf){
            this._valueOf = new Map<string,PassiveTec>();
            for(const tec of this.values()){
                this._valueOf.set( tec.uniqueName, tec );
            }
        }
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
        this.toString = ()=>this.uniqueName;
        this.info = args.info;
        this.type = args.type;

        PassiveTec._values.push(this);
    }
}



export abstract class ActiveTec extends Tec implements Action{
    private static _values:ActiveTec[] = [];
    static values():ReadonlyArray<ActiveTec>{return this._values;}
    
    private static _valueOf:Map<string,ActiveTec>;
    static valueOf(uniqueName:string):ActiveTec|undefined{
        if(!this._valueOf){
            this._valueOf = new Map<string,ActiveTec>();
            for(const tec of this.values()){
                this._valueOf.set( tec.uniqueName, tec );
            }
        }
        return this._valueOf.get(uniqueName);
    }
    
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    readonly uniqueName:string;
    readonly info:string[];
    readonly type:TecType;

    readonly mpCost:number;
    readonly tpCost:number;
    
    /**攻撃倍率 */
    readonly mul:number;
    /**攻撃回数生成 */
    readonly rndAttackNum:()=>number;
    readonly hit:number;
    readonly targetings:number;
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    protected constructor(args:{
        uniqueName:string,
        info:string[],
        type:TecType,
        targetings:number,
        mul:number,
        num:number,
        hit:number,
        mp?:number,
        tp?:number,
    }){
        super();
        this.uniqueName = args.uniqueName;
        this.info = args.info;
        this.type = args.type;
        this.targetings = args.targetings;
        this.mul = args.mul;
        const num = args.num;
        this.rndAttackNum = ()=>num;
        this.hit = args.hit;

        this.mpCost = args.mp ? args.mp : 0;
        this.tpCost = args.tp ? args.tp : 0;

        ActiveTec._values.push(this);
    }

    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    checkCost(u:Unit):boolean{
        return (
                       u.prm(Prm.MP).base >= this.mpCost
                    && u.prm(Prm.TP).base >= this.tpCost
               );
    }

    payCost(u:Unit):void{
        u.prm(Prm.MP).base -= this.mpCost;
        u.prm(Prm.TP).base -= this.tpCost;
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
    //格闘Active
    //
    //--------------------------------------------------------------------------
    // static readonly          タックル = new class extends Tec{
    //     constructor(){super("タックル", ["一体に格闘攻撃x1.5"]
    //                     ,TecType.格闘,/*mul*/1.5,/*num*/()=>1,/*hit*/1);}
    //     get targetings(){return Targeting.SELECT;}
    //     get tpCost()    {return 20;}
    // }
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
                              mul:1, num:1, hit:1, tp:60,
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
        constructor(){super({ uniqueName:"閻魔の笏", info:["一体に5回格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:5, hit:1, tp:100,
        });}
    }
    export const                          マジカルパンチ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"マジカルパンチ", info:["マジカル格闘攻撃"],
                              type:TecType.格闘, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1, mp:10,
        });}
        createDmg(attacker:Unit, target:Unit):Dmg{
            let dmg = super.createDmg(attacker, target);
            dmg.pow.base = attacker.prm(Prm.MAG).total;
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
                Util.msg.set("＞カウンター");
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
                Util.msg.set("＞急所");
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
                              mul:1, num:1, hit:1.5, mp:10,
        });}
    }
    export const                          エヴィン:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"エヴィン", info:["一体に魔法攻撃x2"],
                              type:TecType.魔法, targetings:Targeting.SELECT,
                              mul:2, num:1, hit:1.5, mp:25,
        });}
    }
    //--------------------------------------------------------------------------
    //
    //神格Active
    //
    //--------------------------------------------------------------------------
    export const                          天籟:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"天籟", info:["一体に神格攻撃"],
                              type:TecType.神格, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1.5,
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

            Util.msg.set("＞反動");
            const cdmg = new Dmg({
                            pow:target.prm(Prm.LIG).total,
                            counter:true,
                        });
            attacker.doDmg(cdmg);
        }
    }
    //--------------------------------------------------------------------------
    //
    //練術Active
    //
    //--------------------------------------------------------------------------
    export const                          スネイク:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"スネイク", info:["全体に練術攻撃"],
                              type:TecType.練術, targetings:Targeting.ALL,
                              mul:1, num:1, hit:0.85,
                              tp:20,
        });}
    }
    //--------------------------------------------------------------------------
    //
    //過去Active
    //
    //--------------------------------------------------------------------------
    export const                          念力:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"念力", info:["全体に過去攻撃"],
                              type:TecType.過去, targetings:Targeting.ALL,
                              mul:1, num:1, hit:1.2,
                              mp:40,
        });}
    }
    export const                          念:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"念", info:["ランダムな一体に過去攻撃"],
                              type:TecType.過去, targetings:Targeting.RANDOM,
                              mul:1, num:1, hit:1.2,
                              mp:10,
        });}
    }
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
    //--------------------------------------------------------------------------
    //
    //状態Active
    //
    //--------------------------------------------------------------------------
    export const                          練気:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"練気", info:["自分を＜練＞化"],
                              type:TecType.状態, targetings:Targeting.SELF,
                              mul:1, num:1, hit:1,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            const condition = Condition.練;
            const value = target.getConditionValue(Condition.練) + 1;

            if(value > 4){return;}

            target.setCondition(condition, value);
            FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
            Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.RED.wave(Color.GREEN));
        }
    }
    export const                          グレートウォール:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"グレートウォール", info:["味方全体を＜盾＞化"],
                              type:TecType.状態, targetings:Targeting.ALL | Targeting.ONLY_FRIEND,
                              mul:1, num:1, hit:1,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            const condition = Condition.盾;
            const value = target.getConditionValue(Condition.盾) + 1;

            if(value > 4){return;}

            target.setCondition(condition, value);
            FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
            Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.RED.wave(Color.GREEN));
        }
    }
    export const                          ポイズンバタフライ:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ポイズンバタフライ", info:["一体を＜毒＞化"],
                              type:TecType.状態, targetings:Targeting.SELECT,
                              mul:1, num:1, hit:1,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            const condition = Condition.毒;
            const value = attacker.prm(Prm.DRK).total;

            target.setCondition(condition, value);
            FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);
            Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.RED.wave(Color.GREEN));
        }
    }
    //--------------------------------------------------------------------------
    //
    //状態Passive
    //
    //--------------------------------------------------------------------------
    export const                         準備運動:PassiveTec = new class extends PassiveTec{
        constructor(){super({uniqueName:"準備運動", info:["戦闘開始時＜練＞化"],
                                type:TecType.状態,
        });}
        battleStart(unit:Unit){
            if(!unit.existsCondition(Condition.練.type)){
                setCondition(unit, Condition.練, 1);
            }
        }
    };
    //--------------------------------------------------------------------------
    //
    //回復Active
    //
    //--------------------------------------------------------------------------
    export const                          ばんそうこう:ActiveTec = new class extends ActiveTec{
        constructor(){super({ uniqueName:"ばんそうこう", info:["一体を光依存で回復"],
                              type:TecType.回復, targetings:Targeting.SELECT,
                              mul:2, num:1, hit:2,
                              mp:20,
        });}
        async runInner(attacker:Unit, target:Unit, dmg:Dmg){
            healHP(target, dmg.calc().value);
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
            unit.hp += 1 + unit.prm(Prm.MAX_HP).total * 0.01;
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
}

const setCondition = (target:Unit, condition:Condition, value:number):void=>{
    target.setCondition(condition, value);
    FX_Str(Font.def, `<${condition}>`, target.bounds.center, Color.WHITE);


    Util.msg.set(`${target.name}は＜${condition}${value}＞になった`, Color.WHITE.bright);
};


const healHP = (target:Unit, value:number):void=>{
    if(target.dead){return;}

    value = value|0;

    FX_Str(Font.def, `${value}`, target.bounds.center, Color.GREEN);
    target.hp += value;
    Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright);
};
