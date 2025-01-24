let chart = null;

function createChart(data, labels, title) {
    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById('activationChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: data[0].length}, (_, i) => i),
            datasets: labels.map((label, i) => ({
                label: label,
                data: data[i],
                borderColor: getColor(i),
                fill: false,
                tension: 0.1
            }))
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Activation'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Steps'
                    }
                }
            }
        }
    });
}

function getColor(index) {
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];
    return colors[index % colors.length];
}

function runSelectedExperiment() {
    const experimentType = document.getElementById('experimentSelect').value;
    const model = new InteractiveActivationModel();

    let data, labels, title;
    switch(experimentType) {
        case 'readVsE':
            ({data, labels} = model.runReadVsE());
            title = 'Letter Recognition: E in READ vs E Alone';
            break;
        case 'maveVsE':
            ({data, labels} = model.runMaveVsE());
            title = 'Letter Recognition: E in MAVE vs E Alone';
            break;
        case 'richGetRicher':
            ({data, labels} = model.runRichGetRicher());
            title = 'Rich Get Richer Effect with MAVE';
            break;
        case 'gangEffect':
            ({data, labels} = model.runGangEffect());
            title = 'Gang Effect with MAVE';
            break;
    }
    
    createChart(data, labels, title);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('runButton').addEventListener('click', runSelectedExperiment);
    runSelectedExperiment();
});