const express = require('express')
const app = express()

const { router } = require('./router/router');

app.use(router);

app.listen(9080, () => {
    console.log('Listening on http://localhost:9080');
});