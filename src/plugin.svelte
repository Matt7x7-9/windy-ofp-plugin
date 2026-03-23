<div class="plugin__mobile-header">{ title }</div>
<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={ () => bcast.emit('rqstOpen', 'menu') }
    >
        { title }
    </div>

    <!-- GPXファイル選択 -->
    <div class="ofp-section">
        <label class="ofp-label">GPXファイルを選択</label>
        <input
            type="file"
            accept=".gpx,application/gpx+xml,text/xml,application/xml"
            on:click={clearFileInput}
            on:change={loadGpx}
            class="ofp-file-input"
        />
    </div>

    <!-- レイヤー切替ボタン -->
    <div class="ofp-section">
        <label class="ofp-label">レイヤー</label>
        <div class="ofp-overlay-grid">
            {#each OVERLAY_OPTIONS as ov}
                <button
                    class="ofp-ov-btn"
                    class:ofp-ov-active={currentOverlay === ov.key}
                    on:click={() => setOverlay(ov.key)}
                >{ov.icon} {ov.label}</button>
            {/each}
        </div>
    </div>

    <!-- CRZ高度選択（Wind / Turbulenceレイヤー時に表示） -->
    {#if currentOverlayHasLevel}
    <div class="ofp-section ofp-fl-row">
        <label class="ofp-label" style="margin-bottom:0">CRZ</label>
        <select class="ofp-fl-select" bind:value={selectedLevel} on:change={onFlChange}>
            {#each LEVEL_OPTIONS as lv}
                <option value={lv.level}>{lv.label} ≈ FL{lv.fl}</option>
            {/each}
        </select>
    </div>
    {/if}

    <!-- ルート情報 -->
    {#if routeName}
        <div class="ofp-section">
            <div class="ofp-route-name">✈️ {routeName}</div>
            <div class="ofp-stat">{waypointCount} ウェイポイント</div>
        </div>
        <button class="ofp-btn" on:click={clearRoute}>クリア</button>
    {:else}
        <div class="ofp-hint">OFP解析で生成したGPXファイルを<br/>選択してください</div>
    {/if}

    <!-- クリックしたウェイポイントの情報 -->
    {#if selectedWpt}
        <div class="ofp-section ofp-wx-box">
            <div class="ofp-wpt-name">📍 {selectedWpt.name}</div>
            {#if selectedWpt.levels}
                <table class="ofp-wind-table">
                    <thead>
                        <tr>
                            <th class="ofp-th">高度</th>
                            <th class="ofp-th" style="text-align:right">風向</th>
                            <th class="ofp-th" style="text-align:right">風速</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each selectedWpt.levels as lv}
                            <tr class:ofp-current-level={lv.level === selectedLevel}>
                                <td class="ofp-td-level">{lv.label}</td>
                                {#if lv.loading}
                                    <td class="ofp-td-num" colspan="2" style="color:#555">…</td>
                                {:else if lv.error}
                                    <td class="ofp-td-num" colspan="2" style="color:#f88">—</td>
                                {:else}
                                    <td class="ofp-td-num">{lv.windDir}°</td>
                                    <td class="ofp-td-num">{lv.windSpd}kt</td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    {/if}
</section>

<script lang="ts">
    import bcast from '@windy/broadcast';
    import { map } from '@windy/map';
    import { getLatLonInterpolator } from '@windy/interpolator';
    import { onDestroy, onMount } from 'svelte';
    import config from './pluginConfig';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L as typeof import('leaflet');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = (window as any).W.store;

    const { title } = config;

    // レイヤー切替ボタン
    const OVERLAY_OPTIONS = [
        { key: 'wind',        icon: '💨', label: 'Wind',      hasLevel: true },
        { key: 'turbulence',  icon: '〰️', label: 'Turb',      hasLevel: true },
        { key: 'radar',       icon: '🌧', label: 'Radar',     hasLevel: false },
        { key: 'satellite',   icon: '🛰', label: 'Satellite', hasLevel: false },
        { key: 'thunder',     icon: '⛈', label: 'Thunder',   hasLevel: false },
        { key: 'clouds',      icon: '☁️', label: 'Clouds',    hasLevel: false },
        { key: 'icing',       icon: '🧊', label: 'Icing',     hasLevel: false },
        { key: 'cape',        icon: '🌩', label: 'CAPE',      hasLevel: false },
    ];
    let currentOverlay = 'wind';
    $: currentOverlayHasLevel = OVERLAY_OPTIONS.find(o => o.key === currentOverlay)?.hasLevel ?? false;

    function setOverlay(key: string) {
        currentOverlay = key;
        store.set('overlay', key);
        if (currentOverlayHasLevel) store.set('level', selectedLevel);
    }

    // Windyの実際の気圧面（CRZ高度帯）
    const LEVEL_OPTIONS = [
        { level: '150h', label: '150hPa', fl: 450 },
        { level: '200h', label: '200hPa', fl: 390 },
        { level: '250h', label: '250hPa', fl: 340 },
        { level: '300h', label: '300hPa', fl: 300 },
        { level: '400h', label: '400hPa', fl: 240 },
        { level: '500h', label: '500hPa', fl: 180 },
    ];
    let selectedLevel = '200h'; // デフォルト FL390
    $: selectedLevelInfo = LEVEL_OPTIONS.find(l => l.level === selectedLevel)!;

    function onFlChange() {
        store.set('overlay', currentOverlay);
        store.set('level', selectedLevel);
    }

    let routeName = '';
    let waypointCount = 0;
    interface WptLevel {
        level: string; label: string; fl: number;
        windDir: string; windSpd: string;
        loading: boolean; error: boolean;
    }
    let selectedWpt: { name: string; levels?: WptLevel[] } | null = null;
    let fetchId = 0;

    // Leafletレイヤー管理
    let routeLayer: L.Polyline | null = null;
    let markers: L.CircleMarker[] = [];

    // GPXパース
    function parseGpx(text: string): { name: string; points: { lat: number; lon: number; name: string }[] } {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'application/xml');
        const nameEl = doc.querySelector('rte > name');
        const name = nameEl?.textContent || 'Route';
        const rtepts = Array.from(doc.querySelectorAll('rtept'));
        const points = rtepts.map(pt => ({
            lat: parseFloat(pt.getAttribute('lat') || '0'),
            lon: parseFloat(pt.getAttribute('lon') || '0'),
            name: pt.querySelector('name')?.textContent || '',
        }));
        return { name, points };
    }

    function clearFileInput(e: Event) {
        (e.target as HTMLInputElement).value = '';
    }

    // GPXロード
    function loadGpx(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { name, points } = parseGpx(text);
            drawRoute(name, points);
            // GPXロード時にFLに対応したレイヤーを自動セット
            onFlChange();
        };
        reader.readAsText(file);
    }

    // 地図にルートを描画
    function drawRoute(name: string, points: { lat: number; lon: number; name: string }[]) {
        clearRoute();

        routeName = name;
        waypointCount = points.length;

        // ポリライン用pane（クリック透過）
        if (!map.getPane('ofpLinePane')) {
            const pane = map.createPane('ofpLinePane');
            pane.style.zIndex = '650';
            pane.style.pointerEvents = 'none';
        }
        // マーカー用pane（クリック有効）
        if (!map.getPane('ofpMarkerPane')) {
            const pane = map.createPane('ofpMarkerPane');
            pane.style.zIndex = '651';
        }

        // ポリライン
        const latlngs = points.map(p => [p.lat, p.lon] as [number, number]);
        routeLayer = L.polyline(latlngs, {
            color: '#00aaff',
            weight: 3,
            opacity: 0.85,
            pane: 'ofpLinePane',
        }).addTo(map);

        // ウェイポイントマーカー（divIconでDOM描画、間引いて表示）
        markers = [];
        const step = Math.max(1, Math.floor(points.length / 30));
        points.forEach((p, i) => {
            if (i % step !== 0 && i !== points.length - 1) return;
            const isFirst = i === 0;
            const isLast = i === points.length - 1;
            const color = isFirst ? '#00cc44' : isLast ? '#ff4444' : '#00aaff';
            const size = (isFirst || isLast) ? 12 : 8;
            const icon = L.divIcon({
                className: '',
                html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-sizing:border-box;cursor:pointer"></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });
            const marker = L.marker([p.lat, p.lon], { icon, pane: 'ofpMarkerPane' }).addTo(map);
            marker.bindTooltip(p.name, { direction: 'top', opacity: 0.9 });
            marker.on('click', () => fetchWxAtPoint(p));
            markers.push(marker);
        });

        // ルート全体にフィット
        map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
    }

    // ウェイポイントの気象データを取得（全高度帯）
    async function fetchWxAtPoint(p: { lat: number; lon: number; name: string }) {
        // Wind以外のレイヤーは名前だけ表示
        if (currentOverlay !== 'wind') {
            selectedWpt = { name: p.name };
            return;
        }

        const myId = ++fetchId;
        const originalLevel = selectedLevel;

        selectedWpt = {
            name: p.name,
            levels: LEVEL_OPTIONS.map(lv => ({
                ...lv, windDir: '—', windSpd: '—', loading: true, error: false,
            })),
        };

        for (let i = 0; i < LEVEL_OPTIONS.length; i++) {
            if (fetchId !== myId) return; // 新しいクリックがあればキャンセル
            const lv = LEVEL_OPTIONS[i];
            store.set('overlay', 'wind');
            store.set('level', lv.level);

            try {
                await new Promise<void>(resolve => {
                    const timeout = setTimeout(resolve, 3000);
                    bcast.once('redrawFinished', () => { clearTimeout(timeout); resolve(); });
                });
                if (fetchId !== myId) return;

                const interpFn = await getLatLonInterpolator();
                if (!interpFn) { updateLevel(myId, i, { loading: false, error: true }); continue; }

                const result = await interpFn({ lat: p.lat, lon: p.lon });
                if (Array.isArray(result)) {
                    const [u, v] = result as number[];
                    const spd = Math.round(Math.sqrt(u * u + v * v) * 1.944);
                    const dir = Math.round((270 - Math.atan2(v, u) * 180 / Math.PI + 360) % 360);
                    updateLevel(myId, i, { windDir: String(dir), windSpd: String(spd), loading: false, error: false });
                } else {
                    updateLevel(myId, i, { loading: false, error: true });
                }
            } catch {
                updateLevel(myId, i, { loading: false, error: true });
            }
        }

        // 元のレベルに戻す
        if (fetchId === myId) {
            selectedLevel = originalLevel;
            store.set('level', originalLevel);
        }
    }

    function updateLevel(myId: number, index: number, update: Partial<WptLevel>) {
        if (fetchId !== myId || !selectedWpt) return;
        const levels = [...selectedWpt.levels];
        levels[index] = { ...levels[index], ...update };
        selectedWpt = { ...selectedWpt, levels };
    }

    // クリア
    function clearRoute() {
        routeLayer?.remove();
        markers.forEach(m => m.remove());
        routeLayer = null;
        markers = [];
        routeName = '';
        waypointCount = 0;
        selectedWpt = null;
    }

    export const onopen = (_params: unknown) => {};

    onMount(() => {});

    onDestroy(() => {
        clearRoute();
    });
</script>

<style lang="less">
    .ofp-section {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .ofp-label {
        display: block;
        font-size: 11px;
        color: #aaa;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .ofp-fl-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .ofp-fl-select {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        color: #fff;
        font-size: 13px;
        padding: 2px 6px;
        cursor: pointer;
    }
    .ofp-fl-hpa {
        font-size: 11px;
        color: #888;
    }
    .ofp-file-input {
        width: 100%;
        font-size: 12px;
        color: #ddd;
    }
    .ofp-route-name {
        font-size: 13px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 2px;
    }
    .ofp-stat {
        font-size: 11px;
        color: #aaa;
    }
    .ofp-btn {
        margin: 8px 12px;
        padding: 4px 12px;
        background: rgba(255,100,100,0.2);
        border: 1px solid rgba(255,100,100,0.4);
        border-radius: 4px;
        color: #ff8888;
        font-size: 12px;
        cursor: pointer;
        &:hover { background: rgba(255,100,100,0.35); }
    }
    .ofp-hint {
        padding: 16px 12px;
        font-size: 12px;
        color: #888;
        text-align: center;
        line-height: 1.6;
    }
    .ofp-wx-box {
        background: rgba(0,170,255,0.08);
    }
    .ofp-wpt-name {
        font-size: 13px;
        font-weight: bold;
        color: #00aaff;
        margin-bottom: 4px;
    }
    .ofp-wx-row {
        font-size: 12px;
        color: #ccc;
        line-height: 1.8;
    }
    .ofp-overlay-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        margin-top: 4px;
    }
    .ofp-ov-btn {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        color: #bbb;
        font-size: 11px;
        padding: 5px 2px;
        cursor: pointer;
        text-align: center;
        white-space: nowrap;
        &:hover { background: rgba(255,255,255,0.15); }
    }
    .ofp-ov-active {
        background: rgba(0,170,255,0.25);
        border-color: rgba(0,170,255,0.6);
        color: #fff;
    }
    .ofp-wind-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
    }
    .ofp-th {
        font-size: 10px;
        color: #666;
        padding: 2px 4px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .ofp-td-level {
        font-size: 11px;
        color: #999;
        padding: 3px 4px;
    }
    .ofp-td-num {
        font-size: 12px;
        color: #ccc;
        padding: 3px 4px;
        text-align: right;
    }
    .ofp-current-level {
        td {
            color: #fff;
            background: rgba(0,170,255,0.15);
        }
        .ofp-td-level { color: #7df; font-weight: bold; }
    }
</style>
