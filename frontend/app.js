// ============================================================
// SOURCE SLEUTH - COMPLETE APPLICATION
// Features: URL/Text Analysis, Compare, History, Fact-Checking
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

// ----- EXAMPLE URLs -----
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

    const score = data.trust_score || 0;
    animateNumber('scoreNumber', 0, score);
    document.getElementById('resultTitle').textContent = data.title || 'Article Analysis';
    document.getElementById('trustDescription').textContent =
        data.trust_score_description || 'Analysis complete';

    const confidence = data._confidence || 85;
    document.getElementById('confidenceText').textContent = `${confidence}% confidence`;
    document.getElementById('confidenceDisplay').style.display = 'inline-block';

    const circle = document.querySelector('.score-circle');
    if (score < 30) {
        circle.style.background = 'linear-gradient(135deg, #fd79a8, #e17055)';
    } else if (score < 60) {
        circle.style.background = 'linear-gradient(135deg, #fdcb6e, #f39c12)';
    } else {
        circle.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    }

    const claims = data.claims || [];
    const verified = claims.filter(c => c.source_status === 'green').length;
    const weak = claims.filter(c => c.source_status === 'yellow').length;
    const unsourced = claims.filter(c => c.source_status === 'red').length;

    document.getElementById('detailVerified').textContent = verified;
    document.getElementById('detailWeak').textContent = weak;
    document.getElementById('detailUnsourced').textContent = unsourced;
    document.getElementById('detailTotal').textContent = claims.length;

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

// ============================================================
// 📋 GENERATE CLAIMS LIST (WITH FACT-CHECKING)
// ============================================================

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

        let factCheckHtml = '';
        if (claim.fact_checked && claim.fact_check_results && claim.fact_check_results.length > 0) {
            factCheckHtml = `
                <div style="margin-top:10px;padding:10px 14px;background:rgba(102,126,234,0.08);border-radius:8px;border-left:3px solid #667eea;">
                    <div style="font-size:0.7rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">
                        <i class="fas fa-check-circle" style="color:#00b894;"></i> 
                        Fact-Checked via Google (${claim.fact_check_results.length} sources found)
                    </div>
                    ${claim.fact_check_results.map((result, idx) => `
                        <div style="font-size:0.75rem;color:var(--text-secondary);padding:6px 0;${idx > 0 ? 'border-top:1px solid var(--border-color);margin-top:4px;' : ''}">
                            <div style="color:var(--text-primary);font-weight:500;font-size:0.7rem;">
                                <i class="fas fa-quote-left" style="color:var(--text-muted);font-size:0.6rem;"></i> 
                                ${result.text || 'No text available'}
                            </div>
                            <div style="margin-top:2px;display:flex;flex-wrap:wrap;gap:4px 12px;font-size:0.65rem;color:var(--text-muted);">
                                <span><strong>Publisher:</strong> ${result.publisher || 'Unknown'}</span>
                                <span><strong>Rating:</strong> ${result.review_text || 'No rating'}</span>
                                ${result.review_url ? `<a href="${result.review_url}" target="_blank" style="color:#667eea;text-decoration:none;">
                                    <i class="fas fa-external-link-alt"></i> View Source
                                </a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        div.innerHTML = `
            <div class="claim-text">${claim.text}</div>
            <div class="claim-meta">
                <span class="badge ${statusClass}">${statusText}</span>
                <span>${claim.explanation || ''}</span>
                ${claim.fact_checked ? '<span style="font-size:0.65rem;color:#00b894;background:rgba(0,184,148,0.1);padding:2px 10px;border-radius:10px;">🔍 Fact-Checked</span>' : ''}
            </div>
            ${sourcesHtml}
            ${factCheckHtml}
            <button class="expand-btn" onclick="toggleSources(${index})">
                ${claim.suggested_sources && claim.suggested_sources.length > 0 ? '📖 Show Sources' : ''}
            </button>
        `;

        container.appendChild(div);
    });

    debugLog(`📋 Generated ${claims.length} claims with fact-checking`);
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