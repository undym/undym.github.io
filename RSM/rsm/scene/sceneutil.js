import { ILayout, Label, XLayout, Layout, VariableLayout, InnerLayout } from "../undym/layout.js";
import { YLayout } from "../undym/layout.js";
import Gage from "../widget/gage.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { Color } from "../undym/type.js";
import { PlayData, Util } from "../util.js";
import { Unit, Prm, PUnit } from "../unit.js";
import { Input } from "../undym/input.js";
import { ConditionType } from "../condition.js";
import { EqPos } from "../eq.js";
import { Font, Graphics } from "../graphics/graphics.js";
export class DrawTop extends InnerLayout {
    static get ins() {
        return this._ins !== undefined ? this._ins
            : (this._ins = new DrawTop());
    }
    constructor() {
        super();
        super.add(new XLayout()
            .add(new Label(Font.getDef(), () => `Version{${Util.VERSION}}`, () => Util.DEBUG ? Color.RED : Color.WHITE)
            .setBase(Font.LEFT))
            .add(new Label(Font.getDef(), () => `${PlayData.yen | 0}円`, () => Color.YELLOW).setBase(Font.RIGHT)));
    }
}
export class DrawDungeonData extends InnerLayout {
    static get ins() {
        return this._ins !== undefined ? this._ins
            : (this._ins = new DrawDungeonData());
    }
    constructor() {
        super();
        super.add(new YLayout()
            .setOutsidePixelMargin(1, 1, 1, 1)
            .add(ILayout.empty)
            .add(new Label(Font.getDef(), () => `[${Dungeon.now}] Rank:${Dungeon.now.getRank()}`))
            .add(new Gage(() => Dungeon.auNow, () => Dungeon.now.getAU(), () => "AU", () => `${Dungeon.auNow}/${Dungeon.now.getAU()}`, () => Color.D_CYAN.bright(0), Font.getDef())));
    }
}
class DrawSTBox extends InnerLayout {
    constructor(getUnit) {
        super();
        const font = new Font(14);
        const frame = ILayout.createDraw((bounds) => {
            Graphics.drawRect(bounds, Color.L_GRAY);
        });
        const l = new Layout()
            .add(frame)
            .add(new YLayout()
            .setOutsidePixelMargin(1, 1, 1, 1)
            .add(new XLayout()
            .add(new Label(font, () => getUnit().name))
            .add(new Label(font, () => `Lv${getUnit().prm(Prm.LV).total() | 0}`).setBase(Font.RIGHT)))
            .add(new Gage(() => getUnit().hp, () => getUnit().prm(Prm.MAX_HP).total(), () => "HP", () => `${getUnit().hp | 0}`, () => Color.D_GREEN.bright(), font))
            .add(new XLayout()
            .setPixelMargin(4)
            .add(new Gage(() => getUnit().prm(Prm.MP).base, () => getUnit().prm(Prm.MAX_MP).total(), () => "MP", () => `${getUnit().prm(Prm.MP).base | 0}%`, () => Color.D_RED.bright(), font))
            .add(new Gage(() => getUnit().prm(Prm.TP).base, () => getUnit().prm(Prm.MAX_TP).total(), () => "TP", () => `${getUnit().prm(Prm.TP).base | 0}%`, () => Color.D_CYAN.bright(), font)))
            //good_conditions
            .add(new Label(font, () => ConditionType.goodConditions()
            .map(type => getUnit().getCondition(type).toString())
            .join(""), () => Color.CYAN))
            //bad_conditions
            .add(new Label(font, () => ConditionType.badConditions()
            .map(type => getUnit().getCondition(type).toString())
            .join(""), () => Color.RED))
            .add(ILayout.empty))
            .add(ILayout.createDraw((bounds) => {
            if (getUnit().dead) {
                Graphics.fillRect(bounds, new Color(1, 0, 0, 0.2));
            }
        }));
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
        return this._players !== undefined ? this._players
            : (this._players = new DrawSTBoxes(Unit.players.length, i => Unit.players[i]));
    }
    static get enemies() {
        return this._enemies !== undefined ? this._enemies
            : (this._enemies = new DrawSTBoxes(Unit.enemies.length, i => Unit.enemies[i]));
    }
    constructor(len, getUnit) {
        super();
        super.add(new Layout()
            .add((() => {
            let y = new YLayout()
                .setPixelMargin(2);
            for (let i = 0; i < len; i++) {
                y.add(new Layout()
                    .add(new DrawSTBox(() => getUnit(i)))
                    .add(ILayout.createDraw((bounds) => {
                    getUnit(i).bounds = bounds;
                })));
            }
            return y;
        })())
            .add(ILayout.createCtrl((noUsed) => {
            if (!Input.holding()) {
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
        })));
    }
}
export class DrawUnitDetail extends InnerLayout {
    static get ins() { return this._ins !== undefined ? this._ins : (this._ins = new DrawUnitDetail()); }
    constructor() {
        super();
        const font = Font.getDef();
        const getUnit = () => DrawUnitDetail.target;
        const frame = ILayout.createDraw((bounds) => {
            Graphics.drawRect(bounds, Color.L_GRAY);
        });
        const l = new Layout()
            .add(frame)
            .add(new XLayout()
            .setOutsidePixelMargin(1, 1, 1, 1)
            .setPixelMargin(2)
            .add(new YLayout()
            .add(new XLayout()
            .add(new Label(font, () => getUnit().name))
            .add(new Label(font, () => `Lv${getUnit().prm(Prm.LV).total() | 0}`).setBase(Font.RIGHT)))
            .add(new Gage(() => getUnit().hp, () => getUnit().prm(Prm.MAX_HP).total(), () => "HP", () => `${getUnit().hp | 0}`, () => Color.D_GREEN.bright(), font))
            .add(new XLayout()
            .setPixelMargin(4)
            .add(new Gage(() => getUnit().prm(Prm.MP).base, () => getUnit().prm(Prm.MAX_MP).total(), () => "MP", () => `${getUnit().prm(Prm.MP).base | 0}%`, () => Color.D_RED.bright(), font))
            .add(new Gage(() => getUnit().prm(Prm.TP).base, () => getUnit().prm(Prm.MAX_TP).total(), () => "TP", () => `${getUnit().prm(Prm.TP).base | 0}%`, () => Color.D_CYAN.bright(), font)))
            .add(new Label(font, () => "")) //good_conditions
            .add(new Label(font, () => "")) //bad_conditions
            .add(ILayout.empty)
            .add(ILayout.empty))
            .add(new YLayout()
            .add(new Label(font, () => {
            const nextLvExp = getUnit().getNextLvExp();
            let percent = nextLvExp === 0
                ? 0
                : Math.floor(100 * getUnit().prm(Prm.EXP).base / getUnit().getNextLvExp());
            return `EXP:${percent}%`;
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
            .add(new Label(font, () => `力:${getUnit().prm(Prm.STR).total()}`))
            .add(new Label(font, () => `魔:${getUnit().prm(Prm.MAG).total()}`)))
            .add(new XLayout()
            .add(new Label(font, () => `光:${getUnit().prm(Prm.LIG).total()}`))
            .add(new Label(font, () => `闇:${getUnit().prm(Prm.DRK).total()}`)))
            .add(new XLayout()
            .add(new Label(font, () => `鎖:${getUnit().prm(Prm.CHN).total()}`))
            .add(new Label(font, () => `過:${getUnit().prm(Prm.PST).total()}`)))
            .add(new XLayout()
            .add(new Label(font, () => `銃:${getUnit().prm(Prm.GUN).total()}`))
            .add(new Label(font, () => `弓:${getUnit().prm(Prm.ARR).total()}`)))
            .add(new Label(font, () => `速度:${getUnit().prm(Prm.SPD).total()}`)))
            .add((() => {
            let infoPos = EqPos.頭;
            let y = new YLayout();
            for (let pos of EqPos.values()) {
                y.add(new Layout()
                    .add(ILayout.createDraw((bounds) => {
                    if (pos === infoPos) {
                        Graphics.fillRect(bounds, Color.YELLOW.darker().darker());
                    }
                }))
                    .add(new Label(font, () => `${pos}:${getUnit().getEq(pos)}`))
                    .add(ILayout.createCtrl((bounds) => {
                    if (Input.holding() > 0 && bounds.contains(Input.point)) {
                        infoPos = pos;
                    }
                })));
            }
            y.add(new Label(font, () => {
                return getUnit().getEq(infoPos).info.join();
            }, () => Color.L_GRAY));
            return y;
        })()));
        super.add(new VariableLayout(() => {
            if (DrawUnitDetail.target !== undefined && DrawUnitDetail.target.exists) {
                return l;
            }
            return frame;
        }));
    }
}
