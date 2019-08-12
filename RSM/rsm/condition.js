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
    constructor(uniqueName) {
        this.uniqueName = uniqueName;
        ConditionType._values.push(this);
    }
    static values() {
        return ConditionType._values;
    }
    static goodConditions() {
        if (!this._goodConditions) {
            this._goodConditions = [
                this.GOOD_LV1,
                this.GOOD_LV2,
                this.GOOD_LV3,
            ];
        }
        return this._goodConditions;
    }
    static badConditions() {
        if (!this._badConditions) {
            this._badConditions = [
                this.BAD_LV1,
                this.BAD_LV2,
                this.BAD_LV3,
            ];
        }
        return this._badConditions;
    }
}
ConditionType._values = [];
ConditionType.GOOD_LV1 = new ConditionType("GOOD_LV1");
ConditionType.GOOD_LV2 = new ConditionType("GOOD_LV2");
ConditionType.GOOD_LV3 = new ConditionType("GOOD_LV3");
ConditionType.BAD_LV1 = new ConditionType("BAD_LV1");
ConditionType.BAD_LV2 = new ConditionType("BAD_LV2");
ConditionType.BAD_LV3 = new ConditionType("BAD_LV3");
ConditionType.INVISIBLE = new ConditionType("INVISIBLE");
export class Condition {
    constructor(uniqueName, type) {
        this.uniqueName = uniqueName;
        this.type = type;
        Condition._values.push(this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (let condition of this.values()) {
                this._valueOf.set(condition.uniqueName, condition);
            }
        }
        return this._valueOf.get(uniqueName);
    }
    toString() { return `${this.uniqueName}`; }
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
    equip(unit) { }
}
Condition._values = [];
//--------------------------------------------------------------------------
//
//
//
//--------------------------------------------------------------------------
Condition.empty = new class extends Condition {
    constructor() { super("empty", ConditionType.GOOD_LV1); }
    toString() { return ""; }
};
//--------------------------------------------------------------------------
//
//GOOD_LV1
//
//--------------------------------------------------------------------------
Condition.練 = new class extends Condition {
    constructor() { super("練", ConditionType.GOOD_LV1); }
    beforeDoAtk(action, attacker, target, dmg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action instanceof ActiveTec && action.type === TecType.格闘) {
                Util.msg.set("＞練");
                yield wait();
                dmg.pow.mul *= (1 + attacker.getConditionValue(this) * 0.5);
                attacker.addConditionValue(this, -1);
            }
        });
    }
};
//--------------------------------------------------------------------------
//
//
//
//--------------------------------------------------------------------------
Condition.盾 = new class extends Condition {
    constructor() { super("盾", ConditionType.GOOD_LV2); }
    beforeBeAtk(action, attacker, target, dmg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action instanceof ActiveTec && action.type === TecType.格闘) {
                Util.msg.set("＞盾");
                yield wait();
                dmg.pow.mul *= (1 + target.getConditionValue(this) * 0.5);
                target.addConditionValue(this, -1);
            }
        });
    }
};
