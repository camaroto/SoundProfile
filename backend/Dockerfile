# Compila e executa a API. Uso: docker build -t soundprofile-api . && docker run -p 8080:8080 -e DATABASE_URL=... soundprofile-api
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/soundprofile-api-*.jar app.jar
RUN useradd --system --no-create-home api
USER api
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
