import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/core/cubits/survey/survey_cubit.dart";
import "package:app/data/repositories/crash_reporting_repository.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";
import "package:intl/intl.dart";
import "package:webview_flutter/webview_flutter.dart";

class ImpactMeasurementPage extends StatelessWidget {
  const ImpactMeasurementPage();

  @override
  Widget build(BuildContext context) {
    final authCubit = context.read<AuthCubit>();

    return BlocProvider(
      create: (context) => SurveyCubit(
        recipient: authCubit.state.recipient!,
        currentFirebaseUser: authCubit.state.firebaseUser!,
        crashReportingRepository: context.read<CrashReportingRepository>(),
      ),
      child: const _ImpactMeasurementView(),
    );
  }
}

class _ImpactMeasurementView extends StatefulWidget {
  const _ImpactMeasurementView();

  @override
  State<_ImpactMeasurementView> createState() => _ImpactMeasurementViewState();
}

class _ImpactMeasurementViewState extends State<_ImpactMeasurementView> {
  // TODO check whats this dependend on?
  bool showWebView = true;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SurveyCubit, SurveyState>(
      builder: (context, state) {
        return Container(
          child: showWebView
              ? WebView(
                  initialUrl: state.surveyUrl,
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
                        state.nextSurveyDate != null
                            ? "To keep track of how Social Income impacts you, we will ask you to fill in the survey again next ${DateFormat.MMMM().format(state.nextSurveyDate!)}."
                            : "To keep track of how Social Income impacts you, we will ask you to fill in the survey again in the future",
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
