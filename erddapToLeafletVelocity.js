erddapToLeafletVelocity = function (
		erddapBaseUrl,		// `String`: The base URL of the Errdap server to be called - e.g. 'http://erddap.marine.ie'
		datasetID,			// `String`: The dataset name to be accessed from the Erddap server - 'e.g. IMI_Model_Stats'
		uParameter,			// `String`: The eastwards velocity parameter name to be accessed from the Erddap dataset - e.g. 'sea_surface_x_velocity'
		vParameter,			// `String`: The northwards velocity parameter name to be accessed from the Erddap dataset - e.g. 'sea_surface_x_velocity'
		minLat,				// `Number`: The southernmost latitude to be accessed from the Erddap dataset
		maxLat,				// `Number`: The northernmost latitude to be accessed from the Erddap dataset
		minLon,				// `Number`: The westernmost longitude to be accessed from the Erddap dataset
		maxLon,				// `Number`: The easternmost longitude to be accessed from the Erddap dataset
		refTime,			// `String`: The dateTime for the data to be returned from Erddap
		strideLon,			// `Number`: The Erddap stride to use on the grid for the longitude axis as an integer value
		strideLat,			// `Number`: The Erddap stride to use on the grid for the latitude axis as an integer value
		minVelocity,		// `Number`: The minimum velocity to use on the Leaflet Velocity display
		maxVelocity,		// `Number`: The maximum velocity to use on the Leaflet Velocity display
		mapID				// `String`: The Leaflet map ID to add the velocity layer to
	){	
	
	fetch(
		erddapBaseUrl 
			+ '/erddap/griddap/' 
			+ datasetID 
			+ '.json?' 
			+ uParameter + '[(' + refTime + '):1:(' + refTime + ')][(' +  String(minLat) + '):' + String(strideLat) + ':(' + String(maxLat) + ')][(' + String(minLon) + '):'+ String(strideLon) +':(' + String(maxLon) + ')],' 
			+ vParameter + '[(' + refTime + '):1:(' + refTime + ')][(' + String(minLat) + '):' + String(strideLat)+ ':(' + String(maxLat) + ')][(' + String(minLon) + '):' + String(strideLon) + ':(' + String(maxLon) + ')]').
	then(
		response => response.json()
	).
	then(
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
	).then(
		report => {
				try{
				var velocityLayer = L.velocityLayer({
					displayValues: true,
					displayOptions: {
						velocityType: "GBR Water",
						displayPosition: "bottomleft",
						displayEmptyString: "No water data"
					},
					data: report,
					maxVelocity: maxVelocity,
					minVelocity: minVelocity,
					velocityScale: 0.1,
					opacity: 0.97
				}).addTo(mymap);
				console.log(report);
			} catch(err) {
				console.log(err.message);
			}
		}
	)
}
