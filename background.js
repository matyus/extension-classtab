'use strict';

console.log('background.js');

var BOOTSTRAP = {
    "abreu_ticotico.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l10.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l12.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l13.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l15.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l18.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l19.txt": "EADGBe",
    "aguado_nuevo_metodo_para_guitarra_p2_s1_c1_l23.txt": "EADGBe",
    "aguado_op06_p1_l10.txt": "EADGBe",
    "albeniz_isaac_op047_no5_espanola_asturias.txt": "EADGBe",
    "albeniz_isaac_op092_no12_piezas_torre_bermeja.txt": "DADGBe",
    "albeniz_isaac_op165_no2_tango_in_d.txt": "DADGBe",
    "albeniz_isaac_op165_no5_capricho_catalan.txt": "EADGBe",
    "albeniz_isaac_op232_no4_cantos_cordoba.txt": "DADGBe",
    "albeniz_isaac_serenata_arabe.txt": "EADGBe",
    "albeniz_mateo_sonata_in_d.txt": "DADGBe"
}
//constants
var ADD_TUNING = 'add tuning';

//global functions
function formatDatabaseForCss(data) {
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
  title: 'Add tuning…',
  contexts: ['all']
});

contextMenu.onClicked.addListener(function(menuItem, page) {
  // handle for when something is chosen in the menu.
  console.log('Menu Item Clicked', menuItem, page, ADD_TUNING == menuItem.menuItemId);

  if(menuItem.menuItemId == ADD_TUNING) {
    var tuningEntered = window.prompt('Add Tuning','EADGBe');

    chrome.storage.local.get('tunings', function(response) {
      // `tunings` is the Object name that houses the key/value pairs
      // an example of a single item:
      //    foo_bar.txt : 'EADGBe'
      // (the key is complex)
      var data = 'tunings' in response ? response.tunings : BOOTSTRAP;

      //parse out the filename from `http://www.classtab.org/foo_bar.txt`
      //this is so that we can it easily in the CSS:
      // `a[href*="foo_bar.txt"] { content: "EABDGe" }
      var urlKey = menuItem.linkUrl.split(page.url)[1];

      //create that shit:
      data[urlKey] = tuningEntered;

      //store that shit:
      chrome.storage.local.set({'tunings': data}, function(){
        console.log('%s saved', 'tunings');

        //update that shit.
        chrome.tabs.sendMessage(page.id,{ body: formatDatabaseForCss(data) }, function(response){
          console.log('response', response);
        });
      });
    });
  }
});



// Communication between background.js and content_script...
// runtime.onMessage waits for incoming messages from either the content_script or the browser_action
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  chrome.storage.local.get('tunings', function(response) {
    //make sure we have something to use
    var data = ('tunings' in response) ? response.tunings : BOOTSTRAP;

    sendResponse({ body: formatDatabaseForCss(data) });
  });

  //return true if you need async callbacks with onMessage via http://stackoverflow.com/a/20077854
  return true;
});

