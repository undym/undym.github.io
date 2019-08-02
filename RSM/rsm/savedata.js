import { Item } from "./item.js";
import { Eq, EqPos } from "./eq.js";
import { Dungeon } from "./dungeon/dungeon.js";
import { Prm } from "./unit.js";
import { Player } from "./player.js";
import { Tec, PassiveTec, ActiveTec } from "./tec.js";
import { Job } from "./job.js";
import { ConditionType, Condition } from "./condition.js";
import { PlayData } from "./util.js";
export class SaveData {
    static exists() {
        return window.localStorage.getItem(this.existsSaveData) != null;
    }
    static setExists() {
        window.localStorage.setItem(this.existsSaveData, "true");
    }
    static delete() {
        window.localStorage.clear();
    }
    /**全セーブデータ読み込み。 */
    static load() {
        Item.values().forEach(item => this.item.load(item));
        Eq.values().forEach(eq => this.eq.load(eq));
        Dungeon.values().forEach(d => this.dungeon.load(d));
        Player.values().forEach(p => this.player.load(p));
    }
    static get item() { return SaveItem; }
    static get eq() { return SaveEq; }
    static get dungeon() { return SaveDungeon; }
    static get player() { return SavePlayer; }
    static get playData() { return SavePlayData; }
}
SaveData.existsSaveData = "existsSaveData";
const inoutInt = (save, key, value, loadAction) => {
    value = value | 0;
    if (save) {
        window.localStorage.setItem(key, `${value}`);
    }
    else {
        const strage = window.localStorage.getItem(key);
        if (strage) {
            const parsed = Number.parseInt(strage);
            if (parsed !== undefined) {
                loadAction(parsed);
            }
            else {
                console.log(`inoutInt(), parseFail, "${key}":${strage}`);
            }
        }
    }
};
const inoutBool = (save, key, value, loadAction) => {
    if (save) {
        window.localStorage.setItem(key, `${value}`);
    }
    else {
        const strage = window.localStorage.getItem(key);
        if (strage) {
            if (strage === "true") {
                loadAction(true);
            }
            else {
                loadAction(false);
            }
        }
    }
};
const inoutStr = (save, key, value, loadAction) => {
    if (save) {
        window.localStorage.setItem(key, value);
    }
    else {
        const strage = window.localStorage.getItem(key);
        if (strage !== null) {
            loadAction(strage);
        }
    }
};
class SaveItem {
    static inout(save, item) {
        const name = `Item_${item.uniqueName}`;
        inoutInt(save, `${name}_num`, item.num, load => item.num = load);
        inoutInt(save, `${name}_totalGetNum`, item.totalGetNum, load => item.totalGetNum = load);
        inoutInt(save, `${name}_usedNum`, item.usedNum, load => item.usedNum = load);
    }
    static save(item) { this.inout(true, item); }
    static load(item) { this.inout(false, item); }
}
class SaveEq {
    static inout(save, eq) {
        const name = `Eq_${eq.uniqueName}`;
        inoutInt(save, `${name}_num`, eq.num, load => eq.num = load);
        inoutInt(save, `${name}_totalGetNum`, eq.totalGetNum, load => eq.totalGetNum = load);
    }
    static save(eq) { this.inout(true, eq); }
    static load(eq) { this.inout(false, eq); }
}
class SaveDungeon {
    static inout(save, d) {
        const name = `Dungeon_${d.uniqueName}`;
        inoutInt(save, `${name}_clearNum`, d.clearNum, load => d.clearNum = load);
    }
    static save(d) { this.inout(true, d); }
    static load(d) { this.inout(false, d); }
}
class SavePlayer {
    static inout(save, p) {
        const name = `Player_${p.uniqueName}`;
        const u = p.ins;
        inoutBool(save, `${name}_exists`, u.exists, load => u.exists = load);
        inoutBool(save, `${name}_dead`, u.dead, load => u.dead = load);
        for (const prm of Prm.values()) {
            inoutInt(save, `${name}_prm_${prm}_base`, u.prm(prm).base | 0, load => u.prm(prm).base = load);
            inoutInt(save, `${name}_prm_${prm}_eq`, u.prm(prm).eq | 0, load => u.prm(prm).eq = load);
            inoutInt(save, `${name}_prm_${prm}_battle`, u.prm(prm).battle | 0, load => u.prm(prm).battle = load);
        }
        for (const pos of EqPos.values()) {
            inoutStr(save, `${name}_eq_${pos}`, u.getEq(pos).uniqueName, load => {
                const eq = Eq.valueOf(load);
                if (eq) {
                    u.setEq(eq);
                }
            });
        }
        inoutStr(save, `${name}_job`, u.job.uniqueName, load => {
            const job = Job.valueOf(load);
            if (job) {
                u.job = job;
            }
        });
        let tecLen = u.tecs.length;
        inoutInt(save, `${name}_tec_length`, u.tecs.length, load => tecLen = load);
        u.tecs.length = tecLen;
        for (let i = 0; i < u.tecs.length; i++) {
            if (!u.tecs[i]) {
                u.tecs[i] = Tec.empty;
            }
        }
        for (let i = 0; i < tecLen; i++) {
            const key = `${name}_tec_${i}`;
            const value = u.tecs[i].uniqueName;
            if (u.tecs[i] === Tec.empty) {
                inoutStr(save, key, value, load => u.tecs[i] = Tec.empty);
            }
            else if (u.tecs[i] instanceof PassiveTec) {
                inoutStr(save, key, value, load => {
                    const tec = PassiveTec.valueOf(load);
                    if (tec) {
                        u.tecs[i] = tec;
                    }
                });
            }
            else if (u.tecs[i] instanceof ActiveTec) {
                inoutStr(save, key, value, load => {
                    const tec = ActiveTec.valueOf(load);
                    if (tec) {
                        u.tecs[i] = tec;
                    }
                });
            }
        }
        for (const tec of PassiveTec.values()) {
            inoutBool(save, `${name}_masteredPassiveTec_${tec.uniqueName}`, u.isMasteredTec(tec), load => {
                u.setMasteredTec(tec, load);
            });
        }
        for (const tec of ActiveTec.values()) {
            inoutBool(save, `${name}_masteredActiveTec_${tec.uniqueName}`, u.isMasteredTec(tec), load => {
                u.setMasteredTec(tec, load);
            });
        }
        for (const job of Job.values()) {
            inoutInt(save, `${name}_${job.uniqueName}_exp`, u.getJobExp(job), load => {
                u.setJobExp(job, load);
            });
            inoutInt(save, `${name}_${job.uniqueName}_lv`, u.getJobLv(job), load => {
                u.setJobLv(job, load);
            });
        }
        { //condition
            let savedConditions = [];
            for (const type of ConditionType.values()) {
                const set = u.getConditionSet(type);
                const loadSet = { condition: Condition.empty, value: 0 };
                inoutStr(save, `${name}_condition_${type}_condition`, set.condition.uniqueName, load => {
                    const condition = Condition.valueOf(load);
                    if (condition) {
                        loadSet.condition = condition;
                    }
                });
                inoutInt(save, `${name}_condition_${type}_value`, set.value, load => loadSet.value = load);
                savedConditions.push(loadSet);
            }
            if (!save) {
                for (let set of savedConditions) {
                    u.setCondition(set.condition, set.value);
                }
            }
        }
    }
    static save(p) { this.inout(true, p); }
    static load(p) { this.inout(false, p); }
}
class SavePlayData {
    static inout(save) {
        const name = `PlayData`;
        inoutInt(save, `${name}_yen`, PlayData.yen, load => PlayData.yen = load);
        inoutBool(save, `${name}_masteredAnyJob`, PlayData.masteredAnyJob, load => PlayData.masteredAnyJob = load);
    }
    static save(d) { this.inout(true); }
    static load(d) { this.inout(false); }
}
