import { Unit } from "./unit.js";
import { randomInt } from "./undym/random.js";
import { Condition } from "./condition.js";
import { FX_Str } from "./fx/fx.js";
import { Color } from "./undym/type.js";
import { Util } from "./util.js";
import { Font } from "./graphics/graphics.js";
export class Battle {
    constructor() { }
    static getPhaseUnit() {
        return Unit.all[this.phase];
    }
    static setup(type, battleEndAction) {
        this.start = true;
        this.type = type;
        this.result = BattleResult.LOSE;
        this.battleEndAction = battleEndAction;
        this.turn = 0;
        this.firstPhase = randomInt(0, Unit.all.length);
        this.phase = (Battle.firstPhase + Unit.all.length - 1) % Unit.all.length;
        // this.attacker = Unit.all[0];
        // this.target = Unit.all[0];
    }
}
Battle.start = false;
Battle.phase = 0;
Battle.firstPhase = 0;
Battle.turn = 0;
export class BattleType {
    constructor() { }
}
BattleType.NORMAL = new BattleType();
BattleType.BOSS = new BattleType();
BattleType.EX = new BattleType();
export var BattleResult;
(function (BattleResult) {
    BattleResult[BattleResult["WIN"] = 0] = "WIN";
    BattleResult[BattleResult["LOSE"] = 1] = "LOSE";
    BattleResult[BattleResult["ESCAPE"] = 2] = "ESCAPE";
})(BattleResult || (BattleResult = {}));
(function (Battle) {
    class ConditionFont {
        static get def() { return this.font ? this.font : (this.font = new Font(60)); }
    }
    Battle.setCondition = (target, condition, value) => {
        value = value | 0;
        if (value <= 0) {
            return;
        }
        if (condition === Condition.empty) {
            return;
        }
        target.setCondition(condition, value);
        FX_Str(ConditionFont.def, `<${condition}>`, target.bounds.center, Color.WHITE);
        Util.msg.set(`${target.name}は<${condition}${value}>になった`, Color.CYAN.bright);
    };
})(Battle || (Battle = {}));
