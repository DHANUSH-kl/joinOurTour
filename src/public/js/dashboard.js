document.addEventListener("DOMContentLoaded", function () {
    const categoryData = <%- JSON.stringify(categoryData) %>;
    const durationData = <%- JSON.stringify(durationData) %>;

    // Extracting Category Data
    const categoryLabels = categoryData.map(item => item._id);
    const categoryCounts = categoryData.map(item => item.count);

    // Extracting Duration Data
    const durationLabels = durationData.map(item => item._id);
    const durationCounts = durationData.map(item => item.count);

    // Category Pie Chart
    const ctx1 = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryCounts,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800'],
            }]
        }
    });

    // Duration Bar Chart
    const ctx2 = document.getElementById('durationChart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: durationLabels,
            datasets: [{
                label: 'Trip Duration',
                data: durationCounts,
                backgroundColor: '#36A2EB',
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Year Selector Event
    document.getElementById("year-selector").addEventListener("change", function () {
        const selectedYear = this.value;
        window.location.href = `/admin/dashboard?year=${selectedYear}`;
    });
});
