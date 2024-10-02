import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "truthquest.settings")
django.setup()

# Now you can import and use Django components
# from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from storages.backends.s3boto3 import S3Boto3Storage

s3_storage = S3Boto3Storage()
path = s3_storage.save('test-file.txt', ContentFile(b'test content'))
print(s3_storage.url(path))