import "package:app/core/change_notifiers/current_user.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:intl/intl.dart";
import "package:provider/provider.dart";
import "package:webview_flutter/webview_flutter.dart";

class ImpactMeasurementPage extends StatefulWidget {
  const ImpactMeasurementPage({super.key});

  @override
  State<ImpactMeasurementPage> createState() => _ImpactMeasurementPageState();
}

class _ImpactMeasurementPageState extends State<ImpactMeasurementPage>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  bool showWebView = true;
  final DateFormat formatter = DateFormat("dd.MM.yyyy");

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Consumer<CurrentUser>(
      builder: (context, currentUser, child) {
        if (currentUser.surveyUrl() == null) {
          showWebView = false;
        }

        return Container(
          child: showWebView
              ? WebView(
                  initialUrl: currentUser.surveyUrl(),
                  javascriptMode: JavascriptMode.unrestricted,
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Padding(
                      padding: AppSpacings.a16,
                      child: Text(
                        "Thank you for answering the survey.",
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ),
                    Padding(
                      padding: AppSpacings.a16,
                      child: Text(
                        () {
                          final nextSurveyDate = currentUser.nextSurvey;
                          if (nextSurveyDate != null) {
                            return "To keep track of how Social Income impacts you, we will ask you to fill in the survey again next ${DateFormat.MMMM().format(nextSurveyDate)}.";
                          } else {
                            return "To keep track of how Social Income impacts you, we will ask you to fill in the survey again in the future";
                          }
                        }(),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
        );
      },
    );
  }
}
