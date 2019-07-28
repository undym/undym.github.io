


import { FieldScene } from "./scene/fieldscene.js";
import { Scene, wait } from "./undym/scene.js";
import {Util} from "./util.js";
import { Input } from "./undym/input.js";
import { Unit } from "./unit.js";
import { FX, FXTest } from "./fx/fx.js";
import { DungeonArea } from "./dungeon/dungeon.js";
import { Player } from "./player.js";
import { Rect, Color, Point } from "./undym/type.js";
import { Page } from "./undym/page.js";
import DungeonEvent from "./dungeon/dungeonevent.js";
import { TecType, ActiveTec } from "./tec.js";
import { Graphics, Texture, Font } from "./graphics/graphics.js";
import { Item } from "./item.js";



window.onload = ()=>{
    console.log("start");

    Page.init();

    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const rotate = false;
    // const rotate:boolean = window.navigator.userAgent.indexOf("Mobile") !== -1;
    
    // if(rotate){
    //     canvas.style.width = "100vh";
    //     canvas.style.height = "100vw";
    //     canvas.style.transformOrigin = "top left";
    //     canvas.style.transform = "translateX(100vw) rotate(90deg)";
    // }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const texture = new Texture({canvas:canvas});
    Graphics.setRenderTarget(texture);
    Input.init(canvas, rotate);
    Util.init();
    Unit.init();

    newGame();

    async function ctrl(){
        await Scene.now.ctrl(Rect.FULL);
        
        Input.update();
        setTimeout(ctrl, 1000 / 30);
    }

    function draw(){
        Graphics.fillRect(Rect.FULL, Color.BLACK);
        Scene.now.draw(Rect.FULL);

        FX.draw();
    }

    Scene.load( FieldScene.ins );
    ctrl();
    setInterval( draw, 1000 / 30 );

};



const newGame = ()=>{

    //test
    Unit.setPlayer(0, Player.ルイン.ins);
    Unit.setPlayer(1, Player.ピアー.ins);

    Item.スティックパン.num = 5;
    Item.スティックパン.totalGetNum = Item.スティックパン.num;

    DungeonArea.now = DungeonArea.再構成トンネル;
};