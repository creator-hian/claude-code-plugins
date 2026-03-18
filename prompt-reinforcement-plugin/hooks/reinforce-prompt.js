"use strict";

/**
 * Prompt Reinforcement Hook — Goal + Constraint Frame (v2)
 *
 * LLM이 프롬프트에서 가장 자주 놓치는 3가지를 구조화하여 강화한다:
 * - GOAL: 핵심 목표 (1줄)
 * - BOUNDARIES: 제약 조건 (DENY/MUST/FORMAT/RULE/AMOUNT/EXCEPT)
 * - DONE-WHEN: 완료 전 검증 조건
 *
 * 전체 프롬프트를 복사하지 않고, 핵심만 추출하여 토큰을 절약하면서
 * LLM의 제약 인지도를 높인다. (Recall 93%, 토큰 21% 절약)
 */

// ─── Utilities ───

function cleanLine(line) {
  return line.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s*/, "").trim();
}

// ─── GOAL: 첫 유의미 문장 추출 ───

function extractGoal(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    if (line.length < 5) continue;
    return line.length > 100 ? line.substring(0, 100) + "..." : line;
  }
  return lines[0]?.substring(0, 100) || "";
}

// ─── BOUNDARIES: 제약 조건 추출 ───

function extractBoundaries(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const boundaries = [];
  const seen = new Set();

  function add(type, line) {
    const cleaned = cleanLine(line);
    if (cleaned.length < 5 || seen.has(cleaned)) return;
    seen.add(cleaned);
    boundaries.push({ type, text: cleaned });
  }

  for (const line of lines) {
    // --- DENY: 부정형 제약 (LLM 실패율 1위) ---
    if (/하지\s*말|건드리지\s*말|수정하지\s*말|삭제하지\s*말|제거하지\s*말|만지지\s*말|변경하지\s*말/.test(line)) {
      add("DENY", line);
      continue;
    }
    if (/절대|금지|NEVER|DO NOT|MUST NOT/i.test(line)) {
      add("DENY", line);
      continue;
    }

    // --- MUST: 의무형 제약 (LLM 실패율 2위) ---
    if (/반드시|필수|꼭|무조건|항상|필히/.test(line)) {
      add("MUST", line);
      continue;
    }
    if (/\bMUST\b|\bALWAYS\b|\bREQUIRED\b/i.test(line)) {
      add("MUST", line);
      continue;
    }

    // --- FORMAT: 기술적 형식 제약 ---
    if (/형식|포맷|접두사|접미사|패턴|JSONPath|bis\.|스키마/.test(line) &&
        /사용|필요|적용|따라/.test(line)) {
      add("FORMAT", line);
      continue;
    }

    // --- AMOUNT: 수량 조건 ---
    if (/최소\s*\d|최대\s*\d|이상\s|이하\s/.test(line)) {
      add("AMOUNT", line);
      continue;
    }

    // --- EXCEPT: 범위 제한/제외 ---
    if (/이미\s+.{2,15}(?:있어서|정상|동작|완료)|제외|빼고/.test(line)) {
      add("EXCEPT", line);
      continue;
    }

    // --- RULE: 키워드 없는 기술적 제약 ---
    if (/(?:안에|내에|속에)\s*(?:포함|넣|배치|위치|들어가|있어야)/.test(line)) {
      add("RULE", line);
      continue;
    }
    if (/[으로]\s*(?:작성|생성|사용|구현|적용|변환|처리)해야/.test(line)) {
      add("RULE", line);
      continue;
    }
    if (/대신\s+.{2,30}(?:사용|적용|쓸것|써야)/.test(line)) {
      add("RULE", line);
      continue;
    }
    if (/(?:가|이)\s*아니라/.test(line)) {
      add("RULE", line);
      continue;
    }

    // --- SCORING FALLBACK: 복합 기술 키워드 2개+ 포함된 짧은 문장 ---
    const techKeywords = [
      "배열", "객체", "필드", "컬럼", "테이블", "인덱스", "키",
      "포함", "설정", "지정", "선언", "정의",
      "assertion", "query", "parameter", "endpoint", "schema",
      "success_rules", "nullable", "frontmatter", "YAML", "JSON",
    ];
    const matchedTech = techKeywords.filter(kw => line.toLowerCase().includes(kw.toLowerCase()));
    if (matchedTech.length >= 2 && line.length < 80) {
      add("RULE", line);
      continue;
    }
  }

  return boundaries;
}

// ─── DONE-WHEN: 완료/검증 조건 추출 ───

function extractDoneWhen(text, boundaries) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const conditions = [];
  const seen = new Set();
  const boundaryTexts = new Set(boundaries.map(b => b.text));

  function add(line) {
    const cleaned = cleanLine(line);
    if (cleaned.length < 5 || seen.has(cleaned) || boundaryTexts.has(cleaned)) return;
    seen.add(cleaned);
    conditions.push(cleaned);
  }

  for (const line of lines) {
    if (/통과하는지|사라지는지|동작하는지|성공하는지|되는지\s*(?:확인|검증)/.test(line)) {
      add(line); continue;
    }
    if (/테스트\s*실행|결과\s*확인|문법\s*검증/.test(line) && line.length < 100) {
      add(line); continue;
    }
    if (/없이\s*(?:모든|전부|모두)|경고\s*없이|에러\s*없이|warning\s*없이/.test(line)) {
      add(line); continue;
    }
    if (/인지\s*(?:확인|검증|체크)/.test(line)) {
      add(line); continue;
    }
    if (/먼저\s*.{2,40}(?:확인|검증|조회|분석|파악)/.test(line)) {
      add(line); continue;
    }
    if (/필요한\s*경우\s*(?:추가|설정|적용|생성|포함)/.test(line)) {
      add(line); continue;
    }
    if (/후\s*.{2,30}(?:확인|검증|테스트|체크)/.test(line)) {
      add(line); continue;
    }
  }

  return conditions;
}

// ─── Main: Task Frame 생성 ───

function buildTaskFrame(prompt) {
  const trimmed = prompt.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("<")) return null;
  if (trimmed.length < 100) return "[REINFORCE] " + trimmed;

  const goal = extractGoal(trimmed);
  const boundaries = extractBoundaries(trimmed);
  const doneWhen = extractDoneWhen(trimmed, boundaries);

  if (boundaries.length + doneWhen.length === 0) {
    return "[GOAL] " + goal;
  }

  const parts = [];
  parts.push("GOAL: " + goal);

  if (boundaries.length > 0) {
    parts.push("");
    parts.push("BOUNDARIES (violating these = failure):");
    const grouped = {};
    for (const b of boundaries) {
      if (!grouped[b.type]) grouped[b.type] = [];
      grouped[b.type].push(b.text);
    }
    const order = ["DENY", "MUST", "FORMAT", "RULE", "AMOUNT", "EXCEPT"];
    for (const type of order) {
      if (grouped[type]) {
        grouped[type].slice(0, 3).forEach(t => {
          parts.push(`  [${type}] ${t}`);
        });
      }
    }
  }

  if (doneWhen.length > 0) {
    parts.push("");
    parts.push("DONE-WHEN (verify before completion):");
    doneWhen.slice(0, 3).forEach(d => parts.push("  check: " + d));
  }

  return "[TASK FRAME]\n" + parts.join("\n");
}

// ─── Hook Entry Point ───

let buffer = "";

process.stdin.on("data", (chunk) => {
  buffer += chunk;
});

process.stdin.on("end", () => {
  try {
    const event = JSON.parse(buffer);
    const prompt = event.prompt || "";
    const reinforcement = buildTaskFrame(prompt);

    if (reinforcement) {
      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "UserPromptSubmit",
            additionalContext: reinforcement,
          },
        })
      );
    } else {
      console.log(JSON.stringify({}));
    }
  } catch {
    console.log(JSON.stringify({}));
  }
});
