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

	L.fetchErddapVelocity = function (
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
			strideLat			// `Number`: The Erddap stride to use on the grid for the latitude axis as an integer value
		){	
		
		return jsonp(erddapBaseUrl 
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
	}

	L.erddapVelocityLayer = function (options){
		return {data: L.fetchErddapVelocity(	
				options.erddapBaseUrl,
				options.datasetID,
				options.uParameter,
				options.vParameter,
				options.minLat,
				options.maxLat,
				options.minLon,
				options.maxLon,
				options.refTime,
				options.strideLon,
				options.strideLat),
		minVelocity: options.minVelocity,
		maxVelocity: options.maxVelocity,
		addControl: function(layerName, groupName){
			this.data.then(
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
						maxVelocity: this.maxVelocity,
						minVelocity: this.minVelocity,
						velocityScale: 0.1,
						opacity: 0.97
					});
				layerControl.addOverlay(velocityLayer, layerName, groupName);
				} catch(err) {
					console.log(err.message);
				}
			}
		);
		}};
	}

	var mymap = L.map('map', {
		zoom: 6,
		fullscreenControl: true,
		timeDimension: true,
		timeDimensionOptions: {
			updateTimeDimension: true,
			updateTimeDimensionMode: 'replace'
		},
		timeDimensionControl: true,
		timeDimensionControlOptions: {
			autoPlay: false,
			loopButton: true,
			timeSteps: 1,
			limitSliders: true,
			playerOptions: {
				buffer: 0,
				transitionTime: 250,
				loop: true,
				timeSteps: 10,
			}
		},
		center: [53.5, -9.5],
	});

	var Esri_WorldImagery = L.tileLayer(
		"http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
		{
		  attribution:
			"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
			"AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
		}).addTo(mymap);

	var Esri_DarkGreyCanvas = L.tileLayer(
		"https://{s}.sm.mapstack.stamen.com/" +
		"(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/" +
		"{z}/{x}/{y}.png",
		{
			attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, ' +
			'NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
		});

	var baseLayers = {
		Satellite: Esri_WorldImagery,
		"Grey Canvas": Esri_DarkGreyCanvas
		};

	var surfTemp = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_surface_temperature',
		format: 'image/png',
		transparent: true,
		time: '2020-09-29T00:00:00'});
		
	var surfTempTime = L.timeDimension.layer.wms(surfTemp);
		
	var surfSal = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_surface_salinity',
		format: 'image/png',
		transparent: true});
		
	var surfSalTime = L.timeDimension.layer.wms(surfSal);
		
	var tenTemp = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_temperature_at_10_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var tenTempTime = L.timeDimension.layer.wms(tenTemp);
		
	var tenSal = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_salinity_at_10_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var tenSalTime = L.timeDimension.layer.wms(tenSal);

	var thirtyTemp = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_temperature_at_30_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var thirtyTempTime = L.timeDimension.layer.wms(thirtyTemp);

	var thirtySal = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_salinity_at_30_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var thirtySalTime = L.timeDimension.layer.wms(thirtySal)

	var bottomTemp = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_bottom_temperature',
		format: 'image/png',
		transparent: true});
		
	var bottomTempTime =  L.timeDimension.layer.wms(bottomTemp);
		
	var bottomSal = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/sea_bottom_salinity',
		format: 'image/png',
		transparent: true});
		
	var bottomSalTime =  L.timeDimension.layer.wms(bottomSal);
		
	var mixedDepth = L.tileLayer.wms("http://data.marine.ie/ncWMS/wms", {
		layers: 'COMPASS_NEATL_202009/mixed_layer_depth',
		format: 'image/png',
		transparent: true});
		
	var mixedDepthTime = L.timeDimension.layer.wms(mixedDepth);
		
	var groupedOverlays = {
		"Surface": {
			"Temperature": surfTempTime,
			"Salinity": surfSalTime
		},
		"10-Meters": {
			"Temperature": tenTempTime,
			"Salinity": tenSalTime
		},
		"30-Meters": {
			"Temperature": thirtyTempTime,
			"Salinity": thirtySalTime
		},
		"Bottom": {
			"Temperature": bottomTempTime,  
			"Salinity": bottomSalTime
		},
		"Others":{
			"Mixed Depth": mixedDepthTime
		}};

	var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays);
	layerControl.addTo(mymap);

	L.erddapVelocityLayer({
					erddapBaseUrl: 'https://erddap.marine.ie',
					datasetID: 'IMI_NEATL',
					uParameter: 'sea_surface_x_velocity',
					vParameter: 'sea_surface_y_velocity',
					minLat: 48.00625,
					maxLat: 57.99375,
					minLon: -17.99375,
					maxLon: -1.00625,
					refTime: '2021-02-25T00:00:00Z',
					strideLon: 10,
					strideLat: 10,
					minVelocity: -1,
					maxVelocity: 1
				}).addControl("Velocity", "Surface");
				
	L.erddapVelocityLayer({
					erddapBaseUrl: 'https://erddap.marine.ie',
					datasetID: 'IMI_NEATL',
					uParameter: 'sea_bottom_x_velocity',
					vParameter: 'sea_bottom_y_velocity',
					minLat: 48.00625,
					maxLat: 57.99375,
					minLon: -17.99375,
					maxLon: -1.00625,
					refTime: '2021-02-27T00:00:00Z',
					strideLon: 10,
					strideLat: 10,
					minVelocity: -1,
					maxVelocity: 1
				}).addControl("Velocity", "Bottom");
