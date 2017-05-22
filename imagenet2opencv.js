const fs = require('fs');
const xml2js = require('xml2js');
const spawn = require('child_process').spawn;




if (process.argv.length <= 4) {
  console.log("Usage: node " + __filename + " <xmlsdir> <annotationtxt-dir> <relativeimgdir-fromannotation>");
  console.log("Example: node " + __filename + " ~/Downloads/n04448028 ~/Projects/opencv-test/img positive");
  process.exit(-1);
}

let xmlsDir = process.argv[2];
let annotationsDir = process.argv[3];
let imagesRelativeDir = process.argv[4];
let imagesDir = annotationsDir + "/" + imagesRelativeDir;
let annotationsOutput = "";
let totalFiles = 0;
let completedFiles = 0;

console.log("xmlsDir="+xmlsDir+" \nannotationsDir="+annotationsDir + " \nimagesDir=" + imagesDir);

// Read all xml files
fs.readdir(xmlsDir, (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  files.forEach(file => {
    if (file.endsWith(".xml")) {
      totalFiles++;
      readXmlFile(file);
    }
  });

});

function checkDoneAndWrite() {
  if (completedFiles >= totalFiles) {
    // fs.closeSync(fs.openSync(annotationsDir + "/annotations.txt", 'w'));
    fs.writeFile(annotationsDir + "/annotations.txt", annotationsOutput, function(err) {
      if(err) {
        console.error(err);
      } else {
        console.log("Wrote to "+annotationsDir + "/annotations.txt");
      }
    });
  }
}

function readXmlFile(file) {
  let fullFilePath = xmlsDir + "/" + file;
  let parser = new xml2js.Parser();
  fs.readFile(fullFilePath, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // console.log("Going to read "+fullFilePath);
    parser.parseString(data, function (perr, result) {
      if (perr) {
        console.error(perr);
        process.exit(1);
      }
      // console.log(result.annotation);
      //console.log(result.annotation.folder + "/" + result.annotation.filename + " ("+result.annotation.size[0].width+" x "+result.annotation.size[0].height+")");
      //if (result.annotation.object.length > 1) { console.log("\n\n\n\n--------"+result.annotation.object.length+" objects--------\n\n\n\n\n")}
      let annotationLine = imagesRelativeDir + "/" + result.annotation.filename + ".JPEG " + result.annotation.object.length;
      for (let i = 0; i < result.annotation.object.length; i++) {
        let o = result.annotation.object[i].bndbox[0];
        annotationLine += " " + o.xmin + " " + o.ymin + " " + (parseInt(o.xmax)-parseInt(o.xmin))+ " " + (parseInt(o.ymax)-parseInt(o.ymin));
      }
      annotationsOutput += annotationLine + "\n";

      let cp = spawn('cp', [xmlsDir + "/" + result.annotation.folder + "/" + result.annotation.filename + ".JPEG", imagesDir + "/" + result.annotation.filename + ".JPEG"]);
      cp.stdout.on('data', (data) => { if (data && data.length > 0) { console.log(`cp::stdout: ${data}`); }});
      cp.stderr.on('data', (data) => { console.error(`cp::stderr: ${data}`);});

      completedFiles++;
      console.log("Processed "+completedFiles + " of " + totalFiles + " xml files.");

      checkDoneAndWrite();
    });
  });
}
