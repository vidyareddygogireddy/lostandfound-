# Multi-stage Dockerfile for Spring Boot Backend
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy maven wrapper & pom.xml
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Ensure execute permission on maven wrapper
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create directory for file uploads
RUN mkdir -p /app/uploads

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port (default 8080)
EXPOSE 8080

# Environment defaults
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]
