FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/local/configure-local-ssh
FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-18

COPY --from=0 ./ ./

WORKDIR /opt
COPY ./package.json ./package-lock.json ./
RUN npm install

COPY api-enumerations ./api-enumerations
COPY locales ./locales
COPY dist ./package.json ./package-lock.json docker_start.sh routes.yaml ./

CMD ["./docker_start.sh"]

EXPOSE 3000
