var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Dmg } from "./force.js";
import { TecType, ActiveTec } from "./tec.js";
import { Prm } from "./unit.js";
import { Util } from "./util.js";
import { wait } from "./undym/scene.js";
import { Color } from "./undym/type.js";
export class ConditionType {
    constructor(uniqueName) {
        this.uniqueName = uniqueName;
        this.ordinal = ConditionType.ordinalNow++;
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
ConditionType.ordinalNow = 0;
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
        Condition._valueOf.set(this.uniqueName, this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        return this._valueOf.get(uniqueName);
    }
    toString() { return `${this.uniqueName}`; }
    //--------------------------------------------------------------------------
    //
    //Force
    //
    //--------------------------------------------------------------------------
    equip(unit) { }
    battleStart(unit) { }
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
    phaseEnd(unit) { }
}
Condition._values = [];
Condition._valueOf = new Map();
(function (Condition) {
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
    //GOOD_LV2
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
    Condition.風 = new class extends Condition {
        constructor() { super("風", ConditionType.GOOD_LV2); }
        beforeBeAtk(action, attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (action instanceof ActiveTec) {
                    dmg.hit.mul *= 0.5;
                    target.addConditionValue(this, -1);
                }
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //GOOD_LV3
    //
    //--------------------------------------------------------------------------
    Condition.癒 = new class extends Condition {
        constructor() { super("癒", ConditionType.GOOD_LV3); }
        phaseStart(unit) {
            return __awaiter(this, void 0, void 0, function* () {
                let value = unit.prm(Prm.MAX_HP).total * 0.2;
                const lim = (unit.prm(Prm.LIG).total + unit.prm(Prm.LV).total) * 10;
                if (value > lim) {
                    value = lim;
                }
                Util.msg.set("＞癒", Color.CYAN.bright);
                unit.hp += value;
                unit.addConditionValue(this, -1);
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //BAD_LV1
    //
    //--------------------------------------------------------------------------
    Condition.攻撃低下 = new class extends Condition {
        constructor() { super("攻↓", ConditionType.BAD_LV1); }
        beforeDoAtk(action, attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (action instanceof ActiveTec) {
                    Util.msg.set("＞攻↓");
                    yield wait();
                    dmg.pow.mul *= 0.5;
                    attacker.addConditionValue(this, -1);
                }
            });
        }
    };
    Condition.防御低下 = new class extends Condition {
        constructor() { super("防↓", ConditionType.BAD_LV1); }
        beforeBeoAtk(action, attacker, target, dmg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (action instanceof ActiveTec) {
                    Util.msg.set("＞防↓");
                    yield wait();
                    dmg.def.mul *= 0.5;
                    target.addConditionValue(this, -1);
                }
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //BAD_LV2
    //
    //--------------------------------------------------------------------------
    Condition.毒 = new class extends Condition {
        constructor() { super("毒", ConditionType.BAD_LV2); }
        phaseEnd(unit) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = unit.getConditionValue(this);
                if (value < unit.prm(Prm.DRK).total + 1) {
                    unit.clearCondition(this);
                    Util.msg.set(`${unit.name}の＜毒＞が解除された`);
                    yield wait();
                    return;
                }
                let dmg = new Dmg({ absPow: value });
                Util.msg.set("＞毒", Color.RED);
                unit.doDmg(dmg);
                unit.setCondition(this, value * 0.666);
            });
        }
    };
    //--------------------------------------------------------------------------
    //
    //BAD_LV3
    //
    //--------------------------------------------------------------------------
})(Condition || (Condition = {}));
