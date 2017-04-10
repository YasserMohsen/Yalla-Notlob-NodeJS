var fs = require('fs');


var base64upload = function(base64image){
    var data = base64image.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    var ext
    fs.writeFile('image2.png', buf, function(err){
      if(err){
        return false;
      }else{
        return true;
      }
    });
}
var base64image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0"
    + "NAAAAKElEQVQ4jWNgYGD4Twzu6FhFFGYYNXDUwGFpIAk2E4dHDRw1cDgaCAASFOffhEIO"
+ "3gAAAABJRU5ErkJggg";
var matches = base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
var type = matches[1];
var base = matches[2];
console.log(type + " " + base);
var r = base64upload(base64image);
console.log(r);
var d = +new Date();
console.log(d);
var x = Math.floor(Math.random()*(100000))
console.log("pic"+x+"_"+d);
