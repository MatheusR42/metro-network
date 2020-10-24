const data = require('./stations.json')
const dataLines = require('./lines.json')
const Papa = require('papaparse')
const fs = require('fs');

const getLineInfo = lineName => {
  return dataLines.find(item => item.id == lineName)
}

const getNodes = () => {
  const nodes = [];

  Object.entries(data.stations).forEach(([key, value])=> {
    const lineId = key.replace(/\d/g, '');
    const id = key;
    const {
      color,
      name: lineName,
      id: line
    } = getLineInfo(lineId)

    nodes.push({
      "Id": id,
      "Color": color,
      'LineName': lineName,
      'Line': line
    })
  })

  return nodes;
}

const getVertices = () => {
  const vertices = []
  Object.entries(data.stations).forEach(([key, value])=> {
    value.connections.forEach(item => {
      vertices.push({
        'Source': key,
        'Target': item.target_id,
        'Weight': item.distance
      })
    })
  })

  return vertices;
}

const saveCSV = (name, data) => {
  const dataText = Papa.unparse(data, {
    delimiter: ",",
    header: true,
  })

  fs.writeFile('./'+name+'.csv', dataText, 'utf8', function (err) {
    console.log(err);
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });
}

saveCSV('nodes', getNodes())
saveCSV('vertices', getVertices())