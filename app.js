var express         = require("express"),
    app             = express(),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser"),
    sanitizer       = require("express-sanitizer"),
    methodOverride  = require("method-override");
    

//APP CONFIG 
mongoose.connect('mongodb://localhost/criminals_app');
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));

//SCHEMA SETUP
var archiveSchema = new mongoose.Schema({
    name: String,
    body: String,
    photo: String,
    created: {type: Date, default: Date.now}
});

var Archive = mongoose.model('Archive', archiveSchema);


//ROOT ROUTE
app.get('/', function(req, res){
    res.redirect('/criminals');
});

//INDEX PAGE - LIST ALL CRIMINALS
app.get('/criminals', function(req, res){
    Archive.find({}, function(err, archives){
        if(err){
            res.redirect('/criminals');
        } else {
            res.render('index', {archives:archives});
        }
    });
});

//NEW - SHOW FORM TO ADD NEW ENTRY
app.get('/criminals/new', function(req, res){
    res.render('new');
});

//CREATE - ADD NEW ENTRY TO DB
app.post('/criminals', function(req, res){
    req.body.archive.body = req.sanitize(req.body.archive.body);
    var formInfo = req.body.archive;
    Archive.create(formInfo, function(err, newEntry){
        if(err){
            res.redirect('criminals/new');
        } else {
            res.redirect('/criminals');
        }
    });
});

//SHOW - INFO ABOUT ONE ENTRY
app.get('/criminals/:id', function(req, res){
    Archive.findById(req.params.id, function(err, entry){
        if(err){
            res.redirect('/');
        } else {
            res.render('show', {archive: entry});
        }
    });
});

//EDIT - DISPLAY FORM TO MAKE UPDATES
app.get('/criminals/:id/edit', function(req, res){
    Archive.findById(req.params.id, function(err, entry){
        if(err){
            res.redirect('/');
        } else {
            res.render('edit', {archive: entry});
        }
    });
});

//UPDATE - MAKE CHANGES TO EXISTING ENTRY
app.put('/criminals/:id', function(req, res){
    req.body.archive.body = req.sanitize(req.body.archive.body);
    Archive.findByIdAndUpdate(req.params.id, req.body.archive, function(err, entry){
        if(err){
            res.redirect('/');
        } else {
            var findUrl = '/criminals/' + entry._id;
            res.redirect(findUrl);
        } 
    });
});

//DELETE  - REMOVE ENTRY
app.delete('/criminals/:id', function(req, res){
    Archive.findById(req.params.id, function(err, entry){
        if(err){
            res.redirect('/');
        } else {
            entry.remove();
            res.redirect('/criminals');
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Server is up!');
});