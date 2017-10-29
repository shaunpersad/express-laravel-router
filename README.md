# express-laravel-router
A Laravel-inspired router for express.js


## Quickstart
```js
const express = require('express');
const createRouter = require('express-laravel-router').createRouter;

const app = express();
const router = createRouter(app);

router.group('/api', (router) => {
   
    router.group({  prefix: '/v1', middleware: [...] }, (router) => {
        
        router.post('/auth', (req, res) => {
            
        });
        
        router.group('/users', (router) => {
           
            router.get({ uri: '/{userId}', middleware: [...]}, (req, res) => {
                
                res.send({
                    id: req.params.userId
                });
            });    
        });
    });
});
```
The above will create two routes:
1. A POST to `/api/v1/auth`
2. A GET to `/api/v1/users/{userId}`