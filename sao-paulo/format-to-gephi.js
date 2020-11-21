const fs = require('fs');
const file = fs.createReadStream('./stations.csv');
const linesFile = fs.createReadStream('./lines.csv');
const Papa = require('papaparse')
let lines = []

const readCsv = () => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: function(results, file) {
        Papa.parse(linesFile, {
          header: true,
          complete: function(results2, file) {
            lines = results2.data;
            resolve(results.data);
          }
        });
      }
    });
  })
}

const getNodes = (data) => {
  const nodes = [];
  const createdStations = [];

  data.forEach(item => {
    const [line, lineName] = item.line.split('-') 
    
    if (createdStations.includes(item.station)) {
      return;
    }

    createdStations.push(item.station);
    const {color} = lines.find(item => item.id == line)

    nodes.push({
      "Id": item.station,
      "Color": color,
      'LineName': lineName,
      'Line': line
    })
  })

  return nodes;
}

const getVertices = (data) => {
  const vertices = []
  const pairs = [];

  data.forEach((item, index) => {
    const next = data[index + 1];

    if (!next || next.line != item.line) {
      return;
    }

    const pairId = item.station+'-'+next.station;
    const pairIdInverse = next.station+'-'+item.station;

    if (pairs.includes(pairId) || pairs.includes(pairIdInverse)) {
      return;
    }

    pairs.push(pairId);
    pairs.push(pairIdInverse);
    const [line] = item.line.split('-') 
    const {color} = lines.find(item => item.id == line)
    
    vertices.push({
      'Source': item.station,
      'Color': color,
      'Target': next.station
    })
  });

  return vertices;
}

const saveCSV = (name, data) => {
  const dataText = Papa.unparse(data, {
    delimiter: ",",
    header: true,
  })

  fs.writeFile('./'+name+'.csv', dataText, 'utf-8', function (err) {
    console.log(err);
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });
}


readCsv().then(data => {
  saveCSV('./nodes', getNodes(data))
  saveCSV('./vertices', getVertices(data))
})