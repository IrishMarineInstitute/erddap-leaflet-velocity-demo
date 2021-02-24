# erddap-leaflet-velocity-demo
A demonstration of connecting [Erddap](https://github.com) to [Leaflet-Velocity](https://github.com/danwild/leaflet-velocity) maps

See [here](https://irishmarineinstitute.github.io/erddap-leaflet-velocity-demo/) for an online demonstration.

See [here](https://irishmarineinstitute.github.io/erddap-leaflet-velocity-demo/time-dimension-example/) for example with time dimension control.

## Contents
   - [Including the Code](https://github.com/IrishMarineInstitute/erddap-leaflet-velocity-demo/blob/main/README.md#including-the-code)
   - [Example Usage](https://github.com/IrishMarineInstitute/erddap-leaflet-velocity-demo/blob/main/README.md#example-usage)
   - [Function Inputs](https://github.com/IrishMarineInstitute/erddap-leaflet-velocity-demo/blob/main/README.md#function-inputs)
   - [Grib2JSON Output format](https://github.com/IrishMarineInstitute/erddap-leaflet-velocity-demo/blob/main/README.md#grib2json-output-format)
   - [JavaScript Boilerplate](https://github.com/IrishMarineInstitute/erddap-leaflet-velocity-demo/blob/main/README.md#javascript-boilerplate)

## Including the Code

To include the code in your own website, you will need to first add the [Leaflet.js](https://leafletjs.com/) mapping library, Leaflet-Velocity and then include errdapToLeafletVelocity, e.g.:

```html
<script src="https://irishmarineinstitute.github.io/erddap-leaflet-velocity-demo/erddapToLeafletVelocity.js"></src>
```

## Example Usage

```javascript
L.erddapVelocityLayer({
	erddapBaseUrl: 'https://erddap.marine.ie',
	datasetID: 'IMI_Model_Stats',
	uParameter: 'sea_surface_x_velocity',
	vParameter: 'sea_surface_y_velocity',
	minLat: 48.5,
	maxLat: 58.5,
	minLon: -17.0,
	maxLon: -2.0,
	refTime: '2019-12-15T00:00:00Z',
	strideLon: 10,
	strideLat: 10,
	minVelocity: 0,
	maxVelocity: 1}).addTo('map');
```

## Function Inputs

Once you have added the [erddapToLeafletVelocity.js](https://github.com/IrishMarineInstitute/erddap-leaflet-velocity-demo/blob/main/erddapToLeafletVelocity.js) script to your webpages, you can use the erddapToLeafletVelocity function or the L.erddapVelocityLayer function with the following inputs:

- _erddapBaseUrl_ `String`: The base URL of the Errdap server to be called - e.g. 'http://erddap.marine.ie'
- _datasetID_ `String`: The dataset name to be accessed from the Erddap server - 'e.g. IMI_Model_Stats'
- _uParameter_ `String`: The eastwards velocity parameter name to be accessed from the Erddap dataset - e.g. 'sea_surface_x_velocity'
- _vParameter_  `String`: The northwards velocity parameter name to be accessed from the Erddap dataset - e.g. 'sea_surface_x_velocity'
- _minLat_ `Number`: The southernmost latitude to be accessed from the Erddap dataset
- _maxLat_ `Number`: The northernmost latitude to be accessed from the Erddap dataset
- _minLon_ `Number`: The westernmost longitude to be accessed from the Erddap dataset
- _maxLon_ `Number`: The easternmost longitude to be accessed from the Erddap dataset
- _refTime_ `String`: The dateTime for the data to be returned from Erddap
- _strideLon_ `Number`: The Erddap stride to use on the grid for the longitude axis as an integer value
- _strideLat_ `Number`: The Erddap stride to use on the grid for the latitude axis as an integer value
- _minVelocity_ `Number`: The minimum velocity to use on the Leaflet Velocity display
- _maxVelocity_ `Number`: The maximum velocity to use on the Leaflet Velocity display
- _mapID_ `String`: The Leaflet map ID to add the velocity layer to

## Grib2JSON output format

Leaflet-Velocity expects input in the form of a JSON object conforming to the output of [Grib2JSON](https://github.com/cambecc/grib2json). Some of the fields are documented below:

- Header
    - _dx_ The grid spacing on the x-axis in degrees
    - _dy_ The grid spacing on the y-axis in degrees
    - _la1_ The northernmost latitutde of the grid
    - _la2_ The southernmost latittude of the grid
    - _lo1_ The westernmost longitude of the grid
    - _lo2_ The easternmost longitude of the grid
    - _nx_ The number of grid points on the x axis
    - _ny_ The number of grid points on the y-axis
    - _parameterCategory_ Use the integer 2
    - _parameterNumber_ Use the integer 2 for the x-axis speed and the integer 3 for the y axis speed
    - _parameterNumberName_ A plain text label for the parameter
    - _parameterUnit_ The units of measure for the parameter
    - _refTime_ The date and time for this parameter and grid combination
- Data
    - A one-dimensional array of the parameter's data values for this point in time on the grid. Data are west-to-east across the grid, repeating north-to-south down the grid

## JavaScript boilerplate

The following should allow you to build the expected output from any Erddap instance, using a griddap enabled dataset. Contains input from [@abkfenris](https://github.com/abkfenris).

```javascript
const erddapBaseUrl = 'https://erddap.marine.ie';
const datasetID = 'IMI_Model_Stats';
const uParameter = 'sea_surface_x_velocity';
const vParameter = 'sea_surface_y_velocity';
const minLat = 48.5;
const maxLat = 58.5;
const minLon = -17.0;
const maxLon = -2.0;
const refTime = '2019-12-15T00:00:00Z';
const strideLon = 20;
const strideLat = 20;

function jsonp(url) {
    return new Promise(function(resolve, reject) {
        let script = document.createElement('script')
        const name = "_jsonp_" + Math.round(100000 * Math.random());
        //url formatting
        if (url.match(/\?/)) url += "&.jsonp="+name
        else url += "?.jsonp="+name
        script.src = url;

        window[name] = function(data) {
            resolve(data);
            document.body.removeChild(script);
            delete window[name];
        }
        document.body.appendChild(script);
    });
}

jsonp(erddapBaseUrl 
			+ '/erddap/griddap/' 
			+ datasetID 
			+ '.json?' 
			+ uParameter + '[(' + refTime + '):1:(' + refTime + ')][(' +  String(minLat) + '):' + String(strideLat) + ':(' + String(maxLat) + ')][(' + String(minLon) + '):'+ String(strideLon) +':(' + String(maxLon) + ')],' 
			+ vParameter + '[(' + refTime + '):1:(' + refTime + ')][(' + String(minLat) + '):' + String(strideLat)+ ':(' + String(maxLat) + ')][(' + String(minLon) + '):' + String(strideLon) + ':(' + String(maxLon) + ')]')
.then(
	data => [{
		'header':{
			'la1': Math.max(...Array.from([...new Set(data.table.rows.map(x => x[1]))])),
			'la2': Math.min(...Array.from([...new Set(data.table.rows.map(x => x[1]))])),
			'lo1': Math.min(...Array.from([...new Set(data.table.rows.map(x => x[2]))])),
			'lo2': Math.max(...Array.from([...new Set(data.table.rows.map(x => x[2]))])),
			'dx': (Math.max(...Array.from([...new Set(data.table.rows.map(x => x[2]))])) - Math.min(...Array.from([...new Set(data.table.rows.map(x => x[2]))]))) / ([...new Set(data.table.rows.map(x => x[2]))].length - 1),
			'dy': (Math.max(...Array.from([...new Set(data.table.rows.map(x => x[1]))])) - Math.min(...Array.from([...new Set(data.table.rows.map(x => x[1]))]))) / ([...new Set(data.table.rows.map(x => x[1]))].length - 1),
			'nx': [...new Set(data.table.rows.map(x => x[2]))].length,
			'ny': [...new Set(data.table.rows.map(x => x[1]))].length,
			'parameterCategory': 2,
			'parameterNumber': 2,
			'parameterUnit': 'm.s-1',
			'parameterNumberName': data.table.columnNames[3],
			'refTime': refTime.replace('T', ' ').replace('Z','')
		}, 
		'data': data.table.rows.sort((a,b) => b[1]-a[1]).map(x => x[3])
	},{
		'header':{
			'la1': Math.max(...Array.from([...new Set(data.table.rows.map(x => x[1]))])),
			'la2': Math.min(...Array.from([...new Set(data.table.rows.map(x => x[1]))])),
			'lo1': Math.min(...Array.from([...new Set(data.table.rows.map(x => x[2]))])),
			'lo2': Math.max(...Array.from([...new Set(data.table.rows.map(x => x[2]))])),
			'dx': (Math.max(...Array.from([...new Set(data.table.rows.map(x => x[2]))])) - Math.min(...Array.from([...new Set(data.table.rows.map(x => x[2]))]))) / ([...new Set(data.table.rows.map(x => x[2]))].length - 1),
			'dy': (Math.max(...Array.from([...new Set(data.table.rows.map(x => x[1]))])) - Math.min(...Array.from([...new Set(data.table.rows.map(x => x[1]))]))) / ([...new Set(data.table.rows.map(x => x[1]))].length - 1),
			'nx': [...new Set(data.table.rows.map(x => x[2]))].length,
			'ny': [...new Set(data.table.rows.map(x => x[1]))].length,
			'parameterCategory': 2,
			'parameterNumber': 3,
			'parameterUnit': 'm.s-1',
			'parameterNumberName': data.table.columnNames[4],
			'refTime': refTime.replace('T', ' ').replace('Z','')
		}, 
		'data': data.table.rows.sort((a,b) => b[1]-a[1]).map(x => x[4])
	}]
)
```
