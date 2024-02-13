const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

// Add event listener for paste event - copy image from clipboard
document.addEventListener('paste', handlePaste, false);

let img = new Image();
let rect = {}, drag = false;
let scaleFactor;
let scaleX, scaleY;

let drawingMode = 'rectangle'; // Could be 'rectangle', 'line1', 'line2', 'line3', or 'line4'
let lines = {
    line1: { points: [], color: 'blue' },
    line2: { points: [], color: 'green' },
    line3: { points: [], color: 'purple' },
    line4: { points: [], color: 'orange' }
};

let line_sd_opp = {
	line2: { points: [], color: 'green' }
}


function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        img.onload = () => {
            scaleFactor = Math.min(1, 600 / img.width);
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Adjust input div height
            document.getElementById('ylimdiv').style.height = `${canvas.height}px`;


            // Resetting values when a new image is loaded
            rect = {};
            lines = { line1: { points: [], color: 'blue' }, line2: { points: [], color: 'green' }, line3: { points: [], color: 'purple' }, line4: { points: [], color: 'orange' } };
			line_sd_opp = { line2: { points: [], color: 'green' }};
            scaleX = scaleY = undefined;
            document.getElementById('info').innerHTML = '';
            document.getElementById('lowerX').value = '';
            document.getElementById('upperX').value = '';
            document.getElementById('upperY').value = '';
            document.getElementById('lowerY').value = '';
            document.getElementById('maxYScale').value = '';
            document.getElementById('traceLine').style.backgroundColor = 'white';
            document.getElementById('traceLine2').style.backgroundColor = 'white';
            document.getElementById('traceLine3').style.backgroundColor = 'white';
            document.getElementById('traceLine4').style.backgroundColor = 'white';
            document.getElementById('redrawRectangle').style.backgroundColor = 'white';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

// Handle paste event
function handlePaste(e) {
    if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                loadFile(file);
                break; // Break the loop once an image is found and loaded
            }
        }
    }
}

function loadFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        img.onload = () => {
            scaleFactor = Math.min(1, 600 / img.width);
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Adjust input div height
            document.getElementById('ylimdiv').style.height = `${canvas.height}px`;

            // Resetting values when a new image is loaded
            resetDrawingState();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function resetDrawingState() {
    rect = {};
    lines = { line1: { points: [], color: 'blue' }, line2: { points: [], color: 'green' }, line3: { points: [], color: 'purple' }, line4: { points: [], color: 'orange' } };
    line_sd_opp = { line2: { points: [], color: 'green' }};
    scaleX = scaleY = undefined;
    clearInfoDisplays();
}









function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / scaleFactor,
        y: (evt.clientY - rect.top) / scaleFactor
    };
}

function mouseDown(e) {
    /*
    if (drawingMode === 'rectangle') {
        rect.startX = (e.pageX - canvas.offsetLeft) / scaleFactor;
        rect.startY = (e.pageY - canvas.offsetTop) / scaleFactor;
        drag = true;
    } else if (drawingMode.startsWith('line')) {
        const newPoint = {
            x: (e.pageX - canvas.offsetLeft) / scaleFactor,
            y: (e.pageY - canvas.offsetTop) / scaleFactor
        };
        lines[drawingMode].points.push(newPoint);
        draw();
    }
    */
    
    const pos = getMousePos(canvas, e);
    if (drawingMode === 'rectangle') {
        rect.startX = pos.x;
        rect.startY = pos.y;
        drag = true;
    } else if (drawingMode.startsWith('line')) {
        lines[drawingMode].points.push(pos);
        draw();
    }

}

function mouseUp() {
    drag = false;
    updateScale();
}

function mouseMove(e) {
    /*
    if (drag) {
        if (drawingMode === 'rectangle') {
            rect.w = (e.pageX - canvas.offsetLeft) / scaleFactor - rect.startX;
            rect.h = (e.pageY - canvas.offsetTop) / scaleFactor - rect.startY;
        }
        draw();
    }
    updateMouseInfo(e);
    */
    if (!drag) return;
    const pos = getMousePos(canvas, e);
    if (drawingMode === 'rectangle') {
        rect.w = pos.x - rect.startX;
        rect.h = pos.y - rect.startY;
        draw();
    }
    updateMouseInfo(pos);
}


function updateMouseInfo(pos) {
    /*
    const rawX = (e.pageX - canvas.offsetLeft) / scaleFactor;
    const rawY = (e.pageY - canvas.offsetTop) / scaleFactor;
    let transformedX = 0;
    let transformedY = 0;

    if (rect.w !== undefined && rect.h !== undefined && areLimitsDefined()) {
        const transformedX = ((rawX - rect.startX) * scaleX) + parseFloat(document.getElementById('lowerX').value);
        const transformedY = ((rawY - rect.startY) * scaleY) + parseFloat(document.getElementById('upperY').value);

        document.getElementById('info').innerHTML = `Raw Coordinates: (${rawX.toFixed(2)}, ${rawY.toFixed(2)}) | Transformed Coordinates: (${transformedX.toFixed(2)}, ${transformedY.toFixed(2)})`;
    } else {
        document.getElementById('info').innerHTML = `Raw Coordinates: (${rawX.toFixed(2)}, ${rawY.toFixed(2)})`;
    }
    */

    let transformedX = 0;
    let transformedY = 0;

    if (rect.w !== undefined && rect.h !== undefined && areLimitsDefined()) {
        
        transformedX = (pos.x - rect.startX) * scaleX + parseFloat(document.getElementById('lowerX').value);
        //transformedY = (pos.y - rect.startY) * scaleY + parseFloat(document.getElementById('lowerY').value);
        transformedY = parseFloat(document.getElementById('upperY').value) - (pos.y - rect.startY) * scaleY;

        document.getElementById('info').innerHTML = `Raw Coordinates: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
        document.getElementById('inforect').innerHTML = `Rectangle Start (X, Y): (${rect.startX.toFixed(2)}, ${rect.startY.toFixed(2)})`;
        document.getElementById('infosize').innerHTML = `Rectangle (Width, Height): (${rect.w.toFixed(2)}, ${rect.h.toFixed(2)})`;
        document.getElementById('infoscale').innerHTML = `Scale (X,Y): (${scaleX}, ${scaleY})`;
        document.getElementById('infolower').innerHTML = `Lower Limits (X,Y): (${document.getElementById('lowerX').value}, ${document.getElementById('lowerY').value})`;
        document.getElementById('infoupper').innerHTML = `Upper Limits (X,Y): (${document.getElementById('upperX').value}, ${document.getElementById('upperY').value})`;
        document.getElementById('infotrans').innerHTML = `Transformed Coordinates: (${transformedX.toFixed(2)}, ${transformedY.toFixed(2)})`;
    } else {
        document.getElementById('info').innerHTML = `Raw Coordinates: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
    }

}

function updateScale() {
    const lowerX = parseFloat(document.getElementById('lowerX').value);
    const upperX = parseFloat(document.getElementById('upperX').value);
    const lowerY = parseFloat(document.getElementById('lowerY').value);
    const upperY = parseFloat(document.getElementById('upperY').value);

    if (rect.w !== 0 && rect.h !== 0) {
        scaleX = (upperX - lowerX) / rect.w;
        scaleY = (upperY - lowerY) / rect.h;
    }
}

function areLimitsDefined() {
    return document.getElementById('lowerX').value !== '' &&
           document.getElementById('upperX').value !== '' &&
           document.getElementById('upperY').value !== '' &&
           document.getElementById('lowerY').value !== '';
}





function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (rect.w !== undefined && rect.h !== undefined) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(rect.startX * scaleFactor, rect.startY * scaleFactor, rect.w * scaleFactor, rect.h * scaleFactor);
    }

    Object.entries(lines).forEach(([lineKey, lineData]) => {
        if (lineData.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(lineData.points[0].x * scaleFactor, lineData.points[0].y * scaleFactor);
            for (let i = 1; i < lineData.points.length; i++) {
                ctx.lineTo(lineData.points[i].x * scaleFactor, lineData.points[i].y * scaleFactor);
            }
            ctx.strokeStyle = lineData.color;
            ctx.stroke();
        }
    });
}

canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mousemove', function(e) {
    // MJBA replace e with pos...
    let pos = getMousePos(canvas, e);
    updateMouseInfo(pos);
});
canvas.addEventListener('mousemove', mouseMove, false);


function sbtnCol(buttonId, color) {
    document.getElementById('traceLine').style.backgroundColor = 'white';
    document.getElementById('traceLine2').style.backgroundColor = 'white';
    document.getElementById('traceLine3').style.backgroundColor = 'white';
    document.getElementById('traceLine4').style.backgroundColor = 'white';
    document.getElementById('redrawRectangle').style.backgroundColor = 'white';
    var button = document.getElementById(buttonId);
    if (button) {
        button.style.backgroundColor = color;
    }
}


document.getElementById('traceLine').addEventListener('click', function() {
    sbtnCol('traceLine', 'blue');
    drawingMode = 'line1';
    lines.line1.points = [];
});

document.getElementById('traceLine2').addEventListener('click', function() {
    sbtnCol('traceLine2', 'green');
    drawingMode = 'line2';
    lines.line2.points = [];
});

document.getElementById('traceLine3').addEventListener('click', function() {
    sbtnCol('traceLine3', 'purple');
    drawingMode = 'line3';
    lines.line3.points = [];
});

document.getElementById('traceLine4').addEventListener('click', function() {
    sbtnCol('traceLine4', 'orange');
    drawingMode = 'line4';
    lines.line4.points = [];
});

document.getElementById('redrawRectangle').addEventListener('click', function() {
    sbtnCol('redrawRectangle', 'red');
    drawingMode = 'rectangle';
});


document.getElementById('getData').addEventListener('click', function() {
    generateDataTable();
});

function generateDataTable() {
    const dataBody = document.getElementById('dataBody');
    dataBody.innerHTML = ''; // Clear existing data

    if (lines.line1.points.length > 0 && areLimitsDefined()) {
        lines.line1.points.forEach((point, index) => {
            
            // old
            //const transformedX = (point.x * scaleX) + parseFloat(document.getElementById('lowerX').value);
            //const transformedY = (point.y * scaleY) + parseFloat(document.getElementById('upperY').value);

            const transformedX = (point.x - rect.startX) * scaleX + parseFloat(document.getElementById('lowerX').value);
			const transformedY = parseFloat(document.getElementById('upperY').value) - (point.y - rect.startY) * scaleY;

            const row = dataBody.insertRow();

            // Insert x axis value
            row.insertCell(0).innerHTML = transformedX.toFixed(2);

            let final_y_value = transformedY;
            
            // Determine if scale should be adjusted based on radio button input
            const radios = document.getElementsByName('ypctscale');
            let radioselect = '';
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    radioselect = radios[i].value;
                    break; // No need to look at the other radio buttons
                }
            }

            // Determine if y axis should be scaled to max response
            const maxYScale = document.getElementById('maxYScale').value;
            if(maxYScale != '') {
                if(maxYScale > 0) {
                    if(final_y_value > 0) {
                        final_y_value = final_y_value / maxYScale;
                        if(radioselect == '100') {
                            // else will handle below.
                            final_y_value = final_y_value * 100;
                        }
                    }
                }
            }

            if(radioselect == '1') {
                // y axis scale is zero to 1 need to multiply by 100
                final_y_value = final_y_value * 100;
            }

            // Determine if response value is above 100 or below 0 and fix
            if(final_y_value > 100) {
                final_y_value = 100;
            }
            if(final_y_value < 0) {
                final_y_value = 0;
            }


            row.insertCell(1).innerHTML = final_y_value.toFixed(2);

			// Intersecting values for other lines
            ['line2', 'line3', 'line4'].forEach((lineKey, i) => {
                let refval = true;
                let intersectY = 0;
				let transformedIntersectY = 0;
                
                // no overlap for SD - assume zero
                if(lines[lineKey].points.length == 0 && lineKey == 'line2') {
                    transformedIntersectY = 0;
                    refval = false;
                }
                // no lower limit - assume equal to mean
                if(lines[lineKey].points.length == 0 && lineKey == 'line3') {
                    transformedIntersectY = transformedY;
                    refval = false;
                }
                // no upper limit - assume equal to mean
                if(lines[lineKey].points.length == 0 && lineKey == 'line4') {
                    transformedIntersectY = transformedY;
                    refval = false;
                }
                // Value has data
                if(refval) {
                    
					// Get value for SD, lower and upper
					// Find intersecting point
					intersectY = findYIntersection(point.x, lines[lineKey].points);
					// Transform to new coordinate syste,
					transformedIntersectY = transformCoordinate(intersectY, 'y');
					
					// Mean value reference
					let ymean = transformedY;
					
					// Determine if x is out of range
					let xrange = [];
					for(let o in lines[lineKey].points) {
					    xrange.push(lines[lineKey].points[o].x);
					}
					
					if(point.x < Math.min(...xrange)) {
						transformedIntersectY = ymean;
					}
					if(point.x > Math.max(...xrange)) {
						transformedIntersectY = ymean;
					}
					
					
					// Ensure lower limit isn't greater than mean
					// Recall html canvas yscale is reversed < > need to be reversed here
                    if(ymean < transformedIntersectY && lineKey == 'line3') {
                        transformedIntersectY = ymean;
                    }
                    // Ensure upper limit isn't loeer than mean
                    if(ymean > transformedIntersectY && lineKey == 'line4') {
                        transformedIntersectY = ymean;
                    }
					
					// If SD take the difference from the mean
					if(lineKey == 'line2') {
                        transformedIntersectY = Math.abs(transformedY - transformedIntersectY);
                    }
					
                }

                let nfinal_y_value = transformedIntersectY;
                
                // Determine if y axis should be scaled to max response
                const maxYScale = document.getElementById('maxYScale').value;
                if(maxYScale != '') {
                    if(maxYScale > 0) {
                            if(nfinal_y_value > 0) {
                                nfinal_y_value = nfinal_y_value / maxYScale;
                                if(radioselect == '100') {
                                    nfinal_y_value = nfinal_y_value * 100;
                                }
                            }
                    }
                }
                
                if(radioselect == '1') {
                    // y axis scale is zero to 1 need to multiply by 100
                    nfinal_y_value = nfinal_y_value * 100;
                }

                // Determine if response value is above 100 or below 0 and fix
                if(lineKey != 'line2') { /// dont' adjust for big sd
                    if(nfinal_y_value > 100) {
                        nfinal_y_value = 100;
                    }
                    if(nfinal_y_value < 0) {
                        nfinal_y_value = 0;
                    }
                }

                    
                row.insertCell(2 + i).innerHTML = nfinal_y_value.toFixed(2);

            });
			
			
        });
    }
}

function findYIntersection(x, points) {
    // Simplest case: find the closest point on the x-axis and use its y-value
    let closestPoint = points.reduce((prev, curr) => 
        (Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev)
    );
    return closestPoint.y; // Note: This is a simplification
}

function transformCoordinate(value, axis) {
    const lowerLimit = parseFloat(document.getElementById(`lower${axis.toUpperCase()}`).value);
    const upperLimit = parseFloat(document.getElementById(`upper${axis.toUpperCase()}`).value);
    
    //const scale = axis === 'x' ? scaleX : scaleY;
    //return (value * scale) + upperLimit;

    let newvalue = 0;
    if(axis === 'x') {
        newvalue = (value - rect.startX) * scaleX + lowerLimit;
    }
    if(axis === 'y') {
        newvalue = upperLimit - (value - rect.startY) * scaleY;
    }

    return (newvalue);

}


document.getElementById('exportCsv').addEventListener('click', function() {
    exportTableToCSV('sr_curve.csv');
});

function exportTableToCSV(filename) {
    
	const dataBody = document.getElementById('dataBody');
    let csvContent = "data:text/csv;charset=utf-8,";

    // Headers
    csvContent += "Stressor (X),Mean System Capacity (%),SD,low.limit,up.limit\r\n";

    // Table rows
    for (let i = 0; i < dataBody.rows.length; i++) {
        let row = [], cols = dataBody.rows[i].cells;

        for (let j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }

        csvContent += row.join(",") + "\r\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for Firefox

    link.click(); // This will download the file
    document.body.removeChild(link);
}


const magnifyingCanvas = document.getElementById('magnifyingCanvas');
const magnifyingCtx = magnifyingCanvas.getContext('2d');
const magnificationFactor = 3;
const magnifierSize = 100; // Size of the magnifier area

canvas.addEventListener('mousemove', function(e) {
    updateMagnifier(e);
});

function updateMagnifier(e) {
    const canvasBounds = canvas.getBoundingClientRect();
    const mx = e.clientX - canvasBounds.left;
    const my = e.clientY - canvasBounds.top;

    // Clear the magnifying canvas
    magnifyingCtx.clearRect(0, 0, magnifyingCanvas.width, magnifyingCanvas.height);

    // Draw the magnified area
    magnifyingCtx.drawImage(canvas, 
        mx - magnifierSize / (2 * magnificationFactor), 
        my - magnifierSize / (2 * magnificationFactor), 
        magnifierSize / magnificationFactor, 
        magnifierSize / magnificationFactor, 
        0, 0, 
        magnifyingCanvas.width, 
        magnifyingCanvas.height);

    // Draw crosshairs
    drawCrosshairs(magnifyingCtx, magnifyingCanvas.width, magnifyingCanvas.height);

    // Optional: Draw a circle to mimic a magnifying glass
    magnifyingCtx.beginPath();
    magnifyingCtx.arc(magnifyingCanvas.width / 2, magnifyingCanvas.height / 2, magnifyingCanvas.width / 2, 0, Math.PI * 2);
    magnifyingCtx.strokeStyle = "black";
    magnifyingCtx.stroke();
}

function drawCrosshairs(ctx, width, height) {
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = 'grey'; // Crosshair color
    ctx.stroke();
}