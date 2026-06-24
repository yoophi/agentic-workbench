use std::{env, fs, path::PathBuf};

use crate::{
    domain::agent::{AgentDescriptor, AgentOptionDescriptor},
    ports::agent_catalog::AgentCatalog,
};

const AGENT_CATALOG_PATH_ENV: &str = "ACP_AGENT_CATALOG_PATH";

#[derive(Clone, Default)]
pub struct ConfigurableAgentCatalog {
    file_path: Option<PathBuf>,
    fallback: StaticAgentCatalog,
}

impl ConfigurableAgentCatalog {
    pub fn from_env() -> Self {
        Self {
            file_path: env::var_os(AGENT_CATALOG_PATH_ENV).map(PathBuf::from),
            fallback: StaticAgentCatalog,
        }
    }
}

impl AgentCatalog for ConfigurableAgentCatalog {
    fn list_agents(&self) -> Vec<AgentDescriptor> {
        self.file_path
            .as_ref()
            .and_then(|path| fs::read_to_string(path).ok())
            .and_then(|content| serde_json::from_str::<Vec<AgentDescriptor>>(&content).ok())
            .filter(|agents| !agents.is_empty())
            .unwrap_or_else(|| self.fallback.list_agents())
    }
}

#[derive(Clone, Default)]
pub struct StaticAgentCatalog;

impl AgentCatalog for StaticAgentCatalog {
    fn list_agents(&self) -> Vec<AgentDescriptor> {
        vec![
            AgentDescriptor {
                id: "codex".into(),
                label: "Codex".into(),
                command: "npx -y @agentclientprotocol/codex-acp".into(),
                models: options(&[("gpt-5", "GPT-5"), ("gpt-5-codex", "GPT-5 Codex")]),
                context_sizes: options(&[
                    ("medium", "Medium"),
                    ("large", "Large"),
                    ("xLarge", "XL"),
                ]),
            },
            AgentDescriptor {
                id: "claude-code".into(),
                label: "Claude Code".into(),
                command: "npx -y @agentclientprotocol/claude-agent-acp".into(),
                models: options(&[("claude-sonnet-4-5", "Claude Sonnet 4.5")]),
                context_sizes: Vec::new(),
            },
            AgentDescriptor {
                id: "pi-coding-agent".into(),
                label: "Pi Coding Agent".into(),
                command: "npx -y pi-acp".into(),
                models: Vec::new(),
                context_sizes: Vec::new(),
            },
            AgentDescriptor {
                id: "opencode".into(),
                label: "OpenCode".into(),
                command: "npx -y opencode-ai acp".into(),
                models: Vec::new(),
                context_sizes: Vec::new(),
            },
        ]
    }
}

fn options(values: &[(&str, &str)]) -> Vec<AgentOptionDescriptor> {
    values
        .iter()
        .map(|(id, label)| AgentOptionDescriptor {
            id: (*id).into(),
            label: (*label).into(),
        })
        .collect()
}
