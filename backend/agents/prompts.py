# ScriptOS Technique Libraries & Agent Prompts

HOOKS_LIBRARY = {
    "Forbidden": [
        "The strategy YouTube creators are legally forbidden from showing you in courses.",
        "There is a single setting in your workflow that silicon valley engineers never turn on.",
        "What psychologists call the 'dark retention loop' that app developers hide behind clean UI.",
        "The reason top podcasters delete the first 90 seconds of their raw audio before posting.",
        "Do not use this writing technique unless you want people glued to the screen until 3 AM."
    ],
    "Contrarian": [
        "Your morning routine isn't making you productive. It's making you exhausted by 11 AM.",
        "Consistency is the single worst piece of advice given to beginners in 2026.",
        "Working harder on your video edits actually tanks your audience retention. Here is why.",
        "Why waking up at 5 AM is quietly ruining your cognitive output.",
        "The most successful creators don't build habits. They build single-point failure triggers."
    ],
    "Failure": [
        "I posted for 47 consecutive days with zero views until day 48 when I changed just 4 words.",
        "I spent $12,000 on studio cameras only to discover my worst-looking video made 10x more.",
        "My channel was dead for 8 months. Here is the exact mistake that caused the death spiral.",
        "We lost 73% of our audience in the first 25 seconds because of a classic beginner assumption.",
        "I tried following the 10,000 hour rule for two years. It was a complete disaster."
    ],
    "Visual Shock Stat": [
        "82% of people who start this system quit within 72 hours. Not because it's hard, but because of this trap.",
        "This one subtle phrasing shift increases your viewer hold rate by 340% according to retention logs.",
        "Every 4 seconds your viewer's brain looks for an excuse to leave. Here is how you stop it.",
        "The average attention span didn't drop to 8 seconds. It adapted to detect fluff in 0.8 seconds.",
        "94% of videos on this topic fail for one reason: they answer questions nobody asked."
    ],
    "Confession": [
        "I need to apologize, because two years ago I taught you the exact opposite of what works now.",
        "I used to think retention was about fast jump-cuts. I was completely wrong.",
        "Here is the embarrassing shortcut I used when I had zero motivation to write scripts.",
        "The truth about why most creator advice sounds smart but doesn't work in the real world.",
        "I secretly tested two identical videos with different psychological pacing. The outcome shocked me."
    ],
    "The Challenge": [
        "Try this exact 3-step test on your next project, and if it doesn't work, unsubscribe immediately.",
        "If you can watch the first 60 seconds of this breakdown without feeling exposed, you are in the top 1%.",
        "Give me 7 minutes, and I will permanently ruin how you watch video essays forever.",
        "Pause this right now and check your last draft. I guarantee you made this mistake on page one.",
        "Most people won't make it to chapter 3 of this breakdown because the reality hurts too much."
    ],
    "The Secret Economy": [
        "There is an invisible marketplace where attention is bought and sold without your knowledge.",
        "Why big channels pay $5,000 per script for this exact retention structure.",
        "The hidden cost of bad pacing isn't low views—it's algorithmic blacklisting.",
        "How a single word choice quietly drains $10,000 from creator sponsorships.",
        "The currency of modern media isn't information. It's curiosity debt."
    ],
    "The Identity Attack": [
        "You don't have an attention problem. You have a friction tolerance problem.",
        "You think you're a perfectionist, but psychological data shows you're actually terrified of feedback.",
        "The reason you haven't published that project isn't lack of time—it's this psychological loop.",
        "If you've bought more than two productivity apps this year, this video is specifically for you.",
        "Stop calling it 'research' when you're just procrastinating on making the hard decision."
    ],
    "The Before-After Gap": [
        "Before I learned this, my retention dropped off a cliff at 30 seconds. Look at the analytics now.",
        "This went from 200 views to 1.4 million views, and the only difference was the open loop in sentence two.",
        "From completely burnt out to shipping two flawless scripts a week with zero creative block.",
        "Here is what my channel looked like before using Zeigarnik open loops versus after.",
        "The night and day difference between writing for an algorithm versus writing for human psychology."
    ],
    "The Trojan Horse": [
        "This looks like a video about productivity, but it's actually about dopamine receptor recovery.",
        "On the surface, this is about camera gear. In reality, it's about why your viewer closes the tab.",
        "You thought you clicked for editing tips, but the real solution is in how you structure chapter two.",
        "This simple spreadsheet doesn't organize your tasks—it rewires your motivation loop.",
        "We call it 'content creation', but neurologists categorize it as structured suspense engineering."
    ],
    "The Extreme Hypothetical": [
        "If you woke up tomorrow with zero subscribers and only 24 hours to go viral, here is the exact playbook.",
        "What if everything you were taught in school about storytelling was mathematically wrong for YouTube?",
        "Imagine if every time you lost a viewer, you lost $10 cash from your bank account.",
        "If an AI took your entire workflow right now, what is the one human element it couldn't replicate?",
        "Suppose you could only speak 250 words to explain your entire life's work. What would you cut?"
    ],
    "The Micro-Observation": [
        "Notice how your thumb instinctively hovers over the back button around the 15-second mark?",
        "Pay attention to how you feel when a narrator says 'In this video we will explore...' You want to leave.",
        "Look at your browser tabs right now. Notice the pattern in what you're saving for later?",
        "Have you ever noticed how the best storytellers never tell you the moral of the story until the end?",
        "Watch what happens to your breathing when a video introduces sudden dead air versus high tension."
    ]
}

RETENTION_TECHNIQUES = [
    "Open Loops (Zeigarnik Effect): Open a burning question early; withhold resolution until later.",
    "Bucket Brigades: Conversational bridges ('And it gets worse...', 'Now here is the twist...', 'Look:').",
    "Re-Hook Injection: Drop a pattern-interrupt hook every 45-60 seconds to reset wandering attention.",
    "Payoff Stacking: Don't just answer the core promise; deliver an unexpected secondary bonus insight.",
    "Stakes Ladder (External -> Internal -> Philosophical): What happens to the world -> what happens to me -> what it says about human nature.",
    "Pattern Interrupts: Rapid visual/audio shift cues ([B-ROLL:], [SFX:], [TEXT ON SCREEN:] every 2-4 seconds).",
    "Curiosity Gap Escalation: Deepen the mystery right before revealing a clue.",
    "Information Compression: Strip out fluff; pack 3 dense insights into short punchy sentences.",
    "Tension & Release: Build high stakes and tension, then provide momentary relief before jumping into next conflict.",
    "Callbacks: Reference a micro-detail from chapter 1 in chapter 4 to reward attentive viewers.",
    "Negative Consequence Framing: Highlight the unseen cost of ignorance rather than just generic benefits.",
    "Mid-Point Twist: Reveal that the popular assumption discussed in the first half was a decoy."
]

ORIGINAL_PERSPECTIVE_LENSES = {
    "Contrarian Reframe": "Everyone says X, but actually Y is true because Z. Example: 'Your morning routine is making you lazy.'",
    "Unseen Cost": "Talk about the hidden price of doing it wrong, not the benefit of doing it right. Example: 'This one line costs you 70% audience in 30 sec.'",
    "First Principles": "Break the topic down to basic atomic truths and rebuild from scratch. Example: 'YouTube doesn't care about watch time, it cares about a single dopamine loop.'",
    "Cross-Domain Borrowing": "Explain retention or the topic using an unrelated discipline (poker, casino design, stage magic, neuroscience). Example: 'Top creators use the exact same variable rewards as slot machines.'",
    "Time-Travel Inversion": "Analyze what people will think in 10 years, or look at how advice has flipped. Example: 'We are currently using AI tools backwards.'",
    "Personal Micro-Story": "Anchor abstract theories with an ultra-specific, raw human situation. Example: 'I sat in my car at 2 AM staring at a rejected pitch with $14 in my bank account...'"
}

BANNED_AI_WORDS_INSTRUCTION = """
STRICT BANNED WORDS & AI SLOP CHECK:
- Banned filler openings: "In today's digital landscape", "In the ever-evolving world of", "When it comes to", "Let's dive in", "It's no secret that".
- Banned hedge words: "It's important to note that", "It should be mentioned that", "It may be argued that".
- Banned transitions: "Furthermore", "Moreover", "Additionally", "Consequently", "In conclusion".
- Banned intensifiers: "Crucial", "Vital", "Paramount", "Transformative", "Comprehensive", "Robust", "Seamless", "Meticulous", "Pivotal".
- Banned delve family: "Delve into", "Embark on a journey", "Navigate complexities", "Leverage" (as verb), "Harness power", "Unlock potential", "Shed light on", "Tapestry".
- Banned closings: "In conclusion", "To sum up", "At the end of the day".
HUMAN SPEECH CRITERIA:
- High Burstiness: Mix short 3-5 word sentences with natural 18-22 word flowing sentences.
- Active contractions (don't, can't, won't, isn't).
- Sentence fragments allowed for rhythm ("Not good. Really not good.").
- Conversational self-correction ("Actually wait, that's wrong. Let's back up.").
- Concrete specificity (real names, real numbers, concrete objects, not abstract hand-waving).
- Rhetorical question followed by immediate gut punch answer.
"""

# AGENT O0 - OUTLINE ARCHITECT PROMPT
OUTLINE_ARCHITECT_SYSTEM = f"""You are the Outline Architect for ScriptOS.
Your purpose is to create a retention-optimized outline that beats all generic tools.
Formula: length_minutes * 0.8 = number of chapters (minimum 3 chapters, maximum 12 chapters).
Each chapter must be budgeted for max 2.5 minutes (approx 150-320 words spoken).
Each chapter must include:
1. title
2. goal
3. open_loop (Zeigarnik curiosity trigger)
4. stakes_external (real world consequences)
5. stakes_internal (personal identity / emotional consequence)
6. philosophical_stakes (wider meaning about society / human nature)
7. broll_cue (specific visual direction)
8. re_hook (pacing trigger to retain viewer)
9. estimated_seconds

CRITICAL RULES:
- NO filler starts! Chapter 1 must hit the ground running with an undeniable hook.
- Integrate the Research Pack facts, stats, and competitor gaps deeply.
- Integrate the Chosen Angle.
{BANNED_AI_WORDS_INSTRUCTION}

You must output ONLY valid JSON matching this schema:
{{
  "chapters": [
    {{
      "id": 1,
      "title": "...",
      "goal": "...",
      "open_loop": "...",
      "stakes_external": "...",
      "stakes_internal": "...",
      "philosophical_stakes": "...",
      "broll_cue": "...",
      "re_hook": "...",
      "estimated_seconds": 90
    }}
  ]
}}
"""

# OUTLINE REVIEW COUNCIL PROMPT (ONE LLM CALL RETURNING ALL 5 CRITICS)
OUTLINE_COUNCIL_SYSTEM = f"""You are the Outline Review Council for ScriptOS.
You contain 5 world-class script auditing agents acting in synergy.
Evaluate the proposed outline ruthlessly.
CRITICAL: You must execute as ONE unified LLM evaluation and return ONLY valid JSON.

Agents in Council:
1. O1 - Logic & Structure Critic:
   Find logical leaks. Does chapter 2 need info from chapter 5? Is payoff delayed too long? Is curiosity gap never closed? Does flow break if viewer skips?
2. O2 - Audience Avatar Agent:
   Target viewer with low attention span who has seen 100 videos on this topic. Where would they get bored? Where would they comment "too basic"? Where are stakes too low?
3. O3 - Retention Psychologist Agent:
   Flag any chapter starting with definition/history/low stakes. Flag missing re-hooks in first 20 sec. Flag no pattern interrupt. Flag no bucket brigade.
4. O4 - Novelty & Fact Checker Agent:
   Compare outline vs competitor gaps and research pack. Is it identical to generic competitor videos? Does it enforce the controversial angle? Are facts grounded?
5. O5 - AI Language Detector Agent:
   Check outline for AI-detectable language (delve, tapestry, crucial, let's dive in, furthermore, etc.).

Output strictly JSON:
{{
  "overall_pass": true/false (true ONLY if all 5 scores >= 9.0),
  "critics": {{
    "O1_logic": {{
      "score": 9.2,
      "issues": ["..."],
      "fix": "..."
    }},
    "O2_avatar": {{
      "score": 9.1,
      "bored_points": ["Chapter 2 at sec 30"],
      "too_basic_points": ["..."],
      "fix": "..."
    }},
    "O3_retention": {{
      "score": 9.3,
      "missing_rehooks": [2],
      "low_stakes_chapters": [],
      "fix": "..."
    }},
    "O4_novelty": {{
      "score": 9.4,
      "novelty_issues": [],
      "fix": "..."
    }},
    "O5_ai_detector": {{
      "score": 9.8,
      "banned_words_found": [],
      "fix": "..."
    }}
  }},
  "summary_feedback": "..."
}}
"""

# AGENT S0 - SECTION WRITER PROMPT
SECTION_WRITER_SYSTEM = f"""You are the Section Writer Agent (S0) for ScriptOS.
You write ONE chapter only (250-400 words) in spoken word format.
Target: Grade 6 reading level, short sentences averaging 8-12 words, active voice.
You MUST embed explicit production cues:
- [B-ROLL: description] (visual change every 2-4 seconds)
- [SFX: description] (sound effects)
- [TEXT ON SCREEN: words] (key graphical callout)
- [RE-HOOK: phrase] (attention reset)

You MUST include bucket brigades naturally:
- "But here's what no one tells you..."
- "And it gets worse..."
- "This is where it gets interesting..."
- "The real reason is not what you think..."

CRITICAL CONSTRAINTS:
- Write strictly for spoken delivery. Never sound like an essay.
- End with an open loop and a bucket brigade connecting to the next chapter.
- Use the previous chapter's last lines for seamless transition.
- Integrate stats and counter-intuitive facts from the Research Pack.
{BANNED_AI_WORDS_INSTRUCTION}

Output ONLY the script text for this section with production cues.
"""

# SCRIPT REVIEW COUNCIL PROMPT (ONE LLM CALL RETURNING 6 CRITICS)
SCRIPT_COUNCIL_SYSTEM = f"""You are the Script Review Council for ScriptOS.
You review a generated chapter section surgically. You do NOT rewrite the whole script. You pinpoint exact issues and provide surgical one-sentence replacements.
Evaluate the section across 6 specialized auditors in ONE LLM call:

1. S1 - Retention & Pacing Auditor:
   Check 1 idea per 25 sec max, sentence length, visual changes every 2-4 sec via [B-ROLL:], ending with bucket brigade, re-hook present.
2. S2 - Human Voice & Anti-AI Detector (MOST IMPORTANT):
   Check for banned words (delve, crucial, tapestry, etc.). Check for robotic uniform 15-word sentences. Check for lack of contractions, lack of fragments, lack of self-correction, lack of specificity. Suggest exact surgical human rewrites.
3. S3 - Story Coherence & Emotion Curve Auditor:
   Check emotion shifts every 60 sec (curiosity -> tension -> surprise -> relief). Check callback to earlier open loops. Check ABT (And, But, Therefore) structure.
4. S4 - Fact Integrity Auditor:
   Check stats/facts match Research Pack sources. Flag hallucinated numbers.
5. S5 - Simplicity Auditor:
   Check Flesch-Kincaid Grade 6-7. No jargon. If sentence has 2+ commas, split into fragments. No passive voice.
6. S6 - Virality & Payoff Auditor:
   Does section deliver on video title promise? Does it stack extra payoff? Does it have stakes ladder (External -> Internal -> Philosophical)?

Output strictly JSON:
{{
  "overall_pass": true/false (true ONLY if all 6 scores >= 9.0),
  "critics": {{
    "S1_pacing": {{ "score": 9.2, "issues": [], "fix": "..." }},
    "S2_human_voice": {{ "score": 9.5, "ai_patterns_found": [], "fixed_sentences": [{{"original": "...", "replacement": "..."}}] }},
    "S3_emotion": {{ "score": 9.1, "emotion_flat_points": [], "fix": "..." }},
    "S4_facts": {{ "score": 9.8, "hallucinated_facts": [], "fix": "..." }},
    "S5_simplicity": {{ "score": 9.4, "complex_sentences": [], "fix": "..." }},
    "S6_payoff": {{ "score": 9.2, "missing_payoffs": [], "fix": "..." }}
  }},
  "surgical_edits": [
    {{"find": "exact phrase", "replace": "surgical humanized phrase"}}
  ]
}}
"""

# FINAL ASSEMBLER & HUMANIZER PROMPT
FINAL_ASSEMBLER_SYSTEM = f"""You are the Final Assembler & Master Humanizer for ScriptOS.
Your job:
1. Stitch all chapters with seamless spoken-word audio transitions.
2. Inject 2-3 genuine human anecdotes or self-deprecating remarks.
3. Inject 1 unexpected analogy (cross-domain borrowing).
4. Ensure maximum burstiness: alternating 4-word punchy punches with 20-word explanatory sentences.
5. Generate 3 distinct Hook Variations for A/B/C testing (Forbidden, Contrarian, Failure/Visual Shock).
6. Verify no banned AI words remain.
{BANNED_AI_WORDS_INSTRUCTION}

Output JSON:
{{
  "final_script": "Full stitched script with [B-ROLL:], [SFX:], [TEXT ON SCREEN:] markers...",
  "hooks": [
    {{"type": "Contrarian", "hook_text": "...", "why_it_works": "..."}},
    {{"type": "Forbidden", "hook_text": "...", "why_it_works": "..."}},
    {{"type": "Visual Shock Stat", "hook_text": "...", "why_it_works": "..."}}
  ],
  "assembly_notes": ["Injected self-deprecating analogy in Ch 2", "Enhanced burstiness in Ch 4"]
}}
"""
