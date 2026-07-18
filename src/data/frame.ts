/**
 * Frame geometry — how a source image is trimmed, rotated, framed, zoomed and
 * panned inside its canvas frame. Shared by the renderer (ProjectCanvas) and by
 * the layout editor, so both draw exactly the same thing.
 *
 * The pipeline is: trim the source edges → rotate in quarter turns → fit the
 * result into a frame of a chosen aspect (cover) → zoom → pan.
 *
 * It targets this DOM:
 *   .canvas__frame   aspect-ratio: A, overflow hidden
 *     └ .canvas__src the trimmed source box: cover-sized, then rotated
 *         └ img      scaled/offset so the trimmed rect exactly fills .canvas__src
 *
 * Everything is returned in percentages of the frame, so a composition scales
 * losslessly at any size.
 */

/** Fractions cut from each edge of the source image. Any amount goes, as long
 * as the pair of opposite edges leaves at least MIN_VISIBLE of the source —
 * clampTrim() enforces that invariant wherever a trim enters the pipeline. */
export interface Trim {
  t: number;
  r: number;
  b: number;
  l: number;
}

export interface Crop {
  /** Frame width/height ratio, or null to follow the image itself. */
  aspect: number | null;
  /** Focal point in percent (0–100) used to pan when the image overflows. */
  fx: number;
  fy: number;
  /** Zoom factor (>= 1). */
  zoom: number;
  /** Quarter-turn rotation in degrees: 0 | 90 | 180 | 270. */
  rot?: number;
  /** Edge trim — cuts dirty borders/black margins without zooming. */
  trim?: Trim;
}

export const noTrim = (): Trim => ({ t: 0, r: 0, b: 0, l: 0 });

export const defaultCrop = (): Crop => ({
  aspect: null,
  fx: 50,
  fy: 50,
  zoom: 1,
  rot: 0,
  trim: noTrim(),
});

/** Hard cap for a single edge (you can cut almost everything from one side). */
export const MAX_TRIM = 0.98;
/** Fraction of the source that must survive on each axis. */
export const MIN_VISIBLE = 0.02;

export const hasTrim = (t?: Trim): boolean =>
  !!t && (t.t > 0.0001 || t.r > 0.0001 || t.b > 0.0001 || t.l > 0.0001);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r4 = (n: number) => Math.round(n * 10000) / 10000;

/** Bring a stored trim inside the invariant: each edge within [0, MAX_TRIM]
 * and each opposite pair scaled down, if needed, to leave MIN_VISIBLE. */
export function clampTrim(tr?: Trim): Trim {
  let l = clamp(tr?.l ?? 0, 0, MAX_TRIM);
  let r = clamp(tr?.r ?? 0, 0, MAX_TRIM);
  let t = clamp(tr?.t ?? 0, 0, MAX_TRIM);
  let b = clamp(tr?.b ?? 0, 0, MAX_TRIM);
  const w = l + r;
  if (w > 1 - MIN_VISIBLE) {
    const s = (1 - MIN_VISIBLE) / w;
    l *= s;
    r *= s;
  }
  const h = t + b;
  if (h > 1 - MIN_VISIBLE) {
    const s = (1 - MIN_VISIBLE) / h;
    t *= s;
    b *= s;
  }
  return { t, r, b, l };
}

export interface FrameGeometry {
  /** Frame aspect ratio (width / height). */
  aspect: number;
  src: { width: number; height: number; left: number; top: number; rot: number };
  img: { width: number; height: number; left: number; top: number };
}

/** Normalize a rotation value to one of 0 / 90 / 180 / 270. */
export const normRot = (rot?: number): number =>
  (((Math.round((rot ?? 0) / 90) * 90) % 360) + 360) % 360;

export function frameGeometry(na: number, crop: Crop): FrameGeometry {
  const { t, r, b, l } = clampTrim(crop.trim);
  const vw = Math.max(MIN_VISIBLE, 1 - l - r); // visible fraction of the source
  const vh = Math.max(MIN_VISIBLE, 1 - t - b);

  const ta = na * (vw / vh); // aspect of the trimmed source
  const rot = normRot(crop.rot);
  const quarter = rot === 90 || rot === 270;
  const ea = quarter ? 1 / ta : ta; // aspect once rotated
  const A = crop.aspect ?? ea; // frame aspect
  const z = Math.max(1, crop.zoom ?? 1);

  // Work in frame units: the frame is 1 wide and 1/A tall.
  const Wf = 1;
  const Hf = 1 / A;

  // Rotated footprint, cover-fitted to the frame, then zoomed.
  let Fw: number;
  let Fh: number;
  if (ea >= A) {
    Fh = Hf;
    Fw = Hf * ea;
  } else {
    Fw = Wf;
    Fh = Wf / ea;
  }
  Fw *= z;
  Fh *= z;

  // A quarter turn swaps the element's layout box relative to its footprint.
  const We = quarter ? Fh : Fw;
  const He = quarter ? Fw : Fh;

  // Pan: slide the footprint within the frame by the focal point.
  const cx = Wf / 2 + (0.5 - clamp(crop.fx ?? 50, 0, 100) / 100) * (Fw - Wf);
  const cy = Hf / 2 + (0.5 - clamp(crop.fy ?? 50, 0, 100) / 100) * (Fh - Hf);

  return {
    aspect: r4(A),
    src: {
      width: r4((We / Wf) * 100),
      height: r4((He / Hf) * 100),
      left: r4(((cx - We / 2) / Wf) * 100),
      top: r4(((cy - He / 2) / Hf) * 100),
      rot,
    },
    img: {
      width: r4((1 / vw) * 100),
      height: r4((1 / vh) * 100),
      left: r4(-(l / vw) * 100),
      top: r4(-(t / vh) * 100),
    },
  };
}

/** What the deep-zoom viewer needs to reproduce a frame exactly. */
export interface ViewerFrame {
  /** Quarter-turn rotation applied to the source. */
  rot: number;
  /** Trim of the source image, as fractions [left, top, width, height]. */
  clip: [number, number, number, number];
  /** Initial visible window within the rotated clipped image, as fractions
   * [x, y, width, height] — exactly the region the canvas frame shows. */
  view: [number, number, number, number];
}

/**
 * Same pipeline as frameGeometry, solved for the viewer: which rectangle of
 * the (trimmed, rotated) source is visible inside the frame right now.
 */
export function viewerFrame(na: number, crop: Crop): ViewerFrame {
  const { t, r, b, l } = clampTrim(crop.trim);
  const vw = Math.max(MIN_VISIBLE, 1 - l - r);
  const vh = Math.max(MIN_VISIBLE, 1 - t - b);

  const ta = na * (vw / vh);
  const rot = normRot(crop.rot);
  const quarter = rot === 90 || rot === 270;
  const ea = quarter ? 1 / ta : ta;
  const A = crop.aspect ?? ea;
  const z = Math.max(1, crop.zoom ?? 1);

  const Wf = 1;
  const Hf = 1 / A;
  let Fw: number;
  let Fh: number;
  if (ea >= A) {
    Fh = Hf;
    Fw = Hf * ea;
  } else {
    Fw = Wf;
    Fh = Wf / ea;
  }
  Fw *= z;
  Fh *= z;
  const cx = Wf / 2 + (0.5 - clamp(crop.fx ?? 50, 0, 100) / 100) * (Fw - Wf);
  const cy = Hf / 2 + (0.5 - clamp(crop.fy ?? 50, 0, 100) / 100) * (Fh - Hf);

  const u0 = clamp((Fw / 2 - cx) / Fw, 0, 1);
  const v0 = clamp((Fh / 2 - cy) / Fh, 0, 1);
  const uw = Math.min(1 - u0, Wf / Fw);
  const vv = Math.min(1 - v0, Hf / Fh);

  return {
    rot,
    clip: [r4(l), r4(t), r4(vw), r4(vh)],
    view: [r4(u0), r4(v0), r4(uw), r4(vv)],
  };
}

export const srcStyle = (g: FrameGeometry): string =>
  `left:${g.src.left}%;top:${g.src.top}%;width:${g.src.width}%;height:${g.src.height}%;transform:rotate(${g.src.rot}deg);`;

export const imgStyle = (g: FrameGeometry): string =>
  `left:${g.img.left}%;top:${g.img.top}%;width:${g.img.width}%;height:${g.img.height}%;`;
