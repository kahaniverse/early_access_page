const express = require('express')
const bodyParser = require('body-parser')
const config = require('./config.js');

const nodemailer = require('nodemailer');

const app = express();

app.use('/site', express.static('site'));
app.all(/.*/, function(req, res, next) {
    var host = req.header("host");
    if (host.match(/^www\..*/i) || host.match(/^localhost.*/i) || host.match(/amazonaws\.com*/i)) {
        next();
    } else {
        res.redirect(301, "https://www." + host + req.url);
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/site/index.html');
})
app.get('/submit', (req, res) => {
    res.redirect('/');
})

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.gcp_email,
        clientId: config.gcp_clientId,
        clientSecret: config.gcp_clientSecret,
        refreshToken: config.gcp_refreshToken
    }
});

const AWS = require("aws-sdk");
AWS.config.update({
    region: config.aws_region,
    accessKeyId: config.aws_accessKeyId,
    secretAccessKey: config.aws_secretAccessKey
});
const db_client = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/submit', async(req, res) => {
    console.log('Sending email');
    let params = req.body;
    if(typeof params.inputEmail === 'undefined' || typeof params.inputEmail === 'undefined' )
        res.send('invalid params')
    else {
        let email = params.inputEmail.trim();
        let read = params.inputRead;
        let write = params.inputWrite;
        let draw = params.inputDraw;
        
        var data = {
            TableName: 'early-access',
            Item:{
                'email': email,
                'read': read,
                'write': write,
                'draw': draw
            }
        };
        var util = require('util');

        try {
            await db_client.put(data).promise();
        } catch (e) {
            console.log(e.message);
        }
        
        var mailOptions = {
            from: config.email_from,
            to: email,
            bcc: config.email_from,
            subject: config.email_subject_confirmation,
            text: config.email_body,
            html: '<p>Hi!</p><p>' + config.email_body  + '</p>'
        }
        transporter.sendMail(mailOptions, (err, result)=>{
            if(err){
                console.log(err.message);
                console.log('Error sending mail!');
            } else{
                console.log('Mail Sent Successfully');
            }
            let output = '<html><head><meta http-equiv="refresh" content="2;url=/#share1-m" /></head>';
            output += '<br/><br/><center>' + config.email_body + '<br/><br/>';
            output += '<a href="/#share1-m" target="_self" >Get back to homepage</a></center>';
            res.setHeader('Content-Type', 'text/html');
            res.send(output);
        });
    }
});

module.exports = app;
