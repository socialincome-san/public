import "package:app/data/models/survey/mapped_survey.dart";
import "package:app/ui/configs/configs.dart";
import "package:app/view/widgets/dashboard_item.dart";
import "package:app/view/widgets/survey/survey_card_bottom_action.dart";
import "package:flutter/material.dart";

class SurveyCardContainer extends DashboardItem {
  final MappedSurvey mappedSurvey;

  const SurveyCardContainer({
    super.key,
    required this.mappedSurvey,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          const Padding(
            padding: AppSpacings.a16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "12 months survey",
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image(
                      image: AssetImage("assets/survey-widget.gif"),
                      height: 134,
                    ),
                  ],
                ),
                SizedBox(height: 4),
                Text(
                  "Please take 5 minutes to answer questions and help to improve Social Income",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 13.0,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                SizedBox(height: 16),
              ],
            ),
          ),
          SurveyCardBottomAction(
            mappedSurvey: mappedSurvey,
          ),
        ],
      ),
    );
  }
}
