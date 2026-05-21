const diagramOutput = document.getElementById("diagram-output");
const diagramZoom = document.getElementById("diagram-zoom");
const diagramContainer = document.getElementById("diagram-container");
const zoomInput = document.getElementById("zoom");
const zoomValue = document.getElementById("zoom-value");
const fitButton = document.getElementById("fit-button");
const downloadButton = document.getElementById("download-button");
const statusEl = document.getElementById("status");

let currentScale = Number(zoomInput.value);
let currentSvg = null;

function updateZoomDisplay() {
  zoomValue.textContent = `${Math.round(currentScale * 100)}%`;
}

function applyZoom(scale) {
  currentScale = scale;
  diagramZoom.style.transform = `scale(${currentScale})`;
  zoomInput.value = String(currentScale);
  updateZoomDisplay();
}

function fitToWidth() {
  if (!currentSvg) return;
  const viewBox = currentSvg.viewBox.baseVal;
  const svgWidth = viewBox && viewBox.width ? viewBox.width : currentSvg.getBoundingClientRect().width;
  const padding = 32;
  const available = Math.max(320, diagramContainer.clientWidth - padding);
  const nextScale = Math.min(1.2, Math.max(0.5, available / svgWidth));
  applyZoom(Number(nextScale.toFixed(2)));
}

function downloadSvg() {
  if (!currentSvg) return;
  const serializer = new XMLSerializer();
  const svgContent = serializer.serializeToString(currentSvg);
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "careerforge-er-diagram.svg";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function renderDiagram() {
  statusEl.textContent = "Rendering diagram...";

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "base",
    themeVariables: {
      primaryColor: "#f8fafc",
      primaryTextColor: "#0f172a",
      primaryBorderColor: "#38bdf8",
      lineColor: "#94a3b8",
      secondaryColor: "#fbbf24",
      tertiaryColor: "#e2e8f0",
      fontFamily: "IBM Plex Mono",
    },
    er: {
      layoutDirection: "LR",
      useMaxWidth: true,
    },
  });

  try {
    const response = await fetch("diagram.mmd");
    const text = await response.text();
    const { svg, bindFunctions } = await mermaid.render("careerforge-er", text);

    diagramOutput.innerHTML = svg;
    if (bindFunctions) bindFunctions(diagramOutput);

    currentSvg = diagramOutput.querySelector("svg");
    if (currentSvg) {
      currentSvg.setAttribute("aria-label", "CareerForge AI ER diagram");
    }

    fitToWidth();
    statusEl.textContent = "Ready";
  } catch (error) {
    statusEl.textContent = "Failed to render diagram.";
    console.error(error);
  }
}

zoomInput.addEventListener("input", (event) => {
  const value = Number(event.target.value);
  applyZoom(value);
});

fitButton.addEventListener("click", fitToWidth);

downloadButton.addEventListener("click", downloadSvg);

window.addEventListener("resize", () => {
  if (!currentSvg) return;
  fitToWidth();
});

updateZoomDisplay();
renderDiagram();
