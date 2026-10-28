export const idCardStyles = `
.id-card-faces { display:flex; flex-direction:column; gap:16px; align-items:center; }
.id-card-face-label { margin:0 0 6px; font-size:12px; font-weight:600; color:#64748b; }
.school-id-card { box-sizing:border-box; width:85.6mm; height:53.98mm; border:0.25mm solid #2563eb; border-radius:3mm; overflow:hidden; background:white; color:#172554; font-family:Arial,sans-serif; display:flex; flex-direction:column; flex-shrink:0; break-inside:avoid; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
.school-id-card * { box-sizing:border-box; }
.id-card-header { height:12mm; flex-shrink:0; display:flex; align-items:center; gap:2mm; padding:2mm 3mm; background:#1d4ed8; color:white; }
.id-card-logo { width:8mm; height:8mm; object-fit:contain; background:white; border-radius:1mm; }
.id-card-school { font-size:9pt; line-height:1.2; font-weight:700; overflow-wrap:anywhere; }
.id-card-body { display:grid; grid-template-columns:16mm minmax(0,1fr) 25mm; gap:2mm; padding:3mm; flex:1; min-height:0; align-items:start; }
.id-card-photo { width:16mm; height:21mm; object-fit:cover; border-radius:1.5mm; border:0.25mm solid #bfdbfe; }
.id-card-initials { display:flex; align-items:center; justify-content:center; background:#eff6ff; font-size:16pt; font-weight:700; }
.id-card-name { margin:0 0 1.5mm; font-size:9pt; font-weight:700; line-height:1.1; overflow-wrap:anywhere; }
.id-card-label { font-size:5.5pt; text-transform:uppercase; color:#475569; margin:0.8mm 0 0.4mm; }
.id-card-value { margin:0; font-size:6.5pt; line-height:1.1; overflow-wrap:anywhere; }
.id-card-qr { width:25mm; height:25mm; display:block; image-rendering:pixelated; }
.id-card-scan { margin:0; text-align:center; font-size:5.5pt; color:#475569; }
.id-card-footer { flex-shrink:0; padding:1mm 3mm; background:#eff6ff; border-top:0.25mm solid #bfdbfe; font-size:6pt; font-weight:700; letter-spacing:0.3mm; text-transform:uppercase; }
.id-card-footer-split { display:flex; align-items:center; justify-content:space-between; gap:2mm; }
.id-card-footer-split .id-card-footer-primary { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
.id-card-footer-split .id-card-footer-secondary { flex-shrink:0; }
.student-id-card .id-card-header { height:13mm; background:#173e83; }
.student-id-kicker { margin-top:1mm; font-size:5.5pt; letter-spacing:0.45mm; text-transform:uppercase; }
.student-id-front-body { display:grid; grid-template-columns:22mm minmax(0,1fr); gap:4mm; padding:3mm 4mm; flex:1; min-height:0; align-items:start; }
.student-id-front-body .id-card-photo { width:22mm; height:28mm; border-radius:1mm; border:0.3mm solid #cbd5e1; }
.student-id-details { min-width:0; }
.student-id-details .id-card-label { margin:0 0 0.7mm; font-size:5.5pt; letter-spacing:0.2mm; }
.student-id-details .id-card-name { font-size:10pt; line-height:1.15; margin:0 0 2mm; }
.student-id-details .id-card-value { font-size:7pt; line-height:1.2; }
.student-id-number { font-weight:700; }
.student-id-meta { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:2mm; margin-top:2mm; }
.student-id-card .id-card-footer { text-transform:none; letter-spacing:0; font-size:5.5pt; line-height:1.2; padding:1.3mm 4mm; }
.student-id-back-header { padding:2.5mm 4mm; font-size:8pt; font-weight:700; color:#173e83; border-bottom:0.4mm solid #173e83; }
.student-id-back-body { display:grid; grid-template-columns:minmax(0,1fr) 29mm; align-items:center; gap:3mm; padding:3mm 4mm; flex:1; min-height:0; }
.student-id-return { min-width:0; font-size:6.5pt; line-height:1.25; overflow-wrap:anywhere; }
.student-id-return h2 { margin:0 0 1.5mm; font-size:7pt; }
.student-id-return p { margin:0 0 1mm; }
.student-id-office { font-weight:700; }
.student-id-back-body .id-card-qr { width:29mm; height:29mm; }
`
