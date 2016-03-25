var myBlockedURLs;

myBlockedURLs = {urls: [
  "*://www.ignore-this-domain.com/*"
]};

var initializeExtension = function (){
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

    console.log("Initialized()")
    console.log(results.toggle)

    if (results.toggle === undefined){

      chrome.storage.sync.set({"toggle": true},function(){
        console.log("Toggle Initialized to FALSE");
      })

    } else if (results.toggle == false) {

      console.log("Trigger Blocked URLs on Start")

      if (chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequestCallback)){

      } else {

        chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestCallback);

        chrome.storage.sync.get("urlStore", function(results){
          console.log("Retrieved urlStore -->");
          console.log(results.urlStore);
          createBlackList(formatBlackList(results.urlStore));

          chrome.webRequest.onBeforeRequest.addListener(
                onBeforeRequestCallback,
                myBlockedURLs,
                ["blocking"]);

          console.log("Triggered")
        });

      }

    }

  })

}

var addToBlockedList = function(){
  console.log("Refresh for Blocked List!")

  if (chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequestCallback)){

      chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestCallback);

      chrome.storage.sync.get("urlStore", function(results){
        console.log("Retrieved urlStore -->");
        console.log(results.urlStore);
        createBlackList(formatBlackList(results.urlStore));

        chrome.webRequest.onBeforeRequest.addListener(
              onBeforeRequestCallback,
              myBlockedURLs,
              ["blocking"]);

        console.log("Triggered")
      });

  } else {

  }


}


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

  myBlockedURLs.urls = [];
  for (i=0; i<blob.length;i++){
    myBlockedURLs.urls.push(blob[i]);
    // console.log("Blocked URL --> " + myBlockedURLs.urls[i]);
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

      chrome.storage.sync.get("urlStore", function(results){
        createBlackList(formatBlackList(results.urlStore));
      });

      chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequestCallback,
        myBlockedURLs,
        ["blocking"]);

    }else{

      chrome.storage.sync.get("urlStore", function(results){
        createBlackList(formatBlackList(results.urlStore));
      });

      chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestCallback);
      console.log("Focus - Toggled Off");
    }
  }
)

initializeExtension();
