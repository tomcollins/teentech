
var GridGenerator = function(width, height, textMargin){

  this.width = width;
  this.height = height;
  this.canvasWidth = width + textMargin + textMargin;
  this.canvasHeight = height + textMargin + textMargin;

  var fillStyles = {
    divider: 'rgb(33, 33, 33)',
    minorDivider: 'rgba(0, 0, 0, 0.3)',
    background: 'rgba(0, 0, 0, 0)'
  };

  $('body').append('<canvas id="GridGenerator" width="' +this.canvasWidth +'" height="' +this.canvasHeight +'"/>');
  this.canvas = document.getElementById("GridGenerator");
  this.context = this.canvas.getContext("2d");
  // background
  this.context.fillStyle = fillStyles.background;
  this.context.fillRect (0, 0, this.canvasWidth, this.canvasHeight);

  this.context.font = '12pt Calibri';

  var x = textMargin;
  this.context.fillStyle = fillStyles.minorDivider;
  while (x <= this.canvasWidth - textMargin) {
    this.context.fillRect (x, textMargin, 1, this.height);
    x += 10;
  }
  var y = textMargin;
  this.context.fillStyle = fillStyles.minorDivider;
  while (y <= this.canvasHeight - textMargin) {
    this.context.fillRect (textMargin, y, this.width, 1);
    y += 10;
  }

  x = textMargin;
  this.context.fillStyle = fillStyles.divider;
  while (x < this.canvasWidth - textMargin) {
    this.context.fillText(x - textMargin, x - 12, this.canvasHeight - 15);
    this.context.fillRect(x, textMargin, 1, this.height);
    x += 100;
  }
  this.context.fillRect(this.canvasWidth - textMargin - 1, textMargin, 1, this.height);

  y = textMargin;
  this.context.fillStyle = fillStyles.divider;
  while (y <= this.canvasHeight - textMargin) {
    this.context.fillText(this.height - (y - textMargin), 2, y + 5);
    this.context.fillRect(textMargin, y, this.width, 1);
    y += 100;
  }
};

GridGenerator.prototype.toDataURL = function() {
  return this.canvas.toDataURL("image/png");
};

GridGenerator.prototype.destroy = function() {
  $('#GridGenerator').remove();
};
