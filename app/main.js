const express = require('express')
const app = express()
const cors = require('cors');
const { router } = require('./router/router');

const corsOptions = {
    origin: ['http://localhost:3000'],
}

app.use(cors(corsOptions))
app.use(router);

app.listen(9080, () => {
    console.log('Listening on http://localhost:9080');
});