'use strict';

var express = require('express');
var fs = require('fs');
var util = require('util');
var bodyParser = require('body-parser');
var mime = require('mime');
var sendmail = require('sendmail')();
var request = require("request");
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
const REST_PORT = (process.env.PORT || 5111);

// Set up auth
var gcloud = require('google-cloud')({
  keyFilename: 'GoogleOCRPOC-e4b04e9203c7.json',
  projectId: 'single-planet-159413'
});

var vision = gcloud.vision();

var app = express();

app.use(bodyParser.json());

app.post('/', upload.single('image'), function(req, res, next) {

var params=function(req){
  var q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}
	
req.params=params(req);

var user_id = req.params.user_id;

var planname = req.params.planname;

var name = req.body.name;

var mobile = req.body.mobile;

var brand = req.body.brand;

var experience = req.body.experience;

var more_details = req.body.more_details;

if(name && mobile && brand && experience && more_details)
{	
sendmail({
from: 'admin@yourdomain.com',
to: process.env.to_email,
subject: 'SwitchBot Feedback from '+name,
html: "Content: <br /> Name: "+req.body.name+" <br />Date and time submitted: "+new Date()+"<br />Mobile Number: "+req.body.mobile+"<br />Cellphone brand and model: "+req.body.brand+"<br />Details: "+req.body.experience+"<br /> Additional Details: "+req.body.more_details+" ",
}, function(err, reply) {
console.log(err && err.stack);
console.dir(reply);
});


var text = "Thank you very much for sharing this. I will forward all the given information to my human friend in Globe to properly address your concern.";

//var text = "Your request was submitted successfully with the details as : Name : "+name+", Plan : "+planname+", Sex : "+sex+", DOB : "+dob+" \n\n Our sales team will contact you within 48Hours.";

var token = process.env.FB_PAGE_TOKEN;

var requestData = {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        dashbotTemplateId: 'right',		  
        recipient: {
			id:user_id
			},
        message: {
		   text:text	
		}
      }
};

console.log('RequestData:', requestData);

request(requestData, function(error, res, body) {  
if (error) {
  console.log('Error sending message: ', error);
} else if (res.body.error) {
  console.log('Error: ', res.body.error);
  }

});

res.writeHead(200, {
'Content-Type': 'text/html'
});
  
var form1 = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-ap-southeast-1.amazonaws.com/formstyle/responsiveform.css">'+
'<div id="envelope"><body align="left" onload=window.location="http://m.me/digitaldemofortelcos"><header><h2>Your feedback</h2></header><hr>' +
'<p>Your concern was logged. Thanks</p>'+
'</div>'+
'</body></html>';

res.write(form1);

// Delete file (optional)
fs.unlinkSync(req.file.path);

res.end();

}

else
{
var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-ap-southeast-1.amazonaws.com/formstyle/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Your feedback</h2></header><hr>' +
'<form class="form-style-9" action="" method="post" enctype="multipart/form-data"><br /><label>Name </label><input type="text" name="name" class="field-style field-split align-left" value='+planname+' placeholder="Name" /><br /><label>What is the mobile number you are using when you experienced the problem?</label><input type="text" name="mobile" class="field-style field-split align-left" placeholder="Mobile" />'+
'<label>What is your cellphone brand and model?	</label><input type="text" name="brand" class="field-style field-split align-right" placeholder="Brand" />'+
'<label>Can you share the details of your experience? </label><input type="text" name="experience" class="field-style field-split align-left" placeholder="Share Experience" />'+
'<label>Anything more you wish to add? </label><textarea name="more_details" class="field-style field-split align-left" placeholder="More Details"></textarea>'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body></html>';

res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(form);
	
}

});

// TODO implement
// Simple upload form

app.get('/', function(req, res) {

var params=function(req){
  var q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}
	
req.params=params(req);

var user_id = req.params.user_id;

var planname = req.params.planname;

var form = '<!DOCTYPE HTML><html><link rel="stylesheet" type="text/css" href="https://s3-us-west-2.amazonaws.com/telcocode/responsiveform.css"><div id="envelope"><body align="left" style="margin:0 auto;"><header><h2>Personal Details</h2></header><hr>' +
'<form class="form-style-9" action="" method="post" enctype="multipart/form-data"><br /><label>Name </label><input type="text" name="name" class="field-style field-split align-left" value='+planname+' placeholder="Name" /><br /><label style="line-height:50px;">What is the mobile number you are using when you experienced the problem?</label><input type="text" name="mobile" class="field-style field-split align-left" placeholder="Mobile" />'+
'<label style="line-height:50px;">What is your cellphone brand and model?	</label><input type="text" name="brand" class="field-style field-split align-right" placeholder="Brand" />'+
'<label style="line-height:50px;">Can you share the details of your experience? </label><input type="text" name="experience" class="field-style field-split align-left" placeholder="Share Experience" />'+
'<label style="line-height:50px;">Anything more you wish to add? </label><textarea name="more_details" class="field-style field-split align-left" placeholder="More Details"></textarea>'+
'<br /><br /><input type="submit" value="Submit" />'+
'</form></div>'+
'</body></html>';

res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(form);

});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});
