// implement your posts router here
const express = require('express');
const { restart } = require('nodemon');

const router = express.Router();

const Posts = require('./posts-model');

router.get('/', (req, res) => {
    Posts.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({
                message: "The posts information could not be retrieved",
                error: err.message
            });
        });
});

router.get('/:id', (req, res) => {
    Posts.findById(req.params.id)
        .then(post => {
            if(post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({
                    message: "The post with the specified ID does not exist"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "The post information could not be retrieved",
                error: err.message
            });
        });
});

router.post('/', async (req, res) => {
    try {
        if(!req.body.title || !req.body.contents) {
            res.status(400).json({
                message: "Please provide title and contents for the post"
            })
        } else {
            const post = await Posts.insert(req.body);
            const newPost = await Posts.findById(post.id)
            res.status(201).json(newPost)
        }
    } catch(err) {
        res.status(500).json({
            message: "There was an error while saving the post to the database",
            error: err.message
        })
    }
});

router.put('/:id', (req, res) => {
    Posts.update(req.params.id, req.body)
        .then(post => {
            if(!req.body.title || !req.body.contents) {
                res.status(400).json({
                    message: "Please provide title and contents for the post"
                })
            } else if(!post) {
                res.status(404).json({
                    message: "The post with the specified ID does not exist" 
                })
            } else {
                Posts.findById(req.params.id)
                    .then(updated => {
                        res.status(200).json(updated);
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "The post information could not be modified",
                error: err.message
            })
        });
});

router.delete('/:id', async (req, res) => {
    Posts.findById(req.params.id)
        .then(post => {
            const deletedPost = post;
            Posts.remove(req.params.id)
                .then(deleted => {
                    if(!deleted) {
                        res.status(404).json({
                            message: "The post with the specified ID does not exist"
                        })
                    } else {
                        res.status(200).json(deletedPost)
                    }
              }) 
        .catch(err => {
            res.status(500).json({
                message: "The post could not be removed",
                error: err.message
            })
        });
    });
});

router.get('/:id/comments', (req, res) => {
    Posts.findById(req.params.id)
        .then(post => {
            if(!post) {
                res.status(404).json({
                    message: "The post with the specified ID does not exist"
                })
            } else {
                Posts.findPostComments(req.params.id)
                    .then(comments => {
                        res.status(200).json(comments)
                    })
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "The comments information could not be retrieved",
                    error: err.message
                })
            })
})

module.exports = router;