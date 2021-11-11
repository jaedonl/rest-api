const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require("bcrypt")
const { findOne } = require("../models/User")


//Register
router.post("/register", async (req, res) => {

    try {
        //generate new secured password before export
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        
        //save user and return response
        const user = await newUser.save()
        res.status(200).json(user) 

    } catch(err) {
        console.log(err);
    }
})


//Login
router.post("/login", async (req,res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        !user && res.status(404).send("user not found")

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).send("wrong password")

        res.status(200).json(user)
    }
    catch(err) {
        console.log(err);
    }
})
module.exports = router