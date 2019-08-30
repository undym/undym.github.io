var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ILayout } from "../undym/layout.js";
import { Rect, Color } from "../undym/type.js";
import { Input } from "../undym/input.js";
import { Font, Graphics } from "../graphics/graphics.js";
export class Btn extends ILayout {
    constructor(name, push) {
        super();
        this.cursorON = false;
        this.count = 0;
        this.noMove = false;
        if (typeof name === "string") {
            this.name = () => name;
        }
        else if (typeof name === "function") {
            this.name = name;
        }
        this.push = push;
        this.font = Font.def;
        this.groundColor = () => Color.BLACK;
        this.frameColor = () => Color.L_GRAY;
        this.stringColor = () => Color.WHITE;
        this.groundColor = () => new Color(0.8, 0.8, 0.8);
        this.frameColor = () => new Color(0.5, 0.5, 0.5);
        this.stringColor = () => Color.BLACK;
    }
    setNoMove() {
        this.noMove = true;
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            let contains = bounds.contains(Input.point);
            this.cursorON = contains && Input.holding > 0;
            if (contains) {
                if (Input.pushed) {
                    yield this.push();
                }
            }
        });
    }
    drawInner(bounds) {
        const moveLim = bounds.w / 2;
        let move = moveLim - moveLim * this.count / (this.count + 1);
        if (this.noMove) {
            move = 0;
        }
        let rect = new Rect(bounds.x - move, bounds.y, bounds.w, bounds.h);
        Graphics.fillRect(rect, this.cursorON ? this.groundColor().darker() : this.groundColor());
        Graphics.drawRect(rect, this.frameColor());
        this.font.draw(this.name(), rect.center, this.stringColor(), Font.CENTER);
        this.count += 4;
    }
}
