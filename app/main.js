const express = require('express')
const app = express()
const cors = require('cors');

const { router } = require('./router/router');

app.use(router);
app.use(cors)

app.listen(9080, () => {
    console.log('Listening on http://localhost:9080');
});