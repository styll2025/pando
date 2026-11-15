import { esc } from './util.js';
export const page = (title, body) => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>
body{margin:0;background:#fff2ea;color:#4d2831;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.45}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 28px;border-bottom:1px solid #4d2831}
header img{height:16px}main{padding:28px;max-width:1280px;margin:0 auto}
h1{font-weight:300;font-size:30px;margin:0 0 18px}h2{font-weight:400;font-size:19px;margin:28px 0 10px}
.tw{overflow-x:auto;background:#fff;border:1px solid #4d2831;border-radius:18px}
table{border-collapse:collapse;width:100%;min-width:900px}th,td{text-align:left;padding:10px 14px;border-bottom:1px solid rgba(77,40,49,.15);vertical-align:top}
th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:#d1e6e9}
.pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px}
.red{background:#4d2831;color:#fff2ea}.amber{background:#fe600c;color:#000}.green{background:#d1e6e9}
a{color:#4d2831}.muted{color:#6b4a51}.msg{background:#fff;border:1px solid rgba(77,40,49,.2);border-radius:14px;padding:10px 14px;margin:6px 0;white-space:pre-wrap}
.msg.p{background:#4d2831;color:#fff2ea;border-color:#4d2831;margin-left:12%}.filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.filters a{padding:6px 14px;border:1px solid #4d2831;border-radius:999px;text-decoration:none;font-size:13px}.filters a.on{background:#4d2831;color:#fff2ea}
</style></head><body><header><img src="/brand/logo-plum.svg" alt="The Good Span"><span class="muted">Coach view</span></header><main>${body}</main></body></html>`;
