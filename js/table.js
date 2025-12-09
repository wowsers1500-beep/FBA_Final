// Table sorting and filtering functionality
let currentSort = { column: null, direction: 'asc' };
let filteredData = [...qbData];

function initTable() {
    renderTable(qbData);
    attachTableEventListeners();
}

function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.player}</td>
            <td>${row.pass_yds}</td>
            <td>${row.yds_att.toFixed(2)}</td>
            <td>${row.att}</td>
            <td>${row.cmp}</td>
            <td>${row.cmp_pct.toFixed(1)}</td>
            <td>${row.td}</td>
            <td>${row.int}</td>
            <td>${row.passer_rating.toFixed(2)}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    filteredData = data;
}

function attachTableEventListeners() {
    // Column header sorting
    document.querySelectorAll('.sortable-table th').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            handleSort(column, header);
        });
    });
    
    // Search bar filtering
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }
}

function handleSort(column, headerElement) {
    // Determine sort direction
    let direction = 'asc';
    if (currentSort.column === column && currentSort.direction === 'asc') {
        direction = 'desc';
    }
    
    currentSort = { column, direction };
    
    // Remove all sort indicators
    document.querySelectorAll('.sortable-table th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    // Add sort indicator to current column
    headerElement.classList.add(direction);
    
    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle numeric sorting
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle string sorting
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (direction === 'asc') {
            return aVal.localeCompare(bVal);
        } else {
            return bVal.localeCompare(aVal);
        }
    });
    
    renderTable(sortedData);
}

function handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    
    const results = qbData.filter(row => 
        row.player.toLowerCase().includes(lowerQuery)
    );
    
    // Reset sort indicators when searching
    document.querySelectorAll('.sortable-table th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    currentSort = { column: null, direction: 'asc' };
    
    renderTable(results);
}
