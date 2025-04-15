from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Quest, UserQuestAssignment, UserQuestResult, Tip

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        ('추가 정보', {'fields': ('name', 'city', 'district')}),
    )
    list_display = ['username', 'email', 'name', 'city', 'district', 'is_staff']

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Quest)
admin.site.register(UserQuestAssignment)
admin.site.register(UserQuestResult)
admin.site.register(Tip)
