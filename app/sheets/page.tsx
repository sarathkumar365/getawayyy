import type { JSX } from "react";
import "./sheets.css";
import { Character } from "@/components/characters/Character";
import { DetailedCharacter } from "@/components/characters/DetailedCharacter";
import {
  DETAILED, D_BROWS, D_EYES, D_MOUTHS, D_EMOTES, D_OUTFITS,
  type DetailId, type DOutfit,
} from "@/lib/characters/detailed";
import {
  ARM_POSES, ARM_POSE_NAMES, ARMS_CROSSED, BROWS, CHARACTERS, EYES, IDLE,
  MOUTHS, OUTFITS, WALK, WALK_FRAME_NAMES, withArms,
  type CharacterId, type Outfit,
} from "@/lib/characters/rig";

export const metadata = { title: "Character sheets" };

const OUTFIT_LABEL: Record<Outfit, string> = {
  base: "base",
  parka: "parka — north",
  shell: "rain shell — escarpment",
  beret: "beret + scarf — Quebec",
  tote: "tote + camera — Montreal",
};

function Cell({ label, children, w = 120 }: { label: string; children: JSX.Element; w?: number }): JSX.Element {
  return (
    <figure className="cell" style={{ width: w }}>
      <div className="art">{children}</div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function Sheet({ id }: { id: CharacterId }): JSX.Element {
  const c = CHARACTERS[id];
  const crossed = id === "curse";
  const restPose = crossed ? withArms(IDLE, ARMS_CROSSED) : IDLE;

  return (
    <section className="sheet" data-character={id}>
      <header className="sheet-head">
        <h2>
          {id === "sun" ? "A" : "B"} — {c.name}
          <span className="swatch" style={{ background: c.palette.hair }} />
          <span className="hex">{c.palette.hair}</span>
        </h2>
        <p className="sub">
          {id === "sun"
            ? "Small, springy, always mid-motion. Overshoots, then corrects."
            : "Taller, still, arms crossed by default. Almost never moves, so it lands when he does."}
        </p>
      </header>

      <h3>1—2 · Front neutral &amp; 3/4 turn</h3>
      <div className="row">
        <Cell label="front neutral" w={190}>
          <Character id={id} uid={`${id}-front`} pose={restPose} eye="open" mouth={id === "sun" ? "smile" : "closed"} />
        </Cell>
        <Cell label="3/4 turn" w={190}>
          <Character id={id} uid={`${id}-tq`} pose={restPose} turn={1} eye="side" mouth={id === "sun" ? "smile" : "closed"} />
        </Cell>
        <Cell label="3/4, other way" w={190}>
          <Character id={id} uid={`${id}-tqf`} pose={restPose} turn={1} flip eye="side" mouth="closed" />
        </Cell>
      </div>

      <h3>3 · Walk cycle — 8 poses</h3>
      <div className="row walk">
        {WALK.map((pose, i) => (
          <Cell key={i} label={`${i} ${WALK_FRAME_NAMES[i] ?? ""}`} w={104}>
            <Character id={id} uid={`${id}-walk-${i}`} pose={pose} turn={1} eye={i === 3 || i === 7 ? "half" : "open"} mouth={id === "sun" ? "grin" : "closed"} />
          </Cell>
        ))}
      </div>

      <h3>4 · Expression parts — 5 brows × 6 eyes × 8 mouths</h3>
      <p className="note">Separable layers, not 240 finished faces. Any brow composes with any eye and any mouth.</p>
      <div className="row">
        {BROWS.map((b) => (
          <Cell key={b} label={b} w={92}>
            <Character id={id} uid={`${id}-brow-${b}`} crop="head" brow={b} eye="open" mouth="closed" />
          </Cell>
        ))}
      </div>
      <div className="row">
        {EYES.map((e) => (
          <Cell key={e} label={e} w={92}>
            <Character id={id} uid={`${id}-eye-${e}`} crop="head" brow="neutral" eye={e} mouth="closed" />
          </Cell>
        ))}
      </div>
      <div className="row">
        {MOUTHS.map((m) => (
          <Cell key={m} label={m} w={92}>
            <Character id={id} uid={`${id}-mouth-${m}`} crop="head" brow="neutral" eye="open" mouth={m} />
          </Cell>
        ))}
      </div>

      <h3>5 · Arm poses — 6</h3>
      <div className="row">
        {ARM_POSE_NAMES.map((a) => (
          <Cell key={a} label={a} w={132}>
            <Character id={id} uid={`${id}-arm-${a}`} pose={withArms(IDLE, ARM_POSES[a])} eye="open" mouth={id === "sun" ? "smile" : "closed"} />
          </Cell>
        ))}
        {crossed && (
          <Cell label="crossed — B default" w={132}>
            <Character id={id} uid={`${id}-arm-crossed`} pose={withArms(IDLE, ARMS_CROSSED)} eye="half" mouth="closed" />
          </Cell>
        )}
      </div>

      <h3>6 · Outfit variants</h3>
      <div className="row">
        {OUTFITS.map((o) => (
          <Cell key={o} label={OUTFIT_LABEL[o]} w={148}>
            <Character id={id} uid={`${id}-fit-${o}`} pose={restPose} outfit={o} eye="open" mouth={id === "sun" ? "smile" : "closed"} />
          </Cell>
        ))}
      </div>
    </section>
  );
}


const D_OUTFIT_LABEL: Record<DOutfit, string> = {
  kit: "own clothes",
  parka: "parka — north",
  shell: "rain shell — escarpment",
  beret: "beret + scarf — Quebec",
  tote: "tote + camera — Montreal",
};

function DetailedSheet({ id }: { id: DetailId }): JSX.Element {
  const c = DETAILED[id];
  const crossed = id === "curse";
  const restPose = crossed ? withArms(IDLE, ARMS_CROSSED) : IDLE;
  const rest = id === "sun" ? ("smile" as const) : ("smirk" as const);

  return (
    <section className="sheet" data-character={id} data-style="detailed">
      <header className="sheet-head">
        <h2>
          {id === "sun" ? "A" : "B"} — {c.name} <em>· detailed</em>
          <span className="swatch" style={{ background: c.palette.hair }} />
          <span className="hex">{c.palette.hair}</span>
        </h2>
        <p className="sub">
          {id === "sun"
            ? "Volleyball kit, knee pads, court shoes. ~6.4 heads tall — old enough to read as a person rather than a mascot."
            : "Crossed kimono over an obi, wide sleeves, bare marked forearms. ~6.9 heads, and he does not move."}
        </p>
      </header>

      <h3>1—2 · Front neutral &amp; 3/4 turn</h3>
      <div className="row">
        <Cell label="front neutral" w={200}>
          <DetailedCharacter id={id} uid={`d-${id}-front`} pose={restPose} mouth={rest} />
        </Cell>
        <Cell label="3/4 turn" w={200}>
          <DetailedCharacter id={id} uid={`d-${id}-tq`} pose={restPose} turn={1} eye="side" mouth={rest} />
        </Cell>
        <Cell label="3/4, other way" w={200}>
          <DetailedCharacter id={id} uid={`d-${id}-tqf`} pose={restPose} turn={1} flip eye="side" mouth="closed" />
        </Cell>
      </div>

      <h3>3 · Walk cycle — 8 poses</h3>
      <div className="row walk">
        {WALK.map((pose, i) => (
          <Cell key={i} label={`${i} ${WALK_FRAME_NAMES[i] ?? ""}`} w={112}>
            <DetailedCharacter id={id} uid={`d-${id}-walk-${i}`} pose={pose} turn={1}
              eye={i === 3 || i === 7 ? "half" : "open"} mouth={id === "sun" ? "grin" : "closed"} />
          </Cell>
        ))}
      </div>

      <h3>4 · Expression parts — 7 brows × 8 eyes × 10 mouths</h3>
      <p className="note">
        Eyes are built the way anime eyes are: sclera, two-tone iris, pupil, two specular
        highlights, a heavy tapered lash line and a thin lower lid. That layering is the
        whole difference between a drawn face and a constructed one.
      </p>
      <div className="row">
        {D_BROWS.map((b) => (
          <Cell key={b} label={b} w={100}>
            <DetailedCharacter id={id} uid={`d-${id}-brow-${b}`} crop="head" brow={b} eye="open" mouth="closed" />
          </Cell>
        ))}
      </div>
      <div className="row">
        {D_EYES.map((e) => (
          <Cell key={e} label={e} w={100}>
            <DetailedCharacter id={id} uid={`d-${id}-eye-${e}`} crop="head" brow="neutral" eye={e} mouth="closed" />
          </Cell>
        ))}
      </div>
      <div className="row">
        {D_MOUTHS.map((m) => (
          <Cell key={m} label={m} w={100}>
            <DetailedCharacter id={id} uid={`d-${id}-mouth-${m}`} crop="head" brow="neutral" eye="open" mouth={m} />
          </Cell>
        ))}
      </div>

      <h3>4b · Emote layer</h3>
      <p className="note">Anime shorthand, composited over any expression — this is where most of the feeling comes from.</p>
      <div className="row">
        {D_EMOTES.map((em) => (
          <Cell key={em} label={em} w={100}>
            <DetailedCharacter id={id} uid={`d-${id}-emote-${em}`} crop="head" emote={em}
              brow={em === "anger" ? "angry" : em === "blush" ? "worried" : "neutral"}
              eye={em === "shadow" ? "shadowed" : em === "sparkle" ? "sparkle" : "open"}
              mouth={em === "blush" ? "o" : em === "anger" ? "grimace" : "closed"} />
          </Cell>
        ))}
      </div>

      <h3>5 · Arm poses — 6</h3>
      <div className="row">
        {ARM_POSE_NAMES.map((a) => (
          <Cell key={a} label={a} w={140}>
            <DetailedCharacter id={id} uid={`d-${id}-arm-${a}`} pose={withArms(IDLE, ARM_POSES[a])} mouth={rest} />
          </Cell>
        ))}
        {crossed && (
          <Cell label="crossed — B default" w={140}>
            <DetailedCharacter id={id} uid={`d-${id}-arm-crossed`} pose={withArms(IDLE, ARMS_CROSSED)} eye="half" mouth="smirk" />
          </Cell>
        )}
      </div>

      <h3>6 · Outfit variants</h3>
      <div className="row">
        {D_OUTFITS.map((o) => (
          <Cell key={o} label={D_OUTFIT_LABEL[o]} w={158}>
            <DetailedCharacter id={id} uid={`d-${id}-fit-${o}`} pose={restPose} outfit={o} mouth={rest} />
          </Cell>
        ))}
      </div>
    </section>
  );
}

export default function SheetsPage(): JSX.Element {
  return (
    <main className="sheets">
      <h1>Character sheets</h1>
      <p className="lede">
        Both mascots are <strong>original</strong> — recognition lands through silhouette,
        colour and energy, not likeness. Every pose below is generated from one rig, so this
        sheet and the animated characters are the same file: nothing here needs slicing.
      </p>
      <h2 className="band">Design 1 · mascot</h2>
      <p className="band-note">
        Minimal, flat, 5.5 heads tall. Sits quietly inside a restrained layout and stays
        legible at 40px. This is the one that will not fight the photography.
      </p>
      <Sheet id="sun" />
      <Sheet id="curse" />

      <h2 className="band">Design 2 · detailed</h2>
      <p className="band-note">
        Higher fidelity, ~6.5 heads, constructed skull with a real jaw and cheekbone,
        layered irises, individually drawn hair strands with a sheen band, and tailored
        garments. Same skeleton and the same eight walk frames drive it — so the two
        designs are swappable at any point, and nothing downstream has to change.
      </p>
      <DetailedSheet id="sun" />
      <DetailedSheet id="curse" />
    </main>
  );
}
