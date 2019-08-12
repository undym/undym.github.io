import DungeonEvent from "./dungeonevent.js";
import { Job } from "../job.js";
import { Unit, Prm } from "../unit.js";
import { Item } from "../item.js";
import { Eq } from "../eq.js";
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
        this.treasureOpenNum = 0;
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.rank = args.rank;
        this.enemyLv = args.enemyLv;
        this.au = args.au;
        this.clearItem = args.clearItem;
        this._treasure = args.treasure;
        this._treasureKey = args.treasureKey;
        this.trendItems = args.trendItems;
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
    get treasure() { return this._treasure(); }
    get treasureKey() { return this._treasureKey(); }
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent() {
        if (Math.random() < 0.001) {
            return DungeonEvent.TREASURE;
        }
        if (Math.random() < 0.001) {
            return DungeonEvent.GET_TREASURE_KEY;
        }
        if (Math.random() < 0.20) {
            return DungeonEvent.BOX;
        }
        if (Math.random() < 0.20) {
            return DungeonEvent.BATTLE;
        }
        if (Math.random() < 0.04) {
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
            clearItem: () => Item.はじまりの丘の玉,
            treasure: () => Eq.棒,
            treasureKey: () => Item.はじまりの丘の鍵,
            trendItems: () => [Item.石, Item.土, Item.枝,],
        });
        this.isVisible = () => true;
        this.setBossInner = () => {
            let e = Unit.enemies[0];
            Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "ボス";
            e.prm(Prm.MAX_HP).base = 30;
            e.prm(Prm.STR).base = 7;
            //ボス以外の雑魚は0体
            for (let i = 1; i < Unit.enemies.length; i++) {
                Unit.enemies[i].exists = false;
            }
        };
    }
};
Dungeon.丘の上 = new class extends Dungeon {
    constructor() {
        super({ uniqueName: "丘の上",
            rank: 1, enemyLv: 3, au: 100,
            clearItem: () => Item.丘の上の玉,
            treasure: () => Eq.安全靴,
            treasureKey: () => Item.丘の上の鍵,
            trendItems: () => [Item.水],
        });
        this.isVisible = () => Dungeon.はじまりの丘.clearNum > 0;
        this.setBossInner = () => {
            let e = Unit.enemies[0];
            Job.剣士.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "ボス";
            e.prm(Prm.MAX_HP).base = 50;
            e.prm(Prm.STR).base = 10;
            //ボス以外の雑魚は1体
            for (let i = 2; i < Unit.enemies.length; i++) {
                Unit.enemies[i].exists = false;
            }
        };
    }
};
