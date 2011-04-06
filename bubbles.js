var debug_framework;
var master_bubble_interval;

var stop = function () { clearInterval(master_bubble_interval); };

(function () {
  var beer_framework = {
    bubble_holder: [],
    canvas_ref: undefined,
    canvas_bottom: 0,
    BUBBLE_SPEED_MAX: 100,
    BUBBLE_SPEED_MIN: 50,
    BUBBLE_WIDTH_MAX: 10,
    BUBBLE_WIDTH_MIN: 3,
    BUBBLE_DISTANCE_MIN: 6,
    BUBBLE_DISTANCE_MAX: 15,
    CANVAS_X_MAX: -1,
    CANVAS_Y_MAX: -1,
    bubble_id_count: 1,
    num_bubbles_at_a_time: 1,
    fps: 25,
    timeInterval: function () { return 1000 / this.fps; },
    beer_canvas: null,
    beer_context: null,
    clearCanvas: function () {
      this.beer_context.clearRect(0, 0, this.beer_canvas.width, this.beer_canvas.height);
    },
    head: function (arr) { return arr[0]; },
    each: function (f, arr) {
      if (arr.length > 0) {
        f(this.head(arr));
        this.each(f, arr.slice(1));
      }
    },
    numberGenerator: function (min_value, max_value) {
      var number = Math.floor(Math.random() * max_value);
      return (number < min_value ? min_value : number);
    },
    generateWidth: function () {
      return this.numberGenerator(this.BUBBLE_WIDTH_MIN, this.BUBBLE_WIDTH_MAX);
    },
    generateXValue: function () {
      return this.numberGenerator(0, this.CANVAS_X_MAX);
    },
    generateYValue: function () {
      return this.numberGenerator(0, this.CANVAS_Y_MAX);
    },
    generateDistance: function () {
      return this.numberGenerator(this.BUBBLE_DISTANCE_MIN, this.BUBBLE_DISTANCE_MAX);
    },
    makePoint: function (x, y) {
      return {
        x: x,
        y: y
      }
    },
    addBubble: function (bubble) {
      this.bubble_holder.push(bubble);
    },
    removeBubble: function (bubbleId) {
      var i, that = this;
      for(i = 0; i < that.bubble_holder.length; i += 1) {
        if(that.bubble_holder[i].getBubbleId() === bubbleId) {
          that.bubble_holder.splice(i, 1);
          return;
        }
      }
    },
    makeBubble: function (id, centerPoint, width) {
      var that = this;
      return {
        bubbleId: id,
        centerPoint: centerPoint,
        width: width,
        distance: function () { return that.generateDistance(); },
        getBubbleId: function () { return this.bubbleId; },
        drawBubble: function () {
          var width = this.width,
            centerPoint = this.centerPoint,
            context = that.beer_context;
          context.beginPath();
          context.arc(centerPoint.x, centerPoint.y, width, 0, Math.PI * 2, true);
          context.closePath();
          context.stroke();
        },
        bubble_float: function () {
          // Stop animating when it floats past
          // the top of the page and kill the bubble
          if (this.centerPoint.y < 0) {
            that.removeBubble(this.bubbleId);
            return;
          }
          
          // Raise the position a little bit
          this.centerPoint.y -= this.distance();          
        }
      };
    },
    drawBubbles: function () {
      this.each(
        function (b) { if (b) { b.drawBubble(); } },
        this.bubble_holder
      );
    },
    resetHeight: function () {
      var canvas = this.beer_canvas;
      canvas.setAttribute('width', document.body.offsetWidth);
      canvas.setAttribute('height', document.body.offsetHeight);
      this.canvas_bottom = canvas.height;
    },
    initBubbles: function () {
      var that = this;
      master_bubble_interval = setInterval(
        function () {
          var i;
          // Make some new bubbles
          for (i = 0; i < that.num_bubbles_at_a_time; i += 1) {
            var bubble, bubbleId, intervalId;
            
            // Grab an id
            bubbleId = that.bubble_id_count;
            that.bubble_id_count += 1;
            
            // Create a new bubble and add it to the holder
            var bubble = that.makeBubble(
              bubbleId,
              that.makePoint(
                that.generateXValue(),
                that.generateYValue()
              ),
              that.generateWidth()
            );
            
            that.addBubble(bubble);
            that.clearCanvas();
            that.each(
              function (b) {
                if (b) {
                  b.bubble_float();
                  b.drawBubble();
                }
              },
              that.bubble_holder
            );
          }
        },
        this.timeInterval()
      );
    },
    commenceCarbonation: function () {
      this.resetHeight();
      this.CANVAS_X_MAX = this.beer_canvas.width;
      this.CANVAS_Y_MAX = this.beer_canvas.height;
      var that = this;
      $(window).resize(function () {
        that.clearCanvas();
        that.resetHeight();
        that.CANVAS_X_MAX = that.beer_canvas.width;
        that.CANVAS_Y_MAX = that.beer_canvas.height;
        that.drawBubbles();
      });
      
      this.beer_context = this.beer_canvas.getContext('2d');
      this.beer_context.strokeStyle = '#161001';
      this.beer_context.lineWidth = 1;
      this.initBubbles();
    },
    beerBubbleToggle: function () {
      if (master_bubble_interval && master_bubble_interval > 0) {
        clearInterval(master_bubble_interval);
        this.clearCanvas();
        master_bubble_interval = 0;
      } else {
        this.commenceCarbonation();
      }
    },
    drawBubbles: function () {
      this.each(
        function (b) { if (b) { b.drawBubble(); } },
        this.bubble_holder
      );
    }
  };    
  
  $(function () {
    // Insert the CSS
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#bubble_canvas{ position: absolute; z-index: -1; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    
    // Insert Canvas into content area
    var canvas = document.createElement('canvas');
    canvas.id = 'bubble_canvas';
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    
    beer_framework.beer_canvas = document.getElementById('bubble_canvas');
    
    // Check for canvas support
    if (beer_framework.beer_canvas.getContext) {
      beer_framework.commenceCarbonation();
      
      // Figure out a better way to do this
      if ($('#bubble_toggle_box')) {
        $('#bubble_toggle_box').change(function () {
          beer_framework.beerBubbleToggle(); 
        });
      }
    }
    debug_framework = beer_framework;
  });
})();
