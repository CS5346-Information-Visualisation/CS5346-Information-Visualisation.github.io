(function (d3) {
    'use strict';
    
    var width = 900,
        height = 560,
        margin = { top: 30, right: 30, bottom: 80, left: 60 };

    var x = d3.scaleBand().range([0, width]).padding(0.1),
        y = d3.scaleLog().range([height - margin.bottom, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory20);

    var tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    var svg = d3.select('#task2 svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    d3.csv('data/df4.csv', init, function (error, data) {
        if (error) throw error;

        x.domain(data.map(function (d) { return d.category; }));
        y.domain(d3.extent(data, function (d) { return d.pct_goal_reached; }));
        z.domain(d3.set(data.map(function (d) { return d.category; })));
        
        svg.append('g')
            .attr("class", "axis axis--x")
            .attr('transform', 'translate(0, ' + height + ')')
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('x', 10)
            .attr('y', 10)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(45)')
            .style("text-anchor", "start");;

        svg.append('g')
            .attr("class", "axis axis--y")
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
            .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function (d) { return x(d.category); })
            .attr('y', function (d) { return y(d.pct_goal_reached); })
            .style('fill', function (d) { return z(d.category); })
            .style('stroke', function (d) { return z(d.category); })
            .attr('width', x.bandwidth())
            .attr('height', function (d) { return height - y(d.pct_goal_reached); })
            .on('mouseover', function (d) {
                tooltip
                    .style('left', d3.event.pageX + 10 + 'px')
                    .style('top', d3.event.pageY - 80 + 'px')
                    .style('display', 'inline-block')
                    .html(
                        'Category: <strong>' + d.category + '</strong>' + '<br/>' +
                        'Average Percentage of Goal Reached: <strong>' + (d.pct_goal_reached * 100).toFixed(2) + '%</strong>'
                    )
            })
            .on('mouseout', function (d) {
                tooltip.style('display', 'none');
            });
    });

    function init(d) {
        return {
            category: d.Category,
            pct_goal_reached: +d.pct_goal_reached
        }
    }
}) (window.d3)