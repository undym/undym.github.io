import { PUnit, Prm, Unit } from "./unit.js";
import { ActiveTec } from "./tec.js";
import { Job } from "./job.js";
export class Player {
    constructor(name) {
        this.toString = () => name;
    }
    get ins() {
        if (this._ins === undefined) {
            this._ins = this.create();
        }
        return this._ins;
    }
    create() {
        let res = new PUnit(this);
        res.name = this.toString();
        res.exists = true;
        res.dead = false;
        res.prm(Prm.MAX_MP).base = Unit.DEF_MAX_MP;
        res.prm(Prm.MAX_TP).base = Unit.DEF_MAX_TP;
        this.createInner(res);
        res.prm(Prm.HP).base = res.prm(Prm.MAX_HP).total();
        for (let tec of res.tecs) {
            res.setMasteredTec(tec, true);
        }
        res.setJobLv(res.job, 1);
        return res;
    }
}
Player.empty = new class extends Player {
    constructor() { super(""); }
    createInner(p) {
        p.exists = false;
    }
};
Player.ルイン = new class extends Player {
    constructor() { super("ルイン"); }
    createInner(p) {
        p.job = Job.しんまい;
        p.prm(Prm.MAX_HP).base = 30;
        p.prm(Prm.STR).base = 3;
        p.tecs = [
            ActiveTec.殴る,
            ActiveTec.二回殴る,
        ];
    }
};
Player.ピアー = new class extends Player {
    constructor() { super("ピアー"); }
    createInner(p) {
        p.job = Job.魔法使い;
        p.prm(Prm.MAX_HP).base = 20;
        p.prm(Prm.STR).base = 2;
        p.prm(Prm.MAG).base = 4;
        p.tecs = [
            ActiveTec.殴る,
            ActiveTec.ヴァハ,
        ];
    }
};
Player.test1 = new class extends Player {
    constructor() { super("test1"); }
    createInner(p) {
        p.prm(Prm.MAX_HP).base = 20;
        p.prm(Prm.STR).base = 2;
        p.prm(Prm.MAG).base = 4;
        p.tecs = [
            ActiveTec.グレートウォール,
            ActiveTec.ヴァハ,
            ActiveTec.殴る,
        ];
    }
};
Player.test2 = new class extends Player {
    constructor() { super("test2"); }
    createInner(p) {
        p.prm(Prm.MAX_HP).base = 20;
        p.prm(Prm.STR).base = 2;
        p.prm(Prm.MAG).base = 4;
        p.tecs = [
            ActiveTec.グレートウォール,
            ActiveTec.ヴァハ,
            ActiveTec.殴る,
        ];
    }
};