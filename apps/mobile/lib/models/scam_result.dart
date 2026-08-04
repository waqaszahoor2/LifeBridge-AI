class ScamResult {
  const ScamResult({
    required this.riskScore,
    required this.riskLevel,
    required this.label,
    required this.evidence,
    required this.safeActions,
  });

  final double riskScore;
  final String riskLevel;
  final String label;
  final List<String> evidence;
  final List<String> safeActions;

  factory ScamResult.fromJson(Map<String, dynamic> json) => ScamResult(
        riskScore: (json['risk_score'] as num).toDouble(),
        riskLevel: json['risk_level'] as String,
        label: json['label'] as String,
        evidence: (json['evidence'] as List).cast<String>(),
        safeActions: (json['safe_actions'] as List).cast<String>(),
      );
}
