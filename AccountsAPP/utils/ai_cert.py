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
    prompt = (f"사진을 보고 '{quest_title}' 미션을 수행하는 장면이 맞는지 판단해줘. "
        "만약 미션에 해당하는 장면이라면 '예'라고만 답변해. "
        "아닐 경우 '아니오'라고 먼저 쓰고, 반드시 왜 그런지 구체적으로 이유를 설명해. "
        "특히 사진 자체는 맞는데 미션의 핵심 행동이 보이지 않는다면, 그 점을 명확히 써줘. "
        "예시: '아니오, 우유곽 사진이긴 하지만 미션은 우유곽을 분리수거하거나 재활용하는 장면이어야 합니다.'")
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": ("너는 환경 퀘스트 인증 AI야. 답변은 반드시 '예' 또는 '아니오'로 시작하고, "
                        "'아니오'일 경우엔 구체적인 이유를 한글로 설명해. "
                        "사진에 핵심 행동(예: 분리수거, 재활용, 인증, 이용 등)이 보이지 않으면 그 점을 꼭 설명해.")},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            max_tokens=100,
        )
        answer = response.choices[0].message.content.strip()
        if answer.startswith("예"):
            return True, None    # 성공
        elif answer.startswith("아니오"):
            # 이유 파싱 (예: "아니오, 사진에 장바구니가 보이지 않습니다.")
            parts = answer.split(",", 1)
            reason = parts[1].strip() if len(parts) > 1 else "AI가 미션과 관련 없다고 판단했습니다."
            return False, reason
        else:
            # 애매한 답(예/아니오가 아님)은 시스템 에러로 간주
            return None, f"AI 응답이 불명확함: '{answer}'"
    except Exception as e:
        return None, str(e)
