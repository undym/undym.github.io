import { ItemDrop } from "./item.js";



export class PartySkillWin{
    exp     = {base:0, mul:1};
    jobExp  = {base:0, mul:1};
    yen     = {base:0, mul:1};
}

export class PartySkillOpenBox{
    /**float. */
    addRank = 0;
    /**float. */
    chain = 0;
}

export class PartySkill{
    private static _values:PartySkill[] = [];
    static get values():ReadonlyArray<PartySkill>{return this._values;}
    private static _valueOf = new Map<string, PartySkill>();
    static valueOf(uniqueName:string):PartySkill|undefined{
        return this._valueOf.get(uniqueName);
    }

    static DEF_PARTY_SKILL_NUM = 3;

    static skills:PartySkill[] = [];


    get uniqueName():string{return this.args.uniqueName;}

    has = false;


    constructor(
        private args:{
            uniqueName:string,
            toString:string,
        }
    ){
        PartySkill._values.push(this);
        if(PartySkill._valueOf.has(args.uniqueName)){
            console.log(`!!PartySkill already has uniqueName "${args.uniqueName}".`);
        }
        PartySkill._valueOf.set(args.uniqueName, this);
    }

    toString(){return this.args.toString;}

    win(arg:PartySkillWin):void{}
    openBox(arg:PartySkillOpenBox, dropType:ItemDrop):void{}
}


export namespace PartySkill{
    export const                         empty:PartySkill = new class extends PartySkill{
        constructor(){super({uniqueName:"empty", toString:"-"});}
        win(arg:PartySkillWin){
            arg.exp.mul += 1;
        }
    }
    export const                         入手経験値増加:PartySkill = new class extends PartySkill{
        constructor(){super({uniqueName:"入手経験値増加", toString:"入手経験値x2"});}
        win(arg:PartySkillWin){
            arg.exp.mul += 1;
        }
    }
    export const                         入手金増加:PartySkill = new class extends PartySkill{
        constructor(){super({uniqueName:"入手金増加", toString:"入手金x2"});}
        win(arg:PartySkillWin){
            arg.yen.mul += 1;
        }
    }
    export const                         宝箱チェーン増加:PartySkill = new class extends PartySkill{
        constructor(){super({uniqueName:"宝箱チェーン増加", toString:"宝箱アイテムチェーン+0.3"});}
        openBox(arg:PartySkillOpenBox, dropType:ItemDrop){
            if(dropType & ItemDrop.BOX){arg.chain += 0.3;}
        }
    }
    export const                         宝箱ランク増加:PartySkill = new class extends PartySkill{
        constructor(){super({uniqueName:"宝箱ランク増加", toString:"宝箱アイテムランク+0.5"});}
        openBox(arg:PartySkillOpenBox, dropType:ItemDrop){
            if(dropType & ItemDrop.BOX){arg.addRank += 0.5;}
        }
    }
    export const                         伐採チェーン増加:PartySkill = new class extends PartySkill{
        constructor(){super({uniqueName:"伐採チェーン増加", toString:"伐採チェーン+0.6"});}
        openBox(arg:PartySkillOpenBox, dropType:ItemDrop){
            if(dropType & ItemDrop.TREE){arg.chain += 0.6;}
        }
    }
}