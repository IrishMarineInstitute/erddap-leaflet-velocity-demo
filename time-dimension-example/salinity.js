function refreshSal(Lat, Lon, startDate, endDate) {
	var layers = ['sea_surface_salinity','sea_salinity_at_10_meters_depth','sea_salinity_at_30_meters_depth','sea_bottom_salinity']
	var dataURL = erddapURL+
				  '/griddap/'+
				  datasetID+
				  '.json?'+
				  layers[0]+'[('+startDate+'T00:00:00Z):1:('+endDate+'T00:00:00Z)][('+Lat+'):1:('+Lat+')][('+Lon+'):1:('+Lon+')],'+
				  layers[1]+'[('+startDate+'T00:00:00Z):1:('+endDate+'T00:00:00Z)][('+Lat+'):1:('+Lat+')][('+Lon+'):1:('+Lon+')],'+
				  layers[2]+'[('+startDate+'T00:00:00Z):1:('+endDate+'T00:00:00Z)][('+Lat+'):1:('+Lat+')][('+Lon+'):1:('+Lon+')],'+
				  layers[3]+'[('+startDate+'T00:00:00Z):1:('+endDate+'T00:00:00Z)][('+Lat+'):1:('+Lat+')][('+Lon+'):1:('+Lon+')]';
	$.ajax({
	type: 'GET',
	url: dataURL,
	success: function (data) {
		var response = data.table
		var surfSal = [];
		var tenSal = [];
		var thirtySal = [];
		var bottSal = [];
		console.log(response)
		$.each(response.rows, function (index, row) {
			var isoDate = new Date(row[0]);
			var jsdate = isoDate.getTime();
			surfRow = [jsdate, row[3]];
			tenRow = [jsdate, row[4]];
			thirtyRow = [jsdate, row[5]];
			bottRow = [jsdate, row[6]];
			surfSal.push(surfRow);
			tenSal.push(tenRow);
			thirtySal.push(thirtyRow);
			bottSal.push(bottRow);
		})
		// pass data to tempGraph function
		salGraph(surfSal,tenSal,thirtySal,bottSal,startDate,endDate,Lat,Lon);
	},
	});
};

Highcharts.setOptions({
    time: {
        /**
         * Use moment-timezone.js to return the timezone offset for individual
         * timestamps, used in the X axis labels and the tooltip header.
         */
        getTimezoneOffset: function (timestamp) {
            var zone = 'Europe/Dublin',
                timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

            return timezoneOffset;
        }
    }
});
/*
** Dates to display at the top of the graph
*/
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

function salGraph(surfSal,tenSal,thirtySal,bottSal,startDate,endDate,Lat,Lon) {
    displayStartDate = new Date(startDate).toLocaleDateString("en-US", options);
    displayEndDate = new Date(endDate).toLocaleDateString("en-US", options);
    Highcharts.chart('sal', {
        chart: {
            type: 'line',
            zoomType: 'x'
        },
        navigator: {
            adaptToUpdatedData: false,
            series: {
                data: surfSal, tenSal, thirtySal, bottSal
            }
        },
        tooltip: {
            crosshairs: true,
            valueDecimals: 2
        },
        scrollbar: {
            liveRedraw: false
        },
        title: {
            text: 'Salinity (PSU) '
        },
        subtitle: {
            text: displayStartDate + ' - ' + displayEndDate + '<br> Location: ('+Lat+','+Lon+')'
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            floor: 0
        },
        series: [{
            name: 'Sea Surface Salinity',
            data: surfSal,
            dataGrouping: {
                enabled: false
            }
        },
        {
            name: 'Sea Salinity at 10m Depth',
            data: tenSal,
            dataGrouping: {
                enabled: false
            }
        },
        {
            name: 'Sea Salinity at 30m Depth',
            data: thirtySal,
            dataGrouping: {
                enabled: false
            }
        },
        {
            name: 'Sea Bottom Salinity',
            data: bottSal,
            dataGrouping: {
                enabled: false
            }
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    })
    window.scrollBy(0, 600);
}
