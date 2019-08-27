var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DungeonEvent } from "./dungeonevent.js";
import { Job } from "../job.js";
import { Unit, Prm } from "../unit.js";
import { Item } from "../item.js";
import { Eq } from "../eq.js";
import { Util } from "../util.js";
import { cwait } from "../undym/scene.js";
import { Player } from "../player.js";
class Event {
    constructor(events) {
        this.events = [];
        for (const set of events) {
            this.events.push({ ev: set[0], prob: set[1] });
        }
    }
    static createDef(rank) {
        const events = [];
        events.push([DungeonEvent.TREASURE, 0.001]);
        events.push([DungeonEvent.GET_TREASURE_KEY, 0.001]);
        events.push([DungeonEvent.BOX, 0.15]);
        events.push([DungeonEvent.BATTLE, 0.15]);
        events.push([DungeonEvent.TRAP, 0.04]);
        if (rank >= 1) {
            events.push([DungeonEvent.TREE, 0.04]);
        }
        events.push([DungeonEvent.REST, 0.04]);
        return new Event(events);
    }
    remove(ev) {
        this.events = this.events.filter(set => set.ev !== ev);
        return this;
    }
    add(ev, prob) {
        this.events.push({ ev: ev, prob: prob });
        return this;
    }
    addFirst(ev, prob) {
        this.events.unshift({ ev: ev, prob: prob });
        return this;
    }
    rnd() {
        for (const set of this.events) {
            if (Math.random() < set.prob) {
                return set.ev;
            }
        }
        return DungeonEvent.empty;
    }
}
export class Dungeon {
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    // private constructor(name:string, protected rank:number, protected enemyLv:number, protected au:number){
    constructor(args) {
        this.args = args;
        //-----------------------------------------------------------------
        //
        //
        //
        //-----------------------------------------------------------------
        this.clearNum = 0;
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
    get uniqueName() { return this.args.uniqueName; }
    get rank() { return this.args.rank; }
    get enemyLv() { return this.args.enemyLv; }
    get au() { return this.args.au; }
    get dungeonClearItem() { return this.args.clearItem(); }
    get treasure() { return this.args.treasure(); }
    get treasureKey() { return this.args.treasureKey(); }
    get trendItems() { return this.args.trendItems(); }
    toString() { return this.args.uniqueName; }
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent() {
        if (!this.event) {
            this.event = this.args.event ? this.args.event() : Event.createDef(this.rank);
        }
        return this.event.rnd();
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
    dungeonClearEvent() {
        return __awaiter(this, void 0, void 0, function* () {
        });
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
            this.dungeonClearEvent = () => __awaiter(this, void 0, void 0, function* () {
                if (!Player.よしこ.member) {
                    Player.よしこ.join();
                    Util.msg.set(`よしこが仲間になった`);
                    yield cwait();
                }
            });
        }
    };
    Dungeon.リテの門 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "リ・テの門",
                rank: 1, enemyLv: 7, au: 70,
                clearItem: () => Item.リテの門の玉,
                treasure: () => Eq.魔法の杖,
                treasureKey: () => Item.リテの門の鍵,
                trendItems: () => [Item.朽ち果てた鍵],
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
    Dungeon.黒平原 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "黒平原",
                rank: 2, enemyLv: 14, au: 100,
                clearItem: () => Item.黒平原の玉,
                treasure: () => Eq.ゲルマンベルト,
                treasureKey: () => Item.黒平原の鍵,
                trendItems: () => [Item.黒い石, Item.黒い砂],
            });
            this.isVisible = () => Dungeon.再構成トンネル.clearNum > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.スネイカー.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "牛";
                e.prm(Prm.MAX_HP).base = 120;
            };
        }
    };
})(Dungeon || (Dungeon = {}));
