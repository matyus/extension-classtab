'use strict';
function saveNewEntry(data, opts, callback){
  chrome.storage.local.set({'tunings': data}, function(){
    callback(opts);
  });
};

function addInputToLocalStorage(tuningEntered, data, opts, callback) {
  if(opts && 'menuItem' in opts) {
    var key = opts.menuItem.linkUrl.split('classtab.org/')[1]; //filename = key for value

    data[key] = tuningEntered;

    saveNewEntry(data, opts, callback);
  } else {
    chrome.tabs.query({'active': true}, function(tabs){
      var key = tabs[0].url.split('classtab.org/')[1]; //filename = key for value.

      data[key] = tuningEntered;

      saveNewEntry(data, opts, callback);
    });
  }
}; // addInputToLocalStorage()
