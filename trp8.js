
{   
    class Unit{
        constructor(){
            this.name = 'def';
            this.hp = 0;
            this.hp_max = 0;
            this.atk = 0;
            this.hunger = 0;
            this.hunger_max = 100;
        }

        heal(value){
            this.hp += value;
            if(this.hp >= this.hp_max){
                this.hp = this.hp_max;
            }
        }

        setHP(value){
            this.hp_max = value;
            this.hp = value;
        }
        
        attack(target){
            let value = this.atk;
            target.hp -= value;
            if(target.hp < 0){
                target.hp = 0;
            }

            addMsg( attacker.name+'は'+target.name+'に'+value+'のダメージを与えた' );
        }
    }

    let init = false;
    let dom = {
        player:undefined,
        dungeon:undefined,
        before_choice:undefined,
        info:undefined,
        choices:undefined,
        msg:undefined,
    };
    const CHOICE_MAX = 4;
    const MSG_MAX = 3;
    const EMPTY_TEXT = '　';

    const Choices = {
        dungeon:()=>{
            clearChoices();

            dom.info.textContent = EMPTY_TEXT;
            addChoice('進む'
                ,()=>{
                    player.hunger--;
                    if(player.hunger <= 0){
                        player.hunger = 0;

                        player.hp -= player.hp / 10 + 1;

                        if(player.hp <= 0){
                            setGameOver('空腹で死んだ');
                            return;
                        }
                    }

                    au++;

                    setRndEvent();
                });
            addChoice('休む' 
                ,()=>{
                    if(player.hunger > 0){
                        let value = player.hunger < 10 ? player.hunger : 10;
                        player.hunger -= value;
                        let heal_value = Math.floor( player.hp / value ) + 1;
                        player.heal( heal_value );
                        addMsg(''+heal_value+'回復した');
                    }else{
                        addMsg('お腹が減って休めない');
                    }

                    updateDom();
                });
        },
        BATTLE:()=>{
            clearChoices();
            

            dom.info.textContent = EMPTY_TEXT;
            addChoice('殴る'
                ,()=>{
                    player.attack( enemy );
                    if(enemy.hp <= 0){
                        addMsg( enemy.name+'は死んだ' );
                        Choice.dungeon();
                    }
                });
        },
    };

    let au = 0;
    // let battle = {
    //     phase:0,
    // };

    let player = new Unit();
    let enemy = new Unit();

    function addMsg(str ,color = '#000000'){
        if(this.i === undefined){this.i = 0;}
        else                    {i = (i+1) % dom.msg.length;}
        
        dom.msg[i].textContent = str;
        dom.msg[i].style.color = color;
    }


    function setEnemy(name){
        switch(name){
            case 'しんまい':
                enemy.name = 'しんまい';
                enemy.setHP(2);
                enemy.atk = 1;
                break;
            default:
                enemy.name = 'bug?';
                enemy.setHP(2);
                enemy.atk = 1;
                break;
        }
    }


    function clearChoices(){
        for(let i = 0; i < dom.choices.length; i++){
            dom.choices[i].textContent = EMPTY_TEXT;
            dom.choices[i].onclick = ()=>{};
            dom.choices[i].style.cursor = 'default';
            dom.choices[i].style.textDecoration = 'none';
        }
    }


    function addChoice(text ,onclick){
        for(let i = 0; i < dom.choices.length; i++){
            if(dom.choices[i].textContent === EMPTY_TEXT){
                dom.choices[i].textContent = '・'+text;
                dom.choices[i].style.cursor = 'pointer';
                dom.choices[i].style.textDecoration = 'underline';
                dom.choices[i].onclick = ()=>{
                    dom.before_choice.textContent = '＞'+text;
                    onclick();
                };
                break;
            }
        }
    }


    function setGameOver(info_text){
        clearChoices();

        dom.info.textContent = info_text;
        addChoice('GameOver',()=>{
            dom.info.textContent = EMPTY_TEXT;
            dom.before_choice.textContent = EMPTY_TEXT;
            Choices.dungeon();
        });
    }


    function setRndEvent(){
        if(Math.random() <= 0.3){
            setEnemy('しんまい');
            if(Math.random() <= 0.5){battlePhase('player');}
            else                    {battlePhase('enemy');}
            
            return;
        }
    }


    function battlePhase(phase){
        if(phase === 'player'){
            Choices.battle();
        }else{
            enemy.attack( player );
            
            if(player.hp <= 0){
                addMsg( player.name+'は死んだ' );
                reset();
            }else{
                battlePhase('player');
            }
        }
    }


    function reset(){
        au = 0;
        player.name = 'わたし';
        player.hp_max = 10;
        player.hp = player.hp_max;
        player.atk = 1;
        player.hunger_max = 100;
        player.hunger = player.hunger_max;

        updateDom();

        Choices.dungeon();
    }


    function updateDom(){
        dom.player.textContent = 'HP:'+(player.hp)+' お腹:'+(player.hunger)+'%';
        dom.dungeon = 'AU:0';
    }

    
    createBase2('trp8','trp_story_8','#d0ffd7',(open)=>{
        if(!init){
            init = true;

            dom.player = document.createElement('div');
            dom.player.textContent = EMPTY_TEXT;
            
            dom.before_choice = document.createElement('div');
            dom.before_choice.textContent = EMPTY_TEXT;

            dom.info = document.createElement('div');

            dom.choices = [];
            for(let i = 0; i < CHOICE_MAX; i++){
                dom.choices.push( document.createElement('span') );
            }

            dom.msg = [];
            for(let i = 0; i < MSG_MAX; i++){
                dom.msg.push( document.createElement('span') );
                dom.msg[i].textContent = EMPTY_TEXT;
            }

            open.appendChild( dom.player );
            open.appendChild( dom.before_choice );
            open.appendChild( dom.info );
            for(let i = 0; i < dom.choices.length; i++){
                let div = document.createElement('div');
                div.appendChild( dom.choices[i] );
                open.appendChild( div );
            }
            for(let i = 0; i < dom.msg.length; i++){
                let div = document.createElement('div');
                div.appendChild( dom.msg[i] );
                open.appendChild( div );
            }
            
            reset();
        }
    },(open)=>{
    });
}