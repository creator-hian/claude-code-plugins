"use strict";

let buffer = "";

process.stdin.on("data", (chunk) => {
  buffer += chunk;
});

process.stdin.on("end", () => {
  const event = JSON.parse(buffer);

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: "[IMPORTANT - Re-read carefully] " + event.prompt,
      },
    })
  );
});
