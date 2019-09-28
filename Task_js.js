var width = 960;
var height = 540;


//defining svgCanvas
var svg = d3.select("svg")
    .attr("width", 960)
    .attr("height", 540)
    .attr("class", "svgCanvas");

//defining simulations
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    }))
.force('center', d3.forceCenter(width / 2, height / 2))
    //.force("charge", d3.forceManyBody().strength(-200))
    .force('charge', d3.forceManyBody()
        .strength(-200)
        .theta(0.8)
        .distanceMax(1)
    );


//defining tooltip variable and appending rectangle and text properties to it
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

tooltip.append("rect")
    .attr("width", 200)
    .attr("height",100)
    .attr("fill", "blue")
    .style("opacity", 0.5);
tooltip.append("text")
    .attr("x", 9)
    .attr("dy", "1em")
    .style("font-size", 15)

//loading the json data and creating the visualization
d3.json("data.json", function(graph) {
	
	//appending the links to the svg container
    var link = svg.append("g")
        .style("stroke", "red")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) {
            return d.amount / 100;
        });
	
	//appending the nodes to the svg container
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 0)
        .call(d3.drag()
            .on("start", dragstarted) //drag events 
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", showConnections) // mouseover events
        .on("mouseout", hideConnections);
	
	//mouse over in function 
    function showConnections(d) {
        svg.selectAll("circle")
            .attr("opacity", 0.1);
        //this highlights the node
        d3.select(this) // hightlight the node on hovering on
            .attr("opacity", 1);
        //If this link is connected to the node it will be highlighted rest elese will be made lighter
        svg.selectAll("link").attr("opacity", 0);
        link.style("stroke-opacity", function(l) {
			
            if (l.node01 == d.id || l.node02 == d.id) {
                return 1;
            }
            if (l.node01 != d.id && l.node02 != d.id) {
                return 0.05;
            }

        });
		link.style("stroke", function(l) { //changing the color of the link on mouse over

            if (l.node01 == d.id || l.node02 == d.id) {
                return "blue";
            }
            if (l.node01 != d.id && l.node02 != d.id) {
                return "red";
            }

        }
				  
	);

		//tooltip text using the site name, radius and number of connected nodes
		t = "Site: " + d.id + " <br/>Total trading amount: " + radius(d) + " <br/>Number connected nodes: " + number_of_links(d)
		//console.log(t)
		tooltip.style("left", d3.event.pageX + 7.5 + "px")
              .style("top", d3.event.pageY +20	 + "px")
              .style("display", "inline-block")
        //tooltip.attr("transform", "translate(" + (d.x + 5) + "," + (d.y - 20) + ")");
        tooltip.select("text").html(t)
        //	console.log(d.id + l(d));
		//making the tooltip true
        tooltip.style("visibility", "visible")

    }
	
	//mouse over out function
    function hideConnections(d) {
        //This unhighlights the node
        svg.selectAll("circle")
            .attr("opacity", 1);
        link.style("stroke-opacity", 1);
		link.style("stroke", "red");
        tooltip.style("visibility", "hidden")

    }

    function number_of_links(d) { //function to count the number of links
        count = 0
        for (var j = 0; j < graph.links.length; j++) {
            if (d.id == graph.links[j].node01) {
                count += 1;
            }
            if (d.id == graph.links[j].node02) {
                count += 1;
            }

        }
        return count
    }

    var format = d3.format(".1f")

    function radius(d) { //function to find the radius of the node
		var id = d.id
		//console.log(id);
			var list = [];

			for (var j = 0; j < graph.links.length; j++) {
				if (id == graph.links[j].node01) {
					list.push(graph.links[j].amount);
				}
				if (id == graph.links[j].node02) {
					list.push(graph.links[j].amount);
				}
			}
			var totamt = 0;
			for (var k = 0; k < list.length; k++) {
				totamt = totamt + list[k];
			}
			//console.log(length,id,totamt);

			return format(totamt);   
        
    }

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    function ticked() { //defining the function ticked to set the position of the nodes and generate links
        link
            .attr("x1", function(d) {
                for (var i = 0; i < graph.nodes.length; i++) {
                    if (graph.nodes[i].id == d.node01) {
                     return Math.max(radius(graph.nodes[i].x)/60, Math.min(width - radius(graph.nodes[i].x)/60, graph.nodes[i].x));
                    }
                }
            })
            .attr("y1", function(d) {
                for (var i = 0; i < graph.nodes.length; i++) {
                    if (graph.nodes[i].id == d.node01) {
                        return Math.max(radius(graph.nodes[i].y)/60, Math.min(height - radius(graph.nodes[i].y)/60, graph.nodes[i].y));
                    }
                }
            })
            .attr("x2", function(d) {
                for (var i = 0; i < graph.nodes.length; i++) {
                    if (graph.nodes[i].id == d.node02) {
                        return Math.max(radius(graph.nodes[i].x)/60, Math.min(width - radius(graph.nodes[i].x)/60, graph.nodes[i].x));
                    }
                }
            })
            .attr("y2", function(d) {
                for (var i = 0; i < graph.nodes.length; i++) {
                    if (graph.nodes[i].id == d.node02) {
                        return Math.max(radius(graph.nodes[i].y)/60, Math.min(height - radius(graph.nodes[i].y)/60, graph.nodes[i].y));
                    }
                }
            });
		
        node //defining the node attributes and fixing the node position based on the values given
            .attr("r", function(d){r = radius(d)/60 
								   return r}
				 )
            .style("fill", "green")
            .style("stroke", "green")
            .style("stroke-width", "1px")
            .attr("cx", function(d) {
                return Math.max(radius(d)/60, Math.min(width - radius(d)/60, d.x)); 
            })
            .attr("cy", function(d) {
                return Math.max(radius(d)/60, Math.min(height - radius(d)/60, d.y));
            });

    }
simulation.on("tick", ticked ); 
	
	//defining functions for when the node is dragged
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
        //  simulation.fix(d);
    }

    function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
        //  simulation.fix(d, d3.event.x, d3.event.y);
    }

    function dragended(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
        if (!d3.event.active) simulation.alphaTarget(0);
        //simulation.unfix(d);

    }

});