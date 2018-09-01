{
    const width = 200;
    let init = false;
    let car;
    let car_left = width;
    let run_timer;

    function run(){
        car.style.left = car_left+'px';

        car_left -= 3;
        if(car_left < -130){car_left = width;}

        run_timer = setTimeout( run ,50 );
    }

    createBase('trp24','trp_story_24','#f0ff25',(inside)=>{
        if(!init){
            init = true;

            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.position = 'relative';
                p.style.overflow = 'hidden';
                p.style.left = '1em';
                p.style.width = width+'px';
                p.style.hegiht = '3em';
                p.appendChild((()=>{
                    let sun = document.createElement('div');
                    sun.textContent = '☀️';
                    sun.style.position = 'absolute';
                    sun.style.left = '0em';
                    sun.style.top = '0em';
                    return sun;
                })());
                p.appendChild((()=>{
                    car = document.createElement('div');
                    car.textContent = '🚗～[クリア★]';
                    car.style.position = 'absolute';
                    car.style.top = '3em';
                    return car;
                })());
                p.appendChild((()=>{
                    let a = document.createElement('div');
                    a.textContent = '　';
                    return a;
                })());
                p.appendChild((()=>{
                    let a = document.createElement('div');
                    a.textContent = '　';
                    return a;
                })());
                p.appendChild((()=>{
                    let a = document.createElement('div');
                    a.textContent = '　';
                    return a;
                })());
                return p;
            })());
        }

        run();
    },(inside)=>{
        clearTimeout( run_timer );
    });
}