import { verge, type SceneItem } from "../corridor";
import type { Scenery, HorizonSpec } from "./kit";

/**
 * Five roads, five countries.
 *
 * Every trip used to run the same three scenery builders, so Highway 60 through
 * Algonquin and the Autoroute 20 into Montréal were the same pines in the same
 * places with a different script over them. These are what each road actually
 * looks like, from what actually grows and gets built there:
 *
 *   muskoka       Canadian Shield. Blasted granite cuts, white pine, birch,
 *                 cottages and docks on the lakes between Gravenhurst and
 *                 Huntsville.
 *   algonquin     56 km of Highway 60: hardwood maple, black spruce, open
 *                 sphagnum bog with tamarack going gold, and moose signs that
 *                 are not decorative.
 *   georgian-bay  The Niagara Escarpment. A dolostone cap over a talus slope,
 *                 apple orchards below it, barns and silos, Blue Mountain's
 *                 cleared runs, and a harbour with a grain terminal on it.
 *   montreal      Flat farmland down the 20, then brick plexes with the
 *                 staircase on the outside, a parish church, the cross on the
 *                 mountain and the tower leaning over the east end.
 *   quebec-city   Fieldstone houses under very steep roofs, tin spires, the
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

/* =========================================================== Algonquin === */

/**
 * The corridor. Hardwood on the ridges, black spruce in the hollows, and every
 * few kilometres the forest opens onto a bog with tamarack standing in it.
 */
function parkForest(depth: number, seed: number): SceneItem[] {
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

function parkHighway(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(80, depth, 200, -400, "spruce", { seed, spread: 340, s: 1 }),
    ...verge(160, depth, 210, 400, "spruce", { seed: seed + 2, spread: 340, s: 1 }),
    ...verge(300, depth, 380, -330, "maple", { seed: seed + 4, spread: 260, s: 1.1 }),
    ...verge(1300, depth, 2000, 560, "bog", { seed: seed + 6, spread: 30 }),
    ...verge(1350, depth, 1400, 520, "tamarack", { seed: seed + 8, spread: 150 }),
    { z: depth * 0.22, x: 260, kind: "sign", label: "60" },
    { z: depth * 0.52, x: -250, kind: "moose" },
    { z: depth * 0.86, x: 255, kind: "sign", label: "60" },
  ];
}

function parkTown(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(100, depth * 0.7, 330, -330, "store", { seed, spread: 90 }),
    ...verge(190, depth * 0.7, 360, 330, "store", { seed: seed + 3, spread: 90 }),
    ...verge(120, depth, 400, -200, "lamp", { seed: seed + 5, spread: 40, s: 0.95 }),
    ...verge(depth * 0.45, depth, 230, -470, "spruce", { seed: seed + 7, spread: 220, s: 0.95 }),
    ...verge(depth * 0.5, depth, 300, 470, "maple", { seed: seed + 9, spread: 240 }),
    ...verge(depth * 0.6, depth, 1500, 600, "canoe", { seed: seed + 11, spread: 40, s: 0.9 }),
  ];
}

export const ALGONQUIN_COUNTRY: Scenery = {
  city: parkTown,
  town: parkTown,
  forest: parkForest,
  highway: parkHighway,
  water: parkForest,
  indoor: parkTown,
};

export const ALGONQUIN_HORIZON: HorizonSpec = {
  height: 0.16, rough: 0.35, bands: 3, tint: "#6B4A2E",
};

/* ======================================================== Georgian Bay === */

/**
 * Under the escarpment. The cliff runs along one side for most of the valley,
 * with orchards and barns on the flat below it.
 */
function valleyForest(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(600, depth, 2200, -630, "scarp", { seed, spread: 0, s: 1.3 }),
    ...verge(1900, depth, 3000, 690, "scarp", { seed: seed + 1, spread: 0, s: 1.05 }),
    ...verge(70, depth, 200, -350, "maple", { seed: seed + 2, spread: 290, s: 1.1 }),
    ...verge(140, depth, 210, 350, "maple", { seed: seed + 3, spread: 290, s: 1.1 }),
    ...verge(260, depth, 300, -300, "cedar", { seed: seed + 4, spread: 220 }),
    ...verge(340, depth, 320, 300, "birch", { seed: seed + 5, spread: 220, s: 0.95 }),
    ...verge(800, depth, 1500, -470, "fence", { seed: seed + 6, spread: 30, s: 0.9 }),
    ...verge(1200, depth, 1900, 500, "orchard", { seed: seed + 7, spread: 60 }),
  ];
}

function valleyFarm(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(500, depth, 2000, -660, "scarp", { seed, spread: 0, s: 1.2 }),
    ...verge(180, depth, 700, -480, "orchard", { seed: seed + 2, spread: 80 }),
    ...verge(420, depth, 760, 490, "orchard", { seed: seed + 3, spread: 80 }),
    ...verge(900, depth, 1800, -560, "barn", { seed: seed + 4, spread: 70 }),
    ...verge(1500, depth, 2200, 580, "barn", { seed: seed + 5, spread: 70, s: 0.9 }),
    ...verge(240, depth, 620, -360, "fence", { seed: seed + 6, spread: 20, s: 0.95 }),
    ...verge(300, depth, 660, 360, "fence", { seed: seed + 7, spread: 20, s: 0.95 }),
    ...verge(700, depth, 900, 420, "maple", { seed: seed + 8, spread: 200, s: 1.05 }),
    { z: depth * 0.34, x: -255, kind: "sign", label: "26" },
    { z: depth * 0.78, x: 250, kind: "sign", label: "13" },
  ];
}

function valleyTown(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(100, depth * 0.78, 280, -330, "store", { seed, spread: 90 }),
    ...verge(170, depth * 0.78, 310, 330, "store", { seed: seed + 3, spread: 90 }),
    ...verge(120, depth, 360, -200, "lamp", { seed: seed + 5, spread: 40, s: 0.95 }),
    ...verge(250, depth, 400, 200, "lamp", { seed: seed + 7, spread: 40, s: 0.95 }),
    // the harbour end of every town on this shore
    ...verge(1400, depth, 2600, -600, "terminal", { seed: seed + 9, spread: 40, s: 0.95 }),
    ...verge(2000, depth, 3000, 620, "light", { seed: seed + 11, spread: 30 }),
    ...verge(depth * 0.5, depth, 320, 480, "maple", { seed: seed + 13, spread: 220 }),
    ...verge(900, depth, 3000, -700, "skihill", { seed: seed + 15, spread: 0, s: 1.1 }),
  ];
}

export const GEORGIAN_COUNTRY: Scenery = {
  city: valleyTown,
  town: valleyTown,
  forest: valleyForest,
  highway: valleyFarm,
  water: valleyTown,
  indoor: valleyTown,
};

export const GEORGIAN_HORIZON: HorizonSpec = {
  height: 0.17, rough: 0.08, bands: 2, tint: "#6F6A57",
};

/* ========================================================== Montréal === */

/** The 20: flat, straight, and farmed right up to the shoulder. */
function stLawrenceHighway(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(220, depth, 620, -520, "hedge", { seed, spread: 60 }),
    ...verge(360, depth, 660, 520, "hedge", { seed: seed + 2, spread: 60 }),
    ...verge(900, depth, 1500, -600, "barn", { seed: seed + 4, spread: 60, s: 0.85 }),
    ...verge(700, depth, 1100, 470, "maple", { seed: seed + 6, spread: 200, s: 0.95 }),
    ...verge(1800, depth, 2600, -560, "spire", { seed: seed + 8, spread: 40, s: 0.8 }),
    { z: depth * 0.26, x: 255, kind: "sign", label: "20" },
    { z: depth * 0.68, x: -250, kind: "sign", label: "40" },
  ];
}

/** The Plateau: plexes with the staircase outside, and a parish at the corner. */
function plateauStreet(depth: number, seed: number): SceneItem[] {
  return [
    ...verge(90, depth, 215, -268, "plex", { seed, spread: 40, s: 1.35 }),
    ...verge(150, depth, 225, 268, "plex", { seed: seed + 2, spread: 40, s: 1.35 }),
    ...verge(120, depth, 330, -215, "lamp", { seed: seed + 4, spread: 30, s: 1 }),
    ...verge(280, depth, 350, 215, "lamp", { seed: seed + 6, spread: 30, s: 1 }),
    // street trees, half down by the third week of October
    ...verge(200, depth, 300, -250, "maple", { seed: seed + 8, spread: 60, s: 0.8 }),
    ...verge(340, depth, 320, 250, "maple", { seed: seed + 10, spread: 60, s: 0.8 }),
    ...verge(1500, depth, 2600, -560, "parish", { seed: seed + 12, spread: 30 }),
    ...verge(2400, depth, 3400, 600, "olympic", { seed: seed + 14, spread: 0, s: 0.9 }),
    ...verge(1900, depth, 3600, -900, "cross", { seed: seed + 16, spread: 0 }),
  ];
}

export const MONTREAL_COUNTRY: Scenery = {
  city: plateauStreet,
  town: plateauStreet,
  forest: stLawrenceHighway,
  highway: stLawrenceHighway,
  water: plateauStreet,
  indoor: plateauStreet,
};

export const MONTREAL_HORIZON: HorizonSpec = {
  height: 0.07, rough: 0.15, bands: 2, tint: "#4C5A4A",
};

/* ========================================================= Québec City === */

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
  forest: riverHighway,
  highway: riverHighway,
  water: stoneStreet,
  indoor: stoneStreet,
};

export const QUEBEC_HORIZON: HorizonSpec = {
  height: 0.16, rough: 0.3, bands: 3, tint: "#53605F",
};
