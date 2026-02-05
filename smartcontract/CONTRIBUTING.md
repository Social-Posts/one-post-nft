# Smart Contract Contribution Guide

Thank you for your interest in contributing to the smart contract package! 
This project uses **Foundry** for smart contract development, testing, and formatting.

This guide explains how to set up the environment, run tests, format code, and submit a pull request.

---

## Prerequisites

Make sure you have the following installed:

- Git
- Foundry

Install Foundry:

    curl -L https://foundry.paradigm.xyz | bash
    foundryup

---

## Setup

Clone the repository and install dependencies:

    cd smartcontract
    forge install

---

## Running Tests

Run the full smart contract test suite:

    forge test

For more detailed output:

    forge test -vvv

All tests must pass before submitting a pull request.

---

## Formatting

Format Solidity files before committing:

    forge fmt

---

## Project Structure

Key directories in this package:

- src/ — Smart contracts
- test/ — Foundry tests
- script/ — Deployment and interaction scripts
- broadcast/ — Foundry-generated broadcast artifacts (do not edit manually)

---

## Writing Contracts and Tests

- Follow existing patterns and conventions
- Keep contracts small and readable
- Add or update tests for any new functionality
- Use clear and descriptive names for contracts and test cases

---

## Submitting a Pull Request

1. Fork the repository
2. Create a feature branch from main
3. Ensure all tests pass and formatting is applied
4. Commit your changes with a clear message
5. Open a Pull Request and reference the related issue

Example commit message:

    docs: add smart contract contribution guide

---

Thank you for helping improve this project! 
