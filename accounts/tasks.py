# coding=utf-8
from __future__ import absolute_import, unicode_literals
from celery import shared_task
import logging, requests
from time import sleep
from django.core.mail import send_mail
from .models import PhoneOTP, User

__author__ = 'kwameboame'
logger = logging.getLogger(__name__)

@shared_task
def send_otp_email_task(user_email, key):
    """Sends an email when the feedback form has been submitted."""
    # sleep(20)  # Simulate expensive operation(s) that freeze Django
    send_mail(
        "TruthQuest OTP",
        f"Your OTP is {str(key)}. Thank you!".lstrip(),
        "info@penplusbytes.org",
        [user_email],
        fail_silently=False,
    )


@shared_task
def send_otp_sms_task(phone, key):
    url = "https://konnect.kirusa.com/api/v1/Accounts/GW55n_YxMLKmuwJLWEigyA==/Messages"
    payload = "{\r\"id\":\"your_unique_id_for_request\",\r\"to\":[\"" + phone + "\"],\r\"sender_mask\":\"GHFootball\",\r\"body\":\"Your OTP is " + str(
        key) + "\",\r\"priority\": \"high\"\r}\r"
    headers = {
        'Content-Type': "application/json",
        'Authorization': "kkkk"
    }
    res = requests.request("POST", url, data=payload, headers=headers)
    data = res.json()

    return data
