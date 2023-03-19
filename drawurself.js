viewof data = Drawer({
    height: 500,
    width,
    xSamples: width / 60,
    yLabel: "Plot Intensity"
})

function Drawer({
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xSamples = 30, // approximate number of data points
    xType = d3.scaleLinear, // the x-scale type
    xDomain = [0, 30], // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // the y-scale type
    yDomain = [0, 1], // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    curve = d3.curveLinear, // method of interpolation between points
  } = {}) {
    const bisectX = d3.bisector(([x]) => x).center;
    let data = [];
  
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  
    const line = d3.line()
        .curve(curve)
        .defined(([, y]) => y != null)
        .x(([x]) => xScale(x))
        .y(([, y]) => yScale(y));
  
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .property("value", data);
  
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);
  
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    const path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);
    
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged));
  
    function dragstarted() {
      data = xScale.ticks(xSamples).map(x => [x, null]);
      svg.property("value", data);
      path.datum(data);
      dragged.call(this);
    }
  
    function dragged({x, y}) {
      const dx = xScale.invert(x);
      const dy = yScale.invert(y);
      let i = bisectX(data, dx);
      data[i][1] = dy;
      // Fill preceding gaps, if any.
      for (let k = i - 1; k >= 0; --k) {
        if (data[k][1] != null) {
          while (++k < i) data[k][1] = dy;
          break; 
        }
      }
      // Fill following gaps, if any.
      for (let k = i + 1; k < data.length; ++k) {
        if (data[k][1] != null) {
          while (--k > i) data[k][1] = dy;
          break; 
        }
      }
      path.attr("d", line);
      svg.dispatch("input");
    }
  
    return svg.node();
  }