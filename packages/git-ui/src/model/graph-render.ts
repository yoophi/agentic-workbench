import type { GitGraphRef, GitGraphSegment } from "@yoophi/git-graph";

/** lane 번호를 SVG x 좌표로 변환(각 lane은 20px 간격). */
export function laneX(lane: number) {
  return 10 + lane * 20;
}

/** graph 연결선 세그먼트를 SVG path 문자열로 변환한다. */
export function graphSegmentPath(segment: GitGraphSegment, rowHeight: number) {
  const fromX = laneX(segment.fromLane);
  const toX = laneX(segment.toLane);
  const centerY = rowHeight / 2;

  if (segment.type === "vertical") {
    return `M ${fromX} 0 L ${toX} ${rowHeight}`;
  }

  if (segment.type === "vertical-top") {
    return `M ${fromX} 0 L ${fromX} ${centerY}`;
  }

  if (segment.type === "vertical-bottom") {
    return `M ${fromX} ${centerY} L ${fromX} ${rowHeight}`;
  }

  return `M ${fromX} ${centerY} C ${fromX} ${rowHeight}, ${toX} ${rowHeight}, ${toX} ${rowHeight}`;
}

/** ref 목록을 대상 커밋 해시별로 묶는다. */
export function refsByTarget(refs: GitGraphRef[]) {
  const result = new Map<string, GitGraphRef[]>();

  for (const ref of refs) {
    const existing = result.get(ref.target) ?? [];
    existing.push(ref);
    result.set(ref.target, existing);
  }

  return result;
}
