const express = require('express')
const helmet = require('helmet')
const Joi = require('joi')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const { nanoid } = require('nanoid')

require('dotenv').config()

const app = express()

const monkatles = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_KEY}@ide-cluster.utfou.mongodb.net/minly?retryWrites=true&w=majority` 
const monklocal = 'localhost/minly'

const db = require('monk')(monkatles)

const urily = db.get('urily')

const slugPattern = RegExp('^[-\\w]*$')

var uriPattern = RegExp('^(https?:\\/\\/)?(www.)?'+ // protocol
'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
'(\\#[-a-z\\d_]*)?$','i'); // fragment locator

const schema = Joi.object({
    uri: Joi.string().trim().regex(uriPattern).required(),
    slug: Joi.string().trim().regex(slugPattern).allow('')
})

app.use(morgan())
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())

app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public/'))
app.use(express.static(__dirname + '/public/assets/'))
app.use(express.static(__dirname + '/public/js/'))
app.use(express.static(__dirname + '/public/css/'))


app.get('/', (req, res, next) => {
    try {
        res.render("index",{
            heading:'Url Shortner',
            msg:'made by <a href="http://github.com/sutharp777" target="_blank">@sutharp777</a>',
        })
    } catch (error) {
        next(error)
    }

})


app.post('/', async (req, res, next) => {
    try{
        var value = await schema.validateAsync(req.body)
        var slug = req.body.slug
        if(!slug){
           slug = nanoid(5)
        }

        const doesAlreadyExist = await urily.findOne({
            slug : slug
        })      // returns null if not found

        if(doesAlreadyExist){
            return res.json({
                msg:"in use"
            })    
        }
        value.slug = slug
        const inserted = await urily.insert(value)
        res.json(inserted)
    }
    catch(error){
        next(error)
    }
})

app.get('/:id', async (req, res, next) => {
    try {
        const slug = req.params.id
        
        const item = await urily.findOne({
            slug:slug
        })
        
        if(!item){
            return res.render('index',{
                heading:'oops!',
                msg: '<span style="color:red;">redirection url not found</span>',
            })
        } 
        else{
            return res.redirect(item.uri)
        } 
      } catch (error) {
            next(error)
      }
    })

const port = process.env.PORT || 5000
app.listen(port)
