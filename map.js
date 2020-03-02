var width = $(".india-map-class").width(), height =800;

var projection = d3.geoMercator();

var path = d3.geoPath()
	.projection(projection)
	.pointRadius(2);

var div = d3.select("#map").append("div")
	.attr("class", "stateResultsTooltip")
	.style("opacity", 0);

var svg = d3.select("#map").append("svg")
	.attr("width",600)
	.attr("height", 800)

var g = svg.append("g")


d3.json("https://static.asianetnews.com/v1/elections/india_data.json", function (error, data) {

	var boundary = centerZoom(data);
	var subunits = drawSubUnits(data);
	colorSubunits(subunits);
	drawOuterBoundary(data, boundary);
});

function centerZoom(data) {

	var o = topojson.mesh(data, data.objects.polygons, function (a, b) { return a === b; });

	projection
		.scale(1)
		.translate([0, 0]);

	var b = path.bounds(o),
		s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
		t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

	var p = projection
		.scale(s)
		.translate(t);

	return o;
}

function drawOuterBoundary(data, boundary) {

	g.append("path")
		.datum(boundary)
		.attr("d", path)
		.attr("class", "subunit-boundary")
		.attr("fill", "none")
		.attr("stroke", "#3a403d");
}

function drawPlaces(data) {

	g.append("path")
		.datum(topojson.feature(data, data.objects.places))
		.attr("d", path)
		.attr("class", "place");

	g.selectAll(".place-label")
		.data(topojson.feature(data, data.objects.places).features)
		.enter().append("text")
		.attr("class", "place-label")
		.attr("transform", function (d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
		.attr("dy", ".35em")
		.attr("x", 6)
		.attr("text-anchor", "start")
		.style("font-size", ".7em")
		.style("text-shadow", "0px 0px 2px #fff")
		.text(function (d) { return d.properties.name; });
}

function drawSubUnits(data) {

	var subunits = g.selectAll(".subunit")
		.data(topojson.feature(data, data.objects.polygons).features)
		.enter().append("path")
		.attr("class", "subunit")
		.attr("id", function (d) {
			return d.properties.id;
		})
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1px")
		.on("click", function (val) {
			var selectId = val.properties.st_nm;
			console.log(val)
		})

		.on("mouseover", function (d) {
			$(d3.event.target).css("opacity",.9)

			div.transition()
				.duration(200)
				.style("opacity", .9);

			div.html('<div class="state-card"> <h4 class="state-name">'+ d.properties.st_nm +'</h4> <div class="card-container"> <table style="width:100%"> <tr> <th class="table-header">INC</th> <th class="table-header">BJP</th> <th class="table-header">BSP</th> <th class="table-header">OTHERS</th> </tr><tr><td class="container-row"><span>50<span></td> <td class="container-row"><span>50<span></td> <td class="container-row"><span>50<span></td> <td class="container-row"><span>50<span></td>  </tr> </table> <div class="view-more"> <p>View More</p></div></div></div>')
				.style("margin-top", "50px");
				path(d);

		})
		.on("mouseout", function (d) {
			$(d3.event.target).css("opacity", .4)
			$(".state-card").hide(d);
		})

	return subunits;
}

function drawSubUnitLabels(data) {

	g.selectAll(".subunit-label")
		.data(topojson.feature(data, data.objects.polygons).features)
		.enter().append("text")
		.attr("class", "subunit-label")
		.attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.style("font-size", ".5em")
		.style("text-shadow", "0px 0px 2px #fff")
		.style("text-transform", "uppercase")
		.text(function (d) { return d.properties.st_nm; });
}

function colorSubunits(subunits) {

	var c = d3.scaleOrdinal(d3.schemeCategory20);
	subunits
		.style("fill", "blue")
		.style("opacity", ".4");
}

