from django.conf import settings

from django.core import mail
from django.template.loader import render_to_string


def send_confirmation_mail(user, token, uid):
    activate_url = f'{settings.WEBSITE_BASE_URL}/confirm-account/{uid}/{token}'
    ctx = {
        'user': user.first_name,
        'activate_url': activate_url,
    }

    email_template = 'accounts/emails/email_confirmation'

    msg = render_mail(email_template, user.email, ctx)
    msg.send()


def render_mail(template_prefix, email, context):
    subject = render_to_string('{0}_subject.txt'.format(template_prefix),
                               context)

    subject = " ".join(subject.splitlines()).strip()

    template_name = '{0}_message.{1}'.format(template_prefix, 'html')
    body = render_to_string(template_name,
                            context).strip()

    msg = mail.EmailMessage(subject=subject,
                            body=body,
                            to=[email])
    msg.content_subtype = 'html'
    return msg
