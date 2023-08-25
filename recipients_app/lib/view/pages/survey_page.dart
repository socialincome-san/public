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
  late final WebViewController _webViewController;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      // ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar.
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.startsWith("https://www.youtube.com/")) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.mappedSurvey.surveyUrl));
  }

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
          WebViewWidget(controller: _webViewController),
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
