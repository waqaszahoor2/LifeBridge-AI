# Research and Evaluation Method

## Research questions

1. Does multimodal/user-context ranking outperform simple newest-first ordering?
2. Do evidence-linked scam explanations improve user decisions?
3. How much does temporal drift reduce performance?
4. Does performance differ across English, Urdu and Roman Urdu?
5. Does safety-aware prioritisation improve emergency information visibility?

## Required experiments

- baseline versus personalized ranking
- text-only versus text-plus-URL scam detection
- rule-only versus learned model versus hybrid model
- random split versus time-based split
- calibration and realistic low-prevalence testing
- per-language and worst-group evaluation
- ablation of freshness, trust, location and urgency factors

## Claim labels

- **Direct:** measured by this project’s experiment.
- **Indirect:** inference supported by external evidence or component results.
- **Unproven:** expected benefit not yet demonstrated.
