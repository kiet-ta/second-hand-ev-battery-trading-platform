# Use the official ASP.NET 8 runtime as a base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
# Use the SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Copy project files
COPY ["PresentationLayer/PresentationLayer.csproj", "PresentationLayer/"]
COPY ["ApplicationLayer/Application.csproj", "ApplicationLayer/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["BackEnd.Application.Tests/BackEnd.Application.Tests.csproj", "BackEnd.Application.Tests/"]
COPY ["BackEnd.sln", "."]
# Restore dependencies
RUN dotnet restore "BackEnd.sln"
# Copy source code
COPY . .
# Build
WORKDIR "/src/PresentationLayer"
RUN dotnet build "PresentationLayer.csproj" -c Release -o /app/build
# Publish
FROM build AS publish
RUN dotnet publish "PresentationLayer.csproj" -c Release -o /app/publish /p:UseAppHost=false
# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Install Entity Framework tools for migrations
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"
ENTRYPOINT ["dotnet", "PresentationLayer.dll"]
