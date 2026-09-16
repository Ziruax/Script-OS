import json
import time
from typing import Dict, List, Any, Optional
from backend.core.llm_client import UnifiedLLMClient, parse_json_safely
from backend.tools.search import build_research_pack
from backend.tools.humanizer import apply_local_humanizer, generate_scorecard
from backend.agents.prompts import (
    ORIGINAL_PERSPECTIVE_LENSES,
    OUTLINE_ARCHITECT_SYSTEM,
    OUTLINE_COUNCIL_SYSTEM,
    SECTION_WRITER_SYSTEM,
    SCRIPT_COUNCIL_SYSTEM,
    FINAL_ASSEMBLER_SYSTEM,
    HOOKS_LIBRARY
)

class ScriptOrchestrator:
    def __init__(self, provider: str = "google", model: Optional[str] = None, api_key: Optional[str] = None):
        self.llm = UnifiedLLMClient(provider=provider, model=model, api_key=api_key)

    def generate_research(self, title: str, details: str = "") -> Dict[str, Any]:
        """Local research layer using duckduckgo, wikipedia, trafilatura, etc."""
        return build_research_pack(title, details)

    def generate_angles(self, title: str, details: str, research_pack: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate 3 unique angles using at least 3 of the 6 original perspective lenses."""
        lenses_str = json.dumps(ORIGINAL_PERSPECTIVE_LENSES, indent=2)
        research_str = json.dumps({
            "facts": research_pack.get("facts", [])[:3],
            "stats": research_pack.get("stats", [])[:1],
            "competitor_gaps": research_pack.get("competitor_gaps", []),
            "controversial_angles": research_pack.get("controversial_angles", [])
        }, indent=2)

        sys_prompt = (
            "You are the Original Perspective Engine for ScriptOS.\n"
            "Take the user's topic and research pack, and apply the 6 proprietary lenses.\n"
            "Generate EXACTLY 3 radically unique, high-retention angles that destroy generic competitor videos.\n"
            "Output strictly valid JSON: a list of 3 objects with:\n"
            "[{'angle_title': '...', 'lens_used': '...', 'unique_statement': '...', 'why_different': '...', 'hook_example': '...'}]"
        )
        user_prompt = (
            f"Topic: {title}\n"
            f"User Specifics: {details}\n"
            f"Available Lenses:\n{lenses_str}\n"
            f"Research Pack Insights:\n{research_str}\n"
            "Create 3 distinct angles now."
        )

        raw = self.llm.generate(sys_prompt, user_prompt, temperature=0.75, force_json=True)
        angles = parse_json_safely(raw, default=[])
        if not isinstance(angles, list) or len(angles) < 3:
            # Fallback robust generation
            return [
                {
                    "angle_title": f"The Unseen Cost of {title}",
                    "lens_used": "Unseen Cost",
                    "unique_statement": f"Everyone thinks {title} is about positive habits, but the invisible friction is what quietly destroys 80% of attempts.",
                    "why_different": "Flips from generic cheerleading to forensic risk-avoidance.",
                    "hook_example": f"This one misunderstanding about {title} quietly ruins 70% of attempts in the first 48 hours."
                },
                {
                    "angle_title": f"Why Conventional {title} Advice Fails",
                    "lens_used": "Contrarian Reframe",
                    "unique_statement": f"Mainstream guides advise consistency, but peak performance relies on short high-friction sprints.",
                    "why_different": "Directly attacks the most revered advice in the niche.",
                    "hook_example": f"Stop following the standard {title} formula until you understand this single biological trap."
                },
                {
                    "angle_title": f"The Casino Engine Behind {title}",
                    "lens_used": "Cross-Domain Borrowing",
                    "unique_statement": f"How slot machine variable reward schedules explain why your brain rejects standard {title}.",
                    "why_different": "Borrows compelling dopamine mechanics from casino psychology.",
                    "hook_example": f"Casinos figured out this secret 50 years ago. Here is how it unlocks effortless {title}."
                }
            ]
        return angles[:3]

    def generate_outline_with_council(
        self,
        title: str,
        details: str,
        length_min: int,
        audience: str,
        goal: str,
        tone: str,
        chosen_angle: Dict[str, Any],
        research_pack: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Orchestrates Outline generation (O0) and Review Council (O1-O5).
        Loops up to 3 times if any critic score < 9.0.
        """
        if length_min <= 1:
            target_chapters = 2
        elif length_min <= 3:
            target_chapters = 3
        elif length_min <= 8:
            target_chapters = 5
        elif length_min <= 15:
            target_chapters = 8
        elif length_min <= 30:
            target_chapters = 12
        elif length_min <= 45:
            target_chapters = 15
        elif length_min <= 60:
            target_chapters = 18
        elif length_min <= 90:
            target_chapters = 24
        else:
            target_chapters = min(32, int(round(24 + (length_min - 90) * 0.25)))
        critiques_history = []
        best_outline = None
        best_council_eval = None
        max_loops = 3

        for loop_idx in range(max_loops):
            user_prompt = (
                f"Title: {title}\n"
                f"User Details: {details}\n"
                f"Target Video Length: {length_min} minutes (Target ~{target_chapters} chapters)\n"
                f"Audience Level: {audience}\n"
                f"Primary Goal: {goal}\n"
                f"Tone: {tone}\n"
                f"Chosen Angle: {json.dumps(chosen_angle)}\n"
                f"Research Pack:\n{json.dumps(research_pack)}\n"
            )
            if critiques_history:
                user_prompt += (
                    f"\n\nPRIOR REVIEW COUNCIL CRITIQUES (FIX THESE IMMEDIATELY):\n"
                    f"{json.dumps(critiques_history[-1], indent=2)}\n"
                    "Preserve all strong elements while surgically fixing every flagged issue so all scores reach 9.5+."
                )

            # Step A: O0 Outline Architect
            raw_outline = self.llm.generate(OUTLINE_ARCHITECT_SYSTEM, user_prompt, temperature=0.7, force_json=True)
            outline_data = parse_json_safely(raw_outline, default={"chapters": []})
            if not outline_data.get("chapters"):
                # Fallback schema if needed
                outline_data = {
                    "chapters": [
                        {
                            "id": 1,
                            "title": "The False Assumption",
                            "goal": "Break viewer complacency with the contrarian hook",
                            "open_loop": "Why standard advice backfires within 48 hours",
                            "stakes_external": "Wasted hours and zero tangible momentum",
                            "stakes_internal": "Frustration and silent self-doubt",
                            "philosophical_stakes": "The trap of modern productivity theater",
                            "broll_cue": "Fast montage of clocks, abandoned notebooks, frustrated user",
                            "re_hook": "And that is just the surface cost...",
                            "estimated_seconds": 90
                        },
                        {
                            "id": 2,
                            "title": "The Hidden Mechanism",
                            "goal": "Unpack the counter-intuitive research data",
                            "open_loop": "The 1 single variable that controls the outcome",
                            "stakes_external": "Algorithmic and personal burnout",
                            "stakes_internal": "Cognitive overload",
                            "philosophical_stakes": "Friction vs Motivation",
                            "broll_cue": "Screen recording showing statistical curve and dropoff point",
                            "re_hook": "Here is what nobody else noticed...",
                            "estimated_seconds": 120
                        },
                        {
                            "id": 3,
                            "title": "The Action Protocol",
                            "goal": "Deliver the stacked unexpected payoff",
                            "open_loop": "How to implement this in 60 seconds today",
                            "stakes_external": "Long term unstoppable compounding",
                            "stakes_internal": "Total creative clarity",
                            "philosophical_stakes": "Mastery through subtraction",
                            "broll_cue": "Clean step-by-step checklist on dark background",
                            "re_hook": "Try this on your next attempt...",
                            "estimated_seconds": 110
                        }
                    ]
                }

            # Step B: O1-O5 Review Council (ONE LLM call)
            council_prompt = (
                f"Evaluate this outline for '{title}':\n"
                f"Target Length: {length_min} min | Goal: {goal} | Angle: {chosen_angle.get('angle_title')}\n"
                f"Research Pack:\n{json.dumps(research_pack)}\n"
                f"Candidate Outline:\n{json.dumps(outline_data, indent=2)}\n"
            )
            raw_eval = self.llm.generate(OUTLINE_COUNCIL_SYSTEM, council_prompt, temperature=0.3, force_json=True)
            eval_data = parse_json_safely(raw_eval, default={})

            best_outline = outline_data
            best_council_eval = eval_data

            # Check if all critic scores >= 9.0
            critics = eval_data.get("critics", {})
            scores = [critics.get(k, {}).get("score", 9.2) for k in critics]
            min_score = min(scores) if scores else 9.0

            if min_score >= 9.0 or loop_idx == max_loops - 1:
                break
            else:
                critiques_history.append(critics)

        return {
            "outline": best_outline,
            "council_eval": best_council_eval,
            "loops_taken": loop_idx + 1
        }

    def write_section_with_council(
        self,
        chapter: Dict[str, Any],
        full_outline: Dict[str, Any],
        chosen_angle: Dict[str, Any],
        research_pack: Dict[str, Any],
        previous_chapter_text: str = ""
    ) -> Dict[str, Any]:
        """
        S0 writes chapter section.
        S1-S6 audits in ONE LLM call.
        Applies surgical fixes if score < 9.0 while maintaining full context.
        """
        prev_lines = "\n".join(previous_chapter_text.strip().split("\n")[-3:]) if previous_chapter_text else "None (Opening Chapter)"

        user_prompt = (
            f"Writing Chapter {chapter.get('id')}: {chapter.get('title')}\n"
            f"Chapter Goal: {chapter.get('goal')}\n"
            f"Open Loop: {chapter.get('open_loop')}\n"
            f"Stakes: External={chapter.get('stakes_external')} | Internal={chapter.get('stakes_internal')}\n"
            f"Visual Direction: {chapter.get('broll_cue')}\n"
            f"Re-Hook: {chapter.get('re_hook')}\n"
            f"Previous Chapter Ending lines:\n{prev_lines}\n"
            f"Chosen Angle: {json.dumps(chosen_angle)}\n"
            f"Relevant Research: {json.dumps(research_pack.get('facts', [])[:2])}\n"
        )

        # S0 Write
        raw_text = self.llm.generate(SECTION_WRITER_SYSTEM, user_prompt, temperature=0.7)

        # S1-S6 Council Review (ONE LLM call)
        council_prompt = (
            f"Review this chapter script:\n"
            f"Chapter Info: {json.dumps(chapter)}\n"
            f"Research Pack Facts: {json.dumps(research_pack.get('facts', []))}\n"
            f"Candidate Script Text:\n{raw_text}\n"
        )
        raw_eval = self.llm.generate(SCRIPT_COUNCIL_SYSTEM, council_prompt, temperature=0.2, force_json=True)
        council_eval = parse_json_safely(raw_eval, default={})

        # Apply surgical replacements if suggested
        final_text = raw_text
        edits = council_eval.get("surgical_edits", [])
        for edit in edits:
            f = edit.get("find")
            r = edit.get("replace")
            if f and r and f in final_text:
                final_text = final_text.replace(f, r)

        # Apply local deterministic humanizer
        final_text, _ = apply_local_humanizer(final_text)

        return {
            "chapter_id": chapter.get("id"),
            "title": chapter.get("title"),
            "script_text": final_text,
            "council_eval": council_eval
        }

    def assemble_and_humanize(
        self,
        chapters: List[Dict[str, Any]],
        title: str,
        research_pack: Dict[str, Any],
        outline: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Final Stitching, Humanizing, 3 Hook Variations, and 10/10 Scorecard."""
        stitched_raw = "\n\n".join([f"--- CHAPTER {c.get('chapter_id', i+1)}: {c.get('title', '')} ---\n{c.get('script_text', '')}" for i, c in enumerate(chapters)])

        # Run Final Assembler LLM
        prompt = (
            f"Title: {title}\n"
            f"All Chapters:\n{stitched_raw}\n"
            f"Research Pack Stats: {json.dumps(research_pack.get('stats', []))}\n"
        )
        raw_out = self.llm.generate(FINAL_ASSEMBLER_SYSTEM, prompt, temperature=0.6, force_json=True)
        data = parse_json_safely(raw_out, default={})

        final_script = data.get("final_script") or stitched_raw
        final_script, _ = apply_local_humanizer(final_script)

        hooks = data.get("hooks", [])
        if not hooks or len(hooks) < 3:
            hooks = [
                {
                    "type": "Contrarian",
                    "hook_text": HOOKS_LIBRARY["Contrarian"][0].replace("Your morning routine", title),
                    "why_it_works": "Pattern interrupt breaking viewer complacency."
                },
                {
                    "type": "Forbidden",
                    "hook_text": HOOKS_LIBRARY["Forbidden"][0],
                    "why_it_works": "High curiosity trigger evoking insider secrecy."
                },
                {
                    "type": "Visual Shock Stat",
                    "hook_text": HOOKS_LIBRARY["Visual Shock Stat"][0].replace("this system", title),
                    "why_it_works": "Urgent quantitative stakes making quitting feel dangerous."
                }
            ]

        scorecard = generate_scorecard(final_script, research_pack, outline)

        return {
            "final_script": final_script,
            "hooks": hooks,
            "scorecard": scorecard,
            "sources": research_pack.get("sources", [])
        }
