import io
import uuid
import logging
from fastapi import UploadFile
from PIL import Image
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE_MB = 5
MAX_DIMENSION = 1200


def _get_s3_client():
    kwargs = {
        "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
        "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
        "region_name": settings.AWS_REGION,
    }
    if settings.S3_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL
    return boto3.client("s3", **kwargs)


async def upload_image_to_s3(file: UploadFile, prefix: str = "products") -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Unsupported image type: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise ValueError(f"Image exceeds {MAX_IMAGE_SIZE_MB}MB limit")

    img = Image.open(io.BytesIO(content))
    img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    output = io.BytesIO()
    img.save(output, format="JPEG", quality=85, optimize=True)
    output.seek(0)

    filename = f"{prefix}/{uuid.uuid4()}.jpg"
    s3 = _get_s3_client()

    try:
        s3.upload_fileobj(
            output,
            settings.S3_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": "image/jpeg", "CacheControl": "max-age=31536000"},
        )
    except ClientError as e:
        logger.error(f"S3 upload failed: {e}")
        raise RuntimeError("Image upload failed")

    if settings.S3_ENDPOINT_URL:
        return f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{filename}"
    return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
