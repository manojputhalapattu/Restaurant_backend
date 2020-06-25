const express = require('express');

const dishRouter = express.Router();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const authenticate = require('../authenticate')
const Dishes = require('../models/Dishes');
const cors = require('./cors');


dishRouter.use(bodyParser.json());
dishRouter.route('/')
.options(cors.corsWithOptions , (req,res)=>{
    res.sendStatus = 200;
})
.get(cors.cors,(req,res,next)=>{
       Dishes.find({})
         .populate('comments.author')
         .then((dishes)=>{
             res.statusCode =  200;
             res.setHeader('Content-Type','application/json');
             res.json(dishes);
         },(err)=>console.log(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.create(req.body) 
    
       .then((dishes)=>{
           res.statusCode = 200;
           res.setHeader('Content-Type','application/json');
           res.json(dishes);
           console.log('inserted succesfully')
           console(dishes)
       },(err)=>next(err))
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});


dishRouter.route('/:dishId')
.options(cors.corsWithOptions , (req,res)=>{
    res.sendStatus = 200;
})
.get(cors.cors,(req,res)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=>next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res)=>{
    res.statusCode = 403;
    console.log('POST IS not supported');
    res.end(`<html><h1>TPOST is not supported in /dishes/${req.params.dishId}</h1></html`)
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res)=>{
        Dishes.findByIdAndUpdate(req.params.dishId,{$set : req.body},{new :true})
        .then((dish)=>{
              console.log(dish);
              res.statusCode = 200;
              res.setHeader('Content-Type','application/json');
              res.json(dish);
        },(err)=>next(err))
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish)=>{
        console.log("removed succesfully ",dish);
        res.statusCode = 200;
              res.setHeader('Content-Type','application/json');
              res.json(dish);
    })
})


dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions , (req,res)=>{
    res.sendStatus = 200;
})
.get(cors.cors,(req,res,next) =>{
      Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish)=>{
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
                }          
            
        
          else{
            err = new Error("not found");
            err.status = 404;
            return next(err);
          }
      },(err)=>next(err))

})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish !=null){
            req.body.author = req.user._id;
           dish.comments.push(req.body)
               dish.save()
               .then((dish)=>{
                   Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        console.log('comments updated');
                        res.statusCode = 200;
                 
                        res.setHeader('Content-Type','application/json');
                        res.json(dish.comments)    
                    })
                  
               })
        }
        else{
            err = new Error("not found");
            err.statusCode = 404;
            return next(err);
          }
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res)=>{
    res.statusCode = 403;
    console.log('put is not supported');
   
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res)=>{
   Dishes.findById(req.params.dishId)
     .then((dish)=>{
            if(dish != null){
                    for (var i=dish.comments.length-1;i>=0;i--){
                        dish.comments.id(dish.comments[i]._id).remove()
                    }
                    dish.save()
                        .then(()=>{
                            res.statusCode = 200;
                            console.log('succesfully deleted');
                            res.setHeader('Content-Type','application/json');
                            res.json(dish)    
                        })
                  
            }
            else{
                res.statusMessage=404;
                err = new Error('dish notfound');
                return err;
            }
     },(err)=>next(err))
})

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions , (req,res)=>{
    res.sendStatus = 200;
})
.get(cors.cors,(req,res,next) =>{
      Dishes.findById(req.params.dishId)
      .populate('comments.author') 
      .then((dish)=>{
          if (dish != null && dish.comments.id(req.params.commentId)!=null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
          }
          else{
            err = new Error("not found");
            return next(err);
          }
      },(err)=>next(err))

})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{

    res.statusCode = 403;
    console.log('put is not supported');
   
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null  ) {
            if ((dish.comments.id(req.params.commentId).author._id).equals(req.user.id) ){
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;                
                }
               
               
            }  
            else{
                res.statusCode = 403;
                res.setHeader('Content-Type','text/html')
                res.end('This is not Your comment')
             
             }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })              
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if ((dish.comments.id(req.params.commentId).author._id).equals(req.user.id) ){
                dish.comments.id(req.params.commentId).remove();
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);  
                    })                       
                }, (err) => next(err));
            }
            else{
                res.statusCode = 403;
                res.setHeader('Content-Type','text/html')
                res.end('This is not Your comment to delete')
            }
            
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;