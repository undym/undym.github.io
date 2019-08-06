import { Mix } from "./mix.js";
import { Item } from "./item.js";
import { Player } from "./player.js";



export class Building{
    private static _values:Building[] = [];
    static values():ReadonlyArray<Building>{return this._values;}

    readonly uniqueName:string;
    readonly info:string[];

    get mix():Mix|undefined{return this._mix ? this._mix : (this._mix = this.createMix());}
    private _mix:Mix|undefined;
    protected createMix():Mix|undefined{return undefined;}

    private constructor(args:{
        uniqueName:string,
        info:string[],
    }){

        this.uniqueName = args.uniqueName;
        this.toString = ()=>this.uniqueName;
        this.info = args.info;

        Building._values.push(this);
    }

    static readonly                      よしこ = new class extends Building{
        constructor(){super({uniqueName:"よしこ", info:["よしこが仲間になる"]});}
        createMix(){return new Mix({
            materials:[[Item.勾玉, 1]],
            limit:1,
            action:()=>{
                Player.よしこ.join();
            }
        })}
    };
}