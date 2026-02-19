import { Point, Polygon } from './types';

/**
 * Calculates the Euclidean distance between two points.
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Checks if a point is inside a polygon using the Ray Casting algorithm.
 * @param point The point to check.
 * @param polygon The polygon defined by an array of points.
 * @returns True if the point is inside, false otherwise.
 */
export function isPointInPolygon(point: Point, polygon: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if two line segments intersect.
 * Segment 1: p1 -> p2
 * Segment 2: p3 -> p4
 * @returns The intersection point or null if no intersection.
 */
export function getLineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
  if (det === 0) {
    return null; // Lines are parallel
  } else {
    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
    if ((0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1)) {
      return {
        x: p1.x + lambda * (p2.x - p1.x),
        y: p1.y + lambda * (p2.y - p1.y)
      };
    } else {
      return null;
    }
  }
}

/**
 * Computes the intersection of a line segment (start -> end) with a polygon.
 * Returns a list of intersection points sorted by distance from start.
 */
export function getPolygonIntersections(start: Point, end: Point, polygon: Polygon): Point[] {
    const intersections: Point[] = [];
    for (let i = 0; i < polygon.length; i++) {
        const p3 = polygon[i];
        const p4 = polygon[(i + 1) % polygon.length];

        const intersection = getLineIntersection(start, end, p3, p4);
        if (intersection) {
            intersections.push(intersection);
        }
    }

    // Sort by distance from start
    return intersections.sort((a, b) => distance(start, a) - distance(start, b));
}
