// ============================================================
// SOURCE SLEUTH - COMPLETE APPLICATION
// All Features: Theme, Filters, Sharing, Export, Compare, Stats
// ============================================================

// ----- STATE -----
let currentData = null;
let secondData = null;
let currentFilter = 'all';

// ----- DOM REFS -----
const debugEl = document.getElementById('debugOutput');

// ----- DEBUG LOGGING -----
function debugLog(message, data) {
    const timestamp = new Date().toLocaleTimeString();
    let log = `[${timestamp}] ${message}`;
    if (data) {
        log += '\n' + JSON.stringify(data, null, 2);
    }
    debugEl.textContent = log + '\n\n' + debugEl.textContent;
    console.log(message, data || '');
}

// ----- THEME TOGGLE -----
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    const current = html.getAttribute('data-theme');

    if (current === 'dark') {
        html.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeIcon').className = 'fas fa-sun';
}

// ----- SAMPLE DATA -----
const sampleUrls = {
    1: "https://fakenews.com/vaccines-autism",
    2: "https://climatedenial.org/hoax",
    3: "https://electionfake.com/fraud"
};

function loadSample(id) {
    debugLog(`📝 Loading sample ${id}: ${sampleUrls[id]}`);
    document.getElementById('urlInput').value = sampleUrls[id];
    analyzeArticle();
}

// ----- MAIN ANALYZE -----
async function analyzeArticle() {
    const url = document.getElementById('urlInput').value.trim();
    debugLog(`🔍 Analyze: "${url}"`);

    if (!url) {
        alert('Please paste a URL or select a sample.');
        return;
    }

    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    loading.style.display = 'block';
    results.style.display = 'none';

    try {
        debugLog(`📡 Sending to: http://localhost:5000/api/analyze`);

        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const result = await response.json();
        debugLog(`📦 Response:`, result);

        if (result.success) {
            currentData = result.data;
            displayResults(currentData);
        } else {
            alert('Error: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        debugLog(`❌ Error: ${error.message}`);
        alert('Error: Make sure backend is running on port 5000.');
    }

    loading.style.display = 'none';
}

// ----- DISPLAY RESULTS -----
function displayResults(data) {
    debugLog(`🎨 Displaying results for: ${data.title}`);

    document.getElementById('results').style.display = 'block';
    document.getElementById('statsBar').style.display = 'grid';

    // Trust Score
    const score = data.trust_score || 0;
    animateNumber('scoreNumber', 0, score);
    document.getElementById('trustDescription').textContent =
        data.trust_score_description || 'Analysis complete';

    // Score color
    const circle = document.querySelector('.score-circle');
    if (score < 30) {
        circle.style.background = 'linear-gradient(135deg, #fd79a8, #e17055)';
    } else if (score < 60) {
        circle.style.background = 'linear-gradient(135deg, #fdcb6e, #f39c12)';
    } else {
        circle.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    }

    // Stats
    const claims = data.claims || [];
    const verified = claims.filter(c => c.source_status === 'green').length;
    const weak = claims.filter(c => c.source_status === 'yellow').length;
    const unsourced = claims.filter(c => c.source_status === 'red').length;

    document.getElementById('statClaims').textContent = claims.length;
    document.getElementById('statVerified').textContent = verified;
    document.getElementById('statWeak').textContent = weak;
    document.getElementById('statUnsourced').textContent = unsourced;

    document.getElementById('detailVerified').textContent = verified;
    document.getElementById('detailWeak').textContent = weak;
    document.getElementById('detailUnsourced').textContent = unsourced;

    // Generate
    generateVisualization(data);
    generateClaimsList(data);
}

// ----- ANIMATE NUMBER -----
function animateNumber(elementId, start, end) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let current = start;
    const steps = 25;
    const step = (end - start) / steps;
    let count = 0;

    const timer = setInterval(() => {
        count++;
        current += step;
        if (count >= steps) {
            current = end;
            clearInterval(timer);
        }
        el.textContent = Math.round(current);
    }, 25);
}

// ----- GENERATE VISUALIZATION (D3.js) -----
function generateVisualization(data) {
    const container = document.getElementById('visualization');
    container.innerHTML = '';

    const claims = data.claims || [];
    if (claims.length === 0) {
        container.innerHTML = '<p style="padding:40px;color:var(--text-muted);text-align:center;">No claims found.</p>';
        return;
    }

    try {
        const nodes = [{ id: 0, label: data.title || 'Article', type: 'article', radius: 42 }];
        const links = [];

        claims.forEach((claim, i) => {
            const idx = i + 1;
            nodes.push({
                id: idx,
                label: claim.text.substring(0, 55) + (claim.text.length > 55 ? '...' : ''),
                type: 'claim',
                status: claim.source_status || 'yellow',
                radius: 26,
                explanation: claim.explanation || '',
                sources: claim.suggested_sources || []
            });
            links.push({ source: 0, target: idx });
        });

        const width = container.clientWidth || 900;
        const height = 520;

        const svg = d3.select('#visualization')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'transparent');

        const sim = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(160).strength(0.4))
            .force('charge', d3.forceManyBody().strength(-350))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .style('stroke', 'var(--border-color)')
            .style('stroke-width', 2)
            .style('stroke-opacity', 0.5);

        const nodeGroup = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
                .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
                .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

        // Circles
        nodeGroup.append('circle')
            .attr('r', d => d.radius)
            .style('fill', d => {
                if (d.type === 'article') return '#667eea';
                if (d.status === 'green') return '#00b894';
                if (d.status === 'yellow') return '#fdcb6e';
                if (d.status === 'red') return '#e17055';
                return '#999';
            })
            .style('stroke', 'var(--bg-card)')
            .style('stroke-width', 3)
            .style('cursor', 'pointer')
            .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))')
            .on('click', (e, d) => {
                if (d.type === 'claim') {
                    alert(`📌 ${d.label}\n\nStatus: ${d.status.toUpperCase()}\n\n${d.explanation || 'No explanation'}`);
                }
            });

        // Labels
        nodeGroup.append('text')
            .text(d => d.label)
            .style('font-size', '10px')
            .style('font-weight', '600')
            .style('text-anchor', 'middle')
            .style('dy', d => d.radius + 16)
            .style('fill', 'var(--text-primary)')
            .style('pointer-events', 'none')
            .style('font-family', "'Inter', sans-serif");

        sim.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        debugLog(`✅ D3 visualization generated with ${nodes.length} nodes`);

    } catch (error) {
        debugLog(`❌ D3 error: ${error.message}`);
        container.innerHTML = `<p style="padding:40px;color:#e17055;text-align:center;">Error: ${error.message}</p>`;
    }
}

// ----- GENERATE CLAIMS LIST -----
function generateClaimsList(data) {
    const container = document.getElementById('claimsList');
    container.innerHTML = '';

    const claims = data.claims || [];
    if (claims.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No claims found.</p>';
        return;
    }

    claims.forEach((claim, index) => {
        const statusMap = {
            'green': '✅ Verified',
            'yellow': '⚠️ Weak Source',
            'red': '❌ Unsourced'
        };

        const statusText = statusMap[claim.source_status] || 'Unknown';
        const statusClass = claim.source_status || 'yellow';

        const div = document.createElement('div');
        div.className = `claim-item ${statusClass}`;
        div.dataset.status = statusClass;

        let sourcesHtml = '';
        if (claim.suggested_sources && claim.suggested_sources.length > 0) {
            sourcesHtml = `
                <div class="claim-sources" id="sources_${index}">
                    <strong>📚 Suggested Sources:</strong>
                    ${claim.suggested_sources.map(s => `<a href="${s}" target="_blank">${s}</a>`).join('')}
                </div>
            `;
        }

        div.innerHTML = `
            <div class="claim-text">${claim.text}</div>
            <div class="claim-status">
                <span class="badge ${statusClass}">${statusText}</span>
                <span>${claim.explanation || ''}</span>
            </div>
            ${sourcesHtml}
            <button class="expand-btn" onclick="toggleSources(${index})">
                ${claim.suggested_sources && claim.suggested_sources.length > 0 ? '📖 Show Sources' : ''}
            </button>
        `;

        container.appendChild(div);
    });

    debugLog(`📋 Generated ${claims.length} claims`);
}

// ----- FILTER CLAIMS -----
function filterClaims(status) {
    currentFilter = status;
    const items = document.querySelectorAll('.claim-item');

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(status) ||
            (status === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });

    items.forEach(item => {
        if (status === 'all') {
            item.style.display = 'block';
        } else {
            item.style.display = item.dataset.status === status ? 'block' : 'none';
        }
    });
}

// ----- TOGGLE SOURCES -----
function toggleSources(index) {
    const el = document.getElementById(`sources_${index}`);
    if (el) {
        el.classList.toggle('show');
        const btn = el.parentElement.querySelector('.expand-btn');
        if (btn) {
            btn.textContent = el.classList.contains('show') ? '📖 Hide Sources' : '📖 Show Sources';
        }
    }
}

// ----- COMPARE ARTICLES -----
async function compareArticles() {
    const url = document.getElementById('compareUrlInput').value.trim();
    if (!url) {
        alert('Please paste a second article URL.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const result = await response.json();

        if (result.success && currentData) {
            secondData = result.data;
            const container = document.getElementById('compareResults');

            const score1 = currentData.trust_score || 0;
            const score2 = result.data.trust_score || 0;

            container.innerHTML = `
                <div class="compare-results">
                    <div class="compare-card">
                        <h4>${currentData.title || 'Article 1'}</h4>
                        <div class="compare-score" style="color:${score1 < 30 ? '#e17055' : score1 < 60 ? '#fdcb6e' : '#00b894'}">
                            ${score1}
                        </div>
                        <p style="color:var(--text-muted);font-size:0.85rem;">Trust Score</p>
                    </div>
                    <div class="compare-vs">VS</div>
                    <div class="compare-card">
                        <h4>${result.data.title || 'Article 2'}</h4>
                        <div class="compare-score" style="color:${score2 < 30 ? '#e17055' : score2 < 60 ? '#fdcb6e' : '#00b894'}">
                            ${score2}
                        </div>
                        <p style="color:var(--text-muted);font-size:0.85rem;">Trust Score</p>
                    </div>
                </div>
                <div style="margin-top:16px;padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                    <strong>Winner:</strong> ${score1 > score2 ? 'First article is more credible' :
                                               score1 < score2 ? 'Second article is more credible' :
                                               'Both articles have similar credibility'}
                </div>
            `;
        }
    } catch (error) {
        alert('Error comparing articles.');
    }
}

// ----- TOGGLE COMPARE -----
function toggleCompare() {
    const section = document.getElementById('compareSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// ----- SHARE FEATURES -----
function shareTwitter() {
    const url = window.location.href;
    const text = `🔍 Just analyzed an article with Source Sleuth! Check out the credibility score and interactive visualization. #MIL #UNESCO #SourceSleuth`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareLinkedIn() {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

function downloadPNG() {
    const viz = document.getElementById('visualization');
    const svg = viz.querySelector('svg');
    if (!svg) {
        alert('No visualization to download. Analyze an article first!');
        return;
    }

    // Create a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'source-sleuth-visualization.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
    };
    img.src = url;
}

function downloadPDF() {
    alert('📄 PDF Export: This feature would generate a full report including:\n' +
          '- Trust Score\n' +
          '- Claims Breakdown\n' +
          '- Source Analysis\n' +
          '- Visualization Snapshot\n\n' +
          'Would you like me to implement this using jsPDF library?');
}

// ----- KEYBOARD SHORTCUTS -----
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        analyzeArticle();
    }
});

// ----- INIT -----
debugLog('🔍 Source Sleuth loaded successfully!');
debugLog('💡 Tip: Ctrl+Enter to analyze');
debugLog('📡 Backend: http://localhost:5000');
debugLog('🌙 Click the moon/sun to toggle dark mode');