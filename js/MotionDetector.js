/**
* Motion detector class.
* Thanks to Romuald Quantin(http://www.soundstep.com/blog/2012/03/22/javascript-motion-detection/).
**/ 
function MotionDetector(videoId, canvasSourceId, canvasBlendedId){
    var self = this;
    
    //private
    var lastImageData;
    var video = document.getElementById(videoId);
    var canvasSource = document.getElementById(canvasSourceId);
    var canvasBlended = document.getElementById(canvasBlendedId);
    var contextSource = canvasSource.getContext('2d');
    var contextBlended = canvasBlended.getContext('2d');
    var blended;

    /**
    * Check getUserMedia support.
    **/
    var hasGetUserMedia = function(){
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };
    
    //binary abs function
    var abs = function(value){
        return (value ^ (value >> 31)) - (value >> 31);
    };
    
    /**
    * Calculate difference between 2 images and create blended data.
    **/    
    var differenceAccuracy = function(target, data1, data2) {
        if (data1.length != data2.length) 
            return null;
        for(var i = 0, len = data1.length * 0.25, average1, average2, diff; i < len; i++) {
            average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
            average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
            diff = abs(average1 - average2) > 0x20 ? 0xFF : 0;
            target[4*i] = diff;
            target[4*i+1] = diff;
            target[4*i+2] = diff;
            target[4*i+3] = 0xFF;
        }
    };
    
    /**
    * Blend previous and new frame.
    **/    
    var blend = function(){
        var width = canvasSource.width;
        var height = canvasSource.height;
        // get webcam image data
        var sourceData = contextSource.getImageData(0, 0, width, height);
        // create an image if the previous image doesn’t exist
        if (!lastImageData){
            lastImageData = contextSource.getImageData(0, 0, width, height);
        }
        // create a ImageData instance to receive the blended result
        blended = contextSource.createImageData(width, height);
        // blend the 2 images
        differenceAccuracy(blended.data, sourceData.data, lastImageData.data);
        // draw the result in a canvas
        contextBlended.putImageData(blended, 0, 0);
        // store the current webcam image
        lastImageData = sourceData;
    };
    
    /**
    * Constructor.
    **/
    var constructor = function(){       
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: true, video: true}, function(stream) {
                video.src = stream;
            }, function(e){
                alert('Webcam error!', e);
            });
        }
        else if (navigator.webkitGetUserMedia) {
            navigator.webkitGetUserMedia({audio:true, video:true}, function(stream) {
                video.src = window.webkitURL.createObjectURL(stream);
            }, function(e){
                alert('Webcam error!', e);
            });
        }
        
        contextSource.translate(canvasSource.width, 0);
        contextSource.scale(-1, 1);
        
        self.update();
    };
    
    /**
    * Update data.
    **/    
    self.update = function(){
        contextSource.drawImage(video, 0, 0, video.width, video.height);
        blend();
    };
    
    /**
    * Check area for motion.
    **/
    self.checkArea = function(x, y, w, h){
        var blendedData = contextBlended.getImageData(x, y, w, h);
        var average = 0;
        // loop over the pixels
        for (var i = 0, len = blendedData.data.length / 4; i < len; i++) {
            // make an average between the color channel
            average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
        }
        // calculate an average between of the color values of the note area
        average = Math.round(average / (blendedData.data.length / 4));

        if (average > 20) {
            return true;
        }

        return false;
    };
    
    /**
    * Get blended data.
    **/
    self.getBlended = function(){
        return blended;
    }
    
    constructor();   
}
