import "package:app/core/cubits/auth/auth_cubit.dart";
import "package:app/ui/configs/configs.dart";
import "package:flutter/material.dart";
import "package:flutter_bloc/flutter_bloc.dart";

class BalanceCard extends StatelessWidget {
  const BalanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    final currentRecipient = context.watch<AuthCubit>().state.recipient;

    return Container(
      color: Colors.white,
      height: MediaQuery.of(context).size.height / 5,
      width: MediaQuery.of(context).size.height * .9,
      padding: AppSpacings.a8,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: <Widget>[
          const Text(
            "Social Income received so far",
            style: TextStyle(
              fontSize: 20.0,
            ),
          ),
          Text(
            " SLE ${currentRecipient?.totalIncome()}",
            style: const TextStyle(
              color: Colors.black,
              fontSize: 36.0,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
