const fs = require('fs');
const { Builder, By } = require("selenium-webdriver")

const lines = [
  {
    "id": "A",
    "name_en": "Asakusa Line",
    "name_jp": "浅草線"
},
{
    "id": "C",
    "name_en": "Chiyoda Line",
    "name_jp": "千代田線"
},
{
    "id": "E",
    "name_en": "Ōedo Line",
    "name_jp": "都営地下鉄大江戸線"
},
{
    "id": "F",
    "name_en": "Fukutoshin Line",
    "name_jp": "副都心線"
},
{
    "id": "G",
    "name_en": "Ginza Line",
    "name_jp": "銀座線"
},
{
    "id": "H",
    "name_en": "Hibiya Line",
    "name_jp": "日比谷線"
},
{
    "id": "I",
    "name_en": "Mita Line",
    "name_jp": "三田線"
},
{
    "id": "M",
    "name_en": "Marunouchi Line",
    "name_jp": "丸ノ内線"
},
{
    "id": "Mb",
    "name_en": "Marunouchi Line Branch Line",
    "name_jp": "丸ノ内線分岐線"
},
{
    "id": "N",
    "name_en": "Namboku Line",
    "name_jp": "南北線"
},
{
    "id": "S",
    "name_en": "Shinjuku Line",
    "name_jp": "新宿線"
},
{
    "id": "T",
    "name_en": "Tōzai Line",
    "name_jp": "東西線"
},
{
    "id": "Y",
    "name_en": "Yūrakuchō Line",
    "name_jp": "有楽町線"
},
{
    "id": "Z",
    "name_en": "Hanzōmon Line",
    "name_jp": "半蔵門線"
}
]

const getLineIdByName = name => {
  return (lines.find(item => item.name_en == name) || {}).id
}

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
  var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 
  function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
   }
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}


async function init() {
  const driver = await new Builder().forBrowser('firefox').build();
  await driver.get('https://en.wikipedia.org/wiki/Tokyo_subway')

  const table = await driver.findElement(By.xpath("//*[contains(@class,'wikitable') and contains(.,'Tokyo Metro')]"))
  let rows = await table.findElements(By.css("a:not(.image)"))
  let lines = []

  for(let row of rows) {
    const name = await row.getText()
    const url = await row.getAttribute('href')

    console.log({
      name,
      url,
    });
    lines.push({
      name,
      url,
    });
  }

  let newLines = [];

  for (let line of lines) {
    await driver.navigate().to(line.url);
    const trSpeed = await driver.findElement(By.xpath("//tr[contains(.,'Operating speed')]"))
    const operatingSpeed = parseInt(await (await (await trSpeed.findElement(By.css('td'))).getText()).split(/\s/)[0])

    const trLength = await driver.findElement(By.xpath("//tr[contains(.,'Line length')]"))
    const lineLength = parseFloat(await (await (await trLength.findElement(By.css('td'))).getText()).split(/\s/)[0])

    const trRiders = await driver.findElement(By.xpath("//tr[contains(.,'Daily ridership')]"))
    const dailyRidership = parseInt(await (await (await trRiders.findElement(By.css('td'))).getText()).split(/\s/)[0].replace(/\,/g, ''))

    const color = rgb2hex(await (await driver.findElement(By.css('.infobox > tbody > tr > th'))).getCssValue("border-top-color"));
    
    console.log({
      ...line,
      id: getLineIdByName(line.name),
      lineLength,
      dailyRidership,
      color,
      operatingSpeed
    });
    newLines.push({
      ...line,
      id: getLineIdByName(line.name),
      lineLength,
      dailyRidership,
      color,
      operatingSpeed
    })
  }

  console.log(newLines)
  console.log(newLines.length)
  fs.writeFile('lines.json', JSON.stringify(newLines, null, 2), 'utf8', function(err) {
    if (err) throw err;
    console.log('complete');
  });
}

init()