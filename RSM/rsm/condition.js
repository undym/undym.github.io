var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TecType, ActiveTec } from "./tec.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
export class ConditionType {
    constructor() {
        ConditionType._values.push(this);
    }
}
ConditionType._values = [];
ConditionType.values = () => ConditionType._values;
ConditionType.goodConditions = () => {
    if (ConditionType._goodConditions !== undefined) {
        return ConditionType._goodConditions;
    }
    return (ConditionType._goodConditions = [
        ConditionType.GOOD_LV1,
        ConditionType.GOOD_LV2,
        ConditionType.GOOD_LV3,
    ]);
};
ConditionType.badConditions = () => {
    if (ConditionType._badConditions !== undefined) {
        return ConditionType._badConditions;
    }
    return (ConditionType._badConditions = [
        ConditionType.BAD_LV1,
        ConditionType.BAD_LV2,
        ConditionType.BAD_LV3,
    ]);
};
ConditionType.GOOD_LV1 = new ConditionType();
ConditionType.GOOD_LV2 = new ConditionType();
ConditionType.GOOD_LV3 = new ConditionType();
ConditionType.BAD_LV1 = new ConditionType();
ConditionType.BAD_LV2 = new ConditionType();
ConditionType.BAD_LV3 = new ConditionType();
ConditionType.INVISIBLE = new ConditionType();
export class Condition {
    constructor(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
    toString() { return `${this.name}${this.value}`; }
    reduceValue(unit, v = 1) {
        this.value = v;
        if (this.value <= 0) {
            unit.clearCondition(this);
        }
    }
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
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
    static create練(_value) {
        return new class extends Condition {
            constructor() { super("練", ConditionType.GOOD_LV1, _value); }
            beforeDoAtk(action, attacker, target, dmg) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (action instanceof ActiveTec && action.type === TecType.格闘) {
                        Util.msg.set("＞練");
                        yield wait();
                        dmg.mul *= (1 + this.value * 0.5);
                        this.reduceValue(attacker);
                    }
                });
            }
        };
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    static create盾(_value) {
        return new class extends Condition {
            constructor() { super("盾", ConditionType.GOOD_LV2, _value); }
            beforeBeAtk(action, attacker, target, dmg) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (action instanceof ActiveTec && action.type === TecType.格闘) {
                        Util.msg.set("＞盾");
                        yield wait();
                        dmg.mul /= (1 + this.value * 0.5);
                        this.reduceValue(target);
                    }
                });
            }
        };
    }
}
//--------------------------------------------------------------------------
//
//
//
//--------------------------------------------------------------------------
Condition.empty = new class extends Condition {
    constructor() { super("", ConditionType.GOOD_LV1, 0); }
    toString() { return ""; }
};
