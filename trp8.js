

let trp8_base = setBase('trp8', 'trp_story_8', trp8_start);

let trp8_squares_len = 10;
let trp8_loads = [];
let trp8_buildings = [];
let trp8_au = 0;
let trp8_au_elm;
let trp8_btn_right;
let trp8_btn_left;

function trp8_start(){
    let parent = document.createElement('span');

    trp8_au_elm = document.createElement('span');

    parent.appendChild( trp8_au_elm );

    for(let i = 0; i < trp8_squares_len; i++){
        let elm = document.createElement('span');
            elm.id = 'trp8_load_id'+i;
            elm.textContent = '　';
        trp8_loads.push( elm );
        parent.appendChild( elm );
    }
    
    parent.appendChild( document.createElement('br') );

    for(let i = 0; i < trp8_squares_len; i++){
        let elm = document.createElement('span');
            elm.id = 'trp8_building_id'+i;
            elm.textContent = '■';
        trp8_buildings.push( elm );
        parent.appendChild( elm );
    }
    {//btn
        trp8_btn_right = document.createElement('span');
        trp8_btn_right.textContent = '*進む*';
        trp8_btn_right.addEventListener('click',function(){

        });
        trp8_btn_left = document.createElement('span');
        trp8_btn_right.textContent = '*戻る*';
        trp8_btn_left.addEventListener('click',function(){

        });

        parent.appendChild( document.createElement('br') );
        parent.appendChild( trp8_btn_left );
        parent.appendChild( trp8_btn_right );
    }



    trp8_update();

    trp8_base.appendChild( parent );
}

// function trp8_updateAU(){
//     trp8_au_elm.textContent = ''+trp8_au+'AU';
// }

function trp8_update(){
    trp8_au_elm.textContent = ''+trp8_au+'AU';

    if(trp8_au >= 0 && trp8_au < trp8_loads.length){
        for(let i = 0; i < trp8_loads.length; i++){
            trp8_loads[i].textContenst = '　';
        }
        trp8_loads[ trp8_au ] = '＠';
    }
}