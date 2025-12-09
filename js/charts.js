// Charts and visualization functionality
const CHART_CONFIG = {
    pointRadius: 6,
    pointColor: 'rgba(102, 126, 234, 0.8)',
    lineColor: 'rgba(118, 75, 162, 1)',
    hoverPointRadius: 9,
    hoverPointColor: 'rgba(255, 100, 100, 1)'
};

function initCharts() {
    drawScatterPlot('ratingVsInt', 'passer_rating', 'int', 'Passer Rating', 'Interceptions', 'tooltipInt');
    drawScatterPlot('ratingVsTd', 'passer_rating', 'td', 'Passer Rating', 'Touchdowns', 'tooltipTd');
    drawScatterPlot('ratingVsCmp', 'passer_rating', 'cmp_pct', 'Passer Rating', 'Completion %', 'tooltipCmp');
}

function drawScatterPlot(canvasId, xDataKey, yDataKey, xLabel, yLabel, tooltipId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth - 30;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    // Calculate scale factors and offsets
    const padding = 60;
    const xValues = qbData.map(d => d[xDataKey]);
    const yValues = qbData.map(d => d[yDataKey]);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    
    // Helper functions to convert data to canvas coordinates
    function dataToCanvasX(value) {
        return padding + ((value - xMin) / xRange) * plotWidth;
    }
    
    function dataToCanvasY(value) {
        return height - padding - ((value - yMin) / yRange) * plotHeight;
    }
    
    // Draw axes
    drawAxes(ctx, width, height, padding, xMin, xMax, yMin, yMax, xLabel, yLabel);
    
    // Calculate best fit line
    const lineData = calculateBestFitLine(xValues, yValues, dataToCanvasX, dataToCanvasY);
    
    // Draw best fit line
    if (lineData && lineData.x1 !== lineData.x2) {
        ctx.strokeStyle = CHART_CONFIG.lineColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lineData.x1, lineData.y1);
        ctx.lineTo(lineData.x2, lineData.y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw data points
    const tooltip = document.getElementById(tooltipId);
    const points = [];
    
    qbData.forEach((dataPoint, index) => {
        const xPos = dataToCanvasX(dataPoint[xDataKey]);
        const yPos = dataToCanvasY(dataPoint[yDataKey]);
        
        points.push({
            x: xPos,
            y: yPos,
            data: dataPoint,
            index: index
        });
        
        ctx.fillStyle = CHART_CONFIG.pointColor;
        ctx.beginPath();
        ctx.arc(xPos, yPos, CHART_CONFIG.pointRadius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Add interactivity
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        let hoveredPoint = null;
        let minDistance = 15;
        
        // Redraw canvas without hover highlight
        ctx.clearRect(0, 0, width, height);
        drawAxes(ctx, width, height, padding, xMin, xMax, yMin, yMax, xLabel, yLabel);
        
        // Draw best fit line again
        if (lineData && lineData.x1 !== lineData.x2) {
            ctx.strokeStyle = CHART_CONFIG.lineColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(lineData.x1, lineData.y1);
            ctx.lineTo(lineData.x2, lineData.y2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Check for hovered point and redraw all points
        points.forEach(point => {
            const distance = Math.sqrt(
                Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
            );
            
            if (distance < minDistance) {
                hoveredPoint = point;
                minDistance = distance;
            }
            
            ctx.fillStyle = CHART_CONFIG.pointColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, CHART_CONFIG.pointRadius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw hovered point with highlight
        if (hoveredPoint) {
            ctx.fillStyle = CHART_CONFIG.hoverPointColor;
            ctx.beginPath();
            ctx.arc(hoveredPoint.x, hoveredPoint.y, CHART_CONFIG.hoverPointRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Show tooltip
            const tooltipText = formatTooltip(hoveredPoint.data, xDataKey, yDataKey);
            tooltip.innerHTML = tooltipText;
            tooltip.classList.add('visible');
            
            // Position tooltip
            const tooltipX = hoveredPoint.x + 10;
            const tooltipY = hoveredPoint.y - 40;
            tooltip.style.left = tooltipX + 'px';
            tooltip.style.top = tooltipY + 'px';
        } else {
            tooltip.classList.remove('visible');
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
        
        // Redraw without hover
        ctx.clearRect(0, 0, width, height);
        drawAxes(ctx, width, height, padding, xMin, xMax, yMin, yMax, xLabel, yLabel);
        
        if (lineData && lineData.x1 !== lineData.x2) {
            ctx.strokeStyle = CHART_CONFIG.lineColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(lineData.x1, lineData.y1);
            ctx.lineTo(lineData.x2, lineData.y2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        points.forEach(point => {
            ctx.fillStyle = CHART_CONFIG.pointColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, CHART_CONFIG.pointRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

function drawAxes(ctx, width, height, padding, xMin, xMax, yMin, yMax, xLabel, yLabel) {
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText(xLabel, width / 2, height - 20);
    
    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
    
    // Draw tick marks and values
    const xTicks = 5;
    const yTicks = 5;
    
    for (let i = 0; i <= xTicks; i++) {
        const x = padding + (i / xTicks) * (width - padding * 2);
        const value = xMin + (i / xTicks) * (xMax - xMin);
        
        ctx.beginPath();
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, height - padding + 5);
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(1), x, height - padding + 20);
    }
    
    ctx.textAlign = 'right';
    for (let i = 0; i <= yTicks; i++) {
        const y = height - padding - (i / yTicks) * (height - padding * 2);
        const value = yMin + (i / yTicks) * (yMax - yMin);
        
        ctx.beginPath();
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(padding, y);
        ctx.stroke();
        
        ctx.fillText(value.toFixed(1), padding - 10, y + 4);
    }
}

function calculateBestFitLine(xValues, yValues, dataToCanvasX, dataToCanvasY) {
    if (xValues.length < 2) return null;
    
    // Calculate linear regression
    const n = xValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += xValues[i];
        sumY += yValues[i];
        sumXY += xValues[i] * yValues[i];
        sumXX += xValues[i] * xValues[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Get min and max X values
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    
    const y1 = slope * minX + intercept;
    const y2 = slope * maxX + intercept;
    
    return {
        x1: dataToCanvasX(minX),
        y1: dataToCanvasY(y1),
        x2: dataToCanvasX(maxX),
        y2: dataToCanvasY(y2)
    };
}

function formatTooltip(data, xDataKey, yDataKey) {
    return `
        <strong>${data.player}</strong><br/>
        Pass Yds: ${data.pass_yds}<br/>
        Attempts: ${data.att}<br/>
        Completion: ${data.cmp_pct.toFixed(1)}%<br/>
        TD: ${data.td}<br/>
        Int: ${data.int}<br/>
        Rating: ${data.passer_rating.toFixed(2)}
    `;
}
