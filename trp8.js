

class trp8_Unit{
    constructor(){
        this.name = 'name';
        this.hp = 0;
        this.hp_max = 0;
        this.atk = 0;
    }

    setHP(v){
        this.hp = v;
        this.hp_max = v;
    }
}


let trp8_base = createBase('trp8', 'trp_story_8', trp8_start, ()=>{});


let trp8_au = 0;
let trp8_au_elm;
let trp8_init;
let trp8_in_battle;
let trp8_player;
let trp8_enemy;
let trp8_draw_enemy = [];
let trp8_msg = {
     element:[]
    ,_index:0
    ,add:function(str){
        for(let i = trp8_msg.element.length-1; i > 0; i--){
            trp8_msg.element[i].textContent = trp8_msg.element[i-1].textContent;
        }
        trp8_msg.element[0].textContent = str;
    }
};
let trp8_player_hp_element;

function trp8_start(){
    if(trp8_init){return;}
    trp8_init = true;

    trp8_player = new trp8_Unit();

    trp8_enemy = new trp8_Unit();

    let parent = document.createElement('span');


    trp8_player_hp_element = document.createElement('span');
    parent.appendChild( trp8_player_hp_element );
    parent.appendChild( document.createElement('br') );

    for(let i = 0; i < 3; i++){
        let elm = document.createElement('span');
        trp8_msg.element.push( elm );
        parent.appendChild( elm );
        parent.appendChild( document.createElement('br') );
    }

    let DRAW_LINE_NUM = 3;
    for(let i = 0; i < DRAW_LINE_NUM; i++){
        trp8_draw_enemy[i] = document.createElement('span');
        parent.appendChild( trp8_draw_enemy[i] );
        parent.appendChild( document.createElement('br') );
    }

    trp8_au_elm = document.createElement('span');
    parent.appendChild( trp8_au_elm );
    parent.appendChild( document.createElement('br') );

    {
        let adv = document.createElement('span');
        adv.textContent = ':進む';
        adv.addEventListener('click',trp8_adv);

        let ret = document.createElement('span');
        ret.textContent = ':戻る';
        ret.addEventListener('click',trp8_ret);

        let space = document.createElement('span');
        space.textContent = '　';

        parent.appendChild( adv );
        parent.appendChild( space );
        parent.appendChild( ret );
    }

    trp8_reset();
    trp8_update();

    trp8_base.appendChild( parent );
}

function trp8_update(){
    trp8_au_elm.textContent = ''+trp8_au+'AU';
    trp8_player_hp_element.textContent = 'HP:'+trp8_player.hp;
}

function trp8_reset(){
    trp8_player.name = '自分';
    trp8_player.hp_max = 30;
    trp8_player.hp = trp8_player.hp_max;
    trp8_player.atk = 10;

    trp8_au = 0;
}

function trp8_adv(move){
    if(trp8_in_battle){
        trp8_attack( trp8_player ,trp8_enemy );

        if(trp8_enemy.hp <= 0){
            trp8_msg.add('勝った');
            trp8_in_battle = false;

            trp8_update();
            return;
        }
        
        trp8_attack( trp8_enemy ,trp8_player );
        if(trp8_player.hp <= 0){
            trp8_msg.add('負けた...');
            trp8_in_battle = false;

            trp8_reset();

            trp8_update();
            return;
        }
    }else{
        trp8_au++;
        trp8_runWalkEvent( trp8_au );
    }

    trp8_update();
}

function trp8_ret(){
    if(trp8_in_battle){return;}
    if(trp8_au <= 0){return;}

    
    trp8_au --;
    if(trp8_au < 0){trp8_au = 0;}

    trp8_runWalkEvent( trp8_au );

    trp8_update();
}

function trp8_runWalkEvent(au){
    if(au === 0){
        trp8_player.hp = trp8_player.hp_max;
        trp8_msg.add('回復した');
    }else if(au === 1){
        trp8_in_battle = true;

        trp8_enemy.name = 'しんまい';
        trp8_enemy.setHP( 21 );
        trp8_enemy.atk = 10;
        trp8_draw_enemy[0].textContent = '';
        trp8_draw_enemy[1].textContent = '🍎';
        trp8_draw_enemy[2].textContent = '';
        
        trp8_msg.add(trp8_enemy.name+'が現れた');
    }else{

    }
}

function trp8_attack(attacker ,target){
    let dmg = attacker.atk;
    target.hp -= dmg;
    if(target.hp < 0){
        target.hp = 0;
    }
}