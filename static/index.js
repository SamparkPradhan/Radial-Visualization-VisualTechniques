// Importing the data
// I have used winquality-red dataset
function radvizMainfunction(data){
	// Declaring variables 
	const radID = document.querySelector('#radviz');
	const dataTitles = d3.keys(data[0]);
	const key = d3.keys(data[0]);
	const lastCol = key.splice(-1,1);
	const allDimensions = key;
	const anchorDimension = Array.apply(null, {length: allDimensions.length}).map(Number.call, Number).map(x=>x*2*Math.PI/(allDimensions.length));
	const colorDataPoints = function(d){ return d[lastCol]; };
	
	// plot functions for radviz
	plot()
		.myRadviz(radID)
		.winData(data)
		.DimensionAnchors(anchorDimension)
		.Dimensions(allDimensions)
		.columnNames(dataTitles)
		.colorMarks(colorDataPoints)
		.call();
};

// For viewing the changed in Assignment1 link
function changeRadvizAssignment1() {
	    $.ajax({
        url: "/changeAssignment1",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'selectedField':document.getElementById("selectedField").value
        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
        	d3.selectAll("svg").remove();
			radvizMainfunction(data)
		},
    });
}

// To get the selected dataset
function getSelectedDataSet()
{
    $.ajax({
        url: "/selectedData",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'selectedFile':document.getElementById("selectedFile").value
        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
        	d3.selectAll("svg").remove();
			radvizMainfunction(data)
		},
    });
}

// To get the selected method, either class based or k means
function getSelectedMethod() {
        $.ajax({
        url: "/selectedMethod",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'cluster':document.getElementById("cluster").value,
            'selectedFile':document.getElementById("selectedFile").value,
            'kmeans-cluster':document.getElementById("kmeans-cluster").value,
            'kmeans-iter':document.getElementById("kmeans-iter").value
        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
        	d3.selectAll("svg").remove();
			radvizMainfunction(data)
		},
    });
	
}

// To get the mouse point data to calculate correlation matrix
function getMousePoint(data) {
		$.ajax({
        url: "/generateCorrelation",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {
        	'cluster':document.getElementById("cluster").value,
            'selectedFile':document.getElementById("selectedFile").value,
            'kmeans-cluster':document.getElementById("kmeans-cluster").value,
            'kmeans-iter':document.getElementById("kmeans-iter").value,
            'data' : data
        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
			Plotly.newPlot('mydiv', data )
		},
    });

}

// Main Function
function plot(){

	// Retriving all the variables
	let myRadviz,
		DimensionAnchors,
		Dimensions, 
		columnNames, 
		colorMarks, 
		winData;

		// Getting all processed output from raddviz functions
		raddviz.myRadviz = function(fi) {
	
			myRadviz = fi;
			return raddviz;
		};	
		raddviz.DimensionAnchors = function(fi) {
			
			DimensionAnchors = fi;
			return raddviz;
		};	
		raddviz.Dimensions = function(fi) {
			
			Dimensions = fi;
			return raddviz;
		};
		raddviz.columnNames = function(fi) {
		
			columnNames = fi;
			return raddviz;
		};
		raddviz.colorMarks = function(fi) {
			
			colorMarks = fi;
			return raddviz;
		};	
		raddviz.winData = function(fi) {
			
			winData = fi;
			return raddviz;
		};

	// Plotting the cirrcle, anchors and Data points.
	function raddviz(div) {		

		let	anchorRadius = 8,
			pointRadius = 5; 
		let myColor = d3.scaleOrdinal(d3.schemeCategory10); 
		const numberFormat = d3.format(',d');		
		let plotMargin = {top:100, bottom:50, right:150, left:180},
			width = 1000,
			height = 800;		
		let cRadius = Math.min((height-plotMargin.top-plotMargin.bottom) , (width-plotMargin.left-plotMargin.right))/2;		

		var titles = columnNames; 
		titles.unshift('index');
		
		//Calling normalizaton of each data points
		var dimensions = Dimensions,
			normed = '_normalized',
			dimensionNamesNormalized = dimensions.map(function(d) { return d + normed; }), 
			dimensionLength = dimensions.length,
			anchors = DimensionAnchors.slice(), 
			sData = winData.slice();
		

		sData.forEach((i,j) => {
			i.index = j;
			i.id = j;
			i.color = myColor(colorMarks(i));
		});
		sData = valueNormalization(sData);
		sData = calculateNodePosition(sData, dimensionNamesNormalized, anchors); 

		//For all color values
		let cSpace = [], cClass = [];
		sData.forEach(function(i, j){
			if(cSpace.indexOf(i.color)<0) {
				cSpace.push(i.color); 
				cClass.push(i.quality); }
		});	
		
		// Adding all elements to the container
		const radviz = d3.select(myRadviz);
		let svg = radviz.append('svg').attr('id', 'radviz')
			.attr('width', width)
			.attr('height', height);						
		svg.append('rect').attr('fill', 'transparent')
			.attr('width', width)
			.attr('height', height);
		

		let center = svg.append('g').attr('quality', 'center').attr('transform', `translate(${plotMargin.left},${plotMargin.top})`); 	
		
		// Appending each element
		svg.append('rect').attr('quality', 'DAtip-rect');			
		let DAtipContainer = svg.append('g').attr('x', 0).attr('y', 0);
		let DAtip = DAtipContainer.append('g')
			.attr('quality', 'DAtip')
			.attr('transform', `translate(${plotMargin.left},${plotMargin.top})`)
			.attr('display', 'none');
		DAtip.append('rect');
		DAtip.append('text').attr('width', 150).attr('height', 25)
			.attr('x', 0).attr('y', 25)
			.text(':').attr('text-anchor', 'start').attr('dominat-baseline', 'middle');	
		
		svg.append('rect').attr('quality', 'tip-rect')
			.attr('width', 80).attr('height', 200)
			.attr('fill', 'transparent')
			.attr('backgroundColor', d3.rgb(100,100,100)); 
			
		// Creating tooltip 
		let tooltipContainer = svg.append('g')
			.attr('class', 'tip')
			.attr('transform', `translate(${plotMargin.left},${plotMargin.top})`)
			.attr('display', 'none');
			
		// Calculating data points here
		let myData = dimensions.map(function(i, j) {
			return {
				theta: anchors[j], 
				x: Math.cos(anchors[j])*cRadius+cRadius,
				y: Math.sin(anchors[j])*cRadius+cRadius,
				fixed: true,
				name: i
				};
		});

		// I am normalizing the data with this function
		function valueNormalization(data) {
				data.forEach(function(d) {
					dimensions.forEach(function(dimension) {
						d[dimension] = +d[dimension];
					});
				});
				var scaledValue = {};
				dimensions.forEach(function(dimension) {
					scaledValue[dimension] = d3.scaleLinear().domain(d3.extent(data.map(function(d, i) {
						return d[dimension];
					}))).range([0, 1]);
				});
				data.forEach(function(d) {
					dimensions.forEach(function(dimension) {
						d[dimension + '_normalized'] = scaledValue[dimension](d[dimension]);
					});
				});
				data.forEach(function(d) {
					let dsum = 0;
					dimensionNamesNormalized.forEach(function (k){ dsum += d[k]; });  
					d.dsum = dsum;
				});			
				return data;
		}

		// For dinding node position which will give me exact node values on circle
		function calculateNodePosition(sData, dimensionNamesNormalized, anchors) {
			sData.forEach(function(d) {
				let dsum = d.dsum, dx = 0, dy = 0;
				dimensionNamesNormalized.forEach(function (k, i){ 
					dx += Math.cos(anchors[i])*d[k]; 
					dy += Math.sin(anchors[i])*d[k]; }); 
				d.x0 = dx/dsum;
				d.y0 = dy/dsum;
				d.dist 	= Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2));
				d.distH = Math.sqrt(Math.pow(dx/dsum, 2) + Math.pow(dy/dsum, 2)); 
				d.theta = Math.atan2(dy/dsum, dx/dsum) * 180 / Math.PI; 
			});
			// Returning the computed data
			return sData;
		} 

		// Calling the plot of radviz
		const myRad	= d3.select(myRadviz).data([fullRadViz()]);		
	
		// Rendering while moving dimensions smoothly as requiered
		myRad.each(render);
		function render(method) {
			d3.select(this).call(method);	
		}		


		// Inner function which draws my radviz
		function fullRadViz(){
			function fullPlot(div) {
				div.each(function() {
					// Plottting panel for data point values for every column
					panelViz(cRadius);
					// Plotting Anchors
					plotAnchors();
					plotAnchorLabels();

					// For tootip		
					let tTip = tooltipContainer.selectAll('text').data(titles)
							.enter().append('g').attr('x', 0).attr('y',function(d,i){return 25*i;});
					tTip.append('rect').attr('width', 150).attr('height', 25).attr('x', 0).attr('y',function(d,i){return 25*i;})
							.attr('fill', d3.rgb(200,255,255));
					tTip.append('text').attr('width', 150).attr('height', 25).attr('x', 5).attr('y',function(d,i){return 25*(i+0.5);})
							.text(d=>d + ':').attr('text-anchor', 'start').attr('dominat-baseline', 'hanging');
					
					// Plotting each data node
					plotDataPoints();
					
					// Drawing all the legends 
					plotLegend();
					
					// All Anchors plot
					function plotAnchors(){
						center.selectAll('circle.DA-node').remove();
						let anchorNodes = center.selectAll('circle.DA-node')
							.data(myData)
							.enter().append('circle').attr('class', 'DA-node')
							.attr('fill', d3.rgb(50,50,50))
							.attr('stroke', d3.rgb(50,50,50))
							.attr('stroke-width', 1)
							.attr('r', anchorRadius)
							.attr('cx', d => d.x)
							.attr('cy', d => d.y)
							.on('mouseenter', function(d){
								// For mouse position
								let mousePosition = d3.mouse(this); 
								svg.select('g.DAtip').select('text').text('(' + numberFormat((d.theta/Math.PI)*180) + ')').attr('fill', 'blue').attr('font-size', '18pt');
								svg.select('g.DAtip').attr('transform',  `translate(${plotMargin.left + mousePosition[0] +0},${plotMargin.top+mousePosition[1] - 50})`);
								svg.select('g.DAtip').attr('display', 'block');
							})
							.on('mouseout', function(d){
								svg.select('g.DAtip').attr('display', 'none');
							})
							.call(d3.drag()
								.on('start', startDrag)
								.on('drag', dragg)
								.on('end', endDrag)
							);
					}				

					// Three function for dragging of anchors and replotting of data points
					function startDrag(d){ 
						d3.select(this).raise().classed('active', true);
					}
					
					function dragg(d, i) {
						d3.select(this).raise().classed('active', true);
						let xTemp = d3.event.x - cRadius;
						let yTemp = d3.event.y - cRadius;
						let nAngle = Math.atan2( yTemp , xTemp ) ;	
						nAngle = nAngle<0? 2*Math.PI + nAngle : nAngle;
						d.theta = nAngle;
						d.x = cRadius + Math.cos(nAngle) * cRadius;
						d.y = cRadius + Math.sin(nAngle) * cRadius;
						d3.select(this).attr('cx', d.x).attr('cy', d.y);
						// Replotting anchors
						plotAnchors();
						plotAnchorLabels();
						
						// Plot new Data points
						anchors[i] = nAngle;
						calculateNodePosition(sData, dimensionNamesNormalized, anchors);
						plotDataPoints();
					}

					function endDrag(d){ 
						d3.select(this).classed('active', false);
						d3.select(this).attr('stroke-width', 0);
					}

					// For each data point value
					function panelViz(a) {
						let pPanel = center.append('circle')
							.attr('quality', 'big-circle')
							.attr('stroke', d3.rgb(0,0,0))
							.attr('stroke-width', 3)
							.attr('fill', 'transparent')
							.attr('r', a)
							.attr('cx', a)
							.attr('cy', a);
					}

					// Plotting Legend
					function plotLegend() {
						let hLegend = 25, posXLegend = plotMargin.left+cRadius*1.5, posYLegend = 20;
						let lCircle = center.selectAll('circle.legend').data(cSpace)
							.enter().append('circle').attr('quality', 'legend')
							.attr('r', pointRadius)
							.attr('cx', posXLegend)
							.attr('cy', (d, i) => i*posYLegend)
							.attr('fill', d=>d);
						let lTexts = center.selectAll('text.legend').data(cClass)
							.enter().append('text').attr('quality', 'legend')
							.attr('x', posXLegend + 2 * pointRadius)
							.attr('y', (d, i) => i*posYLegend+5)
							.text(d => d).attr('font-size', '16pt').attr('dominat-baseline', 'middle')
							.on('mouseover', function(d){
								
								let aaTemp = d3.select(myRadviz).selectAll('.circle-data');
								aaTemp.nodes().forEach((element) => {
									let bTemp = element.getAttribute('id');
									if (sData[bTemp].quality != d) {
										d3.select(element).attr('fill-opacity', 0.2).attr('stroke-width', 0);
									}
								});
							})
							.on('mouseout', function(d) {
								
								d3.select(myRadviz).selectAll('.circle-data')
									.attr('fill-opacity', 1).attr('stroke-width', 0.5);
							});					
					}	
				
					
					// For Anchor Labels
					function plotAnchorLabels() {
						center.selectAll('text.DA-label').remove();
						//Labels of each node
						let nLabel = center.selectAll('text.DA-label')
							.data(myData).enter().append('text').attr('class', 'DA-label')
							.attr('x', d => d.x).attr('y', d => d.y)
							.attr('text-anchor', d=>Math.cos(d.theta)>0?'start':'end')
							.attr('dominat-baseline', d=>Math.sin(d.theta)<0?'baseline':'hanging')
							.attr('dx', d => Math.cos(d.theta) * 15)
							.attr('dy', d=>Math.sin(d.theta)<0?Math.sin(d.theta)*(15):Math.sin(d.theta)*(15)+ 10)
							.text(d => d.name)
							.attr('font-size', '18pt');					
					}

					// For data points
					function plotDataPoints(){
						center.selectAll('.circle-data').remove();
						let dataPoints = center.selectAll('.circle-data')
							.data(sData).enter().append('circle').attr('class', 'circle-data')
							.attr('id', d=>d.index)
							.attr('r', pointRadius)
							.attr('fill', d=>d.color)
							.attr('stroke', 'black')
							.attr('stroke-width', 0.5)
							.attr('cx', d => d.x0*cRadius + cRadius)
							.attr('cy', d => d.y0*cRadius + cRadius)
							.on('mouseenter', function(d) {
								let mousePos = d3.mouse(this);
								var a = " ";
								let tip = svg.select('g.tip').selectAll('text').text(function(i, j){
									a += "/"+d[i];
									return i + ': ' + d[i];
								});
								getMousePoint(a);
								
								svg.select('g.tip').attr('transform',  `translate(${plotMargin.left + mousePos[0] +20},${plotMargin.top+mousePos[1] - 120})`);
								
								svg.select('g.tip').attr('display', 'block');
								
								d3.select(this).raise().transition().attr('r', pointRadius*2).attr('stroke-width', 3);		
							})
							.on('mouseout', function(d) {
								svg.select('g.tip').attr('display', 'none');
								
								d3.select(this).transition().attr('r', pointRadius).attr('stroke-width', 0.5);
							});					
					}				
					

				});
			} 
			return fullPlot;
		}
	
	}
	
	return raddviz;
};