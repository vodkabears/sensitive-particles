function computeParticles(data){
    for(var t = 0, p, len = data.particles.length, average; t < len; t++) {
        p = data.particles[t];
        average = 0;

        for(var y = Math.floor(p.y - p.radius), yk = Math.floor(p.y + p.radius); y < yk; y++) {
            for(var x = Math.floor(p.x - p.radius), xk = Math.floor(p.x + p.radius), b; x < xk; x++){
                b = Math.floor(x * 4 + y * data.config.W * 4);
                average += (data.blendedData[b] + data.blendedData[b + 1] + data.blendedData[b + 2]) / 3;
            }
        }

        average = Math.round(average / (p.radius * p.radius * 4) );

        if(average > 20){
            p.globalCompositeOperation = 'lighter';
            p.color = "rgba(255, 64, 128, " + p.opacity + ")";
            p.vx = Math.random() * 2 - 1;
            p.vy = Math.random() * 2 - 1;
            p.vo = Math.random() - 0.5;
            p.radius = 2.5;
        } else {
            p.globalCompositeOperation = 'source-over';
            p.color = "rgba(16, 32, 64, " + p.opacity + ")";
            p.radius = p.oldRadius;
        }

        if(p.x < 0){
            p.vx = Math.random();
        } else if(p.x > data.config.W){
            p.vx = Math.random() * -1;
        }

        if(p.y < 0){
            p.vy = Math.random();
        } else if(p.y > data.config.H){
            p.vy = Math.random() * -1;
        }

        if(p.opacity < 0){
            p.vo = Math.random() * 0.5;
        } else if(p.opacity > 1){
            p.vo = Math.random() * -0.5;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.vo;
    }

    postMessage({op: 'computeParticles', particles: data.particles});
}

onmessage = function(e){
    switch(e.data.op){
        case 'computeParticles':
            computeParticles(e.data);
            break;
        default:
    }
}
