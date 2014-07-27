// String Constants
var FBURL = "https://shining-fire-3762.firebaseio.com/user/";
var IMG_REF = "r_imgs";
var IMG_DETAILS = "d_imgs";
var NO_TITLE = "no title";

/* Create User Wrapper Object to avoid namespace Conflict*/
var User = {};

// Add User fields
User.dbref = new Firebase(FBURL);
User.startRange = 0;
User.chronoPage = 0;
User.chronoLimit = 10;
User.lastChild 	= "";
User.numImgs	= 0;
User.limit 		= 10;
User.aa = [];

// TEST FIELDS!
User.name = "thomas";

// Functions for User class
User.setup = function() {
	var db = this.dbref.child(this.name);
	
	db.once("value",function(snap) {
		var result = snap.val()
		User.numImgs = result.total_imgs;
	});	
	alert(User.numImgs);
}

// For Save img URL. Sets by priorty
User.saveImg = function(aurl,atitle,acat,acom,arate) {
	// first, convert url, push reference
	var priority = (arate ==0) ? 6 : (6-arate);
	var changeurl = replaceBadChars(aurl);
	var refID = this.dbref.child(this.name + "/" + IMG_REF).push({URL:changeurl}).name();
	
	atitle = (atitle) ? atitle : NO_TITLE;
	
	// Push other information into detail on images
	this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).update(
		{
			url: aurl
			,title: atitle
			,category: acat
			,comment: acom
			,rating: arate
		});
		
	// set priority
	this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).setPriority(priority);
	
	// add 1 to total imgs
	this.dbref.child(this.name).once('value', function(snap) {
		var total = snap.val()['total_imgs'];
		User.dbref.child(User.name).update({total_imgs : (total + 1)});
	});
}

// TODO: 
// 1. parse Chrono in reverse (newest to oldest and vise versa)
// 2. fix logic
User.parseRefQuery = function(results) {
	
	var totalRes = size(results);
	var counter = 0;
	for(key in results) {
		
		// Query Database
		this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + results[key].URL)
			.once('value',function (snap) {
				counter++;
				
				User.aa.push(snap.val());
				if(counter == totalRes) {
					// Reference Data is now set with this query. Render to webpage
					User.writeToDiv();
				}
			});
	}
}


User.writeToDiv = function(){
	var str = "";
	for(i = 0; i < User.aa.length; i++)
	{
		str+="<img src=\"" + User.aa[i].url + "\" /> <p>Ref: " + User.aa[i].ref + "<p>Rating: " + User.aa[i].rating + 
		"<p>Title: " + User.aa[i].title + "<br/>";
	}
	document.getElementById("display").innerHTML += str;
}

// Gets by Chonological order
User.queryNextChrono = function(page) {
	if(page != null) {
		// pass
	}
	else {
		// First, get first 10 items of img references
		var refQuery;
		this.dbref.child(this.name + "/" + IMG_REF).endAt().limit(this.chronoLimit).once('value',function (snap) {
			refQuery = snap.val();
			User.parseRefQuery(refQuery);
		});
		
		this.chronoLimit += 10;
	}
}

function testFunc() {
	User.queryNextChrono(null);
}

// Other Functions
function replaceBadChars(str){
	var temp = str.replace(/\./g,',');
	return temp.replace(/\//g,'|');
}

function restoreBadChars(str){
	var temp = str.replace(/,/g,'.');
	return temp.replace(/\|/g,'/');
}

function each(obj,cb){
		
		if(obj){
			for (k in obj){
				if(obj.hasOwnProperty(k)){
					var res = cb(obj[k],k);
					if(res === true){
						break;
					}
				}
			}
		}
	}
	
function size(obj) {
	var i = 0;
	each(obj, function () {
		i++;
	});
	return i;
}

// TEST FUNCTIONS

window.onload = function(){
	testFunc();
}
