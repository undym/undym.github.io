import { Unit } from "./unit.js";
import { Item } from "./item.js";
import { randomInt } from "./undym/random.js";
import { Scene } from "./undym/scene.js";



export class Battle{
    private constructor(){}

    static start:boolean = false;
    static type:BattleType;
    static result:BattleResult;
    static phase = 0;
    static firstPhase = 0;
    static turn = 0;
    static attacker:Unit;
    static target:Unit;
    static battleEndAction:(result:BattleResult)=>void;
    

    static getPhaseUnit():Unit{
        return Unit.all[this.phase];
    }

    static setup(type:BattleType, battleEndAction:(result:BattleResult)=>void){
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


export class BattleType{
    private constructor(){}

    static readonly NORMAL = new BattleType();
    static readonly BOSS = new BattleType();
    static readonly EX = new BattleType();
}


export enum BattleResult{
    WIN,
    LOSE,
    ESCAPE,
}