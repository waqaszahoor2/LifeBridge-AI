FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/home/app/.local/bin:${PATH}"

RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /project

COPY apps/backend/requirements.txt /project/apps/backend/requirements.txt
RUN python -m pip install --upgrade pip && \
    python -m pip install --no-cache-dir -r /project/apps/backend/requirements.txt

COPY apps/backend /project/apps/backend
COPY datasets /project/datasets
COPY config /project/config
COPY ml /project/ml

RUN chmod +x /project/apps/backend/docker-entrypoint.sh && \
    chown -R app:app /project
USER app
WORKDIR /project/apps/backend

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["api"]
