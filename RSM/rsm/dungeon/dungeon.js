import DungeonEvent from "./dungeonevent.js";
import { Rect } from "../undym/type.js";
import { Job } from "../job.js";
import { Unit, Prm } from "../unit.js";
export class Dungeon {
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    constructor(name, rank, enemyLv, au) {
        this.rank = rank;
        this.enemyLv = enemyLv;
        this.au = au;
        //-----------------------------------------------------------------
        //
        //
        //
        //-----------------------------------------------------------------
        this.clearNum = 0;
        this.toString = () => name;
        Dungeon._values.push(this);
    }
    static values() {
        return this._values;
    }
    getRank() { return this.rank; }
    getAU() { return this.au; }
    getEnemyLv() { return this.enemyLv; }
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent() {
        if (Math.random() <= 10.20) {
            return DungeonEvent.BOX;
        }
        if (Math.random() <= 0.20) {
            return DungeonEvent.BATTLE;
        }
        if (Math.random() <= 0.04) {
            return DungeonEvent.TRAP;
        }
        return DungeonEvent.empty;
    }
    rndEnemyNum() {
        const prob = 1.0 - (this.getRank() + 4) / (this.getRank() * this.getRank() + 5);
        let num = 0;
        for (let i = 0; i < Unit.enemies.length; i++) {
            if (Math.random() <= prob) {
                num++;
            }
        }
        return num === 0 ? 1 : num;
    }
    setEnemy() {
        let enemyNum = this.rndEnemyNum();
        for (let i = 0; i < enemyNum; i++) {
            this.setEnemyInner(Unit.enemies[i]);
        }
    }
    setEnemyInner(e) {
        let lv = (Math.random() * 0.5 + 0.75) * this.getEnemyLv();
        let job = Job.rndJob(lv);
        job.setEnemy(e, lv);
    }
    setBoss() {
        for (let e of Unit.enemies) {
            this.setEnemyInner(e);
            e.prm(Prm.MAX_HP).base *= 3;
            e.hp = e.prm(Prm.MAX_HP).total();
        }
        this.setBossInner();
        for (let e of Unit.enemies) {
            e.prm(Prm.HP).base = e.prm(Prm.MAX_HP).total();
        }
    }
}
Dungeon.auNow = 0;
Dungeon._values = [];
//-----------------------------------------------------------------
//
//
//
//-----------------------------------------------------------------
Dungeon.はじまりの丘 = new class extends Dungeon {
    constructor() {
        super("はじまりの丘", /*rank*/ 0, /*lv*/ 1, /*au*/ 50);
        this.getArea = () => DungeonArea.再構成トンネル;
        this.getBounds = () => new Rect(0.35, 0.4, 0.3, 0.2);
        this.isVisible = () => true;
        this.setBossInner = () => {
            let e = Unit.enemies[0];
            Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "ボス";
            e.prm(Prm.MAX_HP).base = 30;
            e.prm(Prm.STR).base = 7;
        };
    }
};
export class DungeonArea {
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    constructor(name) {
        //-----------------------------------------------------------------
        //
        //
        //
        //-----------------------------------------------------------------
        this.getDungeons = () => Dungeon.values()
            .filter(d => d.getArea() === this)
            .filter(d => d.isVisible());
        this.toString = () => name;
    }
}
//-----------------------------------------------------------------
//
//
//
//-----------------------------------------------------------------
DungeonArea.再構成トンネル = new class extends DungeonArea {
    constructor() {
        super("再構成トンネル");
        this.getAreaMoveBtns = () => {
            let res = [
                { area: DungeonArea.黒地域, bounds: new Rect(0.7, 0.2, 0.3, 0.2) }
            ];
            return res;
        };
    }
};
DungeonArea.黒地域 = new class extends DungeonArea {
    constructor() {
        super("黒地域");
        this.getAreaMoveBtns = () => {
            let res = [
                { area: DungeonArea.再構成トンネル, bounds: new Rect(0.0, 0.2, 0.3, 0.2) }
            ];
            return res;
        };
    }
};
