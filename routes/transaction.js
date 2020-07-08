const {Router} = require('express');
const User = require('./../models/user.js');
const Transaction = require('./../models/transaction.js');
const authMiddleware = require('./../middlewares/auth.js');

const router = Router();

router.get('/transactions',authMiddleware, async (req, res)=>{
    try {
        let userId = req.user.userId;

        let user = await User.findById(userId);

        console.log(user);

        await Transaction.find().where('_id').in(user.history).exec((err, records) => {
            if(err) {
                res.status(400).json({message: err});
            }

			res.status(200).json(records);
		});
    } catch {
        res.status(400).json({message: 'Ошибка сервера!'})
    }
    
})

module.exports = router;

