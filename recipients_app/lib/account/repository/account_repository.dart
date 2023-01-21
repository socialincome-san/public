import "package:app/account/repository/user_account.dart";
import "package:app/services/database_service.dart";

class AccountRepository {
  final DatabaseService databaseService;

  AccountRepository(this.databaseService);

  Future<UserAccount> fetchUser() async {
    final userDto = await databaseService.fetchUserData();
    return userDto.toUserAccount();
  }
}
