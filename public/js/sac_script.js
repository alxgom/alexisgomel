document.getElementById('rent').addEventListener('input', updatePricePerUnitArea);
document.getElementById('total_area').addEventListener('input', updatePricePerUnitArea);
document.getElementById('alpha').addEventListener('input', function() {
    document.getElementById('alpha-value').textContent = this.value;
});

function updatePricePerUnitArea() {
    const rent = parseFloat(document.getElementById('rent').value);
    const totalArea = parseFloat(document.getElementById('total_area').value);
    const pricePerUnitAreaDiv = document.getElementById('price-per-unit-area');

    if (!isNaN(rent) && !isNaN(totalArea) && totalArea > 0) {
        const pricePerUnitArea = (rent / totalArea).toFixed(2);
        pricePerUnitAreaDiv.innerHTML = `
            <span class="ppu-label">Price / Area</span>
            <span class="ppu-value">${pricePerUnitArea}</span>
        `;
        pricePerUnitAreaDiv.classList.add('visible');
    } else {
        pricePerUnitAreaDiv.innerHTML = '';
        pricePerUnitAreaDiv.classList.remove('visible');
    }
}

document.getElementById('num_rooms').addEventListener('input', function() {
    const numRooms = parseInt(this.value);
    const roomDimensionsContainer = document.getElementById('room-dimensions-container');
    roomDimensionsContainer.innerHTML = '';

    for (let i = 1; i <= numRooms; i++) {
        const roomDiv = document.createElement('div');
        roomDiv.classList.add('room-dimension');
        roomDiv.innerHTML = `
            <label>Dimensions of Private Room ${i}</label>
            <div class="room-dimensions">
                <input type="number" name="room_width" placeholder="Width (e.g. 3)" required>
                <input type="number" name="room_length" placeholder="Length (e.g. 4)" required>
            </div>
        `;
        roomDimensionsContainer.appendChild(roomDiv);
    }
});

document.getElementById('rent-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Push GTM event for calculate button click
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'sac_calculate',
            'event_category': 'SAC Calculator',
            'event_label': 'Calculate Rent Split'
        });
    }
    
    const formData = new FormData(event.target);
    const rent = parseFloat(formData.get('rent'));
    const totalArea = parseFloat(formData.get('total_area'));
    const numRooms = parseInt(formData.get('num_rooms'));
    const alpha = parseFloat(formData.get('alpha'));
    const roomWidths = formData.getAll('room_width').map(Number);
    const roomLengths = formData.getAll('room_length').map(Number);
    const roomDimensions = roomWidths.map((width,index) => [width, roomLengths[index]]);
    const bills = formData.get('bills') ? parseFloat(formData.get('bills')) : null;

    const roomAreas = roomDimensions.map(dimension => dimension[0] * dimension[1]);
    const totalRoomArea = roomAreas.reduce((a, b) => a + b, 0);
    const sharedArea = totalArea - totalRoomArea;

    const warningDiv = document.getElementById('warning');
    if (sharedArea < 0) {
        warningDiv.innerHTML = `Warning: Total area of the rooms (${totalRoomArea}) is greater than the total area of the apartment (${totalArea}). Please check your measurements.`;
        return;
    } else {
        warningDiv.innerHTML = '';
    }

    const effectiveArea = totalRoomArea + alpha * sharedArea;
    const effectiveRentPerArea = rent / effectiveArea;

    const rentPerRoom = roomAreas.map(area => {
        const effectiveRoomArea = area + alpha * (sharedArea / numRooms);
        return parseFloat((effectiveRoomArea * effectiveRentPerArea).toFixed(2));
    });

    const sharedSpaceCostPerRoom = parseFloat(((alpha * sharedArea * effectiveRentPerArea) / numRooms).toFixed(2));

    const totalRentPerRoom = bills !== null ? 
        rentPerRoom.map(rentRoom => parseFloat((rentRoom + bills / numRooms).toFixed(2))) :
        rentPerRoom;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    const billsPerRoom = bills !== null ? parseFloat((bills / numRooms).toFixed(2)) : null;
    totalRentPerRoom.forEach((rent, index) => {
        const billsNote = billsPerRoom ? ` + €${billsPerRoom} bills` : '';
        resultDiv.innerHTML += `<p><strong>Private Room ${index + 1}</strong> should pay <strong>€${rent}</strong> — includes €${sharedSpaceCostPerRoom} shared space${billsNote}.</p>`;
    });

    // Build per-tenant breakdown data
    const tenantData = rentPerRoom.map((privateAndSharedRent, index) => {
        const privateOnly = parseFloat((privateAndSharedRent - sharedSpaceCostPerRoom).toFixed(2));
        const billsShare = bills !== null ? parseFloat((bills / numRooms).toFixed(2)) : 0;
        const total = totalRentPerRoom[index];
        return { label: `Room ${index + 1}`, privateOnly, shared: sharedSpaceCostPerRoom, bills: billsShare, total };
    });

    displayApartmentFrame(roomDimensions, roomAreas, sharedArea, totalArea, rentPerRoom, sharedSpaceCostPerRoom, effectiveRentPerArea);
    displayStackedBars(tenantData);
    displayAptPie(roomAreas, sharedArea, sharedSpaceCostPerRoom, bills, effectiveRentPerArea, roomDimensions.length);
});

// ── Apartment Frame ───────────────────────────────────────────────────────────

function displayApartmentFrame(roomDimensions, roomAreas, sharedArea, totalArea, rentPerRoom, sharedSpaceCostPerRoom, effectiveRentPerArea) {
    const container = document.getElementById('room-visualization');
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'apartment-frame';

    const frameTitle = document.createElement('div');
    frameTitle.className = 'apartment-frame-title';
    frameTitle.textContent = 'Apartment';
    card.appendChild(frameTitle);

    // ── Room boxes row ────────────────────────────────────────────────────────
    const roomsRow = document.createElement('div');
    roomsRow.className = 'apartment-rooms-row';

    const scale = Math.sqrt(totalArea) / 240;

    roomDimensions.forEach((dims, i) => {
        const area         = roomAreas[i];
        const price        = rentPerRoom[i];
        const pricePerArea = (price / area).toFixed(1);
        const bw = Math.max(dims[0] / scale, 80);
        const bh = Math.max(dims[1] / scale, 64);

        const box = document.createElement('div');
        box.className = 'room-box room-box--private';
        box.style.width  = `${bw}px`;
        box.style.height = `${bh}px`;
        box.innerHTML = `
            <span class="room-box-name">Room ${i + 1}</span>
            <span class="room-box-area">Area: ${area}</span>
            <span class="room-box-price">€${price}</span>
            <span class="room-box-ratio">€${pricePerArea}/Area</span>
        `;
        roomsRow.appendChild(box);
    });

    // Shared space box
    const sharedW = Math.max(Math.sqrt(sharedArea) / scale, 68);
    const sharedBox = document.createElement('div');
    sharedBox.className = 'room-box room-box--shared';
    sharedBox.style.width  = `${sharedW}px`;
    sharedBox.style.height = `${sharedW}px`;
    sharedBox.innerHTML = `
        <span class="room-box-name">Shared</span>
        <span class="room-box-area">Area: ${sharedArea.toFixed(1)}</span>
    `;
    roomsRow.appendChild(sharedBox);

    card.appendChild(roomsRow);
    container.appendChild(card);
}

function displayAptPie(roomAreas, sharedArea, sharedSpaceCostPerRoom, bills, effectiveRentPerArea, numRooms) {
    const container = document.getElementById('apt-pie');
    if (!container) return;
    container.innerHTML = '';

    const totalPrivate = parseFloat(roomAreas.reduce((s, a) => s + a * effectiveRentPerArea, 0).toFixed(2));
    const totalShared  = parseFloat((sharedSpaceCostPerRoom * numRooms).toFixed(2));
    const totalBills   = bills ? parseFloat(bills) : 0;

    const card = document.createElement('div');
    card.className = 'apartment-frame';

    const title = document.createElement('div');
    title.className = 'apartment-frame-title';
    title.textContent = 'Where does the rent go?';
    card.appendChild(title);

    const row = document.createElement('div');
    row.className = 'apt-pie-row';

    const aptSegments = [
        { label: 'Private rooms', value: totalPrivate, color: '#B02245' },
        { label: 'Shared space',  value: totalShared,  color: '#3B5FA0' },
        ...(totalBills > 0 ? [{ label: 'Bills', value: totalBills, color: '#9E9E9E' }] : [])
    ];
    row.appendChild(buildDonutSVG(aptSegments));
    row.appendChild(buildLegend(aptSegments));
    card.appendChild(row);
    container.appendChild(card);
}

// ── Stacked Horizontal Bars ───────────────────────────────────────────────────

function displayStackedBars(tenants) {
    const container = document.getElementById('stacked-bars');
    if (!container) return;
    container.innerHTML = '';

    if (tenants.length === 0) return;

    const COLOR_BILLS   = '#9E9E9E';
    const COLOR_SHARED  = '#3B5FA0';
    const COLOR_PRIVATE = '#B02245';
    const hasBills      = tenants.some(t => t.bills > 0);
    const maxTotal      = Math.max(...tenants.map(t => t.total));

    let normalized = false; // default: absolute (bars scale to total)

    const card = document.createElement('div');
    card.className = 'stacked-bars-card';

    // ── Header row: title + toggle ────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'stacked-bars-header';

    const cardTitle = document.createElement('div');
    cardTitle.className = 'stacked-bars-title';
    cardTitle.textContent = 'Cost breakdown per tenant';
    header.appendChild(cardTitle);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'bar-normalize-btn';
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Normalize';
    toggleBtn.addEventListener('click', () => {
        normalized = !normalized;
        toggleBtn.textContent = normalized ? 'Absolute' : 'Normalize';
        toggleBtn.classList.toggle('active', normalized);
        renderBarRows();
    });
    header.appendChild(toggleBtn);
    card.appendChild(header);

    // ── Legend ────────────────────────────────────────────────────────────────
    const legend = document.createElement('div');
    legend.className = 'bar-legend';
    const legendItems = [
        ...(hasBills ? [{ label: 'Bills',         color: COLOR_BILLS   }] : []),
        { label: 'Shared space',  color: COLOR_SHARED  },
        { label: 'Private space', color: COLOR_PRIVATE }
    ];
    legendItems.forEach(li => {
        const span = document.createElement('span');
        span.className = 'bar-legend-item';
        span.innerHTML = `<span class="bar-legend-dot" style="background:${li.color}"></span>${li.label}`;
        legend.appendChild(span);
    });
    card.appendChild(legend);

    // ── Bar rows container ────────────────────────────────────────────────────
    const barsContainer = document.createElement('div');
    card.appendChild(barsContainer);

    function renderBarRows() {
        barsContainer.innerHTML = '';
        tenants.forEach(t => {
            const total    = t.total;
            // In absolute mode, bar width is proportional to max total
            const barWidth = normalized ? 100 : (total / maxTotal * 100);

            const row = document.createElement('div');
            row.className = 'bar-row';

            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = t.label;
            row.appendChild(label);

            const trackWrap = document.createElement('div');
            trackWrap.className = 'bar-track-wrap';

            const track = document.createElement('div');
            track.className = 'bar-track';
            track.style.width = `${barWidth}%`;

            // Segment widths are always % of *this tenant's* total
            const segments = [
                ...(t.bills > 0 ? [{ label: 'Bills',         pct: t.bills      / total * 100, val: t.bills,       color: COLOR_BILLS   }] : []),
                { label: 'Shared space',  pct: t.shared      / total * 100, val: t.shared,      color: COLOR_SHARED  },
                { label: 'Private space', pct: t.privateOnly / total * 100, val: t.privateOnly, color: COLOR_PRIVATE }
            ];

            segments.forEach(seg => {
                const el = document.createElement('div');
                el.className = 'bar-segment';
                el.style.width      = `${seg.pct}%`;
                el.style.background = seg.color;
                el.title = `${seg.label}: €${seg.val.toFixed(2)} (${Math.round(seg.pct)}%)`;
                if (seg.pct > 9) {
                    el.innerHTML = `<span class="bar-seg-label">${Math.round(seg.pct)}%</span>`;
                }
                track.appendChild(el);
            });

            trackWrap.appendChild(track);
            row.appendChild(trackWrap);

            const totalEl = document.createElement('div');
            totalEl.className = 'bar-total';
            totalEl.textContent = `€${total}`;
            row.appendChild(totalEl);

            barsContainer.appendChild(row);
        });
    }

    renderBarRows();
    container.appendChild(card);
}

// ── Donut / Pie Chart ─────────────────────────────────────────────────────────

function buildDonutSVG(segments) {
    // Extra viewBox padding for outside labels
    const PAD  = 22;
    const SIZE = 160;
    const CX   = SIZE / 2;
    const CY   = SIZE / 2;
    const R    = 60;   // outer radius
    const r    = 34;   // inner radius
    const GAP  = 0.025;

    const sum = segments.reduce((acc, s) => acc + s.value, 0);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `${-PAD} ${-PAD} ${SIZE + 2*PAD} ${SIZE + 2*PAD}`);
    svg.setAttribute('width',  '100%');
    svg.removeAttribute('height');
    svg.style.display  = 'block';
    svg.style.maxWidth = `${SIZE}px`;
    svg.style.margin   = '0 auto';

    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
        const fraction   = seg.value / sum;
        const sliceAngle = fraction * 2 * Math.PI;
        const endAngle   = startAngle + sliceAngle - GAP;
        const midAngle   = startAngle + sliceAngle / 2;
        const pct        = Math.round(fraction * 100);

        // Slice path with native tooltip
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', describeDonutSlice(CX, CY, R, r, startAngle, endAngle));
        path.setAttribute('fill', seg.color);
        const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleEl.textContent = `${seg.label}: €${seg.value.toFixed(2)} (${pct}%)`;
        path.appendChild(titleEl);
        svg.appendChild(path);

        if (fraction > 0.08) {
            // Label inside the ring
            const labelR = (R + r) / 2;
            const lx = CX + labelR * Math.cos(midAngle);
            const ly = CY + labelR * Math.sin(midAngle);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lx.toFixed(1));
            text.setAttribute('y', ly.toFixed(1));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#ffffff');
            text.setAttribute('font-size', '11');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-family', 'Inter, Arial, sans-serif');
            text.textContent = `${pct}%`;
            svg.appendChild(text);
        } else {
            // Outside label with leader line
            const x1 = CX + (R + 2)  * Math.cos(midAngle);
            const y1 = CY + (R + 2)  * Math.sin(midAngle);
            const x2 = CX + (R + 12) * Math.cos(midAngle);
            const y2 = CY + (R + 12) * Math.sin(midAngle);
            const lx = CX + (R + 16) * Math.cos(midAngle);
            const ly = CY + (R + 16) * Math.sin(midAngle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1.toFixed(1)); line.setAttribute('y1', y1.toFixed(1));
            line.setAttribute('x2', x2.toFixed(1)); line.setAttribute('y2', y2.toFixed(1));
            line.setAttribute('stroke', seg.color);
            line.setAttribute('stroke-width', '1.5');
            svg.appendChild(line);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lx.toFixed(1));
            text.setAttribute('y', ly.toFixed(1));
            text.setAttribute('text-anchor', lx >= CX ? 'start' : 'end');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', seg.color);
            text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-family', 'Inter, Arial, sans-serif');
            text.textContent = `${pct}%`;
            svg.appendChild(text);
        }

        startAngle += sliceAngle;
    });

    return svg;
}

function describeDonutSlice(cx, cy, R, r, startAngle, endAngle) {
    const cos = Math.cos, sin = Math.sin;
    const x1 = cx + R * cos(startAngle);
    const y1 = cy + R * sin(startAngle);
    const x2 = cx + R * cos(endAngle);
    const y2 = cy + R * sin(endAngle);
    const x3 = cx + r * cos(endAngle);
    const y3 = cy + r * sin(endAngle);
    const x4 = cx + r * cos(startAngle);
    const y4 = cy + r * sin(startAngle);
    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
    return [
        `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
        `A ${r} ${r} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
        'Z'
    ].join(' ');
}

function buildLegend(segments) {
    const sum = segments.reduce((acc, s) => acc + s.value, 0);
    const ul  = document.createElement('ul');
    ul.className = 'tenant-chart-legend';
    segments.forEach(seg => {
        const pct = Math.round((seg.value / sum) * 100);
        const li  = document.createElement('li');
        li.innerHTML = `
            <span class="legend-dot" style="background:${seg.color}"></span>
            <span class="legend-label">${seg.label}</span>
            <span class="legend-value">€${seg.value} <em>(${pct}%)</em></span>
        `;
        ul.appendChild(li);
    });
    return ul;
}
