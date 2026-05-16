const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

router.use(auth);

router.post('/request', authorize([Roles.SEEKER]), loanController.requestMicroLoan);
router.get('/', authorize([Roles.SEEKER]), loanController.getWorkerLoans);

module.exports = router;
