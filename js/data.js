// Load and parse CSV data
let qbData = [];

async function loadData() {
    try {
        const response = await fetch('../comp_qb_stats.csv');
        const csvText = await response.text();
        qbData = parseCSV(csvText);
        
        // Initialize table and charts after data is loaded
        if (document.getElementById('statsTable')) {
            initTable();
        }
        if (document.getElementById('ratingVsInt')) {
            initCharts();
        }
        
        return qbData;
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
            const value = values[index];
            // Convert numeric fields
            if (['pass_yds', 'yds_att', 'att', 'cmp', 'cmp_pct', 'td', 'int', 'passer_rating'].includes(header)) {
                row[header] = parseFloat(value);
            } else {
                row[header] = value;
            }
        });
        
        return row;
    });
    
    return data;
}

// Initialize data on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}
