import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/models/survey/mapped_survey.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:webview_flutter/webview_flutter.dart";

class SurveyPage extends StatefulWidget {
  final MappedSurvey mappedSurvey;

  const SurveyPage({required this.mappedSurvey});

  @override
  State<StatefulWidget> createState() => SurveyPageState();
}

class SurveyPageState extends State<SurveyPage> {
  var isLoading = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text("Survey"),
        leading: BackButton(onPressed: () {
          context.read<SurveyCubit>().getSurveys();
          Navigator.maybePop(context);
        }),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          WebView(
            initialUrl: widget.mappedSurvey.surveyUrl,
            javascriptMode: JavascriptMode.unrestricted,
            onPageFinished: (url) {
              setState(() {
                isLoading = false;
              });
            },
          ),
          if (isLoading) ...[
            const Center(
              child: CircularProgressIndicator(),
            )
          ]
        ],
      ),
    );
  }
}
