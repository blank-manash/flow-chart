var $ = go.GraphObject.make;
const DEBUG = true;


var myDiagram = $(go.Diagram, "flowChartOutput", // the ID of the DIV HTML element
    {
        initialContentAlignment: go.Spot.Center, // center the content
        "undoManager.isEnabled": true, // enable undo & redo
        layout: $(go.ForceDirectedLayout,
            {
                defaultSpringLength: 20, // shorter length for the springs
                defaultElectricalCharge: 50, // reduced charge for less repulsion
                maxIterations: 200 // increase iterations for more refinement
            })
    });


myDiagram.nodeTemplate =
    $(go.Node, "Auto",  // Auto panel for automatic sizing
        // Shape with gradient fill and rounded corners
        $(go.Shape, "RoundedRectangle",
            {
                fill: $(go.Brush, "Linear", {0: "white", 1: "#a4c2f4"}),  // Gradient fill
                stroke: "#6a9edf",  // Border color
                strokeWidth: 2  // Border thickness
            },
            new go.Binding("fill", "color")),  // Binding for node color

        // Text block for node's label
        $(go.TextBlock,
            {
                font: "bold 12pt Helvetica, Arial, sans-serif",
                stroke: "#4d4d4d",  // Text color
                margin: 8,  // Margin around text
                editable: true  // Allow text editing
            },
            new go.Binding("text").makeTwoWay())  // Two-way binding for text
    );


function startProgress() {
    document.getElementById('progressIndicator').style.display = 'block';
    var generateButton = document.getElementById('generateButton');
    generateButton.disabled = true;
    generateButton.innerHTML = 'Hold';

}

function stopProgress() {
    document.getElementById('progressIndicator').style.display = 'none';
    var generateButton = document.getElementById('generateButton');
    generateButton.disabled = false;
    generateButton.innerHTML = 'Generate';
}


function generateFlowChart() {
    startProgress();
    var text = document.getElementById('textInput').value;
    getAPIResponse(text).then(apiResponse => {
        if (apiResponse && apiResponse.success) {
            const flowChartData = apiResponse.data;
            myDiagram.model = new go.GraphLinksModel(flowChartData.nodes, flowChartData.links);
            document.getElementById('downloadButton').style.display = 'block';
        } else {
            alert('Invalid API response');
            console.log(apiResponse.data);
        }
        stopProgress();
    });
}

async function getAPIResponse(text) {

    const data = {
        text: text
    };
    const host = DEBUG ? "http://localhost:7071" : "https://daily-mailer.azurewebsites.net";
    const url = `${host}/api/create-flow`

    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Error calling Function API:', error);
        stopProgress();
        return null;
    }

}

function downloadDiagram() {
    // Calculate the bounds of the diagram contents
    var diagramBounds = myDiagram.documentBounds;
    var imgWidth = diagramBounds.width;
    var imgHeight = diagramBounds.height;

    var imgData = myDiagram.makeImage({
        scale: 1,
        background: "white",
        maxSize: new go.Size(imgWidth + 5, imgHeight + 5) // Set the size of the image
    }).src;

    // Create a temporary link element
    var tmpLink = document.createElement('a');
    tmpLink.download = 'flowchart.png'; // set the name of the download file
    tmpLink.href = imgData;

    // Temporarily add link to the body and trigger the download
    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
}


