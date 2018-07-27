

let trp8_base = createBase('trp8', 'trp_story_8', trp8_start);


let trp8_au = 0;
let trp8_init;

function trp8_start(){
    if(trp8_init){return;}
    trp8_init = true;

    let parent = document.createElement('span');


    trp8_update();

    trp8_base.appendChild( parent );
}

function trp8_update(){
    // trp8_au_elm.textContent = ''+trp8_au+'AU';

}