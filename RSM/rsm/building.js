import { Mix } from "./mix.js";
import { Item } from "./item.js";
import { Player } from "./player.js";
export class Building {
    constructor(args) {
        this.uniqueName = args.uniqueName;
        this.toString = () => this.uniqueName;
        this.info = args.info;
        Building._values.push(this);
    }
    static values() { return this._values; }
    get mix() { return this._mix ? this._mix : (this._mix = this.createMix()); }
    createMix() { return undefined; }
}
Building._values = [];
(function (Building) {
    Building.よしこ = new class extends Building {
        constructor() { super({ uniqueName: "よしこ", info: ["よしこが仲間になる"] }); }
        createMix() {
            return new Mix({
                materials: [[Item.再構成トンネルの玉, 1]],
                limit: () => 1,
                action: () => {
                    Player.よしこ.join();
                }
            });
        }
    };
})(Building || (Building = {}));
