enum ContestReason {
  phoneStolen(title: "Phone stolen"),
  incorrectAmount(title: "Incorrect amount"),
  numberChanged(title: "Changed phone number"),
  other(title: "Other reason");

  final String title;

  const ContestReason({required this.title});
}
