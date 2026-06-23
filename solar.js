/* Solar Panel Power Dashboard — QBASIC-style rendering */

(function () {
    "use strict";

    // QBASIC color palette
    var C = {
        bg:       "#000080",  // dark blue
        fg:       "#AFAFAF",  // beige
        peak:     "#FFFF00",  // yellow
        grid:     "#606060",  // dark gray
        border:   "#FFFFFF",  // white
        panel:    "#000040",  // darker blue for stats panel
        accent:   "#00FFFF",  // cyan for labels
        red:      "#FF0000"
    };

    var container;
    var svg;
    var svgNS = "http://www.w3.org/2000/svg";

    // ── Helpers ──────────────────────────────────────────────

    function el(tag, attrs, children) {
        var e = document.createElementNS(svgNS, tag);
        if (attrs) {
            for (var k in attrs) e.setAttribute(k, attrs[k]);
        }
        if (children) {
            for (var i = 0; i < children.length; i++) {
                e.appendChild(children[i]);
            }
        }
        return e;
    }

    function div(tag, attrs, children) {
        var e = document.createElement(tag);
        if (attrs) {
            for (var k in attrs) e.style[k] = attrs[k];
        }
        if (children) {
            for (var i = 0; i < children.length; i++) {
                e.appendChild(children[i]);
            }
        }
        return e;
    }

    function pad(s, w) {
        return ("        " + s).slice(-w);
    }

    function niceScale(max) {
        if (max <= 0) return { step: 1, ticks: [0, 1], max: 1 };
        var raw = max / 5;
        var mag = Math.pow(10, Math.floor(Math.log10(raw)));
        var norm = raw / mag;
        var step;
        if (norm < 1.5) step = 1 * mag;
        else if (norm < 3) step = 2 * mag;
        else if (norm < 7) step = 5 * mag;
        else step = 10 * mag;
        var nTicks = Math.ceil(max / step) + 1;
        var ticks = [];
        for (var i = 0; i <= nTicks; i++) ticks.push(i * step);
        return { step: step, ticks: ticks, max: (nTicks) * step };
    }

    function timeLabel(ts) {
        var d = new Date(ts * 1000);
        return pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2);
    }

    function dateLabel(ts) {
        var d = new Date(ts * 1000);
        return pad(d.getMonth() + 1, 2) + "/" + pad(d.getDate(), 2);
    }

    // ── Data processing ──────────────────────────────────────

    function process(raw) {
        var series = raw.s || [];
        var allPoints = [];
        for (var s = 0; s < series.length; s++) {
            var pts = series[s].p || [];
            for (var i = 0; i < pts.length; i++) {
                allPoints.push({ ts: pts[i].ts, v: pts[i].v });
            }
        }
        allPoints.sort(function (a, b) { return a.ts - b.ts; });
        return allPoints;
    }

    function computeStats(points) {
        if (!points.length) return null;
        var current = points[points.length - 1].v;
        var max = -Infinity;
        var sum = 0;
        for (var i = 0; i < points.length; i++) {
            if (points[i].v > max) max = points[i].v;
            sum += points[i].v;
        }
        var avg = sum / points.length;
        // Energy (kWh) via trapezoidal rule
        var energyKwh = 0;
        for (var i = 1; i < points.length; i++) {
            var dt = (points[i].ts - points[i - 1].ts) / 3600; // hours
            energyKwh += (points[i].v + points[i - 1].v) / 2 * dt / 1000;
        }
        return { current: current, max: max, avg: avg, energy: energyKwh, points: points };
    }

    // ── ASCII stats table ────────────────────────────────────

    function asciiTable(stats) {
        if (!stats) return "";
        // Column widths (content between pipes)
        var w = [16, 10, 10, 10];
        var padR = function (s, n) { return s + " ".repeat(n - s.length); };
        var padL = function (s, n) { return " ".repeat(n - s.length) + s; };
        // Build a row: "| " + col1 + "| " + col2 + "| " + col3 + "| " + col4 + " |"
        function row(cells, padFn) {
            var parts = [];
            for (var i = 0; i < cells.length; i++) {
                parts.push((padFn || padR)(cells[i], w[i]));
            }
            return "| " + parts.join(" | ") + " |";
        }
        function sepFor(line) {
            return line.split("").map(function (c) { return c === "|" ? "+" : "-"; }).join("");
        }
        var r1 = row(["STATISTIC", "CURRENT", "MAX", "AVG"]);
        var r2 = row([
            "POWER (W)",
            String(Math.round(stats.current)),
            String(Math.round(stats.max)),
            String(Math.round(stats.avg))
        ], padL);
        return sepFor(r1) + "\n" + r1 + "\n" + sepFor(r2) + "\n" + r2 + "\n" + sepFor(r2);
    }

    // ── ASCII chart ──────────────────────────────────────────

    function asciiChart(stats) {
        if (!stats) return "";
        var pts = stats.points;
        var max = stats.max;
        var min = Infinity;
        for (var i = 0; i < pts.length; i++) {
            if (pts[i].v < min) min = pts[i].v;
        }
        if (min > 0) min = 0;
        var range = max - min;
        if (range <= 0) range = 1;

        var chartW = 80;
        var chartH = 12;
        var lines = [];
        var yLabels = [];

        // Y-axis scale: 6 tick marks
        var step = niceScale(range).step;
        var top = Math.ceil(max / step) * step;
        var bot = Math.floor(min / step) * step;
        var nTicks = Math.min(6, Math.ceil((top - bot) / step) + 1);

        for (var row = 0; row < chartH; row++) {
            var yVal = top - (row / (chartH - 1)) * (top - bot);
            var bar = "";
            for (var col = 0; col < chartW; col++) {
                var idx = Math.floor(col / chartW * pts.length);
                if (idx >= pts.length) idx = pts.length - 1;
                var y = pts[idx].v;
                var yNorm = (y - bot) / (top - bot);
                var rowNorm = row / (chartH - 1);
                // Check if this row is within the bar
                var barTop = (y - bot) / (top - bot);
                var barBot = 0;
                // Simple bar: draw at the top of the bar
                if (yNorm >= rowNorm - 0.01 && yNorm <= rowNorm + 0.01) {
                    if (y >= top - 0.5 * step) bar += "*";
                    else if (y > 0) bar += "#";
                    else bar += " ";
                } else {
                    bar += " ";
                }
            }
            // Y label at every nTicks-1th row
            var yLabel = "";
            if (row === 0) yLabel = " " + String(Math.round(top)).padStart(4);
            else if (row === chartH - 1) yLabel = " " + String(Math.round(bot)).padStart(4);
            else if (row === Math.floor((chartH - 1) / 2)) {
                yLabel = " " + String(Math.round((top + bot) / 2)).padStart(4);
            }
            lines.push(yLabel + bar);
        }
        return lines.join("\n");
    }

    // ── SVG chart ────────────────────────────────────────────

    function computeBuckets(pts) {
        if (!pts.length) return { buckets: [], bucketSize: 1 };
        var vw = window.innerWidth;
        var barWidth = Math.max(1, Math.min(20, vw * 0.005));
        var nBars = Math.max(192, Math.ceil(vw / barWidth));
        var bucketSize = Math.max(1, Math.ceil(pts.length / nBars));
        var buckets = [];
        for (var i = 0; i < pts.length; i += bucketSize) {
            var end = Math.min(i + bucketSize, pts.length);
            var sum = 0, count = 0, maxVal = 0, ts = pts[i].ts;
            for (var j = i; j < end; j++) {
                sum += pts[j].v;
                count++;
                if (pts[j].v > maxVal) maxVal = pts[j].v;
                ts = pts[j].ts;
            }
            buckets.push({ ts: ts, avg: sum / count, max: maxVal, count: count });
        }
        return { buckets: buckets, bucketSize: bucketSize };
    }

    function renderSVG() {
        var stats = container._stats;
        if (!stats) return;
        var buckets = container._buckets;
        if (!buckets.buckets.length) return;

        // Clear previous
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        // SVG takes 75% of viewport height
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var svgH = Math.max(100, Math.floor(vh * 0.6));
        svg.style.height = svgH + "px";

        // Stats panel takes remaining space
        var statsH = container._statsDiv ? container._statsDiv.offsetHeight : 100;
        var remaining = vh - svgH - 60; // 60px for footer + margins
        if (container._statsDiv) {
            container._statsDiv.style.maxHeight = Math.max(0, remaining) + "px";
        }

        var padLeft = 55;
        var padRight = 10;
        var padTop = 25;
        var padBottom = 50;
        var chartW = vw - padLeft - padRight;
        var chartH = svgH - padTop - padBottom;
        var barW = chartW / buckets.buckets.length;

        svg.setAttribute("width", vw);
        svg.setAttribute("height", svgH);
        svg.setAttribute("viewBox", "0 0 " + vw + " " + (svgH + padBottom));

        // Background
        svg.appendChild(el("rect", {
            x: 0, y: 0, width: vw, height: svgH, fill: C.bg
        }));

        // Title
        svg.appendChild(el("text", {
            x: vw / 2, y: 16, fill: C.accent, "font-family": "monospace",
            "font-size": "14", "text-anchor": "middle", "font-weight": "bold"
        }, [document.createTextNode("SOLAR PANEL POWER DASHBOARD")]));

        // Compute scales
        var maxVal = 0;
        for (var i = 0; i < buckets.buckets.length; i++) {
            if (buckets.buckets[i].avg > maxVal) maxVal = buckets.buckets[i].avg;
        }
        var yScale = niceScale(maxVal);
        var yMax = yScale.max || 1;
        var yStep = yScale.step;
        if (yMax <= 0) yMax = 1;

        // Grid lines
        for (var tick = 0; tick <= yScale.ticks.length; tick++) {
            var tv = yScale.ticks[tick];
            if (tv > yMax) break;
            var y = padTop + chartH - (tv / yMax) * chartH;
            if (y < padTop - 1 || y > padTop + chartH + 1) continue;
            svg.appendChild(el("line", {
                x1: padLeft, y1: y, x2: padLeft + chartW, y2: y,
                stroke: C.grid, "stroke-width": "1"
            }));
            // Y label
            svg.appendChild(el("text", {
                x: padLeft - 5, y: y + 4, fill: C.fg,
                "font-family": "monospace", "font-size": "10",
                "text-anchor": "end"
            }, [document.createTextNode(Math.round(tv))]));
        }

        // X-axis labels
        var pts = stats.points;
        var firstTs = pts[0].ts;
        var lastTs = pts[pts.length - 1].ts;
        var spanHours = (lastTs - firstTs) / 3600;
        var xStep;
        var xLabelFormat;
        if (spanHours <= 2) {
            xStep = 30 * 60; // 30 min
            xLabelFormat = function (d) {
                return pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2);
            };
        } else if (spanHours <= 12) {
            xStep = 15 * 60; // 15 min
            xLabelFormat = function (d) {
                return pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2);
            };
        } else {
            xStep = 3600; // 1 hour
            xLabelFormat = function (d) {
                return pad(d.getHours(), 2) + ":00";
            };
        }

        // Draw bars
        for (var i = 0; i < buckets.buckets.length; i++) {
            var b = buckets.buckets[i];
            var x = padLeft + i * barW;
            var barH = yMax > 0 ? (b.avg / yMax) * chartH : 0;
            var y = yMax > 0 ? padTop + chartH - barH : padTop + chartH;

            // Bar color: peak in yellow, normal in beige
            var barColor = C.fg;
            if (b.avg >= yStep * 0.9) barColor = C.peak;

            svg.appendChild(el("rect", {
                x: x, y: y, width: barW, height: barH,
                fill: barColor
            }));
        }

        // X-axis labels (thinned to fit)
        var labelInterval = Math.max(1, Math.floor(buckets.buckets.length / 10));
        for (var i = 0; i < buckets.buckets.length; i += labelInterval) {
            var b = buckets.buckets[i];
            var x = padLeft + i * barW + barW / 2;
            var d = new Date(b.ts * 1000);
            var label;
            if (spanHours <= 2) {
                label = pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2);
            } else if (spanHours <= 12) {
                label = pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2);
            } else {
                label = pad(d.getHours(), 2) + ":00";
            }
            svg.appendChild(el("text", {
                x: x, y: padTop + chartH + 14, fill: C.fg,
                "font-family": "monospace", "font-size": "9",
                "text-anchor": "middle"
            }, [document.createTextNode(label)]));
        }

        // Axes
        svg.appendChild(el("line", {
            x1: padLeft, y1: padTop + chartH,
            x2: padLeft + chartW, y2: padTop + chartH,
            stroke: C.border, "stroke-width": "1"
        }));
        svg.appendChild(el("line", {
            x1: padLeft, y1: padTop,
            x2: padLeft, y2: padTop + chartH,
            stroke: C.border, "stroke-width": "1"
        }));

        // Y-axis label
        svg.appendChild(el("text", {
            x: 12, y: padTop + chartH / 2, fill: C.accent,
            "font-family": "monospace", "font-size": "10",
            "text-anchor": "middle", transform: "rotate(-90, 12, " + (padTop + chartH / 2) + ")"
        }, [document.createTextNode("POWER (W)")]));

        // X-axis label
        svg.appendChild(el("text", {
            x: padLeft + chartW / 2, y: padTop + chartH + 28,
            fill: C.accent, "font-family": "monospace", "font-size": "10",
            "text-anchor": "middle"
        }, [document.createTextNode("TIME")]));

    }

    // ── Main ─────────────────────────────────────────────────

    function render() {
        container = document.getElementById("solar-container");
        if (!container) return;

        // Build layout
        container.innerHTML = "";
        container.style.cssText = "background:" + C.bg + ";color:" + C.fg +
            ";font-family:monospace;font-size:13px;padding:10px;overflow:auto;";

        // Stats panel (ASCII)
        var statsDiv = div("pre", {
            "font-family": "monospace", "font-size": "13px",
            "color": C.fg, "margin": "0 0 15px 0", "white-space": "pre"
        }, []);
        container.appendChild(statsDiv);

        // Divider
        container.appendChild(document.createTextNode("\n"));

        // SVG chart — constrained to remaining viewport space
        svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.style.cssText = "display:block;width:100%;";
        container.appendChild(svg);

        // Footer
        container.appendChild(document.createTextNode("\n"));
        var footer = div("div", {
            "font-family": "monospace", "font-size": "11px",
            "color": C.fg, "text-align": "center", "margin-top": "10px"
        }, [document.createTextNode("[ Last scrape: loading... ]")]);
        container.appendChild(footer);
        container._footer = footer;
    }

    function fetchAndRender() {
        fetch("https://maison.jbbesnard.pro/metrics/solar")
            .then(function (r) { return r.json(); })
            .then(function (raw) {
                var points = process(raw);
                var stats = computeStats(points);
                var buckets = computeBuckets(points);

                container._stats = stats;
                container._buckets = buckets;

                // Update ASCII stats
                var statsText = div("pre", {
                    "font-family": "monospace", "font-size": "13px",
                    "color": C.fg, "white-space": "pre",
                    "margin": "0 0 15px 0",
                    "border-top": "1px solid " + C.grid,
                    "border-bottom": "1px solid " + C.grid,
                    "padding": "5px 0",
                    "line-height": "1.2"
                }, []);
                statsText.textContent = asciiTable(stats);
                container.insertBefore(statsText, container.firstChild);
                container._statsDiv = statsText;

                // Update footer
                container._footer.textContent = "[ Last scrape: " + new Date(raw.last_scrape * 1000).toLocaleString() + " ]";

                renderSVG();
            })
            .catch(function (e) {
                container._footer.textContent = "[ Error: " + e.message + " ]";
            });
    }

    // Init
    render();
    fetchAndRender();

    // Resize handler
    var resizeTimer;
    window.onresize = function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            renderSVG();
        }, 100);
    };

})();
