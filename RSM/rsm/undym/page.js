export class Page {
    constructor() { }
    static isRunning() { return this.running; }
    static init() {
        window.addEventListener("beforeunload", ev => {
            this.running = false;
            ev.preventDefault();
            return "";
        });
    }
}
Page.running = true;
