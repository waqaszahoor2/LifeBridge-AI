# Model card — scam text classifier

## Purpose

Baseline TF-IDF and logistic-regression classifier used to demonstrate the VerifyLink inference pipeline.

## Training data

`datasets/synthetic/scam_messages.csv` contains synthetic examples. It is not representative of current global scams, languages, platforms or realistic class prevalence.

## Intended use

- software integration tests;
- feature/explanation demonstrations;
- baseline comparison before real research data is obtained.

## Prohibited interpretation

A prediction must not be presented as proof that a message is safe or fraudulent. Do not use this artifact for autonomous blocking, law-enforcement decisions or financial-loss claims.

## Required real evaluation

Use recent time-separated and campaign-separated data, PR-AUC, recall at fixed false-positive rates, calibration, language/category subgroup analysis and human review of false negatives.
