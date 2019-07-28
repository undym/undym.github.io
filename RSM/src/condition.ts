import { Force, Dmg, Action } from "./force.js";
import { Tec, TecType, ActiveTec } from "./tec.js";
import { Unit } from "./unit.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";



export class ConditionType{
    private static _values:ConditionType[] = [];
    static readonly values = ():ReadonlyArray<ConditionType>=> ConditionType._values;

    private static _goodConditions:ConditionType[];
    static readonly goodConditions = ():ReadonlyArray<ConditionType>=>{
        if(ConditionType._goodConditions !== undefined){return ConditionType._goodConditions;}
        return (ConditionType._goodConditions = [
                                                    ConditionType.GOOD_LV1,
                                                    ConditionType.GOOD_LV2,
                                                    ConditionType.GOOD_LV3,
                                                ]);
    }
    private static _badConditions:ConditionType[];
    static readonly badConditions = ():ReadonlyArray<ConditionType>=>{
        if(ConditionType._badConditions !== undefined){return ConditionType._badConditions;}
        return (ConditionType._badConditions = [
                                                    ConditionType.BAD_LV1,
                                                    ConditionType.BAD_LV2,
                                                    ConditionType.BAD_LV3,
                                                ]);
    }

    private constructor(){
        ConditionType._values.push(this);
    }

    static readonly GOOD_LV1 = new ConditionType();
    static readonly GOOD_LV2 = new ConditionType();
    static readonly GOOD_LV3 = new ConditionType();
    static readonly BAD_LV1  = new ConditionType();
    static readonly BAD_LV2  = new ConditionType();
    static readonly BAD_LV3  = new ConditionType();
    static readonly INVISIBLE = new ConditionType();
}


export abstract class Condition implements Force{


    readonly type:ConditionType;
    readonly name:string;

    value:number;

    constructor(name:string, type:ConditionType, value:number){
        this.name = name;
        this.type = type;
        this.value = value;
    }

    toString():string{return `${this.name}${this.value}`;}

    reduceValue(unit:Unit, v:number = 1){
        this.value = v;
        if(this.value <= 0){
            unit.clearCondition(this);
        }
    }
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    phaseStart(unit:Unit):void{}
    beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    afterDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    afterBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg):void{}
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    static readonly empty = new class extends Condition{
        constructor(){super("", ConditionType.GOOD_LV1, 0);}
        toString():string{return "";}
    };
    //--------------------------------------------------------------------------
    //
    //GOOD_LV1
    //
    //--------------------------------------------------------------------------
    // static readonly          練 = new class extends Condition{
    //     constructor(){super("練", ConditionType.GOOD_LV1);}
    //     async beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
    //         if(action instanceof ActiveTec && action.type === TecType.格闘){
                
    //             Util.msg.set("＞練"); await wait();
    //             dmg.mul *= (1 + attacker.getConditionValue(this.type) * 0.5);

    //             attacker.addCondition(this.type, -1);
    //         }
    //     }
    // };
    static create練(_value:number){
        return new class extends Condition{
            constructor(){super("練", ConditionType.GOOD_LV1, _value);}
            async beforeDoAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
                if(action instanceof ActiveTec && action.type === TecType.格闘){
                    
                    Util.msg.set("＞練"); await wait();
                    dmg.pow.mul *= (1 + this.value * 0.5);
                    
                    this.reduceValue(attacker);
                }
            }
        }
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    static create盾(_value:number){
        return new class extends Condition{
            constructor(){super("盾", ConditionType.GOOD_LV2, _value);}
            async beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
                if(action instanceof ActiveTec && action.type === TecType.格闘){
                    
                    Util.msg.set("＞盾"); await wait();
                    dmg.pow.mul /= (1 + this.value * 0.5);
    
                    this.reduceValue(target);
                }
            }
        };
    }
    // static readonly          盾 = new class extends Condition{
    //     constructor(){super("盾", ConditionType.GOOD_LV2);}
    //     async beforeBeAtk(action:Action, attacker:Unit, target:Unit, dmg:Dmg){
    //         if(action instanceof ActiveTec && action.type === TecType.格闘){
                
    //             Util.msg.set("＞盾"); await wait();
    //             dmg.mul /= (1 + target.getConditionValue(this.type) * 0.5);

    //             target.addCondition(this.type, -1);
    //         }
    //     }
    // };
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
}