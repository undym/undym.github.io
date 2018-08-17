
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