const https = require('https');

async function getPhoneNumbers(country, phoneNumber) {
    var finalResponse
    country 
    return new Promise((resolve, reject) => {
      https.get(`https://jsonmock.hackerrank.com/api/countries?name=${country}`, (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk
        console.log('.');
        
      });
      resp.on("end", () => {
        const response = JSON.parse(data);
        if(response && response["data"] 
            && response["data"][0] 
            && response["data"][0]["callingCodes"] 
            && response["data"][0]["callingCodes"][0])
          finalResponse = "+" + response["data"][0]["callingCodes"][0] + " " + phoneNumber
        else
          finalResponse = -1;
        resolve(finalResponse)
      });
    })
    });
}

async function main() {
  const s = await getPhoneNumbers("India", "00000");
  console.log(s);
}
main();