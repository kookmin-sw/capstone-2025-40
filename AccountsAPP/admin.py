from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Quest, UserQuestAssignment, UserQuestResult, Tip


admin.site.register(CustomUser, UserAdmin)
admin.site.register(Quest)
admin.site.register(UserQuestAssignment)
admin.site.register(UserQuestResult)
admin.site.register(Tip)
