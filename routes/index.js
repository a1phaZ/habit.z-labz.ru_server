const express = require('express');
const router = express.Router();

router.get('/api', (req, res) => {
	return res.status(200).json({
		success: true,
		data: {
			message: 'test api connection'
		},
		error: null
	});
});

router.use('/api/habit', require('./habit'));

module.exports = router;