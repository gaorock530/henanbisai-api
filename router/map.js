const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');
const {hex_md5} = require('../helper/md5');



module.exports = (app) => {

  // user Register
  app.post('/map/citylist', async (req, res) => {

    try {
      const map = await getCityList(req.body.hash);
      res.json(map);
    }catch (e) {
      console.log(e)
      res.json({err: e});
    }

  });
}

async function getCityList (hash) {
  try {
    const cityString = fs.readFileSync(path.join(__dirname, '..', 'json', 'cityList.json'));
    const cityList = JSON.parse(cityString);

    let newCityList;

    if (ConvertUTCTimeToLocalTime(true) >= cityList.expires_time) {
      console.log('/map', 'map expired.')
      const cityListString = await requireCityList();
      newCityList = updateCityList(cityListString);
      if (!newCityList) return false;
    } 
    
    if (hash && hash !== cityList.hash ) {
      console.log('/map', 'has hash', 'not match')
      return newCityList || cityList.map;
    } else if (hash && hash === cityList.hash) {
      console.log('/map', 'has hash', 'match')
      return false
    } 
    console.log('/map', 'no hash')
    return newCityList || cityList.map;

  }catch(e) {
    const cityListString = await requireCityList();
    newCityList = updateCityList(cityListString);
    if (!newCityList) return false;
    return newCityList;
  } 
}

async function requireCityList () {
  const api_url = "https://apis.map.qq.com/ws/district/v1/list?key=BBYBZ-2A66F-UDJJ2-NSWRG-VD3TZ-VSFE2";
  try {
    const mapRes = await axios.get(api_url);
    if (mapRes.data.status !== 0) {
      console.log(mapRes.data.message);
      return false;
    } 
    return mapRes.data.result;
  } catch(e) {
    console.log(e);
    return false;
  }
}

function updateCityList (cityListString) {
  const mapObj = {
    map: cityListString,
    expires_time: ConvertUTCTimeToLocalTime(true, false, 60 * 24 * 7),
    hash: hex_md5(JSON.stringify(cityListString))
  }
  const mapJson = JSON.stringify(mapObj);

  try {
    fs.writeFileSync(path.join(__dirname, '..', 'json', 'cityList.json'), mapJson);
    return cityListString;
  }catch(e) {
    return undefined;
  }
}