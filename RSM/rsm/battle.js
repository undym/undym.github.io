import { Unit } from "./unit.js";
import { randomInt } from "./undym/random.js";
export class Battle {
    constructor() { }
    // static item:{use:boolean, item:Item|undefined} = {use:false, item:undefined};
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
        this.attacker = Unit.all[0];
        this.target = Unit.all[0];
        // this.item.use = false;
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
