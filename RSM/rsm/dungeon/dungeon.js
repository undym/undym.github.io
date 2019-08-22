import { DungeonEvent } from "./dungeonevent.js";
import { Job } from "../job.js";
import { Unit, Prm } from "../unit.js";
import { Item } from "../item.js";
import { Eq } from "../eq.js";
class Event {
    constructor(events) {
        this.events = events;
    }
    static createDef() {
        return new Event(this.BATTLE
            | this.BOX
            | this.TRAP
            | this.TREASURE);
    }
    remove(ev) {
        this.events = this.events & (~ev);
        return this;
    }
    add(ev) {
        this.events = this.events | ev;
        return this;
    }
    // has(ev:number):boolean{
    //     return this.events & ev ? true : false;
    // }
    create() {
        if (this.events & Event.TREASURE) {
            if (Math.random() < 0.001) {
                return DungeonEvent.TREASURE;
            }
            if (Math.random() < 0.001) {
                return DungeonEvent.GET_TREASURE_KEY;
            }
        }
        if (this.events & Event.BOX && Math.random() < 0.20) {
            return DungeonEvent.BOX;
        }
        if (this.events & Event.BATTLE && Math.random() < 0.20) {
            return DungeonEvent.BATTLE;
        }
        if (this.events & Event.TRAP && Math.random() < 0.04) {
            return DungeonEvent.TRAP;
        }
        if (this.events & Event.TREE && Math.random() < 0.06) {
            return DungeonEvent.TREE;
        }
        return DungeonEvent.empty;
    }
}
Event.BATTLE = 1 << 0;
Event.BOX = 1 << 1;
Event.TREE = 1 << 2;
Event.TRAP = 1 << 3;
Event.TREASURE = 1 << 4;
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
        this._treasure = args.treasure;
        this._treasureKey = args.treasureKey;
        this.trendItems = args.trendItems;
        this.event = args.event;
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
        return this.event.create();
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
            e.hp = e.prm(Prm.MAX_HP).total;
        }
        this.setBossInner();
        for (let e of Unit.enemies) {
            e.hp = e.prm(Prm.MAX_HP).total;
        }
    }
}
Dungeon._values = [];
Dungeon.auNow = 0;
(function (Dungeon) {
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
                event: Event.createDef(),
            });
            this.isVisible = () => true;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "聖戦士";
                e.prm(Prm.MAX_HP).base = 15;
                e.prm(Prm.STR).base = 6;
                //ボス以外の雑魚は0体
                for (let i = 1; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
        }
    };
    Dungeon.再構成トンネル = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "再構成トンネル",
                rank: 1, enemyLv: 3, au: 70,
                clearItem: () => Item.再構成トンネルの玉,
                treasure: () => Eq.安全靴,
                treasureKey: () => Item.再構成トンネルの鍵,
                trendItems: () => [Item.水],
                event: Event.createDef().add(Event.TREE),
            });
            this.isVisible = () => Dungeon.はじまりの丘.clearNum > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.格闘家.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "幻影";
                e.prm(Prm.MAX_HP).base = 23;
                e.prm(Prm.STR).base = 10;
                //ボス以外の雑魚は1体
                for (let i = 2; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
        }
    };
    Dungeon.リテの門 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "リ・テの門",
                rank: 1, enemyLv: 5, au: 70,
                clearItem: () => Item.リテの門の玉,
                treasure: () => Eq.魔法の杖,
                treasureKey: () => Item.リテの門の鍵,
                trendItems: () => [],
                event: Event.createDef().add(Event.TREE),
            });
            this.isVisible = () => Dungeon.再構成トンネル.clearNum > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.魔法使い.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "門番";
                e.prm(Prm.MAX_HP).base = 50;
                e.prm(Prm.STR).base = 7;
                e.prm(Prm.MAG).base = 10;
                //ボス以外の雑魚は2体
                for (let i = 3; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
        }
    };
})(Dungeon || (Dungeon = {}));
