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
  const pairs = [];

  Object.entries(data.stations).forEach(([key, value])=> {
    const lineId = key.replace(/\d/g, '');
    const {
      color,
    } = getLineInfo(lineId)

    value.connections.forEach(item => {
      const pairId = key+'-'+item.target_id;
      const pairIdInverse = item.target_id+'-'+key;

      if (pairs.includes(pairId) || pairs.includes(pairIdInverse)) {
        return;
      }

      pairs.push(pairId);
      pairs.push(pairIdInverse);
      
      vertices.push({
        'Source': key,
        'Target': item.target_id,
        'Color': color,
        'Weight': item.distance ? item.distance : 0.00001,
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

  fs.writeFile('./'+name+'.csv', dataText, 'utf-8', function (err) {
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