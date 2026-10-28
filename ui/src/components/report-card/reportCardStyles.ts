export const reportCardStyles = `
.report-card { --rc-dark:color-mix(in srgb,var(--rc-accent,#1d4ed8) 78%,black); --rc-tint:color-mix(in srgb,var(--rc-accent,#1d4ed8) 8%,white); --rc-line:color-mix(in srgb,var(--rc-accent,#1d4ed8) 25%,white); box-sizing:border-box; width:210mm; min-height:297mm; padding:12mm; background:white; color:#0f172a; font-family:Arial,sans-serif; font-size:10pt; display:flex; flex-direction:column; gap:6mm; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
.report-card * { box-sizing:border-box; }
.rc-header { display:flex; align-items:center; gap:5mm; padding-bottom:4mm; border-bottom:0.8mm solid var(--rc-accent,#1d4ed8); }
.rc-logo { width:20mm; height:20mm; object-fit:contain; }
.rc-school { flex:1; min-width:0; text-align:center; }
.rc-school-name { margin:0; font-size:17pt; font-weight:700; color:var(--rc-dark); text-transform:uppercase; overflow-wrap:anywhere; }
.rc-school-contact { margin:1mm 0 0; font-size:8.5pt; color:#475569; overflow-wrap:anywhere; }
.rc-title { margin:0; text-align:center; font-size:13pt; font-weight:700; letter-spacing:0.5mm; text-transform:uppercase; color:var(--rc-accent,#1d4ed8); }
.rc-info { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:3mm 6mm; padding:4mm; border:0.3mm solid #cbd5e1; border-radius:2mm; background:#f8fafc; }
.rc-label { margin:0; font-size:7.5pt; text-transform:uppercase; letter-spacing:0.2mm; color:#64748b; }
.rc-value { margin:0.5mm 0 0; font-size:10pt; font-weight:700; overflow-wrap:anywhere; }
.rc-table { width:100%; border-collapse:collapse; font-size:9.5pt; }
.rc-table th { padding:2mm; background:var(--rc-accent,#1d4ed8); color:white; border:0.3mm solid var(--rc-accent,#1d4ed8); text-align:center; font-weight:700; }
.rc-table td { padding:1.8mm 2mm; border:0.3mm solid #cbd5e1; text-align:center; }
.rc-table th:first-child, .rc-table td:first-child { text-align:left; }
.rc-table tbody tr:nth-child(even) { background:#f8fafc; }
.rc-table tr { break-inside:avoid; }
.rc-total { font-weight:700; }
.rc-summary { display:grid; grid-template-columns:repeat(var(--rc-stat-count,3),minmax(0,1fr)); gap:4mm; }
.rc-stat { padding:3mm; text-align:center; border:0.3mm solid var(--rc-line); border-radius:2mm; background:var(--rc-tint); break-inside:avoid; }
.rc-stat-value { margin:1mm 0 0; font-size:15pt; font-weight:700; color:var(--rc-dark); }
.rc-remark { padding:3mm 4mm; border:0.3mm solid #cbd5e1; border-radius:2mm; min-height:18mm; break-inside:avoid; }
.rc-remark-text { margin:1mm 0 0; font-size:10pt; line-height:1.4; overflow-wrap:anywhere; }
.rc-signatures { display:grid; grid-template-columns:repeat(var(--rc-sign-count,3),minmax(0,1fr)); gap:10mm; margin-top:auto; padding-top:12mm; break-inside:avoid; }
.rc-signature { border-top:0.3mm solid #475569; padding-top:1.5mm; text-align:center; font-size:8.5pt; color:#475569; }
.rc-signature-name { display:block; margin-bottom:0.5mm; font-size:9.5pt; font-weight:700; color:#0f172a; }
.rc-footer { text-align:center; font-size:8pt; color:#64748b; }
`
