import { PUnit, Prm, Unit } from "./unit.js";
import { Tec } from "./tec.js";
import { Job } from "./job.js";
import { Eq } from "./eq.js";
export class Player {
    constructor(uniqueName) {
        this.uniqueName = uniqueName;
        this.member = false;
        this.toString = () => this.uniqueName;
        Player._values.push(this);
        Player._valueOf.set(this.uniqueName, this);
    }
    static get values() { return this._values; }
    static valueOf(uniqueName) { return this._valueOf.get(uniqueName); }
    get ins() {
        if (!this._ins) {
            this._ins = this.create();
        }
        return this._ins;
    }
    create() {
        let res = new PUnit(this);
        res.name = this.toString();
        res.exists = true;
        res.dead = false;
        this.createInner(res);
        res.prm(Prm.HP).base = res.prm(Prm.MAX_HP).total;
        for (let tec of res.tecs) {
            res.setMasteredTec(tec, true);
        }
        res.setJobLv(res.job, 1);
        return res;
    }
    /**プレイヤーの加入処理。 */
    join() {
        this.member = true;
        for (let i = 0; i < Unit.players.length; i++) {
            if (Unit.players[i].player === Player.empty) {
                Unit.setPlayer(i, this);
                break;
            }
        }
    }
}
Player._values = [];
Player._valueOf = new Map();
(function (Player) {
    Player.empty = new class extends Player {
        constructor() { super("empty"); }
        createInner(p) {
            p.exists = false;
        }
    };
    Player.スメラギ = new class extends Player {
        constructor() { super("スメラギ"); }
        createInner(p) {
            p.job = Job.しんまい;
            p.prm(Prm.MAX_HP).base = 20;
            p.prm(Prm.MAX_MP).base = 3;
            p.prm(Prm.MAX_TP).base = 5;
            p.prm(Prm.STR).base = 2;
            p.setEq(Eq.勾玉.pos, Eq.勾玉);
            p.tecs = [
                Tec.殴る,
                Tec.empty,
                Tec.empty,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
    Player.よしこ = new class extends Player {
        constructor() { super("よしこ"); }
        createInner(p) {
            p.job = Job.魔法使い;
            p.prm(Prm.MAX_HP).base = 16;
            p.prm(Prm.MAX_MP).base = 10;
            p.prm(Prm.MAX_TP).base = 2;
            p.prm(Prm.STR).base = 2;
            p.prm(Prm.MAG).base = 4;
            p.setEq(Eq.メガネ.pos, Eq.メガネ);
            p.tecs = [
                Tec.殴る,
                Tec.empty,
                Tec.empty,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
})(Player || (Player = {}));
