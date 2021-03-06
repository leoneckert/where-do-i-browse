var width = 500,
    height = 360;
var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, width / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#dataviz").append("svg")
    .attr("width", width)
    .attr("height", height);


d3.json("javascripts/world-50m.json", function(error, world) {
  if (error) throw error;
  svg.insert("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);
  svg.insert("path")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);

});


var show_upload = false
$("#showUpload").on('click', function(){
  if(!show_upload){
    $(".upload_fields").css( "display", "inline" );
    show_upload = true;

  }else{
    $(".upload_fields").css( "display", "none" );

    show_upload = false;
  }
  
});

$("#submitURL").on('click', function(){
      
      // url = $('#OneNewUrl').val());

      var rawUrl = $('#OneNewUrl').val();
      console.log(rawUrl);

      if (rawUrl.substring(0, 4) != "http"){
        rawUrl = "http://" + rawUrl;
      }
      console.log(rawUrl);

      // jQuery.post("/resolve", rawUrl, function(data, status){}, "text");
      formatURL(rawUrl, function(host){
        $('#OneNewUrl').val(""); //clear thing
        // console.log(host);
        addToHostArray(host, function(allHosts){
        
        if(allHosts){
          console.log(allHosts);
        }else{
          console.log('Enter a proper address');
        }
      });
  });
});

var allIPs = {};

function formatURL(url, callback){
  var parser = document.createElement('a');
  parser.href = url; 
  //I can use uri.js method "uri.is" to determine if something is a url or IP in the first place
  callback(parser.hostname);
}


function addToHostArray(host, callback){
  resolveIP(host, function(latlon){
    // console.log(latlon);

    var lat = latlon.slice(0, latlon.indexOf("/"));
    var lon = latlon.substring(latlon.indexOf("/") + 1);
    
    // console.log(lat);
    // console.log(lon);
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    // console.log(lat);
    // console.log(lon);
    


  // var real_lat = 22.273769
  // var real_lon = 114.196539

  // var lon = projection([real_lon, real_lat])[0];
  // var lat = projection([real_lon, real_lat])[1];
  var NEWlon = projection([lon, lat])[0];
  var NEWlat = projection([lon, lat])[1];
 
  svg.append('ellipse')
          .attr('cx', NEWlon)
            .attr('cy', NEWlat)
            .attr('rx', 3)
            .attr('ry', 3)
            .style('fill', 'red');
    // if(ip != "127.0.0.1"){

    //   allIPs[host] = ip;
    //   callback(allIPs);
    // }else{
    //   callback("");
    // }
  });

}
var serverIP = "localhost:3000"

function resolveIP(host, callback){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "http://" + serverIP + "/resolve/ip?host=" + host, true);
  xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState==4 && xmlhttp.status==200){
          var latlon = String(xmlhttp.responseText);
          // console.log("latlon of host: " + host + " is: " + latlon);
          callback(latlon);
      }
  }
  xmlhttp.send();
}





// -------------file upload:

var fileInput = $('#files');
var uploadButton = $('#upload');

uploadButton.on('click', function() {
    if (!window.FileReader) {
        alert('Your browser is not supported');
        return false;
    }
    var input = fileInput.get(0);

    // Create a reader object
    var reader = new FileReader();
    if (input.files.length) {
        var textFile = input.files[0];
        // Read the file
        reader.readAsText(textFile);
        // When it's loaded, process it
        $(reader).on('load', processFile);
    } else {
        alert('Please upload a file before continuing')
    } 
});

function draw_list(list){

  coordinates = list.split("//");
  console.log('this is the list:');
  _.each(coordinates, function(elem){
    console.log(elem);

    var lat = elem.slice(0, elem.indexOf("/"));
    var lon = elem.substring(elem.indexOf("/") + 1);
    
    // console.log(lat);
    // console.log(lon);
    lat = parseFloat(lat);
    lon = parseFloat(lon);

    var NEWlon = projection([lon, lat])[0];
    var NEWlat = projection([lon, lat])[1];
   
    svg.append('ellipse')
            .attr('cx', NEWlon)
              .attr('cy', NEWlat)
              .attr('rx', 3)
              .attr('ry', 3)
              .style('fill', 'red');
  });




}

function processFile(e) {
    var file = e.target.result
    // console.log(file);
    results = file.split("\n");
    var string_to_send = "http://" + serverIP + "/resolve/ip-list"

    var hosts = {}
    for(r in results){
      // console.log(results[r]);
      if(results[r].length > 0){
        // formatURL(results[r]);
        // console.log(results[r]);
        var parser = document.createElement('a');
        parser.href = results[r]; 
        //I can use uri.js method "uri.is" to determine if something is a url or IP in the first place
        host_name = parser.hostname;
        if(!hosts[host_name]){
          hosts[host_name] = true;
        }
         // addToHostArray(results[r]); 
      } 
    }
    // console.log(hosts);
    var c = 0
    var first = true
    for(host in hosts){
      if(first){
         string_to_send = string_to_send + "?host" + String(c) + "=" + host;
      }else{
        string_to_send = string_to_send + "&host" + String(c) + "=" + host;
      }
     
      c += 1;
      first = false
    }
    console.log(string_to_send);
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", string_to_send, true);
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
            var latlon_list = String(xmlhttp.responseText);
            console.log("latlon_list of host: is: " + latlon_list);
            // callback(latlon);
            draw_list(latlon_list);

        }
    }
    xmlhttp.send();
}




