from django.core.management.base import BaseCommand
from AccountsAPP.models import UserQuestAssignment

class Command(BaseCommand):
    help = '모든 UserQuestAssignment 데이터를 삭제합니다.'

    def handle(self, *args, **options):
        count = UserQuestAssignment.objects.count()
        self.stdout.write(self.style.WARNING(f"{count}개의 UserQuestAssignment 데이터를 삭제합니다..."))

        UserQuestAssignment.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("삭제 완료!"))