/* Open-Source LLMs Dashboard — QBASIC-style rendering */

(function () {
    "use strict";

    // QBASIC color palette
    var C = {
        bg:       "#000080",
        fg:       "#AFAFAF",
        peak:     "#FFFF00",
        grid:     "#606060",
        border:   "#FFFFFF",
        accent:   "#00FFFF",
        promptCol:"#FF00FF",  // magenta for prompts
        genCol:   "#00FF00"   // green for generations
    };

    var container, svg, svgPrompt, svgGen, svgNS = "http://www.w3.org/2000/svg";

    // ── Helpers ──────────────────────────────────────────────

    function el(tag, attrs, children) {
        var e = document.createElementNS(svgNS, tag);
        if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (children) for (var i = 0; i < children.length; i++) e.appendChild(children[i]);
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

    // ── Data processing ──────────────────────────────────────

    function processMatrix(raw) {
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

    function processVector(raw) {
        var series = raw.s || [];
        var result = {};
        for (var s = 0; s < series.length; s++) {
            var name = series[s].n || "unknown";
            result[name] = { v: series[s].v, ts: series[s].ts };
        }
        return result;
    }

    function processInstant(raw) {
        var series = raw.s || [];
        if (!series.length) return 0;
        return series[0].v || 0;
    }

    function formatTokens(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
        if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
        if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
        return String(Math.round(n));
    }

    // ── ASCII stats table ────────────────────────────────────

    function asciiTable(prompts, gens, rates) {
        // Column widths
        var w = [16, 14, 14, 14, 14, 14, 14];
        var padR = function (s, n) { return s + " ".repeat(Math.max(0, n - s.length)); };
        var padL = function (s, n) { return " ".repeat(Math.max(0, n - s.length)) + s; };
        // Build row: "| " + col1 + "| " + col2 + "| " + col3 + "| " + col4 + "| " + col5 + "| " + col6 + "| " + col7 + " |"
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
        var r1 = row(["STATISTIC", "TOTAL PROMPTS", "TOTAL GEN", "PROMPT TODAY", "GEN TODAY", "PRED TOK/S", "PROMPT TOK/S"]);
        var r2 = row([
            "TOKENS",
            formatTokens(prompts.total || 0),
            formatTokens(gens.total || 0),
            formatTokens(prompts.today || 0),
            formatTokens(gens.today || 0),
            String(Math.round(rates.predTokSec || 0)),
            String(Math.round(rates.promptTokSec || 0))
        ], padL);
        return sepFor(r1) + "\n" + r1 + "\n" + sepFor(r2) + "\n" + r2 + "\n" + sepFor(r2);
    }

    // ── Dynamic bucketing (same as solar) ────────────────────

    function computeBuckets(pts, vw) {
        if (!pts.length) return { buckets: [], bucketSize: 1 };
        // One bar per data point, each bar 8px wide, cap at 192 for very dense data
        var barWidth = Math.max(8, Math.min(16, vw / pts.length));
        var nBars = pts.length;
        var bucketSize = 1;
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

    // ── SVG chart rendering (same style as solar) ────────────

    function renderChart(svgEl, stats, color, label, yLabel) {
        if (!stats) return;
        var pts = stats.points;
        var buckets = stats.buckets;
        if (!buckets.buckets.length) return;

        while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var svgH = Math.max(100, Math.floor(vh * 0.6));
        svgEl.style.height = svgH + "px";

        var padLeft = 55;
        var padRight = 10;
        var padTop = 25;
        var padBottom = 50;
        var chartW = vw - padLeft - padRight;
        var chartH = svgH - padTop - padBottom;
        var barW = chartW / buckets.buckets.length;

        svgEl.setAttribute("width", vw);
        svgEl.setAttribute("height", svgH);
        svgEl.setAttribute("viewBox", "0 0 " + vw + " " + (svgH + padBottom));

        // Background
        svgEl.appendChild(el("rect", {
            x: 0, y: 0, width: vw, height: svgH, fill: C.bg
        }));

        // Title
        svgEl.appendChild(el("text", {
            x: vw / 2, y: 16, fill: C.accent, "font-family": "monospace",
            "font-size": "14", "text-anchor": "middle", "font-weight": "bold"
        }, [document.createTextNode(label)]));

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
            svgEl.appendChild(el("line", {
                x1: padLeft, y1: y, x2: padLeft + chartW, y2: y,
                stroke: C.grid, "stroke-width": "1"
            }));
            svgEl.appendChild(el("text", {
                x: padLeft - 5, y: y + 4, fill: C.fg,
                "font-family": "monospace", "font-size": "10",
                "text-anchor": "end"
            }, [document.createTextNode(formatTokens(Math.round(tv)))]));
        }

        // X-axis labels — time-based step intervals
        var firstTs = pts[0].ts;
        var lastTs = pts[pts.length - 1].ts;
        var spanHours = (lastTs - firstTs) / 3600;
        var spanDays = spanHours / 24;
        var xStep;
        var labelFmt;
        if (spanDays < 1) {
            xStep = 3600;
            labelFmt = function (d) { return pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2); };
        } else if (spanDays < 7) {
            xStep = 3 * 3600;
            labelFmt = function (d) { return pad(d.getHours(), 2) + ":00"; };
        } else if (spanDays < 60) {
            xStep = 12 * 3600;
            labelFmt = function (d) { return pad(d.getMonth() + 1, 2) + "/" + pad(d.getDate(), 2); };
        } else {
            xStep = 7 * 24 * 3600;
            labelFmt = function (d) { return pad(d.getMonth() + 1, 2) + "/" + pad(d.getDate(), 2); };
        }

        // Snap nextTick to the next aligned boundary
        var nextTick = firstTs + xStep - ((firstTs % xStep) + xStep) % xStep;
        for (var i = 0; i < buckets.buckets.length; i++) {
            var b = buckets.buckets[i];
            if (b.ts >= nextTick) {
                var d = new Date(b.ts * 1000);
                var x = padLeft + i * barW + barW / 2;
                svgEl.appendChild(el("text", {
                    x: x, y: padTop + chartH + 14, fill: C.fg,
                    "font-family": "monospace", "font-size": "9",
                    "text-anchor": "middle"
                }, [document.createTextNode(labelFmt(d))]));
                nextTick += xStep;
            }
        }

        // Draw bars
        for (var i = 0; i < buckets.buckets.length; i++) {
            var b = buckets.buckets[i];
            var x = padLeft + i * barW;
            var barH = yMax > 0 ? (b.avg / yMax) * chartH : 0;
            var y = yMax > 0 ? padTop + chartH - barH : padTop + chartH;

            var barColor = C.fg;
            if (b.avg >= yStep * 0.9) barColor = C.peak;
            else barColor = color || C.fg;

            svgEl.appendChild(el("rect", {
                x: x, y: y, width: barW, height: barH,
                fill: barColor
            }));
        }

        // Axes
        svgEl.appendChild(el("line", {
            x1: padLeft, y1: padTop + chartH,
            x2: padLeft + chartW, y2: padTop + chartH,
            stroke: C.border, "stroke-width": "1"
        }));
        svgEl.appendChild(el("line", {
            x1: padLeft, y1: padTop,
            x2: padLeft, y2: padTop + chartH,
            stroke: C.border, "stroke-width": "1"
        }));

        // Y-axis label
        svgEl.appendChild(el("text", {
            x: 12, y: padTop + chartH / 2, fill: C.accent,
            "font-family": "monospace", "font-size": "10",
            "text-anchor": "middle", transform: "rotate(-90, 12, " + (padTop + chartH / 2) + ")"
        }, [document.createTextNode(yLabel)]));

        // X-axis label
        svgEl.appendChild(el("text", {
            x: padLeft + chartW / 2, y: padTop + chartH + 28,
            fill: C.accent, "font-family": "monospace", "font-size": "10",
            "text-anchor": "middle"
        }, [document.createTextNode("TIME")]));

        // Footer
        var footerText = "Last scrape: " + new Date(pts[pts.length - 1].ts * 1000).toLocaleString();
        // Footer — skip to avoid duplication
    }

    // ── Main ─────────────────────────────────────────────────

    function render() {
        container = document.getElementById("llama-container");
        if (!container) return;

        container.innerHTML = "";
        container.style.cssText = "background:" + C.bg + ";color:" + C.fg +
            ";font-family:monospace;font-size:13px;padding:10px;overflow:auto;";

        // Stats panel
        var statsDiv = document.createElement("pre");
        statsDiv.style.cssText = "font-family:monospace;font-size:13px;color:" + C.fg +
            ";white-space:pre;margin:0 0 15px 0;line-height:1.2;";
        container.appendChild(statsDiv);
        container._statsDiv = statsDiv;

        // SVG chart areas — two separate containers
        svgPrompt = document.createElementNS(svgNS, "svg");
        svgPrompt.style.cssText = "display:block;width:100%;";
        container.appendChild(svgPrompt);

        container.appendChild(document.createTextNode("\n\n"));

        svgGen = document.createElementNS(svgNS, "svg");
        svgGen.style.cssText = "display:block;width:100%;";
        container.appendChild(svgGen);

        // Footer
        var footer = document.createElement("div");
        footer.style.cssText = "font-family:monospace;font-size:11px;color:" + C.fg +
            ";text-align:center;margin-top:10px;";
        footer.textContent = "[ Loading... ]";
        container.appendChild(footer);
        container._footer = footer;
    }

    function fetchAndRender() {
        Promise.all([
            fetch("https://maison.jbbesnard.pro/metrics/llamaprompt").then(function (r) { return r.json(); }),
            fetch("https://maison.jbbesnard.pro/metrics/llamagen").then(function (r) { return r.json(); }),
            fetch("https://maison.jbbesnard.pro/metrics/prompttoday").then(function (r) { return r.json(); }),
            fetch("https://maison.jbbesnard.pro/metrics/gentoday").then(function (r) { return r.json(); }),
            fetch("https://maison.jbbesnard.pro/metrics/predtoks").then(function (r) { return r.json(); }),
            fetch("https://maison.jbbesnard.pro/metrics/prompttoks").then(function (r) { return r.json(); })
        ]).then(function (results) {
            var promptData = processMatrix(results[0]);
            var genData = processMatrix(results[1]);
            var promptToday = processVector(results[2]);
            var genToday = processVector(results[3]);
            var predTokSec = processInstant(results[4]);
            var promptTokSec = processInstant(results[5]);

            // Get total from last data point of time series
            var totalPrompts = promptData.length ? promptData[promptData.length - 1].v : 0;
            var totalGens = genData.length ? genData[genData.length - 1].v : 0;

            // Buckets
            var vw = window.innerWidth;
            var promptBuckets = computeBuckets(promptData, vw);
            var genBuckets = computeBuckets(genData, vw);

            container._stats = {
                points: promptData, genPoints: genData,
                buckets: promptBuckets, genBuckets: genBuckets,
                total: totalPrompts, totalGen: totalGens,
                todayPrompt: promptToday, todayGen: genToday
            };

            // Update ASCII table
            var todayPromptVal = promptToday && promptToday["__unknown__"] ? promptToday["__unknown__"].v : 0;
            var todayGenVal = genToday && genToday["__unknown__"] ? genToday["__unknown__"].v : 0;
            container._statsDiv.textContent = asciiTable(
                { total: totalPrompts, today: todayPromptVal },
                { total: totalGens, today: todayGenVal },
                { predTokSec: predTokSec, promptTokSec: promptTokSec }
            );

            // Render both charts
            renderChart(svgPrompt, { points: promptData, buckets: promptBuckets }, C.promptCol, "PROMPT TOKENS OVER TIME", "TOKENS (DAY)");
            renderChart(svgGen, { points: genData, buckets: genBuckets }, C.genCol, "GENERATED TOKENS OVER TIME", "TOKENS (DAY)");

            container._footer.textContent = "[ Last scrape: " + new Date(
                Math.max(promptData[promptData.length - 1].ts, genData[genData.length - 1].ts) * 1000
            ).toLocaleString() + " ]";
        }).catch(function (e) {
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
            var s = container._stats;
            if (s) {
                var vw = window.innerWidth;
                s.buckets = computeBuckets(s.points, vw);
                s.genBuckets = computeBuckets(s.genPoints, vw);
                renderChart(svgPrompt, { points: s.points, buckets: s.buckets }, C.promptCol, "PROMPT TOKENS OVER TIME", "TOKENS (S)");
                renderChart(svgGen, { points: s.genPoints, buckets: s.genBuckets }, C.genCol, "GENERATED TOKENS OVER TIME", "TOKENS (S)");
            }
        }, 100);
    };

})();
