(function (d3) {
    'use strict';
    var currencyFormat = d3.format("$,.0f");

    var legendProperties = {
        'RectSize': 18,
        'Spacing': 4
    };

    var width = 1080,
        height = 960,
        margin = { top: 30, right: 220, bottom: 50, left: 60 };

    var x = d3.scaleLog().range([margin.left, width - margin.right]),
        y = d3.scaleLog().range([height - margin.bottom, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory20),
        s = d3.scaleLinear().range([1, 10]);

    var tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    var svg = d3.select('#task3 svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    d3.csv('data/df3.csv', init, function (error, data) {
        if (error) throw error;

        x.domain(d3.extent(data, function (d) { return d.goal; }));
        y.domain(d3.extent(data, function (d) { return d.pledged; }));
        s.domain(d3.extent(data, function (d) { return d.pledged_per_backer; }));
        
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr('class', 'data')
            .attr("r", function(d) { return s(d.pledged_per_backer); })
            .attr("cx", function(d) { return x(d.goal); })
            .attr("cy", function(d) { return y(d.pledged); })
            .attr("data-category", function (d) { return d.category; })
            .style("fill", function(d) { return z(d.category); })
            .style("stroke", function(d) { return z(d.category); })
            .style("stroke-width", 0)
            .on('mouseenter', function (d) {
                var x0 = x.invert(d3.mouse(this)[0]),
                    y0 = y.invert(d3.mouse(this)[1]);
                    
                tooltip
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style('top', d3.event.pageY - 50 + 'px')
                    .style('display', 'inline-block')
                    .html(
                        'Category: <strong>' + d.category + '</strong><br/>' +
                        'Goal: <strong>' + currencyFormat(d.goal) + '</strong><br/>' +
                        'Pledged: <strong>' + currencyFormat(d.pledged) + '</strong><br/>' +
                        'Average Pledged per Backer: <strong>' + currencyFormat(d.pledged_per_backer) + '</strong><br/>'
                    )

                d3.select(this).style('stroke-width', 4);
            })
            .on('mouseout', function (d) {
                d3.select(this).style('stroke-width', 0);
                tooltip.style('display', 'none');
            });

        svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0'  + ',' + (height - margin.bottom) + ')')
            .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("$.0s")));

        svg.append('g')
            .attr('class', 'axis axis--y')
            .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
            .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("$.0s")));

        var categoryLegend = svg.selectAll('.category-legend')
            .data(z.domain().reverse())
            .enter()
            .append('g')
            .attr('class', 'category-legend-data')
            .attr('transform', function (d, i) {
                var height = legendProperties.RectSize + legendProperties.Spacing,
                    offset = height * z.domain.length / 2 - (2 * margin.top),
                    horz = width - margin.left - margin.right / 2 - 2 * legendProperties.RectSize,
                    vert = i * height - offset;

                return 'translate(' + horz + ',' + vert + ')';
            })
            .on('click', function (d) {
                d3.selectAll('circle.data')
                    .filter(function (x) { return x.category !== d; })
                    .style('opacity', 0.1);

                d3.select(this).selectAll('g > rect').style('stroke-width', 5);
                d3.select(this).selectAll('g > text').style('font-weight', 'bold');
            })
            .on('mouseout', function (d) {
                d3.selectAll("circle")
                    .filter(function (x) { return x.category !== d })
                    .style('opacity', 1);

                d3.select(this).selectAll('g > rect').style('stroke-width', 0);
                d3.select(this).selectAll('g > text').style('font-weight', 'normal');
            });

        categoryLegend.append('rect')
            .attr('width', legendProperties.RectSize)
            .attr('height', legendProperties.RectSize)
            .attr('fill', z)
            .attr('stroke', z);

        categoryLegend.append('text')
            .attr('x', legendProperties.RectSize + legendProperties.Spacing)
            .attr('y', legendProperties.RectSize - legendProperties.Spacing)
            .text(function (d) { return d; });
        
        var sizeLegend = svg.selectAll('.size-legend')
            .data(d3.ticks(1, d3.max(s.domain()), 4))
            .enter()
            .append('g')
            .attr('class', 'size-legend-data')
            .attr('transform', function (d, i) {
                var height = legendProperties.RectSize + legendProperties.Spacing,
                    offset = height * s.domain.length / 2 - (2 * margin.top),
                    horz = width - margin.left - margin.right / 2 - 2 * legendProperties.RectSize,
                    vert = i * height - offset + 400;

                return 'translate(' + horz + ',' + vert + ')';
            });

        d3.select('.size-legend-data')
            .insert('text')
            .attr('class', 'size-legend-title')
            .text('Average Pledged per Backer');

        sizeLegend.append('circle')
            .attr('class', 'size-legend')
            .attr('width', legendProperties.RectSize)
            .attr('height', legendProperties.RectSize)
            .attr('transform', function(d) { return 'translate(' + legendProperties.RectSize / 2 + ',' + legendProperties.RectSize / 2+ ')'})
            .attr('r', function(d) { return s(d); });
        
        sizeLegend.append('text')
            .attr('x', legendProperties.RectSize + legendProperties.Spacing)
            .attr('y', legendProperties.RectSize - legendProperties.Spacing)
            .text(function(d) { return '$' + d; });
   
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Amount Pledged');

        svg.append('text')
            .attr('y', height - margin.bottom / 2)
            .attr('x', width / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Goal');
    });

    function init (d) {
        return {
            'category': d.Category,
            'goal': +d.Goal,
            'pledged': +d.Pledged,
            'pledged_per_backer': +d.pledged_per_backer
        }
    }

})(window.d3)