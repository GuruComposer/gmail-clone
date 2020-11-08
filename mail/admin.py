from django.contrib import admin

from mail.models import User, Email

# Register your models here.
admin.site.register(User)
admin.site.register(Email)