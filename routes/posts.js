const Post = require("../models/Post")
const User = require("../models/User")
const router = require("express").Router()

//create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch(err) {
        res.status(500).json(err)
    }
})


//update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(post.userId === req.body.userId) {
            await post.updateOne({$set: req.body})
            res.status(200).json("the post has been updated.")

        } else {
            res.status(403).json("you can only update your post.")
        }

    } catch(err) { 
        res.status(500).json(err)
    }
    
})


//delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json("the post has been deleted.")

        } else { 
            res.status(403).json("you can only update your post.")
        }

    } catch(err) { 
        res.status(500).json(err)
    }
    
})



//like or dislike post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            res.status(200).json("The post has been liked.")
        } else {
            await post.updateOne({ $pull: {likes: req.body.userId } })
            res.status(200).json("The post has been disliked.")
        }

    } catch(err) {
        res.status(500).json(err)
    }    
})


//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        
        res.status(200).json(post)

    } catch(err) {
        res.status(500).json(err)
    }
})


//get main feed timeline posts.
router.get("/timeline/all", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId) // find current user by id
        const userPosts = await Post.find({ userId: currentUser._id}) // find all posts (each post has userId in Post Model) that matches with current user id. 
        const friendPosts = await Promise.all( 
            currentUser.followings.map(friendId => { // map through currentUser's following people and find their osts that matches with friend id.
                return Post.find({ userId: friendId })
            })
        )
        res.json(userPosts.concat(...friendPosts))
    } catch(err) {
        res.status(500).json(err)
    }
})

module.exports = router