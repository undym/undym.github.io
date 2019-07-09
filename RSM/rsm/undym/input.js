import { Point } from "./type.js";
export class Input {
    static init(canvas, rotate) {
        this.canvas = canvas;
        const setXYMouse = (ev) => {
            let rect = this.canvas.getBoundingClientRect();
            if (rotate) {
                this._x = ev.clientY - rect.left;
                this._y = this.canvas.clientHeight - ev.clientX - rect.top;
            }
            else {
                this._x = ev.clientX - rect.left;
                this._y = ev.clientY - rect.top;
            }
        };
        const setXYTouch = (ev) => {
            let rect = this.canvas.getBoundingClientRect();
            if (rotate) {
                this._x = ev.touches[0].clientY - rect.top;
                this._y = this.canvas.clientHeight - ev.touches[0].clientX - rect.left;
            }
            else {
                this._x = ev.touches[0].clientX - rect.left;
                this._y = ev.touches[0].clientY - rect.top;
            }
        };
        this.canvas.addEventListener("mousedown", (ev) => {
            if (this.touch) {
                return;
            }
            this._holding = true;
            setXYMouse(ev);
        });
        this.canvas.addEventListener("mouseup", (ev) => {
            if (this.touch) {
                return;
            }
            this._holding = false;
            this.hold = 0;
            setXYMouse(ev);
        });
        this.canvas.addEventListener("mouseout", (ev) => {
            if (this.touch) {
                return;
            }
            this._holding = false;
            this.hold = 0;
        });
        this.canvas.addEventListener("click", (ev) => {
            if (this.touch) {
                return;
            }
            this._pushed = true;
            setXYMouse(ev);
        });
        this.canvas.addEventListener("mousemove", (ev) => {
            if (this.touch) {
                return;
            }
            setXYMouse(ev);
        });
        this.canvas.addEventListener("touchstart", (ev) => {
            this.touch = true;
            this._holding = true;
            if (ev.touches.length >= 2) {
                return;
            }
            setXYTouch(ev);
        });
        this.canvas.addEventListener("touchmove", (ev) => {
            ev.preventDefault();
            if (ev.touches.length >= 2) {
                return;
            }
            setXYTouch(ev);
        });
        this.canvas.addEventListener("touchend", (ev) => {
            this._holding = false;
            this.hold = 0;
            if (ev.touches.length >= 2) {
                return;
            }
            this._pushed = true;
            setXYTouch(ev);
        });
    }
    static update() {
        this._pushed = false;
        if (this._holding) {
            this.hold++;
        }
    }
    static clear() {
        this._pushed = false;
        this.hold = 0;
    }
    static get point() { return new Point(this.x, this.y); }
    static get x() { return this._x / this.canvas.clientWidth; }
    static get y() { return this._y / this.canvas.clientHeight; }
    /**押されたフレームはtrue. */
    static pushed() { return this._pushed; }
    static holding() { return this.hold; }
}
Input._x = 0;
Input._y = 0;
Input.hold = 0;
Input._holding = false;
