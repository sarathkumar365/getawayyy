import { verge, type SceneItem } from "../corridor";
import type { Scenery, HorizonSpec } from "./kit";

/**
 * Two roads, two countries.
 *
 * Every trip used to run the same three scenery builders, so every road was the
 * same pines in the same places with a different script over them. These are
 * what each road actually looks like, from what actually grows and gets built
 * there:
 *
 *   muskoka       Canadian Shield. Blasted granite cuts, white pine, birch,
 *                 cottages and docks on the lakes between Bracebridge,
 *                 Huntsville and Dorset.
 *   quebec-city   Spruce and bog up the Jacques-Cartier valley, then
 *                 fieldstone houses under very steep roofs, tin spires, the
 *                 seigneurial strip fields of Île d'Orléans, the wall, and the
 *                 Château on the cape.
 *
 * Each table covers all six terrains because a trip's script may use any of
 * them; several map to the same builder where a trip genuinely has one kind of
 * road.
 */

/* ============================================================= Muskoka === */

function shieldHighway(depth: number, seed: number): SceneItem[] {
  return [
    // The road does not go around the Shield, it goes through it.
    ...verge(300, depth, 900, -640, "rockcut", { seed, spread: 60, s: 1.1 }),
    ...verge(760, depth, 1150, 660, "rockcut", { seed: seed + 1, spread: 60, s: 0.95 }),
    ...verge(80, depth, 230, -400, "pine", { seed: seed + 2, spread: 330, s: 1.05 }),
    ...verge(150, depth, 240, 400, "pine", { seed: seed + 3, spread: 330, s: 1.05 }),
    ...verge(420, depth, 560, -330, "birch", { seed: seed + 4, spread: 240, s: 0.95 }),
    ...verge(520, depth, 620, 330, "maple", { seed: seed + 5, spread: 260 }),
    { z: depth * 0.28, x: 250, kind: "sign", label: "11" },
    { z: depth * 0.74, x: -250, kind: "sign", label: "11" },
  ];
}

function shieldForest(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(60, depth, 175, -340, "pine", { seed, spread: 300 }),
    ...verge(130, depth, 185, 340, "pine", { seed: seed + 2, spread: 300 }),
    ...verge(220, depth, 300, -300, "birch", { seed: seed + 4, spread: 220, s: 0.95 }),
    ...verge(300, depth, 330, 300, "maple", { seed: seed + 6, spread: 240 }),
    ...verge(480, depth, 520, 270, "cedar", { seed: seed + 8, spread: 180, s: 0.9 }),
    ...verge(600, depth, 1400, -600, "rockcut", { seed: seed + 10, spread: 40, s: 0.8 }),
    // a cottage and its canoe, at the lake ends of the run
    ...verge(900, depth, 1700, -520, "cottage", { seed: seed + 12, spread: 90 }),
    ...verge(1400, depth, 2100, 540, "cottage", { seed: seed + 14, spread: 90 }),
    ...verge(1100, depth, 1900, -430, "canoe", { seed: seed + 16, spread: 50, s: 0.9 }),
    ...verge(1600, depth, 2400, 430, "dock", { seed: seed + 18, spread: 40, s: 0.85 }),
  ];
}

function shieldTown(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(100, depth * 0.82, 290, -330, "store", { seed, spread: 90 }),
    ...verge(180, depth * 0.82, 330, 330, "store", { seed: seed + 3, spread: 90 }),
    ...verge(120, depth, 370, -200, "lamp", { seed: seed + 5, spread: 40, s: 0.95 }),
    ...verge(260, depth, 410, 200, "lamp", { seed: seed + 7, spread: 40, s: 0.95 }),
    ...verge(depth * 0.5, depth, 280, -470, "pine", { seed: seed + 9, spread: 200, s: 0.9 }),
    ...verge(depth * 0.55, depth, 900, 560, "rockcut", { seed: seed + 11, spread: 40, s: 0.7 }),
  ];
}

function shieldCity(depth: number, seed: number): SceneItem[] {
  const cityEnd = depth * 0.34;
  const lastLamp = depth * 0.62;
  const lamps: SceneItem[] = [];
  let z = 80;
  let i = 0;
  // Spacing widens until the lights simply stop. "Then the last of the
  // streetlights" is a real position in the world, not a caption.
  while (z < lastLamp) {
    lamps.push({ z, x: (i % 2 === 0 ? -1 : 1) * 168, kind: "lamp", s: 1 });
    z += 150 + (760 - 150) * ((z - 80) / Math.max(1, lastLamp - 80));
    i += 1;
  }
  return [
    ...verge(80, cityEnd, 150, -520, "block", { seed, spread: 220, jitter: 60 }),
    ...verge(140, cityEnd, 160, 520, "block", { seed: seed + 2, spread: 220, jitter: 60 }),
    ...verge(cityEnd, depth * 0.72, 420, -560, "block", { seed: seed + 4, spread: 180, s: 0.9 }),
    ...lamps,
    ...verge(depth * 0.38, depth, 210, -380, "pine", { seed: seed + 6, spread: 260 }),
    ...verge(depth * 0.42, depth, 230, 380, "pine", { seed: seed + 8, spread: 260 }),
    ...verge(depth * 0.6, depth, 340, -300, "birch", { seed: seed + 10, spread: 160, s: 0.9 }),
  ];
}

export const MUSKOKA_COUNTRY: Scenery = {
  city: shieldCity,
  town: shieldTown,
  forest: shieldForest,
  highway: shieldHighway,
  water: shieldForest,
  indoor: shieldTown,
};

export const MUSKOKA_HORIZON: HorizonSpec = {
  height: 0.13, rough: 0.35, bands: 3, tint: "#4A5E57",
};

/* ========================================================= Québec City === */

/**
 * The Jacques-Cartier valley. Hardwood on the ridges, black spruce in the
 * hollows, and every few kilometres the forest opens onto a bog with tamarack
 * standing in it.
 */
function valleyParkForest(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(60, depth, 150, -330, "spruce", { seed, spread: 300, s: 1.05 }),
    ...verge(120, depth, 160, 330, "spruce", { seed: seed + 2, spread: 300, s: 1.05 }),
    ...verge(180, depth, 310, -290, "maple", { seed: seed + 4, spread: 260, s: 1 }),
    ...verge(240, depth, 330, 290, "maple", { seed: seed + 6, spread: 260, s: 1 }),
    ...verge(420, depth, 430, -260, "birch", { seed: seed + 8, spread: 200, s: 0.95 }),
    // the bogs, and the one conifer that turns gold standing in them
    ...verge(1100, depth, 2200, -560, "bog", { seed: seed + 10, spread: 30 }),
    ...verge(1700, depth, 2600, 580, "bog", { seed: seed + 12, spread: 30 }),
    ...verge(1150, depth, 1500, -500, "tamarack", { seed: seed + 14, spread: 160 }),
    ...verge(1750, depth, 1700, 520, "tamarack", { seed: seed + 16, spread: 160 }),
    ...verge(900, depth, 2400, -620, "rockcut", { seed: seed + 18, spread: 40, s: 0.85 }),
  ];
}


/** Down the 20, with the river on one side and a tin spire every few miles. */
function riverHighway(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(200, depth, 560, -520, "strip", { seed, spread: 50 }),
    ...verge(340, depth, 600, 520, "strip", { seed: seed + 2, spread: 50 }),
    ...verge(800, depth, 1400, -580, "maison", { seed: seed + 4, spread: 60, s: 0.9 }),
    ...verge(1600, depth, 2400, 600, "spire", { seed: seed + 6, spread: 30, s: 0.85 }),
    ...verge(600, depth, 900, 440, "maple", { seed: seed + 8, spread: 200, s: 0.95 }),
    ...verge(1100, depth, 1700, -440, "hedge", { seed: seed + 10, spread: 40 }),
    { z: depth * 0.3, x: 255, kind: "sign", label: "20" },
    { z: depth * 0.76, x: -250, kind: "sign", label: "138" },
  ];
}

/** Inside the walls, or down the island road. Stone, tin, and very steep roofs. */
function stoneStreet(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(90, depth, 310, -300, "maison", { seed, spread: 50, s: 1.2 }),
    ...verge(160, depth, 330, 300, "maison", { seed: seed + 2, spread: 50, s: 1.2 }),
    ...verge(120, depth, 340, -210, "lamp", { seed: seed + 4, spread: 30, s: 0.9 }),
    ...verge(270, depth, 360, 210, "lamp", { seed: seed + 6, spread: 30, s: 0.9 }),
    ...verge(1300, depth, 2300, -560, "spire", { seed: seed + 8, spread: 30 }),
    ...verge(900, depth, 2800, 620, "wall", { seed: seed + 10, spread: 20 }),
    ...verge(2200, depth, 4000, -820, "chateau", { seed: seed + 12, spread: 0 }),
    ...verge(1700, depth, 2600, 500, "stand", { seed: seed + 14, spread: 40, s: 0.9 }),
    ...verge(400, depth, 520, 420, "maple", { seed: seed + 16, spread: 160, s: 0.85 }),
  ];
}

export const QUEBEC_COUNTRY: Scenery = {
  city: stoneStreet,
  town: stoneStreet,
  forest: valleyParkForest,
  highway: riverHighway,
  water: stoneStreet,
  indoor: stoneStreet,
};

export const QUEBEC_HORIZON: HorizonSpec = {
  height: 0.16, rough: 0.3, bands: 3, tint: "#53605F",
};
