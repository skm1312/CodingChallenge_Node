//Importing express,body parser and fs
var myExpress = require("express");
var myParser = require("body-parser");
var app = myExpress();
const fs = require("fs");
//Error codes to handle the response cases
const ERROR_CODE = 404;
const SUCCESS_CODE = 200;
//Reading data using fs from the json file and parsing it
let rawdata = fs.readFileSync("sneakers.json", "utf-8");
let data = JSON.parse(rawdata);
//Binding application middleware with instance
app.use(myParser.urlencoded({ extended: true }));
//Different endpoints to handle the GET requests

//This would handle something like: nike/air_max_1
app.get("/:make/:model", function (request, response) {
  let sizeRet = makeModelSize(request.params);
  response.send(sizeRet);
});
//This would handle 2 instances like: nike/air_max_1/11 or jordan/jordan_11/cool_gray
app.get("/:make/:model/:size", function (request, response) {
  let sizeAvail = makeModelSize(request.params);
  response.send(sizeAvail);
});
//This would handle something like: jordan/jordan_11/cool_gray/11
app.get("/:make/:model/:color/:size", function (request, response) {
  let sizeAvailCol = makeModelColorwaySize(request.params);
  response.send(sizeAvailCol);
});

//This is the function that handles the endpoint where we have 2 or 3 params
function makeModelSize(values) {
  let params = new URLSearchParams(values);
  let makeval = params.get("make");
  let modelval = params.get("model");
  let sizeval = params.get("size");
  let count = 0;
  for (const key in data) {
    if (key === makeval) {
      let modelObject = data[makeval];
      if (modelObject.hasOwnProperty(modelval)) {
        let sizeObject = modelObject[modelval];
        let typeSize = Array.isArray(sizeObject);
        //The case where we have a nested non-array response (i.e., colors for shoes)
        if (!typeSize && sizeval == null) {
          return SUCCESS_CODE + ":" + Object.keys(sizeObject);
        }
        // This is the case where it can be an array and not have colors
        else if (sizeval === null) {
          return SUCCESS_CODE + ":" + sizeObject;
        }
        // This handles the case where we have the third parameter as color but not size.
        else {
          let castedNum = parseInt(sizeval, 10);
          if (isNaN(castedNum)) {
            let colorObject = sizeObject[sizeval];
            if (colorObject !== undefined) {
              return SUCCESS_CODE + ":" + colorObject;
            } else {
              return ERROR_CODE + ": Product Not available";
            }
          }
        }
        //Checking for size avaibility if the loop continues post colors
        for (var i = 0; i < sizeObject.length; i++) {
          if (sizeObject[i] === sizeval) {
            return SUCCESS_CODE + ": Available in size " + sizeval;
          } else {
            count++;
          }
        }
        //Unable to find the size after parsing through the entire object
        if (count === sizeObject.length) {
          return ERROR_CODE + ": Not Available in size " + sizeval;
        }
      }
    }
  }
}
//This is the function that handles the endpoint where we have 4 params
function makeModelColorwaySize(values) {
  let params = new URLSearchParams(values);
  let makeval = params.get("make");
  let modelval = params.get("model");
  let colorval = params.get("color");
  let sizeval = params.get("size");
  let count = 0;
  for (const key in data) {
    if (key === makeval) {
      let modelObject = data[makeval];
      if (modelObject.hasOwnProperty(modelval)) {
        let colorWayObject = modelObject[modelval];
        //Checking if we have the specified color in the model
        if (colorWayObject.hasOwnProperty(colorval)) {
          let sizeObject = colorWayObject[colorval];
          //Checking if we have the required size
          for (var i = 0; i < sizeObject.length; i++) {
            if (sizeObject[i] === sizeval) {
              return SUCCESS_CODE + ": Available in size " + sizeval;
            } else {
              count++;
            }
          }
          //Unable to find the size after parsing through the entire object
          if (count === sizeObject.length) {
            return ERROR_CODE + ": Not Available in size " + sizeval;
          }
        }
      }
    }
  }
}

//Start the server and make it listen for connections on port 8080
app.listen(8080);
console.log("Listening....");
