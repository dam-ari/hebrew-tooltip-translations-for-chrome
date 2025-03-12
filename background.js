function xhr(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(data) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var data = xhr.responseText;
        callback(data);
      } else {
        callback(null);
      }
    }
  }
  // Note that any URL fetched here must be matched by a permission in
  // the manifest.json file!
  xhr.open('GET', url, true);
  xhr.send();
};

/**
 * Handles data sent via chrome.extension.sendMessage().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callback Function The method to call when the request completes.
 */
function onMessage(request, sender, sendResponse) {
  if (request.action === 'xhr') {
    xhr(request.url, sendResponse);
    // Return true to indicate asynchronous response.
    return true;
  } else if (request.action === 'localStorage_set') {
    // Use chrome.storage.local instead of localStorage.
    let data = {};
    data[request.attribute] = request.value || null;
    chrome.storage.local.set(data, function() {
      sendResponse();
    });
    return true;
  } else if (request.action === 'localStorage_get') {
    chrome.storage.local.get(request.attribute, function(result) {
      sendResponse(result[request.attribute] || null);
    });
    return true;
  }
}

// Attach the listener using chrome.runtime.onMessage.
chrome.runtime.onMessage.addListener(onMessage);


// Wire up the listener.
chrome.extension.onMessage.addListener(onMessage);