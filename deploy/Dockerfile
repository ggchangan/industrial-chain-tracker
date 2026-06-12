FROM node:22-alpine

WORKDIR /app

LABEL org.opencontainers.image.title="Industrial Chain Tracker"
LABEL org.opencontainers.image.source="https://github.com/ggchangan/industrial-chain-tracker"

RUN apk add --no-cache su-exec

COPY --chown=node:node . .
RUN chmod +x /app/deploy/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4173
ENV HOST=0.0.0.0

EXPOSE 4173

ENTRYPOINT ["/app/deploy/docker-entrypoint.sh"]
CMD ["node", "server/server.mjs"]
