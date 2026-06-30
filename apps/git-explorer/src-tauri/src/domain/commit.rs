// Git history/graph/detail/diff 도메인 타입은 git-core(정본)로 이관됨.
// 기존 `crate::domain::commit::*` 참조 호환을 위해 re-export한다.
pub use git_core::domain::*;
