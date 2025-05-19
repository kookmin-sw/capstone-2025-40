import openai
import os

# .env에서 API 키 로딩
openai.api_key = os.getenv("OPENAI_API_KEY")


def quest_photo_verification(image_url: str, quest_title: str):
    """
    사진(image_url)이 quest_title에 맞는 장면인지 판단.
    성공: (True, None)
    실패(미션 불일치): (False, None)
    기타 시스템 에러: (None, "에러 메시지")
    """
    prompt = f"사진에 '{quest_title}' 미션을 수행하는 장면이 명확하게 보이면 '예'만, 아니면 '아니오'만 답하세요. 추가 설명은 필요 없습니다."
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "너는 환경 퀘스트 인증 AI야. 답변은 '예' 또는 '아니오'만 해."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            max_tokens=10,
        )
        answer = response.choices[0].message.content.strip()
        if answer.startswith("예"):
            return True, None    # 성공
        elif answer.startswith("아니오"):
            return False, None   # 미션 불일치
        else:
            # 애매한 답(예/아니오가 아님)은 시스템 에러로 간주
            return None, f"AI 응답이 불명확함: '{answer}'"
    except Exception as e:
        return None, str(e)
