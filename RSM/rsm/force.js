import { choice } from "./undym/random.js";
export class Force {
    // private static _empty:Force;
    // static get empty():Force{return this._empty ? this._empty : (this._empty = new Force());}
    equip(unit) { }
    ;
    battleStart(unit) { }
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
    phaseEnd(unit) { }
}
export class Dmg {
    constructor(args) {
        /**calc()で出された結果のbak. */
        this.result = { value: 0, isHit: false };
        /** */
        this.counter = false;
        this.clear();
        if (args) {
            if (args.pow) {
                this.pow.base = args.pow;
            }
            if (args.mul) {
                this.pow.mul = args.mul;
            }
            if (args.hit) {
                this.hit.base = args.hit;
            }
            if (args.def) {
                this.def.base = args.def;
            }
            if (args.absPow) {
                this.abs.base = args.absPow;
            }
            if (args.absMul) {
                this.abs.mul = args.absMul;
            }
            if (args.counter) {
                this.counter = args.counter;
            }
        }
    }
    //0     1
    //60    0.85
    //300   0.55
    //1,050 0.3
    //2,100 0.2125
    static calcDefCut(def) {
        return (3000.0 + def * 1) / (3000.0 + def * 10);
    }
    static calcDmgElm(elm) {
        let res = (elm.base + elm.add) * elm.mul;
        res = res;
        return res > 0 ? res : 0;
    }
    clear() {
        this.pow = {
            base: 0,
            add: 0,
            mul: 1,
        };
        this.def = {
            base: 0,
            add: 0,
            mul: 1,
        };
        this.hit = {
            base: 1,
            add: 0,
            mul: 1,
        };
        this.abs = {
            base: 0,
            add: 0,
            mul: 1,
        };
        this.result.value = 0;
        this.result.isHit = false;
        this.counter = false;
    }
    calc() {
        const _pow = Dmg.calcDmgElm(this.pow);
        const _def = Dmg.calcDmgElm(this.def);
        const _hit = Dmg.calcDmgElm(this.hit);
        const _abs = Dmg.calcDmgElm(this.abs);
        let value = 0;
        let isHit = Math.random() < _hit;
        if (isHit) {
            value = _pow * Dmg.calcDefCut(_def);
        }
        else {
            value = 0;
        }
        if (_abs > 0) {
            isHit = true;
            value += _abs;
        }
        this.result.value = value > 0 ? value | 0 : 0;
        this.result.isHit = isHit;
        return this.result;
    }
}
export class Action {
}
export var Targeting;
(function (Targeting) {
    Targeting[Targeting["SELECT"] = 1] = "SELECT";
    Targeting[Targeting["SELF"] = 2] = "SELF";
    Targeting[Targeting["ALL"] = 4] = "ALL";
    Targeting[Targeting["WITH_DEAD"] = 8] = "WITH_DEAD";
    Targeting[Targeting["DEAD_ONLY"] = 16] = "DEAD_ONLY";
    Targeting[Targeting["WITH_FRIEND"] = 32] = "WITH_FRIEND";
    Targeting[Targeting["FRIEND_ONLY"] = 64] = "FRIEND_ONLY";
    Targeting[Targeting["RANDOM"] = 128] = "RANDOM";
})(Targeting || (Targeting = {}));
(function (Targeting) {
    Targeting.filter = (targetings, attacker, targets, num) => {
        if (targetings & Targeting.SELF) {
            return new Array(num).fill(attacker);
        }
        let filtered = targets.filter(t => t.exists);
        if (targetings & Targeting.WITH_DEAD) { }
        else if (targetings & Targeting.DEAD_ONLY) {
            filtered = filtered.filter(t => t.dead);
        }
        else {
            filtered = filtered.filter(t => !t.dead);
        }
        if (targetings & Targeting.WITH_FRIEND) { }
        else if (targetings & Targeting.FRIEND_ONLY) {
            filtered = filtered.filter(t => t.isFriend(attacker));
        }
        else {
            filtered = filtered.filter(t => !t.isFriend(attacker));
        }
        if (filtered.length === 0) {
            return [];
        }
        if (targetings & Targeting.RANDOM) {
            let res = [];
            for (let i = 0; i < num; i++) {
                res.push(choice(filtered));
            }
            return res;
        }
        if (targetings & Targeting.SELECT) {
            return new Array(num).fill(choice(filtered));
        }
        //all
        let res = [];
        for (let i = 0; i < num; i++) {
            res = res.concat(filtered);
        }
        return res;
    };
})(Targeting || (Targeting = {}));
