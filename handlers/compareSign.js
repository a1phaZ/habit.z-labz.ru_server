const {createError} = require("./error");
const qs = require('querystring');
const crypto = require('crypto');

module.exports = (req, res, next) => {
	const params = req.query;
	const ordered = {};
	Object.keys(params).sort().forEach((key) => {
		if (key.slice(0, 3) === 'vk_') {
			ordered[key] = params[key];
		}
	});
	const stringParams = qs.stringify(ordered);
	const paramsHash = crypto
		.createHmac('sha256', process.env.APP_VK)
		.update(stringParams)
		.digest()
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=$/, '');
	if (paramsHash === params.sign) {
		next();
	} else {
		next(createError(403, 'Ошибка параметров подписи'));
	}
};
