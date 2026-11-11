<p align="center">
  <img src="assets/readme/windrise-banner.png" alt="Windrise - Evidence-grounded intelligence for wind turbine operations" width="100%" />
</p>

<h1 align="center">Windrise</h1>

<p align="center">
  <strong>A local knowledge agent for wind turbine operations and maintenance</strong>
</p>

<p align="center">
  Bring fault manuals, wind farm assets, turbine model mappings, and local language models together in a traceable, deployable, and maintainable maintenance Q&A workspace.
</p>

<p align="center">
  <a href="#product">Product</a> ·
  <a href="#why">Why Windrise</a> ·
  <a href="#experience">Workspace</a> ·
  <a href="#capabilities">Core Capabilities</a> ·
  <a href="#architecture">System Architecture</a> ·
  <a href="#start">Quick Start</a> ·
  <a href="#docs">Documentation</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Domain-Wind_O%26M-1F6F5B?style=for-the-badge" alt="Wind O&M" />
  <img src="https://img.shields.io/badge/Inference-Local_LLM-246B8E?style=for-the-badge" alt="Local LLM" />
  <img src="https://img.shields.io/badge/Knowledge-LLMWiki-26734D?style=for-the-badge" alt="LLMWiki" />
  <img src="https://img.shields.io/badge/Interface-Web_%2B_CLI-555555?style=for-the-badge" alt="Web and CLI" />
  <img src="https://img.shields.io/badge/Deploy-Ubuntu-C16B32?style=for-the-badge" alt="Ubuntu deployment" />
</p>

---

<a id="product"></a>

## Overview

Windrise is a local intelligent assistant for wind farm operations, maintenance, centralized control, and knowledge management teams. It first identifies the question, the equipment involved, and whether enough information is available, then builds an answer from structured fault indexes, wind farm/model/turbine mappings, and a local knowledge base.

Its goal is clear: **help field teams find evidence that applies to the equipment they are working on.**

<table>
  <tr>
    <td align="center" width="25%"><h3>14,118</h3><strong>Structured Fault Records</strong></td>
    <td align="center" width="25%"><h3>12</h3><strong>Equipment Brands</strong></td>
    <td align="center" width="25%"><h3>28</h3><strong>Wind Farm/Model Configurations</strong></td>
    <td align="center" width="25%"><h3>1,265</h3><strong>Turbine ID Mappings</strong></td>
  </tr>
</table>

<p align="center"><sub>Counts reflect the current repository build outputs and may change when source materials are updated or rebuilt.</sub></p>

<a id="why"></a>

## Why Windrise

Wind turbine maintenance requires answers that **apply to the current wind farm, turbine model, and alarm context**.

The same fault code can mean different things across manufacturers and turbine models. A wind farm may include multiple development phases and turbine types. A field report may mix turbine IDs, model numbers, measurements, component numbers, and actual alarm codes. Full-text search can return apparently relevant content, while field teams need answers with verifiable sources, applicability, and handling conditions.

Windrise addresses these issues through three layers of constraints:

| Field Question | How Windrise Handles It | Output |
| :--- | :--- | :--- |
| “What does fault 303804 mean, and how should it be handled?” | Matches the exact fault code and preserves alternative meanings | Fault meaning, applicable manufacturer/model, recommended actions, and source location |
| “Yaw fault on ZC09 at Bamian Wind Farm” | Maps the turbine ID to its wind farm, manufacturer, and model first | Retrieves materials within the equipment's scope |
| “What should I do about abnormal bearing temperature?” | Requests the missing wind farm, model, or fault code | Avoids combining field procedures from incompatible turbine models |
| “How does a pitch system work?” | Routes to theoretical Q&A | Explains general principles using the local model and notes that field actions require equipment details |

---

<a id="experience"></a>

## Workspace

<p align="center">
  <img src="assets/readme/workspace.png" alt="Windrise maintenance workspace" width="100%" />
</p>

Windrise provides a web workspace and a CLI. The web interface supports field Q&A, user management, knowledge file maintenance, and record exports. The CLI supports retrieval, builds, evaluations, script integration, and offline operations.

| Module | Users | Value |
| :--- | :--- | :--- |
| Q&A Workspace | Operations, maintenance, and centralized control teams | Combines alarms, turbine context, symptoms, and source materials in one answer |
| Resource Monitoring | System maintainers | Shows knowledge base, model service, runtime log, and environment status |
| Key Field Extraction | Review and shift handover teams | Organizes wind farm, model, fault code, component, and troubleshooting details |
| Sessions and Exports | Field teams and managers | Retains the troubleshooting history for handovers, reviews, and knowledge capture |

---

<a id="capabilities"></a>

## Core Capabilities

### 1. Equipment Scope Awareness

Windrise uses the wind farm, manufacturer, turbine family, specific model, and turbine ID to establish retrieval scope. More specific information helps narrow answers to the relevant equipment. When details are missing, the system asks for clarification before retrieving materials.

### 2. Exact Fault-Code Retrieval

The system prioritizes structured fault-code fields to reduce false matches for short codes. A query for `200`, for example, should not match `20007`, measurements, or ordinary numbers in document text. When a code has multiple meanings, the system preserves the distinctions and groups results by manufacturer, model, wind farm, or meaning.

### 3. Turbine ID Mappings

Field staff often begin with a turbine number or an ID such as `ZC09`. Windrise maps that ID to the wind farm, manufacturer, turbine family, and specific model before proceeding to fault retrieval or knowledge Q&A.

### 4. Multi-Turn Context Management

The system distinguishes additional details, follow-up questions, corrections, and new faults. It retains relevant context as users provide wind farm, model, fault-code, or symptom details over multiple turns, and clears irrelevant memory when they switch to another asset or fault.

### 5. Local Models and Knowledge Retrieval

Windrise connects to local model services such as vLLM or LM Studio through OpenAI-compatible interfaces. The system handles structured queries, document retrieval, and scope filtering; the model organizes the evidence into readable answers.

### 6. Maintainable Knowledge Assets

Source documents, structured indexes, LLMWiki pages, wind farm/model tables, and turbine ID mappings are maintained in separate layers. After materials change, indexes can be rebuilt and checked through smoke tests and regression evaluations covering short codes, ambiguous codes, reverse name lookup, context retention, and cross-farm switching.

---

<a id="architecture"></a>

## System Architecture

Windrise has three main workflows: an **offline knowledge pipeline** that converts source materials into searchable assets, an **online Q&A workflow** that routes field questions to relevant evidence, and an **operations governance loop** for monitoring, evaluation, and ongoing updates.

<p align="center">
  <img src="assets/readme/windrise-architecture.svg" alt="Windrise end-to-end system architecture" width="100%" />
</p>

<p align="center"><sub>The full workflow spans document governance, knowledge construction, online routing, deterministic queries, local generation, and operational feedback.</sub></p>

**Key Workflows:**

| Workflow | Trigger | System Actions | User-Facing Result |
| :--- | :--- | :--- | :--- |
| Exact Fault Code | A specific code such as `303804` or `SC03` | Match code boundaries -> group meanings -> filter by equipment -> trace sources | Applicable equipment, fault meaning, handling/reset fields, and source locations |
| Turbine ID | A question starts with `ZC09`, `15#`, or a turbine number | Identify turbine ID -> map farm/manufacturer/model -> retrieve faults or documents | Distinguishes turbine IDs from fault codes and includes equipment context |
| Vague Symptoms | “Abnormal bearing temperature” or “yaw motor alarm” | Extract components and symptoms -> check missing farm/model/code -> clarify as needed | Requests missing details before retrieving evidence within the correct scope |
| Theoretical Q&A | “How does a pitch system work?” or “What does a gearbox do?” | Skip low-value fault searches -> prepare theoretical context -> generate a local model answer | General explanation, with a reminder that field actions require equipment details |
| Knowledge Maintenance | New manuals, tables, or field review records | Parse and clean -> rebuild indexes/Wiki/mappings -> run smoke and regression evaluations | Updated knowledge assets without retraining the model |

**Design Principles:**

- Use deterministic queries whenever the answer can be looked up directly.
- Retrieve specialist materials before answering questions that require them.
- Clarify missing information before retrieval when it affects field decisions.
- Preserve equipment scope, source files, and verifiable references wherever possible.
- Prioritize local deployment for internal networks, offline migration, and private model environments.

---

## Who It Is For

| Role | How Windrise Helps |
| :--- | :--- |
| Wind Farm Operators | Quickly look up fault codes, alarm meanings, recommended actions, and reset conditions |
| Maintenance Engineers | Find applicable materials by wind farm, model, component, and symptom |
| Centralized Control Centers | Reduce code ambiguity and context mix-ups across farms and turbine models |
| Knowledge Base Maintainers | Turn manuals, tables, and fault records into searchable assets |
| Deployment and System Administrators | Deploy and operate on Ubuntu with local models, offline packages, and internal networks |

---

<a id="start"></a>

## Quick Start

> Recommended environment: Ubuntu/Linux, Node.js 22+, npm, Python 3.10+, and venv. Q&A requires an accessible OpenAI-compatible model service.

### 1. Install Dependencies and Build the Entry Point

```bash
PROJECT_DIR="$PWD" bash deploy/ubuntu-source/install_ubuntu.sh
```

### 2. Configure the Local Model

```bash
export LMSTUDIO_BASE_URL=http://127.0.0.1:8000
export LMSTUDIO_MODEL=Qwen-30B
export VLLM_API_URL="$LMSTUDIO_BASE_URL/v1/chat/completions"
export VLLM_MODEL_NAME="$LMSTUDIO_MODEL"
```

### 3. Initialize the Web Administrator Account

```bash
export INIT_ADMIN_USERNAME=admin
read -r -s -p "Initial admin password: " INIT_ADMIN_PASSWORD
echo
export INIT_ADMIN_PASSWORD
```

### 4. Start the Web Workspace

```bash
PROJECT_DIR="$PWD" bash deploy/ubuntu-source/run_web_ubuntu.sh
```

Open in your browser:

```text
http://<server-address>:5002
```

### 5. Use the CLI

```bash
bash bin/windrise-bash doctor
bash bin/windrise-bash "What does fault 303804 mean, and how should it be handled?"
bash bin/windrise-bash search yaw motor
bash bin/windrise-bash ask
```

---

## Knowledge Builds and Validation

```bash
npm run build:knowledge
npm run build:wind-farm-models
npm run build:turbine-mapping
npm run visual:wind-graph
```

Common validation commands:

```bash
npm run smoke:wind-llmwiki
npm run eval:faults
npm run eval:windrise-retrieval
npm run audit:fault-ambiguity
```

Checks that require an available model service:

```bash
npm run smoke:lmstudio
npm run eval:windrise
```

---

## Deployment Options

| Option | Use Case | Package Contents |
| :--- | :--- | :--- |
| Ubuntu Source Deployment | Environments where dependencies can be installed and maintenance or customization is needed | Source code, installation scripts, build scripts, and startup scripts |
| Ubuntu Portable | Linux x86_64 with a prebuilt release package | Bundled Node, Python, and dependencies |
| Ubuntu Offline Migration | Target environments without network access for dependency installation | Build in a preparation environment, then transfer, install, and validate |

See `deploy/ubuntu-source/README_UBUNTU_SOURCE.md`, `deploy/ubuntu-portable/README_PORTABLE.md`, and `deploy/ubuntu-offline/README.md` for details.

---

<a id="docs"></a>

## Documentation

| Document | Contents |
| :--- | :--- |
| `docs/用户使用手册.md` | Q&A, fault queries, additional context, interpreting results, and session exports |
| `docs/内部维护人员手册.md` | Users, documents, asset mappings, configuration, and troubleshooting |
| `ROUTING_DESIGN.md` | Q&A routing, theoretical questions, fault retrieval, and clarification strategies |
| `SYSTEM_WORKFLOW_AND_USER_OPTIMIZATIONS.md` | Complete system workflow from knowledge construction to user experience |
| `wind-llmwiki/schema.md` | LLMWiki knowledge structure and field definitions |
| `reports/` | Evaluation and experiment outputs for retrieval, context, and code ambiguity |

---

## Repository Structure

| Path | Purpose |
| :--- | :--- |
| `src/` | Terminal agent, commands, services, context, and tool implementations |
| `src/data/` | Wind farm/model configurations and turbine ID mappings |
| `hn/` | Flask web service, pages, user management, and runtime scripts |
| `风机故障码/` | Source materials and structured fault indexes |
| `wind-llmwiki/` | Wiki pages, knowledge graphs, and domain knowledge structures |
| `scripts/` | Build, evaluation, knowledge maintenance, packaging, and deployment helper scripts |
| `deploy/` | Ubuntu source deployment, portable packages, and offline migration |
| `docs/` | User and maintenance documentation |

---

## Scope and Limitations

Windrise supports document retrieval, information organization, maintenance reviews, and field decision-making. Field operations should continue to follow original HMI/SCADA alarms, trend data, on-site inspections, safety procedures, and official manufacturer documentation.

This repository includes recovered general-purpose agent source code and Windrise domain extensions. Before use, modification, or distribution, review the license terms for the source code, materials, models, and third-party dependencies.
