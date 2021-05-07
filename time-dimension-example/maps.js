var mymap;
var erddapURL = 'https://erddap.marine.ie/erddap' ;
var datasetID = 'compass_neatl_hindcast_grid' ; 
var erddap = new ERDDAP(erddapURL);
var ds = erddap.dataset(datasetID);
var timeRange;

var timeForm = document.getElementById('form');
var startTimeInput = document.getElementById('from');
var endTimeInput = document.getElementById('to');

var startDate = new Date(startTimeInput.value);
var endDate = new Date(endTimeInput.value);

var marker = null;

function updateTimeRange() {
	startDate = new Date(startTimeInput.value);
	endDate = new Date(endTimeInput.value);	
	
	timeInterval = timeRange.filter(a => a > startDate && a < endDate);
	mymap.timeDimension.setAvailableTimes(timeInterval, 'replace');
	mymap.timeDimension.setCurrentTime(startDate);

	if (marker !== null) {
		
		refreshTemp(marker._latlng.lat.toFixed(2),marker._latlng.lng.toFixed(2), startTimeInput.value, endTimeInput.value)
		refreshSal(marker._latlng.lat.toFixed(2),marker._latlng.lng.toFixed(2), startTimeInput.value, endTimeInput.value)
	}
}

ds.fetchTimeDimension().then(function(times){
	
	timeRange = times.map(function(d){return new Date(d)});
	timeInterval = timeRange.filter(a => a > startDate && a < endDate);

	mymap = L.map('map', {
		zoom: 6,
		center: [56.5, -7],
		fullscreenControl: true,
		timeDimensionControl: true,
		timeDimension: true,
		timeDimensionOptions: {
		   times: timeInterval
		},
		timeDimensionControlOptions: {
		  maxSpeed: 2,
		   playerOptions: {
			   loop: true,
			   transitionTime: 1000,
			   minBufferReady: 3
		   }
		}
	});

	mymap.timeDimension.setCurrentTime(new Date(startTimeInput.value));

	var corner1 = L.latLng(53, -11),
	corner2 = L.latLng(59, -2.8),
	bounds = L.latLngBounds(corner1, corner2);

	L.rectangle(bounds, {fill: false, color: 'black', weight: 3}).addTo(mymap);
	 
	var Esri_WorldImagery = L.tileLayer(
		"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
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
		
	var surfaceVelocity = L.timeDimension.layer.velocity({
		maxBuffer: 24*4,
		fetchGrib2: function(time,bounds){
		 return ds.constrain({time: time, bbox: bounds.toBBoxString()}).vectors(
		   'sea_surface_u_velocity','sea_surface_v_velocity')
			   .fetchGrib2();
		}
	});

	var tenVelocity = L.timeDimension.layer.velocity({
		maxBuffer: 24*4,
		fetchGrib2: function(time,bounds){
		 return ds.constrain({time: time, bbox: bounds.toBBoxString()}).vectors(
		   'sea_u_velocity_at_10_meters_depth','sea_v_velocity_at_10_meters_depth')
			   .fetchGrib2();
		}
	});

	var thirtyVelocity = L.timeDimension.layer.velocity({
		maxBuffer: 24*4,
		fetchGrib2: function(time,bounds){
		 return ds.constrain({time: time, bbox: bounds.toBBoxString()}).vectors(
		   'sea_u_velocity_at_30_meters_depth','sea_v_velocity_at_30_meters_depth')
			   .fetchGrib2();
		}
	});

	var bottomVelocity = L.timeDimension.layer.velocity({
		maxBuffer: 24*4,
		fetchGrib2: function(time,bounds){
		 return ds.constrain({time: time, bbox: bounds.toBBoxString()}).vectors(
		   'sea_bottom_u_velocity','sea_bottom_v_velocity')
			   .fetchGrib2();
		}
	});

	var integratedVelocity = L.timeDimension.layer.velocity({
		maxBuffer: 24*4,
		fetchGrib2: function(time,bounds){
		 return ds.constrain({time: time, bbox: bounds.toBBoxString()}).vectors(
		   'vertically_integrated_u_velocity','vertically_integrated_v_velocity')
			   .fetchGrib2();
		}
	});
	
	var wmsUrl = "https://data.marine.ie/ncWMS/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.1.1&STYLES=default-scalar/default&version=1.1.1&PALETTE=default" ;
	var tempColourRange = "0,23"
	var salColourRange = "0,40"
	var tempWmsURL = wmsUrl+"&COLORSCALERANGE="+tempColourRange;
	var salWmsURL = wmsUrl+"&COLORSCALERANGE="+salColourRange;

	var surfTemp = L.tileLayer.wms(tempWmsURL, {
		layers: 'COMPASS_NEATL/sea_surface_temperature',
		format: 'image/png',
		transparent: true});
		
	var surfTempTime = L.timeDimension.layer.wms(surfTemp);
		
	var surfSal = L.tileLayer.wms(salWmsURL, {
		layers: 'COMPASS_NEATL/sea_surface_salinity',
		format: 'image/png',
		transparent: true});
		
	var surfSalTime = L.timeDimension.layer.wms(surfSal);
		
	var tenTemp = L.tileLayer.wms(tempWmsURL, {
		layers: 'COMPASS_NEATL/sea_temperature_at_10_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var tenTempTime = L.timeDimension.layer.wms(tenTemp);
		
	var tenSal = L.tileLayer.wms(salWmsURL, {
		layers: 'COMPASS_NEATL/sea_salinity_at_10_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var tenSalTime = L.timeDimension.layer.wms(tenSal);

	var thirtyTemp = L.tileLayer.wms(tempWmsURL, {
		layers: 'COMPASS_NEATL/sea_temperature_at_30_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var thirtyTempTime = L.timeDimension.layer.wms(thirtyTemp);

	var thirtySal = L.tileLayer.wms(salWmsURL, {
		layers: 'COMPASS_NEATL/sea_salinity_at_30_meters_depth',
		format: 'image/png',
		transparent: true});
		
	var thirtySalTime = L.timeDimension.layer.wms(thirtySal)

	var bottomTemp = L.tileLayer.wms(tempWmsURL, {
		layers: 'COMPASS_NEATL/sea_bottom_temperature',
		format: 'image/png',
		transparent: true});
		
	var bottomTempTime =  L.timeDimension.layer.wms(bottomTemp);
		
	var bottomSal = L.tileLayer.wms(salWmsURL, {
		layers: 'COMPASS_NEATL/sea_bottom_salinity',
		format: 'image/png',
		transparent: true});
		
	var bottomSalTime =  L.timeDimension.layer.wms(bottomSal);
		
	var mixedDepth = L.tileLayer.wms(wmsUrl+"&COLORSCALERANGE=10,400", {
		layers: 'COMPASS_NEATL/mixed_layer_depth',
		format: 'image/png',
		transparent: true});
		
	var mixedDepthTime = L.timeDimension.layer.wms(mixedDepth);

	var groupedOverlays = {
		"Surface": {
			"Temperature": surfTempTime,
			"Salinity": surfSalTime,
			"Velocity": surfaceVelocity
		},
		"10-Meters": {
			"Temperature": tenTempTime,
			"Salinity": tenSalTime,
			"Velocity": tenVelocity
		},
		"30-Meters": {
			"Temperature": thirtyTempTime,
			"Salinity": thirtySalTime,
			"Velocity": thirtyVelocity
		},
		"Bottom": {
			"Temperature": bottomTempTime,  
			"Salinity": bottomSalTime,
			"Velocity": bottomVelocity
		},
		"Others":{
			"Mixed Depth": mixedDepthTime,
			"Integrated Velocity": integratedVelocity
		}};

	var layerControl = L.control.groupedLayers(baseLayers,groupedOverlays);
	layerControl.addTo(mymap);
	
	var layerLegend = document.getElementById('legend');

	mymap.on('overlayadd', function (e) {
		var activeLayer = e.layer;
		var activeLayerName = activeLayer._currentLayer.options.layers;
		var legendUrl = "http://data.marine.ie/ncWMS/wms?REQUEST=GetLegendGraphic&PALETTE=default&LAYERS="
						+activeLayerName
						+"&STYLES=default-scalar/default"
		if (activeLayerName.includes("temp")){
			layerLegend.src = legendUrl+"&COLORSCALERANGE="+tempColourRange;
			layerLegend.style.display = "block"
		}
		else if (activeLayerName.includes("sal")){
			layerLegend.src = legendUrl+"&COLORSCALERANGE="+salColourRange
			layerLegend.style.display = "block"
		}
		else if (activeLayerName.includes("mixed")){
			layerLegend.src = legendUrl+"&COLORSCALERANGE=10,400";
			layerLegend.style.display = "block";
		}	
	});

	mymap.on('overlayremove', function (e) {
		layerLegend.style.display = "none"
	});

	var popup = L.popup();

	mymap.on('click', function(e) {
		
		if (marker !== null) {
			mymap.removeLayer(marker);
		}
		
		marker = L.marker(e.latlng);

		if (bounds.contains(marker._latlng)){
			marker.addTo(mymap);
			popup.setLatLng(e.latlng)
			.setContent("Coordinates: " + e.latlng.toString()).openOn(mymap);

			var startDate = startTimeInput.value
			var endDate = endTimeInput.value

			refreshTemp(e.latlng.lat.toFixed(2),e.latlng.lng.toFixed(2), startDate, endDate)
			refreshSal(e.latlng.lat.toFixed(2),e.latlng.lng.toFixed(2), startDate, endDate)
		}
		else {
			alert("Please select an appropriate location")
		}
		
	});

});
