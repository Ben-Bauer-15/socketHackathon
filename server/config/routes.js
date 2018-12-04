var controller = require('../controllers/games')
var session = require('express-session')

module.exports = function(app){

    app.use(session({
        secret : 'kittens',
        resave : false,
        saveUninitialized : true,
        cookie : {maxAge : 60000}
    }))
    
    app.get('/', function(req, res){
        controller.index(req, res)
    })

    app.get('/game', function(req, res){
        controller.game(req, res)
    })
}