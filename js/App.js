/**
 * Application. Root class.
 *
 * @constructor
 */
function App(){
    var self = this;
    
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext("2d"),
        message = document.getElementById('message'),
        webcam = document.getElementById('webcam'),
        motionDetector = new MotionDetector(webcam),
        gui = new dat.GUI(),
        interval,
        particles;

    /**
     * Configuration.
     *
     * @private
     */
    var config = {
        W: canvas.width,
        H: canvas.height,
        particlesCount: 3000
    };

    /**
     * Cross-browser requestAnimationFrame function
     *
     * @private
     */
    var requestAnimFrame = (function () {
        return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    /**
     * Fill the canvas and redraw an each particle.
     *
     * @private
     */
    var animate = function(){
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, config.W, config.H);

        //Update detector data.
        motionDetector.update();
        var blendedData = motionDetector.getBlended().data;

        for(var t = 0, p, len = particles.length, average; t < len; t++) {
            p = particles[t];

            //check an area of a particle for a motion
            if(motionDetector.checkArea(p.x - p.radius, p.y - p.radius, 2 * p.radius, 2 * p.radius)){
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

        requestAnimFrame(animate);
    };

    /**
     * Create particles again and redraw them.
     *
     * @private
     */
    var refresh = function(){
        particles = [];

        for(var i = 0; i < config.particlesCount; i++){
            particles.push(new Particle(config.W, config.H));
        }
    };

    /**
     * Local constructor
     *
     * @private
     */
    var constructor = function(){
        //create particles
        particles = [];

        for(var i = 0; i < config.particlesCount; i++){
            particles.push(new Particle(config.W, config.H));
        }

        //Init dat.GUI
        gui.close();
        gui.add(config, 'particlesCount').onFinishChange(function(value){
            refresh();
        });

        //Init getUserMedia
        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true}, function (stream) {
                webcam.src = stream;
                animate();
            }, function () {
                canvas.style.display = 'none';
                message.innerHTML = 'Something wrong with your webcam!';
                message.style.display = 'block';
            });
        } else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({video: true}, function (stream) {
                webcam.src = window.webkitURL.createObjectURL(stream);
                animate();
            }, function () {
                canvas.style.display = 'none';
                message.innerHTML = 'Something wrong with your webcam!';
                message.style.display = 'block';
            });
        } else {
            canvas.style.display = 'none';
            message.innerHTML = 'Your browser doesn\'t support "getUserMedia" function.<br />Try it with Chrome or Opera.';
            message.style.display = 'block';
        }
    };
    
    constructor();
}

/**
 * Particle class
 *
 * @constructor
 */
function Particle(maxX, maxY){
    var self = this;
    
    /**
     * Local constructor
     *
     * @private
     */
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
    
    /**
     * Select a particle
     *
     * @public
     */
    self.select = function(){
        self.color = "rgba(255, 64, 128, " + self.opacity + ")";
        self.vx = Math.random() * 2 - 1;
        self.vy = Math.random() * 2 - 1;
        self.vo = Math.random() - 0.5;
        self.radius = 2.5;
    };
    
    /**
     * Unselect particle
     *
     * @public
     */
    self.unselect = function(){
        self.color = "rgba(16, 32, 64, " + self.opacity + ")";
        self.radius = self.oldRadius;
    };

    /**
     * Calculate next position and form of a particle.
     *
     * @public
     */
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