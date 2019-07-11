var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RatioLayout } from "./layout.js";
import { Input } from "./input.js";
export class Scene {
    constructor() {
        this.layout = new RatioLayout();
    }
    static getBefore() {
        return this.before;
    }
    static get now() { return this._now; }
    /**内部でinit()を呼ぶ。 */
    static load(scene) {
        this.set(scene);
        scene.init();
    }
    /**内部でinit()を呼ばない。 */
    static set(scene) {
        this.before = this._now;
        Input.update();
        this._now = scene;
    }
    static isWaiting() { return this.waiting; }
    static wait(_waiting, waitMS = 1000 / 30) {
        return __awaiter(this, void 0, void 0, function* () {
            const _wait = () => new Promise(resolve => setTimeout(resolve, waitMS));
            this.waiting = true;
            while (_waiting()) {
                Input.update();
                yield _wait();
            }
            this.waiting = false;
        });
    }
    clear() {
        this.layout.clear();
    }
    add(bounds, l) {
        this.layout.add(bounds, l);
    }
    ctrl(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.layout.ctrl(bounds);
        });
    }
    draw(bounds) {
        this.layout.draw(bounds);
    }
}
Scene.waiting = false;
export const wait = (frame = 6) => __awaiter(this, void 0, void 0, function* () {
    let count = 0;
    yield Scene.wait(() => count++ < frame);
});
// export const pwait = (ms:number = 120) => new Promise(resolve => setTimeout(resolve, ms));
export const cwait = () => __awaiter(this, void 0, void 0, function* () {
    let canPush = false;
    yield Scene.wait(() => {
        if (canPush && Input.pushed()) {
            return false;
        }
        if (!Input.holding()) {
            canPush = true;
        }
        return true;
    });
});
