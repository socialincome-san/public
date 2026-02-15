import "package:app/core/cubits/connectivity/connectivity_cubit.dart";
import "package:app/core/cubits/connectivity/connectivity_state.dart";
import "package:app/ui/configs/app_colors.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class OfflineBanner extends StatelessWidget {
  final Widget child;

  const OfflineBanner({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ConnectivityCubit, ConnectivityState>(
      builder: (context, state) {
        // Only show banner after initialization
        if (!state.isInitialized) {
          return child;
        }

        return Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: state.isOnline ? 0 : 40,
              child: AnimatedOpacity(
                opacity: state.isOnline ? 0 : 1,
                duration: const Duration(milliseconds: 300),
                child: Container(
                  color: AppColors.redColor,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.cloud_off,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        "You are offline. Showing cached data.",
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(child: child),
          ],
        );
      },
    );
  }
}
