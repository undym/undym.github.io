{
    class Unit{
        constructor(face,speak){
            this.face = face;
            this.speak = speak;
        }
    }
    let init = false;
    let face;
    let face_speak;
    let units;
    let unit_index = 0;
    let speak_index = 0;

    function setUnit(index){
        unit_index = index;
        speak_index = 0;

        face.textContent = units[index].face;
        face_speak.textContent = '';
    }

    function speak(){
        if(++speak_index > units[ unit_index ].speak.length){return;}

        face_speak.textContent = units[ unit_index ].speak.substr(0 ,speak_index);

        setTimeout( speak ,50 );
    }

    createBase('trp21','trp_story_21','#5effa1',(inside)=>{
        if(!init){
            init = true;

            units = [
                new Unit('👨‍🏭','＜こんにちは'),
                new Unit('🐱','＜ニャーン'),
                new Unit('🐶','＜イヌーン'),
                new Unit('🍖','＜人はなぜ肉に話しかけるのか'),
                new Unit('💀','＜...........'),
                new Unit('🕑','＜トケーッ！'),
                new Unit('🚗','＜ブッブー'),
                new Unit('🏃‍♂️','＜寝ても覚めても、大きな渦に取り込まれて、光の見えない深海を彷徨うような日々だ。そんな苦闘をよそに、勝手に移動していく世の中がますます薄っぺらく感じられる。当然だけど、世界も宇宙も、僕のことなどどうでもいいんだ。歳を取るごとに、だんだんその事が頭を支配して、気づいたら崖が怖くてjumpできなくなっていた。何かを恐れてjumpできないなんて、そんな恐ろしい事はないよ、そんなの死んだ方がマシだFuck my life!'),
                new Unit('👺','＜クリア★'),
            ];

            inside.appendChild((()=>{
                let p = document.createElement('div');
                face = document.createElement('span');
                face_speak = document.createElement('span');
                p.appendChild(face);
                p.appendChild(face_speak);


                return p;
            })());


            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.clear = 'both';
                let btn = document.createElement('span');
                btn.textContent = '話す';
                btn.style.cursor = 'pointer';
                btn.style.textDecoration = 'underline';
                btn.addEventListener('click',()=>{
                    speak_index = 0;
                    speak();
                });
                p.appendChild(btn);
                return p;
            })());
            inside.appendChild((()=>{
                let p = document.createElement('div');
                let btn = document.createElement('span');
                btn.textContent = '対象変更';
                btn.style.cursor = 'pointer';
                btn.style.textDecoration = 'underline';
                btn.addEventListener('click',()=>{
                    setUnit( (unit_index+1) % units.length );
                    speak();
                });
                p.appendChild(btn);
                return p;
            })());
            
        }

        setUnit( 0 );
        speak();
    },(inside)=>{
    });
}