# 3D Character Customization and Interaction Game
## Game Design Document (GDD)

Version: 1.0  
Date: 2026-02-05  
Owner: Design

---

## 1. High Concept
A 3D character sandbox where players design a cast (looks, personality, life
story) and then press one button to watch them interact. The results are driven
by authored traits, backstory tags, and relationships, and are explained clearly
to the player.

## 2. Design Goals
1. **Agency through authoring**: Player choices in the creator strongly impact
   interactions.
2. **Readable drama**: The game shows why events happened.
3. **Replayable outcomes**: Small changes produce different interactions.
4. **Cozy pace**: Short, focused scenes with clear recaps.

## 3. Target Audience and Platform
- **Audience**: Players who enjoy character creation, social simulation,
  and storytelling.
- **Platform**: PC first (mouse and keyboard). Console potential later.

## 4. Core Gameplay Loop
1. Create or load characters.
2. Place characters in a scene.
3. Press **Interact**.
4. Watch a short sequence of interactions (30-90 seconds).
5. Review a summary explaining outcomes.
6. Iterate: adjust characters or add more.

## 5. Systems Overview

### 5.1 Character Creation

#### Visual Customization
- Body type and height presets (blend shapes).
- Face presets and detail sliders.
- Hair style and color, eye color, skin tone.
- Outfit sets and accessories.

#### Personality Traits
Trait sliders (0-100):
- Kindness
- Confidence
- Curiosity
- Patience
- Humor
- Honesty

Derived traits:
- Empathy = average(Kindness, Patience)
- Assertiveness = average(Confidence, Honesty)

#### Life Story Tags
Backstory fields and tags:
- Origin (city, region, family background)
- Career path (artist, engineer, teacher, etc.)
- Major events (loss, big achievement, relocation)
- Personal goal (recognition, belonging, stability)

Tags become **preferences** and **biases** that shape interaction utility.

---

### 5.2 Relationship Model
For every pair of characters:
- **Affinity** (-100 to 100)
- **Trust** (0-100)
- **Respect** (0-100)
- **Shared Tags** (career, origin, events)
- **History** (key interactions and outcomes)

Relationships update after each interaction.

---

### 5.3 Interaction Selection
Interactions are chosen with a **utility score**:

1. Build candidate pairs or small groups (2-3 characters).
2. Score candidate interactions using traits, relationships, and tags.
3. Pick the highest scoring interactions until the scene time budget is met.
4. Apply cooldowns so the same pair does not repeat.

Utility inputs:
- Trait compatibility (Kindness vs Patience, Confidence vs Respect)
- Relationship thresholds (Affinity, Trust)
- Shared tags (career, origin, events)
- Scene context (location, nearby props)

Example rule weights:
- Shared career tag: +10 to bonding
- High Assertiveness + low Patience: +8 to debate
- Low Affinity + high Respect: +5 to tense but polite

---

### 5.4 Interaction Types
- Friendly chat
- Compliment
- Ask for help
- Debate or argument
- Avoidance / awkward silence
- Bonding over shared history

Each interaction has:
- **Trigger rules**
- **Dialogue template set**
- **Relationship deltas**
- **Memory tags**

---

### 5.5 Dialogue System
Dialogue is template based with tags:

Example:
"I moved from {origin} last year. It changed how I see {goal}."

Rules:
- Tone is influenced by traits (Humor vs Patience).
- Certain tags unlock specific lines (career, major event).
- Keep dialogue short (1-3 lines per interaction).

---

### 5.6 Memory and Consequences
Memory types:
- Short-term (current scene context)
- Long-term (stored in character history)

Examples:
- "Was interrupted by X" -> reduces Trust
- "Shared origin with Y" -> increases Affinity

Memory tags influence future utility scores.

---

### 5.7 Explanation System (Why It Happened)
After the scene, the summary lists:
- The interaction outcome
- The relationship change
- The "Because" explanation

Example:
"Ava complimented Jamal because both value humor and share the teacher tag."

---

## 6. Scene and Environment
- Small curated locations (room, cafe, plaza).
- Simple navigation with clear interaction points (bench, table, counter).
- Scenes are designed for 3-10 characters.

Scene constraints:
- Max active interactions at once: 2
- Total scene time: 30-90 seconds

---

## 7. AI Behavior
Behavior style: light utility AI + simple state machine.

States:
- Idle
- Move to target
- Interact
- Observe

State transitions are triggered by interaction selection and proximity.

---

## 8. UI and UX

### Character Creator
- 3D preview with rotate and zoom
- Tabs for Look, Traits, Life Story
- Presets and randomize button

### Scene UI
- Character roster
- Interact button with timer bar
- Pause and skip interaction

### Summary Screen
- List of key interactions
- Relationship deltas with arrows
- Short "Because" explanations

---

## 9. Content Scope

### Locations
- Room, Cafe, Plaza (MVP)

### Backstory Tags
- 6 origins
- 6 careers
- 6 major events
- 6 goals

### Dialogue Templates
- 20 templates per interaction type for MVP

### Animations and Emotes
- Greet, nod, shrug, laugh, cross arms, look away

---

## 10. Data Model (Draft)

### Character
```json
{
  "id": "char_001",
  "name": "Ava",
  "looks": {
    "bodyType": "average",
    "hair": "short",
    "outfit": "casual",
    "colors": {"hair": "black", "eyes": "brown"}
  },
  "traits": {
    "kindness": 70,
    "confidence": 40,
    "curiosity": 55,
    "patience": 60,
    "humor": 80,
    "honesty": 65
  },
  "backstoryTags": {
    "origin": "coastal",
    "career": "teacher",
    "event": "relocation",
    "goal": "belonging"
  },
  "memory": []
}
```

### Relationship
```json
{
  "fromId": "char_001",
  "toId": "char_002",
  "affinity": 15,
  "trust": 40,
  "respect": 55,
  "sharedTags": ["teacher"],
  "history": ["shared_origin"]
}
```

### Interaction
```json
{
  "type": "compliment",
  "participants": ["char_001", "char_002"],
  "dialogueLines": ["I like how you handled that."],
  "relationshipDelta": {"affinity": 8, "trust": 4},
  "memoryTags": ["felt_supported"]
}
```

---

## 11. Technical Notes
- Engine: Unity or Unreal (engine-agnostic design).
- AI logic can be data-driven (ScriptableObjects or DataTables).
- Dialogue templates stored in JSON or CSV for easy iteration.
- Scene tick executes every time **Interact** is pressed.

---

## 12. MVP Definition
1. Character creator (3 presets per visual category).
2. 4 personality sliders.
3. 6 backstory tags.
4. One small scene with 3 characters.
5. Interact button triggers 2-3 interactions.
6. Summary screen with explanations.

---

## 13. Milestones (High Level)

### Prototype (2-3 weeks)
- Basic character data model
- Scene with movement
- Rule-based interaction selection

### Vertical Slice (4-6 weeks)
- Full character creator
- Dialogue templates
- Summary screen

### Content and Polish (6-10 weeks)
- More visuals, scenes, and tags
- UI refinements
- Animation polish

---

## 14. Risks and Mitigations
- **Risk**: Interactions feel repetitive.  
  **Mitigation**: Expand tag sets and add weighted randomness.
- **Risk**: Explanations feel unclear.  
  **Mitigation**: Tight "Because" rules with short phrasing.
- **Risk**: Personality sliders feel samey.  
  **Mitigation**: Add derived traits that push distinct behaviors.

---

## 15. Open Questions
- Final target platform?
- Visual style (stylized vs realistic)?
- Single-player only or shared gallery of characters?
- Voice or text-only dialogue?

---

If you want, I can add a production backlog, interaction tuning table,
or a more detailed technical specification.
