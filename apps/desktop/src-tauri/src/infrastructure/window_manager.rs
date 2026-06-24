use std::hash::{Hash, Hasher};

use percent_encoding::{NON_ALPHANUMERIC, utf8_percent_encode};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

const TABBING_IDENTIFIER: &str = "acp-session";

pub fn session_label(project_id: &str, worktree_path: &str) -> String {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    project_id.hash(&mut hasher);
    worktree_path.hash(&mut hasher);
    format!("session-{}", hasher.finish())
}

fn focus_if_open(app: &AppHandle, label: &str) -> bool {
    if let Some(window) = app.get_webview_window(label) {
        let _ = window.set_focus();
        return true;
    }
    false
}

fn session_url(project_id: &str, worktree_path: &str) -> WebviewUrl {
    let encoded_path = utf8_percent_encode(worktree_path, NON_ALPHANUMERIC).to_string();
    WebviewUrl::App(format!("index.html#/session/{project_id}/{encoded_path}").into())
}

pub fn open_session_window(
    app: &AppHandle,
    project_id: &str,
    worktree_path: &str,
    mode: &str,
) -> Result<(), String> {
    let label = session_label(project_id, worktree_path);
    if focus_if_open(app, &label) {
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    if mode == "tab" {
        open_as_tab(app, label, project_id.to_string(), worktree_path.to_string());
        return Ok(());
    }

    let _ = mode;
    build_window(app, &label, project_id, worktree_path).map(|_| ())
}

fn build_window(
    app: &AppHandle,
    label: &str,
    project_id: &str,
    worktree_path: &str,
) -> Result<WebviewWindow, String> {
    #[allow(unused_mut)]
    let mut builder = WebviewWindowBuilder::new(app, label, session_url(project_id, worktree_path))
        .title("ACP Worktree Session")
        .inner_size(1100.0, 820.0)
        .min_inner_size(980.0, 680.0);

    #[cfg(target_os = "macos")]
    {
        builder = builder.tabbing_identifier(TABBING_IDENTIFIER);
    }

    let window = builder.build().map_err(|error| error.to_string())?;

    #[cfg(debug_assertions)]
    window.open_devtools();

    Ok(window)
}

#[cfg(target_os = "macos")]
fn open_as_tab(app: &AppHandle, label: String, project_id: String, worktree_path: String) {
    use objc2_app_kit::{NSWindow, NSWindowOrderingMode};

    let app = app.clone();
    let _ = app.clone().run_on_main_thread(move || {
        let base_window = app
            .webview_windows()
            .into_iter()
            .find(|(existing_label, _)| existing_label.starts_with("session-"))
            .map(|(_, window)| window);

        let new_window = match build_window(&app, &label, &project_id, &worktree_path) {
            Ok(window) => window,
            Err(error) => {
                eprintln!("[session-tab] failed to create window: {error}");
                return;
            }
        };

        if let Some(base) = base_window {
            if let (Ok(base_ptr), Ok(new_ptr)) = (base.ns_window(), new_window.ns_window()) {
                let base_ns: &NSWindow = unsafe { &*base_ptr.cast::<NSWindow>() };
                let new_ns: &NSWindow = unsafe { &*new_ptr.cast::<NSWindow>() };
                base_ns.addTabbedWindow_ordered(new_ns, NSWindowOrderingMode::Above);
            }
        }
    });
}
