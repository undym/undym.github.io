var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ILayout } from "../undym/layout.js";
import { GL } from "../gl/gl.js";
import { Color } from "../undym/type.js";
import { Input } from "../undym/input.js";
import { Font } from "../gl/glstring.js";
export class Btn extends ILayout {
    constructor(name, push) {
        super();
        this.cursorON = false;
        if (typeof name === "string") {
            this.name = () => name;
        }
        else if (typeof name === "function") {
            this.name = name;
        }
        this.push = push;
        this.font = Font.getDef();
        this.groundColor = () => Color.BLACK;
        this.frameColor = () => Color.L_GRAY;
        this.stringColor = () => Color.WHITE;
        this.groundColor = () => new Color(0.8, 0.8, 0.8);
        this.frameColor = () => new Color(0.5, 0.5, 0.5);
        this.stringColor = () => Color.BLACK;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            let contains = bounds.contains(Input.point);
            this.cursorON = contains && Input.holding() > 0;
            if (contains) {
                if (Input.pushed()) {
                    yield this.push();
                }
            }
        });
    }
    drawInner(bounds) {
        GL.fillRect(bounds, this.cursorON ? this.groundColor().darker() : this.groundColor());
        GL.drawRect(bounds, this.frameColor());
        this.font.draw(this.name(), bounds.center, this.stringColor(), Font.CENTER);
    }
}
