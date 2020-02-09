if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express()
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next()
})



// const mongoose = require('mongoose');
// mongoose.connect(process.env.DATABASE_URL,{
//    useNewUrlParser:true,
//    useUnifiedTopology: true
// });
// const db = mongoose.connection;
// db.on('error', error => console.error(error));
// db.once('open', () => console.log('connect to db'));

app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);

port = 3000;
DBname = 'gilad';

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL || `mongodb://localhost/${DBname}`, { useUnifiedTopology: true,
useNewUrlParser: true }).then(() => {
    app.listen(process.env.PORT || port, () => console.log(`Running server on port ` + port))
})


//app.listen(process.env.PORT || 3000)
