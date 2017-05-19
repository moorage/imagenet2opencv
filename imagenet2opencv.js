const fs = require('fs');

if (process.argv.length <= 4) {
    console.log("Usage: node " + __filename + " <xmlsdir> <annotationtxt-dir> <relativeimgdir-fromannotation>");
    console.log("Example: node " + __filename + " ~/Downloads/n04448028 ~/Projects/opencv-test/img positive");
    process.exit(-1);
}

let xmlsDir = process.argv[2];
let annotationsDir = process.argv[3];
let imagesRelativeDir = process.argv[4];
let imagesDir = annotationsDir + "/" + imagesRelativeDir;

console.log("xmlsDir="+xmlsDir+" \nannotationsDir="+annotationsDir + " \nimagesDir=" + imagesDir);

console.log("FILES")
fs.readdir(xmlsDir, (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  files.forEach(file => {
    if (file.endsWith(".xml")) {
      readXmlFile(file);
    }
  });
});

function readXmlFile(file) {
console.log(file);

}
