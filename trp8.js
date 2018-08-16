
{

    const MAP = [
        '_______________________________X_________________★',
        '___________________________________X__________X__★',
        '________X________XX____X______X______X________X__★',
    ];


    let dom = {
        map:undefined,
        clear:undefined,
    };

    const DRAW_W = 10;
    const GROUND_Y = MAP.length - 1;

    const DIR_GROUND = 1;
    const DIR_AIR = -1;

    let init = false;
    let run_timer;
    let scroll;
    let player_y;

    let jump;

    let game_running = false;
    let game_over = false;
    

    
    function run(){
        scroll++;

        for(let y = 0; y < MAP.length; y++){
            let dom_x = 0;
            for(let x = scroll; x < scroll + DRAW_W; x++){
                if(x < MAP[y].length){
                    dom.map[y][dom_x].textContent = MAP[y].substr(x,1);   
                }else{
                    dom.map[y][dom_x].textContent = '';
                }
                dom_x ++;
            }
        }

        if(jump){
            player_y += DIR_AIR;
            if(player_y === 0){
                jump = false;
            }
        }else if(player_y < GROUND_Y){
            player_y += DIR_GROUND;
        }

        if(player_y >= 0 && player_y < MAP.length && scroll >= 0 && scroll < MAP[player_y].length){
            if(MAP[player_y].substr(scroll,1) === 'X'){
                
                game_over = true;
                dom.map[player_y][0].textContent = '*';

                return;
            }
            if(MAP[player_y].substr(scroll,1) === '★'){
                
                game_over = true;
                dom.map[player_y][0].textContent = '*';

                dom.clear.textContent = 'クリア★';

                return;
            }
        }

        dom.map[player_y][0].textContent = 'p';

        run_timer = setTimeout( run ,200 );
    }


    function reset(){
        scroll = 0;
        player_y = GROUND_Y;
        jump = false;

        for(let y = 0; y < dom.map.length; y++){
            for(let x = 0; x < dom.map[y].length; x++){
                dom.map[y][x].textContent = '　';
            }
        }

        dom.map[Math.floor(MAP.length / 2)][0].textContent = 'ClickStart';
    }


    createBase2('trp8','trp_story_8','#aaa5a2',(open)=>{
        if(!init){
            init = true;

            dom.map = [];
            for(let y = 0; y < MAP.length; y++){
                let line = [];
                for(let x = 0; x < MAP[y].length; x++){
                    line.push( document.createElement('span') );
                }
                dom.map.push( line );
            }
            
            dom.clear = document.createElement('div');
            dom.clear.textContent = '　';
            //---------------------------
            open.appendChild( document.createElement('br') );
            open.appendChild( document.createElement('div') );

            for(let y = 0; y < dom.map.length; y++){
                let div = document.createElement('div');
                for(let x = 0; x < dom.map[y].length; x++){
                    div.appendChild( dom.map[y][x] );
                }

                open.appendChild( div );
            }

            open.appendChild( document.createElement('br') );
            open.appendChild( dom.clear );
            //---------------------------
            
            open.addEventListener('click',()=>{
                if(game_over){
                    game_over = false;
                    game_running = false;
                    reset();
                    return;
                }
                if(!game_running){
                    game_running = true;
                    run();
                    return;
                }

                if(player_y === GROUND_Y){
                    jump = true;
                }
            });
        }

        reset();

    },(open)=>{
        clearTimeout( run_timer );
    });
}
// {   
//     class Unit{
//         constructor(){
//             this.name = 'def';
//             this.hp = 0;
//             this.hp_max = 0;
//             this.atk = 0;
//             this.hunger = 0;
//             this.hunger_max = 100;
//         }

//         heal(value){
//             this.hp += value;
//             if(this.hp >= this.hp_max){
//                 this.hp = this.hp_max;
//             }
//         }

//         setHP(value){
//             this.hp_max = value;
//             this.hp = value;
//         }
        
//         attack(target){
//             let value = this.atk;
//             target.hp -= value;
//             if(target.hp < 0){
//                 target.hp = 0;
//             }

//             addMsg( this.name+'は'+target.name+'に'+value+'のダメージを与えた' );

//             updateDom();
//         }
//     }

//     let init = false;
//     let dom = {
//         player:undefined,
//         dungeon:undefined,
//         before_choice:undefined,
//         info:undefined,
//         choices:undefined,
//         msg:undefined,
//     };
//     const CHOICE_MAX = 4;
//     const MSG_MAX = 3;
//     const EMPTY_TEXT = '　';

//     const Choices = {
//         dungeon:()=>{
//             clearChoices();

//             dom.info.textContent = EMPTY_TEXT;
//             addChoice('進む'
//                 ,()=>{
//                     player.hunger--;
//                     if(player.hunger <= 0){
//                         player.hunger = 0;

//                         player.hp -= player.hp / 10 + 1;

//                         if(player.hp <= 0){
//                             setGameOver('空腹で死んだ');
//                             return;
//                         }
//                     }

//                     au++;

//                     setRndEvent();

//                     updateDom();
//                 });
//             addChoice('休む' 
//                 ,()=>{
//                     if(player.hunger > 0){
//                         let value = player.hunger < 10 ? player.hunger : 10;
//                         player.hunger -= value;
//                         let heal_value = Math.floor( player.hp / value ) + 1;
//                         player.heal( heal_value );
//                         addMsg(''+heal_value+'回復した');
//                     }else{
//                         addMsg('お腹が減って休めない');
//                     }

//                     updateDom();
//                 });
//         },
//         battle:()=>{
//             clearChoices();
            
//             dom.info.textContent = EMPTY_TEXT;
//             addChoice('殴る'
//                 ,()=>{
//                     player.attack( enemy );
//                     if(enemy.hp <= 0){
//                         addMsg( enemy.name+'は死んだ' );
//                         Choices.dungeon();
//                     }else{
//                         battlePhase('enemy');
//                     }

//                 });
//         },
//     };

//     let au = 0;
    
//     let player = new Unit();
//     let enemy = new Unit();

//     function addMsg(str){
        
//         for(let i = dom.msg.length - 1; i > 0; i--){
//             dom.msg[i].textContent = dom.msg[i-1].textContent;
//         }
//         // for(let i = 0; i < dom.msg.length - 1; i++){
//         //     dom.msg[i].textContent = dom.msg[i+1].textContent;
//         //     dom.msg[i].style.color = dom.msg[i+1].style.color;
//         // }

//         dom.msg[0].textContent = str;
//     }


//     function setEnemy(name){
//         switch(name){
//             case 'しんまい':
//                 enemy.name = 'しんまい';
//                 enemy.setHP(2);
//                 enemy.atk = 1;
//                 break;
//             default:
//                 enemy.name = 'bug?';
//                 enemy.setHP(2);
//                 enemy.atk = 1;
//                 break;
//         }
//     }


//     function clearChoices(){
//         for(let i = 0; i < dom.choices.length; i++){
//             dom.choices[i].textContent = EMPTY_TEXT;
//             dom.choices[i].onclick = ()=>{};
//             dom.choices[i].style.cursor = 'default';
//             dom.choices[i].style.textDecoration = 'none';
//         }
//     }


//     function addChoice(text ,onclick){
//         for(let i = 0; i < dom.choices.length; i++){
//             if(dom.choices[i].textContent === EMPTY_TEXT){
//                 dom.choices[i].textContent = '・'+text;
//                 dom.choices[i].style.cursor = 'pointer';
//                 dom.choices[i].style.textDecoration = 'underline';
//                 dom.choices[i].onclick = ()=>{
//                     dom.before_choice.textContent = '＞'+text;
//                     onclick();
//                 };
//                 break;
//             }
//         }
//     }


//     function setGameOver(info_text){
//         clearChoices();

//         dom.info.textContent = info_text;
//         addChoice('GameOver',()=>{
//             dom.info.textContent = EMPTY_TEXT;
//             dom.before_choice.textContent = EMPTY_TEXT;
//             Choices.dungeon();
//         });
//     }


//     function setRndEvent(){
//         if(Math.random() <= 0.3){
//             setEnemy('しんまい');
//             addMsg( enemy.name+'が現れた' );
//             if(Math.random() <= 0.5){battlePhase('player');}
//             else                    {battlePhase('enemy');}
            
//             return;
//         }
//     }


//     function battlePhase(phase){
//         if(phase === 'player'){
//             Choices.battle();
//         }else{
//             enemy.attack( player );
            
//             if(player.hp <= 0){
//                 addMsg( player.name+'は死んだ' );
//                 reset();
//             }else{
//                 battlePhase('player');
//             }
//         }
//     }


//     function reset(){
//         au = 0;
//         player.name = '自分';
//         player.hp_max = 10;
//         player.hp = player.hp_max;
//         player.atk = 1;
//         player.hunger_max = 100;
//         player.hunger = player.hunger_max;

//         updateDom();

//         Choices.dungeon();
//     }


//     function updateDom(){
//         dom.player.textContent = 'HP:'+(player.hp)+' お腹:'+(player.hunger)+'%';
//         dom.dungeon.textContent = 'AU:'+au;
//     }

    
//     createBase2('trp8','trp_story_8','#d0ffd7',(open)=>{
//         if(!init){
//             init = true;

//             dom.player = document.createElement('div');
//             dom.player.textContent = EMPTY_TEXT;
            
//             dom.dungeon = document.createElement('div');
//             dom.dungeon.textContent = EMPTY_TEXT;
            
//             dom.before_choice = document.createElement('div');
//             dom.before_choice.textContent = EMPTY_TEXT;

//             dom.info = document.createElement('div');

//             dom.choices = [];
//             for(let i = 0; i < CHOICE_MAX; i++){
//                 dom.choices.push( document.createElement('span') );
//             }

//             dom.msg = [];
//             for(let i = 0; i < MSG_MAX; i++){
//                 let a = 1.0 - (1.0 * i / MSG_MAX);
//                 dom.msg.push( document.createElement('span') );
//                 dom.msg[i].textContent = EMPTY_TEXT;
//                 dom.msg[i].style.color = 'rgba(0,0,0,'+a+')';
//             }

//             open.appendChild( dom.player );
//             open.appendChild( dom.dungeon );
//             open.appendChild( dom.before_choice );
//             open.appendChild( dom.info );
//             for(let i = 0; i < dom.choices.length; i++){
//                 let div = document.createElement('div');
//                 div.appendChild( dom.choices[i] );
//                 open.appendChild( div );
//             }
//             for(let i = 0; i < dom.msg.length; i++){
//                 let div = document.createElement('div');
//                 div.appendChild( dom.msg[i] );
//                 open.appendChild( div );
//             }
            
//             reset();
//         }
//     },(open)=>{
//     });
// }