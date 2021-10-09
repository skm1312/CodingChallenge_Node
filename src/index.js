var myExpress = require("express");
var myParser = require("body-parser");
var app = myExpress();
const fs = require("fs");
const { response } = require("express");
const { parse } = require("path");
const { Console } = require("console");
//create global costants with the error codes

let rawdata = fs.readFileSync("sneakers.json", "utf-8");
let data = JSON.parse(rawdata);

app.use(myParser.urlencoded({ extended: true }));
app.get("/:make/:model", function (request, response) {
  let sizeRet = makeModelSize(request.params);
  response.send(sizeRet);
});

app.get("/:make/:model/:size", function (request, response) {
  let sizeAvail = makeModelSize(request.params);
  response.send(sizeAvail);
});

app.get("/:make/:model/:color/:size", function (request, response) {
  let sizeAvailCol = makeModelColorwaySize(request.params);
  response.send(sizeAvailCol);
});

app.get("/:make", function (request, response) {
  let params = new URLSearchParams(request.params);
  let makeval = params.get("make");
  console.log(makeval);
  for (const key in data) {
    console.log("Test");
    if (key === makeval) {
      console.log("inside if");
      let modelObject = data[makeval];
      //console.log(Object.keys(modelObject));
      response.send(Object.keys(modelObject));
      break;
    } else {
      response.send("404: Product Not found");
    }
  }
});

function makeModelSize(values) {
  let params = new URLSearchParams(values);
  let makeval = params.get("make");
  let modelval = params.get("model");
  let sizeval;
  let count = 0;
  try {
    sizeval = params.get("size");
  } catch (err) {
    console.log("No size val in params");
  }
  for (const key in data) {
    if (key === makeval) {
      let modelObject = data[makeval];
      if (modelObject.hasOwnProperty(modelval)) {
        //console.log(modelObject[modelval]);
        let sizeObject = modelObject[modelval];
        //console.log(sizeObject);
        let typeSize = Array.isArray(sizeObject);
        if (!typeSize && sizeval == null) {
          console.log("value" + Object.keys(sizeObject));
          return "200:" + Object.keys(sizeObject);
        } else {
          //console.log("test");
          let c = parseInt(sizeval, 10);
          if (isNaN(c)) {
            //console.log("ifTest");
            let colorObject = sizeObject[sizeval];
            console.log(colorObject);
            if (colorObject !== undefined) return "200: " + colorObject;
            else {
              return "404: Product Not available";
            }
          }
        }
        //console.log(Array.isArray(sizeObject));
        if (sizeval === null) {
          return "200: " + sizeObject;
        }
        for (var i = 0; i < sizeObject.length; i++) {
          if (sizeObject[i] === sizeval) {
            return "200: Available in size " + sizeval;
          } else {
            count++;
          }
        }
        if (count === sizeObject.length) {
          return "404: Not Available in size " + sizeval;
        }
      } else {
        return "404: Product Not available";
      }
    } else {
      return "404: Product Not available";
    }
  }
}

function makeModelColorwaySize(values) {
  let params = new URLSearchParams(values);
  let makeval = params.get("make");
  let modelval = params.get("model");
  let colorval = params.get("color");
  let sizeval = params.get("size");
  let count = 0;
  for (const key in data) {
    if (key === makeval) {
      //console.log(Obj[key])
      let modelObject = data[makeval];
      if (modelObject.hasOwnProperty(modelval)) {
        //console.log(modelObject[param2])
        let colorWayObject = modelObject[modelval];
        //console.log(colorWayObject)
        if (colorWayObject.hasOwnProperty(colorval)) {
          let sizeObject = colorWayObject[colorval];
          console.log(sizeObject);
          for (var i = 0; i < sizeObject.length; i++) {
            if (sizeObject[i] === sizeval) {
              return "200: Available in size " + sizeval;
            } else {
              count++;
            }
          }
          if (count === sizeObject.length) {
            return "404: Not Available in size " + sizeval;
          }
        }
      }
    }
  }
}

//Start the server and make it listen for connections on port 8080

app.listen(8080);
