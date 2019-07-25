var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { Place } from "../util.js";
import { DrawSTBoxes, DrawUnitDetail } from "./sceneutil.js";
import { ILayout, VariableLayout, FlowLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit } from "../unit.js";
import { List } from "../widget/list.js";
import { Rect, Color } from "../undym/type.js";
import { ItemParentType } from "../item.js";
import { Input } from "../undym/input.js";
import { Graphics, Font } from "../graphics/graphics.js";
export class ItemScene extends Scene {
    static ins(args) {
        this._ins ? this._ins : (this._ins = new ItemScene());
        this._ins.selectUser = args.selectUser;
        this._ins.user = args.user;
        this._ins.use = args.use;
        this._ins.returnScene = args.returnScene;
        return this._ins;
    }
    constructor() {
        super();
        this.list = new List();
    }
    init() {
        this.selectedItem = undefined;
        super.clear();
        const listBounds = new Rect(0, 0, 0.5, 0.8);
        const infoBounds = new Rect(listBounds.xw, 0, 1 - listBounds.w, 0.25);
        const btnBounds = new Rect(infoBounds.x, infoBounds.yh, infoBounds.w, listBounds.yh - infoBounds.yh);
        const pboxBounds = new Rect(Place.P_BOX.x, listBounds.yh, Place.P_BOX.w, 1 - listBounds.yh);
        super.add(listBounds, this.list);
        super.add(infoBounds, ILayout.createDraw((bounds) => {
            Graphics.fillRect(bounds, Color.D_GRAY);
            if (this.selectedItem === undefined) {
                return;
            }
            let item = this.selectedItem;
            let font = Font.getDef();
            let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
            font.draw(`[${item}]`, p, Color.WHITE);
            font.draw(`所持数:${item.num}個`, p = p.move(0, font.ratioH), Color.WHITE);
            font.draw(`<${item.itemType}>`, p = p.move(0, font.ratioH), Color.WHITE);
            font.draw(`Rank:${item.rank}`, p = p.move(0, font.ratioH), Color.WHITE);
            p = p.move(0, font.ratioH);
            for (let s of item.info) {
                font.draw(s, p = p.move(0, font.ratioH), Color.WHITE);
            }
        }));
        super.add(btnBounds, (() => {
            const l = new FlowLayout(2, 4);
            for (let type of ItemParentType.values()) {
                l.add(new Btn(type.toString(), () => {
                    this.setList(type);
                }));
            }
            l.addFromLast(new Btn("<<", () => {
                this.returnScene();
            }));
            const canUse = new Btn(() => "使用", () => __awaiter(this, void 0, void 0, function* () {
                yield this.use(this.selectedItem, this.user);
            }));
            const cantUse = new Btn(() => "使用", () => { });
            cantUse.stringColor = () => Color.GRAY;
            l.addFromLast(new VariableLayout(() => {
                if (this.selectedItem === undefined || !this.selectedItem.canUse()) {
                    return cantUse;
                }
                return canUse;
            }));
            return l;
        })());
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
        super.add(Rect.FULL, ILayout.createDraw((noUsed) => {
            Graphics.fillRect(this.user.bounds, new Color(0, 1, 1, 0.2));
        }));
        super.add(Rect.FULL, ILayout.createCtrl((noUsed) => {
            if (!this.selectUser) {
                return;
            }
            if (!Input.pushed()) {
                return;
            }
            for (let p of Unit.players.filter(p => p.exists)) {
                if (p.bounds.contains(Input.point)) {
                    this.user = p;
                    break;
                }
            }
        }));
        this.setList(ItemParentType.回復);
    }
    setList(parentType) {
        this.list.clear();
        for (let type of parentType.children) {
            this.list.add({
                center: () => `${type}`,
                groundColor: () => Color.D_GRAY,
            });
            for (let item of type.values().filter(item => item.num > 0)) {
                const color = () => this.selectedItem === item ? Color.CYAN : Color.WHITE;
                this.list.add({
                    left: () => {
                        if (item.consumable) {
                            return `${item.num - item.usedNum}/${item.num}`;
                        }
                        return `${item.num}`;
                    },
                    leftColor: color,
                    right: () => `${item}`,
                    rightColor: color,
                    push: (elm) => {
                        this.selectedItem = item;
                    },
                });
            }
        }
    }
}
