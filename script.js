// const fileNames = ['example.json', 'example2.json', 'example3.json'];

const fileNames = [];
const colors = []

for (let i of [1, 2, 3]) {
    for (let size of [1, 5, 10 ]) {
        for (let temp of [40, 25, 120]) {
            fileNames.push(`json_data/s${i}_${size}_${size}_${temp}C.json`);
            colors.push(getRandomHexColor());
        }
    }

}

function getRandomHexColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// const colors = ["red", "green", "blue", "orange", "purple"]; // Predefined colors
const loadedData = [];

const xMin = -2.0, xMax = 2.0;
const yMin = 1e-16, yMax = 1e11;
const arrowSize = 10;
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d');

var modelParameters = {
    // "is":1e-12,
    "Js0":1e-3,
    "Xti1":3.0,
    "Nj":1.0,

    "Jssw0":1e-6,
    "Xti2":3.0,
    "Njssw":1.0,

    "eta":1.5
    // "a":1e-3,
    // "b":1e-4,
    // "d":1e-5,
    // "alpha":1,
    // "beta":1,
    // "gamma":1
};

function xToCanvas(x){

    return (x - xMin)/(xMax-xMin) * canvas.width;

}

function yToCanvas(y){
    return (1 - (log10(y) - log10(yMin)) / (log10(yMax) - log10(yMin))) * canvas.height;
}


function log10(value) {
    return Math.log(value) / Math.log(10);
}

function drawArrowhead(ctx, x, y, angle, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ddd"; // Light grid color
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";

    // Draw x-axis (linear)
    const xAxisY = yToCanvas(1);
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(0, xAxisY);
    ctx.lineTo(canvas.width, xAxisY);
    ctx.stroke();
    // Draw x-axis arrowhead
    drawArrowhead(ctx, canvas.width - arrowSize, xAxisY, 0, arrowSize);
    drawArrowhead(ctx, arrowSize, xAxisY, -Math.PI, arrowSize  );


    // Draw y-axis (logarithmic)
    const yAxisX = xToCanvas(0);
    ctx.beginPath();
    ctx.moveTo(yAxisX, 0);
    ctx.lineTo(yAxisX, canvas.height);
    ctx.stroke();

    // Draw y-axis arrowhead
    drawArrowhead(ctx, yAxisX, arrowSize, -Math.PI / 2, arrowSize);
    drawArrowhead(ctx, yAxisX, canvas.height - arrowSize, Math.PI/2, arrowSize );

    ctx.strokeStyle = "#ccc"; // Reset stroke color for grid

    // X-axis grid lines and ticks (linear scale)
    for (let x = -1.6; x <= 1.6; x += 0.2) {
        let canvasX = xToCanvas(x);

        // Draw vertical grid lines
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, canvas.height);
        ctx.stroke();

        // Draw x-axis ticks at the bottom
        ctx.beginPath();
        ctx.moveTo(canvasX, canvas.height - 5);
        ctx.lineTo(canvasX, canvas.height);
        ctx.stroke();

        // Write x-axis labels at the bottom
        ctx.fillText(x.toFixed(1), canvasX - 10, canvas.height - 10);
    }

    // Y-axis grid lines and ticks (log scale)
    for (let y = 1e-15; y <= 1e10; y *= 10) {
        let canvasY = yToCanvas(y);

        // Draw horizontal grid lines
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(canvas.width, canvasY);
        ctx.stroke();

        // Draw y-axis ticks on the left
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(5, canvasY);
        ctx.stroke();

        // Write y-axis labels on the left edge
        ctx.fillText(`1E${Math.round(log10(y))}`, 10, canvasY + 5);
    }
}

drawGrid();


async function loadJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function calculateError(jsonData){
    const predictedY = jsonData.x.map(x => model(jsonData.instanceVariables, modelParameters, x));

    function calculateRMSEPercentage( yActual, yPredicted) {
        if (!yPredicted || !yActual || yPredicted.length !== yActual.length || yPredicted.length === 0) {
          return NaN; // Handle invalid input
        }
        if(yActual < 1e-15){
            return 0;
        }
      
        const n = yPredicted.length;
        let squaredErrorSum = 0;
        let actualSum = 0;
      
        for (let i = 0; i < n; i++) {
          const error = yPredicted[i] - yActual[i];
          squaredErrorSum += error * error;
          actualSum += yActual[i];
        }
      
        const mse = squaredErrorSum / n;
        const rmse = Math.sqrt(mse);
      
        if (actualSum === 0) {
          return rmse === 0 ? 0 : Infinity; // Avoid division by zero, handle special cases.
        }
      
        const meanActual = actualSum / n;
        const rmsePercentage = (rmse / meanActual) * 100;
      
        return rmsePercentage;
      }



    return calculateRMSEPercentage(jsonData.y, predictedY).toFixed(3);
}
function updateErrors() {
    loadedData.forEach(data => {
        if (data.errorElement) {
            data.errorElement.innerText = `${calculateError(data)} %`;
        }
    });
}

async function loadFiles() {
    const filesContainer = document.getElementById('files');
    filesContainer.innerHTML = ""; // Clear previous entries

    for (let i = 0; i < fileNames.length; i++) {
        const file = fileNames[i];
        const color = colors[i % colors.length];

        // Load JSON file
        const jsonData = await loadJSON(file);
        if (!jsonData) continue;

        jsonData.color = color;
        jsonData.checked = true;
        loadedData.push(jsonData);

        // Create file entry div
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("file-entry");

        // Create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.addEventListener("change", updateGraph);
        jsonData.checkbox = checkbox;

        // Create color box
        const colorBox = document.createElement("div");
        colorBox.classList.add("color-box");
        colorBox.style.backgroundColor = color;

        // Create file name span
        const fileNameSpan = document.createElement("span");
        fileNameSpan.classList.add("file-name");
        fileNameSpan.innerText = file.split('/')[1].split('.')[0];

        // Create error span
        const errorSpan = document.createElement("span");
        errorSpan.classList.add("error-metric");
        errorSpan.innerText = `Error: ${calculateError(jsonData)}`;

        jsonData.errorElement = errorSpan; // Store reference for updates

        // Append elements
        fileDiv.appendChild(checkbox);
        fileDiv.appendChild(colorBox);
        fileDiv.appendChild(fileNameSpan);
        fileDiv.appendChild(errorSpan);
        filesContainer.appendChild(fileDiv);
    }

    const spans = document.querySelectorAll(".error-metric");
    spans.forEach(span => {
        if(parseFloat(span.innerText) < 10){
            span.style.backgroundColor = "rgba(144, 238, 144, 0.5)"; // Light green
        }
        else if(parseFloat(span.innerText) < 100){
            span.style.backgroundColor = "rgba((211, 84, 0, 1)" // Burnt Orange
        }
    });

    updateGraph(); // Initial plot
}


function plotData(xArray, yArray, color) {
    ctx.fillStyle = color;
    
    for (let i = 0; i < xArray.length; i++) {
        let xCanvas = xToCanvas(xArray[i]);
        let yCanvas = yToCanvas(yArray[i]);

        ctx.beginPath();
        ctx.arc(xCanvas, yCanvas, 2, 0, 2 * Math.PI); // Draw small circles
        ctx.fill();
    }
}

function plotLine(xArray, yArray, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < xArray.length; i++) {
        let xCanvas = xToCanvas(xArray[i]);
        let yCanvas = yToCanvas(yArray[i]);

        if (i === 0) {
            ctx.moveTo(xCanvas, yCanvas);
        } else {
            ctx.lineTo(xCanvas, yCanvas);
        }
    }
    ctx.stroke();
}


function predictedPoints(instanceParameters, modelParameters){
    const xValues = [], yValues = [];
    for(let x = -1.5; x<=1.5; x += 0.02 ){
        xValues.push(x);
        yValues.push( model(instanceParameters, modelParameters, x) );
    }
    return {
        "x":xValues,
        "y":yValues
    };
}

function plotLines(loadedData, modelParameters){
    for(let i = 0; i<fileNames.length; i++){
        var pointsToPlot = predictedPoints(loadedData[i].instanceVariables, modelParameters);

        plotLine(pointsToPlot.x, pointsToPlot.y, loadedData[i].color);
    }
}


loadFiles().then(()=>{
    plotLines(loadedData, modelParameters);
})

function createSlider(param, min = 1e-8, max = 1e-2) {
    const container = document.createElement("div");
    container.classList.add("slider-container");
    
    const label = document.createElement("div");
    label.classList.add("slider-label");
    
    const minInput = document.createElement("input");
    minInput.type = "number";
    minInput.value = min;
    
    const maxInput = document.createElement("input");
    maxInput.type = "number";
    maxInput.value = max;
    
    const nameLabel = document.createElement("span");
    nameLabel.innerText = param;
    
    label.appendChild(minInput);
    label.appendChild(nameLabel);
    label.appendChild(maxInput);
    
    const slider = document.createElement("input");
    slider.type = "range";
    
    // Convert min and max to logarithmic scale
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    
    slider.min = logMin;
    slider.max = logMax;
    slider.step = (logMax - logMin) / 100;
    slider.value = Math.log10(modelParameters[param]); // Convert current value to log scale
    
    const valueInput = document.createElement("input");
    valueInput.type = "number";
    valueInput.value = modelParameters[param];

    slider.oninput = () => {
        valueInput.value = Math.pow(10, slider.value); // Convert log scale back to linear
        modelParameters[param] = parseFloat(valueInput.value);
        updateGraph();
        updateErrors();
    };
    
    valueInput.onchange = () => {
        let val = parseFloat(valueInput.value);
        if (val < min) val = min;
        if (val > max) val = max;
        slider.value = Math.log10(val);
        modelParameters[param] = val;
        updateGraph();
        updateErrors();
    };
    
    minInput.onchange = () => {
        const newMin = parseFloat(minInput.value);
        slider.min = Math.log10(newMin);
        slider.step = (slider.max - slider.min) / 100;
    };
    
    maxInput.onchange = () => {
        const newMax = parseFloat(maxInput.value);
        slider.max = Math.log10(newMax);
        slider.step = (slider.max - slider.min) / 100;
    };
    
    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(valueInput);
    slidersDiv.appendChild(container);
}


function updateGraph() {
    // console.log("Updating graph with", modelParameters);
    // // Call plot function here

    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // drawGrid();

    // for(let i=0; i<fileNames.length; i++){
        
    //     plotData(loadedData[i].x, loadedData[i].y, colors[i]);
    // }

    

    // plotLines(loadedData, modelParameters);



    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawGrid(); // Redraw grid

    // Plot only selected files
    loadedData.forEach(data => {
        if (data.checkbox.checked) {
            plotData(data.x, data.y, data.color);
            let pointsToPlot = predictedPoints(data.instanceVariables, modelParameters);
            plotLine(pointsToPlot.x, pointsToPlot.y, data.color);
        }
    });

    const spans = document.querySelectorAll(".error-metric");
    spans.forEach(span => {
        if(parseFloat(span.innerText) < 10){
            span.style.backgroundColor = "rgba(144, 238, 144, 0.5)"; // Light green
        }
        else if(parseFloat(span.innerText) < 100){
            span.style.backgroundColor = "rgba((211, 84, 0, 1)" // Burnt Orange
        }
    });

    updateErrors();


}



for (const param in modelParameters) {
    createSlider(param);
}