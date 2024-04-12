// input.yaml
// SERVER_KEY: get server key from Project Settings -> Cloud Messaging -> Cloud Messaging API (Legacy)
// TOKEN: get from RTDB

const fs = require('fs');
const util = require('util');
const yaml = require('js-yaml');

const input_raw = fs.readFileSync('./getWebSubscriptions.yaml', 'utf8');
const input = yaml.load(input_raw);

(async () => {
    const result = await fetch(`https://iid.googleapis.com/iid/info/${input.TOKEN}?details=true`, {
	headers:{
//	    'access_token_auth': true,
            'Authorization': `Bearer ${input.SERVER_KEY}`,
            'content-type': 'application/json'
	}
    });
    const payload = await result;
    console.log(util.inspect(await result.json(), {depth: null}));
})();
