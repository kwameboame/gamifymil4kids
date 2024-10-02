import random


def create_otp(phone):
    if phone:
        key = random.randint(999, 9809)
        print(key)
        return key
    else:
        return False
