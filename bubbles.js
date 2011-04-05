var fps = 25;
var timeInterval = 1000 / fps;

var head = function (arr) { return arr[0]; };
var each = function (f, arr) {
  if (arr.length > 0) {
    f(head(arr));
    each(f, arr.slice(1));
  }
}

// Helper functions in the bubble namespace
// Create global namespace variable called 'bubble_ns'
var bubble_ns = {
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
  num_bubbles_at_a_time: 1
};

var beer_canvas = null;
var beer_context = null;

var clearCanvas = function () {
  beer_context.clearRect(0, 0, beer_canvas.width, beer_canvas.height);
};

var drawBubbles = function () {
  each(
    function(bubble) { if(bubble.bubble) { bubble.bubble.drawBubble(); } },
    bubble_ns.bubble_holder
  );
};

var Point = function (x, y) {
  this.x = x;
  this.y = y;
};

var numberGenerator = function (min_value, max_value) {
  var number = Math.floor(Math.random() * max_value);
  return (number < min_value ? min_value : number);
};

var generateWidth = function () {
  return numberGenerator(bubble_ns.BUBBLE_WIDTH_MIN, bubble_ns.BUBBLE_WIDTH_MAX);
};

var generateXValue = function () {
  return numberGenerator(0, bubble_ns.CANVAS_X_MAX);
};

var generateYValue = function () {
  return numberGenerator(0, bubble_ns.CANVAS_Y_MAX);  
};

var generateDistance = function () {
  return numberGenerator(bubble_ns.BUBBLE_DISTANCE_MIN, bubble_ns.BUBBLE_DISTANCE_MAX);
}

var addBubble = function (bubble) {
  bubble_ns.bubble_holder.push({
    bubble_id: bubble.getBubbleId(),
    bubble: bubble
  });  
};

var removeBubble = function (bubbleId) {
  var i;
  for (i = 0; i < bubble_ns.bubble_holder.length; i += 1) {
    if (bubble_ns.bubble_holder[i].bubble_id === bubbleId) {
      bubble_ns.bubble_holder.splice(i, 1);
      return;
    }
  }
};


function BeerBubble(id, centerPoint, width) {
  this.bubbleId = id;
  this.centerPoint = centerPoint;
  this.width = width;
  
  this.distance = generateDistance();
  
  var that = this;  
  
  this.getBubbleId = function () {
    return that.bubbleId;
  };
  
  this.drawBubble = function () {
    var width = that.width, 
      centerPoint = that.centerPoint,  
      context = beer_context;
        
    context.beginPath();
    context.arc(centerPoint.x, centerPoint.y, width, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
  };

  this.bubble_float = function () {
    // Stop animating when it floats past 
    // the top of the page and kill the bubble
    if(that.centerPoint.y < 0) {
      removeBubble(that.bubbleId);
      return;
    }
    
    // Raise the position a little bit
    that.centerPoint.y -= that.distance;
  };        
}

var resetHeight = function () {
  beer_canvas.setAttribute('width', document.body.offsetWidth);
  beer_canvas.setAttribute('height', document.body.offsetHeight);
  bubble_ns.canvas_bottom = beer_canvas.height;
};


var startFloating = function () {
  bubble_ns.bubble_holder.map(
    function (bubble) { 
      var speed = numberGenerator(bubble_ns.BUBBLE_SPEED_MIN, bubble_ns.BUBBLE_SPEED_MAX),
        id = setInterval(bubble.bubble.bubble_float, speed);
      bubble.bubble.setIntervalId(id); 
    }
  );
};

var init_bubbles = function () {  
  master_bubble_interval = setInterval(
    function () {      
      var i;
      // Make some new bubbles
      for (i = 0; i < bubble_ns.num_bubbles_at_a_time; i += 1) {
        var bubble, bubbleId, intervalId;      
        
        // Grab an id
        bubbleId = bubble_ns.bubble_id_count;
        bubble_ns.bubble_id_count += 1;
        
        // Create a new bubble and add it to the holder
        var bubble = new BeerBubble(
          bubbleId,
          new Point(
              generateXValue(),
              generateYValue()
          ),
          generateWidth()
        );
        addBubble(bubble);
        
        clearCanvas();      
        // Kick off the floating and drawing
        each(
          function (bubble) { 
            bubble.bubble.bubble_float();
            bubble.bubble.drawBubble(); 
          },
          bubble_ns.bubble_holder
        );
      }
    }, 
    timeInterval
  );
};

$(function () {
  // Insert the CSS
  $('head').append('<style type="text/css">#bubble_canvas{ position: absolute; z-index: -1; }</style>')

  // Insert Canvas into content area
  $('body').prepend('<canvas id="bubble_canvas"></canvas>');

  beer_canvas = document.getElementById('bubble_canvas');
  // Check for canvas support
  if (beer_canvas.getContext) { commenceCarbonation(); }
});

var commenceCarbonation = function () {
    resetHeight();
    bubble_ns.CANVAS_X_MAX = beer_canvas.width;
    bubble_ns.CANVAS_Y_MAX = beer_canvas.height;    
      
    $(window).resize(function () {
      clearCanvas();
      resetHeight();
      
      bubble_ns.CANVAS_X_MAX = beer_canvas.width;
      bubble_ns.CANVAS_Y_MAX = beer_canvas.height;
      
      drawBubbles();
    });
      
    beer_context = beer_canvas.getContext('2d');
    beer_context.strokeStyle = '#161001';
    beer_context.lineWidth = 1;    
    init_bubbles();
  
}

var beerBubbleToggle = function () {
  if(master_bubble_interval && master_bubble_interval > 0) {    
    clearInterval(master_bubble_interval);
    clearCanvas();
    master_bubble_interval = 0;
  } else {
    commenceCarbonation();
  }
}
