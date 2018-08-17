
{
    let init = false;
    const BACKGROUND_COLOR = '#ff7268';

    let dom = {
        left:undefined,
        center:undefined,
        right:undefined,
        cookie:undefined,
        cookie_value:undefined,
    };

    let cookies = [];
    let update_timer;
    let clear = false;


    createBase2('trp9','trp_story_9',BACKGROUND_COLOR,(open)=>{
        if(!init){
            init = true;

            //-------

            open.appendChild((()=>{
                let lc = document.createElement('div');
                lc.style.cssFloat = 'left';
                lc.style.width = '67%';
                lc.style.backgroundColor = BACKGROUND_COLOR;
                lc.appendChild((()=>{
                    dom.left = document.createElement('div');
                    dom.left.style.cssFloat = 'left';
                    dom.left.style.width = '50%';
                    // dom.left.textContent = 'dummy';
                    dom.left.appendChild((()=>{
                        dom.cookie_value = document.createElement('div');
                        return dom.cookie_value;
                    })());

                    return dom.left;
                })());
                lc.appendChild((()=>{
                    dom.center = document.createElement('div');
                    dom.center.style.cssFloat = 'right';
                    dom.center.style.width = '50%';
                    // dom.center.textContent = 'dummy';
                    
                    dom.center.appendChild((()=>{
                        dom.cookie = document.createElement('div');
                        dom.cookie.style.textAlign = 'center';
                        dom.cookie.textContent = '🍪';
                        dom.cookie.style.fontSize = '700%';
                        dom.cookie.addEventListener('click',()=>{
                            let loop = 1 + cookies.length / 10;
                            if(loop >= 10){loop = 10;}

                            for(let j = 0; j < loop; j++){
                                let c = document.createElement('span');
                                c.textContent = '🍪';
                                c.style.position = 'fixed';
                                c.style.left = Math.floor( (-20 + Math.random() * 140) )+'%';
                                c.style.top = Math.floor( (-20 + Math.random() * 140) )+'%';
    
                                cookies.push( c );
                                dom.cookie_value.textContent = cookies.length+'COOKIES';
    
                                if(!clear && cookies.length >= 1000){
                                    clear = true;
                                    for(let i = 0; i < cookies.length; i++){
                                        cookies[i].textContent = 'クリア★';
                                    }
                                }

                                document.body.appendChild( c );
                            }

                        });
                        return dom.cookie;
                    })());

                    return dom.center;
                })());
                //-------
                return lc;
            })());
            // open.appendChild( dom.center );
            open.appendChild((()=>{
                dom.right = document.createElement('div');
                dom.right.style.cssFloat = 'right';
                dom.right.style.backgroundColor = BACKGROUND_COLOR;
                dom.right.style.width = '33%';
                // dom.right.textContent = 'dummy';
                return dom.right;
            })());

        }

    },(open)=>{
        for(let i = 0; i < cookies.length; i++){
            document.body.removeChild( cookies[i] );
        }
        cookies = [];
        clear = false;
    });
}