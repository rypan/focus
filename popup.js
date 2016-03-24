var toggle;
var returnedArray;

// Add URL
function addURL(){
  passedURL = document.querySelector('#txtURL').value;

  if (passedURL) {

    chrome.storage.sync.get("urlStore", function(results){

      if (results.urlStore === undefined){

        var newArray = [passedURL];

        chrome.storage.sync.set({"urlStore": newArray},function(){
          console.log("urlStore Inititalized");
        })

        // Refresh UI
        refreshNodes();

        // Update what extension blocks
        chrome.extension.sendRequest({msg:"addToBlockedList"});

      } else {

        // Business as usual

        chrome.storage.sync.get("urlStore", function(results){

          console.log("Value of sync.get -->")
          console.log(results.urlStore);
          returnedArray = results.urlStore;

          console.log("Value of PassedURL --> " + passedURL);
          returnedArray.push(passedURL)

          console.log("Value of PassedURL after Push --> ");
          console.log(returnedArray);

          chrome.storage.sync.set({"urlStore": returnedArray},function(){
            console.log("Value sync'd back");
          })

          // Refresh UI
          refreshNodes();

          // Update what extension blocks
          chrome.extension.sendRequest({msg:"addToBlockedList"});

          // Clear value from text box
          document.querySelector('#txtURL').value = '';

        })

      }
    })
  }
}

// Delete URL
function deleteURL(index,url){
  if(url){
    console.log('Delete this one -->' + url);

    chrome.storage.sync.get("urlStore", function(results){
      returnedArray = results.urlStore;
      if (index > -1){
        returnedArray.splice(index,1)
      }

      chrome.storage.sync.set({"urlStore": returnedArray},function(){
        console.log("Value sync'd back");
      })

      // Refresh UI
      refreshNodes();

      // Update what extension blocks
      // chrome.extension.sendRequest({msg:"addToBlockedList"});


      chrome.storage.sync.get("toggle", function(results){

      toggle = results.toggle;

        if(toggle){
          console.log("t:true");
          chrome.runtime.sendMessage({t:true});
        }else{
          console.log("t:false");
          chrome.runtime.sendMessage({t:false});
        }

      });


    })

  }
}

// Toggle Blocker On and Off
function toggleAction(){

  chrome.storage.sync.get("toggle", function(results){

  toggle = results.toggle;

    if(toggle){
      chrome.browserAction.setIcon({path:"48-clicked.png"});
      chrome.runtime.sendMessage({t:true});
      toggle = !toggle;
      $("#on").removeClass("inactive").addClass("active");
      $("#off").removeClass("active").addClass("inactive");
      chrome.storage.sync.set({"toggle": toggle},function(){
          console.log("Toggle Initialized to (hopefully false) -->" + toggle);
      })
    }else{
      chrome.browserAction.setIcon({path:"48.png"});
      chrome.runtime.sendMessage({t:false});
      toggle = !toggle;
      $("#off").removeClass("inactive").addClass("active");
      $("#on").removeClass("active").addClass("inactive");
      chrome.storage.sync.set({"toggle": toggle},function(){
          console.log("Toggle Initialized to (hopefully true) -->" + toggle);
      })
    }

  });


}

// Pull Values from Chrome Storage and Refreshes UI
function refreshNodes(){
  $('#listOfURLs').empty();
  chrome.storage.sync.get("urlStore", function(results){
  console.log("Pulling values using sync.get --> ")
  console.log(results)
  //Creates List
  createList(results.urlStore);
  });

  chrome.storage.sync.get("toggle", function(results){

    if (results.toggle === undefined){

      toggle = false;

    } else {

      toggle = results.toggle;

    }

    if(!toggle){
      $("#on").removeClass("inactive").addClass("active");
      $("#off").removeClass("active").addClass("inactive");
    }else{
      $("#off").removeClass("inactive").addClass("active");
      $("#on").removeClass("active").addClass("inactive");
    }

  })

}

// Prepares HTML for UI
function createList(blob){
  var list = $('#listOfURLs');
  var ul = $('<ul/>');
  var i;

  $.each(blob, function(i){
    var li = $('<li/>')
        .text(blob[i])
        .data("index",i)
        .appendTo(ul);

    var txt = $('<a/>')
        .addClass('delete')
        .text("x")
        .click(function(){deleteURL(i,blob[i])})
        .appendTo(li);

  })
  list.append(ul);

  $('#listOfURLs li').hover(
    function(){$(this).children('.delete').show();},
    function(){$(this).children('.delete').hide();});
}

// Add Event Listeners to Action Buttons
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById("txtURL").addEventListener('keydown', function(e){
    if (e.keyCode === 13){
      addURL();
    }
  })
  document.querySelector('#toggle').addEventListener('click', toggleAction);
  document.querySelector('#close').addEventListener('click', closePopUp);
  refreshNodes();
});

// Closes Pop-Up
function closePopUp(){
  console.log("Close Pop-Up");
  window.close();
}
