import "package:app/data/models/models.dart";
import "package:app/l10n/arb/app_localizations.dart";
import "package:app/l10n/l10n.dart";
import "package:app/ui/icons/payment_status_icon_with_text.dart";
import "package:app/view/pages/payment_tile_bottom_action.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";

const _reviewUiStatuses = [
  PaymentUiStatus.contested,
  PaymentUiStatus.onHoldContested,
  PaymentUiStatus.onHoldToReview,
  PaymentUiStatus.toReview,
  PaymentUiStatus.recentToReview,
];

class PaymentTile extends StatelessWidget {
  final MappedPayment mappedPayment;

  const PaymentTile({super.key, required this.mappedPayment});

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context).toLanguageTag();

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _formatDate(
                    mappedPayment.payment.paymentAt?.toDate(),
                    context.l10n,
                    locale,
                  ),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 8),
                _buildStatusIcon(mappedPayment),
              ],
            ),
          ),
          if (_reviewUiStatuses.contains(mappedPayment.uiStatus)) ...[
            PaymentTileBottomAction(mappedPayment: mappedPayment),
          ],
        ],
      ),
    );
  }

  String _formatDate(
    DateTime? dateTime,
    AppLocalizations localizations,
    String locale,
  ) {
    if (dateTime == null) return "";

    String dateFormat;
    String formattedDate = "";
    if (mappedPayment.uiStatus == PaymentUiStatus.toBePaid) {
      dateFormat = DateFormat.YEAR_MONTH_DAY;
      formattedDate = "${localizations.nextPayment} ";
    } else {
      dateFormat = DateFormat.YEAR_MONTH;
    }
    if (_reviewUiStatuses.contains(mappedPayment.uiStatus)) {
      formattedDate = "${localizations.review} ";
    }

    return formattedDate += DateFormat(dateFormat, locale).format(dateTime);
  }

  Widget _buildStatusIcon(MappedPayment mappedPayment) {
    final text = "${mappedPayment.payment.currency} ${mappedPayment.payment.amount}";

    return PaymentStatusIconWithText(
      status: mappedPayment.uiStatus,
      text: text,
    );
  }
}
