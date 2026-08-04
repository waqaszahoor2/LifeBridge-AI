# Model card — disaster risk baseline

## Purpose

Random-forest demonstration model mapping synthetic rainfall, river level, soil moisture, slope, temperature and wind inputs to a risk class.

## Limitations

The training rows and labels are synthetic rules, not observed disasters. The output is an engineering demonstration and cannot replace meteorological, hydrological or emergency-management models.

## Safe use

Use only for pipeline/UI testing. Live alerts displayed by LifeBridge should originate from official providers and local authorities, with model-derived values explicitly labelled as derived.
