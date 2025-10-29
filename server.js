const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const distPath = path.join(__dirname, "dist");
const srcPath = path.join(__dirname);
app.use(express.static(distPath));
app.use(express.static(srcPath));

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

function sendEmail(subject, text, html) {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) return;
  const data = JSON.stringify({ from: "Assessment App <onboarding@resend.dev>", to: [ADMIN_EMAIL], subject, text, html });
  const options = { hostname: "api.resend.com", path: "/emails", method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Length": Buffer.byteLength(data) } };
  const req = https.request(options, (res) => { if (res.statusCode>=200 && res.statusCode<300) console.log("📧 Email sent via Resend"); else console.error("❌ Email failed:", res.statusCode); });
  req.on("error", (err) => console.error("❌ Email send failed:", err.message));
  req.write(data); req.end();
}

app.post("/api/submit", (req, res) => {
  try{
    const { answers = [], quizPath = "", topic = "Assessment" } = req.body;
    if(!quizPath) return res.status(400).json({ error: "quizPath required" });
    const file = path.join(__dirname, quizPath.replace(/^\//,''));
    const quiz = JSON.parse(fs.readFileSync(file, "utf8"));
    let score = 0;
    const detail = quiz.questions.map((q, i) => { const ok = (answers[i] === q.answer); if (ok) score++; return { q: q.question, user: answers[i]||"-", correct: q.answer, ok, explanation: q.explanation||"" }; });
    const percent = (score / quiz.questions.length) * 100;
    const text = `Result – ${topic}: ${score}/${quiz.questions.length} (${percent.toFixed(1)}%)`;
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;"><h2 style="color:#2563eb;">${topic} – Assessment Report</h2><p><strong>Score:</strong> ${score}/${quiz.questions.length} (${percent.toFixed(1)}%)</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f3f4f6"><th>#</th><th>Question</th><th>Your</th><th>Correct</th><th>OK?</th></tr></thead><tbody>${detail.map((d,i)=>`<tr style='border-top:1px solid #e5e7eb'><td style='padding:6px'>${i+1}</td><td style='padding:6px'>${d.q}</td><td style='padding:6px'>${d.user}</td><td style='padding:6px'>${d.correct}</td><td style='padding:6px'>${d.ok?'✅':'❌'}</td></tr>${d.explanation ? `<tr><td></td><td colspan="4" style="padding:6px;color:#4b5563">💬 ${d.explanation}</td></tr>` : ""}
`).join('')}</tbody></table></div>`;
    sendEmail(`Result – ${topic}`, text, html);
    res.json({ score, total: quiz.questions.length, percent, detail });
  }catch(e){ console.error(e); res.status(500).json({ error: "Submission failed" }); }
});

app.get("*", (req, res) => {
  const built = path.join(distPath, "index.html");
  if (fs.existsSync(built)) return res.sendFile(built);
  return res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Beyond Grades server on http://localhost:${PORT}`));
