import math
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class RankingPagination(PageNumberPagination):
    page_size = 10
    page_query_param = 'page'

    def paginate_queryset(self, queryset, request, view=None):
        # 사용자 순위 기반 페이지 자동 계산을 위해 호출 전 사용자 순위 계산
        user = request.user
        try:
            # rank 필드가 annotate 되어 있다고 가정
            user_rank = queryset.filter(pk=user.pk).values_list('rank', flat=True).first() or 1
        except Exception:
            user_rank = 1
        self.user_rank = user_rank
        return super().paginate_queryset(queryset, request, view)

    def get_page_number(self, request, paginator):
        # 클라이언트에서 page 파라미터를 명시하지 않으면 user_rank 기준 페이지 반환
        page_number = request.query_params.get(self.page_query_param)
        if page_number:
            return page_number
        # user_rank 기반 페이지 계산 (1~10위는 1페이지, 11~20위는 2페이지 등)
        return math.ceil(self.user_rank / self.page_size)