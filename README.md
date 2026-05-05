# openci-test-rig

End-to-end test rig that exercises every consolidated workflow from
`YiAgent/OpenCI@feat/marketplace-reusable-workflows`.

Each test workflow here is a thin wrapper that `uses:` one of the
consolidated reusable workflows. Triggers fire as follows:

| Test workflow | Trigger | Verifies |
|---|---|---|
| `.github/workflows/issue.yml` | issue events / cron / dispatch | `issue.yml` multi-trigger fan-out + mode router |
| `.github/workflows/pr-agent.yml` | pull_request / workflow_run / dispatch | `pr-agent.yml` mode router |
| `.github/workflows/prd-observe.yml` | dispatch | `prd-observe.yml` mode router |
| `.github/workflows/release.yml` | manual tag push / dispatch | `release.yml` mode router |
| `.github/workflows/docs.yml` | docs/* push, dispatch | `docs.yml` build → deploy |
| `.github/workflows/pr.yml` | pull_request | `pr.yml` quality gate |

## Required secrets

| Secret | Source | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Doppler `infra/prd` | required for AI-routed jobs |
| `SENTRY_TOKEN` | Doppler `infra/prd` (`SENTRY_AUTH_TOKEN`) | optional; sentry-triage / canary-watch graceful-skip |

## Required vars

| Var | Notes |
|---|---|
| `SENTRY_ORG` | Doppler `infra/prd` |
| `SENTRY_PROJECT` | repo-specific; set to a known project slug |
