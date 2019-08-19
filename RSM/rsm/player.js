import { PUnit, Prm, Unit } from "./unit.js";
import { Tec } from "./tec.js";
import { Job } from "./job.js";
export class Player {
    constructor(uniqueName) {
        this.uniqueName = uniqueName;
        this.member = false;
        this.toString = () => this.uniqueName;
        Player._values.push(this);
    }
    static values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (const p of this.values()) {
                this._valueOf.set(p.uniqueName, p);
            }
        }
        return this._valueOf.get(uniqueName);
    }
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
        res.prm(Prm.MAX_MP).base = Unit.DEF_MAX_MP;
        res.prm(Prm.MAX_TP).base = Unit.DEF_MAX_TP;
        this.createInner(res);
        res.prm(Prm.HP).base = res.prm(Prm.MAX_HP).total;
        for (let tec of res.tecs) {
            res.setMasteredTec(tec, true);
        }
        res.setJobLv(res.job, 1);
        return res;
    }
    /**合成等でのプレイヤーの加入処理。 */
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
            p.prm(Prm.STR).base = 2;
            p.tecs = [
                Tec.殴る,
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
            p.prm(Prm.STR).base = 2;
            p.prm(Prm.MAG).base = 4;
            p.tecs = [
                Tec.殴る,
                Tec.マジカルパンチ,
                Tec.empty,
                Tec.empty,
            ];
        }
    };
})(Player || (Player = {}));
