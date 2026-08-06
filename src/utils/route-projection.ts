import type { RoutePoint } from "@/types/share.type";
import type { ProjectedPoint, RouteMarkers } from "@/types/global.type";

const CIRCULAR_THRESHOLD = 16;
const CIRCULAR_OFFSET = 10;

export const  projectRoute = (
  points: RoutePoint[],
  width: number,
  height: number,
  padding = 40
): ProjectedPoint[] => {
  if (points.length === 0) return [];

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // A longitude degree covers less ground than a latitude degree away from the equator, so it must
  // be scaled by cos(latitude). Without this the route is horizontally stretched and no longer
  // matches the Web Mercator shape drawn by the in-app map (map_picture).
  const midLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos((midLat * Math.PI) / 180);

  const latRange = maxLat - minLat || 0.0001;
  const lngRange = (maxLng - minLng) * lngScale || 0.0001;

  const availW = width - padding * 2;
  const availH = height - padding * 2;

  const scale = Math.min(availW / lngRange, availH / latRange);

  const projW = lngRange * scale;
  const projH = latRange * scale;

  const offsetX = padding + (availW - projW) / 2;
  const offsetY = padding + (availH - projH) / 2;

  return points.map((p) => ({
    x: offsetX + (p.lng - minLng) * lngScale * scale,
    y: offsetY + (maxLat - p.lat) * scale,
  }));
};

export const toPolylinePoints = (projected: ProjectedPoint[]): string => {
  return projected.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
};

// Builds a smooth SVG path (Catmull-Rom spline expressed as cubic beziers) that passes exactly
// through every projected point, rounding only the transitions between them. This restores the
// rounded look of the dense in-app map without moving the GPS vertices (no shape distortion) and
// without needing more points from the backend.
export const toSmoothPath = (projected: ProjectedPoint[]): string => {
  if (projected.length === 0) return "";
  if (projected.length < 3) {
    return "M " + projected.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  }

  let d = `M ${projected[0]!.x.toFixed(1)},${projected[0]!.y.toFixed(1)}`;
  for (let i = 0; i < projected.length - 1; i++) {
    const p0 = projected[i - 1] ?? projected[i]!;
    const p1 = projected[i]!;
    const p2 = projected[i + 1]!;
    const p3 = projected[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
};

export const getRouteMarkers = (projected: ProjectedPoint[]): RouteMarkers | null => {
  if (projected.length < 2) return null;

  const start = projected[0]!;
  const rawEnd = projected[projected.length - 1]!;

  const dist = Math.hypot(rawEnd.x - start.x, rawEnd.y - start.y);
  const isCircular = dist < CIRCULAR_THRESHOLD;

  const end = isCircular
    ? { x: rawEnd.x + CIRCULAR_OFFSET, y: rawEnd.y - CIRCULAR_OFFSET }
    : rawEnd;

  return { start, end, isCircular };
};