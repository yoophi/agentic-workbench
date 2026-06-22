mod application;
mod domain;
mod inbound;
mod infrastructure;

use inbound::tauri_commands::{
    create_git_worktree, create_project, delete_git_worktree, delete_project, list_git_branches,
    list_git_remotes, list_git_worktrees, list_projects, update_project,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            list_projects,
            create_project,
            update_project,
            delete_project,
            list_git_remotes,
            list_git_branches,
            list_git_worktrees,
            create_git_worktree,
            delete_git_worktree
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
