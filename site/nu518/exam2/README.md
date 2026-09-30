# Offline Study Lab v2 shell

Open `index.html` to see the source-gated shell. Edit `js/data/course.js` only after reading and auditing the course's actual sources. The shell intentionally contains no course claims, questions, cases, Boss drills, or mock blueprints. Filling those is the course build, not part of scaffolding.

The app runs from `file://` without a server or paid API. Progress is stored under the configured browser localStorage key; Data can export and import this course's JSON. A course-specific legacy importer may translate old misses into review priorities, but the shell never treats old results as newly earned mastery.

Every practice item needs a stable id, concept id, source code, evidence tier, prompt, key, explanation and plausible wrong-answer rationales. See `references/v2-content-contract.md` in the skill for the content structure and acceptance checks. Use the skill's v2 validator in shell mode before adding content, then hydrated mode before declaring an exam live.
