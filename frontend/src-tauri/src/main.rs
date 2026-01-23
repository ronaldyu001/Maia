// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::{process::CommandChild, ShellExt};

struct BackendProcess(Mutex<Option<CommandChild>>);

fn start_backend(app: &AppHandle) {
  let is_dev = cfg!(debug_assertions);

  let (mut rx, child) = if is_dev {
    let repo_root = "/Users/ronaldyu/Desktop/2.Coding/Maia";
    let venv_python = "/Users/ronaldyu/Desktop/2.Coding/Maia/.venv/bin/python";

    app.shell()
      .command(venv_python)
      .current_dir(repo_root)
      .args([
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--reload",
        "--reload-dir",
        "backend",
      ])
      .spawn()
      .expect("failed to start dev backend")
  } else {
    app.shell()
      .sidecar("backend")
      .expect("failed to create sidecar")
      .spawn()
      .expect("failed to start prod backend")
  };

  app.state::<BackendProcess>()
    .0
    .lock()
    .unwrap()
    .replace(child);

  tauri::async_runtime::spawn(async move {
    use tauri_plugin_shell::process::CommandEvent;

    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout(bytes) => {
          let s = String::from_utf8_lossy(&bytes);
          print!("{s}");
        }
        CommandEvent::Stderr(bytes) => {
          let s = String::from_utf8_lossy(&bytes);
          eprint!("{s}");
        }
        CommandEvent::Terminated(payload) => {
          println!("backend terminated: {:?}", payload);
          break;
        }
        _ => {}
      }
    }
  });
}

fn stop_backend(app: &AppHandle) {
  if let Some(child) = app.state::<BackendProcess>().0.lock().unwrap().take() {
    let _ = child.kill();
  }
}

fn main() {
  let app = tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .manage(BackendProcess(Mutex::new(None)))
    .setup(|app| {
      start_backend(&app.handle());
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri app");

  app.run(|app_handle, event| {
    match event {
      // Fired when the app is about to exit (Cmd+Q, closing last window, etc.)
      tauri::RunEvent::ExitRequested { .. } => {
        stop_backend(app_handle);
      }
      // Extra safety: ensure backend is stopped on final exit
      tauri::RunEvent::Exit => {
        stop_backend(app_handle);
      }
      _ => {}
    }
  });
}