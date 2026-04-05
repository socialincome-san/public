import "dart:async";

import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/core/helpers/flushbar_helper.dart";
import "package:app/data/models/survey/mapped_survey.dart";
import "package:app/l10n/l10n.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:webview_flutter/webview_flutter.dart";

const _networkErrorTypes = {
  WebResourceErrorType.connect,
  WebResourceErrorType.timeout,
  WebResourceErrorType.hostLookup,
  WebResourceErrorType.io,
};

class SurveyPage extends StatefulWidget {
  final MappedSurvey mappedSurvey;

  const SurveyPage({required this.mappedSurvey});

  @override
  State<StatefulWidget> createState() => SurveyPageState();
}

class SurveyPageState extends State<SurveyPage> {
  bool isLoading = true;
  bool hasNetworkError = false;
  late final WebViewController _webViewController;
  Timer? _loadingTimer;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {},
          onPageStarted: (String url) {
            _loadingTimer = Timer(const Duration(seconds: 15), _onLoadTimeout);
          },
          onPageFinished: (String url) {
            _loadingTimer?.cancel();
            setState(() {
              isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            _loadingTimer?.cancel();
            if (_networkErrorTypes.contains(error.errorType)) {
              _showNetworkError();
            }
          },
          onNavigationRequest: (NavigationRequest request) => NavigationDecision.navigate,
        ),
      )
      ..loadRequest(Uri.parse(widget.mappedSurvey.surveyUrl));
  }

  void _showNetworkError() {
    if (!mounted) {
      return;
    }

    setState(() {
      isLoading = false;
      hasNetworkError = true;
    });

    FlushbarHelper.showFlushbar(
      context,
      message: context.l10n.offlineMutationError,
      type: FlushbarType.error,
    );
  }

  void _onLoadTimeout() {
    _showNetworkError();
  }

  @override
  void dispose() {
    _loadingTimer?.cancel();
    super.dispose();
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
          if (hasNetworkError) ...[
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.cloud_off,
                    size: 48,
                    color: Colors.black,
                  ),
                  const SizedBox(height: 16),
                  Text(context.l10n.offlineBanner),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
