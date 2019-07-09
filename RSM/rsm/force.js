export class Force {
    static get empty() { return this._empty !== undefined ? this._empty : (this._empty = new Force()); }
    // equip(unit:Unit):void{}
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
}
export class Dmg {
    constructor() {
        this.pow = 0;
        this.mul = 1;
        this.hit = 1.0;
        this.def = 0;
        this.result = 0;
        this.resultHit = false;
    }
    calc() {
        let res = 0;
        this.resultHit = Math.random() < this.hit;
        if (this.resultHit) {
            res = this.pow * this.mul;
        }
        else {
            res = 0;
        }
        res = res | 0;
        if (res < 0) {
            res = 0;
        }
        return (this.result = res);
    }
}
export class Action {
    static get empty() {
        return this._empty !== undefined ? this._empty
            : (this._empty = new class extends Action {
                use(attacker, targets) { }
            });
    }
}
export class Targeting {
    static filter(targetings, attacker, targets) {
        if (targetings & Targeting.SELF) {
            return [attacker];
        }
        targets = targets.filter(t => t.exists);
        if (targetings & Targeting.WITH_DEAD) { }
        else if (targetings & Targeting.ONLY_DEAD) {
            targets = targets.filter(t => t.dead);
        }
        else {
            targets = targets.filter(t => !t.dead);
        }
        if (targetings & Targeting.WITH_FRIEND) { }
        else if (targetings & Targeting.ONLY_FRIEND) {
            targets = targets.filter(t => t.isFriend(attacker));
        }
        else {
            targets = targets.filter(t => !t.isFriend(attacker));
        }
        if ((targetings & Targeting.SELECT)
            && targets.length > 0) {
            return [targets[0]];
        }
        return targets;
    }
}
Targeting.SELECT = 1 << 0;
Targeting.SELF = 1 << 1;
Targeting.ALL = 1 << 2;
Targeting.WITH_DEAD = 1 << 3;
Targeting.ONLY_DEAD = 1 << 4;
Targeting.WITH_FRIEND = 1 << 5;
Targeting.ONLY_FRIEND = 1 << 6;
// export enum Targeting{
//     SELECT      = 1 << 0,
//     SELF        = 1 << 1,
//     ALL         = 1 << 2,
//     WITH_DEAD   = 1 << 3,
//     ONLY_DEAD   = 1 << 4,
// }
// export const targetingFilter = (targetings:Targeting, attacker:Unit, targets:Unit[]):Unit[]=>{
//     if(targetings & Targeting.SELF){return [attacker];}
//          if(targetings & Targeting.WITH_DEAD){}
//     else if(targetings & Targeting.ONLY_DEAD){targets = targets.filter(t=> t.dead);}
//     else                                     {targets = targets.filter(t=> !t.dead);}
//     if(targetings & Targeting.SELECT && targets.length > 0){
//         return [targets[0]];
//     }
//     return targets;
// };
// export const filterTargets = (gambit:Gambit, action:Action, attacker:Unit, targetCandidates:Unit[]):Unit[]=>{
//     let targets = gambit.filter(attacker, targetCandidates);
//     targets = action.filter(attacker, targets);
//     return targets;
// }
