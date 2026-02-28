extension StringExtensions on String {
  DateTime toDateTime() => DateTime.parse(this);
  DateTime toDate() {
    final date = DateTime.tryParse(this);

    if (date == null) {
      throw Exception("Invalid date string: $this");
    }

    return DateTime(date.year, date.month, date.day);
  }
}
