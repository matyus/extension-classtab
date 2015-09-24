'use strict';

console.log('background.js');

//constants
var ADD_TUNING = 'add tuning';
var STANDARD_TUNING = 'EADBGe';
var DATA; //database
var DATABASE_URL = chrome.runtime.getManifest().homepage_url; // database url, so hacky!

//global functions
function formatDatabaseForCss(data, config) {
  var processedData = [];
  for(var item in data) {
    //this is a little too terse, but basically we're using replace/join instead of catenation.
    processedData.push([
      'a[href*="_"]:before'.replace('_',item),
      '{ content: "_" }'.replace('_', data[item])
    ].join(' '));
  }

  return processedData.join(" \n\r");
}

/*
 *Note:
 *Context menu needs permission to be set in the manifest.json file.
 *Context menu needs 16 pixel icon size set.
 */
var contextMenu = chrome.contextMenus;

contextMenu.create({
  id: ADD_TUNING,
  title: 'Add/Update tuning…',
  contexts: ['link'],
  documentUrlPatterns: ["http://classtab.org/","http://www.classtab.org/"],
  targetUrlPatterns: ["*://classtab/*.txt","*://www.classtab.org/*.txt"]
});

var onStorageComplete = function(opts) {
  //update that shit.
  chrome.tabs.sendMessage(opts.page.id,{ body: formatDatabaseForCss(DATA) }, function(response){
    console.log('response', response);
  });
}
contextMenu.onClicked.addListener(function(menuItem, page) {
  // handle for when something is chosen in the menu.
  console.log('Menu Item Clicked', menuItem, page, ADD_TUNING == menuItem.menuItemId);

  if(menuItem.menuItemId == ADD_TUNING) {
    var tuningEntered = window.prompt('Add/Update Tuning','EADGBe');

    chrome.storage.local.get('tunings', function(response) {
      // `tunings` is the Object name that houses the key/value pairs
      // an example of a single item:
      //    foo_bar.txt : 'EADGBe'
      // (the key is complex)
      var opts = {
        menuItem: menuItem,
        page: page
      };

      if('tunings' in response) {
        DATA = response.tunings;
        addInputToLocalStorage(tuningEntered, DATA, opts, onStorageComplete);
      } else {
        $.getJSON(DATABASE_URL, function(tunings) {
          DATA = tunings;
          addInputToLocalStorage(tuningEntered, DATA, opts, onStorageComplete);
        });
      }
    });

  }
});

// Communication between background.js and content_script...
// runtime.onMessage waits for incoming messages from either the content_script or the browser_action
chrome.runtime.onMessage.addListener(function(request, sender, sendResponseCallback) {
  chrome.storage.local.get('tunings', function(response) {
    //make sure we have something to use

    if('tunings' in response) {
      DATA = response.tunings;
      sendResponseCallback({ body: formatDatabaseForCss(DATA, request.config) });
    } else {
      $.getJSON(DATABASE_URL, function(tunings) {
        DATA = tunings;
        sendResponseCallback({ body: formatDatabaseForCss(DATA, request.config) });
      });
    }
  });

  //return true if you need async callbacks with onMessage via http://stackoverflow.com/a/20077854
  return true;
});

var pageActionRule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostContains: '.classtab',
        urlContains: '.txt'
      }
    })
  ],
  actions: [
    new chrome.declarativeContent.ShowPageAction()
  ]
};

// apparently you need to remove/add per every page change.
chrome.runtime.onInstalled.addListener(function(details){
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
    chrome.declarativeContent.onPageChanged.addRules([pageActionRule]);
  });
});

