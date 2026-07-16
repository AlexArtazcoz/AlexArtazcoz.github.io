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

/** Fractions cut from each edge of the source image (0–0.45). */
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

export const MAX_TRIM = 0.45;

export const hasTrim = (t?: Trim): boolean =>
  !!t && (t.t > 0.0001 || t.r > 0.0001 || t.b > 0.0001 || t.l > 0.0001);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r4 = (n: number) => Math.round(n * 10000) / 10000;

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
  const tr = crop.trim ?? noTrim();
  const l = clamp(tr.l ?? 0, 0, MAX_TRIM);
  const r = clamp(tr.r ?? 0, 0, MAX_TRIM);
  const t = clamp(tr.t ?? 0, 0, MAX_TRIM);
  const b = clamp(tr.b ?? 0, 0, MAX_TRIM);
  const vw = Math.max(0.1, 1 - l - r); // visible fraction of the source
  const vh = Math.max(0.1, 1 - t - b);

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

export const srcStyle = (g: FrameGeometry): string =>
  `left:${g.src.left}%;top:${g.src.top}%;width:${g.src.width}%;height:${g.src.height}%;transform:rotate(${g.src.rot}deg);`;

export const imgStyle = (g: FrameGeometry): string =>
  `left:${g.img.left}%;top:${g.img.top}%;width:${g.img.width}%;height:${g.img.height}%;`;
