const { Router } = require('express');
const router = Router();

router.post('/api/v1/schedule/create', (req, res) => {
    res.send("Created Schedule");
});

router.put('/api/v1/schedule/extend', (req, res) => {
    res.send("Extended Schedule");
});

module.exports = router;