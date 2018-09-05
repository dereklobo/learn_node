var express = require('express')
var bodyParse = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParse.json())
app.use(bodyParse.urlencoded({extended:false}))

mongoose.Promise = Promise

var dbUrl = ""

var Message = mongoose.model('Message',{
    name:String,
    message:String
})

// var messages = [
//     {name:'Derek',message:"How are you?"},
//     {name:'Larissa',message:"I am good"}
// ]

app.get('/messages',(req,res)=>{
    Message.find({},(err,messages)=>{
        res.send(messages)
    })
    
})

app.get('/messages/:user',(req,res)=>{
    var user = req.params.user
    Message.find({name:user},(err,messages)=>{
        res.send(messages)
    })
    
})

app.post('/messages',async(req,res)=>{
    //  console.log(req.body)

    try {
        // throw 'some error'
        var message = new Message(req.body)

        var savedMessage = await message.save()
        console.log('saved')

        var censored = await Message.findOne({message:'badword'})
    
        if(censored){
            await Message.deleteOne({_id:censored.id})
        }
        else
            io.emit('message',req.body)
            res.sendStatus(200)
        
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally{
        console.log('Message post called')
    }
    
})

io.on('connection',(socket)=>{
    console.log('User connected')
})

mongoose.connect(dbUrl,{useNewUrlParser:true},(err)=>{
    console.log("Mongoose Db connection",err)
})

var server = http.listen(3000,()=>{
    console.log("Server is listening on port",server.address().port)
});
