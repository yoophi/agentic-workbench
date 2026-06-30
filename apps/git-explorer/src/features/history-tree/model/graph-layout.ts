// graph-layout은 @yoophi/git-graph로 추출됨(정본). 기존 소비처 import 경로 호환을 위해 re-export한다.
export {
  computeGitGraphRows,
  getMaxGraphLane,
  type GitGraphNodeType,
  type GitGraphSegmentType,
  type GitGraphSegment,
  type GitGraphRow,
} from "@yoophi/git-graph";
