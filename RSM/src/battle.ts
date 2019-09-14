import { Unit } from "./unit.js";
import { Item } from "./item.js";
import { randomInt } from "./undym/random.js";
import { Scene } from "./undym/scene.js";
import { Condition } from "./condition.js";
import { FX_Str, FX_RotateStr } from "./fx/fx.js";
import { Color, Point } from "./undym/type.js";
import { Util } from "./util.js";
import { Font } from "./graphics/graphics.js";



export class Battle{
    private constructor(){}

    static start:boolean = false;
    static type:BattleType;
    static result:BattleResult;
    static phase = 0;
    static firstPhase = 0;
    static turn = 0;
    // static attacker:Unit;
    // static target:Unit;
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
        
        // this.attacker = Unit.all[0];
        // this.target = Unit.all[0];
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



export namespace Battle{
    class FXFont{
        private static font:Font;
        static get def(){return this.font ? this.font : (this.font = new Font(60));}
    }
    
    export const setCondition = (target:Unit, condition:Condition, value:number)=>{
        value = value|0;
        if(value <= 0){return;}
        if(condition === Condition.empty){return;}

        target.setCondition(condition, value);
        FX_Str(FXFont.def, `<${condition}>`, target.bounds.center, Color.WHITE);
        Util.msg.set(`${target.name}は<${condition}${value}>になった`, Color.CYAN.bright);
    };

    export const healHP = (target:Unit, value:number)=>{
        if(!target.exists || target.dead){return;}

        value = value|0;
        
        const p = new Point(target.bounds.cx, (target.bounds.y + target.bounds.cy) / 2);
        FX_RotateStr(FXFont.def, `${value}`, p, Color.GREEN);
        target.hp += value;
    };

    export const healMP = (target:Unit, value:number)=>{
        if(!target.exists || target.dead){return;}

        value = value|0;
        target.mp += value;
    
        FX_RotateStr(FXFont.def, `${value}`, target.bounds.center, Color.PINK);
    };
    
    export const healTP = (target:Unit, value:number)=>{
        if(!target.exists || target.dead){return;}

        value = value|0;
        target.tp += value;
    
        const p = new Point(target.bounds.cx, (target.bounds.cy + target.bounds.yh) / 2);
        FX_RotateStr(FXFont.def, `${value}`, p, Color.CYAN);
    };
}