"""AI writing assistant operations (summarize, expand, rewrite, autotag)."""

from openai import AsyncOpenAI

from app.core.config import settings

CHAT_MODEL = "openai/gpt-oss-120b:free"
# Reasoning model — needs extra tokens for internal thinking before responding
REASONING_BUFFER = 512

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            timeout=60,
        )
    return _client


async def summarize(text: str) -> str:
    response = await _get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": "Summarize the following note concisely."},
            {"role": "user", "content": text},
        ],
        max_tokens=300 + REASONING_BUFFER,
    )
    return response.choices[0].message.content.strip()


async def expand(text: str) -> str:
    response = await _get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": "Expand the following bullet points or notes into full paragraphs."},
            {"role": "user", "content": text},
        ],
        max_tokens=800 + REASONING_BUFFER,
    )
    return response.choices[0].message.content.strip()


async def rewrite(text: str, tone: str = "formal") -> str:
    response = await _get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": f"Rewrite the following text with a {tone} tone."},
            {"role": "user", "content": text},
        ],
        max_tokens=800 + REASONING_BUFFER,
    )
    return response.choices[0].message.content.strip()


async def autotag(text: str) -> list[str]:
    response = await _get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Generate 3-6 short, relevant tags for the following note. "
                    "Return only a comma-separated list of lowercase tags, nothing else."
                ),
            },
            {"role": "user", "content": text[:2000]},
        ],
        max_tokens=60 + REASONING_BUFFER,
    )
    raw = response.choices[0].message.content.strip()
    return [t.strip() for t in raw.split(",") if t.strip()]


async def extract_actions(text: str) -> list[str]:
    response = await _get_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract all action items and to-dos from the following note. "
                    "Return one action item per line, starting with '- '. "
                    "If there are none, return an empty response."
                ),
            },
            {"role": "user", "content": text},
        ],
        max_tokens=400 + REASONING_BUFFER,
    )
    raw = response.choices[0].message.content.strip()
    return [line.lstrip("- ").strip() for line in raw.splitlines() if line.strip()]
