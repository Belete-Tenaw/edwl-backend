const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');

const disputeController = require('../controllers/disputeController');

router.post('/', auth, contractController.createContract);
router.get('/', auth, contractController.getContracts);
router.put('/:contractId/sign', auth, contractController.signContract);
router.post('/:contractId/dispute', auth, disputeController.createDispute);

module.exports = router;
