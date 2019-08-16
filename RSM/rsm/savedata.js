import { Item } from "./item.js";
import { Eq, EqPos } from "./eq.js";
import { Dungeon } from "./dungeon/dungeon.js";
import { Prm, Unit } from "./unit.js";
import { Player } from "./player.js";
import { Tec, PassiveTec, ActiveTec } from "./tec.js";
import { Job } from "./job.js";
import { ConditionType, Condition } from "./condition.js";
import { PlayData, SceneType, Util } from "./util.js";
import { Color } from "./undym/type.js";
import { Building } from "./building.js";
export class SaveData {
    static exists() {
        return window.localStorage.getItem(this.existsSaveData) !== null;
    }
    static delete() {
        window.localStorage.clear();
    }
    /** */
    static save() {
        if (!this.exists()) {
            window.localStorage.setItem(this.existsSaveData, "true");
        }
        this.io(/*save*/ true);
        Util.msg.set("セーブしました", Color.CYAN.bright);
    }
    /**全セーブデータ読み込み。 */
    static load() {
        this.io(/*save*/ false);
    }
    static io(save) {
        Item.values().forEach(item => strageItem(save, item));
        Eq.values().forEach(eq => strageEq(save, eq));
        Dungeon.values().forEach(d => strageDungeon(save, d));
        Player.values().forEach(p => stragePlayer(save, p));
        Building.values().forEach(b => strageBuilding(save, b));
        stragePlayData(save);
    }
}
SaveData.existsSaveData = "existsSaveData";
const ioInt = (save, key, value, loadAction) => {
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
                console.log(`ioInt(), parseFail, "${key}":${strage}`);
            }
        }
    }
};
const ioBool = (save, key, value, loadAction) => {
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
const ioStr = (save, key, value, loadAction) => {
    if (save) {
        window.localStorage.setItem(key, value);
    }
    else {
        const strage = window.localStorage.getItem(key);
        if (strage) {
            loadAction(strage);
        }
    }
};
const strageItem = (save, item) => {
    const name = `${strageItem.name}_${item.uniqueName}`;
    ioInt(save, `${name}_num`, item.num, load => item.num = load);
    ioInt(save, `${name}_totalGetNum`, item.totalGetNum, load => item.totalGetNum = load);
    ioInt(save, `${name}_usedNum`, item.usedNum, load => item.usedNum = load);
    const mix = item.mix;
    if (mix) {
        ioInt(save, `${name}_mixCount`, mix.count, load => mix.count = load);
    }
};
const strageEq = (save, eq) => {
    const name = `${strageEq.name}_${eq.uniqueName}`;
    ioInt(save, `${name}_num`, eq.num, load => eq.num = load);
    ioInt(save, `${name}_totalGetNum`, eq.totalGetNum, load => eq.totalGetNum = load);
    const mix = eq.mix;
    if (mix) {
        ioInt(save, `${name}_mixCount`, mix.count, load => mix.count = load);
    }
};
const strageDungeon = (save, d) => {
    const name = `${strageDungeon.name}_${d.uniqueName}`;
    ioInt(save, `${name}_clearNum`, d.clearNum, load => d.clearNum = load);
};
const stragePlayer = (save, p) => {
    const name = `${stragePlayer.name}_${p.uniqueName}`;
    ioBool(save, `${name}_player_member`, p.member, load => p.member = load);
    const u = p.ins;
    ioBool(save, `${name}_exists`, u.exists, load => u.exists = load);
    ioBool(save, `${name}_dead`, u.dead, load => u.dead = load);
    for (const prm of Prm.values()) {
        ioInt(save, `${name}_prm_${prm}_base`, u.prm(prm).base | 0, load => u.prm(prm).base = load);
        ioInt(save, `${name}_prm_${prm}_eq`, u.prm(prm).eq | 0, load => u.prm(prm).eq = load);
        ioInt(save, `${name}_prm_${prm}_battle`, u.prm(prm).battle | 0, load => u.prm(prm).battle = load);
    }
    for (const pos of EqPos.values()) {
        ioStr(save, `${name}_eq_${pos}`, u.getEq(pos).uniqueName, load => {
            const eq = Eq.valueOf(load);
            if (eq) {
                u.setEq(pos, eq);
            }
        });
    }
    ioStr(save, `${name}_job`, u.job.uniqueName, load => {
        const job = Job.valueOf(load);
        if (job) {
            u.job = job;
        }
    });
    let tecLen = u.tecs.length;
    ioInt(save, `${name}_tec_length`, u.tecs.length, load => tecLen = load);
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
            ioStr(save, key, value, load => u.tecs[i] = Tec.empty);
        }
        else if (u.tecs[i] instanceof PassiveTec) {
            ioStr(save, key, value, load => {
                const tec = PassiveTec.valueOf(load);
                if (tec) {
                    u.tecs[i] = tec;
                }
            });
        }
        else if (u.tecs[i] instanceof ActiveTec) {
            ioStr(save, key, value, load => {
                const tec = ActiveTec.valueOf(load);
                if (tec) {
                    u.tecs[i] = tec;
                }
            });
        }
    }
    for (const tec of PassiveTec.values()) {
        ioBool(save, `${name}_masteredPassiveTec_${tec.uniqueName}`, u.isMasteredTec(tec), load => {
            u.setMasteredTec(tec, load);
        });
    }
    for (const tec of ActiveTec.values()) {
        ioBool(save, `${name}_masteredActiveTec_${tec.uniqueName}`, u.isMasteredTec(tec), load => {
            u.setMasteredTec(tec, load);
        });
    }
    for (const job of Job.values()) {
        ioInt(save, `${name}_${job.uniqueName}_exp`, u.getJobExp(job), load => {
            u.setJobExp(job, load);
        });
        ioInt(save, `${name}_${job.uniqueName}_lv`, u.getJobLv(job), load => {
            u.setJobLv(job, load);
        });
    }
    { //condition
        let savedConditions = [];
        for (const type of ConditionType.values()) {
            const set = u.getConditionSet(type);
            const loadSet = { condition: Condition.empty, value: 0 };
            ioStr(save, `${name}_condition_${type.uniqueName}_condition`, set.condition.uniqueName, load => {
                const condition = Condition.valueOf(load);
                if (condition) {
                    loadSet.condition = condition;
                }
            });
            ioInt(save, `${name}_condition_${type.uniqueName}_value`, set.value, load => loadSet.value = load);
            savedConditions.push(loadSet);
        }
        if (!save) {
            for (let set of savedConditions) {
                u.setCondition(set.condition, set.value);
            }
        }
    }
};
const strageBuilding = (save, b) => {
    if (!b.mix) {
        return;
    }
    const mix = b.mix;
    const name = `${strageBuilding.name}_${b.uniqueName}`;
    ioInt(save, `${name}_mixCount`, mix.count, load => {
        mix.count = load;
    });
};
const stragePlayData = (save) => {
    const name = `${stragePlayData.name}`;
    ioInt(save, `${name}_yen`, PlayData.yen, load => PlayData.yen = load);
    ioBool(save, `${name}_masteredAnyJob`, PlayData.masteredAnyJob, load => PlayData.masteredAnyJob = load);
    ioBool(save, `${name}_gotAnyEq`, PlayData.gotAnyEq, load => PlayData.gotAnyEq = load);
    ioStr(save, `${name}_dungeonNow`, Dungeon.now.uniqueName, load => {
        const dungeon = Dungeon.valueOf(load);
        if (dungeon) {
            Dungeon.now = dungeon;
        }
    });
    ioInt(save, `${name}_dungeonAU`, Dungeon.auNow, load => Dungeon.auNow = load);
    ioStr(save, `${name}_sceneType`, SceneType.now.uniqueName, load => {
        const type = SceneType.valueOf(load);
        if (type) {
            type.loadAction();
        }
        else {
            SceneType.TOWN.set();
            SceneType.TOWN.loadAction();
        }
    });
    for (let i = 0; i < Unit.players.length; i++) {
        ioStr(save, `${name}_players_${i}`, Unit.players[i].player.uniqueName, load => {
            const p = Player.valueOf(load);
            if (p) {
                Unit.setPlayer(i, p);
            }
        });
    }
};
