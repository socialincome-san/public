import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/models/survey/mapped_survey.dart";
import "package:app/l10n/l10n.dart";
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
  bool isLoading = true;
  late final WebViewController _webViewController;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {},
          onPageStarted: (String url) {},
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) => NavigationDecision.navigate,
        ),
      )
      ..loadRequest(Uri.parse(widget.mappedSurvey.surveyUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(context.l10n.survey),
        leading: BackButton(
          onPressed: () {
            context.read<SurveyCubit>().getSurveys();
            Navigator.maybePop(context);
          },
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _webViewController),
          if (isLoading) ...[
            const Center(
              child: CircularProgressIndicator(),
            ),
          ],
        ],
      ),
    );
  }
}
