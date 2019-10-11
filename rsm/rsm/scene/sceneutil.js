import { ILayout, Label, XLayout, Layout, VariableLayout, InnerLayout } from "../undym/layout.js";
import { YLayout } from "../undym/layout.js";
import Gage from "../widget/gage.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { Color } from "../undym/type.js";
import { PlayData, Debug } from "../util.js";
import { Unit, Prm, PUnit } from "../unit.js";
import { Input } from "../undym/input.js";
import { ConditionType } from "../condition.js";
import { EqPos } from "../eq.js";
import { Font, Graphics } from "../graphics/graphics.js";
import { Version } from "../savedata.js";
export class DrawPlayInfo extends InnerLayout {
    static get ins() {
        return this._ins ? this._ins
            : (this._ins = new DrawPlayInfo());
    }
    constructor() {
        super();
        super.add(new XLayout()
            .add(ILayout.empty)
            .add(new Label(Font.def, () => {
            if (Debug.debugMode) {
                return `Debug{${Version.NOW}}`;
            }
            else {
                return `Version{${Version.NOW}}`;
            }
        }, () => Debug.DEBUG ? Color.RED : Color.WHITE)
            .setBase(Font.LEFT))
            .add(new Label(Font.def, () => `${PlayData.yen | 0}円`, () => Color.YELLOW).setBase(Font.RIGHT)));
    }
}
export class DrawDungeonData extends InnerLayout {
    static get ins() { return this._ins ? this._ins : (this._ins = new DrawDungeonData()); }
    constructor() {
        super();
        super.add(new YLayout()
            .setOutsidePixelMargin(1, 1, 2, 1)
            .add(ILayout.empty)
            .add(new Label(Font.def, () => `[${Dungeon.now}] Rank:${Dungeon.now.rank}`))
            .add(new Gage(() => Dungeon.auNow, () => Dungeon.now.au, () => "AU", () => `${Dungeon.auNow}/${Dungeon.now.au}`, () => Color.D_CYAN.bright(), Font.def, 2))
            .add(ILayout.empty));
    }
}
export class DrawSTBox extends InnerLayout {
    constructor(getUnit) {
        super();
        const font = new Font(30);
        const frame = ILayout.create({ draw: (bounds) => {
                Graphics.drawRect(bounds, Color.L_GRAY);
            } });
        const l = new Layout()
            .add(frame)
            .add(new YLayout()
            .setOutsidePixelMargin(1, 1, 1, 1)
            .add(new XLayout()
            .add(new Label(font, () => getUnit().name))
            .add(new Label(font, () => `Lv${getUnit().prm(Prm.LV).total | 0}`, () => {
            const u = getUnit();
            return (u instanceof PUnit && u.isMasteredJob(u.job)) ? Color.YELLOW : Color.WHITE;
        }).setBase(Font.RIGHT)))
            .add(new Gage(() => getUnit().hp, () => getUnit().prm(Prm.MAX_HP).total, () => "HP", () => `${getUnit().hp | 0}`, () => Color.D_GREEN.bright(), font))
            .add(new XLayout()
            .setPixelMargin(4)
            .add(new Gage(() => getUnit().prm(Prm.MP).base, () => getUnit().prm(Prm.MAX_MP).total, () => "MP", () => `${getUnit().prm(Prm.MP).base | 0}`, () => Color.D_RED.bright(), font))
            .add(new Gage(() => getUnit().prm(Prm.TP).base, () => getUnit().prm(Prm.MAX_TP).total, () => "TP", () => `${getUnit().prm(Prm.TP).base | 0}`, () => Color.D_CYAN.bright(), font)))
            .add(createConditionLabel(font, getUnit, ConditionType.goodConditions(), Color.CYAN))
            .add(createConditionLabel(font, getUnit, ConditionType.badConditions(), Color.RED))
            .add(ILayout.empty))
            .add(ILayout.create({ draw: (bounds) => {
                if (getUnit().dead) {
                    Graphics.fillRect(bounds, new Color(1, 0, 0, 0.2));
                }
            } }));
        super.add(new VariableLayout(() => {
            if (getUnit().exists) {
                return l;
            }
            return frame;
        }));
    }
}
export class DrawSTBoxes extends InnerLayout {
    static get players() {
        return this._players ? this._players
            : (this._players = new DrawSTBoxes(Unit.players.length, i => Unit.players[i]));
    }
    static get enemies() {
        return this._enemies ? this._enemies
            : (this._enemies = new DrawSTBoxes(Unit.enemies.length, i => Unit.enemies[i]));
    }
    constructor(len, getUnit) {
        super();
        super.add(new Layout()
            .add((() => {
            let x = new XLayout()
                .setPixelMargin(2);
            for (let i = 0; i < len; i++) {
                x.add(new Layout()
                    .add(new DrawSTBox(() => getUnit(i)))
                    .add(ILayout.create({ draw: (bounds) => {
                        getUnit(i).bounds = bounds;
                    } })));
            }
            return x;
        })())
            .add(ILayout.create({ ctrl: (bounds) => {
                if (Input.holding < 4) {
                    return;
                }
                for (let i = 0; i < len; i++) {
                    const u = getUnit(i);
                    if (!u.exists) {
                        continue;
                    }
                    if (!u.bounds.contains(Input.point)) {
                        continue;
                    }
                    DrawUnitDetail.target = u;
                    break;
                }
            } })));
    }
}
export class DrawUnitDetail extends InnerLayout {
    static get ins() { return this._ins ? this._ins : (this._ins = new DrawUnitDetail()); }
    constructor() {
        super();
        const font = Font.def;
        const getUnit = () => DrawUnitDetail.target;
        const frame = ILayout.create({ draw: (bounds) => {
                Graphics.fillRect(bounds, Color.D_GRAY);
            } });
        const l = new Layout()
            .add(frame)
            .add(new XLayout()
            .setOutsidePixelMargin(1, 1, 1, 1)
            .setPixelMargin(2)
            .add(new YLayout()
            .add(new XLayout()
            .add(new Label(font, () => getUnit().name))
            .add(new Label(font, () => `Lv${getUnit().prm(Prm.LV).total | 0}`).setBase(Font.RIGHT)))
            .add(new Gage(() => getUnit().hp, () => getUnit().prm(Prm.MAX_HP).total, () => "HP", () => `${getUnit().hp | 0}`, () => Color.D_GREEN.bright(), font))
            .add(new XLayout()
            .setPixelMargin(4)
            .add(new Gage(() => getUnit().prm(Prm.MP).base, () => getUnit().prm(Prm.MAX_MP).total, () => "MP", () => `${getUnit().prm(Prm.MP).base | 0}`, () => Color.D_RED.bright(), font))
            .add(new Gage(() => getUnit().prm(Prm.TP).base, () => getUnit().prm(Prm.MAX_TP).total, () => "TP", () => `${getUnit().prm(Prm.TP).base | 0}`, () => Color.D_CYAN.bright(), font)))
            .add(createConditionLabel(font, getUnit, ConditionType.goodConditions(), Color.CYAN))
            .add(createConditionLabel(font, getUnit, ConditionType.badConditions(), Color.RED))
            .add(ILayout.empty)
            .add(ILayout.empty))
            .add(new YLayout()
            .add(new Label(font, () => {
            const unit = getUnit();
            if (unit instanceof PUnit) {
                const nextLvExp = unit.getNextLvExp();
                let percent = nextLvExp === 0
                    ? 0
                    : Math.floor(100 * getUnit().prm(Prm.EXP).base / unit.getNextLvExp());
                return `EXP:${percent}%`;
            }
            return "EXP:-";
        }))
            .add(new Label(font, () => {
            let u = getUnit();
            if (u instanceof PUnit) {
                return u.isMasteredJob(u.job)
                    ? `${getUnit().job}:★`
                    : `${getUnit().job}:Lv${u.getJobLv(u.job)}`;
            }
            return `${getUnit().job}`;
        }))
            .add(new XLayout()
            .add(new Label(font, () => `力:${getUnit().prm(Prm.STR).total}`))
            .add(new Label(font, () => `魔:${getUnit().prm(Prm.MAG).total}`)))
            .add(new XLayout()
            .add(new Label(font, () => `光:${getUnit().prm(Prm.LIG).total}`))
            .add(new Label(font, () => `闇:${getUnit().prm(Prm.DRK).total}`)))
            .add(new XLayout()
            .add(new Label(font, () => `鎖:${getUnit().prm(Prm.CHN).total}`))
            .add(new Label(font, () => `過:${getUnit().prm(Prm.PST).total}`)))
            .add(new XLayout()
            .add(new Label(font, () => `銃:${getUnit().prm(Prm.GUN).total}`))
            .add(new Label(font, () => `弓:${getUnit().prm(Prm.ARR).total}`)))
            .add(new Label(font, () => `EP:${getUnit().ep}`))
            .add(ILayout.empty))
            .add((() => {
            let infoIsEar = true;
            let infoEarIndex = 0;
            let infoPos = EqPos.頭;
            let y = new YLayout();
            for (let i = 0; i < Unit.EAR_NUM; i++) {
                y.add(new Layout()
                    .add(ILayout.create({ draw: (bounds) => {
                        if (infoIsEar && infoEarIndex === i) {
                            Graphics.fillRect(bounds, Color.YELLOW.darker().darker());
                        }
                    } }))
                    .add(new Label(font, () => `耳:${getUnit().getEqEar(i)}`))
                    .add(ILayout.create({ ctrl: (bounds) => {
                        if (Input.holding > 0 && bounds.contains(Input.point)) {
                            infoIsEar = true;
                            infoEarIndex = i;
                        }
                    } })));
            }
            for (let pos of EqPos.values()) {
                y.add(new Layout()
                    .add(ILayout.create({ draw: (bounds) => {
                        if (!infoIsEar && pos === infoPos) {
                            Graphics.fillRect(bounds, Color.YELLOW.darker().darker());
                        }
                    } }))
                    .add(new Label(font, () => `${pos}:${getUnit().getEq(pos)}`))
                    .add(ILayout.create({ ctrl: (bounds) => {
                        if (Input.holding > 0 && bounds.contains(Input.point)) {
                            infoIsEar = false;
                            infoPos = pos;
                        }
                    } })));
            }
            y.add(new Label(font, () => {
                return infoIsEar ? getUnit().getEqEar(infoEarIndex).info
                    : getUnit().getEq(infoPos).info;
            }, () => Color.L_GRAY));
            return y;
        })()))
            .add(ILayout.create({ ctrl: (bounds) => {
                if (DrawUnitDetail.target && !Input.holding) {
                    DrawUnitDetail.target = undefined;
                }
            } }));
        super.add(new VariableLayout(() => {
            if (DrawUnitDetail.target && DrawUnitDetail.target.exists) {
                return l;
            }
            return ILayout.empty;
        }));
    }
}
const createConditionLabel = (font, unit, types, color) => {
    return new Label(font, () => types
        .filter(type => unit().existsCondition(type))
        .map(type => unit().getConditionSet(type))
        .map(set => `<${set.condition}${set.value | 0}>`)
        .join(""), () => color);
};
