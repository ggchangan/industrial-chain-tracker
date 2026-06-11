FROM node:22-alpine

WORKDIR /app

LABEL org.opencontainers.image.title="Industrial Chain Tracker"
LABEL org.opencontainers.image.source="https://github.com/ggchangan/industrial-chain-tracker"

COPY --chown=node:node . .

ENV NODE_ENV=production
ENV PORT=4173
ENV HOST=0.0.0.0

EXPOSE 4173

USER node

CMD ["node", "server/server.mjs"]
