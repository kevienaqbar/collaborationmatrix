// var margin = {top: 80, right: 0, bottom: 10, left: 80},
//     width = 720,
//     height = 720;

// var x = d3.scale.ordinal().rangeBands([0, width]),
//     z = d3.scale.linear().domain([0, 4]).clamp(true),
//     c = d3.scale.category10().domain(d3.range(10));

// var svg = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .style("margin-left", -margin.left + "px")
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function matrix(json) {
    var matrix = [],
            nodes = json.nodes,
            n = nodes.length;

    // Compute index per node.
    nodes.forEach(function (node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function (j) {
            return {x: j, y: i, z: 0, zkey: ""};
        });
    });

    // Convert links to matrix; count character occurrences.
    json.links.forEach(function (link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
//         matrix[link.source][link.source].z += link.value;
//         matrix[link.target][link.target].z += link.value; 
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
        nodes[link.source].val = link.value;
        nodes[link.target].val = link.value;

        matrix[link.source][link.target].zkey += link.keyword;
        matrix[link.target][link.source].zkey += link.keyword;

    });


    var adjacency = matrix.map(function (row) {
        return row.map(function (c) {
            return c.z;
        });
    });

    var graph = reorder.graph()
            .nodes(json.nodes)
            .links(json.links)
            .init();

    var dist_adjacency;
    var leafOrder = reorder.optimal_leaf_order()

    function computeLeaforder() {
        var order = leafOrder(adjacency);

        order.forEach(function (lo, i) {
            nodes[i].leafOrder = lo;
        });
        return nodes.map(function (n) {
            return n.leafOrder;
        });
    }

    // Precompute the orders.
    var orders = {
        name: d3.range(n).sort(function (a, b) {
            return d3.ascending(nodes[a].name, nodes[b].name);
        }),
        count: d3.range(n).sort(function (a, b) {
            return nodes[b].count - nodes[a].count;
        }),
        freq: d3.range(n).sort(function (a, b) {
            return nodes[b].val - nodes[a].val;
//      group: d3.range(n).sort(function (a, b) {
//            var x = nodes[b].group - nodes[a].group;
//            return (x != 0) ? x : d3.ascending(nodes[a].name, nodes[b].name);
//      }),
        }),
        leafOrder: computeLeaforder
    };

    // The default sort order.
    x.domain(orders.name);

    svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);

    var row = svg.selectAll(".row")
            .data(matrix)
            .enter().append("g")
            .attr("id", function (d, i) {
                return "row" + i;
            })
            .attr("class", "row")
            .attr("transform", function (d, i) {
                return "translate(0," + x(i) + ")";
            })
            .each(row);

    var rowtext = svg.selectAll(".rowtext")
            .data(matrix)
            .enter().append("g")
            .attr("id", function (d, i) {
                return "rowtext" + i;
            })
            .attr("class", "rowtext")
            .attr("transform", function (d, i) {
                return "translate(0," + x(i) + ")";
            })
            .each(rowtext);


    row.append("line")
            .attr("x2", width);

    row.append("text")
            .attr("x", -6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function (d, i) {
                return nodes[i].name;
            });

    var column = svg.selectAll(".column")
            .data(matrix)
            .enter().append("g")
            .attr("id", function (d, i) {
                return "col" + i;
            })
            .attr("class", "column")
            .attr("transform", function (d, i) {
                return "translate(" + x(i) + ")rotate(-90)";
            });

    column.append("line")
            .attr("x1", -width);

    column.append("text")
            .attr("x", 6)
            .attr("y", x.rangeBand() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .text(function (d, i) {
                return nodes[i].name;
            });


    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
                .data(row.filter(function (d) {
                    return d.z;
                }))
                .enter();
//                    var min = d3.min(cell, function (d) { return d.z; });
//                    var max = d3.max(cell, function (d) { return d.z; });
//                    var max = d3.max(d3.values(function (d) { return z(d.z);})); 
//                    var max = nodes[0].val;
//                     alert ("max : " + max );

        cell.append("rect") /*menambahkan kotak pada cell*/
//          .attr("fill", "white") /* ### warna kotak cell isi jadi putih*/
//          #6600FF, #6633FF, #6666FF, #6699FF, -#6699CC
                .style("fill", "#6699CC") /* ### warna kotak cell isi jadi biru (sama spt atas)*/
                .attr("class", "cell")
                .attr("x", function (d) {
                    return x(d.x);
                }) /*posisi x (kolom), kotak hitam */
                .attr("width", x.rangeBand()) /*lebar kotak hitam pada cell */
                .attr("height", x.rangeBand())
                .on('mouseover', mouseover)
                .on("mouseout", mouseout)
                .style("fill-opacity", function (d) {
//                    alert ("d.z : " + d.z);
//                    alert ("z(d.z) : " + z(d.z));
                    var max = nodes[0].val;
//                   alert ("max : " + max);
//                   alert ("nilai : " + d.z);// z(d.z/max);
                    var a = (d.z / max);
//                   alert ("hasil : " + a);
                    return a;
//                   return d.z;
//                   return z(d.z);
//                   return 0.5 ;
                })  /* *** membuat campuran gradasi warna kotak cell*/
    }



    function rowtext(rowtext) {
        var celltext = d3.select(this).selectAll(".celltext")
                .data(rowtext.filter(function (d) {
                    return d.z;
                }))
                .enter();

        celltext.append("text")
                .style("fill", "white")
                .style("font-size", "12px")
                .attr("class", "cell")  //Coba tambahan
//           .attr("dy", ".35em")
//           .attr("x", "10")
                .attr("x", function (h) {
                    return (x(h.x) + ((x.rangeBand() / 2)));  //++ Center //awalnya minus 5
                }) /*posisi x (kolom), kotak hitam */ //xrange adalah lebah cell satuan 
                .attr("y", x.rangeBand() / 2) //++ Center
                .style("style", "label")
                .style("text-anchor", "middle")
//                .style("alignment-baseline", "middle")
//                .style("baseline-shift", "-24%")
//                .style("dominant-baseline", "central")
                .style("dominant-baseline", "middle")
                .text(function (d) {
//                    return nodes[d.x].group;
//                    return z(d.z);
//                    return d.za;  //keyword
//                    var len = d.z.length;
//                    alert ("len d.z : " + len);
                    return d.z;
                })
//                .style("font-size", function(d) { return Math.min(2 * (x.rangeBand()/2), (2 * x.rangeBand() - 8) / this.getComputedTextLength() * 4) + "px"; })  //Coba automatic font size
                .style("font-size", function (d) {
                    return Math.min(2 * (x.rangeBand() / 2), (2 * x.rangeBand() - 8) / 16 * 4) + "px";
                })  //Automatic font size
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
    }



    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function (d, i) {
            return i == p.y;
        }); //highlight Node kiri
        d3.selectAll(".column text").classed("active", function (d, i) {
            return i == p.x; //highlight Node atas
        });

//        var title = d3.select(this).selectAll(".title").style("font-weight", "bold").style("font-size", "20px");
        d3.select(this).insert("title").text("[{ " + nodes[p.y].name + " -- " + nodes[p.x].name + " }]" + "\n\nKata kunci :\n" + p.zkey);  //x ke samping, y kebawah;
        d3.select(this.parentElement)
                .append("rect")
                .attr("class", "highlight")
                .attr("width", width)
                .attr("height", x.rangeBand());
        d3.select("#col" + p.x)
                .append("rect")
                .attr("class", "highlight")
                .attr("x", -width)
                .attr("width", width)
                .attr("height", x.rangeBand());
    }



    function mouseout(p) {
        d3.selectAll("text").classed("active", false);
        d3.select(this).select("title").remove();
        d3.selectAll(".highlight").remove();
    }
    
    

    var currentOrder = 'name';

    function order(value) {
        var o = orders[value];
        currentOrder = value;

        if (typeof o === "function") {
            orders[value] = o.call();
        }
        x.domain(orders[value]);

        var t = svg.transition().duration(1500);

        t.selectAll(".row")
                .delay(function (d, i) {
                    return x(i) * 4;
                })
                .attr("transform", function (d, i) {
                    return "translate(0," + x(i) + ")";
                })
                .selectAll(".cell")
                .delay(function (d) {
                    return x(d.x) * 4;
                })
                .attr("x", function (d) {
                    return x(d.x);
                });


        t.selectAll(".column")
                .delay(function (d, i) {
                    return x(i) * 4;
                })
                .attr("transform", function (d, i) {
                    return "translate(" + x(i) + ")rotate(-90)";
                });


        t.selectAll(".rowtext")
                .delay(function (d, i) {
                    return x(i) * 4;
                })
                .attr("transform", function (d, i) {
                    return "translate(0," + x(i) + ")";
                })
                .selectAll(".cell") //Ikuti posisi kolomnya bdasarkan cell
                .delay(function (h) {
                    return x(h.x) * 4;
                })
                .attr("x", function (h) {
                    return (x(h.x) + (x.rangeBand() / 2));  //posisi kolom barunya
                });




    }

//    function distance(value) {
//        leafOrder.distance(science.stats.distance[value]);
//
//        if (currentOrder == 'leafOrder') {
//            orders.leafOrder = computeLeaforder;
//            order("leafOrder");
//            //d3.select("#order").property("selectedIndex", 3);
//        } else if (currentOrder == 'leafOrderDist') {
//            orders.leafOrderDist = computeLeaforderDist;
//            order("leafOrderDist");
//            //d3.select("#order").property("selectedIndex", 4);
//        }
//
//        // leafOrder.forEach(function(lo, i) {
//        // 	    nodes[lo].leafOrder = i;
//        // 	});
//        // 	orders.leafOrder = d3.range(n).sort(function(a, b) {
//        // 	    return nodes[b].leafOrder - nodes[a].leafOrder; });
//    }

    matrix.order = order;
//    matrix.distance = distance;

    var timeout = setTimeout(function () {}, 1000);
    matrix.timeout = timeout;

    return matrix;
}


function loadJson(json) {
    var mat = matrix(json);

    d3.select("#order").on("change", function () {
//	clearTimeout(mat.timeout);
        mat.order(this.value);
    });

//    d3.select("#distance").on("change", function () {
////	clearTimeout(mat.timeout);
//        mat.distance(this.value);
//    });
}
