from django.contrib.auth.tokens import PasswordResetTokenGenerator


class ConfirmEmailTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, email, timestamp):
        user = email.user
        return str(user.pk) + str(email.verified) + str(user.last_login) + str(timestamp)


confirm_email_token_generator = ConfirmEmailTokenGenerator()
