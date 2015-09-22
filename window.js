/*
 *This file is loaded in the browser_action (window.html) file
 */

console.log('window.js');

$(function(){
  console.log('jquery');

  $('#add-tuning-form').on('submit', function(e){
    e.preventDefault();

    $(this).attr('disabled', 'disabled');

    var tuningEntered = $(this).find('#add-tuning-input').val();

    chrome.storage.local.get('tunings', function(response) {
      var data = 'tunings' in response ? response.tunings : BOOTSTRAP;
      var urlKey;

      chrome.tabs.query({'active': true}, function(tabs){
        urlKey = tabs[0].url.split('classtab.org/')[1];

        data[urlKey] = tuningEntered;

        chrome.storage.local.set({'tunings': data}, function(){
          console.log('%s saved', 'tunings');
          //automatically hide the dropdown
          window.close();
        });
      });
    });
  });
});
