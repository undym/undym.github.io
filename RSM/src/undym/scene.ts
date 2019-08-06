

import {ILayout,Label, RatioLayout} from "./layout.js";
import { Rect } from "./type.js";
import { Input } from "./input.js";
import { Page } from "./page.js";
import { Graphics } from "../graphics/graphics.js";


export abstract class Scene{
    private static before:Scene;
    static getBefore():Scene{
        return this.before;
    }

    private static _now:Scene;
    static get now():Scene{return this._now;}
    /**内部でinit()を呼ぶ。 */
    static load(scene:Scene){
        this.set(scene);
        scene.init();
    }
    /**内部でinit()を呼ばない。 */
    static set(scene:Scene){
        this.before = this._now;

        Input.update();
        this._now = scene;
    }
    
    private static waiting = false;
    static isWaiting(){return this.waiting;}

    static async wait(_waiting:()=>boolean, waitMS:number = 1000 / 30){
        const _wait = ()=> new Promise(resolve => setTimeout(resolve, waitMS));
        this.waiting = true;
        while(_waiting()){
            Input.update();
            await _wait();
        }
        this.waiting = false;
    }

    private layout:RatioLayout;

    constructor(){
        this.layout = new RatioLayout();
    }

    abstract init():void;
    
    clear(){
        this.layout.clear();
    }

    add(bounds:Rect, l:ILayout){
        this.layout.add(bounds, l);
    }
    
    async ctrl(bounds:Rect){
        await this.layout.ctrl(bounds);
    }

    draw(bounds:Rect){
        this.layout.draw(bounds);
    }

}


export const wait = async(frame:number = 5)=>{
    let count = 0;
    await Scene.wait(()=> count++ < frame);
};

export const cwait = async()=>{
    let canPush = false;
    await Scene.wait(()=>{
        if(canPush && Input.holding() > 0){
            return false;
        }
        if(Input.holding() === 0){
            canPush = true;
        }
        return true;
    });
};
