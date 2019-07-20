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
    //0     1
    //60    0.85
    //300   0.55
    //1,050 0.3
    //2,100 0.2125
    static calcDefCut(def) {
        return (3000.0 + def * 1) / (3000.0 + def * 10);
    }
    constructor(args) {
        this.clear();
        if (args !== undefined) {
            if (args.pow) {
                this.pow = args.pow;
            }
            if (args.mul) {
                this.mul = args.mul;
            }
            if (args.hit) {
                this.hit = args.hit;
            }
            if (args.def) {
                this.def = args.def;
            }
        }
    }
    clear() {
        this.pow = 0;
        this.def = 0;
        this.mul = 1;
        this.hit = 1.0;
        this.result = 0;
        this.resultHit = false;
    }
    calc() {
        let res = 0;
        this.resultHit = Math.random() < this.hit;
        if (this.resultHit) {
            res = this.pow * this.mul * Dmg.calcDefCut(this.def);
        }
        else {
            res = 0;
        }
        return (this.result = res < 0 ? 0 : res | 0);
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
