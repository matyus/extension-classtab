'use strict';
/*
 *This file is loaded in the browser_action (window.html) file
 */

var DATABASE_URL = chrome.runtime.getManifest().homepage_url; // url to database, hacky!
var DATA; //parsed data
var onStorageComplete = function(){
  window.close();
}

$(function(){
  $('#add-tuning-form').on('submit', function(e){
    e.preventDefault();

    $(this).attr('disabled', 'disabled');

    var tuningEntered = $(this).find('#add-tuning-input').val();

    chrome.storage.local.get('tunings', function(response) {
      // if there's no key called `tunings`, then the response is malformed, so grab the static DB
      if('tunings' in response) {
        DATA = response.tunings;
        addInputToLocalStorage(tuningEntered, DATA, undefined, onStorageComplete);
      } else {
        $.getJSON(DATABASE_URL, function(tunings){
          DATA = tunings;
          addInputToLocalStorage(tuningEntered, DATA, undefined, onStorageComplete);
        });
      }
    }); // chrome.storage.local.get…
  }); // form.on('submit')
}); // ready

