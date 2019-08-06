import DungeonEvent from "./dungeonevent.js";
import { Job } from "../job.js";
import { Unit, Prm } from "../unit.js";
import { Item } from "../item.js";
export class Dungeon {
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    // private constructor(name:string, protected rank:number, protected enemyLv:number, protected au:number){
    constructor(args) {
        //-----------------------------------------------------------------
        //
        //
        //
        //-----------------------------------------------------------------
        this.clearNum = 0;
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.rank = args.rank;
        this.enemyLv = args.enemyLv;
        this.au = args.au;
        this.clearItem = args.clearItem;
        Dungeon._values.push(this);
    }
    static values() {
        return this._values;
    }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (const d of this.values()) {
                this._valueOf.set(d.uniqueName, d);
            }
        }
        return this._valueOf.get(uniqueName);
    }
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent() {
        if (Math.random() <= 0.20) {
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
        const prob = 1.0 - (this.rank + 4) / (this.rank * this.rank + 5);
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
        let lv = (Math.random() * 0.5 + 0.75) * this.enemyLv;
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
Dungeon._values = [];
Dungeon.auNow = 0;
//-----------------------------------------------------------------
//
//
//
//-----------------------------------------------------------------
Dungeon.はじまりの丘 = new class extends Dungeon {
    constructor() {
        super({ uniqueName: "はじまりの丘",
            rank: 0, enemyLv: 1, au: 50,
            clearItem: () => Item.勾玉,
        });
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
Dungeon.丘の上 = new class extends Dungeon {
    constructor() {
        super({ uniqueName: "丘の上",
            rank: 1, enemyLv: 3, au: 100,
            clearItem: () => Item.石,
        });
        this.isVisible = () => Dungeon.はじまりの丘.clearNum > 0;
        this.setBossInner = () => {
            let e = Unit.enemies[0];
            Job.剣士.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "ボス";
            e.prm(Prm.MAX_HP).base = 50;
            e.prm(Prm.STR).base = 10;
        };
    }
};
