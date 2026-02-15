
import * as d3 from 'd3';
import scrollama from 'scrollama';

// --- ROBUST RESIZEOBSERVER ERROR SUPPRESSION ---
const RO_ERRORS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
  'Script error.'
];

window.addEventListener('error', (e) => {
  if (RO_ERRORS.some(msg => e.message?.includes(msg))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && RO_ERRORS.some(msg => e.reason.message?.includes(msg))) {
    e.preventDefault();
  }
});

// --- DATA ---
const GLOBAL_GAP_DATA = [
  { label: 'Iceland', value: 91.2 },
  { label: 'Norway', value: 87.9 },
  { label: 'United States', value: 82.0 },
  { label: 'Germany', value: 81.7 },
  { label: 'Japan', value: 77.5 },
  { label: 'Korea', value: 68.8 },
];

const LIFETIME_EARNINGS = [
  { year: 22, men: 35000, women: 34000 },
  { year: 30, men: 58000, women: 52000 },
  { year: 40, men: 82000, women: 68000 },
  { year: 50, men: 95000, women: 76000 },
  { year: 60, men: 98000, women: 78000 },
];

const EDUCATION_GAP = [
  { level: 'High School', men: 45000, women: 34000 },
  { level: "Bachelor's", men: 78000, women: 59000 },
  { level: "Master's", men: 95000, women: 72000 },
  { level: "PhD", men: 115000, women: 88000 },
];

const INDUSTRY_GAP = [
  { label: 'Finance', value: 25 },
  { label: 'Tech', value: 18 },
  { label: 'Healthcare', value: 12 },
  { label: 'Education', value: 10 },
  { label: 'Retail', value: 8 },
];

const STORY_STEPS = [
  {
    id: 'intro',
    type: 'intro',
    title: "82 Cents on the Dollar",
    description: "In 2024, the gap remains a structural reality. For every dollar a man takes home, a woman earns roughly 82 cents. This isn't just a static number—it's the baseline of a life-long economic diversion."
  },
  {
    id: 'global',
    type: 'global',
    title: "No Country is Equal",
    description: "Even in the most progressive economies, parity is elusive. While countries like Iceland lead the charge, the average global disparity continues to depress economic potential by trillions."
  },
  {
    id: 'age',
    type: 'age',
    title: "The Divergent Path",
    description: "While careers often begin near parity, life events and systemic biases cause earnings to drift apart over decades. By the time workers reach their peak earning years, the gap has often widened to its greatest extent."
  },
  {
    id: 'education',
    type: 'education',
    title: "Education vs. Income",
    description: "Higher education is often sold as the ultimate equalizer. However, data shows that at every degree level—from high school to PhD—the wage gap persists, and in many cases, the absolute dollar gap increases with education."
  },
  {
    id: 'industry',
    type: 'industry',
    title: "Sector Intensity",
    description: "The gap is not uniform across industries. High-growth sectors like Technology and Finance exhibit significantly higher disparities than more service-oriented fields, often due to 'glass ceilings' in leadership."
  },
  {
    id: 'conclusion',
    type: 'conclusion',
    title: "The Lifetime Deficit",
    description: "The daily cents add up to a monumental loss. Over a 40-year career, an 18% gap results in nearly $1.2 million in lost wealth for the average woman. This missing capital affects retirement, housing, and multi-generational security."
  }
];

// --- COLORS ---
const COLOR_MEN = "#3b82f6";
const COLOR_WOMEN = "#ec4899";
const COLOR_TEXT = "#9ca3af";

// --- VISUALIZATION ENGINE ---
const vizContainer = d3.select("#visualization");
const tooltip = d3.select("#tooltip");

function clearViz() {
  vizContainer.selectAll("*").remove();
  tooltip.style("opacity", 0);
}

function showTooltip(content, event) {
  tooltip.html(content)
    .style("left", (event.clientX + 15) + "px")
    .style("top", (event.clientY - 15) + "px")
    .style("opacity", 1);
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}

function styleAxis(g) {
  g.selectAll("text").attr("fill", COLOR_TEXT).style("font-size", "11px");
  g.selectAll("line").attr("stroke", "#374151");
  g.selectAll(".domain").attr("stroke", "#374151");
}

function getDimensions() {
  const node = vizContainer.node();
  if (!node) return { width: 400, height: 400 };
  const rect = node.getBoundingClientRect();
  const side = Math.min(rect.width, rect.height);
  return {
    width: Math.floor(Math.max(side, 100)),
    height: Math.floor(Math.max(side, 100))
  };
}

function renderIntro() {
  clearViz();
  const { width, height } = getDimensions();
  const svg = vizContainer.append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block")
    .style("margin", "auto");
  
  const radius = Math.min(width / 6, height / 3.5);
  const spacing = radius * 1.3;

  const clipId = "woman-clip";
  svg.append("defs").append("clipPath")
    .attr("id", clipId)
    .append("rect")
    .attr("x", -radius)
    .attr("y", radius)
    .attr("width", radius * 2)
    .attr("height", 0)
    .transition()
    .duration(1500)
    .ease(d3.easeExpOut)
    .attr("y", radius - (radius * 2 * 0.82))
    .attr("height", radius * 2 * 0.82);

  const g = svg.append("g").attr("transform", `translate(${width/2}, ${height/2})`);

  const gMan = g.append("g").attr("transform", `translate(-${spacing}, 0)`);
  gMan.append("circle")
    .attr("r", radius)
    .attr("fill", "#111")
    .attr("stroke", "#333")
    .attr("stroke-dasharray", "4,4");
    
  gMan.append("circle")
    .attr("r", 0)
    .attr("fill", COLOR_MEN)
    .transition()
    .duration(1000)
    .ease(d3.easeElasticOut)
    .attr("r", radius);
    
  gMan.append("text")
    .attr("y", radius + 45)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-weight", "600")
    .style("font-size", `${Math.max(10, radius/5.5)}px`)
    .text("MAN ($1.00)");

  const gWoman = g.append("g").attr("transform", `translate(${spacing}, 0)`);
  gWoman.append("circle")
    .attr("r", radius)
    .attr("fill", "#1a1a1a")
    .attr("stroke", "#333")
    .attr("stroke-dasharray", "4,4");
    
  gWoman.append("circle")
    .attr("r", radius)
    .attr("fill", "transparent")
    .style("cursor", "help")
    .on("mouseover", (e) => showTooltip("<div class='text-pink-400 font-bold mb-1'>Wage Disparity</div>Uncontrolled Gap: <span class='text-red-500 font-black'>-18%</span>", e))
    .on("mousemove", (e) => showTooltip("<div class='text-pink-400 font-bold mb-1'>Wage Disparity</div>Uncontrolled Gap: <span class='text-red-500 font-black'>-18%</span>", e))
    .on("mouseleave", hideTooltip);

  gWoman.append("circle")
    .attr("r", radius)
    .attr("fill", COLOR_WOMEN)
    .attr("clip-path", `url(#${clipId})`)
    .style("pointer-events", "none");
    
  gWoman.append("text")
    .attr("y", radius + 45)
    .attr("text-anchor", "middle")
    .attr("fill", COLOR_WOMEN)
    .style("font-weight", "600")
    .style("font-size", `${Math.max(10, radius/5.5)}px`)
    .text("WOMAN ($0.82)");
}

function renderGlobal() {
  clearViz();
  const { width, height } = getDimensions();
  const margin = { top: 80, right: 80, bottom: 80, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = vizContainer.append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
  const y = d3.scaleBand().domain(GLOBAL_GAP_DATA.map(d => d.label)).range([0, innerHeight]).padding(0.4);

  const xAxis = g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"));
  const yAxis = g.append("g").call(d3.axisLeft(y).tickSize(0));
  styleAxis(xAxis); styleAxis(yAxis);

  g.selectAll("rect").data(GLOBAL_GAP_DATA).enter().append("rect")
    .attr("y", d => y(d.label)).attr("height", y.bandwidth()).attr("fill", COLOR_WOMEN).attr("rx", 6).attr("width", 0)
    .on("mouseover", (e, d) => showTooltip(`<div class='text-pink-400 font-bold'>${d.label}</div>Parity Index: <span class='text-white'>${d.value}%</span>`, e))
    .on("mousemove", (e, d) => showTooltip(`<div class='text-pink-400 font-bold'>${d.label}</div>Parity Index: <span class='text-white'>${d.value}%</span>`, e))
    .on("mouseleave", hideTooltip)
    .transition().duration(1200).ease(d3.easeExpOut).attr("width", d => x(d.value));

  g.selectAll(".label").data(GLOBAL_GAP_DATA).enter().append("text")
    .attr("x", d => x(d.value) + 12).attr("y", d => y(d.label) + y.bandwidth() / 2 + 5)
    .attr("fill", "white").style("font-weight", "600").style("font-size", "12px").text(d => d.value + "%");
}

function renderAge() {
  clearViz();
  const { width, height } = getDimensions();
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = vizContainer.append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([20, 65]).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, 110000]).range([innerHeight, 0]);

  const xAxis = g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d => d + " yrs"));
  const yAxis = g.append("g").call(d3.axisLeft(y).tickFormat(d => "$" + d / 1000 + "k"));
  styleAxis(xAxis); styleAxis(yAxis);

  const line = d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveMonotoneX);
  const menData = LIFETIME_EARNINGS.map(d => ({ year: d.year, value: d.men }));
  const womenData = LIFETIME_EARNINGS.map(d => ({ year: d.year, value: d.women }));

  const pathMen = g.append("path").datum(menData).attr("fill", "none").attr("stroke", COLOR_MEN).attr("stroke-width", 5).attr("stroke-linecap", "round").attr("d", line);
  const pathWomen = g.append("path").datum(womenData).attr("fill", "none").attr("stroke", COLOR_WOMEN).attr("stroke-width", 5).attr("stroke-linecap", "round").attr("d", line);

  [pathMen, pathWomen].forEach(p => {
    const node = p.node();
    if (!node) return;
    const totalLength = node.getTotalLength();
    p.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength)
      .transition().duration(2500).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0);
  });
  g.append("text").attr("x", innerWidth - 60).attr("y", y(105000)).attr("fill", COLOR_MEN).text("Men").style("font-weight", "bold");
  g.append("text").attr("x", innerWidth - 60).attr("y", y(82000)).attr("fill", COLOR_WOMEN).text("Women").style("font-weight", "bold");
}

function renderEducation() {
  clearViz();
  const { width, height } = getDimensions();
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = vizContainer.append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand().domain(EDUCATION_GAP.map(d => d.level)).rangeRound([0, innerWidth]).paddingInner(0.2);
  const x1 = d3.scaleBand().domain(['men', 'women']).rangeRound([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 130000]).rangeRound([innerHeight, 0]);

  const xAxis = g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x0));
  const yAxis = g.append("g").call(d3.axisLeft(y).ticks(5, "s").tickFormat(d => "$" + d/1000 + "k"));
  styleAxis(xAxis); styleAxis(yAxis);

  const bars = g.selectAll(".group").data(EDUCATION_GAP).enter().append("g").attr("transform", d => `translate(${x0(d.level)},0)`);
  
  bars.append("rect").attr("x", x1('men')).attr("y", innerHeight).attr("width", x1.bandwidth()).attr("fill", COLOR_MEN).attr("rx", 4)
    .on("mouseover", (e, d) => showTooltip(`<div class='text-blue-400 font-bold'>${d.level}</div>Men: <span class='text-white'>$${d.men.toLocaleString()}</span>`, e))
    .on("mousemove", (e, d) => showTooltip(`<div class='text-blue-400 font-bold'>${d.level}</div>Men: <span class='text-white'>$${d.men.toLocaleString()}</span>`, e))
    .on("mouseleave", hideTooltip)
    .transition().duration(1000).attr("y", d => y(d.men)).attr("height", d => innerHeight - y(d.men));
    
  bars.append("rect").attr("x", x1('women')).attr("y", innerHeight).attr("width", x1.bandwidth()).attr("fill", COLOR_WOMEN).attr("rx", 4)
    .on("mouseover", (e, d) => showTooltip(`<div class='text-pink-400 font-bold'>${d.level}</div>Women: <span class='text-white'>$${d.women.toLocaleString()}</span>`, e))
    .on("mousemove", (e, d) => showTooltip(`<div class='text-pink-400 font-bold'>${d.level}</div>Women: <span class='text-white'>$${d.women.toLocaleString()}</span>`, e))
    .on("mouseleave", hideTooltip)
    .transition().duration(1000).delay(300).attr("y", d => y(d.women)).attr("height", d => innerHeight - y(d.women));
}

function renderIndustry() {
  clearViz();
  const { width, height } = getDimensions();
  const margin = { top: 100, right: 80, bottom: 80, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = vizContainer.append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 30]).range([0, innerWidth]);
  const y = d3.scaleBand().domain(INDUSTRY_GAP.map(d => d.label)).range([0, innerHeight]).padding(0.3);

  // Use ticks(5) to prevent overlapping labels on the X-axis
  const xAxis = g.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"));
  const yAxis = g.append("g").call(d3.axisLeft(y));
  styleAxis(xAxis); styleAxis(yAxis);

  g.selectAll("rect").data(INDUSTRY_GAP).enter().append("rect").attr("y", d => y(d.label)).attr("height", y.bandwidth()).attr("fill", COLOR_WOMEN).attr("rx", 6).attr("width", 0)
    .on("mouseover", (e, d) => showTooltip(`<div class='text-pink-400 font-bold'>${d.label}</div>Wage Gap: <span class='text-red-400'>${d.value}%</span>`, e))
    .on("mousemove", (e, d) => showTooltip(`<div class='text-pink-400 font-bold'>${d.label}</div>Wage Gap: <span class='text-red-400'>${d.value}%</span>`, e))
    .on("mouseleave", hideTooltip)
    .transition().duration(1500).ease(d3.easeElasticOut.amplitude(1).period(0.6)).attr("width", d => x(d.value));
    
  g.append("text").attr("x", innerWidth / 2).attr("y", -30).attr("text-anchor", "middle").style("font-size", "11px").attr("fill", COLOR_TEXT).style("letter-spacing", "0.1em").text("WAGE GAP INTENSITY BY SECTOR");
}

function renderConclusion() {
  clearViz();
  const { width, height } = getDimensions();
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = vizContainer.append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const data = [
    { label: "Men's Average Earnings", value: 3500000, color: COLOR_MEN },
    { label: "Women's Average Earnings", value: 2870000, color: COLOR_WOMEN }
  ];
  
  const y = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerHeight]).padding(0.5);
  const x = d3.scaleLinear().domain([0, 3500000]).range([0, innerWidth]);

  const missingValue = data[0].value - data[1].value;

  g.append("rect")
    .attr("x", x(data[1].value))
    .attr("y", y(data[1].label))
    .attr("height", y.bandwidth())
    .attr("width", x(data[0].value) - x(data[1].value))
    .attr("fill", "#2d1a24")
    .attr("stroke", "#4b2131")
    .attr("stroke-dasharray", "2,2")
    .attr("rx", 4)
    .style("cursor", "help")
    .style("opacity", 0)
    .on("mouseover", (e) => showTooltip(`<div class='text-red-400 font-bold mb-1'>Missing Wealth</div>Cumulative Deficit: <span class='text-white font-black'>-$${(missingValue/1000000).toFixed(1)}M</span> over a career.`, e))
    .on("mousemove", (e) => showTooltip(`<div class='text-red-400 font-bold mb-1'>Missing Wealth</div>Cumulative Deficit: <span class='text-white font-black'>-$${(missingValue/1000000).toFixed(1)}M</span> over a career.`, e))
    .on("mouseleave", hideTooltip)
    .transition().delay(1000).duration(800)
    .style("opacity", 1);

  g.selectAll(".real-bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "real-bar")
    .attr("x", 0)
    .attr("y", d => y(d.label))
    .attr("height", y.bandwidth())
    .attr("fill", d => d.color)
    .attr("rx", 4)
    .attr("width", 0)
    .transition().duration(2000).ease(d3.easeExpOut)
    .attr("width", d => x(d.value));

  g.selectAll(".wealth-labels")
    .data(data)
    .enter().append("text")
    .attr("x", 0)
    .attr("y", d => y(d.label) - 12)
    .attr("fill", "white")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .text(d => `${d.label}: $${(d.value/1000000).toFixed(2)}M`);

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50)
    .attr("text-anchor", "middle")
    .attr("fill", COLOR_TEXT)
    .style("font-size", "11px")
    .style("letter-spacing", "0.1em")
    .text("ESTIMATED CUMULATIVE LIFETIME EARNINGS (HOVER GAP TO SEE LOSS)");
}

function switchVisualization(type) {
  switch(type) {
    case 'intro': renderIntro(); break;
    case 'global': renderGlobal(); break;
    case 'age': renderAge(); break;
    case 'education': renderEducation(); break;
    case 'industry': renderIndustry(); break;
    case 'conclusion': renderConclusion(); break;
    default: renderIntro();
  }
}

function init() {
  const narrative = document.getElementById('narrative-container');
  if (!narrative) return;

  STORY_STEPS.forEach(step => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'scrollama-step';
    stepDiv.setAttribute('data-step', step.id);
    stepDiv.innerHTML = `
      <div class="p-10 bg-[#151515] rounded-3xl border border-gray-800 shadow-2xl">
        <div class="mb-4 text-indigo-500 font-bold tracking-widest uppercase text-[10px] flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Data Focus: ${step.type}
        </div>
        <h2 class="text-4xl font-bold text-white mb-6 leading-tight">${step.title}</h2>
        <p class="text-lg text-gray-400 leading-relaxed font-light italic">${step.description}</p>
      </div>
    `;
    narrative.appendChild(stepDiv);
  });

  const scroller = scrollama();
  scroller
    .setup({
      step: '.scrollama-step',
      offset: 0.5,
      debug: false
    })
    .onStepEnter((response) => {
      const stepId = response.element.getAttribute('data-step');
      const step = STORY_STEPS.find(s => s.id === stepId);
      response.element.classList.add('is-active');
      if (step) {
        if (vizContainer.attr('data-current') !== stepId) {
          vizContainer.attr('data-current', stepId);
          switchVisualization(step.type);
        }
      }
    })
    .onStepExit((response) => {
      response.element.classList.remove('is-active');
    });

  let resizeTimer;
  window.addEventListener('resize', () => {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      scroller.resize();
      const activeStep = document.querySelector('.scrollama-step.is-active');
      if (activeStep) {
        const stepId = activeStep.getAttribute('data-step');
        const step = STORY_STEPS.find(s => s.id === stepId);
        if (step) switchVisualization(step.type);
      }
    });
  });

  setTimeout(() => {
    scroller.resize();
    switchVisualization('intro');
  }, 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
