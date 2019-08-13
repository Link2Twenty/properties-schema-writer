var submit = document.querySelector('button.get-data');
var urlInput = document.querySelector('input.url');
var main = document.querySelector('main.content');

function getJson(url, callback) {
  if (!url) {
    displayWarning('Please enter a url');
    return;
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", callback);
  oReq.open("GET", url);
  oReq.send();
}

function displayWarning(msg) {
  main.innerHTML = "";
  var div = document.createElement('div');
  div.classList.add('warning');
  div.textContent = msg;

  main.appendChild(div);
}

function generateTable(data) {
  main.innerHTML = "";

  var keys = Object.keys(data.properties);
  var table = document.createElement('table');
  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.setAttribute('colspan', '3');
  th.textContent = "Properties";

  tr.appendChild(th);
  table.appendChild(tr);

  for (var i = 0; i < keys.length; i++) {
    table.appendChild(handleProperties(data.properties[keys[i]], keys[i]));
  }

  table.setAttribute('cellspacing', 0)

  main.appendChild(table);

  var submit = document.createElement('button');
  submit.textContent = "Submit";
  submit.classList.add('submit');

  submit.addEventListener('click', function() {
    generateNewSchema(data)
  });

  main.appendChild(submit)
}

function handleProperties(prop, title) {
  var tbody = document.createElement('tbody');
  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.setAttribute('colspan', '3');
  th.textContent = title;

  tr.appendChild(th);
  tbody.appendChild(tr);

  var trTitle = document.createElement('tr');
  var thTitle = document.createElement('th');
  thTitle.textContent = "title";
  var tdTitle = document.createElement('td');
  tdTitle.textContent = prop.title || "NULL";
  var tdTitleInput = document.createElement('td');
  tdTitleInput.innerHTML = "<input data-prop='" + title + "' data-type='title'/>";

  trTitle.appendChild(thTitle);
  trTitle.appendChild(tdTitle);
  trTitle.appendChild(tdTitleInput);
  tbody.appendChild(trTitle);

  var trHelp = document.createElement('tr');
  var thHelp = document.createElement('th');
  thHelp.textContent = "help";
  var tdHelp = document.createElement('td');
  tdHelp.textContent = prop.help || "NULL";
  var tdHelpInput = document.createElement('td');
  tdHelpInput.innerHTML = "<input data-prop='" + title + "' data-type='help'/>";

  trHelp.appendChild(thHelp);
  trHelp.appendChild(tdHelp);
  trHelp.appendChild(tdHelpInput);
  tbody.appendChild(trHelp);

  if (prop.type == "array") {
    var keys = Object.keys(prop.items.properties);
    for (var i = 0; i < keys.length; i++) {
      var trSub = document.createElement('tr');
      var tdSub = document.createElement('td');
      tdSub.setAttribute('colspan', '3');
      tdSub.classList.add('sub')
      var tableSub = document.createElement('table');
      tableSub.classList.add('sub-table');
      tableSub.setAttribute('cellspacing', 0)
      var sub = handleProperties(prop.items.properties[keys[i]], title + "." + keys[i]);
      tableSub.appendChild(sub);
      tdSub.appendChild(tableSub);
      trSub.appendChild(tdSub);
      tbody.appendChild(trSub);
    }
  }

  return tbody;
}

function eventHandler() {
  getJson(urlInput.value, function () {
    var data = JSON.parse(this.responseText);

    if (data.id != "http://jsonschema.net") {
      displayWarning('This does not appear to be a schema file');
      return;
    }

    generateTable(data);
  });
}

function generateNewSchema(data) {
  var inputs = document.querySelectorAll("table input");

  for (var i = 0; i < inputs.length; i++) {
    if(!inputs[i].value) continue;

    var level = data.properties;
    var layers = inputs[i].dataset.prop.split('.');

    for (var j = 0; j < layers.length; j ++) {
      if (j > 0) level = level.items.properties;
      level = level[layers[j]]
    };

    level[inputs[i].dataset.type] = inputs[i].value;
  }

  downloadObjectAsJson(data, "properties");
}

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".schema");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Event Listeners
submit.addEventListener('click', eventHandler);
urlInput.addEventListener('keyup', function (e) {
  if ([13].indexOf(e.which) < 0) return;

  eventHandler();
});

