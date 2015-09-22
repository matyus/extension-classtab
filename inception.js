'use strict';
/*
 *This file will be loaded into the DOM of the webpage a user visits because it is included in the manifest.json file as a `content_script`
 */

console.log('inception.js');

// Communication between background.js…
// runtime.sendMessage sends data to the background.js script
// callback is good for stuff
chrome.runtime.sendMessage({ body: 'Hello, this is the Tab speaking' }, function(response) {
  console.log('Response from background.js: ', response);
  $('<style id="extensionClasstab">_</style>'.replace('_',response.body)).appendTo('head');
});

chrome.runtime.onMessage.addListener(function(response){
  //update dynamical, feels magical.
  //being lazy, there's probably a more concise way to do this…
  $('#extensionClasstab').remove();
  $('<style id="extensionClasstab">_</style>'.replace('_',response.body)).appendTo('head');
});
