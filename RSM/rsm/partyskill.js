import { ItemDrop } from "./item.js";
export class PartySkillWin {
    constructor() {
        this.exp = { base: 0, mul: 1 };
        this.jobExp = { base: 0, mul: 1 };
        this.yen = { base: 0, mul: 1 };
    }
}
export class PartySkillOpenBox {
    constructor() {
        /**float. */
        this.addRank = 0;
        /**float. */
        this.chain = 0;
    }
}
export class PartySkill {
    constructor(args) {
        this.args = args;
        this.has = false;
        PartySkill._values.push(this);
        if (PartySkill._valueOf.has(args.uniqueName)) {
            console.log(`!!PartySkill already has uniqueName "${args.uniqueName}".`);
        }
        else {
            PartySkill._valueOf.set(args.uniqueName, this);
        }
    }
    static get values() { return this._values; }
    static valueOf(uniqueName) {
        return this._valueOf.get(uniqueName);
    }
    get uniqueName() { return this.args.uniqueName; }
    toString() { return this.args.toString; }
    win(arg) { }
    openBox(arg, dropType) { }
}
PartySkill._values = [];
PartySkill._valueOf = new Map();
PartySkill.DEF_PARTY_SKILL_NUM = 3;
PartySkill.skills = [];
(function (PartySkill) {
    PartySkill.empty = new class extends PartySkill {
        constructor() { super({ uniqueName: "empty", toString: "-" }); }
        win(arg) {
            arg.exp.mul += 1;
        }
    };
    PartySkill.入手経験値増加 = new class extends PartySkill {
        constructor() { super({ uniqueName: "入手経験値増加", toString: "入手経験値x2" }); }
        win(arg) {
            arg.exp.mul += 1;
        }
    };
    PartySkill.入手ジョブ経験値増加 = new class extends PartySkill {
        constructor() { super({ uniqueName: "入手ジョブ経験値増加", toString: "入手ジョブ経験値+1" }); }
        win(arg) {
            arg.jobExp.base += 1;
        }
    };
    PartySkill.入手金増加 = new class extends PartySkill {
        constructor() { super({ uniqueName: "入手金増加", toString: "入手金x2" }); }
        win(arg) {
            arg.yen.mul += 1;
        }
    };
    PartySkill.宝箱チェーン増加 = new class extends PartySkill {
        constructor() { super({ uniqueName: "宝箱チェーン増加", toString: "宝箱アイテムチェーン+0.3" }); }
        openBox(arg, dropType) {
            if (dropType & ItemDrop.BOX) {
                arg.chain += 0.3;
            }
        }
    };
    PartySkill.宝箱ランク増加 = new class extends PartySkill {
        constructor() { super({ uniqueName: "宝箱ランク増加", toString: "宝箱アイテムランク+0.5" }); }
        openBox(arg, dropType) {
            if (dropType & ItemDrop.BOX) {
                arg.addRank += 0.5;
            }
        }
    };
    PartySkill.伐採チェーン増加 = new class extends PartySkill {
        constructor() { super({ uniqueName: "伐採チェーン増加", toString: "伐採チェーン+0.6" }); }
        openBox(arg, dropType) {
            if (dropType & ItemDrop.TREE) {
                arg.chain += 0.6;
            }
        }
    };
})(PartySkill || (PartySkill = {}));
