// ============================================================
// SOURCE SLEUTH - COMPLETE APPLICATION
// Features: URL/Text Analysis, Compare, History, Export PDF
// ============================================================

// ----- STATE -----
let currentData = null;
let secondData = null;
let currentFilter = 'all';
let analysisHistory = JSON.parse(localStorage.getItem('sourceSleuthHistory') || '[]');

// ----- DOM REFS -----
const debugEl = document.getElementById('debugOutput');

// ----- DEBUG -----
function debugLog(message, data) {
    const timestamp = new Date().toLocaleTimeString();
    let log = `[${timestamp}] ${message}`;
    if (data) {
        log += '\n' + JSON.stringify(data, null, 2).substring(0, 500);
    }
    debugEl.textContent = log + '\n\n' + debugEl.textContent;
    console.log(message, data || '');
}

// ----- THEME -----
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

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeIcon').className = 'fas fa-sun';
}

// ----- TABS -----
function switchTab(tab) {
    document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.input-tab[data-tab="${tab}"]`).classList.add('active');

    document.getElementById('urlInputContainer').style.display = tab === 'url' ? 'block' : 'none';
    document.getElementById('textInputContainer').style.display = tab === 'text' ? 'block' : 'none';
}

// ----- EXAMPLE URLs (Subtle) -----
const exampleUrls = {
    1: "https://fakenews.com/vaccine-heart-problems",
    2: "https://climatedenial.org/climate-hoax",
    3: "https://electionfake.com/voter-fraud",
    4: "https://naturalhealingblog.com/miracle-cure",
    5: "https://techconspiracy.net/5g-brain-control"
};

function loadExample(id) {
    debugLog(`📝 Loading example ${id}`);
    document.getElementById('urlInput').value = exampleUrls[id];
    switchTab('url');
    analyzeArticle();
}

// ----- ANALYZE URL -----
async function analyzeArticle() {
    const url = document.getElementById('urlInput').value.trim();
    debugLog(`🔍 Analyzing URL: "${url}"`);

    if (!url) {
        alert('Please paste a valid URL.');
        return;
    }

    await performAnalysis({ url: url });
}

// ----- ANALYZE TEXT -----
async function analyzeText() {
    const text = document.getElementById('textInput').value.trim();
    debugLog(`📝 Analyzing text (${text.length} chars)`);

    if (!text || text.length < 20) {
        alert('Please paste at least 20 characters of article text.');
        return;
    }

    await performAnalysis({ text: text, url: 'text-input' });
}

// ----- PERFORM ANALYSIS -----
async function performAnalysis(payload) {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    loading.style.display = 'block';
    results.style.display = 'none';

    // Update loading text
    document.getElementById('loadingText').textContent = 'analyzing content...';

    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        debugLog(`📦 Response:`, result);

        if (result.success) {
            currentData = result.data;
            currentData._analyzedAt = new Date().toISOString();
            displayResults(currentData);
            addToHistory(currentData);
        } else {
            alert('Error: ' + (result.error || 'Could not analyze content. Try another URL.'));
        }
    } catch (error) {
        debugLog(`❌ Error: ${error.message}`);
        alert('Error: Make sure backend is running on port 5000.');
    }

    loading.style.display = 'none';
}

// ----- DISPLAY RESULTS -----
function displayResults(data) {
    debugLog(`🎨 Displaying: "${data.title}"`);

    document.getElementById('results').style.display = 'block';

    // Trust Score
    const score = data.trust_score || 0;
    animateNumber('scoreNumber', 0, score);
    document.getElementById('resultTitle').textContent = data.title || 'Article Analysis';
    document.getElementById('trustDescription').textContent =
        data.trust_score_description || 'Analysis complete';

    // Confidence
    const confidence = data._confidence || 85;
    document.getElementById('confidenceText').textContent = `${confidence}% confidence`;
    document.getElementById('confidenceDisplay').style.display = 'inline-block';

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

    document.getElementById('detailVerified').textContent = verified;
    document.getElementById('detailWeak').textContent = weak;
    document.getElementById('detailUnsourced').textContent = unsourced;
    document.getElementById('detailTotal').textContent = claims.length;

    // Generate
    generateVisualization(data);
    generateClaimsList(data);
    debugLog(`✅ Display complete: ${claims.length} claims`);
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

// ----- VISUALIZATION -----
function generateVisualization(data) {
    const container = document.getElementById('visualization');
    container.innerHTML = '';

    const claims = data.claims || [];
    if (claims.length === 0) {
        container.innerHTML = '<div class="viz-placeholder"><div><i class="fas fa-exclamation-triangle"></i><span>No claims found</span></div></div>';
        return;
    }

    try {
        const nodes = [{ id: 0, label: data.title || 'Article', type: 'article', radius: 38 }];
        const links = [];

        claims.forEach((claim, i) => {
            const idx = i + 1;
            nodes.push({
                id: idx,
                label: claim.text.substring(0, 50) + (claim.text.length > 50 ? '...' : ''),
                type: 'claim',
                status: claim.source_status || 'yellow',
                radius: 24,
                explanation: claim.explanation || '',
                sources: claim.suggested_sources || []
            });
            links.push({ source: 0, target: idx });
        });

        const width = container.clientWidth || 900;
        const height = 480;

        const svg = d3.select('#visualization')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'transparent');

        const sim = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(150).strength(0.4))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .style('stroke', 'var(--border-color)')
            .style('stroke-width', 2)
            .style('stroke-opacity', 0.4);

        const nodeGroup = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
                .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
                .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

        nodeGroup.append('circle')
            .attr('r', d => d.radius)
            .style('fill', d => {
                if (d.type === 'article') return '#667eea';
                if (d.status === 'green') return '#00b894';
                if (d.status === 'yellow') return '#fdcb6e';
                if (d.status === 'red') return '#e17055';
                return '#6a6a82';
            })
            .style('stroke', 'var(--bg-card)')
            .style('stroke-width', 3)
            .style('cursor', 'pointer')
            .style('filter', 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))')
            .on('click', (e, d) => {
                if (d.type === 'claim') {
                    alert(`📌 ${d.label}\n\nStatus: ${d.status.toUpperCase()}\n\n${d.explanation || 'No explanation'}`);
                }
            });

        nodeGroup.append('text')
            .text(d => d.label)
            .style('font-size', '9px')
            .style('font-weight', '600')
            .style('text-anchor', 'middle')
            .style('dy', d => d.radius + 14)
            .style('fill', 'var(--text-primary)')
            .style('pointer-events', 'none')
            .style('font-family', "'Inter', sans-serif")
            .style('opacity', '0.8');

        sim.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        debugLog(`✅ D3: ${nodes.length} nodes, ${links.length} links`);

    } catch (error) {
        debugLog(`❌ D3 error: ${error.message}`);
        container.innerHTML = `<div class="viz-placeholder"><div><i class="fas fa-exclamation-circle" style="color:#e17055;"></i><span>Error: ${error.message}</span></div></div>`;
    }
}

// ----- CLAIMS LIST -----
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
            <div class="claim-meta">
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
}

// ----- FILTER -----
function filterClaims(status) {
    currentFilter = status;
    const items = document.querySelectorAll('.claim-item');

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

// ----- HISTORY -----
function addToHistory(data) {
    const entry = {
        title: data.title || 'Untitled Article',
        trust_score: data.trust_score || 0,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };

    analysisHistory.unshift(entry);
    if (analysisHistory.length > 20) analysisHistory.pop();
    localStorage.setItem('sourceSleuthHistory', JSON.stringify(analysisHistory));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyContainer');
    const list = document.getElementById('historyList');

    if (analysisHistory.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = analysisHistory.map(item => `
        <span class="history-item" onclick="loadHistoryItem(${item.id})">
            ${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''} 
            (${item.trust_score}/100)
        </span>
    `).join('');
}

function loadHistoryItem(id) {
    const item = analysisHistory.find(h => h.id === id);
    if (item) {
        // In a real app, you'd fetch the full data again
        // For demo, we'll just show an alert
        alert(`📊 ${item.title}\nTrust Score: ${item.trust_score}/100\nAnalyzed: ${new Date(item.timestamp).toLocaleString()}`);
    }
}

function clearHistory() {
    analysisHistory = [];
    localStorage.removeItem('sourceSleuthHistory');
    renderHistory();
    debugLog('🧹 History cleared');
}

// ----- COMPARE -----
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

            const s1 = currentData.trust_score || 0;
            const s2 = result.data.trust_score || 0;

            container.innerHTML = `
                <div class="compare-grid">
                    <div class="compare-card">
                        <h4>${currentData.title || 'Article 1'}</h4>
                        <div class="compare-score" style="color:${s1 < 30 ? '#e17055' : s1 < 60 ? '#fdcb6e' : '#00b894'}">${s1}</div>
                        <p style="color:var(--text-muted);font-size:0.8rem;">Trust Score</p>
                        <p style="font-size:0.7rem;color:var(--text-muted);">${currentData.claims ? currentData.claims.length : 0} claims</p>
                    </div>
                    <div class="compare-vs">VS</div>
                    <div class="compare-card">
                        <h4>${result.data.title || 'Article 2'}</h4>
                        <div class="compare-score" style="color:${s2 < 30 ? '#e17055' : s2 < 60 ? '#fdcb6e' : '#00b894'}">${s2}</div>
                        <p style="color:var(--text-muted);font-size:0.8rem;">Trust Score</p>
                        <p style="font-size:0.7rem;color:var(--text-muted);">${result.data.claims ? result.data.claims.length : 0} claims</p>
                    </div>
                </div>
                <div class="compare-winner">
                    🏆 <strong>${s1 > s2 ? 'First article is more credible' :
                               s1 < s2 ? 'Second article is more credible' :
                               'Both articles have similar credibility'}</strong>
                    ${Math.abs(s1 - s2) > 20 ? ' ⚠️ Significant difference detected!' : ''}
                </div>
            `;
        }
    } catch (error) {
        alert('Error comparing articles.');
    }
}

function toggleCompare() {
    const section = document.getElementById('compareSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// ----- SHARE -----
function shareTwitter() {
    const text = `🔍 Just analyzed an article with Source Sleuth! Check out the credibility score: ${currentData ? currentData.trust_score + '/100' : 'N/A'}. #MIL #UNESCO #SourceSleuth`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
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

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#0a0a0f';
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

// ----- EXPORT PDF -----
function exportPDF() {
    if (!currentData) {
        alert('No data to export. Analyze an article first!');
        return;
    }

    const claims = currentData.claims || [];
    let claimsText = claims.map((c, i) =>
        `${i + 1}. ${c.text}\n   Status: ${c.source_status.toUpperCase()}\n   ${c.explanation || ''}\n`
    ).join('\n');

    const report = `
========================================
SOURCE SLEUTH - ANALYSIS REPORT
========================================

Title: ${currentData.title || 'Untitled'}
Source: ${currentData.source || 'Unknown'}
Analyzed: ${new Date().toLocaleString()}

----------------------------------------
TRUST SCORE: ${currentData.trust_score || 0}/100
${currentData.trust_score_description || ''}
----------------------------------------

CLAIMS BREAKDOWN:
Total: ${claims.length}
✅ Verified: ${claims.filter(c => c.source_status === 'green').length}
⚠️ Weak Sources: ${claims.filter(c => c.source_status === 'yellow').length}
❌ Unsourced: ${claims.filter(c => c.source_status === 'red').length}

----------------------------------------
DETAILED CLAIMS:
----------------------------------------
${claimsText}

----------------------------------------
Generated by Source Sleuth
UNESCO Youth Hackathon 2026
========================================
    `;

    // Create a text file download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `source-sleuth-report-${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    debugLog('📄 PDF report exported');
}

// ----- KEYBOARD SHORTCUTS -----
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const activeTab = document.querySelector('.input-tab.active');
        if (activeTab && activeTab.dataset.tab === 'url') {
            analyzeArticle();
        } else {
            analyzeText();
        }
    }
});

// ----- INIT -----
renderHistory();
debugLog('🔍 Source Sleuth loaded successfully!');
debugLog('💡 Enter a URL or paste text, then press Ctrl+Enter');
debugLog('📡 Backend: http://localhost:5000');
debugLog('📚 History: ' + analysisHistory.length + ' saved analyses');

// ----- COMPARE ARTICLES (Enhanced) -----
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

            const s1 = currentData.trust_score || 0;
            const s2 = result.data.trust_score || 0;
            const diff = Math.abs(s1 - s2);
            const diffPercent = Math.round((diff / 100) * 100);

            // Determine color for each score
            const color1 = s1 < 30 ? '#e17055' : s1 < 60 ? '#fdcb6e' : '#00b894';
            const color2 = s2 < 30 ? '#e17055' : s2 < 60 ? '#fdcb6e' : '#00b894';

            // Determine winner message
            let winnerMessage = '';
            let winnerEmoji = '';
            if (s1 > s2 + 20) {
                winnerMessage = '🏆 Article 1 is significantly more credible';
                winnerEmoji = '📈';
            } else if (s2 > s1 + 20) {
                winnerMessage = '🏆 Article 2 is significantly more credible';
                winnerEmoji = '📈';
            } else if (Math.abs(s1 - s2) <= 10) {
                winnerMessage = '⚖️ Both articles have similar credibility';
                winnerEmoji = '🤝';
            } else {
                winnerMessage = '📊 Article 1 is slightly more credible than Article 2';
                winnerEmoji = '📊';
            }

            container.innerHTML = `
                <div style="margin-top:20px;padding:16px;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h4 style="color:var(--text-secondary);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;">
                            <i class="fas fa-code-branch"></i> Comparison Results
                        </h4>
                        <span style="font-size:0.7rem;color:var(--text-muted);background:var(--bg-card);padding:2px 12px;border-radius:12px;">
                            ${diffPercent}% difference
                        </span>
                    </div>

                    <div class="compare-grid">
                        <div class="compare-card" style="text-align:center;">
                            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
                                ${currentData.source || 'Unknown Source'}
                            </div>
                            <h4 style="font-size:0.85rem;color:var(--text-primary);margin-bottom:4px;">
                                ${currentData.title || 'Article 1'}
                            </h4>
                            <div class="compare-score" style="color:${color1};font-size:3.5rem;font-weight:900;">
                                ${s1}
                            </div>
                            <p style="color:var(--text-muted);font-size:0.75rem;">Trust Score</p>
                            <div style="margin-top:8px;display:flex;justify-content:center;gap:12px;font-size:0.7rem;color:var(--text-muted);">
                                <span>✅ ${currentData.claims ? currentData.claims.filter(c => c.source_status === 'green').length : 0}</span>
                                <span>⚠️ ${currentData.claims ? currentData.claims.filter(c => c.source_status === 'yellow').length : 0}</span>
                                <span>❌ ${currentData.claims ? currentData.claims.filter(c => c.source_status === 'red').length : 0}</span>
                            </div>
                            <div style="margin-top:6px;height:4px;background:var(--border-color);border-radius:4px;overflow:hidden;">
                                <div style="height:100%;width:${s1}%;background:${color1};border-radius:4px;transition:width 1s;"></div>
                            </div>
                        </div>

                        <div class="compare-vs" style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                            <span style="font-size:2rem;font-weight:900;color:#667eea;">VS</span>
                            <span style="font-size:0.65rem;color:var(--text-muted);text-align:center;line-height:1.3;">
                                ${diff > 20 ? '⬆️ Significant<br>difference' : '📊 Similar<br>scores'}
                            </span>
                        </div>

                        <div class="compare-card" style="text-align:center;">
                            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">
                                ${result.data.source || 'Unknown Source'}
                            </div>
                            <h4 style="font-size:0.85rem;color:var(--text-primary);margin-bottom:4px;">
                                ${result.data.title || 'Article 2'}
                            </h4>
                            <div class="compare-score" style="color:${color2};font-size:3.5rem;font-weight:900;">
                                ${s2}
                            </div>
                            <p style="color:var(--text-muted);font-size:0.75rem;">Trust Score</p>
                            <div style="margin-top:8px;display:flex;justify-content:center;gap:12px;font-size:0.7rem;color:var(--text-muted);">
                                <span>✅ ${result.data.claims ? result.data.claims.filter(c => c.source_status === 'green').length : 0}</span>
                                <span>⚠️ ${result.data.claims ? result.data.claims.filter(c => c.source_status === 'yellow').length : 0}</span>
                                <span>❌ ${result.data.claims ? result.data.claims.filter(c => c.source_status === 'red').length : 0}</span>
                            </div>
                            <div style="margin-top:6px;height:4px;background:var(--border-color);border-radius:4px;overflow:hidden;">
                                <div style="height:100%;width:${s2}%;background:${color2};border-radius:4px;transition:width 1s;"></div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top:16px;padding:14px 18px;border-radius:var(--radius-sm);background:${diff > 20 ? 'rgba(225,112,85,0.1)' : 'rgba(0,184,148,0.1)'};border:1px solid ${diff > 20 ? 'rgba(225,112,85,0.2)' : 'rgba(0,184,148,0.2)'};">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:1.5rem;">${winnerEmoji}</span>
                            <span style="font-weight:600;color:var(--text-primary);">${winnerMessage}</span>
                        </div>
                        ${diff > 20 ? `
                            <div style="margin-top:6px;font-size:0.8rem;color:var(--text-muted);">
                                ⚠️ The ${diff > 30 ? 'large' : 'moderate'} difference of ${diff} points suggests these articles have very different credibility levels.
                            </div>
                        ` : `
                            <div style="margin-top:6px;font-size:0.8rem;color:var(--text-muted);">
                                ${diff <= 5 ? '📊 Scores are almost identical. Both articles have similar reliability.' : '📊 Scores are within a reasonable range. Both articles have comparable credibility.'}
                            </div>
                        `}
                    </div>

                    <div style="margin-top:12px;display:flex;gap:12px;font-size:0.7rem;color:var(--text-muted);flex-wrap:wrap;">
                        <span>📅 Compared: ${new Date().toLocaleString()}</span>
                        <span>📊 Difference: ${diff} points</span>
                        <span>📈 ${s1 > s2 ? 'Article 1' : 'Article 2'} leads by ${diff} points</span>
                    </div>
                </div>
            `;

            // Scroll to comparison results
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });

            debugLog(`📊 Comparison complete: ${s1} vs ${s2}, diff: ${diff}`);
        }
    } catch (error) {
        debugLog(`❌ Compare error: ${error.message}`);
        alert('Error comparing articles. Make sure the backend is running.');
    }
}