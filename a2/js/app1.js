(function (d3) {
    'use strict';

    var legendProperties = {
        'RectSize': 18,
        'Spacing': 4
    };

    var svg = d3.select('#task1 svg'),
        margin = { top: 20, right: 130, bottom: 30, left: 50 },
        width = svg.attr('width') - margin.left - margin.right,
        height = svg.attr('height') - margin.top - margin.bottom;

    var parseDate = d3.utcParse('%Y-%m-%d'),
        dateFormat = d3.timeFormat('%B %Y'),
        bisectDate = d3.bisector(function (d) { return d.date; }).left;

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory20);

    var tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    var stack = d3.stack();

    var area = d3.area()
        .x(function (d, i) { return x(d.data.date); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); });

    var g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv('data/df1.csv', type, function (error, data) {
        if (error) throw error;

        var keys = data.columns.slice(1);

        x.domain(d3.extent(data, function (d) { return d.date; }));
        z.domain(keys);
        stack.keys(keys);
        
        var layer = g.selectAll('.layer')
            .data(stack(data))
            .enter().append('g')
            .attr('class', 'layer')
            .on('mousemove', function (d) {
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i];

                tooltip
                    .style('left', d3.event.pageX - 50 + 'px')
                    .style('top', d3.event.pageY - 70 + 'px')
                    .style('display', 'inline-block')
                    .html(
                    '<strong>' + dateFormat(d0.date) + '</strong>' + '<br/>' +
                    '<strong>' + d.key + '</strong>' + ' (' + (d0[d.key] * 100).toFixed(2) + '%)'
                    )
            })
            .on('mouseout', function (d) {
                tooltip.style('display', 'none');
            });

        layer.append('path')
            .attr('class', 'area')
            .style('fill', function (d) { return z(d.key); })
            .attr('d', area);

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y).ticks(10, '%'));

        var legend = svg.selectAll('.legend')
            .data(z.domain().reverse())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                var height = legendProperties.RectSize + legendProperties.Spacing,
                    offset = height * z.domain.length / 2 - (2 * margin.top),
                    horz = svg.attr('width') - margin.right + margin.left - 2 * legendProperties.RectSize,
                    vert = i * height - offset;

                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendProperties.RectSize)
            .attr('height', legendProperties.RectSize)
            .attr('fill', z)
            .attr('stroke', z);

        legend.append('text')
            .attr('x', legendProperties.RectSize + legendProperties.Spacing)
            .attr('y', legendProperties.RectSize - legendProperties.Spacing)
            .text(function (d) { return d; });
    });

    function type(d, i, columns) {
        d.date = parseDate(d.date_month);
        for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = d[columns[i]] / 100;
        return d;
    }
})(window.d3);