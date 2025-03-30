from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .models import UserQuestAssignment, UserQuestResult
from .serializers import UserSignupSerializer, UsernameLoginSerializer, UserQuestAssignmentSerializer, UserQuestResultSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import date


class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '회원가입 완료'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsernameLoginView(TokenObtainPairView):
    serializer_class = UsernameLoginSerializer


# 오늘 배정된 퀘스트 조회
class TodayAssignedQuestsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserQuestAssignmentSerializer

    def get_queryset(self):
        return UserQuestAssignment.objects.filter(
            user=self.request.user,
            assigned_date=date.today()
        )


# 퀘스트 인증 (사진 등록)
class UserQuestResultCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = UserQuestAssignment.objects.get(id=assignment_id, user=request.user)
        except UserQuestAssignment.DoesNotExist:
            return Response({'error': '퀘스트를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        # 이미 인증된 퀘스트인지 확인
        if hasattr(assignment, 'userquestresult'):
            return Response({'error': '이미 인증이 완료된 퀘스트입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 당일 인증만 허용
        if assignment.assigned_date != date.today():
            return Response({'error': '인증 기한이 지났습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserQuestResultSerializer(data=request.data, context={'assignment': assignment})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '퀘스트 인증이 완료되었습니다.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
