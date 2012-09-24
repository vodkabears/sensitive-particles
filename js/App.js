/**
* Application. Root class.
**/   
function App(id, motionDetector){
    var self = this;
    
    //private
    
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext("2d");
    var interval;
    var particles;

    /**
    * Fill canvas and redraw each particle.
    **/
    var draw = function(){
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, self.config.W, self.config.H);

        //Update detector data.
        motionDetector.update();
        var blendedData = motionDetector.getBlended().data;

        for(var t = 0, p, len = particles.length, average; t < len; t++) {
            p = particles[t];
            average = 0;
            
            // make an average between the color channel
            for(var y = Math.floor(p.y - p.radius), yk = Math.floor(p.y + p.radius); y < yk; y++) {
                for(var x = Math.floor(p.x - p.radius), xk = Math.floor(p.x + p.radius), b; x < xk; x++){
                    b = Math.floor(x * 4 + y * self.config.W * 4);
                    average += (blendedData[b] + blendedData[b + 1] + blendedData[b + 2]) / 3;
                }
            }
            average = Math.round(average / (p.radius * p.radius * 4) );
            
            //Check average. If condition is true - select particle.
            if(average > 20){
                ctx.globalCompositeOperation = 'lighter';
                p.select();
            } else {
                p.unselect();
            }

            p.process();

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 2 * Math.PI, false);
            ctx.fill();
        }
    };
    
    /**
    * Constructor function.
    **/
    var constructor = function(){
        //create particles
        particles = [];
        for(var i = 0; i < self.config.particlesCount; i++){
            particles.push(new Particle(self.config.W, self.config.H));
        }
        
        interval = setInterval(draw, 30);
    };
    
    //public
    
    /**
    * Public configuration.
    **/    
    self.config = {
        W: canvas.width,
        H: canvas.height,
        particlesCount: 3000
    };
    
    /**
    * Create particles again and redraw them.
    **/
    self.refresh = function(){
        clearInterval(interval);
        
        constructor();
    };
    
    constructor();
}

/**
* Particle class
**/  
function Particle(maxX, maxY){
    var self = this;
    
    //private
    /**
    * Constructor
    **/ 
    var constructor = function(){
        self.x = Math.floor(Math.random() * maxX);
        self.y =  Math.floor(Math.random() * maxY);
        self.opacity = Math.random();
        self.radius = Math.random() * 1.5 + 1;
        self.color = "rgba(16, 32, 64, " + self.opacity + ")";
        self.oldRadius = self.radius;
        
        self.vx = Math.random() * 2 - 1;
        self.vy = Math.random() * 2 - 1;
        self.vo = Math.random() - 0.5;
    };
    
    //public
    /**
    * Select particle
    **/ 
    self.select = function(){
        self.color = "rgba(255, 64, 128, " + self.opacity + ")";
        self.vx = Math.random() * 2 - 1;
        self.vy = Math.random() * 2 - 1;
        self.vo = Math.random() - 0.5;
        self.radius = 2.5;
    };
    
    /**
    * Unselect particle
    **/    
    self.unselect = function(){
        self.color = "rgba(16, 32, 64, " + self.opacity + ")";
        self.radius = self.oldRadius;
    };
    
    /**
    * Calculate next position and form of the particle.
    **/    
    self.process = function(){
        if(self.x < 0){
            self.vx = Math.random();
        } else if(self.x > maxX){
            self.vx = Math.random() * -1;
        }

        if(self.y < 0){
            self.vy = Math.random();
        } else if(self.y > maxY){
            self.vy = Math.random() * -1;
        }

        if(self.opacity < 0){
            self.vo = Math.random() * 0.5;
        } else if(self.opacity > 1){
            self.vo = Math.random() * -0.5;
        }

        self.x += self.vx;
        self.y += self.vy;
        self.opacity += self.vo;        
    };
    
    constructor();
}