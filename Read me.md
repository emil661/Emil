# 3D Character Customization and Interaction Game Plan

## Vision
Create a 3D game where players design a cast of characters (looks, personality,
and life story). A single "Interact" button triggers emergent interactions
driven by how each character was authored.

## Core Pillars
1. **Deep character authoring**: Looks, personality traits, and life history
   shape behavior.
2. **Meaningful interactions**: Characters react based on relationships,
   compatibility, and past events.
3. **Readable outcomes**: Players can understand why characters behaved a
   certain way.

## Target Experience
- Players craft 3-10 characters per scene.
- They place them in a shared space (room, park, cafe).
- Pressing **Interact** causes a short, dynamic sequence of conversations,
  conflicts, alliances, or moments.
- Afterward, players see a clear recap of what happened and why.

## Character Customization

### 1) Looks (Visual Customization)
- Body type, height, and face presets (blend shapes)
- Hair style and color, skin tone, eye color
- Outfit sets (casual, formal, sporty, fantasy)
- Accessories (glasses, jewelry, hats)

### 2) Personality (Behavioral Traits)
Model as a small set of trait sliders (0-100):
- Kindness
- Confidence
- Curiosity
- Patience
- Humor
- Honesty

Derived traits:
- **Empathy** = average(Kindness, Patience)
- **Assertiveness** = average(Confidence, Honesty)

### 3) Life Story (Backstory Inputs)
- Origin (hometown, family background)
- Career path (artist, engineer, teacher, etc.)
- Major events (moved cities, loss, big achievement)
- Personal goal (recognition, belonging, stability)

Backstory tags influence preferences and biases.

## Interaction System

### Interaction Trigger
- The **Interact** button runs a "scene tick" that:
  1. Calculates relationship affinities.
  2. Chooses interaction pairs or groups.
  3. Runs short interactions (30-90 seconds total).
  4. Updates relationships and memory.

### Relationship Model
- Each pair has:
  - Affinity score (-100 to 100)
  - Trust (0-100)
  - Respect (0-100)
  - Shared history tags

### Interaction Types
- Friendly chat
- Debate or argument
- Compliment
- Ask for help
- Avoidance / awkward silence
- Bonding over shared history

### Interaction Rules (Examples)
- High Kindness + High Empathy -> more supportive dialogue
- Confident + Low Patience -> more likely to interrupt
- Shared career tag -> higher chance of bonding
- Conflicting goals -> debate or tension

## Dialogue and Behavior

### Dialogue Logic
- Template-based lines with variables:
  "I grew up in {origin}, so I know what it's like..."
- Select lines based on personality and life tags.

### Behavior Tree / Utility AI
- Use utility scores to pick actions:
  - "Start conversation" vs "Walk away"
  - "Compliment" vs "Challenge"
- Utility is computed from traits, relationship, and context.

## Scene Structure

### Environment
- Small curated maps (room, cafe, plaza)
- Simple interaction points (bench, table)

### Scene Loop
1. Player places characters.
2. Clicks **Interact**.
3. Characters move and interact.
4. Summary screen shows key outcomes.

## UI / UX
- Character creator with live 3D preview.
- Trait sliders with hints.
- Backstory tag picker.
- Interact button and short timer.
- Post-scene summary:
  - Relationship changes
  - Notable moments
  - "Because" explanations (trait-based).

## Data Model (Example)
- Character:
  - id
  - looks: {bodyType, hair, outfit, colors}
  - traits: {kindness, confidence, curiosity, patience, humor, honesty}
  - backstoryTags: [origin, career, events, goal]
  - memory: list of past interactions

- Relationship:
  - fromId, toId
  - affinity, trust, respect
  - sharedTags

## MVP Scope (First Playable)
1. Character creator with 3 presets per category.
2. 4 personality sliders.
3. 6 backstory tags.
4. Single small scene with 3 characters.
5. Interact button triggers 2-3 interactions.
6. Summary screen showing relationship changes.

## Stretch Goals
- Voice reactions or simple emotes.
- Procedural animation blending.
- Multi-scene campaign mode.
- Relationship arcs over time.

## Production Plan (High Level)

### Phase 1: Prototype (2-3 weeks)
- Implement character data model.
- Basic scene and movement.
- Rule-based interaction selection.

### Phase 2: Vertical Slice (4-6 weeks)
- Character creator UI.
- Dialogue templates and recap system.
- Polished scene.

### Phase 3: Content + Polish (6-10 weeks)
- More cosmetics, maps, and tags.
- UI refinements and tuning.

## Open Questions
- Target platform (PC only, console, mobile)?
- Single-player only or potential co-op?
- Tone: realistic, cozy, comedic?
- Art style: low-poly, stylized, or realistic?

---
If you want, I can turn this into a more detailed game design doc (GDD) or
create a sprint backlog with tasks and estimates.

