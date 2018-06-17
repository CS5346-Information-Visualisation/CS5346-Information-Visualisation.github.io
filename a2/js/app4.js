(function(d3) {
    'use strict';
    var legendProperties = {
        'RectSize': 18,
        'Spacing': 4
    };

    var margin = { top: 50, right: 135, bottom: 50, left: 50 },
        width = 560,
        height = 960,
        buckets = 10;

    var parseDate = d3.utcParse('%Y-%m-%d'),
        dateFormat = d3.timeFormat('%B %Y');

    var xRange = [0, 35, 70, 105, 140, 175, 210, 245, 280, 315, 350, 385, 420, 455, 490, 525];
    var x = d3.scaleOrdinal().range(xRange),
        y = d3.scaleTime().range([height - margin.bottom, 0]),
        z = d3.scaleQuantile().range(d3.schemeRdYlBu[buckets]),
        bisectDate = d3.bisector(function (d) { return d.date; }).left;

    var tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    var svg = d3.select('#task4 svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    d3.csv('data/df2.csv', init, function(error, data) {
        if (error) throw error;

        var xSet = d3.set(data.map(function (d) { return d.category; }));

        x.domain(xSet);
        y.domain(d3.extent(data, function (d) { return d.date; }));
        z.domain([0, d3.max(data, function (d) { return d.success_rate; })]);
        
        var gridSize = Math.floor(width / xSet.values().length);

        svg.append('g')
            .selectAll('text')
            .data(xSet.values())
            .enter()
            .append('text')
            .attr('class', 'categories')
            .attr('x', function (d, i) { return i * width / xSet.values().length ;})
            .attr('y', margin.top)
            .attr('transform', function (d, i) { return 'rotate(-90, ' + ((i * width / xSet.values().length) + Math.ceil(35 / 2)) + ', ' + margin.top + ')'; })
            .text(function(d) { return d; });

        svg.append('g')
            .attr('transform', 'translate(' + 0 + ',' + 85 + ')')
            .call(d3.axisLeft(y));

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'heat')
            .attr('width', gridSize - 1)
            .attr('height', 10)
            .attr('transform', 'translate(' + 1 + ',' + 85 + ')')
            .attr('x', function (d) {
                return x(d.category); 
            })
            .attr('y', function (d) {
                return y(d.date);
            })
            .style('fill', function(d) {
                return z(d.success_rate);
            })
            .style('stroke', function (d) {
                return z(d.success_rate);
            })
            .on('mouseenter', function (d) {
                d3.select(this).raise();
                var y0 = y.invert(d3.mouse(this)[1]),
                    i = bisectDate(data, y0, 1),
                    d0 = data[i - 1],
                    d1 = data[i];
                
                tooltip
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style('top', d3.event.pageY - 80 + 'px')
                    .style('display', 'inline-block')
                    .html(
                        '<strong>' + dateFormat(d0.date) + '</strong>' + '<br/>' +
                        '<strong>' + d.category + ' (' + (d.success_rate * 100).toFixed(2) + '%)' + '</strong>'
                    )
            })
            .on('mouseout', function (d) {
                tooltip.style('display', 'none');
            });

        var legend = svg.selectAll('.legend')
            .data(z.range())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                var height = legendProperties.RectSize + legendProperties.Spacing,
                    offset = height * z.domain.length / 2 - (2 * margin.top),
                    horz = width + legendProperties.RectSize,
                    vert = i * height - offset;

                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendProperties.RectSize)
            .attr('height', legendProperties.RectSize)
            .attr('fill', function(d) {
                return d
            });

        legend.append('text')
            .attr('x', legendProperties.RectSize + legendProperties.Spacing)
            .attr('y', legendProperties.RectSize - legendProperties.Spacing)
            .text(function (d, i) { 
                return "≥ " + (i * 10) + "% and < " + ((i + 1) * 10) + "%"; 
            });
    })

    function init (d) {
        return {
            date: parseDate(d.date_month),
            category: d.category,
            success_rate: +d.success_rate
        }
    }
})(window.d3)