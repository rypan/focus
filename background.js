var myBlockedURLs;

myBlockedURLs = {urls: [
  "*://www.ignore-this-domain.com/*"
]};

var initiatlizeExtension = function (){
  // Initialize Array
  console.log("Starting Up!");

  chrome.storage.sync.get("urlStore", function(results){

    if (results.urlStore === undefined){

      // Do nothing
      console.log("urlStore is undefined")

      // Populate with defaults

      var defaultURLs = ["www.youtube.com","www.facebook.com","cnn.com","news.ycombinator.com","www.digg.com", "www.drudgereport.com", "twitter.com", "espn.go.com", "www.pinterest.com"];

      chrome.storage.sync.set({"urlStore": defaultURLs}, function(){

        chrome.storage.sync.get("urlStore", function(results){
          console.log("Retrieved urlStore -->");
          console.log(results.urlStore);
          createBlackList(formatBlackList(results.urlStore));
        });

      })

    } else {

      // if it exists, do something

      console.log("urlStore is defined")

      chrome.storage.sync.get("urlStore", function(results){
        console.log("Retrieved urlStore -->");
        console.log(results.urlStore);
        createBlackList(formatBlackList(results.urlStore));
      });

    }

  })

  // Initialize Toggle

  chrome.storage.sync.get("toggle", function(results){

    if (results.toggle === undefined){

      chrome.storage.sync.set({"toggle": true},function(){
        console.log("Toggle Initialized to FALSE");
      })

    } else {

      // Business as usual

    }

  })

}

var cryWolf = function (){
  console.log("Crying wolf...");
}

var addToBlockedList = function(){
  console.log("Background Refresh for Blocked List")
  initiatlizeExtension();
  
  chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequestCallback,
        myBlockedURLs,
        ["blocking"]);
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse){
    if(request.msg == 'startFunc') cryWolf();
  });

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse){
    if(request.msg == 'addToBlockedList') addToBlockedList();
  });

var formatBlackList = function(blob){
  var formattedURLs = [];
  var i=0;
  for (i=0;i<blob.length;i++){
    formattedURLs.push("*://"+blob[i]+"/*")
  }
//  console.log("Formatted URLS -->");
//  console.log(formattedURLs);
  return formattedURLs;
}

var createBlackList = function(blob){
  var i = 0;
  for (i=0; i<blob.length;i++){
    myBlockedURLs.urls[i] = blob[i];
    console.log("Blocked URL --> " + myBlockedURLs.urls[i]);
  }
//  console.log("Black List -->");
//  console.log(myBlockedURLs);
  return myBlockedURLs;
}

var onBeforeRequestCallback = function(details) { return {cancel: true}; };

chrome.runtime.onMessage.addListener(
  function(request,sender,sendResponse){
    if(request.t){
      console.log("Focus - Toggled On");
      chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequestCallback,
        myBlockedURLs,
        ["blocking"]);
    }else{
      chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestCallback);
      console.log("Focus - Toggled Off");
    }
  }
)

initiatlizeExtension();
