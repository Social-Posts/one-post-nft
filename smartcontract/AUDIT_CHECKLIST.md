# Formal Verification & Audit Checklist

This document outlines the steps and checks to perform before deploying smart contracts to production.

## Scope
- Target repository: `one-post-nft/smartcontract`
- Contracts to verify: `OnePostNFT.sol`, `MockBASE.sol` and any other public contracts in `src/`

## Checklist

1. High-level requirements
   - Document intended invariants and critical properties (e.g., royalties = 5%, only owner can perform admin actions, no asset loss).
   - Define security goals (reentrancy, access control, arithmetic safety, upgradeability assertions).

2. Automated static analysis
   - Run Slither and review findings; triage issues into `security`/`bug`/`chore` labels.
   - Add Slither to CI and fail the workflow on high-severity findings.

3. Unit & fuzz testing
   - Add unit tests covering edge cases (expiry, boundary values, rounding, reverts).
   - Use Forge fuzz tests for numeric invariants and distribution properties (royalties, accounting).

4. Property-based / symbolic testing
   - Use Echidna / Foundry fuzz engines to assert invariants under randomized inputs.

5. Formal verification (optional/advanced)
   - Identify functions to formally verify (e.g., accounting and transfer invariants).
   - Use tools (e.g., SMT-based solvers, Scribble annotations) where appropriate.

6. Manual review & audit writeup
   - Prepare an audit brief and share with reviewers: threat model, expected invariants, public API surface.
   - Include reproduction steps for any discovered issues.

7. Post-deployment monitoring
   - Add gas snapshots and monitoring alerts for abnormal activity.
   - Keep a documented roll-back / migration plan.

## Next steps
- Add a Slither CI workflow (`.github/workflows/slither.yml`).
- Add an `scripts/run-audit.sh` helper to run Slither and local checks.
- Consider adding a `SECURITY.md` and documenting contact for disclosures.

---

If you want, I can add the Slither workflow and the run-audit script now and wire them into CI. I'll proceed with the workflow next unless you prefer a different order.
