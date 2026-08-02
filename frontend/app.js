// Source Sleuth - FIXED VERSION

let currentData = null;
let secondData = null;

// Debug logging
function debugLog(message, data) {
    const debugDiv = document.getElementById('debugOutput');
    const timestamp = new Date().toLocaleTimeString();
    let logMessage = `[${timestamp}] ${message}`;
    if (data) {
        logMessage += '\n' + JSON.stringify(data, null, 2);
    }
    debugDiv.textContent = logMessage + '\n\n' + debugDiv.textContent;
    console.log(message, data);
}

// Sample article URLs
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

async function analyzeArticle() {
    const url = document.getElementById('urlInput').value.trim();
    debugLog(`🔍 Analyze button clicked. URL: "${url}"`);
    
    if (!url) {
        alert('Please paste a URL or select a sample article.');
        return;
    }

    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    loading.style.display = 'block';
    results.style.display = 'none';
    
    document.getElementById('visualization').innerHTML = '<p style="color: #999;">Loading visualization...</p>';

    try {
        debugLog(`📡 Sending request to: http://localhost:5000/api/analyze`);
        
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        debugLog(`📥 Response status: ${response.status}`);
        
        const result = await response.json();
        debugLog(`📦 Response data:`, result);
        
        if (result.success) {
            currentData = result.data;
            debugLog(`✅ Success! Article: ${currentData.title}`);
            debugLog(`📊 Claims found: ${currentData.claims ? currentData.claims.length : 0}`);
            displayResults(currentData);
        } else {
            debugLog(`❌ Error from server: ${result.error}`);
            alert('Error: ' + (result.error || 'Unknown error from server'));
        }
        
    } catch (error) {
        debugLog(`❌ Fetch error: ${error.message}`);
        alert('Error connecting to the backend. Make sure the server is running on port 5000.\n\nError: ' + error.message);
    }

    loading.style.display = 'none';
}

function displayResults(data) {
    debugLog(`🎨 Displaying results...`);
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    
    const trustScore = data.trust_score || 0;
    const scoreNumber = document.querySelector('#trustScoreDisplay .score-number');
    const scoreDesc = document.getElementById('trustDescription');
    
    debugLog(`📊 Trust Score: ${trustScore}`);
    animateNumber(scoreNumber, 0, trustScore);
    scoreDesc.textContent = data.trust_score_description || 'Analysis complete';
    
    const circle = document.querySelector('.score-circle');
    if (trustScore < 30) {
        circle.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    } else if (trustScore < 60) {
        circle.style.background = 'linear-gradient(135deg, #feca57, #ff9f43)';
    } else {
        circle.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    }
    
    generateVisualization(data);
    generateClaimsList(data);
}

function animateNumber(element, start, end) {
    if (!element) return;
    let current = start;
    const totalSteps = 20;
    const stepValue = (end - start) / totalSteps;
    
    const timer = setInterval(function() {
        current += stepValue;
        if ((stepValue > 0 && current >= end) || (stepValue < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 20);
}

function generateVisualization(data) {
    const container = document.getElementById('visualization');
    container.innerHTML = '';
    
    const claims = data.claims || [];
    debugLog(`🕸️ Generating ${claims.length} claims in D3`);
    
    if (claims.length === 0) {
        container.innerHTML = '<p style="padding:40px; color:#999;">No claims found in this article.</p>';
        return;
    }
    
    try {
        const nodes = [];
        const links = [];
        
        // Center node (id: 0)
        nodes.push({
            id: 0,
            label: data.title || 'Article',
            type: 'article',
            radius: 40
        });
        
        // Claim nodes (id: 1, 2, 3, ...)
        claims.forEach(function(claim, index) {
            const nodeIndex = index + 1;
            nodes.push({
                id: nodeIndex,
                label: claim.text.substring(0, 50) + (claim.text.length > 50 ? '...' : ''),
                type: 'claim',
                status: claim.source_status || 'yellow',
                radius: 25,
                explanation: claim.explanation || '',
                suggestedSources: claim.suggested_sources || []
            });
            
            links.push({
                source: 0,
                target: nodeIndex,
                value: 1
            });
        });
        
        debugLog(`🕸️ Created ${nodes.length} nodes and ${links.length} links`);
        
        const width = container.clientWidth || 900;
        const height = 500;
        
        const svg = d3.select('#visualization')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#fafafa')
            .style('display', 'block');
        
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(function(d) { return d.id; }).distance(150).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));
        
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .style('stroke', '#999')
            .style('stroke-width', 2)
            .style('stroke-opacity', 0.6);
        
        const nodeGroup = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', function(event, d) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', function(event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', function(event, d) {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));
        
        nodeGroup.append('circle')
            .attr('r', function(d) { return d.radius || 20; })
            .style('fill', function(d) {
                if (d.type === 'article') return '#667eea';
                if (d.status === 'green') return '#4CAF50';
                if (d.status === 'yellow') return '#FFC107';
                if (d.status === 'red') return '#F44336';
                return '#999';
            })
            .style('stroke', '#fff')
            .style('stroke-width', 3)
            .style('cursor', 'pointer')
            .on('click', function(event, d) {
                if (d.type === 'claim') {
                    showClaimDetails(d);
                }
            });
        
        nodeGroup.append('text')
            .text(function(d) { return d.label || d.id; })
            .style('font-size', '10px')
            .style('font-weight', '500')
            .style('text-anchor', 'middle')
            .style('dy', function(d) { return (d.radius || 20) + 15; })
            .style('fill', '#333')
            .style('pointer-events', 'none');
        
        simulation.on('tick', function() {
            link
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });
            
            nodeGroup.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        });
        
        debugLog(`✅ D3 visualization generated successfully!`);
        
    } catch (error) {
        debugLog(`❌ D3 error: ${error.message}`);
        container.innerHTML = `<p style="padding:40px; color:#F44336;">Error generating visualization: ${error.message}</p>`;
        console.error('D3 Error:', error);
    }
}

function generateClaimsList(data) {
    const container = document.getElementById('claimsList');
    container.innerHTML = '';
    
    const claims = data.claims || [];
    debugLog(`📋 Generating ${claims.length} claims in list`);
    
    claims.forEach(function(claim, index) {
        const statusMap = {
            'green': '✅ Verified',
            'yellow': '⚠️ Weak Source',
            'red': '❌ Unsourced'
        };
        
        const statusText = statusMap[claim.source_status] || 'Unknown';
        const statusClass = claim.source_status || 'yellow';
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'claim-item ' + statusClass;
        
        let sourcesHtml = '';
        if (claim.suggested_sources && claim.suggested_sources.length > 0) {
            sourcesHtml = '<div class="source-suggestion" id="sources_' + index + '">';
            sourcesHtml += '<strong>📚 Suggested Sources:</strong><br>';
            claim.suggested_sources.forEach(function(source) {
                sourcesHtml += '<a href="' + source + '" target="_blank">' + source + '</a>';
            });
            sourcesHtml += '</div>';
        }
        
        itemDiv.innerHTML = `
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
        
        container.appendChild(itemDiv);
    });
}

function toggleSources(index) {
    const element = document.getElementById('sources_' + index);
    if (element) {
        element.classList.toggle('show');
        const btn = element.parentElement.querySelector('.expand-btn');
        if (btn) {
            btn.textContent = element.classList.contains('show') ? '📖 Hide Sources' : '📖 Show Sources';
        }
    }
}

function showClaimDetails(claim) {
    alert('Claim: ' + claim.label + '\n\nStatus: ' + claim.status.toUpperCase() + '\n\nExplanation: ' + claim.explanation);
}

function toggleCompare() {
    const section = document.getElementById('compareSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

async function compareArticles() {
    const url = document.getElementById('compareUrlInput').value.trim();
    if (!url) {
        alert('Please paste a URL to compare.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const result = await response.json();
        
        if (result.success && currentData) {
            secondData = result.data;
            const compareDiv = document.getElementById('compareResults');
            compareDiv.innerHTML = `
                <div class="trust-score-container" style="margin-top: 20px;">
                    <h3>Comparison Results</h3>
                    <div class="trust-score">
                        <div style="flex:1; text-align:center; padding:20px; background:#f5f5f5; border-radius:12px;">
                            <h4>First Article</h4>
                            <div style="font-size:3rem; font-weight:bold; color:${currentData.trust_score < 30 ? '#F44336' : '#4CAF50'}">
                                ${currentData.trust_score || 0}
                            </div>
                            <p>Trust Score</p>
                        </div>
                        <div style="font-size:2rem; color:#667eea;">VS</div>
                        <div style="flex:1; text-align:center; padding:20px; background:#f5f5f5; border-radius:12px;">
                            <h4>Second Article</h4>
                            <div style="font-size:3rem; font-weight:bold; color:${result.data.trust_score < 30 ? '#F44336' : '#4CAF50'}">
                                ${result.data.trust_score || 0}
                            </div>
                            <p>Trust Score</p>
                        </div>
                    </div>
                    <div style="text-align:center; margin-top:20px; padding:15px; background:#e8eaf6; border-radius:12px;">
                        <strong>Winner:</strong> ${currentData.trust_score > result.data.trust_score ? 
                            'First Article is more credible' : 
                            currentData.trust_score < result.data.trust_score ? 
                            'Second Article is more credible' : 
                            'Both articles have similar credibility'}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        alert('Error comparing articles.');
    }
}

debugLog('🔍 Source Sleuth loaded! Click a sample to start.');