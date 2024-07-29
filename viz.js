// Define margins of graph for axes
const margin = {
    top: 50,
    right: 60,
    bottom: 50,
    left: 60,
  },
  width = 1560 - margin.left - margin.right,
  packingHeight = 550 - margin.top - margin.bottom,
  lineGraphHeight = 800 - margin.top - margin.bottom;

// Fetch elements used throughout file
const timelapseBtn = document.querySelector("#sales-timelapse-btn");
const explorationBtn = document.querySelector("#data-exploration-btn");
const sidebar = document.querySelector(".sidebar");
const title = document.querySelector("#primary-visualization-title");
const introDataExplanation = document.querySelector("#intro-data-explanation");
const explorationDataExplanation = document.querySelector(
  "#exploration-data-explanation"
);
const genreFilter = document.querySelector("#genre-filter");
const publisherFilter = document.querySelector("#publisher-filter");
const developerFilter = document.querySelector("#developer-filter");
const platformFilter = document.querySelector("#platform-filter");
const showWorldEventsAnnotationsInput = document.querySelector(
  "#show-world-events-input"
);

const tooltip = d3.select("main").append("div").attr("class", "tooltip");

// Initialization of data and setting up landing page (timelapse)
Promise.resolve(d3.csv("data/vgsales.csv")).then((data) => {
  const filteredData = data.filter((d) => {
    return !Object.values(d).some((value) => value == "N/A");
  });

  const svg = d3.select("body").select(".viz-svg");
  const yearSliderWrapper = document.querySelector("#year-range").parentElement;

  timelapseBtn.addEventListener("click", (event) => {
    yearSliderWrapper.classList.remove("year-slider-wrapper--hidden");
    setupTimelapse(svg, filteredData);
  });

  explorationBtn.addEventListener("click", (event) => {
    yearSliderWrapper.classList.add("year-slider-wrapper--hidden");
    setupExploration(svg, filteredData, true);
  });

  setupTimelapse(svg, filteredData);
  explorationBtn.click();
});

function setupTimelapse(svg, filteredData) {
  clearSVGContent();
  setupFilters(filteredData);

  sidebar.classList.add("sidebar--hidden");
  introDataExplanation.classList.remove("data-explanation--hidden");
  explorationDataExplanation.classList.add("data-explanation--hidden");

  title.innerHTML = "Timelapse of Sales Over Time by Region";

  const yearSlider = document.querySelector("#year-range");
  svg
    .attr("width", "100%")
    .attr("height", packingHeight)
    .attr("viewBox", `0, 0, ${width}, ${packingHeight}`);

  // Default year for packing bubbles animation
  let currYear = 1980;
  yearSlider.min = 1980;
  yearSlider.max = 2016;
  yearSlider.value = currYear;

  yearSlider.addEventListener("input", (e) =>
    handleYearRangeInput(e.currentTarget.value)
  );

  const areaScale = d3
    .scaleSqrt()
    .domain([
      d3.min(filteredData, (d) => [
        Math.min(
          d.Global_Sales,
          d.NA_Sales,
          d.EU_Sales,
          d.JP_Sales,
          d.Other_Sales
        ),
      ]),
      d3.max(filteredData, (d) => [
        Math.max(
          d.Global_Sales,
          d.NA_Sales,
          d.EU_Sales,
          d.JP_Sales,
          d.Other_Sales
        ),
      ]),
    ])
    .range([30, 40]);

  handleYearRangeInput(currYear);

  function handleYearRangeInput(year) {
    const yearInputLabel = document.querySelector("#year-range-label");
    if (yearInputLabel) {
      yearInputLabel.innerHTML = `Sales in ${year}`;
    }
    const data = updateYearData(year);
    renderBubblePack(data);
  }

  function updateYearData(year) {
    clearSVGContent();
    const filteredYearData = filteredData.filter((d) => {
      return d.Year_of_Release == year;
    });

    return [...d3.group(filteredYearData, (d) => +d.Year_of_Release)].map(
      ([year, items]) => ({
        year,
        globalSales: d3.sum(items, (d) => d.Global_Sales),
        NASales: d3.sum(items, (d) => d.NA_Sales),
        EUSales: d3.sum(items, (d) => d.EU_Sales),
        JPSales: d3.sum(items, (d) => d.JP_Sales),
        otherSales: d3.sum(items, (d) => d.Other_Sales),
      })
    )[0];
  }

  function renderBubblePack(data) {
    // Bubble for Global Sales
    svg
      .append("circle")
      .datum(data)
      .attr("class", "sales-bubble-global")
      .attr("cx", "35%")
      .attr("cy", "35%")
      .attr("r", (d) => {
        return areaScale(+d.globalSales) * 1;
      })
      .on("mouseover", function (event, d) {
        tooltip
          .html(`Region: Global<br>Sales: ${d.globalSales.toFixed(2)}M`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    let globalSalesLabel = `${data.globalSales.toFixed(2)}M`;
    svg
      .append("text")
      .datum(data)
      .text(globalSalesLabel)
      .attr("class", "sales-bubble-text")
      .attr("x", "35%")
      .attr("y", "36%");

    // Bubble for North America Sales
    svg
      .append("circle")
      .datum(data)
      .attr("class", "sales-bubble-NA")
      .attr("cx", "50%")
      .attr("cy", "25%")
      .attr("r", (d) => {
        return areaScale(+d.NASales) * 1;
      })
      .on("mouseover", function (event, d) {
        tooltip
          .html(`Region: North America <br>Sales: ${d.NASales.toFixed(2)}M`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    let NASalesLabel = `${data.NASales.toFixed(2)}M`;
    svg
      .append("text")
      .datum(data)
      .text(NASalesLabel)
      .attr("class", "sales-bubble-text")
      .attr("x", "50%")
      .attr("y", "26%");

    // Bubble for Europe Sales
    svg
      .append("circle")
      .datum(data)
      .attr("class", "sales-bubble-EU")
      .attr("cx", "45%")
      .attr("cy", "65%")
      .attr("r", (d) => {
        return areaScale(+d.EUSales) * 1;
      })
      .on("mouseover", function (event, d) {
        tooltip
          .html(`Region: Europe<br>Sales: ${d.EUSales.toFixed(2)}M`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    let EUSalesLabel = `${data.EUSales.toFixed(2)}M`;
    svg
      .append("text")
      .datum(data)
      .text(EUSalesLabel)
      .attr("class", "sales-bubble-text")
      .attr("x", "45%")
      .attr("y", "66%");

    // Bubble for Japan Sales
    svg
      .append("circle")
      .datum(data)
      .attr("class", "sales-bubble-JP")
      .attr("cx", "55%")
      .attr("cy", "70%")
      .attr("r", (d) => {
        return areaScale(+d.JPSales) * 1;
      })
      .on("mouseover", function (event, d) {
        tooltip
          .html(`Region: Japan<br>Sales: ${d.JPSales.toFixed(2)}M`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    let JPSalesLabel = `${data.JPSales.toFixed(2)}M`;
    svg
      .append("text")
      .datum(data)
      .text(JPSalesLabel)
      .attr("class", "sales-bubble-text")
      .attr("x", "55%")
      .attr("y", "71%");

    // Bubble for Other Sales
    svg
      .append("circle")
      .datum(data)
      .attr("class", "sales-bubble-other")
      .attr("cx", "60%")
      .attr("cy", "45%")
      .attr("r", (d) => {
        return areaScale(+d.otherSales) * 1;
      })
      .on("mouseover", function (event, d) {
        tooltip
          .html(`Region: Other<br>Sales: ${d.otherSales.toFixed(2)}M`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    let OtherSalesLabel = `${data.otherSales.toFixed(2)}M`;
    svg
      .append("text")
      .datum(data)
      .text(OtherSalesLabel)
      .attr("class", "sales-bubble-text")
      .attr("x", "60%")
      .attr("y", "46%");

    setupLegend(svg);
  }
}

function setupExploration(svg, data, resetFilters) {
  clearSVGContent();
  setupLegend(svg);

  if (resetFilters) {
    setupFilters(data);
  }
  filteredData = filterData(data);

  sidebar.classList.remove("sidebar--hidden");
  introDataExplanation.classList.add("data-explanation--hidden");
  explorationDataExplanation.classList.remove("data-explanation--hidden");
  title.innerHTML = "Sales Over Time by Region";

  genreFilter.addEventListener("change", (e) => {
    setupExploration(svg, data, false);
  });

  platformFilter.addEventListener("change", (e) => {
    setupExploration(svg, data, false);
  });

  publisherFilter.addEventListener("change", (e) => {
    setupExploration(svg, data, false);
  });
  developerFilter.addEventListener("change", (e) => {
    setupExploration(svg, data, false);
  });

  // For initial line graph - group by year and get sum of global sales
  let dataByYears = [...d3.group(filteredData, (d) => +d.Year_of_Release)].map(
    ([year, items]) => ({
      year,
      globalSales: d3.sum(items, (d) => d.Global_Sales),
      NASales: d3.sum(items, (d) => d.NA_Sales),
      EUSales: d3.sum(items, (d) => d.EU_Sales),
      JPSales: d3.sum(items, (d) => d.JP_Sales),
      otherSales: d3.sum(items, (d) => d.Other_Sales),
    })
  );

  // Sort in order of years to ensure line doesn't jump around
  dataByYears.sort((a, b) => {
    return d3.ascending(a.year, b.year);
  });

  // Scale the x-axis (Year_of_Release)
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataByYears, (d) => d.year),
      d3.max(dataByYears, (d) => d.year),
    ])
    .range([margin.left, width - margin.left]);

  // Scale the y-axis (Global_Sales since it's the sum of all other sales)
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataByYears, (d) => d.globalSales)])
    .range([lineGraphHeight - margin.top, margin.bottom]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  svg
    .attr("width", "100%")
    .attr("height", lineGraphHeight)
    .attr("viewBox", `0, 0, ${width}, ${lineGraphHeight}`)
    .append("g")
    .attr("transform", `translate(0,${lineGraphHeight - margin.bottom})`)
    .attr("class", "x-axis")
    .call(xAxis);

  // Create the y-axis
  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("class", "y-axis")
    .call(yAxis);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - lineGraphHeight / 2)
    .attr("dy", "1.25rem")
    .style("text-anchor", "middle")
    .text("Sales (Millions)");
  svg
    .append("text")
    .attr("y", lineGraphHeight - margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1.25rem")
    .style("text-anchor", "middle")
    .text("Year");

  // Add the line of sales over time
  svg
    .append("path")
    .datum(dataByYears)
    .attr("class", "line-graph-path line-graph-path-global")
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return xScale(+d.year);
        })
        .y((d) => {
          return yScale(+d.globalSales);
        })
    );

  // Add dots for tooltip + drilling down
  svg
    .selectAll(".line-graph-path,.line-graph-path-global")
    .data(dataByYears)
    .enter()
    .append("circle")
    .attr("class", "dot dot-global")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.globalSales))
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      event.currentTarget.setAttribute("r", 7);
      tooltip
        .html(`Global Sales: ${d.globalSales.toFixed(2)}<br>Year: ${d.year}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", (event) => {
      event.currentTarget.setAttribute("r", 5);
      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      tooltip.style("opacity", 0);
      setupYearDrillDown(svg, data, d.year, "Global", true);
    });

  // North America Line
  svg
    .append("path")
    .datum(dataByYears)
    .attr("class", "line-graph-path line-graph-path-NA")
    .attr("fill", "none")
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return xScale(+d.year);
        })
        .y((d) => {
          return yScale(+d.NASales);
        })
    );

  svg
    .selectAll(".line-graph-path,.line-graph-path-NA")
    .data(dataByYears)
    .enter()
    .append("circle")
    .attr("class", "dot dot-NA")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.NASales))
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      event.currentTarget.setAttribute("r", 7);
      tooltip
        .html(`NA Sales: ${d.NASales.toFixed(2)}<br>Year: ${d.year}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", (event) => {
      event.currentTarget.setAttribute("r", 5);
      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      tooltip.style("opacity", 0);
      setupYearDrillDown(svg, data, d.year, "North America", true);
    })
    .exit();

  // Europe Line
  svg
    .append("path")
    .datum(dataByYears)
    .attr("class", "line-graph-path line-graph-path-EU")
    .attr("fill", "none")
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return xScale(+d.year);
        })
        .y((d) => {
          return yScale(+d.EUSales);
        })
    );

  svg
    .selectAll(".line-graph-path,.line-graph-path-EU")
    .data(dataByYears)
    .enter()
    .append("circle")
    .attr("class", "dot dot-EU")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.EUSales))
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      event.currentTarget.setAttribute("r", 7);
      tooltip
        .html(`EU Sales: ${d.EUSales.toFixed(2)}<br>Year: ${d.year}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", (event) => {
      event.currentTarget.setAttribute("r", 5);
      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      tooltip.style("opacity", 0);
      setupYearDrillDown(svg, data, d.year, "Europe", true);
    })
    .exit();

  // Japan Line
  svg
    .append("path")
    .datum(dataByYears)
    .attr("class", "line-graph-path line-graph-path-JP")
    .attr("fill", "none")
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return xScale(+d.year);
        })
        .y((d) => {
          return yScale(+d.JPSales);
        })
    );

  svg
    .selectAll(".line-graph-path,.line-graph-path-JP")
    .data(dataByYears)
    .enter()
    .append("circle")
    .attr("class", "dot dot-JP")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.JPSales))
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      event.currentTarget.setAttribute("r", 7);
      tooltip
        .html(`JP Sales: ${d.JPSales.toFixed(2)}<br>Year: ${d.year}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", (event) => {
      event.currentTarget.setAttribute("r", 5);
      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      tooltip.style("opacity", 0);
      setupYearDrillDown(svg, data, d.year, "Japan", true);
    })
    .exit();

  // Other Line
  svg
    .append("path")
    .datum(dataByYears)
    .attr("class", "line-graph-path line-graph-path-other")
    .attr("fill", "none")
    .attr(
      "d",
      d3
        .line()
        .x((d) => {
          return xScale(+d.year);
        })
        .y((d) => {
          return yScale(+d.otherSales);
        })
    );

  svg
    .selectAll(".line-graph-path,.line-graph-path-other")
    .data(dataByYears)
    .enter()
    .append("circle")
    .attr("class", "dot dot-other")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", (d) => yScale(d.otherSales))
    .attr("r", 5)
    .on("mouseover", function (event, d) {
      event.currentTarget.setAttribute("r", 7);
      tooltip
        .html(`Other Sales: ${d.otherSales.toFixed(2)}<br>Year: ${d.year}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", (event) => {
      event.currentTarget.setAttribute("r", 5);
      tooltip.style("opacity", 0);
    })
    .on("click", function (event, d) {
      tooltip.style("opacity", 0);
      setupYearDrillDown(svg, data, d.year, "Other", true);
    })
    .exit();

  // Create annotations of platforms released above their appropriate years
  const selectedPlatformAnnotationType = document.querySelector(
    "input[name='platform-annotations']:checked"
  );

  if (
    selectedPlatformAnnotationType &&
    selectedPlatformAnnotationType.value !== "none" &&
    filteredData === data
  ) {
    setupPlatformAnnotations(
      data,
      dataByYears,
      svg,
      xScale,
      yScale,
      selectedPlatformAnnotationType.value == "major"
    );
  }

  if (showWorldEventsAnnotationsInput.checked && filteredData === data) {
    setupWorldEventsAnnotations(dataByYears, svg, xScale, yScale);
  }

  const platformAnnotationTypeInputs = document.querySelectorAll(
    "input[name='platform-annotations']"
  );

  platformAnnotationTypeInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      setupExploration(svg, data, false);
    });
  });

  showWorldEventsAnnotationsInput.addEventListener("change", (e) => {
    setupExploration(svg, data, false);
  });
}

// Graph of platform performance in that year
async function setupYearDrillDown(svg, data, year, region, resetFilters) {
  clearSVGContent();
  title.innerHTML = `${region} Sales by Platform (${year})`;

  genreFilter.addEventListener("change", (e) => {
    setupYearDrillDown(svg, data, year, region, false);
  });

  platformFilter.addEventListener("change", (e) => {
    setupYearDrillDown(svg, data, year, region, false);
  });

  publisherFilter.addEventListener("change", (e) => {
    setupYearDrillDown(svg, data, year, region, false);
  });
  developerFilter.addEventListener("change", (e) => {
    setupYearDrillDown(svg, data, year, region, false);
  });

  let filteredData = data.filter((d) => {
    return d.Year_of_Release == year;
  });

  if (resetFilters) {
    setupFilters(filteredData);
  }

  filteredData = filterData(filteredData);

  let dataByPlatform = [...d3.group(filteredData, (d) => d.Platform)].map(
    ([platform, items]) => ({
      platform,
      // sales: d3.sum(items, (d) => d.Global_Sales),
      sales: (region) => {
        switch (region) {
          case "Global":
            return d3.sum(items, (d) => d.Global_Sales);
          case "North America":
            return d3.sum(items, (d) => d.NA_Sales);
          case "Europe":
            return d3.sum(items, (d) => d.EU_Sales);
          case "Japan":
            return d3.sum(items, (d) => d.JP_Sales);
          case "Japan":
            return d3.sum(items, (d) => d.Other);
          default:
            return null;
        }
      },
    })
  );

  // Sort in order of sales - just to make it look nice
  dataByPlatform.sort((a, b) => {
    return d3.descending(a.sales(region), b.sales(region));
  });
  // Scale the x-axis (year)
  const xScale = d3
    .scaleBand()
    .domain(
      dataByPlatform.map((d) => {
        return d.platform;
      })
    )
    .range([margin.left, width - margin.left])
    .align(0.5)
    .padding(0.3);

  // Scale the y-axis (sales)
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataByPlatform, (d) => d.sales(region))])
    .range([lineGraphHeight - margin.top, margin.bottom]);

  const xAxis = d3.axisBottom(xScale);

  svg
    .attr("width", "100%")
    .attr("height", lineGraphHeight)
    .attr("viewBox", `0, 0, ${width}, ${lineGraphHeight}`)
    .append("g")
    .attr("transform", `translate(0,${lineGraphHeight - margin.bottom})`)
    .attr("class", "x-axis")
    .call(xAxis);

  // Create the y-axis
  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("class", "y-axis")
    .call(yAxis);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - lineGraphHeight / 2)
    .attr("dy", "1.25rem")
    .style("text-anchor", "middle")
    .text("Sales (Millions)");
  svg
    .append("text")
    .attr("y", lineGraphHeight - margin.bottom / 2)
    .attr("x", width / 2)
    .attr("dy", "1.25rem")
    .style("text-anchor", "middle")
    .text("Platform");

  svg
    .selectAll("rect")
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .data(dataByPlatform)
    .enter()
    .append("rect")
    .attr("class", `bar-${region.toLowerCase().replace(" ", "-")}`)
    .attr("width", xScale.bandwidth() - 10)
    .attr("height", (d) => {
      return lineGraphHeight - margin.bottom - yScale(d.sales(region));
    })
    .attr("x", (d) => {
      return xScale(d.platform);
    })
    .attr("y", (d) => {
      return yScale(d.sales(region));
    })
    .on("mouseover", function (event, d) {
      tooltip
        .html(`Sales: ${d.sales(region).toFixed(2)}M`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
}

// Clear SVG contents
function clearSVGContent() {
  const svgElement = document.querySelector(".viz-svg");
  if (svgElement) {
    svgElement.innerHTML = "";
  }
}

// Render legend of regions colors
function setupLegend(svg) {
  svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${width - margin.left - margin.right},  ${
        (packingHeight - margin.bottom - margin.top) / 2
      })`
    );
  const legend = svg.select(".legend");

  const regionsLabels = ["Global", "North America", "Europe", "Japan", "Other"];

  regionsLabels.forEach((value, index) => {
    legend
      .append("circle")
      .attr("class", `legend-${value.toLowerCase().replace(" ", "-")}`)
      .attr("cx", 0)
      .attr("cy", 40 * (0.5 * index))
      .attr("r", 5);
    legend
      .append("text")
      .attr("x", 10)
      .attr("y", 6 + 40 * (0.5 * index))
      .style("text-anchor", "start")
      .text(value);
  });
}

// Get options for each filter type and populate select elements
function setupFilters(data) {
  // Clear all filters first to avoid duplicate options
  genreFilter.innerHTML = "";
  platformFilter.innerHTML = "";
  publisherFilter.innerHTML = "";
  developerFilter.innerHTML = "";

  const genres = [
    "All",
    ...new Set(data.map((element) => element.Genre ?? null)),
  ];
  const platforms = [
    "All",
    ...new Set(data.map((element) => element.Platform ?? null)),
  ];
  const publishers = [
    "All",
    ...new Set(data.map((element) => element.Publisher ?? null)),
  ];
  const developers = [
    "All",
    ...new Set(data.map((element) => element.Developer ?? null)),
  ];

  genres.forEach((genre) => {
    const newOption = document.createElement("option");
    newOption.text = genre;
    newOption.value = genre;
    genreFilter.add(newOption);
  });

  platforms.forEach((platform) => {
    const newOption = document.createElement("option");
    newOption.text = platform;
    newOption.value = platform;
    platformFilter.add(newOption);
  });

  publishers.forEach((publisher) => {
    const newOption = document.createElement("option");
    newOption.text = publisher;
    newOption.value = publisher;
    publisherFilter.add(newOption);
  });

  developers.forEach((developer) => {
    const newOption = document.createElement("option");
    newOption.text = developer;
    newOption.value = developer;
    developerFilter.add(newOption);
  });
}

// Get currently selected filters and return data matching filters
function filterData(data) {
  const selectedGenre = genreFilter.value;
  const selectedPlatform = platformFilter.value;
  const selectedPublisher = publisherFilter.value;
  const selectedDeveloper = developerFilter.value;

  let filteredData = data;

  if (selectedGenre !== "All") {
    filteredData = filteredData.filter((d) => {
      return d.Genre == selectedGenre;
    });
  }

  if (selectedPlatform !== "All") {
    filteredData = filteredData.filter((d) => {
      return d.Platform == selectedPlatform;
    });
  }

  if (selectedPublisher !== "All") {
    filteredData = filteredData.filter((d) => {
      return d.Publisher == selectedPublisher;
    });
  }

  if (selectedDeveloper !== "All") {
    filteredData = filteredData.filter((d) => {
      return d.Developer == selectedDeveloper;
    });
  }

  return filteredData;
}

function setupPlatformAnnotations(
  data,
  dataByYears,
  svg,
  xScale,
  yScale,
  useMajorPlatforms
) {
  const platformReleaseYears = getPlatformReleaseYears(data, useMajorPlatforms);

  const globalSalesByYear = {};
  dataByYears.forEach((element) => {
    globalSalesByYear[element.year] = element.globalSales;
  });

  // define offsets for the line connecting annotations and annotations themselves
  const lineX2 = [
    50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 40, 0, -20, 0, 40, 40, 20, 40,
  ];
  const lineY2 = [
    60, 100, 120, 75, 110, 185, 100, 225, 320, 60, 135, 60, 85, 75, 80, 120,
    -50, 20, -50, 25,
  ];
  const tagX2 = [
    10, -40, -40, -40, -40, -40, -40, -40, -40, -40, -40, -25, 40, -40, -60,
    -40, 0, 40, -10, 40,
  ];
  const tagY2 = [
    100, 140, 160, 100, 150, 210, 140, 280, 360, 100, 160, 100, 100, 100, 120,
    160, -50, 40, -50, 50,
  ];

  // Use when filtering for major platforms
  const majorPlatformLineX2 = [0, 0, 0, 0, -30, -20, 50, -40, 40, 45, 30];
  const majorPlatformLineY2 = [60, 85, 135, 60, 75, 90, -40, 60, 60, 60, 20];
  const majorPlatformX2 = [-40, -40, -40, -40, -80, -75, 10, -80, 40, 10, 30];
  const majorPlatformY2 = [100, 125, 175, 100, 130, 130, -40, 100, 80, 100, 40];

  svg.select(".annotations").html(null).remove();
  const annotationsGroup = svg.append("g").attr("class", "annotations");

  Object.keys(platformReleaseYears).forEach((year, index) => {
    annotationsGroup
      .append("foreignObject")
      .attr("width", 80)
      .attr("height", 80)
      .attr("x", () => {
        return (
          xScale(year) +
          (useMajorPlatforms ? majorPlatformX2[index] : tagX2[index])
        );
      })
      .attr("y", () => {
        return (
          yScale(globalSalesByYear[year]) -
          (useMajorPlatforms ? majorPlatformY2[index] : tagY2[index])
        );
      })
      .html(() => {
        return `<div class="annotation">${platformReleaseYears[year]} Released</div>`;
      });
  });
  Object.keys(platformReleaseYears).forEach((year, index) => {
    annotationsGroup
      .append("line")
      .attr("x1", xScale(year))
      .attr("y1", yScale(globalSalesByYear[year]))
      .attr(
        "x2",
        xScale(year) +
          (useMajorPlatforms ? majorPlatformLineX2[index] : lineX2[index])
      )
      .attr(
        "y2",
        yScale(globalSalesByYear[year]) -
          (useMajorPlatforms ? majorPlatformLineY2[index] : lineY2[index])
      )
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  });
}

function getPlatformReleaseYears(data, majorPlatformsOnly) {
  let platforms = [...new Set(data.map((element) => element.Platform ?? null))];

  const majorPlatforms = [
    "NES",
    "SNES",
    "GB",
    "GBA",
    "GC",
    "PS",
    "Wii",
    "PS2",
    "XBOX 360",
    "WiiU",
    "PSP",
    "3DS",
    "XB",
    "PS3",
    "PS4",
    "PSV",
    "XOne",
  ];

  if (majorPlatformsOnly) {
    platforms = platforms.filter((platform) =>
      majorPlatforms.includes(platform)
    );
  }

  const platformReleaseYears = {};

  platforms.forEach((platform) => {
    const filteredDataByPlatform = data.filter(
      (element) => element.Platform === platform
    );
    const minYear = d3.min(filteredDataByPlatform, (d) => +d.Year_of_Release);
    if (platformReleaseYears[minYear] == null) {
      platformReleaseYears[minYear] = platform;
    } else {
      platformReleaseYears[
        minYear
      ] = `${platformReleaseYears[minYear]}, ${platform}`;
    }
  });

  return platformReleaseYears;
}

function setupWorldEventsAnnotations(data, svg, xScale, yScale) {
  const annotations = [
    {
      title: "Video Game Graph of 1983",
      label:
        "The video game industry entered a recession in 1983 due to a multitude of factors, including growing buzz over personal computers and lacking quality of current video games (made evident by the infamous E.T for the Atary 2600",
      xPositionYear: 1983,
      xPositionOffset: -40,
      yPositionOffset: 400,
    },
    {
      title: "The Great Recession of 2008",
      label:
        "Mass layoffs in 2008 due to risky lending practice by banks, especially in the housing market, impacted the ability of families to spend",
      xPositionYear: 2008,
      xPositionOffset: 120,
      yPositionOffset: 0,
    },
  ];

  const globalSalesByYear = {};
  data.forEach((element) => {
    globalSalesByYear[element.year] = element.globalSales;
  });

  svg.select(".world-annotations").html("").remove();
  const group = svg.append("g").attr("class", "world-annotations");

  const lineX2 = [95, 0];
  const lineY2 = [-145, -60];

  annotations.forEach((annotation, index) => {
    group
      .append("foreignObject")
      .attr("width", 200)
      .attr("height", 200)
      .attr("x", xScale(annotation.xPositionYear) + annotation.xPositionOffset)
      .attr(
        "y",
        yScale(globalSalesByYear[annotation.xPositionYear]) -
          annotation.yPositionOffset
      )
      .html(
        `<div class='annotation'><strong>${annotation.title}</strong><br>${annotation.label}`
      );
    group
      .append("line")
      .attr("x1", xScale(annotation.xPositionYear))
      .attr("y1", yScale(globalSalesByYear[annotation.xPositionYear]))
      .attr(
        "x2",
        xScale(annotation.xPositionYear) +
          annotation.xPositionOffset +
          lineX2[index]
      )
      .attr(
        "y2",
        yScale(globalSalesByYear[annotation.xPositionYear]) -
          annotation.yPositionOffset -
          lineY2[index]
      )
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  });
}
